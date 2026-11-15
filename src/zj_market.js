// ================= NEW RIDES (luxury, super, pickups) · PHONE MARKETPLACE · SELLING TO SHOPS · PARTING OUT =================
Object.assign(CAR_TYPES, {
  luxsedan: { name: 'Regent', L: 40, W: 18, max: 650, acc: 520, steer: 2.4, grip: 9, hp: 170, mass: 1.35, eb: 30, cols: ['#111111', '#c0c6cc', '#1b2a49', '#f4f4f4', '#5b1a26', '#2e3b33'], deco(g, L, Wd) { g.fillStyle = '#e6e9ec'; g.fillRect(L * .18, .35, L * .66, .45); g.fillRect(L * .18, Wd - .8, L * .66, .45); g.fillRect(L - 1.5, Wd * .32, 1.1, Wd * .36); g.fillStyle = 'rgba(0,0,0,.35)'; for (let y = Wd * .35; y < Wd * .66; y += 1) g.fillRect(L - 1.4, y, .9, .35); g.fillStyle = '#f2f2f2'; g.beginPath(); g.arc(L * .955, Wd / 2, .7, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(L * .76, Wd / 2 - .3, L * .2, .6); } },
  luxsuv: { name: 'Sovereign', L: 39, W: 20, max: 610, acc: 470, steer: 2.5, grip: 8.6, hp: 210, mass: 1.6, off: .55, eb: 29, cols: ['#111111', '#f4f4f4', '#3b4a5a', '#7a6a55', '#22313f'], deco(g, L, Wd) { g.fillStyle = '#1a1a1a'; g.fillRect(L * .26, 2.5, L * .3, .6); g.fillRect(L * .26, Wd - 3.1, L * .3, .6); g.fillStyle = 'rgba(10,18,28,.85)'; g.fillRect(L * .33, Wd / 2 - 2.4, L * .18, 4.8); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(L * .34, Wd / 2 - 2, L * .06, 1); g.fillStyle = '#d9dde1'; g.fillRect(L - 1.4, Wd * .3, 1, Wd * .4); } },
  coupe: { name: 'Monarch GT', low: 1, L: 36, W: 18, max: 780, acc: 690, steer: 2.9, grip: 10, hp: 150, mass: 1.1, eb: 33, cols: ['#0d47a1', '#111111', '#eeeeee', '#7b1fa2', '#b71c1c', '#455a64'], deco(g, L, Wd) { g.fillStyle = 'rgba(8,14,24,.8)'; g.fillRect(L * .37, Wd / 2 - 2, L * .1, 4); g.fillStyle = '#bbb'; for (const y of [Wd * .2, Wd * .32, Wd * .68, Wd * .8]) g.fillRect(-.7, y - .45, 1, .9); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(L * .8, Wd / 2 - 3, L * .12, .5); g.fillRect(L * .8, Wd / 2 + 2.5, L * .12, .5); } },
  super: { name: 'Vortex', low: 1, L: 35, W: 18, max: 950, acc: 920, steer: 3.1, grip: 11.5, hp: 135, mass: 1, off: .05, eb: 52, cols: ['#ff6d00', '#c6ff00', '#111111', '#f4f4f4', '#d50000', '#00b0ff'], deco(g, L, Wd) { g.fillStyle = 'rgba(0,0,0,.65)'; for (const s of [0, 1]) { g.beginPath(); const y0 = s ? Wd - .3 : .3, y1 = s ? Wd - 3 : 3; g.moveTo(L * .3, y0); g.lineTo(L * .46, y0); g.lineTo(L * .33, y1); g.closePath(); g.fill(); } g.fillStyle = 'rgba(0,0,0,.45)'; for (let i = 0; i < 4; i++) g.fillRect(L * (.04 + i * .04), Wd * .27, L * .018, Wd * .46); g.fillStyle = '#0c0c0c'; g.fillRect(-.7, Wd * .22, 1.2, Wd * .56); g.fillStyle = '#e8f6ff'; g.fillRect(L * .92, 1.3, L * .06, 1); g.fillRect(L * .92, Wd - 2.3, L * .06, 1); g.fillStyle = '#ff1744'; g.fillRect(.2, 1.2, .7, Wd - 2.4); } },
  hyper: { name: 'Phantom X', low: 1, L: 37, W: 18.5, max: 1060, acc: 1060, steer: 3.2, grip: 12.5, hp: 140, mass: 1, off: 0, eb: 58, cols: ['#212121', '#e0e0e0', '#1a237e', '#004d40', '#ffab00'], deco(g, L, Wd) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(L * .27, .2, L * .17, 1.6); g.fillRect(L * .27, Wd - 1.8, L * .17, 1.6); g.fillStyle = 'rgba(20,30,40,.85)'; g.fillRect(L * .03, Wd / 2 - 1.6, L * .18, 3.2); g.fillStyle = '#ff6f00'; g.fillRect(L * .06, Wd / 2 - .9, L * .1, 1.8); g.fillStyle = '#0a0a0a'; g.fillRect(-1.8, -.9, 2.2, Wd + 1.8); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-1.6, -.7, .5, Wd + 1.4); g.fillStyle = '#ff1744'; g.fillRect(.1, .8, .6, Wd - 1.6); g.fillStyle = '#e8f6ff'; g.fillRect(L * .93, 1.1, L * .05, .8); g.fillRect(L * .93, Wd - 1.9, L * .05, .8); } },
  roadster: { name: 'Spyder', low: 1, L: 32, W: 17, max: 870, acc: 830, steer: 3.3, grip: 11, hp: 110, mass: .9, off: .1, eb: 48, cols: ['#c62828', '#fdd835', '#eceff1', '#2e7d32', '#1565c0', '#111111'], deco(g, L, Wd) { g.fillStyle = '#262626'; g.fillRect(L * .26, 2.1, L * .29, Wd - 4.2); g.fillStyle = '#c8a165'; g.fillRect(L * .33, 3, L * .13, Wd / 2 - 3.6); g.fillRect(L * .33, Wd / 2 + .6, L * .13, Wd / 2 - 3.6); g.fillStyle = '#9c7a48'; g.fillRect(L * .31, 3, L * .03, Wd / 2 - 3.6); g.fillRect(L * .31, Wd / 2 + .6, L * .03, Wd / 2 - 3.6); g.fillStyle = '#111'; g.beginPath(); g.arc(L * .5, Wd * .33, 1.3, 0, TAU); g.fill(); g.fillStyle = '#aaa'; g.fillRect(L * .27, 2.5, .7, Wd - 5); } },
  pickup4: { name: 'Ridgeback 4x4', pick: 1, L: 38, W: 20, max: 570, acc: 450, steer: 2.5, grip: 8.6, hp: 195, mass: 1.5, off: .9, eb: 24, cols: ['#212121', '#b71c1c', '#eeeeee', '#33691e', '#795548', '#0d47a1'], deco(g, L, Wd) { g.fillStyle = '#111'; for (const x of [L * .1, L * .66]) { g.fillRect(x, -.6, L * .18, 1.4); g.fillRect(x, Wd - .8, L * .18, 1.4); } g.fillStyle = '#1c1c1c'; g.fillRect(L * .6, 2.2, 1.3, Wd - 4.4); g.fillStyle = '#fff59d'; for (let y = 3; y < Wd - 3; y += 2.2) g.fillRect(L * .6 + .3, y, .7, 1.2); g.fillStyle = '#333'; g.fillRect(L * .39, 1.6, .9, Wd - 3.2); g.fillStyle = '#222'; g.fillRect(L - .5, 1, 1.4, Wd - 2); } },
  workpick: { name: 'Contractor', pick: 1, L: 40, W: 19, max: 490, acc: 360, steer: 2.4, grip: 8, hp: 185, mass: 1.6, off: .7, eb: 26, cols: ['#f4f4f4', '#ef6c00', '#1565c0', '#9e9e9e', '#2e7d32'], deco(g, L, Wd) { g.fillStyle = '#9ea7ad'; g.fillRect(L * .03, 2.2, L * .63, .7); g.fillRect(L * .03, Wd - 2.9, L * .63, .7); for (let x = L * .06; x < L * .64; x += L * .14) g.fillRect(x, 2.2, .6, Wd - 4.4); g.fillStyle = '#cfd8dc'; g.fillRect(L * .02, Wd / 2 - 1.6, L * .62, .5); g.fillRect(L * .02, Wd / 2 + 1.1, L * .62, .5); for (let x = L * .04; x < L * .62; x += 1.8) g.fillRect(x, Wd / 2 - 1.6, .35, 3.2); g.fillStyle = '#c62828'; g.fillRect(L * .36, 2.8, 1.8, Wd - 5.6); g.fillStyle = '#ffb300'; g.fillRect(L * .6, Wd / 2 - 1, .9, 2); } },
  minitruck: { name: 'Sprite', pick: 1, L: 26, W: 15, max: 430, acc: 380, steer: 3.0, grip: 8, hp: 90, mass: .7, off: .6, eb: 46, cols: ['#eceff1', '#4fc3f7', '#ffb74d', '#81c784', '#e57373'], deco(g, L, Wd) { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(L * .04, 1.3, L * .4, .5); g.fillRect(L * .04, Wd - 1.8, L * .4, .5); g.fillStyle = '#ffeb3b'; g.fillRect(L - .8, 1.5, .6, 1.4); g.fillRect(L - .8, Wd - 2.9, .6, 1.4); } },
});
TRAFFIC_MIX.push('luxsedan', 'luxsedan', 'luxsuv', 'luxsuv', 'coupe', 'pickup4', 'pickup4', 'workpick', 'workpick', 'minitruck', 'super');
RTRAFFIC.push('pickup4', 'pickup4', 'workpick', 'workpick', 'workpick', 'minitruck', 'luxsuv');
PARK_MIX.push('luxsedan', 'luxsuv', 'coupe', 'pickup4', 'workpick', 'minitruck', 'roadster', 'super', 'pickup4');
Object.assign(TRUNKCAP, { luxsedan: 50, luxsuv: 80, coupe: 22, super: 12, hyper: 10, roadster: 10, pickup4: 100, workpick: 110, minitruck: 60 });
Object.assign(CARVAL, { luxsedan: 2200, luxsuv: 2600, coupe: 2800, super: 6000, hyper: 9000, roadster: 4200, pickup4: 1300, workpick: 1000, minitruck: 450 });
Object.assign(STOCKENG, { super: 'eng_sc8', hyper: 'eng_sc8', roadster: 'eng_i4t', coupe: 'eng_v8', luxsedan: 'eng_v8', luxsuv: 'eng_v8', pickup4: 'eng_v8', workpick: 'eng_v6', minitruck: 'eng_i4' });
const DEALER_LAND = ['minitruck', 'compact', 'sedan', 'suv', 'pickup', 'workpick', 'pickup4', 'jeep', 'van', 'muscle', 'sports', 'luxsedan', 'luxsuv', 'coupe', 'limo', 'roadster', 'super', 'hyper', 'scooter', 'dirtbike', 'bike', 'sportbike', 'quad', 'bmx'];

// ---------- value, ownership, thumbnails ----------
const VMK = () => G.save.mkt || (G.save.mkt = { clock: 0, shopT: -1e9, list: [], msgs: [], feed: [], blocked: [], seq: 1 });
const recId = r => r.id || (r.id = 'g' + (VMK().seq++) + '_' + rint(100, 999));
const isLegitRec = r => r.legit === 1 || (r.legit === undefined && !!r.built);
function mktValue(type, mods, cond, legit) { const base = (CARVAL[type] || 400) * 3; let v = base * .62 * (.3 + .7 * clamp(cond === undefined ? 1 : cond, 0, 1)) + modsValue(mods || {}) * .45; if (!legit) v *= .3; return Math.max(50, Math.round(v / 10) * 10); }
const recValue = r => partsAdjValue(r, projValue(r.type, r.mods, r.cond, isLegitRec(r), r.missing, r.noEng));
const r50 = n => Math.max(50, Math.round(n / 50) * 50);
function valRange(v, seed) { const j = ((h32(String(seed)) % 1000) / 1000); const lo = r50(v * (.8 + j * .12)); return [lo, r50(lo + v * .28)]; }
const condWord = c => c >= .9 ? 'Excellent' : c >= .75 ? 'Good' : c >= .55 ? 'Fair' : c >= .35 ? 'Rough' : 'Barely runs';
const THUMBS = new Map();
function carThumb(type, color, mods) { const k = type + color + modKey(mods || {}); let cv = THUMBS.get(k); if (cv) return cv.cloneNode ? cloneCv(cv) : cv; cv = document.createElement('canvas'); cv.width = 88; cv.height = 52; cv.style.width = '44px'; cv.style.height = '26px'; const g = cv.getContext('2d'), spr = carSprite(type, color, false, mods || {}, true), sc = Math.min(80 / spr.width, 44 / spr.height); g.imageSmoothingEnabled = true; g.drawImage(spr, (88 - spr.width * sc) / 2, (52 - spr.height * sc) / 2, spr.width * sc, spr.height * sc); if (THUMBS.size > 80) THUMBS.clear(); THUMBS.set(k, cv); return cloneCv(cv); }
function cloneCv(cv) { const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height; c2.style.width = cv.style.width; c2.style.height = cv.style.height; c2.getContext('2d').drawImage(cv, 0, 0); return c2; }
const thumbRow = (H, col, type, color, mods, name, sub, btns) => { const r = H.row(col, '', name, sub, btns); r.querySelector('.pe').appendChild(carThumb(type, color || CAR_TYPES[type].cols[0], mods)); return r; };
const recColor = r => (r.mods && r.mods.p) || CAR_TYPES[r.type].cols[0];
function homeNear() { const o = herePos(); return W.buildings.some(b => b.door && (b.name === 'Your Apartment' || owned(b)) && dist2(b.door.x, b.door.y, o.x, o.y) < 700 * 700); }
function giveCar(spec, msgTxt) {
  const broken = spec.noEng || Object.keys(spec.missing || {}).some(k => spec.missing[k] > 0);
  if (!G.scene && !broken) { const s = nearRoadSpot(herePos(), 8); if (s) { const c = new Car(spec.type, s[0], s[1], s[2], spec.color); applyMods(c, Object.assign({}, spec.mods || {}, { p: spec.color })); c.hp = c.st.hp * clamp(spec.cond === undefined ? 1 : spec.cond, .05, 1); if (spec.cond < .3) c.flat = 1; c.ai = { mode: 'parked' }; c.owned = 1; c.persist = 1; c.legit = spec.legit ? 1 : 0; G.cars.push(c); msg(msgTxt || ('Your ' + c.d.name + ' is parked nearby.'), '#2ecc71'); return c; } }
  if (garUsed() >= garCap()) return null; myCars().push({ type: spec.type, mods: Object.assign({}, spec.mods || {}, { p: spec.color }), cond: spec.cond, legit: spec.legit ? 1 : 0, missing: Object.assign({}, spec.missing || {}), noEng: spec.noEng ? 1 : 0 }); msg((msgTxt || CAR_TYPES[spec.type].name + ' delivered') + (broken ? ' — it doesn\'t run, so it was towed to your home garage.' : ' — it is in your home garage.'), '#2ecc71'); return 'garage';
}
function myNearCar() { const p = G.player, k = pCar(); if (k) return k; if (G.scene) return null; let b = null, bd = 220 * 220; for (const c of G.cars) { if (c.dead || c.driver || !c.owned || c.d.boat) continue; const d = dist2(c.x, c.y, p.x, p.y); if (d < bd) { bd = d; b = c; } } return b; }
function storeCarAny(c) { if (garUsed() >= garCap()) return toast('Garage is full'); const free = homeNear(); if (!free && !payAny(150)) return; if (c.driver === G.player) exitCar(true); storeCar(c); msg(c.d.name + (free ? ' stored in your garage.' : ' towed to your garage ($150).'), '#2ecc71'); }

// ---------- part out at home ----------
function partOut(i) {
  const L = myCars(), r = L[i]; if (!r) return; const S = G.stash.items, got = [], cond = clamp(r.cond === undefined ? 1 : r.cond, .2, 1), add = (id, n) => { if (n > 0 && ITEMS[id]) { S[id] = (S[id] | 0) + n; got.push(ITEMS[id].n + (n > 1 ? ' ×' + n : '')); } };
  const req = buildReq(r.type), E = r.mods && r.mods.swp ? ENGS[r.mods.swp].id : stockEng(r.type);
  if (E && !r.noEng && Math.random() < cond + .2) add(E, 1); for (const k in req) { let n = 0; const have = req[k] - ((r.missing || {})[k] | 0); for (let j = 0; j < have; j++) if (Math.random() < cond * .95 + .05) n++; add(k, n); }
  if (Math.random() < .6) add('copper', rint(1, 3));
  for (const k in r.mods || {}) if (MODOPTS[k] && !PART_EXCL.has(k) && r.mods[k] > 0 && Math.random() < .5 + cond * .5) { partAdd(k, r.mods[k]); got.push(partN(k, r.mods[k])); }
  L.splice(i, 1, shellRec(r.type)); Snd.play('ratchet'); setTimeout(() => Snd.play('grinder'), 300); doSave(true);
  msg('Parted out the ' + CAR_TYPES[r.type].name + ': shell' + (got.length ? ', ' + got.join(', ') : '') + ' → home stash.', '#f2c230');
}

// ---------- sell to an auto shop (legit cars only, cooldown) ----------
const SHOPCD = 600;
function shopSellOpt(c, mkOpt, section) {
  const M = VMK(), legit = !!c.legit, v = mktValue(c.type, c.mods, c.hp / c.st.hp, 1), pr = r50(v * .62), wait = Math.ceil((M.shopT + SHOPCD - M.clock) / 60);
  section('DMV — title & registration');
  if (legit) mkOpt('Clean title on file', 'Papers are in order', 'on', () => {}, true);
  else if (c.d.siren) mkOpt('Apply for a title', 'Not a chance — it\'s a police vehicle.', '', () => {}, true);
  else { const T2 = M.titles = (M.titles || []).filter(t => M.clock - t < 900), fee = r50(Math.max(400, mktValue(c.type, c.mods, 1, 1) * .3)), risk = T2.length >= 2 ? Math.min(.7, .2 * (T2.length - 1)) : 0;
    mkOpt('Apply for a title — ' + money(fee), (risk ? 'The DMV is getting suspicious of you (' + Math.round(risk * 100) + '% they call the cops)' : 'The mechanic files proper paperwork. Safe, but pricey for expensive cars. Chop shops forge them cheaper.'), '', () => buy(fee, () => { T2.push(M.clock); if (Math.random() < risk) { crime(1.4 + .4 * T2.length, 'Title fraud'); G.heat = Math.max(G.heat, 1.05 + .9 * Math.max(0, T2.length - 2)); G.starFlash = 2; markSeen(); msg('The DMV flagged your paperwork and called the cops!', '#ff6b6b'); } else { c.legit = 1; msg('Retitled — the ' + c.d.name + ' has clean papers now.', '#2ecc71'); } }), G.cash < fee); }
  section('Sell to the shop');
  if (!legit) return mkOpt('Sell this vehicle', 'No title — shops only buy cars with papers. Try a chop shop or the phone marketplace.', '', () => {}, true);
  if (wait > 0) return mkOpt('Sell this vehicle', 'The shop already bought a car from you. Back in ' + wait + ' min.', '', () => {}, true);
  mkOpt('Sell this vehicle — ' + money(pr), 'Instant · below market', '', () => {
    const z = GAR.z; closeGarage(); const p = G.player; exitCar(true); const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); if (c.isRide) { delete G.save.ride; }
    if (z) { p.x = (z.x0 + z.x1) / 2 + z.fx * T * .9; p.y = (z.y0 + z.y1) / 2 + z.fy * T * .9; }
    addCash(pr); M.shopT = M.clock; Snd.play('cash'); G.big = { text: 'SOLD', col: '#2ecc71', t: 2.4, sub: c.d.name + ' · +' + money(pr), small: 1 }; doSave(true);
  });
}

// ---------- marketplace: listing generator ----------
const MK_POOL = ['compact', 'compact', 'sedan', 'sedan', 'suv', 'pickup', 'pickup4', 'workpick', 'minitruck', 'jeep', 'van', 'muscle', 'muscle', 'sports', 'sports', 'luxsedan', 'luxsuv', 'coupe', 'roadster', 'super', 'limo', 'scooter', 'dirtbike', 'sportbike', 'bike', 'quad', 'hyper'];
const MK_DESC = { good: ['Garage kept, all service records.', 'One owner, never smoked in.', 'Selling because I got a company car.', 'Runs and drives great, small door ding.', 'New tyres last month.', 'Moving out of state, priced to sell.'], meh: ['Needs a little TLC.', 'Check engine light on, probably nothing.', 'Some rust underneath, mechanically ok.', 'AC doesn\'t work, everything else fine.'], scam: ['MINT!!! no lowballers. cash only. first come first serve', 'perfect condition must sell TODAY', 'runs like new, no test drives, serious buyers only', 'flawless, im out of town so ill have it dropped off', 'like new 100%, dont ask is it available'] };
function genListingOld(M) {
  const type = pick(MK_POOL), d = CAR_TYPES[type], scam = Math.random() < .15, claim = scam ? .82 + Math.random() * .18 : .5 + Math.random() * .5, real = scam ? .1 + Math.random() * .3 : clamp(claim + (Math.random() - .6) * .1, .3, 1);
  const mods = {}, add = (k, v) => { if (MODOPTS[k] && MODOPTS[k].o[v]) mods[k] = v; };
  if (!d.two && Math.random() < .4) add('rim', rint(1, 4)); if (Math.random() < .3) add('tint', rint(1, 2)); if (Math.random() < .25) add('eng', rint(1, 2)); if (Math.random() < .12) add('tur', 1); if (!d.custom && Math.random() < .15) add('sp', rint(1, 2));
  const vc = mktValue(type, mods, claim, 1), r = Math.random(), mult = scam ? .55 + Math.random() * .25 : r < .25 ? .62 + Math.random() * .18 : r < .75 ? .88 + Math.random() * .2 : 1.1 + Math.random() * .25;
  const ask = r50(vc * mult), desperate = !scam && Math.random() < .2;
  return { id: 'm' + (M.seq++), type, color: pick(d.cols), mods, claim, real, scam: scam ? 1 : 0, ask, floor: r50(ask * (scam ? .55 : desperate ? .68 + Math.random() * .08 : .8 + Math.random() * .15)), temper: Math.random(), seller: randName(), desc: scam ? pick(MK_DESC.scam) : desperate ? 'Need gone this week. ' + pick(MK_DESC.good) : claim < .7 ? pick(MK_DESC.meh) : pick(MK_DESC.good), t: M.clock, exp: M.clock + 150 + Math.random() * 360, legit: scam && Math.random() < .5 ? 0 : 1, asked: 0, hot: Math.random() < .5 };
}
// ---------- tick: buyers, sellers, feed ----------
const waitFor = r => 55 * Math.exp(5.2 * (r - 1));
function mkNote(text) { Snd.play('pop'); msg('📱 ' + text, '#4fc3f7'); if (Panel.mode === 'phone' && Panel.tab === 'market') Panel.render(); }
function marketTick0(dt) {
  if (!G.save) return; const M = VMK(); M.clock += dt; if ((M._acc = (M._acc || 0) + dt) < .5) return; M._acc = 0; const now = M.clock, L = myCars();
  M.feed = M.feed.filter(l => l.exp > now || l.deal); while (M.feed.length < 7) M.feed.push(genListing(M));
  M.list = M.list.filter(l => gRec(l.gid)); for (const l of M.list) { const r = gRec(l.gid); l.v = recValue(r); }
  for (const l of M.list) { if (Math.random() < .2 / Math.max(.5, l.ask / l.v)) l.views = (l.views | 0) + 1; if (now < l.nextT) continue; l.views = (l.views | 0) + rint(3, 12); const r = gRec(l.gid); const bv = l.v * (.85 + Math.random() * .3), low = Math.random() < .22; let offer;
    if (low) offer = r50(l.v * (.45 + Math.random() * .2)); else if (l.ask <= bv) offer = Math.random() < .65 ? l.ask : r50(l.ask * (.9 + Math.random() * .07)); else offer = r50(Math.min(bv, l.ask * .96) * (.88 + Math.random() * .1));
    offer = Math.min(offer, l.ask); const who = randName(), d = CAR_TYPES[r.type].name;
    M.msgs.unshift({ unread: 1, id: 'x' + (M.seq++), side: 'sell', ctype: r.type, lid: l.id, gid: l.gid, who, bv, offer, t: now, exp: now + 300, kind: 'offer', text: low ? pick(['lowest you\'ll go? I can do ' + money(offer) + ' cash right now', money(offer) + ' and I pick it up tonight', 'would you take ' + money(offer) + '? it\'s an old ' + d]) : offer >= l.ask ? pick(['Is this still available? I\'ll pay the ' + money(offer) + ' asking.', 'Hi! I want it. ' + money(offer) + ' works for me.', 'Full price, cash. Where can I see the ' + d + '?']) : pick(['Hey, interested in the ' + d + '. Would you do ' + money(offer) + '?', 'Can you do ' + money(offer) + '? I can come today.', 'Nice ride. ' + money(offer) + ' is what I have.']) });
    l.nextT = now + waitFor(l.ask / l.v) * (isLegitRec(r) ? 1 : 2.5) * (.5 + Math.random()); mkNote(who.split(' ')[0] + ' messaged you about your ' + d);
  }
  for (const m of M.msgs) { if (m.pend && now >= m.pend.at) { const f = m.pend.f; m.pend = null; m.unread = 1; f(m); } if (!m.done && m.exp && now > m.exp) { m.done = 1; m.expired = 1; } }
  if (M.msgs.length > 40) M.msgs.length = 40;
}
// seller-side reply to your counter
function counterBuyer0(m, price) {
  const M = VMK(); m.kind = 'wait'; m.text = 'You: How about ' + money(price) + '?'; m.pend = { at: M.clock + 2 + Math.random() * 4, f: x => { if (price <= x.bv * 1.04) { x.kind = 'offer'; x.offer = price; x.text = pick(['Ok, ' + money(price) + ' it is.', 'Fine. Deal at ' + money(price) + '.', 'Alright you win, ' + money(price) + '.']); mkNote(x.who.split(' ')[0] + ' agreed to ' + money(price)); } else if (Math.random() < .35) { x.kind = 'gone'; x.done = 1; x.text = pick(['Nah, too rich for me. Good luck.', 'I\'ll pass.', 'Found another one, thanks.']); mkNote(x.who.split(' ')[0] + ' passed'); } else { const o = r50((x.offer + Math.min(price, x.bv)) / 2); x.offer = Math.max(x.offer, o); x.kind = 'offer'; x.text = 'Can\'t do ' + money(price) + '. Best I can do is ' + money(x.offer) + '.'; mkNote(x.who.split(' ')[0] + ' countered'); } } };
}
function sellTo0(m) {
  const M = VMK(), L = myCars(), i = L.findIndex(r => r.id === m.gid); if (i < 0) { m.done = 1; return toast('That car is gone'); }
  const r = L[i]; L.splice(i, 1); M.list = M.list.filter(l => l.gid !== m.gid); for (const x of M.msgs) if (x.gid === m.gid && x !== m && !x.done) { x.done = 1; x.text += '  (sold to someone else)'; }
  m.done = 1; m.kind = 'sold'; m.text = 'Sold to ' + m.who + ' for ' + money(m.offer) + '.'; addCash(m.offer); Snd.play('cash'); G.big = { text: 'SOLD', col: '#2ecc71', t: 2.4, sub: CAR_TYPES[r.type].name + ' · +' + money(m.offer), small: 1 };
  if (!isLegitRec(r) && Math.random() < .15) { crime(.6, 'Selling a car without a title'); msg('The buyer ran the VIN. Someone tipped off the cops.', '#ff6b6b'); } doSave(true);
}
// buyer-side: you message a seller
function offerSellerOld(l, price) {
  const M = VMK(), m = { id: 'x' + (M.seq++), side: 'buy', ctype: l.type, lid: l.id, who: l.seller, t: M.clock, kind: 'wait', text: 'You: Would you take ' + money(price) + ' for the ' + CAR_TYPES[l.type].name + '?', exp: 0 };
  M.msgs.unshift(m); l.lastOffer = price;
  m.pend = { at: M.clock + 2 + Math.random() * 5, f: x => {
    const ratio = price / l.ask, nm = l.seller.split(' ')[0];
    if (price >= l.floor) { x.kind = 'deal'; x.price = price; x.exp = M.clock + 240; l.deal = price; x.text = pick(['Deal. ' + money(price) + ', come get it.', 'Ok ' + money(price) + ' works. Send it and it\'s yours.', 'Fine, ' + money(price) + '. Today only.']); return mkNote(nm + ' accepted your offer!'); }
    if (price >= l.floor * .86) { const c = r50(Math.max(l.floor, (l.floor + l.ask) / 2 - (l.ask - l.floor) * .25)); x.kind = 'deal'; x.price = c; x.exp = M.clock + 240; x.text = 'I can\'t go that low. ' + money(c) + ' and it\'s yours.'; l.deal = c; return mkNote(nm + ' countered at ' + money(c)); }
    const mad = clamp((.82 - ratio) * 1.5 + l.temper * .3 + (l.lowballs | 0) * .22, .05, .92); l.lowballs = (l.lowballs | 0) + 1;
    if (Math.random() < mad) { x.kind = 'mad'; x.done = 1; M.blocked.push(l.id); x.text = pick(['Are you serious?? ' + money(price) + '? Blocked.', 'LOL no. Don\'t message me again.', 'Lowballers like you are why I hate selling stuff. Blocked.', 'Insulting. Bye. 🚫', 'Read the ad. NO LOWBALLERS. Blocked.']); return mkNote(nm + ' blocked you'); }
    x.kind = 'info'; x.done = 1; x.text = pick(['No.', 'Not even close.', 'Asking is ' + money(l.ask) + ' for a reason.', 'Lol. No.', 'I\'ve had better offers.']); mkNote(nm + ' replied');
  } };
}
function askSellerOld(l) {
  const M = VMK(), m = { id: 'x' + (M.seq++), side: 'buy', ctype: l.type, lid: l.id, who: l.seller, t: M.clock, kind: 'wait', text: 'You: Any problems with it? Can you send more pictures?' }; M.msgs.unshift(m); l.asked = 1;
  m.pend = { at: M.clock + 2 + Math.random() * 4, f: x => { x.kind = 'info'; x.done = 1; const nm = l.seller.split(' ')[0];
    if (l.scam) x.text = Math.random() < .65 ? pick(['no problems. pictures are in the ad', 'its perfect bro, serious buyers only', 'cash only. no more pics, its in storage', 'why does everyone ask that. its MINT', 'i will have my cousin drop it off, pay first']) : pick(['Runs perfect, no issues at all.', 'Like new, never had a problem.']);
    else x.text = l.real >= .85 ? pick(['Nothing at all, sending pics now 📸 — clean inside and out.', 'Just a tiny scratch on the bumper, here\'s a photo.', 'No issues. Happy to show you the service book.']) : l.real >= .6 ? pick(['Some scratches and the brakes squeak a bit. Price reflects it.', 'Paint is faded on the hood, mechanically sound.', 'Small dent on the side, here are pics.']) : pick(['Honestly it needs work — engine knocks when cold.', 'It\'s rough, I\'ll be upfront. Good project car.', 'Rust and a slipping clutch. Priced for that.']);
    if (l.legit === 0 && !l.scam) x.text += ' No title though.'; mkNote(nm + ' replied'); } };
}
function buyListing0(l, price) {
  const M = VMK(); if (!payAny(price)) return false; M.feed = M.feed.filter(x => x !== l); for (const x of M.msgs) if (x.lid === l.id && !x.done) { x.done = 1; if (x.kind === 'deal') x.text += '  ✓ bought'; }
  const d = CAR_TYPES[l.type], got = giveCar({ type: l.type, color: l.color, mods: l.mods, cond: l.real, legit: l.legit, missing: l.missing, noEng: l.noEng }, 'Your ' + d.name + ' from ' + l.seller.split(' ')[0] + ' was dropped off nearby.');
  if (!got) { addCash(price); toast('No room — garage full and nowhere to park it'); return false; }
  if (l.scam) { setTimeout(() => { G.big = { text: 'SCAMMED', col: '#ff5252', t: 3.4, sub: 'The ' + d.name + ' is in ' + condWord(l.real).toLowerCase() + ' shape — nothing like the ad', small: 1 }; Snd.play('bad'); msg(l.seller.split(' ')[0] + ' stopped replying.' + (l.legit ? '' : ' And it has no title.'), '#ff6b6b'); }, 1200); if (got && got.hp !== undefined) { got.smokeT = 1; } }
  else Snd.play('cash'); doSave(true); return true;
}

// ---------- phone tab ----------
function marketTabQ(H) {
  const P = this, M = VMK(), sub = P.msub || (P.msub = 'browse'), now = M.clock, unread = mktUnread();
  H.title.textContent = 'Marketplace';
  const top = H.col(sub === 'browse' ? 'Vehicles for sale near you' : sub === 'sell' ? 'Sell a vehicle' : 'Messages'), bar = H.mk('div', 'pbs'); bar.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;max-width:none;margin-bottom:4px';
  for (const [k, n] of [['browse', '🔎 Browse'], ['sell', '💲 Sell'], ['msgs', '💬 Messages' + (unread ? ' (' + unread + ')' : '')]]) bar.appendChild(H.btn(n, () => { P.msub = k; P.sel = null; }, k === sub ? 'on' : ''));
  top.insertBefore(bar, top.children[1] || null);
  if (sub === 'msgs') for (const m of M.msgs) m.unread = 0;
  if (sub === 'browse') {
    const L = M.feed.filter(l => !M.blocked.includes(l.id)); if (!L.length) H.empty(top, 'Nothing listed right now. Check back soon.');
    for (const l of L) { const d = CAR_TYPES[l.type], r = thumbRow(H, top, l.type, l.color, l.mods, d.name + ' · ' + money(l.ask), (r => r < .78 ? '🔥 Way under market · ' : r < .92 ? '👍 Good price · ' : r > 1.15 ? '💸 Pricey · ' : '')(l.ask / projValue(l.type, l.mods, l.claim, 1, l.missing, l.noEng)) + 'listed as ' + condWord(l.claim).toLowerCase() + (l.legit ? '' : ' · no title') + ' · ' + Math.max(1, Math.round((now - l.t) / 60 + 1)) + ' min ago', [H.btn(P.sel === l.id ? 'Viewing' : 'View', () => { P.sel = l.id; }, P.sel === l.id ? 'on' : '')]); if (P.sel === l.id) r.classList.add('sel'); }
    const l = M.feed.find(x => x.id === P.sel); const c2 = H.col(l ? CAR_TYPES[l.type].name : 'Listing');
    if (!l) { H.empty(c2, 'Pick a listing. Compare the asking price with what similar cars go for — real bargains do show up. Not every seller is honest, though: ask questions before you send money.'); return; }
    for (const m of M.msgs) if (m.lid === l.id) m.unread = 0; const d = CAR_TYPES[l.type], vc = projValue(l.type, l.mods, l.claim, 1, l.missing, l.noEng), [lo, hi] = valRange(vc, l.id), deal = M.msgs.find(m => m.lid === l.id && m.kind === 'deal' && !m.done);
    thumbRow(H, c2, l.type, l.color, l.mods, '"' + l.desc + '"', l.seller + (l.hot ? ' · responds quickly' : ''), []);
    H.row(c2, '💵', 'Asking ' + money(l.ask), 'Similar ' + d.name + 's in ' + condWord(l.claim).toLowerCase() + ' condition sell for ' + money(lo) + '–' + money(hi), []);
    H.row(c2, '🚗', Math.round(d.max * .14) + ' mph top speed', 'Listed condition: ' + condWord(l.claim) + (l.missing && Object.keys(l.missing).length || l.noEng ? ' · HALF-BUILT, missing ' + missText(l.type, l.missing, l.noEng) : '') + (l.legit ? ' · clean title' : ' · NO TITLE — shops won\'t buy it'), []);
    if (deal) H.row(c2, '🤝', 'Agreed: ' + money(deal.price), 'Pay now and it gets dropped off', [H.btn('Pay ' + money(deal.price), () => buyListing(l, deal.price), 'y', !canPay(deal.price * 1.08))]);
    const off = P.moff && P.moff.id === l.id ? P.moff : (P.moff = { id: l.id, v: r50(l.ask * .8) });
    const r = H.row(c2, '✉', money(off.v) + ' · ' + Math.round(off.v / l.ask * 100) + '%', 'Your offer', [H.btn('−10%', () => { off.v = r50(off.v - l.ask * .1); }), H.btn('−$50', () => { off.v = r50(off.v - 50); }), H.btn('+$50', () => { off.v = Math.min(l.ask, r50(off.v + 50)); }), H.btn('Send', () => offerSeller(l, off.v), 'y', M.msgs.some(m => m.lid === l.id && m.kind === 'wait'))]);
    H.row(c2, '❓', 'Ask about problems / more pics', l.asked ? 'Asked — see Messages' : 'Honest sellers usually answer straight', [H.btn('Ask', () => askSeller(l), '', !!l.asked), H.btn('Block', () => { blockWho(l.seller, l.id); P.sel = null; }, 'r')]);
    const hist = M.msgs.filter(m => m.lid === l.id).slice(0, 4); for (const m of hist) H.row(c2, m.kind === 'wait' ? '…' : '💬', m.kind === 'wait' ? l.seller.split(' ')[0] + ' is typing…' : m.text, m.kind === 'wait' ? m.text : '', []).classList.add('pmsg');
    H.foot.appendChild(H.btn('Buy now — ' + money(l.ask) + ' + ' + money(r50(l.ask * .08)) + ' transfer', () => { if (buyListing(l, l.ask)) P.sel = null; }, 'y', !canPay(l.ask * 1.08)));
  } else if (sub === 'sell') {
    const L = myCars(); L.forEach(recId);
    if (M.list.length) for (const l of M.list) { const g = L.find(r => r.id === l.gid); if (!g) continue; const r = thumbRow(H, top, g.type, recColor(g), g.mods, CAR_TYPES[g.type].name + ' · listed at ' + money(l.ask), (l.views | 0) + ' views · ' + M.msgs.filter(m => m.gid === l.gid && !m.done).length + ' open chats', [H.btn(P.sel === g.id ? 'Editing' : 'Edit', () => { P.sel = g.id; P.mask = null; }, P.sel === g.id ? 'on' : '')]); if (P.sel === g.id) r.classList.add('sel'); }
    const free = L.filter(r => !M.list.some(l => l.gid === r.id) && CAR_TYPES[r.type]);
    if (!L.length) H.empty(top, 'Only cars stored in your home garage can be listed. Park it in one of your garages first (Phone › Vehicles shows them all).');
    for (const g of free) { const r = thumbRow(H, top, g.type, recColor(g), g.mods, CAR_TYPES[g.type].name, condWord(g.cond === undefined ? 1 : g.cond) + (isLegitRec(g) ? ' · clean title' : ' · no title'), [H.btn(P.sel === g.id ? 'Selected' : 'List it', () => { P.sel = g.id; P.mask = null; }, P.sel === g.id ? 'on' : 'y')]); if (P.sel === g.id) r.classList.add('sel'); }
    const g = L.find(r => r.id === P.sel), c2 = H.col(g ? 'Listing: ' + CAR_TYPES[g.type].name : 'Listing'); if (!g) { H.empty(c2, 'Choose a car. You set the price — the closer you are to what it is really worth, the faster buyers message you.'); return; }
    const v = recValue(g), [lo, hi] = valRange(v, g.id), cur = M.list.find(l => l.gid === g.id); if (!P.mask || P.mask.id !== g.id) P.mask = { id: g.id, v: cur ? cur.ask : r50((lo + hi) / 2) }; const a = P.mask, ratio = a.v / v;
    thumbRow(H, c2, g.type, recColor(g), g.mods, 'Estimated value ' + money(lo) + '–' + money(hi), condWord(g.cond === undefined ? 1 : g.cond) + ' condition' + (isLegitRec(g) ? '' : ' · NO TITLE — private buyers pay a fraction. Get papers at a mechanic or chop shop first'), []);
    const hint = ratio < .85 ? ['🔥', 'Priced to move — expect messages almost right away'] : ratio < 1.05 ? ['👍', 'Fair price — buyers should reach out soon'] : ratio < 1.2 ? ['⏳', 'On the high side — could take a while'] : ratio < 1.4 ? ['🐢', 'Overpriced — expect a long wait'] : ['🚫', 'Way over — almost nobody will bite'];
    H.row(c2, hint[0], 'Asking ' + money(a.v), hint[1], [H.btn('−10%', () => { a.v = r50(a.v * .9); }), H.btn('−$50', () => { a.v = r50(a.v - 50); }), H.btn('+$50', () => { a.v = r50(a.v + 50); }), H.btn('+10%', () => { a.v = r50(a.v * 1.1); })]);
    if (cur) { H.foot.appendChild(H.btn('Update price', () => { cur.ask = a.v; cur.nextT = Math.min(cur.nextT, M.clock + waitFor(a.v / v) * (.5 + Math.random())); toast('Price updated'); }, 'y')); H.foot.appendChild(H.btn('Take it down', () => { M.list = M.list.filter(l => l !== cur); for (const m of M.msgs) if (m.gid === g.id) m.done = 1; P.sel = null; })); }
    else H.foot.appendChild(H.btn('Post listing', () => { M.list.push({ id: 'l' + (M.seq++), gid: g.id, ask: a.v, v, t: M.clock, nextT: M.clock + waitFor(a.v / v) * (isLegitRec(g) ? 1 : 2.5) * (.4 + Math.random() * .8), views: 0 }); Snd.play('pop'); toast('Listed! Buyers will message you here.'); P.sel = null; doSave(true); }, 'y'));
    c2.appendChild(H.mk('div', 'pempty', 'The car stays in your garage until it sells. Bringing it out takes the listing down.'));
  } else {
    const L = M.msgs.filter(m => (now - m.t < 900 || !m.done) && !(M.bwho || []).includes(m.who)).sort((a, b) => (a.done ? 1 : 0) - (b.done ? 1 : 0) || b.t - a.t); if (!L.length) H.empty(top, 'No messages yet.');
    for (const m of L) { const car = m.ctype, nm = (m.pname ? m.pname.split(' — ')[1] || m.pname : car && CAR_TYPES[car] ? CAR_TYPES[car].name : 'Car') + ' · ' + m.who, btns = [];
      if (m.side === 'sell' && m.kind === 'offer' && !m.done) { btns.push(H.btn('Accept ' + money(m.offer), () => sellTo(m), 'y')); const l = M.list.find(x => x.id === m.lid) || (M.plist || []).find(x => x.id === m.lid); if (l && m.offer < l.ask) btns.push(H.btn('Counter ' + money(r50((m.offer + l.ask) / 2)), () => counterBuyer(m, r50((m.offer + l.ask) / 2)))); btns.push(H.btn('✕', () => { m.done = 1; m.text += '  (declined)'; })); }
      if (m.side === 'buy' && m.kind === 'deal' && !m.done) { const l = M.feed.find(x => x.id === m.lid) || (M.pfeed || []).find(x => x.id === m.lid); if (l) btns.push(H.btn('Pay ' + money(m.price), () => buyListing(l, m.price), 'y', !canPay(m.price))); btns.push(H.btn('✕', () => { m.done = 1; })); }
      if (m.kind === 'meet') btns.push(...meetBtns(H, m));
      if (m.who && m.kind !== 'sold') btns.push(H.btn('Block', () => blockWho(m.who, m.side === 'buy' ? m.lid : null), 'r'));
      const r = H.row(top, m.kind === 'mad' ? '🚫' : m.kind === 'sold' ? '✅' : m.kind === 'wait' ? '…' : m.side === 'sell' ? '📩' : '💬', nm, m.kind === 'wait' ? m.text + '  — typing…' : m.text + (m.expired ? '  (expired)' : ''), btns); r.classList.add('pmsg'); if (m.done) r.style.opacity = .55; }
    const c2 = H.col('How it works'); H.empty(c2, 'Selling: list a garage car with an asking price. Buyers message you over time — the further above its real value, the longer you wait. Accept, counter, or ignore offers.\n\nBuying: browse listings, ask the seller questions, and make offers. Lowball too hard and some sellers will block you. Watch for listings that look too good — some cars arrive in far worse shape than advertised.');
  }
}
// ---------- phone: my garage (store / call up cars from anywhere) ----------
function garageCol(H) {
  const L = myCars(), c = H.col('My garage ' + L.length + '/' + garCap()), slots = garSlots(), near = homeNear() || G.scene, k = myNearCar();
  if (k && !k.d.boat) H.row(c, '🅿', (k.driver ? 'This ' : 'Your ') + k.d.name, near ? 'You are close to home — storing is free' : 'Tow it home · $150', [H.btn('Store', () => storeCarAny(k), 'y', garUsed() >= garCap() || (!near && !canPay(150)))]);
  H.row(c, '🏠', 'Space: ' + slots.map(s => s[0] + ' ' + s[1]).join(' · '), 'Bigger properties come with bigger garages', []);
  { const gs = homeGarages(), o = herePos(), g = gs.slice().sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y))[0]; if (g) H.row(c, '🅿', 'Nearest garage pad', 'Drive onto the blue GARAGE pad outside your home to store or take out cars', [H.btn('GPS', () => { setNav({ x: g.x, y: g.y, name: 'Your garage' }); Panel.close(); }, 'y')]); }
  if (!L.length) H.empty(c, 'Nothing stored. Stand next to (or sit in) a car you own and tap Store.');
  L.forEach((r, i) => { const d = CAR_TYPES[r.type]; if (!d) return; const listed = G.save.mkt && G.save.mkt.list.some(l => l.gid === r.id); thumbRow(H, c, r.type, recColor(r), r.mods, d.name + (listed ? ' · for sale' : ''), condWord(r.cond === undefined ? 1 : r.cond) + (isLegitRec(r) ? ' · clean title' : ' · no title'), [H.btn(near ? 'Bring out' : 'Deliver $100', () => { if (G.scene) return toast('Go outside first'); if (!near && !payAny(100)) return; deliverCar(i); }, 'y', !G.scene && !near && !canPay(100))]); });
}

const mktUnread = () => { const M = G.save && G.save.mkt; return M ? M.msgs.reduce((n, m) => n + (m.unread ? 1 : 0), 0) : 0; };
