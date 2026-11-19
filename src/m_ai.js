// ================= TRAFFIC, PEDESTRIAN AND POLICE AI (overrides) =================
const LCYC = 18;
function hasLight(i, j) { return i > 0 && j > 0 && i < NR - 1 && j < NR - 1 && !W.rur[idx(i * RSP + 2, j * RSP + 2)]; }
function lightState(i, j, axis) { const t = (G.t + ((i * 7 + j * 13) % 6) * 3) % LCYC, ph = axis === 0 ? t : (t + 9) % LCYC; return ph < 6.5 ? 'g' : ph < 8 ? 'y' : 'r'; }
function markSeen() { const p = G.player; G.lastSeen = G.t; G.lastKnown = { x: p.car ? p.car.x : p.x, y: p.car ? p.car.y : p.y }; }
const pursuitLive = () => G.t - G.lastSeen < 1.2;

function planRoute(c) {
  const ai = c.ai; let d = ai.dir; let [i, j] = nextInter(c, d);
  if (!okInter(i, j)) { ai.dir = d = (d + 2) % 4; [i, j] = nextInter(c, d); if (!okInter(i, j)) { ai.wps = []; return; } }
  const C = [roadCX(i), roadCY(j)], can = dd => { const [dx, dy] = DV[dd]; return okInter(i + dx, j + dy); };
  const R = (d + 1) % 4, L = (d + 3) % 4, opts = [];
  if (can(d)) opts.push(d, d, d); if (can(R) && ai.lane === 1) opts.push(R, R); if (can(L) && ai.lane === 0) opts.push(L, L);
  if (!opts.length) { if (can(R)) opts.push(R); if (can(L)) opts.push(L); }
  let nd = opts.length ? pick(opts) : (d + 2) % 4;
  if (ai.flee) { let bs = -9; for (const o of [d, R, L, (d + 2) % 4]) { if (!can(o)) continue; const vx = C[0] - ai.flee.x, vy = C[1] - ai.flee.y, l = Math.hypot(vx, vy) || 1, s = (DV[o][0] * vx + DV[o][1] * vy) / l + (o === d ? .2 : 0) + Math.random() * .25; if (s > bs) { bs = s; nd = o; } } }
  const [dx, dy] = DV[d], r1 = [-dy, dx], o1 = laneOff(ai.lane);
  const [dx2, dy2] = DV[nd], r2 = [-dy2, dx2], lane2 = nd === R ? 1 : nd === L ? 0 : (Math.random() < .18 ? 1 - ai.lane : ai.lane), o2 = laneOff(lane2);
  ai.wps = [[C[0] + r1[0] * o1 - dx * 2.5 * T, C[1] + r1[1] * o1 - dy * 2.5 * T]];
  if (nd !== d) { if (nd === (d + 2) % 4) ai.wps.push([C[0] + dx * T, C[1] + dy * T]); else { const k = nd === R ? .32 * T : 0; ai.wps.push([C[0] + r1[0] * o1 + r2[0] * o2 + (dx - dx2) * k, C[1] + r1[1] * o1 + r2[1] * o2 + (dy - dy2) * k]); } }
  ai.wps.push([C[0] + r2[0] * o2 + dx2 * 2.6 * T, C[1] + r2[1] * o2 + dy2 * 2.6 * T]); ai.nd = nd; ai.nlane = lane2; ai.E = 1; ai.ii = i; ai.jj = j;
}
function obstacleAhead(c, range) {
  const fx = Math.cos(c.a), fy = Math.sin(c.a); let best = null, bd = range;
  const check = (o, x, y, w, ext) => { const rx = x - c.x, ry = y - c.y, f = rx * fx + ry * fy, l = Math.abs(-rx * fy + ry * fx); if (f > c.L * .4 && f < bd + c.L * .5 + (ext || 0) && l < w) { bd = Math.max(0, f - c.L * .5 - (ext || 0)); best = o; } };
  for (const o of G.cars) if (o !== c) check(o, o.x, o.y, (c.W + o.W) * .55, o.L * .3);
  for (const r of Net.remoteCars()) check(r, r.x, r.y, (c.W + r.W) * .55, r.L * .3);
  for (const p of G.peds) if (!p.dead && !p.car) check(p, p.x, p.y, c.W * .5 + 12, 14);
  const pl = G.player; if (pl && !pl.dead && !pl.car && !G.scene && G.mode === 'play') check(pl, pl.x, pl.y, c.W * .5 + 16, 22);
  return best ? { o: best, d: bd } : null;
}
function updateCarAI0(c, dt) {
  const ai = c.ai; if (!ai || c.dead) return;
  if (c.horn > 0) { c.horn -= dt; if (Math.random() < dt * 2) Snd.play('horn', c.x, c.y, .5); }
  if (ai.mode === 'parked') { c.throttle = 0; c.brake = 1; c.steer = 0; return; }
  if (ai.mode === 'flee') { ai.mode = 'traffic'; ai.cruise = 480; }
  if (ai.mode === 'chase') return copCarAI(c, dt);
  if (!ai.wps.length) { ai.dir = ai.nd !== undefined ? ai.nd : ai.dir; ai.lane = ai.nlane !== undefined ? ai.nlane : ai.lane; planRoute(c); if (!ai.wps.length) { c.throttle = 0; c.brake = 1; return; } }
  const wp = ai.wps[0], dd = dist(c.x, c.y, wp[0], wp[1]), ta = Math.atan2(wp[1] - c.y, wp[0] - c.x), stopD = 1.15 * T + c.L / 2;
  let red = false;
  if (ai.E && dd > stopD - 26 && !ai.flee) {
    if (hasLight(ai.ii, ai.jj)) { const s = lightState(ai.ii, ai.jj, ai.dir % 2); red = s === 'r' || (s === 'y' && dd > stopD + 70); }
    else if (dd < stopD + 90) { // unsignalled: give way to anything already in the junction
      const cx = roadCX(ai.ii), cy = roadCY(ai.jj);
      for (const o of G.cars) if (o !== c && !o.dead && o.driver && Math.abs(o.x - cx) < 2.3 * T && Math.abs(o.y - cy) < 2.3 * T && o.spd > 20) { red = true; break; }
    }
  }
  if (!red && (dd < (ai.E || ai.wps.length === 1 ? 34 : 22) || (dd < 140 && Math.cos(ta - c.a) < -.2))) { ai.wps.shift(); ai.E = 0; if (!ai.wps.length) { ai.dir = ai.nd; ai.lane = ai.nlane; planRoute(c); } return; }
  let desired = ai.cruise;
  if (ai.nd !== ai.dir && (!ai.E || dd < 230)) desired = Math.min(desired, 150);
  ai.atRed = 0; if (ai.go && passTick(c, dt)) return;
  if (red) { if (dd < stopD + 8) { c.throttle = 0; c.brake = 1; c.steer = clamp(angDiff(c.a, ta), -.4, .4); ai.blockT = 0; ai.stuck = 0; ai.atRed = 1; ai.blocked = 1; return; } desired = Math.min(desired, (dd - stopD) * 1.7 + 25); }
  const ob = obstacleAhead(c, 50 + Math.max(0, c.fwd) * .72);
  if (ob && !(ai.ignT > 0 && ob.o instanceof Car)) {
    desired = ob.d < 26 ? 0 : Math.min(desired, Math.max(0, ob.d * 1.5 - 30)); ai.blockT += dt; const o = ob.o, isP = o === pCar() || o === G.player;
    if (isP && ai.blockT > 1.2 && Math.random() < dt * 1.2) c.horn = .4;
    ai.blocked = 1; if (!passCheck(c, o, ob.d, dt)) {} else if (ai.go) return;
    const still = o instanceof Car && (o.dead || !o.driver || (o.ai && o.ai.mode === 'parked') || (o === pCar() && o.spd < 20));
    if ((still || (!(o instanceof Car) && ai.blockT > 4.5 && (o.isPlayer || o.dead || Math.hypot(o.mvx || 0, o.mvy || 0) < 8))) && ai.blockT > 2.2 && ai.E) { ai.lane = 1 - ai.lane; ai.blockT = 0; ai.swaps = (ai.swaps || 0) + 1; planRoute(c); }
    else if (o instanceof Car && o.ai && o.ai.mode === 'traffic' && ai.blockT > 3.5 && c.spd < 8 && o.spd < 8 && c.uid < o.uid) { ai.ignT = 1.6; ai.blockT = 0; }
    if (ai.blockT > 14 && !inView(c.x, c.y, 80)) c.gone = 1;
  } else { ai.blockT = Math.max(0, ai.blockT - dt * 2); ai.blocked = 0; ai.waitT = 0; }
  if (ai.ignT > 0) { ai.ignT -= dt; desired = Math.min(desired, 70); }
  if (desired < 5) { c.throttle = 0; c.brake = 1; c.steer = clamp(angDiff(c.a, ta) * 2, -1, 1); ai.stuck = 0; return; }
  let gx = wp[0], gy = wp[1];
  if (dd > 150) { const [ux, uy] = DV[ai.E ? ai.dir : ai.nd], al = (wp[0] - c.x) * ux + (wp[1] - c.y) * uy; if (al > 150) { gx = wp[0] - ux * (al - 120); gy = wp[1] - uy * (al - 120); } } // hold the lane line instead of drifting toward a far-off point
  driveToward(c, gx, gy, desired, dt);
}
function copCarAI(c, dt) {
  const ai = c.ai, pl = G.player, st = stars();
  const toPatrol = () => { ai.mode = 'traffic'; c.siren = st > 0 ? 1 : 0; ai.dir = Math.round(((c.a % TAU) + TAU) % TAU / (Math.PI / 2)) % 4; ai.lane = 0; ai.nav = null; ai.cruise = 260; ai.wps = []; ai.blockT = 0; ai.nd = undefined; ai.nlane = undefined; planRoute(c); };
  if (!pl || pl.dead || st === 0) { toPatrol(); c.siren = 0; return; }
  c.siren = 1;
  const px = pl.car ? pl.car.x : pl.x, py = pl.car ? pl.car.y : pl.y, dP = dist(c.x, c.y, px, py);
  if (!G.scene && dP < 520 && losClear(c.x, c.y, px, py)) markSeen();
  const live = pursuitLive(), tx = live || !G.lastKnown ? px : G.lastKnown.x, ty = live || !G.lastKnown ? py : G.lastKnown.y, d = dist(c.x, c.y, tx, ty);
  if (!live && d < 170) { ai.lookT = (ai.lookT || 0) + dt; c.throttle = 0; c.brake = 1; if (ai.lookT > 2.5) { ai.lookT = 0; toPatrol(); } return; }
  ai.lookT = 0;
  if (live && !pl.car && dP < 230 && c.spd < 160 && !G.scene) { c.throttle = 0; c.brake = 1; ai.exitT = (ai.exitT || 0) + dt; if (ai.exitT > .5) { if (G.peds.filter(q => q.role === 'cop' && !q.dead && q.state === 'chase').length < [0, 2, 3, 4, 6, 6][st]) exitCops(c); else { ai.mode = 'parked'; c.driver = null; } } return; }
  let gx = tx, gy = ty;
  if (d > 300 && !losClear(c.x, c.y, tx, ty)) {
    const node = n => [roadCX(n[0]), roadCY(n[1])], near = () => [clamp(Math.round((c.x / T - 2) / RSP), 0, NR - 1), clamp(Math.round((c.y / T - 2) / RSP), 0, NR - 1)];
    if (!ai.nav) ai.nav = near();
    let [nx, ny] = node(ai.nav);
    if (dist(c.x, c.y, nx, ny) < 115) { const ti = clamp(Math.round((tx / T - 2) / RSP), 0, NR - 1), tj = clamp(Math.round((ty / T - 2) / RSP), 0, NR - 1), [ci, cj] = ai.nav; if (Math.abs(ti - ci) >= Math.abs(tj - cj) && ti !== ci) ai.nav = [ci + Math.sign(ti - ci), cj]; else if (tj !== cj) ai.nav = [ci, cj + Math.sign(tj - cj)]; else if (ti !== ci) ai.nav = [ci + Math.sign(ti - ci), cj]; [nx, ny] = node(ai.nav); }
    gx = nx; gy = ny;
  } else ai.nav = null;
  const ob = obstacleAhead(c, 70);
  let desired = Math.min(760, (pl.car ? pl.car.st.max : 420) * [.86, .86, .93, 1.0, 1.06, 1.12][st]);
  if (ob && ob.o !== pCar() && ob.o !== pl) desired = Math.min(desired, 120);
  if (!pl.car && dP < 520) desired = Math.min(desired, Math.max(60, (dP - 120) * 1.2));
  driveToward(c, gx, gy, desired, dt);
  if (dP < 140) c.throttle = Math.min(c.throttle, .8);
}
function crime0(sev, label) {
  const p = G.player; if (!p || p.dead) return;
  let seen = false; const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) if (q.role === 'cop' && !q.dead && dist2(q.x, q.y, p.x, p.y) < 420 * 420 && losClear(q.x, q.y, p.x, p.y)) { seen = true; break; }
  if (!G.scene && !seen) for (const c of G.cars) if (c.type === 'cop' && c.driver && !c.dead && dist2(c.x, c.y, p.x, p.y) < 460 * 460 && losClear(c.x, c.y, p.x, p.y)) { seen = true; break; }
  const before = stars();
  G.heat = Math.min(5.99, G.heat + sev * (seen ? 1 : .3));
  if (seen && stars() > 0) markSeen();
  if (stars() > before) { markSeen(); if (before === 0) G.wantedSince = G.t; G.starFlash = 1.5; Snd.play('starup'); if (before === 0) msg(label ? label + '! Someone called the cops.' : 'Someone called the cops!', '#ff6b6b'); }
}
function wantedUpdate0(dt) {
  const st = stars(), p = G.player;
  if (st > (G.prevStars || 0) && G.t - G.lastSeen > 2) { markSeen(); if (!G.prevStars) G.wantedSince = G.t; }
  if (st > 0) {
    const need = [0, 8, 10, 12, 15, 18][st], un = G.t - G.lastSeen; G.coolK = clamp(un / need, 0, 1);
    if (un > need) { G.heat = st - 1; G.lastSeen = G.t - need * .35; Snd.play('starlost'); if (G.heat < 1) { G.heat = 0; msg('You lost the cops.', '#2ecc71'); callOffCops(); } }
  } else { G.coolK = 0; if (G.heat > 0) G.heat = Math.max(0, G.heat - dt * .02); }
  G.prevStars = stars();
  G.arrest = Math.max(0, G.arrest - dt * .5); if (G.arrest > 1.6 && !p.dead) busted();
}
function callOffCopsL() {
  for (const c of G.cars) if (c.type === 'cop' || c.type === 'swat') { c.siren = 0; if (c.ai && c.ai.mode === 'parked' && !c.driver) c.abandoned = G.t; }
  for (const q of G.peds) if (q.role === 'cop' && q.state === 'chase' && !q.hostile) { q.state = 'walk'; q.ring = null; q.cp = null; }
  G.arrest = 0;
}
function policeResponse(fx, fy) {
  const st = stars(), pl = G.player;
  // patrol units only react to what they can see (or a radio call close to the last sighting)
  if (st > 0 && !G.scene) for (const c of G.cars) {
    if (c.type !== 'cop' || !c.ai || c.ai.mode !== 'traffic' || !c.driver || c.dead) continue;
    const d2 = dist2(c.x, c.y, fx, fy);
    if (d2 < 480 * 480 && losClear(c.x, c.y, fx, fy)) { c.ai.mode = 'chase'; c.ai.nav = null; c.siren = 1; Snd.play('whoop', c.x, c.y); markSeen(); }
    else if (pursuitLive() && G.lastKnown && dist2(c.x, c.y, G.lastKnown.x, G.lastKnown.y) < 800 * 800 && st >= 2 && G.t > (c.ai.coolT || 0)) { c.ai.mode = 'chase'; c.ai.nav = null; c.ai.coolT = G.t + 20; c.siren = 1; }
  }
  G.copCD = (G.copCD || 0) - .3; G.footCD = (G.footCD || 0) - .3;
  if (st === 0) return;
  const hot = G.t - G.lastSeen < 6, LK = G.lastKnown || { x: fx, y: fy };
  const chasing = G.cars.filter(c => c.ai && c.ai.mode === 'chase' && !c.dead).length, foot = G.peds.filter(p => p.role === 'cop' && !p.dead && p.state === 'chase').length;
  if (hot && chasing < [0, 1, 2, 2, 3, 5][st] && G.copCD <= 0 && G.t - (G.wantedSince || -99) > [0, 7, 5, 4, 3, 2][st]) {
    for (let tries = 0; tries < 8; tries++) {
      const ang = rnd(0, TAU), r = rnd(1150, 1550), x = LK.x + Math.cos(ang) * r, y = LK.y + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
      if (!inMap(tx, ty) || tileAt(tx, ty) !== TILE.ROAD || inView(x, y, 120)) continue;
      const c = new Car(Math.random() < swatOdds(st, 1) ? 'swat' : 'cop', x, y, Math.atan2(LK.y - y, LK.x - x)); c.ai = { mode: 'chase', stuck: 0, rev: 0, blockT: 0, wps: [], lane: 0, dir: 0 }; c.siren = 1; c.driver = { role: 'cop' }; G.cars.push(c); G.copCD = [0, 15, 12, 9, 7, 5][st]; break;
    }
  }
  if (st >= 3 && hot && !pl.car && !G.scene && foot < st - 2 && footCops() < footCap() && G.footCD <= 0) {
    for (let tries = 0; tries < 8; tries++) {
      const ang = rnd(0, TAU), r = rnd(650, 950), x = LK.x + Math.cos(ang) * r, y = LK.y + Math.sin(ang) * r;
      if (tileAt(Math.floor(x / T), Math.floor(y / T)) !== TILE.WALK || inView(x, y, 40)) continue;
      const p = new Ped(x, y, { role: Math.random() < swatOdds(st, 0) ? 'swat' : 'cop' }); p.state = 'chase'; p.chaseSpawn = 1; G.peds.push(p); G.footCD = 16; break;
    }
  }
}
// ---- pedestrian pathing ----
function tilePath(sx, sy, goal, maxN) {
  const x0 = Math.floor(sx / T), y0 = Math.floor(sy / T), key = (x, y) => (y + 64) * 4096 + x + 64, prev = new Map([[key(x0, y0), null]]), q = [[x0, y0]]; let qi = 0, found = null;
  if (goal(x0, y0)) return [];
  while (qi < q.length && qi < maxN) { const cur = q[qi++], [x, y] = cur; if (qi > 1 && goal(x, y)) { found = cur; break; } for (const [dx, dy] of DV) { const nx = x + dx, ny = y + dy, k = key(nx, ny); if (prev.has(k) || sceneSolid(nx, ny)) continue; prev.set(k, cur); q.push([nx, ny]); } }
  if (!found) return null; const out = []; for (let n = found; n && !(n[0] === x0 && n[1] === y0); n = prev.get(key(n[0], n[1]))) out.push([(n[0] + .5) * T, (n[1] + .5) * T]); return out.reverse();
}
function pedSteer(p, tx, ty) { // angle toward a target, routing around buildings when there is no straight line
  if (losClear(p.x, p.y, tx, ty)) { p.cp = null; return Math.atan2(ty - p.y, tx - p.x); }
  if (!p.cp || G.t > (p.cpT || 0)) { const gx = Math.floor(tx / T), gy = Math.floor(ty / T); p.cp = tilePath(p.x, p.y, (x, y) => x === gx && y === gy, 900) || []; p.cpT = G.t + .7 + Math.random() * .4; }
  while (p.cp.length && dist2(p.x, p.y, p.cp[0][0], p.cp[0][1]) < 24 * 24) p.cp.shift();
  const n = p.cp[0] || [tx, ty]; return Math.atan2(n[1] - p.y, n[0] - p.x);
}
function pedsSeparate(list) {
  for (let i = 0; i < list.length; i++) { const a = list[i]; if (a.dead || a.sit || a.lie || a.still) continue; for (let j = i + 1; j < list.length; j++) { const b = list[j]; if (b.dead || b.sit || b.lie) continue; const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy; if (d2 > 324 || d2 < .01) continue; const d = Math.sqrt(d2), o = (18 - d) * .5; a.x += dx / d * o; a.y += dy / d * o; if (!b.still) { b.x -= dx / d * o; b.y -= dy / d * o; } } }
}
function crossingClear(p) { // may this pedestrian step into the road now?
  const [tx, ty] = p.crossTo, mx = (p.x + tx) / 2, my = (p.y + ty) / 2, alongX = Math.abs(tx - p.x) > Math.abs(ty - p.y);
  const i = clamp(Math.round((mx / T - 2) / RSP), 0, NR - 1), j = clamp(Math.round((my / T - 2) / RSP), 0, NR - 1);
  if (hasLight(i, j)) return lightState(i, j, alongX ? 0 : 1) === 'g';
  for (const c of G.cars) if (!c.dead && c.spd > 40 && dist2(c.x, c.y, mx, my) < 190 * 190) return false;
  return true;
}
function drawTrafficLights(vx0, vy0, vx1, vy1, dk) {
  const i0 = Math.max(1, Math.floor((vx0 / T - 4) / RSP)), i1 = Math.min(NR - 2, Math.ceil((vx1 / T + 2) / RSP)), j0 = Math.max(1, Math.floor((vy0 / T - 4) / RSP)), j1 = Math.min(NR - 2, Math.ceil((vy1 / T + 2) / RSP));
  const COL = { g: '#39e075', y: '#ffd23f', r: '#ff3b30' };
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (!hasLight(i, j)) continue; const cx = roadCX(i), cy = roadCY(j);
    for (let d = 0; d < 4; d++) { // signal for traffic heading in direction d, on its right-hand kerb at the stop line
      const [dx, dy] = DV[d], rx = -dy, ry = dx, x = cx - dx * 3.25 * T + rx * 2.3 * T, y = cy - dy * 3.25 * T + ry * 2.3 * T, s = lightState(i, j, d % 2);
      ctx.fillStyle = '#16181c'; ctx.fillRect(x - 5, y - 5, 10, 10); ctx.fillStyle = '#2a2d33'; ctx.fillRect(x - 5 - rx * 2, y - 5 - ry * 2, 10, 10);
      ctx.fillStyle = COL[s]; ctx.beginPath(); ctx.arc(x - rx * 2, y - ry * 2, 3.4, 0, TAU); ctx.fill();
      ctx.globalAlpha = .28 + dk * .3; ctx.drawImage(radialSprite(s === 'g' ? 'rgba(57,224,117,1)' : s === 'y' ? 'rgba(255,210,63,1)' : 'rgba(255,59,48,1)', 64), x - rx * 2 - 13, y - ry * 2 - 13, 26, 26); ctx.globalAlpha = 1;
      if (dk > .1) pushLight('pt', x, y, 46, s === 'g' ? 'rgba(57,224,117,1)' : s === 'y' ? 'rgba(255,210,63,1)' : 'rgba(255,59,48,1)', .7);
    }
  }
}
