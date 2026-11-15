// ================= ONE PART PER SLOT: aftermarket parts REPLACE the stock part in their slot; engine add-ons live on the engine; rims & tires live on the wheels =================
const VAR = { gearbox: 'trn', exhaustp: 'exh', wiring: 'ecu' }, VARK = { trn: 'gearbox', exh: 'exhaustp', ecu: 'wiring' };
const ENG_ATT = ['eng', 'tur', 'nos'], WHEEL_ATT = ['rim', 'tyr'];
MODOPTS.eng.n = 'Engine tune';
{ const o = MODOPTS.eng.o; o[1][0] = 'Street tune (cams & intake)'; o[2][0] = 'Sport tune (ported head)'; o[3][0] = 'Race tune (forged internals)'; for (const r of o) { if (r[0] === 'Built race motor') r[0] = 'Built race internals'; if (r[0] === 'Stroker motor — hand-tuned') r[0] = 'Hand-tuned stroker kit'; } }
MODOPTS.wgt.n = 'Interior';
const engIdOf = (type, mods, noEng) => noEng ? null : mods && mods.swp ? ENGS[mods.swp].id : stockEng(type);
// does a part make sense on this vehicle right now?
function modWhy(k, c) { const m = c.mods || {}, e = engIdOf(c.type, m, c.noEng), miss = c.missing || {};
  if (ENG_ATT.includes(k) && !e && stockEng(c.type)) return 'Needs an engine';
  if (k === 'tur' && ['eng_i4t', 'eng_sc8', 'eng_ev'].includes(e)) return e === 'eng_ev' ? 'Electric motors don\'t take a turbo' : 'This engine is already ' + (e === 'eng_sc8' ? 'supercharged' : 'turbocharged');
  if (k === 'nos' && e === 'eng_ev') return 'Nitrous does nothing for an electric motor';
  if (WHEEL_ATT.includes(k) && (miss.wheelset | 0) > 0) return 'Fit all the wheels first';
  return ''; }
{ const _mo = modOpts; modOpts = function (k, c) { const o = _mo(k, c); return c && c.d && modWhy(k, c) ? [o[0]] : o; }; }
function sanitizeMods(type, mods, missing, noEng) { if (!mods || !CAR_TYPES[type]) return mods; const c = { type, d: CAR_TYPES[type], mods, missing: missing || {}, noEng };
  for (const k of ENG_ATT.concat(WHEEL_ATT)) if (mods[k] && modWhy(k, c)) mods[k] = 0;
  for (const mech in VAR) if (((missing || {})[mech] | 0) > 0) mods[VAR[mech]] = 0; return mods; }
{ const _sm = streetMods; streetMods = function (c, dn) { const r = _sm(c, dn); if (c && c.mods) { sanitizeMods(c.type, c.mods, c.missing, c.noEng); applyMods(c); } return r; };
  const _gl = genListing; genListing = function (M) { const l = _gl(M); if (l && l.type && l.mods) sanitizeMods(l.type, l.mods, l.missing, l.noEng); return l; }; }
// ---- conditions follow the physical slot ----
function pcSlots(type, mods, missing, noEng) { const out = [], se = stockEng(type), req = buildReq(type); mods = mods || {};
  if (se && !noEng) out.push('eng');
  for (const k in req) { if (k === 'seats' && mods.wgt > 0) continue; if (req[k] - ((missing || {})[k] | 0) > 0) out.push(k); }
  for (const k in mods) if (MODOPTS[k] && !PCOSM.has(k) && !VARK[k] && k !== 'wgt' && mods[k] > 0) out.push('m:' + k); return out; }
function slotFor(id) { if (id.includes(':')) { const k = id.split(':')[0]; return VARK[k] || 'm:' + k; } if (ITEMS[id] && id.startsWith('eng_')) return 'eng'; return id; }
function slotPrice(s, type, mods) { mods = mods || {};
  if (s === 'eng') { const e = engIdOf(type, mods); return e && ITEMS[e] ? ITEMS[e].v : 1500; }
  if (s.startsWith('m:')) { const k = s.slice(2), o = MODOPTS[k] && MODOPTS[k].o[mods[k] | 0]; return (o && o[1]) || 150; }
  if (VAR[s] && mods[VAR[s]] > 0) { const o = MODOPTS[VAR[s]].o[mods[VAR[s]]]; return (o && o[1]) || 300; }
  return (ITEMS[s] ? ITEMS[s].v : 150) * Math.max(1, buildReq(type)[s] | 0); }
function slotEffect(t, s) { const m = t.mods, pc = tOwner(t).pc || {}, cur = effSt(t.d, m, pc), wo = Object.assign({}, m), pc2 = Object.assign({}, pc); let vs = 'new';
  if (s === 'eng') { if (wo.swp) { wo.swp = 0; vs = 'stock'; } delete pc2.eng; } else if (s.startsWith('m:')) { wo[s.slice(2)] = 0; delete pc2[s]; vs = 'stock'; } else { if (VAR[s] && wo[VAR[s]]) { wo[VAR[s]] = 0; vs = 'stock'; } delete pc2[s]; }
  const base = effSt(t.d, wo, pc2), out = [], dp = (a, b) => Math.round((a / b - 1) * 100);
  for (const [f, n] of [['acc', 'accel'], ['max', 'speed'], ['grip', 'grip']]) { if (typeof cur[f] !== 'number' || !base[f]) continue; const v = dp(cur[f], base[f]); if (Math.abs(v) >= 1) out.push((v > 0 ? '+' : '') + v + '% ' + n); }
  return out.length ? out.join(', ') + ' vs ' + vs : ''; }
// ---- operations ----
function condSwap(t, id, slot) { const pc = tPC(t), a = lcList(id); if (!a.length) return; a.sort((x, y) => y - x); const i = G._pick && G._pick.id === id ? pickIdx(a, G._pick.c) : 0; if (Math.abs(a[i] - (pc[slot] === undefined ? 1 : pc[slot])) < .005) return toast('Same condition as the fitted one'); const tmp = pc[slot] === undefined ? 1 : pc[slot]; pc[slot] = a[i]; a[i] = tmp; tRecalc(t); Snd.play('ratchet'); toast('Swapped — fitted one is now ' + pct(pc[slot])); doSave(true); }
// aftermarket transmission / exhaust / ECU: fills the empty slot or replaces whatever is in it
function fitVarPart(t, mech, k, v) { const M = t.missing; if ((t.mods[k] | 0) === v && !(M[mech] > 0)) return condSwap(t, pkey(k, v), mech);
  carryOp(t, () => { if (!partUse(k, v)) return; const m2 = Object.assign({}, t.mods), old = m2[k] | 0; if (M[mech] > 0) { M[mech]--; if (!M[mech]) delete M[mech]; } else if (old) partAdd(k, old); else G.stash.items[mech] = (G.stash.items[mech] | 0) + 1; m2[k] = v; t.set(m2); },
    (pc, used) => { const u = used[pkey(k, v)]; if (u) pc[mech] = u[0]; }); }
// a plain (stock) part going back into a slot
function fitPlain(t, mech) { const M = t.missing, k = VAR[mech];
  if (M[mech] > 0) return fitMech(t, mech);
  if (k && (t.mods[k] | 0) > 0) return carryOp(t, () => { if (partHave(mech) < 1) return; partTake(mech, 1); const m2 = Object.assign({}, t.mods); partAdd(k, m2[k]); m2[k] = 0; t.set(m2); }, (pc, used) => { const u = used[mech]; if (u) pc[mech] = u[0]; });
  return mechSwap(t, mech); }
function pullSlot(t, mech) { const k = VAR[mech];
  if (k && (t.mods[k] | 0) > 0) return carryOp(t, () => { const m2 = Object.assign({}, t.mods); partAdd(k, m2[k]); m2[k] = 0; t.set(m2); t.missing[mech] = (t.missing[mech] | 0) + 1; });
  pullMech(t, mech);
  if (mech === 'wheelset' && (t.missing.wheelset | 0) >= (reqOf(t.type).wheelset | 0)) for (const a of WHEEL_ATT) if (t.mods[a]) { tPull(t, a); toast('The ' + MODOPTS[a].n.toLowerCase() + ' came off with the last wheel'); } }
function pullEngine(t) { for (const a of ENG_ATT) if (t.mods[a]) tPull(t, a); tPullEng(t); }
function fitEngine(t, id) { tFitEng(t, id); const c = { type: t.type, d: t.d, mods: t.mods, noEng: t.noEng }; for (const a of ENG_ATT) if (t.mods[a] && modWhy(a, c)) { tPull(t, a); toast(MODOPTS[a].n + ' came off — ' + modWhy(a, c).toLowerCase()); } }
// stripping the interior takes the seats out; putting it back needs seats
function fitWgt(t, v) { const m = t.mods; if ((m.wgt | 0) > 0) return tFit(t, 'wgt', v);
  carryOp(t, () => { if (!partUse('wgt', v)) return; const m2 = Object.assign({}, t.mods); if ((t.missing.seats | 0) > 0) delete t.missing.seats; else G.stash.items.seats = (G.stash.items.seats | 0) + 1; m2.wgt = v; t.set(m2); }); toast('Interior stripped — seats went on the shelf'); }
function pullWgt(t) { if (partHave('seats') < 1) return toast('You need seats & interior in stock to put the interior back');
  carryOp(t, () => { partTake('seats', 1); const m2 = Object.assign({}, t.mods); partAdd('wgt', m2.wgt); m2.wgt = 0; t.set(m2); }, (pc, used) => { if (used.seats) pc.seats = used.seats[0]; }); }
// ---- garage column: what's on the car, one row per physical slot ----
// which slot does a loose part go into?
function slotOfId(id) { if (id.includes(':')) { const k = id.split(':')[0]; return VARK[k] || (k === 'wgt' ? 'seats' : 'm:' + k); } return id.startsWith('eng_') ? 'eng' : id; }
function stockIds() { const out = [], P = PARTS(); for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike']) if (ITEMS[id] && partHave(id) > 0) out.push(id); for (const k of MECH) if (partHave(k) > 0) out.push(k); for (const id of Object.keys(P).sort()) if (P[id] > 0 && MODOPTS[id.split(':')[0]]) out.push(id); return out; }
function fitsSlot(id, t) { const mm = { d: t.d, type: t.type, mods: t.mods, missing: t.missing, noEng: t.noEng }, req = reqOf(t.type);
  if (id.startsWith('eng_')) return stockEng(t.type) && engFits(t, id);
  if (!id.includes(':')) return !!req[id];
  const [k, vs] = id.split(':'); if (!MODOPTS[k] || +vs >= MODOPTS[k].o.length) return false; if (VARK[k]) return !!req[VARK[k]]; if (k === 'wgt') return !!req.seats && tgtKeys(t).includes('wgt');
  return tgtKeys(t).includes(k) && !modWhy(k, mm) && +vs < modOpts(k, mm).length; }
const stockFor = (slot, t) => stockIds().filter(id => slotOfId(id) === slot && fitsSlot(id, t));
function slotName(slot) { return slot === 'eng' ? 'Engine' : slot.startsWith('m:') ? MODOPTS[slot.slice(2)].n : slot === 'seats' ? 'Seats / interior' : ITEMS[slot] ? ITEMS[slot].n : slot; }
const curSlot = () => Panel.slotCar === Panel.wsel ? Panel.slot : null;
function selectSlot(slot) { Panel.slot = curSlot() === slot ? null : slot; Panel.slotCar = Panel.wsel; Panel.render(); }
function fittedRows(H, c1, t, PC, e, se, req, M, m, red) { const mm = { d: t.d, type: t.type, mods: m, missing: M, noEng: t.noEng }, sub = (k, v) => { const o = modOpts(k, mm)[v] || MODOPTS[k].o[v]; return o ? o[0] : '?'; }, sel = curSlot();
  const mk = (slot, icon, name, text, btns, cond, empty, indent) => { const n = stockFor(slot, t).length, on = sel === slot, pickB = empty ? H.btn('Add' + (n ? ' (' + n + ')' : ''), () => selectSlot(slot), 'y', !n) : H.btn('Swap' + (n ? ' (' + n + ')' : ''), () => selectSlot(slot), 'y', !n);
    const r = tintRow(H.row(c1, icon, name, text, [pickB].concat(btns)), cond); if (indent) r.style.marginLeft = '18px'; if (empty === true) red(r);
    if (n) { r.style.cursor = 'pointer'; r.onclick = ev => { if (ev.target.tagName !== 'BUTTON') selectSlot(slot); }; } return r; };
  const att = (k, parentOk) => { const v = m[k] | 0, slot = 'm:' + k; if (!v) { if (parentOk && stockFor(slot, t).length) mk(slot, '↳', MODOPTS[k].n, 'None fitted', [], undefined, 'opt', 1); return; }
    mk(slot, '↳', MODOPTS[k].n, sub(k, v) + condTag(PC[slot]) + effTag(t, slot), fixBtn(H, t, slot).concat([H.btn('Remove', () => tPull(t, k))]), PC[slot], false, 1); };
  if (se) { mk('eng', '⚙', 'Engine', e ? ITEMS[e].n + (e === se ? ' (factory)' : ' (swapped in)') + condTag(PC.eng) + effTag(t, 'eng') : 'EMPTY — no engine', e ? fixBtn(H, t, 'eng').concat([H.btn('Remove', () => pullEngine(t))]) : [], PC.eng, !e); if (e) ENG_ATT.forEach(k => att(k, 1)); }
  for (const k in req) { const have = req[k] - (M[k] | 0), vk = VAR[k];
    if (k === 'seats' && m.wgt > 0) { mk('seats', '🪑', 'Interior', 'Stripped — ' + sub('wgt', m.wgt) + effTag(t, 'm:wgt'), [H.btn('Put interior back', () => pullWgt(t), '', partHave('seats') < 1)]); continue; }
    const what = have <= 0 ? 'EMPTY' : vk && m[vk] ? sub(vk, m[vk]) + ' (aftermarket)' : 'Stock';
    mk(k, k === 'wheelset' ? '🛞' : '🔧', ITEMS[k].n + (req[k] > 1 ? ' ' + Math.max(0, have) + '/' + req[k] : ''), (have < req[k] && have > 0 ? 'Missing ' + (req[k] - have) + ' · ' : '') + what + (have > 0 ? condTag(PC[k]) + effTag(t, k) : ''), have > 0 ? fixBtn(H, t, k).concat([H.btn('Remove', () => pullSlot(t, k))]) : [], have > 0 ? PC[k] : undefined, have < req[k]);
    if (k === 'wheelset') WHEEL_ATT.forEach(a => att(a, (M.wheelset | 0) === 0)); }
  for (const k of tgtKeys(t)) { if (VARK[k] || ENG_ATT.includes(k) || WHEEL_ATT.includes(k) || k === 'wgt' || k === 'swp') continue; const v = m[k] | 0, slot = 'm:' + k;
    if (!v) { if (stockFor(slot, t).length) mk(slot, '➕', MODOPTS[k].n, 'None fitted', [], undefined, 'opt'); continue; }
    mk(slot, '🔩', MODOPTS[k].n, sub(k, v) + condTag(PC[slot]) + effTag(t, slot), fixBtn(H, t, slot).concat([H.btn('Remove', () => tPull(t, k))]), PC[slot]); } }
// ---- loose stock column (unstacked) with slot-aware fitting ----
function looseRows(H, col, t, e, se, req, M, m) { let any = 0; const mm = { d: t.d, type: t.type, mods: m, missing: M, noEng: t.noEng };
  const sel = G._pk ? curSlot() : null, ok = id => !sel || (slotOfId(id) === sel && fitsSlot(id, t));
  if (sel) { const r = H.row(col, '🎯', 'Parts for: ' + slotName(sel), 'Only what fits this slot', []); r.style.background = '#11263a'; if (!stockFor(sel, t).length) { H.empty(col, 'Nothing in stock fits this slot. Buy parts online (Phone › Shop), "Buy for my garage" at a mod shop, the marketplace, or pull one off another car.'); return 1; } }
  const row = (icon, name, id, g, hint, fitBtn) => { any = 1; const btns = []; if (fitBtn) btns.push(fitBtn);
    if (g.c >= REPAIR_MIN && g.c < .95) { const cost = repairCost(loosePrice(id), g.c); btns.push(H.btn('Fix ' + money(cost), () => fixLoose(id, g.c), cost > loosePrice(id) * .45 ? 'r' : '')); }
    if (g.c < .7) btns.push(H.btn('Scrap', () => scrapLoose(id, g.c)));
    tintRow(H.row(col, icon, name + (g.n > 1 ? ' ×' + g.n : ''), hint + ' · ' + pct(g.c) + (g.c < REPAIR_MIN ? ' BROKEN' : g.c < .4 ? ' worn' : ''), btns), g.c); };
  const P = (id, c, f) => () => withPick(id, c, f);
  if (se) for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike']) { if (!partHave(id) || !ITEMS[id] || !ok(id)) continue; const fits = engFits(t, id);
    for (const g of looseGroups(id)) row('⚙', ITEMS[id].n, id, g, !fits ? 'Doesn\'t fit' : e === id ? 'Same engine as fitted — swap this one in' : e ? 'Replaces the ' + ITEMS[e].n.toLowerCase() + ' (add-ons that don\'t suit it come off)' : 'Drop it in', fits ? H.btn(e === id ? 'Swap' : 'Fit', P(id, g.c, () => fitEngine(t, id)), 'y') : null); }
  for (const k of MECH) { if (!partHave(k) || !ok(k)) continue; const need = (M[k] | 0) > 0, vk = VAR[k], after = vk && (m[vk] | 0) > 0;
    for (const g of looseGroups(k)) row(k === 'wheelset' ? '🛞' : '🔧', 'Stock ' + ITEMS[k].n.toLowerCase(), k, g, need ? 'Fills the empty slot' : !req[k] ? 'Not used on this vehicle' : k === 'seats' && m.wgt > 0 ? 'Interior is stripped — use "Put interior back"' : after ? 'Replaces the ' + modOpts(vk, mm)[m[vk]][0] + ' (goes on the shelf)' : 'Swap with the fitted one',
      need ? H.btn('Fit', P(k, g.c, () => fitPlain(t, k)), 'y') : req[k] && !(k === 'seats' && m.wgt > 0) ? H.btn('Swap', P(k, g.c, () => fitPlain(t, k)), 'y') : null); }
  const PRT = PARTS(); Object.keys(PRT).filter(id => PRT[id] > 0).sort().forEach(id => { const [k, vs] = id.split(':'), v = +vs; if (!MODOPTS[k] || !ok(id)) return; const o = modOpts(k, mm), inKeys = tgtKeys(t).includes(k) || (VARK[k] && req[VARK[k]]), why = inKeys ? modWhy(k, mm) : '', fits = inKeys && !why && v < MODOPTS[k].o.length, cur = (m[k] | 0) === v;
    for (const g of looseGroups(id)) { let hint, btn = null;
      if (!inKeys) hint = 'Doesn\'t fit a ' + t.d.name; else if (why) hint = why;
      else if (VARK[k]) { const mech = VARK[k], empty = (M[mech] | 0) > 0; hint = empty ? 'Fills the empty ' + ITEMS[mech].n.toLowerCase() + ' slot' : cur ? 'Same part fitted — swap this one in' : 'Replaces the ' + (m[k] ? o[m[k]][0] : 'stock ' + ITEMS[mech].n.toLowerCase()) + ' (goes on the shelf)'; btn = H.btn(empty ? 'Fit' : 'Swap', P(id, g.c, () => fitVarPart(t, mech, k, v)), 'y'); }
      else if (k === 'wgt') { hint = (m.wgt | 0) > 0 ? (cur ? 'Same — swap' : 'Replaces ' + o[m.wgt][0]) : 'Strips the interior — seats go on the shelf'; btn = H.btn(cur ? 'Swap' : 'Fit', P(id, g.c, () => fitWgt(t, v)), 'y'); }
      else { hint = cur ? 'Same part fitted — swap this one in' : (m[k] | 0) ? 'Replaces the ' + o[m[k]][0] + ' (goes on the shelf)' : ENG_ATT.includes(k) ? 'Goes on the engine' : WHEEL_ATT.includes(k) ? 'Goes on the wheels' : 'Bolt it on'; btn = H.btn(cur ? 'Swap' : 'Fit', P(id, g.c, () => tFit(t, k, v)), 'y'); }
      row('📦', partN(k, v, fits ? mm : null), id, g, hint, fits ? btn : null); } });
  return any; }
// stored records get cleaned up when you open them in the garage
{ const _tpc = tPC; tPC = function (t) { const c = { type: t.type, d: t.d, mods: t.mods, missing: t.missing, noEng: t.noEng }, o = tOwner(t), moved = [], m2 = Object.assign({}, t.mods);
  const off = k => { const v = m2[k] | 0; if (!v) return; const pcv = o.pc && o.pc[VARK[k] || 'm:' + k]; unitGive(pkey(k, v), pcv === undefined ? 1 : pcv); m2[k] = 0; moved.push(MODOPTS[k].n.toLowerCase()); };
  for (const k of ENG_ATT.concat(WHEEL_ATT)) if (m2[k] && modWhy(k, c)) off(k);
  for (const mech in VAR) if ((t.missing[mech] | 0) > 0 && m2[VAR[mech]]) off(VAR[mech]);
  if (moved.length) { t.set(m2); toast('The ' + moved.join(' & ') + ' came off — it\'s on your parts shelf'); } return _tpc(t); }; }
// ---------- garage › Parts tab: everything on your shelf, unstacked by condition — fix, scrap or sell ----------
const scrapVal = (id, c) => Math.max(5, r5(loosePrice(id) * .05 * (.3 + c)));
function partCat(id) { if (id.startsWith('eng_')) return 'Engines'; if (!id.includes(':')) return 'Stock parts'; const k = id.split(':')[0]; if (ENG_ATT.includes(k) || VARK[k] || ['brk', 'hnd', 'drv', 'wgt', 'arm'].includes(k) || MOTOK.includes(k)) return 'Performance'; if (WHEEL_ATT.includes(k)) return 'Wheels'; return 'Body & style'; }
function sellPart(id, c) { Panel.open('phone', { tab: 'market' }); Panel.msub = 'parts'; Panel.psub = 'sell'; Panel.sel = 'U' + id + '@' + c.toFixed(3); Panel.mask = null; Panel.render(); }
function partsTab(H) { const ids = stockIds(), c1 = H.col('Your parts'), cats = {}; let n = 0, val = 0, broken = [];
  for (const id of ids) for (const g of looseGroups(id)) { (cats[partCat(id)] = cats[partCat(id)] || []).push([id, g]); n += g.n; val += unitValue(id, g.c) * g.n; if (g.c < REPAIR_MIN) broken.push([id, g]); }
  if (!n) H.empty(c1, 'No loose parts. Remove parts from a car on the Vehicles tab, buy them online (Phone › Shop), at a mod shop, or on the marketplace.');
  for (const cat of ['Engines', 'Stock parts', 'Performance', 'Wheels', 'Body & style']) { const L = cats[cat]; if (!L) continue; c1.appendChild(H.mk('div', 'ptitle', cat));
    for (const [id, g] of L) { const nm = id.includes(':') ? partN(id.split(':')[0], +id.split(':')[1]) : (cat === 'Stock parts' ? 'Stock ' + ITEMS[id].n.toLowerCase() : ITEMS[id].n), btns = [];
      if (g.c >= REPAIR_MIN && g.c < .95) { const cost = repairCost(loosePrice(id), g.c); btns.push(H.btn('Fix ' + money(cost), () => fixLoose(id, g.c), cost > loosePrice(id) * .45 ? 'r' : '')); }
      if (g.c < .95 && typeof benchAdd === 'function') btns.push(H.btn('Slow fix ' + money(slowCost(loosePrice(id), g.c)), () => benchAdd(id, g.c))); btns.push(H.btn('Sell', () => sellPart(id, g.c), 'y')); btns.push(H.btn('Scrap +' + money(scrapVal(id, g.c)), () => scrapLoose(id, g.c)));
      const r = tintRow(H.row(c1, RARE.has(id) ? '💎' : id.startsWith('eng_') ? '⚙' : id.includes(':') ? '🔩' : '🔧', nm + (g.n > 1 ? ' ×' + g.n : ''), 'Worth ≈ ' + money(unitValue(id, g.c)) + ' each · ' + pct(g.c) + (g.c < REPAIR_MIN ? ' BROKEN' : g.c < .4 ? ' worn' : ''), btns), g.c); r.classList.add('pmsg'); } }
  const c2 = H.col('Summary'); H.row(c2, '📦', n + ' part' + (n === 1 ? '' : 's') + ' on the shelf', 'Worth about ' + money(val) + ' to private buyers', []);
  const listed = (VMK().plist || []).filter(l => l.held); if (listed.length) H.row(c2, '🏷', listed.length + ' listed on the marketplace', 'Phone › Marketplace › Parts', [H.btn('Open', () => { Panel.open('phone', { tab: 'market' }); Panel.msub = 'parts'; Panel.psub = 'sell'; Panel.render(); })]);
  if (broken.length) { const tot = broken.reduce((a, [id, g]) => a + scrapVal(id, g.c) * g.n, 0); H.row(c2, '🗑', broken.reduce((a, b) => a + b[1].n, 0) + ' broken part(s)', 'Too far gone to fix', [H.btn('Scrap all broken +' + money(tot), () => { for (const [id, g] of broken) for (let i = 0; i < g.n; i++) scrapLoose(id, g.c); })]); }
  c2.appendChild(H.mk('div', 'pempty', 'Fix: back to 95% — the cost climbs steeply with wear and goes through the roof below 30%, so wrecked parts are usually better scrapped and replaced. Sell: lists it on the parts marketplace — buyers either meet you or have it shipped.')); }
{ const hg = PMODES.hgarage; PMODES.hgarage = function (H) { if (this.tab !== 'parts' && this.tab !== 'veh') this.tab = 'veh'; H.tabBtn('veh', '🚗 Vehicles'); H.tabBtn('parts', '📦 Parts (' + stockIds().reduce((a, id) => a + looseN(id), 0) + ')');
  if (this.tab === 'parts') { H.title.textContent = '📦 Parts shelf'; return partsTab(H); } return hg.call(this, H); }; }
