// ================= slow fixes only happen in storage =================
// Guns: only a gun in your collection (stored at the home gun bench) can be slow-fixed (cleaned & oiled).
// A gun you're carrying gets Fix now (pay) — or store it first. Cars: only garaged cars slow-fix; a car you take out
// keeps the job and picks it back up when you garage it again.
const SFIX_NO_GUN = '🐢 Slow fix: store it first';
const spCleanCost = sp => GCOMP.reduce((s, [k]) => { const v = sp.wc[k] ?? 1; return s + (!(sp.wc.miss && sp.wc.miss[k]) && v < .95 ? Math.max(3, Math.round(compPrice(sp.id, k) * .03 * (1 - v))) : 0); }, 0);
const spCleanMins = sp => Math.ceil(Math.max(0, ...GCOMP.map(([k]) => (sp.wc.miss && sp.wc.miss[k]) ? 0 : .95 - (sp.wc[k] ?? 1))) * 100 / CLEAN_RATE / 60);
const cleaningSp = () => { const CL = G.save && G.save.wclean; return CL && CL.uid ? SPARES().find(s => s.uid === CL.uid) || null : null; };
// the carried gun can't be slow-fixed any more (an old job already running is allowed to finish)
{ const _sc = startClean; startClean = function (id) { if (ownsGun(id) && !GMOUNT) { Snd.play('bad'); return toast('Slow fixes happen on the bench: store the ' + gName(id) + ' in your collection first, or pay for Fix now'); } if (GMOUNT && GMOUNT.id === id) { const sp = SPARES().find(s => s.uid === GMOUNT.uid); if (sp) return startCleanSp(sp, spCleanCost({ id, wc: gcond(id) })); } return _sc(id); }; }
function startCleanSp(sp, cost) { cost = cost ?? spCleanCost(sp); if (!cost) return toast('Nothing to clean'); const CL = G.save.wclean; if (CL) { const o = CL.uid ? cleaningSp() : null; return toast('You\'re already cleaning ' + (o ? 'a ' + gName(o.id) : 'the ' + gName(CL.id)) + ' — one at a time'); }
  if (!payAny(cost)) return; G.save.wclean = { uid: sp.uid, last: G.t }; Snd.play('ratchet'); msg('🧽 The ' + gName(sp.id) + ' is stripped on your bench for cleaning — about ' + spCleanMins(GMOUNT && GMOUNT.uid === sp.uid ? { id: sp.id, wc: gcond(sp.id) } : sp) + ' min.', '#4fc3f7'); doSave(true); }
{ const _ct = cleanTick; cleanTick = function () { const CL = G.save && G.save.wclean; if (!CL || !CL.uid) return _ct();
  const sp = cleaningSp(); if (!sp) { G.save.wclean = null; return; } const d = G.t - (CL.last || G.t); CL.last = G.t; if (d <= 0 || d > 5) return;
  const w = GMOUNT && GMOUNT.uid === sp.uid ? gcond(sp.id) : sp.wc; let left = 0; for (const [k] of GCOMP) { if (w.miss && w.miss[k]) continue; const v = w[k] ?? 1; if (v < .95) { w[k] = Math.min(.95, v + CLEAN_RATE / 100 * d); left++; } } if (GMOUNT) PWC = {};
  if (!left) { G.save.wclean = null; Snd.play('cock'); msg('✨ The ' + gName(sp.id) + ' in your collection is clean, oiled and back together.', '#2ecc71'); doSave(true); } }; }
// taking a gun off the bench to carry it puts it back together
{ const _sc = spareCarry; spareCarry = function (sp) { const CL = G.save.wclean; if (CL && CL.uid === sp.uid) { G.save.wclean = null; toast('Cleaning stopped — it\'s back together'); } return _sc(sp); }; }

// backpack: carried guns don't offer a slow clean any more
{ const pi = PMODES.inv; PMODES.inv = function (H) { const r = pi.call(this, H); try { for (const b of H.body.querySelectorAll('.pb')) if (/Clean & oil it/.test(b.textContent)) { b.textContent = SFIX_NO_GUN + ' at your gun bench'; b.disabled = true; } } catch (e) { } return r; }; }

// ---------- cars: a car you drive can't be slow-fixed; the job waits for it to be garaged again ----------
{ const _to = takeOut; takeOut = function (i, g) { const rec = myCars()[i], job = rec && (rec.sfix || (rec.sfixQ && rec.sfixQ.length)) ? { s: rec.sfix && rec.sfix.s, q: (rec.sfixQ || []).slice() } : null, n0 = G.cars.length; const r = _to(i, g);
  if (job && G.cars.length > n0) { const c = G.cars[G.cars.length - 1]; c._sfix = job; toast('Slow fix paused — it picks back up when you garage it'); } return r; }; }
{ const _st = storeCar; storeCar = function (c) { const n0 = myCars().length, job = c && c._sfix; const r = _st(c); const L = myCars(); if (job && L.length > n0) { const rec = L[L.length - 1]; const q = (job.s ? [job.s] : []).concat(job.q).filter(s => rec.pc && rec.pc[s] < .95); if (q.length) { rec.sfix = { s: q[0], t: G.t }; rec.sfixQ = q.slice(1); toast('Back in the garage — slow fix carries on'); } } return r; }; }
