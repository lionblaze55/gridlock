// ================= ITEMS & INVENTORY =================
const ITEMS = {
  leaf: { n: 'Leaf', v: 30, w: 1, k: 'drug', e: '🌿' }, haze: { n: 'Haze', v: 85, w: 1, k: 'drug', e: '🟣' }, glint: { n: 'Glint', v: 190, w: 1, k: 'drug', e: '🔷' }, ember: { n: 'Ember', v: 380, w: 1, k: 'drug', e: '🔶' },
  snack: { n: 'Snack', v: 3, w: 1, k: 'food', e: '🍫', heal: 10 }, soda: { n: 'Fizzy Cola', v: 5, w: 1, k: 'food', e: '🥤', heal: 15 }, burger: { n: 'Burger', v: 8, w: 1, k: 'food', e: '🍔', heal: 30 }, apple: { n: 'Apple', v: 3, w: 1, k: 'food', e: '🍎', heal: 8 },
  fish: { n: 'Fresh fish', v: 35, w: 2, k: 'food', e: '🐟', heal: 20 }, bigfish: { n: 'Trophy bass', v: 180, w: 4, k: 'loot', e: '🐠' }, moonshine: { n: 'Moonshine', v: 80, w: 2, k: 'food', e: '🍶', heal: 15, drunk: 26 },
  bandage: { n: 'Bandage', v: 20, w: 1, k: 'med', e: '🩹', heal: 25 }, medkit: { n: 'Medkit', v: 60, w: 2, k: 'med', e: '⛑', heal: 75 }, vest: { n: 'Armor vest', v: 300, w: 4, k: 'gear', e: '🦺', armor: 100 },
  repairkit: { n: 'Car repair kit', v: 250, w: 5, k: 'gear', e: '🔧', repair: 1 }, rod: { n: 'Fishing rod', v: 80, w: 2, k: 'gear', e: '🎣' }, toolbox: { n: 'Toolbox', v: 90, w: 4, k: 'loot', e: '🧰' },
  watch: { n: 'Wristwatch', v: 120, w: 1, k: 'loot', e: '⌚' }, goldwatch: { n: 'Gold watch', v: 650, w: 1, k: 'loot', e: '⌚' }, ring: { n: 'Ring', v: 350, w: 1, k: 'loot', e: '💍' }, necklace: { n: 'Pearl necklace', v: 520, w: 1, k: 'loot', e: '📿' },
  phone: { n: 'Phone', v: 90, w: 1, k: 'loot', e: '📱' }, laptop: { n: 'Laptop', v: 400, w: 3, k: 'loot', e: '💻' }, camera: { n: 'Camera', v: 220, w: 2, k: 'loot', e: '📷' }, tv: { n: 'Television', v: 320, w: 8, k: 'loot', e: '📺' },
  stereo: { n: 'Car stereo', v: 160, w: 4, k: 'loot', e: '📻' }, guitar: { n: 'Guitar', v: 260, w: 5, k: 'loot', e: '🎸' }, painting: { n: 'Painting', v: 900, w: 4, k: 'loot', e: '🖼' }, silverware: { n: 'Silverware', v: 150, w: 2, k: 'loot', e: '🍴' },
  console: { n: 'Game console', v: 260, w: 3, k: 'loot', e: '🎮' }, cigars: { n: 'Cigars', v: 70, w: 1, k: 'loot', e: '🚬' }, wine: { n: 'Vintage wine', v: 110, w: 2, k: 'loot', e: '🍷' }, antique: { n: 'Antique vase', v: 700, w: 3, k: 'loot', e: '🏺' },
  goldbar: { n: 'Gold bar', v: 2500, w: 4, k: 'loot', e: '🟨' }, diamond: { n: 'Diamond', v: 1800, w: 1, k: 'loot', e: '💎' }, carparts: { n: 'Car parts', v: 180, w: 5, k: 'loot', e: '⚙' }, copper: { n: 'Scrap copper', v: 45, w: 2, k: 'loot', e: '🔩' },
};
const LOOT = {
  home: ['watch', 'watch', 'ring', 'necklace', 'phone', 'phone', 'silverware', 'silverware', 'cigars', 'wine', 'camera', 'console', 'antique', 'bandage'],
  office: ['phone', 'phone', 'laptop', 'watch', 'cigars', 'camera', 'snack'], trash: ['copper', 'copper', 'copper', 'phone', 'snack', 'bandage', 'soda'],
  crate: ['carparts', 'copper', 'toolbox', 'medkit', 'moonshine', 'stereo', 'vest', 'repairkit'], safe: ['goldwatch', 'diamond', 'necklace', 'ring', 'ring', 'antique', 'painting'],
  lockers: ['bandage', 'medkit', 'toolbox', 'cigars', 'phone'], ped: ['watch', 'phone', 'phone', 'ring', 'cigars', 'snack'], trunk: ['toolbox', 'carparts', 'stereo', 'guitar', 'laptop', 'medkit', 'moonshine', 'repairkit', 'wine', 'copper', 'camera'],
};
const lootPick = k => pick(LOOT[k] || LOOT.trash);
G.inv = {}; G.stash = { items: {}, guns: {} }; G.wmods = {}; G.wown = {}; G.drugs = G.inv;
const HOMECAP = 5000, TRUNKCAP = { compact: 25, sedan: 40, sports: 20, muscle: 35, taxi: 40, cop: 40, van: 120, swat: 120, truck: 220, pickup: 90, tractor: 15, bike: 6 };
const invCap = () => 30 + (G.save && G.save.pack || 0);
const weightOf = o => { let s = 0; for (const k in o) if (ITEMS[k]) s += (o[k] | 0) * ITEMS[k].w; return s; };
const invWeight = () => weightOf(G.inv);
function invAdd(id, n, quiet) { // returns how many fit
  const it = ITEMS[id]; if (!it) return 0; n = n || 1; const room = it.w ? Math.floor((invCap() - invWeight()) / it.w) : 99999; const k = Math.min(n, room);
  if (k <= 0) { if (!quiet) toast('Bag full'); return 0; } G.inv[id] = (G.inv[id] | 0) + k; return k;
}
function invDel(id, n) { G.inv[id] = Math.max(0, (G.inv[id] | 0) - (n || 1)); if (!G.inv[id]) delete G.inv[id]; }
function dropItem(id, n) { const p = G.player, o = G.scene ? G.outPos : p; for (let i = 0; i < n; i++) G.drops.push({ x: o.x + rnd(-22, 22), y: o.y + rnd(-22, 22), t: 'item', id, life: 180, fullT: G.t + 2 }); }
function giveLoot(id, text) { const it = ITEMS[id]; if (invAdd(id, 1, 1)) { Snd.play('pickup'); toast(text || ('Found: ' + it.n + '  (worth ' + money(it.v) + ')')); } else { dropItem(id, 1); toast('Bag full — ' + it.n + ' left on the ground'); } }
function useInv0(id) {
  const it = ITEMS[id], p = G.player; if (!G.inv[id]) return;
  if (it.heal) { if (p.hp >= 100 && !it.drunk) return toast('Already at full health'); heal(it.heal); if (it.drunk) drink(it.drunk * .0028); Snd.play(it.k === 'med' ? 'heal' : 'munch'); invDel(id); toast(it.n + '  +' + it.heal + ' HP'); }
  else if (it.armor) { if (p.armor >= 100) return toast('Armor already full'); p.armor = 100; Snd.play('armor'); invDel(id); toast('Armor vest on'); }
  else if (it.repair) { const c = p.car || nearestCar(50); if (!c) return toast('Stand next to a car to use this'); c.hp = c.st.hp; c.fireT = 0; c.flat = 0; Snd.play('ratchet'); invDel(id); toast(c.d.name + ' repaired'); }
  else toast(it.k === 'drug' ? 'Sell it to a street dealer.' : it.k === 'loot' ? 'Sell it at a pawn shop.' : 'Nothing to do with that here.');
}
function drawItemDrop(d) {
  const bob = Math.sin(G.t * 4 + d.x) * 2; ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(d.x, d.y + 7, 9, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c69c6d'; ctx.fillRect(d.x - 8, d.y - 8 + bob, 16, 14); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 1.5; ctx.strokeRect(d.x - 8, d.y - 8 + bob, 16, 14);
  ctx.font = '11px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(ITEMS[d.id].e, d.x, d.y - 1 + bob);
}
// ================= WEAPON MODS =================
const GUNS = ['pistol', 'uzi', 'shotgun', 'rifle', 'bolt', 'sniper'];
const WSLOTS = {
  muz: { n: 'Muzzle', o: [['None', 0], ['Suppressor — silent, no witnesses', 400, ['pistol', 'uzi', 'rifle', 'bolt', 'sniper']], ['Compensator — tighter spread', 350, ['pistol', 'uzi', 'rifle', 'bolt']], ['Choke — tight pellets, more range', 300, ['shotgun']]] },
  mag: { n: 'Magazine', o: [['Standard', 0], ['Extended mag (+50%)', 300, GUNS], ['Drum mag (+150%, slower reload)', 900, ['uzi', 'rifle', 'shotgun']]] },
  sight: { n: 'Optics', o: [['Iron sights', 0], ['Laser sight — accuracy', 350, GUNS], ['Scope — range', 550, ['pistol', 'rifle', 'shotgun', 'bolt', 'sniper']]] },
  ammo: { n: 'Ammo type', o: [['Standard', 0], ['Hollow point — +30% vs people', 450, ['pistol', 'uzi', 'rifle', 'bolt', 'sniper']], ['Armor piercing — shreds vehicles', 600, ['pistol', 'uzi', 'rifle', 'bolt', 'sniper']], ['Incendiary — sets targets on fire', 950, ['shotgun', 'rifle']]] },
  trig: { n: 'Trigger', o: [['Standard', 0], ['Light trigger (+20% fire rate)', 500, GUNS]] },
  head: { n: 'Warhead', o: [['Standard', 0], ['HEAT — bigger blast', 1200, ['rocket']]] },
  mix: { n: 'Mixture', o: [['Standard', 0], ['Napalm — burns longer and wider', 600, ['molotov']]] },
  skin: { n: 'Finish', o: [['Factory', 0], ['Matte black', 100], ['Chrome', 600], ['Gold', 1500], ['Woodland camo', 250], ['Hot pink', 250], ['Blood red', 250], ['Arctic white', 250]].map(o => o.concat([GUNS.concat(['rocket'])])) },
};
const SKINCOL = ['#22252b', '#0c0c0c', '#d7dde2', '#d4af37', '#4b5d32', '#ff5fa2', '#a01818', '#f1f1f1'];
const emptyAmmo = () => WEAPONS.map((w, i) => i ? 0 : Infinity);
let PWC = {};
function pwCalc(b, m) {
  if (!m) return b; const w = Object.assign({}, b);
  if (m.muz === 1) { w.quiet = 1; w.dmg *= .92; w.sound = b.id === 'bolt' || b.id === 'sniper' ? 'suppb' : 'supp'; } if (m.muz === 2) w.spread *= .7; if (m.muz === 3) { w.spread *= .6; w.range *= 1.15; }
  if (m.mag === 1) w.mag = Math.round(b.mag * 1.5); if (m.mag === 2) { w.mag = Math.round(b.mag * 2.5); w.reload = b.reload * 1.25; }
  if (m.sight === 1) { w.spread *= .6; w.laser = 1; } if (m.sight === 2) { w.range *= 1.35; w.spread *= .8; }
  if (m.ammo === 1) { w.pedMul = 1.3; w.carMul = .7; } if (m.ammo === 2) { w.carMul = 2.2; w.dmg *= 1.05; } if (m.ammo === 3) w.burn = 1;
  if (m.trig === 1) w.rate *= 1.2; if (m.head === 1) w.blast = 1.35; if (m.mix === 1) w.nap = 1;
  return w;
}
function pw(i) { const b = WEAPONS[i], m = G.wmods[b.id]; if (!m) return b; return PWC[i] || (PWC[i] = pwCalc(b, m)); }
const gunColor = i => { const m = G.wmods[WEAPONS[i].id]; return m && m.skin ? SKINCOL[m.skin] : '#151515'; };
function startReload() { const p = G.player, w = pw(p.weapon); if (!w.mag || p.reloadT > 0 || p.clip[p.weapon] >= Math.min(w.mag, p.ammo[p.weapon])) return; p.reloadT = w.reload; p.reloadMax = w.reload; Snd.play('reload', p.x, p.y); }
function updateReload(dt) { const p = G.player; if (!(p.reloadT > 0)) return; p.reloadT -= dt; if (p.reloadT <= 0) { p.reloadT = 0; p.clip[p.weapon] = Math.min(pw(p.weapon).mag || 0, p.ammo[p.weapon]); Snd.play('cock', p.x, p.y); } }
function drawPlayerExtras(p) {
  if (p.dead || p.car) return;
  const w = pw(p.weapon);
  if (w.laser && !G.dlgOpen) { const dx = Math.cos(p.a), dy = Math.sin(p.a); let L = 0; for (; L < w.range; L += 10) if (sceneSolid(Math.floor((p.x + dx * L) / T), Math.floor((p.y + dy * L) / T))) break; ctx.strokeStyle = 'rgba(255,30,30,.55)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(p.x + dx * 18, p.y + dy * 18); ctx.lineTo(p.x + dx * L, p.y + dy * L); ctx.stroke(); ctx.fillStyle = 'rgba(255,60,60,.9)'; ctx.beginPath(); ctx.arc(p.x + dx * L, p.y + dy * L, 2.2, 0, TAU); ctx.fill(); }
  if (p.reloadT > 0) { const k = 1 - p.reloadT / p.reloadMax; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(p.x, p.y, 20, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke(); }
  const f = G.fishing; if (f) { const bob = Math.sin(G.t * 4) * 2; ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo((p.x + f.bx) / 2, (p.y + f.by) / 2 - 30, f.bx, f.by + bob); ctx.stroke(); ctx.fillStyle = '#e53935'; ctx.beginPath(); ctx.arc(f.bx, f.by + bob, 3, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.bx, f.by + bob - 1.5, 1.5, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(f.bx, f.by, 6 + (G.t * 6 % 6), 0, TAU); ctx.stroke(); }
}
function drawGunPreview(cv, id, m) {
  const g = cv.getContext('2d'), w = cv.width, h = cv.height; m = m || {};
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2c313c'); bg.addColorStop(1, '#0f1116'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.04)'; for (let x = 0; x < w; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  const col = SKINCOL[m.skin || 0], dk = shade(col, .6), lt = shade(col, 1.5), grip = m.skin === 3 ? '#5a3a1a' : '#3b2a1c';
  g.save(); g.translate(w / 2, h / 2 + 6); const S = id === 'pistol' ? 3.2 : id === 'uzi' ? 2.7 : 1.95; g.scale(S, S);
  const R = (x, y, ww, hh, c) => { g.fillStyle = c; g.fillRect(x, y, ww, hh); };
  let bx = 0, top = -8, under = 0; // barrel tip x, top y, under-barrel y
  if (id === 'pistol') { R(-22, -8, 44, 9, col); R(-22, -8, 44, 2, lt); R(-20, 1, 12, 20, grip); R(-6, 1, 8, 3, dk); bx = 22; under = 1; if (m.mag) R(-19, 21, 10, m.mag === 1 ? 8 : 12, '#111'); }
  else if (id === 'uzi') { R(-26, -8, 44, 11, col); R(-26, -8, 44, 2, lt); R(18, -5, 12, 4, dk); R(-8, 3, 10, 20, grip); R(-30, -6, 5, 3, dk); bx = 30; under = -1; top = -8; if (m.mag === 2) { g.fillStyle = '#111'; g.beginPath(); g.arc(-3, 26, 8, 0, TAU); g.fill(); } else R(-6, 23, 7, m.mag ? 16 : 8, '#111'); }
  else if (id === 'shotgun') { R(-50, -6, 34, 9, grip); R(-18, -7, 70, 7, col); R(-18, -7, 70, 2, lt); R(4, 1, 26, 5, grip); R(-12, 0, 6, 10, dk); bx = 52; under = 6; top = -7; if (m.mag === 2) { g.fillStyle = '#111'; g.beginPath(); g.arc(-2, 9, 8, 0, TAU); g.fill(); } else if (m.mag) R(-18, 1, 20, 4, '#111'); }
  else if (id === 'rifle') { R(-52, -5, 26, 8, grip); R(-28, -8, 50, 10, col); R(-28, -8, 50, 2, lt); R(22, -5, 26, 4, dk); R(22, -1, 18, 4, grip); R(-18, 2, 8, 14, grip); bx = 48; under = 3; if (m.mag === 2) { g.fillStyle = '#111'; g.beginPath(); g.arc(2, 12, 9, 0, TAU); g.fill(); } else { g.fillStyle = '#111'; g.beginPath(); g.moveTo(-4, 2); g.lineTo(5, 2); g.lineTo(9, m.mag ? 26 : 16); g.lineTo(0, m.mag ? 26 : 16); g.fill(); } }
  else if (id === 'bolt') { R(-62, -5, 30, 9, grip); R(-34, -6, 36, 8, grip); R(-30, -8, 30, 5, col); R(-30, -8, 30, 1.5, lt); R(0, -6, 52, 3.5, dk); R(-14, -3, 3, 7, '#888'); R(-14, 4, 7, 3, '#888'); R(-20, 2, 6, 10, grip); bx = 52; under = 2; top = -6; }
  else if (id === 'sniper') { R(-64, -6, 30, 10, grip); R(-68, -4, 6, 14, '#111'); R(-34, -7, 40, 9, col); R(-34, -7, 40, 2, lt); R(6, -6, 58, 4, dk); R(52, -7, 8, 6, '#333'); R(-24, 2, 7, 11, grip); R(-12, -3, 3, 7, '#888'); R(-12, 4, 7, 3, '#888'); R(-26, -16, 30, 7, '#111'); R(-28, -17, 5, 9, '#222'); R(2, -17, 5, 9, '#222'); g.fillStyle = '#4fc3f7'; g.fillRect(5.5, -15.5, 1.2, 6); R(20, 3, 2, 12, '#333'); R(30, 3, 2, 12, '#333'); bx = 60; under = 2; top = -6; }
  else if (id === 'knife') { g.fillStyle = '#cfd8dc'; g.beginPath(); g.moveTo(-6, -7); g.lineTo(46, -5); g.lineTo(36, 3); g.lineTo(-6, 3); g.fill(); g.fillStyle = '#90a4ae'; g.fillRect(-6, -2, 44, 1.5); R(-10, -11, 5, 18, '#333'); R(-44, -6, 34, 10, col === '#22252b' ? '#3e2723' : col); for (let i = 0; i < 4; i++) R(-40 + i * 8, -6, 2, 10, 'rgba(0,0,0,.35)'); bx = 46; under = 3; top = -6; }
  else if (id === 'rocket') { R(-50, -8, 100, 12, col === '#22252b' ? '#4a5a3a' : col); R(-50, -8, 100, 3, 'rgba(255,255,255,.15)'); R(-10, 4, 8, 14, '#222'); R(-56, -10, 8, 16, '#333'); g.fillStyle = m.head ? '#ff7043' : '#c0392b'; g.beginPath(); g.moveTo(50, -9); g.lineTo(m.head ? 70 : 62, -2); g.lineTo(50, 5); g.fill(); bx = 50; }
  else if (id === 'molotov') { R(-7, -6, 14, 26, m.mix ? '#b35c00' : '#7fb069'); R(-3, -16, 6, 10, '#7fb069'); g.fillStyle = '#ff8c1a'; g.beginPath(); g.moveTo(0, -34); g.lineTo(7, -18); g.lineTo(-7, -18); g.fill(); g.fillStyle = '#ffe082'; g.beginPath(); g.moveTo(0, -27); g.lineTo(3, -18); g.lineTo(-3, -18); g.fill(); }
  if (m.muz === 1) { R(bx, top + (id === 'shotgun' ? 0 : 3) - 1, 22, 6, '#1a1a1a'); R(bx, top + (id === 'shotgun' ? 0 : 3) - 1, 22, 1.5, '#444'); }
  if (m.muz === 2) { R(bx, top + 2, 7, 6, '#555'); R(bx + 2, top + 2, 1, 6, '#111'); R(bx + 4, top + 2, 1, 6, '#111'); }
  if (m.muz === 3) R(bx, top - 1, 8, 9, '#666');
  if (m.sight === 1) { R(bx - 16, under + 1, 10, 4, '#222'); g.strokeStyle = 'rgba(255,40,40,.8)'; g.lineWidth = .6; g.beginPath(); g.moveTo(bx - 6, under + 3); g.lineTo(bx + 60, under + 3); g.stroke(); }
  if (m.sight === 2) { R(-12, top - 7, 26, 6, '#1a1a1a'); R(-14, top - 8, 4, 8, '#333'); R(12, top - 8, 4, 8, '#333'); g.fillStyle = '#4fc3f7'; g.fillRect(14.5, top - 6.5, 1.2, 5); R(-6, top - 1, 3, 2, '#333'); R(6, top - 1, 3, 2, '#333'); }
  if (m.skin === 4) { g.fillStyle = 'rgba(30,40,20,.6)'; for (let i = 0; i < 7; i++) g.fillRect(-26 + i * 9, -7 + (i % 3) * 2, 5, 3); }
  g.restore();
}
function gunStats(id, m) { const i = WI[id], b = WEAPONS[i], w = pwCalc(b, m === undefined ? G.wmods[id] : m); return [['Damage', (w.dmg || (w.proj === 'rocket' ? 100 * (w.blast || 1) : 60)) * (w.pellets || 1) * (w.pedMul || 1) / 110], ['Fire rate', w.rate / 13], ['Accuracy', 1 - (w.spread || 0) * 3.5], ['Range', (w.range || 400) / 1000], ['Magazine', (w.mag || 1) / 75]]; }

// ================= PANEL UI (inventory, storage, pawn, gun bench) =================
const pEl = () => document.getElementById('panel');
const Panel = {
  mode: null, opt: null, tab: null,
  open(mode, opt) { this.mode = mode; this.opt = opt || {}; this.tab = this.opt.tab || null; this.pv = null; this.sel = this.opt.sel || null; G.invOpen = true; G.dlgOpen = true; if (G.talkPed) { G.talkPed.talking = 0; G.talkPed = null; } dlgEl.classList.remove('show'); pEl().classList.add('show'); Snd.play('pop'); this.render(); },
  close() { pEl().classList.remove('show'); G.invOpen = false; G.dlgOpen = false; this.mode = null; if (G.inGame) doSave(true); },
  render() {
    if (!this.mode) return; const el = pEl(), p = G.player;
    const body = el.querySelector('.pbody'), tabs = el.querySelector('.ptabs'), foot = el.querySelector('.pfoot'); body.innerHTML = ''; tabs.innerHTML = ''; foot.innerHTML = '';
    el.querySelector('.pcash').textContent = money(G.cash);
    const mk = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };
    const btn = (text, fn, cls, dis) => { const b = mk('button', 'pb ' + (cls || ''), text); if (dis) b.disabled = true; b.onclick = e => { e.stopPropagation(); fn(); this.render(); }; return b; };
    const col = title => { const c = mk('div', 'pcol'); c.appendChild(mk('div', 'ptitle', title)); body.appendChild(c); return c; };
    const row = (c, e, name, sub, btns) => { const r = mk('div', 'prow'); r.appendChild(mk('span', 'pe', e)); const t = mk('div', 'pt'); t.appendChild(mk('b', '', name)); if (sub) t.appendChild(mk('small', '', sub)); r.appendChild(t); const bb = mk('div', 'pbs'); (btns || []).forEach(b => bb.appendChild(b)); r.appendChild(bb); c.appendChild(r); return r; };
    const empty = (c, t) => c.appendChild(mk('div', 'pempty', t));
    const order = ['gear', 'med', 'food', 'pantry', 'farm', 'meat', 'seed', 'loot', 'drug'], ids = o => Object.keys(o).filter(k => ITEMS[k] && o[k] > 0).sort((a, b) => order.indexOf(ITEMS[a].k) - order.indexOf(ITEMS[b].k) || ITEMS[b].v - ITEMS[a].v);
    const tabBtn = (id, n) => { const b = mk('button', id === this.tab ? 'on' : '', n); b.onclick = () => { Snd.play('ui'); this.tab = id; this.render(); }; tabs.appendChild(b); };
    const title = el.querySelector('.pname');
    const H = { mk, btn, col, row, empty, tabBtn, title, body, foot, el, p, ids };
    if (PMODES[this.mode] && PMODES[this.mode].call(this, H) !== false) return;
    if (this.mode === 'inv') {
      title.textContent = 'Backpack';
      const c = col(`Carrying ${invWeight()} / ${invCap()}`); const L = ids(G.inv);
      if (!L.length) empty(c, 'Empty. Search trash cans, desks, crates, car trunks and hay bales — or go fishing.');
      for (const id of L) { const it = ITEMS[id]; row(c, it.e, `${it.n} ×${G.inv[id]}`, itemInfo(id), [(it.heal || it.armor || it.repair || DFX[id]) ? btn(DFX[id] ? 'Take' : 'Use', () => useInv(id), DFX[id] ? '' : 'y') : null, btn('Drop', () => { invDel(id, 1); dropItem(id, 1); Snd.play('thud'); })].filter(Boolean)); }
      const c2 = col('Weapons'); let any = 0;
      for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) { any = 1; const w = pw(i), m = G.wmods[WEAPONS[i].id] || {}, mods = Object.keys(WSLOTS).filter(s => m[s]).map(s => WSLOTS[s].o[m[s]][0].split(' —')[0].split(' (')[0]); row(c2, '', WEAPONS[i].name, `${p.ammo[i]} rounds${w.mag ? ' · mag ' + w.mag : ''}${mods.length ? ' · ' + mods.join(', ') : ''}`, [btn('Equip', () => { p.weapon = i; p.reloadT = 0; Snd.play('cock'); }, i === p.weapon ? 'on' : '')]).querySelector('.pe').appendChild(this.icon(WEAPONS[i].id, i)); }
      if (!any) empty(c2, 'Unarmed. Gun shops sell and customize weapons.');
      c2.appendChild(mk('div', 'ptitle', 'Gang standing'));
      for (const g in GANGS) { const r = G.rep[g] | 0; row(c2, '●', GANGS[g].name, r <= -30 ? 'Hostile — attack on sight' : r >= 30 ? 'Friendly — discounts' : 'Neutral', []).querySelector('.pe').style.color = GANGS[g].col; }
    } else if (this.mode === 'store') {
      const home = this.opt.kind === 'home', car = this.opt.car, S = home ? G.stash.items : car.trunk, cap = home ? HOMECAP : (TRUNKCAP[car.type] || 30);
      title.textContent = home ? 'Home stash' : car.d.name + ' trunk';
      const c = col(`Backpack ${invWeight()} / ${invCap()}`), c2 = col(`${home ? 'Stash' : 'Trunk'} ${weightOf(S)} / ${cap}`);
      const move = (from, to, id, n, capTo, wTo) => { const it = ITEMS[id]; const room = it.w ? Math.floor((capTo - wTo()) / it.w) : 99999, k = Math.min(n, from[id] | 0, room); if (k <= 0) { Snd.play('bad'); toast('No room'); return; } from[id] -= k; if (!from[id]) delete from[id]; to[id] = (to[id] | 0) + k; Snd.play('rustle'); };
      const L = ids(G.inv); if (!L.length) empty(c, 'Nothing to store.');
      for (const id of L) { const it = ITEMS[id]; row(c, it.e, `${it.n} ×${G.inv[id]}`, money(it.v) + ' · w' + it.w, [btn('→', () => move(G.inv, S, id, 1, cap, () => weightOf(S))), btn('All →', () => move(G.inv, S, id, 9999, cap, () => weightOf(S)), 'y')]); }
      const L2 = ids(S); if (!L2.length) empty(c2, home ? 'Your stash holds up to ' + HOMECAP + ' units and is safe forever.' : 'Empty trunk.');
      for (const id of L2) { const it = ITEMS[id]; row(c2, it.e, `${it.n} ×${S[id]}`, money(it.v) + ' · w' + it.w, [btn('←', () => move(S, G.inv, id, 1, invCap(), invWeight)), btn('← All', () => move(S, G.inv, id, 9999, invCap(), invWeight), 'y')]); }
      if (home) {
        c.appendChild(mk('div', 'ptitle', 'Your weapons'));
        for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) row(c, '', WEAPONS[i].name, p.ammo[i] + ' rounds', [btn('Store →', () => { const id = WEAPONS[i].id; G.stash.guns[id] = (G.stash.guns[id] | 0) + p.ammo[i]; p.ammo[i] = 0; p.clip[i] = 0; if (p.weapon === i) p.weapon = bestWeapon(); Snd.play('cock'); })]).querySelector('.pe').appendChild(this.icon(WEAPONS[i].id, i));
        c2.appendChild(mk('div', 'ptitle', 'Gun locker'));
        for (const id in G.stash.guns) if (G.stash.guns[id] > 0) row(c2, '', WEAPONS[WI[id]].name, G.stash.guns[id] + ' rounds', [btn('← Take', () => { giveWeapon(id, G.stash.guns[id]); delete G.stash.guns[id]; Snd.play('cock'); }, 'y')]).querySelector('.pe').appendChild(this.icon(id, WI[id]));
        const cd = 300 - (G.t - (G.stashT || -999));
        foot.appendChild(btn(cd > 0 ? `Free armor & pistol ammo (${Math.ceil(cd)}s)` : 'Grab free armor & pistol ammo', () => { G.stashT = G.t; p.armor = 100; giveWeapon('pistol', 20); Snd.play('armor'); }, 'y', cd > 0));
      }
    } else if (this.mode === 'pawn') {
      title.textContent = this.opt.name || 'Pawn shop'; this.tab = this.tab || 'sell'; tabBtn('sell', 'Sell'); tabBtn('buy', 'Buy');
      const lootIds = Object.keys(ITEMS).filter(k => ITEMS[k].k === 'loot'), hot = lootIds[Math.floor(hash01('pawn' + G.day + (this.opt.name || '')) * lootIds.length) % lootIds.length];
      if (this.tab === 'sell') {
        const c = col(`Your goods · today's hot item: ${ITEMS[hot].n} (+50%)`); const L = ids(G.inv).filter(id => ITEMS[id].k !== 'drug');
        if (!L.length) empty(c, '"Got nothing to sell? Go find something. I don\'t ask where it came from."');
        for (const id of L) { const it = ITEMS[id], pr = Math.max(1, Math.round(it.v * (it.k === 'loot' ? .7 : .4) * (id === hot ? 1.5 : 1))); row(c, it.e, `${it.n} ×${G.inv[id]}`, 'offer ' + money(pr) + ' each', [btn('Sell', () => { invDel(id, 1); addCash(pr); }), btn('Sell all', () => { const n = G.inv[id]; invDel(id, n); addCash(pr * n); }, 'y')]); }
        const c2 = col('Your weapons');
        for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) { const pr = Math.round(WEAPONS[i].price * .3 / 10) * 10; row(c2, '', WEAPONS[i].name, p.ammo[i] + ' rounds · offer ' + money(pr), [btn('Sell', () => { p.ammo[i] = 0; p.clip[i] = 0; if (p.weapon === i) p.weapon = bestWeapon(); addCash(pr); })]).querySelector('.pe').appendChild(this.icon(WEAPONS[i].id, i)); }
      } else {
        const c = col('For sale'), pack = G.save.pack || 0;
        const sell = (e, n, sub, price, fn, dis) => row(c, e, n, sub + ' · ' + money(price), [btn('Buy', () => { if (payCash(price)) fn(); }, 'y', dis || G.cash < price)]);
        if (pack < 30) sell('🎒', 'Backpack', 'carry 60 instead of 30', 400, () => { G.save.pack = 30; });
        else if (pack < 70) sell('🧳', 'Duffel bag', 'carry 100', 1200, () => { G.save.pack = 70; });
        const it2 = (id, price) => sell(ITEMS[id].e, ITEMS[id].n, id === 'rod' ? 'fish at lake piers' : id === 'repairkit' ? 'fully fixes a car' : ITEMS[id].heal ? '+' + ITEMS[id].heal + ' HP' : 'full armor', price, () => { if (!invAdd(id, 1)) G.cash += price; });
        it2('rod', 80); it2('medkit', 70); it2('bandage', 25); it2('repairkit', 300); it2('vest', 350);
        const c2 = col('Used guns');
        for (const [id, am, price] of [['pistol', 24, 150], ['uzi', 60, 450], ['shotgun', 12, 700], ['rifle', 45, 1700]]) row(c2, '', 'Used ' + WEAPONS[WI[id]].name, am + ' rounds · ' + money(price), [btn('Buy', () => { if (payCash(price)) { giveWeapon(id, am); Snd.play('cock'); } }, 'y', G.cash < price)]).querySelector('.pe').appendChild(this.icon(id, WI[id]));
      }
    } else if (this.mode === 'guns') {
      title.textContent = 'Weapon workbench';
      const owned = []; for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) owned.push(WEAPONS[i].id);
      if (!owned.length) { empty(col('No weapons'), 'Buy a gun first, then come back to customize it.'); return; }
      if (!owned.includes(this.tab)) this.tab = owned.includes(WEAPONS[p.weapon].id) ? WEAPONS[p.weapon].id : owned[0];
      for (const id of owned) tabBtn(id, WEAPONS[WI[id]].name);
      const id = this.tab, m = G.wmods[id] || {};
      const c = col(WEAPONS[WI[id]].name); const cv2 = mk('canvas', 'pgun'); cv2.width = 360; cv2.height = 150; c.appendChild(cv2); drawGunPreview(cv2, id, m);
      for (const [n, v] of gunStats(id)) { const r = mk('div', 'gbar'); r.appendChild(mk('span', '', n)); const i2 = mk('i'), b = mk('b'); b.style.width = Math.round(clamp(v, .03, 1) * 100) + '%'; i2.appendChild(b); r.appendChild(i2); c.appendChild(r); }
      const c2 = col('Attachments');
      for (const s in WSLOTS) { const opts = WSLOTS[s].o.map((o, i) => [o, i]).filter(([o, i]) => i === 0 || o[2].includes(id)); if (opts.length < 2) continue; c2.appendChild(mk('div', 'ptitle', WSLOTS[s].n));
        for (const [o, i] of opts) { const on = (m[s] | 0) === i, own = i === 0 || G.wown[id + s + i]; const b = mk('button', 'gopt' + (on ? ' on' : '')); b.appendChild(mk('span', '', (on ? '✓ ' : '') + o[0])); b.appendChild(mk('small', '', on ? 'Fitted' : own ? 'Owned' : money(o[1]))); if (!own && o[1] > (G.cash + G.bank)) b.disabled = true;
          b.onclick = () => { if (!own) { if (!payAny(o[1])) return; G.wown[id + s + i] = 1; Snd.play('cash'); } Snd.play(s === 'skin' ? 'spray' : 'ratchet'); G.wmods[id] = Object.assign({}, G.wmods[id], { [s]: i }); PWC = {}; const wi = WI[id]; p.clip[wi] = Math.min(p.clip[wi], pw(wi).mag || 0); this.render(); }; c2.appendChild(b); } }
    }
  },
  icon(id, i) { const c = document.createElement('canvas'); c.width = 44; c.height = 30; const g = c.getContext('2d'); drawWeaponIcon(g, id, 22, 15, 1.4, i && G.wmods[id] && G.wmods[id].skin ? shade(SKINCOL[G.wmods[id].skin], 1.3) : '#f2c230'); return c; },
};
function openInv() { if (G.mode !== 'play' || G.player.dead || G.dlgOpen) return; Panel.open('inv'); }
function openStorage(kind, car) {
  if (kind === 'trunk') { if (!(TRUNKCAP[car.type] > 0)) return toast('No storage on this one'); if (!car.trunk) { car.trunk = {}; if (!car.isRide && !car.trunkInit) { car.trunkInit = 1; if (car.type === 'cop' || car.type === 'swat') { car.trunk.vest = 1; car.trunk.medkit = 1; } else { const n = Math.random() < .45 ? 0 : rint(1, 2); for (let i = 0; i < n; i++) { const id = lootPick('trunk'); car.trunk[id] = (car.trunk[id] | 0) + 1; } } } } Snd.play('cardoor', car.x, car.y); if (car.type === 'cop') crime(.4, 'Breaking into a police car'); }
  Panel.open('store', { kind, car });
}
function loadInv() { const sv = G.save; G.inv = sv.inv || {}; G.drugs = G.inv; G.stash = sv.stash || { items: {}, guns: {} }; G.wmods = sv.wmods || {}; G.wown = sv.wown || {}; G.rep = Object.assign({ kings: 0, vipers: 0, saints: 0, syndicate: 0, reapers: 0, hounds: 0, vultures: 0 }, sv.rep || {}); PWC = {}; G.fishing = null; }
function repAdd(g, n) { const b = G.rep[g] | 0; G.rep[g] = clamp(b + n, -100, 100); if (b > -30 && G.rep[g] <= -30) msg(`The ${GANGS[g].name} now want you dead.`, '#ff6b6b'); if (b < 30 && G.rep[g] >= 30) msg(`The ${GANGS[g].name} consider you a friend.`, '#2ecc71'); }
