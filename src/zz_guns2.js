// ================= GUNS II: more guns, real attachments (optic + laser + barrel + grip + stock), wear, misfires, repairs, a used-gun bin and selling guns back =================
// ---------- new guns (appended so old saves keep their indices) ----------
{ const P = id => WEAPONS[WI[id]], add = (o, base, k) => { o.price = Math.round(P(base).price * k[0] / 10) * 10; o.ammoPrice = Math.round(P(base).ammoPrice * k[1] / 10) * 10; WEAPONS.push(o); WI[o.id] = WEAPONS.length - 1; };
  add({ id: 'revolver', name: '.357 Revolver', mag: 6, reload: 1.6, rate: 2.2, dmg: 40, spread: .022, range: 680, ammo0: 30, sound: 'pistol' }, 'pistol', [1.6, 1.4]);
  add({ id: 'hcannon', name: 'Hand Cannon .50', mag: 7, reload: 1.4, rate: 1.6, dmg: 60, spread: .032, range: 700, ammo0: 28, sound: 'shotgun' }, 'pistol', [3.2, 2]);
  add({ id: 'pdw', name: 'PDW', mag: 40, reload: 1.4, rate: 13, dmg: 12, spread: .065, range: 600, ammo0: 160, sound: 'uzi' }, 'uzi', [1.7, 1.2]);
  add({ id: 'sawnoff', name: 'Sawn-Off Shotgun', mag: 2, reload: 1.3, rate: 2.6, dmg: 15, pellets: 8, spread: .34, range: 250, ammo0: 20, sound: 'shotgun' }, 'shotgun', [.55, .8]);
  add({ id: 'autoshot', name: 'Combat Shotgun', mag: 8, reload: 2, rate: 2.6, dmg: 13, pellets: 7, spread: .26, range: 380, ammo0: 32, sound: 'shotgun' }, 'shotgun', [2.6, 1.3]);
  add({ id: 'carbine', name: 'Carbine', mag: 30, reload: 1.4, rate: 6.5, dmg: 21, spread: .034, range: 780, ammo0: 90, sound: 'rifle' }, 'rifle', [1.15, 1]);
  add({ id: 'lmg', name: 'Light Machine Gun', mag: 100, reload: 3.4, rate: 10, dmg: 20, spread: .085, range: 760, ammo0: 200, sound: 'rifle' }, 'rifle', [2.6, 1.8]);
  add({ id: 'dmr', name: 'Marksman Rifle', mag: 10, reload: 2, rate: 2.2, dmg: 62, spread: .008, range: 1200, ammo0: 30, sound: 'bolt' }, 'bolt', [2, 1.5]); }
const GLOOK = { revolver: 'pistol', hcannon: 'pistol', pdw: 'uzi', sawnoff: 'shotgun', autoshot: 'shotgun', carbine: 'rifle', lmg: 'rifle', dmr: 'bolt' };
const NEWG = Object.keys(GLOOK); GUNS.push(...NEWG);
for (const s in WSLOTS) for (const o of WSLOTS[s].o) if (o[2]) for (const id of NEWG) if (o[2].includes(GLOOK[id]) && !o[2].includes(id)) o[2].push(id);
Object.assign(WDESC, { revolver: 'Six heavy rounds and a slow reload. Hits much harder than a pistol.', hcannon: 'A .50-calibre handgun. Kicks like a mule, drops people in two hits.', pdw: 'A compact SMG with a 40-round mag. Fast, controllable and accurate for its size.', sawnoff: 'Two barrels, cut short. A wall of pellets at arm\'s length — nothing beyond.', autoshot: 'A semi-auto shotgun with 8 shells. Clears a room in a second.', carbine: 'A short, light rifle. More accurate than the assault rifle, slightly slower.', lmg: 'A 100-round belt-fed machine gun. Heavy, inaccurate on the move, unstoppable.', dmr: 'A semi-auto marksman rifle. Sniper accuracy with ten rounds before reloading.' });
Object.assign(WEAPON_DESC, WDESC);
{ const _dw = drawWeaponIcon; drawWeaponIcon = function (g, id, ...a) { return _dw(g, GLOOK[id] || id, ...a); }; }
{ const _ic = Panel.icon; Panel.icon = function (id, i) { return _ic.call(this, GLOOK[id] || id, i); }; }
{ const _dp = drawGunPreview; drawGunPreview = function (cv, id, m) { m = m || {}; _dp(cv, GLOOK[id] || id, Object.assign({}, m, { sight: 0 })); gunOverlay(cv, id, m); }; }
{ const _ga = drawGunArt; drawGunArt = function (g, id, body) { _ga(g, GLOOK[id] || id, body); if (id === 'revolver' || id === 'hcannon') { g.fillStyle = '#4a505a'; g.beginPath(); g.arc(52, 34, 9, 0, TAU); g.fill(); g.fillStyle = '#2a2e35'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(52 + Math.cos(i) * 5, 34 + Math.sin(i) * 5, 1.6, 0, TAU); g.fill(); } } if (id === 'lmg') { g.fillStyle = '#3a3f46'; g.fillRect(56, 46, 22, 18); g.fillStyle = '#86909c'; g.fillRect(96, 44, 3, 18); g.fillRect(104, 44, 3, 18); } if (id === 'sawnoff') { g.clearRect(100, 20, 32, 40); } if (id === 'dmr') { g.fillStyle = '#363b43'; g.fillRect(70, 44, 10, 14); } }; }

// ---------- attachments: separate optic and laser, plus barrel, grip and stock ----------
const LONGG = ['rifle', 'carbine', 'lmg', 'bolt', 'sniper', 'dmr', 'shotgun', 'autoshot'], AUTOG = ['uzi', 'pdw', 'rifle', 'carbine', 'lmg'];
WSLOTS.sight = { n: 'Optic', o: [['Iron sights', 0], ['Red dot — quick and accurate', 300, GUNS.slice()], ['Holographic — tighter still', 450, GUNS.slice()], ['4× scope — range and precision', 650, ['pistol', 'revolver', 'hcannon', 'rifle', 'carbine', 'lmg', 'bolt', 'dmr', 'shotgun', 'autoshot']], ['8× scope — long range', 1100, ['rifle', 'carbine', 'bolt', 'sniper', 'dmr']]] };
WSLOTS.laser = { n: 'Laser / light', o: [['None', 0], ['Red laser — hip-fire accuracy', 300, GUNS.slice()], ['Green laser — brighter, tighter', 550, GUNS.slice()], ['Laser + flashlight', 700, GUNS.slice()]] };
WSLOTS.barrel = { n: 'Barrel', o: [['Standard', 0], ['Match barrel — tighter groups', 500, GUNS.slice()], ['Long barrel — more range', 450, LONGG.concat(['pistol', 'revolver', 'hcannon'])], ['Short barrel — quicker handling', 300, GUNS.slice()]] };
WSLOTS.grip = { n: 'Grip', o: [['None', 0], ['Vertical foregrip — less spread on full-auto', 250, AUTOG.concat(['autoshot'])], ['Bipod — rock steady', 350, ['lmg', 'dmr', 'sniper', 'bolt', 'rifle']]] };
WSLOTS.stock = { n: 'Stock', o: [['Standard', 0], ['Adjustable stock — less recoil', 300, LONGG.concat(['uzi', 'pdw'])], ['Stockless — lighter, wilder', 120, ['uzi', 'pdw', 'shotgun', 'sawnoff', 'autoshot']]] };
{ const skin = WSLOTS.skin; delete WSLOTS.skin; WSLOTS.skin = skin; for (const o of skin.o) if (o[2]) for (const id of NEWG) if (!o[2].includes(id)) o[2].push(id); }
for (const s of ['laser', 'barrel', 'grip', 'stock']) if (!GSLOTS.includes(s)) GSLOTS.splice(GSLOTS.length, 0, s);
Object.assign(ADESC, { sight: ['Plain iron sights.', 'A red dot on glass. 20% tighter groups.', 'A wide holographic window. 25% tighter groups.', '4× magnification: 30% more range and 40% tighter at distance.', '8× magnification: 60% more range and pin-point accuracy. Rifles only.'],
  laser: ['No laser.', 'A red beam shows exactly where you\'re aiming. 20% tighter.', 'A brighter green beam you can see in daylight. 28% tighter.', 'Red laser plus a torch that lights your way at night.'],
  barrel: ['Factory barrel.', 'A precision barrel. 25% tighter groups.', 'Longer barrel: 20% more range, slightly tighter.', 'Cut down: faster handling, 12% wider spread.'],
  grip: ['No grip.', 'Tames full-auto: 15% tighter.', 'Fold-out legs: 25% tighter groups.'], stock: ['Factory stock.', 'Soaks up recoil: 12% tighter.', 'Pulled off: 15% wider spread, a touch faster.'] });
// one-time move of old saves: the old "sight" slot held the laser (1) or the scope (2)
function gunsMigrate() { const S = G.save; if (!S || S.gunV2) return; S.gunV2 = 1; for (const id in G.wmods) { const m = G.wmods[id]; if (!m) continue; if (m.sight === 1) { m.sight = 0; m.laser = 1; if (G.wown[id + 'sight1']) G.wown[id + 'laser1'] = 1; } else if (m.sight === 2) { m.sight = 3; if (G.wown[id + 'sight2']) G.wown[id + 'sight3'] = 1; } }
  const P = GPARTS(); if (P['sight:1']) { P['laser:1'] = (P['laser:1'] | 0) + P['sight:1']; delete P['sight:1']; } if (P['sight:2']) { P['sight:3'] = (P['sight:3'] | 0) + P['sight:2']; delete P['sight:2']; } PWC = {}; }

// ---------- components & condition ----------
const GCOMP = [['frame', 'Frame / receiver', .3], ['barrel', 'Barrel', .25], ['action', 'Trigger & action', .25], ['mag', 'Magazine & feed', .1]];
const WCOND = () => G.save.wc || (G.save.wc = {});
function gcond(id) { const W = WCOND(); return W[id] || (W[id] = { frame: 1, barrel: 1, action: 1, mag: 1 }); }
const gcAvg = id => { const c = gcond(id); return GCOMP.reduce((s, [k, , w]) => s + (c[k] ?? 1) * w, 0) / .9; };
const isGunW = w => w && !w.melee && !w.proj;
function misfireChance(id) { const c = gcond(id); return clamp(.32 * Math.pow(1 - (c.action ?? 1), 2.2) + .12 * Math.pow(1 - (c.mag ?? 1), 3) + .05 * Math.pow(1 - (c.frame ?? 1), 3), 0, .6); }
const optName = (s, v) => WSLOTS[s].o[v][0].split(' —')[0];
function gunValue(id, m, c) { const b = WEAPONS[WI[id]]; m = m || G.wmods[id] || {}; c = c || gcond(id); const avg = GCOMP.reduce((s, [k, , w]) => s + (c[k] ?? 1) * w, 0) / .9; let v = b.price * (.3 + .7 * avg);
  for (const s in m) if (m[s] && WSLOTS[s] && WSLOTS[s].o[m[s]]) v += WSLOTS[s].o[m[s]][1] * .5 * (c[s] ?? 1); return Math.round(v / 10) * 10; }
// stats: attachments + condition
{ const _pc = pwCalc; pwCalc = function (b, m) { const w = _pc(b, m ? Object.assign({}, m, { sight: 0 }) : m); if (!isGunW(b) || !m && !(G.save && G.save.wc && G.save.wc[b.id])) return w; m = m || {}; const c = (G.save && G.save.wc && G.save.wc[b.id]) || {}, q = k => c[k] ?? 1, sp = (f) => { if (w.spread) w.spread *= f; };
  const os = q('sight'), ol = q('laser');
  if (m.sight === 1) sp(1 - .2 * os); if (m.sight === 2) sp(1 - .25 * os); if (m.sight === 3) { sp(1 - .4 * os); w.range *= 1 + .3 * os; w.scope = 1; } if (m.sight === 4) { sp(1 - .55 * os); w.range *= 1 + .6 * os; w.scope = 2; }
  if (m.laser) { w.laserK = m.laser; sp(1 - (m.laser === 2 ? .28 : .2) * ol); }
  if (m.barrel === 1) sp(.75); if (m.barrel === 2) { w.range *= 1.2; sp(.92); } if (m.barrel === 3) { sp(1.12); w.rate *= 1.05; }
  if (m.grip === 1) sp(.85); if (m.grip === 2) sp(.75); if (m.stock === 1) sp(.88); if (m.stock === 2) { sp(1.15); w.rate *= 1.04; }
  // a worn barrel throws rounds wide and short; a dirty action slows cycling
  sp(1 + (1 - q('barrel')) * 1.8); w.range *= .75 + .25 * q('barrel'); w.rate *= .85 + .15 * q('action'); w.cond = gcAvg(b.id); w.misfire = misfireChance(b.id); return w; }; }
let GWB = {}; // last 1% bucket per gun, to know when the cached stats are stale
function wearShot(id, k) { const c = gcond(id), m = G.wmods[id] || {}; c.barrel = Math.max(0, (c.barrel ?? 1) - .0005 * k); c.action = Math.max(0, (c.action ?? 1) - .0004 * k); c.mag = Math.max(0, (c.mag ?? 1) - .0002 * k); c.frame = Math.max(0, (c.frame ?? 1) - .0001 * k);
  if (m.sight) c.sight = Math.max(0, (c.sight ?? 1) - .00025 * k); if (m.laser) c.laser = Math.max(0, (c.laser ?? 1) - .0002 * k);
  const bk = Math.floor(gcAvg(id) * 100) + '|' + Math.floor((c.barrel) * 50); if (GWB[id] !== bk) { GWB[id] = bk; PWC = {}; } }
// firing: misfires, cleaning lockout, wear
{ const _pf = playerFire0; playerFire0 = function (aimA, charge) { const p = G.player, i = p.weapon, b = WEAPONS[i];
  if (isGunW(b) && i > 0) { const CL = G.save.wclean; if (CL && CL.id === b.id) { if (p.fireCD <= 0) { p.fireCD = .5; if (G.t - (G.clTip || -9) > 3) { G.clTip = G.t; toast(b.name + ' is stripped for cleaning — Backpack › tap it › Stop'); } } return; }
    if (p.fireCD <= 0 && !(p.reloadT > 0) && (p.clip[i] | 0) > 0 && p.ammo[i] > 0) { const mc = misfireChance(b.id); if (mc > 0 && Math.random() < mc) { p.fireCD = .55; Snd.play('empty', p.x, p.y); G.jamT = G.t; if (G.t - (G.jamTip || -9) > 8) { G.jamTip = G.t; toast('Misfire! ' + Math.round(mc * 100) + '% chance at this wear — clean or repair it'); } return; } } }
  const a0 = p.ammo[i], r = _pf(aimA, charge); if (isGunW(b) && i > 0 && p.ammo[i] < a0) { const w = pw(i); wearShot(b.id, (w.rate > 6 ? 1.4 : 1) * (w.pellets ? 1.2 : 1)); } return r; }; }
// selling or losing a gun takes its parts and wear record with it
function dropGun(id) { const p = G.player, i = WI[id]; p.ammo[i] = 0; p.clip[i] = 0; delete G.wmods[id]; delete WCOND()[id]; if (G.stash && G.stash.guns) delete G.stash.guns[id]; for (const k in G.wown) if (k.startsWith(id) && WSLOTS[k.slice(id.length).replace(/\d+$/, '')]) delete G.wown[k]; if (G.save.wclean && G.save.wclean.id === id) G.save.wclean = null; if (p.weapon === i) p.weapon = bestWeapon(); PWC = {}; doSave(true); }
const ownsGun = id => G.player.ammo[WI[id]] > 0 || (G.stash && G.stash.guns && G.stash.guns[id] > 0);
const myGunList = () => WEAPONS.map(w => w.id).filter(id => isGunW(WEAPONS[WI[id]]) && WI[id] > 0 && ownsGun(id));

// ---------- repair: the gunsmith (fast, pricey) or cleaning it yourself (slow, cheap) ----------
const compPrice = (id, k) => { const b = WEAPONS[WI[id]], m = G.wmods[id] || {}; const g = GCOMP.find(x => x[0] === k); if (g) return b.price * g[2]; return WSLOTS[k] && m[k] ? WSLOTS[k].o[m[k]][1] : 0; };
const compKeys = id => { const m = G.wmods[id] || {}; return GCOMP.map(x => x[0]).concat(['sight', 'laser'].filter(s => m[s])); };
const compName = (id, k) => { const g = GCOMP.find(x => x[0] === k); return g ? g[1] : optName(k, (G.wmods[id] || {})[k] | 0); };
const smithCost = (id, k) => { const c = gcond(id)[k] ?? 1; return c >= .95 ? 0 : Math.max(25, Math.round(repairCost(compPrice(id, k), c) * 2.2 / 5) * 5); };
const cleanCost = id => compKeys(id).reduce((s, k) => s + ((gcond(id)[k] ?? 1) < .95 ? Math.max(3, Math.round(compPrice(id, k) * .03 * (1 - (gcond(id)[k] ?? 1)))) : 0), 0);
const CLEAN_RATE = 1 / 9; // % per second, about 8 minutes from half-worn
function startClean(id) { const cost = cleanCost(id); if (!cost) return toast('Nothing to clean'); if (G.save.wclean) return toast('You\'re already cleaning the ' + WEAPONS[WI[G.save.wclean.id]].name); if (!payAny(cost)) return; G.save.wclean = { id, last: G.t }; Snd.play('ratchet'); msg('🧽 Stripping the ' + WEAPONS[WI[id]].name + ' to clean and oil it. It can\'t fire until you finish or stop.', '#4fc3f7'); doSave(true); }
function cleanTick() { const CL = G.save && G.save.wclean; if (!CL) return; const d = G.t - (CL.last || G.t); CL.last = G.t; if (d <= 0 || d > 5) return; const c = gcond(CL.id); let left = 0;
  for (const k of compKeys(CL.id)) { const v = c[k] ?? 1; if (v < .95) { c[k] = Math.min(.95, v + CLEAN_RATE / 100 * d); left++; } } PWC = {};
  if (!left) { const n = WEAPONS[WI[CL.id]].name; G.save.wclean = null; Snd.play('cock'); msg('✨ The ' + n + ' is clean, oiled and back together.', '#2ecc71'); doSave(true); } }
const cleanMins = id => Math.ceil(Math.max(...compKeys(id).map(k => .95 - (gcond(id)[k] ?? 1)), 0) * 100 / CLEAN_RATE / 60);

// ---------- condition card (shared by the gunsmith, the backpack and selling) ----------
function gunCondCard(H, col, id, opts) { opts = opts || {}; const c = gcond(id), mc = misfireChance(id), w = pw(WI[id]);
  H.row(col, '📊', condWord2(gcAvg(id)) + ' · ' + pct(gcAvg(id)), 'Misfire ' + (mc < .005 ? '<1%' : Math.round(mc * 100) + '%') + ' · accuracy ' + pct(clamp(1 - (w.spread || 0) * 3.5, 0, 1)) + ' · worth ≈ ' + money(gunValue(id))).classList.add('pmsg');
  for (const k of compKeys(id)) { const v = c[k] ?? 1, r = H.row(col, '', compName(id, k), pct(v), opts.smith && v < .95 ? [H.btn('Fix ' + money(smithCost(id, k)), () => { if (payAny(smithCost(id, k))) { c[k] = 1; PWC = {}; Snd.play('ratchet'); doSave(true); } }, smithCost(id, k) > compPrice(id, k) * .5 ? 'r' : 'y', !canPay(smithCost(id, k)))] : []);
    const bar = H.mk('div', 'pcbar'), bi = H.mk('b'); bi.style.width = Math.round(v * 100) + '%'; bi.style.background = condCol(v); bar.appendChild(bi); bar.style.margin = '4px 0 0'; r.querySelector('.pt').appendChild(bar); } }

// ---------- the gun shop: New · Used bin · Sell · Repair ----------
function usedBin(kind) { const key = kind + G.day; G._ub = G._ub || {}; if (G._ub[key]) return G._ub[key]; const rng = mulberry32(G.day * 977 + (kind === 'pawn' ? 31 : 7)), pickR = a => a[Math.floor(rng() * a.length)], L = [];
  const pool = WEAPONS.filter(w => isGunW(w) && WI[w.id] > 0 && w.id !== 'molotov').map(w => w.id), n = kind === 'pawn' ? 4 : 6;
  for (let k = 0; k < n; k++) { const id = pickR(kind === 'pawn' ? pool.filter(x => WEAPONS[WI[x]].price < 3000) : pool), m = {}, lo = kind === 'pawn' ? .15 : .3, hi = kind === 'pawn' ? .7 : .88;
    for (const s of ['sight', 'laser', 'barrel', 'grip', 'stock', 'mag', 'muz', 'skin']) { if (rng() > (s === 'skin' ? .25 : .3)) continue; const opts = WSLOTS[s].o.map((o, i) => [o, i]).filter(([o, i]) => i > 0 && (!o[2] || o[2].includes(id))); if (opts.length) m[s] = pickR(opts)[1]; }
    const c = {}; for (const [kk] of GCOMP) c[kk] = +(lo + rng() * (hi - lo)).toFixed(2); if (m.sight) c.sight = +(lo + rng() * (hi - lo)).toFixed(2); if (m.laser) c.laser = +(lo + rng() * (hi - lo)).toFixed(2);
    L.push({ k: kind + k, id, m, c, ammo: Math.round(WEAPONS[WI[id]].ammo0 * (.3 + rng() * .5)), price: Math.round(gunValue(id, m, c) * (kind === 'pawn' ? .85 : 1.05) / 10) * 10, sold: 0 }); }
  return G._ub[key] = L; }
function buyUsed(u) { const has = ownsGun(u.id), credit = has ? Math.round(gunValue(u.id) * .35 / 10) * 10 : 0, go = () => { if (!payAny(Math.max(0, u.price - credit))) return; if (has) dropGun(u.id); G.wmods[u.id] = Object.assign({}, u.m); for (const s in u.m) if (u.m[s]) G.wown[u.id + s + u.m[s]] = 1; WCOND()[u.id] = Object.assign({}, u.c); giveWeapon(u.id, u.ammo); u.sold = 1; PWC = {}; Snd.play('cock'); doSave(true); Panel.render(); };
  if (!has) return go(); say('Trade in?', 'You already own a ' + WEAPONS[WI[u.id]].name + '. Trade it in for ' + money(credit) + ' off?', [{ t: 'Trade in · pay ' + money(Math.max(0, u.price - credit)), c: 'y', f: go }, { t: 'Never mind' }]); }
function usedCol(H, kind) { const P = Panel, L = usedBin(kind).filter(u => !u.sold), c = H.col(kind === 'pawn' ? 'Used guns — no questions asked' : 'Used bin — restocked daily');
  if (!L.length) { H.empty(c, 'Picked clean. Check back tomorrow.'); return; } if (!L.some(u => u.k === P.ubSel)) P.ubSel = L[0].k; const g = gGrid(H, c, 'ub');
  for (const u of L) { const avg = GCOMP.reduce((s, [k, , w]) => s + u.c[k] * w, 0) / .9, t = gTile(H, g, 'ub', 'gun:' + u.id, '🔫', WEAPONS[WI[u.id]].name, money(u.price).replace('$', '$'), { canvas: gunIconBig(u.id), cond: avg }); t.onclick = e => { e.stopPropagation(); Snd.play('ui'); P.ubSel = u.k; Panel.render(); }; if (u.k === P.ubSel) t.classList.add('sel'); t.classList.add('gun'); }
  const u = L.find(x => x.k === P.ubSel), c2 = H.col('Used ' + WEAPONS[WI[u.id]].name), cv = H.mk('canvas', 'pgun'); cv.width = 360; cv.height = 130; c2.appendChild(cv); drawGunPreview(cv, u.id, u.m);
  const mods = Object.keys(u.m).filter(s => u.m[s] && s !== 'skin').map(s => optName(s, u.m[s])); H.row(c2, '🔧', mods.length ? mods.join(' · ') : 'No attachments', u.ammo + ' rounds included').classList.add('pmsg');
  const avg = GCOMP.reduce((s, [k, , w]) => s + u.c[k] * w, 0) / .9, mcU = clamp(.32 * Math.pow(1 - u.c.action, 2.2) + .12 * Math.pow(1 - u.c.mag, 3) + .05 * Math.pow(1 - u.c.frame, 3), 0, .6);
  H.row(c2, '📊', condWord2(avg) + ' · ' + pct(avg), 'Misfire ' + Math.round(mcU * 100) + '% · ' + GCOMP.map(([k, n]) => n.split(' ')[0] + ' ' + pct(u.c[k])).join(' · ')).classList.add('pmsg');
  const has = ownsGun(u.id), b = H.btn((has ? 'Trade in & buy  ' : 'Buy  ') + money(u.price) + '  (new, bare: ' + money(WEAPONS[WI[u.id]].price) + ')', () => buyUsed(u), 'y', P.mode === 'pawn' ? G.cash < u.price : !canPay(u.price)); b.style.width = '100%'; c2.appendChild(b); }
function sellCol(H, rate, who) { const L = myGunList(), c = H.col('Sell a gun — ' + who + ' pays ' + Math.round(rate * 100) + '% of value'); if (!L.length) { H.empty(c, 'You don\'t own any guns.'); return; }
  for (const id of L) { const v = Math.round(gunValue(id) * rate / 10) * 10, r = H.row(c, '', WEAPONS[WI[id]].name, condWord2(gcAvg(id)) + ' · ' + pct(gcAvg(id)) + (G.stash.guns && G.stash.guns[id] ? ' · in your home locker' : '') + ' · attachments go with it', [H.btn('Sell ' + money(v), () => say('Sell it?', 'Sell your ' + WEAPONS[WI[id]].name + ' with its attachments and ammo for ' + money(v) + '?', [{ t: 'Sell for ' + money(v), c: 'r', f: () => { dropGun(id); addCash(v); Snd.play('cash'); Panel.render(); } }, { t: 'Keep it' }]), 'r')]); r.querySelector('.pe').appendChild(Panel.icon(id, WI[id])); } }
function repairCol(H) { const L = myGunList().filter(id => G.player.ammo[WI[id]] > 0); const P = Panel; if (!L.length) { H.empty(H.col('Repairs'), 'Bring a gun you\'re carrying.'); return; } if (!L.includes(P.rpSel)) P.rpSel = L[0];
  const c = H.col('Your guns'); for (const id of L) { const r = H.row(c, '', WEAPONS[WI[id]].name, condWord2(gcAvg(id)) + ' · ' + pct(gcAvg(id)) + ' · misfire ' + Math.round(misfireChance(id) * 100) + '%', [H.btn(P.rpSel === id ? '✓' : 'View', () => { P.rpSel = id; }, P.rpSel === id ? 'on' : '')]); r.querySelector('.pe').appendChild(Panel.icon(id, WI[id])); if (P.rpSel === id) r.classList.add('sel'); }
  const id = P.rpSel, c2 = H.col('Gunsmith — ' + WEAPONS[WI[id]].name); gunCondCard(H, c2, id, { smith: 1 });
  const all = compKeys(id).reduce((s, k) => s + smithCost(id, k), 0); if (all) { const b = H.btn('🔧 Fix everything  ' + money(all), () => { if (payAny(all)) { for (const k of compKeys(id)) gcond(id)[k] = 1; PWC = {}; Snd.play('ratchet'); doSave(true); } }, 'y', !canPay(all)); b.style.width = '100%'; c2.appendChild(b); }
  c2.appendChild(H.mk('div', 'pempty', 'Shop work is fast and pricey. Cleaning it yourself costs about ' + money(cleanCost(id)) + ' in kit — Backpack › tap the gun › Clean (slow).')); }
{ const gs = PMODES.gunshop; PMODES.gunshop = function (H) { const t = this.gtab || 'new';
  const tabs = [['new', '🛒 New'], ['used', '🗃 Used bin'], ['repair', '🔧 Repair'], ['sell', '💵 Sell']], bar = H.el.querySelector('.ptabs'); bar.innerHTML = '';
  for (const [id, n] of tabs) { const b = H.mk('button', id === t ? 'on' : '', n); b.onclick = () => { Snd.play('ui'); this.gtab = id; this.gsel = null; Panel.render(); }; bar.appendChild(b); }
  if (t === 'new') return gs.call(this, H); H.title.textContent = this.opt.name || 'Gun shop'; if (t === 'used') return usedCol(H, 'gun'); if (t === 'repair') return repairCol(H); return sellCol(H, .55, 'the dealer'); }; }
// pawn shops: their used guns come from the same system, and they'll buy guns too (for less)
{ const pp = PMODES.pawn; PMODES.pawn = function (H) { if (this.tab === 'guns' || this.tab === 'sellg') { const p = H.p; H.title.textContent = this.opt.name || 'Pawn shop'; H.tabBtn('sell', 'Sell'); H.tabBtn('buy', 'Buy'); return this.tab === 'guns' ? usedCol(H, 'pawn') : sellCol(H, .4, 'the pawn shop'); }
  return pp.call(this, H); }; }
{ const _r = Panel.render; Panel.render = function () { const r = _r.apply(this, arguments); if (this.mode === 'pawn') { const bar = pEl().querySelector('.ptabs'); if (bar && !bar.querySelector('[data-g]')) for (const [id, n] of [['guns', 'Used guns'], ['sellg', 'Sell guns']]) { const b = document.createElement('button'); b.textContent = n; b.dataset.g = 1; if (this.tab === id) b.className = 'on'; b.onclick = () => { Snd.play('ui'); this.tab = id; this.render(); }; bar.appendChild(b); } } return r; }; }

// ---------- backpack: the gun card shows wear, misfire and cleaning ----------
{ const pi = PMODES.inv; PMODES.inv = function (H) { const r = pi.call(this, H), k = this.gsel && this.gsel.key; if (!k || !k.startsWith('gun:')) return r; const id = k.slice(4); if (!isGunW(WEAPONS[WI[id]])) return r; const c2 = H.body.querySelectorAll('.pcol')[1]; if (!c2) return r;
  const box = H.mk('div', ''); box.style.cssText = 'display:flex;flex-direction:column'; const fake = { ...H }; gunCondCard(H, box, id); const CL = G.save.wclean;
  if (CL && CL.id === id) { const b = H.btn('⏹ Stop cleaning (put it back together)', () => { G.save.wclean = null; Snd.play('cock'); }, ''); b.style.width = '100%'; box.appendChild(H.mk('div', 'pempty', '🧽 Cleaning… about ' + cleanMins(id) + ' min left. It can\'t fire until you finish or stop.')); box.appendChild(b); }
  else { const cc = cleanCost(id); const b = H.btn(cc ? '🧽 Clean & oil it (slow) — ' + money(cc) + ' · ~' + cleanMins(id) + ' min' : '✨ In top shape', () => startClean(id), cc ? 'y' : '', !cc || !canPay(cc) || !!CL); b.style.width = '100%'; box.appendChild(b); box.appendChild(H.mk('div', 'pempty', 'Quicker: any gun shop › Repair. You can sell guns at gun shops (55%) or pawn shops (40%).')); }
  const rows = c2.querySelectorAll('.prow'); const after = rows[0] ? rows[0].nextSibling : null; c2.insertBefore(box, after); return r; }; }

// ---------- laser beam & flashlight on the equipped gun (drawn above the night lighting so it glows) ----------
function laserGeom() { const p = G.player; if (!p || p.dead || p.car || p.swim || G.mode !== 'play') return null; const b = WEAPONS[p.weapon]; if (!isGunW(b) || p.weapon === 0) return null; const m = G.wmods[b.id]; if (!m || !m.laser) return null; if (G.save.wclean && G.save.wclean.id === b.id) return null;
  const a = p.a, ox = p.x + Math.cos(a) * 14, oy = p.y + Math.sin(a) * 14, R = Math.min(pw(p.weapon).range || 500, 700); let L = R; const peds = G.scene ? G.scene.peds : G.peds;
  for (let s = 8; s < R; s += 8) { const x = ox + Math.cos(a) * s, y = oy + Math.sin(a) * s; if (sceneSolid(Math.floor(x / T), Math.floor(y / T))) { L = s; break; } let hit = false; for (const q of peds) if (!q.dead && q !== p && dist2(q.x, q.y, x, y) < 100) { hit = true; break; } if (!hit && !G.scene) for (const c of G.cars) if (!c.dead && dist2(c.x, c.y, x, y) < (c.W / 2 + 2) ** 2) { hit = true; break; } if (hit) { L = s; break; } }
  return { a, ox, oy, ex: ox + Math.cos(a) * L, ey: oy + Math.sin(a) * L, k: m.laser }; }
function drawLaser(L) { const g = ctx, col = L.k === 2 ? '80,255,90' : '255,40,40'; g.save(); g.strokeStyle = 'rgba(' + col + ',' + (L.k === 2 ? .75 : .55) + ')'; g.lineWidth = L.k === 2 ? 1.6 : 1.3; g.beginPath(); g.moveTo(L.ox, L.oy); g.lineTo(L.ex, L.ey); g.stroke(); g.fillStyle = 'rgba(' + col + ',.95)'; g.beginPath(); g.arc(L.ex, L.ey, 2.4, 0, TAU); g.fill(); g.globalAlpha = .35; g.beginPath(); g.arc(L.ex, L.ey, 6, 0, TAU); g.fill(); g.restore(); }
{ const _de = drawPlayerExtras; drawPlayerExtras = function (p) { _de(p); if (p !== G.player) return; const L = laserGeom(); G._lz = L; if (L && !(darkness() > .03 && G.settings.lights !== 0)) drawLaser(L); }; }
{ const _cl = collectCityLights; collectCityLights = function (...a) { _cl.apply(this, a); const L = G._lz; if (L && L.k === 3) pushLight('cone', L.ox, L.oy, 300, 'rgba(255,248,220,1)', .95, L.a); }; }
{ const _lp = lightPass; lightPass = function (...a) { const r = _lp.apply(this, a); const L = G._lz; if (L && !G.scene) { ctx.save(); worldXform(G.cam.z); drawLaser(L); ctx.restore(); } return r; }; }

// ---------- attachments drawn on the shop / workbench preview ----------
const GGEO = { pistol: [3.2, 22, -8, 1], uzi: [2.7, 30, -8, -1], shotgun: [1.95, 52, -7, 6], rifle: [1.95, 48, -8, 3], bolt: [1.95, 52, -6, 2], sniper: [1.95, 64, -7, 3], rocket: [1.95, 50, -8, 4] };
function gunOverlay(cv, id, m) { const look = GLOOK[id] || id, G0 = GGEO[look]; if (!G0) return; const g = cv.getContext('2d'), [S, bx, top, under] = G0; g.save(); g.translate(cv.width / 2, cv.height / 2 + 6); g.scale(S, S); const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  if (m.barrel === 2) { R(bx, top + 3, 12, 3, '#2a2a2a'); } if (m.sight === 1) { R(-4, top - 6, 11, 6, '#1a1a1a'); g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(4, top - 3, 1.2, 0, TAU); g.fill(); }
  if (m.sight === 2) { R(-6, top - 8, 16, 8, '#1a1a1a'); R(-4, top - 7, 12, 5, 'rgba(120,200,255,.35)'); }
  if (m.sight >= 3 && look !== 'sniper') { const L = m.sight === 4 ? 36 : 26; R(-12, top - 7, L, 6, '#1a1a1a'); R(-14, top - 8, 4, 8, '#333'); R(L - 14, top - 8 - (m.sight === 4 ? 1 : 0), 5, 8 + (m.sight === 4 ? 2 : 0), '#333'); g.fillStyle = '#4fc3f7'; g.fillRect(L - 10, top - 6.5, 1.2, 5); }
  if (m.laser) { R(bx - 18, under + 1, 10, 4, '#222'); g.strokeStyle = m.laser === 2 ? 'rgba(80,255,90,.9)' : 'rgba(255,40,40,.8)'; g.lineWidth = .6; g.beginPath(); g.moveTo(bx - 8, under + 3); g.lineTo(bx + 60, under + 3); g.stroke(); if (m.laser === 3) { R(bx - 26, under + 1, 7, 5, '#333'); g.fillStyle = 'rgba(255,250,200,.6)'; g.beginPath(); g.arc(bx - 19, under + 3.5, 2, 0, TAU); g.fill(); } }
  if (m.grip === 1) R(bx - 30, under + 3, 4, 10, '#222'); if (m.grip === 2) { g.strokeStyle = '#333'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx - 14, under + 3); g.lineTo(bx - 20, under + 16); g.moveTo(bx - 14, under + 3); g.lineTo(bx - 6, under + 16); g.stroke(); }
  if (m.stock === 1 && look !== 'pistol') { R(-56, -6, 4, 12, '#2a2a2a'); R(-60, -4, 6, 10, '#3a3a3a'); } if (m.stock === 2) { g.clearRect(-70, -12, 18, 30); }
  g.restore(); }

// ---------- housekeeping ----------
{ const _u = update; update = function (dt) { _u(dt); if ((G.gnT = (G.gnT || 0) - dt) > 0) return; G.gnT = 1; const p = G.player; if (!p || !G.save) return; gunsMigrate();
  for (let i = 1; i < WEAPONS.length; i++) { if (!isFinite(p.ammo[i])) p.ammo[i] = 0; if (!isFinite(p.clip[i])) p.clip[i] = 0; } cleanTick(); }; }
