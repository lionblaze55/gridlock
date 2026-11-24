// ---- playthrough bot: fast-forwards the real game loop and moves the player at realistic speeds ----
window.BOT = (() => { const B = { err: {}, src: 'idle', earn: {}, spend: {}, timeBy: {}, deaths: 0, busts: 0, missions: [], notes: [], samples: [] };
  const M = () => G.cash + G.bank; let last = M(), d0 = G.deaths | 0;
  B.tick = dt => { try { update(dt); } catch (e) { const k = String(e && e.message || e).slice(0, 140) + ' @' + String(e && e.stack || '').split('\n').slice(1, 5).map(s => s.trim().replace(/\(.*:(\d+):\d+\)/, ':$1')).join(' < '); B.err[k] = (B.err[k] || 0) + 1; }
    const m = M(), d = m - last; if (d > 0) B.earn[B.src] = (B.earn[B.src] || 0) + d; else if (d < 0) B.spend[B.src] = (B.spend[B.src] || 0) - d; last = m; B.timeBy[B.src] = (B.timeBy[B.src] || 0) + dt; };
  B.step = sec => { for (let i = 0; i < sec * 30; i++) B.tick(1 / 30); };
  B.note = s => { if (B.notes.length < 80 && !B.notes.includes(s)) B.notes.push(s); };
  { const _c = completeMission, _f = failMission; completeMission = function () { const m = G.mission; if (m) B.missions.push({ ok: 1, t: m.title, r: m.reward, dt: Math.round(G.t - (m._t0 || G.t)) }); return _c.apply(this, arguments); };
    failMission = function (why) { const m = G.mission; if (m) B.missions.push({ ok: 0, t: m.title, why: String(why).slice(0, 60), dt: Math.round(G.t - (m._t0 || G.t)) }); return _f.apply(this, arguments); };
    const _s = startMission; startMission = function (m) { m._t0 = G.t; return _s.apply(this, arguments); }; }
  { const _d = playerDie; playerDie = function () { B.deaths++; B.note('died during ' + B.src + (G.attacker ? ' (by ' + (G.attacker.role || G.attacker.type || '?') + (G.attacker.gang ? ':' + G.attacker.gang : '') + ')' : '')); return _d.apply(this, arguments); }; }
  B.wait = (cond, max) => { let t = 0; while (!cond() && t < max) { B.tick(1 / 30); t += 1 / 30; } return cond(); };
  // move toward a point; cars ~330 px/s effective (roads, turns), feet ~150 px/s running
  const ri = v => { let b = 0, bd = 1e18; for (let i = 0; i < NR; i++) { const d = Math.abs(roadCX(i) - v); if (d < bd) { bd = d; b = i; } } return [b, bd]; };
  const rj = v => { let b = 0, bd = 1e18; for (let j = 0; j < NR; j++) { const d = Math.abs(roadCY(j) - v); if (d < bd) { bd = d; b = j; } } return [b, bd]; };
  B.route = (x, y, r, maxT) => { const o = pCar() || G.player; if (G.scene) { exitBuilding(); B.step(.4); } const [ix, dx0] = ri(o.x), [jt, dy1] = rj(y), lim = RSP * T * 1.5; if (dx0 > lim || dy1 > lim || Math.hypot(x - o.x, y - o.y) < 500) return B.go(x, y, r, maxT);
    return B.go(roadCX(ix), o.y, 60, 60) && B.go(roadCX(ix), roadCY(jt), 60, 120) && B.go(x, roadCY(jt), 60, 120) && B.go(x, y, r, maxT); };
  B.go = (x, y, r, maxT) => { r = r || 40; maxT = maxT || 240; const p = G.player; let t = 0; if (G.scene) { exitBuilding(); B.step(.4); }
    while (t < maxT) { if (p.dead) { B.wait(() => !p.dead, 15); return false; } const c = pCar(), o = c || p, dx = x - o.x, dy = y - o.y, d = Math.hypot(dx, dy);
      if (d < r) { if (c) { c.vx = c.vy = 0; c.spd = 0; } return true; } const v = c ? (c.d.boat ? 200 : (c.d.pedal ? 190 : c.type === 'bus' || c.type === 'dump' ? 300 : 380)) : 150, s = Math.min(d, v / 30); o.x += dx / d * s; o.y += dy / d * s; if (c) { c.a = Math.atan2(dy, dx); c.vx = c.vy = 0; c.spd = 0; } else p.a = Math.atan2(dy, dx);
      B.tick(1 / 30); t += 1 / 30; } return false; };
  B.getCar = () => { if (pCar()) return pCar(); const p = G.player; let best = null, bd = 1e18; for (const c of G.cars) { if (c.dead || c.d.boat || c.d.pedal || c.missionCar || c.copHeli || /police|cop|swat|tank|ambul|fire/.test(c.type)) continue; const d = dist2(c.x, c.y, p.x, p.y); if (d < bd) { bd = d; best = c; } }
    if (!best) return null; B.go(best.x, best.y, 40, 60); best.locked = 0; best.wired = 1; try { enterCar(best); } catch (e) { B.note('enterCar threw: ' + e.message); } B.step(1.6); return pCar(); };
  // lose the cops: drive away from them, hide if that fails
  B.evade = (max) => { max = max || 240; let t = 0; const p = G.player; while (stars() > 0 && t < max && !p.dead) { if (G.bustInfo || p.cuffed) break; const o = pCar() || p; let cx = 0, cy = 0, n = 0; for (const q of G.peds) if (!q.dead && q.role === 'cop' && dist2(q.x, q.y, o.x, o.y) < 900 * 900) { cx += q.x; cy += q.y; n++; } for (const c of G.cars) if (!c.dead && /police|swat/.test(c.type) && dist2(c.x, c.y, o.x, o.y) < 1200 * 1200) { cx += c.x; cy += c.y; n++; }
      let ax, ay; if (n) { ax = o.x - cx / n; ay = o.y - cy / n; } else { ax = Math.cos(t); ay = Math.sin(t); } const d = Math.hypot(ax, ay) || 1; B.go(o.x + ax / d * 700, o.y + ay / d * 700, 40, 3); t += 3; }
    return stars() === 0; };
  B.runMission = (maxT) => { maxT = maxT || 600; const t0 = G.t, p = G.player; let stuck = 0, lastTgt = null;
    while (G.mission && G.t - t0 < maxT) { const m = G.mission; if (p.dead) { B.wait(() => !p.dead, 15); continue; }
      if (m.needNoStars !== false && stars() > 0 && (m.title || '').match(/shipment|Heist|heist|Drop|deal|Deal/) ) { B.evade(90); continue; }
      const car = m.car || m.cab; if (car && !car.dead && pCar() !== car) { B.route(car.x, car.y, 35, 90); if (pCar()) exitCar(true); B.step(.3); car.locked = 0; car.wired = 1; try { enterCar(car); } catch (e) { B.note('enterCar threw ' + e.message); } B.step(1.6); if (pCar() !== car) { stuck++; if (stuck > 5) { B.note('could not get into mission car: ' + m.title); break; } } continue; }
      if (m.title === 'Loose Ends' && m.t && !m.t.dead) { B.go(m.t.x, m.t.y, 90, 60); m.t.hurt(999, p); for (const g of m.gs || []) if (!g.dead && Math.random() < .7) g.hurt(999, p); B.step(1); continue; }
      if (m.onWreck) { const c = G.cars.find(c => !c.dead && c !== pCar() && !c.missionCar && !/police|swat/.test(c.type) && dist2(c.x, c.y, p.x, p.y) < 1200 * 1200); if (c) { B.go(c.x, c.y, 80, 20); c.damage(99999, p); } B.step(.6); continue; }
      if (m.target) { const k = Math.round(m.target.x) + ',' + Math.round(m.target.y); if (k === lastTgt) stuck++; else stuck = 0; lastTgt = k; if (stuck > 40) { B.note('mission stuck at target: ' + m.title + ' / ' + m.target.label); break; } B.route(m.target.x, m.target.y, 30, 150); B.step(2.5); } else { B.step(1); stuck++; if (stuck > 120) { B.note('mission without target for 2 min: ' + m.title); break; } } }
    if (G.mission && G.t - t0 >= maxT) { B.note('mission timed out: ' + G.mission.title); try { failMission('bot gave up'); } catch (e) { } } };
  B.report = () => { const o = {}; for (const k in B.timeBy) { const h = B.timeBy[k] / 3600; o[k] = { min: +(B.timeBy[k] / 60).toFixed(1), earn: Math.round(B.earn[k] || 0), spend: Math.round(B.spend[k] || 0), perHr: Math.round(((B.earn[k] || 0) - (B.spend[k] || 0)) / Math.max(h, 1e-6)) }; } return o; };
  return B; })();
