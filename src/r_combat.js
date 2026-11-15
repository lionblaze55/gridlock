// ================= COMBAT FEEL: panicking & fighting drivers, tyres, aim assist, charged throws =================
const flatsN = c => c.flat ? (c.flat & 1) + (c.flat >> 1 & 1) + (c.flat >> 2 & 1) + (c.flat >> 3 & 1) : 0;
const hasTyres = c => !c.d.boat && !c.d.tank;
function wheelLocal(c, bit) { // bit 1 front-left, 2 front-right, 4 rear-left, 8 rear-right (two-wheelers use 1 and 4)
  const front = bit & 3, k = c.d.two ? .38 : .3, lx = (front ? 1 : -1) * k * c.L;
  return [lx, c.d.two ? 0 : ((bit & 10) ? 1 : -1) * (c.W / 2 - 1)];
}
function wheelWorld(c, bit) { const [lx, ly] = wheelLocal(c, bit), co = Math.cos(c.a), si = Math.sin(c.a); return [c.x + co * lx - si * ly, c.y + si * lx + co * ly]; }

// ---- a bullet hits a vehicle: maybe a tyre, then the driver reacts
function carShot(c, hx, hy, shooter, isPlayerShot, w) {
  if (!c.dead && hasTyres(c)) {
    const co = Math.cos(c.a), si = Math.sin(c.a), rx = hx - c.x, ry = hy - c.y, lx = rx * co + ry * si, ly = -rx * si + ry * co;
    const k = c.d.two ? .38 : .3, tol = c.L * .13 + 7, front = Math.abs(lx - k * c.L) < tol, rear = Math.abs(lx + k * c.L) < tol;
    if ((front || rear) && (c.d.two || Math.abs(ly) > c.W * .2) && Math.random() < (w && w.pellets ? .45 : .8)) {
      const bit = c.d.two ? (front ? 1 : 4) : (front ? 1 : 4) * (ly > 0 ? 2 : 1);
      if (!(c.flat & bit)) { c.flat = (c.flat || 0) | bit; Snd.play('pop', hx, hy, 1); Snd.play('skid', hx, hy, .5); for (let i = 0; i < 6; i++) spawnFx('dust', hx + rnd(-6, 6), hy + rnd(-6, 6)); if (c === pCar()) toast('Tyre blown!'); else if (isPlayerShot && c.driver) msg('Tyre shot out!', '#f39c12'); }
    }
  }
  if (isPlayerShot && shooter) reactCar(c, 'shot', shooter);
}
// ---- how a driver responds to being threatened
function reactCar(c, why, by) {
  if (!c || c.dead || !c.ai || !c.driver || c.driver === G.player || c.missionCar || c.remote) return;
  const ai = c.ai, dr = c.driver, th = by || G.player; if (ai.mode !== 'traffic' && ai.mode !== 'parked') return;
  if (dr.role === 'cop') { if (why !== 'fear') crime(.6, 'Attacking a police car'); return; }
  if (dr.tough === undefined) dr.tough = dr.gang ? 1 : Math.random() < (why === 'ram' ? .3 : .16) ? 1 : 0;
  const near = dist2(c.x, c.y, th.x, th.y) < 520 * 520;
  if (dr.tough && why !== 'fear' && near && c.spd < 280) return bailOut(c, 'fight', th);
  if (ai.mode === 'parked') { if (why !== 'fear') bailOut(c, 'flee', th); return; }
  const fresh = !ai.flee; ai.flee = { x: th.x, y: th.y, t: G.t + 16, by: th };
  if (fresh) { c.horn = 1.2; if (ai.E) { ai.wps = []; ai.nd = ai.dir; ai.nlane = ai.lane; } const fx = Math.cos(c.a), fy = Math.sin(c.a), dx = th.x - c.x, dy = th.y - c.y, d = Math.hypot(dx, dy) || 1; if ((dx * fx + dy * fy) / d > .55 && d < 300) { ai.revT = 1.1; ai.revS = Math.random() < .5 ? -1 : 1; } }
}
function bailOut(c, mode, th) {
  const dr = c.driver; if (!dr || dr === G.player) return; const side = c.a - Math.PI / 2;
  const q = new Ped(c.x + Math.cos(side) * (c.W / 2 + 14), c.y + Math.sin(side) * (c.W / 2 + 14), dr.gang ? { gang: dr.gang } : { role: 'civ', skin: dr.skin, shirt: dr.shirt, name: dr.name });
  q.kx = Math.cos(side) * 120; q.ky = Math.sin(side) * 120; c.driver = null; c.ai = { mode: 'parked' }; c.throttle = 0; c.brake = 1; c.abandoned = G.t; Snd.play('door', c.x, c.y);
  if (mode === 'fight') { q.state = 'fight'; q.target = th; q.timer = 14; if (!q.gang && Math.random() < .5) q.weapon = WI.pistol; if (q.gang) G.gangAggro[q.gang] = Math.max(G.gangAggro[q.gang] || 0, 40); pedSay(q, pick(q.gang ? ['You picked the wrong car!', 'Get him!', 'Big mistake!'] : ['You want some?!', 'Get out here!', 'That\'s it, buddy!', 'You scratched my car!'])); }
  else { q.state = 'flee'; q.threat = th; q.timer = 9; pedSay(q, pick(['Take it! Take it!', 'Don\'t shoot!', 'Help! Help!', 'I\'m out of here!'])); }
  G.peds.push(q);
}
function updateCarAI(c, dt) {
  const ai = c.ai;
  if (ai && ai.flee && ai.mode === 'traffic' && c.driver) {
    const f = ai.flee, th = f.by && !f.by.dead ? f.by : null; if (th) { f.x = th.car ? th.car.x : th.x; f.y = th.car ? th.car.y : th.y; }
    if (G.t > f.t || dist2(c.x, c.y, f.x, f.y) > 1700 * 1700) { ai.flee = null; ai.cruise = rnd(200, 300); }
    else {
      ai.cruise = c.st.max * (.86 - .12 * flatsN(c));
      if (ai.revT > 0) { ai.revT -= dt; c.throttle = -1; c.brake = 0; c.steer = ai.revS; c.hand = 0; if (ai.revT <= 0 && ai.E) { ai.wps = []; ai.nd = ai.dir; ai.nlane = ai.lane; } return; }
      if ((ai.blockT > 1.6 && c.spd < 40) || c.hp < c.st.hp * .3 || flatsN(c) >= 2 && c.spd < 70) return bailOut(c, 'flee', th || G.player);
      if (Math.random() < dt * .8) c.horn = .3;
    }
  }
  if (ai && ai.mode === 'race') return raceAI(c, dt);
  if (ai && ai.mode === 'invest') return investAI(c, dt);
  if (ai && ai.mode === 'traffic' && railBlock(c)) { c.throttle = 0; c.brake = 1; c.steer = 0; c.horn = 0; return; }
  updateCarAI0(c, dt);
}
// ---- gunfire nearby frightens drivers too
function alarmNear(x, y, r, threat) {
  if (G.sil && threat === G.player) threat = { x, y }; // silenced: people run from the body, not from you
  alarmNear0(x, y, r, threat); if (G.scene || r < 150) return;
  for (const c of G.cars) if (c.ai && c.ai.mode === 'traffic' && c.driver && dist2(c.x, c.y, x, y) < r * r * 1.4 && losClear(c.x, c.y, x, y)) reactCar(c, 'fear', threat || G.player);
}
// ---- flat tyres: slower, less grip, pulls to the flat side, sparks off the rim
function tyreTick(c, d, dt) {
  if (c.launchT > 0) { c.launchT -= dt; d.acc *= 1.9; d.max *= 1.06; if (Math.random() < dt * 20) { const [wx, wy] = wheelWorld(c, 4); spawnFx('exh', wx, wy); } }
  const n = flatsN(c); if (!n || c.dead) return; const two = c.d.two;
  d.max *= 1 - (two ? .3 : .17) * n; d.acc *= 1 - .1 * n; d.grip *= 1 - (two ? .25 : .13) * n;
  const pull = (c.flat & 2 ? 1 : 0) + (c.flat & 8 ? .6 : 0) - (c.flat & 1 ? 1 : 0) - (c.flat & 4 ? .6 : 0), sp = clamp((c.fwd || 0) / 320, -1, 1);
  if (pull && !G.scene) c.a += pull * .3 * dt * sp;
  if (c.spd > 120 && Math.random() < dt * 9 && dist2(c.x, c.y, G.cam.x, G.cam.y) < 9e5) { const bits = [1, 2, 4, 8].filter(b => c.flat & b); const [wx, wy] = wheelWorld(c, pick(bits)); spawnFx('spark', wx, wy); if (c === pCar() && Math.random() < .2) Snd.play('skid', wx, wy, .25); }
}
function burnoutFx(c, dt) {
  const k = clamp(c.burnT / 1.2, .25, 1), co = Math.cos(c.a), si = Math.sin(c.a), bits = c.d.two ? [4] : [4, 8];
  c.fxT = (c.fxT || 0) - dt;
  if (c.fxT <= 0) { c.fxT = .045 / k; for (const b of bits) { const [lx, ly] = wheelLocal(c, b), wx = c.x + co * lx - si * ly, wy = c.y + si * lx + co * ly, f = spawnFx('smoke', wx - co * 8 + rnd(-4, 4), wy - si * 8 + rnd(-4, 4)); if (f) { f.vx = -co * rnd(40, 90) + rnd(-20, 20); f.vy = -si * rnd(40, 90) + rnd(-20, 20); f.s *= .7 + .6 * k; } } }
  c.sqT = (c.sqT || 0) - dt; if (c.sqT <= 0) { c.sqT = .22; Snd.play('skid', c.x, c.y, .35 + .3 * k); }
  if (c === pCar()) G.cam.shake = Math.max(G.cam.shake, 1.2 * k);
}
function drawFlats(c) {
  if (!c.flat || c.dead) return;
  for (const bit of [1, 2, 4, 8]) { if (!(c.flat & bit)) continue; const [lx, ly] = wheelLocal(c, bit), wl = c.d.two ? 11 : 12, wt = c.d.two ? 5 : 6;
    ctx.fillStyle = '#2a2a2a'; ctx.fillRect(lx - wl / 2, ly - wt / 2, wl, wt); ctx.fillStyle = '#9aa0a6'; ctx.fillRect(lx - wl / 2 + 1.5, ly - 1.4, wl - 3, 2.8);
    ctx.fillStyle = '#111'; for (let k = 0; k < 3; k++) ctx.fillRect(lx - wl / 2 - 2 - k * 2.2, ly + (k - 1) * 2.2, 3, 1.4); }
}

// ---- aim assist
function autoAimT0(a, range, cone) {
  const p = G.player, ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y; let best = null, bs = 1e9;
  const peds = G.scene ? G.scene.peds : G.peds, cand = peds.filter(q => !q.dead && !q.talking && q !== p).concat(G.settings.pvp ? Net.remoteTargets().filter(r => !r.inCar) : []);
  const consider = (q, x, y, pri) => { const d = dist(ox, oy, x, y); if (d > range || d < 4) return; const da = Math.abs(angDiff(a, Math.atan2(y - oy, x - ox))); if (da > cone) return; const sc = (da / cone + d / range * .45) * pri; if (sc < bs && losClear(ox, oy, x, y)) { bs = sc; best = q; } };
  for (const q of cand) consider(q, q.x, q.y, q.isRemoteTarget || q.hostile || q.state === 'fight' || (q.role === 'cop' && q.state === 'chase') ? .3 : q.role === 'cop' ? .8 : 1);
  if (!G.scene) for (const c of G.cars) { if (c.dead || c === p.car || !c.driver || c.driver === p) continue; const hostile = (c.ai && c.ai.mode === 'chase') || c.siren > 0 && stars() > 0 || (c.driver.gang && G.gangAggro[c.driver.gang] > 0); if (hostile) consider(c, c.x, c.y, .7); }
  return best;
}
function autoAim1(a, range) { const p = G.player, t = autoAimT(a, range, p.car ? .7 : .62); if (!t) return a; G.aimTarget = t; G.aimLockT = G.t; const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y; return Math.atan2(t.y - oy, t.x - ox); }
function aimMagnet0(a, range) { const p = G.player, t = autoAimT(a, range, .2); if (!t) return a; G.aimTarget = t; G.aimLockT = G.t; return Math.atan2(t.y - p.y, t.x - p.x); }
const isThrow = i => WEAPONS[i] && WEAPONS[i].proj === 'molotov';
function throwRange(ch) { if (ch < .15 && G.aimTarget && G.aimLockT > G.t - .6 && !G.aimTarget.dead) { const p = G.player; return clamp(dist(p.x, p.y, G.aimTarget.x, G.aimTarget.y), 90, 620); } return lerp(90, 620, ch); }
function combatTick(dt) {
  const p = G.player; if (!p || G.mode !== 'play') return;
  if (!isThrow(p.weapon) || p.car || p.dead) G.throwCharge = 0;
  const w = WEAPONS[p.weapon]; G.aimTgt = null;
  if (!p.dead && p.weapon > 0 && !w.melee && G.settings.assist && !G.dlgOpen && (!p.car || !p.car.d.pedal)) G.aimTgt = pickTarget(Input.aiming ? Input.aimA : (p.car ? p.car.a : p.a), p.car ? 500 : isThrow(p.weapon) ? 620 : (pw(p.weapon).range || 400), Input.aiming ? 'drag' : p.car ? 'car' : 'face'); else LK.t = null; if (!LK.hard && G.aimTgt !== undefined && !p.dead && p.weapon > 0 && !w.melee && G.settings.assist) { const a0 = Input.aiming ? Input.aimA : (p.car ? p.car.a : p.a), lf = lineOfFire(G.aimTgt, a0, p.car ? 500 : (pw(p.weapon).range || 400)); if (lf && lf !== G.aimTgt) G.aimTgt = lf; }
}
function drawCombatHUD(sc) {
  const p = G.player, cz = G.cam.z;
  const t = G.aimTgt; if (t && !t.dead) { const [sx, sy] = toScreen(t.x, t.y), r = (t instanceof Car ? t.L * .45 : 15) * cz + 4, k = 1 + Math.sin(G.t * 10) * .08; ctx.save(); ctx.translate(sx, sy); ctx.scale(k, k); ctx.strokeStyle = t.hostile || t.state === 'fight' || t instanceof Car ? '#ff4d4d' : '#ffd166'; ctx.lineWidth = 2.5; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(r, -r + 6); ctx.lineTo(r, -r); ctx.lineTo(r - 6, -r); ctx.stroke(); } ctx.restore(); }
  if (G.throwCharge > 0 && !p.car) {
    const ch = G.throwCharge, r = throwRange(ch), a = G.throwA || p.a, x0 = p.x + Math.cos(a) * 12, y0 = p.y + Math.sin(a) * 12, x1 = x0 + Math.cos(a) * r, y1 = y0 + Math.sin(a) * r;
    ctx.fillStyle = 'rgba(255,160,60,.9)';
    for (let i = 1; i < 22; i++) { const u = i / 22, [sx, sy] = toScreen(lerp(x0, x1, u), lerp(y0, y1, u)), h = 4 * u * (1 - u) * r * .32 * cz; ctx.beginPath(); ctx.arc(sx, sy - h, 2.6, 0, TAU); ctx.fill(); }
    const [ex, ey] = toScreen(x1, y1), rr = 34 * cz * (1 + Math.sin(G.t * 9) * .06); ctx.strokeStyle = '#ff9f43'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(ex, ey, rr, rr * .8, 0, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(255,120,30,.18)'; ctx.fill();
    const [px, py] = toScreen(p.x, p.y), bw = 44 * sc; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(px - bw / 2 - 2, py - 34 * sc, bw + 4, 8 * sc); ctx.fillStyle = ch >= 1 ? '#ff6b6b' : '#ff9f43'; ctx.fillRect(px - bw / 2, py - 34 * sc + 2, bw * ch, 8 * sc - 4);
  }
}
