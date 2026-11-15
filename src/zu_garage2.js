// ================= ONE GARAGE SCREEN: store / take out, pull & fit ANY component (engine, gearbox, wheels, panels…, mods), half-built cars, $200 scrap =================
const MECH = ['gearbox', 'wheelset', 'exhaustp', 'panels', 'wiring', 'seats'], MECHW = { gearbox: 2, wheelset: 1, exhaustp: .5, panels: 1, wiring: 1, seats: .5 }, ENGW = 4, DRIVE_NEEDS = ['gearbox', 'wheelset'];
const missOf = o => o.missing || (o.missing = {});
const reqOf = type => { const r = Object.assign({}, buildReq(type)); return r; };
function completeness(type, missing, noEng) { const req = reqOf(type), se = stockEng(type); let tot = se ? ENGW : 0, gone = se && noEng ? ENGW : 0; for (const k in req) { tot += req[k] * (MECHW[k] || 1); gone += Math.min(req[k], (missing || {})[k] | 0) * (MECHW[k] || 1); } return tot ? 1 - gone / tot : 1; }
const drivable = (type, missing, noEng) => !noEng && DRIVE_NEEDS.every(k => !((missing || {})[k] > 0)) || CAR_TYPES[type].pedal && !((missing || {}).wheelset > 0);
const missText = (type, missing, noEng) => { const out = []; if (noEng && stockEng(type)) out.push('engine'); for (const k in missing || {}) if (missing[k] > 0) out.push((missing[k] > 1 ? missing[k] + ' × ' : '') + ITEMS[k].n.toLowerCase()); return out.join(', '); };
// half-built cars are worth a lot less than ones that drive
function projValue(type, mods, cond, legit, missing, noEng) { const v = mktValue(type, mods, cond, legit), c = completeness(type, missing, noEng); return c >= .999 ? v : r50(v * (.12 + .5 * c * c)); }
// ---------- one target object for a live car on the pad or a stored record ----------
function gTarget(sel, g) {
  if (sel === 'pad') { const c = padCar(g); if (!c) return null; return { kind: 'car', c, type: c.type, d: c.d, get mods() { return c.mods || {}; }, set(m) { c.mods = m; applyMods(c); if (c.isRide) G.save.ride = { type: c.type, mods: c.mods, legit: c.legit ? 1 : 0 }; }, get noEng() { return !!c.noEng; }, setNoEng(v) { c.noEng = v ? 1 : 0; }, get missing() { return missOf(c); }, color: c.color, cond: c.hp / c.st.hp, legit: !!c.legit }; }
  const r = myCars().find(x => recId(x) === sel); if (!r || !CAR_TYPES[r.type]) return null;
  return { kind: 'rec', r, type: r.type, d: CAR_TYPES[r.type], get mods() { return r.mods || (r.mods = {}); }, set(m) { r.mods = m; }, get noEng() { return !!r.noEng; }, setNoEng(v) { r.noEng = v ? 1 : 0; }, get missing() { return missOf(r); }, color: recColor(r), cond: r.cond === undefined ? 1 : r.cond, legit: isLegitRec(r) };
}
function pullMech(t, k) { const req = reqOf(t.type), M = t.missing; if (((req[k] | 0) - (M[k] | 0)) <= 0) return; M[k] = (M[k] | 0) + 1; G.stash.items[k] = (G.stash.items[k] | 0) + 1; Snd.play('ratchet'); doSave(true); }
function fitMech(t, k) { const M = t.missing; if (!(M[k] > 0) || partHave(k) < 1) return; partTake(k, 1); M[k]--; if (!M[k]) delete M[k]; Snd.play('ratchet'); doSave(true); }
// keep the old pad-car store / take-out helpers but respect missing parts
function takeOut2(i, g) { const rec = myCars()[i]; if (!rec) return; if (!drivable(rec.type, rec.missing, rec.noEng)) return toast('It can\'t roll out like that — fit ' + missText(rec.type, rec.missing, rec.noEng) + ' first'); takeOut(i, g); const c = G.cars[G.cars.length - 1]; if (c && c.type === rec.type) c.missing = Object.assign({}, rec.missing || {}); }
function storeIt(k) { const was = k.driver === G.player, miss = Object.assign({}, k.missing || {}); if (was) exitCar(true); storeCar(k); const L = myCars(), r = L[L.length - 1]; if (r) { r.missing = miss; r.noEng = k.noEng ? 1 : 0; } }
function scrapRec(i) { const L = myCars(), r = L[i]; if (!r) return; L.splice(i, 1); addCash(200); Snd.play('grinder'); toast('Scrapped — $200 from the yard'); doSave(true); }
PMODES.hgarage = function (H) {
  const P = this, g = this.opt.g, L = myCars(), cap = capIn(g); garAssign(); L.forEach(recId); const LG = L.filter(r => r.gar === g.b.id); const pad = padCar(g);
  H.title.textContent = '🅿️ ' + (g.b.name === 'Your Apartment' ? 'Your garage' : (g.b.realty ? g.b.realty.name : g.b.name) + ' garage') + '  ·  ' + LG.length + '/' + cap;
  if (!P.wsel || (P.wsel === 'pad' && !pad) || (P.wsel !== 'pad' && !LG.some(r => r.id === P.wsel))) P.wsel = pad ? 'pad' : LG[0] ? LG[0].id : null;
  // column 1: the vehicles
  const c0 = H.col('Vehicles');
  if (pad) { const ok = drivable(pad.type, pad.missing, pad.noEng); const r = thumbRow(H, c0, pad.type, pad.color, pad.mods, pad.d.name, 'On the pad' + (ok ? '' : ' · won\'t drive'), [H.btn(P.wsel === 'pad' ? '🔧' : 'Work', () => { P.wsel = 'pad'; }, P.wsel === 'pad' ? 'on' : ''), H.btn('Store', () => { G.storeTo = g.b.id; try { storeIt(pad); } finally { G.storeTo = null; } P.wsel = null; }, 'y', LG.length >= cap)]); if (P.wsel === 'pad') r.classList.add('sel'); }
  else if (!LG.length) H.empty(c0, 'Drive a car onto the blue GARAGE pad outside to park it here.');
  L.forEach((rec, i) => { const d = CAR_TYPES[rec.type]; if (!d || rec.gar !== g.b.id) return; const ok = drivable(rec.type, rec.missing, rec.noEng), comp = completeness(rec.type, rec.missing, rec.noEng); const r = thumbRow(H, c0, rec.type, recColor(rec), rec.mods, d.name + (comp < .001 ? ' (bare shell)' : ''), comp < .999 ? Math.round(comp * 100) + '% built' + (ok ? '' : ' · won\'t drive') : condWord(rec.cond === undefined ? 1 : rec.cond) + (isLegitRec(rec) ? '' : ' · no title'), [H.btn(P.wsel === rec.id ? '🔧' : 'Work', () => { P.wsel = rec.id; }, P.wsel === rec.id ? 'on' : ''), H.btn('Out', () => takeOut2(i, g), 'y', !ok)]); if (P.wsel === rec.id) r.classList.add('sel'); });
  const t = gTarget(P.wsel, g); if (!t) return; const PC = tPC(t), oc = tOwner(t).pcAvg;
  // column 2: what's on it
  const m = t.mods, M = t.missing, req = reqOf(t.type), se = stockEng(t.type), e = t.noEng ? null : m.swp ? ENGS[m.swp].id : se, comp = completeness(t.type, M, t.noEng);
  const c1 = H.col(t.d.name + (comp < .999 ? ' — ' + Math.round(comp * 100) + '% built' : '') + (oc !== undefined ? ' · parts ' + pct(oc) : '')), red = r => { r.querySelector('.pe').style.color = '#ff6b6b'; return r; };
  fittedRows(H, c1, t, PC, e, se, req, M, m, red);
  c1.appendChild(barsEl(statBars({ st: calcSt(t.d, m) })));
  // column 3: loose stock
  const c2 = H.col('Loose parts in stock'); 
  const any = looseRows(H, c2, t, e, se, req, M, m);
  if (!any) H.empty(c2, 'Nothing loose. Pull parts off a car, order them (button below), or buy "Part only" at a mod shop.');
  // footer: bigger jobs for the selected stored car
  const fr = H.mk('div', ''); fr.style.cssText = 'display:flex;gap:6px;width:100%'; H.foot.appendChild(fr); const fb = (l, f) => { const b = H.btn(l, f); b.style.flex = '1'; b.style.margin = '0'; fr.appendChild(b); };
  if (t.kind === 'rec') { const i = L.indexOf(t.r); fb(t.r.shell && completeness(t.type, M, t.noEng) < .001 ? 'Bare shell' : 'Part out everything', () => { if (completeness(t.type, M, t.noEng) > .001) partOut(i); }); fb('Scrap  +$200', () => { scrapRec(i); P.wsel = null; }); }
  else { fb('Part out everything', () => { padPartOut(t.c); P.wsel = null; }); fb('Scrap  +$200', () => { padScrap(t.c); P.wsel = null; }); }
  fb('Order parts & shells', () => Panel.open('project', { tab: 'order' }));
};

// ---------- shells are just cars with everything missing — and they take up garage space ----------
function shellRec(type) { const req = buildReq(type), missing = {}; for (const k in req) missing[k] = req[k]; return { type, mods: {}, missing, noEng: stockEng(type) ? 1 : 0, built: 1, legit: 1, shell: 1 }; }
function migrateShells() { const S = shells(); for (const t in S) { if (!CAR_TYPES[t]) { delete S[t]; continue; } for (let i = 0; i < (S[t] | 0); i++) myCars().push(shellRec(t)); delete S[t]; } }
const garUsed = () => { const S = (G.save && G.save.shells) || {}; return myCars().length + Object.values(S).reduce((a, b) => a + (b | 0), 0); };
{ const hg0 = PMODES.hgarage; PMODES.hgarage = function (H) { migrateShells(); const r = hg0.call(this, H); H.title.textContent = H.title.textContent.replace(/·\s*\d+\/\d+/, '·  ' + garUsed() + '/' + garCap()); return r; }; }
function padPartOut(c) { if (garUsed() >= garCap()) return toast('Garage is full — scrap something first'); storeIt(c); const L = myCars(); partOut(L.length - 1); }
function padScrap(c) { if (c.driver === G.player) exitCar(true); const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); if (c.isRide) delete G.save.ride; addCash(200); Snd.play('grinder'); toast('Scrapped — $200 from the yard'); doSave(true); }
