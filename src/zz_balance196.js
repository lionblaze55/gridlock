// ================= 1.96: a bookkeeper for your empire, and heists you can run again =================
// Bookkeeper: one hire, and every midnight all your property safes are swept into your bank (minus a 6% fee),
// so owning a dozen places doesn't mean a daily lap of the city to empty them.
const BK_PRICE = 30000, BK_FEE = .06;
{ const _lt = lifeTick; lifeTick = function (dt) { const L = LIFE(), d0 = L.day; _lt(dt); if (!L.bk || d0 === undefined || L.day === d0) return; let n = 0, k = 0;
  for (const id in L.own) { const O = L.own[id]; if (O && O.safe >= 1) { const v = Math.floor(O.safe); O.safe -= v; n += v; k++; } }
  if (n) { const net = Math.round(n * (1 - BK_FEE)); G.bank += net; L.earned = (L.earned || 0) + net; msg('📒 Your bookkeeper swept ' + k + ' safe' + (k > 1 ? 's' : '') + ': ' + money(net) + ' deposited (after a ' + money(n - net) + ' fee).', '#2ecc71'); } }; }
{ const _ph = PMODES.phone; PMODES.phone = function (H) { const r = _ph.call(this, H); if (this.tab !== 'empire') return r; try { const L = LIFE(), n = Object.keys(L.own || {}).length; if (!n) return r; const c = H.col('📒 Bookkeeper');
  if (L.bk) H.row(c, '📒', 'Bookkeeper on payroll', 'Every midnight your safes are swept into your bank, minus a ' + Math.round(BK_FEE * 100) + '% fee. You can still empty a safe yourself any time to keep the whole thing.', [H.btn('Let them go', () => { L.bk = 0; doSave(true); }, 'r')]);
  else H.row(c, '📒', 'Hire a bookkeeper', 'Sweeps every property safe into your bank at midnight for a ' + Math.round(BK_FEE * 100) + '% fee — no more driving round to collect. ' + money(BK_PRICE) + ' one-time.', [H.btn('Hire', () => { if (!payAny(BK_PRICE)) return; L.bk = 1; Snd.play('cash'); doSave(true); }, 'y', !canPay(BK_PRICE))]); } catch (e) { } return r; }; }
// Heists: once you've pulled one, the contact will plan it again after things cool off (two in-game days).
// Replays pay 80% of the original cut; the setups and the finale play out fresh.
const HEIST_COOL = 48, heistCut = H => { const S = HST(); return (S.runs && S.runs[H.id]) ? Math.round(H.pay * .8 / 500) * 500 : H.pay; };
{ const _ht = heistTalk; heistTalk = function (q) { const H = HEISTS.find(h => h.id === q.heist), S = HST(); if (!H || !S.done[H.id]) return _ht(q); S.fin = S.fin || {}; S.runs = S.runs || {};
  if ((S.prog[H.id] | 0) < H.steps.length) { const p0 = H.pay; S.done[H.id] = 0; H.pay = heistCut(H); try { _ht(q); } finally { S.done[H.id] = 1; H.pay = p0; } return; }
  const wait = HEIST_COOL - (GH() - (S.fin[H.id] ?? -1e9)); if (wait > 0) return say(H.who, '"Too hot right now. Give it ' + Math.ceil(wait / 24) + ' more day' + (wait > 24 ? 's' : '') + ' and come see me."', [{ t: 'Later' }]);
  say(H.who, '"Same crew, same plan, fresh security. Want to run it back? Your cut this time: ' + money(Math.round(H.pay * .8 / 500) * 500) + '."', [G.mission ? { t: 'Finish what you\'re doing first', d: true } : { t: 'Plan it again', c: 'y', f: () => { closeDialog(); S.prog[H.id] = 0; S.runs[H.id] = (S.runs[H.id] | 0) + 1; heistTalk(q); } }, { t: 'Not now' }]); }; }
{ const _hs = startHeistStep; startHeistStep = function (H, i) { const r = _hs.apply(this, arguments); const m = G.mission; if (m && m.heistId === H.id && m.reward) m.reward = heistCut(H); return r; }; }
{ const _hf = heistFinish; heistFinish = function (H) { const live = G.mission && G.mission.heistId === H.id, cut = heistCut(H); _hf(H); if (!live) return; const S = HST(); S.fin = S.fin || {}; S.fin[H.id] = GH(); if (G.big && cut !== H.pay) G.big.sub = H.n + ' — your cut ' + money(cut); msg(H.who + ' will plan it again once things cool off — about two days.', '#ce93d8'); }; }
{ const _tab = heistsTab; heistsTab = function (H) { _tab(H); const S = HST(), done = HEISTS.filter(h => S.done[h.id]); if (!done.length) return; const c = H.col('Run it back');
  for (const h of done) { const inProg = (S.prog[h.id] | 0) < h.steps.length, wait = HEIST_COOL - (GH() - ((S.fin || {})[h.id] ?? -1e9));
    H.row(c, '🔁', h.n + ' — ' + h.who, inProg ? 'Replay in progress · ' + (S.prog[h.id] | 0) + '/' + h.steps.length + ' steps' : wait > 0 ? 'Ready again in ' + Math.ceil(wait / 24) + ' day' + (wait > 24 ? 's' : '') : 'Ready — ' + money(Math.round(h.pay * .8 / 500) * 500) + ' cut', [H.btn('GPS', () => { setNav({ x: h.drop.x, y: h.drop.y, name: h.who }); Panel.close(); }, 'y')]); } }; }
