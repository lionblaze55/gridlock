// ================= SHOPS WITH CHARACTER: every store type gets its own floor plan, shelves stocked with its own wares · BIKES & BOARDS you can buy or take =================
Object.assign(ITEMS, { beer: { n: 'Beer', v: 6, w: 1, k: 'food', e: '🍺', heal: 5, drunk: 8 }, whiskey: { n: 'Whiskey', v: 40, w: 1, k: 'food', e: '🥃', heal: 5, drunk: 22 }, pills: { n: 'Painkillers', v: 35, w: 1, k: 'med', e: '💊', heal: 40 } });
// skateboard you can ride
CAR_TYPES.skate = { name: 'Skateboard', custom: 1, two: 1, rider: 1, pedal: 1, nohelm: 1, L: 12, W: 5, max: 320, acc: 300, steer: 4.2, grip: 9, hp: 20, mass: .08, off: .25, wl: 2.4, wt: 1.4, seat: 6, bar: 7.5, cols: ['#ff5722', '#3949ab', '#212121', '#00897b', '#f06292', '#ffb300'] };
Object.assign(TRUNKCAP, { skate: 0 }); CARVAL.skate = 30;
// ---------- which kind of shop is this? ----------
const STOREKIND = { sports: 'Varro Sports & Cycles', hardware: 'Bolt & Nut Hardware', pharmacy: 'Varro Pharmacy', liquor: 'Bottle King Liquor' };
function storeGen() { let i = 0; for (const b of W.buildings) { if (b.type !== 'store' || !b.door) continue; if (b.sub) { b.kind2 = b.sub; continue; }
  if (/gas|truck stop/i.test(b.name)) b.kind2 = 'gas'; else if (/bait|tackle/i.test(b.name)) b.kind2 = 'tackle'; else if (/general|trading/i.test(b.name)) b.kind2 = 'general';
  else if (['Corner Shop', 'Mini Mart'].includes(b.name)) { const k = ['sports', 'pharmacy', 'hardware', 'liquor', 'general'][i++ % 5]; b.kind2 = k; if (STOREKIND[k]) b.name = STOREKIND[k]; } else b.kind2 = 'conv'; } }
// ---------- what each shelf sells ----------
const GOODS = {
  snacks: { act: 'Browse snacks', wares: [['snack', 3], ['jerky', 18], ['bread', 6], ['apple', 3]], col: ['#e74c3c', '#f1c40f', '#3498db', '#e67e22'] },
  drinks: { act: 'Grab a drink', wares: [['soda', 5], ['beer', 6]], col: ['#e53935', '#29b6f6', '#ffca28', '#66bb6a'] },
  liquor: { act: 'Browse bottles', wares: [['beer', 6], ['whiskey', 35], ['wine', 90]], col: ['#6d4c41', '#8d6e63', '#1b5e20', '#b71c1c', '#ffe082'] },
  meds: { act: 'Browse medicine', wares: [['bandage', 25], ['pills', 40], ['medkit', 75]], col: ['#ffffff', '#4fc3f7', '#ef5350', '#81c784'] },
  tools: { act: 'Browse tools', wares: [['repairkit', 280], ['toolbox', 120], ['rod', 90]], col: ['#ff7043', '#9e9e9e', '#fdd835', '#455a64'] },
  paint: { act: 'Browse paint & supplies', wares: [['repairkit', 280], ['toolbox', 120]], col: ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#f5f5f5'] },
  produce: { act: 'Pick some produce', wares: [['apple', 3], ['carrot', 4], ['tomato', 4], ['potato', 3], ['corn', 4], ['pumpkin', 9]], col: ['#e53935', '#ff9800', '#c62828', '#a1887f', '#fdd835', '#ef6c00'] },
  jewels: { act: 'Look at the jewellery', wares: [['watch', 160], ['ring', 450], ['necklace', 700], ['goldwatch', 900]], col: ['#ffd54f', '#e0e0e0', '#80deea'] },
  bikes: { act: 'Look at bikes & boards', veh: [['bmx', 250], ['skate', 90], ['scooter', 700]], col: ['#e53935', '#1e88e5', '#43a047', '#fdd835'] },
  boards: { act: 'Look at skateboards', veh: [['skate', 90], ['bmx', 250]], col: ['#ff5722', '#3949ab', '#212121', '#00897b', '#f06292'] },
  gear: { act: 'Browse sports gear', wares: [['vest', 380], ['rod', 90], ['soda', 5]], col: ['#1e88e5', '#ef6c00', '#43a047', '#f5f5f5'] },
  oil: { act: 'Browse car care', wares: [['repairkit', 280], ['soda', 5], ['snack', 3]], col: ['#212121', '#fbc02d', '#c62828'] },
  tackle: { act: 'Browse fishing gear', wares: [['rod', 90], ['jerky', 18], ['beer', 6], ['soda', 5]], col: ['#2e7d32', '#ff6f00', '#1565c0', '#795548'] },
  feed: { act: null, col: ['#d7ccc8', '#bcaaa4'] }, petfood: { act: null, col: ['#ff8a65', '#4db6ac', '#ffd54f'] }, mags: { act: null, col: ['#ef5350', '#42a5f5', '#ffee58', '#ab47bc'] },
};
for (const k in GOODS) IT['sh_' + k] = { s: 1, act: GOODS[k].act || undefined };
Object.assign(IT, { gfridge: { s: 1, act: 'Grab a drink' }, pstand: { s: 1, act: 'Pick some produce' }, crack: { s: 1, act: 'Try on clothes' }, salonst: { s: 1, act: 'Get a haircut' }, manq: { s: 1 }, fitroom: { s: 1 }, jcase: { s: 1, act: 'Look at the jewellery' }, ftank: { s: 1 }, pcage: { s: 1 }, sacks: { s: 1 }, barrelx: { s: 1 }, lumber: { s: 1 }, slush: { s: 1, act: 'Slushie  $4' }, coffee: { s: 1, act: 'Coffee  $3' }, lotto: { s: 1, act: 'Scratch card  $5' }, checkout: { s: 1 }, treadmill: { s: 1 }, ballbin: { s: 1 }, ssink: { s: 1 }, waitch: { s: 1 } });
// ---------- floor plans (14 × 10, door bottom middle) ----------
function makeShop(b) {
  const k = b.kind2 || 'conv', w = 14, h = 10, items = [], npcs = [], I = (t, x, y, ww, hh, ex) => items.push(Object.assign({ t, x, y, w: ww, h: hh, used: 0, small: 1 }, ex || {})), P = (role, x, y, ex) => npcs.push(Object.assign({ role, x, y }, ex || {}));
  const aisles = (g, xs, y0, len) => { for (const x of xs) I('sh_' + g, x, y0, .8, len); }, wallRow = (g, x0, x1, y = .35, d = .7) => { for (let x = x0; x < x1 - .1; x += 1.6) I('sh_' + g, x, y, Math.min(1.5, x1 - x), d); };
  const till = (x, y) => { I('counter', x, y, 3, .75); I('register', x + .4, y - .05, .7, .6); P('clerk', x + 1.6, y - .65, { shop: 'store', still: 1 }); };
  let floor = 'tile';
  switch (k) {
    case 'conv': case 'gas':
      for (let x = 1; x < 9.6; x += 1.5) I('gfridge', x, .3, 1.4, .8);
      aisles('snacks', [2.4, 4.6], 2.4, 3.6); I('sh_drinks', 6.8, 2.4, .8, 3.6); till(9.8, 6.9); I('sh_mags', 1, 8.2, 1.3, .5); I('atm', 12.6, 3.2, .8, .7); I('slush', 12.6, 4.4, .8, .7);
      if (k === 'gas') { I('sh_oil', 11, .35, 2.4, .7); I('coffee', 12.6, 5.6, .8, .7); I('lotto', 3.8, 8.3, .8, .5); } else { I('sh_snacks', 11, .35, 2.4, .7); I('vend', 12.6, 5.6, .8, .7); }
      P('patron', 3.5, 4); if (Math.random() < .5) P('patron', 5.7, 3); break;
    case 'tackle': floor = 'wood';
      wallRow('tackle', 1, 9.4); I('sh_tackle', .4, 1.6, .8, 4.2); aisles('tackle', [3, 5.4], 2.4, 3.2); I('gfridge', 11, .35, 1.4, .8); I('gfridge', 12.5, .35, 1.1, .8); I('ftank', 8.2, 2.6, 2.2, .8); I('barrelx', 11.4, 2.8, .7, .7); I('sh_snacks', 12.6, 2.4, .8, 3);
      till(9.8, 7); P('patron', 4.2, 4.6); break;
    case 'general': floor = 'wood';
      wallRow('tools', 1, 6.2); wallRow('snacks', 7.8, 13); I('sh_bikes', .4, 2, .9, 3.2); for (let i = 0; i < 3; i++) I('barrelx', 2.6 + i * .9, 2.6, .7, .7); I('pstand', 5.4, 2.8, 2.4, 1); I('sacks', 9.2, 2.7, 1.6, .9); I('sacks', 11.2, 2.7, 1.6, .9);
      I('sh_produce', 9.2, 4.6, 3.6, .8); till(1.2, 6.9); I('barrelx', 12.6, 7.6, .7, .7); P('patron', 6, 4.6); break;
    case 'sports':
      I('sh_bikes', .4, 1, 1, 4.4); I('sh_boards', 11.6, .35, 2, .7); wallRow('gear', 1.8, 10); aisles('gear', [3.4, 6], 2.6, 3); I('ballbin', 8.4, 3, .9, .9); I('treadmill', 12.4, 2.4, 1.2, 2.2); I('sh_boards', 9.6, 2.4, .8, 3);
      till(9.8, 7); P('patron', 4.8, 4.5); break;
    case 'hardware': floor = 'concrete';
      wallRow('tools', 1, 13); aisles('tools', [2.2], 2.4, 3.6); aisles('paint', [4.4], 2.4, 3.6); aisles('tools', [8.8], 2.4, 3.6); I('lumber', 11, 2.4, 2.4, 2.8); I('sh_paint', .4, 2.4, .8, 3.6);
      till(1.6, 7); P('patron', 6.6, 4); break;
    case 'pharmacy':
      I('counter', 4, 1.6, 6, .7); P('clerk', 7, .95, { shop: 'store', still: 1, pharm: 1 }); wallRow('meds', 1, 3.6); wallRow('meds', 10.4, 13); aisles('meds', [2.2, 4.6], 3.2, 3); aisles('snacks', [9.2], 3.2, 3); I('gfridge', 11.6, 3.2, 1.4, .8); I('gfridge', 11.6, 4.3, 1.4, .8);
      I('checkout', 10.2, 7.1, 2.2, .7); I('register', 10.5, 7.05, .7, .6); P('patron', 6.6, 5); break;
    case 'liquor': floor = 'wood';
      wallRow('liquor', 1, 13); I('sh_liquor', .4, 1.6, .7, 4.4); I('sh_liquor', 13, 1.6, .6, 4.4); I('sh_liquor', 4.6, 3.2, 4.8, .9); for (let x = 1.6; x < 4; x += 1.5) I('gfridge', x, 5.6, 1.4, .8); till(9.8, 7); break;
    case 'market': floor = 'check';
      for (let x = 1; x < 13; x += 1.5) I('gfridge', x, .3, 1.4, .8); for (const [x, y] of [[1.6, 2.4], [5, 2.4], [8.4, 2.4], [1.6, 4.6], [5, 4.6], [8.4, 4.6]]) I('pstand', x, y, 2.6, 1.1); I('sh_snacks', 12, 2.4, .8, 3.6);
      I('checkout', 1.2, 7.1, 2.2, .7); I('checkout', 9.8, 7.1, 2.2, .7); P('clerk', 2.3, 6.4, { shop: 'store', still: 1 }); P('patron', 4, 4); P('patron', 9.5, 3.8); break;
    case 'coop': floor = 'concrete';
      for (let i = 0; i < 4; i++) I('sacks', 1 + i * 1.8, .5, 1.6, .9); I('sacks', 1, 2.2, 1.6, .9); wallRow('tools', 8.4, 13); I('sh_feed', 3.4, 2.6, .8, 3.2); I('sh_feed', 5.8, 2.6, .8, 3.2); I('barrelx', 9, 3, .7, .7); I('barrelx', 9.9, 3, .7, .7); I('lumber', 11, 2.4, 2.4, 2.4);
      till(1.2, 7); break;
    case 'pets':
      for (let x = 1; x < 9; x += 1.8) I('ftank', x, .35, 1.6, .75); I('pcage', 10.4, .4, 1.4, 1.2); I('pcage', 12, .4, 1.4, 1.2); aisles('petfood', [2.6, 5], 2.4, 3.4); I('pcage', 8.4, 2.6, 1.6, 1.2); I('ftank', 11, 3, 2.2, .8);
      till(9.8, 7); break;
    case 'salon': floor = 'marble';
      for (let x = 1; x < 11; x += 2.4) I('salonst', x, .35, 1.6, 1.1); for (let x = 1.4; x < 6; x += 1.4) I('ssink', x, 3.6, .9, .7); for (let x = 9; x < 13; x += .9) I('waitch', x, 5.4, .7, .7);
      till(1.2, 7); P('worker', 1.8, 2.2, { still: 1 }); P('patron', 1.8, 1.2, { sit: 1 }); P('patron', 6.6, 1.2, { sit: 1 }); break;
    case 'clothes': floor = 'carpet';
      for (const [x, y] of [[1.2, 2.2], [4, 2.2], [1.2, 4.4], [4, 4.4], [9, 2.2], [9, 4.4]]) I('crack', x, y, 2.2, .6); I('manq', 6.8, 2.4, .6, .6); I('manq', 7.6, 2.4, .6, .6); for (let x = 10; x < 13.5; x += 1.2) I('fitroom', x, .35, 1.1, 1.2); wallRow('gear', 1, 9);
      till(9.8, 7); P('patron', 2.6, 3.2); break;
    case 'jewel': floor = 'carpet';
      for (let x = 1; x < 13; x += 2.4) I('jcase', x, .5, 2, .8); I('jcase', .5, 5.2, 2, .8); I('jcase', 11.5, 5.2, 2, .8); till(5.5, 7.1); break;
  }
  const solid = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) solid[y * w + x] = 1; const dx = 7; solid[(h - 1) * w + dx] = 0;
  return { b, w, h, floor, items, npcDefs: npcs, solid, door: { x: (dx + .5) * T, y: (h - .6) * T }, peds: null, loot: {} };
}
// ---------- buying off the shelf (or helping yourself if nobody's minding the till) ----------
const SHOPMAIN = { sports: 'bikes', hardware: 'tools', pharmacy: 'meds', liquor: 'liquor', jewel: 'jewels' };
const shopClerk = s => s.peds && s.peds.find(q => !q.dead && q.role === 'clerk' && q.state !== 'flee');
function spawnOutside(type, color) { const o = G.outPos || G.player, sp = nearRoadSpot(o, 5); const c = new Car(type, sp ? sp[0] : o.x, sp ? sp[1] : o.y, sp ? sp[2] : 0, color); if (color) c.color = color; c.ai = { mode: 'parked' }; c.owned = 1; c.legit = 1; c.persist = 1; G.cars.push(c); return c; }
PMODES.shopk = function (H) {
  const s = G.scene, g = GOODS[this.opt.goods], clerk = s && shopClerk(s), steal = !clerk; H.title.textContent = (s ? s.b.name : 'Shop') + (steal ? ' — nobody at the till' : '');
  const c = H.col(g.act || 'Shelf');
  for (const [id, pr] of g.wares || []) { const it = ITEMS[id]; if (!it) continue; H.row(c, it.e, it.n, (steal ? 'Free… if nobody sees' : money(pr)) + (it.heal ? ' · heals ' + it.heal : '') + (it.drunk ? ' · strong' : '') + ' · you have ' + (G.inv[id] | 0), [H.btn(steal ? 'Take' : 'Buy', () => { if (invWeight() + it.w > invCap()) return toast('Your bag is full'); if (steal) { crime(.3, 'Theft'); invAdd(id, 1, 1); Snd.play('rustle'); } else if (pay(pr)) { invAdd(id, 1, 1); Snd.play('cash'); } }, 'y', !steal && G.cash < pr)]); }
  for (const [t, pr] of g.veh || []) { const d = CAR_TYPES[t]; thumbRow(H, c, t, d.cols[0], {}, d.name, steal ? 'Free… if nobody sees' : money(pr) + ' · rolled out to the sidewalk for you', [H.btn(steal ? 'Take' : 'Buy', () => { if (steal) crime(.6, 'Theft'); else if (!pay(pr)) return; spawnOutside(t, pick(d.cols)); Snd.play(steal ? 'rustle' : 'cash'); msg('Your ' + d.name + ' is waiting outside the door.', '#2ecc71'); }, 'y', !steal && G.cash < pr)]); }
  H.foot.appendChild(H.mk('span', 'pnote', steal ? 'The clerk is gone. Taking things is still theft.' : 'Drinks and food go in your bag — eat them from the backpack.'));
};
function useItemS(it) {
  const s = G.scene, t = it.t; if (!s) return useItemD(it);
  if (t.startsWith('sh_') && GOODS[t.slice(3)] && GOODS[t.slice(3)].act) return Panel.open('shopk', { goods: t.slice(3) });
  if (t === 'gfridge') return Panel.open('shopk', { goods: 'drinks' }); if (t === 'pstand') return Panel.open('shopk', { goods: 'produce' }); if (t === 'jcase') return Panel.open('shopk', { goods: 'jewels' });
  if (t === 'crack') return Panel.open('look', { kind: 'clothes', name: s.b.name }); if (t === 'salonst') return Panel.open('look', { kind: 'salon', name: s.b.name });
  if (t === 'slush' || t === 'coffee') { const pr = t === 'slush' ? 4 : 3; if (pay(pr)) { heal(t === 'slush' ? 12 : 8); Snd.play('clunk'); toast(t === 'slush' ? 'Brain freeze! +12' : 'Hot coffee +8'); } return; }
  if (t === 'lotto') { if (!pay(5)) return; Snd.play('ui'); const r = Math.random(); const win = r < .005 ? 5000 : r < .03 ? 250 : r < .12 ? 20 : r < .3 ? 5 : 0; if (win) { addCash(win); toast('Scratch card: you won ' + money(win) + '!'); } else toast('Scratch card: no luck.'); return; }
  return useItemD(it);
}
// ---------- stocked shelves & fixtures ----------
function drawShopItem(g, it, x, y, w, h) {
  const sh = () => { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + 3, y + 4, w, h); }, rr = (X, Y, W2, H2, c) => { g.fillStyle = c; g.fillRect(X, Y, W2, H2); }, seed = (it.x * 13 + it.y * 7) | 0;
  if (it.t.startsWith('sh_')) { const k = it.t.slice(3), G2 = GOODS[k], cols = G2.col, vert = h > w; sh(); rr(x, y, w, h, '#8d9298'); rr(x + 2, y + 2, w - 4, h - 4, '#b8bec5');
    const L = vert ? h : w, n = Math.max(2, Math.floor(L / 14));
    for (let i = 0; i < n; i++) { const p0 = 4 + i * (L - 8) / n, sz = (L - 8) / n - 2; for (let j = 0; j < 2; j++) { const c = cols[(seed + i * 3 + j) % cols.length], X = vert ? x + 4 + j * (w - 8) / 2 : x + p0, Y = vert ? y + p0 : y + 4 + j * (h - 8) / 2, W3 = vert ? (w - 8) / 2 - 2 : sz, H3 = vert ? sz : (h - 8) / 2 - 2;
      if (k === 'liquor' || k === 'drinks') { rr(X + W3 * .2, Y + H3 * .15, W3 * .6, H3 * .75, c); rr(X + W3 * .38, Y, W3 * .24, H3 * .3, '#333'); }
      else if (k === 'produce') { g.fillStyle = c; for (let q = 0; q < 3; q++) { g.beginPath(); g.arc(X + W3 * (.25 + q * .25), Y + H3 * .5, Math.min(W3, H3) * .22, 0, TAU); g.fill(); } }
      else if (k === 'bikes') { g.strokeStyle = '#222'; g.lineWidth = 2.5; g.beginPath(); g.arc(X + W3 * .3, Y + H3 * .5, Math.min(W3, H3) * .32, 0, TAU); g.arc(X + W3 * .75, Y + H3 * .5, Math.min(W3, H3) * .32, 0, TAU); g.stroke(); rr(X + W3 * .3, Y + H3 * .45, W3 * .45, 3, c); }
      else if (k === 'boards') { g.fillStyle = c; g.beginPath(); g.roundRect ? g.roundRect(X + 1, Y + 1, W3 - 2, H3 - 2, 5) : g.rect(X + 1, Y + 1, W3 - 2, H3 - 2); g.fill(); rr(X + 3, Y + 3, 3, 3, '#ddd'); rr(X + W3 - 6, Y + H3 - 6, 3, 3, '#ddd'); }
      else if (k === 'jewels') { rr(X, Y, W3, H3, '#3e2723'); g.fillStyle = c; g.beginPath(); g.arc(X + W3 / 2, Y + H3 / 2, Math.min(W3, H3) * .25, 0, TAU); g.fill(); }
      else if (k === 'paint') { g.fillStyle = c; g.beginPath(); g.arc(X + W3 / 2, Y + H3 / 2, Math.min(W3, H3) * .4, 0, TAU); g.fill(); rr(X + W3 * .4, Y + H3 * .2, W3 * .2, 2, '#666'); }
      else if (k === 'feed') { rr(X + 1, Y + 1, W3 - 2, H3 - 2, c); rr(X + 2, Y + H3 * .4, W3 - 4, 3, '#6d4c41'); }
      else { rr(X + 1, Y + 1, W3 - 2, H3 - 2, c); rr(X + 1, Y + 1, W3 - 2, 2, 'rgba(255,255,255,.4)'); } } }
    return; }
  switch (it.t) {
    case 'gfridge': sh(); rr(x, y, w, h, '#cfd8dc'); rr(x + 3, y + 3, w - 6, h - 6, '#4fc3f7'); for (let i = 0; i < 6; i++) rr(x + 6 + i * (w - 12) / 6, y + 6, (w - 12) / 6 - 3, h - 12, ['#e53935', '#ffca28', '#43a047', '#1e88e5', '#ff7043', '#ab47bc'][(seed + i) % 6]); rr(x + 3, y + 3, w - 6, 3, 'rgba(255,255,255,.6)'); break;
    case 'pstand': sh(); rr(x, y, w, h, '#6d4c41'); for (let i = 0; i < 4; i++) { const c = ['#e53935', '#ff9800', '#43a047', '#fdd835', '#8e24aa', '#ef6c00'][(seed + i) % 6]; rr(x + 4 + i * (w - 8) / 4, y + 4, (w - 8) / 4 - 3, h - 8, '#4e342e'); g.fillStyle = c; for (let q = 0; q < 6; q++) { g.beginPath(); g.arc(x + 8 + i * (w - 8) / 4 + (q % 2) * 9, y + 10 + (q >> 1) * 13, 5, 0, TAU); g.fill(); } } break;
    case 'crack': sh(); rr(x, y + h * .4, w, 4, '#9e9e9e'); for (let i = 0; i < 9; i++) rr(x + 4 + i * (w - 8) / 9, y + 2, (w - 8) / 9 - 2, h - 4, ['#ef5350', '#42a5f5', '#66bb6a', '#212121', '#fff176', '#ab47bc', '#f5f5f5', '#8d6e63'][(seed + i) % 8]); break;
    case 'manq': sh(); g.fillStyle = '#e0e0e0'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w * .45, h * .3, 0, 0, TAU); g.fill(); g.fillStyle = ['#c62828', '#283593', '#2e7d32'][seed % 3]; g.beginPath(); g.ellipse(x + w / 2, y + h / 2 + 2, w * .4, h * .25, 0, 0, TAU); g.fill(); g.fillStyle = '#e0e0e0'; g.beginPath(); g.arc(x + w / 2, y + h / 2 - 2, w * .18, 0, TAU); g.fill(); break;
    case 'fitroom': rr(x, y, w, h, '#5d4037'); rr(x + 4, y + 4, w - 8, h - 6, '#7b1fa2'); rr(x + 4, y + h - 8, w - 8, 4, '#4a148c'); break;
    case 'salonst': sh(); rr(x, y, w, 10, '#90caf9'); rr(x + 3, y + 2, w - 6, 6, '#e3f2fd'); rr(x + 4, y + 14, w - 8, 10, '#eceff1'); g.fillStyle = '#111'; g.beginPath(); g.arc(x + w / 2, y + h - 18, 16, 0, TAU); g.fill(); g.fillStyle = '#c62828'; g.beginPath(); g.arc(x + w / 2, y + h - 18, 12, 0, TAU); g.fill(); break;
    case 'ssink': sh(); rr(x, y, w, h, '#eceff1'); g.fillStyle = '#90a4ae'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w * .3, h * .3, 0, 0, TAU); g.fill(); break;
    case 'waitch': sh(); rr(x + 2, y + 2, w - 4, h - 4, '#455a64'); rr(x + 2, y + 2, w - 4, 6, '#37474f'); break;
    case 'jcase': sh(); rr(x, y, w, h, '#4e342e'); rr(x + 3, y + 3, w - 6, h - 6, 'rgba(179,229,252,.6)'); for (let i = 0; i < 5; i++) { const tw = .5 + .5 * Math.sin(G.t * 4 + i * 1.7 + seed); g.fillStyle = ['#ffd54f', '#e0e0e0', '#80deea', '#f48fb1', '#fff'][i]; g.beginPath(); g.arc(x + 10 + i * (w - 20) / 4, y + h / 2, 3 + tw * 1.5, 0, TAU); g.fill(); } break;
    case 'ftank': sh(); rr(x, y, w, h, '#37474f'); rr(x + 3, y + 3, w - 6, h - 6, '#0277bd'); for (let i = 0; i < 4; i++) { const fx = x + 8 + ((G.t * 18 + i * 37 + seed * 11) % (w - 16)); g.fillStyle = ['#ff7043', '#ffeb3b', '#e91e63', '#76ff03'][i]; g.beginPath(); g.ellipse(fx, y + 8 + i * (h - 16) / 4, 4, 2.5, 0, 0, TAU); g.fill(); } break;
    case 'pcage': sh(); rr(x, y, w, h, '#bdbdbd'); rr(x + 3, y + 3, w - 6, h - 6, '#efebe9'); g.strokeStyle = '#9e9e9e'; g.lineWidth = 1.5; for (let X = x + 6; X < x + w - 3; X += 6) { g.beginPath(); g.moveTo(X, y + 3); g.lineTo(X, y + h - 3); g.stroke(); } g.fillStyle = ['#ffcc80', '#fff', '#8d6e63'][seed % 3]; g.beginPath(); g.ellipse(x + w / 2 + Math.sin(G.t * 2 + seed) * 6, y + h * .6, 9, 6, 0, 0, TAU); g.fill(); break;
    case 'sacks': sh(); for (let i = 0; i < 3; i++) { g.fillStyle = ['#d7ccc8', '#bcaaa4', '#e0d6c8'][i]; g.beginPath(); g.ellipse(x + w * (.2 + i * .3), y + h / 2, w * .16, h * .42, 0, 0, TAU); g.fill(); g.fillStyle = '#6d4c41'; g.fillRect(x + w * (.15 + i * .3), y + h * .45, w * .1, 3); } break;
    case 'barrelx': sh(); g.fillStyle = '#795548'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w * .45, 0, TAU); g.fill(); g.strokeStyle = '#3e2723'; g.lineWidth = 3; g.stroke(); g.fillStyle = ['#e53935', '#fdd835', '#8d6e63'][seed % 3]; g.beginPath(); g.arc(x + w / 2, y + h / 2, w * .3, 0, TAU); g.fill(); break;
    case 'lumber': sh(); for (let i = 0; i < 7; i++) rr(x + 2, y + 2 + i * (h - 4) / 7, w - 4, (h - 4) / 7 - 2, i % 2 ? '#d7a86e' : '#c69560'); break;
    case 'slush': sh(); rr(x, y, w, h, '#455a64'); rr(x + 4, y + 4, w / 2 - 6, h - 8, '#e53935'); rr(x + w / 2 + 2, y + 4, w / 2 - 6, h - 8, '#29b6f6'); break;
    case 'coffee': sh(); rr(x, y, w, h, '#3e2723'); rr(x + 5, y + 5, w - 10, h - 10, '#212121'); g.fillStyle = '#d7ccc8'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 5, 0, TAU); g.fill(); break;
    case 'lotto': sh(); rr(x, y, w, h, '#fdd835'); rr(x + 3, y + 3, w - 6, h - 6, '#e53935'); rr(x + 6, y + 6, w - 12, h - 12, '#fff59d'); break;
    case 'checkout': sh(); rr(x, y, w, h, '#455a64'); rr(x + 4, y + 4, w * .55, h - 8, '#212121'); for (let X = x + 6; X < x + w * .55; X += 6) rr(X, y + 4, 2, h - 8, '#424242'); break;
    case 'treadmill': sh(); rr(x, y, w, h, '#263238'); rr(x + 6, y + 10, w - 12, h - 16, '#424242'); rr(x + 4, y + 2, w - 8, 6, '#90a4ae'); break;
    case 'ballbin': sh(); rr(x, y, w, h, '#37474f'); for (let i = 0; i < 6; i++) { g.fillStyle = ['#ff7043', '#fff', '#43a047', '#fdd835'][i % 4]; g.beginPath(); g.arc(x + 10 + (i % 3) * (w - 20) / 2, y + 12 + (i / 3 | 0) * (h - 24), 7, 0, TAU); g.fill(); } break;
  }
}
const SHOPDRAW = new Set(['gfridge', 'pstand', 'crack', 'manq', 'fitroom', 'salonst', 'ssink', 'waitch', 'jcase', 'ftank', 'pcage', 'sacks', 'barrelx', 'lumber', 'slush', 'coffee', 'lotto', 'checkout', 'treadmill', 'ballbin']);
function drawItemS(it, s) { if (it.t.startsWith('sh_') || SHOPDRAW.has(it.t)) { if (it.stolen) return; return drawShopItem(ctx, it, it.x * T, it.y * T, it.w * T, it.h * T); } return drawItemK(it, s); }
// ---------- take someone's bike or board; pick up a dropped one ----------
function findInteract() { const o = findInteractM(); if (G.scene || pCar() || G.dlgOpen) return o; const p = G.player, fx = p.x + Math.cos(p.a) * 8, fy = p.y + Math.sin(p.a) * 8; let best = null, bd = 40;
  for (const q of G.peds) { if (!q.ride || q.dead || q.car) continue; const d = dist(fx, fy, q.x, q.y); if (d < bd) { bd = d; best = { k: 'ride', q, label: 'Take their ' + (q.ride === 'bike' ? 'bike' : 'skateboard') }; } }
  for (const pr of propsNear(fx, fy, 40)) { if ((pr.t !== 'downbike' && pr.t !== 'downboard') || pr.dead) continue; const d = dist(fx, fy, pr.x, pr.y); if (d < bd) { bd = d; best = { k: 'ridep', pr, label: 'Pick up the ' + (pr.t === 'downbike' ? 'bike' : 'skateboard') }; } }
  return best && (!o || bd < 30 || o.k === 'ped') ? best : o; }
function doInteract(o) {
  if (o && o.k === 'ride') { const q = o.q, t = q.ride === 'bike' ? 'bmx' : 'skate', col = q.rideCol; q.ride = null; q.state = 'flee'; q.threat = G.player; q.timer = 6; q.kx = Math.cos(G.player.a) * 160; q.ky = Math.sin(G.player.a) * 160; pedSay(q, pick(['Hey! That\'s mine!', 'Thief!', 'Give it back!', 'Seriously?!'])); crime(.5, 'Theft');
    const c = new Car(t, q.x, q.y, G.player.a, col); c.color = col; c.ai = { mode: 'parked' }; c.persist = 1; G.cars.push(c); enterCar(c); return; }
  if (o && o.k === 'ridep') { const pr = o.pr, t = pr.t === 'downbike' ? 'bmx' : 'skate'; pr.dead = 1; const k = idx(Math.floor(pr.x / T), Math.floor(pr.y / T)), a = W.pgrid[k]; if (a) W.pgrid[k] = a.filter(x => x !== pr); const c = new Car(t, pr.x, pr.y, pr.a || 0, pr.col); if (pr.col) c.color = pr.col; c.ai = { mode: 'parked' }; c.persist = 1; G.cars.push(c); enterCar(c); return; }
  return doInteractM(o);
}
