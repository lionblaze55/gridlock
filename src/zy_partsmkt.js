// ================= RARE PARTS (eye-wateringly expensive at mod shops) + a parts marketplace to buy & sell them =================
RIMS.push({ n: 'Forged magnesium', c: '#5f6b75' }); MODOPTS.rim.o.push(['Forged magnesium', 11000]);
MODOPTS.eng.o.push(['Built race motor', 24000]); MODOPTS.tur.o.push(['Twin-turbo kit', 19000]); MODOPTS.ecu.o.push(['Motorsport ECU', 8500]); MODOPTS.hnd.o.push(['Motorsport coilovers', 9000]); MODOPTS.brk.o.push(['Carbon-ceramic brakes', 8000]); MODOPTS.arm.o.push(['Military-grade armor', 14000]);
MODOPTS.ecu.o.push(['Custom piggyback ECU', 13000], ['Standalone race ECU', 21000]); MODOPTS.eng.o.push(['Stroker motor — hand-tuned', 36000]); MODOPTS.tur.o.push(['Ball-bearing big turbo', 27000]); MODOPTS.tyr.o.push(['R-compound semi-slicks', 9500]);
const RARE = new Set(['rim:' + (MODOPTS.rim.o.length - 1), 'eng:4', 'eng:5', 'tur:2', 'tur:3', 'ecu:2', 'ecu:3', 'ecu:4', 'hnd:3', 'brk:3', 'arm:4', 'tyr:4']);
Object.assign(MODDESC, { eng: (MODDESC.eng || '') + ' Built race motors and hand-tuned strokers are rare and absurdly fast.', tur: (MODDESC.tur || '') + ' Twin-turbo kits and ball-bearing big turbos are rare and brutal.', ecu: (MODDESC.ecu || '') + ' Custom and standalone race ECUs unlock even more.', tyr: (MODDESC.tyr || '') + ' R-compound semi-slicks are rare: huge grip and braking, and they still cope with rain.' });
const pkName = pk => { const [k, v] = pk.split(':'); return MODOPTS[k] ? MODOPTS[k].n + ' — ' + MODOPTS[k].o[+v][0] : pk; };
const pkShop = pk => { const [k, v] = pk.split(':'); return MODOPTS[k] && MODOPTS[k].o[+v] ? MODOPTS[k].o[+v][1] : 0; };
const pkValue = pk => r50(pkShop(pk) * (RARE.has(pk) ? .7 : .5));
const PART_POOL = () => { const out = []; for (const k in MODOPTS) { if (PART_EXCL.has(k) || MOTOK.includes(k) || k === 'swp') continue; MODOPTS[k].o.forEach((o, v) => { if (v && o[1] >= 300) out.push(k + ':' + v); }); } return out; };
function genPartListing(M) {
  const rare = Math.random() < .5, pool = PART_POOL(), pk = rare ? pick([...RARE]) : pick(pool.filter(p => !RARE.has(p))), v = pkValue(pk), r = Math.random(), scam = Math.random() < .12;
  const arch = scam ? 'scam' : r < .1 ? 'steal' : r < .3 ? 'deal' : r < .75 ? 'fair' : 'greedy', mult = { steal: .45 + Math.random() * .15, deal: .65 + Math.random() * .2, fair: .9 + Math.random() * .2, greedy: 1.15 + Math.random() * .25, scam: .45 + Math.random() * .2 }[arch];
  const ask = r50(v * mult), persona = pick(Object.keys(PERS));
  return { id: 'pp' + (M.seq++), kind: 'part', pk, rare: RARE.has(pk) ? 1 : 0, arch, ask, floor: r50(ask * ({ steal: .95, deal: .85, fair: .82, greedy: .92, scam: .5 }[arch])), persona, temper: Math.random() * .8, seller: randName(), scam: scam ? 1 : 0, ghost: scam ? 1 : 0, t: M.clock, exp: M.clock + (arch === 'steal' ? 50 + Math.random() * 80 : 200 + Math.random() * 500), desc: scam ? pick(['NEW IN BOX!! ship only, pay first', 'genuine 100%, no meetups']) : rare ? pick(['Rare. Pulled off a race car, works perfect.', 'Only one in town. Serious offers.', 'Collector part, barely used.']) : pick(['Used one season, works great.', 'Upgraded, don\'t need it anymore.', 'Brand new, wrong fitment for my car.']), asked: 0 };
}
const lname = l => l.kind === 'part' ? pkName(l.pk) : CAR_TYPES[l.type].name;
// buying a part
function buyListing(l, price) {
  if (l.kind !== 'part') return buyListingQ(l, price);
  const M = VMK(), ship = 25; if (!payAny(price + ship)) return false; M.pfeed = (M.pfeed || []).filter(x => x !== l); for (const x of M.msgs) if (x.lid === l.id && !x.done) x.done = 1;
  if (l.ghost) { setTimeout(() => { G.big = { text: 'SCAMMED', col: '#ff5252', t: 3.4, sub: 'The box never came. ' + money(price) + ' gone.', small: 1 }; Snd.play('bad'); }, 4000); doSave(true); return true; }
  const [k, v] = l.pk.split(':'); partAdd(k, +v); Snd.play('cash'); msg(pkName(l.pk) + ' delivered to your garage shelf.', '#2ecc71'); doSave(true); return true;
}
// seller replies work the same for parts — just name them right
function offerSeller(l, price) { offerSellerQ(l, price); const m = VMK().msgs[0]; if (l.kind === 'part' && m) { m.pname = pkName(l.pk); m.text = 'You: Would you take ' + money(price) + ' for the ' + pkName(l.pk).split(' — ')[1] + '?'; } }
function askSeller(l) { if (l.kind !== 'part') return askSellerQ(l); const M = VMK(), m = { id: 'x' + (M.seq++), side: 'buy', pname: pkName(l.pk), lid: l.id, who: l.seller, t: M.clock, kind: 'wait', text: 'You: Is it genuine? Any damage?' }; M.msgs.unshift(m); l.asked = 1;
  m.pend = { at: M.clock + 2 + Math.random() * 4, f: x => { x.kind = 'info'; x.done = 1; x.text = l.ghost ? pick(['genuine bro. pay first, i ship tomorrow', 'no pics sorry its packed. 100% legit']) : pick(['Genuine, here\'s the serial number and receipt 📸', 'Works perfect, came off my car last month.', 'Small scuff on the casing, nothing that matters.']); mkNote(l.seller.split(' ')[0] + ' replied'); } }; }
// selling parts from your shelf
function partListTick() { const M = VMK(), now = M.clock; M.plist = (M.plist || []).filter(l => l.held || (PARTS()[l.pk] | 0) > 0);
  M.pfeed = (M.pfeed || []).filter(l => l.exp > now || l.deal); while (M.pfeed.length < 6) M.pfeed.push(genPartListing(M));
  for (const l of M.plist) { if (l.held || now < l.nextT) continue; const bv = l.v * (.85 + Math.random() * .3), low = Math.random() < .25; let offer = low ? r50(l.v * (.4 + Math.random() * .2)) : l.ask <= bv ? l.ask : r50(Math.min(bv, l.ask * .95) * (.88 + Math.random() * .1)); offer = Math.min(offer, l.ask);
    const who = randName(); M.msgs.unshift({ unread: 1, flav: 1, id: 'x' + (M.seq++), side: 'sell', pk: l.pk, pname: pkName(l.pk), lid: l.id, who, bv, offer, t: now, exp: now + 300, kind: 'offer', text: low ? pick(['I\'ll give you ' + money(offer) + ' for it, cash.', money(offer) + '? It\'s used.']) : pick(['Still have the ' + pkName(l.pk).split(' — ')[1] + '? ' + money(offer) + ' works for me.', 'Interested! ' + money(offer) + '?', 'I\'ve been hunting for one of these. ' + money(offer) + '.']) });
    l.nextT = now + waitFor(l.ask / l.v) * (l.rare ? .8 : 1.2) * (.5 + Math.random()); mkNote(who.split(' ')[0] + ' wants your ' + pkName(l.pk).split(' — ')[1]); } }
function marketTickY(dt) { marketTickQ(dt); if (G.save && G.save.mkt && (G._pt = (G._pt || 0) - dt) <= 0) { G._pt = .5; partListTick(); } }
function sellToY(m) { if (!m.pk) return sellToQ(m); const M = VMK(), [k, v] = m.pk.split(':'); if (!partUse(k, +v)) { m.done = 1; return toast('You no longer have that part'); } const fee = r50(m.offer * .05); addCash(m.offer - fee); m.done = 1; m.kind = 'sold'; m.text = 'Sold to ' + m.who + ' for ' + money(m.offer) + '  (−' + money(fee) + ' fee)'; M.plist = M.plist.filter(l => (PARTS()[l.pk] | 0) > 0 || l.id !== m.lid); Snd.play('cash'); doSave(true); }
// ---------- the "Parts" tab of the marketplace ----------
function partsMarket(H, P, top) {
  const M = VMK(); const ps = P.psub || (P.psub = 'buy'); const bar = H.mk('div', 'pbs'); bar.style.cssText = 'display:flex;gap:4px;max-width:none;margin-bottom:4px'; for (const [k, n] of [['buy', 'Buy parts'], ['sell', 'Sell my parts']]) bar.appendChild(H.btn(n, () => { P.psub = k; P.sel = null; }, k === ps ? 'on' : '')); top.appendChild(bar);
  if (ps === 'buy') { const L = (M.pfeed || []).filter(l => !M.blocked.includes(l.id)); if (!L.length) H.empty(top, 'No parts listed right now.');
    for (const l of L) { const v = pkValue(l.pk), r = H.row(top, l.rare ? '💎' : '🔩', pkName(l.pk) + ' · ' + money(l.ask), (l.ask < v * .8 ? '🔥 Way under market · ' : l.ask > v * 1.15 ? '💸 Pricey · ' : '') + (l.rare ? 'RARE · ' : '') + 'mod shop ' + money(pkShop(l.pk)), [H.btn(P.sel === l.id ? 'Viewing' : 'View', () => { P.sel = l.id; }, P.sel === l.id ? 'on' : '')]); if (P.sel === l.id) r.classList.add('sel'); }
    const l = (M.pfeed || []).find(x => x.id === P.sel), c2 = H.col(l ? pkName(l.pk) : 'Listing'); if (!l) { H.empty(c2, 'Rare parts cost a fortune at mod shops. Private sellers let them go for a lot less — sometimes for a steal. Watch for "pay first, I ship" types.'); return; }
    for (const m of M.msgs) if (m.lid === l.id) m.unread = 0; const deal = M.msgs.find(m => m.lid === l.id && m.kind === 'deal' && !m.done);
    H.row(c2, l.rare ? '💎' : '🔩', '"' + l.desc + '"', l.seller, []); H.row(c2, '💵', 'Asking ' + money(l.ask), 'Mod shops charge ' + money(pkShop(l.pk)) + ' · private sales usually ' + money(r50(pkValue(l.pk) * .85)) + '–' + money(r50(pkValue(l.pk) * 1.1)), []);
    if (deal) H.row(c2, '🤝', 'Agreed: ' + money(deal.price), 'Pay and it ships to your garage', [H.btn('Pay ' + money(deal.price), () => buyListing(l, deal.price), 'y', !canPay(deal.price + 25))]);
    const off = P.moff && P.moff.id === l.id ? P.moff : (P.moff = { id: l.id, v: r50(l.ask * .8) });
    H.row(c2, '✉', money(off.v) + ' · ' + Math.round(off.v / l.ask * 100) + '%', 'Your offer', [H.btn('−10%', () => { off.v = r50(off.v - l.ask * .1); }), H.btn('+$50', () => { off.v = Math.min(l.ask, r50(off.v + 50)); }), H.btn('Send', () => offerSeller(l, off.v), 'y', M.msgs.some(m => m.lid === l.id && m.kind === 'wait'))]);
    H.row(c2, '❓', 'Ask if it\'s genuine', l.asked ? 'Asked — see Messages' : '', [H.btn('Ask', () => askSeller(l), '', !!l.asked), H.btn('Block', () => { blockWho(l.seller, l.id); P.sel = null; }, 'r')]);
    for (const m of M.msgs.filter(m => m.lid === l.id).slice(0, 3)) H.row(c2, m.kind === 'wait' ? '…' : '💬', m.kind === 'wait' ? l.seller.split(' ')[0] + ' is typing…' : m.text, '', []).classList.add('pmsg');
    H.foot.appendChild(H.btn('Buy now — ' + money(l.ask) + ' + $25 shipping', () => { if (buyListing(l, l.ask)) P.sel = null; }, 'y', !canPay(l.ask + 25)));
  } else partsSellView(H, P, top, M);
}
function marketTab(H) { if (this.msub !== 'parts') { marketTabQ.call(this, H); const bar = H.body.querySelector('.pcol .pbs'); if (bar) bar.appendChild(H.btn('🔩 Parts', () => { this.msub = 'parts'; this.sel = null; })); return; }
  H.title.textContent = 'Marketplace — parts'; const top = H.col('Car parts'), bar = H.mk('div', 'pbs'); bar.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;max-width:none;margin-bottom:4px'; for (const [k, n] of [['browse', '🔎 Cars'], ['parts', '🔩 Parts'], ['sell', '💲 Sell car'], ['msgs', '💬 Messages']]) bar.appendChild(H.btn(n, () => { this.msub = k; this.sel = null; }, k === 'parts' ? 'on' : '')); top.appendChild(bar); partsMarket(H, this, top); }
