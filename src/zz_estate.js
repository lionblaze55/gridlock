// ================= REAL ESTATE: sell anything you own (two-step confirm), the starter apartment included — but never your last home; the Ironwood Bunker =================
KINDN.bunker = 'Bunker'; IT.armory = { s: 1, act: 'Ammo locker' }; IT.radio = { s: 1, act: 'Police scanner' }; IT.genset = { s: 1, act: 'Generator' };
const APT_VAL = 80000, RESK = new Set(['home', 'farm', 'bunker']);
const aptB = () => W.buildings.find(b => b.name === 'Your Apartment' && b.door);
const aptMine = () => !(G.save && G.save.life && G.save.life.aptSold);
const isMyApt = b => !!b && b.name === 'Your Apartment' && aptMine();
const isMyRes = b => !!b && (isMyApt(b) || !!(b.realty && !b.realty.apt && owned(b) && RESK.has(b.realty.kind)));
function residences() { const out = [], a = aptB(); if (a && aptMine()) out.push(a); const L = LIFE(); for (const id in L.own) { const b = W.buildings[id]; if (b && b.realty && RESK.has(b.realty.kind)) out.push(b); } return out; }
function homeB() { const R = residences(), sp = G.save && G.save.spawn !== undefined ? W.buildings[G.save.spawn] : null; return sp && R.includes(sp) ? sp : R[0] || null; }

// ---------- once sold, the apartment is just another listing (buy it back at full price) ----------
function aptSync() { const b = aptB(); if (!b || !G.save) return; const sold = !aptMine();
  if (sold && !(b.realty && b.realty.apt)) { b.realty = { id: b.id, name: 'Your Apartment', kind: 'home', price: APT_VAL, apt: 1 }; b.locked = 1; if (!W.realty.includes(b.realty)) W.realty.push(b.realty); }
  if (sold && b.realty) b.realty.price = APT_VAL;
  if (!sold && b.realty && b.realty.apt) { W.realty = W.realty.filter(r => r !== b.realty); delete b.realty; b.locked = 0; } }
{ const _bp = buyProperty; buyProperty = function (r) { if (r && r.apt) { if (!payAny(r.price)) return false; LIFE().aptSold = 0; aptSync(); G.hgT = 0; Snd.play('cash'); msg('🏠 Your Apartment is yours again — bed, stash and its 6-car garage.', '#2ecc71'); doSave(true); return true; } const ok = _bp(r); G.hgT = 0; return ok; }; }

// ---------- ownership checks ----------
homeGarages = function () { if (G.hgT && G.t - G.hgT < 2 && G.hgL) return G.hgL; G.hgT = G.t; return G.hgL = W.buildings.filter(b => b.door && (isMyApt(b) || (b.realty && !b.realty.apt && owned(b) && ['home', 'farm', 'biz', 'club', 'bunker'].includes(b.realty.kind)))).map(garagePad).filter(Boolean); };
{ const _gs = garSlots; garSlots = function () { const o = _gs(); if (!aptMine()) { const i = o.findIndex(s => s[0] === 'Your Apartment'); if (i >= 0) o.splice(i, 1); } return o; }; }
spawnPoint = function () { const sp = G.save && G.save.spawn !== undefined ? W.buildings[G.save.spawn] : null, okSafe = b => b && b.door && b.type === 'safehouse' && !b.realty && (b.name !== 'Your Apartment' || aptMine());
  const sb = (sp && sp.door && (isMyRes(sp) || okSafe(sp)) ? sp : null) || homeB() || W.buildings.find(okSafe);
  if (sb) return { x: sb.door.x + FACEV[sb.door.f][0] * 22, y: sb.door.y + FACEV[sb.door.f][1] * 22 }; return { x: roadCX(8), y: roadCY(4) }; };

// ---------- selling ----------
function placeInfo(b) { const apt = b === aptB(), r = apt ? { name: 'Your Apartment', kind: 'home', price: APT_VAL } : b.realty, O = apt ? {} : LIFE().own[b.id] || {};
  const slots = apt ? 6 : propSlots(b.id), val = Math.round(r.price * .7 / 500) * 500, safe = Math.floor(O.safe || 0), res = apt || RESK.has(r.kind), last = res && residences().length <= 1 && residences().includes(b);
  return { apt, r, O, slots, val, safe, res, last, name: apt ? 'Your Apartment' : b.name, full: garUsed() > garCap() - slots }; }
function sellPlace(b) { if (!b) return; const I = placeInfo(b), L = LIFE(); if (!I.apt && !L.own[b.id]) return;
  if (I.last) return say('Can\'t sell ' + I.name, 'This is your only place to live. You always need somewhere to sleep, keep your stash and respawn — buy another home, farm or the bunker first, then sell this one.', [{ t: 'OK' }]);
  if (I.full) return say('Can\'t sell ' + I.name + ' yet', 'You have ' + garUsed() + ' vehicles stored and selling would leave room for ' + (garCap() - I.slots) + '. Sell, scrap or move ' + (garUsed() - (garCap() - I.slots)) + ' first.', [{ t: 'OK' }]);
  const here = myCars().filter(r => r.gar === b.id).length, lines = ['You get ' + money(I.val + I.safe) + ' — 70% of its ' + money(I.r.price) + ' value' + (I.safe ? ', plus ' + money(I.safe) + ' from the safe' : '') + '.'];
  if (I.slots) lines.push('Garage space drops ' + garCap() + ' → ' + (garCap() - I.slots) + (here ? '; the ' + here + ' vehicle' + (here > 1 ? 's' : '') + ' stored here move to your other garages' : '') + '.');
  if (I.r.kind === 'lab' && I.O.prod >= 1) lines.push('The ' + Math.floor(I.O.prod) + ' units still in the lab are lost.');
  if (I.r.kind === 'farm') lines.push('Crops, animals and anything in farm storage stay with the farm.');
  if (I.r.kind === 'club') lines.push('Upgrades and popularity go with the club.');
  if (I.res) lines.push('Furniture you placed here is left behind. Your stash is safe — it comes with you.');
  lines.push('Buying it back later costs the full ' + money(I.r.price) + '.');
  say('Sell ' + I.name + '?', lines.join('\n'), [{ t: 'Continue to sale…', c: 'y', f: () => {
    say('Final confirmation', 'Sell ' + I.name + ' for ' + money(I.val + I.safe) + '?\nThis is final — the deed changes hands right away.', [{ t: '✔ Yes, sell ' + I.name, c: 'r', f: () => { closeDialog(); doSell(b); } }, { t: 'Cancel — keep it' }]); return true; } }, { t: 'Keep it' }]); }
function doSell(b) { const I = placeInfo(b), L = LIFE(); if (I.last || I.full) return; if (!I.apt && !L.own[b.id]) return;
  if (I.apt) { L.aptSold = 1; aptSync(); } else delete L.own[b.id]; if (L.decor) delete L.decor[b.id];
  if (G.save.spawn === b.id) { const h = homeB(); G.save.spawn = h ? h.id : undefined; }
  G.hgT = 0; garAssign(); addCash(I.val + I.safe); Snd.play('cash'); msg('🏷 Sold ' + I.name + ' for ' + money(I.val + I.safe) + '.', '#2ecc71');
  if (G.scene && (G.scene.b === b || (G.scene.garage && G.scene.garage.b === b))) exitBuilding(); doSave(true); if (Panel.mode) Panel.render(); }
function sellProperty(id) { return sellPlace(W.buildings[id]); }
function sellRow(H, col, b) { const I = placeInfo(b), sub = money(I.val + I.safe) + (I.slots ? ' · −' + I.slots + ' garage' : '') + (I.last ? ' · your only home — can\'t sell' : I.full ? ' · garage too full' : '');
  return H.row(col, '🏷', 'Sell ' + I.name, sub, [H.btn('Sell…', () => sellPlace(b), 'r', I.last)]); }
const myPlaces = () => { const out = [], a = aptB(); if (a && aptMine()) out.push(a); for (const id of Object.keys(LIFE().own)) { const b = W.buildings[id]; if (b && b.realty && !b.realty.apt) out.push(b); } return out; };
{ const ph = PMODES.phone; PMODES.phone = function (H) { aptSync(); const r = ph.call(this, H); const P = myPlaces(); if (!P.length) return r;
  if (this.tab === 'empire') { const cols = H.body.querySelectorAll('.pcol'), c0 = cols[0], c2 = cols[1];
    // the selected property's own column gets the bunker details and a sell button
    const b = W.buildings[this.sel]; if (c2 && b && b.realty && LIFE().own[this.sel]) { if (b.realty.kind === 'bunker') bunkerRows(H, c2, b); c2.appendChild(H.mk('div', 'ptitle', 'Sell')); sellRow(H, c2, b); }
    if (c0) { if (!Object.keys(LIFE().own).length) c0.innerHTML = ''; c0.appendChild(H.mk('div', 'ptitle', 'Sell property · garage ' + garUsed() + '/' + garCap())); for (const p of P) sellRow(H, c0, p);
      c0.appendChild(H.mk('div', 'pempty', 'You always keep at least one home (apartment, house, farm or bunker). Every sale asks twice before it goes through.')); } }
  if (this.tab === 'realty') { const c = H.col('Yours — sell'); for (const p of P) sellRow(H, c, p); }
  return r; }; }

// ---------- the Ironwood Bunker: a hardened hideout in the woods ----------
const CABINS = /^(Hunting Cabin|Trapper's Cabin|Ranger Cabin|Old Cabin)$/;
function bunkerGen() { const C = W.buildings.filter(b => b.door && b.type === 'home' && !b.realty && CABINS.test(b.name)); if (!C.length) return; const cx = NR * RSP * T * .35, cy = NR * RSP * T * .35;
  C.sort((a, b) => dist2(a.door.x, a.door.y, cx, cy) - dist2(b.door.x, b.door.y, cx, cy)); const b = C[Math.floor(C.length * .5)];
  b.name = 'Ironwood Bunker'; b.bunker = 1; b.locked = 1; b.realty = { id: b.id, name: b.name, kind: 'bunker', price: 450000 }; W.realty.push(b.realty); W.bunker = b;
  killProps(p => p.x > b.x * T - 80 && p.x < (b.x + b.w) * T + 80 && p.y > b.y * T - 80 && p.y < (b.y + b.h) * T + 80 && !TALLP[p.t] && p.t !== 'tree'); }
{ const _sg = storeGen; storeGen = function () { _sg(); try { bunkerGen(); } catch (e) { console.error(e); } }; }
{ const _er = econRealty; econRealty = function () { _er(); if (W.bunker && W.bunker.realty) W.bunker.realty.price = 450000; }; }
const bunkOwned = () => !!(W.bunker && owned(W.bunker));
// outside: an earth-covered concrete bunker with camo netting, a blast door, vents and an antenna
function drawBunkerTop() { const b = W.bunker; if (!b || G.scene) return; const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T; if (!inView(x + w / 2, y + h / 2, w + 200)) return; const g = ctx, r = mulberry32(b.id * 77 + 5);
  g.save(); g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, x - 26, y - 18, w + 60, h + 48, 40); g.fill(); g.fillStyle = '#4e5b31'; rr(g, x - 34, y - 26, w + 68, h + 52, 44); g.fill(); g.fillStyle = '#5f6e3b'; rr(g, x - 18, y - 12, w + 36, h + 24, 30); g.fill();
  g.fillStyle = '#7d7f78'; rr(g, x + 6, y + 6, w - 12, h - 12, 10); g.fill(); g.strokeStyle = '#5c5e58'; g.lineWidth = 3; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(x + 6 + (w - 12) * i / 4, y + 6); g.lineTo(x + 6 + (w - 12) * i / 4, y + h - 6); g.stroke(); }
  for (let i = 0; i < 26; i++) { g.fillStyle = ['rgba(52,70,32,.75)', 'rgba(88,104,52,.7)', 'rgba(40,48,28,.7)'][i % 3]; g.beginPath(); g.ellipse(x + r() * w, y + r() * h, 14 + r() * 26, 9 + r() * 16, r() * 3, 0, TAU); g.fill(); }
  const hx = x + w * .72, hy = y + h * .35; g.fillStyle = '#3c3f3a'; g.beginPath(); g.arc(hx, hy, 20, 0, TAU); g.fill(); g.fillStyle = '#62665e'; g.beginPath(); g.arc(hx, hy, 15, 0, TAU); g.fill(); g.strokeStyle = '#2b2d29'; g.lineWidth = 3; g.beginPath(); g.moveTo(hx - 10, hy); g.lineTo(hx + 10, hy); g.moveTo(hx, hy - 10); g.lineTo(hx, hy + 10); g.stroke();
  for (const [vx, vy] of [[x + w * .2, y + h * .3], [x + w * .32, y + h * .3]]) { g.fillStyle = '#2f312d'; g.beginPath(); g.arc(vx, vy, 9, 0, TAU); g.fill(); g.fillStyle = '#9a9c95'; g.beginPath(); g.arc(vx, vy, 6, 0, TAU); g.fill(); g.fillStyle = '#2f312d'; g.fillRect(vx - 6, vy - 1.5, 12, 3); }
  const ax = x + w * .15, ay = y + h * .75; g.strokeStyle = '#9e9e9e'; g.lineWidth = 2; g.beginPath(); g.moveTo(ax, ay); g.lineTo(ax + 26, ay - 30); g.stroke(); g.fillStyle = Math.floor(G.t * 1.3) % 2 ? '#ff1744' : '#5a0010'; g.beginPath(); g.arc(ax + 26, ay - 30, 4, 0, TAU); g.fill();
  const d = b.door, [fx, fy] = FACEV[d.f]; g.translate(d.x - fx * 18, d.y - fy * 18); g.rotate(Math.atan2(fy, fx)); g.fillStyle = '#2b2d29'; g.fillRect(-8, -30, 22, 60); g.fillStyle = '#4b4f47'; g.fillRect(-4, -26, 14, 52); g.fillStyle = '#f2c230'; for (let i = 0; i < 4; i++) g.fillRect(-4, -26 + i * 14, 14, 5); g.restore();
  if (darkness() > .4) pushLight('pt', d.x, d.y, 70, 'rgba(255,220,150,1)', .6); }
{ const _db = drawBirds; drawBirds = function (air) { if (air) drawBunkerTop(); return _db(air); }; }
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(); if (W.bunker) o.push({ x: W.bunker.door.x, y: W.bunker.door.y, c: bunkOwned() ? '#9ccc65' : '#78909c', ic: 'B', r: 6, n: 'Ironwood Bunker' + (bunkOwned() ? '' : ' (for sale)'), pr: 5 }); return o; }; }
// inside: bunks, stash, ammo locker, gun bench, police scanner, generator, kitchen and supplies
function bunkerFit(s) { if (s.bunkSet) return; s.bunkSet = 1; const W2 = s.w, H2 = s.h, A = (t, x, y, w, h, ex) => s.items.push(Object.assign({ t, x, y, w, h, used: 0, small: 1 }, ex || {}));
  s.items = s.items.filter(it => it.deco); s.peds = (s.peds || []).filter(q => q === G.player); s.floor = 'concrete'; s.npcDefs = [];
  A('bed', .5, .5, .95, 1.35); A('bed', 1.6, .5, .95, 1.35); A('nstand', 2.7, .6, .42, .42); A('lamp', 2.74, .64, .34, .34);
  A('stash', 3.4, .5, .74, .59); A('armory', 4.35, .4, 1.4, .55); A('radio', 6.1, .45, 1.2, .55); A('chair', 6.5, 1.15, .38, .38);
  A('genset', W2 - 2.1, .4, 1.5, .9); A('barrel2', W2 - .9, 1.6, .5, .5); A('barrel2', W2 - .9, 2.2, .5, .5);
  A('kcounter', .5, H2 - 1.4, 1.75, .5); A('sink', .65, H2 - 1.37, .55, .42); A('stove', 2.3, H2 - 1.45, .74, .55); A('fridge', 3.1, H2 - 1.5, .74, .62);
  A('table', 4.2, H2 * .48, 1.05, .9); A('chair', 3.8, H2 * .48 + .25, .38, .38); A('chair', 5.3, H2 * .48 + .25, .38, .38);
  A('boxes', W2 - 1.6, H2 - 1.5, .9, .6); A('boxes', W2 - 2.7, H2 - 1.5, .9, .6); A('box', W2 - 1.2, H2 * .5, .5, .5); A('books', .45, 2.4, .37, 1.48, { v: 1 });
  addGunBench(s); applyDecor(s); }
{ const _eq = enterBuildingQ; enterBuildingQ = function (b) { _eq(b); const s = G.scene; if (s && s.b === b && b.bunker && owned(b)) { bunkerFit(s); if (stars() > 0) msg('🛡 Blast door sealed. The cops lose your trail down here.', '#9ccc65'); } }; }
{ const _cf = chasersFor; chasersFor = function (b) { return b && b.bunker && owned(b) ? [] : _cf(b); }; }
function drawBunkerItem(it) { const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 5, w, h);
  if (it.t === 'armory') { g.fillStyle = '#37474f'; g.fillRect(x, y, w, h); g.fillStyle = '#263238'; for (let i = 0; i < 3; i++) g.fillRect(x + 4 + i * (w - 8) / 3, y + 4, (w - 8) / 3 - 4, h - 8); g.fillStyle = '#c0a060'; for (let i = 0; i < 6; i++) g.fillRect(x + 8 + i * (w - 16) / 6, y + h * .3, 4, h * .45); g.fillStyle = '#f2c230'; g.fillRect(x, y + h - 4, w, 4); }
  else if (it.t === 'radio') { g.fillStyle = '#3e4a3d'; g.fillRect(x, y, w, h); g.fillStyle = '#111'; g.fillRect(x + 5, y + 4, w * .45, h - 10); g.fillStyle = stars() > 0 ? (Math.floor(G.t * 4) % 2 ? '#ff5252' : '#4fc3f7') : '#26a69a'; g.fillRect(x + 8, y + 7, w * .45 - 6, h - 16); g.fillStyle = '#9e9e9e'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(x + w * .62 + i * 9, y + h / 2, 3, 0, TAU); g.fill(); } g.strokeStyle = '#bdbdbd'; g.lineWidth = 2; g.beginPath(); g.moveTo(x + w - 6, y + 4); g.lineTo(x + w + 4, y - 18); g.stroke(); }
  else if (it.t === 'genset') { g.fillStyle = '#556b2f'; g.fillRect(x, y, w, h); g.fillStyle = '#3b4a20'; for (let i = 0; i < 5; i++) g.fillRect(x + 6, y + 6 + i * (h - 12) / 5, w * .5, 3); g.fillStyle = '#212121'; g.beginPath(); g.arc(x + w * .78, y + h * .5, h * .28, 0, TAU); g.fill(); g.save(); g.translate(x + w * .78, y + h * .5); g.rotate(G.t * 14); g.fillStyle = '#757575'; g.fillRect(-h * .24, -2, h * .48, 4); g.restore(); g.fillStyle = '#76ff03'; g.beginPath(); g.arc(x + 8, y + h - 8, 3, 0, TAU); g.fill(); } }
{ const _di = drawItem; drawItem = function (it, s) { if (it.t === 'armory' || it.t === 'radio' || it.t === 'genset') return drawBunkerItem(it); return _di(it, s); }; }
function ammoTopUp() { const p = G.player, list = []; let cost = 0; for (let i = 1; i < WEAPONS.length; i++) { const w = WEAPONS[i]; if (!(p.ammo[i] > 0) || !w.mag || w.melee) continue; const add = w.mag * 3; list.push([i, add]); cost += Math.round((w.ammoPrice || 60) * .7); } return { list, cost: Math.round(cost / 10) * 10 }; }
{ const _ui = useItem; useItem = function (it) { const s = G.scene;
  if (it.t === 'armory') { const A = ammoTopUp(); if (!A.list.length) return toast('No guns that take ammo — buy one at a gun shop'); return say('Ammo locker', 'Bulk crates at a discount: three mags for each of your ' + A.list.length + ' gun' + (A.list.length > 1 ? 's' : '') + '.', [{ t: 'Restock for ' + money(A.cost), c: 'y', d: !canPay(A.cost), f: () => { if (!payAny(A.cost)) return; for (const [i, n] of A.list) G.player.ammo[i] += n; Snd.play('cock'); toast('Restocked'); } }, { t: 'Close' }]); }
  if (it.t === 'radio') { const st = stars(); return say('Police scanner', st ? '"…all units, suspect last seen near ' + (DISTRICTS[districtAt(G.outPos ? G.outPos.x : G.player.x, G.outPos ? G.outPos.y : G.player.y)] || {}).name + '… no visual…"\nYou\'re ' + st + '★ wanted. Down here they can\'t find you — it dies down fast.' : 'Quiet night on the band. Nobody is looking for you.', [{ t: 'OK' }]); }
  if (it.t === 'genset') { Snd.play('clunk'); return toast('Diesel generator — off-grid power, humming along'); }
  return _ui(it); }; }
// lying low: wanted level drains quickly inside your bunker
{ const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play') return; if (G.scene && G.scene.b && G.scene.b.bunker && owned(G.scene.b) && G.heat > 0) { G.heat = Math.max(0, G.heat - dt * .12); if (G.heat <= 0) msg('🛡 The heat is off. Nobody is looking for you.', '#9ccc65'); }
  if ((G.estT = (G.estT || 0) - dt) <= 0) { G.estT = 3; aptSync(); } }; }
function bunkerRows(H, c2, b) { H.row(c2, '🛡', 'Hideout', 'Cops can\'t follow you inside, and your wanted level drains fast while you\'re down there.', [H.btn('GPS', () => { setNav({ x: b.door.x, y: b.door.y, name: b.name }); Panel.close(); })]);
  H.row(c2, '🛏', 'Bunks & stash', 'Sleep to save and set your spawn; your stash is here too.'); H.row(c2, '🔫', 'Ammo locker & gun bench', 'Bulk ammo at a discount and a bench for your guns.'); H.row(c2, '🅿', '10-vehicle garage', 'Its own GARAGE pad outside the blast door.'); }
