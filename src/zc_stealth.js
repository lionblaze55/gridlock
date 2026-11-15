// ================= SUPPRESSORS: a silenced shot only gives you away to someone looking right at you =================
const CIVR = new Set(['civ', 'patron', 'worker', 'resident', 'kid', 'dancer', 'teller', 'nurse', 'doctor', 'patient', 'prisoner', 'clerk', 'vendor', 'rancher', 'perf', 'dj', 'boss']);
// eye contact: close enough, facing you, nothing in the way (or practically touching)
function seesPlayer(q, range) { const p = G.player, d2 = dist2(q.x, q.y, p.x, p.y), R = range || 380; if (d2 > R * R) return false; if (d2 < 56 * 56) return true; if (Math.abs(angDiff(q.a, Math.atan2(p.y - q.y, p.x - q.x))) > 1.15) return false; return losClear(q.x, q.y, p.x, p.y); }
function silentCtx() { const p = G.player, peds = G.scene ? G.scene.peds : G.peds, seers = new Set(); let cop = null;
  for (const q of peds) if (!q.dead && !q.lie && seesPlayer(q)) { seers.add(q); if (q.role === 'cop') cop = q; }
  if (!G.scene) for (const c of G.cars) if ((c.type === 'cop' || c.type === 'swat') && c.driver && c.driver !== p && !c.dead && dist2(c.x, c.y, p.x, p.y) < 320 * 320 && Math.abs(angDiff(c.a, Math.atan2(p.y - c.y, p.x - c.x))) < 1.2 && losClear(c.x, c.y, p.x, p.y)) cop = cop || c;
  return { seers, cop, vic: null }; }
// called when the player fires a suppressed weapon, before the bullets land
function silentFire() { const p = G.player, S = G.sil = silentCtx();
  for (const q of S.seers) { if (CIVR.has(q.role) && q.state !== 'fight' && !q.gang) { q.state = 'flee'; q.threat = p; q.timer = rnd(6, 10); q.still = 0; if (Math.random() < .35) pedSay(q, pick(['He\'s got a gun!', 'Oh my god!', 'Gun! GUN!', 'Don\'t shoot!'])); } }
  if (S.cop) crime(.35, 'gunfire'); }
// crimes committed with a silenced shot: heat only if a cop was watching; a call only from someone who saw you, or an anonymous "body found"
function silentCrime(sev, label) { const S = G.sil, p = G.player; if (sev < .45) return;
  const civ = [...S.seers].filter(q => !q.dead && !q.gang && q.role !== 'cop' && !q.hostile && q.state !== 'fight');
  const spot = G.scene ? { x: G.outPos.x, y: G.outPos.y, b: G.scene.b } : null, near = (x, y) => G.reports.find(r => dist2(r.x, r.y, x, y) < 700 * 700);
  if (civ.length && Math.random() < .6) { const who = pick(civ), st = label === 'Murder' || sev >= 1 ? 1 : 1, at = spot || { x: p.x, y: p.y }; const ex = near(at.x, at.y); if (ex) { ex.anon = 0; ex.st = Math.max(ex.st, st); ex.who = ex.who || who; return; }
    G.reports.push({ t: G.t + rnd(8, 14), t0: G.t, st, label: label || 'Crime', how: 'witness', who, x: at.x, y: at.y, b: at.b }); pedSay(who, pick(['I saw that! I\'m calling it in!', 'I\'m calling the cops!', 'Police! Help!'])); who.state = 'flee'; who.threat = p; who.timer = 12; who.caller = 1; return; }
  const v = S.vic; if (!v || !(label === 'Murder' || label === 'Killing a cop')) return;
  const peds = G.scene ? G.scene.peds : G.peds, look = peds.filter(q => q !== v && !q.dead && !q.gang && q.role !== 'cop' && CIVR.has(q.role) && dist2(q.x, q.y, v.x, v.y) < 320 * 320 && losClear(q.x, q.y, v.x, v.y));
  if (!look.length || Math.random() > .55) return; const at = spot || { x: v.x, y: v.y }; if (near(at.x, at.y)) return; const who = pick(look);
  G.reports.push({ t: G.t + rnd(9, 15), t0: G.t, st: 0, anon: 1, label: 'Body found', how: 'witness', who, x: at.x, y: at.y, b: at.b }); pedSay(who, pick(['Somebody call 911!', 'He just dropped!', 'Oh god, is he dead?!', 'Call an ambulance!'])); who.caller = 1; }
// victims and bystanders: they react to the blood, not to you
const hurtPed0 = Ped.prototype.hurt;
Ped.prototype.hurt = function (n, by, kind) {
  const S = G.sil, p = G.player; if (!S || by !== p || this.isPlayer || this.dead) return hurtPed0.call(this, n, by, kind);
  const knows = S.seers.has(this) || seesPlayer(this, 300), ga = this.gang ? G.gangAggro[this.gang] : 0, gangSaw = this.gang && [...S.seers].some(q => q.gang === this.gang && !q.dead); S.vic = this;
  hurtPed0.call(this, n, by, kind);
  const peds = G.scene ? G.scene.peds : G.peds;
  if (!knows) { if (this.gang && !gangSaw) G.gangAggro[this.gang] = ga;
    if (!this.dead) { if (CIVR.has(this.role) && !this.gang) { this.state = 'flee'; this.threat = { x: this.x + rnd(-90, 90), y: this.y + rnd(-90, 90) }; this.timer = 8; } else { if (this.state === 'fight' && this.target === p) { this.state = 'idle'; this.target = null; this.timer = rnd(1, 2); } if (this.state === 'flee' && this.threat === p) this.threat = { x: this.x + rnd(-90, 90), y: this.y + rnd(-90, 90) }; if (!(this.susT > G.t)) this.a = Math.atan2(p.y - this.y, p.x - this.x) + rnd(-2.7, 2.7); this.susT = G.t + 14; if (Math.random() < .6) pedSay(this, pick(['Who\'s shooting?!', 'I\'m hit!', 'Where did that come from?!', 'Sniper!'])); } } }
  for (const q of S.seers) if (!q.dead && q.state === 'flee' && CIVR.has(q.role)) q.threat = p; // the ones who saw you run from you
  // anyone who can see the victim freaks out; cops and gangsters nearby go on alert and start looking
  if (!this.dead) alarmNear(this.x, this.y, 200, { x: this.x, y: this.y });
  for (const q of S.seers) if (!q.dead && q.state === 'flee' && CIVR.has(q.role)) q.threat = p;
  for (const q of peds) { if (q === this || q.dead || !(q.role === 'cop' || q.gang) || q.state === 'fight' || S.seers.has(q)) continue; if (dist2(q.x, q.y, this.x, this.y) < 300 * 300 && losClear(q.x, q.y, this.x, this.y)) { q.susT = G.t + 14; q.a = Math.atan2(this.y - q.y, this.x - q.x); } }
};
// alert cops and gang members spot you only if they then catch you, armed, in plain sight
function stealthTick(dt) { const p = G.player; if (!p || p.dead) return; G.susCk = (G.susCk || 0) - dt; if (G.susCk > 0) return; G.susCk = .3;
  const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) { if (q.dead) continue;
    if (q.invT && G.t > q.invT && q.state !== 'chase' && q.state !== 'fight' && !inView(q.x, q.y, 60)) { const i = peds.indexOf(q); if (i >= 0) peds.splice(i, 1); continue; }
    if (!q.susT || G.t > q.susT) continue; if (p.car || !(p.weapon > 0) || !seesPlayer(q, 280)) continue; q.susT = 0;
    if (q.role === 'cop') { const b = stars(); G.heat = Math.max(G.heat, 1.05); markSeen(); if (b === 0) { G.wantedSince = G.t; G.starFlash = 1.5; Snd.play('starup'); msg('A cop spotted you with a gun near the scene!', '#ff6b6b'); } pedSay(q, pick(['Drop the weapon!', 'You! Freeze!'])); }
    else if (q.gang) { G.gangAggro[q.gang] = 60; q.state = 'fight'; q.target = p; q.timer = 20; pedSay(q, pick(['It was him!', 'There! Get him!'])); } }
  if (!G.scene) for (const c of G.cars) if (c.invDone && G.t > c.invDone && !c.driver && c.ai && c.ai.mode === 'parked' && !c.dead && stars() === 0) { c.invDone = 0; c.driver = { role: 'cop' }; makeTrafficAI(c, ((Math.round(c.a / (Math.PI / 2)) % 4) + 4) % 4, 0); }
}
// an anonymous call sends one patrol to look around; nobody is wanted for it
function anonResponse(r) { msg('Someone found a body and called it in. Police are checking the area — nobody saw the shooter.', '#9fc5e8'); if (G.scene && !r.b) return;
  for (let k = 0; k < 30; k++) { const a = rnd(0, TAU), d = rnd(950, 1400), x = r.x + Math.cos(a) * d, y = r.y + Math.sin(a) * d, tx = Math.floor(x / T), ty = Math.floor(y / T); if (!inMap(tx, ty) || tileAt(tx, ty) !== TILE.ROAD || (!G.scene && inView(x, y, 120))) continue; const vc = isRoadCol(tx), hr = isRoadRow(ty); if (vc === hr) continue;
    const c = new Car('cop', x, y, Math.atan2(r.y - y, r.x - x)), nr = navRoute(x, y, r.x, r.y); c.ai = { mode: 'invest', path: nr ? nr.path.slice() : [], tx: r.x, ty: r.y, t: G.t + 70, stuck: 0, rev: 0, blockT: 0, wps: [], lane: 0, dir: 0 }; c.siren = 1; c.driver = { role: 'cop' }; G.cars.push(c); return; } }
function investAI(c, dt) { const ai = c.ai; if (stars() > 0) { ai.mode = 'chase'; ai.nav = null; return; }
  while (ai.path.length > 1 && dist(c.x, c.y, ai.path[0][0], ai.path[0][1]) < 140) ai.path.shift();
  const tg = ai.path.length ? ai.path[0] : [ai.tx, ai.ty], dT = dist(c.x, c.y, ai.tx, ai.ty);
  if (dT < 240 || G.t > ai.t) { c.throttle = 0; c.brake = 1; c.steer = 0; if (c.spd < 40) { ai.mode = 'parked'; c.siren = 0; c.driver = null; c.invDone = G.t + 50; const fx = Math.cos(c.a), fy = Math.sin(c.a);
      for (const s of [-1, 1]) { const q = new Ped(c.x - fy * s * 30, c.y + fx * s * 30, { role: 'cop' }); q.state = 'idle'; q.timer = 0; q.susT = G.t + 45; q.invT = G.t + 48; q.a = Math.atan2(ai.ty - q.y, ai.tx - q.x); q.wander = [ai.tx + rnd(-90, 90), ai.ty + rnd(-90, 90)]; G.peds.push(q); if (s > 0) pedSay(q, pick(['Dispatch, we\'re on scene.', 'Spread out. Look around.', 'Got a body here.'])); } } return; }
  const ob = obstacleAhead(c, 70); driveToward(c, tg[0], tg[1], ob ? 110 : 400, dt); }

// ================= SOLID CARS & TRAFFIC THAT GOES AROUND =================
// people (and the player on foot) can't walk through vehicles: push out of the car's actual rectangle
function carContact(p, c, r, soft) { // nearest-surface contact against the car's rectangle (bumpers are a little soft)
  const dx = p.x - c.x, dy = p.y - c.y; if (dx * dx + dy * dy > (c.L / 2 + r + 4) ** 2) return null;
  const ca = Math.cos(c.a), sa = Math.sin(c.a), lx = dx * ca + dy * sa, ly = -dx * sa + dy * ca, hx = c.L / 2 - soft, hy = c.W / 2 - soft * .25;
  const cx = clamp(lx, -hx, hx), cy = clamp(ly, -hy, hy); let nx, ny, pen;
  if (cx === lx && cy === ly) { const px = hx - Math.abs(lx), py = hy - Math.abs(ly); if (px < py) { nx = Math.sign(lx) || 1; ny = 0; pen = px + r; } else { nx = 0; ny = Math.sign(ly) || 1; pen = py + r; } }
  else { const ex = lx - cx, ey = ly - cy, d = Math.hypot(ex, ey); if (d >= r) return null; nx = ex / (d || 1); ny = ey / (d || 1); pen = r - d; }
  return { c, wx: nx * ca - ny * sa, wy: nx * sa + ny * ca, pen, lx, ny, hx }; }
const PNEAR = [];
function pushOutOfCars(p) { if (G.scene || p.dead || p.car || p.air > 0 || p.inCar) return; const r = p.r || 10;
  const near = PNEAR; near.length = 0; for (const c of G.cars) if (!(c.dead && c.burnt) && Math.abs(p.x - c.x) < c.L && Math.abs(p.y - c.y) < c.L) near.push(c); if (!near.length && !(Net.room)) return;
  let hits = []; for (const c of near) { const h = carContact(p, c, r, 5); if (h) hits.push(h); }
  // wedged between two vehicles from opposite sides: squeeze through with a slim body, a bit slower
  let pinch = false; if (hits.length) { const wide = near.map(c => carContact(p, c, r + 9, 5)).filter(Boolean); // packed: another car is right there too
    for (let i = 0; i < wide.length && !pinch; i++) for (let k = i + 1; k < wide.length; k++) if (wide[i].c !== wide[k].c) { pinch = true; break; } }
  if (pinch) { p.squeezeT = .25; hits = near.map(c => carContact(p, c, r * .3, 7)).filter(Boolean); }
  for (const h of hits) { p.x += h.wx * h.pen; p.y += h.wy * h.pen;
    if (!p.isPlayer && !pinch && !(p.avT > 0) && (p.mvx || p.mvy) && (p.mvx * h.wx + p.mvy * h.wy) < 0) { const side = (p.mvx * -h.wy + p.mvy * h.wx) >= 0 ? 1 : -1; p.avT = .55; p.avS = side * ((h.ny !== 0 && Math.abs(h.lx) > h.hx * .2) ? Math.sign(h.lx) * side || 1 : 1); } }
  for (const c of Net.remoteCars ? Net.remoteCars() : []) { const dx = p.x - c.x, dy = p.y - c.y, rr = (c.W || 20) / 2 + (pinch ? r * .3 : r), d = Math.hypot(dx, dy); if (d < rr && d > 0) { p.x = c.x + dx / d * rr; p.y = c.y + dy / d * rr; } } }
function updatePedMoveS(p, dt) { if (p.squeezeT > 0) { p.squeezeT -= dt; p.mvx *= .6; p.mvy *= .6; } updatePedMove0(p, dt); pushOutOfCars(p); }
// a traffic car stuck behind a stopped vehicle waits a moment, then pulls around it
function passCheck(c, o, d, dt) { const ai = c.ai, oa = o instanceof Car ? o.ai : null; if (!(o instanceof Car) && !(o.dead || o.isPlayer || (o.spd || 0) < 8)) { ai.waitT = 0; return false; }
  const legit = !o.dead && o.driver && oa && oa.mode === 'traffic' && (oa.atRed || oa.blocked) && !oa.go; // a proper queue: wait your turn
  if (legit || o.spd > 15 || ai.go || !c.driver) { ai.waitT = 0; return false; }
  ai.waitT = (ai.waitT || 0) + dt; if (!ai.waitLim) ai.waitLim = rnd(1.6, 3.2) * (c.d.box || c.L > 60 ? 1.4 : 1);
  if (ai.waitT > ai.waitLim * .6 && !ai.honked && Math.random() < dt * 1.5) { ai.honked = 1; c.horn = .25; }
  if (ai.waitT < ai.waitLim) return false;
  if (startPass(c, o)) { ai.waitT = 0; ai.waitLim = 0; ai.honked = 0; return true; } ai.waitT = ai.waitLim - .6; return false; }
function passClear(c, o, pts, oncoming) { const f = [Math.cos(c.a), Math.sin(c.a)], rad = c.W / 2 + 6;
  for (let k = 0; k < pts.length - 1; k++) { const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], n = Math.ceil(dist(x0, y0, x1, y1) / 18);
    for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, tx = Math.floor(x / T), ty = Math.floor(y / T); if (tileAt(tx, ty) !== TILE.ROAD) return false;
      for (const q of G.cars) { if (q === c || q === o) continue; const dq = dist2(q.x, q.y, x, y); if (dq < (q.L / 2 + rad) ** 2) return false; }
      for (const p of G.peds) if (p !== o && !p.dead && dist2(p.x, p.y, x, y) < (rad + 10) ** 2 && tileAt(Math.floor(p.x / T), Math.floor(p.y / T)) === TILE.ROAD) return false; const pl = G.player; if (pl && pl !== o && !pl.car && !pl.dead && dist2(pl.x, pl.y, x, y) < (rad + 14) ** 2) return false; } }
  if (oncoming) { const [ex, ey] = pts[pts.length - 2]; for (const q of G.cars) { if (q === c || q === o || q.dead || q.spd < 20) continue; const rx = q.x - c.x, ry = q.y - c.y, along = rx * f[0] + ry * f[1], lat = Math.abs(-rx * f[1] + ry * f[0]); const towards = (q.vx * f[0] + q.vy * f[1]) < -10; if (towards && along > 0 && along < dist(c.x, c.y, ex, ey) + 380 && lat < 2.4 * T) return false; } }
  return true; }
function startPass(c, o) { const ai = c.ai, f = [Math.cos(c.a), Math.sin(c.a)], r1 = DV[ai.dir] ? [-DV[ai.dir][1], DV[ai.dir][0]] : [-f[1], f[0]];
  const sO = (o.x - c.x) * f[0] + (o.y - c.y) * f[1], oL = o.L || 24; if (sO < 0) return false;
  const P = (s, lat) => [c.x + f[0] * s + r1[0] * lat, c.y + f[1] * s + r1[1] * lat];
  const plan = lat => [[c.x, c.y], P(Math.max(c.L * .7, sO - oL / 2 - 6), lat), P(sO + oL / 2 + c.L / 2 + 36, lat), P(sO + oL / 2 + c.L + 120, 0)];
  // where the car really is across the road (the lane field can be stale), measured from the centre line
  const vert = ai.dir === 1 || ai.dir === 3, ctr = vert ? roadCX(Math.round((c.x / T - 2) / RSP)) : roadCY(Math.round((c.y / T - 2) / RSP)), latNow = vert ? (c.x - ctr) * r1[0] : (c.y - ctr) * r1[1];
  const same = (latNow < T ? 1.5 * T : .5 * T) - latNow, opp = -.5 * T - latNow;
  for (const [lat, onc] of [[same, 0], [opp, 1]]) { const pts = plan(lat); if (!passClear(c, o, pts, onc)) continue; ai.go = { pts: pts.slice(1), o, t: 6 + c.L / 60, onc }; return true; }
  return false; }
function passTick(c, dt) { const ai = c.ai, P = ai.go; P.t -= dt; if (P.t <= 0 || !P.pts.length) { ai.go = null; return false; }
  const w = P.pts[0]; if (dist(c.x, c.y, w[0], w[1]) < (P.pts.length === 1 ? 46 : 30)) { P.pts.shift(); if (!P.pts.length) { ai.go = null; ai.blockT = 0; ai.wps = []; return false; } }
  const ob = obstacleAhead(c, 40 + Math.max(0, c.fwd) * .55), other = ob && ob.o !== P.o; let des = P.onc ? 260 : 220;
  if (other) { if (ob.d < 24) { c.throttle = 0; c.brake = 1; P.t -= dt; return true; } des = Math.min(des, ob.d * 1.6); }
  driveToward(c, P.pts[0][0], P.pts[0][1], des, dt); return true; }
