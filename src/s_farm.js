// ================= COUNTRY LIFE: farms, crops, livestock, cooking, markets, traders, hunting, pets =================
// ---------- goods (values are what a co-op pays; shops charge ~35% more) ----------
Object.assign(ITEMS, {
  wheat: { n: 'Wheat', v: 12, w: 1, k: 'farm', e: '🌾' }, corn: { n: 'Corn', v: 16, w: 1, k: 'farm', e: '🌽' }, potato: { n: 'Potatoes', v: 9, w: 1, k: 'farm', e: '🥔' },
  carrot: { n: 'Carrots', v: 7, w: 1, k: 'farm', e: '🥕' }, tomato: { n: 'Tomatoes', v: 12, w: 1, k: 'farm', e: '🍅' }, pumpkin: { n: 'Pumpkin', v: 55, w: 3, k: 'farm', e: '🎃' }, herbs: { n: 'Herbs', v: 8, w: 1, k: 'farm', e: '🍃' },
  egg: { n: 'Eggs', v: 5, w: 1, k: 'farm', e: '🥚', heal: 3 }, milk: { n: 'Milk', v: 15, w: 1, k: 'farm', e: '🥛', heal: 6 },
  beef: { n: 'Beef', v: 38, w: 1, k: 'meat', e: '🥩' }, pork: { n: 'Pork', v: 28, w: 1, k: 'meat', e: '🥓' }, poultry: { n: 'Chicken meat', v: 22, w: 1, k: 'meat', e: '🍗' },
  venison: { n: 'Venison', v: 45, w: 1, k: 'meat', e: '🍖' }, boarmeat: { n: 'Boar meat', v: 38, w: 1, k: 'meat', e: '🐗' }, rabbitmeat: { n: 'Rabbit meat', v: 20, w: 1, k: 'meat', e: '🐇' }, turkey: { n: 'Wild turkey', v: 30, w: 1, k: 'meat', e: '🦃' },
  cowhide: { n: 'Cowhide', v: 70, w: 3, k: 'meat', e: '🟫' }, deerhide: { n: 'Deer hide', v: 80, w: 3, k: 'meat', e: '🦌' }, tusk: { n: 'Boar tusks', v: 50, w: 1, k: 'meat', e: '🦷' }, pelt: { n: 'Rabbit pelt', v: 25, w: 1, k: 'meat', e: '🧶' }, feathers: { n: 'Feathers', v: 10, w: 1, k: 'meat', e: '🪶' },
  flour: { n: 'Flour', v: 30, w: 1, k: 'pantry', e: '🥣' }, butter: { n: 'Butter', v: 40, w: 1, k: 'pantry', e: '🧈' }, cheese: { n: 'Cheese', v: 65, w: 1, k: 'pantry', e: '🧀', heal: 10 }, salt: { n: 'Salt', v: 3, w: 1, k: 'pantry', e: '🧂' },
  jerky: { n: 'Jerky', v: 70, w: 1, k: 'food', e: '🥓', heal: 15 }, bread: { n: 'Bread', v: 25, w: 1, k: 'food', e: '🍞', heal: 20 }, omelette: { n: 'Omelette', v: 40, w: 1, k: 'food', e: '🍳', heal: 35 },
  pancakes: { n: 'Pancakes', v: 65, w: 1, k: 'food', e: '🥞', heal: 30 }, applepie: { n: 'Apple pie', v: 120, w: 2, k: 'food', e: '🥧', heal: 50 }, pumpkinpie: { n: 'Pumpkin pie', v: 175, w: 2, k: 'food', e: '🥧', heal: 55 },
  cornbread: { n: 'Cornbread', v: 70, w: 1, k: 'food', e: '🫓', heal: 30 }, mash: { n: 'Mashed potatoes', v: 105, w: 1, k: 'food', e: '🥣', heal: 40 }, vegstew: { n: 'Vegetable stew', v: 70, w: 1, k: 'food', e: '🍲', heal: 45 },
  venstew: { n: 'Venison stew', v: 125, w: 1, k: 'food', e: '🍲', heal: 60 }, steak: { n: 'Steak dinner', v: 150, w: 1, k: 'food', e: '🍽', heal: 70 }, friedchicken: { n: 'Fried chicken', v: 120, w: 1, k: 'food', e: '🍗', heal: 55 },
  fishfry: { n: 'Fish fry', v: 95, w: 1, k: 'food', e: '🐟', heal: 45 }, porkchops: { n: 'Pork chops', v: 80, w: 1, k: 'food', e: '🍖', heal: 45 }, breakfast: { n: 'Farm breakfast', v: 100, w: 1, k: 'food', e: '🍳', heal: 60 },
  roastturkey: { n: 'Roast turkey', v: 95, w: 2, k: 'food', e: '🦃', heal: 60 }, rabbitpie: { n: 'Rabbit pie', v: 85, w: 1, k: 'food', e: '🥧', heal: 45 },
});
const CROPS = { wheat: { seed: 15, h: 12, y: 6, c: '#e1b84a' }, corn: { seed: 20, h: 18, y: 6, c: '#f1c40f' }, potato: { seed: 15, h: 12, y: 7, c: '#8d6e3f' }, carrot: { seed: 12, h: 9, y: 6, c: '#e67e22' },
  tomato: { seed: 25, h: 18, y: 7, c: '#e74c3c' }, pumpkin: { seed: 40, h: 24, y: 3, c: '#e67e22' }, herbs: { seed: 10, h: 6, y: 4, c: '#27ae60' } };
for (const k in CROPS) ITEMS['seed_' + k] = { n: ITEMS[k].n.replace(/s$/, '') + ' seeds', v: Math.round(CROPS[k].seed * .5), w: 0, k: 'seed', e: '🌱', crop: k };
const PLANTER_OK = ['herbs', 'tomato', 'carrot', 'potato'];
// recipes: [id, {ingredient: n}, where] — where: 'k' kitchen, 'p' processing
const RECIPES = [
  ['flour', { wheat: 2 }, 'p'], ['butter', { milk: 2 }, 'p'], ['cheese', { milk: 3 }, 'p'], ['jerky', { venison: 1, salt: 1 }, 'p'], ['jerky', { beef: 1, salt: 1 }, 'p'], ['jerky', { boarmeat: 1, salt: 1 }, 'p'],
  ['bread', { flour: 1, egg: 1 }, 'k'], ['omelette', { egg: 2, milk: 1 }, 'k'], ['pancakes', { flour: 1, egg: 1, milk: 1 }, 'k'], ['cornbread', { corn: 2, egg: 1, milk: 1 }, 'k'],
  ['applepie', { flour: 1, butter: 1, apple: 3 }, 'k'], ['pumpkinpie', { flour: 1, butter: 1, pumpkin: 1 }, 'k'], ['mash', { potato: 3, butter: 1, milk: 1 }, 'k'], ['vegstew', { potato: 1, carrot: 2, tomato: 1, herbs: 1 }, 'k'],
  ['venstew', { venison: 1, potato: 2, carrot: 1, herbs: 1 }, 'k'], ['steak', { beef: 1, potato: 2, butter: 1 }, 'k'], ['friedchicken', { poultry: 1, flour: 1, egg: 1 }, 'k'], ['fishfry', { fish: 1, flour: 1 }, 'k'],
  ['porkchops', { pork: 1, potato: 1, apple: 1 }, 'k'], ['breakfast', { egg: 2, pork: 1, bread: 1 }, 'k'], ['roastturkey', { turkey: 2, herbs: 1, potato: 1 }, 'k'], ['rabbitpie', { rabbitmeat: 1, flour: 1, carrot: 1 }, 'k']];
const GROCER = ['flour', 'egg', 'milk', 'butter', 'cheese', 'salt', 'potato', 'carrot', 'tomato', 'herbs', 'apple', 'seed_herbs', 'seed_tomato', 'seed_carrot', 'seed_potato'];
const ANIM = {
  chicken: { n: 'Chicken', buy: 40, feed: .5, hp: 8, r: 6, sp: 60, meat: [['poultry', 2], ['feathers', 1]] }, pig: { n: 'Pig', buy: 90, feed: 2, hp: 40, r: 11, sp: 55, grow: 48, meat: [['pork', 6]] },
  cow: { n: 'Cow', buy: 750, feed: 4, hp: 80, r: 16, sp: 40, meat: [['beef', 8], ['cowhide', 1]] },
  deer: { n: 'Deer', hp: 55, r: 12, sp: 280, wild: 1, flee: 260, meat: [['venison', 4], ['deerhide', 1]] }, boar: { n: 'Wild boar', hp: 110, r: 11, sp: 210, wild: 1, flee: 0, meat: [['boarmeat', 3], ['tusk', 1]] },
  rabbit: { n: 'Rabbit', hp: 12, r: 5, sp: 240, wild: 1, flee: 200, meat: [['rabbitmeat', 1], ['pelt', 1]] }, turkey: { n: 'Wild turkey', hp: 22, r: 7, sp: 160, wild: 1, flee: 190, meat: [['turkey', 2], ['feathers', 2]] },
  dog: { n: 'Dog', buy: 600, hp: 60, r: 8, sp: 230, pet: 1 }, cat: { n: 'Cat', buy: 350, hp: 30, r: 6, sp: 210, pet: 1 }, bunny: { n: 'Rabbit', buy: 150, hp: 15, r: 5, sp: 160, pet: 1 },
};
const GH = () => LIFE().gh || 0;
Object.assign(FLAVOR, { egg: 'Fresh from the coop.', milk: 'Still warm.', jerky: 'Keeps forever. Tastes like a campfire.', applepie: 'Grandma would be proud.', steak: 'With all the trimmings.' });

// ---------- where goods can come from ----------
function srcList(withFarm) { const L = [G.inv]; if (G.scene && canDecorate()) L.push(G.stash.items); const f = withFarm !== false && nearFarm(); if (f) L.push(f.store); return L; }
const have = (id, L) => (L || srcList()).reduce((s, o) => s + (o[id] | 0), 0);
function take(id, n, L) { for (const o of (L || srcList())) { const k = Math.min(n, o[id] | 0); if (k) { o[id] -= k; if (!o[id]) delete o[id]; n -= k; } if (!n) break; } }
function giveTo(id, n, pref) { let k = invAdd(id, n, 1); if (k < n && pref) { pref[id] = (pref[id] | 0) + (n - k); k = n; } if (k < n) { G.stash.items[id] = (G.stash.items[id] | 0) + (n - k); toast('Bag full — the rest went to your home stash'); } }
function nearCarTrunk() { const p = G.player, c = pCar() || G.cars.filter(c => c.owned && !c.dead && dist2(c.x, c.y, p.x, p.y) < 380 * 380 && TRUNKCAP[c.type] > 0).sort((a, b) => dist2(a.x, a.y, p.x, p.y) - dist2(b.x, b.y, p.x, p.y))[0]; if (c && !c.trunk) c.trunk = {}; return c && c.trunk ? c : null; }

// ---------- farms ----------
const FARMS = []; let COOP = null;
function farmOf(b) { return FARMS.find(f => f.b === b); }
function farmData(f) { const O = LIFE().own[f.b.id]; if (!O) return null; if (!O.farm) O.farm = { plots: {}, animals: [], feed: 40, store: {}, stand: {}, till: 0, up: {}, nextId: 1 }; return O.farm; }
function nearFarm() { const p = G.scene ? G.outPos : G.player; for (const f of FARMS) { if (!owned(f.b)) continue; if (G.scene && G.scene.b === f.b) return farmData(f); if (!G.scene && p.x > f.x0 - 64 && p.y > f.y0 - 64 && p.x < f.x1 + 64 && p.y < f.y1 + 64) return farmData(f); } return null; }
function farmAt(x, y) { for (const f of FARMS) if (x > f.x0 && y > f.y0 && x < f.x1 && y < f.y1) return f; return null; }
function plotAt(f, x, y) { const tx = Math.floor(x / T), ty = Math.floor(y / T); return f.plots.findIndex(p => tx >= p[0] && ty >= p[1] && tx < p[0] + 2 && ty < p[1] + 2); }
const cropProg = (pl, F) => pl && pl.c ? clamp((GH() - pl.t) / (CROPS[pl.c].h / (F && F.up.irr ? 1.3 : 1)), 0, 1) : 0;

// ---------- world: irregular countryside, farms for sale, the co-op ----------
function setTileX(x, y, t) { const k = idx(x, y); W.tile[k] = t; W.solid[k] = t === TILE.WATER || t === TILE.BLD ? 1 : 0;
  W.timg[k] = t === TILE.FIELD ? TIMGI['field' + ((Math.floor((x - 4) / 6) + Math.floor((y - 4) / 6) * 2 + Math.floor(x / RSP)) % 3)] : t === TILE.WATER ? TIMGI.water0 : t === TILE.PATH ? TIMGI.path : t === TILE.DIRT ? TIMGI.dirt : t === TILE.SAND ? TIMGI.sand : t === TILE.LOT ? TIMGI[x % 2 === 0 ? 'lot1' : 'lot0'] : TIMGI['grass' + ((x * 13 + y * 7) % 11 === 0 ? 3 : (x + y * 3) % 3)]; }
function killProps(test) { W.props = W.props.filter(p => { if (!test(p)) return true; const k = idx(Math.floor(p.x / T), Math.floor(p.y / T)), a = W.pgrid[k]; if (a) W.pgrid[k] = a.filter(q => q !== p); return false; }); }
function doorOn(b, f) { const fi = faceInfo(b, f), t = Math.floor((fi.len - 1) / 2), [ox, oy] = fi.out(t), [fx, fy] = FACEV[f]; b.door = { f, t, tx: ox, ty: oy, x: (ox + .5) * T - fx * T * .3, y: (oy + .5) * T - fy * T * .3 }; }
function countryside() {
  const rng = mulberry32(4242), r = (a, b) => a + rng() * (b - a);
  const RUR = ['farmland', 'farmland2', 'ranch', 'ranch2', 'orchard', 'orchard2'];
  const coopBlocks = [[0, 10], [0, 11]];
  for (const blk of W.blocks) {
    const base = DISTRICTS[blk.d] && (DISTRICTS[blk.d].as || blk.d); if (!RUR.includes(blk.d) && !RUR.includes(base)) continue;
    if (coopBlocks.some(([i, j]) => i === blk.bi && j === blk.bj)) continue;
    const { bx, by } = blk, s1 = r(0, 6.28), s2 = r(0, 6.28), free = (x, y) => { const t = W.tile[idx(x, y)]; return t === TILE.FIELD || t === TILE.GRASS; };
    // organic field edges: noisy margin eats into the rectangle
    for (let y = by; y < by + 12; y++) for (let x = bx; x < bx + 12; x++) { if (W.tile[idx(x, y)] !== TILE.FIELD) continue; const e = Math.min(x - bx, y - by, bx + 11 - x, by + 11 - y), n = Math.sin(x * .9 + s1) + Math.cos(y * .8 + s2) + Math.sin((x + y) * .45 + s1 * 2); if (e < 2 && n > .2 + e * .8) setTileX(x, y, TILE.GRASS); }
    // a pond of irregular shape
    if (rng() < .55) { const cx = bx + r(3, 9), cy = by + r(6, 10), ra = r(1.4, 2.6), rb = r(1.1, 2.2), rot = r(0, 3);
      for (let y = Math.floor(cy - 3); y <= cy + 3; y++) for (let x = Math.floor(cx - 3); x <= cx + 3; x++) { if (x < bx || y < by || x > bx + 11 || y > by + 11 || !free(x, y)) continue; const dx = x + .5 - cx, dy = y + .5 - cy, u = dx * Math.cos(rot) + dy * Math.sin(rot), v = -dx * Math.sin(rot) + dy * Math.cos(rot), d = (u / ra) ** 2 + (v / rb) ** 2 + Math.sin(Math.atan2(v, u) * 3 + s1) * .25; if (d < 1) setTileX(x, y, TILE.WATER); else if (d < 1.7) setTileX(x, y, TILE.GRASS); }
      killProps(p => { const t = tileAt(Math.floor(p.x / T), Math.floor(p.y / T)); return t === TILE.WATER; }); W.parkSpots = W.parkSpots.filter(s => tileAt(Math.floor(s.x / T), Math.floor(s.y / T)) !== TILE.WATER);
      for (let i = 0; i < 4; i++) { const a = r(0, 6.28), x = cx + Math.cos(a) * (ra + .9), y = cy + Math.sin(a) * (rb + .9); if (free(Math.floor(x), Math.floor(y))) addProp('bush', x * T, y * T); } }
    // a winding farm track
    { let x = bx + r(2, 10), y = by + 4; const tgt = by + 11; let a = Math.PI / 2; for (let i = 0; i < 14 && y < tgt; i++) { const tx = Math.floor(x), ty = Math.floor(y); if (tx >= bx && tx < bx + 12 && free(tx, ty)) setTileX(tx, ty, TILE.PATH); a += r(-.5, .5); a = clamp(a, .6, 2.5); x += Math.cos(a) * .8; y += Math.sin(a) * .8; } }
    // hedgerow / tree line along a curve
    if (rng() < .7) { const y0 = by + r(5, 9), amp = r(.5, 1.5), ph = r(0, 6); for (let x = bx + .5; x < bx + 12; x += r(.8, 1.4)) { const y = y0 + Math.sin(x * .7 + ph) * amp, tx = Math.floor(x), ty = Math.floor(y); if (W.tile[idx(tx, ty)] === TILE.GRASS || (W.tile[idx(tx, ty)] === TILE.FIELD && rng() < .4)) { if (W.tile[idx(tx, ty)] === TILE.FIELD) setTileX(tx, ty, TILE.GRASS); addProp(rng() < .6 ? 'bush' : 'tree', x * T, y * T); } } }
  }
  // ---- farms for sale: farmhouses, ranch houses and orchard houses
  const PRICE = { farmland: 30000, ranch: 45000, orchard: 25000 }, NAMES = ['Miller Farm', 'Old Creek Farm', 'Sunny Acres', 'Hollow Pine Farm', 'Red Barn Farm', 'Willow Bend Farm'];
  let ni = 0; const capK = { 'Farmhouse': 6, 'Ranch House': 2, 'Orchard House': 2 }, gotK = {};
  for (const b of W.buildings) {
    if (!b.door || !capK[b.name] || b.realty || (gotK[b.name] | 0) >= capK[b.name]) continue;
    const blk = W.blocks.find(k => b.x >= k.bx && b.x < k.bx + 12 && b.y >= k.by && b.y < k.by + 12); if (!blk) continue;
    const base = DISTRICTS[blk.d].as || blk.d, f = { b, blk, x0: blk.bx * T, y0: blk.by * T, x1: (blk.bx + 12) * T, y1: (blk.by + 12) * T, kind: base, plots: [], pasture: [] };
    // lay out a proper planted field: 2x2 plots on open field/grass, cleared of clutter
    const want = base === 'farmland' ? 24 : 12, cand = [];
    for (let y = blk.by; y < blk.by + 11; y += 2) for (let x = blk.bx; x < blk.bx + 11; x += 2) { const ts = [0, 1].flatMap(dy => [0, 1].map(dx => W.tile[idx(x + dx, y + dy)])); if (ts.some(t => t !== TILE.FIELD && t !== TILE.GRASS)) continue; const cx = (x + 1) * T, cy = (y + 1) * T; if (propsNear(cx, cy, 90).some(p => ['silo', 'well', 'trough', 'fsign', 'coop', 'fstand', 'mailbox'].includes(p.t) && dist(p.x, p.y, cx, cy) < 110)) continue; if (dist(cx, cy, b.door.x, b.door.y) < 2.2 * T) continue; cand.push({ x, y, k: ts.filter(t => t === TILE.FIELD).length * 10 - Math.hypot(cx - b.door.x, cy - b.door.y) / T }); }
    cand.sort((a, c) => c.k - a.k);
    for (const c of cand.slice(0, want)) { f.plots.push([c.x, c.y]); for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) setTileX(c.x + dx, c.y + dy, TILE.FIELD); killProps(p => p.x >= c.x * T && p.x < (c.x + 2) * T && p.y >= c.y * T && p.y < (c.y + 2) * T); }
    f.plots.sort((a, c) => a[1] - c[1] || a[0] - c[0]); if (f.plots.length < 4) continue;
    const inPlot = (x, y) => f.plots.some(([px, py]) => x >= px && y >= py && x < px + 2 && y < py + 2);
    for (let y = blk.by; y < blk.by + 12; y++) for (let x = blk.bx; x < blk.bx + 12; x++) { const t = W.tile[idx(x, y)]; if ((t === TILE.GRASS || t === TILE.DIRT) && !W.solid[idx(x, y)] && !inPlot(x, y)) f.pasture.push([x, y]); }
    if (f.pasture.length < 6) continue;
    gotK[b.name] = (gotK[b.name] | 0) + 1; b.name = base === 'ranch' ? ['Two Oaks Ranch', 'Prairie Rose Ranch'][(gotK['Ranch House'] - 1) % 2] : base === 'orchard' ? ['Applegate Homestead', 'Cherry Hill Orchard'][(gotK['Orchard House'] - 1) % 2] : NAMES[ni++ % NAMES.length]; b.locked = 1; const price = PRICE[base] || 45000;
    b.realty = { id: b.id, name: b.name, kind: 'farm', price }; W.realty.push(b.realty);
    const [fx, fy] = FACEV[b.door.f], dx = (b.door.tx + .5) * T, dy = (b.door.ty + .5) * T, px = -fy, py = fx;
    const spot = (pref) => { let best = null, bd = 1e9; for (const [x, y] of f.pasture) { const cx = (x + .5) * T, cy = (y + .5) * T, d = dist(cx, cy, pref[0], pref[1]); if (d < bd && !propsNear(cx, cy, 50).some(p => p.solid)) { bd = d; best = [cx, cy]; } } return best; };
    const s1 = spot([dx + px * 70 + fx * 40, dy + py * 70 + fy * 40]); if (s1) f.sign = addProp('fsign', s1[0], s1[1], { farm: f });
    const s2 = spot([f.x0 + 1.2 * T, f.y1 - 1.2 * T]); if (s2) f.coop = addProp('coop', s2[0], s2[1], { farm: f });
    const s3 = spot([f.x1 - .8 * T, f.y0 + .8 * T]); if (s3) f.stand = addProp('fstand', s3[0], s3[1], { farm: f });
    FARMS.push(f);
  }
  // ---- Big Valley Farm Co-op: two blocks on the far west edge
  const A = W.blocks.find(k => k.bi === 0 && k.bj === 10), B = W.blocks.find(k => k.bi === 0 && k.bj === 11); if (!A || !B) return;
  const inA = (x, y) => x >= A.bx * T && y >= A.by * T && x < (A.bx + 12) * T && y < (B.by + 12) * T;
  killProps(p => inA(p.x, p.y)); W.ruralSpots = W.ruralSpots.filter(s => !inA(s.x, s.y)); W.parkSpots = W.parkSpots.filter(s => !inA(s.x, s.y)); W.pickupSpots = W.pickupSpots.filter(s => !inA(s.x, s.y)); W.dealerSpots = W.dealerSpots.filter(s => !inA(s.x, s.y));
  const keep = W.buildings.filter(b => b.x >= A.bx && b.x < A.bx + 12 && b.y >= A.by && b.y < B.by + 12); for (const b of keep) { b.name = 'Bunkhouse'; b.type = 'home'; }
  for (const blk of [A, B]) for (let y = blk.by; y < blk.by + 12; y++) for (let x = blk.bx; x < blk.bx + 12; x++) { if (W.tile[idx(x, y)] === TILE.BLD) continue; const ring = x === blk.bx || y === blk.by || x === blk.bx + 11 || y === blk.by + 11; setTileX(x, y, blk === A ? (ring ? TILE.GRASS : (y < blk.by + 6 ? TILE.FIELD : TILE.GRASS)) : (y > blk.by + 7 ? TILE.DIRT : TILE.GRASS)); }
  for (let x = B.bx + 4; x < B.bx + 12; x++) for (let y = B.by + 8; y < B.by + 12; y++) if (W.tile[idx(x, y)] !== TILE.BLD) setTileX(x, y, TILE.DIRT);
  const mk = (x, y, w, h, wall, type, name, f) => { if (W.buildings.some(b => x < b.x + b.w + 1 && x + w + 1 > b.x && y < b.y + b.h + 1 && y + h + 1 > b.y)) return null; const r2 = mulberry32(x * 97 + y), b = makeBuilding({ x, y, w, h }, 'farmland', DISTRICTS.farmland, r2, (a, c) => a + Math.floor(r2() * (c - a + 1))); b.wall = wall; b.type = type; b.name = name; b.H = 2; for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { W.solid[idx(xx, yy)] = 1; W.timg[idx(xx, yy)] = TIMGI.bld; } doorOn(b, f); return b; };
  const barn = mk(B.bx + 1, B.by + 1, 5, 4, 14, 'barn', 'Big Valley Co-op Barn', 2) || null, feed = mk(B.bx + 8, B.by + 2, 3, 3, 12, 'store', 'Big Valley Feed & Seed', 2);
  if (feed) feed.sub = 'coop';
  const C = { x: (B.bx + 6.5) * T, y: (B.by + 9.2) * T, blkA: A, blkB: B };
  addProp('mstall', C.x, C.y - 20, { coop: 1 }); addProp('silo', (A.bx + 10) * T, (A.by + 2) * T); addProp('silo', (A.bx + 10) * T, (A.by + 3.7) * T);
  for (let i = 0; i < 6; i++) addProp('hay', (B.bx + 1.5 + i * .9) * T, (B.by + 6.5) * T); addProp('trough', (A.bx + 6) * T, (A.by + 9) * T); addProp('trough', (A.bx + 3) * T, (A.by + 9.5) * T);
  for (let x = A.bx + 1; x < A.bx + 11; x++) { addProp('fence', (x + .5) * T, (A.by + 6.6) * T); addProp('fence', (x + .5) * T, (A.by + 11.4) * T); }
  W.lifeSpots.push({ x: C.x, y: C.y + 26, kind: 'npc', role: 'vendor', vend: 'coop', name: 'Hank Dawson' }, { x: (A.bx + 8) * T, y: (A.by + 10.5) * T, kind: 'npc', role: 'rancher', vend: 'coop', vtab: 'stock', name: 'Earl Pruitt' });
  for (const [x, y, a] of [[B.bx + 3, B.by + 10.4, 0], [B.bx + 9, B.by + 10.6, Math.PI]]) W.parkSpots.push({ x: x * T, y: y * T, a, type: 'pickup' }); W.parkSpots.push({ x: (A.bx + 2) * T, y: (A.by + 3) * T, a: 0, type: 'tractor' });
  C.herd = []; for (let i = 0; i < 7; i++) C.herd.push({ k: i < 4 ? 'cow' : 'pig', x: (A.bx + 1.5 + rng() * 9) * T, y: (A.by + 7.3 + rng() * 3.6) * T, b: [(A.bx + 1) * T, (A.by + 7) * T, (A.bx + 11) * T, (A.by + 11.2) * T] });
  for (let i = 0; i < 6; i++) C.herd.push({ k: 'chicken', x: (B.bx + 2 + rng() * 4) * T, y: (B.by + 6 + rng() * 1.5) * T, b: [(B.bx + 1) * T, (B.by + 5.5) * T, (B.bx + 7) * T, (B.by + 7.5) * T] });
  COOP = C; W.labels.push({ n: 'Big Valley Co-op', x: A.bx + 6, y: A.by + 12, big: 2 });
  // markets & pet store: re-purpose a few shops
  const claim = (d, sub, name) => { const b = W.buildings.find(b => b.type === 'store' && !b.sub && !b.realty && b.door && (b.d === d || DISTRICTS[b.d].as === d) && b.d === d); if (b) { b.sub = sub; b.name = name; } return b; };
  claim('town', 'market', 'Dusty Creek Farmers Market'); claim('town2', 'market', 'Pine Ridge Market'); claim('suburbs2', 'market', 'Vista Farmers Market'); claim('midtown', 'pets', 'Pawsome Pets'); claim('suburbs', 'pets', 'Furry Friends Pets') || claim('midtown2', 'pets', 'Furry Friends Pets') || claim('oldtown', 'pets', 'Furry Friends Pets');
}
Object.assign(PROPDEF, { fsign: { r: 8, solid: 1, act: 'Farm' }, coop: { r: 22, solid: 1, act: 'Chicken coop' }, fstand: { r: 18, solid: 1, act: 'Farm stand' }, mstall: { r: 26, solid: 1, act: 'Co-op market' }, fence: { r: 1, solid: 0 } });
Object.assign(RPROP, {
  fsign(p, sh) { const f = p.farm, own = f && owned(f.b); ctx.fillStyle = '#5d4037'; ctx.fillRect(-2, -2, 4, 14); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-15, -15, 34, 18); const ro = !own && f && remoteOwner(f.b); ctx.fillStyle = own ? '#2e7d32' : ro ? '#1565c0' : '#c0392b'; ctx.fillRect(-17, -17, 34, 16); ctx.fillStyle = '#fff'; ctx.font = 'bold 7px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(own ? 'YOUR FARM' : ro ? ro.slice(0, 10).toUpperCase() : 'FOR SALE', 0, -6); },
  coop(p, sh) { ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; ctx.fillRect(-20 + sh[0] * 6, -16 + sh[1] * 6, 40, 32); ctx.fillStyle = '#8d6e63'; ctx.fillRect(-20, -16, 40, 32); ctx.fillStyle = '#a1887f'; ctx.fillRect(-20, -16, 40, 6); ctx.fillStyle = '#6d4c41'; for (let i = -16; i < 20; i += 6) ctx.fillRect(i, -10, 1.5, 26); ctx.fillStyle = '#3e2723'; ctx.fillRect(-5, 8, 10, 8); ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.arc(14, -12, 3, 0, TAU); ctx.fill(); },
  fstand(p, sh) { ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; ctx.fillRect(-18 + sh[0] * 5, -10 + sh[1] * 5, 36, 22); ctx.fillStyle = '#8d6e63'; ctx.fillRect(-18, -8, 36, 18); const F = p.farm && owned(p.farm.b) ? farmData(p.farm) : null; let i = 0; if (F) for (const id in F.stand) { if (!(F.stand[id] > 0) || i > 7) continue; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(ITEMS[id].e, -13 + (i % 4) * 9, -1 + Math.floor(i / 4) * 9); i++; } ctx.fillStyle = '#c0392b'; ctx.fillRect(-20, -16, 40, 6); ctx.fillStyle = '#fff'; for (let x = -18; x < 20; x += 8) ctx.fillRect(x, -16, 4, 6); },
  mstall(p, sh) { ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; ctx.fillRect(-28 + sh[0] * 6, -14 + sh[1] * 6, 56, 30); ctx.fillStyle = '#795548'; ctx.fillRect(-28, -12, 56, 24); ctx.fillStyle = '#2e7d32'; ctx.fillRect(-30, -20, 60, 8); ctx.fillStyle = '#f1c40f'; for (let x = -28; x < 30; x += 10) ctx.fillRect(x, -20, 5, 8); ctx.font = '10px sans-serif'; ctx.textAlign = 'center'; ['🌽', '🥚', '🥛', '🥩', '🎃'].forEach((e, i) => ctx.fillText(e, -20 + i * 10, 4)); },
  fence(p) { ctx.fillStyle = '#6d4c41'; ctx.fillRect(-32, -1.5, 64, 3); ctx.fillStyle = '#5d4037'; ctx.fillRect(-30, -4, 4, 8); ctx.fillRect(2, -4, 4, 8); },
});
Object.assign(RUSE, {
  fsign(pr) { const f = pr.farm; { const ro = !owned(f.b) && remoteOwner(f.b); if (ro) return toast(f.b.name + ' — owned by ' + ro); } if (!owned(f.b)) return enterBuilding(f.b); Panel.open('farm', { farm: f }); },
  coop(pr) { const f = pr.farm; if (!owned(f.b)) return toast('Not your coop'); const F = farmData(f), n = collectEggs(F); toast(n ? `Collected ${n} eggs → farm storage` : (F.animals.some(a => a.k === 'chicken') ? (F.feed > 0 ? 'No eggs yet' : 'The hens are hungry — buy feed') : 'No chickens yet — buy some at the Big Valley Co-op')); if (n) Snd.play('cluck', pr.x, pr.y); },
  fstand(pr) { const f = pr.farm; if (!owned(f.b)) return toast('Not your stand'); Panel.open('farm', { farm: f, tab: 'stand' }); },
  mstall() { Panel.open('market', { kind: 'coop', name: 'Big Valley Co-op', tab: 'sell' }); },
});
function collectEggs(F) { let n = 0; const now = GH(); for (const a of F.animals) { if (a.k !== 'chicken') continue; const k = Math.min(4, Math.floor((now - a.last) / 8)); if (k > 0 && F.feed > 0) { n += k; a.last = now; } } if (n) F.store.egg = (F.store.egg | 0) + n; return n; }

// ---------- living things: farm animals, game, pets ----------
G.animals = []; let ANUID = 1;
class Animal {
  constructor(k, x, y, o) { Object.assign(this, { k, d: ANIM[k], x, y, a: rnd(0, TAU), vx: 0, vy: 0, hp: ANIM[k].hp, st: 'idle', t: rnd(0, 3), ph: rnd(0, 6), uid: ANUID++, isAnimal: 1 }, o || {}); this.r = this.d.r; }
  hurt(n, by) { if (this.dead) return; this.hp -= n; this.hitT = .2; spawnFx('blood', this.x, this.y); if (this.d.wild || this.k === 'pig') { this.st = this.k === 'boar' && by === G.player ? 'charge' : 'flee'; this.t = 6; } if (this.hp <= 0) this.die(by); else Snd.play(this.k === 'cow' ? 'moo' : this.k === 'pig' || this.k === 'boar' ? 'oink' : this.k === 'chicken' ? 'cluck' : this.k === 'dog' ? 'bark' : this.k === 'cat' ? 'meow' : 'thud', this.x, this.y, .7); }
  die(by) { this.dead = 1; this.deadT = 0; addDecal('blood', this.x, this.y); if (this.rec) { const F = this.F, i = F.animals.indexOf(this.rec); if (i >= 0) F.animals.splice(i, 1); this.rec = null; } if (this.pet) { const L = LIFE(); msg(`${this.name} didn't make it.`, '#ff6b6b'); L.pet = null; } if (by === G.player && this.coop) { crime(.5, 'Livestock rustling'); } if (by === G.player && (this.d.pet || this.stray || this.leash)) { crime(.8, 'Animal cruelty'); if (this.leash && !this.leash.dead) { const q = this.leash; q.state = 'flee'; q.threat = G.player; q.timer = 12; pedSay(q, 'NO! You monster!'); } } }
}
function bounded(a, x, y) { if (a.b) return x > a.b[0] && y > a.b[1] && x < a.b[2] && y < a.b[3]; return true; }
function animalTick(dt) {
  const p = G.player; if (!p || G.mode !== 'play') return; const L = LIFE(), px = pCar() ? pCar().x : p.x, py = pCar() ? pCar().y : p.y, here = G.scene ? G.scene.b.id : -1;
  // spawn / despawn
  G.anT = (G.anT || 0) - dt;
  if (G.anT <= 0) { G.anT = .5;
    G.animals = G.animals.filter(a => { if (a.pet) return a.scene === here; if (a.scene !== undefined && a.scene !== here) return false; if (a.scene === undefined && G.scene) return a.dead ? a.deadT < 120 : true; const d2 = dist2(a.x, a.y, px, py); if (a.dead) return a.deadT < 240 && d2 < 2400 * 2400; return d2 < 2200 * 2200; });
    if (!G.scene) {
      for (const f of FARMS) { if (!owned(f.b)) continue; const F = farmData(f), near = dist2((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, px, py) < 1900 * 1900; if (!near) continue;
        for (const rec of F.animals) if (!G.animals.some(a => a.rec === rec)) { const [tx, ty] = rec.k === 'chicken' && f.coop ? [Math.floor(f.coop.x / T), Math.floor(f.coop.y / T) + 1] : pick(f.pasture); const a = new Animal(rec.k, (tx + rnd(.2, .8)) * T, (ty + rnd(.2, .8)) * T, { rec, F, f, b: [f.x0 + 8, f.y0 + 8, f.x1 - 8, f.y1 - 8] }); G.animals.push(a); } }
      if (COOP && dist2(COOP.x, COOP.y, px, py) < 2000 * 2000) for (const h of COOP.herd) if (!h.ent || h.ent.dead && h.ent.deadT > 200) { if (h.ent && G.animals.includes(h.ent)) continue; h.ent = new Animal(h.k, h.x, h.y, { b: h.b, coop: 1 }); G.animals.push(h.ent); }
      // wild game
      const dn = districtAt(px, py), base = DISTRICTS[dn].as || dn, wild = G.animals.filter(a => a.d.wild && !a.dead).length, cap = base === 'woods' ? 7 : ['farmland', 'orchard', 'ranch', 'lake', 'quarry'].includes(base) ? 3 : 0;
      if (wild < cap && Math.random() < .5) { for (let tries = 0; tries < 6; tries++) { const ang = rnd(0, TAU), r = rnd(650, 1100), x = px + Math.cos(ang) * r, y = py + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T); if (!inMap(tx, ty) || W.solid[idx(tx, ty)] || inView(x, y, 60)) continue; const t = W.tile[idx(tx, ty)]; if (t !== TILE.GRASS && t !== TILE.FIELD && t !== TILE.DIRT) continue; const db = DISTRICTS[districtAt(x, y)], bb = db.as || districtAt(x, y); if (!['woods', 'farmland', 'orchard', 'ranch', 'lake', 'quarry'].includes(bb) || farmAt(x, y) || (COOP && inCoop(x, y))) continue; const k = bb === 'woods' ? pick(['deer', 'deer', 'deer', 'boar', 'rabbit', 'turkey', 'turkey']) : pick(['rabbit', 'rabbit', 'turkey', 'deer']); const n = k === 'deer' && Math.random() < .5 ? 2 : k === 'turkey' ? rint(1, 3) : 1; for (let i = 0; i < n; i++) G.animals.push(new Animal(k, x + rnd(-30, 30), y + rnd(-30, 30), { buck: k === 'deer' && Math.random() < .4 })); break; } }
    }
    // pet
    if (L.pet) { const P = L.pet, inHome = G.scene && (G.scene.b.id === P.home), show = P.follow ? (!G.scene || G.scene.b.id === P.home || canDecorate()) : inHome; let e = G.animals.find(a => a.pet); if (show && !e && !p.dead) { e = new Animal(P.k, p.x + rnd(-30, 30), p.y + 30, { pet: 1, name: P.name, scene: here }); G.animals.push(e); } else if (!show && e) G.animals.splice(G.animals.indexOf(e), 1); }
  }
  // behaviour
  for (const a of G.animals) {
    if (a.dead) { a.deadT += dt; continue; } a.t -= dt; if (a.hitT > 0) a.hitT -= dt; let sp = 0, ta = a.a; const d = a.d, dp = dist(a.x, a.y, px, py);
    if (a.pet) {
      const thr = a.k === 'dog' ? (G.scene ? G.scene.peds : G.peds).find(q => !q.dead && (q.target === p || q.hostile) && q.state === 'fight' && dist2(q.x, q.y, p.x, p.y) < 260 * 260) : null;
      if (thr) { ta = Math.atan2(thr.y - a.y, thr.x - a.x); sp = d.sp; if (dist(a.x, a.y, thr.x, thr.y) < 22 && !(a.biteT > 0)) { a.biteT = .8; thr.hurt(7, null, 'punch'); Snd.play('bark', a.x, a.y); } }
      else if (dp > (G.scene ? 50 : 70)) { ta = Math.atan2(py - a.y, px - a.x); sp = Math.min(Math.max(d.sp * 1.3, 260), (dp - 40) * 3.5); if (dp > 600) petRejoin(a); }
      else if (a.t <= 0) { a.t = rnd(2, 5); a.wa = rnd(0, TAU); if (Math.random() < .15) Snd.play(a.k === 'dog' ? 'bark' : a.k === 'cat' ? 'meow' : 'pop', a.x, a.y, .5); }
      if (a.biteT > 0) a.biteT -= dt;
    } else if (a.d.wild && (a.st === 'charge')) { ta = Math.atan2(py - a.y, px - a.x); sp = d.sp; if (dp < 24 && !(a.biteT > 0) && !p.car) { a.biteT = 1; hurtPlayer(14, null, 'punch'); Snd.play('oink', a.x, a.y); } if (a.biteT > 0) a.biteT -= dt; if (a.t <= 0 || dp > 700) a.st = 'idle'; }
    else if (a.d.wild && (a.st === 'flee' || (d.flee && dp < d.flee * (p.car ? 1.6 : 1) && !G.scene) || (G.lastShot && G.t - G.lastShot.t < 1 && dist2(a.x, a.y, G.lastShot.x, G.lastShot.y) < 650 * 650))) {
      if (a.st !== 'flee') { a.st = 'flee'; a.t = rnd(4, 7); a.fa = Math.atan2(a.y - py, a.x - px) + rnd(-.5, .5); } ta = a.fa + Math.sin(G.t * 3 + a.uid) * .4; sp = d.sp; if (a.t <= 0 && dp > 500) a.st = 'idle';
    } else { if (a.t <= 0) { a.t = rnd(1.5, 5); a.wa = Math.random() < .55 ? null : rnd(0, TAU); } if (a.wa != null) { ta = a.wa; sp = d.sp * (a.d.wild ? .25 : .5); } }
    if (sp > 0) { a.a = ta; const nx = a.x + Math.cos(ta) * sp * dt, ny = a.y + Math.sin(ta) * sp * dt, blk = (x, y) => sceneSolid(Math.floor(x / T), Math.floor(y / T)) || !bounded(a, x, y) || (!G.scene && !a.d.wild && !a.pet && tileAt(Math.floor(x / T), Math.floor(y / T)) === TILE.ROAD);
      if (!blk(nx, ny)) { a.x = nx; a.y = ny; } else if (a.pet && !blk(nx, a.y)) a.x = nx; else if (a.pet && !blk(a.x, ny)) a.y = ny; else { a.wa = rnd(0, TAU); a.fa = (a.fa || 0) + 1.6; a.t = Math.min(a.t, .4); } a.ph += dt * sp * .12; }
    // cars
    if (!G.scene && !a.ride) for (const c of G.cars) if (c.spd > 70 && !c.dead && dist2(c.x, c.y, a.x, a.y) < (a.r + c.W * .5) ** 2) { a.hurt(a.d.wild ? 999 : c.spd * .3, c.driver === p ? p : null); Snd.play('thud', a.x, a.y); break; }
  }
  // farm sims (eggs, milk, feed, stand customers & sales)
  const h = dt * 24 / 1200; L.gh = (L.gh || 0) + h;
  for (const f of FARMS) { if (!owned(f.b)) continue; const F = farmData(f); const eat = F.animals.reduce((s, a) => s + ANIM[a.k].feed, 0) * h / 24; F.feed = Math.max(0, F.feed - eat); if (F.feed <= 0 && eat > 0 && !F.hungryMsg) { F.hungryMsg = 1; msg(`${f.b.name}: the animals are out of feed.`, '#f39c12'); } if (F.feed > 0) F.hungryMsg = 0;
    { const ne = collectEggs(F); if (ne && !G.scene && dist2((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, px, py) < 900 * 900) toast(`🥚 ${ne} fresh egg${ne > 1 ? 's' : ''} → ${f.b.name} storage`); }
    if (F.up.hand) for (const a of F.animals) if (a.k === 'sheep' && GH() - (a.shorn || a.born || 0) >= 24 && F.feed > 0) { F.store.wool = (F.store.wool | 0) + 3; a.shorn = GH(); }
    if (F.up.hand) { for (const k in f.plots) { const pl = F.plots[k]; if (pl && pl.c && cropProg(pl, F) >= 1) { const y = CROPS[pl.c].y + (F.up.irr ? 1 : 0); F.store[pl.c] = (F.store[pl.c] | 0) + y; F.plots[k] = null; } } collectEggs(F); }
    if (F.up.milker) for (const a of F.animals) if (a.k === 'cow' && GH() - a.last >= 8 && F.feed > 0) { F.store.milk = (F.store.milk | 0) + 2; a.last = GH(); }
    const stock = Object.keys(F.stand).filter(id => F.stand[id] > 0); if (!stock.length) continue;
    const near = !G.scene && dist2((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, px, py) < 1500 * 1500;
    if (!near && Math.random() < h * .7) standSale(F, pick(stock), f.b.name);
    if (near && f.stand) { f.custT = (f.custT || rnd(5, 15)) - dt; if (f.custT <= 0 && (!f.cust || f.cust.dead || !G.peds.includes(f.cust))) { f.custT = rnd(20, 45); const s = randRoadEdge(f); if (s) { const q = new Ped(s[0], s[1], {}); q.state = 'goto'; q.goal = [f.stand.x, f.stand.y + 26]; q.after = 'idle'; q.cust = f; f.cust = q; q.persist = 1; G.peds.push(q); } } }
    if (f.cust && !f.cust.dead && G.peds.includes(f.cust)) { const q = f.cust; if (q.state === 'idle' && dist2(q.x, q.y, f.stand.x, f.stand.y) < 60 * 60) { q.browse = (q.browse || 0) + dt; q.a = Math.atan2(f.stand.y - q.y, f.stand.x - q.x); if (q.browse > 3.5) { const n = rint(1, 3); let got = []; for (let i = 0; i < n; i++) { const st = Object.keys(F.stand).filter(id => F.stand[id] > 0); if (!st.length) break; const id = pick(st); standSale(F, id); got.push(ITEMS[id].n); } pedSay(q, got.length ? pick(['Fresh! I\'ll take some.', 'Ooh, ' + got[0].toLowerCase() + '!', 'Can\'t get this in the city.', 'Lovely stuff.']) : 'Nothing left? Shame.'); q.state = 'walk'; q.persist = 0; q.cust = null; f.cust = null; } } }
  }
}
function standSale(F, id, where) { if (!(F.stand[id] > 0)) return; F.stand[id]--; if (!F.stand[id]) delete F.stand[id]; const pr = Math.round(ITEMS[id].v * 1.2); F.till += pr; LIFE().earned += pr; Snd.play('cash', 0, 0, .3); }
function randRoadEdge(f) { for (let i = 0; i < 12; i++) { const side = rint(0, 3), u = rnd(.1, .9), x = side === 1 ? f.x1 + 40 : side === 3 ? f.x0 - 40 : lerp(f.x0, f.x1, u), y = side === 2 ? f.y1 + 40 : side === 0 ? f.y0 - 40 : lerp(f.y0, f.y1, u); if (!solidW(x, y) && !inView(x, y, 30)) return [x, y]; } return null; }
const inCoop = (x, y) => COOP && x >= COOP.blkA.bx * T && y >= COOP.blkA.by * T && x < (COOP.blkA.bx + 12) * T && y < (COOP.blkB.by + 12) * T;
function animalRayHit(x, y, dx, dy, bt) { let best = null; const here = G.scene ? G.scene.b.id : undefined; for (const a of G.animals) { if (a.dead || (G.scene ? a.scene !== here : a.scene !== undefined)) continue; const t = rayCircle(x, y, dx, dy, a.x, a.y, a.r + (a === LK.t && G.aimLockT > G.t - .25 ? 10 : 3)); if (t >= 0 && t < bt) { bt = t; best = a; } } return best ? [best, bt] : null; }

// ---------- drawing ----------
function drawAnimal(a) {
  const k = a.k, leg = Math.sin(a.ph) * (a.dead ? 0 : 1); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.a + (a.dead ? 1.4 : 0));
  if (!a.dead) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(2, 3, a.r * 1.3, a.r * .8, 0, 0, TAU); ctx.fill(); }
  const el = (x, y, rx, ry, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, TAU); ctx.fill(); }, legs = (xs, w, c) => { ctx.fillStyle = c; for (const [lx, s] of xs) { ctx.fillRect(lx + leg * s * 2, -w, 2.5, 3); ctx.fillRect(lx - leg * s * 2, w - 3, 2.5, 3); } };
  if (a.hitT > 0) ctx.globalAlpha = .7;
  switch (k) {
    case 'chicken': el(0, 0, 7, 5.5, '#f5f5f0'); el(-6, 0, 3, 3.5, '#e8e6dc'); el(5.5, 0, 3.2, 3, '#f5f5f0'); ctx.fillStyle = '#e53935'; ctx.fillRect(5, -1, 3, 2); ctx.fillStyle = '#f9a825'; ctx.fillRect(8.4, -.8, 2.4, 1.6); break;
    case 'cow': { legs([[8, 1], [-9, -1]], 9, '#2b2b2b'); el(0, 0, 16, 9.5, '#f4f4f0'); const r2 = mulberry32(a.uid * 7); ctx.fillStyle = '#1e1e1e'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(-10 + r2() * 20, -6 + r2() * 12, 3 + r2() * 3, 2 + r2() * 3, r2() * 3, 0, TAU); ctx.fill(); } el(17, 0, 6, 5, '#f4f4f0'); el(22, 0, 3.4, 3.8, '#f2a7b5'); ctx.fillStyle = '#ddd'; ctx.fillRect(14, -7, 3, 2.5); ctx.fillRect(14, 4.5, 3, 2.5); ctx.fillStyle = '#2b2b2b'; ctx.fillRect(-18, -.8, 4, 1.6); break; }
    case 'sheep': { const fl = !a.rec || GH() - (a.rec.shorn || a.rec.born || -99) >= 12, wc = '#f2efe6'; legs([[6, 1], [-7, -1]], 7, '#3a3a3a'); if (fl) { for (const [x, y] of [[-7, -4], [-7, 4], [0, -5], [0, 5], [6, -3.5], [6, 3.5], [-10, 0], [3, 0]]) el(x, y, 5.2, 4.6, wc); } else el(0, 0, 10, 6, '#e0d9c8'); el(11, 0, 4, 3.3, '#3a3a3a'); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(9, -5, 3, 1.6); ctx.fillRect(9, 3.4, 3, 1.6); break; }
    case 'pig': legs([[5, 1], [-6, -1]], 6, '#d98880'); el(0, 0, 11, 7, '#f5b7b1'); el(10, 0, 4.5, 4, '#f5b7b1'); el(14, 0, 2.2, 2.6, '#e8968f'); ctx.strokeStyle = '#e8968f'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-12, 0, 2, 0, 5); ctx.stroke(); break;
    case 'deer': legs([[6, 1], [-7, -1]], 5.5, '#5d4037'); el(0, 0, 12, 5.5, '#a1724e'); el(-11, 0, 2.5, 2.5, '#f5f5f0'); el(12, 0, 4, 3.4, '#a1724e'); ctx.fillStyle = '#4e342e'; ctx.fillRect(14.5, -.8, 3, 1.6); if (a.buck) { ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(11, -2); ctx.lineTo(8, -8); ctx.lineTo(5, -9); ctx.moveTo(8, -8); ctx.lineTo(9, -11); ctx.moveTo(11, 2); ctx.lineTo(8, 8); ctx.lineTo(5, 9); ctx.moveTo(8, 8); ctx.lineTo(9, 11); ctx.stroke(); } break;
    case 'boar': legs([[5, 1], [-6, -1]], 6, '#2b2118'); el(0, 0, 11, 7, '#4e3b2c'); el(10, 0, 5, 4.5, '#3e2f23'); ctx.fillStyle = '#efebe9'; ctx.fillRect(13, -4, 3, 1.4); ctx.fillRect(13, 2.6, 3, 1.4); ctx.fillStyle = '#2b2118'; ctx.fillRect(-6, -1, 10, 2); break;
    case 'rabbit': case 'bunny': el(0, 0, 5.5, 4, k === 'bunny' ? '#f5f5f5' : '#9e9e9e'); el(4.5, 0, 2.8, 2.6, k === 'bunny' ? '#f5f5f5' : '#9e9e9e'); ctx.fillStyle = k === 'bunny' ? '#f8bbd0' : '#8d8d8d'; ctx.fillRect(3, -3.5, 4, 1.4); ctx.fillRect(3, 2.1, 4, 1.4); el(-5.5, 0, 1.6, 1.6, '#fff'); break;
    case 'turkey': el(0, 0, 7, 6, '#5d4037'); if (a.st !== 'flee') { ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.arc(-6, 0, 8, Math.PI * .55, Math.PI * 1.45); ctx.fill(); ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(-6, 0, 6, Math.PI * .6, Math.PI * 1.4); ctx.fill(); } el(6, 0, 2.6, 2.4, '#b0bec5'); ctx.fillStyle = '#e53935'; ctx.fillRect(7, .5, 2, 2.5); break;
    case 'dog': legs([[4, 1], [-5, -1]], 5, '#8d6e63'); el(0, 0, 8.5, 4.6, '#c8a165'); el(8, 0, 4, 3.6, '#c8a165'); ctx.fillStyle = '#8d6e63'; ctx.fillRect(6, -4.6, 3, 2); ctx.fillRect(6, 2.6, 3, 2); ctx.fillStyle = '#3e2723'; ctx.fillRect(11, -.8, 2, 1.6); ctx.save(); ctx.translate(-8, 0); ctx.rotate(Math.sin(G.t * 14) * .5); ctx.fillStyle = '#c8a165'; ctx.fillRect(-6, -1, 6, 2); ctx.restore(); break;
    case 'cat': el(0, 0, 6.5, 3.6, '#7f8c8d'); el(6, 0, 3, 2.8, '#7f8c8d'); ctx.fillStyle = '#7f8c8d'; ctx.beginPath(); ctx.moveTo(6, -2.4); ctx.lineTo(8, -4.4); ctx.lineTo(8.5, -1.5); ctx.fill(); ctx.beginPath(); ctx.moveTo(6, 2.4); ctx.lineTo(8, 4.4); ctx.lineTo(8.5, 1.5); ctx.fill(); ctx.strokeStyle = '#7f8c8d'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.quadraticCurveTo(-11, Math.sin(G.t * 3) * 4, -12, 3); ctx.stroke(); break;
  }
  ctx.globalAlpha = 1; ctx.restore();
  if (a.pet && !a.dead && G.cam.z > .45) { ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.font = '600 9px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(a.name, a.x, a.y - 13); }
}
function drawFarmsAndAnimals() {
  const [vx0, vy0, vx1, vy1] = viewRect(T);
  if (!G.scene) for (const f of FARMS) {
    if (f.x1 < vx0 || f.x0 > vx1 || f.y1 < vy0 || f.y0 > vy1) continue; const RF = REMOTEF[FARMS.indexOf(f)]; if (!owned(f.b) && !RF) continue; const F = owned(f.b) ? farmData(f) : null;
    f.plots.forEach(([tx, ty], i) => { const x = tx * T, y = ty * T, pl = F ? F.plots[i] : RF.plots[i]; ctx.fillStyle = 'rgba(70,45,25,.55)'; ctx.fillRect(x + 3, y + 3, 2 * T - 6, 2 * T - 6); ctx.fillStyle = 'rgba(40,25,12,.45)'; for (let r = 0; r < 5; r++) ctx.fillRect(x + 6, y + 10 + r * 24, 2 * T - 12, 5);
      if (!pl || !pl.c) return; const pg = F ? cropProg(pl, F) : pl.pg, C = CROPS[pl.c], ripe = pg >= 1;
      for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { const px = x + 14 + c * 20, py = y + 12 + r * 24, s = 2 + pg * 7;
        ctx.fillStyle = pg < .35 ? '#7cb342' : pl.c === 'wheat' ? (ripe ? '#e1b84a' : '#9ccc65') : '#558b2f';
        if (pl.c === 'wheat' || pl.c === 'corn') { ctx.fillRect(px - 1, py - s, 2.2, s * 2); if (pg > .5) ctx.fillRect(px - s * .5, py - 1, s, 2.2); if (pl.c === 'corn' && ripe) { ctx.fillStyle = '#f1c40f'; ctx.fillRect(px + 1, py - 3, 3, 6); } }
        else { ctx.beginPath(); ctx.arc(px, py, s * .8, 0, TAU); ctx.fill(); if (pg > .7) { ctx.fillStyle = C.c; ctx.beginPath(); ctx.arc(px + 2, py + 1, pl.c === 'pumpkin' ? 2 + pg * 5 : 1.5 + pg * 1.8, 0, TAU); ctx.fill(); } } }
      if (ripe) { ctx.strokeStyle = 'rgba(255,230,120,' + (.4 + Math.sin(G.t * 4) * .3) + ')'; ctx.lineWidth = 3; ctx.strokeRect(x + 4, y + 4, 2 * T - 8, 2 * T - 8); } });
  }
  const here = G.scene ? G.scene.b.id : undefined;
  for (const a of G.animals) { if (G.scene ? a.scene !== here : a.scene !== undefined) continue; if (a.x < vx0 - 40 || a.x > vx1 + 40 || a.y < vy0 - 40 || a.y > vy1 + 40) continue; drawAnimal(a); }
}
function drawPlanter(g, it, x, y, w, h) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#795548'; g.fillRect(x, y, w, h); g.fillStyle = '#4e342e'; g.fillRect(x + 4, y + 4, w - 8, h - 8);
  const rec = it.rec; if (!rec || !rec.crop) return; const pg = clamp((GH() - rec.t0) / CROPS[rec.crop].h, 0, 1);
  for (let i = 0; i < 4; i++) { const px = x + 12 + i * (w - 24) / 3, py = y + h / 2; g.fillStyle = '#558b2f'; g.beginPath(); g.arc(px, py, 2 + pg * 7, 0, TAU); g.fill(); if (pg > .7) { g.fillStyle = CROPS[rec.crop].c; g.beginPath(); g.arc(px + 2, py + 1, 2 + pg * 2, 0, TAU); g.fill(); } }
  if (pg >= 1) { g.strokeStyle = 'rgba(255,230,120,.8)'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2); }
}

// ---------- interactions ----------
function findInteractF() {
  const best = findInteract0(), p = G.player; if (!p || p.dead || p.car || G.dlgOpen) return best; let o = null, bd = best ? 9 : 1e9;
  const here = G.scene ? G.scene.b.id : undefined, fx = p.x + Math.cos(p.a) * 8, fy = p.y + Math.sin(p.a) * 8;
  for (const a of G.animals) { if (G.scene ? a.scene !== here : a.scene !== undefined) continue; const d = dist(fx, fy, a.x, a.y) - a.r; if (d > 26 || d > bd) continue; bd = d;
    if (a.dead) { if (a.d.meat && !a.remoteF) o = { k: 'carcass', a, label: (a.d.wild ? 'Field dress ' : 'Butcher ') + a.d.n.toLowerCase() }; }
    else if (a.remoteF) o = null;
    else if (a.pet) o = { k: 'pet', a, label: 'Pet ' + a.name };
    else if (a.rec) o = { k: 'stock', a, label: a.k === 'cow' ? (GH() - a.rec.last >= 8 ? 'Milk the cow' : 'Cow') : a.k === 'sheep' ? (GH() - (a.rec.shorn || a.rec.born || 0) >= 24 ? 'Shear the sheep' : 'Sheep') : a.d.n };
    else o = null; }
  if (!G.scene && !o) { const f = farmAt(p.x, p.y); if (f && owned(f.b)) { const i = plotAt(f, p.x, p.y); if (i >= 0) { const F = farmData(f), pl = F.plots[i], ripeN = f.plots.filter((_, k) => F.plots[k] && cropProg(F.plots[k], F) >= 1).length; o = !pl || !pl.c ? { k: 'plot', f, i, label: 'Plant crops' } : ripeN ? { k: 'harvest', f, label: `Harvest ripe crops (${ripeN} plot${ripeN > 1 ? 's' : ''})` } : { k: 'plotinfo', f, i, label: `${ITEMS[pl.c].n} — ${Math.round(cropProg(pl, F) * 100)}% grown` }; } } }
  return o || best;
}
function doInteractF(o) {
  if (!o) return; const p = G.player;
  switch (o.k) {
    case 'carcass': { const a = o.a; Snd.play('rustle', a.x, a.y); const got = []; for (const [id, n] of a.d.meat) { giveTo(id, n); got.push(ITEMS[id].n + (n > 1 ? ' ×' + n : '')); } G.animals.splice(G.animals.indexOf(a), 1); addDecal('blood', a.x, a.y); return toast(got.join(', ')); }
    case 'pet': { const a = o.a, P = LIFE().pet; return say(a.name, pick(['*wags happily*', '*purrs*', '*nuzzles your hand*', '*looks at you expectantly*']), [{ t: 'Pet ' + a.name + ' (+5 health)', c: 'y', f: () => { heal(5); Snd.play(a.k === 'dog' ? 'bark' : a.k === 'cat' ? 'meow' : 'pop', a.x, a.y); closeDialog(); } }, P.follow ? { t: 'Stay home', f: () => { P.follow = 0; P.home = G.scene && canDecorate() ? G.scene.b.id : (W.buildings.find(b => b.name === 'Your Apartment') || {}).id; toast(a.name + ' will wait at home'); closeDialog(); } } : { t: 'Come with me', f: () => { P.follow = 1; toast(a.name + ' is following you'); closeDialog(); } }, { t: 'Leave' }]); }
    case 'stock': { const a = o.a, F = a.F, rec = a.rec, opts = []; if (a.k === 'cow') opts.push({ t: GH() - rec.last >= 8 ? (F.feed > 0 ? 'Milk her (2 milk)' : 'Too hungry to milk — buy feed') : `Milk again in ${Math.ceil(8 - (GH() - rec.last))}h`, c: 'y', d: GH() - rec.last < 8 || F.feed <= 0, f: () => { rec.last = GH(); F.store.milk = (F.store.milk | 0) + 2; Snd.play('moo', a.x, a.y); toast('+2 milk → farm storage'); closeDialog(); } });
      if (a.k === 'sheep') { const due = GH() - (rec.shorn || rec.born || 0) >= 24; opts.push({ t: due ? (F.feed > 0 ? 'Shear her (3 wool)' : 'Too hungry to shear — buy feed') : `Wool grows back in ${Math.ceil(24 - (GH() - (rec.shorn || rec.born || 0)))}h`, c: 'y', d: !due || F.feed <= 0, f: () => { rec.shorn = GH(); F.store.wool = (F.store.wool | 0) + 3; Snd.play('rustle', a.x, a.y); toast('+3 wool → farm storage (knit it at a stove › Craft)'); closeDialog(); } }); }
      const mature = a.k !== 'pig' || GH() - rec.born >= ANIM.pig.grow; opts.push({ t: mature ? `Slaughter for meat (${a.d.meat.map(m => ITEMS[m[0]].n + ' ×' + m[1]).join(', ')})` : `Too young — ready in ${Math.ceil(ANIM.pig.grow - (GH() - rec.born))}h`, d: !mature, f: () => { closeDialog(); for (const [id, n] of a.d.meat) F.store[id] = (F.store[id] | 0) + n; const i = F.animals.indexOf(rec); if (i >= 0) F.animals.splice(i, 1); G.animals.splice(G.animals.indexOf(a), 1); toast('Meat → farm storage'); } }); opts.push({ t: 'Leave' });
      return say(a.d.n, a.k === 'cow' ? 'Moo.' : a.k === 'pig' ? 'Oink.' : a.k === 'sheep' ? 'Baaa.' : 'Bawk.', opts); }
    case 'plot': return Panel.open('plant', { f: o.f, i: o.i });
    case 'harvest': { const F = farmData(o.f); let n = 0, items = {}; o.f.plots.forEach((_, k) => { const pl = F.plots[k]; if (pl && pl.c && cropProg(pl, F) >= 1) { const y = CROPS[pl.c].y + (F.up.irr ? 1 : 0); F.store[pl.c] = (F.store[pl.c] | 0) + y; items[pl.c] = (items[pl.c] | 0) + y; F.plots[k] = null; n++; } }); Snd.play('rustle'); return toast('Harvested ' + Object.keys(items).map(k => ITEMS[k].n + ' ×' + items[k]).join(', ') + ' → farm storage'); }
    case 'plotinfo': return toast(o.label);
  }
  return doInteract0(o);
}
function useItemF(it) {
  if (it.t === 'stove' && (canDecorate() || G.scene.b.type === 'safehouse')) return Panel.open('kitchen', { tab: 'cook' });
  if (it.t === 'planter') { const rec = it.rec; if (!rec) return toast('Just dirt.'); if (rec.crop) { const pg = clamp((GH() - rec.t0) / CROPS[rec.crop].h, 0, 1); if (pg < 1) return toast(`${ITEMS[rec.crop].n} — ${Math.round(pg * 100)}% grown`); const n = Math.max(1, Math.floor(CROPS[rec.crop].y / 2)); giveTo(rec.crop, n); toast(`Picked ${ITEMS[rec.crop].n} ×${n}`); rec.crop = null; Snd.play('rustle'); doSave(true); return; } return Panel.open('plant', { planter: rec }); }
  return useItem0(it);
}
function talkToF(q) {
  if (q.vend) { closeDialog(); return Panel.open('market', { kind: q.vend, name: q.vend === 'coop' ? 'Big Valley Co-op' : q.vname || q.name, tab: q.vtab || 'sell', vkind: q.vkind, ped: q }); }
  if (q.shop && G.scene && G.scene.b.sub === 'market') { closeDialog(); return Panel.open('market', { kind: 'market', name: G.scene.b.name, tab: 'sell' }); }
  if (q.shop && G.scene && G.scene.b.sub === 'coop') { closeDialog(); return Panel.open('market', { kind: 'coop', name: G.scene.b.name, tab: 'stock' }); }
  if (q.shop && G.scene && G.scene.b.sub === 'pets') { closeDialog(); return Panel.open('pets', { name: G.scene.b.name }); }
  if (['farmer', 'rancher', 'fisher', 'camper', 'worker'].includes(q.role) && !q.hostile) { q.talking = 1; G.talkPed = q; return say(q.name, pick(['"What\'cha need, stranger?"', '"Got some good stuff today."', '"You buyin\' or sellin\'?"', '"Ain\'t seen you round here before."']), [{ t: 'See what they\'ve got', c: 'y', f: () => { closeDialog(); Panel.open('market', { kind: 'trader', ped: q, name: q.name, tab: 'buy' }); } }, { t: 'Just chat', f: () => talkTo0(q) }, { t: 'Bye' }]); }
  return talkTo0(q);
}
function shopMenu(q) {
  if (q.shop === 'store' && G.scene && SHOPMAIN[G.scene.b.kind2]) { closeDialog(); return Panel.open('shopk', { goods: SHOPMAIN[G.scene.b.kind2] }); }
  if (q.shop === 'store' && !(G.scene && G.scene.b.sub)) return say(q.name, `"Need anything?"   Cash: ${money(G.cash)}`, [{ t: 'Groceries & seeds', c: 'y', f: () => { closeDialog(); Panel.open('market', { kind: 'grocer', name: G.scene.b.name, tab: 'buy' }); } }, { t: 'Other stuff', f: () => shopMenu0(q) }, { t: 'Leave' }]);
  if (q.shop === 'food') return say(q.name, `"Welcome! Grab a seat or take it to go."   Cash: ${money(G.cash)}`, [{ t: 'Order food', f: () => shopMenu0(q) }, { t: 'Sell them your home cooking', c: 'y', f: () => { closeDialog(); Panel.open('market', { kind: 'diner', name: G.scene.b.name, tab: 'sell' }); } }, { t: 'Leave' }]);
  return shopMenu0(q);
}

// ---------- markets ----------
const MKT = { dem: {} };
const sellable = id => ['farm', 'meat', 'pantry', 'food', 'cloth'].includes(ITEMS[id].k) || id === 'fish' || id === 'bigfish' || id === 'apple' || id === 'moonshine';
function priceFor(kind, id, ped) {
  const it = ITEMS[id], k = it.k, dm = MKT.dem[kind + id] || 1;
  if (kind === 'coop') return Math.round(it.v * (k === 'food' ? .8 : 1));
  if (kind === 'market') return Math.round(it.v * (k === 'food' ? 1.2 : k === 'meat' ? 1 : 1.15) * dm);
  if (kind === 'diner') return k === 'food' ? Math.round(it.v * 1.25 * dm) : 0;
  if (kind === 'trader') { const w = ped.wants || (ped.wants = {}); if (w[id] === undefined) w[id] = Math.random() < .5 ? rnd(.85, 1.25) : 0; return Math.round(it.v * w[id]); }
  return 0;
}
const buyPrice = (id, kind) => Math.max(1, Math.round(ITEMS[id].v * (kind === 'trader' ? 1.1 : 1.35)));
function traderStock(q) { if (q.stock) return q.stock; const r = mulberry32(q.uid * 13), pk = a => a[Math.floor(r() * a.length)], S = {}; const pool = q.role === 'fisher' ? ['fish', 'fish', 'bigfish', 'jerky', 'moonshine'] : q.role === 'camper' ? ['jerky', 'venison', 'rabbitmeat', 'pelt', 'moonshine', 'herbs'] : q.role === 'rancher' ? ['beef', 'milk', 'cheese', 'cowhide', 'egg', 'jerky', 'moonshine'] : ['egg', 'milk', 'apple', 'corn', 'potato', 'pumpkin', 'butter', 'seed_corn', 'seed_pumpkin', 'moonshine', 'tomato'];
  for (let i = 0; i < 4; i++) { const id = pk(pool); if (ITEMS[id]) S[id] = (S[id] | 0) + 1 + Math.floor(r() * 5); } q.stock = S; if (q.role !== 'fisher' && r() < .5) q.chick = 1 + Math.floor(r() * 3); return S; }
PMODES.market = function (H) {
  const o = this.opt, kind = o.kind, tab = this.tab || (this.tab = 'sell'); H.title.textContent = o.name;
  const trunkCar = nearCarTrunk(), srcs = [['bag', 'Bag', G.inv]]; if (trunkCar) srcs.push(['trunk', trunkCar.d.name + ' trunk', trunkCar.trunk]); const F = nearFarm(); if (F) srcs.push(['farm', 'Farm storage', F.store]);
  if (kind !== 'grocer' && kind !== 'street') H.tabBtn('sell', 'Sell'); if (kind !== 'diner') H.tabBtn('buy', kind === 'coop' ? 'Seeds & feed' : 'Buy'); if (kind === 'coop') H.tabBtn('stock', 'Livestock'); if (kind === 'coop' || kind === 'market') H.tabBtn('orders', 'Delivery orders');
  if (tab === 'sell') {
    const c = H.col('Your goods'); let any = 0;
    for (const [sk, sn, S] of srcs) for (const id of Object.keys(S).filter(id => ITEMS[id] && S[id] > 0 && sellable(id))) { const pr = priceFor(kind, id, o.ped); if (!pr) continue; any = 1; const it = ITEMS[id], sellN = n => { n = Math.min(n, S[id] | 0); let tot = 0; for (let i = 0; i < n; i++) { tot += priceFor(kind, id, o.ped); if (kind === 'market' || kind === 'diner') MKT.dem[kind + id] = Math.max(.55, (MKT.dem[kind + id] || 1) - .03); } S[id] -= n; if (!S[id]) delete S[id]; addCash(tot); LIFE().earned += tot; };
      H.row(c, it.e, `${it.n} ×${S[id]}`, `${money(pr)} each · from ${sn.toLowerCase()}`, [H.btn('Sell 1', () => sellN(1)), H.btn('Sell all ' + money(pr * S[id]), () => sellN(9999), 'y')]); }
    if (!any) H.empty(c, kind === 'diner' ? 'They only buy home-cooked dishes. Cook at your stove.' : kind === 'trader' ? 'Nothing they want right now.' : 'Nothing to sell. Bring crops, eggs, milk, meat, hides or cooking — in your bag, the trunk of a vehicle parked nearby, or your farm storage.');
    const c2 = H.col('How they pay'); H.row(c2, '💲', kind === 'coop' ? 'Fair wholesale price' : kind === 'market' ? '+15% on produce, +20% on cooking' : kind === 'diner' ? '+25% on cooking' : 'Haggles', kind === 'coop' ? 'Buys any amount without the price dropping.' : kind === 'trader' ? 'Only wants some things, and pays what they feel like.' : 'Prices drop a little with each one you sell and recover over time.');
    if (!trunkCar) H.row(c2, '🛻', 'Selling a lot?', 'Park a pickup or van nearby and they can buy straight out of the trunk.');
  } else if (tab === 'buy') {
    const c = H.col(kind === 'coop' ? 'Seeds' : kind === 'trader' ? 'Their wares' : 'For sale'), L = kind === 'coop' ? Object.keys(CROPS).filter(k => !CROPS[k].illicit).map(k => 'seed_' + k) : kind === 'grocer' ? GROCER : kind === 'street' ? (STREETMENU[o.vkind] || STREETMENU.hotdog) : kind === 'trader' ? Object.keys(traderStock(o.ped)) : ['egg', 'milk', 'butter', 'cheese', 'apple', 'corn', 'potato', 'carrot', 'tomato', 'pumpkin', 'herbs', 'flour', 'bread', 'jerky', 'seed_wheat', 'seed_corn', 'seed_tomato', 'seed_pumpkin'];
    for (const id of L) { const it = ITEMS[id], S = kind === 'trader' ? o.ped.stock : null; if (S && !(S[id] > 0)) continue; const pr = id.startsWith('seed_') ? CROPS[it.crop].seed : buyPrice(id, kind); H.row(c, it.e, it.n + (S ? ' ×' + S[id] : ''), money(pr) + (it.crop ? ` · grows in ${CROPS[it.crop].h}h, yields ${CROPS[it.crop].y} ${ITEMS[it.crop].n.toLowerCase()}` : it.heal ? ' · +' + it.heal + ' health' : '') + ' · have ' + (G.inv[id] | 0), [H.btn('Buy', () => { if (it.w && invWeight() + it.w > invCap()) return toast('Bag full'); if (!pay(pr)) return; invAdd(id, 1, 1); if (S) { S[id]--; } }, 'y', (G.cash + G.bank) < pr), H.btn('×5', () => { const n = S ? Math.min(5, S[id]) : 5; if (it.w && invWeight() + it.w * n > invCap()) return toast('Bag full'); if (!pay(pr * n)) return; invAdd(id, n, 1); if (S) S[id] -= n; }, '', (G.cash + G.bank) < pr * 5)]); }
    if (kind === 'trader' && o.ped.chick) { const fs = FARMS.filter(f => owned(f.b)); H.row(c, '🐔', `Chickens ×${o.ped.chick}`, money(35) + ' each, delivered to your farm', [H.btn('Buy one', () => { if (!fs.length) return toast('You need a farm to keep chickens'); if (!pay(35)) return; addAnimal(fs[0], 'chicken'); o.ped.chick--; }, 'y', !fs.length || (G.cash + G.bank) < 35)]); }
    if (kind === 'coop') { const c2 = H.col('Feed — delivered to your farm'), fs = FARMS.filter(f => owned(f.b)); if (!fs.length) H.empty(c2, 'Buy a farm first (phone › Property).'); for (const f of fs) { const Fd = farmData(f); H.row(c2, '🌾', f.b.name, `Feed ${Math.round(Fd.feed)} units · uses ${Fd.animals.reduce((s, a) => s + ANIM[a.k].feed, 0).toFixed(1)} a day`, [H.btn('+50 for $120', () => { if (pay(120)) Fd.feed += 50; }, 'y', (G.cash + G.bank) < 120), H.btn('+250 $550', () => { if (pay(550)) Fd.feed += 250; }, '', (G.cash + G.bank) < 550)]); } }
  } else if (tab === 'stock') {
    const fs = FARMS.filter(f => owned(f.b)); if (!this.fsel || !fs.includes(this.fsel)) this.fsel = fs[0]; const c = H.col('Livestock'), Fd = this.fsel ? farmData(this.fsel) : null;
    if (!fs.length) H.empty(c, 'You need a farm to keep animals. Farms are for sale under phone › Property — look for the tractor icon. In town you can keep a pet instead.');
    else { if (fs.length > 1) for (const f of fs) H.row(c, '🏡', f.b.name, f === this.fsel ? 'Delivering here' : '', [H.btn(f === this.fsel ? 'Selected' : 'Select', () => { this.fsel = f; }, f === this.fsel ? 'on' : '')]);
      const cap = { chicken: 20, pig: 6, cow: this.fsel.kind === 'ranch' ? 10 : 6 };
      for (const k of ['chicken', 'pig', 'cow', 'sheep']) { const n = Fd.animals.filter(a => a.k === k).length, A = ANIM[k]; H.row(c, k === 'chicken' ? '🐔' : k === 'pig' ? '🐖' : k === 'sheep' ? '🐑' : '🐄', `${A.n} — ${money(A.buy)}`, `You have ${n}/${cap[k]} · eats ${A.feed} feed/day · ` + (k === 'chicken' ? '2 eggs a day' : k === 'cow' ? '6 milk a day' : 'ready for market in 2 days'), [H.btn('Buy', () => { if (pay(A.buy)) addAnimal(this.fsel, k); }, 'y', n >= cap[k] || (G.cash + G.bank) < A.buy)]); } }
    const c2 = H.col('Earl says'); H.row(c2, '💬', 'Keep \'em fed', 'No feed, no eggs, no milk. Buy feed on the Seeds & feed tab — it\'s trucked straight to your farm.'); H.row(c2, '🥩', 'Selling meat', 'Slaughter at your farm, then bring the meat here or to a market. Cows are worth more for milk.');
  } else { ordersTab(H, kind); }
};
function addAnimal(f, k) { const F = farmData(f); F.animals.push({ k, id: F.nextId++, born: GH(), last: GH() - 6 }); msg(`${ANIM[k].n} delivered to ${f.b.name}.`, '#2ecc71'); doSave(true); }
// delivery orders
function genOrders() { const L = LIFE(); if (L.orders && L.ordersDay === Math.floor(GH() / 24)) return L.orders; L.ordersDay = Math.floor(GH() / 24); L.orders = [];
  const dests = W.buildings.filter(b => b.door && ['diner', 'bar', 'store'].includes(b.type) && !b.locked); const goods = ['egg', 'milk', 'corn', 'potato', 'tomato', 'pumpkin', 'beef', 'pork', 'venison', 'cheese', 'butter', 'bread', 'applepie', 'steak', 'pancakes', 'jerky', 'pumpkinpie', 'cornbread'];
  for (let i = 0; i < 6; i++) { const b = pick(dests), id = pick(goods), it = ITEMS[id], n = it.v > 90 ? rint(2, 4) : it.v > 30 ? rint(4, 8) : rint(10, 24); L.orders.push({ b: b.id, id, n, pay: Math.round(it.v * n * 1.35 + 150), hrs: rint(6, 12) }); } return L.orders; }
function ordersTab(H, kind) {
  const c = H.col('Wanted'), O = genOrders(), here = G.scene ? G.outPos : G.player; if (!O.length) H.empty(c, 'No orders today.');
  O.forEach((od, i) => { const b = W.buildings[od.b], it = ITEMS[od.id], hv = have(od.id, [G.inv].concat(nearCarTrunk() ? [nearCarTrunk().trunk] : [])); H.row(c, it.e, `${it.n} ×${od.n} → ${b.name}`, `${money(od.pay)} · ${(dist(here.x, here.y, b.door.x, b.door.y) / T * .012).toFixed(1)} mi · ${od.hrs}h to deliver · you're carrying ${hv}`, [H.btn('Take it', () => { O.splice(i, 1); Panel.close(); startDelivery(od); }, 'y', !!G.mission)]); });
  H.foot.appendChild(H.mk('span', 'pnote', 'Carry the goods in your bag or a vehicle trunk. New orders every day. Pay is well above market price.'));
}
function startDelivery(od) { const b = W.buildings[od.b], it = ITEMS[od.id];
  startMission({ title: 'Delivery: ' + it.n, reward: od.pay, timer: od.hrs * 50,
    update(dt) { this.timer -= dt; if (this.timer <= 0) return failMission('Too late — they bought elsewhere.'); this.target = { x: b.door.x, y: b.door.y, label: b.name }; const p = G.player, c = pCar(), px = c ? c.x : p.x, py = c ? c.y : p.y; if (dist2(px, py, b.door.x, b.door.y) < 160 * 160 && (!c || c.spd < 40)) { const L = [G.inv]; const tc = nearCarTrunk(); if (tc) L.push(tc.trunk); if (have(od.id, L) >= od.n) { take(od.id, od.n, L); completeMission(); LIFE().earned += od.pay; } else if (!this.warned) { this.warned = 1; msg(`You need ${od.n} ${it.n.toLowerCase()} — you have ${have(od.id, L)}.`, '#f39c12'); } } else this.warned = 0; },
    hud() { return `Deliver ${it.n} ×${od.n} to ${b.name}`; } });
}

// ---------- farm management ----------
PMODES.farm = function (H) {
  const f = this.opt.farm, F = farmData(f), tab = this.tab || (this.tab = 'over'); H.title.textContent = f.b.name;
  H.tabBtn('over', 'Overview'); H.tabBtn('store', 'Storage'); H.tabBtn('stand', 'Farm stand'); H.tabBtn('up', 'Upgrades');
  if (tab === 'over') {
    const c = H.col('Fields'), cnt = {}; let empty = 0, ripe = 0; f.plots.forEach((_, i) => { const pl = F.plots[i]; if (!pl || !pl.c) empty++; else { cnt[pl.c] = (cnt[pl.c] | 0) + 1; if (cropProg(pl, F) >= 1) ripe++; } });
    H.row(c, '🟫', `${f.plots.length} plots`, `${empty} empty · ${ripe} ready to harvest`); for (const k in cnt) { const pls = f.plots.map((_, i) => F.plots[i]).filter(pl => pl && pl.c === k), avg = pls.reduce((s, pl) => s + cropProg(pl, F), 0) / pls.length; H.row(c, ITEMS[k].e, `${ITEMS[k].n} ×${cnt[k]} plots`, Math.round(avg * 100) + '% grown on average'); }
    H.row(c, '🌱', 'Planting', 'Walk onto a plot in your field and press USE. Seeds come from the co-op, markets and general stores.');
    const c2 = H.col('Animals'), ac = {}; for (const a of F.animals) ac[a.k] = (ac[a.k] | 0) + 1;
    H.row(c2, '🌾', 'Feed: ' + Math.round(F.feed) + ' units', F.animals.length ? `Lasts about ${(F.feed / Math.max(.01, F.animals.reduce((s, a) => s + ANIM[a.k].feed, 0))).toFixed(1)} days` : 'No animals yet', [H.btn('+50 feed $120', () => { if (payAny(120)) F.feed += 50; }, 'y', !canPay(120))]);
    for (const k in ac) H.row(c2, k === 'chicken' ? '🐔' : k === 'pig' ? '🐖' : k === 'sheep' ? '🐑' : '🐄', `${ANIM[k].n} ×${ac[k]}`, k === 'chicken' ? 'Lay eggs into farm storage every 8h' : k === 'sheep' ? 'Shear every 24h for wool' : k === 'cow' ? 'Walk up to a cow to milk her' : 'Fatten up, then slaughter');
    if (!F.animals.length) H.empty(c2, 'Buy chickens, pigs and cows from Earl at the Big Valley Co-op (far west edge of the map).');
    if (F.till > 0) H.row(c2, '💰', 'Stand takings: ' + money(F.till), '', [H.btn('Collect', () => { addCash(Math.floor(F.till)); F.till = 0; }, 'y')]);
  } else if (tab === 'store') {
    const c = H.col(`Backpack ${invWeight()} / ${invCap()}`), c2 = H.col(`Farm storage ${weightOf(F.store)} / 1000`), mv = (A, B, id, n, cap, w) => { const it = ITEMS[id], room = it.w ? Math.floor((cap - w()) / it.w) : 9999, k = Math.min(n, A[id] | 0, room); if (k <= 0) return toast('No room'); A[id] -= k; if (!A[id]) delete A[id]; B[id] = (B[id] | 0) + k; Snd.play('rustle'); };
    const bagL = Object.keys(G.inv).filter(id => ITEMS[id] && G.inv[id] > 0), stL = Object.keys(F.store).filter(id => ITEMS[id] && F.store[id] > 0);
    if (!bagL.length) H.empty(c, 'Empty.'); for (const id of bagL) H.row(c, ITEMS[id].e, `${ITEMS[id].n} ×${G.inv[id]}`, '', [H.btn('All →', () => mv(G.inv, F.store, id, 9999, 1000, () => weightOf(F.store)), 'y')]);
    if (!stL.length) H.empty(c2, 'Harvests, eggs, milk and meat land here.'); for (const id of stL) H.row(c2, ITEMS[id].e, `${ITEMS[id].n} ×${F.store[id]}`, money(ITEMS[id].v) + ' each', [H.btn('← 1', () => mv(F.store, G.inv, id, 1, invCap(), invWeight)), H.btn('← All', () => mv(F.store, G.inv, id, 9999, invCap(), invWeight), 'y')]);
    const tc = nearCarTrunk(); if (tc) { const c3 = H.col(tc.d.name + ` trunk ${weightOf(tc.trunk)} / ${TRUNKCAP[tc.type]}`); for (const id of stL) H.row(c3, ITEMS[id].e, ITEMS[id].n, 'from storage', [H.btn('Load all →', () => mv(F.store, tc.trunk, id, 9999, TRUNKCAP[tc.type], () => weightOf(tc.trunk)), 'y')]); }
  } else if (tab === 'stand') {
    const c = H.col('Stock the stand'), c2 = H.col('On the stand'), L = [['Bag', G.inv], ['Storage', F.store]];
    for (const [n, S] of L) for (const id of Object.keys(S).filter(id => ITEMS[id] && S[id] > 0 && sellable(id))) H.row(c, ITEMS[id].e, `${ITEMS[id].n} ×${S[id]}`, `${n} · sells for ${money(Math.round(ITEMS[id].v * 1.2))}`, [H.btn('Put out all', () => { F.stand[id] = (F.stand[id] | 0) + S[id]; delete S[id]; Snd.play('rustle'); }, 'y')]);
    const st = Object.keys(F.stand).filter(id => F.stand[id] > 0); if (!st.length) H.empty(c2, 'Nothing out. Passers-by stop to see what you have and pay 20% over market — even while you\'re away, though slower.');
    for (const id of st) H.row(c2, ITEMS[id].e, `${ITEMS[id].n} ×${F.stand[id]}`, '', [H.btn('Take back', () => { F.store[id] = (F.store[id] | 0) + F.stand[id]; delete F.stand[id]; })]);
    H.row(c2, '💰', 'Takings: ' + money(F.till), '', [H.btn('Collect', () => { addCash(Math.floor(F.till)); F.till = 0; }, 'y', F.till < 1)]);
  } else {
    const c = H.col('Upgrades'), up = (k, n, d, pr) => H.row(c, F.up[k] ? '✓' : '⬆', n, F.up[k] ? 'Installed' : d + ' · ' + money(pr), [H.btn(F.up[k] ? 'Owned' : 'Buy', () => { if (payAny(pr)) F.up[k] = 1; }, F.up[k] ? 'on' : 'y', !!F.up[k] || !canPay(pr))]);
    up('irr', 'Irrigation', 'Crops grow 30% faster and yield one extra', 6000); up('milker', 'Milking machine', 'Cows are milked automatically', 8000); up('hand', 'Farmhand', 'Harvests ripe crops and collects eggs for you', 12000);
  }
};
PMODES.plant = function (H) {
  const o = this.opt, planter = o.planter; H.title.textContent = planter ? 'Planter box' : 'Plant crops'; const c = H.col('Your seeds'); let any = 0;
  const L = [G.inv]; const F = !planter ? farmData(o.f) : null; if (F) L.push(F.store); if (G.scene && canDecorate()) L.push(G.stash.items);
  for (const k in CROPS) { if (planter && !PLANTER_OK.includes(k)) continue; const sid = 'seed_' + k, n = have(sid, L); if (!n) continue; any = 1;
    const plantAt = i => { F.plots[i] = { c: k, t: GH() }; take(sid, 1, L); };
    H.row(c, '🌱', `${ITEMS[sid].n} ×${n}`, `Ready in ${CROPS[k].h}h · ${CROPS[k].y} ${ITEMS[k].n.toLowerCase()} per plot`, planter ? [H.btn('Plant', () => { planter.crop = k; planter.t0 = GH(); take(sid, 1, L); Panel.close(); Snd.play('rustle'); doSave(true); toast('Planted ' + ITEMS[k].n.toLowerCase()); }, 'y')]
      : [H.btn('This plot', () => { plantAt(o.i); Panel.close(); Snd.play('rustle'); toast('Planted'); }), H.btn('All empty plots', () => { let m = 0; o.f.plots.forEach((_, i) => { if ((!F.plots[i] || !F.plots[i].c) && have(sid, L) > 0) { plantAt(i); m++; } }); Panel.close(); Snd.play('rustle'); toast('Planted ' + m + ' plots'); }, 'y')]); }
  if (!any) H.empty(c, planter ? 'No seeds that grow in a planter (herbs, tomatoes, carrots, potatoes). General stores sell them.' : 'No seeds. Buy them at the Big Valley Co-op, a farmers market or a general store.');
};

// ---------- kitchen ----------
PMODES.kitchen = function (H) {
  const tab = this.tab || (this.tab = 'cook'), L = srcList(); H.title.textContent = 'Kitchen'; H.tabBtn('cook', 'Cook'); H.tabBtn('proc', 'Process'); H.tabBtn('craft', 'Craft');
  const list = RECIPES.filter(r => r[2] === (tab === 'cook' ? 'k' : tab === 'craft' ? 'c' : 'p')), half = Math.ceil(list.length / 2);
  [list.slice(0, half), list.slice(half)].forEach((ls, ci) => { const c = H.col(ci ? 'More' : tab === 'cook' ? 'Recipes' : tab === 'craft' ? 'Knitting (wool → clothes)' : 'Processing'); for (const [id, ing] of ls) { const it = ITEMS[id], can = Object.keys(ing).every(k => have(k, L) >= ing[k]), maxN = Math.min(...Object.keys(ing).map(k => Math.floor(have(k, L) / ing[k])));
    const make = n => { for (let i = 0; i < n; i++) { for (const k in ing) take(k, ing[k], L); giveTo(id, 1, G.scene && canDecorate() ? null : null); } Snd.play('fire'); toast(`Made ${it.n}${n > 1 ? ' ×' + n : ''}`); };
    const r = H.row(c, it.e, it.n + ` · ${money(it.v)}` + (it.heal ? ` · +${it.heal}` : ''), Object.keys(ing).map(k => `${ITEMS[k].n} ${have(k, L)}/${ing[k]}`).join(' · '), [H.btn('Make', () => make(1), 'y', !can), H.btn('All (' + maxN + ')', () => make(maxN), '', maxN < 2)]); if (!can) r.style.opacity = .6; } });
  H.foot.appendChild(H.mk('span', 'pnote', 'Uses ingredients from your bag' + (canDecorate() ? ', your home stash' : '') + (nearFarm() ? ' and farm storage' : '') + '. Groceries sell ingredients; growing and raising your own is cheaper.'));
};
// ---------- pets ----------
PMODES.pets = function (H) {
  H.title.textContent = this.opt.name; const c = H.col('Adopt a friend'), P = LIFE().pet;
  for (const k of ['dog', 'cat', 'bunny']) { const A = ANIM[k]; H.row(c, k === 'dog' ? '🐕' : k === 'cat' ? '🐈' : '🐇', `${A.n} — ${money(A.buy)}`, k === 'dog' ? 'Loyal. Follows you and bites anyone who attacks you.' : k === 'cat' ? 'Independent. Keeps you company at home.' : 'Fluffy. Very calming.', [H.btn(P ? 'You have a pet' : 'Adopt', () => { const nm = pick(k === 'dog' ? ['Rex', 'Buster', 'Duke', 'Bella', 'Rocky', 'Biscuit'] : k === 'cat' ? ['Mittens', 'Shadow', 'Luna', 'Tiger', 'Pickles'] : ['Thumper', 'Clover', 'Cotton', 'Hops']); if (!payAny(A.buy)) return; LIFE().pet = { k, name: nm, follow: 1, home: (W.buildings.find(b => b.name === 'Your Apartment') || {}).id }; msg(`Meet ${nm}! Walk up to your pet to pet them or tell them to stay home.`, '#2ecc71'); doSave(true); }, 'y', !!P || !canPay(A.buy))]); }
  const c2 = H.col('Good to know'); H.row(c2, '🏙', 'City living', 'No room for livestock in town — a pet is as far as it goes. Farm animals need a farm.'); if (P) H.row(c2, '❤', 'Your ' + ANIM[P.k].n.toLowerCase() + ', ' + P.name, P.follow ? 'Following you' : 'Waiting at home', [H.btn('Rehome', () => { LIFE().pet = null; G.animals = G.animals.filter(a => !a.pet); toast(P.name + ' went to a loving new family.'); })]);
};
Object.assign(IT, { planter: { s: 1, act: 'Tend planter' } }); IT.stove.act = 'Use the kitchen';
function plantersFull() { const s = G.scene; if (!s) return true; const farmHouse = s.b.realty && s.b.realty.kind === 'farm'; return decorOf(s.b).items.filter(r => r.t === 'planter').length >= (farmHouse ? 12 : 4); }
