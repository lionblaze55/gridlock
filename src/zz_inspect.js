// ================= INSPECTIONS: buyers check your car against the ad; you can check a seller's car part by part =================
const modNm = (k, v) => { const o = MODOPTS[k] && MODOPTS[k].o[v | 0]; return o ? o[0] : 'stock'; };
const adKeys = m => Object.keys(m || {}).filter(k => MODOPTS[k] && k !== 'p' && k !== 's');
// ---- selling: the ad is a snapshot of the car when it was listed ----
function snapOf(r) { return { mods: Object.assign({}, r.mods || {}), missing: Object.assign({}, r.missing || {}), noEng: r.noEng ? 1 : 0, cond: r.cond === undefined ? 1 : r.cond, v: recValue(r) }; }
{ const _mt = marketTick; marketTick = function (dt) { _mt(dt); const M = G.save && G.save.mkt; if (!M) return; for (const l of M.list) if (!l.snap) { const r = gRec(l.gid); if (r) l.snap = snapOf(r); } }; }
function snapDiff(s, g) { const out = [], m = g.mods || {};
  for (const k of adKeys(s.mods)) if ((s.mods[k] | 0) !== (m[k] | 0) && (s.mods[k] | 0) > 0) out.push(MODOPTS[k].n.toLowerCase() + ': ad showed ' + modNm(k, s.mods[k]) + ', now ' + modNm(k, m[k]));
  if (!s.noEng && g.noEng) out.push('the engine is gone');
  for (const k in g.missing || {}) if ((g.missing[k] | 0) > (s.missing[k] | 0)) out.push('missing ' + ITEMS[k].n.toLowerCase());
  const c = g.cond === undefined ? 1 : g.cond; if (c < s.cond - .08) out.push('rougher than the ad (' + pct(s.cond) + ' → ' + pct(c) + ')'); return out; }
function buyerInspect(mt, q) { const M = VMK(), l = M.list.find(x => x.gid === mt.gid), g = gRec(mt.gid); if (!l || !l.snap || !g) return false;
  const r = mt.home ? myCars().find(x => x.id === mt.gid) : null, c = liveCarFor(mt); if (!r && !c) return false;
  const diff = snapDiff(l.snap, g), vNow = recValue(g), ratio = vNow / Math.max(50, l.snap.v); if (!diff.length || ratio > .97) return false;
  mt.checked = 1; // a chance they spot it: tiny changes usually slip by, gutted cars almost never do
  const spot = clamp(.15 + (1 - ratio) * 2.2 + (g.noEng && !l.snap.noEng ? .5 : 0), .15, .95); if (Math.random() > spot) return false;
  const nm = mt.who, first = nm.split(' ')[0], cl = f => () => { closeDialog(); f(); }, what = diff.slice(0, 3).join('; '), roll = Math.random();
  if (ratio < .7 && roll < .15) { say(nm, first + ' pops the hood and goes quiet. "This isn\'t the car from the ad — ' + what + '. You trying to rip me off?!" They swing at you.', [{ t: 'Uh oh', c: 'r' }]); cancelMeet(mt, 'You changed the car after listing it. Scammer.'); q.still = 0; q.hostile = 1; q.state = 'fight'; q.target = G.player; q.timer = 25; blockSelf(nm); return true; }
  if (ratio < .75 && roll < .35) { say(nm, first + ' looks it over. "Nope — ' + what + '. That\'s not what you listed. I\'m out."', [{ t: 'Fair enough' }]); cancelMeet(mt, 'Car wasn\'t as listed. Reported.'); return true; }
  haggle(mt, q, r, c, Math.max(50, r50(mt.price * ratio * rnd(.88, .96))), first + ' checks it against the ad. "Hold on — ' + what + '. Not what you listed.', 0); return true; }
// in-person haggling: they make an offer, you can push back a couple of times
function haggle(mt, q, r, c, offer, intro, round) { const nm = mt.who, first = nm.split(' ')[0], cl = f => () => { closeDialog(); f(); }, ask = mt.price, mid = r50((offer + ask) / 2), hi = r50(offer + (ask - offer) * .8);
  const tryCounter = (want) => { const gap = (want - offer) / Math.max(1, ask - offer), p = round >= 2 ? .15 : .75 - gap * .55 - round * .15;
    if (Math.random() < p) { say(nm, pick(['"…Fine. ' + money(want) + ', deal."', '"Ugh. OK, ' + money(want) + '. Hand me the keys."', '"You drive a hard bargain. ' + money(want) + '."']), [{ t: 'Deal  (+' + money(want) + ')', c: 'y', f: cl(() => { mt.price = want; doneSellCar(mt, q, r, c); }) }]); return; }
    if (round >= 2 || Math.random() < .25) { say(nm, pick(['"Forget it. I\'m out."', '"Nah. Good luck selling that."', '"We\'re done here."']), [{ t: 'OK' }]); cancelMeet(mt, 'Couldn\'t agree on a price.'); return; }
    const nOffer = r50(offer + (want - offer) * rnd(.3, .55)); haggle(mt, q, r, c, nOffer, first + ' thinks about it.', round + 1); };
  say(nm, intro + (round ? ' "Best I can do is ' : ' I\'ll do ') + money(offer) + (round ? '."' : '."') + '\n\nYou were asking ' + money(ask) + '.', [
    { t: 'Take ' + money(offer), c: 'y', f: cl(() => { mt.price = offer; doneSellCar(mt, q, r, c); }) },
    mid > offer + 50 ? { t: 'Meet me halfway — ' + money(mid), f: cl(() => tryCounter(mid)) } : null,
    hi > mid + 50 ? { t: 'Counter ' + money(hi), f: cl(() => tryCounter(hi)) } : null,
    { t: 'No deal', f: cl(() => cancelMeet(mt, 'Then fix your listing.')) }].filter(Boolean)); }
function blockSelf(who) { const M = VMK(); M.msgs = M.msgs.filter(x => x.who !== who || x.done); }
// ---- buying: what's really on the seller's car ----
{ const _sp = spawnMeet; spawnMeet = function (mt) { _sp(mt); const c = mt.car, l = mt.l; if (!c || mt.side !== 'buy' || mt.adMods) return; mt.adMods = Object.assign({}, l.mods || {});
  if (l.scam || Math.random() < .12) { const ks = adKeys(c.mods).filter(k => !PCOSM.has(k) && c.mods[k] > 0); for (let i = 0; i < (l.scam ? 2 : 1) && ks.length; i++) { const k = ks.splice(rint(0, ks.length - 1), 1)[0]; c.mods[k] = Math.random() < .5 ? 0 : Math.max(0, c.mods[k] - 1); } applyMods(c); }
  ensurePC(c, c.type, c.hp / c.st.hp); if (l.scam && c.pc) { const s = pick(Object.keys(c.pc)); c.pc[s] = Math.min(c.pc[s], rnd(.04, .15)); } }; }
function carIssues(mt) { const c = mt.car, l = mt.l, out = []; for (const k of adKeys(mt.adMods)) if ((mt.adMods[k] | 0) !== (c.mods[k] | 0)) out.push([k, MODOPTS[k].n + ' — ad said ' + modNm(k, mt.adMods[k]), 'Actually: ' + modNm(k, c.mods[k])]);
  for (const s in c.pc || {}) if (c.pc[s] < Math.min(.4, l.claim - .25)) out.push([s, slotName(s) + ' is ' + (c.pc[s] < REPAIR_MIN ? 'broken' : 'badly worn'), pct(c.pc[s]) + ' — ad said "' + condWord(l.claim).toLowerCase() + '"']); return out; }
const carReal = mt => { const c = mt.car; return partsAdjValue({ pc: c.pc, mods: c.mods, type: c.type }, projValue(c.type, c.mods, c.hp / c.st.hp, c.legit, c.missing, c.noEng)); };
PMODES.inspect = function (H) { const mt = this.opt.mt, c = mt.car, l = mt.l, q = mt.q; if (!c || c.dead || mt.state !== 'here') { H.empty(H.col('Inspection'), 'The car is gone.'); return; }
  H.title.textContent = '🔍 Inspecting ' + mt.who.split(' ')[0] + '\'s ' + c.d.name; const iss = carIssues(mt), c1 = H.col('Under the hood'), pc = c.pc || {};
  for (const s of pcSlots(c.type, c.mods, c.missing, c.noEng)) { const k = s.startsWith('m:') ? s.slice(2) : VAR[s], what = s === 'eng' ? ITEMS[engIdOf(c.type, c.mods)].n : k && c.mods[k] ? modNm(k, c.mods[k]) : 'Stock';
    const r = tintRow(H.row(c1, s === 'eng' ? '⚙' : s.startsWith('m:') ? '🔩' : '🔧', slotName(s), what + ' · ' + pct(pc[s] === undefined ? 1 : pc[s]), []), pc[s]); r.classList.add('pmsg'); }
  const m = missText(c.type, c.missing, c.noEng); if (m) H.row(c1, '✗', 'Missing', m, []).querySelector('.pe').style.color = '#ff6b6b';
  const c2 = H.col(iss.length ? '⚠ Not as advertised (' + iss.length + ')' : '✓ Matches the ad'); if (!iss.length) H.empty(c2, 'Everything in the listing is on the car, in about the condition advertised (' + condWord(l.claim).toLowerCase() + ').');
  for (const [, a, b] of iss) { const r = H.row(c2, '⚠', a, b, []); r.classList.add('pmsg'); r.querySelector('.pe').style.color = '#ff6b6b'; }
  const real = carReal(mt), cost = p => p + r50(p * XFER); H.row(c2, '💵', 'Agreed price ' + money(mt.price), 'Looks worth about ' + money(real) + (c.legit ? '' : ' · NO TITLE'), []);
  const fr = H.mk('div', ''); fr.style.cssText = 'display:flex;gap:6px;width:100%'; H.foot.appendChild(fr); const fb = (t, f, cls, dis) => { const b = H.btn(t, f, cls, dis); b.style.flex = '1'; b.style.margin = '0'; fr.appendChild(b); };
  fb('Pay ' + money(cost(mt.price)), () => { Panel.close(); doneBuyCar(mt, q, cost(mt.price)); }, 'y');
  if (iss.length && real < mt.price && !mt.haggled) { const np = Math.max(50, r50(real * .95)); fb('Call it out — offer ' + money(np), () => { mt.haggled = 1; const roll = Math.random(); Panel.close();
    if (roll < .6) { mt.price = np; say(mt.who, '"…Fine. You got me. ' + money(np) + '."', [{ t: 'Pay ' + money(cost(np)), c: 'y', f: () => { closeDialog(); doneBuyCar(mt, q, cost(np)); } }, { t: 'Walk away', f: () => { closeDialog(); cancelMeet(mt, 'Whatever.'); } }]); }
    else if (roll < .88) say(mt.who, '"It runs, doesn\'t it? Price is the price."', [{ t: 'OK' }]);
    else { say(mt.who, '"You calling me a liar?! Deal\'s off." They storm off.', [{ t: 'OK' }]); cancelMeet(mt, 'Deal\'s off.'); } }); }
  fb('Walk away', () => { Panel.close(); cancelMeet(mt, 'Your loss.'); }); };
{ const _m = meetTalk; meetTalk = function (mt, q) {
  if (mt.side === 'sell' && mt.what === 'car' && !mt.scam && !mt.rob && !mt.checked && buyerInspect(mt, q)) return;
  if (mt.side === 'buy' && mt.what === 'car' && !mt.scam && !mt.rob && mt.car && !mt.car.dead) { const l = mt.l, c = mt.car, P = money(mt.price), cl = f => () => { closeDialog(); f(); };
    return say(mt.who, '"There she is." A ' + c.d.name + ', advertised as ' + condWord(l.claim).toLowerCase() + (l.legit ? '' : ', no title') + '. ' + P + ' + ' + money(r50(mt.price * XFER)) + ' title transfer.', [
      { t: '🔍 Inspect the parts', c: 'y', f: cl(() => Panel.open('inspect', { mt })) }, { t: 'Just pay ' + money(mt.price + r50(mt.price * XFER)), f: cl(() => doneBuyCar(mt, q, mt.price + r50(mt.price * XFER))) }, { t: 'Walk away', f: cl(() => cancelMeet(mt, 'Your loss.')) }]); }
  return _m(mt, q); }; }
