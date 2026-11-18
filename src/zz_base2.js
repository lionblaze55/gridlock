// ================= Fort Varro always has its tanks =================
// The base's vehicles used to spawn at random like street parking, so the tanks were easy to miss. Now the motor pool
// tanks (and a third out by the parade ground) are always parked there, refilled whenever you're away from the base.
function baseTick() { if (!W.base || G.scene) return; const p = G.player;
  if (!W._tank3) { W._tank3 = 1; W.parkSpots.push({ x: 20.5 * T, y: 23.6 * T, a: -Math.PI / 2, type: 'tank', mil: 1 }); }
  for (const s of W.parkSpots) { if (!s.mil || (s.car && G.cars.includes(s.car) && !s.car.dead)) continue; if (s.car && (s.car.dead || !G.cars.includes(s.car))) s.car = null;
    if (inView(s.x, s.y, 120) || dist2(s.x, s.y, p.x, p.y) < 700 * 700 || G.cars.some(c => dist2(c.x, c.y, s.x, s.y) < 70 * 70)) continue;
    const c = new Car(s.type, s.x, s.y, s.a); c.ai = { mode: 'parked' }; c.spot = s; c.persist = s.type === 'tank' ? 1 : 0; s.car = c; G.cars.push(c); } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play' && (G.baseT = (G.baseT || 0) - dt) <= 0) { G.baseT = 1; try { baseTick(); } catch (e) { console.error(e); } } }; }
