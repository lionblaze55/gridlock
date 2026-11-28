// ================= THE FAR SHORE: the map grows east and south across a channel (generated last, so existing land, property IDs and saves never change) =================
for (const [k, as, name] of [['prairie4', 'farmland', 'Seabreeze Plains'], ['estate4', 'farmland', 'Windward Farms'], ['woods4', 'woods', 'Cedar Hollow'], ['lake4', 'lake', 'Mirror Lake'], ['orchard4', 'orchard', 'Cider Hills'],
  ['quarry4', 'quarry', 'Granite Bluff'], ['town6', 'town', 'Port Calloway'], ['suburbs3', 'suburbs', 'Maple Grove'], ['coast4', 'coast', 'Driftwood Beach'], ['narrows', 'coast', 'The Narrows'], ['downs', 'farmland', 'Varro Downs'], ['links', 'farmland', 'Varro Links']]) DISTRICTS[k] = Object.assign({}, DISTRICTS[as], { name, as });
for (const k of ['prairie4', 'estate4', 'woods4', 'lake4', 'orchard4', 'quarry4', 'coast4', 'narrows', 'downs', 'links']) RURALSET.add(k);
const FARCODE = { P: 'prairie4', E: 'estate4', W: 'woods4', L: 'lake4', O: 'orchard4', Q: 'quarry4', K: 'town6', D: 'coast4', X: 'narrows', H: 'downs', G: 'links' };
// east strip: columns 27–28 for rows 0–25; south strip: rows 27–28 for columns 0–28; column/row 26 is the channel, 29 the beach
const FAR_E = ['WW', 'WW', 'PP', 'KK', 'KK', 'PP', 'EE', 'EE', 'LL', 'LL', 'OO', 'OO', 'PP', 'WW', 'WW', 'PP', 'EE', 'EE', 'PP', 'QQ', 'PP', 'WW', 'LL', 'LL', 'PP', 'PP'];
const FAR_S = ['PPWWEEPPPEEKKGGGWLLPPEEPPOOPP', 'PPWWEEPPPEEKKGGGWLLPPEEPPOOPP'];
const BR_ROWS = [3, 9, 15, 21], BR_COLS = [3, 9, 15, 21];
function farCh(bi, bj) { if (bi >= 29 || bj >= 29) return 'D'; if ((bi === 26 && bj <= 26) || (bj === 26 && bi <= 26)) return 'X'; if (bj >= 27) return FAR_S[bj - 27][bi] || 'P'; if (bi >= 27) return bj <= 25 ? FAR_E[bj][bi - 27] : 'P'; return 'P'; }
const inChan = (x, y) => (x >= NOLD && x < NOLD + 12 && y < NOLD + 12) || (y >= NOLD && y < NOLD + 12 && x < NOLD + 12);
function farGen() { const B = W._bc; if (!B) return; W.nOld = W.buildings.length; const n0 = W.nOld, { setT, rng, rr } = B;
  // 1. ground: channel water with bridges, then a fresh road grid on the far shore
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { if (x < NOLD && y < NOLD) continue;
    if (inChan(x, y)) { const br = (x >= NOLD && x < NOLD + 12 && isRoadRow(y) && BR_ROWS.includes(Math.floor(y / RSP))) || (y >= NOLD && y < NOLD + 12 && isRoadCol(x) && BR_COLS.includes(Math.floor(x / RSP))); setT(x, y, br ? TILE.ROAD : TILE.WATER); continue; }
    setT(x, y, isRoadCol(x) || isRoadRow(y) ? TILE.ROAD : TILE.GRASS); }
  // 2. big pieces of land (racetrack, golf course, estates, forests, lakes) and single blocks
  const used = new Set(), megas = [], isNew = (bi, bj) => bi >= NBX || bj >= NBX;
  const tryRect = (bi, bj, w, h, ch) => { for (let y = bj; y < bj + h; y++) for (let x = bi; x < bi + w; x++) if (!isNew(x, y) || x > 29 || y > 29 || farCh(x, y) !== ch || used.has(x + ',' + y)) return false; for (let y = bj; y < bj + h; y++) for (let x = bi; x < bi + w; x++) used.add(x + ',' + y); megas.push({ bi, bj, w, h, ch }); return true; };
  for (let bj = 0; bj < 30; bj++) for (let bi = 0; bi < 30; bi++) { if (!isNew(bi, bj)) continue; const c = farCh(bi, bj); if (c === 'H' || c === 'G') tryRect(bi, bj, 3, 2, c); else if (c === 'E') tryRect(bi, bj, 2, 2, 'E'); }
  for (let bj = 0; bj < 30; bj++) for (let bi = 0; bi < 30; bi++) { if (!isNew(bi, bj)) continue; const c = farCh(bi, bj); if ('PWL'.includes(c) && !used.has(bi + ',' + bj)) tryRect(bi, bj, 2, 2, c); }
  for (const M of megas) { M.x0 = M.bi * RSP + 4; M.y0 = M.bj * RSP + 4; M.x1 = (M.bi + M.w) * RSP; M.y1 = (M.bj + M.h) * RSP;
    for (let y = M.y0; y < M.y1; y++) for (let x = M.x0; x < M.x1; x++) setT(x, y, TILE.GRASS);
    for (let j = M.bj + 1; j < M.bj + M.h; j++) for (let i = M.bi + 1; i < M.bi + M.w; i++) W.nodeOff.add(j * NR + i);
    for (let j = M.bj; j < M.bj + M.h; j++) for (let i = M.bi; i < M.bi + M.w; i++) W.blocks.push({ bi: i, bj: j, bx: i * RSP + 4, by: j * RSP + 4, d: FARCODE[M.ch], li: i, mega: M }); }
  const singles = [];
  for (let bj = 0; bj < 30; bj++) for (let bi = 0; bi < 30; bi++) { if (!isNew(bi, bj) || used.has(bi + ',' + bj)) continue; const c = farCh(bi, bj), k = FARCODE[c]; if (c === 'X') continue;
    if ('PWL'.includes(c)) { const M = { bi, bj, w: 1, h: 1, ch: c, x0: bi * RSP + 4, y0: bj * RSP + 4, x1: bi * RSP + 16, y1: bj * RSP + 16 }; W.blocks.push({ bi, bj, bx: M.x0, by: M.y0, d: k, li: bi, mega: M }); singles.push(M); continue; }
    const nb = W.buildings.length; GENALIAS = 1; genBlock(bi, bj, rng, rr); GENALIAS = 0; W.blocks[W.blocks.length - 1].d = k; for (let i = nb; i < W.buildings.length; i++) { const b = W.buildings[i]; b.d = k; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) W.solid[idx(x, y)] = 1; } }
  const sv = {}; for (const k in FARCODE) { sv[k] = EXTCODE[k]; EXTCODE[k] = FARCODE[k]; }
  try { for (const M of megas) { if (M.ch === 'E') B.estate(M, 0); else if (M.ch === 'H') downsGen(M); else if (M.ch === 'G') linksGen(M); else if (M.ch === 'P') B.prairie(M); else if (M.ch === 'W') B.forest(M); else B.lake(M); }
    for (const M of singles) { if (M.ch === 'P') B.prairie(M); else if (M.ch === 'W') B.forest(M); else B.lake(M); } } finally { for (const k in sv) { if (sv[k] === undefined) delete EXTCODE[k]; else EXTCODE[k] = sv[k]; } }
  assignDoors(rng, n0);
  // 3. traffic nodes, markings, names
  for (let j = 0; j < NR; j++) for (let i = 0; i < NR; i++) { const x = i * RSP + 2, y = j * RSP + 2; if (x < NOLD && y < NOLD) continue; const k = j * NR + i; if (inMap(x, y) && W.tile[idx(x, y)] === TILE.ROAD && !megas.some(M => i > M.bi && i < M.bi + M.w && j > M.bj && j < M.bj + M.h)) W.nodeOff.delete(k); else W.nodeOff.add(k); }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x >= NOLD || y >= NOLD) markTile(x, y);
  for (const [n, bi, bj] of [['THE FAR SHORE', 27.5, 13], ['THE NARROWS', 26.5, 6], ['Port Calloway', 27.5, 3.6], ['Cedar Hollow', 27.5, 13.6], ['Mirror Lake', 27.5, 22.7], ['Seabreeze Plains', 1, 27.6], ['Windward Farms', 9.5, 27.2], ['Cider Hills', 25.5, 27.5], ['Driftwood Beach', 14, 29.2]])
    W.labels.push({ n, x: bi * RSP + 10, y: bj * RSP + 10, big: n === n.toUpperCase() ? 1 : 0 });
  const cand = []; for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if ((x >= NOLD || y >= NOLD) && (W.tile[idx(x, y)] === TILE.DIRT || W.tile[idx(x, y)] === TILE.PATH) && !W.solid[idx(x, y)]) cand.push([x, y]);
  for (let i = 0; i < 10 && cand.length; i++) { const [x, y] = cand.splice(Math.floor(rng() * cand.length), 1)[0]; W.pickupSpots.push({ x: (x + .5) * T, y: (y + .5) * T, t: ['health', 'cash', 'armor', 'pistol'][i % 4], next: 0, alive: true }); } }
// ---------- Maple Grove: farm blocks just south of the city become a suburb (old buildings are retired, never renumbered) ----------
const SUBSET = new Set(['8,12', '9,12', '10,12', '11,12', '13,12', '14,12', '15,12', '11,13', '12,13', '13,13']);
{ const _df = districtFor; districtFor = function (bi, bj) { if (W.subOn && SUBSET.has(bi + ',' + bj)) return GENALIAS ? 'suburbs' : 'suburbs3'; return _df(bi, bj); }; }
// a suburban block: sidewalk ring, four family homes with driveways, back yards with fences, trees and the odd pool — or a little park
function suburbBlock(bi, bj, rng, park) { const B = W._bc, x0 = bi * RSP + 4, y0 = bj * RSP + 4, walls = [8, 9, 12, 13, 3, 7], pk = a => a[Math.floor(rng() * a.length)];
  for (let y = y0; y < y0 + 12; y++) for (let x = x0; x < x0 + 12; x++) B.setT(x, y, x === x0 || x === x0 + 11 || y === y0 || y === y0 + 11 ? TILE.WALK : TILE.GRASS);
  W.blocks.push({ bi, bj, bx: x0, by: y0, d: 'suburbs3', li: bi });
  if (park) { B.pond(x0 + 6, y0 + 6, 2.2, 1.6); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU; B.P(i % 3 ? 'tree' : 'bush', x0 + 6 + Math.cos(a) * 4.2, y0 + 6 + Math.sin(a) * 4.2); } W.labels.push({ n: 'Maple Grove Park', x: x0 + 6, y: y0 + 10.3 }); return; }
  for (const [hx, hy, face] of [[x0 + 1, y0 + 2, 0], [x0 + 6, y0 + 2, 0], [x0 + 1, y0 + 7, 2], [x0 + 6, y0 + 7, 2]]) {
    const b = B.mkB(hx, hy, 4, 3, pk(walls), 1, 'home', '', 'suburbs3', face); if (!b) continue; b.d = 'suburbs3'; b.sub2 = 1;
    const dx = hx + 4, ys = face ? [hy + 1, hy + 2, hy + 3] : [y0 + 1, y0 + 2, y0 + 3, y0 + 4]; for (const y of ys) B.setT(dx, y, TILE.LOT);
    if (rng() < .7) W.parkSpots.push({ x: (dx + .5) * T, y: (face ? hy + 2.6 : y0 + 2.4) * T, a: face ? Math.PI / 2 : -Math.PI / 2, type: pk(['sedan', 'hatch', 'pickup', 'van', 'suv', 'sedan']) });
    if (rng() < .4) W.pools.push({ x: (hx + .4) * T, y: (y0 + 5.15) * T, w: 2.6 * T, h: 1.5 * T }); else B.P(pk(['tree', 'bush', 'tree']), hx + 1.5 + rng(), y0 + 5.8);
    B.P('bush', hx + .4, face ? hy + 3.5 : hy - .5); }
  for (let x = x0 + 1; x < x0 + 11; x++) B.P('fence', x + .5, y0 + 6.5); }
function suburbsGen() { const B = W._bc; if (!B) return; const n0 = W.buildings.length, rng = mulberry32(2718), rr = (a, b) => a + Math.floor(rng() * (b - a + 1)), cells = [...SUBSET].map(k => k.split(',').map(Number));
  for (const [bi, bj] of cells) { const x0 = bi * RSP + 4, y0 = bj * RSP + 4, X0 = x0 * T, Y0 = y0 * T, X1 = (x0 + 12) * T, Y1 = (y0 + 12) * T, inB = (x, y) => x >= X0 && x < X1 && y >= Y0 && y < Y1;
    if (W.buildings.some(b => !b.gone && b.realty && b.x >= x0 - 1 && b.x < x0 + 13 && b.y >= y0 - 1 && b.y < y0 + 13)) continue;
    for (const b of W.buildings) { if (b.gone || b.x < x0 - 1 || b.x >= x0 + 13 || b.y < y0 - 1 || b.y >= y0 + 13) continue; b.gone = 1; b.door = null; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) W.bmap[idx(x, y)] = -1; }
    killProps(p => inB(p.x, p.y)); for (const k of ['parkSpots', 'lifeSpots', 'ruralSpots', 'pickupSpots', 'dealerSpots']) if (W[k]) W[k] = W[k].filter(s => !inB(s.x, s.y));
    W.blocks = W.blocks.filter(k => !(k.bi === bi && k.bj === bj)); for (let y = y0; y < y0 + 12; y++) for (let x = x0; x < x0 + 12; x++) B.setT(x, y, TILE.GRASS); }
  W.subOn = 1; W.pools = W.pools || []; let parks = 0; for (const [bi, bj] of cells) suburbBlock(bi, bj, rng, parks++ === 4);
  assignDoors(rng, n0);
  for (const [bi, bj] of cells) for (let y = bj * RSP; y < bj * RSP + 20; y++) for (let x = bi * RSP; x < bi * RSP + 20; x++) { if (!inMap(x, y)) continue; const k = idx(x, y); if (W.tile[k] === TILE.ROAD) W.rur[k] = 0; markTile(x, y); }
  W.labels.push({ n: 'Maple Grove', x: 11.5 * RSP + 6, y: 12.6 * RSP + 6, big: 1 }); }
{ const _sg = storeGen; storeGen = function () { _sg(); try { farGen(); } catch (e) { console.error('farGen', e); } try { suburbsGen(); } catch (e) { console.error('suburbsGen', e); } }; }

// ================= VARRO DOWNS: a real horse racetrack =================
const HNAMES = ['Dust Devil', 'Velvet Thunder', 'Neon Gambler', 'Copper Kettle', 'Lucky Strike', 'Midnight Ledger', 'Silk Road', 'Second Mortgage', 'Paper Tiger', 'Sundown Kid', 'Golden Parachute', 'Big Sky Betty', 'Iron Mule', 'Hot Tip', 'Wildcat Stock', 'Offshore Account', 'Blue Chip', 'Long Odds', 'Sugar Daddy', 'Rusty Spur', 'Pocket Aces', 'Mister Tuesday', 'Quiet Money', 'Last Call'];
const SILKS = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00', '#00acc1', '#f5f5f5', '#212121', '#d81b60'], COATS = ['#6d4c41', '#8d5524', '#3e2723', '#a1887f', '#bdbdbd', '#4e342e', '#795548'];
function downsGen(M) { const B = W._bc, x0 = M.x0, y0 = M.y0, x1 = M.x1, y1 = M.y1, cx = (x0 + x1) / 2, cy = y0 + 17, rxo = 19.5, ryo = 9.4, rxi = 16, ryi = 6;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const dx = (x + .5 - cx), dy = (y + .5 - cy), o = (dx / rxo) ** 2 + (dy / ryo) ** 2, i = (dx / rxi) ** 2 + (dy / ryi) ** 2; if (o <= 1.12 && i > .86) B.setT(x, y, TILE.GRASS); }
  B.pond(cx, cy, 5, 2); for (let y = y0; y < y0 + 4; y++) for (let x = x0; x < x0 + 13; x++) B.setT(x, y, TILE.LOT);
  const club = B.mkB(Math.round(cx) - 6, y0, 12, 4, 7, 2, 'bar', 'Varro Downs Clubhouse', 'downs', 0); if (club) { club.downs = 1; club.clubhouse = 'downs'; }
  W.downs = { cx: cx * T, cy: cy * T, rx: (rxo + rxi) / 2 * T, ry: (ryo + ryi) / 2 * T, rxo: rxo * T, ryo: ryo * T, rxi: rxi * T, ryi: ryi * T, x0: x0 * T, y0: y0 * T, x1: x1 * T, y1: y1 * T, club, seatY0: (y0 + 4.3) * T, seatY1: (cy - ryo - .15) * T, seatX0: (cx - 11) * T, seatX1: (cx + 11) * T, tote: { x: (x0 + 14.5) * T, y: (y0 + 5.2) * T } };
  for (let i = 0; i < 6; i++) W.parkSpots.push({ x: (x0 + 1.5 + i * 2) * T, y: (y0 + 2) * T, a: Math.PI / 2 });
  const D = W.downs; for (let i = 0; i < 16; i++) { const sx = D.seatX0 + 40 + (i % 8) * ((D.seatX1 - D.seatX0 - 80) / 7) + (i >= 8 ? 30 : 0), sy = D.seatY0 + 24 + (i >= 8 ? 44 : 0); W.lifeSpots.push({ x: sx, y: sy, kind: 'crowd', face: [sx, sy + 200] }); }
  W.lifeSpots.push({ x: D.tote.x, y: D.tote.y + 40, kind: 'npc', role: 'civ', name: 'Tote window', tote: 1 });
  for (const [hx, hy] of [[x0 + 1.5, y1 - 2], [x0 + 2.5, y1 - 2], [x1 - 2, y1 - 2], [x1 - 2, y0 + 6]]) B.P('hay', hx, hy);
  W.labels.push({ n: 'Varro Downs', x: cx, y: y1 - 1.2, big: 1 }); }
// the arc-length table of the racing line, so horses run at true speed round the bends
function hrLine() { const D = W.downs; if (D.tab) return D.tab; const n = 720, L = [0]; let px = D.cx, py = D.cy - D.ry, tot = 0; for (let i = 1; i <= n; i++) { const th = -Math.PI / 2 - i / n * TAU, x = D.cx + Math.cos(th) * D.rx, y = D.cy + Math.sin(th) * D.ry; tot += Math.hypot(x - px, y - py); L.push(tot); px = x; py = y; } D.per = tot; return D.tab = L; }
function hrPos(s, lane) { const D = W.downs, L = hrLine(), per = D.per, u = ((s % per) + per) % per; let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < u) lo = m; else hi = m; }
  const f = (u - L[lo]) / Math.max(1e-6, L[hi] - L[lo]), th = -Math.PI / 2 - (lo + f) / (L.length - 1) * TAU, rx = D.rx + lane, ry = D.ry + lane * (D.ry / D.rx);
  return { x: D.cx + Math.cos(th) * rx, y: D.cy + Math.sin(th) * ry, a: Math.atan2(-Math.cos(th) * ry, Math.sin(th) * rx) }; }
// ---------- race schedule: 90s betting, 10s to post, the race, 12s of results ----------
const HR = { bet: 90, post: 10, show: 12, laps: 2, max: 2500, perRace: 2 };
const hrTickets = () => G.hrTk || (G.hrTk = []);
function hrNew(id) { const r = mulberry32(id * 7919 + 13), pool = HNAMES.slice(), hs = [];
  for (let i = 0; i < 6; i++) { const n = pool.splice(Math.floor(r() * pool.length), 1)[0], rating = (r() + r() + r()) / 3 * 2 - 1; hs.push({ n, num: i + 1, rating, silk: SILKS[(id * 3 + i * 7) % SILKS.length], coat: COATS[Math.floor(r() * COATS.length)], form: [1, 2, 3, 4, 5, 6].map(() => 1 + Math.floor(r() * 6)).slice(0, 3).join('-'), s: 0, v: 0, lane: i * 22 - 55, fin: 0 }); }
  const ex = hs.map(h => Math.exp(h.rating * 2.1)), S = ex.reduce((a, b) => a + b, 0); hs.forEach((h, i) => { h.p = ex[i] / S; h.odds = Math.max(1.4, Math.round(1 / h.p * .85 * 10) / 10); h.place = Math.max(1.1, Math.round((1 + (h.odds - 1) * .38) * 10) / 10); });
  return { id, hs, t0: G.t, phase: 'bet', order: [], fix: null, said: {} }; }
function hrRace() { if (!W.downs) return null; if (!G.hr) G.hr = hrNew((G.hrId = (G.hrId || 0) + 1)); return G.hr; }
function hrTick(dt) { const R = hrRace(); if (!R) return; const D = W.downs, e = G.t - R.t0, near = !G.scene && dist2(G.player.x, G.player.y, D.cx, D.cy) < 2600 * 2600, say = (k, t) => { if (!R.said[k] && near) { R.said[k] = 1; msg('🏇 ' + t, '#ffcc80'); } };
  if (R.phase === 'bet' && e > HR.bet) { R.phase = 'post'; say('post', 'Race ' + R.id + ': the horses are going into the gate.'); }
  if (R.phase === 'post' && e > HR.bet + HR.post) { R.phase = 'run'; R.tr = G.t; say('off', 'And they\'re off in race ' + R.id + '!'); if (near) Snd.play('beep'); const r = mulberry32(R.id * 31 + (R.fix ? R.fix.h : 0)); R.rng = r;
    // a "fixed" race: the tipped horse gets help most of the time
    if (R.fix) { R.fixOn = r() < .6; } }
  if (R.phase === 'run') { const total = HR.laps * D.per, r = R.rng;
    for (const h of R.hs) { if (h.fin) continue; if (!h.segT || G.t > h.segT) { h.segT = G.t + 1.2 + r() * 1.5; h.surge = (r() - .5) * 60; } const prog = h.s / total;
      let tv = 395 + h.rating * 22 + h.surge + (prog > .72 ? 18 + h.rating * 14 + r() * 26 : 0); if (R.fixOn && R.fix && h.num === R.fix.h) tv += prog > .6 ? 48 : 10; h.v += (tv - h.v) * Math.min(1, dt * 1.6); h.s += h.v * dt;
      if (h.s >= total) { h.fin = R.order.length + 1; h.s = total; R.order.push(h); } }
    const lead = R.hs.filter(h => !h.fin).sort((a, b) => b.s - a.s); if (lead.length > 1 && lead[0].s > total * .5) say('half', 'At the halfway: ' + lead[0].n + ' leads from ' + lead[1].n + '.'); if (lead.length && lead[0].s > total * .82) say('str', 'Into the final stretch — ' + lead[0].n + (lead[1] ? ' and ' + lead[1].n : '') + ' fighting for it!');
    if (R.order.length === R.hs.length) { R.phase = 'show'; R.ts = G.t; const w = R.order; say('fin', w[0].n + ' wins race ' + R.id + '! ' + w[1].n + ' second, ' + w[2].n + ' third.'); hrSettle(R); } }
  if (R.phase === 'show' && G.t - R.ts > HR.show) { (G.hrHist || (G.hrHist = [])).unshift({ id: R.id, w: R.order.slice(0, 3).map(h => '#' + h.num + ' ' + h.n), odds: R.order[0].odds }); G.hrHist.length = Math.min(G.hrHist.length, 6); G.hr = hrNew((G.hrId = R.id + 1)); } }
function hrSettle(R) { const L = hrTickets(); let won = 0, n = 0; for (const t of L.filter(t => t.race === R.id)) { n++; const h = R.hs.find(h => h.num === t.h); const hit = t.type === 'win' ? h.fin === 1 : h.fin <= 2; if (hit) { const pay = Math.round(t.stake * t.odds); won += pay; addCash(pay); } }
  G.hrTk = L.filter(t => t.race !== R.id); if (won) { Snd.play('cash'); msg('🎟 Your race ' + R.id + ' tickets paid ' + money(won) + '!', '#2ecc71'); } else if (n) msg('🎟 No luck in race ' + R.id + '. Your tickets are worthless.', '#ff8a80'); }
function hrBet(h, type, stake) { const R = hrRace(); if (!R || R.phase !== 'bet') return toast('Betting is closed for this race'); const mine = hrTickets().filter(t => t.race === R.id); if (mine.length >= HR.perRace) return toast('Two tickets per race — house rules');
  stake = Math.min(HR.max, stake); if (!payAny(stake)) return; hrTickets().push({ race: R.id, h: h.num, n: h.n, type, stake, odds: type === 'win' ? h.odds : h.place }); Snd.play('cash'); toast('Ticket: ' + money(stake) + ' to ' + (type === 'win' ? 'win' : 'place') + ' on #' + h.num); }
// ---------- drawing: rails, finish post, grandstand, tote board, starting gate, horses ----------
function drawDowns() { const D = W.downs; if (!D || G.scene || !inView(D.cx, D.cy, 3200)) return; const g = ctx, R = hrRace();
  g.save(); g.fillStyle = '#9b7653'; g.beginPath(); g.ellipse(D.cx, D.cy, D.rxo, D.ryo, 0, 0, TAU); g.ellipse(D.cx, D.cy, D.rxi, D.ryi, 0, TAU, 0, true); g.fill('evenodd');
  g.strokeStyle = 'rgba(80,55,35,.35)'; g.lineWidth = 2; for (let k = 1; k < 6; k++) { const f = k / 6; g.beginPath(); g.ellipse(D.cx, D.cy, D.rxi + (D.rxo - D.rxi) * f, D.ryi + (D.ryo - D.ryi) * f, 0, 0, TAU); g.stroke(); }
  g.lineWidth = 5; g.strokeStyle = '#fafafa'; for (const [rx, ry] of [[D.rxo, D.ryo], [D.rxi, D.ryi]]) { g.beginPath(); g.ellipse(D.cx, D.cy, rx, ry, 0, 0, TAU); g.stroke(); }
  g.fillStyle = '#e0e0e0'; for (let i = 0; i < 72; i++) { const a = i / 72 * TAU; for (const [rx, ry] of [[D.rxo, D.ryo], [D.rxi, D.ryi]]) g.fillRect(D.cx + Math.cos(a) * rx - 2, D.cy + Math.sin(a) * ry - 2, 4, 4); }
  const fy0 = D.cy - D.ryo, fy1 = D.cy - D.ryi; for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#111' : '#fff'; g.fillRect(D.cx - 4, fy0 + i * (fy1 - fy0) / 8, 8, (fy1 - fy0) / 8); } g.fillStyle = '#c62828'; g.beginPath(); g.arc(D.cx, fy0 - 10, 7, 0, TAU); g.fill();
  // grandstand: tiered seats under a roof edge
  const sx0 = D.seatX0, sx1 = D.seatX1, sy0 = D.seatY0, sy1 = D.seatY1; g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(sx0 + 6, sy0 + 6, sx1 - sx0, sy1 - sy0); g.fillStyle = '#90a4ae'; g.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0);
  const rows = 5; for (let r = 0; r < rows; r++) { const y = sy0 + 6 + r * (sy1 - sy0 - 12) / rows; g.fillStyle = r % 2 ? '#1565c0' : '#1976d2'; g.fillRect(sx0 + 8, y, sx1 - sx0 - 16, (sy1 - sy0 - 12) / rows - 4); }
  g.fillStyle = '#37474f'; g.fillRect(sx0, sy0, sx1 - sx0, 6); for (let x = sx0 + 60; x < sx1; x += 120) g.fillRect(x, sy0, 4, sy1 - sy0);
  // tote board
  const tb = D.tote, bw = 300, bh = 120, bx = tb.x - bw / 2 + 520, by = D.cy - D.ry * .35 - bh / 2; g.fillStyle = '#263238'; g.fillRect(bx - 8, by - 8, bw + 16, bh + 16); g.fillStyle = '#0b0f14'; g.fillRect(bx, by, bw, bh); g.fillStyle = '#455a64'; g.fillRect(bx + 30, by + bh + 8, 8, 30); g.fillRect(bx + bw - 38, by + bh + 8, 8, 30);
  g.font = 'bold 16px "Courier New", monospace'; g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = '#ffeb3b';
  if (R) { const e = G.t - R.t0; g.fillText('RACE ' + R.id + '  ' + (R.phase === 'bet' ? 'POST ' + Math.max(0, Math.ceil(HR.bet - e)) + 's' : R.phase === 'post' ? 'AT THE GATE' : R.phase === 'run' ? 'RUNNING' : 'OFFICIAL'), bx + 10, by + 8);
    const list = R.phase === 'show' || R.phase === 'run' ? R.hs.slice().sort((a, b) => (a.fin || 99) - (b.fin || 99) || b.s - a.s) : R.hs; list.forEach((h, i) => { g.fillStyle = h.silk; g.fillRect(bx + 10, by + 32 + i * 14, 10, 10); g.fillStyle = '#ffeb3b'; g.fillText((R.phase === 'bet' || R.phase === 'post' ? '#' + h.num : (i + 1) + '. #' + h.num) + ' ' + h.n.slice(0, 13).toUpperCase(), bx + 26, by + 30 + i * 14); g.fillText(h.odds.toFixed(1), bx + bw - 50, by + 30 + i * 14); }); }
  g.restore();
  if (!R) return; hrLine();
  // starting gate at the line while loading
  if (R.phase === 'post' || R.phase === 'bet') { const p0 = hrPos(0, -70), p1 = hrPos(0, 70); g.save(); g.strokeStyle = '#2e7d32'; g.lineWidth = 10; g.beginPath(); g.moveTo(p0.x, p0.y); g.lineTo(p1.x, p1.y); g.stroke(); g.restore(); }
  for (const h of R.hs) { const s = R.phase === 'bet' ? -40 - h.num * 6 : R.phase === 'post' ? -24 : h.s, p = hrPos(s, h.lane); if (!inView(p.x, p.y, 60)) continue; drawHorse(p.x, p.y, p.a, h, R.phase === 'run' && !h.fin ? h.v : R.phase === 'show' && h.fin ? 60 : 0); } }
function drawHorse(x, y, a, h, v) { const g = ctx, gal = v > 30, ph = G.t * (gal ? v / 18 : 4) + h.num, bob = gal ? Math.sin(ph * 2) * 1.5 : 0;
  g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(3, 4, 20, 8, 0, 0, TAU); g.fill();
  g.strokeStyle = shade(h.coat, .6); g.lineWidth = 3; g.lineCap = 'round'; for (const [lx, sd, o] of [[10, -1, 0], [10, 1, Math.PI], [-10, -1, Math.PI / 2], [-10, 1, Math.PI * 1.5]]) { const sw = gal ? Math.sin(ph + o) * 7 : 0; g.beginPath(); g.moveTo(lx, sd * 5); g.lineTo(lx + sw, sd * 9); g.stroke(); }
  g.fillStyle = h.coat; g.beginPath(); g.ellipse(0, 0, 18, 7 + bob * .2, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(17, 0, 8, 4, 0, 0, TAU); g.fill(); g.beginPath(); g.ellipse(25, 0, 6, 3.4, 0, 0, TAU); g.fill();
  g.fillStyle = shade(h.coat, .5); g.fillRect(14, -1.5, 9, 3); g.strokeStyle = shade(h.coat, .45); g.lineWidth = 3.5; g.beginPath(); g.moveTo(-17, 0); g.quadraticCurveTo(-25, gal ? Math.sin(ph) * 4 : 2, -29, gal ? Math.sin(ph * .8) * 5 : 4); g.stroke();
  g.fillStyle = '#fff'; g.fillRect(-6, -8, 10, 16); g.fillStyle = h.silk; g.fillRect(-5, -7, 8, 14); g.fillStyle = h.silk === '#f5f5f5' ? '#111' : '#fff'; g.font = 'bold 8px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(h.num, -1, 0);
  g.fillStyle = h.silk; g.beginPath(); g.ellipse(3, 0, 5, 4.5, 0, 0, TAU); g.fill(); g.fillStyle = '#222'; g.beginPath(); g.arc(7, 0, 3, 0, TAU); g.fill(); g.restore(); }
{ const _dg = drawGaragePads; drawGaragePads = function () { _dg(); drawDowns(); if (G.scene || !W.pools) return; const g = ctx; for (const p of W.pools) { if (!inView(p.x + p.w / 2, p.y + p.h / 2, 200)) continue; g.fillStyle = '#e0e0e0'; rr(g, p.x - 6, p.y - 6, p.w + 12, p.h + 12, 10); g.fill(); g.fillStyle = '#29b6f6'; rr(g, p.x, p.y, p.w, p.h, 8); g.fill(); g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 2; const o = Math.sin(G.t * 1.5) * 6; g.beginPath(); g.moveTo(p.x + 14 + o, p.y + 16); g.lineTo(p.x + 40 + o, p.y + 12); g.moveTo(p.x + p.w - 50 - o, p.y + p.h - 18); g.lineTo(p.x + p.w - 22 - o, p.y + p.h - 22); g.stroke(); } }; }
// ---------- betting at the tote window (outside) or inside the clubhouse ----------
const STAKES = [100, 250, 500, 1000, 2500];
PMODES.downs = function (H) { const P = this, R = hrRace(); H.title.textContent = '🏇 Varro Downs — Tote'; if (!R) return H.empty(H.col('Closed'), 'No races today.');
  const e = G.t - R.t0, st = P.stake || (P.stake = 500), open = R.phase === 'bet', c = H.col('Race ' + R.id + ' · ' + (open ? 'betting closes in ' + Math.max(0, Math.ceil(HR.bet - e)) + 's' : R.phase === 'post' ? 'at the gate — betting closed' : R.phase === 'run' ? 'running!' : 'official result'));
  const mine = hrTickets().filter(t => t.race === R.id), full = mine.length >= HR.perRace;
  for (const h of R.hs) { const r = H.row(c, '', '#' + h.num + ' ' + h.n, 'Form ' + h.form + ' · win ' + h.odds.toFixed(1) + '× · place ' + h.place.toFixed(1) + '×' + (h.fin ? ' · finished ' + h.fin + (h.fin === 1 ? 'st' : h.fin === 2 ? 'nd' : h.fin === 3 ? 'rd' : 'th') : ''), [H.btn('Win', () => hrBet(h, 'win', st), 'y', !open || full || !canPay(st)), H.btn('Place', () => hrBet(h, 'place', st), '', !open || full || !canPay(st))]);
    const sw = r.querySelector('.pe'); sw.textContent = ''; const cv2 = document.createElement('canvas'); cv2.width = cv2.height = 40; const g2 = cv2.getContext('2d'); g2.fillStyle = h.silk; g2.fillRect(6, 6, 28, 28); g2.fillStyle = h.silk === '#f5f5f5' ? '#111' : '#fff'; g2.font = 'bold 18px Rubik, sans-serif'; g2.textAlign = 'center'; g2.textBaseline = 'middle'; g2.fillText(h.num, 20, 21); cv2.style.width = cv2.style.height = '34px'; sw.appendChild(cv2); }
  const c2 = H.col('Stake & tickets'), bar = H.mk('div', 'gchips'); for (const s of STAKES) { const b = H.mk('button', s === st ? 'on' : '', money(s)); b.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.stake = s; Panel.render(); }; bar.appendChild(b); } c2.appendChild(bar);
  if (!hrTickets().length) H.empty(c2, 'No tickets. Pick a stake, then Win (must finish 1st) or Place (1st or 2nd). Two tickets per race, ' + money(HR.max) + ' max each.');
  for (const t of hrTickets()) H.row(c2, '🎟', money(t.stake) + ' to ' + t.type + ' — #' + t.h + ' ' + t.n, 'Race ' + t.race + ' · pays ' + money(Math.round(t.stake * t.odds)) + ' (' + t.odds.toFixed(1) + '×)');
  const tip = G.dealTip && G.dealTip.race === R.id ? G.dealTip : null; if (tip) H.row(c2, '🤫', 'Your tip: #' + tip.h + ' ' + R.hs.find(h => h.num === tip.h).n, 'The member swears it\'s fixed. Nothing\'s certain at the track.').classList.add('pmsg');
  const c3 = H.col('Recent results'); if (!(G.hrHist || []).length) H.empty(c3, 'First race of the day.'); for (const r of G.hrHist || []) H.row(c3, '🏁', 'Race ' + r.id + ': ' + r.w[0], '2nd ' + r.w[1] + ' · 3rd ' + r.w[2] + ' · winner paid ' + r.odds.toFixed(1) + '×');
  H.foot.appendChild(H.mk('span', 'pnote', 'The house keeps about 15% of every pool — over time the tote wins. A good tip is the only edge.')); };
{ const _m2 = makeSpotPed2; makeSpotPed2 = function (s) { if (s.tote) { const q = new Ped(s.x, s.y, { role: 'civ', name: s.name }); q.state = 'idle'; q.still = 1; q.home = [s.x, s.y]; q.a = -Math.PI / 2; q.tote = 1; return q; } return _m2(s); }; }
{ const _tt = talkTo; talkTo = function (q) { if (q.tote) { closeDialog(); return Panel.open('downs'); } return _tt(q); }; }
IT.tote = { s: 1, act: 'Bet on the races' };
{ const _eq = enterBuildingQ; enterBuildingQ = function (b) { _eq(b); const s = G.scene; if (s && s.b === b && b.downs && !s.items.some(i => i.t === 'tote')) s.items.push({ t: 'tote', x: s.w - 2.4, y: 3.2, w: 1.6, h: .6, used: 0, small: 1 }); }; }
{ const _ui = useItem; useItem = function (it) { if (it.t === 'tote') return Panel.open('downs'); return _ui(it); }; }
{ const _di = drawItem; drawItem = function (it, s) { if (it.t !== 'tote') return _di(it, s); const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 5, w, h); g.fillStyle = '#4e342e'; g.fillRect(x, y, w, h); g.fillStyle = '#0b0f14'; g.fillRect(x + 6, y + 4, w - 12, h * .5); g.fillStyle = '#ffeb3b'; g.font = 'bold 11px "Courier New", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; const R = hrRace(); g.fillText(R ? 'RACE ' + R.id + ' ' + R.phase.toUpperCase() : 'TOTE', x + w / 2, y + h * .27); g.fillStyle = '#c0a060'; g.fillRect(x + 8, y + h * .65, w - 16, 4); }; }
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(); if (W.downs && W.downs.club && W.downs.club.door) o.push({ x: W.downs.club.door.x, y: W.downs.club.door.y, c: '#ffcc80', ic: '🏇', r: 6, n: 'Varro Downs', pr: 6 }); return o; }; }
// ticker at the top of the screen while you're at the track
{ const _rh = renderHUD; renderHUD = function () { _rh(); const R = G.hr, D = W.downs; if (!R || !D || G.scene || G.mode !== 'play' || Panel.mode || dist2(G.player.x, G.player.y, D.cx, D.cy) > 2200 * 2200) return; const sc = hudSc(), e = G.t - R.t0;
  let t = R.phase === 'bet' ? 'RACE ' + R.id + ' · post in ' + Math.max(0, Math.ceil(HR.bet - e)) + 's · bet at the tote window' : R.phase === 'post' ? 'RACE ' + R.id + ' · loading the gate' : R.phase === 'run' ? R.hs.slice().sort((a, b) => (a.fin || 99) - (b.fin || 99) || b.s - a.s).slice(0, 3).map((h, i) => (i + 1) + '. ' + h.n).join('   ') : 'OFFICIAL: ' + R.order.slice(0, 3).map((h, i) => (i + 1) + '. ' + h.n).join('  ');
  hudLine('🏇 ' + t, '#ffcc80', 12 * sc, 'rgba(20,12,4,.78)'); }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') hrTick(dt); }; }
