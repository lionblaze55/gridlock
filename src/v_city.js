// ================= CITY & COUNTRY LIFE II: witnesses in cars, animal rules, sheep & wool, minimap zoom, MP farm sync,
// contracts, more decor, NPC street life, vendors, live music, the freight train =================

// ---------- sheep, wool & clothes; eggs land in storage by themselves ----------
Object.assign(ANIM, { sheep: { n: 'Sheep', buy: 300, feed: 1.5, hp: 30, r: 10, sp: 45, meat: [['mutton', 5], ['wool', 2]] } });
Object.assign(ITEMS, {
  wool: { n: 'Wool', v: 22, w: 1, k: 'farm', e: '🧶' }, mutton: { n: 'Mutton', v: 26, w: 1, k: 'meat', e: '🍖' }, yarn: { n: 'Yarn', v: 50, w: 1, k: 'pantry', e: '🧵' },
  scarf: { n: 'Knitted scarf', v: 75, w: 1, k: 'cloth', e: '🧣', wear: 'scarf' }, beanie: { n: 'Wool beanie', v: 70, w: 1, k: 'cloth', e: '🧢', wear: 'beanie' }, sweater: { n: 'Wool sweater', v: 190, w: 2, k: 'cloth', e: '🧥', wear: 'sweater' },
  blanket: { n: 'Wool blanket', v: 240, w: 3, k: 'cloth', e: '🟥' }, lambstew: { n: 'Lamb stew', v: 110, w: 1, k: 'food', e: '🍲', heal: 55 },
  hotdog: { n: 'Hot dog', v: 6, w: 1, k: 'food', e: '🌭', heal: 15 }, pretzel: { n: 'Pretzel', v: 4, w: 1, k: 'food', e: '🥨', heal: 10 }, soda: { n: 'Soda', v: 2, w: 1, k: 'food', e: '🥤', heal: 4 },
  coffee: { n: 'Coffee', v: 3, w: 1, k: 'food', e: '☕', heal: 5 }, donut: { n: 'Donut', v: 3, w: 1, k: 'food', e: '🍩', heal: 8 }, icecream: { n: 'Ice cream', v: 4, w: 1, k: 'food', e: '🍦', heal: 8 },
  lemonade: { n: 'Lemonade', v: 3, w: 1, k: 'food', e: '🍋', heal: 6 }, taco: { n: 'Taco', v: 7, w: 1, k: 'food', e: '🌮', heal: 18 }, cookie: { n: 'Cookie', v: 2, w: 1, k: 'food', e: '🍪', heal: 5 },
});
RECIPES.push(['yarn', { wool: 2 }, 'c'], ['scarf', { yarn: 1 }, 'c'], ['beanie', { yarn: 1 }, 'c'], ['sweater', { yarn: 3 }, 'c'], ['blanket', { yarn: 4 }, 'c'], ['lambstew', { mutton: 1, potato: 2, carrot: 1, herbs: 1 }, 'k']);
const KNIT = ['#b03a2e', '#1f618d', '#196f3d', '#7d3c98', '#d4ac0d', '#f0f0f0', '#5d6d7e'];
function useInvW(id) {
  const it = ITEMS[id], p = G.player; if (!it || !it.wear || !G.inv[id]) return useInv0(id);
  const col = pick(KNIT); if (it.wear === 'sweater') { p.shirt = col; p.jk = null; } else if (it.wear === 'beanie') { p.hat = 2; p.hatCol = col; } else { p.scarf = col; }
  invDel(id); LIFE().look = curLook(); Snd.play('rustle'); toast('You put on the ' + it.n.toLowerCase() + '. Cozy.'); doSave(true);
}

// ---------- animal rules ----------
// shooting at wild game or your own livestock is legal hunting/farming: no 'shots fired' heat unless people are close by
function huntingShot(aimA) { const p = G.player; if (!p || G.scene) return false; const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y; let hit = null, bd = 1e9;
  for (const a of G.animals) { if (a.dead || a.scene !== undefined) continue; const d = dist(ox, oy, a.x, a.y); if (d > 900 || Math.abs(angDiff(aimA, Math.atan2(a.y - oy, a.x - ox))) > .35) continue; if (d < bd) { bd = d; hit = a; } }
  if (!hit || hit.pet || hit.stray || hit.leash || hit.coop || hit.remoteF || hit.d.pet) return false; if (!hit.d.wild && !hit.rec) return false;
  return !(G.peds.some(q => !q.dead && !q.gang && q.role !== 'cop' && dist2(q.x, q.y, ox, oy) < 260 * 260)); }

// ---------- cars are witnesses too ----------
function scareCars(x, y, r, th) { if (G.scene) return; for (const c of G.cars) if (c.ai && c.ai.mode === 'traffic' && c.driver && c.driver !== G.player && dist2(c.x, c.y, x, y) < r * r && losClear(c.x, c.y, x, y)) reactCar(c, 'fear', th || G.player); }
function pickWitness(p) {
  const C = [], peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) { if (q.dead || q.gang || q.dealer || q.role === 'cop' || q.isPlayer || q.hostile || q.state === 'fight') continue; const d2 = dist2(q.x, q.y, p.x, p.y); if (d2 < 380 * 380 && losClear(q.x, q.y, p.x, p.y)) C.push([q, d2, .6]); }
  if (!G.scene) for (const c of G.cars) { const dr = c.driver; if (!dr || dr === p || c.dead || dr.gang || dr.role === 'cop' || c.remote) continue; const d2 = dist2(c.x, c.y, p.x, p.y); if (d2 < 460 * 460 && losClear(c.x, c.y, p.x, p.y)) C.push([c, d2, .35]); }
  C.sort((a, b) => a[1] - b[1]); for (const [o, , pr] of C) if (Math.random() < pr) return o; return null;
}

// ---------- minimap zoom ----------
const MZ = () => [1, .6, .36][G.settings.miniZoom | 0];
function drawMinimapV(sc) {
  drawMinimap0(sc); const R = 54 * sc * MSZ(), cx = VW - R - 12, cy = 46 * sc + R + 6, z = G.settings.miniZoom | 0;
  if (W.rail && !G.scene) { const p = G.scene ? G.outPos : (pCar() || G.player), scale = 3.2 * sc * MZ(), x = cx + (W.rail.xc - p.x) / T * scale; if (Math.abs(x - cx) < R) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.clip(); ctx.strokeStyle = '#6d4c41'; ctx.lineWidth = Math.max(1.5, 2 * scale / 3); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(x, cy - R); ctx.lineTo(x, cy + R); ctx.stroke(); ctx.setLineDash([]); if (G.train) { const ty = cy + (G.train.y - p.y) / T * scale; ctx.fillStyle = '#ffd54f'; ctx.fillRect(x - 3, Math.min(ty, ty - G.train.dir * G.train.len / T * scale), 6, G.train.len / T * scale); } ctx.restore(); } }
  const bx = cx - R - 4 * sc - (R > 60 * sc ? 18 * sc : 0), by = cy - R + 64 * sc, bw = 34 * sc, bh = 24 * sc; Input.miniZBtn = [bx - 8, by - 6, bw + 16, bh + 12];
  ctx.fillStyle = 'rgba(10,14,22,.85)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 7) : ctx.rect(bx, by, bw, bh); ctx.fill(); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 1.5; ctx.stroke();
  txt(['1×', '2×', '3×'][z], bx + bw / 2, by + bh * .72, 12 * sc, '#f2c230', 'center');
}

// ---------- multiplayer farm sync ----------
const CCODE = { wheat: 'w', corn: 'c', potato: 'p', carrot: 'r', tomato: 't', pumpkin: 'k', herbs: 'h' }, CDEC = Object.fromEntries(Object.entries(CCODE).map(([a, b]) => [b, a]));
let FMCACHE = '', FMT = -9, REMOTEF = {};
function farmsEnc() {
  if (G.t - FMT < 2) return FMCACHE; FMT = G.t; const out = [];
  FARMS.forEach((f, fi) => { if (!owned(f.b)) return; const F = farmData(f); let s = fi + ':'; f.plots.forEach((_, i) => { const pl = F.plots[i]; s += pl && pl.c ? CCODE[pl.c] + Math.min(9, Math.floor(cropProg(pl, F) * 9.99)) : '..'; }); const n = k => F.animals.filter(a => a.k === k).length; s += ':' + ['chicken', 'pig', 'cow', 'sheep'].map(n).join(','); out.push(s); });
  return (FMCACHE = out.join('|'));
}
function remoteFarmsTick() {
  REMOTEF = {}; if (!Net.room) return;
  for (const e of Net.peers.values()) { const fm = e.s && e.s.fm; if (typeof fm !== 'string' || fm.length > 3000) continue;
    for (const part of fm.split('|')) { const [a, b, c] = part.split(':'), fi = a | 0, f = FARMS[fi]; if (!f || owned(f.b) || typeof b !== 'string') continue; const plots = []; for (let i = 0; i < f.plots.length; i++) { const k = b[i * 2], d = b[i * 2 + 1]; plots.push(CDEC[k] ? { c: CDEC[k], pg: d === '9' ? 1 : (+d || 0) / 9 } : null); } const an = String(c || '').split(',').map(v => clamp(v | 0, 0, 30)); REMOTEF[fi] = { name: e.name, plots, an, peer: e.peer }; } }
  // visual-only animals on other players' farms
  const p = G.player; if (!p || G.scene) return;
  for (const fi in REMOTEF) { const f = FARMS[fi], R = REMOTEF[fi]; if (dist2((f.x0 + f.x1) / 2, (f.y0 + f.y1) / 2, p.x, p.y) > 1900 * 1900) continue; ['chicken', 'pig', 'cow', 'sheep'].forEach((k, ki) => { const have = G.animals.filter(a => a.remoteF == fi && a.k === k && !a.dead); for (let i = have.length; i < Math.min(20, R.an[ki]); i++) { const [tx, ty] = pick(f.pasture); G.animals.push(new Animal(k, (tx + .5) * T, (ty + .5) * T, { remoteF: +fi, b: [f.x0 + 8, f.y0 + 8, f.x1 - 8, f.y1 - 8] })); } for (let i = R.an[ki]; i < have.length; i++) G.animals.splice(G.animals.indexOf(have[i]), 1); }); }
  G.animals = G.animals.filter(a => a.remoteF === undefined || REMOTEF[a.remoteF]);
}
function remoteOwner(b) { const fi = FARMS.findIndex(f => f.b === b); return fi >= 0 && REMOTEF[fi] ? REMOTEF[fi].name : null; }

// ---------- contracts on the phone ----------
const hasFarm = () => FARMS.some(f => owned(f.b)), myLabs = () => W.realty.filter(r => r.kind === 'lab' && LIFE().own[r.id]);
const hasOps = () => hasFarm() || myLabs().length > 0;
function genDrugOrders() { const L = LIFE(), day = Math.floor(GH() / 24); if (L.dorders && L.dordersDay === day) return L.dorders; L.dordersDay = day; L.dorders = [];
  const dests = W.buildings.filter(b => b.door && ['bar', 'club', 'warehouse', 'strip', 'arcade'].includes(b.type) && !b.locked && !inBase(b.door.x, b.door.y));
  for (const r of myLabs()) { const D = DRUGS.find(d => d.id === r.drug); for (let i = 0; i < 3; i++) { const b = pick(dests), n = rint(5, D.base > 150 ? 12 : 20); L.dorders.push({ b: b.id, id: D.id, n, pay: Math.round(n * D.base * 1.3 + 400), hrs: rint(5, 10), sting: Math.random() < .2, ambush: Math.random() < .2 }); } }
  return L.dorders; }
function startDrugDeal(od) { const b = W.buildings[od.b], D = DRUGS.find(d => d.id === od.id);
  startMission({ title: 'Deal: ' + od.n + ' ' + D.n, reward: od.pay, timer: od.hrs * 50,
    update(dt) { this.timer -= dt; if (this.timer <= 0) return failMission('The buyer walked.'); this.target = { x: b.door.x, y: b.door.y, label: 'Buyer — ' + b.name }; const p = G.player, c = pCar(), px = c ? c.x : p.x, py = c ? c.y : p.y, d2 = dist2(px, py, b.door.x, b.door.y);
      if (d2 < 520 * 520 && !this.sprung) { this.sprung = 1; if (od.sting) { G.heat = Math.max(G.heat, 2.05); markSeen(); G.wantedSince = G.t - 6; G.starFlash = 2; Snd.play('starup'); msg('It\'s a setup — undercover cops!', '#ff6b6b'); } if (od.ambush) { const g = pick(Object.keys(GANGS)); for (let i = 0; i < 3; i++) { const q = new Ped(b.door.x + rnd(-120, 120), b.door.y + rnd(-120, 120), { gang: g }); q.state = 'fight'; q.target = p; q.timer = 40; q.hostile = 1; q.weapon = pick([WI.pistol, WI.uzi]); G.peds.push(q); } msg(GANGS[g].name + ' want your product. Ambush!', '#ff6b6b'); } }
      if (d2 < 160 * 160 && (!c || c.spd < 40)) { if (stars() > 0) { if (!this.w2) { this.w2 = 1; msg('The buyer won\'t show while the cops are on you.', '#f39c12'); } return; } const L = [G.inv]; const tc = nearCarTrunk(); if (tc) L.push(tc.trunk); if (have(od.id, L) >= od.n) { take(od.id, od.n, L); LIFE().earned += od.pay; completeMission(); } else if (!this.w1) { this.w1 = 1; msg(`You need ${od.n} ${D.n} — carrying ${have(od.id, L)}.`, '#f39c12'); } } else this.w1 = 0; },
    hud() { return `Deliver ${od.n} ${D.n} to ${b.name}${od.sting || od.ambush ? '' : ''}`; } }); }
function contractsTab(H) {
  const here = G.scene ? G.outPos : G.player, mi = b => (dist(here.x, here.y, b.door.x, b.door.y) / T * .012).toFixed(1) + ' mi';
  if (hasFarm()) { const c = H.col('Farm orders'); genOrders().forEach((od, i, O) => { const b = W.buildings[od.b], it = ITEMS[od.id]; H.row(c, it.e, `${it.n} ×${od.n} → ${b.name}`, `${money(od.pay)} · ${mi(b)} · ${od.hrs}h`, [H.btn('Accept', () => { O.splice(i, 1); Panel.close(); startDelivery(od); }, 'y', !!G.mission)]); }); }
  const labs = myLabs(); if (labs.length) { const c = H.col('Product contracts'); genDrugOrders().forEach((od, i, O) => { const b = W.buildings[od.b], D = DRUGS.find(d => d.id === od.id); H.row(c, '📦', `${od.n} ${D.n} → ${b.name}`, `${money(od.pay)} · ${mi(b)} · ${od.hrs}h · street price ${money(od.n * D.base)}`, [H.btn('Accept', () => { O.splice(i, 1); Panel.close(); startDrugDeal(od); }, 'y', !!G.mission)]); }); H.row(c, '⚠', 'Risky business', 'Some buyers are undercover cops, and rival crews sometimes ambush the drop. Carry product in your bag or a vehicle trunk.'); }
  H.foot.appendChild(H.mk('span', 'pnote', 'New contracts every in-game day. Pay is well above street price.'));
}

// ---------- more home decor ----------
const DECOR2 = [['kingbed', 'King-size bed', 1.9, 2.1, 1400, '🛏', 'Sleep'], ['bunk', 'Bunk bed', 1.05, 1.8, 700, '🛏', 'Sleep'], ['lamp', 'Floor lamp', .5, .5, 90, '💡'], ['aquarium', 'Aquarium', 1.6, .6, 1600, '🐠', 'Watch the fish'],
  ['fireplace', 'Fireplace', 1.8, .6, 2600, '🔥', 'Warm up'], ['hottub', 'Hot tub', 2, 2, 5500, '♨', 'Soak in the hot tub'], ['gym', 'Weight bench', 1.4, .8, 900, '🏋', 'Work out'], ['pingpong', 'Ping-pong table', 2, 1.2, 1100, '🏓', 'Play ping-pong'],
  ['dartboard', 'Dartboard', .6, .3, 150, '🎯', 'Throw darts'], ['records', 'Record player', .8, .6, 650, '📻', 'Change the record'], ['guitar', 'Guitar stand', .5, .5, 450, '🎸', 'Play guitar'], ['painting', 'Painting', 1.4, .25, 800, '🖼'],
  ['trophy', 'Trophy case', 1.4, .5, 1200, '🏆'], ['safebox', 'Floor safe', .8, .8, 2000, '🔒', 'Open the safe'], ['beanbag', 'Beanbag', .8, .8, 120, '🫘'], ['dining', 'Dining set', 2, 1.4, 950, '🍽'],
  ['neon', 'Neon sign', 1.4, .25, 700, '🌈'], ['cattree', 'Cat tree', .8, .8, 250, '🐈'], ['telescope', 'Telescope', .6, .6, 1800, '🔭', 'Stargaze'], ['xmastree', 'Holiday tree', 1, 1, 400, '🎄']];
for (const [t, n, w, h, pr, e, act] of DECOR2) { DECOR.push([t, n, w, h, pr, e]); IT[t] = { s: ['painting', 'neon', 'dartboard'].includes(t) ? 0 : 1, act }; }
function drawDecor2(g, it, x, y, w, h) {
  const sh = () => { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); }, rr = (a, b, c, d, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(a, b, c, d, r) : g.rect(a, b, c, d); g.fill(); }, t = G.t;
  switch (it.t) {
    case 'kingbed': case 'bunk': { sh(); rr(x, y, w, h, 4, '#4e342e'); g.fillStyle = '#f4f1ea'; g.fillRect(x + 3, y + 6, w - 6, h - 9); const pw = it.t === 'bunk' ? w - 10 : (w - 12) / 2; g.fillStyle = '#fff'; g.fillRect(x + 5, y + 9, pw, h * .13); if (it.t === 'kingbed') g.fillRect(x + 7 + pw, y + 9, pw, h * .13); g.fillStyle = it.t === 'bunk' ? '#c0392b' : '#6c3483'; g.fillRect(x + 3, y + h * .3, w - 6, h * .68); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(x + 3, y + h * .3, w - 6, 5); if (it.t === 'bunk') { g.fillStyle = '#4e342e'; g.fillRect(x, y, 4, h); g.fillRect(x + w - 4, y, 4, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + 4, y + h * .45, w - 8, 4); } g.fillStyle = '#4e342e'; g.fillRect(x, y, w, 6); break; }
    case 'lamp': { g.fillStyle = 'rgba(255,230,150,.18)'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 34, 0, TAU); g.fill(); g.fillStyle = '#333'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 7, 0, TAU); g.fill(); g.fillStyle = '#ffe9a8'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 11, 0, TAU); g.fill(); g.fillStyle = '#f5d76e'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 5, 0, TAU); g.fill(); break; }
    case 'aquarium': { sh(); rr(x, y, w, h, 3, '#263238'); g.fillStyle = '#1e88e5'; g.fillRect(x + 3, y + 3, w - 6, h - 6); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 3, y + 3, w - 6, 3); for (let i = 0; i < 4; i++) { const fx = x + 8 + ((t * (20 + i * 7) + i * 37) % (w - 16)), fy = y + 6 + (i * 5 % (h - 12)); g.fillStyle = ['#ff7043', '#ffd54f', '#ba68c8', '#4dd0e1'][i]; g.beginPath(); g.ellipse(fx, fy, 3.5, 2, 0, 0, TAU); g.fill(); } g.fillStyle = '#43a047'; g.fillRect(x + w - 10, y + 4, 2, h - 8); break; }
    case 'fireplace': { sh(); rr(x, y, w, h, 2, '#795548'); g.fillStyle = '#5d4037'; g.fillRect(x, y, w, 5); g.fillStyle = '#1a1a1a'; g.fillRect(x + w * .25, y + 6, w * .5, h - 8); for (let i = 0; i < 3; i++) { g.fillStyle = ['#ff6f00', '#ffb300', '#ffeb3b'][i]; const fh = (h - 12) * (.6 + .4 * Math.sin(t * 9 + i * 2)); g.beginPath(); g.ellipse(x + w * (.38 + i * .12), y + h - 4 - fh / 2, 4, fh / 2, 0, 0, TAU); g.fill(); } break; }
    case 'hottub': { sh(); rr(x, y, w, h, 18, '#8d6e63'); rr(x + 6, y + 6, w - 12, h - 12, 14, '#26c6da'); g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 7; i++) { const a = t * 2 + i, r2 = (w / 2 - 14) * ((i * 37 % 10) / 10); g.beginPath(); g.arc(x + w / 2 + Math.cos(a) * r2, y + h / 2 + Math.sin(a * 1.3) * r2, 2 + (i % 2), 0, TAU); g.fill(); } break; }
    case 'gym': { sh(); g.fillStyle = '#212121'; g.fillRect(x + w * .3, y + h * .25, w * .4, h * .5); g.fillStyle = '#9e9e9e'; g.fillRect(x, y + h / 2 - 1.5, w, 3); g.fillStyle = '#424242'; for (const s of [0, 1]) { g.fillRect(x + (s ? w - 7 : 1), y + 2, 6, h - 4); } break; }
    case 'pingpong': { sh(); rr(x, y, w, h, 2, '#1565c0'); g.strokeStyle = '#fff'; g.lineWidth = 2; g.strokeRect(x + 2, y + 2, w - 4, h - 4); g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.stroke(); g.fillStyle = '#fafafa'; g.beginPath(); g.arc(x + w / 2 + Math.sin(t * 6) * w * .35, y + h / 2 + Math.cos(t * 4) * h * .3, 2.5, 0, TAU); g.fill(); break; }
    case 'dartboard': { g.fillStyle = '#212121'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 11, 0, TAU); g.fill(); g.fillStyle = '#c62828'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 7, 0, TAU); g.fill(); g.fillStyle = '#2e7d32'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 3, 0, TAU); g.fill(); break; }
    case 'records': { sh(); rr(x, y, w, h, 3, '#6d4c41'); g.fillStyle = '#111'; g.beginPath(); g.arc(x + w * .4, y + h / 2, h * .38, 0, TAU); g.fill(); g.fillStyle = '#e53935'; g.beginPath(); g.arc(x + w * .4, y + h / 2, 3, 0, TAU); g.fill(); g.strokeStyle = '#bdbdbd'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + w - 5, y + 4); g.lineTo(x + w * .5, y + h * .55); g.stroke(); break; }
    case 'guitar': { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(-.6); g.fillStyle = '#5d4037'; g.fillRect(-1.5, -16, 3, 16); g.fillStyle = '#e65100'; g.beginPath(); g.ellipse(0, 4, 7, 9, 0, 0, TAU); g.fill(); g.fillStyle = '#3e2723'; g.beginPath(); g.arc(0, 3, 2.5, 0, TAU); g.fill(); g.restore(); break; }
    case 'painting': { g.fillStyle = '#8d6e63'; g.fillRect(x, y, w, h); const gr = g.createLinearGradient(x, 0, x + w, 0); gr.addColorStop(0, '#ff8a65'); gr.addColorStop(.5, '#4fc3f7'); gr.addColorStop(1, '#81c784'); g.fillStyle = gr; g.fillRect(x + 2, y + 2, w - 4, h - 4); break; }
    case 'trophy': { sh(); rr(x, y, w, h, 2, '#4e342e'); g.fillStyle = 'rgba(200,230,255,.35)'; g.fillRect(x + 3, y + 3, w - 6, h - 6); g.fillStyle = '#ffd54f'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x + 10 + i * (w - 20) / 3, y + h / 2, 4, 0, TAU); g.fill(); } break; }
    case 'safebox': { sh(); rr(x, y, w, h, 3, '#37474f'); g.fillStyle = '#546e7a'; g.fillRect(x + 3, y + 3, w - 6, h - 6); g.fillStyle = '#cfd8dc'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 6, 0, TAU); g.fill(); g.strokeStyle = '#37474f'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w / 2, y + h / 2); g.lineTo(x + w / 2 + Math.cos(t) * 5, y + h / 2 + Math.sin(t) * 5); g.stroke(); break; }
    case 'beanbag': { sh(); g.fillStyle = '#ef6c00'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.15)'; g.beginPath(); g.ellipse(x + w * .4, y + h * .4, w * .2, h * .15, 0, 0, TAU); g.fill(); break; }
    case 'dining': { sh(); g.fillStyle = '#5d4037'; for (const [cx2, cy2] of [[.15, .1], [.5, .02], [.85, .1], [.15, .9], [.5, .98], [.85, .9]]) g.fillRect(x + w * cx2 - 6, y + h * cy2 - 6, 12, 12); rr(x + w * .1, y + h * .2, w * .8, h * .6, 4, '#8d6e63'); g.fillStyle = '#eceff1'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x + w * (.25 + i * .17), y + h / 2, 5, 0, TAU); g.fill(); } break; }
    case 'neon': { const on = Math.sin(t * 3) > -.85; g.fillStyle = '#111'; g.fillRect(x, y, w, h); g.strokeStyle = on ? '#ff4fd8' : '#4a1a40'; g.lineWidth = 3; g.shadowColor = '#ff4fd8'; g.shadowBlur = on ? 10 : 0; g.beginPath(); g.moveTo(x + 6, y + h / 2); for (let i = 0; i < 6; i++) g.lineTo(x + 6 + (i + 1) * (w - 12) / 6, y + h / 2 + (i % 2 ? -4 : 4)); g.stroke(); g.shadowBlur = 0; break; }
    case 'cattree': { sh(); g.fillStyle = '#a1887f'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); g.fill(); g.fillStyle = '#d7ccc8'; g.beginPath(); g.arc(x + w * .35, y + h * .35, w * .22, 0, TAU); g.fill(); g.beginPath(); g.arc(x + w * .65, y + h * .65, w * .18, 0, TAU); g.fill(); break; }
    case 'telescope': { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(-.8); g.fillStyle = '#eceff1'; g.fillRect(-4, -18, 8, 26); g.fillStyle = '#90a4ae'; g.fillRect(-5, -20, 10, 4); g.restore(); g.fillStyle = '#455a64'; g.beginPath(); g.arc(x + w / 2, y + h / 2 + 6, 4, 0, TAU); g.fill(); break; }
    case 'xmastree': { g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.arc(x + w / 2 + 3, y + h / 2 + 4, w / 2, 0, TAU); g.fill(); g.fillStyle = '#1b5e20'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); g.fill(); g.fillStyle = '#2e7d32'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 3, 0, TAU); g.fill(); for (let i = 0; i < 8; i++) { const a = i * .8 + t * .3, r2 = w * .36; g.fillStyle = ['#e53935', '#ffd54f', '#42a5f5', '#fafafa'][i % 4]; g.beginPath(); g.arc(x + w / 2 + Math.cos(a) * r2, y + h / 2 + Math.sin(a) * r2, 2.2, 0, TAU); g.fill(); } g.fillStyle = '#ffd54f'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 3.5, 0, TAU); g.fill(); break; }
    case 'jewels': { sh(); rr(x, y, w, h, 3, '#37474f'); g.fillStyle = it.used ? 'rgba(120,120,120,.4)' : 'rgba(200,230,255,.45)'; g.fillRect(x + 3, y + 3, w - 6, h - 6); if (!it.used) for (let i = 0; i < 5; i++) { g.fillStyle = ['#e1f5fe', '#ffd54f', '#f48fb1', '#80deea', '#fff59d'][i]; g.beginPath(); g.arc(x + 8 + i * (w - 16) / 4, y + h / 2 + Math.sin(t * 3 + i) * 1.5, 2.6, 0, TAU); g.fill(); } else { g.strokeStyle = '#90a4ae'; g.beginPath(); g.moveTo(x + 4, y + 4); g.lineTo(x + w - 4, y + h - 4); g.moveTo(x + w - 4, y + 4); g.lineTo(x + 4, y + h - 4); g.stroke(); } break; }
  }
}
function decorUse(it) {
  const p = G.player, s = G.scene;
  switch (it.t) {
    case 'kingbed': case 'bunk': case 'bed': if (!canDecorate()) return false; Snd.play('snore'); p.hp = 100; G.save.spawn = s.b.id; const sl = sleepPass(); doSave(); G.fade = 2; say(s.b.name, 'You slept well' + sl + '. Health restored, game saved, and you\'ll wake up here.'); return true;
    case 'aquarium': heal(5); toast('The fish swim lazy circles. So calming.'); return true;
    case 'fireplace': heal(10); Snd.play('fire'); toast('Toasty.'); return true;
    case 'hottub': if (G.t < (G.tubT || 0)) return toast('You\'re already pruned. Give it a minute.'), true; G.tubT = G.t + 60; heal(40); Snd.play('splash'); toast('Ahh. +40 health'); return true;
    case 'gym': heal(15); G.strongT = G.t + 120; Snd.play('punch'); toast('Pumped! Your punches hit harder for two minutes.'); return true;
    case 'pingpong': { const w = Math.random() < .5; toast(w ? 'You win 21–' + rint(10, 19) + '!' : 'You lose ' + rint(10, 19) + '–21. Rematch?'); Snd.play('pop'); return true; }
    case 'dartboard': { const sc = rint(5, 180); toast(sc === 180 ? 'ONE HUNDRED AND EIGHTY!' : 'You score ' + sc + '.'); Snd.play('pop'); return true; }
    case 'records': Radio.set((Radio.st + 1) % STATIONS.length); toast('Now spinning: ' + STATIONS[Radio.st].n); return true;
    case 'guitar': { if (Snd.ctx) { const t0 = Snd.ctx.currentTime; [196, 247, 294, 392, 330, 294].forEach((f, i) => Snd.tone('triangle', f, f, .6, .14, t0 + i * .18)); } heal(3); toast('You strum a little tune.'); return true; }
    case 'safebox': openStorage('home'); return true;
    case 'telescope': toast(G.tod > 19 || G.tod < 5 ? (Math.random() < .3 ? 'A shooting star! Make a wish.' : 'You spot Saturn\'s rings.') : 'Bit bright out for stargazing.'); heal(3); return true;
  }
  return false;
}

// ---------- NPC street life: chats, arguments, muggings, strays, dog walkers ----------
const CHAT = [['Hey! Long time!', 'You too! How\'s the family?'], ['Did you see the game?', 'Don\'t get me started.'], ['Nice weather.', 'For now.'], ['Is that a new jacket?', 'Thrift store, baby.'], ['You hear about the bank job?', 'Crazy, right?'], ['Where\'s good to eat?', 'Hot dog cart by the park.'], ['Running late!', 'Go, go!'], ['Rent went up again.', 'Mine too. Unreal.']];
const ARGUE = [['You bumped me!', 'Watch where you\'re going!'], ['That\'s my parking spot!', 'Says who?'], ['You owe me fifty bucks!', 'I don\'t owe you nothing!']];
G.socials = [];
function socialTick(dt) {
  const p = G.player; if (!p || G.mode !== 'play' || G.scene) return;
  for (const s of G.socials) { s.t += dt; const [a, b] = s.who; if (a.dead || b.dead || (s.kind !== 'mug' && (a.state === 'flee' || b.state === 'flee'))) { s.done = 1; continue; }
    if (s.kind === 'chat' || s.kind === 'argue') { for (const [q, o] of [[a, b], [b, a]]) { q.mvx = q.mvy = 0; q.state = 'idle'; q.timer = 2; q.a = Math.atan2(o.y - q.y, o.x - q.x); }
      const L = s.lines; if (s.t > s.next && s.i < 2) { pedSay(s.i ? b : a, L[s.i]); s.i++; s.next = s.t + 2.2; }
      if (s.kind === 'argue' && s.t > 5 && !s.fought) { s.fought = 1; if (Math.random() < .55) { a.state = 'fight'; a.target = b; a.timer = 8; b.state = 'fight'; b.target = a; b.timer = 8; pedSay(a, 'That\'s it!'); const cop = G.peds.find(q => q.role === 'cop' && !q.dead && dist2(q.x, q.y, a.x, a.y) < 450 * 450); if (cop) { cop.state = 'fight'; cop.target = a; cop.timer = 10; pedSay(cop, 'Break it up!'); } } else pedSay(b, 'Whatever, man.'); s.done = s.t > 6 ? 1 : 0; }
      if (s.t > 6.5) { s.done = 1; for (const q of s.who) if (q.state === 'idle') { q.state = 'walk'; q.ring = null; } } }
    else if (s.kind === 'mug') { const d = dist(a.x, a.y, b.x, b.y); if (s.stage === 0) { const an = Math.atan2(b.y - a.y, b.x - a.x); a.state = 'idle'; a.mvx = Math.cos(an) * 110; a.mvy = Math.sin(an) * 110; a.a = an; if (d < 28 || s.t > 8) { s.stage = 1; s.t2 = s.t; pedSay(a, pick(['Wallet. Now.', 'Empty your pockets.', 'Nice phone. Gimme.'])); b.state = 'idle'; b.mvx = b.mvy = 0; } }
      else if (s.stage === 1 && s.t - s.t2 > 1.5) { s.stage = 2; pedSay(b, pick(['Take it! Take it!', 'Please, don\'t hurt me!'])); b.state = 'flee'; b.threat = a; b.timer = 8; a.state = 'walk'; a.ring = null; s.done = 1; } }
  }
  G.socials = G.socials.filter(s => !s.done);
  G.socT = (G.socT || 3) - dt; if (G.socT > 0) return; G.socT = rnd(2.5, 5);
  const near = G.peds.filter(q => !q.dead && !q.persist && q.state === 'walk' && !q.gang && q.role !== 'cop' && dist2(q.x, q.y, p.x, p.y) < 800 * 800 && !G.socials.some(s => s.who.includes(q)));
  if (near.length >= 2 && G.socials.length < 3) { const a = pick(near), b = near.filter(q => q !== a && dist2(q.x, q.y, a.x, a.y) < 140 * 140)[0]; if (b) { const argue = Math.random() < .15; G.socials.push({ kind: argue ? 'argue' : 'chat', who: [a, b], t: 0, i: 0, next: .3, lines: pick(argue ? ARGUE : CHAT) }); } }
  const thug = G.peds.find(q => q.gang && !q.dead && q.state === 'walk' && !q.hostile && dist2(q.x, q.y, p.x, p.y) < 700 * 700 && !G.socials.some(s => s.who.includes(q)));
  if (thug && Math.random() < .12 && darkness() > .2) { const v = near.filter(q => dist2(q.x, q.y, thug.x, thug.y) < 260 * 260)[0]; if (v) G.socials.push({ kind: 'mug', who: [thug, v], t: 0, stage: 0 }); }
  // strays and dog walkers in town
  const dn = districtAt(p.x, p.y), base = DISTRICTS[dn].as || dn; if (RURALSET.has(dn) || base === 'woods' || base === 'base') return;
  const strays = G.animals.filter(a => (a.stray || a.leash) && !a.dead); if (strays.length < 3 && Math.random() < .5) {
    for (let k = 0; k < 6; k++) { const ang = rnd(0, TAU), r = rnd(600, 1000), x = p.x + Math.cos(ang) * r, y = p.y + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T); if (!inMap(tx, ty) || W.solid[idx(tx, ty)] || inView(x, y, 40) || tileAt(tx, ty) !== TILE.WALK) continue;
      if (Math.random() < .5) { const kind = Math.random() < .55 ? 'cat' : 'dog'; G.animals.push(new Animal(kind, x, y, { stray: 1, name: kind === 'cat' ? 'Stray cat' : 'Stray dog' })); }
      else { const q = new Ped(x, y, {}); q.state = 'walk'; G.peds.push(q); const dg = new Animal('dog', x + 20, y + 10, { leash: q, stray: 1, name: pick(['Max', 'Lola', 'Bear', 'Coco']) }); dg.wa = null; G.animals.push(dg); }
      break; } }
  for (const a of G.animals) if (a.leash && (a.leash.dead || !G.peds.includes(a.leash))) a.leash = null;
}
function leashTick(dt) { for (const a of G.animals) { if (!a.leash || a.dead) continue; const q = a.leash, d = dist(a.x, a.y, q.x, q.y); a.t = 9; a.wa = null; if (d > 26) { const an = Math.atan2(q.y - a.y, q.x - a.x), sp = Math.min(260, (d - 20) * 4); a.x += Math.cos(an) * sp * dt; a.y += Math.sin(an) * sp * dt; a.a = an; a.ph += dt * sp * .12; } } }

// ---------- street vendors, buskers, concerts ----------
const STREETMENU = { hotdog: ['hotdog', 'pretzel', 'soda'], coffee: ['coffee', 'donut', 'pretzel'], icecream: ['icecream', 'lemonade', 'cookie'], taco: ['taco', 'soda'], lemonade: ['lemonade', 'cookie', 'icecream'] };
const CARTCOL = { hotdog: ['#e53935', '#ffeb3b'], coffee: ['#6d4c41', '#efebe9'], icecream: ['#f48fb1', '#e1f5fe'], taco: ['#43a047', '#ffca28'], lemonade: ['#fdd835', '#ffffff'] };
Object.assign(PROPDEF, { cart: { r: 16, solid: 1 }, stage: { r: 1, solid: 0 }, speaker: { r: 12, solid: 1 } }); TALLP.cart = 1;
Object.assign(RPROP, {
  cart(p) { const [c1, c2] = CARTCOL[p.kind] || CARTCOL.hotdog; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-15, -8, 34, 22); ctx.fillStyle = '#90a4ae'; ctx.fillRect(-16, -10, 32, 18); ctx.fillStyle = '#263238'; ctx.beginPath(); ctx.arc(-11, 9, 3.5, 0, TAU); ctx.arc(11, 9, 3.5, 0, TAU); ctx.fill(); ctx.save(); ctx.rotate(Math.sin(G.t * .5 + p.x) * .05); for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? c1 : c2; ctx.beginPath(); ctx.moveTo(0, -4); ctx.arc(0, -4, 21, i * TAU / 8, (i + 1) * TAU / 8); ctx.fill(); } ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(0, -4, 2, 0, TAU); ctx.fill(); ctx.restore(); if (p.kind === 'hotdog' || p.kind === 'coffee' || p.kind === 'taco') { ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 3; i++) { const k = (G.t * .6 + i / 3) % 1; ctx.beginPath(); ctx.arc(12 + Math.sin(k * 6 + i) * 3, -14 - k * 18, 2 + k * 3, 0, TAU); ctx.fill(); } } },
  stage(p) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-150, -60, 310, 130); ctx.fillStyle = '#3e2723'; ctx.fillRect(-155, -65, 310, 125); ctx.fillStyle = '#5d4037'; for (let x = -150; x < 150; x += 20) ctx.fillRect(x, -60, 18, 115); const on = concertOn(); if (on) { for (let i = 0; i < 4; i++) { ctx.fillStyle = `hsla(${(G.t * 80 + i * 90) % 360},90%,60%,.22)`; ctx.beginPath(); ctx.moveTo(-120 + i * 80, -65); ctx.lineTo(-170 + i * 80 + Math.sin(G.t * 2 + i) * 40, 160); ctx.lineTo(-70 + i * 80 + Math.sin(G.t * 2 + i) * 40, 160); ctx.closePath(); ctx.fill(); } } ctx.fillStyle = '#212121'; ctx.fillRect(-165, -70, 22, 34); ctx.fillRect(143, -70, 22, 34); },
  speaker(p) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-10, -12, 26, 28); ctx.fillStyle = '#1a1a1a'; ctx.fillRect(-12, -14, 24, 28); const k = 1 + (musicSrcOn(p) ? Math.max(0, Math.sin(G.t * 13)) * .2 : 0); ctx.fillStyle = '#424242'; ctx.beginPath(); ctx.arc(0, 4, 7 * k, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(0, -8, 3.5, 0, TAU); ctx.fill(); },
});
const concertOn = () => G.tod >= 18.5 && G.tod < 23.5 && G.day % 2 === 0;
const meetOn = () => G.tod >= 20 || G.tod < 4.5;
const musicSrcOn = p => p && p.meet ? meetOn() : concertOn();
const buskOn = s => G.tod >= 9 && G.tod < 23 && (G.day + s.seed) % 3 !== 0;
const BSCALES = { guitar: [196, 247, 294, 330, 392, 440, 494], sax: [233, 262, 311, 349, 392, 466, 523], violin: [294, 330, 370, 392, 440, 494, 587], drums: [], band: [131, 165, 196, 220, 262, 330, 392], edm: [110, 131, 147, 165, 196, 220] };
const CHORDS = [[0, 2, 4], [5, 0, 2], [3, 5, 0], [4, 6, 1]];
function musicTick(dt) {
  const p = G.player; if (!p || G.mode !== 'play' || !Snd.ctx || G.scene) return; const px = pCar() ? pCar().x : p.x, py = pCar() ? pCar().y : p.y;
  const srcs = [];
  for (const q of G.peds) if (q.inst && !q.dead && q.state !== 'flee') srcs.push({ x: q.x, y: q.y, inst: q.inst, R: 520, q });
  if (W.concert && concertOn()) srcs.push({ x: W.concert.x, y: W.concert.y, inst: 'band', R: 1100 });
  if (W.meet && meetOn()) srcs.push({ x: W.meet.x, y: W.meet.y, inst: 'edm', R: 1000 });
  let best = null, bd = 1; for (const s of srcs) { const d = dist(s.x, s.y, px, py) / s.R; if (d < bd) { bd = d; best = s; } } if (!best) return;
  const vol = (1 - bd) * (pCar() ? .45 : 1) * (Snd.mvol === undefined ? .7 : Snd.mvol + .2), M = G.music2 || (G.music2 = { beat: 0, t: 0 }); M.t -= dt; if (M.t > 0) return;
  const bpm = best.inst === 'edm' ? 124 : best.inst === 'band' ? 112 : best.inst === 'drums' ? 100 : 88, step = 60 / bpm / 2; M.t += step; M.beat++; const b = M.beat, t0 = Snd.ctx.currentTime + .02, sc = BSCALES[best.inst] || BSCALES.guitar, ch = CHORDS[Math.floor(b / 8) % 4];
  const T2 = (type, f, d, v) => Snd.tone(type, f, f, d, v * vol, t0);
  if (best.inst === 'guitar') { T2('triangle', sc[ch[b % 3]] * (b % 6 === 5 ? 2 : 1), .5, .1); if (b % 4 === 0) T2('triangle', sc[ch[0]] / 2, .9, .08); }
  else if (best.inst === 'sax') { if (b % 2 === 0 || Math.random() < .3) T2('sawtooth', sc[(ch[0] + [0, 2, 4, 3, 2, 1, 0, 4][b % 8]) % sc.length], step * 1.6, .045); }
  else if (best.inst === 'violin') { if (b % 2 === 0) T2('sawtooth', sc[(ch[(b >> 1) % 3] + 7) % sc.length] * 2, step * 2.2, .03); }
  else if (best.inst === 'drums') { if (b % 4 === 0) Snd.tone('sine', 140, 45, .18, .25 * vol, t0); if (b % 4 === 2) Snd.tone('square', 260, 160, .08, .07 * vol, t0); Snd.tone('square', 3000, 2400, .02, .025 * vol, t0); }
  else if (best.inst === 'band') { if (b % 4 === 0) Snd.tone('sine', 140, 45, .2, .3 * vol, t0); if (b % 4 === 2) Snd.tone('square', 260, 160, .09, .08 * vol, t0); Snd.tone('square', 3200, 2600, .02, .03 * vol, t0); if (b % 2 === 0) T2('sawtooth', sc[ch[0]] / 2, step * 1.8, .06); T2('square', sc[ch[b % 3]] * 2, step * .9, .025); }
  else if (best.inst === 'edm') { if (b % 2 === 0) Snd.tone('sine', 120, 40, .22, .34 * vol, t0); if (b % 4 === 3) Snd.tone('square', 3600, 3000, .03, .04 * vol, t0); T2('sawtooth', sc[(ch[0] + (b % 3)) % sc.length], step * .8, .03); if (b % 2) Snd.tone('sawtooth', sc[ch[0]] / 2, sc[ch[0]] / 2, step * .9, .07 * vol, t0); }
  if (best.q && Math.random() < .5) best.q.note = G.t;
}
function drawNotes() { for (const q of G.peds) { if (!q.inst || q.dead || !(G.t - (q.note || -9) < 1.2)) continue; const k = (G.t * .8 + q.x * .01) % 1; ctx.globalAlpha = 1 - k; ctx.fillStyle = '#ffd54f'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(k < .5 ? '♪' : '♫', q.x + 10 + Math.sin(k * 6) * 6, q.y - 20 - k * 26); ctx.globalAlpha = 1; } }
function drawInstrument(q) { if (!q.inst) return; ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a); const s = Math.sin(G.t * 9) * 1.5; if (q.inst === 'guitar' || q.inst === 'violin') { ctx.fillStyle = q.inst === 'guitar' ? '#e65100' : '#8d4a1f'; ctx.beginPath(); ctx.ellipse(8, 3, q.inst === 'guitar' ? 6 : 4, q.inst === 'guitar' ? 5 : 3, .4, 0, TAU); ctx.fill(); ctx.fillStyle = '#3e2723'; ctx.fillRect(10, -6 + s * .2, 12, 2); } else if (q.inst === 'sax') { ctx.strokeStyle = '#ffca28'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(8, 0); ctx.quadraticCurveTo(16, 6, 12, 12); ctx.stroke(); } else if (q.inst === 'drums') { ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.arc(14, 0, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#ffd54f'; ctx.beginPath(); ctx.arc(14, -11, 5, 0, TAU); ctx.fill(); } ctx.restore(); }

// ---------- generation: vendors, buskers, park stage, railway ----------
// railway: a north–south freight line through the far eastern countryside, end to end
function buildRail() {

  // pick the fully-rural, non-base column pair that only crosses plain homes/barns (fewest of them); those get cleared
  let best = null; for (let x0 = N0 + 18; x0 < N - 20; x0++) { if (isRoadCol(x0) || isRoadCol(x0 + 1)) continue; if (FARMS.some(f => f.estate && (x0 + 2) * T > f.x0 && x0 * T < f.x1)) continue; let rur = 0, ok = 1; const bs = new Set(); for (let y = 0; y < N && ok; y++) for (const x of [x0, x0 + 1]) { const cx = (x + .5) * T, cy = (y + .5) * T; if (inBase(cx, cy) || W.base && cx > W.base.x0 - 2 * T && cx < W.base.x1 + 2 * T && cy < W.base.y1 + 2 * T) { ok = 0; break; } if (RURALSET.has(districtAt(cx, cy))) rur++; const bi = W.bmap[idx(x, y)]; if (bi >= 0 && W.buildings[bi]) bs.add(bi); }
    if (!ok || rur < N * 2 * .85) continue; const L = [...bs].map(k => W.buildings[k]); if (L.some(b => b.realty || b.sub || b.mc || FARMS.some(f => f.b === b))) continue; if (!best || L.length < best.L.length) best = { x0, L }; }
  if (best) for (const b of best.L) { b.gone = 1; b.door = null; for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { W.bmap[idx(x, y)] = -1; setTileX(x, y, TILE.GRASS); } killProps(p => p.x > b.x * T - 20 && p.x < (b.x + b.w) * T + 20 && p.y > b.y * T - 20 && p.y < (b.y + b.h) * T + 20); }
  if (best) { const x0 = best.x0, crossings = []; W.rail = { x0, xc: (x0 + 1) * T, crossings };
    for (let y = 0; y < N; y++) for (const x of [x0, x0 + 1]) { const t = W.tile[idx(x, y)]; if (t === TILE.BLD) continue; if (t === TILE.ROAD) continue; if (t === TILE.WATER) { W.tile[idx(x, y)] = TILE.DIRT; } setTileX(x, y, TILE.DIRT); }
    for (let j = 0; j < NR; j++) crossings.push([j * RSP * T, (j * RSP + 4) * T]);
    killProps(p => Math.abs(p.x - W.rail.xc) < T * 1.2); W.parkSpots = W.parkSpots.filter(s => Math.abs(s.x - W.rail.xc) > T * 1.5); W.ruralSpots = W.ruralSpots.filter(s => Math.abs(s.x - W.rail.xc) > T * 1.5); W.lifeSpots = W.lifeSpots.filter(s => Math.abs(s.x - W.rail.xc) > T * 1.5); }
  if (W.rail) W.rail.crossings = W.rail.crossings.filter(([y0]) => W.tile[idx(W.rail.x0 - 1, Math.floor(y0 / T) + 1)] === TILE.ROAD || W.tile[idx(W.rail.x0 + 2, Math.floor(y0 / T) + 1)] === TILE.ROAD);
}
function cityLife() {
  const rng = mulberry32(31337), pk = a => a[Math.floor(rng() * a.length)];
  const sideSpot = (blk) => { for (let k = 0; k < 30; k++) { const side = Math.floor(rng() * 4), u = 2 + Math.floor(rng() * 8), tx = side === 0 ? blk.bx + u : side === 1 ? blk.bx + 11 : side === 2 ? blk.bx + u : blk.bx, ty = side === 0 ? blk.by : side === 1 ? blk.by + u : side === 2 ? blk.by + 11 : blk.by + u; if (tileAt(tx, ty) !== TILE.WALK || W.solid[idx(tx, ty)]) continue; const x = (tx + .5) * T, y = (ty + .5) * T; if (propsNear(x, y, 60).some(q => q.solid) || W.buildings.some(b => b.door && dist2(b.door.x, b.door.y, x, y) < 64 * 64)) continue; return [x, y, side]; } return null; };
  const VD = { downtown: ['hotdog', 'coffee', 'pretzel'], midtown: ['hotdog', 'coffee', 'taco'], oldtown: ['taco', 'hotdog'], park: ['icecream', 'hotdog', 'lemonade'], coast: ['icecream', 'lemonade'], suburbs: ['lemonade', 'icecream'], midtown2: ['coffee', 'hotdog'], town: ['lemonade'], town2: ['lemonade'] };
  let nv = 0, nb = 0; const INST = ['guitar', 'guitar', 'sax', 'violin', 'drums'];
  for (const blk of W.blocks) {
    const kinds = VD[blk.d]; if (!kinds) continue;
    if (rng() < .45 && nv < 22) { const s = sideSpot(blk); if (s) { let kind = pk(kinds); if (kind === 'pretzel') kind = 'hotdog'; addProp('cart', s[0], s[1], { kind }); const off = [[0, 30], [-30, 0], [0, -30], [30, 0]][s[2]]; W.lifeSpots.push({ x: s[0] + off[0] * .9, y: s[1] + off[1] * .9, kind: 'npc', role: 'vendor', vend: 'street', vkind: kind, vtab: 'buy', vname: { hotdog: 'Hot Dog Cart', coffee: 'Coffee Cart', icecream: 'Ice Cream Cart', taco: 'Taco Cart', lemonade: 'Lemonade Stand' }[kind], name: pk(['Sal', 'Rosa', 'Benny', 'Mei', 'Hector', 'Dottie', 'Raj', 'Tony']) }); nv++; } }
    if (['downtown', 'oldtown', 'park', 'coast', 'midtown', 'midtown2'].includes(blk.d) && rng() < .4 && nb < 14) { const s = sideSpot(blk); if (s) { W.lifeSpots.push({ x: s[0], y: s[1], kind: 'busker', inst: pk(INST), seed: nb, cond: null }); nb++; } }
  }
  for (const s of W.lifeSpots) if (s.kind === 'busker') s.cond = () => buskOn(s);
  // park concert stage
  const park = W.blocks.find(b => b.d === 'park'); if (park) { const cx = (park.bx + 6) * T, cy = (park.by + 3.5) * T; killProps(p => Math.abs(p.x - cx) < 220 && Math.abs(p.y - cy) < 300); addProp('stage', cx, cy); W.concert = { x: cx, y: cy + 60 };
    ['guitar', 'drums', 'sax'].forEach((inst, i) => W.lifeSpots.push({ x: cx - 80 + i * 80, y: cy - 10, kind: 'band', inst, cond: concertOn }));
    for (let i = 0; i < 10; i++) W.lifeSpots.push({ x: cx - 140 + (i % 5) * 70 + rng() * 20, y: cy + 110 + Math.floor(i / 5) * 50 + rng() * 20, kind: 'crowd', face: [cx, cy], cond: concertOn }); }
}
function makeSpotPed2(s) {
  if (s.kind === 'busker' || s.kind === 'band') { const q = new Ped(s.x, s.y, {}); q.inst = s.inst; q.state = 'idle'; q.still = 1; q.home = [s.x, s.y]; q.a = s.kind === 'band' ? Math.PI / 2 : rnd(0, TAU); q.busker = s.kind === 'busker'; if (s.kind === 'band') { q.shirt = pick(['#111', '#6a1b9a', '#b71c1c']); } return q; }
  if (s.kind === 'crowd') { const q = new Ped(s.x, s.y, {}); q.state = 'idle'; q.still = 1; q.home = [s.x, s.y]; q.a = Math.atan2(s.face[1] - s.y, s.face[0] - s.x); q.fan = 1; return q; }
  return null;
}

// ---------- freight train ----------
const TRAIN_CARS = 9, TRAIN_LEN = 120 + (TRAIN_CARS - 1) * 104;
function trainTick(dt) {
  if (!W.rail || G.mode !== 'play') return; const p = G.player; if (!p) return;
  if (!G.train) { if (G.trainNext === undefined) G.trainNext = G.t + 25; if (G.t > G.trainNext) { const dir = (G.trainDir = -(G.trainDir || -1)); G.train = { dir, y: dir > 0 ? -300 : N * T + 300, v: 560, len: TRAIN_LEN, horn: 0, clank: 0, cols: Array.from({ length: TRAIN_CARS - 1 }, () => pick(['#8d6e63', '#455a64', '#b71c1c', '#1565c0', '#2e7d32', '#6d4c41', '#f9a825'])), kinds: Array.from({ length: TRAIN_CARS - 1 }, () => pick(['box', 'box', 'tank', 'hopper', 'flat'])) }; } return; }
  const tr = G.train; tr.y += tr.dir * tr.v * dt; const y0 = Math.min(tr.y, tr.y - tr.dir * tr.len), y1 = Math.max(tr.y, tr.y - tr.dir * tr.len), xc = W.rail.xc;
  if ((tr.dir > 0 && y0 > N * T + 200) || (tr.dir < 0 && y1 < -200)) { G.train = null; G.trainNext = G.t + rnd(120, 200); return; }
  const px = pCar() ? pCar().x : p.x, py = pCar() ? pCar().y : p.y, dP = Math.abs(px - xc) + Math.max(0, Math.abs(py - (y0 + y1) / 2) - tr.len / 2);
  tr.horn -= dt; if (dP < 1100 && tr.horn <= 0 && !G.scene) { tr.horn = rnd(5, 9); Snd.play('trainhorn', xc, clamp(py, y0, y1)); }
  tr.clank -= dt; if (dP < 900 && tr.clank <= 0 && !G.scene) { tr.clank = .28; Snd.play('clank', xc, clamp(py, y0, y1), .35); }
  if (G.scene) return;
  const hit = (x, y, r) => Math.abs(x - xc) < 26 + r && y > y0 - r && y < y1 + r;
  for (const q of G.peds) if (!q.dead && hit(q.x, q.y, 6)) { q.hurt(999, null, 'car'); addDecal('blood', q.x, q.y); }
  if (!p.car && !p.dead && hit(p.x, p.y, 8)) { hurtPlayer(70, null, 'crash'); p.kx = Math.sign(p.x - xc || 1) * 420; p.x = xc + Math.sign(p.x - xc || 1) * 40; G.cam.shake = 14; Snd.play('thud'); }
  for (const c of G.cars) if (!c.dead && hit(c.x, c.y, c.W / 2)) { if (c === pCar()) { c.damage(220, null); c.vx = Math.sign(c.x - xc || 1) * 600 + c.vx * .2; c.vy = tr.dir * 300; c.x = xc + Math.sign(c.x - xc || 1) * (40 + c.W / 2); G.cam.shake = 16; Snd.play('crash'); } else { c.damage(9999, null); c.x = xc + Math.sign(c.x - xc || 1) * (40 + c.W / 2); } }
  for (const a of G.animals) if (!a.dead && hit(a.x, a.y, a.r)) a.hurt(999, null);
}
function railBlock(c) { const tr = G.train; if (!tr || !W.rail) return false; const xc = W.rail.xc, dx = xc - c.x; if (Math.abs(dx) > 300 || Math.abs(dx) < 70 || dx * Math.cos(c.a) <= 0) return false; const y0 = Math.min(tr.y, tr.y - tr.dir * tr.len) - 900, y1 = Math.max(tr.y, tr.y - tr.dir * tr.len) + 400; return c.y > y0 && c.y < y1; }
function drawRail() {
  if (!W.rail || G.scene) return; const [vx0, vy0, vx1, vy1] = viewRect(T), xc = W.rail.xc; if (xc < vx0 - 100 || xc > vx1 + 100) return;
  const ya = Math.max(0, vy0 - 40), yb = Math.min(N * T, vy1 + 40); ctx.fillStyle = '#6b6259'; ctx.fillRect(xc - 40, ya, 80, yb - ya); ctx.fillStyle = '#4e342e'; for (let y = Math.floor(ya / 22) * 22; y < yb; y += 22) ctx.fillRect(xc - 32, y, 64, 9);
  ctx.fillStyle = '#9ea7ad'; ctx.fillRect(xc - 20, ya, 5, yb - ya); ctx.fillRect(xc + 15, ya, 5, yb - ya); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(xc - 19, ya, 1.5, yb - ya); ctx.fillRect(xc + 16, ya, 1.5, yb - ya);
  const tr = G.train, near = tr ? [Math.min(tr.y, tr.y - tr.dir * tr.len) - 900, Math.max(tr.y, tr.y - tr.dir * tr.len) + 500] : null;
  for (const [cy0, cy1] of W.rail.crossings) { if (cy1 < vy0 - 60 || cy0 > vy1 + 60) continue; const on = near && cy1 > near[0] && cy0 < near[1], fl = Math.floor(G.t * 3) % 2;
    for (const [sx, sy] of [[xc - 70, cy0 - 14], [xc + 70, cy1 + 14]]) { ctx.fillStyle = '#212121'; ctx.fillRect(sx - 3, sy - 3, 6, 6); ctx.fillStyle = on && fl ? '#ff1744' : '#4a0d0d'; ctx.beginPath(); ctx.arc(sx - 7, sy, 4, 0, TAU); ctx.fill(); ctx.fillStyle = on && !fl ? '#ff1744' : '#4a0d0d'; ctx.beginPath(); ctx.arc(sx + 7, sy, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#fafafa'; ctx.save(); ctx.translate(sx, sy); ctx.rotate(.78); ctx.fillRect(-11, -1.5, 22, 3); ctx.rotate(-1.56); ctx.fillRect(-11, -1.5, 22, 3); ctx.restore();
      if (on) { ctx.fillStyle = '#fafafa'; ctx.fillRect(sx < xc ? sx - 2 - (T * 4 - 80) : sx + 2, sy - 2, T * 4 - 80, 4); ctx.fillStyle = '#e53935'; for (let k = 0; k < 4; k++) ctx.fillRect((sx < xc ? sx - (T * 4 - 80) : sx + 2) + k * 44, sy - 2, 20, 4); } } }
  if (!tr) return;
  for (let i = 0; i < TRAIN_CARS; i++) { const len = i === 0 ? 120 : 98, yc = tr.y - tr.dir * (i === 0 ? 60 : 120 + (i - 1) * 104 + 52); if (yc < vy0 - 140 || yc > vy1 + 140) continue; ctx.save(); ctx.translate(xc, yc); if (tr.dir < 0) ctx.rotate(Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-21, -len / 2 + 6, 48, len);
    if (i === 0) { ctx.fillStyle = '#263238'; ctx.fillRect(-23, -len / 2, 46, len); ctx.fillStyle = '#f9a825'; ctx.fillRect(-23, len / 2 - 30, 46, 30); ctx.fillStyle = '#1a237e'; ctx.fillRect(-20, -len / 2 + 6, 40, len - 44); ctx.fillStyle = '#90caf9'; ctx.fillRect(-16, len / 2 - 26, 32, 10); ctx.fillStyle = '#ffeb3b'; ctx.fillRect(-18, len / 2 - 2, 8, 3); ctx.fillRect(10, len / 2 - 2, 8, 3); ctx.fillStyle = '#37474f'; for (let k = 0; k < 4; k++) ctx.fillRect(-14, -len / 2 + 14 + k * 14, 28, 6); }
    else { const kd = tr.kinds[i - 1], col = tr.cols[i - 1]; ctx.fillStyle = '#212121'; ctx.fillRect(-21, -len / 2, 42, len); if (kd === 'tank') { ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-19, -len / 2 + 4, 38, len - 8, 18) : ctx.rect(-19, -len / 2 + 4, 38, len - 8); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(-8, -len / 2 + 8, 6, len - 16); } else if (kd === 'hopper') { ctx.fillStyle = col; ctx.fillRect(-20, -len / 2 + 2, 40, len - 4); ctx.fillStyle = 'rgba(0,0,0,.3)'; for (let k = 0; k < 3; k++) ctx.fillRect(-16, -len / 2 + 10 + k * 28, 32, 20); ctx.fillStyle = '#5d4037'; for (let k = 0; k < 3; k++) ctx.fillRect(-14, -len / 2 + 12 + k * 28, 28, 15); } else if (kd === 'flat') { ctx.fillStyle = '#6d4c41'; ctx.fillRect(-20, -len / 2 + 2, 40, len - 4); ctx.fillStyle = col; ctx.fillRect(-16, -len / 2 + 14, 32, 30); ctx.fillRect(-16, len / 2 - 44, 32, 30); } else { ctx.fillStyle = col; ctx.fillRect(-20, -len / 2 + 2, 40, len - 4); ctx.fillStyle = 'rgba(0,0,0,.2)'; for (let k = -len / 2 + 8; k < len / 2 - 4; k += 9) ctx.fillRect(-20, k, 40, 1.5); ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-20, -len / 2 + 2, 40, 4); } }
    ctx.restore(); }
}

// ---------- ticks & hooks ----------
function cityTick(dt) { socialTick(dt); leashTick(dt); musicTick(dt); trainTick(dt); G.rfT = (G.rfT || 0) - dt; if (G.rfT <= 0) { G.rfT = .5; remoteFarmsTick(); } }
function drawWorld2() { drawRail(); drawNotes(); for (const a of G.animals) if (a.leash && !a.dead && !G.scene) { ctx.strokeStyle = 'rgba(40,40,40,.8)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(a.leash.x, a.leash.y); ctx.stroke(); } }
