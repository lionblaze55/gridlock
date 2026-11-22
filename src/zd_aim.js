// ================= TARGETING: one sticky lock shared by the reticle and the gun =================
const LK = { t: null, at: 0 };
const aimOrigin = () => { const p = G.player; return p.car ? [p.car.x, p.car.y] : [p.x, p.y]; };
function tgtAlive(t) { if (!t || t.dead) return false; if (t instanceof Car) return G.cars.includes(t) && !t.dead; if (t.isRemoteTarget) return Net.remoteTargets().includes(t); if (t.isAnimal) return G.animals.includes(t); return (G.scene ? G.scene.peds : G.peds).includes(t); }
const isHostileT = q => q.isRemoteTarget || q.hostile || q.state === 'fight' && (q.target === G.player || !q.target) || q.target === G.player || (q.role === 'cop' && (q.state === 'chase' || q.state === 'fight') && G.wanted > 0) || (q.gang && G.gangAggro[q.gang] > 0) || q.troubleT && G.t - q.troubleT < 20;
function tgtPri(q) { if (q.isAnimal) return G.hostNear ? 5 : 1.25; if (q instanceof Car) return .7; if (isHostileT(q)) return .2; return (q.role === 'cop' ? .8 : 1) * (G.hostNear ? 6 : 1); } // in a fight, bystanders are a last resort
function aimCone(mode, d) { return mode === 'drag' ? clamp(Math.atan2(26, d) + .09, .14, .45) : mode === 'car' ? .7 : .62; }
function pickTarget(a, range, mode) {
  const p = G.player, [ox, oy] = aimOrigin(); let best = null, bs = 1e9; G.hostNear = (G.scene ? G.scene.peds || [] : G.peds).some(q => !q.dead && isHostileT(q) && dist2(q.x, q.y, ox, oy) < range * range * 1.3);
  // hard lock: what you're shooting at stays your target until it's gone, hidden, out of range, or you clearly aim elsewhere
  // breaking it takes intent: drag-aim well away from them (about 50 degrees, held a moment) or swing past about 80 degrees; moving around never breaks it
  if (LK.hard && LK.t && G.t - LK.shot < 4 && tgtAlive(LK.t)) { const d = dist(ox, oy, LK.t.x, LK.t.y), da = Math.abs(angDiff(a, Math.atan2(LK.t.y - oy, LK.t.x - ox))), dtv = Math.min(.1, Math.max(0, G.t - (LK.ev || G.t))); LK.ev = G.t;
    if (losClear(ox, oy, LK.t.x, LK.t.y)) LK.seen = G.t; const hidden = G.t - (LK.seen || G.t) > .8;
    let keep = d < range * 1.25 && !hidden;
    // someone else just hurt you: aim (or move) roughly toward them and the lock jumps over
    const atk = G.attacker, atkOk = atk && G.t - G.attackT < 2.5 && atk !== LK.t && tgtAlive(atk) && losClear(ox, oy, atk.x, atk.y) && dist(ox, oy, atk.x, atk.y) < range * 1.2;
    if (keep && atkOk && Math.abs(angDiff(a, Math.atan2(atk.y - oy, atk.x - ox))) < (mode === 'drag' ? .5 : .8)) { LK.t = atk; LK.seen = G.t; LK.brk = 0; LK.shot = G.t; return atk; }
    const soft = mode === 'drag' ? [.6, 1.05, .12] : mode === 'face' ? (G.t - (LK.fireT || -9) > .9 ? [1.4, 9, .05] : [9, 9, 9]) : [9, 9, 9]; // [hold angle, instant angle, hold time]
    if (keep) { if (da > soft[1]) keep = false; else if (da > soft[0]) { LK.brk = (LK.brk || 0) + dtv; if (LK.brk > soft[2]) keep = false; } else LK.brk = 0; }
    if (keep) return LK.t; }
  LK.hard = 0; LK.brk = 0;
  const score = (q, keep) => { const d = dist(ox, oy, q.x, q.y); if (d > range * (keep ? 1.12 : 1) || d < 4) return 1e9; const cone = aimCone(mode, d) * (keep ? (mode === 'drag' ? 1.45 : 1.12) : 1), da = Math.abs(angDiff(a, Math.atan2(q.y - oy, q.x - ox))); if (da > cone) return 1e9; if (!losClear(ox, oy, q.x, q.y)) return 1e9; return (da / cone + d / range * .45) * tgtPri(q) * (keep ? .5 : 1); };
  // the current lock gets a big bonus while it's still about where you're aiming
  if (LK.t && tgtAlive(LK.t)) { const s = score(LK.t, true); if (s < bs) { bs = s; best = LK.t; } }
  const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) { if (q.dead || q.ko || q.talking || q === p || q === LK.t) continue; const s = score(q); if (s < bs) { bs = s; best = q; } }
  if (G.settings.pvp) for (const r of Net.remoteTargets()) { if (r.inCar || r === LK.t) continue; const s = score(r); if (s < bs) { bs = s; best = r; } }
  if (!G.scene) { for (const c of G.cars) { if (c.dead || c === p.car || !c.driver || c.driver === p || c === LK.t) continue; const hostile = (c.ai && (c.ai.mode === 'chase' || c.ai.mode === 'invest' && stars() > 0)) || c.siren > 0 && stars() > 0 || (c.driver.gang && G.gangAggro[c.driver.gang] > 0); if (!hostile) continue; const s = score(c); if (s < bs) { bs = s; best = c; } }
    for (const an of G.animals) { if (an.dead || an === LK.t || an.scene !== undefined || an.pet || an.d.pet || an.stray || an.leash || an.remoteF || an.coop) continue; const s = score(an); if (s < bs) { bs = s; best = an; } } }
  if (best !== LK.t) LK.at = G.t; LK.t = best; return best; }
function firstCarOnLine(a, range) { const p = G.player, [ox, oy] = aimOrigin(), dx = Math.cos(a), dy = Math.sin(a); let best = null, bt = range;
  for (let s = 0; s < range; s += 10) if (sceneSolid(Math.floor((ox + dx * s) / T), Math.floor((oy + dy * s) / T))) { bt = s; break; }
  if (G.scene) return null; for (const c of G.cars) { if (c.dead || c === p.car) continue; if (dist2(c.x, c.y, ox, oy) > (range + c.L) ** 2) continue; for (const [cx, cy] of c.circles()) { const t = rayCircle(ox, oy, dx, dy, cx, cy, c.W / 2); if (t >= 0 && t < bt) { bt = t; best = c; } } }
  for (const r of Net.remoteCars ? Net.remoteCars() : []) { const t = rayCircle(ox, oy, dx, dy, r.x, r.y, (r.W || 20) / 2 + 4); if (t >= 0 && t < bt) { bt = t; best = r; } }
  return best ? { c: best, d: bt } : null; }
// the car you're pointing straight at wins, unless a threat is close to your line or a person is right on it, in front of the car
function lineOfFire(t, a, range) { const hit = firstCarOnLine(a, range); if (!hit || t === hit.c) return t; if (!t) return hit.c;
  const [ox, oy] = aimOrigin(), dt = dist(ox, oy, t.x, t.y), da = Math.abs(angDiff(a, Math.atan2(t.y - oy, t.x - ox)));
  if (tgtPri(t) <= .4) return da < .35 || dt < hit.d ? t : hit.c; return da < .09 && dt < hit.d + 6 ? t : hit.c; }
function lockAngle(t, a) { if (!t) return a; const [ox, oy] = aimOrigin(); G.aimTarget = t; G.aimLockT = G.t; return Math.atan2(t.y - oy, t.x - ox); }
// tap-fire / drive-by: snap to the target in front of you; drag-aim: help only near where you point
function aimAt(a, range, mode) { const gap = G.t - (LK.lastCall || -9); LK.lastCall = G.t; if (gap < .25) LK.fireT = G.t; else LK.fireT = G.t - gap;  let t = pickTarget(a, range, mode); if (!LK.hard) { const lf = lineOfFire(t, a, range); if (lf !== t) { LK.t = lf; LK.hard = 1; LK.shot = G.t; LK.seen = G.t; G.aimTarget = lf; G.aimLockT = G.t; return a; } } if (t) { if (LK.t !== t) LK.seen = G.t; LK.t = t; LK.hard = 1; LK.shot = G.t; } return lockAngle(t, a); } // shoot where you're pointing
function autoAim(a, range) { return aimAt(a, range, G.player.car ? 'car' : 'face'); }
function aimMagnet(a, range) { return aimAt(a, range, 'drag'); }
function autoAimT(a, range, cone) { return pickTarget(a, range, cone <= .25 ? 'drag' : G.player.car ? 'car' : 'face'); }
