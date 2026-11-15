// ================= THE GARAGE IS PART OF THE BUILDING: a drive-in bay beside the front door, not a pad on the road =================
if (0) { const _gp = garagePad; garagePad = function (b) { if (b.gpad2 !== undefined) return b.gpad2 || _gp(b); b.gpad2 = null; const d = b.door, [fx, fy] = FACEV[d.f], px = -fy, py = fx, own = (x, y) => inMap(x, y) && W.bmap[idx(x, y)] === b.id;
  for (const l of [1, -1, 2, -2, 3, -3]) { const x1 = d.tx - fx + px * l, y1 = d.ty - fy + py * l, x2 = x1 - fx, y2 = y1 - fy, ax = x1 + fx, ay = y1 + fy;
    if (!own(x1, y1) || !own(x2, y2) || !inMap(ax, ay) || W.solid[idx(ax, ay)] || W.bmap[idx(ax, ay)] >= 0) continue;
    W.solid[idx(x1, y1)] = 0; W.solid[idx(x2, y2)] = 0;
    for (const [cx, cy] of [[ax, ay], [x1, y1], [x2, y2]]) { const i = idx(cx, cy), arr = W.pgrid[i]; if (arr && arr.length) { for (const q of arr) { const k = W.props ? W.props.indexOf(q) : -1; if (k >= 0) W.props.splice(k, 1); q.down = 1; q.gone = 1; } W.pgrid[i] = null; } }
    return b.gpad2 = b.gpad = { b, bld: 1, f: [fx, fy], x: (x1 + .5) * T, y: (y1 + .5) * T, x0: Math.min(x1, x2) * T, y0: Math.min(y1, y2) * T, x1: (Math.max(x1, x2) + 1) * T, y1: (Math.max(y1, y2) + 1) * T, ax: (ax + .5) * T, ay: (ay + .5) * T, ex: (x1 + .5 + fx * .5) * T, ey: (y1 + .5 + fy * .5) * T }; }
  return _gp(b); }; }
// ground pass: driveway apron + bay floor (cars are drawn on top of this, the roof on top of them)
{ const _dg = drawGaragePads; drawGaragePads = function () { if (!G.scene) for (const g of homeGarages()) { if (!g.bld || !inView(g.x, g.y, 160)) continue; const [fx, fy] = g.f, pul = .5 + .3 * Math.sin(G.t * 3);
    ctx.fillStyle = '#1b1e24'; ctx.fillRect(g.x0, g.y0, g.x1 - g.x0, g.y1 - g.y0);
    ctx.save(); ctx.translate(g.ax, g.ay); ctx.rotate(Math.atan2(fy, fx)); // +x points away from the building
    ctx.fillStyle = '#8f949c'; ctx.fillRect(-T / 2, -T / 2 + 5, T, T - 10); ctx.strokeStyle = `rgba(79,195,247,${pul})`; ctx.lineWidth = 3; ctx.setLineDash([9, 6]); ctx.beginPath(); ctx.moveTo(-T / 2, -T / 2 + 5); ctx.lineTo(T / 2, -T / 2 + 5); ctx.moveTo(-T / 2, T / 2 - 5); ctx.lineTo(T / 2, T / 2 - 5); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = `rgba(79,195,247,${pul})`; for (const o of [8, -10]) { ctx.beginPath(); ctx.moveTo(o - 9, 0); ctx.lineTo(o + 7, -12); ctx.lineTo(o + 7, 12); ctx.fill(); } ctx.restore(); }
  _dg(); }; }
// top pass: the open roller door and sign on the wall
{ const _db = drawBuildings; drawBuildings = function (a, b2, c, d) { _db(a, b2, c, d); if (G.scene) return; for (const g of homeGarages()) { if (!g.bld || !inView(g.x, g.y, 160)) continue; const [fx, fy] = g.f;
    ctx.save(); ctx.translate(g.ex, g.ey); ctx.rotate(Math.atan2(fy, fx)); // at the doorway, +x = outward
    ctx.fillStyle = '#0a0c10'; ctx.fillRect(-16, -T / 2 + 4, 16, T - 8); ctx.fillStyle = '#f2c230'; ctx.fillRect(-18, -T / 2 + 1, 20, 4); ctx.fillRect(-18, T / 2 - 5, 20, 4);
    ctx.fillStyle = '#5c6470'; for (let i = 0; i < 3; i++) ctx.fillRect(-15 + i * 4, -T / 2 + 5, 2, T - 10); ctx.restore();
    ctx.font = 'bold 10px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; const tx = g.ex - fx * 26, ty = g.ey - fy * 26 + 4; ctx.strokeText('GARAGE', tx, ty); ctx.fillStyle = '#4fc3f7'; ctx.fillText('GARAGE', tx, ty); } }; }
// inside the bay: slow right down so you don't punch through, and you can walk in to open the garage too
{ const _hg = hgTick; hgTick = function () { const c = pCar(); if (c && !G.scene) { const g = homeGarages().find(g => g.bld && onPad(g, c)); if (g && c.spd > 90) { c.vx *= .9; c.vy *= .9; } } _hg(); }; }
