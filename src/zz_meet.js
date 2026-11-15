// ================= MARKETPLACE MEETUPS: every deal happens in person — bring the car / part, pick a public spot or your place, and watch out for scammers =================
// a listed car can be in your garage or out on the street (you drove it to a meetup)
function gRec(gid) { const r = myCars().find(r => r.id === gid); if (r) return r; const c = G.cars.find(c => c.gid === gid && !c.dead && c.owned); if (!c) return null;
  return { id: gid, type: c.type, mods: c.mods || {}, cond: clamp(c.hp / c.st.hp, .05, 1), legit: c.legit ? 1 : 0, pc: c.pc, missing: c.missing, noEng: c.noEng, live: c }; }
{ const _t = takeOut; takeOut = function (i, g) { const rec = myCars()[i], n = G.cars.length; if (rec) recId(rec); _t(i, g); const c = G.cars[G.cars.length - 1]; if (rec && G.cars.length > n && c.type === rec.type) c.gid = rec.id; };
  const _s = storeCar; storeCar = function (c) { const L = myCars(), n = L.length, gid = c.gid; _s(c); if (gid && L.length > n) L[L.length - 1].id = gid; }; }
const MEETS = () => { const M = VMK(); return M.meets || (M.meets = []); };
// ---------- choosing where ----------
function publicSpot() { const p = G.scene ? G.outPos : G.player; let best = null, bd = 1e18;
  for (const b of W.buildings) { if (!b.door || !['store', 'diner', 'bar', 'arcade', 'pawn', 'gas'].includes(b.type) || b.realty) continue; const d = dist2(b.door.x, b.door.y, p.x, p.y); if (d < 350 * 350 || d > bd) continue;
    const [fx, fy] = FACEV[b.door.f] || [0, 1], x = b.door.x + fx * T * 1.2, y = b.door.y + fy * T * 1.2; if (solidW(x, y)) continue; bd = d; best = { x, y, name: (b.name || 'the store') + ' parking lot' }; }
  return best; }
function homeSpot() { const p = G.scene ? G.outPos : G.player, gs = homeGarages(); if (!gs.length) return null; let g = gs[0]; for (const h of gs) if (dist2(h.x, h.y, p.x, p.y) < dist2(g.x, g.y, p.x, p.y)) g = h; const sp = meetClear(g); return { x: sp[0], y: sp[1], name: g.b.name === 'Your Apartment' ? 'your apartment' : 'your place (' + (g.b.realty ? g.b.realty.name : g.b.name) + ')', home: 1, g }; }
// the msgs list and listing screens call these — instead of instant money / delivery, set up a meet
function sellTo(m) { proposeMeet({ side: 'sell', m }); }
{ const _bl = buyListing; window._buyFinal = _bl; buyListing = function (l, price) { proposeMeet({ side: 'buy', l, price }); return true; }; }
function proposeMeet(o) { const M = VMK(), pub = publicSpot(), home = homeSpot(); const dup = (M.meets || []).find(mt => (mt.state === 'set' || mt.state === 'here') && mt.lid === (o.side === 'sell' ? o.m.lid : o.l.id)); if (dup) return toast('You already have a meet set up for that — check the GPS');
  const what = o.side === 'sell' ? (o.m.held || (o.m.pk && !o.m.gid) ? 'part' : 'car') : (o.l.kind === 'part' ? 'part' : 'car');
  const who = o.side === 'sell' ? o.m.who : o.l.seller, opts = [];
  const go = spot => { closeDialog(); makeMeet(o, what, who, spot); };
  if (pub) opts.push({ t: '📍 Public: ' + pub.name + ' (' + Math.round(dist(pub.x, pub.y, (G.scene ? G.outPos : G.player).x, (G.scene ? G.outPos : G.player).y) / T) + 'm) — safer', c: 'y', f: () => go(pub) });
  if (home) opts.push({ t: '🏠 At ' + home.name + (what === 'car' && o.side === 'sell' ? ' — car can stay in the garage' : ''), f: () => go(home) });
  opts.push({ t: 'Not now' });
  say(who, (o.side === 'sell' ? 'Meet to hand over the ' : 'Meet to check out and pay for the ') + (what === 'car' ? 'car' : 'part') + '. Where?\n\nPublic spots put scammers off — at home they know where you live.', opts); }
function makeMeet(o, what, who, spot) { const M = VMK(), id = 'mt' + (M.seq++);
  const mt = { id, side: o.side, what, who, x: spot.x, y: spot.y, place: spot.name, home: spot.home ? 1 : 0, due: M.clock + 480, state: 'set' };
  if (o.side === 'sell') { const m = o.m; mt.mid = m.id; mt.lid = m.lid; mt.gid = m.gid || null; mt.price = m.offer; mt.pk = m.pk || null; mt.scam = m.scamBuyer ? 1 : Math.random() < (what === 'part' ? .07 : .04) ? 1 : 0; m.kind = 'meet'; m.meet = id; m.exp = 1e12; m.text = 'Meeting at ' + spot.name + ' — ' + money(m.offer) + (what === 'car' ? '. Bring the car.' : '. Bring the part.'); }
  else { const l = o.l; mt.lid = l.id; mt.price = o.price; mt.scam = l.ghost ? 1 : 0; mt.l = JSON.parse(JSON.stringify(l)); l.deal = l.deal || o.price; l.meet = id; l.exp = 1e12;
    let m = M.msgs.find(x => x.lid === l.id && !x.done && (x.kind === 'deal' || x.kind === 'wait' || x.kind === 'info')); if (!m) { m = { id: 'x' + (M.seq++), side: 'buy', ctype: l.type, pname: l.pk ? unitName(l.pk) : null, lid: l.id, who: l.seller, t: M.clock, kind: 'meet', text: '' }; M.msgs.unshift(m); }
    m.kind = 'meet'; m.meet = id; m.exp = 1e12; m.text = 'Meeting at ' + spot.name + ' — bring ' + money(o.price) + ' cash.'; mt.mid = m.id; }
  if (mt.scam && !mt.home && Math.random() < .5) mt.scam = 0; // most crooks won't try it in public
  mt.rob = mt.scam && mt.home && Math.random() < .35 ? 1 : 0;
  rtInit(mt); MEETS().push(mt); setNav({ x: spot.x, y: spot.y, name: 'Meet ' + who.split(' ')[0] }); Panel.close && Panel.close(); toast('Meet set — follow the GPS'); doSave(true); }
function cancelMeet(mt, why) { const M = VMK(); mt.state = 'off'; const m = M.msgs.find(x => x.id === mt.mid); if (m) { m.done = 1; m.kind = 'gone'; m.text = why || 'Meet called off.'; }
  const l = mt.side === 'buy' ? M.feed.find(x => x.id === mt.lid) || (M.pfeed || []).find(x => x.id === mt.lid) : null; if (l) { l.meet = null; l.exp = M.clock + 120; }
  if (mt.q) { const q = mt.q; q.meetId = null; q.still = 0; q.state = 'walk'; } if (mt.car && !mt.car.owned) { mt.car.persist = 0; } if (G.nav && G.nav.name === 'Meet ' + mt.who.split(' ')[0]) G.nav = null; }
// ---------- spawning the other party when you get close ----------
function rtInit(mt) { if (mt._rt) return; const q0 = mt.q, c0 = mt.car; delete mt.q; delete mt.car; for (const k of ['q', 'car', '_rt']) Object.defineProperty(mt, k, { value: null, writable: true, enumerable: false, configurable: true });
  mt._rt = 1; if (q0 instanceof Ped) mt.q = q0; if (c0 instanceof Car) mt.car = c0; if (!(q0 instanceof Ped) && mt.state === 'here') mt.state = 'set'; if (!(q0 instanceof Ped) && !(c0 instanceof Car) && mt.state === 'scam') mt.state = 'done'; }
function mktMeetTick(dt) { if ((G.mtT = (G.mtT || 0) - dt) > 0) return; G.mtT = .4; const M = G.save && G.save.mkt; if (!M || !M.meets) return; const p = G.player; if (!p) return;
  M.bounce = null;
  for (const mt of M.meets) { rtInit(mt);
    if (mt.state === 'set' && M.clock > mt.due) { cancelMeet(mt, pick(['You never showed. Waste of my time.', 'I waited 20 minutes. Forget it.', 'No-show? Seriously? Blocked.'])); mkNote(mt.who.split(' ')[0] + ' gave up waiting'); continue; }
    if (mt.state === 'set' && !G.scene && dist2(p.x, p.y, mt.x, mt.y) < 650 * 650) spawnMeet(mt);
    if (mt.state === 'here' && (!mt.q || mt.q.dead || !(G.peds.includes(mt.q) || (G.scene && G.scene.peds && G.scene.peds.includes(mt.q))))) { if (mt.q && mt.q.dead) cancelMeet(mt, '…'); else mt.state = 'set'; }
    if (mt.state === 'here' && mt.q && !G.scene && dist2(p.x, p.y, mt.x, mt.y) > 1400 * 1400 && M.clock > mt.due - 60) { const i = G.peds.indexOf(mt.q); if (i >= 0) G.peds.splice(i, 1); if (mt.car && !mt.car.owned) { const j = G.cars.indexOf(mt.car); if (j >= 0) G.cars.splice(j, 1); } cancelMeet(mt, 'You left. I\'m out.'); }
    if (mt.state === 'scam') scamTick(mt);
  }
  M.meets = M.meets.filter(mt => mt.state !== 'off' && mt.state !== 'done' || (G.t - (mt.endT || 0)) < 2); }
function spawnMeet(mt) { { const h = homeGarages().find(h => dist2(mt.x, mt.y, h.x, h.y) < 170 * 170); if (h) { const sp = meetClear(h); mt.x = sp[0]; mt.y = sp[1]; } } const g = mt.home ? null : null; let x = mt.x, y = mt.y; for (let k = 0; k < 12 && (solidW(x, y) || homeGarages().some(h => dist2(x, y, h.x, h.y) < 150 * 150)); k++) { x = mt.x + rnd(-40, 40); y = mt.y + rnd(-40, 40); }
  const q = new Ped(x, y, { role: 'civ', name: mt.who }); q.meetId = mt.id; q.still = 1; q.state = 'idle'; q.name = mt.who; G.peds.push(q); mt.q = q; mt.state = 'here';
  if (mt.side === 'buy' && mt.what === 'car' && !mt.scam) { const l = mt.l, s = nearRoadSpot({ x: mt.x, y: mt.y }, 6); if (s) { const c = new Car(l.type, s[0], s[1], s[2], l.color); applyMods(c, Object.assign({}, l.mods || {}, { p: l.color })); c.hp = c.st.hp * clamp(l.real === undefined ? 1 : l.real, .05, 1); if (l.real < .3) c.flat = 1; c.ai = { mode: 'parked' }; c.persist = 1; c.meetCar = mt.id; c.missing = Object.assign({}, l.missing || {}); c.noEng = l.noEng ? 1 : 0; c.legit = l.legit ? 1 : 0; G.cars.push(c); mt.car = c; } }
  if (mt.rob) { q.weapon = WEAPONS.findIndex(w => w.id === 'knife'); if (q.weapon < 0) q.weapon = 0; q.hideW = 1; }
  pedSay(q, pick(['Over here!', 'Hey — ' + (mt.side === 'sell' ? 'you selling?' : 'you here for the ' + (mt.what === 'car' ? 'car' : 'part') + '?'), '👋'])); mkNote(mt.who.split(' ')[0] + ' is at the meet spot'); }
function meetOf(q) { const M = G.save && G.save.mkt; return M && M.meets ? M.meets.find(mt => mt.id === q.meetId) : null; }
// ---------- the handover ----------
function liveCarFor(mt) { const p = G.player; for (const c of G.cars) if (c.gid === mt.gid && !c.dead && c.owned && dist2(c.x, c.y, mt.x, mt.y) < 320 * 320) return c; return null; }
function talkTo(q) { if (q.meetId) { const mt = meetOf(q); if (mt && mt.state === 'here') return meetTalk(mt, q); } return talkToZ(q); }
function meetTalk(mt, q) { const nm = mt.who, P = money(mt.price), cl = f => () => { closeDialog(); f(); };
  if (mt.rob) return say(nm, '"' + pick(['Change of plans.', 'Yeah… about that.']) + '" ' + nm.split(' ')[0] + ' pulls a knife. "Give me ' + P + '. Now."', [
    { t: 'Hand it over', c: 'r', f: cl(() => { const take = Math.min(G.cash, mt.price); G.cash -= take; scamRun(mt, q, { cash: take }, 'took ' + money(take) + ' off you'); }) },
    { t: 'Fight', c: 'y', f: cl(() => { q.hideW = 0; q.still = 0; q.hostile = 1; q.state = 'fight'; q.target = G.player; q.timer = 30; q.loot = { cash: rint(200, 900) + Math.round(mt.price * .3) }; q.scamOf = mt.id; mt.state = 'scam'; mt.runAt = G.t; scamDialog(mt, nm.split(' ')[0] + ' wants a fight', 1); }) }]);
  if (mt.side === 'sell' && mt.what === 'car') { const r = mt.home ? myCars().find(r => r.id === mt.gid) : null, c = liveCarFor(mt), d = CAR_TYPES[(r || c || {}).type]; const g = gRec(mt.gid);
    if (!g) { cancelMeet(mt, 'The car\'s gone?'); return say(nm, '"You don\'t even have it anymore?" They leave.'); }
    if (!r && !c) return say(nm, '"So… where\'s the car?"' + (mt.home ? ' (It isn\'t in your garage.)' : ' Drive it here — it has to be parked close by.'), [{ t: 'I\'ll go get it' }, { t: 'Call it off', c: 'r', f: cl(() => cancelMeet(mt, 'Called off.')) }]);
    if (mt.scam) return say(nm, '"Sweet ride. Mind if I take it round the block first? Here\'s the cash — ' + P + '."', [
      { t: 'Sure, go ahead', c: 'y', f: cl(() => scamCar(mt, q, r, c)) },
      { t: 'Let me count the cash first', f: cl(() => { say(nm, 'Half the bills are photocopies. ' + nm.split(' ')[0] + ' sees your face and bolts.', [{ t: 'Huh.' }]); q.still = 0; q.state = 'flee'; q.threat = G.player; q.timer = 20; q.meetId = null; cancelMeet(mt, 'Fake cash. Nice try.'); }) },
      { t: 'Call it off', f: cl(() => cancelMeet(mt, 'Called off.')) }]);
    return say(nm, '"Looks just like the pictures."' + (g.cond < .5 ? ' They notice the wear but shrug.' : '') + ' ' + nm.split(' ')[0] + ' counts out ' + P + '.', [{ t: 'Hand over the keys  (+' + P + ')', c: 'y', f: cl(() => doneSellCar(mt, q, r, c)) }, { t: 'Changed my mind', f: cl(() => cancelMeet(mt, 'Changed your mind? Whatever.')) }]); }
  if (mt.side === 'sell') { const M = VMK(), l = (M.plist || []).find(x => x.id === mt.lid); if (!l) { cancelMeet(mt, 'Gone?'); return say(nm, '"It sold already?" They leave.'); }
    const nmP = unitName(l.pk).split(' — ')[1] || unitName(l.pk);
    if (mt.scam) return say(nm, '"That the ' + nmP + '? Let me see it."', [{ t: 'Hand it over to look at', c: 'y', f: cl(() => { M.plist = M.plist.filter(x => x !== l); scamRun(mt, q, { part: { id: l.pk, c: l.cond } }, 'grabbed the ' + nmP); }) },
      { t: 'Cash first', f: cl(() => { say(nm, '"Ugh, fine — forget it." ' + nm.split(' ')[0] + ' walks off fast.', [{ t: 'Bye' }]); q.still = 0; q.meetId = null; cancelMeet(mt, 'Never mind.'); }) }]);
    return say(nm, '"That\'s it. ' + P + ', right?" They check it over (' + pct(l.cond) + ').', [{ t: 'Hand it over  (+' + P + ')', c: 'y', f: cl(() => { const m = M.msgs.find(x => x.id === mt.mid); if (m) { m.kind = 'offer'; sellToC(m); } finish(mt, q); }) }, { t: 'Changed my mind', f: cl(() => cancelMeet(mt, 'Fine.')) }]); }
  // you are buying
  const l = mt.l, isCar = mt.what === 'car', cost = isCar ? mt.price + r50(mt.price * XFER) : mt.price;
  if (mt.scam) return say(nm, isCar ? '"Car\'s parked round the corner. Cash first, then I\'ll bring it over."' : '"It\'s in my trunk. Cash first, then you get it."', [
    { t: 'Pay ' + P, c: 'r', f: cl(() => { if (!payAny(mt.price)) return toast('Not enough cash'); scamRun(mt, q, { cash: mt.price }, 'took your ' + P); }) },
    { t: isCar ? 'No car, no cash' : 'Show me the part first', c: 'y', f: cl(() => { say(nm, '"Forget you, then." ' + nm.split(' ')[0] + ' storms off.', [{ t: 'Smart.' }]); q.still = 0; q.meetId = null; cancelMeet(mt, 'Ghosted.'); }) }]);
  if (isCar) { const c = mt.car, d = CAR_TYPES[l.type], up = condWord(l.real), ad = condWord(l.claim);
    return say(nm, '"There she is." The ' + d.name + ' up close: ' + up.toLowerCase() + ' condition' + (up !== ad ? ' — the ad said ' + ad.toLowerCase() + '.' : '.') + (l.legit ? '' : ' No title.') + '\n\n' + P + ' + ' + money(cost - mt.price) + ' title transfer.', [
      { t: 'Pay ' + money(cost), c: 'y', f: cl(() => doneBuyCar(mt, q, cost)) }, { t: 'Walk away', f: cl(() => cancelMeet(mt, 'Your loss.')) }]); }
  return say(nm, '"Here it is." ' + unitName(l.pk) + (l.cond !== undefined ? ' · about ' + pct(l.cond) : ''), [{ t: 'Pay ' + P, c: 'y', f: cl(() => { if (!payAny(mt.price)) return toast('Not enough cash'); if (l.cond === undefined) l.cond = rnd(.6, 1); unitGive(l.pk, l.cond); finishBuy(mt); finish(mt, q); Snd.play('cash'); msg(unitName(l.pk) + ' is yours — it\'s on your garage shelf.', '#2ecc71'); }) }, { t: 'Walk away', f: cl(() => cancelMeet(mt, 'k.')) }]); }
function finish(mt, q) { mt.state = 'done'; mt.endT = G.t; if (q) { q.meetId = null; q.still = 0; q.state = 'walk'; } if (G.nav && G.nav.name === 'Meet ' + mt.who.split(' ')[0]) G.nav = null; doSave(true); }
function finishBuy(mt) { const M = VMK(); M.feed = M.feed.filter(x => x.id !== mt.lid); M.pfeed = (M.pfeed || []).filter(x => x.id !== mt.lid); const m = M.msgs.find(x => x.id === mt.mid); if (m) { m.done = 1; m.kind = 'sold'; m.text = 'Bought from ' + mt.who + ' for ' + money(mt.price) + '.'; } for (const x of M.msgs) if (x.lid === mt.lid && x !== m) x.done = 1; }
function doneSellCar(mt, q, r, c) { const M = VMK(), m = M.msgs.find(x => x.id === mt.mid), fee = r50(mt.price * PFEE), g = r || gRec(mt.gid), d = CAR_TYPES[g.type];
  if (r) { const L = myCars(); L.splice(L.indexOf(r), 1); } else if (c) { if (pCar() === c) exitCar(true); driveOff(c, q, 0); }
  addCash(mt.price - fee); M.list = M.list.filter(l => l.gid !== mt.gid); if (m) { m.done = 1; m.kind = 'sold'; m.text = 'Sold to ' + mt.who + ' for ' + money(mt.price) + '  (−' + money(fee) + ' fee)'; clearOthers(m); }
  for (const x of M.msgs) if (x.gid === mt.gid && x !== m && !x.done) x.done = 1;
  Snd.play('cash'); G.big = { text: 'SOLD', col: '#2ecc71', t: 2.4, sub: d.name + ' · +' + money(mt.price - fee), small: 1 };
  if (!isLegitRec(g) && Math.random() < .15) { crime(.6, 'Selling a car without a title'); msg('The buyer ran the VIN. Someone tipped off the cops.', '#ff6b6b'); }
  if (r) { const i = G.peds.indexOf(q); if (i >= 0) { q.meetId = null; } } finish(mt, r ? q : null); if (c) { mt.q = null; } }
function doneBuyCar(mt, q, cost) { const c = mt.car, l = mt.l; if (!c || c.dead) { cancelMeet(mt, 'The car got wrecked…'); return; } if (!payAny(cost)) return toast('You need ' + money(cost) + ' on you or in the bank');
  c.owned = 1; c.persist = 1; c.legit = l.legit ? 1 : 0; c.meetCar = null; finishBuy(mt); finish(mt, q); Snd.play('cash'); msg('The ' + c.d.name + ' is yours. Keys in hand.', '#2ecc71');
  if (l.scam && l.real < l.claim - .2) setTimeout(() => msg('Driving it, you notice even more problems the seller "forgot" to mention.', '#ff9f43'), 4000); }
function driveOff(c, q, flee) { const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1); c.driver = { role: 'civ', name: q.name }; c.owned = flee ? 1 : 0; c.persist = flee ? 1 : 0; c.gid = flee ? c.gid : null; c.hand = 0; c.brake = 0; if (c.isRide) { delete G.save.ride; c.isRide = 0; }
  const dir = ((Math.round(c.a / (Math.PI / 2)) % 4) + 4) % 4; makeTrafficAI(c, dir, 1); c.ai.flee = { x: G.player.x, y: G.player.y }; c.ai.cruise = flee ? 470 : 260; planRoute(c); Snd.play('cardoor', c.x, c.y); }
// ---------- scams: they run, you chase (or call the cops) ----------
function scamCar(mt, q, r, c) { if (r) { const L = myCars(), s = nearRoadSpot({ x: mt.x, y: mt.y }, 6); if (!s) return cancelMeet(mt, '…'); c = new Car(r.type, s[0], s[1], s[2]); applyMods(c, Object.assign({}, r.mods || {})); c.hp = c.st.hp * (r.cond === undefined ? 1 : r.cond); c.pc = r.pc; c.legit = r.legit; c.gid = r.id; G.cars.push(c); mt.rec = JSON.parse(JSON.stringify(r)); L.splice(L.indexOf(r), 1); }
  else mt.rec = { type: c.type, mods: c.mods, cond: c.hp / c.st.hp, legit: c.legit, pc: c.pc, id: c.gid };
  if (pCar() === c) exitCar(true); driveOff(c, q, 1); c.scamOf = mt.id; c.loot = { cash: rint(150, 700) }; mt.car = c; mt.q = null; mt.state = 'scam'; mt.runAt = G.t; mt.lost = 'your ' + c.d.name;
  const M = VMK(), m = M.msgs.find(x => x.id === mt.mid); if (m) { m.done = 1; m.kind = 'mad'; m.text = mt.who + ' drove off in your ' + c.d.name + '!'; }
  Snd.play('bad'); G.big = { text: 'STOLEN!', col: '#ff5252', t: 2.6, sub: mt.who.split(' ')[0] + ' took off in your ' + c.d.name, small: 1 }; scamDialog(mt, mt.who.split(' ')[0] + ' just drove off in your ' + c.d.name + '!'); }
function scamRun(mt, q, loot, what) { q.meetId = null; q.still = 0; q.hideW = 0; q.loot = Object.assign({ cash: 0 }, loot); q.loot.extra = rint(80, 450); q.scamOf = mt.id; q.state = 'flee'; q.threat = G.player; q.timer = 99; q.speed = 92; mt.q = q; mt.state = 'scam'; mt.runAt = G.t;
  mt.lost = loot.part ? unitName(loot.part.id).split(' — ')[1] || 'part' : money(loot.cash || 0); const M = VMK(), m = M.msgs.find(x => x.id === mt.mid); if (m) { m.done = 1; m.kind = 'mad'; m.text = mt.who + ' ' + what + ' and ran!'; } if (loot.part) { M.plist = (M.plist || []).filter(x => x.id !== mt.lid); }
  pedSay(q, pick(['Later, sucker!', 'Thanks!! 😂', 'Too slow!'])); Snd.play('bad'); scamDialog(mt, mt.who.split(' ')[0] + ' ' + what + ' and ran!'); }
function scamDialog(mt, text, fight) { setTimeout(() => say('🚨 Scammed', text + (fight ? '' : '\n\nRun them down and take it back — and whatever else they\'re carrying. Or call the cops and hope they catch them.'), [
  { t: fight ? 'Bring it' : 'Chase them!', c: 'y' }, { t: '📞 Call the cops', f: () => { closeDialog(); callCopsOn(mt); } }]), 250); }
function callCopsOn(mt) { if (mt.copsT) return toast('Already reported'); mt.copsT = G.t + rnd(7, 13); msg('📞 You reported ' + mt.who + '. Officers are on the way…', '#4fc3f7'); }
function giveBack(mt, how) { const q = mt.q, c = mt.car; let got = [];
  if (q && q.loot) { const L = q.loot; if (L.cash) got.push(money(L.cash)); if (L.part) { unitGive(L.part.id, L.part.c); got.push('your ' + (unitName(L.part.id).split(' — ')[1] || 'part')); }
    if (how === 'you') { const tot = (L.cash || 0) + (L.extra || 0); if (tot) G.drops.push({ x: q.x + rnd(-8, 8), y: q.y + rnd(-8, 8), t: 'cash', v: tot, life: 120 }); if (L.extra) got.push('+' + money(L.extra) + ' of theirs'); }
    else if (L.cash) addCash(L.cash); q.loot = null; }
  mt.state = 'done'; mt.endT = G.t; return got.join(', '); }
function scamTick(mt) { const p = G.player, q = mt.q, c = mt.car;
  if (c && c.scamOf === mt.id) { // they're in your car
    if (c.dead) { mt.state = 'done'; c.scamOf = null; msg('Your ' + c.d.name + ' got wrecked in the chase.', '#ff6b6b'); return; }
    if (c.driver === p) { c.scamOf = null; c.owned = 1; c.persist = 1; mt.state = 'done'; mt.endT = G.t; G.big = { text: 'GOT IT BACK', col: '#2ecc71', t: 2.4, sub: 'Your ' + c.d.name, small: 1 }; Snd.play('cash');
      const jq = G.peds[G.peds.length - 1]; if (jq && !jq.loot && dist2(jq.x, jq.y, c.x, c.y) < 120 * 120) { jq.loot = { cash: 0, extra: c.loot.cash }; jq.scamOf = mt.id; jq.ownCar = null; mt.q = jq; mt.state = 'scam'; mt.car = null; } return; }
    if (mt.copsT && G.t > mt.copsT) { mt.copsT = 0; if (Math.random() < .45) { const i = G.cars.indexOf(c); if (i >= 0 && !inView(c.x, c.y, 80)) { G.cars.splice(i, 1); const L = myCars(); if (garUsed() < garCap() && mt.rec) { L.push(Object.assign({}, mt.rec)); msg('🚔 Police pulled ' + mt.who + ' over. Your ' + c.d.name + ' was towed back to your garage.', '#2ecc71'); } else msg('🚔 Police recovered your ' + c.d.name + ' but your garage is full — it went to the impound and was crushed.', '#ff9f43'); mt.state = 'done'; return; } else { c.ai.cruise = 200; msg('🚔 Cops spotted ' + mt.who.split(' ')[0] + ' — they\'re right there, go!', '#4fc3f7'); } } else { msg('🚔 The police lost ' + mt.who.split(' ')[0] + '. You\'re on your own.', '#ff9f43'); } }
    if (dist2(c.x, c.y, p.x, p.y) > 2600 * 2600 && G.t - mt.runAt > 40 && !mt.copsT) { const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); mt.state = 'done'; msg(mt.who + ' got away with your ' + c.d.name + '.', '#ff6b6b'); }
    return; }
  if (!q) { mt.state = 'done'; return; }
  if (q.dead || q.down || q.hp < 25) { const got = giveBack(mt, 'you'); if (!q.dead) { q.state = 'flee'; q.threat = p; q.timer = 10; pedSay(q, pick(['OK OK! Take it!', 'Stop! Here!', 'I give up!'])); } msg('You took it back' + (got ? ': ' + got : '') + '. (Grab the cash off the ground.)', '#2ecc71'); return; }
  if (q.leaveT) { const got = giveBack(mt, 'cops'); msg('🚔 Police arrested ' + mt.who + ' and returned ' + (got || 'what they could') + '.', '#2ecc71'); return; }
  if (mt.copsT && G.t > mt.copsT) { mt.copsT = 0; if (Math.random() < .7) { q.npcCrime = 3; q.npcCrimeT = G.t; q.npcCrimeAt = G.t - 10; q.reported = 1; for (let n = 0; n < 2; n++) for (let k = 0; k < 14; k++) { const a = rnd(0, TAU), r = rnd(380, 620), x = q.x + Math.cos(a) * r, y = q.y + Math.sin(a) * r; if (solidW(x, y)) continue; const cop = new Ped(x, y, { role: 'cop' }); G.peds.push(cop); copEngage(cop, q); break; } msg('🚔 Officers are chasing ' + mt.who.split(' ')[0] + '!', '#4fc3f7'); } else msg('🚔 No units nearby — the police couldn\'t respond.', '#ff9f43'); }
  if (q.state !== 'fight' && q.state !== 'flee' && !q.copOn) { q.state = 'flee'; q.threat = p; q.timer = 30; }
  if (dist2(q.x, q.y, p.x, p.y) > 1500 * 1500 && !inView(q.x, q.y, 80) && G.t - mt.runAt > 30 && !q.copOn) { const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1); mt.state = 'done'; msg(mt.who + ' got away with ' + mt.lost + '.', '#ff6b6b'); } }
// scammers that ran are fair game for cops & you; a carjacked scammer car doesn't make its thief want it back
{ const _to = tagOwner; tagOwner = function (q, c, h) { if (c && (c.scamOf || c._wasOwned)) return; return _to(q, c, h); }; }
// ---------- map / messages ----------
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(), M = G.save && G.save.mkt; if (M && M.meets) for (const mt of M.meets) { if (mt.state === 'set' || mt.state === 'here') o.push({ x: mt.x, y: mt.y, c: '#ffd600', ic: '$', r: 5, n: 'Meet ' + mt.who + ' (' + mt.place + ')', pr: 9 });
  if (mt.state === 'scam') { const t = mt.car && mt.car.scamOf === mt.id ? mt.car : mt.q; if (t && !t.dead) o.push({ x: t.x, y: t.y, c: '#ff5252', ic: '!', r: 5, n: 'Scammer: ' + mt.who, pr: 10 }); } } return o; }; }
function meetBtns(H, m) { const M = VMK(), mt = (M.meets || []).find(x => x.id === m.meet); if (!mt || m.done) return [];
  return [H.btn('📍 GPS', () => setNav({ x: mt.x, y: mt.y, name: 'Meet ' + mt.who.split(' ')[0] }), 'y'), H.btn('Cancel', () => cancelMeet(mt, 'You cancelled the meet.'))]; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') mktMeetTick(dt); }; }
// a spot near home that's well clear of the garage pad and the front door, so USE never has two targets
function meetClear(g) { const d = g.b.door, ok = (x, y) => !solidW(x, y) && dist2(x, y, g.x, g.y) > 170 * 170 && dist2(x, y, d.x, d.y) > 150 * 150 && !homeGarages().some(h => dist2(x, y, h.x, h.y) < 170 * 170);
  for (let r = 190; r < 420; r += 30) for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = g.x + Math.cos(a) * r, y = g.y + Math.sin(a) * r; if (ok(x, y) && losClear(x, y, g.x, g.y)) return [x, y]; }
  return [g.x + T * 3, g.y]; }
// ---------- meeting at your place: no waiting — scammers ghost you on the spot, everyone else is already at the door ----------
{ const _mm = makeMeet; makeMeet = function (o, what, who, spot) { const M = VMK(), n = (M.meets || []).length; _mm(o, what, who, spot); const mt = M.meets[M.meets.length - 1]; if (!spot.home || !mt || M.meets.length === n) return;
  if (mt.scam && !mt.rob && Math.random() < .55) { cancelMeet(mt, pick(['…', 'nvm', 'actually found one cheaper lol']) ); const m = M.msgs.find(x => x.id === mt.mid); if (m) { m.kind = 'mad'; m.text = who + ' blocked you as soon as you sent your address.'; } blockSelf && blockSelf(who); mkNote(who.split(' ')[0] + ' blocked you'); toast(who + ' blocked you — probably a scammer'); mt.state = 'off'; return; }
  meetNow(mt); }; }
function meetNow(mt) { const s = G.scene, g = homeGarages().find(h => dist2(h.x, h.y, mt.x, mt.y) < 600 * 600), atHome = s && g && (s.b === g.b || s.garage === g);
  if (!atHome) { if (!G.scene && dist2(G.player.x, G.player.y, mt.x, mt.y) < 650 * 650) { spawnMeet(mt); } else msg('📍 ' + mt.who + ' is heading to your place — they\'ll be outside when you get there.', '#4fc3f7'); return; }
  spawnMeet(mt); const q = mt.q; if (!q) return; const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1); q.x = s.door.x + T * .6; q.y = s.door.y - T * .9; q.inside = s; s.peds.push(q); q.still = 1; q.state = 'idle';
  Snd.play('door'); pedSay(q, pick(['Hey! Door was open.', 'Knock knock 👋', 'This the place?'])); msg('🚪 ' + mt.who + ' is here — they let themselves in by the door.', '#2ecc71'); }
