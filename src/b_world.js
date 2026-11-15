// ================= WORLD / CITY GENERATION =================
const N = 420, N0 = 260, NB0 = 16, RSP = 16, NB = 26, CITYX = 4, OX = 4, OY = 4; // the original 12x12 world sits at block offset (OX, OY); new land lies north and west of it
const W = {
  tile: new Uint8Array(N * N), timg: new Uint16Array(N * N), solid: new Uint8Array(N * N), bmap: new Int16Array(N * N).fill(-1),
  rur: new Uint8Array(N * N), ruralSpots: [], buildings: [], props: [], pgrid: new Array(N * N), pickupSpots: [], phones: [], sprays: [], parkSpots: [], blocks: [],
};
const idx = (x, y) => y * N + x;
const inMap = (x, y) => x >= 0 && y >= 0 && x < N && y < N;
const isRoadCol = x => x >= 0 && x < N && x % RSP < 4;
const isRoadRow = y => y >= 0 && y < N && y % RSP < 4;
const NR = NB + 1, OCE = 46, OCS = 30; // OCE/OCS: drivable ocean beyond the east and south edges (tiles) // number of roads each axis
const roadCX = i => (i * RSP + 2) * T;
const roadCY = j => (i => (i * RSP + 2) * T)(j);
function tileAt(tx, ty) { return inMap(tx, ty) ? W.tile[idx(tx, ty)] : (W.xt && W.xt.get((ty + 64) * 8192 + tx + 64)) || TILE.WATER; }
function solidT(tx, ty) { return inMap(tx, ty) ? W.solid[idx(tx, ty)] : (W.xt && W.xt.has((ty + 64) * 8192 + tx + 64)) ? 0 : 1; }
function solidW(x, y) { return solidT(Math.floor(x / T), Math.floor(y / T)); }
function onRoad(x, y) { const tx = Math.floor(x / T), ty = Math.floor(y / T); return inMap(tx, ty) && W.tile[idx(tx, ty)] === TILE.ROAD; }

const DISTRICTS = {
  downtown: { name: 'Downtown', H: [4, 9], walls: [0, 1, 2, 5], gang: 'syndicate', gd: .1 },
  midtown: { name: 'Midtown', H: [2, 5], walls: [3, 4, 5, 6, 7] },
  oldtown: { name: 'Old Town', H: [2, 3], walls: [3, 4, 7, 8, 9], gang: 'kings' },
  farmland: { name: 'Varro County', H: [1, 1], walls: [12] }, woods: { name: 'Pinewood', H: [1, 1], walls: [4] }, lake: { name: 'Lake Serena', H: [1, 1], walls: [7] },
  town: { name: 'Dusty Creek', H: [1, 2], walls: [3, 4, 12, 13, 7, 14] }, trailer: { name: 'Rustwater', H: [1, 1], walls: [15], gang: 'reapers', gd: .55 }, quarry: { name: 'Stonecut Quarry', H: [1, 1], walls: [10] },
  junkyard: { name: 'Scrap Hollow', H: [1, 2], walls: [10, 11], gang: 'reapers', gd: .3 }, coast: { name: 'Sunset Coast', H: [1, 1], walls: [9] }, orchard: { name: 'Golden Orchards', H: [1, 1], walls: [13] }, ranch: { name: 'Bar-K Ranch', H: [1, 1], walls: [12] },
  docks: { name: 'Docklands', H: [2, 3], walls: [10, 11], gang: 'vipers' },
  industrial: { name: 'Ironworks', H: [2, 3], walls: [10, 11, 6], gang: 'saints', gd: .35 },
  suburbs: { name: 'Palm Heights', H: [1, 2], walls: [12, 13, 8, 9] },
  park: { name: 'Varro Park', H: [1, 1], walls: [7] },
  base: { name: 'Fort Varro', H: [1, 2], walls: [10] },
};
for (const [k, as, name, ex] of [['farmland2', 'farmland', 'Westfield County'], ['woods2', 'woods', 'Blackpine Forest'], ['lake2', 'lake', 'Mirror Lake'], ['town2', 'town', 'Pine Ridge'], ['trailer2', 'trailer', 'Hound Hollow', { gang: 'hounds', gd: .5 }], ['quarry2', 'quarry', 'Redrock Quarry'], ['junkyard2', 'junkyard', 'Wreckers Yard', { gang: 'vultures', gd: .3 }], ['coast2', 'coast', 'Far Shore'], ['orchard2', 'orchard', 'Applegate'], ['ranch2', 'ranch', 'Double-D Ranch'], ['docks2', 'docks', 'Portside', { gang: 'vultures', gd: .25 }], ['industrial2', 'industrial', 'Steelyard', { gang: null }], ['suburbs2', 'suburbs', 'Vista Hills'], ['midtown2', 'midtown', 'Northside'], ['park2', 'park', 'Founders Park']]) DISTRICTS[k] = Object.assign({}, DISTRICTS[as], { name, as }, ex || {});
const GANGS = {
  kings: { name: 'Crown Kings', col: '#8e44ad', col2: '#f1c40f' },
  vipers: { name: 'Dock Vipers', col: '#27ae60', col2: '#111' },
  saints: { name: 'Iron Saints', col: '#e67e22', col2: '#111', sells: ['shotgun', 12, 700] },
  syndicate: { name: 'Neon Syndicate', col: '#ecf0f1', col2: '#ff2bd6', jk: '#1a1a2e', nohat: 1, sells: ['rifle', 60, 1600] },
  reapers: { name: 'Road Reapers', col: '#7b1e1e', col2: '#b71c1c', jk: '#222', hp: 100, sells: ['shotgun', 12, 650] },
  hounds: { name: 'Iron Hounds MC', col: '#3a3a3a', col2: '#f39c12', jk: '#161616', hp: 110, nohat: 1, mc: 1, sells: ['uzi', 60, 800] },
  vultures: { name: 'Road Vultures MC', col: '#5a4630', col2: '#c0392b', jk: '#2b2118', hp: 110, nohat: 1, mc: 1, sells: ['shotgun', 12, 600] },
};
const RMAP = ['WWQF........', 'WWFF........', 'WLLF........', 'WLLO........', 'FFTT........', 'FRTT........', 'WWFO........', 'WWFF........', 'WFFJFFOFFWWW', 'WWFFFHHFFWLW', 'WWWFFHHFWWLW', 'BBBBBBBBBBBB'];
const RCODE = { F: 'farmland', W: 'woods', L: 'lake', T: 'town', R: 'trailer', Q: 'quarry', J: 'junkyard', B: 'coast', O: 'orchard', H: 'ranch' };
const RURALSET = new Set(['farmland', 'woods', 'lake', 'quarry', 'coast', 'orchard', 'ranch', 'farmland2', 'woods2', 'lake2', 'quarry2', 'coast2', 'orchard2', 'ranch2']);
const NEWMAP = ['XXwwfwwlSSSSSSSD', 'XXwfttfwSSSPSSSD', 'wwqfttfoIIMMMMSD', 'wlwffhhfIIMMPMMD', 'wwff', 'wlwf', 'frwf', 'wjff', 'wwlf', 'qwff', 'wfoh', 'wwfh', 'wlff', 'wwfo', 'wwwf', 'bbbb'];
const NEWCODE = { f: 'farmland2', w: 'woods2', l: 'lake2', t: 'town2', r: 'trailer2', q: 'quarry2', j: 'junkyard2', b: 'coast2', o: 'orchard2', h: 'ranch2', D: 'docks2', I: 'industrial2', S: 'suburbs2', M: 'midtown2', P: 'park2', X: 'base' };
let GENALIAS = 0;
function districtFor(bi, bj) {
  if (bi >= NB0 || bj >= NB0) { const k = EXTCODE[(EXTMAP[bj] || '')[bi]] || 'prairie'; return GENALIAS ? (DISTRICTS[k].as || k) : k; }
  if (bi < OX || bj < OY) { const k = NEWCODE[NEWMAP[bj][bi]]; return GENALIAS ? (DISTRICTS[k].as || k) : k; }
  bi -= OX; bj -= OY;
  const ch = RMAP[bj][bi]; if (ch !== '.') return RCODE[ch]; bi -= CITYX;
  if ((bi === 1 && bj === 4) || (bi === 5 && bj === 6) || (bi === 4 && bj === 1)) return 'park';
  if (bi >= 7) return 'docks';
  if (bi >= 2 && bi <= 5 && bj >= 2 && bj <= 4) return 'downtown';
  if (bi <= 1 && bj <= 2) return 'industrial';
  if (bj >= 5 && bi <= 3) return 'oldtown';
  if (bj === 7) return 'suburbs';
  return 'midtown';
}
function districtAt(x, y) {
  const bi = clamp(Math.floor((x / T - 4) / RSP), 0, NB - 1), bj = clamp(Math.floor((y / T - 4) / RSP), 0, NB - 1);
  return districtFor(bi, bj);
}

const PROPDEF = {
  lamp: { r: 5, solid: 1, knock: 1 }, tree: { r: 11, solid: 1 }, hydrant: { r: 6, solid: 1, knock: 1, act: 'Kick hydrant' },
  trash: { r: 9, solid: 1, knock: 1, act: 'Search trash can' }, phone: { r: 10, solid: 1, act: 'Use payphone' },
  atm: { r: 9, solid: 1, act: 'Use ATM' }, vend: { r: 10, solid: 1, act: 'Buy soda  $5' }, bench: { r: 12, solid: 0, knock: 1, act: 'Sit on bench' },
  news: { r: 7, solid: 1, knock: 1, act: 'Read newspaper' }, hotdog: { r: 14, solid: 1, act: 'Buy hot dog  $8' },
  bush: { r: 10, solid: 1 }, palm: { r: 7, solid: 1 }, cone: { r: 5, solid: 0, knock: 1 }, barrel: { r: 9, solid: 1, knock: 1 },
};
function addProp(t, x, y, ex) {
  const d = PROPDEF[t]; const p = Object.assign({ t, x, y, r: d.r, solid: d.solid, down: 0, a: 0 }, ex || {});
  W.props.push(p); const k = idx(Math.floor(x / T), Math.floor(y / T)); (W.pgrid[k] || (W.pgrid[k] = [])).push(p); return p;
}
function propsNear(x, y, rad) {
  const out = [], r = Math.ceil(rad / T), tx = Math.floor(x / T), ty = Math.floor(y / T);
  for (let yy = ty - r; yy <= ty + r; yy++) for (let xx = tx - r; xx <= tx + r; xx++) { if (!inMap(xx, yy)) continue; const a = W.pgrid[idx(xx, yy)]; if (a) for (const p of a) out.push(p); }
  return out;
}

function markTile(x, y) {
    const k = idx(x, y), t = W.tile[k];
  if (t === TILE.ROAD) {
    const cx = x % RSP, cy = y % RSP, v = cx < 4, h = cy < 4;
    let name;
    const rd = districtFor(clamp(Math.floor((x - 2) / RSP), 0, NB - 1), clamp(Math.floor((y - 2) / RSP), 0, NB - 1)), ri = Math.floor(x / RSP), rj = Math.floor(y / RSP);
    if (RURALSET.has(rd)) {
      W.rur[k] = 1; const vD = ri === OX + 1 || ri === OX + 3 || ri === 2, hD = rj === OY + 2 || rj === OY + 6 || rj === OY + 10 || rj === 2;
      if (v && h) name = vD && hD ? 'drt' + ((x + y) % 2) : 'road0'; else if (v) name = vD ? 'drt' + ((x + y) % 2) : 'crv' + cx; else name = hD ? 'drt' + ((x + y) % 2) : 'crh' + cy;
    }
    else if (v && h) name = 'road' + ((x * 7 + y * 3) % 5 === 0 ? 1 : 0);
    else if (v) name = (cy === 4 || cy === 15) ? 'cwv' : 'rv' + cx;
    else name = (cx === 4 || cx === 15) ? 'cwh' : 'rh' + cy;
    W.timg[k] = TIMGI[name];
  } else if (t === TILE.WALK) {
    let m = 0; if (tileAt(x, y - 1) === TILE.ROAD) m |= 1; if (tileAt(x + 1, y) === TILE.ROAD) m |= 2; if (tileAt(x, y + 1) === TILE.ROAD) m |= 4; if (tileAt(x - 1, y) === TILE.ROAD) m |= 8;
    W.timg[k] = TIMGI['walk' + m];
  } else if (t === TILE.GRASS) W.timg[k] = TIMGI['grass' + ((x * 13 + y * 7) % 11 === 0 ? 3 : (x + y * 3) % 3)];
  else if (t === TILE.ALLEY) W.timg[k] = TIMGI['alley' + ((x * 5 + y * 11) % 9 === 0 ? 1 : (x * 3 + y) % 17 === 0 ? 2 : 0)];
  else if (t === TILE.LOT) W.timg[k] = TIMGI[(x % 2 === 0) ? 'lot1' : 'lot0'];
  else if (t === TILE.DOCK) W.timg[k] = TIMGI['dock' + ((x + y) % 7 === 0 ? 1 : 0)];
  else if (t === TILE.PATH) W.timg[k] = TIMGI.path;
  else if (t === TILE.FIELD) W.timg[k] = TIMGI['field' + ((Math.floor((x - 4) / 6) + Math.floor((y - 4) / 6) * 2 + Math.floor(x / RSP)) % 3)];
  else if (t === TILE.DIRT) W.timg[k] = TIMGI.dirt;
  else if (t === TILE.SAND) W.timg[k] = TIMGI.sand;
  else if (t === TILE.BLD) W.timg[k] = TIMGI.bld;
  else if (t === TILE.WATER) W.timg[k] = TIMGI.water0;
  if (t === TILE.WATER || t === TILE.BLD) W.solid[k] = 1;
}
function genCity() {
  const rng = mulberry32(1337);
  const rr = (a, b) => a + Math.floor(rng() * (b - a + 1));
  // base: roads + water fill
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const k = idx(x, y);
    if (x >= N0 || y >= N0) { W.tile[k] = TILE.WATER; continue; }
    if (isRoadCol(x) || isRoadRow(y)) { W.tile[k] = TILE.ROAD; }
    else { W.tile[k] = TILE.GRASS; }
  }
  for (let bj = 0; bj < 12; bj++) for (let bi = 0; bi < 12; bi++) genBlock(bi + OX, bj + OY, rng, rr); // original world first, so its layout never changes
  const rng2 = mulberry32(9001), rr2 = (a, b) => a + Math.floor(rng2() * (b - a + 1));
  for (let bj = 0; bj < NB0; bj++) for (let bi = 0; bi < NB0; bi++) if (bi < OX || bj < OY) { const n0 = W.buildings.length; GENALIAS = 1; genBlock(bi, bj, rng2, rr2); GENALIAS = 0; const k = districtFor(bi, bj); W.blocks[W.blocks.length - 1].d = k; for (let i = n0; i < W.buildings.length; i++) { const b = W.buildings[i]; b.d = k; b.nw = 1; b.nwFree = !b.type; } }
  // road markings
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) markTile(x, y);
  assignDoors(rng);
  // pickups
  const cand = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const t = W.tile[idx(x, y)]; if ((t === TILE.ALLEY || t === TILE.PATH || t === TILE.LOT || t === TILE.DIRT) && !W.solid[idx(x, y)]) cand.push([x, y]); }
  const ptypes = ['pistol', 'uzi', 'health', 'armor', 'shotgun', 'pistol', 'health', 'molotov', 'cash', 'uzi', 'armor', 'rocket', 'health', 'cash', 'rifle'];
  for (let i = 0; i < 90 && cand.length; i++) {
    const j = Math.floor(rng() * cand.length), [x, y] = cand.splice(j, 1)[0];
    W.pickupSpots.push({ x: (x + .5) * T, y: (y + .5) * T, t: ptypes[i % ptypes.length], next: 0, alive: true });
  }
  // drug dealer corners: a few per district, in alleys and parks
  W.dealerSpots = [];
  const byD = {}; for (const [x, y] of cand) { const d = districtAt((x + .5) * T, (y + .5) * T); (byD[d] || (byD[d] = [])).push([x, y]); }
  for (const d in byD) { const L = byD[d], n = d === 'docks' || d === 'oldtown' ? 3 : d === 'downtown' || d === 'town' || d === 'junkyard' || d === 'coast' ? 1 : RURALSET.has(d) ? 0 : 2; for (let i = 0; i < n && L.length; i++) { const [x, y] = L.splice(Math.floor(rng() * L.length), 1)[0]; W.dealerSpots.push({ x: (x + .5) * T, y: (y + .5) * T, d, ped: null }); } }
  worldExtras(); countryside(); cityLife(); heistGen(); meetGen(); bigCountry(); casinoGen(); factoryGen(); storeGen();
}

function genBlock(bi, bj, rng, rr) {
  const bx = bi * RSP + 4, by = bj * RSP + 4, d = districtFor(bi, bj), D = DISTRICTS[d];
  const blk = { bi, bj, bx, by, d, li: bi >= OX && bj >= OY ? bi - OX : bi }; W.blocks.push(blk);
  if (d === 'base') { for (let y = by; y < by + 12; y++) for (let x = bx; x < bx + 12; x++) W.tile[idx(x, y)] = TILE.LOT; return; }
  if (RURALSET.has(d)) return genRural(blk, rng, rr);
  const set = (x, y, t) => { W.tile[idx(x, y)] = t; };
  for (let y = by; y < by + 12; y++) for (let x = bx; x < bx + 12; x++) {
    const ring = x === bx || y === by || x === bx + 11 || y === by + 11;
    set(x, y, ring ? TILE.WALK : (d === 'park' || d === 'suburbs' ? TILE.GRASS : d === 'docks' ? TILE.DOCK : d === 'town' || d === 'trailer' || d === 'junkyard' ? TILE.DIRT : TILE.ALLEY));
  }
  const ix = bx + 1, iy = by + 1;
  const lots = [];
  if (d === 'park') {
    for (let k = 0; k < 10; k++) { set(ix + 4, iy + k, TILE.PATH); set(ix + 5, iy + k, TILE.PATH); set(ix + k, iy + 4, TILE.PATH); set(ix + k, iy + 5, TILE.PATH); }
    for (let y = iy + 6; y < iy + 9; y++) for (let x = ix + 6; x < ix + 9; x++) set(x, y, TILE.WATER);
    for (let i = 0; i < 16; i++) { const x = ix + rr(0, 9), y = iy + rr(0, 9); if (W.tile[idx(x, y)] === TILE.GRASS) addProp(rng() < .7 ? 'tree' : 'bush', (x + .5) * T + rr(-12, 12), (y + .5) * T + rr(-12, 12)); }
    addProp('bench', (ix + 3.5) * T, (iy + 4.5) * T, { a: Math.PI / 2 }); addProp('bench', (ix + 6.5) * T, (iy + 5.5) * T, { a: -Math.PI / 2 });
    addProp('hotdog', (ix + 4.2) * T, (iy + 2) * T); addProp('trash', (ix + 3.4) * T, (iy + 6) * T);
  } else if (d === 'trailer') {
    for (const gy of [0, 4, 8]) for (const gx of [0, 4, 7]) if (!(gx === 4 && gy === 4)) lots.push({ x: ix + gx, y: iy + gy, w: 3, h: 2 });
    addProp('campfire', (ix + 5.5) * T, (iy + 5) * T); addProp('barrel', (ix + 4.4) * T, (iy + 4.4) * T); addProp('log', (ix + 6.4) * T, (iy + 5.6) * T);
    W.parkSpots.push({ x: (ix + 3.5) * T, y: (iy + 3) * T, a: 0, type: 'bike' }, { x: (ix + 6.5) * T, y: (iy + 7) * T, a: Math.PI, type: 'bike' }, { x: (ix + 3.5) * T, y: (iy + 7) * T, a: 0, type: 'pickup' });
  } else if (d === 'suburbs') {
    for (let q = 0; q < 4; q++) {
      const qx = ix + (q % 2) * 5, qy = iy + (q >> 1) * 5;
      const w = rr(3, 4), h = rr(3, 4);
      const x = q % 2 ? qx + 5 - w : qx, y = q >> 1 ? qy + 5 - h : qy;
      lots.push({ x, y, w, h });
      for (let i = 0; i < 3; i++) { const tx = qx + rr(0, 4), ty = qy + rr(0, 4); if (!(tx >= x && tx < x + w && ty >= y && ty < y + h)) addProp(rng() < .45 ? 'palm' : rng() < .6 ? 'tree' : 'bush', (tx + .5) * T, (ty + .5) * T); }
    }
  } else {
    const maxS = d === 'downtown' ? 6 : d === 'docks' || d === 'industrial' || d === 'junkyard' ? 8 : d === 'town' ? 4 : 5;
    const split = (r, depth) => {
      if ((r.w <= maxS && r.h <= maxS) || depth > 4) { lots.push(r); return; }
      const hz = r.w >= r.h, L = hz ? r.w : r.h; if (L < 7) { lots.push(r); return; }
      const p = 3 + Math.floor(rng() * (L - 6));
      if (hz) { split({ x: r.x, y: r.y, w: p, h: r.h }, depth + 1); split({ x: r.x + p + 1, y: r.y, w: r.w - p - 1, h: r.h }, depth + 1); }
      else { split({ x: r.x, y: r.y, w: r.w, h: p }, depth + 1); split({ x: r.x, y: r.y + p + 1, w: r.w, h: r.h - p - 1 }, depth + 1); }
    };
    split({ x: ix, y: iy, w: 10, h: 10 }, 0);
  }
  for (let li = 0; li < lots.length; li++) {
    const r = lots[li];
    if (((d === 'docks' || d === 'industrial') && rng() < .3 || d === 'junkyard' && rng() < .7) && r.w >= 3 && r.h >= 2) {
      if (d === 'junkyard') for (let i = 0; i < r.w * r.h / 3; i++) addProp('wreck', (r.x + .5 + rng() * (r.w - 1)) * T, (r.y + .5 + rng() * (r.h - 1)) * T, { a: rng() * 6.28, ct: ['sedan', 'compact', 'pickup', 'van', 'muscle'][Math.floor(rng() * 5)] });
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { set(x, y, TILE.LOT); if (x % 2 === 0 && rng() < .5) W.parkSpots.push({ x: (x + .5) * T, y: (y + .5) * T, a: Math.PI / 2 * (rng() < .5 ? 1 : 3) }); }
      for (let i = 0; i < 3; i++) addProp('barrel', (r.x + rng() * r.w) * T, (r.y + rng() * r.h) * T);
      continue;
    }
    if (d === 'downtown' && rng() < .12) {
      for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) set(x, y, TILE.PATH);
      addProp('tree', (r.x + .5) * T, (r.y + .5) * T); addProp('tree', (r.x + r.w - .5) * T, (r.y + r.h - .5) * T);
      addProp('bench', (r.x + r.w / 2) * T, (r.y + r.h / 2) * T); continue;
    }
    makeBuilding(r, d, D, rng, rr);
  }
  // sidewalk props
  const sides = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  for (let s = 0; s < 4; s++) {
    for (let k = 1; k < 11; k++) {
      let tx, ty; if (s === 0) { tx = bx + k; ty = by; } else if (s === 1) { tx = bx + 11; ty = by + k; } else if (s === 2) { tx = bx + 11 - k; ty = by + 11; } else { tx = bx; ty = by + 11 - k; }
      const [ox, oy] = sides[s], cx = (tx + .5) * T, cy = (ty + .5) * T;
      const cxo = cx + ox * T * .34, cyo = cy + oy * T * .34; // curb side
      const inx = cx - ox * T * .3, iny = cy - oy * T * .3;   // building side
      const innerSolid = W.tile[idx(tx - ox, ty - oy)] === TILE.BLD;
      if (k % 4 === 2) addProp((d === 'suburbs' || d === 'oldtown') && k === 6 ? (d === 'suburbs' || d === 'docks' ? 'palm' : 'tree') : 'lamp', cxo, cyo);
      else if (d === 'docks' && k === 10) addProp('palm', cxo, cyo);
      else if (k === 4 && rng() < .5) addProp('hydrant', cxo, cyo);
      else if (k === 8 && rng() < .55) addProp('trash', cxo, cyo);
      if (innerSolid && k % 4 !== 2) {
        const q = rng();
        if (q < .05) addProp('atm', inx, iny, { a: Math.atan2(oy, ox) });
        else if (q < .1) addProp('vend', inx, iny, { a: Math.atan2(oy, ox) });
        else if (q < .14) addProp('news', inx, iny);
        else if (q < .19 && d !== 'docks') addProp('bench', inx, iny, { a: Math.atan2(oy, ox) });
      }
    }
  }
  // payphone
  if ((bi * 3 + bj * 5) % 3 === 0 || (bi === 7 && bj === 3)) {
    const s = Math.floor(rng() * 4), k = 3 + Math.floor(rng() * 6);
    let tx, ty; if (s === 0) { tx = bx + k; ty = by; } else if (s === 1) { tx = bx + 11; ty = by + k; } else if (s === 2) { tx = bx + k; ty = by + 11; } else { tx = bx; ty = by + k; }
    const [ox, oy] = sides[s];
    W.phones.push(addProp('phone', (tx + .5) * T - ox * T * .28, (ty + .5) * T - oy * T * .28, { a: Math.atan2(oy, ox) }));
  }
  if (d === 'downtown' && rng() < .5) addProp('hotdog', (bx + .5) * T, (by + 6.5) * T);
}

function makeBuilding(r, d, D, rng, rr) {
  const id = W.buildings.length;
  const H = d === 'downtown' && r.w * r.h >= 25 && rng() < .5 ? rr(7, 10) : rr(D.H[0], D.H[1]);
  const wall = D.walls[Math.floor(rng() * D.walls.length)];
  const b = { id, x: r.x, y: r.y, w: r.w, h: r.h, H, wall, d, door: null, garage: null, type: null, name: null, roof: null };
  for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) { W.tile[idx(x, y)] = TILE.BLD; W.bmap[idx(x, y)] = id; }
  b.roof = makeRoof(b, rng);
  W.buildings.push(b);
  return b;
}
const ADS = [['FIZZY COLA', '#c0392b', '#fff'], ['HOT DOGS!', '#f1c40f', '#c0392b'], ['VOTE NO ON 9', '#2c3e50', '#ecf0f1'], ['SVPD: WE CARE', '#1f3a93', '#fff'], ['PIXEL PALACE', '#8e44ad', '#f1c40f'], ['DRIVE SAFE', '#27ae60', '#fff'], ['CHEETAH GT', '#111', '#e74c3c'], ['LOCK & LOAD', '#6d4c41', '#f2c230']];
function makeRoof(b, rng) {
  const P = 24, c = mkCanvas(b.w * P, b.h * P), g = c.getContext('2d'), wk = b.wall === 15 ? 'trailer' : WALLS[b.wall].k, Wc = c.width, Hc = c.height;
  const base = wk === 'glass' ? ['#5a6470', '#4a525c', '#6b6f75'][b.id % 3] : wk === 'ware' ? ['#7d8288', '#8a8070', '#6f7a70'][b.id % 3] : wk === 'house' ? ['#8b3a2b', '#5d4037', '#455a64', '#7b5e3b'][b.id % 4] : wk === 'brick' ? ['#5c5048', '#4f463f'][b.id % 2] : ['#9a9488', '#7f7a70', '#b0a898'][b.id % 3];
  const gr0 = g.createLinearGradient(0, 0, Wc, Hc); gr0.addColorStop(0, shade(base, 1.08)); gr0.addColorStop(1, shade(base, .9)); g.fillStyle = gr0; g.fillRect(0, 0, Wc, Hc);
  for (let i = 0; i < Wc * Hc / 22; i++) { g.fillStyle = rng() < .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.05)'; g.fillRect(rng() * Wc | 0, rng() * Hc | 0, 2, 1); }
  for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse(rng() * Wc, rng() * Hc, 10 + rng() * 20, 6 + rng() * 12, rng() * 3, 0, TAU); g.fill(); }
  if (wk === 'house') {
    const hz = b.w >= b.h, half = hz ? Hc / 2 : Wc / 2;
    for (let s = 0; s < 2; s++) {
      const gr = hz ? g.createLinearGradient(0, s ? Hc : 0, 0, half) : g.createLinearGradient(s ? Wc : 0, 0, half, 0);
      gr.addColorStop(0, shade(base, s ? .62 : .9)); gr.addColorStop(1, shade(base, s ? .8 : 1.15)); g.fillStyle = gr;
      if (hz) g.fillRect(0, s ? half : 0, Wc, half); else g.fillRect(s ? half : 0, 0, half, Hc);
    }
    g.fillStyle = 'rgba(0,0,0,.2)'; if (hz) for (let y = 3; y < Hc; y += 4) for (let x = (y % 8 ? 0 : 3); x < Wc; x += 6) g.fillRect(x, y, 5, 1); else for (let x = 3; x < Wc; x += 4) for (let y = (x % 8 ? 0 : 3); y < Hc; y += 6) g.fillRect(x, y, 1, 5);
    g.fillStyle = shade(base, 1.4); if (hz) g.fillRect(0, half - 1.5, Wc, 3); else g.fillRect(half - 1.5, 0, 3, Hc);
    if (rng() < .7) { const x = Wc * (.2 + rng() * .5), y = Hc * (.15 + rng() * .2); g.fillStyle = '#5d4037'; g.fillRect(x, y, 8, 8); g.fillStyle = '#3e2723'; g.fillRect(x + 2, y + 2, 4, 4); }
    if (rng() < .4) { g.fillStyle = '#1e3a5f'; const x = Wc * .55, y = hz ? Hc * .6 : Hc * .3; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { g.fillRect(x + i * 7, y + j * 7, 6, 6); g.fillStyle = '#2f5d8f'; g.fillRect(x + i * 7, y + j * 7, 6, 1); g.fillStyle = '#1e3a5f'; } }
    return c;
  }
  if (wk === 'trailer') { g.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 4; x < Wc; x += 5) g.fillRect(x, 2, 1, Hc - 4); g.fillStyle = '#9aa3aa'; g.fillRect(0, 0, Wc, 2); g.fillRect(0, Hc - 2, Wc, 2); g.fillStyle = '#777'; g.fillRect(Wc * .3, Hc * .4, 9, 7); return c; }
  // parapet
  g.fillStyle = shade(base, 1.3); g.fillRect(0, 0, Wc, 3); g.fillRect(0, 0, 3, Hc); g.fillStyle = shade(base, .65); g.fillRect(0, Hc - 3, Wc, 3); g.fillRect(Wc - 3, 0, 3, Hc);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(3, 3, Wc - 6, 3); g.fillRect(3, 3, 3, Hc - 6);
  if (wk === 'ware') { for (let y = 10; y < Hc - 10; y += 16) for (let x = 10; x < Wc - 14; x += 22) { const sg = g.createLinearGradient(x, y, x + 12, y + 6); sg.addColorStop(0, '#bfe0f0'); sg.addColorStop(1, '#6a9ab8'); g.fillStyle = sg; g.fillRect(x, y, 12, 6); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, y + 6, 12, 1.5); } g.strokeStyle = 'rgba(0,0,0,.12)'; for (let x = 6; x < Wc; x += 4) { g.beginPath(); g.moveTo(x, 6); g.lineTo(x, Hc - 6); g.stroke(); } return c; }
  const n = Math.floor(b.w * b.h / 4) + 2;
  const ac = (x, y) => { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 2, y + 2, 13, 10); g.fillStyle = '#c4c8cc'; g.fillRect(x, y, 13, 10); g.fillStyle = '#9ea3a8'; g.fillRect(x, y + 8, 13, 2); g.fillStyle = '#6d7175'; g.beginPath(); g.arc(x + 6.5, y + 5, 3.5, 0, TAU); g.fill(); g.fillStyle = '#3b3e41'; g.fillRect(x + 6, y + 2, 1, 6); g.fillRect(x + 3.5, y + 4.5, 6, 1); };
  for (let i = 0; i < n; i++) {
    const x = 8 + rng() * (Wc - 24), y = 8 + rng() * (Hc - 24), q = rng();
    if (q < .38) ac(x, y);
    else if (q < .55) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(x + 6, y + 6, 5, 0, TAU); g.fill(); g.fillStyle = '#777'; g.beginPath(); g.arc(x + 5, y + 5, 4.5, 0, TAU); g.fill(); g.fillStyle = '#3a3a3a'; g.beginPath(); g.arc(x + 5, y + 5, 2.2, 0, TAU); g.fill(); }
    else if (q < .66 && (b.d === 'oldtown' || b.d === 'midtown')) { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(x + 10, y + 10, 9, 0, TAU); g.fill(); g.fillStyle = '#6d4c41'; g.beginPath(); g.arc(x + 8, y + 8, 8, 0, TAU); g.fill(); g.fillStyle = '#8d6e63'; g.beginPath(); g.arc(x + 8, y + 8, 5.5, 0, TAU); g.fill(); g.strokeStyle = '#4e342e'; g.beginPath(); g.arc(x + 8, y + 8, 8, 0, TAU); g.stroke(); }
    else if (q < .76) { const sg = g.createLinearGradient(x, y, x + 14, y + 10); sg.addColorStop(0, '#aad4ee'); sg.addColorStop(1, '#5b8db0'); g.fillStyle = '#555'; g.fillRect(x - 1, y - 1, 16, 12); g.fillStyle = sg; g.fillRect(x, y, 14, 10); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(x + 2, y + 1, 3, 8); }
    else if (q < .84) { g.fillStyle = '#4a6b3a'; g.fillRect(x, y, 16, 8); for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? '#6aa84f' : '#3f7d33'; g.beginPath(); g.arc(x + 2 + k * 2.4, y + 4, 2.6, 0, TAU); g.fill(); } }
    else if (q < .92 && wk === 'glass') { g.fillStyle = '#25384f'; for (let a = 0; a < 3; a++) for (let bb = 0; bb < 2; bb++) { g.fillRect(x + a * 6, y + bb * 8, 5, 7); g.fillStyle = '#3d5f86'; g.fillRect(x + a * 6, y + bb * 8, 5, 1); g.fillStyle = '#25384f'; } }
    else { g.fillStyle = '#555'; g.fillRect(x, y, 1.5, 12); g.fillStyle = '#c0392b'; g.beginPath(); g.arc(x + .75, y, 1.5, 0, TAU); g.fill(); }
  }
  if (b.H >= 7 && b.w >= 4 && b.h >= 4) { const cx = Wc / 2, cy = Hc / 2; g.fillStyle = '#333'; g.beginPath(); g.arc(cx, cy, 22, 0, TAU); g.fill(); g.strokeStyle = '#f2c230'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, 18, 0, TAU); g.stroke(); g.fillStyle = '#fff'; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('H', cx, cy + 1); for (let i = 0; i < 8; i++) { g.fillStyle = '#ffd400'; g.fillRect(cx + Math.cos(i / 8 * TAU) * 22 - 1, cy + Math.sin(i / 8 * TAU) * 22 - 1, 2, 2); } }
  else if (b.H >= 4 && rng() < .45 && b.w >= 3) { // billboard
    const ad = ADS[Math.floor(rng() * ADS.length)], bw = Math.min(Wc - 16, 70), bx = (Wc - bw) / 2, by = Hc - 22;
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(bx + 3, by + 4, bw, 12); g.fillStyle = '#333'; g.fillRect(bx + 8, by + 12, 2, 6); g.fillRect(bx + bw - 10, by + 12, 2, 6);
    g.fillStyle = ad[1]; g.fillRect(bx, by, bw, 12); g.fillStyle = ad[2]; g.font = 'bold 8px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ad[0], bx + bw / 2, by + 6.5, bw - 4);
  }
  if (b.d === 'oldtown' && rng() < .4) { const x = Wc - 22, y = 8; g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(x + 9, y + 9, 9, 0, TAU); g.fill(); g.fillStyle = '#7b4a2a'; g.beginPath(); g.arc(x + 7, y + 7, 8, 0, TAU); g.fill(); g.strokeStyle = '#4a2a14'; g.lineWidth = 1; for (let k = 0; k < 8; k++) { g.beginPath(); g.moveTo(x + 7, y + 7); g.lineTo(x + 7 + Math.cos(k) * 8, y + 7 + Math.sin(k) * 8); g.stroke(); } }
  return c;
}
// face: 0 N,1 E,2 S,3 W
function faceInfo(b, f) {
  if (f === 0) return { len: b.w, out: t => [b.x + t, b.y - 1] };
  if (f === 2) return { len: b.w, out: t => [b.x + t, b.y + b.h] };
  if (f === 3) return { len: b.h, out: t => [b.x - 1, b.y + t] };
  return { len: b.h, out: t => [b.x + b.w, b.y + t] };
}
const FACEV = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function assignDoors(rng, from) {
  for (const b of W.buildings) { if (from !== undefined && (b.id < from || b.door)) continue;
    const opts = [];
    for (let f = 0; f < 4; f++) {
      const fi = faceInfo(b, f);
      for (let t = 0; t < fi.len; t++) { const [ox, oy] = fi.out(t); const tt = tileAt(ox, oy); if (!solidT(ox, oy) && tt !== TILE.WATER && tt !== TILE.BLD) opts.push({ f, t, ox, oy, walk: tt === TILE.WALK, mid: Math.abs(t - (fi.len - 1) / 2) }); }
    }
    if (!opts.length) continue;
    for (const o of opts) o.j = (rng() - .5) * .8; // roll the tie-breakers first: a random comparator makes the sort (and the whole world) differ between loads
    opts.sort((a, c) => (c.walk - a.walk) || (a.mid + a.j) - (c.mid + c.j));
    const o = opts[0], [fx, fy] = FACEV[o.f];
    b.door = { f: o.f, t: o.t, tx: o.ox, ty: o.oy, x: (o.ox + .5) * T - fx * T * .3, y: (o.oy + .5) * T - fy * T * .3 };
    b.doorOpts = opts;
  }
  // garages: custom mod shops and chop shops (zones on a 2-wide walk face fronting a road)
  const mkGarages = (kind, dists, count, names) => {
    const C = W.buildings.filter(b => b.door && dists.includes(b.d)); let made = 0;
    for (let i = 0; i < 600 && made < count && C.length; i++) {
      const b = C[Math.floor(rng() * C.length)]; if (b.type) continue;
      if (W.sprays.some(z => Math.abs(z.b.x - b.x) + Math.abs(z.b.y - b.y) < 20)) continue;
      for (let f = 0; f < 4 && !b.type; f++) {
        const fi = faceInfo(b, f); const [fx, fy] = FACEV[f];
        for (let t = 0; t + 1 < fi.len; t++) {
          const [a1, a2] = fi.out(t), [b1, b2] = fi.out(t + 1);
          if (tileAt(a1, a2) === TILE.WALK && tileAt(b1, b2) === TILE.WALK && tileAt(a1 + fx, a2 + fy) === TILE.ROAD && tileAt(b1 + fx, b2 + fy) === TILE.ROAD) {
            if (b.door && b.door.f === f && (b.door.t === t || b.door.t === t + 1)) continue;
            b.garage = { f, t };
            const xs = [a1, b1, a1 + fx, b1 + fx], ys = [a2, b2, a2 + fy, b2 + fy];
            const zone = { x0: Math.min(...xs) * T, y0: Math.min(...ys) * T, x1: (Math.max(...xs) + 1) * T, y1: (Math.max(...ys) + 1) * T, b, kind, fx, fy };
            W.sprays.push(zone); b.type = 'spray'; b.gk = kind; b.name = names[made % names.length]; made++; break;
          }
        }
      }
    }
  };
  mkGarages('mod', ['midtown'], 2, ['Fresh Coat Customs', 'Varro Speed & Style']);
  mkGarages('mod', ['downtown', 'oldtown', 'suburbs'], 1, ['Chrome Kings Customs']);
  mkGarages('chop', ['docks'], 1, ["Dockside Salvage"]);
  mkGarages('chop', ['industrial'], 1, ["Rusty's Chop Shop"]);
  mkGarages('mod', ['town'], 1, ['Creek Customs']);
  mkGarages('chop', ['junkyard'], 1, ['Scrap Hollow Salvage']);
  // interiors
  const specials = [['safehouse', 'midtown', 'Your Apartment'], ['gunshop', 'midtown', 'Lock & Load Guns'], ['diner', 'midtown', "Dottie's Diner"], ['store', 'midtown', 'Quik-Stop'],
  ['hospital', 'downtown', 'St. Varro Hospital'], ['police', 'downtown', 'SVPD Precinct 9'], ['bank', 'downtown', 'First Varro Bank'], ['club', 'downtown', 'Club Ultraviolet'],
  ['gunshop', 'oldtown', 'Kings Arms'], ['bar', 'oldtown', 'The Rusty Anchor'], ['store', 'oldtown', 'Corner Mart'], ['diner', 'suburbs', 'Palm Grill'],
  ['gunshop', 'docks', 'Harbor Hardware & Arms'], ['bar', 'docks', 'Bilge Water Tavern'], ['store', 'industrial', '24/7 Gas & Go'], ['arcade', 'midtown', 'Pixel Palace Arcade'],
  ['diner', 'downtown', 'Burger Barn'], ['strip', 'oldtown', 'The Velvet Room'], ['strip', 'docks', 'Dollhouse Lounge'], ['safehouse', 'suburbs', 'Beach Bungalow'], ['store', 'downtown', 'Quik-Stop'], ['hospital', 'oldtown', 'Old Town Clinic'], ['police', 'docks', 'Harbor Police'],
  ['pawn', 'midtown', "Honest Abe's Pawn"], ['pawn', 'oldtown', 'Second Chance Pawn'], ['pawn', 'docks', 'Harbor Pawn & Loan'], ['pawn', 'town', 'Creek Trading Post'], ['gunshop', 'town', 'Dusty Creek Guns'], ['store', 'town', 'General Store'],
  ['bar', 'town', 'The Thirsty Mule'], ['diner', 'town', "Ma's Kitchen"], ['police', 'town', 'County Sheriff'], ['hospital', 'town', 'Creek Clinic'], ['safehouse', 'town', 'Creekside Cabin'], ['bar', 'trailer', 'The Rusty Spoke'], ['gunshop', 'industrial', 'Saints Armory']];
  const center = { x: (CITYX + 3.5 + OX) * RSP * T + 4 * T, y: (4.5 + OY) * RSP * T };
  const free = W.buildings.filter(b => b.door && !b.type);
  for (const b of free) if (b.nw) b.nwFree = 1; else b.nwFree = 0;
  for (const [type, d, name] of specials) {
    let best = null, bd = 1e18;
    for (const b of free) { if (b.type || b.d !== d) continue; const dd = dist2(b.door.x, b.door.y, center.x, center.y) * (0.6 + rng() * 0.8) * (b.door.f === 2 ? .7 : 1); if (dd < bd) { bd = dd; best = b; } }
    if (best) { best.type = type; best.name = name; }
  }
  for (const b of free) {
    if (b.type) continue;
    const r = rng();
    if (b.d === 'trailer') { b.type = 'home'; b.name = 'Trailer'; }
    else if (b.d === 'junkyard') { b.type = 'warehouse'; b.name = 'Scrap Shed'; }
    else if (b.d === 'docks' || b.d === 'industrial') { b.type = 'warehouse'; b.name = pick2(rng, ['Warehouse', 'Storage', 'Freight Co.', 'Depot']); }
    else if (b.d === 'downtown') { b.type = r < .8 ? 'office' : 'store'; b.name = b.type === 'office' ? pick2(rng, ['Varro Tower', 'Apex Insurance', 'Granite Capital', 'Omni Media', 'Helix Labs', 'Sterling Law']) : 'Mini Mart'; }
    else if (b.d === 'suburbs') { b.type = 'home'; b.name = 'House'; }
    else { b.type = r < .55 ? 'home' : r < .8 ? 'office' : r < .9 ? 'bar' : 'store'; b.name = { home: b.d === 'town' ? 'House' : 'Apartments', office: pick2(rng, ['Ace Travel', 'Dentist', 'Tax Office', 'Pawn Shop Office', 'Realty']), bar: pick2(rng, ['The Dive', 'Lucky Seven', 'Neon Moon']), store: 'Corner Shop' }[b.type]; }
  }
}
function pick2(rng, a) { return a[Math.floor(rng() * a.length)]; }

// ================= INTERIORS =================
const IT = { // item defs: solid?, label
  counter: { s: 1 }, register: { s: 1, act: 'Rob the register' }, shelf: { s: 1, act: 'Grab a snack  $3' }, fridge: { s: 1, act: 'Grab a drink' },
  case: { s: 1 }, table: { s: 1, act: 'Eat leftovers' }, chair: { s: 0 }, booth: { s: 1 }, stool: { s: 0 }, bed: { s: 1, act: 'Sleep (save game)' },
  tv: { s: 1, act: 'Watch TV' }, sofa: { s: 1, act: 'Sit on sofa' }, arcade: { s: 1, act: 'Play arcade  $1' }, jukebox: { s: 1, act: 'Change song' },
  atm: { s: 1, act: 'Use ATM' }, vend: { s: 1, act: 'Buy soda  $5' }, desk: { s: 1, act: 'Search desk' }, computer: { s: 1, act: 'Use computer' },
  cooler: { s: 1, act: 'Drink water' }, plant: { s: 1 }, books: { s: 1, act: 'Read a book' }, crate: { s: 1, act: 'Smash crate' }, vault: { s: 1, act: 'Crack the vault' },
  bars: { s: 1, act: 'Rattle the bars' }, dance: { s: 0, act: 'Dance' }, dj: { s: 1, act: 'Request a song' }, bar: { s: 1, act: 'Order a drink  $10' },
  pool: { s: 1, act: 'Play pool  ($50 bet)' }, piano: { s: 1, act: 'Play piano' }, wardrobe: { s: 1, act: 'Change outfit' }, stash: { s: 1, act: 'Open stash' },
  toilet: { s: 1, act: 'Use toilet' }, gurney: { s: 1, act: 'Lie down' }, reception: { s: 1 }, cabinet: { s: 1, act: 'Raid medicine cabinet' }, rug: { s: 0 },
  teller: { s: 1 }, safe: { s: 1, act: 'Crack safe' }, forklift: { s: 1 }, drawer: { s: 1, act: 'Search drawers' }, stove: { s: 1, act: 'Cook a meal' }, change: { s: 1, act: 'Get tokens' },
  wbench: { s: 1, act: 'Weapon workbench' }, pshelf: { s: 1, act: 'Browse the shelves' }, target: { s: 1, act: 'Shooting range' }, lockers: { s: 1, act: 'Search lockers' }, rack: { s: 1 }, stage: { s: 0, act: 'Tip the dancers  $20' }, pole: { s: 1 }, vip: { s: 1, act: 'VIP room  $200' }, neonsign: { s: 0 }, spot: { s: 0 },
};
function makeInterior0(b) {
  const rng = mulberry32(b.id * 7919 + 13);
  const ty = b.type;
  let w = 12, h = 9, floor = 'wood';
  const items = [], npcs = [];
  const I = (t, x, y, ww, hh, ex) => items.push(Object.assign({ t, x, y, w: ww || 1, h: hh || 1, used: 0 }, ex || {}));
  const P = (role, x, y, ex) => npcs.push(Object.assign({ role, x, y }, ex || {}));
  switch (ty) {
    case 'gunshop': floor = 'tile';
      I('counter', 2, 2.4, 8, .8); P('clerk', 6, 1.4, { shop: 'gun' }); I('register', 3, 2.2, .8, .8);
      const ws = ['pistol', 'uzi', 'shotgun', 'rifle', 'rocket']; I('wbench', 8.6, 6.9, 1.3, .8);
      ws.forEach((wid, i) => I('case', 1.3 + i * 2, 5.2, 1.4, .9, { wpn: wid }));
      I('case', 1.3, 7, 1.4, .9, { wpn: 'armor' }); I('case', 3.3, 7, 1.4, .9, { wpn: 'bolt' }); I('case', 5.3, 7, 1.4, .9, { wpn: 'sniper' }); I('case', 7, 7.6, .9, .6, { wpn: 'knife' }); I('target', 10, 6.8, 1, 1); I('plant', .6, .6);
      for (let x = 1; x < 11; x += 1.5) I('rack', x, .3, 1.2, .4);
      break;
    case 'diner': floor = 'check';
      I('counter', 1, 2, 7, .8); for (let x = 1.5; x < 8; x += 1.5) I('stool', x, 3.2, .6, .6);
      P('clerk', 4, 1, { shop: 'food' }); I('stove', 1, .4, 2, .7); I('fridge', 6, .3, 1, .8);
      I('booth', 9.4, 1, 2, .5); I('table', 9.6, 1.7, 1.6, .9); I('booth', 9.4, 2.8, 2, .5);
      I('booth', 9.4, 4.5, 2, .5); I('table', 9.6, 5.2, 1.6, .9); I('booth', 9.4, 6.3, 2, .5);
      I('jukebox', .6, 6.6, 1, .8); I('arcade', .6, 4.8, 1, .9); I('toilet', 7, 7.2, .8, .8); I('tv', 3, .3, 1.2, .3);
      P('patron', 2.5, 3.5, { sit: 1 }); P('patron', 10.4, 3.9, { sit: 1 }); if (rng() < .6) P('patron', 6, 5.5);
      break;
    case 'bar': floor = 'wood';
      I('bar', 1, 1.6, 6, .9); for (let x = 1.5; x < 7; x += 1.3) I('stool', x, 2.9, .6, .6);
      P('clerk', 3.5, .9, { shop: 'bar' }); I('pool', 7.5, 3.5, 3, 1.6); I('piano', 1, 6.5, 2, .9); I('jukebox', 11, .6, .8, .8);
      I('table', 4.5, 6, 1.2, 1.2); I('chair', 4, 7.3, .6, .6); I('tv', 9, .3, 1.4, .3); I('toilet', 10.8, 7.4, .8, .8);
      P('patron', 2.8, 3.2, { sit: 1 }); P('patron', 8, 2.8); P('patron', 5, 7.5, { sit: 1 }); if (rng() < .5) P('gang', 9.5, 6.5);
      break;
    case 'club': w = 14; h = 10; floor = 'dark';
      I('dance', 4, 3.5, 6, 4); I('dj', 5.5, .5, 3, 1); P('dj', 7, .9, { still: 1 }); I('bar', 11.2, 1, .9, 5); P('clerk', 12.6, 3, { shop: 'bar' });
      for (let i = 0; i < 6; i++) P('dancer', 4.5 + rng() * 5, 4 + rng() * 3, { dance: 1 });
      I('sofa', .6, 2, .8, 2.5); I('sofa', .6, 6, .8, 2.5); P('bouncer', 5.5, 8.8, { still: 1 }); I('toilet', 13, 8.6, .7, .7);
      break;
    case 'pawn': floor = 'wood';
      I('counter', 2, 2.4, 8, .8); P('clerk', 6, 1.4, { shop: 'pawn' }); I('register', 3, 2.2, .8, .8); I('safe', 10.4, .4, .8, .8);
      ['🎸', '📺', '⌚', '📷', '💍', '🎮', '🖼', '📻'].forEach((e, i) => I('pshelf', 1 + (i % 4) * 2.6, 5 + Math.floor(i / 4) * 1.9, 1.5, .9, { e }));
      I('plant', .6, .6); if (rng() < .6) P('patron', 9, 4.2);
      break;
    case 'strip': w = 14; h = 10; floor = 'dark';
      I('stage', 4, .4, 6, 3.2); I('pole', 5.4, 1.6, .25, .25); I('pole', 7, 1.2, .25, .25); I('pole', 8.6, 1.6, .25, .25);
      P('perf', 5.5, 2.1, { pole: [5.52, 1.72] }); P('perf', 7.1, 1.7, { pole: [7.12, 1.32] }); P('perf', 8.7, 2.1, { pole: [8.72, 1.72] });
      I('bar', 12.2, 1, .9, 5); P('clerk', 13.2, 3, { shop: 'bar' }); for (let y = 1.4; y < 6; y += 1.2) I('stool', 11.4, y, .6, .6);
      I('vip', .4, .6, 2.4, 1.6); I('vip', .4, 3, 2.4, 1.6); I('sofa', 4, 5.2, 2.6, .8); I('sofa', 7.4, 5.2, 2.6, .8); I('table', 4.8, 6.3, 1, .8); I('table', 8.2, 6.3, 1, .8);
      P('patron', 5, 5.5, { sit: 1 }); P('patron', 8.4, 5.5, { sit: 1 }); P('patron', 11.6, 2.7, { sit: 1 }); if (rng() < .6) P('perf', 2.2, 6.8);
      I('neonsign', 4.5, 8.6, 5, .5); P('bouncer', 5.6, 8.8, { still: 1 }); I('toilet', 13, 8.6, .7, .7); I('atm', .5, 8.4, .8, .8);
      break;
    case 'store': floor = 'tile';
      I('counter', 1, 6.5, 3, .8); I('register', 1.4, 6.4, .8, .8); P('clerk', 2, 7.6, { shop: 'store' });
      I('shelf', 5, 2, .8, 4); I('shelf', 7.5, 2, .8, 4); I('shelf', 10, 2, .8, 4); for (let x = 1; x < 11; x += 1.6) I('fridge', x, .3, 1.4, .8);
      I('atm', 11.2, 7.2, .8, .8); I('vend', 4.5, 7.5, .9, .8); I('rack', 1, 3, .5, 2);
      if (rng() < .7) P('patron', 6.3, 4); if (rng() < .5) P('patron', 9, 6);
      break;
    case 'hospital': w = 14; h = 10; floor = 'tile';
      I('reception', 5, 6, 4, .9); P('nurse', 7, 5.1, { shop: 'hospital', still: 1 });
      for (let x = 1; x < 13; x += 2.5) I('gurney', x + .1, .6, .95, 1.75); I('cabinet', 12.5, 4, .8, 1.5); I('plant', .6, 8.6); I('plant', 13, 8.6); I('vend', .6, 5, .9, .8);
      P('doctor', 4, 3.3); P('patient', 1.6, 1.6, { lie: 1, still: 1 }); P('patient', 9, 1.6, { lie: 1, still: 1 }); I('chair', 1.5, 7, .7, .7); I('chair', 2.5, 7, .7, .7); P('patron', 2.5, 7.3, { sit: 1 });
      break;
    case 'police': w = 14; h = 10; floor = 'tile';
      I('reception', 4.5, 6, 5, .9); P('cop', 7, 5, { shop: 'police', still: 1, desk: 1 });
      I('bars', 1, 2.6, 4, .3); I('bars', 9, 2.6, 4, .3); P('prisoner', 2.5, 1.2); P('prisoner', 11, 1.4);
      I('desk', 6, .5, 1.6, .9); I('computer', 6.4, .5, .8, .5); I('lockers', 13.2, 4, .6, 2); P('cop', 11.5, 4.5); P('cop', 2.5, 4.5); I('cooler', .6, 8.6, .7, .7);
      break;
    case 'bank': w = 14; h = 10; floor = 'marble';
      I('teller', 2, 3, 10, .8); P('teller', 4, 2.2, { shop: 'bank', still: 1 }); P('teller', 9.5, 2.2, { shop: 'bank', still: 1 });
      I('vault', 6, .2, 2, .6); I('atm', .6, 7, .8, .8); I('atm', 12.6, 7, .8, .8); I('plant', .6, 4.4); I('plant', 13, 4.4);
      P('guard', 11.5, 8.2, { armed: 1 }); P('patron', 5.5, 5); P('patron', 8.5, 6.5); I('rug', 5, 5.8, 4, 2);
      break;
    case 'safehouse': floor = 'carpet';
      I('bed', 1, .5, 1.25, 1.8); I('wardrobe', 3.5, .3, 1.6, .7); I('stash', 10.5, .4, 1, .8); I('fridge', 8, .3, 1, .8); I('stove', 9, .3, 1, .7);
      I('sofa', 5, 6, 3, .8); I('tv', 5.8, 3.8, 1.4, .4); I('rug', 4.6, 4.6, 3.8, 1.2); I('toilet', 11, 7.4, .7, .7); I('books', .4, 5, .5, 2); I('plant', 11.2, 4.2);
      break;
    case 'home': floor = rng() < .5 ? 'carpet' : 'wood';
      I('bed', 1, .5, 1.2, 1.75); I('drawer', 3.4, .4, 1.2, .6); I('sofa', 6, 6, 2.6, .8); I('tv', 6.6, 3.9, 1.3, .4); I('fridge', 10.4, .3, 1, .8); I('stove', 9.3, .3, 1, .7);
      I('table', 9.5, 3.5, 1.4, 1.2); I('chair', 9, 4, .5, .5); I('books', .4, 5, .5, 2); I('toilet', 11, 7.4, .7, .7); I('rug', 5.6, 4.6, 3.4, 1.2);
      P('resident', 7, 5.3, { name2: 1 }); if (rng() < .4) P('resident', 10, 4.5);
      break;
    case 'office': w = 14; h = 10; floor = 'carpet';
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { I('desk', 1.5 + c * 4, 2 + r * 3.5, 2, .9); I('computer', 2.1 + c * 4, 2 + r * 3.5, .8, .5); if (rng() < .65) P('worker', 2.5 + c * 4, 3.3 + r * 3.5, { sit: 1 }); }
      I('cooler', 13.1, .5, .6, .6); I('plant', .5, .5); I('books', 13.3, 4, .5, 2.5); I('safe', 12.5, 8.5, .8, .8); I('desk', 9.5, 8.3, 2.2, .9); P('boss', 10.5, 7.6);
      break;
    case 'barn': case 'warehouse': w = 14; h = 10; floor = 'concrete';
      for (let i = 0; i < 9; i++) I('crate', 1 + rng() * 11, .5 + rng() * 6.5, 1, 1, { stack: rng() < .4 });
      I('forklift', 10, 7.5, 1, 1.6); I('lockers', .4, 7, .6, 2);
      if (b.d === 'docks' || rng() < .4) { P('gang', 4, 6); P('gang', 9, 3); } else P('worker', 6, 7);
      break;
    case 'arcade': floor = 'dark';
      for (let x = 1; x < 11; x += 1.8) { I('arcade', x, .4, 1, .9); }
      for (let x = 1; x < 11; x += 1.8) { I('arcade', x, 4, 1, .9); }
      I('change', 11, 6.5, .7, 1); I('vend', .5, 6.5, .9, .8); P('kid', 3, 1.8); P('kid', 7.4, 5.4); P('clerk', 10.5, 7.8, { still: 1, shop: 'arcade' });
      break;
    default: I('plant', 1, 1);
  }
  // walls
  const solid = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) solid[y * w + x] = 1;
  const dx = Math.floor(w / 2); solid[(h - 1) * w + dx] = 0;
  return { b, w, h, floor, items, npcDefs: npcs, solid, door: { x: (dx + .5) * T, y: (h - .6) * T }, peds: null, loot: {} };
}
