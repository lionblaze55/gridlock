// ================= LIFE SIM: phone, bank, look, home decor, property, businesses, drug labs, day jobs =================
const LIFE = () => G.save.life || (G.save.life = { own: {}, jobs: {}, earned: 0, look: null, decor: {} });
const owned = b => !!(b && LIFE().own[b.id]);
function payAny(n) { if (G.cash + G.bank < n) { Snd.play('bad'); toast("You can't afford that"); return false; } const c = Math.min(G.cash, n); G.cash -= c; G.bank -= n - c; Snd.play('cash'); return true; }
const canPay = n => G.cash + G.bank >= n;
const RANKS = [[0, 'Nobody'], [5000, 'Hustler'], [25000, 'Player'], [100000, 'Shot Caller'], [300000, 'Boss'], [1000000, 'Kingpin']];
const rankName = () => { let r = RANKS[0][1]; for (const [n, t] of RANKS) if (LIFE().earned >= n) r = t; return r; };
function nearRoadSpot(o, rad) { const tx0 = Math.floor(o.x / T), ty0 = Math.floor(o.y / T), R = rad || 7; let best = null, bd = 1e9; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const tx = tx0 + dx, ty = ty0 + dy, t = tileAt(tx, ty); if (!inMap(tx, ty) || (t !== TILE.ROAD && t !== TILE.LOT && t !== TILE.DIRT)) continue; const x = (tx + .5) * T, y = (ty + .5) * T, d = Math.hypot(dx, dy) + (t === TILE.ROAD ? 0 : -.5); if (d < 1.5 || d >= bd) continue; if (G.cars.some(c => dist2(c.x, c.y, x, y) < 100 * 100)) continue; bd = d; best = [x, y, t]; } if (!best) return null; let a = 0; if (best[2] === TILE.ROAD) { const fx = ((best[0] / T - 2) % RSP + RSP) % RSP, fy = ((best[1] / T - 2) % RSP + RSP) % RSP; if (fx < 2.2 || fx > RSP - 2.2) a = fx < 2.2 ? -Math.PI / 2 : Math.PI / 2; else a = fy < 2.2 ? 0 : Math.PI; } return [best[0], best[1], a]; } // face the way traffic flows in that lane
const herePos = () => G.scene ? G.outPos : (pCar() || G.player);

// ---------- look ----------
const LOOKDEF = { skin: SKIN, hair: HAIR.concat(['#e84393', '#00cec9', '#6c5ce7', '#f5f5f5']), shirt: SHIRT.concat(['#111111', '#ffffff', '#6d4c41', '#00b894', '#fd79a8', '#0984e3']), jk: [null, '#1c1c1c', '#263238', '#4e342e', '#1b5e20', '#880e4f', '#0d47a1', '#b71c1c', '#f5f5f5', '#d4af37'], pants: ['#1b2631', '#2c3e50', '#5d4037', '#7f8c8d', '#111111', '#f5f5f5', '#6d1b1b', '#1e5631', '#c2b280'], shoe: ['#111', '#3e2723', '#eee', '#c0392b', '#2980b9', '#f1c40f'], hatCol: [null, '#111111', '#c0392b', '#2980b9', '#f1c40f', '#ecf0f1', '#27ae60', '#8e44ad'] };
const HSNAME = ['Short', 'Side part', 'Afro', 'Receding', 'Ponytail', 'Shaved'];
function curLook() { const p = G.player; return { skin: p.skin, hair: p.hair, hs: p.hs || 0, shirt: p.shirt, jk: p.jk || null, pants: p.pants, shoe: p.shoe, hat: p.hat || 0, hatCol: p.hatCol || null, shades: p.shades || 0 }; }
function applyLook(p) { const L = LIFE().look; if (L) Object.assign(p, L); }
function newPlayer(x, y) { const p = newPlayer0(x, y); applyLook(p); return p; }
function drawDoll(cv, L) { // front-on paper doll for the mirror
  const g = cv.getContext('2d'), w = cv.width, h = cv.height; g.clearRect(0, 0, w, h); g.save(); g.translate(w / 2, 0); const s = h / 150; g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 143, 30, 6, 0, 0, TAU); g.fill();
  g.fillStyle = L.shoe; g.fillRect(-17, 133, 15, 8); g.fillRect(2, 133, 15, 8); g.fillStyle = L.pants; g.fillRect(-15, 86, 13, 49); g.fillRect(2, 86, 13, 49); g.fillRect(-15, 82, 30, 10);
  g.fillStyle = L.skin; g.fillRect(-27, 46, 8, 40); g.fillRect(19, 46, 8, 40); g.fillStyle = L.jk || L.shirt; g.fillRect(-28, 42, 10, 30); g.fillRect(18, 42, 10, 30);
  g.fillStyle = L.shirt; g.beginPath(); g.roundRect ? g.roundRect(-19, 40, 38, 46, 5) : g.rect(-19, 40, 38, 46); g.fill(); if (L.jk) { g.fillStyle = L.jk; g.fillRect(-19, 40, 12, 46); g.fillRect(7, 40, 12, 46); g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(-8, 40, 1.5, 46); g.fillRect(6.5, 40, 1.5, 46); }
  g.fillStyle = L.skin; g.fillRect(-5, 32, 10, 10); g.beginPath(); g.arc(0, 22, 15, 0, TAU); g.fill();
  g.fillStyle = L.hair; const hs = L.hs || 0;
  if (hs !== 5) { g.beginPath(); g.arc(0, 19, 15.5, Math.PI, TAU); g.fill(); } if (hs === 1) g.fillRect(-15.5, 14, 22, 6); if (hs === 2) { g.beginPath(); g.arc(0, 15, 21, Math.PI * .95, TAU * 1.03); g.fill(); } if (hs === 3) { g.fillStyle = L.skin; g.beginPath(); g.arc(0, 15, 9, Math.PI, TAU); g.fill(); g.fillStyle = L.hair; } if (hs === 4) { g.fillRect(13, 14, 6, 26); } if (hs === 5) { g.globalAlpha = .35; g.beginPath(); g.arc(0, 19, 15.2, Math.PI, TAU); g.fill(); g.globalAlpha = 1; }
  g.fillStyle = '#111'; g.fillRect(-7, 21, 3, 3); g.fillRect(4, 21, 3, 3); g.fillRect(-4, 30, 8, 1.5);
  if (L.shades) { g.fillStyle = '#0b0b0b'; g.fillRect(-11, 19, 9, 6); g.fillRect(2, 19, 9, 6); g.fillRect(-2, 20, 4, 1.6); }
  if (L.hat) { g.fillStyle = L.hatCol || '#c0392b'; g.beginPath(); g.arc(0, 15, 16, Math.PI, TAU); g.fill(); g.fillRect(-16, 13, 34, 4); g.fillRect(4, 13, 22, 4); }
  g.restore();
}
PMODES.look = function (H) {
  const kind = this.opt.kind, p = G.player, salon = kind === 'salon'; H.title.textContent = this.opt.name || (salon ? 'Salon' : 'Clothing'); if (!this.L) this.L = curLook(); const L = this.L, cur = curLook();
  const c0 = H.col('Mirror'), cv = document.createElement('canvas'); cv.width = 150; cv.height = 225; cv.style.cssText = 'display:block;margin:6px auto;background:linear-gradient(#2a3040,#1a1e28);border-radius:8px;border:2px solid #3a4152'; c0.appendChild(cv); drawDoll(cv, L);
  const keys = salon ? ['hs', 'hair', 'skin', 'shades'] : ['shirt', 'jk', 'pants', 'shoe', 'hat', 'hatCol', 'shades'], PR = { hs: 60, hair: 45, skin: 120, shirt: 80, jk: 220, pants: 90, shoe: 70, hat: 50, hatCol: 0, shades: 90 };
  let cost = 0; for (const k of keys) if (L[k] !== cur[k] && !(k === 'hatCol' && !L.hat)) cost += k === 'jk' && !L.jk ? 0 : k === 'hat' && !L.hat ? 0 : k === 'shades' && !L.shades ? 0 : PR[k]; if (salon && L.shades !== cur.shades) cost -= L.shades ? PR.shades : 0;
  const c = H.col(salon ? 'Hair & face' : 'Wardrobe'), sw = (label, k, vals, names) => { const r = H.mk('div', 'prow'); r.style.flexWrap = 'wrap'; const t = H.mk('div', 'pt'); t.appendChild(H.mk('b', '', label + (PR[k] ? '  ·  ' + money(PR[k]) : ''))); r.appendChild(t); const box = H.mk('div', ''); box.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;width:100%;padding:4px 0'; vals.forEach((v, i) => { const b = document.createElement('button'); b.style.cssText = 'min-width:34px;height:34px;border-radius:6px;border:3px solid ' + (L[k] === v ? '#f2c230' : '#3a4152') + ';background:' + (typeof v === 'string' ? v : '#232835') + ';color:#fff;font:700 11px Rubik,sans-serif;padding:0 6px'; if (names) b.textContent = names[i]; else if (v === null) b.textContent = '✕'; b.onclick = () => { Snd.play('ui'); L[k] = v; if (k === 'hatCol') L.hat = v ? 2 : 0; this.render(); }; box.appendChild(b); }); r.appendChild(box); c.appendChild(r); };
  if (salon) { sw('Hair style', 'hs', [0, 1, 2, 3, 4, 5], HSNAME); sw('Hair colour', 'hair', LOOKDEF.hair); sw('Skin tone (tanning bed)', 'skin', LOOKDEF.skin); }
  else { sw('Shirt', 'shirt', LOOKDEF.shirt); sw('Jacket', 'jk', LOOKDEF.jk); sw('Trousers', 'pants', LOOKDEF.pants); sw('Shoes', 'shoe', LOOKDEF.shoe); sw('Cap', 'hatCol', LOOKDEF.hatCol); sw('Sunglasses', 'shades', [0, 1], ['Off', 'On']); }
  H.foot.appendChild(H.mk('span', 'pnote', cost > 0 ? 'Total for this look: ' + money(cost) : 'Pick something and see it in the mirror first.'));
  H.foot.appendChild(H.btn('Reset', () => { this.L = curLook(); }));
  H.foot.appendChild(H.btn(cost > 0 ? 'Pay ' + money(cost) : 'Keep it', () => { if (cost > 0 && !payAny(cost)) return; if (!L.hat) L.hatCol = null; LIFE().look = Object.assign({}, L); Object.assign(p, L); Snd.play('rustle'); toast('Looking sharp.'); doSave(true); }, 'y', cost <= 0 && JSON.stringify(L) === JSON.stringify(cur)));
};

// ---------- home decoration ----------
const DECOR = [['sofa', 'Sofa', 2.6, .8, 400, '🛋'], ['tv', 'Television', 1.3, .4, 600, '📺'], ['bed', 'Bed', 1.25, 1.8, 500, '🛏'], ['table', 'Table', 1.4, 1.2, 250, '🪑'], ['chair', 'Chair', .5, .5, 60, '🪑'], ['plant', 'House plant', .8, .8, 80, '🪴'], ['rug', 'Rug', 3.4, 1.2, 300, '🟫'], ['books', 'Bookcase', .5, 2, 220, '📚'],
  ['desk', 'Desk', 1.6, .8, 260, '🗄'], ['computer', 'Computer', .8, .6, 900, '🖥'], ['fridge', 'Fridge', 1, .8, 350, '🧊'], ['wardrobe', 'Wardrobe', 1.6, .7, 300, '🚪'], ['arcade', 'Arcade cabinet', 1, 1, 1500, '🕹'], ['jukebox', 'Jukebox', 1, .8, 1200, '🎵'], ['pool', 'Pool table', 2.2, 1.3, 2200, '🎱'], ['piano', 'Piano', 1.6, 1, 3000, '🎹'], ['vend', 'Vending machine', 1, .8, 800, '🥤'], ['cooler', 'Water cooler', .7, .7, 150, '💧'], ['bar', 'Home bar', 3, .8, 2500, '🍸'], ['dance', 'Dance floor', 2, 2, 1800, '🪩'], ['planter', 'Planter box', 1.4, .6, 120, '🌱']];
const FLOORN = { wood: 'Hardwood', carpet: 'Carpet', tile: 'Tile', marble: 'Marble', dark: 'Dark club floor' };
const canDecorate = () => { const s = G.scene; if (!s) return false; const b = s.b; return isMyApt(b) || (b.type === 'safehouse' && !b.realty && b.name !== 'Your Apartment') || owned(b); };
const decorOf = b => LIFE().decor[b.id] || (LIFE().decor[b.id] = { items: [] });
function applyDecor0(s) { if (s.decorOn) return; s.decorOn = 1; const D = LIFE().decor[s.b.id]; if (!D) return; if (D.floor) s.floor = D.floor;  for (const it of D.items) s.items.push(it.ref = Object.assign({ used: 0, deco: 1, rec: it }, { t: it.t, x: it.x, y: it.y, w: it.w, h: it.h })); }
function placeTap(sx, sy) {
  const P = G.placing, s = G.scene; if (!P || !s) { G.placing = null; return; } const c = G.cam, wx = (sx - VW / 2) / c.z + c.x, wy = (sy - VH / 2) / c.z + c.y;
  const x = Math.round(clamp(wx / T - P.w / 2, .15, s.w - P.w - .15) * 10) / 10, y = Math.round(clamp(wy / T - P.h / 2, .15, s.h - P.h - 1.1) * 10) / 10;
  if (IT[P.t].s) for (const it of s.items) { if (!IT[it.t] || !IT[it.t].s || it === P.ref) continue; if (x < it.x + it.w + .15 && x + P.w + .15 > it.x && y < it.y + it.h + .15 && y + P.h + .15 > it.y) { Snd.play('bad'); return toast('Something is in the way there'); } }
  const D = decorOf(s.b);
  if (P.rec) { P.rec.x = x; P.rec.y = y; P.ref.x = x; P.ref.y = y; } else { if (!payAny(P.price)) { G.placing = null; return; } const rec = { t: P.t, x, y, w: P.w, h: P.h }; D.items.push(rec); s.items.push(rec.ref = { t: P.t, x, y, w: P.w, h: P.h, used: 0, deco: 1, rec }); }
  { const p = G.player, r = P.ref || D.items[D.items.length - 1].ref; if (IT[P.t].s && p.x > r.x * T - 10 && p.x < (r.x + r.w) * T + 10 && p.y > r.y * T - 10 && p.y < (r.y + r.h) * T + 10) { p.x = s.door.x; p.y = s.door.y - 30; } }
  Snd.play('door'); G.placing = null; doSave(true); toast('Placed. Open your stash to move or add more.');
}
PMODES.decor = function (H) {
  const s = G.scene; if (!s || !canDecorate()) { Panel.close(); return; } H.title.textContent = 'Decorate — ' + s.b.name; const D = decorOf(s.b), tab = this.tab || (this.tab = 'shop');
  H.tabBtn('shop', 'Furniture'); H.tabBtn('mine', 'Placed (' + D.items.length + ')'); H.tabBtn('style', 'Floor'); { const b = H.mk('button', '', '← Stash'); b.onclick = () => { Snd.play('ui'); Panel.open('store', { kind: 'home' }); }; H.el.querySelector('.ptabs').appendChild(b); }
  const go = P => { G.placing = P; Panel.close(); };
  if (tab === 'shop') { const half = Math.ceil(DECOR.length / 2); [DECOR.slice(0, half), DECOR.slice(half)].forEach((list, i) => { const c = H.col(i ? 'More' : 'Catalogue'); for (const [t, n, w, h, pr, e] of list) H.row(c, e, n, money(pr) + (IT[t].act ? ' · ' + IT[t].act.replace(/\s+\$.*$/, '').replace(/\s+\(.*$/, '') : ''), [H.btn(t === 'planter' && plantersFull() ? 'Room for no more' : 'Buy & place', () => go({ t, w, h, price: pr, name: n }), 'y', !canPay(pr) || (t === 'planter' && plantersFull()))]); }); H.foot.appendChild(H.mk('span', 'pnote', 'Choose a piece, then tap the floor where it should go. You pay when it is placed.')); }
  else if (tab === 'mine') { const c = H.col('Your furniture'); if (!D.items.length) H.empty(c, 'Nothing placed yet.'); D.items.forEach((r, i) => { const def = DECOR.find(d => d[0] === r.t) || [r.t, r.t, 1, 1, 0, '📦']; H.row(c, def[5], def[1], 'Tap Move, then tap the new spot', [H.btn('Move', () => go({ t: r.t, w: r.w, h: r.h, rec: r, ref: r.ref, name: def[1] })), H.btn('Sell ' + money(def[4] * .5), () => { D.items.splice(i, 1); const k = s.items.indexOf(r.ref); if (k >= 0) s.items.splice(k, 1); addCash(Math.round(def[4] * .5)); }, 'r')]); }); }
  else { const c = H.col('Flooring'); for (const f in FLOORN) H.row(c, '▦', FLOORN[f], s.floor === f ? 'Current floor' : money(600), [H.btn(s.floor === f ? 'Fitted' : 'Fit', () => { if (payAny(600)) { s.floor = f; D.floor = f; } }, s.floor === f ? 'on' : 'y', s.floor === f || !canPay(600))]); }
};
const _store0 = PMODES.store;
PMODES.store = function (H) { const r = _store0.call(this, H); if (this.opt.kind === 'home' && canDecorate()) { const b = H.mk('button', '', '🛋 Decorate'); b.onclick = () => { Snd.play('ui'); Panel.open('decor', { tab: 'shop' }); }; H.el.querySelector('.ptabs').appendChild(b); } return r; };

// ---------- property & entering ----------
const KINDN = { home: 'Home', biz: 'Business', club: 'Nightclub', lab: 'Drug lab', farm: 'Farm' };
function buyProperty(r) { if (LIFE().own[r.id]) return false; { const ro = remoteOwner(r); if (ro) { toast(ro + ' already owns this farm'); return false; } } if (!payAny(r.price)) return false; LIFE().own[r.id] = { safe: 0, pop: 40, stock: 60, up: {}, sup: 50, prod: 0, lvl: 1, price: r.price, name: r.name }; const b = W.buildings[r.id]; G.big = { text: 'PROPERTY ACQUIRED', col: '#2ecc71', t: 3, sub: b.name, small: 1 }; Snd.play('mission'); msg('You now own ' + b.name + '. Manage it from your phone.', '#2ecc71'); doSave(true); return true; }
function enterBuildingQ0(b) {
  if (b.type === 'mil') return toast('Locked. Military personnel only.');
  if (b.locked && !owned(b) && b.realty) { const r = b.realty; return say(b.name, `For sale — ${KINDN[r.kind]} — ${money(r.price)}.\n${r.kind === 'home' ? 'A place of your own: bed, stash, and you can decorate it.' : r.kind === 'farm' ? 'Fields to plant, a coop and pasture for animals, a roadside stand, and a farmhouse with a kitchen.' : r.kind === 'bunker' ? 'A hardened hideout out in the woods: bunks, a stash, an ammo locker, a gun bench, a police scanner and a 10-vehicle garage. Cops lose your trail once you\'re inside.' : r.kind === 'lab' ? 'Produces ' + DRUGS.find(d => d.id === r.drug).n + ' around the clock once it has supplies.' : 'Earns while you are out doing other things.'}`, [{ t: 'Buy it for ' + money(r.price), c: 'y', d: !canPay(r.price), f: () => { if (buyProperty(r)) enterBuilding(b); } }, { t: 'Not now' }]); }
  enterBuilding0(b); const s = G.scene; if (!s || s.b !== b) return;
  if (owned(b) && (b.realty.kind === 'home' || b.realty.kind === 'farm') && !s.homeSet) { s.homeSet = 1; s.peds = (s.peds || []).filter(q => q.role !== 'resident'); if (!s.items.some(it => it.t === 'stash')) s.items.push({ t: 'stash', x: 4.05, y: 2.95, w: .74, h: .59, used: 0, small: 1 }); }
  applyDecor(s);
}
function atProperty(b) { if (G.scene) return G.scene.b === b; const p = pCar() || G.player; return dist2(p.x, p.y, b.door.x, b.door.y) < 420 * 420; }
const clubOpen = () => G.tod >= 20 || G.tod < 4;
function lifeTick(dt) {
  const L = LIFE(), p = G.player; if (!p || G.mode !== 'play') return;
  if (G.ownChecked !== G.save) { G.ownChecked = G.save; let ref = 0; const lost = []; for (const id in L.own) { const b = W.buildings[id], O = L.own[id]; if (!b || !b.realty || b.realty.id != id || (O.name && O.name !== b.realty.name)) { ref += Math.round((O.price || 25000) * .9) + Math.floor(O.safe || 0); lost.push(O.name || 'a property'); delete L.own[id]; } } if (ref) { G.bank += ref; msg(`City records were redrawn: ${lost.join(', ')} bought back for ${money(ref)} (paid into your bank).`, '#f2c230'); doSave(true); } }
  // economy
  const h = dt * 24 / 1200;
  for (const id in L.own) { const b = W.buildings[id], r = b && b.realty, O = L.own[id]; if (!r) continue;
    if (r.kind === 'biz') O.safe = Math.min(r.price * .18, O.safe + r.price * .0075 * h);
    else if (r.kind === 'club') { const up = O.up; if (clubOpen()) { O.safe = Math.min(45000, O.safe + 1350 * (O.pop / 100) * (1 + .2 * (up.sound | 0) + .25 * (up.bar | 0) + .3 * (up.vip | 0)) * (O.stock > 0 ? 1 : .4) * h); O.stock = Math.max(0, O.stock - 6 * h); O.pop = Math.max(5, O.pop - 1.2 * h); if (O.dj > 0) O.dj -= h; if (Math.random() < .004 * h * (up.sec ? .25 : 1) && O.safe > 500) { const lost = Math.round(O.safe * .3); O.safe -= lost; msg(`Trouble at ${b.name}: a brawl cost you ${money(lost)}.`, '#ff6b6b'); } } else O.pop = Math.max(5, O.pop - .3 * h); }
    else if (r.kind === 'lab') { if (O.sup > 0) { O.prod = Math.min(labCap(O), O.prod + labRate(O) * h); O.sup = Math.max(0, O.sup - labBurn(O) * h); if (O.sup <= 0) msg(b.name + ' has run out of supplies.', '#f39c12'); } labCrew(b, r, O, h); if (O.prod > 10 && Math.random() < labRaid(O) * h) { const lost = Math.floor(O.prod / 2); O.prod -= lost; msg(`${b.name} was raided — ${lost} units gone.` + (O.up.sec ? '' : ' Security would help.'), '#ff6b6b'); } }
  }
  if (G.day !== L.day) { if (L.day !== undefined && G.bank > 0) { const i = Math.min(500, Math.round(G.bank * .004)); if (i > 0) { G.bank += i; msg('Bank interest: +' + money(i), '#2ecc71'); } } L.day = G.day; }
  // doors: walk into one and you are inside
  if (G.sceneWas && !G.scene) G.doorCD = G.t + 1.3; G.sceneWas = !!G.scene;
  if (!G.scene && !p.car && !p.dead && !G.dlgOpen && G.t > (G.doorCD || 0) && (p.mvx || p.mvy)) { const tx = Math.floor(p.x / T), ty = Math.floor(p.y / T); let hit = null; for (let yy = ty - 1; yy <= ty + 1 && !hit; yy++) for (let xx = tx - 1; xx <= tx + 1; xx++) { if (!inMap(xx, yy)) continue; const bid = W.bmap[idx(xx, yy)]; if (bid < 0 || bid === undefined) continue; const b = W.buildings[bid]; if (!b || !b.door || b.type === 'spray' || b.type === 'mil') continue; const [fx, fy] = FACEV[b.door.f]; if (dist2(p.x, p.y, b.door.x, b.door.y) < 30 * 30 && p.mvx * -fx + p.mvy * -fy > 25) { hit = b; break; } } if (hit) { G.doorT = (G.doorT || 0) + dt; if (G.doorT > .22) { G.doorT = 0; G.doorCD = G.t + 2.5; enterBuilding(hit); } } else G.doorT = 0; }
  if (G.placing) { if (!G.scene) G.placing = null; else G.toast = { text: 'Tap the floor to place the ' + G.placing.name + '  ·  tap the bag to cancel', t: .4 }; }
  const c = pCar(); if (c && c.mil && !c.milHot) { c.milHot = 1; G.heat = Math.max(G.heat, 4.2); markSeen(); msg('Stolen military hardware — the army wants it back.', '#ff6b6b'); }
}

// ---------- day jobs ----------
const JOBS = [
  { id: 'pizza', n: 'Pizza delivery', e: '🍕', ad: 'Slice of Varro needs riders. Scooter provided. Tips for hot pies.', veh: 'scooter', stops: 5, types: ['home'], pay: 70, time: 30, verb: 'Pizza delivered' },
  { id: 'paper', n: 'Paper round', e: '📰', ad: 'Varro Herald. Six houses, one bicycle, no excuses.', veh: 'bmx', stops: 6, types: ['home'], pay: 40, time: 34, rng: [200, 1500], verb: 'Paper delivered' },
  { id: 'courier', n: 'Courier', e: '📦', ad: 'QuickDrop Couriers. Parcels across town, any way you like.', veh: null, stops: 4, types: ['office', 'store', 'bar', 'diner', 'pawn'], pay: 110, time: 48, verb: 'Parcel signed for' },
  { id: 'bus', n: 'Bus driver', e: '🚌', ad: 'Metro Transit. Stop at every stop. Fully. We check.', veh: 'bus', stops: 6, types: ['office', 'store', 'home', 'diner', 'hospital', 'bar'], pay: 85, time: 38, hold: 2.2, verb: 'Passengers on and off' },
  { id: 'trash', n: 'Garbage run', e: '🗑', ad: 'City Sanitation. Early starts, steady money.', veh: 'dump', stops: 6, types: ['home', 'bar', 'diner', 'warehouse', 'store'], pay: 90, time: 38, hold: 1.8, verb: 'Bins emptied' },
  { id: 'medic', n: 'Paramedic shift', e: '🚑', ad: 'St. Varro Hospital. Collect patients, bring them in alive.', veh: 'ambulance', stops: 3, types: ['home', 'office', 'bar'], pay: 280, time: 55, medic: 1, verb: 'Patient delivered' },
  { id: 'dock', n: 'Dock hand', e: '⚓', ad: 'Harbor freight. Run paperwork between the warehouses. On foot.', veh: null, stops: 6, types: ['warehouse'], pay: 55, time: 36, rng: [150, 1100], verb: 'Manifest stamped' },
];
function jobStops(J, o) {
  const [r0, r1] = J.rng || (J.veh ? [500, 2600] : [250, 1500]), used = new Set(), out = []; let cx = o.x, cy = o.y;
  const hosp = J.medic ? W.buildings.filter(b => b.type === 'hospital' && b.door).sort((a, b) => dist2(a.door.x, a.door.y, o.x, o.y) - dist2(b.door.x, b.door.y, o.x, o.y))[0] : null;
  for (let i = 0; i < J.stops; i++) { const C = W.buildings.filter(b => b.door && J.types.includes(b.type) && !used.has(b.id) && !b.locked && !inBase(b.door.x, b.door.y)).map(b => [b, dist(b.door.x, b.door.y, cx, cy)]).filter(e => e[1] > r0 && e[1] < r1).sort((a, b) => a[1] - b[1]).slice(0, 6); if (!C.length) break; const b = pick(C)[0]; used.add(b.id);
    if (J.medic) { out.push({ x: b.door.x, y: b.door.y, label: 'Patient at ' + b.name, pay: 0, done: 'Patient on board. Hospital, fast.' }); if (hosp) out.push({ x: hosp.door.x, y: hosp.door.y, label: hosp.name }); cx = hosp ? hosp.door.x : b.door.x; cy = hosp ? hosp.door.y : b.door.y; }
    else { out.push({ x: b.door.x, y: b.door.y, label: b.name }); cx = b.door.x; cy = b.door.y; } }
  return out;
}
function startJob(J) {
  if (G.mission) return toast('Finish or quit your current job first'); const o = herePos(), stops = jobStops(J, o); if (stops.length < 2) return toast('No work near here right now — try closer to town');
  const lvl = LIFE().jobs[J.id] | 0, mult = 1 + Math.min(.6, lvl * .06), spot = J.veh ? nearRoadSpot(o, 9) : null; if (J.veh && !spot) return toast('No room nearby for the ' + CAR_TYPES[J.veh].name);
  startMission({ title: J.n, job: J, stops, i: 0, reward: Math.round(J.pay * stops.length * .4 * mult), timer: J.time + 30, hold: 0, earned: 0,
    init() { if (J.veh) { const c = new Car(J.veh, spot[0], spot[1], spot[2]); c.ai = { mode: 'parked' }; c.missionCar = 1; G.cars.push(c); this.car = c; } },
    update(dt) {
      const p = G.player, c = pCar(); if (this.car && this.car.dead) return failMission('The ' + this.car.d.name + ' was wrecked. It comes out of your wages.');
      if (this.car && c !== this.car) { this.target = { x: this.car.x, y: this.car.y, label: this.car.d.name }; this.away = (this.away || 0) + dt; if (this.began && this.away > 50) return failMission('You walked off the job.'); return; } this.away = 0; this.began = 1;
      this.timer -= dt; if (this.timer <= 0) return failMission('Too slow. The boss is not impressed.');
      const s = this.stops[this.i]; this.target = { x: s.x, y: s.y, label: s.label }; const px = c ? c.x : p.x, py = c ? c.y : p.y, R = c ? 170 : 50;
      if (!G.scene && dist2(px, py, s.x, s.y) < R * R && (!c || c.spd < 45)) { this.hold += dt; if (this.hold >= (J.hold || .6)) { this.hold = 0; const base = s.pay === 0 ? 0 : Math.round(J.pay * mult), tip = base ? Math.round(Math.min(40, this.timer) * (J.pay / 60)) : 0; if (base) { addCash(base + tip); this.earned += base + tip; } Snd.play('pickup'); msg(s.done || `${J.verb}: ${money(base)}${tip ? ' + ' + money(tip) + ' tip' : ''}`, '#2ecc71'); this.i++; this.timer += J.time; if (this.i >= this.stops.length) { LIFE().jobs[J.id] = lvl + 1; if ((lvl + 1) % 3 === 0) msg('Promotion! ' + J.n + ' pay is up.', '#f2c230'); completeMission(); } } } else this.hold = 0;
    },
    hud() { const s = this.stops[Math.min(this.i, this.stops.length - 1)]; return this.car && pCar() !== this.car ? 'Get ' + (this.car.d.rider ? 'on' : 'in') + ' the ' + this.car.d.name : `${s.label}  (${this.i + 1}/${this.stops.length})  ·  ${Math.max(0, Math.ceil(this.timer))}s`; },
    cleanup() { if (this.car) this.car.missionCar = 0; } });
}
function startShipment(b, units) {
  const r = b.realty, O = LIFE().own[b.id], D = DRUGS.find(d => d.id === r.drug), o = { x: b.door.x, y: b.door.y }, spot = nearRoadSpot(o, 9); if (!spot) return toast('No room outside for the van');
  const C = W.buildings.filter(x => x.door && (x.type === 'warehouse' || x.type === 'bar' || x.type === 'office') && dist(x.door.x, x.door.y, o.x, o.y) > 2200 && !inBase(x.door.x, x.door.y)); if (!C.length) return; const buyer = pick(C), value = Math.round(units * D.base * .8 * (1 + Math.min(.5, dist(buyer.door.x, buyer.door.y, o.x, o.y) / 16000)));
  O.prod -= units; Panel.close();
  startMission({ title: D.n + ' shipment', reward: value, units,
    init() { const c = new Car('van', spot[0], spot[1], spot[2]); c.ai = { mode: 'parked' }; c.missionCar = 1; c.color = '#3a3f47'; G.cars.push(c); this.car = c; if (Math.random() < .35) { G.heat = Math.max(G.heat, 1.3); markSeen(); msg('Someone tipped off the cops about the shipment.', '#ff6b6b'); } },
    update() { const c = pCar(); if (this.car.dead) return failMission('The van and ' + units + ' units went up in smoke.'); if (c !== this.car) { this.target = { x: this.car.x, y: this.car.y, label: 'Loaded van' }; return; } this.target = { x: buyer.door.x, y: buyer.door.y, label: 'Buyer' }; if (dist2(c.x, c.y, buyer.door.x, buyer.door.y) < 180 * 180 && c.spd < 40) { if (stars() > 0) { if (!this.warned) { this.warned = 1; msg('The buyer will not show while the cops are on you.', '#f39c12'); } return; } LIFE().earned += value; completeMission(); } },
    hud() { return pCar() === this.car ? 'Deliver ' + units + ' units to the buyer — lose the cops first' : 'Get in the loaded van'; }, cleanup() { this.car.missionCar = 0; } });
}

// ---------- phone ----------
function openPhone(tab) { if (G.mode !== 'play' || !G.player || G.player.dead || G.dlgOpen || G.fullMap) return; G.placing = null; const u = !tab && mktUnread() > 0; Panel.open('phone', { tab: tab || (u ? 'market' : 'home') }); if (u) { Panel.msub = 'msgs'; Panel.render(); } }
PMODES.phone = function (H) {
  const L = LIFE(), tab = this.tab || (this.tab = 'home'); H.title.textContent = '📱 Phone'; H.el.querySelector('.pcash').textContent = money(G.cash) + '  ·  bank ' + money(G.bank);
  for (const [id, n] of [['home', 'Home'], ['bank', 'Bank'], ['jobs', 'Jobs'], ['realty', 'Property'], ['empire', 'My empire'], ['cars', 'Vehicles'], ['market', 'Marketplace' + (mktUnread() ? ' (' + mktUnread() + ')' : '')], ['shop', 'Shop']]) H.tabBtn(id, n); if (hasOps()) H.tabBtn('contracts', 'Contracts'); if (HEISTS.some(h => heistAvail(h.id))) H.tabBtn('heists', 'Heists'); if (MS().cred > 0 || W.meet) H.tabBtn('redline', 'Redline');
  if (tab === 'market') return marketTab.call(this, H); if (tab === 'contracts') return contractsTab(H); if (tab === 'heists') return heistsTab(H); if (tab === 'redline') return redlineTab(H);
  const gps = (b, label) => H.btn('GPS', () => { setNav({ x: b.door.x, y: b.door.y, name: label || b.name }); Panel.close(); });
  if (tab === 'home') {
    const c = H.col('You'); const own = Object.keys(L.own).length; H.row(c, '💵', 'Cash ' + money(G.cash), 'Lost in part when you are wasted or busted'); H.row(c, '🏦', 'Bank ' + money(G.bank), 'Safe. Earns a little interest each day'); { const nx = RANKS.find(([n]) => L.earned < n); H.row(c, '👑', 'Rank: ' + rankName(), 'Empire earnings ' + money(L.earned) + (nx ? ' · ' + nx[1] + ' at ' + money(nx[0]) : ' · top rank')); } H.row(c, '🏠', own + (own === 1 ? ' property' : ' properties'), own ? 'Manage them under Property' : 'Nothing yet — see Property › For sale', [H.btn(own ? 'Open' : 'Browse', () => { this.tab = own ? 'empire' : 'realty'; })]);
    const c2 = H.col('Right now'); H.row(c2, '🕑', `Day ${G.day + 1}, ${String(Math.floor(G.tod)).padStart(2, '0')}:${String(Math.floor(G.tod % 1 * 60)).padStart(2, '0')}`, DISTRICTS[districtAt(herePos().x, herePos().y)].name); if (G.mission) H.row(c2, '📋', G.mission.title, G.mission.hud ? G.mission.hud() : '', [H.btn('Quit job', () => failMission('You quit.'), 'r')]); else H.row(c2, '📋', 'No job on', 'Classifieds are under Jobs', [H.btn('Jobs', () => { this.tab = 'jobs'; })]);
    const waiting = Object.keys(L.own).reduce((s, id) => s + (L.own[id].safe || 0), 0); if (own) H.row(c2, '💰', money(waiting) + ' waiting in your safes', 'Visit each place to collect', [H.btn('Empire', () => { this.tab = 'empire'; })]);
    const home = homeB(); if (home) H.row(c2, '🧭', home === aptB() ? 'Your Apartment' : home.name, 'Home — bed, stash' + (homeGarages().some(g => g.b === home) ? ', kitchen and garage' : ' and kitchen'), [gps(home)]);
  } else if (tab === 'bank') {
    const c = H.col('Deposit'), c2 = H.col('Withdraw'), mv = n => { n = Math.floor(n); if (n > 0) { G.cash -= n; G.bank += n; } else { G.bank += n; G.cash -= n; } Snd.play('cash'); };
    for (const a of [100, 1000, 10000]) H.row(c, '⬆', money(a), '', [H.btn('Deposit', () => mv(a), 'y', G.cash < a)]); H.row(c, '⬆', 'Everything (' + money(G.cash) + ')', '', [H.btn('Deposit all', () => mv(G.cash), 'y', G.cash < 1)]);
    for (const a of [100, 1000, 10000]) H.row(c2, '⬇', money(a), '', [H.btn('Withdraw', () => mv(-a), '', G.bank < a)]); H.row(c2, '⬇', 'Everything (' + money(G.bank) + ')', '', [H.btn('Withdraw all', () => mv(-G.bank), '', G.bank < 1)]);
    H.foot.appendChild(H.mk('span', 'pnote', 'First Varro mobile banking. Purchases on the phone use cash first, then your bank balance. 0.4% interest a day, up to $500.'));
  } else if (tab === 'jobs') {
    const c = H.col('Classifieds — honest work'); for (const J of JOBS) { const lvl = L.jobs[J.id] | 0, mult = 1 + Math.min(.6, lvl * .06); H.row(c, J.e, J.n + (lvl ? '  ·  ' + lvl + ' shift' + (lvl > 1 ? 's' : '') + ' done' : ''), J.ad + '  About ' + money(J.pay * J.stops * 1.5 * mult) + ' a shift.', [H.btn('Take it', () => { Panel.close(); startJob(J); }, 'y', !!G.mission)]); }
    const c2 = H.col('Other work'); if (G.mission) H.row(c2, '📋', 'On the clock: ' + G.mission.title, G.mission.hud ? G.mission.hud() : '', [H.btn('Quit', () => failMission('You quit.'), 'r')]); H.row(c2, '☎', 'Ringing payphones', 'Less honest jobs. Blue dots on the map.'); H.row(c2, '🌿', 'Run your own operation', 'Buy a lab under Property, then sell shipments from My empire.'); H.row(c2, '📈', 'Every third shift of a job earns a raise', 'Up to +60% pay.');
  } else if (tab === 'realty') {
    const here = herePos(), list = W.realty.filter(r => !L.own[r.id]).sort((a, b) => a.price - b.price), half = Math.ceil(list.length / 2); if (!list.length) H.empty(H.col('For sale'), 'You own everything on the market.');
    [list.slice(0, half), list.slice(half)].forEach((ls, i) => { if (!ls.length) return; const c = H.col(i ? 'More listings' : 'For sale'); for (const r of ls) { const b = W.buildings[r.id]; H.row(c, { home: '🏠', biz: '🏪', club: '🪩', lab: '🧪', farm: '🚜', bunker: '🛡' }[r.kind], b.name, `${KINDN[r.kind]} · ${DISTRICTS[b.d].name} · ${(dist(here.x, here.y, b.door.x, b.door.y) / T * .012).toFixed(1)} mi · ${money(r.price)}` + (r.kind === 'biz' ? ' · earns ~' + money(r.price * .18) + '/day' : '') + (r.kind === 'farm' ? ' · fields, pasture, farmhouse' : ''), [gps(b), H.btn('Buy', () => buyProperty(r), 'y', !canPay(r.price))]); } });
    H.foot.appendChild(H.mk('span', 'pnote', 'Homes give you a bed, a stash and rooms to decorate — country homes and farms add a yard. Businesses fill a safe you empty in person.'));
  } else if (tab === 'empire') {
    const ids = Object.keys(L.own).filter(id => W.buildings[id] && W.buildings[id].realty), c = H.col('Your properties'); if (!ids.length) { H.empty(c, 'You do not own anything yet. Homes, shops, bars, two nightclubs and four drug labs are for sale under Property.'); return; }
    if (!ids.includes(String(this.sel))) this.sel = ids[0];
    for (const id of ids) { const b = W.buildings[id], r = b.realty, O = L.own[id]; const row = H.row(c, { home: '🏠', biz: '🏪', club: '🪩', lab: '🧪', farm: '🚜', bunker: '🛡' }[r.kind], b.name, r.kind === 'home' ? 'Home' : r.kind === 'bunker' ? 'Bunker · hideout' : r.kind === 'farm' ? 'Farm · ' + (farmData(farmOf(b)) ? farmData(farmOf(b)).animals.length + ' animals' : '') : r.kind === 'lab' ? `${Math.floor(O.prod)} units · supplies ${Math.round(O.sup)}%` : 'Safe: ' + money(O.safe), [H.btn(String(this.sel) === id ? 'Open' : 'Manage', () => { this.sel = id; }, String(this.sel) === id ? 'on' : '')]); if (String(this.sel) === id) row.classList.add('sel'); }
    const b = W.buildings[this.sel], r = b.realty, O = L.own[this.sel], c2 = H.col(b.name), at = atProperty(b), collect = () => H.row(c2, '💰', 'Safe: ' + money(O.safe), at ? 'You are here' : 'Collect in person', [at ? H.btn('Collect', () => { const n = Math.floor(O.safe); O.safe -= n; addCash(n); L.earned += n; }, 'y', O.safe < 1) : gps(b)]);
    const upg = (key, n, d, pr) => H.row(c2, O.up[key] ? '✓' : '⬆', n, O.up[key] ? 'Installed' : d + ' · ' + money(pr), [H.btn(O.up[key] ? 'Owned' : 'Buy', () => { if (payAny(pr)) O.up[key] = 1; }, O.up[key] ? 'on' : 'y', !!O.up[key] || !canPay(pr))]);
    if (r.kind === 'home') { H.row(c2, '🛏', 'Your place', 'Sleep to save, use the stash, and decorate from the stash screen.', [gps(b)]); }
    else if (r.kind === 'biz') { collect(); H.row(c2, '📈', 'Earns about ' + money(r.price * .18) + ' a day', 'The safe holds one day of takings — empty it regularly.'); }
    else if (r.kind === 'club') {
      collect(); H.row(c2, clubOpen() ? '🟢' : '⚪', clubOpen() ? 'Open now' : 'Closed — doors open 20:00 to 04:00', `Popularity ${Math.round(O.pop)}%  ·  bar stock ${Math.round(O.stock)}%`);
      H.row(c2, '📣', 'Promote the club', '+15 popularity · $500', [H.btn('Promote', () => { if (payAny(500)) O.pop = Math.min(100, O.pop + 15); }, 'y', O.pop >= 100 || !canPay(500))]);
      H.row(c2, '🎧', 'Book a headline DJ', '+35 popularity · $1,800', [H.btn('Book', () => { if (payAny(1800)) { O.pop = Math.min(100, O.pop + 35); O.dj = 8; } }, 'y', O.pop >= 100 || !canPay(1800))]);
      H.row(c2, '🍾', 'Restock the bar', 'An empty bar earns 60% less · $800', [H.btn('Order', () => { if (payAny(800)) O.stock = 100; }, 'y', O.stock > 85 || !canPay(800))]);
      upg('sound', 'Sound system', '+20% takings', 6000); upg('bar', 'Cocktail bar', '+25% takings', 9000); upg('vip', 'VIP lounge', '+30% takings', 15000); upg('sec', 'Door security', 'Far fewer brawls', 5000);
    } else if (r.kind === 'farm') {
      const f = farmOf(b), Fd = farmData(f), rp = f.plots.filter((_, i) => Fd.plots[i] && cropProg(Fd.plots[i], Fd) >= 1).length;
      H.row(c2, '🚜', `${f.plots.length} plots · ${rp} ready`, `${Fd.animals.length} animals · feed ${Math.round(Fd.feed)} · storage ${weightOf(Fd.store)}`, [gps(b)]);
      H.row(c2, '🌾', 'Order feed (+50)', 'Delivered to the farm · $120', [H.btn('Order', () => { if (payAny(120)) Fd.feed += 50; }, 'y', !canPay(120))]);
      H.row(c2, '💰', 'Stand takings ' + money(Fd.till), at ? 'You are here' : 'Collect at the farm', [at ? H.btn('Collect', () => { addCash(Math.floor(Fd.till)); Fd.till = 0; }, 'y', Fd.till < 1) : gps(b)]);
      if (at) H.row(c2, '📋', 'Manage farm', 'Storage, stand, upgrades', [H.btn('Open', () => Panel.open('farm', { farm: f }), 'y')]);
    } else if (r.kind === 'lab') {
      labPanel(H, c2, b, r, O, at, gps, upg, collect);
    }
  } else if (tab === 'cars') {
    garageCol(H); const land = DEALER_LAND, water = ['dinghy', 'jetski', 'speedboat', 'trawler'], price = t => Math.round(carValue({ type: t }) * 2.3 / 50) * 50;
    const c = H.col('Auto dealer — delivered'); for (const t of land) { const d = CAR_TYPES[t], pr = price(t), out = !G.scene; thumbRow(H, c, t, d.cols[0], {}, d.name, money(pr) + ' · ' + Math.round(d.max * .14) + ' mph', [H.btn(out ? 'Buy' : 'To garage', () => { if (out) { const s = nearRoadSpot(herePos(), 8); if (!s) return toast('No room nearby to drop it off'); if (!payAny(pr)) return; const car = new Car(t, s[0], s[1], s[2]); car.ai = { mode: 'parked' }; car.owned = 1; car.legit = 1; car.persist = 1; G.cars.push(car); msg('Your ' + d.name + ' has been dropped off nearby. Store it on the GARAGE pad outside your apartment (🅿 on the map).', '#2ecc71'); } else { if (garUsed() >= garCap()) return toast('Your garage is full'); if (!payAny(pr)) return; myCars().push({ type: t, mods: {}, legit: 1 }); msg(d.name + ' delivered to your garage.', '#2ecc71'); } }, 'y', !canPay(pr))]); }
    const c2 = H.col('Marina — moored at the nearest pier'); for (const t of water) { const d = CAR_TYPES[t], pr = price(t); H.row(c2, '⛵', d.name, money(pr) + ' · ' + Math.round(d.max * .14) + ' mph', [H.btn('Buy', () => { const o = herePos(), S = W.parkSpots.filter(s => CAR_TYPES[s.type || ''] && CAR_TYPES[s.type].boat && !G.cars.some(k => dist2(k.x, k.y, s.x, s.y) < 70 * 70)).sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y))[0]; if (!S) return toast('No free mooring'); if (!payAny(pr)) return; const car = new Car(t, S.x, S.y, S.a); car.ai = { mode: 'parked' }; car.owned = 1; car.persist = 1; car.spot = S; S.car = car; G.cars.push(car); setNav({ x: S.x, y: S.y, name: 'Your ' + d.name }); Panel.close(); }, 'y', !canPay(pr))]); }
    H.foot.appendChild(H.mk('span', 'pnote', G.scene ? 'Indoors: vehicles are delivered to your nearest garage with room.' : 'Vehicles are dropped off on the nearest road. Boats wait at a pier — GPS is set for you.'));
  } else {
    const c = H.col('Courier shop — straight to your bag'), ids = Object.keys(ITEMS).filter(k => ['med', 'food', 'gear'].includes(ITEMS[k].k) && ITEMS[k].v >= 5 && k !== 'fish'); for (const id of ids) { const it = ITEMS[id], pr = Math.ceil(it.v * 1.3); H.row(c, it.e, it.n, money(pr) + (it.heal ? ' · heals ' + it.heal : '') + ' · you have ' + (G.inv[id] | 0), [H.btn('Buy', () => { if (invWeight() + it.w > invCap()) return toast('Your bag is full'); if (payAny(pr)) invAdd(id, 1, 1); }, 'y', !canPay(pr))]); }
    { const cc = H.col('Car parts'); H.row(cc, '🔩', 'Car parts, engines & shells', 'One catalogue — delivered to your garage shelf', [H.btn('Open catalogue', () => Panel.open('project', { tab: 'order' }), 'y')]); } gunPartsCol(H, 'Gun parts — delivered to your home bench', 1.1);
    const c2 = H.col('Services'); H.row(c2, '🚕', 'Call a cab home', 'Skip the walk · $60', [H.btn('Ride', () => { const home = homeB(); if (!home || G.scene || pCar() || stars() > 0) return toast(stars() > 0 ? 'No cab will stop while you are wanted' : 'Go outside on foot first'); if (!payAny(60)) return; G.player.x = home.door.x; G.player.y = home.door.y + 6; G.doorCD = G.t + 2; G.tod = (G.tod + .5) % 24; Panel.close(); toast('Dropped at your apartment'); }, 'y', !canPay(60))]);
    H.row(c2, '🔧', 'Roadside repair', 'Fixes the vehicle you are in · $350', [H.btn('Call', () => { const k = pCar(); if (!k) return toast('Sit in the vehicle first'); if (payAny(350)) { k.hp = k.st.hp; k.fireT = 0; k.flat = 0; toast('Good as new'); } }, 'y', !pCar() || !canPay(350))]);
  }
};
function drawPhoneBtn(L, sc) { const x = L + 178 * sc, w = 34 * sc; Input.phoneBtn = [x, 6, w, w]; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(x, 6, w, w); ctx.fillStyle = '#1c2230'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 10 * sc, 6 + 5 * sc, 14 * sc, 24 * sc, 3 * sc) : ctx.rect(x + 10 * sc, 6 + 5 * sc, 14 * sc, 24 * sc); ctx.fill(); ctx.fillStyle = '#4fc3f7'; ctx.fillRect(x + 12 * sc, 6 + 8 * sc, 10 * sc, 15 * sc); ctx.fillStyle = '#cfd6e2'; ctx.fillRect(x + 15 * sc, 6 + 25 * sc, 4 * sc, 2 * sc); const n = Object.keys(LIFE().own).reduce((s, id) => s + ((LIFE().own[id].safe || 0) > 2000 ? 1 : 0), 0); const u = mktUnread(); if (u) { const bx = x + w - 4 * sc, by = 6 + 5 * sc, r = 7.5 * sc * (1 + .12 * Math.max(0, Math.sin(G.t * 5))); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill(); ctx.lineWidth = 1.5 * sc; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = `bold ${10 * sc}px Rubik, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(u > 9 ? '9+' : String(u), bx, by + .5 * sc); ctx.textBaseline = 'alphabetic'; } else if (n) { ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(x + w - 5 * sc, 6 + 6 * sc, 5 * sc, 0, TAU); ctx.fill(); } }
// Android back button (called by the app shell): close whatever is open, otherwise pause
window.onAndroidBack = function () {
  try { if (G.fullMap) return closeMap(); if (G.placing) { G.placing = null; return; } if (G.invOpen) return Panel.close(); if (G.garageOpen) return closeGarage(); if (G.dlgOpen) return closeDialog(); if (G.menuOpen) { if (G.inGame) hideMenu(); return; } if (G.inGame) openPause(); } catch (e) { }
};
