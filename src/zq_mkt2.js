// ================= MARKETPLACE II: real steals, greedy sellers, scams of several kinds, personalities, and ridicule for repeat lowballs =================
const PERS = {
  chill: { acc: ['Deal 🤙 come grab it.', 'Sure, {p} works. It\'s yours.', 'Sounds fair, man. {p}.'], ctr: ['Can\'t do that, but {c} and we\'re good.', 'Meet me at {c}?'], no: ['Nah, I\'m good.', 'Gonna pass, man.', 'Too low, sorry dude.'], closer: ['Getting warmer 🙂 still no though.', 'Closer. Not there yet.'], mad: ['Bro. No. Blocked ✌️'], rep: ['Dude you literally just offered that 😂', 'Same number again? Lol.'], rep2: ['Ok I\'m blocking you, this is getting weird.'] },
  grumpy: { acc: ['Fine. {p}. Don\'t be late.', 'Whatever. {p}. Cash.'], ctr: ['{c}. Take it or leave it.', 'I said {c}. Final.'], no: ['No.', 'Did you even read the ad?', 'Not happening.'], closer: ['Still no. Stop wasting my time.'], mad: ['Lowballers like you are why I hate selling stuff. Blocked.', 'Insulting. Bye. 🚫'], rep: ['You already offered that. The answer was no. It\'s still no.', 'Do you have a memory problem?'], rep2: ['I\'m done with you. Go waste someone else\'s time, clown. 🚫', 'Imagine thinking a third try at the same garbage offer would work. Blocked.'] },
  desperate: { acc: ['Yes!! {p}, thank you so much 🙏', 'Ok {p} deal, can you come today?'], ctr: ['I really need {c}, I\'m sorry 😓', 'Could you do {c}? Rent is due.'], no: ['That\'s really low… I can\'t, sorry.', 'I\'d be losing too much at that.'], closer: ['Almost… could you go a little higher?'], mad: ['Please don\'t message me again.'], rep: ['That\'s the same as before… I already said I can\'t 😞'], rep2: ['Honestly that\'s kind of cruel. Blocking.'] },
  hustler: { acc: ['Done deal, boss. {p}.', 'You drive a hard bargain. {p}.'], ctr: ['C\'mon, {c} and I throw in the floor mats 😎', 'Best I can do is {c}, final final.'], no: ['Haha nice try. No.', 'You think I was born yesterday?'], closer: ['Now we\'re talking… but no.', 'Warmer! Keep going 💸'], mad: ['Lmaooo. Blocked, broke boy.'], rep: ['Same offer twice? Bold strategy, cotton 😂', 'Copy-paste lowball, respect the grind, still no.'], rep2: ['Bro is NEGOTIATING WITH HIMSELF. Blocked 💀', 'I\'m screenshotting this for the group chat. Bye.'] },
  boomer: { acc: ['OK. {p} IS FINE. COME SATURDAY.', 'Alright {p}. Bring cash. No checks.'], ctr: ['I CAN DO {c} FIRM', 'my wife says {c}'], no: ['NO', 'Thats too low son.', 'I paid more than that in 1998'], closer: ['STILL TO LOW'], mad: ['DO NOT CONTACT ME AGAIN. I KNOW WHERE YOU LIVE (on the internet)'], rep: ['YOU SENT THIS ALREADY', 'Is this a computer'], rep2: ['I AM REPORTING YOU TO THE INTERNET POLICE'] },
};
const ARCH = [['steal', .06], ['deal', .17], ['fair', .38], ['greedy', .18], ['project', .06], ['scam', .15]];
function genListing(M) {
  let r = Math.random(), arch = 'fair'; for (const [a, p] of ARCH) { if (r < p) { arch = a; break; } r -= p; }
  const type = pick(MK_POOL), d = CAR_TYPES[type], scam = arch === 'scam', ghost = scam && Math.random() < .35, persona = scam ? pick(['hustler', 'chill']) : pick(Object.keys(PERS));
  const claim = scam ? .85 + Math.random() * .15 : arch === 'project' ? .3 + Math.random() * .2 : .55 + Math.random() * .45, real = scam ? .1 + Math.random() * .3 : clamp(claim + (Math.random() - .6) * .1, .25, 1);
  const mods = {}, add = (k, v) => { if (MODOPTS[k] && MODOPTS[k].o[v]) mods[k] = v; };
  if (!d.two && Math.random() < .4) add('rim', rint(1, 4)); if (Math.random() < .3) add('tint', rint(1, 2)); if (Math.random() < .25) add('eng', rint(1, 2)); if (Math.random() < .12) add('tur', 1); if (!d.custom && Math.random() < .15) add('sp', rint(1, 2));
  const vc = mktValue(type, mods, claim, 1), mult = { steal: .5 + Math.random() * .15, deal: .7 + Math.random() * .15, fair: .9 + Math.random() * .2, greedy: 1.18 + Math.random() * .35, project: .45 + Math.random() * .2, scam: .5 + Math.random() * .25 }[arch];
  const ask = r50(vc * mult), floorK = { steal: .95, deal: .85 + Math.random() * .08, fair: .8 + Math.random() * .12, greedy: .9 + Math.random() * .08, project: .7, scam: .55 }[arch] * (persona === 'desperate' ? .88 : 1);
  const desc = scam ? pick(MK_DESC.scam) : arch === 'steal' ? pick(['Moving overseas TOMORROW. Need it gone, priced to sell.', 'Divorce sale. Wife wants it gone tonight.', 'Inherited it, don\'t drive. Make it disappear.', 'Price is right, first one here gets it.']) : arch === 'greedy' ? pick(['RARE. Collector\'s item. Know what you have.', 'Priced firm. I know what it\'s worth.', 'Investment-grade. No tire kickers.', 'Pristine. Not in a hurry to sell.']) : arch === 'project' ? pick(['Project car. Ran when parked.', 'Needs engine work, body is OK-ish.', 'Mechanic special. Bring a trailer.']) : persona === 'desperate' ? 'Need gone this week. ' + pick(MK_DESC.good) : claim < .7 ? pick(MK_DESC.meh) : pick(MK_DESC.good);
  const life = arch === 'steal' ? 40 + Math.random() * 80 : arch === 'greedy' ? 500 + Math.random() * 500 : 220 + Math.random() * 480;
  let missing = {}, noEng = 0, ask2 = ask; if (arch === 'project' || (arch === 'deal' && Math.random() < .25)) { const req = buildReq(type); for (const k in req) if (Math.random() < .45) missing[k] = rint(1, req[k]); if (stockEng(type) && Math.random() < .5) noEng = 1; if (!noEng && !Object.keys(missing).length) missing.gearbox = 1; ask2 = r50(ask * (.12 + .5 * completeness(type, missing, noEng) ** 2) / (arch === 'project' ? .55 : .8)); }
  return { id: 'm' + (M.seq++), type, color: pick(d.cols), mods, claim, real, scam: scam ? 1 : 0, ghost: ghost ? 1 : 0, arch, persona, missing, noEng, ask: ask2, floorFix: 1, floor: r50(ask2 * floorK), temper: persona === 'grumpy' ? .7 + Math.random() * .3 : persona === 'desperate' ? Math.random() * .2 : Math.random() * .7, seller: randName(), desc, t: M.clock, exp: M.clock + life, legit: (scam && Math.random() < .5) || (arch === 'project' && Math.random() < .3) ? 0 : 1, asked: 0, hot: Math.random() < .5 };
}
const say1 = (l, k, x) => pick(PERS[l.persona || 'chill'][k]).replace('{p}', money(x.p || 0)).replace('{c}', money(x.c || 0));
function offerSellerQ(l, price) {
  const M = VMK(), m = { id: 'x' + (M.seq++), side: 'buy', ctype: l.type, lid: l.id, who: l.seller, t: M.clock, kind: 'wait', text: 'You: Would you take ' + money(price) + ' for the ' + lname(l) + '?', exp: 0 };
  M.msgs.unshift(m); const prev = l.lastOffer; l.lastOffer = Math.max(prev || 0, price);
  m.pend = { at: M.clock + 2 + Math.random() * 5, f: x => {
    const nm = l.seller.split(' ')[0], ratio = price / l.ask;
    if (price >= l.floor) { x.kind = 'deal'; x.price = price; x.exp = M.clock + 240; l.deal = price; x.text = say1(l, 'acc', { p: price }); return mkNote(nm + ' accepted your offer!'); }
    if (prev !== undefined && price <= prev) { l.repeats = (l.repeats | 0) + 1; if (l.repeats >= 2 || l.temper > .75) { x.kind = 'mad'; x.done = 1; M.blocked.push(l.id); x.text = say1(l, 'rep2', {}); return mkNote(nm + ' blocked you — and was not nice about it'); } x.kind = 'info'; x.done = 1; x.text = say1(l, 'rep', {}) + (price < prev ? ' And now it\'s LOWER?? 🤡' : ''); return mkNote(nm + ' is not impressed'); }
    if (price >= l.floor * .86) { const c = r50(Math.max(l.floor, (l.floor + l.ask) / 2 - (l.ask - l.floor) * .25)); x.kind = 'deal'; x.price = c; x.exp = M.clock + 240; x.text = say1(l, 'ctr', { c }); l.deal = c; return mkNote(nm + ' countered at ' + money(c)); }
    const mad = clamp((.82 - ratio) * 1.5 + l.temper * .3 + (l.lowballs | 0) * .22, .05, .92); l.lowballs = (l.lowballs | 0) + 1;
    if (Math.random() < mad) { x.kind = 'mad'; x.done = 1; M.blocked.push(l.id); x.text = say1(l, 'mad', {}); return mkNote(nm + ' blocked you'); }
    x.kind = 'info'; x.done = 1; x.text = prev !== undefined && price > prev ? say1(l, 'closer', {}) : say1(l, 'no', {}); mkNote(nm + ' replied');
  } };
}
function askSellerQ(l) {
  const M = VMK(), m = { id: 'x' + (M.seq++), side: 'buy', ctype: l.type, lid: l.id, who: l.seller, t: M.clock, kind: 'wait', text: 'You: Any problems with it? Can you send more pictures?' }; M.msgs.unshift(m); l.asked = 1;
  m.pend = { at: M.clock + 2 + Math.random() * 4, f: x => { x.kind = 'info'; x.done = 1; const nm = l.seller.split(' ')[0];
    if (l.scam) x.text = l.ghost ? pick(['car is at my cousins place out of town, send deposit and he ships it 🚚', 'i am overseas with the army, pay via gift cards and it will be delivered', 'no viewings sorry. send payment first, very honest seller 100%']) : Math.random() < .65 ? pick(['no problems. pictures are in the ad', 'its perfect bro, serious buyers only', 'cash only. no more pics, its in storage', 'why does everyone ask that. its MINT']) : pick(['Runs perfect, no issues at all.', 'Like new, never had a problem.']);
    else if (l.arch === 'project') x.text = pick(['It doesn\'t run right now. Starter or fuel pump probably. Priced for that.', 'Honestly it\'s a parts car unless you know engines.']);
    else if (l.arch === 'greedy') x.text = pick(['It\'s perfect. That\'s why it\'s that price.', 'Read the ad. Price is firm-ish.', 'Garage queen. Pictures in the ad are all you need.']);
    else x.text = l.real >= .85 ? pick(['Nothing at all, sending pics now 📸 — clean inside and out.', 'Just a tiny scratch on the bumper, here\'s a photo.', 'No issues. Happy to show you the service book.']) : l.real >= .6 ? pick(['Some scratches and the brakes squeak a bit. Price reflects it.', 'Paint is faded on the hood, mechanically sound.', 'Small dent on the side, here are pics.']) : pick(['Honestly it needs work — engine knocks when cold.', 'It\'s rough, I\'ll be upfront. Good project car.', 'Rust and a slipping clutch. Priced for that.']);
    if (l.legit === 0 && !l.scam) x.text += ' No title though.'; mkNote(nm + ' replied'); } };
}
const XFER = .08, PFEE = .05;
function buyListingQ(l, price) {
  if (!payAny(r50(price * XFER))) return false; msg('Title transfer fee: ' + money(r50(price * XFER)), '#cfd6e2');
  if (!l.ghost) { const ok = buyListing0(l, price); if (!ok) addCash(r50(price * XFER), 1); return ok; }
  const M = VMK(); if (!payAny(price)) return false; M.feed = M.feed.filter(x => x !== l); for (const x of M.msgs) if (x.lid === l.id && !x.done) x.done = 1;
  msg('Payment sent to ' + l.seller.split(' ')[0] + '. They say the car is on its way…', '#f2c230');
  setTimeout(() => { G.big = { text: 'SCAMMED', col: '#ff5252', t: 3.6, sub: 'There never was a ' + CAR_TYPES[l.type].name + '. ' + money(price) + ' gone.', small: 1 }; Snd.play('bad'); msg(l.seller.split(' ')[0] + '\'s account was deleted. Lesson learned: never pay for a car you haven\'t seen.', '#ff6b6b'); }, 6000);
  doSave(true); return true;
}
// ---------- buyers on your listings: personalities, time-wasters, trade offers, and check scammers ----------
const BUYERS = { ghost: ['Is this still available?', 'Hi is this available', 'Still have it?'], trade: ['Would you trade for a {i}?', 'I can do {o} plus my {i}?', 'Trade for a {i}? It\'s mint.'], scam: ['{o} cash, I can meet today 👍', 'Def interested. {o}, when can we meet?', 'I\'ll take it for {o}. Cash in hand, ready now.'] };
const TRADES = ['jet ski with no engine', 'signed guitar', '50-inch TV', 'PlayStation and two controllers', 'pet snake', 'timeshare in Varro Sound', 'box of vintage baseball cards', 'riding mower'];
function marketTickQ(dt) {
  const M = G.save && G.save.mkt, n0 = M ? M.seq : 0; marketTick0(dt); if (!M) return;
  for (const m of M.msgs) { if (m.side !== 'sell' || m.flav || m.kind !== 'offer') continue; m.flav = 1; const l = M.list.find(x => x.id === m.lid); if (!l) continue; const r = Math.random();
    if (r < .1) { m.kind = 'info'; m.done = 1; m.text = pick(BUYERS.ghost); }
    else if (r < .16) { m.kind = 'info'; m.done = 1; m.text = pick(BUYERS.trade).replace('{i}', pick(TRADES)).replace('{o}', money(r50(m.offer * .3))); }
    else if (r < .23) { m.scamBuyer = 1; m.offer = r50(l.ask * (1.15 + Math.random() * .3)); m.text = pick(BUYERS.scam).replace('{o}', money(m.offer)); } }
  if (M.bounce && M.clock >= M.bounce.at) { const a = M.bounce.amt; M.bounce = null; const c = Math.min(G.cash, a); G.cash -= c; G.bank = Math.max(0, G.bank - (a - c)); G.big = { text: 'CHECK BOUNCED', col: '#ff5252', t: 3.4, sub: '−' + money(a) + ' — and the car is gone', small: 1 }; Snd.play('bad'); msg('The bank reversed that cashier\'s check. It was fake. The "mover" isn\'t answering.', '#ff6b6b'); }
  void n0;
}
function sellToQ(m) { const sb = m.scamBuyer, amt = m.offer; sellTo0(m); if (m.kind === 'sold') { const fee = r50(amt * PFEE); G.cash -= fee; m.text += '  (−' + money(fee) + ' marketplace fee)'; } if (sb && Math.random() < .8) { const M = VMK(); M.bounce = { at: M.clock + 25 + Math.random() * 20, amt }; } }
function counterBuyer(m, price) { m.counters = (m.counters | 0) + 1; if (m.counters >= 3) { m.kind = 'gone'; m.done = 1; m.text = pick(['Stop haggling. I\'m out.', 'This is exhausting. Bought a different one.', 'Bro you countered me three times. Bye.', 'Forget it, my mom found me one cheaper.']); return mkNote(m.who.split(' ')[0] + ' walked away'); } return counterBuyer0(m, price); }
