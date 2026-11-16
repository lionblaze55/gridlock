// ================= BIG SKY COUNTRY: the map grows east and south across Varro Sound =================
// new districts (all aliases of existing kinds, so every system knows how to treat them)
for (const [k, as, name] of [['prairie', 'farmland', 'Big Sky Prairie'], ['estate', 'farmland', 'Golden Fields'], ['ranch3', 'ranch', 'Longhorn Range'], ['woods3', 'woods', 'Elk Ridge Forest'], ['lake3', 'lake', 'Silver Lake'],
  ['orchard3', 'orchard', 'Sunset Orchards'], ['quarry3', 'quarry', 'Red Rock Quarry'], ['town3', 'town', 'Copper Springs'], ['town4', 'town', 'Eastport'], ['town5', 'town', 'Bluebell'], ['coast3', 'coast', 'Golden Sands'], ['sound', 'coast', 'Varro Sound']]) DISTRICTS[k] = Object.assign({}, DISTRICTS[as], { name, as });
for (const k of ['prairie', 'estate', 'ranch3', 'woods3', 'lake3', 'orchard3', 'quarry3', 'coast3']) RURALSET.add(k);
// 26x26 blocks; '.' is the original world (handled elsewhere); S = the Sound (water); 2x2 E = estates, 3x2 R = ranches
const EXTMAP = [
  '................SWWPPWWLLC', '................SWWPPWWLLC', '................STTEEPPWWC', '................STTEEPPWWC', '................SPPPPEEOOC', '................SWWPPEEOOC', '................SWWRRRPPLC', '................SLLRRRPPLC',
  '................SPPEEWWPPC', '................SPPEEWWQQC', '................SOOPPEEQQC', '................SOOPPEEWWC', '................SUUWWPPWWC', '................SUUPPEEPPC', '................SWWPPEELLC', '................SWWPPPPLLC',
  'SSSSSSSSSSSSSSSSSPPEEWWPPC', 'PPWWEEPPVVPPWWEEPPPEEWWPPC', 'PPWWEEPPVVPPWWEEPRRRPPLLWC', 'EELLPPRRRPPEEWWPPRRRPPLLWC', 'EELLPPRRRPPEEOOPPWWEEPPPPC', 'WWPPEEPPWWLLPOOEEWWEEPPQQC', 'WWPPEEPPWWLLPPPEEPPPPWWQQC', 'PPOOPPEEPPWWEEPPWPPPPWWLLC',
  'PPOOPPEEPPWWEEPPWOOPPWWLLC', 'CCCCCCCCCCCCCCCCCCCCCCCCCC'];
const EXTCODE = { P: 'prairie', E: 'estate', R: 'ranch3', W: 'woods3', L: 'lake3', O: 'orchard3', Q: 'quarry3', T: 'town3', U: 'town4', V: 'town5', C: 'coast3', S: 'sound' };
const BRIDGE_ROWS = [3, 8, 13], BRIDGE_COLS = [3, 9, 14];
const inSound = (x, y) => (x >= N0 && x < N0 + 16 && y < N0 + 16) || (y >= N0 && y < N0 + 16 && x < N0 + 16);
const isNewT = (x, y) => x >= N0 || y >= N0;
const ESTATE_NAMES = ['Golden Fields Estate', 'Big Sky Homestead', 'Harvest Moon Farm', 'Prairie Wind Estate', 'Clearwater Farms', 'Sundown Acres', 'Heartland Estate', 'Bluestem Farm', 'Wheatridge Estate', 'Cottonwood Farm', 'Meadowlark Estate', 'High Plains Farm', 'Amber Waves Estate', 'Stillwater Farm', 'Foxglove Farm', 'Redtail Estate', 'Willowcreek Farm', 'Juniper Hill Estate', 'Bramble Farm', 'Kestrel Estate'];
const RANCH_NAMES = ['Big Sky Ranch', 'Longhorn Ranch', 'Silver Spur Ranch', 'Thunder Mesa Ranch', 'Broken Arrow Ranch'];
function bigCountry() {
  const rng = mulberry32(5150), rr = (a, b) => a + Math.floor(rng() * (b - a + 1)), R = (a, b) => a + rng() * (b - a), pk = a => a[Math.floor(rng() * a.length)];
  const setT = (x, y, t) => { if (!inMap(x, y)) return; const k = idx(x, y); W.tile[k] = t; W.solid[k] = t === TILE.WATER || t === TILE.BLD ? 1 : 0; };
  const P = (t, x, y, ex) => addProp(t, x * T, y * T, ex);
  W.nodeOff = W.nodeOff || new Set(); const n0 = W.buildings.length;
  // 1. ground, roads, the Sound and its bridges
  for (let y = 0; y < NOLD; y++) for (let x = 0; x < NOLD; x++) { if (!isNewT(x, y)) continue; if (inSound(x, y)) { setT(x, y, TILE.WATER); continue; } setT(x, y, isRoadCol(x) || isRoadRow(y) ? TILE.ROAD : TILE.GRASS); }
  for (const j of BRIDGE_ROWS) for (let y = j * RSP; y < j * RSP + 4; y++) for (let x = N0; x < N0 + 16; x++) setT(x, y, TILE.ROAD);
  for (const i of BRIDGE_COLS) for (let x = i * RSP; x < i * RSP + 4; x++) for (let y = N0; y < N0 + 16; y++) setT(x, y, TILE.ROAD);
  W.bridges = { rows: BRIDGE_ROWS, cols: BRIDGE_COLS };
  for (let j = 0; j < NR; j++) for (let i = 0; i < NR; i++) { const x = i * RSP + 2, y = j * RSP + 2; if (inMap(x, y) && isNewT(x, y) && W.tile[idx(x, y)] !== TILE.ROAD) W.nodeOff.add(j * NR + i); }
  // 2. merge blocks into big open lots: estates (2x2), ranches (3x2), and wherever 2x2 of prairie / forest / lake line up
  const code = (bi, bj) => (EXTMAP[bj] || '')[bi] || '.', used = new Set(), megas = [];
  const tryRect = (bi, bj, w, h, ch) => { for (let y = bj; y < bj + h; y++) for (let x = bi; x < bi + w; x++) if (code(x, y) !== ch || used.has(x + ',' + y) || (x < NB0 && y < NB0)) return false; for (let y = bj; y < bj + h; y++) for (let x = bi; x < bi + w; x++) used.add(x + ',' + y); megas.push({ bi, bj, w, h, ch }); return true; };
  for (let bj = 0; bj < NBX; bj++) for (let bi = 0; bi < NBX; bi++) { const c = code(bi, bj); if (c === 'R') tryRect(bi, bj, 3, 2, 'R'); else if (c === 'E') tryRect(bi, bj, 2, 2, 'E'); }
  for (let bj = 0; bj < NBX; bj++) for (let bi = 0; bi < NBX; bi++) { const c = code(bi, bj); if ('PWL'.includes(c) && !used.has(bi + ',' + bj)) tryRect(bi, bj, 2, 2, c); }
  for (const M of megas) { M.x0 = M.bi * RSP + 4; M.y0 = M.bj * RSP + 4; M.x1 = (M.bi + M.w) * RSP; M.y1 = (M.bj + M.h) * RSP; // tiles [x0,x1) x [y0,y1)
    for (let y = M.y0; y < M.y1; y++) for (let x = M.x0; x < M.x1; x++) setT(x, y, TILE.GRASS);
    for (let j = M.bj + 1; j < M.bj + M.h; j++) for (let i = M.bi + 1; i < M.bi + M.w; i++) W.nodeOff.add(j * NR + i);
    for (let j = M.bj; j < M.bj + M.h; j++) for (let i = M.bi; i < M.bi + M.w; i++) W.blocks.push({ bi: i, bj: j, bx: i * RSP + 4, by: j * RSP + 4, d: EXTCODE[M.ch], li: i, mega: M }); }
  // 3. ordinary blocks: towns, orchards, quarries, beaches use the existing generators; prairie / forest / lake singles get the open-country treatment
  const singles = [];
  for (let bj = 0; bj < NBX; bj++) for (let bi = 0; bi < NBX; bi++) { if (bi < NB0 && bj < NB0) continue; const c = code(bi, bj); if (c === 'S' || used.has(bi + ',' + bj)) continue; const k = EXTCODE[c] || 'prairie';
    if ('PWL'.includes(c)) { const M = { bi, bj, w: 1, h: 1, ch: c, x0: bi * RSP + 4, y0: bj * RSP + 4, x1: bi * RSP + 16, y1: bj * RSP + 16 }; W.blocks.push({ bi, bj, bx: M.x0, by: M.y0, d: k, li: bi, mega: M }); singles.push(M); continue; }
    const nb = W.buildings.length; GENALIAS = 1; genBlock(bi, bj, rng, rr); GENALIAS = 0; W.blocks[W.blocks.length - 1].d = k; for (let i = nb; i < W.buildings.length; i++) { const b = W.buildings[i]; b.d = k; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) W.solid[idx(x, y)] = 1; } }
  const mkB = (x, y, w, h, wall, H, type, name, d, face) => { if (W.buildings.some(b => !b.gone && x < b.x + b.w + 1 && x + w + 1 > b.x && y < b.y + b.h + 1 && y + h + 1 > b.y)) return null; const b = makeBuilding({ x, y, w, h }, d, { H: [H, H], walls: [wall] }, rng, rr); b.type = type; b.name = name; b.d = d; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) W.solid[idx(xx, yy)] = 1; doorOn(b, face); return b; };
  const scatter = (M, n, kinds, avoid) => { for (let i = 0; i < n; i++) { const x = R(M.x0 + .8, M.x1 - .8), y = R(M.y0 + .8, M.y1 - .8), tx = Math.floor(x), ty = Math.floor(y), t = W.tile[idx(tx, ty)]; if (t !== TILE.GRASS || W.solid[idx(tx, ty)] || (avoid && avoid(tx, ty))) continue; if (propsNear(x * T, y * T, 40).length) continue; P(pk(kinds), x, y); } };
  const pond = (cx, cy, rx, ry) => { for (let y = Math.floor(cy - ry - 1); y <= cy + ry + 1; y++) for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) { const d = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2; if (d < 1) setT(x, y, TILE.WATER); else if (d < 1.45 && W.tile[idx(x, y)] === TILE.GRASS) setT(x, y, TILE.SAND); } };
  // 4. open country generators
  const prairie = M => { const A = (M.x1 - M.x0) * (M.y1 - M.y0);
    if (rng() < .45) { const rx = R(2.2, 3.6) * Math.min(M.w, 1.6), ry = R(1.8, 3) * Math.min(M.h, 1.4); pond(R(M.x0 + rx + 2, M.x1 - rx - 2), R(M.y0 + ry + 2, M.y1 - ry - 2), rx, ry); }
    for (let i = 0; i < A / 90; i++) { const x = rr(M.x0 + 1, M.x1 - 4), y = rr(M.y0 + 1, M.y1 - 4); for (let yy = y; yy < y + rr(2, 4); yy++) for (let xx = x; xx < x + rr(3, 6); xx++) if (xx < M.x1 && yy < M.y1 && W.tile[idx(xx, yy)] === TILE.GRASS && rng() < .8) setT(xx, yy, TILE.FIELD); }
    if (M.w > 1 && rng() < .7) { const y = rr(M.y0 + 3, M.y1 - 4); for (let x = M.x0; x < M.x1; x++) if (W.tile[idx(x, y)] === TILE.GRASS || W.tile[idx(x, y)] === TILE.FIELD) setT(x, y, TILE.DIRT); }
    scatter(M, A / 26, ['tree', 'tree', 'bush', 'rock', 'pine', 'log']); scatter(M, A / 140, ['hay']);
    for (let y = M.y0; y < M.y1; y++) for (let x = M.x0; x < M.x1; x++) if (W.tile[idx(x, y)] === TILE.SAND && rng() < .06 && !propsNear((x + .5) * T, (y + .5) * T, 60).length) P('fishspot', x + .5, y + .5); };
  const forest = M => { const A = (M.x1 - M.x0) * (M.y1 - M.y0), tx = rr(M.x0 + 2, M.x1 - 3);
    for (let y = M.y0; y < M.y1; y++) { const x = Math.round(tx + Math.sin(y * .35) * 2); setT(x, y, TILE.PATH); setT(x + 1, y, TILE.PATH); }
    if (rng() < .55) { const cx = rr(M.x0 + 2, M.x1 - 7), cy = rr(M.y0 + 2, M.y1 - 6); if (Math.abs(cx + 2 - tx) > 3) { const b = mkB(cx, cy, 4, 3, 13, 1, 'home', pk(['Hunting Cabin', 'Trapper\'s Cabin', 'Ranger Cabin', 'Old Cabin']), EXTCODE[M.ch], 2); if (b) { for (let y = cy + 3; y < cy + 5; y++) setT(cx + 2, y, TILE.DIRT); P('campfire', cx + 5.5, cy + 4); P('log', cx + 6.3, cy + 4.6); } } }
    scatter(M, A / 4.2, ['pine', 'pine', 'pine', 'tree', 'bush', 'rock', 'log'], (x, y) => W.tile[idx(x, y)] === TILE.PATH); };
  const lake = M => { const cx = (M.x0 + M.x1) / 2, cy = (M.y0 + M.y1) / 2, rx = (M.x1 - M.x0) / 2 - 2.2, ry = (M.y1 - M.y0) / 2 - 2.2; pond(cx, cy, rx, ry);
    for (let i = 0; i < 4 + M.w * 2; i++) { const a = R(0, TAU), x = cx + Math.cos(a) * (rx + .9), y = cy + Math.sin(a) * (ry + .9); if (W.tile[idx(Math.floor(x), Math.floor(y))] === TILE.SAND && !propsNear(x * T, y * T, 80).length) P('fishspot', x, y); }
    if (M.w > 1) { const dy = Math.floor(cy); for (let x = M.x0 + 1; x < cx - rx * .4; x++) { setT(x, dy, TILE.DOCK); setT(x, dy + 1, TILE.DOCK); } }
    scatter(M, (M.x1 - M.x0) * (M.y1 - M.y0) / 12, ['pine', 'tree', 'bush', 'rock']); };
  // 5. estates and ranches: big properties for sale
  let ei = 0, ri = 0;
  const estate = (M, ranch) => {
    const d = EXTCODE[M.ch], x0 = M.x0, y0 = M.y0, x1 = M.x1, y1 = M.y1, name = ranch ? RANCH_NAMES[ri++ % RANCH_NAMES.length] : ESTATE_NAMES[ei++ % ESTATE_NAMES.length];
    const hx = x0 + 3, hy = y0 + 3, house = mkB(hx, hy, ranch ? 6 : 5, 4, rng() < .5 ? 12 : 13, 2, 'home', name, d, 0); if (!house) return;
    for (let y = y0; y < hy; y++) for (const x of [house.door.tx, house.door.tx + 1]) setT(x, y, TILE.DIRT);
    const barn = mkB(hx + (ranch ? 9 : 8), y0 + 2, 6, 5, 14, 2, 'barn', name.split(' ')[0] + ' Barn', d, 2); if (barn) for (let y = barn.y + 5; y < barn.y + 7; y++) for (let x = barn.door.tx - 1; x < barn.door.tx + 2; x++) setT(x, y, TILE.DIRT);
    if (ranch) mkB(hx + 17, y0 + 2, 4, 3, 14, 1, 'barn', 'Tack Shed', d, 2);
    P('silo', (hx + (ranch ? 16.5 : 15)), y0 + 2.5); if (!ranch) P('silo', hx + 15, y0 + 4.4); P('well', hx + 6.2, hy + 4.8); for (let i = 0; i < 4; i++) P('hay', hx + 8.5 + i * .95, y0 + 8.4);
    W.parkSpots.push({ x: (hx - 1.2) * T, y: (hy + 5) * T, a: -Math.PI / 2, type: 'pickup' }, { x: (hx + 9) * T, y: (y0 + 9.6) * T, a: 0, type: 'tractor' });
    // fields: rows of 2x2 plots below the yard
    const f = { b: house, blk: W.blocks.find(k => k.mega === M), x0: x0 * T, y0: y0 * T, x1: x1 * T, y1: y1 * T, kind: ranch ? 'ranch' : 'farmland', plots: [], pasture: [], estate: 1 };
    const want = ranch ? 24 : 44, fy0 = y0 + 11, fx0 = ranch ? x0 + 2 : x0 + 2, fx1 = ranch ? x0 + 14 : x1 - 2;
    for (let y = fy0; y + 2 <= y1 - 1 && f.plots.length < want; y += 2) for (let x = fx0; x + 2 <= fx1 && f.plots.length < want; x += 2) { if ((x - fx0) % 8 === 6) continue; let ok = 1; for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) { const t = W.tile[idx(x + dx, y + dy)]; if (t !== TILE.GRASS && t !== TILE.FIELD || W.solid[idx(x + dx, y + dy)]) ok = 0; } if (!ok) continue; f.plots.push([x, y]); for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) setT(x + dx, y + dy, TILE.FIELD); }
    const inPlot = (x, y) => f.plots.some(([px, py]) => x >= px && y >= py && x < px + 2 && y < py + 2);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const t = W.tile[idx(x, y)]; if ((t === TILE.GRASS || t === TILE.DIRT) && !W.solid[idx(x, y)] && !inPlot(x, y) && y > y0 + 1) f.pasture.push([x, y]); }
    // fence the property, gaps at the driveway
    const gx = house.door.tx; for (let x = x0; x < x1; x++) { if (Math.abs(x - gx) > 1) P('fence', x + .5, y0 + .3); P('fence', x + .5, y1 - .3); } for (let y = y0; y < y1; y++) { P('fence', x0 + .3, y + .5); P('fence', x1 - .3, y + .5); }
    if (ranch) { for (let i = 0; i < 3; i++) P('trough', x0 + 17 + i * 6, y0 + 15 + (i % 2) * 6); for (let y = y0 + 10; y < y1 - 1; y++) P('fence', x0 + 15.3, y + .5); }
    const spot = pref => { let best = null, bd = 1e9; for (const [x, y] of f.pasture) { const cx = (x + .5) * T, cy = (y + .5) * T, dd = dist(cx, cy, pref[0], pref[1]); if (dd < bd && !propsNear(cx, cy, 50).some(p => p.solid)) { bd = dd; best = [cx, cy]; } } return best; };
    const s1 = spot([(gx + 2.5) * T, (y0 + 1.6) * T]); if (s1) f.sign = addProp('fsign', s1[0], s1[1], { farm: f });
    const s2 = spot([(x0 + 1.5) * T, (y0 + 9.5) * T]); if (s2) f.coop = addProp('coop', s2[0], s2[1], { farm: f });
    const s3 = spot([(x1 - 2) * T, (y0 + 1.6) * T]); if (s3) f.stand = addProp('fstand', s3[0], s3[1], { farm: f });
    house.locked = 1; house.realty = { id: house.id, name: house.name, kind: 'farm', price: ranch ? 185000 : 95000 + Math.round(f.plots.length / 4) * 1000 }; W.realty.push(house.realty); FARMS.push(f);
    W.labels.push({ n: name, x: (x0 + x1) / 2, y: (y0 + y1) / 2 + 3 });
  };
  for (const M of megas) { if (M.ch === 'E') estate(M, 0); else if (M.ch === 'R') estate(M, 1); else if (M.ch === 'P') prairie(M); else if (M.ch === 'W') forest(M); else lake(M); }
  for (const M of singles) { if (M.ch === 'P') prairie(M); else if (M.ch === 'W') forest(M); else lake(M); }
  // 6. doors, tiles, a few markets, region names, the railway
  assignDoors(rng, n0);
  for (const [d, nm] of [['town3', 'Copper Springs Market'], ['town4', 'Eastport Market'], ['town5', 'Bluebell Market']]) { const b = W.buildings.find(b => b.id >= n0 && b.type === 'store' && !b.sub && b.door && b.d === d); if (b) { b.sub = 'market'; b.name = nm; } }
  for (const [n, bi, bj] of [['BIG SKY COUNTRY', 21, 9], ['VARRO SOUND', 16.5, 7], ['Copper Springs', 18, 3.5], ['Eastport', 18, 13.5], ['Bluebell', 9, 18.5], ['Longhorn Range', 7.5, 20.2], ['Elk Ridge Forest', 23.5, 1.5], ['Silver Lake', 24, 15.2], ['Sunset Orchards', 23.5, 5], ['Red Rock Quarry', 23.5, 9.5], ['Golden Sands', 12, 25.4], ['Silver Lake', 3, 19.8], ['Elk Ridge Forest', 11, 21.5], ['Big Sky Prairie', 2, 23.2], ['Big Sky Prairie', 15.5, 22.5]]) W.labels.push({ n, x: bi * RSP + 4, y: bj * RSP + 4, big: 2 });
  const cand = []; for (let y = 0; y < NOLD; y++) for (let x = 0; x < NOLD; x++) if (isNewT(x, y) && (W.tile[idx(x, y)] === TILE.DIRT || W.tile[idx(x, y)] === TILE.PATH) && !W.solid[idx(x, y)]) cand.push([x, y]);
  for (let i = 0; i < 26 && cand.length; i++) { const [x, y] = cand.splice(Math.floor(rng() * cand.length), 1)[0]; W.pickupSpots.push({ x: (x + .5) * T, y: (y + .5) * T, t: pk(['health', 'pistol', 'shotgun', 'cash', 'armor', 'rifle', 'health', 'cash']), next: 0, alive: true }); }
  buildRail();
  for (let y = 0; y < NOLD; y++) for (let x = 0; x < NOLD; x++) if (isNewT(x, y)) markTile(x, y);
  W._bc = { prairie, forest, lake, estate, mkB, scatter, pond, setT, P, rng, rr, R, pk };
}
