// ================= ONE GARAGE PER PROPERTY: cars live in a specific garage; the phone has a master list to deliver or move them =================
const garName = b => b.name === 'Your Apartment' ? 'Apartment' : (b.realty && b.realty.name) || b.name;
function capIn(g) { const b = g.b || g, nm = b.realty ? (b.realty.name || b.name) : b.name, e = garSlots().find(s => s[0] === nm); return e ? e[1] : b.name === 'Your Apartment' ? 6 : 0; }
const usedIn = g => myCars().filter(r => r.gar === (g.b || g).id).length;
// any car without a valid garage (new purchase, tow, insurance, sold property…) goes to the best garage with room
function garAssign() { const L = myCars(), gs = homeGarages(); if (!gs.length) return; const ids = new Set(gs.map(g => g.b.id)), o = herePos(); let n = null;
  for (const r of L) { if (ids.has(r.gar)) continue; if (!n) { n = {}; for (const g of gs) n[g.b.id] = L.filter(x => x.gar === g.b.id).length; }
    const pref = G.storeTo !== undefined && G.storeTo !== null && ids.has(G.storeTo) ? G.storeTo : Panel.mode === 'hgarage' && Panel.opt && Panel.opt.g ? Panel.opt.g.b.id : G.scene && G.scene.garage ? G.scene.garage.b.id : null;
    let pick = pref !== null && n[pref] < capIn(gs.find(g => g.b.id === pref)) ? pref : null;
    if (pick === null) { const c = gs.filter(g => n[g.b.id] < capIn(g)).sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y))[0] || gs[0]; pick = c.b.id; }
    r.gar = pick; n[pick]++; } }
{ const _sc = storeCar; storeCar = function (c) { const L = myCars(), n = L.length; _sc(c); if (L.length > n) { const r = L[L.length - 1]; if (G.storeTo !== undefined && G.storeTo !== null) r.gar = G.storeTo; garAssign(); } }; }
// delivered cars keep their wear & identity
{ const _dc = deliverCar; deliverCar = function (i) { const rec = myCars()[i], n = G.cars.length; _dc(i); const c = G.cars[G.cars.length - 1]; if (rec && G.cars.length > n && c.type === rec.type) { if (rec.pc) { c.pc = Object.assign({}, rec.pc); c.pcAvg = rec.pcAvg; applyMods(c); } c.gid = rec.id; } }; }
// ---- the walk-in room shows only this garage ----
function garSig() { garAssign(); const g = G.scene && G.scene.garage; return myCars().filter(r => !g || r.gar === g.b.id).map(r => recId(r) + JSON.stringify([r.type, r.mods, r.missing, r.noEng, r.shell])).join('|') + '#' + (g ? capIn(g) : 0); }
function garItems(s) { garAssign(); const g = s.garage, L = myCars().filter(r => r.gar === g.b.id), cap = Math.max(capIn(g), L.length), lay = garLayout(cap), items = [];
  for (let i = 0; i < cap; i++) { const col = i % lay.per, row = Math.floor(i / lay.per), bx = 1.3 + col * 2.3, by = 1.2 + row * 3.5, r = L[i]; if (r) recId(r);
    if (r) { const d = CAR_TYPES[r.type], lw = Math.min(1.5, d.W * 2 / T), lh = Math.min(3, d.L * 2 / T); items.push({ t: 'gcar', x: bx + (1.9 - lw) / 2, y: by + (3 - lh) / 2, w: lw, h: lh, bx, by, rid: r.id, used: 0 }); }
    else items.push({ t: 'gbay', x: bx, y: by, w: 1.9, h: 3, used: 0, small: 1, flat: 1, n: i + 1 }); }
  // spare bay slots in the last row become parts racking
  for (let i = cap; i < lay.rows * lay.per; i++) { const col = i % lay.per, row = Math.floor(i / lay.per), bx = 1.3 + col * 2.3, by = 1.2 + row * 3.5; items.push({ t: 'gshelf', x: bx + .1, y: by + .1, w: .7, h: 2.8, used: 0, v: i }); items.push({ t: 'gshelf', x: bx + 1.1, y: by + .1, w: .7, h: 2.8, used: 0, v: i + 7 }); }
  // racking along the back wall, either side of the door
  const dx = Math.floor(lay.w / 2), yb = lay.h - 1.75; items.push({ t: 'gwbench', x: 1.6, y: yb - .1, w: Math.max(1.6, dx - .7 - 1.6), h: .75, used: 0 }); for (let x = dx + 1.6; x + 1.5 <= lay.w - 1.15; x += 1.7) items.push({ t: 'gshelf', x, y: yb, w: 1.5, h: .65, used: 0, v: x * 5 });
  items.push({ t: 'gtool', x: .55, y: lay.h - 3, w: .7, h: 1.2, used: 0 }); s.items = items; s.sig = garSig(); }
function enterGarage(g) { garAssign(); const lay = garLayout(Math.max(capIn(g), usedIn(g))), w = lay.w, h = lay.h, solid = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) solid[y * w + x] = 1;
  const dx = Math.floor(w / 2); solid[(h - 1) * w + dx] = 0; const s = { b: g.b, garage: g, w, h, floor: 'concrete', items: [], npcDefs: [], solid, door: { x: (dx + .5) * T, y: (h - .6) * T }, peds: [], loot: {} }; garItems(s);
  const p = G.player; G.outPos = { x: g.x, y: g.y, b: g.b }; G.padBlock = g; G.scene = s; p.x = s.door.x; p.y = s.door.y - 44; p.a = -Math.PI / 2; p.kx = p.ky = 0; G.fade = 1; G.sitting = null; G.hgIn = g; Snd.play('door'); toast(garName(g.b) + ' garage · ' + usedIn(g) + '/' + capIn(g)); }
function garLayout(n) { const per = Math.min(Math.max(n, 3), 5), rows = Math.max(1, Math.ceil(n / per)); return { per, rows, w: Math.max(9, Math.ceil(per * 2.3 + 2.4)), h: Math.ceil(rows * 3.5 + 3.6) }; }
// toolbox: work on any car in this garage without walking to it
{ const _di = drawItem; drawItem = function (it, s) { if (it.t !== 'gtool') return _di(it, s); const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#c0392b'; g.fillRect(x, y, w, h); g.fillStyle = '#922b21'; for (let i = 1; i < 3; i++) g.fillRect(x + 2, y + i * h / 3, w - 4, 2); g.fillStyle = '#bdc3c7'; g.fillRect(x + w * .35, y - 5, w * .3, 5); g.font = 'bold 9px Rubik, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#4fc3f7'; g.fillText('TOOLS', x + w / 2, y - 8); }; }
{ const _ui = useItem; useItem = function (it) { if (it.t === 'gtool') { Panel.open('hgarage', { g: G.scene.garage }); Panel.tab = 'veh'; Panel.render(); return; } return _ui(it); }; }
// ---- walk or drive into the opening ----
{ const _hg = hgTick; hgTick = function () { 
  const c = pCar(); if (c && !G.scene && !G.dlgOpen && !c.d.boat) { const g = homeGarages().find(g => onPad(g, c)); if (g && c.spd <= 70 && G.hgIn !== g) { if (usedIn(g) >= capIn(g)) { G.hgIn = g; return toast(garName(g.b) + ' garage is full (' + usedIn(g) + '/' + capIn(g) + ') — move a car with the phone (Vehicles tab)'); } G.storeTo = g.b.id; try { return _hg(); } finally { G.storeTo = null; } } }
  return _hg(); }; }
// ---- phone › Vehicles: the master list ----
const DELIV = 250, MOVEF = 200;
function moveCar(r, g) { if (usedIn(g) >= capIn(g)) return toast('That garage is full'); if (!payAny(MOVEF)) return; r.gar = g.b.id; Snd.play('cash'); msg(CAR_TYPES[r.type].name + ' transported to ' + garName(g.b) + ' (−' + money(MOVEF) + ').', '#2ecc71'); doSave(true); Panel.render(); }
function moveDlg(r) { const gs = homeGarages().filter(g => g.b.id !== r.gar); if (!gs.length) return toast('You only have one garage — buy property for more'); closeDialog && closeDialog();
  say('Move ' + CAR_TYPES[r.type].name, 'Car transport to another of your garages · ' + money(MOVEF), gs.map(g => ({ t: garName(g.b) + ' (' + usedIn(g) + '/' + capIn(g) + ')', c: usedIn(g) < capIn(g) ? 'y' : '', f: () => { closeDialog(); moveCar(r, g); } })).concat([{ t: 'Cancel' }])); }
function garageCol(H) { garAssign(); const L = myCars(), gs = homeGarages(), o = herePos(), k = myNearCar();
  const c = H.col('My vehicles · ' + L.length + '/' + garCap());
  if (k && !k.d.boat) { const near = homeNear() || G.scene; H.row(c, '🅿', (k.driver ? 'This ' : 'Your ') + k.d.name, near ? 'Close to home — storing is free' : 'Tow it to the nearest garage with room · $150', [H.btn('Store', () => storeCarAny(k), 'y', garUsed() >= garCap() || (!near && !canPay(150)))]); }
  for (const g of gs.slice().sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y))) { const here = dist2(g.x, g.y, o.x, o.y) < 600 * 600, mine = L.map((r, i) => [r, i]).filter(([r]) => r.gar === g.b.id);
    c.appendChild(H.mk('div', 'ptitle', '🏠 ' + garName(g.b) + ' · ' + mine.length + '/' + capIn(g)));
    H.row(c, '📍', here ? 'You\'re here' : Math.round(dist(g.x, g.y, o.x, o.y) / T) + 'm away', 'Drive or walk onto the blue GARAGE pad', [H.btn('GPS', () => { setNav({ x: g.ax || g.x, y: g.ay || g.y, name: garName(g.b) + ' garage' }); Panel.close(); })]);
    if (!mine.length) H.empty(c, 'Empty');
    for (const [r, i] of mine) { const d = CAR_TYPES[r.type]; if (!d) continue; const ok = drivable(r.type, r.missing, r.noEng), listed = G.save.mkt && G.save.mkt.list.some(l => l.gid === r.id);
      const row = thumbRow(H, c, r.type, recColor(r), r.mods, d.name + (listed ? ' · for sale' : ''), (ok ? condWord(r.cond === undefined ? 1 : r.cond) : 'project — won\'t drive') + (isLegitRec(r) ? '' : ' · no title'), [
        H.btn(here ? 'Bring out' : 'Deliver ' + money(DELIV), () => { if (G.scene) return toast('Go outside first'); if (!ok) return toast('It won\'t drive — move it to another garage instead'); if (!here && !payAny(DELIV)) return; deliverCar(myCars().indexOf(r)); Panel.render(); }, 'y', !ok || (!here && !canPay(DELIV))),
        H.btn('Move', () => moveDlg(r), '', gs.length < 2)]); row.classList.add('pmsg'); } } }
{ const _u = update; update = function (dt) { _u(dt); if ((G.gaT = (G.gaT || 0) - dt) <= 0) { G.gaT = 1; if (G.mode === 'play' && G.save) garAssign(); } }; }
Object.assign(IT, { gcar: { s: 1, act: 'Work on this car' }, gbay: { s: 0 }, gshelf: { s: 1, act: 'Parts shelf' }, gtool: { s: 1, act: 'Toolbox — work on any car here' } });
// ---------- door cooldown: no accidental in-out-in from a held stick ----------
{ const _eb = enterBuilding; enterBuilding = function (b) { const r = _eb.apply(this, arguments); G.bldCD = G.t + 1.2; return r; };
  const _xb = exitBuilding; exitBuilding = function () { const r = _xb.apply(this, arguments); G.bldCD = G.t + 1.2; return r; };
  const _eg = enterGarage; enterGarage = function (g) { const r = _eg(g); G.bldCD = G.t + 1.2; return r; };
  const _di = doInteract; doInteract = function (o) { if (o && (o.k === 'door' || o.k === 'hgar') && G.t < (G.bldCD || 0)) return; return _di(o); }; }
// ================= GARAGE ↔ PROPERTY: a connecting door both ways, and USE on a parked car offers "Drive it out" =================
Object.assign(IT, { gdoor: { s: 1, act: 'Go inside' }, tgar: { s: 1, act: 'Go to the garage' } });
const garOfB = b => homeGarages().find(g => g.b === b);
{ const _gi = garItems; garItems = function (s) { _gi(s); const lay = garLayout(Math.max(capIn(s.garage), usedIn(s.garage))); s.items.push({ t: 'gdoor', x: lay.w - 1.5, y: lay.h - 3.4, w: .45, h: 1.3, used: 0 }); }; }
{ const _eb = enterBuilding; enterBuilding = function (b) { const r = _eb.apply(this, arguments); const s = G.scene; if (s && s.b === b && !s.garage && garOfB(b) && !s.items.some(it => it.t === 'tgar')) { const w = .45, h = 1.3;
      for (const x of [.6, s.w - 1.05]) for (let y = s.h - 2.6; y > 1; y -= .5) { if (s.items.some(it => x < it.x + it.w + .2 && x + w + .2 > it.x && y < it.y + it.h + .2 && y + h + .2 > it.y)) continue; s.items.push({ t: 'tgar', x, y, w, h, used: 0 }); return r; } } return r; }; }
function doorArt(it, label, col) { const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#6d4c41'; g.fillRect(x, y, w, h); g.fillStyle = '#8d6e63'; g.fillRect(x + 4, y + 4, w - 8, h - 8); g.fillStyle = '#f2c230'; g.beginPath(); g.arc(x + w * .5, y + h * .55, 3, 0, TAU); g.fill();
  g.font = 'bold 10px Rubik, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000'; g.strokeText(label, x + w / 2, y - 6); g.fillStyle = col; g.fillText(label, x + w / 2, y - 6); }
{ const _di = drawItem; drawItem = function (it, s) { if (it.t === 'gdoor') return doorArt(it, '🚪 ' + (s.garage && s.garage.b.name === 'Your Apartment' ? 'HOME' : garName(s.garage.b).toUpperCase()), '#2ecc71'); if (it.t === 'tgar') return doorArt(it, '🅿 GARAGE', '#4fc3f7'); return _di(it, s); }; }
{ const _ui = useItem; useItem = function (it) { const s = G.scene;
  if (it.t === 'gdoor' && s && s.garage) { const b = s.garage.b; enterBuilding(b); return; }
  if (it.t === 'tgar') { const g = garOfB(s.b); if (g) enterGarage(g); return; }
  if (it.t === 'gcar' && s && s.garage) { const g = s.garage, i = myCars().findIndex(r => r.id === it.rid), r = myCars()[i]; if (!r) return; const d = CAR_TYPES[r.type], ok = drivable(r.type, r.missing, r.noEng);
    return say(d.name, ok ? 'What do you want to do with it?' : 'It won\'t drive yet — ' + missText(r.type, r.missing, r.noEng) + '.', [
      { t: '🚗 Drive it out', c: 'y', f: () => { closeDialog(); takeOut2(myCars().indexOf(r), g); }, d: !ok },
      { t: '🔧 Work on it', f: () => { closeDialog(); Panel.open('hgarage', { g }); Panel.tab = 'veh'; Panel.wsel = r.id; Panel.render(); } }, { t: 'Cancel' }]); }
  return _ui(it); }; }
IT.gcar = { s: 1, act: 'Drive out / work on' };
