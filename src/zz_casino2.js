// ================= CASINO RACE BOOK: watch the Varro Downs race on the big screen; high rollers sell "tips" =================
// The race itself is the casino's shared race (same winner for everyone in a room); this draws it running.
const RCSILK = ['#e53935', '#1e88e5', '#fdd835', '#43a047', '#8e24aa', '#fb8c00'], RCCOAT = ['#6d4c41', '#3e2723', '#a1887f', '#8d5524', '#bdbdbd', '#4e342e'];
function rcPlan(id) { const R = rcInfo(id), r = mulberry32(h32('plan:' + id)), others = HORSES.map((_, i) => i).filter(i => i !== R.win).sort((a, b) => (R.odds[a] + r() * 3) - (R.odds[b] + r() * 3)), order = [R.win].concat(others);
  return { R, order, T: HORSES.map((_, i) => 6.6 + order.indexOf(i) * (.22 + r() * .12)), wob: HORSES.map(() => [r() * 6, r() * 6, .03 + r() * .03]) }; }
function drawRaceScreen(cvs) { const g = cvs.getContext('2d'), Wd = cvs.width, Ht = cvs.height, now = Date.now(), id = rcId(now), left = (RC_LEN - now % RC_LEN) / 1000, run = left <= 8, t = run ? 8 - left : 0, P = rcPlan(id);
  g.fillStyle = '#1b3d1b'; g.fillRect(0, 0, Wd, Ht); const cx = Wd / 2, cy = Ht / 2 + 6, rx = Wd * .42, ry = Ht * .36, tw = Ht * .16;
  g.fillStyle = '#9b7653'; g.beginPath(); g.ellipse(cx, cy, rx + tw / 2, ry + tw / 2, 0, 0, TAU); g.ellipse(cx, cy, rx - tw / 2, ry - tw / 2, 0, TAU, 0, true); g.fill('evenodd');
  g.strokeStyle = '#fafafa'; g.lineWidth = 2; for (const k of [-1, 1]) { g.beginPath(); g.ellipse(cx, cy, rx + k * tw / 2, ry + k * tw / 2, 0, 0, TAU); g.stroke(); }
  for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#111' : '#fff'; g.fillRect(cx - 2, cy - ry - tw / 2 + i * tw / 6, 4, tw / 6); }
  const old = ctx; ctx = g; try { HORSES.forEach((n, i) => { const T2 = P.T[i], [a, b, amp] = P.wob[i]; let p = run ? Math.min(1, t / T2) : 0; if (run && p < 1) p = Math.max(0, p + amp * Math.sin(p * Math.PI) * Math.sin(t * 1.3 + a) * Math.sin(p * 5 + b)); const lane = (i - 2.5) * tw / 7, th = -Math.PI / 2 - p * TAU - .05, x = cx + Math.cos(th) * (rx + lane), y = cy + Math.sin(th) * (ry + lane), ang = Math.atan2(-Math.cos(th) * (ry + lane), Math.sin(th) * (rx + lane));
      g.save(); g.translate(x, y); g.scale(.8, .8); drawHorse(0, 0, ang, { num: i + 1, silk: RCSILK[i], coat: RCCOAT[i] }, run && p < 1 ? 420 : 0); g.restore(); }); } finally { ctx = old; }
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, Wd, 22); g.fillStyle = '#ffeb3b'; g.font = 'bold 13px "Courier New", monospace'; g.textAlign = 'left'; g.textBaseline = 'middle';
  const fin = run && t > P.T[P.order[0]]; g.fillText('RACE ' + id % 1000 + '  ' + (run ? (fin ? 'WINNER: #' + (P.R.win + 1) + ' ' + HORSES[P.R.win].toUpperCase() : 'AND THEY\'RE OFF!') : 'POST IN ' + Math.ceil(left - 8) + 's'), 8, 11); }
function raceScreenLoop(cvs) { if (!cvs.isConnected) return; drawRaceScreen(cvs); requestAnimationFrame(() => raceScreenLoop(cvs)); }
{ const pc = PMODES.casino; PMODES.casino = function (H) { const r = pc.call(this, H); if (this.opt.game !== 'race') return r; const col = H.body.querySelector('.pcol'); if (!col) return r; const cvs = document.createElement('canvas'); cvs.width = 560; cvs.height = 250; cvs.style.cssText = 'width:100%;height:auto;border-radius:10px;border:2px solid #f2c230;margin:4px 0 8px;flex:none';
  col.insertBefore(cvs, col.children[1] || null); raceScreenLoop(cvs); const tp = G.dealTip; if (tp && tp.rc === rcId()) { const n = H.mk('div', 'pempty', '🤫 Your tip: #' + (tp.h + 1) + ' ' + HORSES[tp.h] + ' — no guarantees.'); n.style.color = '#ffcc80'; col.insertBefore(n, cvs.nextSibling); } return r; }; }
// casino races never pause; re-render the race book at the start and end of each race so the buttons stay right
setInterval(() => { if (Panel.mode !== 'casino' || !Panel.opt || Panel.opt.game !== 'race') return; const left = Math.ceil((RC_LEN - Date.now() % RC_LEN) / 1000); if (left === 8 || left === RC_LEN / 1000) Panel.render(); }, 1000);
// ---------- high rollers in the casino offer the same back-room deals, plus race tips ----------
{ const _eq = enterBuildingQ; enterBuildingQ = function (b) { _eq(b); const s = G.scene; if (!s || s.b !== b || b.type !== 'casino' || s.hrSet) return; s.hrSet = 1; const r = mulberry32(b.id * 29 + (G.day | 0));
  for (const [fx, fy, a] of [[.18, .3, 0], [.24, .3, Math.PI]]) { const q = dressMember(new Ped(s.w * T * fx, s.h * T * fy, { role: 'civ', name: 'High roller — ' + memberName(r) }), Math.floor(r() * 9)); q.a = a; q.home = [q.x, q.y]; s.peds.push(q); } }; }
const TIP_COST = 4000;
function casinoTip(q, nm) { const id = rcId(), left = Math.ceil((RC_LEN - Date.now() % RC_LEN) / 1000); if (left < 22) { dealDone(q); return say(nm, '"Too close to post. Catch me next race."', [{ t: 'OK' }]); }
  const R = rcInfo(id), r = mulberry32(h32('tip:' + id + ':' + q.uid)), right = r() < .6, h = right ? R.win : (R.win + 1 + Math.floor(r() * (HORSES.length - 1))) % HORSES.length;
  return say(nm, '"The race book\'s next race. I know a guy in the jockeys\' room. ' + money(TIP_COST) + ' and I give you a name. It\'s a horse race — no guarantees."', [{ t: 'Pay ' + money(TIP_COST), c: 'y', d: !canPay(TIP_COST), f: () => { if (!payAny(TIP_COST)) return; dealDone(q); G.tipNext = G.t + 360; G.dealTip = { rc: id, h }; Snd.play('cash');
    return say(nm, '"#' + (h + 1) + ', ' + HORSES[h] + '. Paying ' + R.odds[h].toFixed(1) + ' to one. Bet it at the race book — and you never met me."', [{ t: 'Got it' }]); } }, { t: 'Not interested', f: () => dealDone(q) }]); }
{ const _dk = dealKinds; dealKinds = function () { const K = _dk().filter(k => k !== 'tip'); if (G.t < (G.memberCold || 0)) return K; const s = G.scene, left = Math.ceil((RC_LEN - Date.now() % RC_LEN) / 1000);
  if (s && s.b.type === 'casino' && left > 22 && G.t > (G.tipNext || 0) && !(G.dealTip && G.dealTip.rc === rcId())) K.push('tip', 'tip'); return K; }; }
{ const _od = offerDeal; offerDeal = function (q) { if (q.offer === 'tip') return casinoTip(q, q.name.replace(/^(Member|High roller) — /, '')); return _od(q); }; }
