// ================= PART CONDITION: every part has its own wear; the car's condition is made of its parts =================
const PCOSM = new Set(['liv', 'tint', 'neon', 'hl', 'p', 's', 'swp']);
const PEXPO = { panels: 1.8, wheelset: 1.3, exhaustp: 1.1, seats: .7, wiring: .8, gearbox: .85, eng: .9, 'm:rim': 1.3, 'm:sp': 1.6, 'm:hd': 1.6, 'm:sk': 1.6 };
const isPartId = id => id.includes(':') || MECH.includes(id) || id.startsWith('eng_');
const PLC = () => G.save.lc || (G.save.lc = {});
const r5 = n => Math.round(n / 5) * 5;
const pct = c => Math.round(c * 100) + '%';
const condCol = c => c >= .7 ? '#57e389' : c >= .4 ? '#f2c230' : c >= .12 ? '#ff9f43' : '#ff6b6b';
// ---- what's on a car (record or live car) ----
function pcSlots(type, mods, missing, noEng) {
  const out = [], se = stockEng(type), req = buildReq(type);
  if (se && !noEng) out.push('eng');
  for (const k in req) if (req[k] - ((missing || {})[k] | 0) > 0) out.push(k);
  for (const k in mods || {}) if (MODOPTS[k] && !PCOSM.has(k) && mods[k] > 0) out.push('m:' + k);
  return out;
}
const pcW = s => s === 'eng' ? 4 : s.startsWith('m:') ? .4 : (MECHW[s] || 1);
function pcAvg(pc, slots) { let a = 0, w = 0; for (const s of slots) { a += pc[s] * pcW(s); w += pcW(s); } return w ? a / w : 1; }
function engOf(type, mods, noEng) { if (noEng) return null; return mods && mods.swp ? ENGS[mods.swp].id : stockEng(type); }
function slotPrice(s, type, mods) {
  if (s === 'eng') { const e = engOf(type, mods); return e && ITEMS[e] ? ITEMS[e].v : 1500; }
  if (s.startsWith('m:')) { const k = s.slice(2), o = MODOPTS[k] && MODOPTS[k].o[(mods || {})[k] | 0]; return (o && o[1]) || 150; }
  return (ITEMS[s] ? ITEMS[s].v : 150) * Math.max(1, buildReq(type)[s] | 0);
}
// build / sync the per-part conditions against the car's current overall condition
function ensurePC(o, type, condNow) {
  const mods = o.mods || {}, slots = pcSlots(type, mods, o.missing, o.noEng); const fresh = !o.pc; o.pc = o.pc || {};
  for (const s in o.pc) if (!slots.includes(s)) delete o.pc[s];
  if (!slots.length) { o.pcAvg = condNow; return condNow; }
  const base = clamp(condNow, .03, 1), added = slots.filter(s => o.pc[s] === undefined);
  for (const s of added) o.pc[s] = clamp(base + (base < .98 ? rnd(-.22, .22) : 0), .04, 1);
  if (fresh || o.pcAvg === undefined) { for (let it = 0; it < 3; it++) { const a = pcAvg(o.pc, slots); if (a > 0) for (const s of slots) o.pc[s] = clamp(o.pc[s] * base / a, .03, 1); } o.pcAvg = pcAvg(o.pc, slots); return o.pcAvg; }
  const a = pcAvg(o.pc, slots), want = clamp(condNow, .03, 1);
  if (Math.abs(want - o.pcAvg) > .015) {
    if (want < o.pcAvg) { // damage: exposed parts take the beating
      let W = 0, E = 0; for (const s of slots) { W += pcW(s); E += pcW(s) * (PEXPO[s] || .7); } const k = W / E, dmg = a - want;
      for (const s of slots) o.pc[s] = clamp(o.pc[s] - dmg * k * (PEXPO[s] || .7), .02, 1);
    } else if (a < 1) { const t = clamp((want - a) / (1 - a), 0, 1); for (const s of slots) o.pc[s] = o.pc[s] + (1 - o.pc[s]) * t; } // body shop repair lifts everything
  }
  return o.pcAvg = pcAvg(o.pc, slots);
}
// the target used by the garage screen (live car on the pad, or a stored record)
function tPC(t) {
  if (t.kind === 'car') { const c = t.c, cur = c.hp / c.st.hp; const a = ensurePC(c, c.type, cur); if (Math.abs(a - cur) > .005) c.hp = c.st.hp * a; return c.pc; }
  const r = t.r; const a = ensurePC(r, r.type, r.cond === undefined ? 1 : r.cond); r.cond = a; return r.pc;
}
function tOwner(t) { return t.kind === 'car' ? t.c : t.r; }
function tRecalc(t) { const o = tOwner(t), slots = pcSlots(t.type, t.mods, t.missing, t.noEng); for (const s in o.pc || {}) if (!slots.includes(s)) delete o.pc[s]; const a = slots.length ? pcAvg(o.pc, slots) : 1; o.pcAvg = a; if (t.kind === 'car') { applyMods(t.c); t.c.hp = t.c.st.hp * a; } else t.r.cond = a; }
// ---- loose stock: a list of conditions per part id, kept in step with the counts ----
const looseN = id => id.includes(':') ? (PARTS()[id] | 0) : partHave(id);
function lcList(id) { const L = PLC(), n = looseN(id); let a = L[id] || (L[id] = []); while (a.length < n) a.push(1); if (a.length > n) { a.sort((x, y) => y - x); a.length = n; } if (!n) delete L[id]; return a; }
function snapCounts() { const s = {}; for (const k in G.stash.items) s[k] = G.stash.items[k] | 0; const P = PARTS(); for (const k in P) s[k] = P[k] | 0; return s; }
// run an action and give / take conditions on whatever loose stock it added / used
function withConds(give, fn) {
  for (const id of new Set(Object.keys(G.stash.items).concat(Object.keys(PARTS())))) if (isPartId(id)) lcList(id);
  const b = snapCounts(); const r = fn(); const a = snapCounts(), used = {};
  for (const id of new Set(Object.keys(a).concat(Object.keys(b)))) {
    if (!isPartId(id)) continue; const d = (a[id] | 0) - (b[id] | 0); if (!d) continue; const L = PLC(), arr = L[id] || (L[id] = []);
    if (d > 0) for (let i = 0; i < d; i++) arr.push(clamp(give(id), .02, 1));
    else { arr.sort((x, y) => y - x); if (G._pick && G._pick.id === id) { const i = pickIdx(arr, G._pick.c); used[id] = arr.splice(i, 1); for (let j = 1; j < -d; j++) used[id].push(arr.shift()); } else used[id] = arr.splice(0, -d); if (!arr.length) delete L[id]; }
  }
  return used;
}
const pickIdx = (a, c) => { let bi = 0, bd = 9; a.forEach((x, i) => { const d = Math.abs(x - c); if (d < bd) { bd = d; bi = i; } }); return bi; };
function withPick(id, c, fn) { G._pick = c === undefined ? null : { id, c }; try { return fn(); } finally { G._pick = null; } }
const avgOf = a => a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : 1;
// ---- wrap every fit / pull so conditions travel with the parts ----
function slotFor(id) { if (id.includes(':')) return 'm:' + id.split(':')[0]; if (ITEMS[id] && id.startsWith('eng_')) return 'eng'; return id; }
function carryOp(t, fn, after) { const pc = tPC(t); const used = withConds(id => pc[slotFor(id)] !== undefined ? pc[slotFor(id)] : 1, fn); if (after) after(pc, used); tRecalc(t); }
{
  const _tFit = tFit, _tPull = tPull, _pullMech = pullMech, _fitMech = fitMech, _tPullEng = tPullEng, _tFitEng = tFitEng;
  const sameSwap = (t, id, slot) => { const pc = tPC(t), a = lcList(id); if (!a.length) return; a.sort((x, y) => y - x); const i = G._pick && G._pick.id === id ? pickIdx(a, G._pick.c) : 0; if (Math.abs(a[i] - (pc[slot] || 0)) < .005) return toast('Same condition as the fitted one'); const tmp = pc[slot]; pc[slot] = a[i]; a[i] = tmp; tRecalc(t); Snd.play('ratchet'); toast('Swapped — fitted one is now ' + pct(pc[slot])); doSave(true); };
  tFit = (t, k, v) => (t.mods[k] | 0) === v ? sameSwap(t, pkey(k, v), 'm:' + k) : carryOp(t, () => _tFit(t, k, v), (pc, used) => { const u = used[pkey(k, v)]; if (u) pc['m:' + k] = u[0]; });
  tPull = (t, k) => carryOp(t, () => _tPull(t, k), pc => { delete pc['m:' + k]; });
  pullMech = (t, k) => carryOp(t, () => _pullMech(t, k));
  fitMech = (t, k) => { const req = reqOf(t.type), had = (req[k] | 0) - (t.missing[k] | 0); carryOp(t, () => _fitMech(t, k), (pc, used) => { const u = used[k]; if (u) pc[k] = had > 0 && pc[k] !== undefined ? (pc[k] * had + u[0]) / (had + 1) : u[0]; }); };
  tPullEng = t => carryOp(t, () => _tPullEng(t), pc => { delete pc.eng; });
  tFitEng = (t, e) => engOf(t.type, t.mods, t.noEng) === e ? sameSwap(t, e, 'eng') : carryOp(t, () => _tFitEng(t, e), (pc, used) => { const u = used[e]; if (u) pc.eng = u[0]; });
}
// parting out: everything that comes off keeps its own condition
{ const _partOut = partOut; partOut = function (i) { const r = myCars()[i]; if (!r) return _partOut(i); const pc = Object.assign({}, ensurePC(r, r.type, r.cond === undefined ? 1 : r.cond) && r.pc); withConds(id => pc[slotFor(id)] !== undefined ? pc[slotFor(id)] : clamp((r.cond || 1) + rnd(-.15, .1), .05, 1), () => _partOut(i)); }; }
// store / take out keep the per-part wear with the car
{ const _store = storeCar; storeCar = function (c) { const L = myCars(), n = L.length; if (c.pc) ensurePC(c, c.type, c.hp / c.st.hp); _store(c); if (L.length > n && c.pc) { const r = L[L.length - 1]; r.pc = Object.assign({}, c.pc); r.pcAvg = c.pcAvg; } };
  const _take = takeOut; takeOut = function (i, g) { const rec = myCars()[i], n = G.cars.length; _take(i, g); const c = G.cars[G.cars.length - 1]; if (rec && rec.pc && G.cars.length > n && c.type === rec.type) { c.pc = Object.assign({}, rec.pc); c.pcAvg = rec.pcAvg; applyMods(c); } }; }
// effective stats: worn engine / gearbox / wheels and worn performance parts lose part of what they give
function effSt(d, mods, pc) { const st = Object.assign({}, calcSt(d, mods || {})); if (!pc) return st;
  for (const s in pc) { if (!s.startsWith('m:')) continue; const c = pc[s]; if (c >= .999) continue; const k = s.slice(2), wo = Object.assign({}, mods); wo[k] = 0; const b = calcSt(d, wo); for (const f of ['max', 'acc', 'grip']) if (typeof st[f] === 'number' && typeof b[f] === 'number') st[f] -= (st[f] - b[f]) * (1 - c) * .6; }
  const e = pc.eng === undefined ? 1 : pc.eng, g = pc.gearbox === undefined ? 1 : pc.gearbox, w = pc.wheelset === undefined ? 1 : pc.wheelset, f = .7 + .3 * Math.min(1, (e * 2 + g) / 3 + .15);
  st.acc *= f; st.max *= (.88 + .12 * f); if (typeof st.grip === 'number') st.grip *= .82 + .18 * Math.min(1, w + .2); return st; }
{ const _am = applyMods; applyMods = function (c, m) { _am(c, m); if (c.pc && c.st) { const e = effSt(c.d, c.mods, c.pc); c.st = Object.assign({}, c.st, { max: e.max, acc: e.acc, grip: e.grip !== undefined ? e.grip : c.st.grip }); } }; }
// what a part does compared with stock (and with a fresh one)
function slotEffect(t, s) { const m = t.mods, pc = tOwner(t).pc || {}, cur = effSt(t.d, m, pc), wo = Object.assign({}, m), pc2 = Object.assign({}, pc);
  if (s === 'eng') { if (wo.swp) wo.swp = 0; delete pc2.eng; } else if (s.startsWith('m:')) { wo[s.slice(2)] = 0; delete pc2[s]; } else delete pc2[s];
  const base = effSt(t.d, wo, pc2), out = [], dp = (a, b) => Math.round((a / b - 1) * 100);
  for (const [f, n] of [['acc', 'accel'], ['max', 'speed'], ['grip', 'grip']]) { if (typeof cur[f] !== 'number' || !base[f]) continue; const v = dp(cur[f], base[f]); if (Math.abs(v) >= 1) out.push((v > 0 ? '+' : '') + v + '% ' + n); }
  return out.length ? out.join(', ') + ' vs ' + (s === 'eng' || s.startsWith('m:') ? 'stock' : 'new') : ''; }
// ---- wear from driving: tuned engines and worn parts wear faster ----
function wearTick(dt) { const c = pCar(); if (!c || !c.owned || c.d.pedal || c.d.boat || G.scene) return; const sp = Math.abs(c.spd || 0); if (sp < 50) return;
  if (!c.pc) ensurePC(c, c.type, c.hp / c.st.hp); const pc = c.pc, m = c.mods || {}, r = dt * Math.min(1.6, sp / 380);
  let perf = 1; for (const k of ['tur', 'eng', 'ecu', 'nos']) if (m[k]) perf += .15 * m[k]; if (m.swp) perf += .3;
  const wear = (s, k) => { if (pc[s] !== undefined) pc[s] = Math.max(.01, pc[s] - k * r * (1.6 - pc[s])); };
  const SLOW = 1 / 6; wear('eng', SLOW * .00005 * perf * (c.throttle > .5 ? 1.3 : 1)); wear('gearbox', SLOW * .00004 * perf); wear('wheelset', SLOW * .00008 * (c.hand ? 3 : 1)); wear('exhaustp', SLOW * .00002);
  for (const s in pc) if (s.startsWith('m:') && ['tur', 'eng', 'ecu', 'tyr', 'brk', 'hnd', 'trn', 'nos'].includes(s.slice(2))) wear(s, SLOW * .00004 * perf);
  if ((G.wearT = (G.wearT || 0) - dt) <= 0) { G.wearT = 4; const slots = pcSlots(c.type, m, c.missing, c.noEng), a = pcAvg(pc, slots), old = c.pcAvg === undefined ? a : c.pcAvg; applyMods(c);  c.pcAvg = a;
    if (pc.eng !== undefined && pc.eng < .25 && !c.engWarn) { c.engWarn = 1; msg('⚠ Your engine is badly worn (' + pct(pc.eng) + ') — get it fixed or swapped.', '#ff9f43'); } } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') wearTick(dt); }; }
// ---- repair / scrap ----
const REPAIR_MIN = 0; // no 'broken' class — badly damaged parts just get brutally expensive to fix
// DIY repair = parts & consumables: climbs steeply once a part is badly worn, but never costs more than ~2/3 of a new one
const repairCost = (price, c) => r5(20 + price * (.55 * Math.pow(1 - clamp(c, 0, 1), 1.7) + .25 * Math.pow(Math.max(0, .3 - c) / .3, 2)));
function fixSlot(t, s) { const pc = tPC(t), c = pc[s]; if (c === undefined || c >= .95) return; if (c < REPAIR_MIN) return toast('Too far gone to fix — pull it and scrap it'); const cost = repairCost(slotPrice(s, t.type, t.mods), c); if (!payAny(cost)) return; pc[s] = .95; tRecalc(t); Snd.play('ratchet'); toast('Fixed — ' + money(cost)); doSave(true); }
function loosePrice(id) { if (id.includes(':')) { const [k, v] = id.split(':'), o = MODOPTS[k] && MODOPTS[k].o[+v]; return (o && o[1]) || 150; } return ITEMS[id] ? ITEMS[id].v : 100; }
function fixLoose(id, pc0) { const a = lcList(id); if (!a.length) return; a.sort((x, y) => x - y); const i = pc0 !== undefined ? pickIdx(a, pc0) : a.findIndex(c => c >= REPAIR_MIN && c < .95); if (a[i] < REPAIR_MIN) return toast('Too far gone to fix — scrap it'); if (i < 0) return toast('Nothing fixable — scrap the junk'); const cost = repairCost(loosePrice(id), a[i]); if (!payAny(cost)) return; a[i] = .95; Snd.play('ratchet'); toast('Fixed — ' + money(cost)); doSave(true); }
function scrapLoose(id, pc0) { const a = lcList(id); if (!a.length) return; a.sort((x, y) => x - y); const j = pc0 !== undefined ? pickIdx(a, pc0) : 0, c = a[j], got = Math.max(5, r5(loosePrice(id) * .05 * (.3 + c))); if (id.includes(':')) { const [k, v] = id.split(':'); partUse(k, +v); } else partTake(id, 1); a.splice(j, 1); if (!a.length) delete PLC()[id]; addCash(got); Snd.play('grinder'); toast('Scrapped for ' + money(got)); doSave(true); }
// ---- UI helpers used by the garage screen ----
function condTag(c) { return c === undefined ? '' : ' · ' + pct(c) + (c < REPAIR_MIN ? ' BROKEN' : c < .4 ? ' worn' : ''); }
function fixBtn(H, t, s) { const pc = tOwner(t).pc || {}, c = pc[s]; if (c === undefined || c >= .95) return []; const price = slotPrice(s, t.type, t.mods); if (c < REPAIR_MIN) return [H.btn('Junk', () => toast('Too far gone — pull it, scrap it, fit a fresh one'), '', true)]; const cost = repairCost(price, c); return [H.btn('Fix ' + money(cost), () => fixSlot(t, s), cost > price * .45 ? 'r' : '')]; }
function looseInfo(id) { const a = lcList(id).slice().sort((x, y) => y - x); if (!a.length) return ''; return a.length === 1 ? pct(a[0]) : a.slice(0, 5).map(pct).join(' · ') + (a.length > 5 ? ' …' : ''); }
function looseBtns(H, id) { const a = lcList(id); if (!a.length) return []; const worst = Math.min(...a), fixable = a.filter(c => c >= REPAIR_MIN && c < .95), out = [];
  if (fixable.length) { const w = Math.min(...fixable), cost = repairCost(loosePrice(id), w); out.push(H.btn('Fix ' + money(cost), () => fixLoose(id), cost > loosePrice(id) * .45 ? 'r' : '')); }
  if (worst < .7) out.push(H.btn('Scrap', () => scrapLoose(id))); return out; }
function tintRow(r, c) { if (c === undefined) return r; const s = r.querySelector('small'); if (s) { const i = s.textContent.lastIndexOf(pct(c)); if (i >= 0) s.innerHTML = s.textContent.slice(0, i).replace(/</g, '&lt;') + '<b style="color:' + condCol(c) + '">' + s.textContent.slice(i).replace(/</g, '&lt;') + '</b>'; } return r; }
// swap a worn fitted component for a better loose one (no missing slot needed)
function mechSwap(t, k) { const pc = tPC(t), a = lcList(k); if (!a.length) return; a.sort((x, y) => y - x); const i = G._pick && G._pick.id === k ? pickIdx(a, G._pick.c) : 0; const cur = pc[k] === undefined ? 1 : pc[k]; if (Math.abs(a[i] - cur) < .005) return toast('Same condition as the fitted one'); const have = (reqOf(t.type)[k] | 0) - (t.missing[k] | 0), nw = (cur * (have - 1) + a[i]) / Math.max(1, have); a[i] = cur; pc[k] = nw; tRecalc(t); Snd.play('ratchet'); toast('Swapped — ' + ITEMS[k].n + ' now ' + pct(nw)); doSave(true); }
// used parts bought on the marketplace aren't always mint
{ const _bl = buyListing; buyListing = function (l, price) { if (l.kind !== 'part') return _bl(l, price); if (l.cond === undefined) l.cond = l.arch === 'steal' ? rnd(.35, .85) : l.arch === 'deal' ? rnd(.5, .95) : rnd(.7, 1); let r; withConds(() => l.cond, () => { r = _bl(l, price); }); return r; }; }
{ const hg1 = PMODES.hgarage; PMODES.hgarage = function (H) { const r = hg1.call(this, H); const cols = H.body.querySelectorAll('.pcol'); for (let i = 1; i < cols.length; i++) cols[i].querySelectorAll('.prow').forEach(x => x.classList.add('pmsg')); return r; }; }
// ---------- your cars are labelled in the street so you never break into your own by mistake ----------
{ const _dgp = drawGaragePads; drawGaragePads = function () { _dgp(); if (G.scene) return; const p = G.player; if (!p || p.car) return;
  for (const c of G.cars) { if (!c.owned || c.dead || c.driver || c.remote || !inView(c.x, c.y, 40)) continue; const d2 = dist2(c.x, c.y, p.x, p.y); if (d2 > 520 * 520) continue;
    const y = c.y - Math.max(c.L, c.W) / 2 - 14, a = d2 < 200 * 200 ? 1 : .6; ctx.save(); ctx.globalAlpha = a; ctx.font = 'bold 11px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; const t = '🔑 YOURS'; ctx.strokeText(t, c.x, y); ctx.fillStyle = '#57e389'; ctx.fillText(t, c.x, y); ctx.restore(); } }; }
function effTag(t, s) { const e = slotEffect(t, s); return e ? ' · ' + e : ''; }
// loose stock, unstacked: one row per condition so you pick exactly which one goes in
function looseGroups(id) { const a = lcList(id).slice().sort((x, y) => y - x), out = []; for (const c of a) { const g = out.find(o => Math.round(o.c * 20) === Math.round(c * 20)); if (g) g.n++; else out.push({ c, n: 1 }); } return out; }
function looseRows(H, col, t, e, se, req, M, m) { let any = 0; const mm = { d: t.d, type: t.type, mods: m };
  const row = (icon, name, id, g, hint, fitBtn) => { any = 1; const btns = []; if (fitBtn) btns.push(fitBtn);
    if (g.c >= REPAIR_MIN && g.c < .95) { const cost = repairCost(loosePrice(id), g.c); btns.push(H.btn('Fix ' + money(cost), () => fixLoose(id, g.c), cost > loosePrice(id) * .45 ? 'r' : '')); }
    if (g.c < .7) btns.push(H.btn('Scrap', () => scrapLoose(id, g.c)));
    tintRow(H.row(col, icon, name + (g.n > 1 ? ' ×' + g.n : ''), hint + ' · ' + pct(g.c) + (g.c < REPAIR_MIN ? ' BROKEN' : g.c < .4 ? ' worn' : ''), btns), g.c); };
  if (se) for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike']) { if (!partHave(id) || !ITEMS[id]) continue; const fits = engFits(t, id);
    for (const g of looseGroups(id)) row('⚙', ITEMS[id].n, id, g, !fits ? 'Doesn\'t fit' : e === id ? 'Same engine as fitted — swap this one in' : e ? 'Swap — old engine back to stock' : 'Drop it in', fits ? H.btn(e === id ? 'Swap' : 'Fit', () => withPick(id, g.c, () => tFitEng(t, id)), 'y') : null); }
  for (const k of MECH) { if (!partHave(k)) continue; const need = (M[k] | 0) > 0;
    for (const g of looseGroups(k)) row('🔧', ITEMS[k].n, k, g, need ? 'This car is missing ' + M[k] : req[k] ? 'Swap with the fitted one' : 'Not used on this vehicle', need ? H.btn('Fit', () => withPick(k, g.c, () => fitMech(t, k)), 'y') : req[k] ? H.btn('Swap', () => withPick(k, g.c, () => mechSwap(t, k)), 'y') : null); }
  const PRT = PARTS(); Object.keys(PRT).filter(id => PRT[id] > 0).sort().forEach(id => { const [k, vs] = id.split(':'), v = +vs; if (!MODOPTS[k]) return; const o = modOpts(k, mm), fits = tgtKeys(t).includes(k) && v < o.length, cur = (m[k] | 0) === v;
    for (const g of looseGroups(id)) row('📦', partN(k, v, fits ? mm : null), id, g, !fits ? 'Doesn\'t fit' : cur ? 'Same part fitted — swap this one in' : (m[k] | 0) ? 'Swap — ' + o[m[k]][0] + ' back to stock' : 'Bolt it on', fits ? H.btn(cur ? 'Swap' : 'Fit', () => withPick(id, g.c, () => tFit(t, k, v)), 'y') : null); });
  return any; }
// ---- worn / broken parts drag the resale value down ----
function partsAdjValue(r, v) { if (!r || !r.pc) return v; let loss = 0; const m = r.mods || {};
  for (const s in r.pc) { const c = r.pc[s]; if (s.startsWith('m:')) { const k = s.slice(2), o = MODOPTS[k] && MODOPTS[k].o[m[k] | 0]; if (o && o[1]) loss += o[1] * .45 * (1 - c) * .9; } if (c < REPAIR_MIN) loss += slotPrice(s, r.type, m) * .25; }
  return Math.max(50, r50(v - loss)); }
// ---- parts market: list any single loose part (worn or not), engines and mechanical parts included ----
const unitName = id => id.includes(':') ? pkName(id) : 'Part — ' + (ITEMS[id] ? ITEMS[id].n : id);
const unitBase = id => id.includes(':') ? pkValue(id) : r50((ITEMS[id] ? ITEMS[id].v : 100) * .55);
const unitValue = (id, c) => Math.max(10, r50(unitBase(id) * (.12 + .88 * Math.pow(clamp(c, 0, 1), 1.3))));
function unitTake(id, c) { const a = lcList(id); if (!a.length) return null; a.sort((x, y) => y - x); const i = pickIdx(a, c), got = a.splice(i, 1)[0]; if (id.includes(':')) { const [k, v] = id.split(':'); partUse(k, +v); } else partTake(id, 1); if (!a.length) delete PLC()[id]; return got; }
function unitGive(id, c) { const L = PLC(), a = L[id] || (L[id] = []); lcList(id); a.push(c); if (id.includes(':')) { const [k, v] = id.split(':'); const P = PARTS(); P[id] = (P[id] | 0) + 1; } else G.stash.items[id] = (G.stash.items[id] | 0) + 1; }
function sellableIds() { const out = []; const P = PARTS(); for (const id in P) if (P[id] > 0 && MODOPTS[id.split(':')[0]]) out.push(id); for (const id of MECH.concat(['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike'])) if (ITEMS[id] && partHave(id) > 0) out.push(id); return out; }
function partsSellView(H, P, top, M) { M.plist = M.plist || [];
  for (const l of M.plist.slice()) if (!l.held) { const c = unitTake(l.pk, 1); if (c === null) { M.plist.splice(M.plist.indexOf(l), 1); continue; } l.held = 1; l.cond = c; l.v = unitValue(l.pk, c); }
  if (M.plist.length) { H.mk && top.appendChild(H.mk('div', 'ptitle', 'Your listings')); for (const l of M.plist) { const r = tintRow(H.row(top, l.rare ? '💎' : '🔩', unitName(l.pk), 'Listed at ' + money(l.ask) + ' · ' + pct(l.cond), [H.btn(P.sel === 'L' + l.id ? 'Editing' : 'Edit', () => { P.sel = 'L' + l.id; P.mask = null; }, P.sel === 'L' + l.id ? 'on' : '')]), l.cond); if (P.sel === 'L' + l.id) r.classList.add('sel'); } }
  const ids = sellableIds(); top.appendChild(H.mk('div', 'ptitle', 'On your shelf'));
  if (!ids.length) H.empty(top, 'No loose parts. Pull them off a car in your garage first — worn ones sell too, just for less.');
  for (const id of ids) for (const g of looseGroups(id)) { const key = 'U' + id + '@' + g.c.toFixed(3); const r = tintRow(H.row(top, RARE.has(id) ? '💎' : id.includes(':') ? '🔩' : ITEMS[id].e || '🔧', unitName(id) + (g.n > 1 ? ' ×' + g.n : ''), 'Worth about ' + money(unitValue(id, g.c)) + ' · ' + pct(g.c) + (g.c < REPAIR_MIN ? ' BROKEN' : g.c < .4 ? ' worn' : ''), [H.btn(P.sel === key ? 'Selected' : 'List', () => { P.sel = key; P.mask = null; }, P.sel === key ? 'on' : 'y')]), g.c); if (P.sel === key) r.classList.add('sel'); }
  const sel = P.sel || '', cur = sel[0] === 'L' ? M.plist.find(l => 'L' + l.id === sel) : null, um = sel[0] === 'U' ? sel.slice(1).split('@') : null;
  if (!cur && !(um && ids.includes(um[0]))) { H.empty(H.col('Listing'), 'Pick a part to list. Buyers pay by condition: a fresh part sells near market, a worn one for a fraction, a broken one for scrap-plus.'); return; }
  const id = cur ? cur.pk : um[0], c = cur ? cur.cond : +um[1], v = unitValue(id, c), c2 = H.col(unitName(id).split(' — ')[1] || unitName(id));
  if (!P.mask || P.mask.id !== sel) P.mask = { id: sel, v: cur ? cur.ask : v }; const a = P.mask, ratio = a.v / v;
  tintRow(H.row(c2, '🔍', 'Condition ' + pct(c), c < .15 ? 'Wrecked — buyers want it for parts' : c < .4 ? 'Worn — expect lowballs' : c < .8 ? 'Used, works fine' : 'Like new', []), c);
  H.row(c2, '💵', 'Asking ' + money(a.v), ratio < .85 ? 'Priced to move' : ratio < 1.05 ? 'Fair — buyers should reach out soon' : ratio < 1.25 ? 'On the high side' : 'Way over — expect a long wait', [H.btn('−10%', () => { a.v = Math.max(10, r50(a.v * .9)); }), H.btn('+10%', () => { a.v = r50(a.v * 1.1); })]);
  H.row(c2, '🔧', 'New, it\'s about ' + money(id.includes(':') ? pkShop(id) : (ITEMS[id] ? ITEMS[id].v : 0)), 'Private value at this condition ≈ ' + money(v), []);
  if (cur) { H.foot.appendChild(H.btn('Update price', () => { cur.ask = a.v; toast('Price updated'); }, 'y')); H.foot.appendChild(H.btn('Take it down', () => { M.plist = M.plist.filter(x => x !== cur); unitGive(cur.pk, cur.cond); for (const m of M.msgs) if (m.lid === cur.id) m.done = 1; P.sel = null; doSave(true); })); }
  else H.foot.appendChild(H.btn('Post listing', () => { const got = unitTake(id, c); if (got === null) return toast('You no longer have that part'); M.plist.push({ id: 'pl' + (M.seq++), pk: id, held: 1, cond: got, ask: a.v, v: unitValue(id, got), rare: RARE.has(id) ? 1 : 0, nextT: M.clock + waitFor(a.v / unitValue(id, got)) * (.4 + Math.random() * .8) }); Snd.play('pop'); toast('Listed!'); P.sel = null; doSave(true); }, 'y'));
}
function heldTick() { const M = VMK(), now = M.clock; for (const l of M.plist || []) { if (!l.held || now < l.nextT) continue; const c = l.cond, bv = l.v * (.85 + Math.random() * .3), low = Math.random() < .25 + (1 - c) * .3; let offer = low ? Math.max(10, r50(l.v * (.4 + Math.random() * .2))) : l.ask <= bv ? l.ask : r50(Math.min(bv, l.ask * .95) * (.88 + Math.random() * .1)); offer = Math.max(10, Math.min(offer, l.ask));
  const who = randName(), nm = unitName(l.pk), short = nm.split(' — ')[1] || nm, worn = c < .4;
  M.msgs.unshift({ unread: 1, flav: 1, id: 'x' + (M.seq++), side: 'sell', pk: l.pk, held: 1, pname: nm, lid: l.id, who, bv, offer, t: now, exp: now + 300, kind: 'offer', text: low ? pick([(worn ? 'It\'s pretty beat up. ' : '') + money(offer) + ', cash.', 'I\'ll give you ' + money(offer) + ' for it.', money(offer) + '? It\'s used' + (worn ? ' and worn out.' : '.')]) : pick([(c < REPAIR_MIN ? 'Need it for a rebuild — ' : 'Still have the ' + short + '? ') + money(offer) + ' works.', 'Interested! ' + money(offer) + '?', (worn ? 'Project part, I don\'t mind the wear. ' : '') + money(offer) + '.']) });
  l.nextT = now + waitFor(l.ask / l.v) * (l.rare ? .8 : 1.2) * (.5 + Math.random()); mkNote(who.split(' ')[0] + ' wants your ' + short); } }
{ const _mt = marketTick; marketTick = function (dt) { _mt(dt); if (G.save && G.save.mkt && (G._ht = (G._ht || 0) - dt) <= 0) { G._ht = .5; heldTick(); } }; }
function sellToC(m) { const M = VMK(), l = (M.plist || []).find(x => x.id === m.lid); if (!(l && l.held)) return sellToR(m);
  const fee = r50(m.offer * .05); addCash(m.offer - fee); m.done = 1; m.kind = 'sold'; m.text = 'Sold to ' + m.who + ' for ' + money(m.offer) + '  (−' + money(fee) + ' fee)'; M.plist = M.plist.filter(x => x !== l); Snd.play('cash');
  const n = clearOthers(m); if (n) toast('Sold — cleared ' + n + ' other offer' + (n > 1 ? 's' : '')); doSave(true); }
// ---------- panels keep each column's scroll position when they redraw (fit a part, buy something, etc.) ----------
{ const _r = Panel.render; Panel.render = function () { const el = document.getElementById('panel'), key = this.mode + '|' + (this.tab || '') + '|' + (this.msub || '') + '|' + (this.psub || '');
  const keep = el && this._sk === key ? [...el.querySelectorAll('.pcol')].map(c => c.scrollTop) : null; const r = _r.apply(this, arguments);
  if (keep && el) { const cols = el.querySelectorAll('.pcol'); keep.forEach((y, i) => { if (cols[i]) cols[i].scrollTop = y; }); } this._sk = key; return r; }; }
// ---------- sleeping passes the night: you wake at 7 AM (the next day if it's already past 7) ----------
function sleepPass() { const from = G.tod, wake = 7; let hrs = wake - from; if (hrs <= .5) hrs += 24; G.tod = wake; if (from > wake - .5) { G.day = (G.day || 0) + 1; newDay(); }
  if (G.weather) G.weather.t = Math.min(G.weather.t || 0, 30);
  return ' until 7:00 AM (' + Math.round(hrs) + 'h)'; }
