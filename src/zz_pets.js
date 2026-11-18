// ================= pets keep up with you =================
// A following pet now runs to keep up, slides along walls instead of giving up, and if it gets stuck behind a building
// it catches up a moment later. Get in a vehicle and it hops in with you; get out and it hops out at your side.
function petRejoin(a) { const p = G.player; for (let k = 0; k < 12; k++) { const ang = (p.a || 0) + Math.PI + (k - 6) * .4, r = 26 + (k % 3) * 10, x = p.x + Math.cos(ang) * r, y = p.y + Math.sin(ang) * r;
    if (!sceneSolid(Math.floor(x / T), Math.floor(y / T))) { a.x = x; a.y = y; a.stuckT = 0; return; } } a.x = p.x; a.y = p.y; a.stuckT = 0; }
function petTick(dt) { const p = G.player, a = G.animals && G.animals.find(x => x.pet && !x.dead); if (!a || p.dead) return; const P = LIFE().pet; if (!P || !P.follow) return;
  if (p.car && !G.scene) { if (!a.ride) { a.ride = 1; if (dist2(a.x, a.y, p.car.x, p.car.y) < 260 * 260) Snd.play(a.k === 'dog' ? 'bark' : a.k === 'cat' ? 'meow' : 'pop', a.x, a.y, .5); } a.x = p.car.x; a.y = p.car.y; a.stuckT = 0; return; }
  if (a.ride) { a.ride = 0; petRejoin(a); return; }
  const d = dist(a.x, a.y, p.x, p.y); if (d > 160 && d >= (a.lastD || 0) - 2) a.stuckT = (a.stuckT || 0) + dt; else a.stuckT = 0; a.lastD = d;
  if (a.stuckT > 1.8 || (d > 260 && !losClear(a.x, a.y, p.x, p.y) && a.stuckT > .8)) petRejoin(a); }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') try { petTick(dt); } catch (e) { console.error(e); } }; }
// a pet riding in your car isn't drawn on the road
{ const _da = drawAnimal; drawAnimal = function (a) { if (a.pet && a.ride) return; return _da(a); }; }
