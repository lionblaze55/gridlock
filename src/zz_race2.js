// ================= THE RACING SCENE: Pinewood Raceway outside town, street races you start with a honk, betting, pink slips, gang-run car events and a racing rep ladder =================
const RRANKS = [[0, 'Rookie'], [100, 'Street racer'], [300, 'Known name'], [700, 'Respected'], [1200, 'Legend'], [2000, 'King of Varro']];
const rankOf = c => { let r = RRANKS[0]; for (const k of RRANKS) if (c >= k[0]) r = k; return r[1]; };
const nextRank = c => RRANKS.find(k => k[0] > c);
const maxBet = () => { const c = MS().cred; return c >= 1200 ? 50000 : c >= 700 ? 20000 : c >= 300 ? 8000 : c >= 100 ? 3000 : 1000; };
function credLose(n) { const S = MS(); n = Math.min(n, S.cred); if (n <= 0) return; S.cred -= n; msg('−' + n + ' street cred (' + S.cred + ')', '#ff8a80'); }
{ const _ca = credAdd; credAdd = function (n) { const before = rankOf(MS().cred); _ca(n); const now = rankOf(MS().cred); if (now !== before) { G.big = { text: now.toUpperCase(), col: '#ff8a80', t: 3, sub: 'New racing rank', small: 1 }; Snd.play('mission'); } }; }
const RACE_NAMES = ['Kenji', 'Tess', 'Mikey', 'Lola', 'Ace', 'Nina', 'Rook', 'Vee', 'Sly', 'Dex', 'Mara', 'Taz', 'Jojo', 'Rico'];
const NEON = ['#ff1744', '#00e5ff', '#76ff03', '#ffea00', '#d500f9', '#ff9100', '#f5f5f5', '#212121'];

// ---------------- Pinewood Raceway: two empty country blocks near town become an asphalt ring ----------------
function trackGen() { W.track = null; const empty = b => { if (!RURALSET.has(b.d)) return false; for (let y = b.by; y < b.by + 12; y++) for (let x = b.bx; x < b.bx + 12; x++) { const t = W.tile[idx(x, y)]; if (t === TILE.BLD || t === TILE.WATER || W.solid[idx(x, y)]) return false; } return !W.buildings.some(B => B.door && B.door.x > b.bx * T - T && B.door.x < (b.bx + 13) * T && B.door.y > b.by * T - T && B.door.y < (b.by + 13) * T); };
  const ref = W.meet || { x: NR * RSP * T / 2, y: NR * RSP * T / 2 }; let best = null;
  for (const a of W.blocks) { if (!empty(a)) continue; const b = W.blocks.find(o => o.bi === a.bi + 1 && o.bj === a.bj); if (!b || !empty(b)) continue; const d = dist2((a.bx + 14) * T, (a.by + 6) * T, ref.x, ref.y); if (!best || d < best.d) best = { a, b, d }; }
  if (!best) return; const x0 = best.a.bx, x1 = best.b.bx + 11, y0 = best.a.by, y1 = best.a.by + 11;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const k = idx(x, y), t = W.tile[k]; if (t === TILE.ROAD || t === TILE.WALK) continue; const ring = x >= x0 + 1 && x <= x1 - 1 && y >= y0 + 1 && y <= y1 - 1 && (x <= x0 + 2 || x >= x1 - 2 || y <= y0 + 2 || y >= y1 - 2); W.tile[k] = ring ? TILE.LOT : TILE.GRASS; markTile(x, y); if (ring && TIMGI.lot0 !== undefined) W.timg[k] = TIMGI.lot0; }
  const X0 = x0 * T, X1 = (x1 + 1) * T, Y0 = y0 * T, Y1 = (y1 + 1) * T, inR = (x, y, m) => x > X0 - (m || 0) && x < X1 + (m || 0) && y > Y0 - (m || 0) && y < Y1 + (m || 0);
  killProps(p => inR(p.x, p.y, 20)); W.parkSpots = W.parkSpots.filter(s => !inR(s.x, s.y, 60)); W.lifeSpots = W.lifeSpots.filter(s => !inR(s.x, s.y, 40));
  const xl = (x0 + 2) * T, xr = (x1 - 1) * T, yt = (y0 + 2) * T, yb = (y1 - 1) * T, sx = (x0 + 6) * T;
  const lap = [[xr, yb], [xr, yt], [xl, yt], [xl, yb], [sx, yb]];
  const hub = { x: sx + 90, y: yb - T * 2.6 };
  W.track = { X0, X1, Y0, Y1, xl, xr, yt, yb, sx, lap, hub, start: [sx, yb] };
  W.labels.push({ n: 'Pinewood Raceway', x: x0 + 6, y: y0 + 3, big: 1 });
  W.lifeSpots.push({ x: hub.x, y: hub.y, kind: 'npc', role: 'meet', name: 'Rosa Vega', meet: 1, track: 1 });
  for (let i = 0; i < 14; i++) W.lifeSpots.push({ x: sx - 290 + (i % 7) * 88 + (i % 2) * 18, y: yb - T * 3.7 - Math.floor(i / 7) * 34, kind: 'crowd', face: [sx, yb], cond: trackOn });
  addProp('speaker', sx - 350, yb - T * 3.2, { meet: 1 }); addProp('speaker', sx + 350, yb - T * 3.2, { meet: 1 });
  const CC = NEON; [-250, -170, 170, 250, 330].forEach((dx, i) => W.parkSpots.push({ x: sx + dx, y: yb - T * 2.4, a: -Math.PI / 2, type: ['rally', 'gt', 'sports', 'hatch', 'muscle'][i], meet: 1, col: CC[(i * 3) % CC.length] })); }
const trackOn = () => G.tod >= 9 && G.tod < 23.5;
{ const _mg = storeGen; storeGen = function () { _mg(); try { trackGen(); } catch (e) { console.error(e); W.track = null; } }; }
// paint: grandstand, checkered line, curbs, tyre walls
function drawTrack() { const K = W.track; if (!K || G.scene || !inView((K.X0 + K.X1) / 2, (K.Y0 + K.Y1) / 2, Math.max(K.X1 - K.X0, K.Y1 - K.Y0))) return; const g = ctx;
  // start / finish
  for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#f5f5f5'; g.fillRect(K.sx - 12 + j * 12, K.yb - T + i * T / 4, 12, T / 4); }
  // curbs at the corners
  for (const [cx, cy] of [[K.xl, K.yt], [K.xr, K.yt], [K.xl, K.yb], [K.xr, K.yb]]) for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#e53935' : '#fafafa'; const a = i / 10 * TAU; g.fillRect(cx + Math.cos(a) * T * 1.05 - 5, cy + Math.sin(a) * T * 1.05 - 5, 10, 10); }
  // tyre walls on the outside of the bends
  g.fillStyle = '#151515'; for (const [cx, cy, sx, sy] of [[K.X0 + 14, K.Y0 + 14, 1, 1], [K.X1 - 14, K.Y0 + 14, -1, 1], [K.X0 + 14, K.Y1 - 14, 1, -1], [K.X1 - 14, K.Y1 - 14, -1, -1]]) for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(cx + sx * i * 18, cy, 8, 0, TAU); g.arc(cx, cy + sy * i * 18, 8, 0, TAU); g.fill(); }
  // grandstand
  const gx = K.sx - 330, gy = K.yb - T * 4.6, gw = 660, gh = T * 1.3; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(gx + 6, gy + 8, gw, gh); for (let r = 0; r < 4; r++) { g.fillStyle = r % 2 ? '#78909c' : '#90a4ae'; g.fillRect(gx, gy + r * gh / 4, gw, gh / 4); }
  if (trackOn()) for (let i = 0; i < 60; i++) { g.fillStyle = NEON[(i * 7) % NEON.length]; g.fillRect(gx + 8 + (i * 127) % (gw - 16), gy + 4 + ((i * 53) % 4) * gh / 4, 6, 6); }
  g.font = 'bold 26px Bungee, Impact, sans-serif'; g.textAlign = 'center'; g.fillStyle = 'rgba(255,255,255,.22)'; g.fillText('PINEWOOD RACEWAY', K.sx, K.Y0 + T * 4.4); }
{ const _dg = drawGaragePads; drawGaragePads = function () { drawTrack(); _dg(); }; }
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(); if (W.track) o.push({ x: W.track.sx, y: (W.track.Y0 + W.track.Y1) / 2, c: '#ff8a80', ic: 'R', r: 6, n: 'Pinewood Raceway', pr: 6 }); return o; }; }

// ---------------- routes ----------------
function routeFrom(x, y, R, rng) { const [i0, j0] = nearInter(x, y), cps = [];
  if (R.type !== 'circuit') { let i = i0, j = j0; const seen = new Set([i + ',' + j]); for (let k = 0; k < R.cps; k++) { const opts = DV.map(([dx, dy]) => [i + dx, j + dy]).filter(([a, b]) => okInter(a, b) && !seen.has(a + ',' + b)); if (!opts.length) break; const nx = opts[Math.floor(rng() * opts.length)]; i = nx[0]; j = nx[1]; seen.add(i + ',' + j); cps.push([roadCX(i), roadCY(j)]); } }
  else { const a = clamp(i0, 0, NR - 1 - R.w), b = clamp(j0, 0, NR - 1 - R.h), loop = []; for (let k = 0; k <= R.w; k++) loop.push([a + k, b]); for (let k = 1; k <= R.h; k++) loop.push([a + R.w, b + k]); for (let k = R.w - 1; k >= 0; k--) loop.push([a + k, b + R.h]); for (let k = R.h - 1; k >= 1; k--) loop.push([a, b + k]); const L = loop.filter(([p, q]) => okInter(p, q)).map(([p, q]) => [roadCX(p), roadCY(q)]); for (let l = 0; l < R.laps; l++) cps.push(...L.slice(l === 0 ? 1 : 0)); cps.push(L[0]); }
  return { start: [roadCX(i0), roadCY(j0)], cps }; }
function trackRoute(laps) { const K = W.track, cps = []; for (let l = 0; l < laps; l++) cps.push(...K.lap); return { start: K.start, cps, a0: 0 }; }

// ---------------- one race starter for everything (track, street, gang events) ----------------
function rivalCar(type, x, y, a, R, k) { const c = new Car(type, x, y, a); const tier = R.min >= 700 ? 3 : R.min >= 300 ? 2 : 1; applyMods(c, Object.assign(R.gang ? {} : RICE(), { eng: tier, tur: tier > 1 ? 1 : 0 })); c.color = R.gang ? GANGS[R.gang].col : pick(NEON); c.mods.p = c.color;
  c.driver = R.gang ? { gang: R.gang, name: pick(RACE_NAMES) } : { role: 'civ', name: pick(RACE_NAMES) }; c.ai = { mode: 'race', cp: 0, skill: clamp(rnd(.84, .94) + R.min / 4000 + (R.hard || 0), .8, 1.02), stuck: 0, rev: 0, off: rnd(-14, 14) }; c.missionCar = 1; c.raceCar = 1; return c; }
function gridUp(rt, pc, R, opps) { const a0 = rt.a0 !== undefined ? rt.a0 : Math.atan2(rt.cps[0][1] - rt.start[1], rt.cps[0][0] - rt.start[0]), fx = Math.cos(a0), fy = Math.sin(a0), lx = -fy, ly = fx;
  pc.x = rt.start[0] - fx * 40 + lx * 22; pc.y = rt.start[1] - fy * 40 + ly * 22; pc.a = a0; pc.vx = pc.vy = 0;
  const racers = []; opps.forEach((o, k) => { const x = rt.start[0] - fx * (40 + Math.floor((k + 1) / 2) * 75) + lx * ((k + 1) % 2 ? -22 : 22), y = rt.start[1] - fy * (40 + Math.floor((k + 1) / 2) * 75) + ly * ((k + 1) % 2 ? -22 : 22);
    let c = o.car; if (c) { c.x = x; c.y = y; c.a = a0; c.vx = c.vy = 0; c.ai = { mode: 'race', cp: 0, skill: o.skill || rnd(.86, .95), stuck: 0, rev: 0, off: 0 }; c.missionCar = 1; c.raceCar = 1; } else { c = rivalCar(o.type, x, y, a0, R, k); G.cars.push(c); } racers.push(c); });
  G.cars = G.cars.filter(c => c === pc || c.raceCar || dist2(c.x, c.y, rt.start[0], rt.start[1]) > 260 * 260);
  G.race = { R, cps: rt.cps, racers, pcp: 0, cd: 3.5, t: 0, fin: [], beep: 3, mine: pc }; }
function startRace2(R, rt, opps, go) { const p = G.player;
  startMission({ title: R.n, reward: 0, race: R, stage: go ? 'go' : 'race', update(dt) { const c = pCar(); if (this.stage === 'go') { this.target = { x: rt.start[0], y: rt.start[1], label: 'Start line' }; if (c && dist2(c.x, c.y, rt.start[0], rt.start[1]) < 220 * 220 && stars() === 0) { this.stage = 'race'; gridUp(rt, c, R, opps); } } else if (G.race) { const Rc = G.race, cp = Rc.cps[Rc.pcp] || rt.start; this.target = { x: cp[0], y: cp[1], label: Rc.pcp >= Rc.cps.length - 1 ? 'Finish' : 'Checkpoint' }; } },
    hud() { const Rc = G.race; if (!Rc) return 'Drive to the start line' + (R.at ? ' (' + (R.where || 'GPS') + ')' : ''); if (Rc.cd > 0) return 'Get ready… ' + Math.ceil(Rc.cd); return `CP ${Math.min(Rc.pcp + 1, Rc.cps.length)}/${Rc.cps.length} · ${racePos()}/${Rc.racers.length + 1} · ${Rc.t.toFixed(1)}s` + (R.wager ? ' · ' + money(R.wager) + ' on it' : '') + (R.pinks ? ' · PINK SLIPS' : ''); }, cleanup() { raceEnd(); } });
  if (!go) gridUp(rt, pCar(), R, opps); }
// ---------------- finishing: payouts, wagers, pink slips, gang respect ----------------
raceTick = function (dt) { const Rc = G.race; if (!G.mission || !G.mission.race) { raceEnd(); return; } const c = pCar(), R = Rc.R;
  if (Rc.cd > 0) { Rc.cd -= dt; if (c) { c.throttle = 0; c.brake = 1; c.vx *= .8; c.vy *= .8; } if (Math.ceil(Rc.cd) < Rc.beep && Rc.cd > 0) { Rc.beep = Math.ceil(Rc.cd); Snd.play('beep'); } if (Rc.cd <= 0) { Snd.play('mission'); G.big = { text: 'GO!', col: '#76ff03', t: 1.2, small: 1 }; if (R.street && G.cars.some(k => k.type === 'cop' && !k.dead && dist2(k.x, k.y, c ? c.x : 0, c ? c.y : 0) < 900 * 900)) crime(.6, 'Street racing'); } return; }
  Rc.t += dt; if (R.duel && Rc.fin.length) return duelLost(Rc, Rc.fin[0]);
  if (!c) { Rc.out = (Rc.out || 0) + dt; if (Rc.out > 10) failMission('You left your car.'); return; } Rc.out = 0; if (c.dead) return failMission('Wrecked.');
  const cp = Rc.cps[Rc.pcp]; if (cp && dist2(c.x, c.y, cp[0], cp[1]) < 150 * 150) { Rc.pcp++; Snd.play('pickup'); if (Rc.pcp >= Rc.cps.length) raceWon(Rc, Rc.fin.length + 1); } };
function raceWon(Rc, place) { const R = Rc.R, m = G.mission, S = MS();
  m.reward = R.duel ? R.prize : place === 1 ? R.prize : place === 2 ? Math.round(R.prize * .4) : place === 3 ? Math.round(R.prize * .15) : 0;
  if (place <= 3) credAdd(Math.round(R.cred * [1, .5, .25][place - 1])); else if (R.street || R.gang) credLose(5);
  if (place === 1) { S.wins = (S.wins | 0) + 1; if (R.street) S.streetW = (S.streetW | 0) + 1; if (R.track) S.trackW = (S.trackW | 0) + 1; }
  if (R.side) { if (place === 1) { const w = Math.round(R.side * R.sideX); addCash(w); msg('💰 Your side bet paid ' + money(w), '#2ecc71'); } else msg('Your ' + money(R.side) + ' side bet is gone.', '#ff9f43'); }
  if (R.gang) { repAdd(R.gang, place === 1 ? 8 : 2); if (place === 1) msg('The ' + GANGS[R.gang].name + ' respect that. (+gang rep)', GANGS[R.gang].col); }
  if (R.pinks && place === 1) { const o = Rc.racers[0]; if (o && !o.dead) { o.missionCar = 0; o.raceCar = 0; o.streetR = 0; o.ai = { mode: 'parked' }; const nm = o.driver && o.driver.name; o.driver = null; o.owned = 1; o.persist = 1; o.legit = 1; o.wasMine = 1; const q = new Ped(o.x + 30, o.y + 10, { role: 'civ', name: nm }); q.state = 'walk'; G.peds.push(q); pedSay(q, pick(['Take it. Ugh.', 'Pinks are pinks…', 'You got lucky.'])); S.pinks = (S.pinks | 0) + 1; msg('🔑 The ' + o.d.name + ' is yours now — pink slip signed over.', '#2ecc71'); } }
  completeMission(); G.big = { text: place === 1 ? (R.duel ? 'YOU WIN!' : '1ST PLACE!') : 'FINISHED ' + ['', '1st', '2nd', '3rd', '4th', '5th', '6th'][place], col: place === 1 ? '#ffd740' : '#ff8a80', t: 3.5, sub: (m.reward ? '+' + money(m.reward) : 'No prize') + ' · ' + Rc.t.toFixed(1) + 's' }; raceEnd(); }
function duelLost(Rc, o) { const R = Rc.R, nm = (o.driver && o.driver.name) || 'They'; credLose(R.street ? 10 : 5); if (R.gang) repAdd(R.gang, 1);
  if (R.pinks) { const k = Rc.mine; if (k && !k.dead) { if (pCar() === k) exitCar(true); const i = G.cars.indexOf(k); if (i >= 0) G.cars.splice(i, 1); if (k.isRide && G.save.ride) delete G.save.ride; if (k.gid) { const L = myCars(), j = L.findIndex(r => r.id === k.gid); if (j >= 0) L.splice(j, 1); } msg('📄 You signed over the pink slip. ' + nm + ' has your ' + k.d.name + ' now.', '#ff6b6b'); } }
  failMission(nm + ' beat you to the line.'); }
{ const _re = raceEnd; raceEnd = function () { const Rc = G.race; _re(); if (!Rc) return; for (const c of Rc.racers) if (c.driver && !c.owned && !c.dead && (Rc.R.street || Rc.R.gang)) { const dir = ((Math.round(c.a / (Math.PI / 2)) % 4) + 4) % 4; makeTrafficAI(c, dir, 1); } }; }

// ---------------- the track office: races, duels, pink slips, betting ----------------
const TRACK_EVENTS = [
  { id: 't1', n: 'Novice Cup', laps: 2, fee: 300, prize: 2400, cred: 40, min: 0, field: 3, types: ['compact', 'hatch', 'sedan', 'scarab'] },
  { id: 't2', n: 'Pinewood 300', laps: 3, fee: 1000, prize: 7500, cred: 80, min: 100, field: 4, types: ['sports', 'muscle', 'rally', 'hatch'] },
  { id: 't3', n: 'Pro Series', laps: 4, fee: 3000, prize: 22000, cred: 140, min: 300, field: 5, types: ['sports', 'gt', 'coupe', 'rally'] },
  { id: 't4', n: 'Endurance 8', laps: 8, fee: 6000, prize: 45000, cred: 220, min: 700, field: 5, types: ['gt', 'super', 'coupe'], hard: .03 }];
const atTrack = () => { const K = W.track, p = pCar() || G.player; return K && !G.scene && p.x > K.X0 - 300 && p.x < K.X1 + 300 && p.y > K.Y0 - 300 && p.y < K.Y1 + 300; };
function needCar() { const c = pCar(); if (!c || c.d.boat) { toast('Bring a car — sit in it, then talk to Rosa'); return null; } if (stars() > 0) { toast('Not with the cops on you'); return null; } return c; }
function trackTab(H) { const S = MS(), c = H.col('Race day at Pinewood'), mx = maxBet();
  for (const R of TRACK_EVENTS) { const ok = S.cred >= R.min, side = Math.min(mx, R.fee * 2), sideX = Math.round((1 + R.field * .75) * 2) / 2;
    const r = H.row(c, '🏁', R.n + (ok ? '' : ' 🔒'), ok ? `${R.laps} laps · ${R.field + 1} cars · entry ${money(R.fee)} · win ${money(R.prize)} + ${R.cred} cred` : 'Needs ' + R.min + ' cred (' + rankOf(R.min) + ')', [
      H.btn('Enter', () => trackGo(R, 0, 0), 'y', !ok || !canPay(R.fee) || !!G.mission), H.btn('+ bet ' + money(side) + ' on me (' + sideX + '×)', () => trackGo(R, side, sideX), '', !ok || !canPay(R.fee + side) || !!G.mission)]); r.classList.add('pmsg'); }
  const c2 = H.col('Duels — one on one, two laps'); const dw = [500, 2000, 8000, 20000, 50000].filter(w => w <= mx);
  H.row(c2, '🤝', 'Cash duel', 'Put money down against one of the regulars. Winner takes both stakes. Max bet at your rank: ' + money(mx)).classList.add('pmsg');
  const br = H.mk('div', 'pbs'); br.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;max-width:none'; for (const w of dw) br.appendChild(H.btn(money(w), () => duelGo(w, 0), 'y', !canPay(w) || !!G.mission)); c2.appendChild(br);
  const pc = pCar(), pinkOK = pc && pc.owned && pc.legit && !pc.d.boat && !pc.missionCar;
  H.row(c2, '📄', 'Pink slips', S.cred < 300 ? 'Unlocks at 300 cred (Known name)' : !pc ? 'Sit in the car you want to put up' : !pinkOK ? 'Only a titled car you own can go on the line' : 'Your ' + pc.d.name + ' (≈' + money(mktValue(pc.type, pc.mods, pc.hp / pc.st.hp, 1)) + ') vs a car of similar value. Loser walks home.', [H.btn('Race for pinks', () => duelGo(0, 1), 'r', S.cred < 300 || !pinkOK || !!G.mission)]).classList.add('pmsg');
  H.foot.appendChild(H.mk('span', 'pnote', 'Sit in your car to enter. Payouts: 1st takes the prize, 2nd 40%, 3rd 15%. Losing a duel costs a little cred.')); }
function trackGo(R, side, sideX) { const c = needCar(); if (!c) return; if (!payAny(R.fee + side)) return; Panel.close(); const R2 = Object.assign({}, R, { track: 1, side, sideX }); const opps = []; for (let k = 0; k < R.field; k++) opps.push({ type: pick(R.types) }); startRace2(R2, trackRoute(R.laps), opps, 0); }
function duelGo(w, pinks) { const c = needCar(); if (!c) return; if (w && !payAny(w)) return; Panel.close();
  const v = mktValue(c.type, c.mods, c.hp / c.st.hp, 1), pool = Object.keys(CAR_TYPES).filter(t => { const d = CAR_TYPES[t]; return !d.boat && !d.pedal && !d.rider && !d.two && !NOMOD.has(t) && t !== 'tank' && Math.abs(Math.log((mktValue(t, {}, 1, 1) + 1) / (v + 1))) < .7; }), t = pinks ? pick(pool.length ? pool : [c.type]) : pick(['sports', 'muscle', 'rally', 'gt', 'hatch']);
  const R = { id: 'duel', n: pinks ? 'Pink slip duel' : 'Cash duel', duel: 1, track: 1, wager: w, prize: w * 2, cred: pinks ? 60 : Math.round(15 + Math.log10(Math.max(10, w)) * 8), min: Math.min(900, MS().cred), pinks };
  startRace2(R, trackRoute(2), [{ type: t }], 0); if (pinks) msg('📄 Pink slips: their ' + CAR_TYPES[t].name + ' against your ' + c.d.name + '.', '#ffd740'); }
// ---- betting on heats you watch from the stands ----
function newHeat() { const pool = RACE_NAMES.slice().sort(() => Math.random() - .5).slice(0, 4), types = ['sports', 'muscle', 'rally', 'hatch', 'gt', 'coupe'];
  const D = pool.map((nm, i) => { const type = pick(types), sk = rnd(.8, .97); return { nm, type, col: NEON[(i * 3 + rint(0, 7)) % NEON.length], sk, sc: Math.pow(sk * CAR_TYPES[type].max, 6) }; }), tot = D.reduce((a, d) => a + d.sc, 0);
  for (const d of D) { d.p = d.sc / tot; d.odds = Math.max(1.2, Math.round(.88 / d.p * 2) / 2); } return { D, state: 'open', stake: 0, pick: -1 }; }
function betTab(H) { const B = G.bet || (G.bet = newHeat()), c = H.col(B.state === 'open' ? 'Next heat — 2 laps, place your bet' : B.state === 'run' ? 'Heat running — watch from the stands' : 'Heat over'), mx = maxBet();
  B.D.forEach((d, i) => { const r = H.row(c, '🏎', d.nm + ' · ' + CAR_TYPES[d.type].name, 'Pays ' + d.odds + '× · ' + (d.p > .35 ? 'favourite' : d.p > .22 ? 'in with a shot' : 'long shot') + (B.pick === i ? ' · YOUR PICK ' + money(B.stake) : ''), B.state === 'open' ? [H.btn(B.pick === i ? '✓ Picked' : 'Pick', () => { B.pick = i; }, B.pick === i ? 'on' : '')] : []); r.querySelector('.pe').style.color = d.col; if (B.pick === i) r.classList.add('sel'); });
  if (B.state === 'open') { const c2 = H.col('Stake'); const br = H.mk('div', 'pbs'); br.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;max-width:none'; for (const w of [100, 500, 2000, 8000, 20000].filter(w => w <= mx)) br.appendChild(H.btn(money(w), () => { B.stake = w; }, B.stake === w ? 'on' : '', !canPay(w))); c2.appendChild(br);
    H.row(c2, '🎟', B.pick < 0 ? 'Pick a driver' : B.stake ? money(B.stake) + ' on ' + B.D[B.pick].nm + ' → pays ' + money(Math.round(B.stake * B.D[B.pick].odds)) : 'Pick a stake', 'Max bet at your rank: ' + money(mx), [H.btn('Place bet & start', () => { if (!payAny(B.stake)) return; heatStart(B); Panel.close(); }, 'y', B.pick < 0 || !B.stake || !canPay(B.stake) || !!G.race)]).classList.add('pmsg'); }
  else if (B.state === 'done') H.row(H.col('Result'), '🏆', 'Winner: ' + B.D[B.win].nm, B.paid ? 'You won ' + money(B.paid) : 'Better luck next time', [H.btn('Next heat', () => { G.bet = newHeat(); }, 'y')]); }
function heatStart(B) { const K = W.track, rt = trackRoute(2); B.cps = rt.cps; B.state = 'run'; B.cd = 3.5; B.t = 0; B.fin = []; B.cars = [];
  B.D.forEach((d, k) => { const x = K.sx - 60 - Math.floor(k / 2) * 80, y = K.yb + (k % 2 ? -22 : 22); const c = new Car(d.type, x, y, 0); applyMods(c, Object.assign(RICE(), { eng: 2, tur: 1 })); c.color = d.col; c.mods.p = d.col; c.driver = { role: 'civ', name: d.nm }; c.ai = { mode: 'race', bet: 1, cp: 0, skill: d.sk, off: rnd(-12, 12) }; c.missionCar = 1; c.raceCar = 1; c.betIdx = k; G.cars.push(c); B.cars.push(c); });
  G.cars = G.cars.filter(c => c.raceCar || c === pCar() || !(c.x > K.X0 && c.x < K.X1 && c.y > K.yb - 60 && c.y < K.yb + 60)); msg('🏁 Heat starting — ' + money(B.stake) + ' on ' + B.D[B.pick].nm, '#ffd740'); }
function betAI(c, dt) { const B = G.bet; if (!B || B.state !== 'run') { c.ai = { mode: 'parked' }; return; } if (B.cd > 0) { c.throttle = 0; c.brake = 1; return; } const ai = c.ai, cp = B.cps[ai.cp];
  if (!cp) { if (!B.fin.includes(c)) B.fin.push(c); c.throttle = 0; c.brake = 1; return; } const nx = B.cps[ai.cp + 1], d = dist(c.x, c.y, cp[0], cp[1]); if (d < 130) { ai.cp++; return; }
  let des = c.st.max * ai.skill; if (nx && d < 260) { const a1 = Math.atan2(cp[1] - c.y, cp[0] - c.x), a2 = Math.atan2(nx[1] - cp[1], nx[0] - cp[0]); if (Math.abs(angDiff(a1, a2)) > .9) des = Math.min(des, 260 + d * .9); } driveToward(c, cp[0] + ai.off, cp[1] + ai.off, des, dt); }
{ const _ra = raceAI; raceAI = function (c, dt) { if (c.ai && c.ai.bet) return betAI(c, dt); return _ra(c, dt); }; }
function heatTick(dt) { const B = G.bet; if (!B || B.state !== 'run') return; if (B.cd > 0) { B.cd -= dt; if (B.cd <= 0 && atTrack()) Snd.play('mission'); return; } B.t += dt;
  const p = pCar() || G.player, far = !atTrack(); let win = -1;
  if (B.fin.length) win = B.fin[0].betIdx; else if (far || B.t > 150) { if (far) { let r = Math.random(); for (let i = 0; i < B.D.length; i++) { r -= B.D[i].p; if (r <= 0) { win = i; break; } } if (win < 0) win = 0; } else { let best = null; for (const c of B.cars) { const k = c.ai.cp * 1e6 - (B.cps[c.ai.cp] ? dist(c.x, c.y, B.cps[c.ai.cp][0], B.cps[c.ai.cp][1]) : 0); if (!best || k > best.k) best = { k, c }; } win = best ? best.c.betIdx : 0; } }
  if (win < 0) return; B.state = 'done'; B.win = win; const d = B.D[win]; if (win === B.pick) { B.paid = Math.round(B.stake * d.odds); addCash(B.paid); Snd.play('cash'); G.big = { text: 'BET WON', col: '#2ecc71', t: 3, sub: d.nm + ' won · +' + money(B.paid), small: 1 }; } else { B.paid = 0; msg('🏁 ' + d.nm + ' won the heat. Your ' + money(B.stake) + ' on ' + B.D[B.pick].nm + ' is gone.', '#ff9f43'); }
  for (const c of B.cars) { c.missionCar = 0; c.raceCar = 0; c.raceDone = 1; c.ai = { mode: 'parked' }; } }

// ---------------- street races: honk at a racer to challenge them ----------------
{ const _mt = makeTrafficAI; makeTrafficAI = function (c, dir, lane) { _mt(c, dir, lane); if (c.streetR === undefined && !c.owned && !c.beater && c.driver && c.driver.role !== 'cop' && c.mods && (c.mods.eng || c.mods.tur || c.mods.nos) && !c.d.boat && !NOMOD.has(c.type)) c.streetR = Math.random() < (meetOn() ? .55 : .18) ? 1 : 0; }; }
{ const _sp = Snd.play; Snd.play = function (n, x, y) { if (n === 'horn' && pCar() && x === pCar().x) G.hornT = G.t; return _sp.apply(this, arguments); }; }
{ const _de = drawCarExtras; drawCarExtras = function (c) { _de(c); if (c.streetR && !c.dead && c.driver && !c.raceCar && !c.owned) { const g = ctx; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(-4 + i * 3, -3 + j * 3, 3, 3); } } }; }
function streetTick() { const pc = pCar(); if (!pc || G.mission || G.dlgOpen || G.scene || pc.d.boat || stars() > 0) return; let near = null, nd = 300 * 300;
  for (const c of G.cars) { if (!c.streetR || c.dead || c.raceCar || c.owned || !c.driver || !c.ai || c.ai.mode !== 'traffic') continue; const d = dist2(c.x, c.y, pc.x, pc.y); if (d < nd) { nd = d; near = c; } }
  if (near && !LIFE().srTip) { LIFE().srTip = 1; msg('🏁 Cars with a checkered flag on the roof are street racers — pull up next to one and honk to challenge them.', '#ffd740'); }
  if (near && G.hornT && G.t - G.hornT < .35 && nd < 190 * 190) { G.hornT = 0; challenge(near); } }
function challenge(o) { const pc = pCar(), S = MS(), nm = o.driver.name || (o.driver.name = pick(RACE_NAMES)), gang = o.driver.gang, base = clamp(r50(mktValue(o.type, o.mods || {}, 1, 1) * .08), 300, maxBet());
  if (gang && (G.rep[gang] | 0) <= -30) { pedSayCar(o, 'You?? Get lost.'); return; }
  const dir = ((Math.round(o.a / (Math.PI / 2)) % 4) + 4) % 4; o.ai = { mode: 'parked' }; o.throttle = 0; o.brake = 1;
  const back = () => { closeDialog(); if (!o.dead && o.driver) makeTrafficAI(o, dir, 1); o.streetR = 0; };
  const pinkOK = S.cred >= 300 && pc.owned && pc.legit && o.d && !o.d.two;
  const go = (w, pinks) => () => { closeDialog(); if (w && !payAny(w)) { back(); return; } streetGo(o, w, pinks, gang); };
  const big = Math.min(maxBet(), base * 3), opts = [{ t: '🏁 Race for ' + money(base), c: 'y', f: go(base, 0), d: !canPay(base) }]; if (big > base) opts.push({ t: '🔥 Race for ' + money(big), f: go(big, 0), d: !canPay(big) });
  say(nm + (gang ? ' · ' + GANGS[gang].name : ''), '"' + pick(['You wanna run?', 'Nice ride. Bet it\'s slow.', 'Light turns green, we go?', 'Race me. Money on it.']) + '" The ' + o.d.name + ' revs.' + (gang ? '\n\nBeat a ' + GANGS[gang].name + ' driver and they\'ll respect you.' : ''), [
  ].concat(opts, [{ t: '📄 Pink slips' + (S.cred < 300 ? ' (300 cred)' : ''), c: 'r', f: go(0, 1), d: !pinkOK },
    { t: 'Nah', f: back }])); }
function pedSayCar(c, t) { G.toast = { text: (c.driver && c.driver.name || 'Driver') + ': "' + t + '"', t: 2.5 }; }
function streetGo(o, w, pinks, gang) { const pc = pCar(); if (!pc) return; const R = { id: 'street', n: gang ? GANGS[gang].name + ' street race' : 'Street race', type: 'sprint', cps: rint(5, 9), duel: 1, street: 1, wager: w, prize: w * 2, cred: pinks ? 60 : 20 + Math.round(Math.log10(Math.max(10, w)) * 6), min: MS().cred, gang: gang || null, pinks };
  const rt = routeFrom(pc.x, pc.y, R, mulberry32((Date.now() & 0xffff) + 7)); if (rt.cps.length < 3) { toast('No good route from here'); makeTrafficAI(o, 0, 1); return; }
  o.streetR = 0; startRace2(R, rt, [{ car: o, skill: clamp(rnd(.86, .96) + MS().cred / 6000, .84, 1) }], 0); msg('🏁 ' + R.n + ': first to the flag' + (w ? ' takes ' + money(w * 2) : '') + (pinks ? ' — loser hands over the pink slip' : ''), '#ffd740'); }

// ---------------- gang-run car events ----------------
const GANG_EVENTS = [
  { g: 'kings', id: 'g_kings', n: 'Kings\' Cruise Night', d: 'oldtown', type: 'sprint', cps: 7, types: ['lowrider', 'lowrider', 'muscle'], fee: 500, prize: 4000, cred: 50, min: 0, blurb: 'Lowriders, gold rims and a sprint through Old Town.' },
  { g: 'reapers', id: 'g_reapers', n: 'Reaper Run', d: 'trailer', type: 'sprint', cps: 9, types: ['bike', 'sportbike', 'dirtbike'], fee: 800, prize: 6000, cred: 60, min: 100, blurb: 'Bikes only on their side. Back roads out of Rustwater.' },
  { g: 'vipers', id: 'g_vipers', n: 'Dockside Drags', d: 'docks', type: 'sprint', cps: 5, types: ['muscle', 'sports', 'hatch'], fee: 1000, prize: 7000, cred: 60, min: 100, blurb: 'Short, flat and fast between the warehouses.' },
  { g: 'saints', id: 'g_saints', n: 'Iron Circuit', d: 'industrial', type: 'circuit', w: 2, h: 1, laps: 2, types: ['muscle', 'pickup4', 'rally'], fee: 2000, prize: 14000, cred: 90, min: 300, blurb: 'Two laps around the Ironworks. Contact is part of it.' },
  { g: 'syndicate', id: 'g_synd', n: 'Neon Midnight Run', d: 'downtown', type: 'sprint', cps: 12, types: ['super', 'gt', 'sports'], fee: 5000, prize: 36000, cred: 150, min: 700, night: 1, blurb: 'Downtown after midnight. Supercars and big money.' }];
function gangSpot(d) { const bl = W.blocks.filter(b => b.d === d || b.d.replace(/\d+$/, '') === d); if (!bl.length) return null; const b = bl[Math.floor(bl.length / 2)], [i, j] = nearInter((b.bx + 6) * T, (b.by + 6) * T); return { x: roadCX(i), y: roadCY(j) }; }
function gangTab(H) { const S = MS(), c = H.col('Gang car events');
  for (const E of GANG_EVENTS) { const r = G.rep[E.g] | 0, hostile = r <= -30, friend = r >= 30, fee = friend ? Math.round(E.fee / 2) : E.fee, credOK = S.cred >= E.min, night = !E.night || G.tod >= 22 || G.tod < 4;
    const sub = hostile ? 'They\'d shoot you on sight — fix things with the ' + GANGS[E.g].name + ' first' : !credOK ? 'Needs ' + E.min + ' cred (' + rankOf(E.min) + ')' : E.blurb + ' Entry ' + money(fee) + (friend ? ' (friend price)' : '') + ' · win ' + money(E.prize) + ' + ' + E.cred + ' cred' + (E.night ? ' · 10pm–4am only' : '');
    const row = H.row(c, '●', E.n + ' — ' + GANGS[E.g].name, sub, [H.btn('Go', () => gangGo(E, fee), 'y', hostile || !credOK || !night || !canPay(fee) || !!G.mission)]); row.classList.add('pmsg'); row.querySelector('.pe').style.color = GANGS[E.g].col; }
  H.foot.appendChild(H.mk('span', 'pnote', 'Win a gang\'s event and they warm to you (+gang rep). Friends of a gang pay half entry. Hostile gangs won\'t let you race.')); }
function gangGo(E, fee) { const at = gangSpot(E.d); if (!at) return toast('Can\'t find their spot'); if (!pCar()) return toast('You need wheels — get in a car first'); if (!payAny(fee)) return; Panel.close();
  const R = Object.assign({}, E, { gang: E.g, at, where: DISTRICTS[E.d] ? DISTRICTS[E.d].name : E.d }), rt = routeFrom(at.x, at.y, R, mulberry32(E.id.length * 977 + G.day)), opps = [0, 1, 2].map(() => ({ type: pick(E.types) }));
  setNav({ x: rt.start[0], y: rt.start[1], name: E.n }); startRace2(R, rt, opps, 1); msg('📍 ' + E.n + ': meet the ' + GANGS[E.g].name + ' at the start line (GPS set).', GANGS[E.g].col); }

// ---------------- rep tab (replaces the old Rewards tab) ----------------
function repTab(H) { const S = MS(), c = H.col('Racing rep — ' + S.cred + ' cred · ' + rankOf(S.cred)), nx = nextRank(S.cred);
  for (const [n, nm] of RRANKS) H.row(c, S.cred >= n ? '✓' : '🔒', nm, n + ' cred' + (nm === 'Street racer' ? ' · bigger street bets' : nm === 'Known name' ? ' · pink slips, Pro Series, Iron Circuit' : nm === 'Respected' ? ' · Endurance 8, Neon Midnight Run' : nm === 'Legend' ? ' · $50k bets' : ''));
  if (nx) H.row(c, '📈', (nx[0] - S.cred) + ' cred to ' + nx[1], 'Wins ' + (S.wins | 0) + ' · street wins ' + (S.streetW | 0) + ' · pink slips won ' + (S.pinks | 0));
  c.appendChild(H.mk('div', 'ptitle', 'Unlocks')); for (const [n, d] of MREWARDS) { const got = S.claimed[n], can = S.cred >= n; H.row(c, got ? '✓' : can ? '🎁' : '🔒', d, got ? 'Claimed' : can ? 'Ready to claim' : n + ' cred', [H.btn(got ? 'Claimed' : 'Claim', () => meetClaim(n), 'y', got || !can)]); }
  const c2 = H.col('Gang standing'); for (const g in GANGS) { const r = G.rep[g] | 0; H.row(c2, '●', GANGS[g].name, (r <= -30 ? 'Hostile — no races, attack on sight' : r >= 30 ? 'Friendly — half-price entry' : 'Neutral') + ' · ' + r, []).querySelector('.pe').style.color = GANGS[g].col; } }

// ---------------- one panel for the meet and the track ----------------
{ const pm = PMODES.meet; PMODES.meet = function (H) { const S = MS(), trk = !!this.opt.track; if (this.tab === 'rewards') this.tab = 'rep';
  const tabs = trk ? [['track', '🏁 Track races'], ['bet', '🎟 Betting']] : [['events', '🏁 Races'], ['jobs', '🔧 Crew jobs']]; tabs.push(['gang', '● Gang events'], ['rep', '⭐ Rep']);
  if (!this.tab || !tabs.some(t => t[0] === this.tab)) this.tab = tabs[0][0]; for (const [id, n] of tabs) H.tabBtn(id, n);
  H.title.textContent = (trk ? 'Pinewood Raceway' : 'Redline Meet') + ' — ' + rankOf(S.cred) + ' · ' + S.cred + ' cred';
  if (this.tab === 'track') return trackTab(H); if (this.tab === 'bet') return betTab(H); if (this.tab === 'gang') return gangTab(H); if (this.tab === 'rep') return repTab(H);
  const t0 = H.title.textContent; pm.call(this, Object.assign({}, H, { tabBtn() { } })); H.title.textContent = t0; }; }
{ const _tt = talkTo; talkTo = function (q) { if (q.meet && W.track && dist2(q.x, q.y, W.track.hub.x, W.track.hub.y) < 300 * 300) { closeDialog(); return Panel.open('meet', { track: 1, tab: 'track' }); } return _tt(q); }; }
// phone tab: the whole racing life at a glance
redlineTab = function (H) { const S = MS(), c = H.col('Racing — ' + rankOf(S.cred) + ' · ' + S.cred + ' cred'), nx = nextRank(S.cred);
  if (nx) H.row(c, '⭐', (nx[0] - S.cred) + ' cred to ' + nx[1], 'Wins ' + (S.wins | 0) + ' · street ' + (S.streetW | 0) + ' · pinks ' + (S.pinks | 0));
  if (W.meet) H.row(c, '🏁', 'Redline Meet', meetOn() ? 'Running now (8pm–4:30am) — races and crew jobs' : 'Kai is there all day; the crowd shows up at 8pm', [H.btn('GPS', () => { setNav({ x: W.meet.x, y: W.meet.y, name: 'Redline Meet' }); Panel.close(); }, 'y')]);
  if (W.track) H.row(c, '🏟', 'Pinewood Raceway', 'Track races, duels, pink slips and betting · Rosa runs the office', [H.btn('GPS', () => { setNav({ x: W.track.hub.x, y: W.track.hub.y, name: 'Pinewood Raceway' }); Panel.close(); }, 'y')]);
  H.row(c, '🚦', 'Street races', 'Cars with a checkered flag on the roof will race you — pull up and honk. More of them out at night.');
  const c2 = H.col('Gang events'); for (const E of GANG_EVENTS) { const r = G.rep[E.g] | 0; H.row(c2, '●', E.n, r <= -30 ? 'Hostile — no entry' : S.cred < E.min ? 'Needs ' + E.min + ' cred' : 'Open · win ' + money(E.prize) + (E.night ? ' · 10pm–4am' : ''), [H.btn('Details', () => Panel.open('meet', { tab: 'gang' }))]).querySelector('.pe').style.color = GANGS[E.g].col; } };
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') { if ((G.srT = (G.srT || 0) - dt) <= 0) { G.srT = .1; streetTick(); } heatTick(dt); } }; }
