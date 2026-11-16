// ================= HOME WORKSHOP: fit or pull parts yourself in your garage — only parts you own =================
const PARTS = () => G.save.parts || (G.save.parts = {});
const pkey = (k, v) => k + ':' + v, partN = (k, v, c) => { const o = (c ? modOpts(k, c) : MODOPTS[k].o)[v]; return MODOPTS[k].n + ' — ' + (o ? o[0] : '?'); };
function partAdd(k, v, n) { if (!v) return; const P = PARTS(), id = pkey(k, v); P[id] = (P[id] | 0) + (n || 1); }
function partUse(k, v) { const P = PARTS(), id = pkey(k, v); if (!(P[id] > 0)) return false; if (!--P[id]) delete P[id]; return true; }
const PART_EXCL = new Set(['swp', 'p', 's']);
function carKeys(c) { const out = []; for (const [t] of garTabs(c)) { if (t === 'style') out.push('liv', 'rim'); if (t === 'body') out.push('sp', 'hd', 'sk'); if (t === 'lights') out.push('hl', 'neon', 'tint'); if (t === 'perf') out.push(...perfKeys(c)); if (t === 'moto') out.push(...MOTOK); } return out.filter(k => MODOPTS[k] && !PART_EXCL.has(k)); }
function fitPart(c, k, v) { if (!partUse(k, v)) return; const old = (c.mods || {})[k] | 0; if (old) partAdd(k, old); c.mods = Object.assign({}, c.mods || {}); c.mods[k] = v; if (k === 'nos') { c.nos = v === 2 ? 5 : 3; } applyMods(c); Snd.play('ratchet'); if (c.isRide) G.save.ride = { type: c.type, mods: c.mods, legit: c.legit ? 1 : 0 }; doSave(true); }
function pullPart(c, k) { const old = (c.mods || {})[k] | 0; if (!old) return; c.mods = Object.assign({}, c.mods); c.mods[k] = 0; partAdd(k, old); applyMods(c); Snd.play('ratchet'); if (c.isRide) G.save.ride = { type: c.type, mods: c.mods, legit: c.legit ? 1 : 0 }; doSave(true); }
function workshopTab(H, g) {
  const c = padCar(g); if (!c) { H.empty(H.col('Workshop'), 'Park a car you own on the GARAGE pad (or right next to it) to work on it here.'); return; }
  const keys = carKeys(c), m = c.mods || {}, P = PARTS();
  const c1 = H.col('On the ' + c.d.name); const r0 = H.row(c1, '', c.d.name, 'Pull a part and it goes to your parts shelf', []); r0.querySelector('.pe').appendChild(carThumb(c.type, c.color, m));
  for (const k of keys) { const v = m[k] | 0, o = modOpts(k, c); H.row(c1, v ? '🔩' : '·', MODOPTS[k].n, v ? o[v][0] : 'Stock', v ? [H.btn('Pull off', () => pullPart(c, k))] : []); }
  const c2 = H.col('Parts shelf'); const ids = Object.keys(P).filter(id => P[id] > 0);
  if (!ids.length) H.empty(c2, 'No spare parts. Buy them online (Phone › Shop), choose "Buy for my garage" at a mod shop, or pull them off a car.');
  ids.sort().forEach(id => { const [k, vs] = id.split(':'), v = +vs; if (!MODOPTS[k]) return; const fits = keys.includes(k) && v < modOpts(k, c).length, cur = (m[k] | 0) === v; H.row(c2, '📦', partN(k, v, fits ? c : null) + (P[id] > 1 ? ' ×' + P[id] : ''), !fits ? 'Doesn\'t fit a ' + c.d.name : cur ? 'Already fitted' : (m[k] | 0) ? 'Swaps out ' + modOpts(k, c)[m[k]][0] : 'Bolt it on', [H.btn('Fit', () => fitPart(c, k, v), 'y', !fits || cur)]); });
  c2.appendChild(barsEl(statBars(c)));
}
// home garage panel gets tabs: Park | Workshop
const hgPark = PMODES.hgarage;
PMODES.hgarage = function (H) { const tab = this.tab || (this.tab = 'park'); H.tabBtn('park', 'Store / take out'); H.tabBtn('work', '🔧 Workshop'); if (tab === 'work') { H.title.textContent = '🔧 Workshop'; return workshopTab(H, this.opt.g); } return hgPark.call(this, H); };
// online parts shop (phone › Shop): parts are delivered to your garage shelf
function partsShopCol(H) { const c = H.col('Upgrades & styling');
  for (const k in MODOPTS) { if (PART_EXCL.has(k)) continue; MODOPTS[k].o.forEach((o, v) => { if (!v || !o[1] || (k === 'exh' && v === 2)) return; const pr = Math.round(o[1] * 1.1 / 10) * 10, have = PARTS()[pkey(k, v)] | 0; H.row(c, '🔩', MODOPTS[k].n + ' — ' + o[0], money(pr) + (have ? ' · on shelf ' + have : ''), [H.btn('Buy', () => { if (payAny(pr)) { partAdd(k, v); toast('Delivered to your garage'); } }, 'y', !canPay(pr))]); }); } }
// ================= MODULAR WORKSHOP II: work on ANY car in your garage (or on the pad) without parting it out =================
// a "target" wraps either a live car on the pad or a stored garage record
function wsTarget(sel, g) { if (sel === 'pad') { const c = padCar(g); return c ? { kind: 'car', c, type: c.type, d: c.d, get mods() { return c.mods || {}; }, set(m) { c.mods = m; applyMods(c); if (c.isRide) G.save.ride = { type: c.type, mods: c.mods, legit: c.legit ? 1 : 0 }; }, get noEng() { return !!c.noEng; }, setNoEng(v) { c.noEng = v ? 1 : 0; }, color: c.color, name: c.d.name + ' (on the pad)' } : null; }
  const r = myCars().find(x => recId(x) === sel); if (!r || !CAR_TYPES[r.type]) return null; return { kind: 'rec', r, type: r.type, d: CAR_TYPES[r.type], get mods() { return r.mods || (r.mods = {}); }, set(m) { r.mods = m; }, get noEng() { return !!r.noEng; }, setNoEng(v) { r.noEng = v ? 1 : 0; }, color: recColor(r), name: CAR_TYPES[r.type].name + ' (stored)' }; }
const tgtKeys = t => carKeys(t.kind === 'car' ? t.c : { d: t.d, type: t.type, mods: t.mods });
const curEng = t => { const m = t.mods; return t.noEng ? null : m.swp ? ENGS[m.swp].id : stockEng(t.type); };
const engFits = (t, e) => t.d.pedal ? false : t.d.rider ? e === 'eng_bike' : e !== 'eng_bike';
function tFit(t, k, v) { if (!partUse(k, v)) return; const m = Object.assign({}, t.mods), old = m[k] | 0; if (old) partAdd(k, old); m[k] = v; t.set(m); Snd.play('ratchet'); doSave(true); }
function tPull(t, k) { const m = Object.assign({}, t.mods), old = m[k] | 0; if (!old) return; m[k] = 0; partAdd(k, old); t.set(m); Snd.play('ratchet'); doSave(true); }
function tPullEng(t) { const e = curEng(t); if (!e) return; G.stash.items[e] = (G.stash.items[e] | 0) + 1; const m = Object.assign({}, t.mods); m.swp = 0; t.set(m); t.setNoEng(1); Snd.play('ratchet'); Snd.play('clunk'); toast(ITEMS[e].n + ' pulled — it\'s on your stash shelf'); doSave(true); }
function tFitEng(t, e) { if (partHave(e) < 1) return; const old = curEng(t); partTake(e, 1); if (old) G.stash.items[old] = (G.stash.items[old] | 0) + 1; const m = Object.assign({}, t.mods); m.swp = e === stockEng(t.type) ? 0 : Math.max(0, ENGS.findIndex(x => x.id === e)); t.set(m); t.setNoEng(0); Snd.play('ratchet'); Snd.play('rev'); doSave(true); }
function workshopTab(H, g) {
  const P = this, L = myCars(); L.forEach(recId); const pad = padCar(g); if (!P.wsel || (P.wsel === 'pad' && !pad) || (P.wsel !== 'pad' && !L.some(r => r.id === P.wsel))) P.wsel = pad ? 'pad' : L[0] ? L[0].id : null;
  const c0 = H.col('Pick a vehicle');
  if (pad) { const r = thumbRow(H, c0, pad.type, pad.color, pad.mods, pad.d.name, pad.noEng ? 'On the pad · NO ENGINE' : 'On the pad', [H.btn(P.wsel === 'pad' ? 'Working' : 'Work on', () => { P.wsel = 'pad'; }, P.wsel === 'pad' ? 'on' : '')]); if (P.wsel === 'pad') r.classList.add('sel'); }
  for (const rec of L) { const d = CAR_TYPES[rec.type]; if (!d) continue; const r = thumbRow(H, c0, rec.type, recColor(rec), rec.mods, d.name, 'In the garage' + (rec.noEng ? ' · NO ENGINE' : ''), [H.btn(P.wsel === rec.id ? 'Working' : 'Work on', () => { P.wsel = rec.id; }, P.wsel === rec.id ? 'on' : '')]); if (P.wsel === rec.id) r.classList.add('sel'); }
  if (!pad && !L.length) { H.empty(c0, 'Store a car in the garage, or park one on the GARAGE pad, to work on it here.'); return; }
  const t = wsTarget(P.wsel, g); if (!t) return; const keys = tgtKeys(t), m = t.mods, PRT = PARTS();
  const c1 = H.col('Fitted on the ' + t.d.name), e = curEng(t), se = stockEng(t.type);
  if (se) H.row(c1, '⚙', 'Engine', e ? ITEMS[e].n + (e === se ? ' (factory)' : '') : 'EMPTY — it won\'t drive', e ? [H.btn('Pull', () => tPullEng(t))] : []).querySelector('.pe').style.color = e ? '' : '#ff6b6b';
  for (const k of keys) { const v = m[k] | 0, o = modOpts(k, { d: t.d, type: t.type, mods: m }); H.row(c1, v ? '🔩' : '·', MODOPTS[k].n, v ? o[v][0] : 'Stock', v ? [H.btn('Pull', () => tPull(t, k))] : []); }
  const c2 = H.col('Loose parts in stock'); let any = 0;
  if (se) for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike']) { const n = partHave(id); if (!n || !ITEMS[id]) continue; any = 1; const fits = engFits(t, id); H.row(c2, '⚙', ITEMS[id].n + (n > 1 ? ' ×' + n : ''), !fits ? 'Doesn\'t fit a ' + t.d.name : e === id ? 'Same as fitted' : e ? 'Hot-swap: ' + ITEMS[e].n + ' goes to stock' : 'Drop it in', [H.btn('Fit', () => tFitEng(t, id), 'y', !fits || e === id)]); }
  Object.keys(PRT).filter(id => PRT[id] > 0).sort().forEach(id => { const [k, vs] = id.split(':'), v = +vs; if (!MODOPTS[k]) return; any = 1; const o = modOpts(k, { d: t.d, type: t.type, mods: m }), fits = keys.includes(k) && v < o.length, cur = (m[k] | 0) === v; H.row(c2, '📦', partN(k, v, fits ? { d: t.d, type: t.type, mods: m } : null) + (PRT[id] > 1 ? ' ×' + PRT[id] : ''), !fits ? 'Doesn\'t fit a ' + t.d.name : cur ? 'Already fitted' : (m[k] | 0) ? 'Hot-swap: ' + o[m[k]][0] + ' goes to stock' : 'Bolt it on', [H.btn('Fit', () => tFit(t, k, v), 'y', !fits || cur)]); });
  if (!any) H.empty(c2, 'Nothing loose. Pull parts off a car, buy them online (Phone › Shop) or choose "Buy for my garage" at a mod shop. Engines come from the Project garage parts order.');
  c2.appendChild(barsEl(statBars({ st: calcSt(t.d, m) })));
}
PMODES.hgarage = function (H) { const tab = this.tab || (this.tab = 'park'); H.tabBtn('park', 'Store / take out'); H.tabBtn('work', '🔧 Workshop'); if (tab === 'work') { H.title.textContent = '🔧 Workshop'; return workshopTab.call(this, H, this.opt.g); } return hgPark.call(this, H); };
