// ================= PARTS ONLINE: ship instead of meeting. Scammers still lurk — and they look shady if you read closely =================
const SHADY_NAMES = ['xX_PartzKing_Xx', 'deals4u_88', 'tuner.bro.official', 'J0hn Smith', 'cheap_partz_fast', 'GenuineSeller100', 'mike__1990x', 'autoparts.wholesale.co', 'FastShip🔥🔥', 'trusted_seller_real'];
const SHADY_DESC = ['BRAND NEW IN BOX!!! 90% OFF!! pay first i ship today', 'genuine 100% not fake. NO MEETUPS. gift card or wire only', 'moving overseas must sell FAST, pay first', 'Price firm. Payment upfront only, will ship asap trust me', 'never used!!! original packaging. no returns no questions', 'factory direct!! pay thru link in my bio'];
function mkProf(scam) { const smart = scam && Math.random() < .15, sketchy = !scam && Math.random() < .08;
  if (scam && !smart) return { joined: pick(['today', 'yesterday', '3 days ago']), rev: 0, rating: 0, shady: 1 };
  if (sketchy) return { joined: pick(['last week', '2 weeks ago']), rev: rint(0, 2), rating: rint(3, 5), shady: 0 };
  return { joined: pick(['2019', '2021', '2022', '2023', 'last year', '8 months ago']), rev: rint(4, 180), rating: +(rnd(4.1, 5)).toFixed(1), shady: 0 }; }
function profTxt(l) { const p = l.prof || (l.prof = mkProf(l.ghost)); return 'joined ' + p.joined + ' · ' + (p.rev ? '★' + p.rating + ' (' + p.rev + ' reviews)' : 'no reviews'); }
{ const _g = genPartListing; genPartListing = function (M) { const l = _g(M); l.prof = mkProf(l.ghost); if (l.ghost && l.prof.shady) { l.seller = pick(SHADY_NAMES); l.desc = pick(SHADY_DESC); } return l; }; }
// buying a part: ship it, or meet if you'd rather see it first
{ const _bl = buyListing; buyListing = function (l, price) { if (l.kind !== 'part') return _bl(l, price); const cl = f => () => { closeDialog(); f(); };
  say('Buy ' + (pkName(l.pk).split(' — ')[1] || pkName(l.pk)), 'From ' + l.seller + ' · ' + profTxt(l) + '\n\nShipping is quick and easy — but you\'re trusting a stranger with your money. Meeting lets you see the part first.', [
    { t: '📦 Pay & ship  ' + money(price + 25), c: 'y', f: cl(() => window._buyFinal(l, price)) }, { t: '🤝 Meet in person', f: cl(() => proposeMeet({ side: 'buy', l, price })) }, { t: 'Cancel' }]); return true; }; }
// selling: online buyers, some of them fake
const SHADY_BUY = o => pick(['Sent payment via PayPaI 👍 check ur email and ship today pls', 'I\'ll pay ' + money(o) + ' + extra for shipping, my cousin sends the money after u ship', 'Interested!! I overpaid by mistake, ship it and refund me the rest in gift cards', 'Payment is "on hold" until you send tracking. Ship first pls 🙏', 'Ship to my freight forwarder, payment already sent (pending)']);
{ const _ht = heldTick; heldTick = function () { const M = VMK(), n = M.msgs.length; _ht(); for (const m of M.msgs.slice(0, M.msgs.length - n)) { if (!m.held || m.sb !== undefined) continue; m.sb = Math.random() < .12 ? 1 : 0; if (m.sb) { m.scamBuyer = 1; m.who = pick(SHADY_NAMES); { const ll = (M.plist || []).find(x => x.id === m.lid); m.offer = r50(Math.max(m.offer * rnd(1.05, 1.3), ll ? ll.ask * rnd(1, 1.15) : 0)); } m.text = SHADY_BUY(m.offer); } } }; }
{ const _st = sellTo; sellTo = function (m) { const M = VMK(), l = (M.plist || []).find(x => x.id === m.lid); if (!(l && l.held)) return _st(m); const cl = f => () => { closeDialog(); f(); };
  say('Sell to ' + m.who, money(m.offer) + ' for your ' + (unitName(l.pk).split(' — ')[1] || 'part') + '.\n\nShip it and get paid online, or meet so you get cash in hand.', [
    { t: '📦 Ship it  (+' + money(m.offer - r50(m.offer * .05)) + ')', c: 'y', f: cl(() => shipSale(m, l)) }, { t: '🤝 Meet in person', f: cl(() => _st(m)) }, { t: 'Cancel' }]); }; }
function shipSale(m, l) { const M = VMK(); if (!m.scamBuyer) { sellToC(m); return; }
  M.plist = M.plist.filter(x => x !== l); m.done = 1; m.kind = 'mad'; m.text = 'Shipped to ' + m.who + ' — waiting for the payment to clear…'; Snd.play('pop'); toast('Shipped'); doSave(true);
  setTimeout(() => { m.text = m.who + ' never paid. The "payment" was a fake email. Your part is gone.'; mkNote('Payment from ' + m.who + ' bounced'); G.big = { text: 'SCAMMED', col: '#ff5252', t: 3.4, sub: 'You shipped a part to a fake buyer.', small: 1 }; Snd.play('bad'); doSave(true); }, 18000); }
