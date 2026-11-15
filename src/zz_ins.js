// ================= INSURANCE: titled cars you own come back to your garage if they're destroyed, or if you die / get busted away from them — for a fee =================
const CLAIMS = () => G.save.claims || (G.save.claims = []);
const insuredCar = c => c && c.owned && c.legit && !c.remote && !c.missionCar && !c.d.boat && !c.meetCar;
const insFee = (c, wreck) => { const v = mktValue(c.type, c.mods || {}, 1, 1); return wreck ? Math.max(250, r50(v * .12)) : Math.max(150, r50(v * .04)); };
function insRec(c, wreck) { return { type: c.type, mods: Object.assign({}, c.mods || {}, { p: c.color }), trunk: wreck ? {} : c.trunk || {}, cond: wreck ? .85 : clamp(c.hp / c.st.hp, .05, 1), legit: 1, noEng: c.noEng ? 1 : 0, missing: Object.assign({}, c.missing || {}), pc: wreck ? undefined : c.pc, id: c.gid }; }
function fileClaim(c, wreck) { if (c.claimed) return; c.claimed = 1; if (c.isRide && G.save.ride) delete G.save.ride; const fee = insFee(c, wreck);
  CLAIMS().push({ rec: insRec(c, wreck), fee, wreck: wreck ? 1 : 0, name: c.d.name }); settleClaims(true); }
function settleClaims(fresh) { const L = CLAIMS(); for (let i = 0; i < L.length; i++) { const cl = L[i]; if (garUsed() >= garCap()) { if (fresh) msg('🛡 Insurance has your ' + cl.name + ' — make room in your garage to get it back.', '#ff9f43'); continue; }
    if (!payAny(cl.fee)) { if (cl.wreck && fresh !== 'keep') { L.splice(i--, 1); towWreck(cl.rec, cl.name, 'You couldn\'t cover the insurance fee, so the wreck was towed home instead'); continue; } if (fresh) msg('🛡 Your ' + cl.name + ' is at the insurance lot — ' + money(cl.fee) + ' fee due. Pay from your garage.', '#ff9f43'); continue; }
    const r = cl.rec; if (!r.pc) delete r.pc; if (!r.id) delete r.id; myCars().push(r); L.splice(i--, 1);
    msg('🛡 Insurance: your ' + cl.name + (cl.wreck ? ' was rebuilt' : ' was towed') + ' and is back in your garage (−' + money(cl.fee) + ').', '#2ecc71'); doSave(true); } }
function insTick(dt) { if ((G.insT = (G.insT || 0) - dt) > 0) return; G.insT = .5; const pc = pCar(); if (pc && insuredCar(pc)) G.lastOwn = pc;
  if ((G.insT2 = (G.insT2 || 0) - 1) <= 0) { G.insT2 = 20; if (CLAIMS().length) settleClaims(false); } }
// dying or getting busted: the car you were using gets towed home
{ const _rs = respawn; respawn = function () { const c = G.lastOwn, ok = c && !c.dead && !c.claimed && insuredCar(c) && G.cars.includes(c) && c.driver !== G.player; if (ok) { const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); } _rs.apply(this, arguments); if (ok) fileClaim(c, 0); G.lastOwn = null; }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') insTick(dt); }; }
// unpaid / waiting claims show up in the garage
{ const hg = PMODES.hgarage; PMODES.hgarage = function (H) { const r = hg.call(this, H); if (this.tab === 'parts') return r; const L = CLAIMS(); if (!L.length) return r; const c0 = H.body.querySelector('.pcol'); if (!c0) return r;
  for (const cl of L) { const full = garUsed() >= garCap(); const row = H.row(c0, '🛡', cl.name + ' — insurance lot', full ? 'Waiting for garage space' : (cl.wreck ? 'Rebuilt after it was wrecked' : 'Towed after you went down') + ' · fee ' + money(cl.fee), [H.btn('Pay ' + money(cl.fee), () => settleClaims(true), 'y', full)]); c0.insertBefore(row, c0.children[1] || null); } return r; }; }
