// ================= ENTITIES =================
const DV = [[1, 0], [0, 1], [-1, 0], [0, -1]];
const G = {
  t: 0, cars: [], peds: [], bullets: [], projs: [], fx: [], decals: [], fires: [], drops: [], player: null, scene: null,
  cam: { x: 0, y: 0, z: 1, shake: 0 }, heat: 0, lastSeen: -99, arrest: 0, gangAggro: { kings: 0, vipers: 0, saints: 0, syndicate: 0, reapers: 0, hounds: 0, vultures: 0 }, rep: { kings: 0, vipers: 0, saints: 0, syndicate: 0, reapers: 0, hounds: 0, vultures: 0 },
  msgs: [], big: null, mission: null, kills: 0, deaths: 0, paused: false, mode: 'menu', spawnT: 0, hud: {},
  interiors: {}, dlgOpen: false, drunk: 0, sitting: null, dancing: 0, radioName: null, radioT: 0, district: null, districtT: 0,
  settings: Object.assign({ drive: 'point', ctrlScale: 1, quality: 'high', minimap: 1, assist: 1, pvp: 1 }, store.get('gl_settings', {})),
};
const stars = () => Math.min(5, Math.floor(G.heat));

// ---------- collision helpers ----------
let SOLIDFN = null;
function sceneSolid(tx, ty) {
  const s = G.scene; if (!s) return solidT(tx, ty);
  if (tx < 0 || ty < 0 || tx >= s.w || ty >= s.h) return 1; return s.solid[ty * s.w + tx];
}
function pushOutRect(o, r, x0, y0, x1, y1, res) {
  const cx = clamp(o.x, x0, x1), cy = clamp(o.y, y0, y1); let dx = o.x - cx, dy = o.y - cy; const d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return;
  if (d2 < 1e-6) { // center inside: push out shortest axis
    const l = o.x - x0, rr = x1 - o.x, t = o.y - y0, b = y1 - o.y, m = Math.min(l, rr, t, b);
    if (m === l) { dx = -1; dy = 0; o.x = x0 - r; } else if (m === rr) { dx = 1; dy = 0; o.x = x1 + r; } else if (m === t) { dx = 0; dy = -1; o.y = y0 - r; } else { dx = 0; dy = 1; o.y = y1 + r; }
    res.push([dx, dy, r]); return;
  }
  const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = r - d; o.x += nx * pen; o.y += ny * pen; res.push([nx, ny, pen]);
}
function resolveCircle(o, r, skipProps) {
  const res = [];
  const tx0 = Math.floor((o.x - r) / T), tx1 = Math.floor((o.x + r) / T), ty0 = Math.floor((o.y - r) / T), ty1 = Math.floor((o.y + r) / T);
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if ((SOLIDFN || sceneSolid)(tx, ty)) pushOutRect(o, r, tx * T, ty * T, (tx + 1) * T, (ty + 1) * T, res);
  const s = G.scene;
  if (s) { for (const it of s.items) if (IT[it.t] && IT[it.t].s) pushOutRect(o, r, it.x * T, it.y * T, (it.x + it.w) * T, (it.y + it.h) * T, res); }
  else if (!skipProps) {
    for (const p of propsNear(o.x, o.y, r + 16)) {
      if (!p.solid || p.down) continue; const dx = o.x - p.x, dy = o.y - p.y, d2 = dx * dx + dy * dy, rr = r + p.r;
      if (d2 < rr * rr && d2 > 1e-4) { const d = Math.sqrt(d2), nx = dx / d, ny = dy / d; o.x = p.x + nx * rr; o.y = p.y + ny * rr; res.push([nx, ny, rr - d, p]); }
    }
  }
  return res;
}
function losClear(x0, y0, x1, y1) {
  const d = dist(x0, y0, x1, y1), n = Math.ceil(d / (T * .4));
  for (let i = 1; i < n; i++) { const t = i / n; if (sceneSolid(Math.floor(lerp(x0, x1, t) / T), Math.floor(lerp(y0, y1, t) / T))) return false; }
  return true;
}

// ---------- CAR ----------
let carUID = 1;
class Car {
  constructor(type, x, y, a, color) {
    const d = CAR_TYPES[type]; this.uid = carUID++; this.d = d; this.type = type; this.d = d; this.x = x; this.y = y; this.a = a; this.vx = 0; this.vy = 0; this.av = 0;
    this.color = color || pick(d.cols); this.hp = d.hp; this.L = d.L * 2; this.W = d.W * 2; this.mass = d.mass;
    this.driver = null; this.ai = null; this.throttle = 0; this.steer = 0; this.brake = 0; this.hand = 0; this.dead = 0; this.fireT = 0;
    this.siren = d.siren ? 0 : -1; this.horn = 0; this.radio = 1 + Math.floor(Math.random() * (STATIONS.length - 1)); this.persist = 0; this.lastHitBy = null; this.smokeT = 0;
    this.mods = null; this.nos = 0; this.nosT = 0; this.st = null; applyMods(this);
    this.circ = []; const n = this.L > 90 ? 4 : 3; for (let i = 0; i < n; i++) this.circ.push(lerp(-this.L / 2 + this.W / 2, this.L / 2 - this.W / 2, i / (n - 1)));
  }
  get fwd() { return this.vx * Math.cos(this.a) + this.vy * Math.sin(this.a); }
  get spd() { return Math.hypot(this.vx, this.vy); }
  circles() { const c = Math.cos(this.a), s = Math.sin(this.a); return this.circ.map(o => [this.x + c * o, this.y + s * o]); }
  damage(n, by) {
    if (this.dead) return; this.hp -= n; if (by) this.lastHitBy = by;
    if (this.hp <= 0 && !this.fireT) { this.fireT = 3.5 + Math.random() * 1.5; }
  }
}
function applyMods(c, m) {
  if (m !== undefined) c.mods = m; m = c.mods || {}; const d = c.d;
  const eng = m.eng || 0, tur = m.tur || 0, hnd = m.hnd || 0, brk = m.brk || 0, arm = m.arm || 0;
  const hpOld = c.st ? c.st.hp : d.hp;
  c.st = { max: d.max * (1 + .07 * eng + .06 * tur), acc: d.acc * (1 + .13 * eng + .2 * tur), grip: d.grip * (1 + .13 * hnd + .03 * (m.sp ? 1 : 0) + .03 * (m.sk || 0)), steer: d.steer * (1 + .07 * hnd), brk: 1200 * (1 + .3 * brk), hp: d.hp * (1 + .4 * arm) };
  if (c.hp > 0 && c.st.hp !== hpOld) c.hp = c.hp / hpOld * c.st.hp;
  if (m.nos && c.nos === 0 && !c.nosInit) { c.nos = 3; c.nosInit = 1; }
  if (m.p) c.color = m.p;
}
function updateCar0(c, dt) {
  const base = c.st, rainG = (G.weather && G.weather.rain > .3 && !c.remote) ? .85 : 1;
  if (c.nosT > 0) { c.nosT -= dt; if (Math.random() < dt * 40) { const bx = c.x - Math.cos(c.a) * (c.L / 2 + 4), by = c.y - Math.sin(c.a) * (c.L / 2 + 4); spawnFx('nos', bx, by, c.a); } }
  if (c.mods && c.mods.nos && c.nos < nosCap(c)) { c.nosCh = (c.nosCh || 0) + dt; if (c.nosCh > 40) { c.nosCh = 0; c.nos++; } }
  const nf = c.nosT > 0 ? 1 : 0;
  const d = { max: base.max * (1 + .32 * nf), acc: base.acc * (1 + 1.6 * nf), grip: base.grip * rainG, steer: base.steer, hp: base.hp, brk: base.brk };
  vehTick(c, d, dt, rainG);
  if (c.fireT > 0) { c.fireT -= dt; if (Math.random() < dt * 20) spawnFx('fire', c.x + rnd(-c.L / 3, c.L / 3), c.y + rnd(-8, 8)); if (c.fireT <= 0) explodeCar(c); }
  else if (c.hp < d.hp * .35 && !c.dead) { c.smokeT -= dt; if (c.smokeT <= 0) { c.smokeT = .12; spawnFx('smoke', c.x + Math.cos(c.a) * c.L * .4, c.y + Math.sin(c.a) * c.L * .4); } }
  if (c.dead) { c.throttle = 0; c.steer = 0; c.hand = 1; }
  else if (c.driver && !c.d.pedal && !base.ev && c.throttle > .3 && c.spd < 260 && Math.random() < dt * 9 && dist2(c.x, c.y, G.cam.x, G.cam.y) < 4e5) { const bx = c.x - Math.cos(c.a) * (c.L / 2 + 2) + Math.sin(c.a) * c.W * .25, by = c.y - Math.sin(c.a) * (c.L / 2 + 2) - Math.cos(c.a) * c.W * .25; const f = spawnFx('exh', bx, by); if (f) { f.vx = -Math.cos(c.a) * 30 + rnd(-8, 8); f.vy = -Math.sin(c.a) * 30 + rnd(-8, 8); } }
  // heading
  let fwd0 = c.fwd;
  const sf = clamp(Math.abs(fwd0) / 110, 0, 1) * Math.sign(fwd0) * (1 - .3 * clamp(Math.abs(fwd0) / d.max, 0, 1));
  c.a += (c.steer * d.steer * sf + c.av) * dt; c.av *= Math.exp(-5 * dt);
  const fx = Math.cos(c.a), fy = Math.sin(c.a);
  let fwd = c.vx * fx + c.vy * fy, lat = -c.vx * fy + c.vy * fx;
  const th = c.throttle;
  if (th > 0) { if (fwd < -15) fwd += 950 * th * dt; else fwd += th * d.acc * (1 - clamp(fwd / d.max, 0, 1.2)) * dt; }
  else if (th < 0) { if (fwd > 15) fwd -= (d.brk || 1200) * .85 * -th * dt; else if (fwd > -d.max * .38) fwd += th * d.acc * .65 * dt; }
  else { const f = Math.min(Math.abs(fwd), 70 * dt); fwd -= Math.sign(fwd) * f; }
  if (c.brake) { const f = Math.min(Math.abs(fwd), d.brk * dt); fwd -= Math.sign(fwd) * f; }
  fwd -= fwd * .12 * dt;
  const grip = c.hand ? 1.4 : d.grip;
  if (c.hand) { const f = Math.min(Math.abs(fwd), 280 * dt); fwd -= Math.sign(fwd) * f; }
  const latOld = lat; lat *= Math.exp(-grip * dt);
  c.vx = fx * fwd - fy * lat; c.vy = fy * fwd + fx * lat;
  c.x += c.vx * dt; c.y += c.vy * dt;
  // skid marks
  if ((Math.abs(latOld) > 140 || (c.hand && Math.abs(fwd) > 120)) && !G.scene) {
    c.skidT = (c.skidT || 0) - dt;
    if (c.skidT <= 0) { c.skidT = .03; const bx = c.x - fx * c.L * .35, by = c.y - fy * c.L * .35; addDecal('skid', bx - fy * c.W * .4, by + fx * c.W * .4, c.a); addDecal('skid', bx + fy * c.W * .4, by - fx * c.W * .4, c.a); if (c === pCar() && Math.random() < .2) Snd.play('skid', c.x, c.y); }
  }
  // world collisions
  for (let it = 0; it < 2; it++) {
    const cc = c.circles();
    for (let i = 0; i < cc.length; i++) {
      const o = { x: cc[i][0], y: cc[i][1] }; const res = resolveCircle(o, c.W / 2 - 1, true);
      const props = propsNear(o.x, o.y, c.W);
      for (const p of props) { if (p.down || !p.solid && !PROPDEF[p.t].knock) continue; if (dist2(o.x, o.y, p.x, p.y) < (c.W / 2 + p.r) ** 2) { if (PROPDEF[p.t].knock && c.spd > 110) { knockProp(p, c); } else if (p.solid) { const dx = o.x - p.x, dy = o.y - p.y, dd = Math.hypot(dx, dy) || 1, rr = c.W / 2 + p.r; o.x = p.x + dx / dd * rr; o.y = p.y + dy / dd * rr; res.push([dx / dd, dy / dd, rr - dd]); } } }
      if (!res.length) continue;
      const ox = o.x - cc[i][0], oy = o.y - cc[i][1]; c.x += ox; c.y += oy;
      for (const [nx, ny] of res) {
        const vn = c.vx * nx + c.vy * ny;
        if (vn < 0) {
          c.vx -= 1.35 * vn * nx; c.vy -= 1.35 * vn * ny;
          const off = c.circ[i]; c.av += clamp((Math.cos(c.a) * ny - Math.sin(c.a) * nx) * off * -vn * .0006, -4, 4);
          if (-vn > 140) { c.damage((-vn - 120) * .07); if (c === pCar() || dist2(c.x, c.y, G.cam.x, G.cam.y) < 9e5) Snd.play('crash', c.x, c.y, clamp(-vn / 500, .2, 1)); if (c === pCar()) G.cam.shake = Math.min(12, -vn / 40); spawnFx('spark', o.x - nx * c.W / 2, o.y - ny * c.W / 2); riderCrash(c, -vn); if (c.dead || !c.driver && c.d.rider) return; }
        }
      }
    }
  }
}
function knockProp(p, c) {
  p.down = 1; p.a = Math.atan2(c.vy, c.vx); c.vx *= .85; c.vy *= .85; Snd.play(p.t === 'lamp' ? 'clang' : p.t === 'trash' || p.t === 'barrel' ? 'clank' : 'thud', p.x, p.y);
  if (p.t === 'hydrant') { p.spray = 12; Snd.play('splash', p.x, p.y); }
  if (p.t === 'trash' || p.t === 'news') for (let i = 0; i < 6; i++) spawnFx('paper', p.x, p.y);
  if (c.driver === G.player) addCash(5, 0);
}
function carCarCollide(a, b) {
  if (dist2(a.x, a.y, b.x, b.y) > (a.L / 2 + b.L / 2 + 4) ** 2) return;
  const ca = a.circles(), cb = b.circles(); const ra = a.W / 2, rb = b.W / 2;
  for (let i = 0; i < ca.length; i++) for (let j = 0; j < cb.length; j++) {
    const dx = ca[i][0] - cb[j][0], dy = ca[i][1] - cb[j][1], d2 = dx * dx + dy * dy, rr = ra + rb;
    if (d2 >= rr * rr || d2 < 1e-4) continue;
    const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, pen = rr - d;
    const ma = a.remote ? 50 : a.mass, mb = b.remote ? 50 : b.mass, tm = ma + mb;
    if (!a.remote) { a.x += nx * pen * mb / tm; a.y += ny * pen * mb / tm; }
    if (!b.remote) { b.x -= nx * pen * ma / tm; b.y -= ny * pen * ma / tm; }
    const rv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
    if (rv < 0) {
      const jj = -(1.3) * rv / (1 / ma + 1 / mb);
      if (!a.remote) { a.vx += jj * nx / ma; a.vy += jj * ny / ma; a.av += clamp((Math.cos(a.a) * ny - Math.sin(a.a) * nx) * a.circ[i] * jj * .0004 / ma, -3, 3); }
      if (!b.remote) { b.vx -= jj * nx / mb; b.vy -= jj * ny / mb; b.av -= clamp((Math.cos(b.a) * ny - Math.sin(b.a) * nx) * b.circ[j] * jj * .0004 / mb, -3, 3); }
      if (-rv > 120) {
        const dmg = (-rv - 100) * .06; a.damage(dmg * mb / tm * 1.6, b.driver); b.damage(dmg * ma / tm * 1.6, a.driver); riderCrash(a, -rv * 1.3); riderCrash(b, -rv * 1.3); crashEject(a, -rv * 2 * mb / tm, b); crashEject(b, -rv * 2 * ma / tm, a); if (-rv > 130) { if (a === pCar()) reactCar(b, 'ram'); else if (b === pCar()) reactCar(a, 'ram'); }
        if (dist2(a.x, a.y, G.cam.x, G.cam.y) < 1e6) Snd.play('crash', a.x, a.y, clamp(-rv / 500, .2, 1));
        spawnFx('spark', (ca[i][0] + cb[j][0]) / 2, (ca[i][1] + cb[j][1]) / 2);
        if (a === pCar() || b === pCar()) { G.cam.shake = Math.min(10, -rv / 50); const other = a === pCar() ? b : a; if (other.type === 'cop' && !other.remote) crime(.6, 'Assaulting an officer'); if (other.ai && !other.remote && other.ai.mode === 'traffic' && Math.random() < .5) other.horn = 1; }
      }
    }
  }
}

// ---------- PED ----------
let pedUID = 1;
class Ped {
  constructor(x, y, o) {
    o = o || {}; this.uid = pedUID++; this.x = x; this.y = y; this.a = o.a || 0; this.mvx = 0; this.mvy = 0; this.kx = 0; this.ky = 0; this.r = 9;
    this.role = o.role || 'civ'; this.hp = o.hp || (this.role === 'cop' ? 90 : 60); this.dead = 0; this.down = 0; this.phase = Math.random() * 6;
    this.skin = o.skin || pick(SKIN); this.shirt = o.shirt || pick(SHIRT); this.pants = o.pants || pick(['#2c3e50', '#34495e', '#5d4037', '#1b2631', '#7f8c8d', '#283747']); this.hair = o.hair || pick(HAIR);
    this.name = o.name || randName(); this.state = o.state || 'walk'; this.target = null; this.timer = 0; this.weapon = o.weapon || 0; this.fireCD = 0; this.speed = rnd(55, 75);
    this.gang = o.gang || null; this.car = null; this.burn = 0; this.persist = o.persist || 0; this.talkT = 0; this.hostile = 0; this.mood = rnd(0, 1); this.lastHitBy = null; this.punchT = 0; this.say = null; this.sayT = 0;
    if (this.role === 'cop') { this.shirt = '#1f3a93'; this.pants = '#111d3a'; this.hair = '#0b1530'; this.weapon = 1; this.hat = 1; }
    if (this.role === 'swat') { this.shirt = '#222'; this.pants = '#111'; this.hair = '#111'; this.weapon = 2; this.hat = 1; this.hp = 160; this.role = 'cop'; this.swat = 1; }
    if (this.gang) { this.shirt = GANGS[this.gang].col; this.hat = 2; this.hatCol = GANGS[this.gang].col2; this.weapon = Math.random() < .55 ? (Math.random() < .3 ? 2 : 1) : 0; this.hp = 80; }
    this.vp = Math.random() < .5 ? rnd(95, 135) : rnd(180, 240); this.hs = Math.floor(Math.random() * 6); this.jk = Math.random() < .3 ? pick(['#263238', '#4e342e', '#1b5e20', '#37474f', '#880e4f', '#0d47a1', '#5d4037']) : null; this.shoe = pick(['#111', '#3e2723', '#eee', '#222']);
    if (this.role === 'perf') { this.shirt = pick(['#ff2bd6', '#e91e63', '#9c27b0', '#00bcd4', '#ffd400', '#f44336']); this.pants = this.shirt; this.hs = 4; this.jk = null; this.sparkle = 1; this.hp = 50; }
    if (this.role === 'cop') { this.jk = null; this.hood = 0; } if (this.gang) { const GG = GANGS[this.gang]; if (GG.jk) this.jk = GG.jk; if (GG.nohat) { this.hat = 0; this.hs = 0; this.shades = 1; } if (GG.hp) this.hp = GG.hp; }
    Object.assign(this, o.extra || {});
  }
  hurt(n, by, kind) {
    if (this.dead) return;
    if (this.isPlayer) return hurtPlayer(n, by, kind);
    this.hp -= n; this.lastHitBy = by;
    if (by === G.player) {
      if (this.role === 'cop') crime(n > 30 ? 1 : .5, 'Assaulting police');
      else crime(.12 * (kind === 'punch' ? .6 : 1));
      if (this.gang) G.gangAggro[this.gang] = 60;
    }
    addDecal('blood', this.x + rnd(-6, 6), this.y + rnd(-6, 6));
    if (this.hp <= 0) { this.die(by, kind); return; }
    if (kind !== 'fire') Snd.voice(n > 25 ? 'ow' : 'grunt', this.vp, this.x, this.y, .8); this.flash = .12;
    // reaction
    if (this.role === 'civ' || this.role === 'patron' || this.role === 'worker' || this.role === 'resident' || this.role === 'kid' || this.role === 'dancer' || this.role === 'teller' || this.role === 'nurse' || this.role === 'doctor' || this.role === 'patient' || this.role === 'prisoner' || this.role === 'clerk' && this.shop !== 'gun') {
      if (by && (Math.random() < this.mood * .5 && this.role === 'civ')) { this.state = 'fight'; this.target = by; this.timer = 10; }
      else { this.state = 'flee'; this.threat = by || { x: this.x + rnd(-1, 1), y: this.y + rnd(-1, 1) }; this.timer = 8; }
    } else if (by) { this.state = 'fight'; this.target = by; this.timer = 20; }
  }
  die(by, kind) {
    this.dead = 1; this.hp = 0; this.state = 'dead'; this.deadT = 0; this.mvx = this.mvy = 0;
    addDecal('bloodpool', this.x, this.y); Snd.voice(kind === 'car' || kind === 'boom' ? 'ow' : 'grunt', this.vp, this.x, this.y); this.fallT = 0; this.fallA = this.a + (Math.random() < .5 ? 1 : -1) * rnd(.6, 1.4);
    if (by === G.player) {
      if (this.gang) repAdd(this.gang, -6); if (Math.random() < .22 && !this.inside) G.drops.push({ x: this.x + rnd(-12, 12), y: this.y + rnd(-12, 12), t: 'item', id: lootPick('ped'), life: 90 });
      G.kills++; if (this.role === 'cop') crime(1.2, 'Killing a cop'); else crime(.55, 'Murder');
      addCash(this.role === 'cop' ? 50 : this.gang ? 80 : rint(5, 30), 1);
      if (G.mission && G.mission.onKill) G.mission.onKill(this);
    }
    if (Math.random() < .35 && !this.inside) G.drops.push({ x: this.x + rnd(-10, 10), y: this.y + rnd(-10, 10), t: 'cash', v: rint(10, 60), life: 30 });
    if (this.weapon > 0 && Math.random() < .5 && !this.inside) G.drops.push({ x: this.x, y: this.y + 8, t: WEAPONS[this.weapon].id, life: 30 });
    alarmNear(this.x, this.y, 260, by);
  }
}
function alarmNear0(x, y, r, threat) {
  const list = G.scene ? G.scene.peds : G.peds;
  for (const p of list) { if (p.dead || p.isPlayer || p.state === 'fight') continue; if (dist2(p.x, p.y, x, y) < r * r && (p.role === 'civ' || p.role === 'patron' || p.role === 'worker' || p.role === 'resident' || p.role === 'kid' || p.role === 'dancer' || p.role === 'teller' || p.role === 'nurse' || p.role === 'patient')) { p.state = 'flee'; p.threat = threat || { x, y }; p.timer = rnd(5, 9); if (Math.random() < .25) Snd.voice('scream', p.vp, p.x, p.y, .8); if (Math.random() < .2) pedSay(p, pick(['Aaah!', 'Help!', 'Run!', 'Call the cops!', 'Oh no!'])); } }
}
function pedSay(p, s) { p.say = s; p.sayT = 2.5; p.sayAge = 0; if (/!/.test(s)) Snd.voice('hey', p.vp, p.x, p.y, .9); else for (let i = 0; i < 3; i++) setTimeout(() => Snd.voice('babble', p.vp, p.x, p.y, .7), i * 90); }
const pCar = () => G.player && G.player.car;

// ---------- PED AI ----------
function ringFor(p) {
  // nearest block ring
  const bi = clamp(Math.round((p.x / T - 4 - 5.5) / RSP), 0, NB - 1), bj = clamp(Math.round((p.y / T - 4 - 5.5) / RSP), 0, NB - 1);
  const bx = bi * RSP + 4, by = bj * RSP + 4; return { bi, bj, x0: (bx + .5) * T, y0: (by + .5) * T, L: 11 * T };
}
function ringPoint(rg, s) { const P = rg.L * 4; s = ((s % P) + P) % P; const side = Math.floor(s / rg.L), t = s - side * rg.L; if (side === 0) return [rg.x0 + t, rg.y0]; if (side === 1) return [rg.x0 + rg.L, rg.y0 + t]; if (side === 2) return [rg.x0 + rg.L - t, rg.y0 + rg.L]; return [rg.x0, rg.y0 + rg.L - t]; }
function ringParam(rg, x, y) { // project onto ring
  const L = rg.L, lx = clamp(x - rg.x0, 0, L), ly = clamp(y - rg.y0, 0, L);
  const dTop = Math.abs(y - rg.y0), dBot = Math.abs(y - rg.y0 - L), dL = Math.abs(x - rg.x0), dR = Math.abs(x - rg.x0 - L), m = Math.min(dTop, dBot, dL, dR);
  if (m === dTop) return lx; if (m === dR) return L + ly; if (m === dBot) return 2 * L + (L - lx); return 3 * L + (L - ly);
}
function updatePedAI0(p, dt) {
  const pl = G.player; let mx = 0, my = 0, spd = p.speed;
  p.timer -= dt; if (p.sayT > 0) p.sayT -= dt;
  if (p.talking) { p.mvx = p.mvy = 0; if (pl) p.a = Math.atan2(pl.y - p.y, pl.x - p.x); return; }
  if (p.sitT > 0) { p.sitT -= dt; p.mvx = p.mvy = 0; return; }
  // cops: wanted behaviour
  if (p.role === 'cop' && pl && !pl.dead) {
    const st = stars(), d = dist(p.x, p.y, pl.x, pl.y), insideSame = !!G.scene === !!p.inside;
    if (insideSame && d < 480 && losClear(p.x, p.y, pl.x, pl.y)) { if (st > 0) markSeen(); p.sees = 1; } else p.sees = 0;
    const live = pursuitLive() || p.hostile;
    let ctx2 = null;
    if (p.hostile || (st > 0 && insideSame && (p.sees || p.state === 'chase'))) {
      ctx2 = live || !G.lastKnown || p.inside ? [pl.x, pl.y] : [G.lastKnown.x, G.lastKnown.y];
      if (!live && dist2(p.x, p.y, ctx2[0], ctx2[1]) < 60 * 60) { p.lookT = (p.lookT || 0) + dt; p.a += dt * 2.5; p.mvx = p.mvy = 0; if (p.lookT > 2.5) { p.lookT = 0; p.state = 'walk'; p.ring = null; p.cp = null; } return; }
    }
    if (ctx2) {
      p.state = 'chase'; p.lookT = 0;
      const a = p.sees ? Math.atan2(pl.y - p.y, pl.x - p.x) : pedSteer(p, ctx2[0], ctx2[1]); p.a = a;
      const canShoot = p.weapon > 0 && copMayShoot(p, st) && d < 400 && p.sees;
      if (d > (canShoot ? 160 : 14)) { mx = Math.cos(a); my = Math.sin(a); spd = 135; }
      if (canShoot) { p.fireCD -= dt; if (p.fireCD <= 0) { p.fireCD = rnd(.9, 1.7) * (p.swat ? .6 : 1) * (st >= 4 ? .75 : 1); npcShoot(p, a + rnd(-.08, .08)); } }
      if (d < 26 && !pl.car && (st <= 3 || G.surrender) && !p.hostile && (pl.spd || 0) < 90) { G.arrest += dt * (G.surrender ? 2.5 : 1.5); }
      if (pl.car && d < 46 && pl.car.spd < 40 && (st <= 3 || G.surrender)) { G.arrest += dt * (G.surrender ? 2 : .7); }
      if (d < 22 && !pl.car && st >= 4) { p.punchT -= dt; if (p.punchT <= 0) { p.punchT = .7; pl.hurt(8, p, 'punch'); Snd.play('punch', p.x, p.y); } }
      p.mvx = mx * spd; p.mvy = my * spd; return;
    } else if (p.state === 'chase') { p.state = 'walk'; p.ring = null; }
  }
  // gangs: attack if aggro & sees
  if (p.gang && pl && !pl.dead && gangMayAttack(p, pl) && p.state !== 'fight' && dist2(p.x, p.y, pl.x, pl.y) < 380 * 380 && !!G.scene === !!p.inside) { p.state = 'fight'; p.target = pl; p.timer = 20; }
  if (p.hostile && pl && !pl.dead && p.state !== 'fight' && !!G.scene === !!p.inside) { p.state = 'fight'; p.target = pl; p.timer = 30; }
  switch (p.state) {
    case 'flee': {
      const th = p.threat || pl; if (!th || p.timer <= 0) { p.state = p.inside ? 'idle' : 'walk'; p.ring = null; break; }
      let a = Math.atan2(p.y - th.y, p.x - th.x) + Math.sin(G.t * 2 + p.uid) * .5; mx = Math.cos(a); my = Math.sin(a); spd = 150; p.a = a; break;
    }
    case 'fight': {
      const tg = p.target; if (!tg || tg.dead || p.timer <= 0 || (tg.isPlayer && tg.car && p.weapon === 0)) { p.state = p.inside ? 'idle' : 'walk'; p.target = null; p.ring = null; break; }
      if (tg.isRemote && !G.settings.pvp) { p.state = 'walk'; break; }
      const tx = tg.car ? tg.car.x : tg.x, ty = tg.car ? tg.car.y : tg.y, d = dist(p.x, p.y, tx, ty), a = Math.atan2(ty - p.y, tx - p.x); p.a = a;
      if (p.weapon > 0) {
        if (d > 240 || !losClear(p.x, p.y, tx, ty)) { const pa = pedSteer(p, tx, ty); mx = Math.cos(pa); my = Math.sin(pa); spd = 120; }
        else { p.fireCD -= dt; if (p.fireCD <= 0) { p.fireCD = rnd(.45, 1.1) / (WEAPONS[p.weapon].rate > 5 ? 3 : 1); npcShoot(p, a + rnd(-.1, .1)); } if (d < 120) { mx = -Math.sin(a); my = Math.cos(a); spd = 60; } }
      } else {
        if (d > 20) { const pa = pedSteer(p, tx, ty); mx = Math.cos(pa); my = Math.sin(pa); spd = 140; }
        else { p.punchT -= dt; if (p.punchT <= 0) { p.punchT = .6; if (tg.isPlayer) tg.hurt(6, p, 'punch'); else tg.hurt(8, p, 'punch'); Snd.play('punch', p.x, p.y, .7); p.swing = .2; } }
      }
      break;
    }
    case 'cross': {
      const [tx, ty] = p.crossTo, d = dist(p.x, p.y, tx, ty); if (d < 10) { p.state = 'walk'; p.ring = null; break; }
      const a = Math.atan2(ty - p.y, tx - p.x); p.a = a;
      if (p.crossWait) { if (G.t > p.crossWait || crossingClear(p)) p.crossWait = 0; else break; }
      mx = Math.cos(a); my = Math.sin(a); spd *= 1.35; break;
    }
    case 'goto': {
      const [tx, ty] = p.goal, d = dist(p.x, p.y, tx, ty); if (d < 16) { if (p.pathQ && p.pathQ.length) p.goal = p.pathQ.shift(); else { p.state = p.after || 'idle'; p.pathQ = null; } break; }
      const a = Math.atan2(ty - p.y, tx - p.x); mx = Math.cos(a); my = Math.sin(a); p.a = a; spd = p.goSpd || p.speed; break;
    }
    case 'idle': {
      if (p.pole) { const t = G.t * 1.3 + p.uid, cx = p.pole[0] * T, cy = p.pole[1] * T; p.x = cx + Math.cos(t) * 11; p.y = cy + Math.sin(t) * 11 * .8; p.a = t + Math.PI * .5 + Math.sin(G.t * 3) * .4; p.phase += dt * 4; p.mvx = p.mvy = 0; return; }
      if (p.still || p.sit || p.lie || p.dance) { p.mvx = p.mvy = 0; if (p.dance) { p.a += Math.sin(G.t * 3 + p.uid) * dt * 3; p.phase += dt * 6; } return; }
      if (p.timer <= 0) { p.timer = rnd(2, 6); if (p.inside && Math.random() < .6) { const s = p.inside; p.wander = [clamp(p.x + rnd(-120, 120), T * 1.2, (s.w - 1.2) * T), clamp(p.y + rnd(-120, 120), T * 1.2, (s.h - 1.5) * T)]; } else p.wander = null; }
      if (p.wander) { const [tx, ty] = p.wander, d = dist(p.x, p.y, tx, ty); if (d > 8) { const a = Math.atan2(ty - p.y, tx - p.x); mx = Math.cos(a); my = Math.sin(a); p.a = a; spd = 40; } else p.wander = null; }
      break;
    }
    case 'walk': default: {
      if (p.inside) { p.state = 'idle'; break; }
      if (!p.ring) {
        if (p.home && dist2(p.x, p.y, p.home[0], p.home[1]) > 30 * 30) { const path = tilePath(p.x, p.y, (x, y) => x === Math.floor(p.home[0] / T) && y === Math.floor(p.home[1] / T), 1200); p.state = 'goto'; p.pathQ = path || []; p.pathQ.push(p.home); p.goal = p.pathQ.shift(); p.after = 'idle'; break; }
        if (p.home) { p.state = 'idle'; break; }
        if (tileAt(Math.floor(p.x / T), Math.floor(p.y / T)) !== TILE.WALK) { const path = tilePath(p.x, p.y, (x, y) => tileAt(x, y) === TILE.WALK, 700); if (path && path.length) { p.state = 'goto'; p.pathQ = path; p.goal = p.pathQ.shift(); p.after = 'walk'; break; } if (!path) { p.state = 'idle'; p.timer = 6; break; } }
        p.ring = ringFor(p); p.dir = Math.random() < .5 ? 1 : -1; p.latK = Math.random();
      }
      p.s = ringParam(p.ring, p.x, p.y);
      const P = p.ring.L * 4, sm = ((p.s % P) + P) % P, corner = sm % p.ring.L;
      if ((corner < 3 || corner > p.ring.L - 3) && p.timer <= 0) {
        p.timer = 3;
        if (Math.random() < .3) { // cross a street
          const k = Math.round(sm / p.ring.L) % 4; const [cx, cy] = ringPoint(p.ring, k * p.ring.L);
          const opts = [[0, -1], [1, 0], [0, 1], [-1, 0]].filter(([dx, dy]) => { const nx = cx + dx * 5 * T, ny = cy + dy * 5 * T; return tileAt(Math.floor(nx / T), Math.floor(ny / T)) === TILE.WALK && (Math.abs((nx - cx)) > 0 ? Math.sign(nx - (p.ring.x0 + p.ring.L / 2)) === dx : Math.sign(ny - (p.ring.y0 + p.ring.L / 2)) === dy); });
          if (opts.length) { const [dx, dy] = pick(opts); p.state = 'cross'; p.crossTo = [cx + dx * 5 * T, cy + dy * 5 * T]; p.crossWait = G.t + 14; break; }
        } else if (Math.random() < .15) p.dir *= -1;
      }
      const [tx0, ty0] = ringPoint(p.ring, p.s + p.dir * 34), [ax, ay] = ringPoint(p.ring, p.s + p.dir * 33), lat = p.rlat !== undefined ? p.rlat * (p.dir > 0 ? 1 : -1) : p.dir > 0 ? -3 - 6 * (p.latK || 0) : 5 + 9 * (p.latK || 0), tgx = (tx0 - ax) * p.dir, tgy = (ty0 - ay) * p.dir;
      const tx = tx0 - tgy * lat, ty = ty0 + tgx * lat, a = Math.atan2(ty - p.y, tx - p.x);
      mx = Math.cos(a); my = Math.sin(a); p.a = a;
      if (Math.random() < dt * .02 && !p.say) pedSay(p, pick(['Nice day.', 'Where are my keys...', 'Taxi!', 'Ugh, traffic.', 'Hmm hmm hmm~', "I'm late!"]));
    }
  }
  p.mvx = mx * spd; p.mvy = my * spd;
}
function updatePedMove0(p, dt) {
  if (p.air > 0) p.air = Math.max(0, p.air - dt * 1.6);
  if (p.dead) { p.fallT = (p.fallT || 0) + dt; p.kx *= Math.exp(-(p.air > 0 ? 1.5 : 6) * dt); p.ky *= Math.exp(-(p.air > 0 ? 1.5 : 6) * dt); p.x += p.kx * dt; p.y += p.ky * dt; p.deadT += dt; if (p.air <= 0 && p.wasAir) { p.wasAir = 0; Snd.play('thud', p.x, p.y, .6); } return; }
  if (p.burn > 0) { p.burn -= dt; p.hurt(dt * 25, p.burnBy, 'fire'); if (Math.random() < dt * 15) spawnFx('fire', p.x + rnd(-5, 5), p.y + rnd(-5, 5)); if (!p.isPlayer && p.state !== 'flee') { p.state = 'flee'; p.threat = { x: p.x + rnd(-50, 50), y: p.y + rnd(-50, 50) }; p.timer = 3; } }
  p.kx *= Math.exp(-7 * dt); p.ky *= Math.exp(-7 * dt);
  if (!p.isPlayer) { const want = Math.hypot(p.mvx, p.mvy);
    p.stT = (p.stT || 0) + dt; if (p.stx === undefined) { p.stx = p.x; p.sty = p.y; p.stT = 0; } if (p.stT > .35) { const moved = Math.hypot(p.x - (p.stx || p.x), p.y - (p.sty || p.y)); if (want > 30 && moved < want * p.stT * .3 && !(p.avT > 0)) { p.avT = .7; p.avS = Math.random() < .5 ? 1 : -1; } p.stT = 0; p.stx = p.x; p.sty = p.y; }
    if (p.avT > 0) { p.avT -= dt; const c = Math.cos(1.25 * p.avS), s = Math.sin(1.25 * p.avS), ox = p.mvx; p.mvx = ox * c - p.mvy * s; p.mvy = ox * s + p.mvy * c; } }
  const vx = p.mvx + p.kx, vy = p.mvy + p.ky;
  p.x += vx * dt; p.y += vy * dt;
  const sp = Math.hypot(p.mvx, p.mvy); p.phase += sp * dt * .11; p.moving = sp > 5; p.spd = sp;
  if (p.moving) { const si = Math.floor(p.phase / Math.PI); if (si !== p.stepI) { p.stepI = si; if (p.isPlayer || dist2(p.x, p.y, G.cam.x, G.cam.y) < 250 * 250) Snd.step(p); } }
  if (p.flash > 0) p.flash -= dt; if (p.recoil > 0) p.recoil -= dt;
  if (p.swing > 0) p.swing -= dt;
  const rideThru = p.ride && !p.isPlayer && !G.scene, res = resolveCircle(p, p.r, rideThru); if (rideThru) riderPushBig(p);

  if (!G.scene && !p.isPlayer && !p.swimmer && tileAt(Math.floor(p.x / T), Math.floor(p.y / T)) === TILE.WATER) p.hurt(999);
}
function npcShoot(p, a) {
  const w = WEAPONS[p.weapon]; if (!w || w.melee) return;
  const n = w.pellets || 1;
  for (let i = 0; i < n; i++) fireHitscan(p, p.x + Math.cos(a) * 12, p.y + Math.sin(a) * 12, a + rnd(-w.spread, w.spread) * 1.3 + rnd(-.12, .12), w, false);
  Snd.play(w.sound, p.x, p.y, .8); p.recoil = .08; G.lastShot = { x: p.x, y: p.y, t: G.t }; spawnFx('flash', p.x + Math.cos(a) * 16, p.y + Math.sin(a) * 16, a);
}

// ---------- CAR AI ----------
function nextInter(c, d) {
  const xT = c.x / T, yT = c.y / T;
  let i, j;
  if (d === 0) { i = Math.floor((xT - 2) / RSP) + 1; j = Math.round((yT - 2) / RSP); }
  else if (d === 2) { i = Math.ceil((xT - 2) / RSP) - 1; j = Math.round((yT - 2) / RSP); }
  else if (d === 1) { j = Math.floor((yT - 2) / RSP) + 1; i = Math.round((xT - 2) / RSP); }
  else { j = Math.ceil((yT - 2) / RSP) - 1; i = Math.round((xT - 2) / RSP); }
  return [i, j];
}
const okInter = (i, j) => i >= 0 && j >= 0 && i < NR && j < NR && !(i === 1 && j === 1) && !(W.nodeOff && W.nodeOff.has(j * NR + i)); // (1,1) is inside Fort Varro; nodeOff: open country with no crossroads
function laneOff(lane) { return (lane ? 1.5 : .5) * T; }
function planRoute(c) {
  const ai = c.ai; let d = ai.dir; let [i, j] = nextInter(c, d);
  if (!okInter(i, j)) { ai.dir = d = (d + 2) % 4; [i, j] = nextInter(c, d); if (!okInter(i, j)) { ai.wps = []; return; } }
  const C = [roadCX(i), roadCY(j)];
  const opts = [];
  const can = dd => { const [dx, dy] = DV[dd]; return okInter(i + dx, j + dy); };
  if (can(d)) opts.push(d, d); if (can((d + 1) % 4)) opts.push((d + 1) % 4); if (can((d + 3) % 4)) opts.push((d + 3) % 4);
  let nd = opts.length ? pick(opts) : (d + 2) % 4;
  if (ai.prefer !== undefined && can(ai.prefer)) nd = ai.prefer;
  const [dx, dy] = DV[d], r1 = [-dy, dx], o1 = laneOff(ai.lane);
  const [dx2, dy2] = DV[nd], r2 = [-dy2, dx2], lane2 = nd === (d + 1) % 4 ? 1 : nd === (d + 3) % 4 ? 0 : ai.lane, o2 = laneOff(lane2);
  const E = [C[0] + r1[0] * o1 - dx * 2.5 * T, C[1] + r1[1] * o1 - dy * 2.5 * T];
  const X = [C[0] + r2[0] * o2 + dx2 * 2.6 * T, C[1] + r2[1] * o2 + dy2 * 2.6 * T];
  ai.wps = [E];
  if (nd !== d) { if (nd === (d + 2) % 4) { ai.wps.push([C[0] + dx * T, C[1] + dy * T]); } else ai.wps.push([C[0] + r1[0] * o1 + r2[0] * o2, C[1] + r1[1] * o1 + r2[1] * o2]); }
  ai.wps.push(X); ai.nd = nd; ai.nlane = lane2;
}
function makeTrafficAI(c, dir, lane) { c.ai = { mode: 'traffic', dir, lane, wps: [], cruise: rnd(200, 300) * (c.type === 'sports' ? 1.25 : c.type === 'truck' ? .8 : 1), stuck: 0, rev: 0, blockT: 0 }; planRoute(c); }
function obstacleAhead(c, range) {
  const fx = Math.cos(c.a), fy = Math.sin(c.a); let best = null, bd = range;
  const check = (o, x, y, w) => { const rx = x - c.x, ry = y - c.y, f = rx * fx + ry * fy, l = Math.abs(-rx * fy + ry * fx); if (f > c.L * .4 && f < bd + c.L * .5 && l < w) { bd = f - c.L * .5; best = o; } };
  for (const o of G.cars) if (o !== c && !o.dead) check(o, o.x, o.y, (c.W + o.W) * .55);
  for (const r of Net.remoteCars()) check(r, r.x, r.y, (c.W + r.W) * .55);
  for (const p of G.peds) if (!p.dead && !p.car) check(p, p.x, p.y, c.W * .5 + 10);
  return best ? { o: best, d: bd } : null;
}
function driveToward(c, tx, ty, desired, dt) {
  const ta = Math.atan2(ty - c.y, tx - c.x), da = angDiff(c.a, ta), ai = c.ai, f = c.fwd;
  if (ai.rev > 0) { ai.rev -= dt; c.throttle = -1; c.steer = -Math.sign(da || 1); c.brake = 0; return; }
  c.steer = clamp(da * 2.6, -1, 1);
  const want = Math.abs(da) > .7 ? Math.min(desired, 140) : Math.abs(da) > .3 ? Math.min(desired, 240) : desired;
  if (f < want - 20) { c.throttle = 1; c.brake = 0; } else if (f > want + 40) { c.throttle = 0; c.brake = 1; } else { c.throttle = .25; c.brake = 0; }
  if (Math.abs(da) > 2.2 && Math.abs(f) < 60) { c.throttle = -1; c.steer = -Math.sign(da); }
  if (c.throttle > 0 && Math.abs(f) < 12) { ai.stuck += dt; if (ai.stuck > 1.6) { ai.stuck = 0; ai.rev = .9; } } else ai.stuck = Math.max(0, ai.stuck - dt);
}
function updateCarAI(c, dt) {
  const ai = c.ai; if (!ai || c.dead) return;
  if (c.horn > 0) { c.horn -= dt; if (Math.random() < dt * 2) Snd.play('horn', c.x, c.y, .5); }
  if (ai.mode === 'parked') { c.throttle = 0; c.brake = 1; c.steer = 0; return; }
  if (ai.mode === 'flee') { ai.mode = 'traffic'; ai.cruise = 480; }
  if (ai.mode === 'chase') return copCarAI(c, dt);
  if (!ai.wps.length) { ai.dir = ai.nd !== undefined ? ai.nd : ai.dir; ai.lane = ai.nlane !== undefined ? ai.nlane : ai.lane; planRoute(c); if (!ai.wps.length) { c.throttle = 0; c.brake = 1; return; } }
  const wp = ai.wps[0], dd = dist(c.x, c.y, wp[0], wp[1]);
  const ta = Math.atan2(wp[1] - c.y, wp[0] - c.x);
  if (dd < 34 || (dd < 140 && Math.cos(ta - c.a) < -.2)) { ai.wps.shift(); if (!ai.wps.length) { ai.dir = ai.nd; ai.lane = ai.nlane; planRoute(c); } return; }
  let desired = ai.cruise;
  const ob = obstacleAhead(c, 40 + Math.max(0, c.fwd) * .5);
  if (ob) { desired = ob.d < 30 ? 0 : Math.min(desired, Math.max(0, ob.d * 1.5 - 30)); ai.blockT += dt; if (ai.blockT > 3 && (ob.o === pCar() || ob.o === G.player) && Math.random() < dt) c.horn = .4; if (ai.blockT > 7 && ob.o instanceof Car && ob.o.ai && ob.o.ai.mode === 'parked') { ai.lane = 1 - ai.lane; ai.blockT = 0; planRoute(c); } }
  else ai.blockT = 0;
  if (desired < 5) { c.throttle = 0; c.brake = 1; c.steer = clamp(angDiff(c.a, ta) * 2, -1, 1); return; }
  driveToward(c, wp[0], wp[1], desired, dt);
}
function copCarAI(c, dt) {
  const ai = c.ai, pl = G.player; if (!pl || pl.dead || stars() === 0) { ai.mode = 'traffic'; c.siren = 0; ai.dir = Math.round(((c.a % TAU) + TAU) % TAU / (Math.PI / 2)) % 4; ai.lane = 0; planRoute(c); return; }
  c.siren = 1;
  const tx = pl.car ? pl.car.x : pl.x, ty = pl.car ? pl.car.y : pl.y, d = dist(c.x, c.y, tx, ty);
  // on foot target nearby: stop and get out
  if (!pl.car && d < 230 && c.spd < 160 && !G.scene) { c.throttle = 0; c.brake = 1; ai.exitT = (ai.exitT || 0) + dt; if (ai.exitT > .5) { if (G.peds.filter(q => q.role === 'cop' && !q.dead && q.state === 'chase').length < 6) exitCops(c); else { ai.mode = 'parked'; c.driver = null; } } return; }
  let gx = tx, gy = ty;
  if (d > 260 && !losClear(c.x, c.y, tx, ty)) {
    // road graph navigation
    const ci = clamp(Math.round((c.x / T - 2) / RSP), 0, NR - 1), cj = clamp(Math.round((c.y / T - 2) / RSP), 0, NR - 1);
    const ti = clamp(Math.round((tx / T - 2) / RSP), 0, NR - 1), tj = clamp(Math.round((ty / T - 2) / RSP), 0, NR - 1);
    let ni = ci, nj = cj;
    const atNode = dist(c.x, c.y, roadCX(ci), roadCY(cj)) < 110;
    if (atNode) { if (Math.abs(ti - ci) >= Math.abs(tj - cj) && ti !== ci) ni += Math.sign(ti - ci); else if (tj !== cj) nj += Math.sign(tj - cj); }
    // stay on current road: only head to node if aligned on its road
    const onV = Math.abs(c.x - roadCX(ci)) < 2 * T, onH = Math.abs(c.y - roadCY(cj)) < 2 * T;
    if (!atNode && !(onV || onH)) { ni = ci; nj = cj; }
    gx = roadCX(ni); gy = roadCY(nj);
  }
  const ob = obstacleAhead(c, 70);
  let desired = ob && ob.o !== pCar() && ob.o !== pl ? 120 : 700;
  if (!pl.car && d < 520) desired = Math.min(desired, Math.max(60, (d - 120) * 1.2));
  driveToward(c, gx, gy, desired, dt);
  if (d < 140) c.throttle = Math.min(c.throttle, .8);
}
function exitCops(c) {
  const room = footCap() - footCops(); let n = Math.min(c.type === 'swat' ? 3 : stars() >= 3 ? 2 : 1, room); if (n <= 0) { c.throttle = 0; c.brake = 1; return; }
  c.ai.mode = 'parked'; c.siren = 1;
  c.abandoned = 0;
  for (let i = 0; i < n; i++) { const s = i % 2 ? 1 : -1, a = c.a + Math.PI / 2 * s; const p = new Ped(c.x + Math.cos(a) * (c.W / 2 + 12) + Math.cos(c.a) * (i > 1 ? -20 : 10), c.y + Math.sin(a) * (c.W / 2 + 12) + Math.sin(c.a) * (i > 1 ? -20 : 10), { role: c.type === 'swat' ? 'swat' : 'cop' }); p.state = 'chase'; p.chaseSpawn = 1; G.peds.push(p); }
  c.driver = null;
}
