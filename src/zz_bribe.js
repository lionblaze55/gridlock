// ================= bribing a cop (minor crimes only) =================
// At 1–2 stars, wanted only for minor stuff, a cop close to you can be bribed: a small or a generous offer, each with a
// shown chance. Cash only, and only paid if he takes it. If he refuses it's "Attempted bribery" on your sheet, and each
// cop only hears one offer. Murder, cop-killing, armed robbery, assaulting police and stealing a cop car can't be bought off.
const BRIBE_NO = /killing a cop|murder|armed robbery|assaulting police|stealing a police|jacking a cop|kidnap|explos/i;
const r50b = n => Math.round(n / 50) * 50;
function bribeable() { if (stars() < 1 || stars() > 2) return false; const R = G.rap || []; if (R.some(e => BRIBE_NO.test(e.k))) return false; return R.reduce((s, e) => s + chargeFine(e), 0) <= 3000; }
function bribeCop() { const p = G.player; let best = null, bd = 230 * 230; for (const q of G.peds) { if (q.dead || q.role !== 'cop' || q.swat || q.army || q.bribeTried || q.lawJob) continue; const d = dist2(q.x, q.y, p.x, p.y); if (d < bd && losClear(q.x, q.y, p.x, p.y)) { bd = d; best = q; } } return best; }
function bribeOffer(q) { q = q || bribeCop(); if (!q) return toast('No cop close enough to talk to');
  if (!bribeable()) return say(q.name + ' — SVPD', stars() > 2 ? '"Too late for that. Hands where I can see them!"' : '"Not a chance. Not for what you did."');
  const st = Math.max(1, stars()), R = G.rap || [], fine = Math.max(250 * st, R.reduce((s, e) => s + chargeFine(e), 0)), lo = Math.max(100, r50b(fine * .4)), hi = Math.max(250, r50b(fine * .9));
  const ch = b => clamp(b - (st - 1) * .15 - (plArmed() ? .1 : 0), .05, .9), c1 = ch(.35), c2 = ch(.72); G.talkPed = q; q.talking = 1; q.state = 'idle';
  const tryB = (amt, chance) => { closeDialog(); q.bribeTried = 1; q.talking = 0;
    if (Math.random() < chance && payCash(amt)) { callOffCops(); G.heat = 0; G.reports = []; for (const c of G.peds) if (c.role === 'cop' && !c.dead && c.target === G.player) { c.state = 'walk'; c.target = null; }
      pedSay(q, pick(['I didn\'t see anything. Beat it.', 'Get out of here before I change my mind.', 'Pleasure doing business. Drive safe.'])); msg('💵 He pockets it — the cops back off.', '#2ecc71'); }
    else { crime(1, 'Attempted bribery'); q.state = 'chase'; q.target = G.player; pedSay(q, pick(['Are you trying to bribe me?!', 'That\'s a felony, pal!', 'Nice try. Hands behind your back!'])); msg('🚔 He didn\'t bite — attempted bribery added to your sheet.', '#ff6b6b'); } };
  say(q.name + ' — SVPD', '"' + pick(['You know why I stopped you?', 'Make it quick.', 'Let\'s hear it.']) + '"\nWanted for: ' + (R.map(e => e.k).join(', ') || 'disorderly conduct') + ' · cash on you ' + money(G.cash), [
    { t: '💵 Slip him ' + money(lo) + ' — ~' + Math.round(c1 * 100) + '% he takes it', c: 'y', d: G.cash < lo, f: () => tryB(lo, c1) },
    { t: '💵 Make it worth his while: ' + money(hi) + ' — ~' + Math.round(c2 * 100) + '%', c: 'y', d: G.cash < hi, f: () => tryB(hi, c2) },
    { t: 'Never mind', f: () => { q.talking = 0; closeDialog(); } }]); }
// the HUD button, next to SURRENDER
{ const _dl = drawLawHUDL; drawLawHUDL = function (sc) { _dl(sc); Input.bribeBtn = null; if (G.surrender || !canSurrender() || !bribeable() || !bribeCop()) return;
  const w = 104 * sc, h = 34 * sc, x = VW / 2 - 60 * sc - w - 10 * sc, y = VH - h - 18 * sc; ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fill(); ctx.strokeStyle = '#57e389'; ctx.lineWidth = 2; ctx.stroke();
  txt('💵 BRIBE', x + w / 2, y + h * .66, 13 * sc, '#fff', 'center'); Input.bribeBtn = [x, y, w, h]; }; }
