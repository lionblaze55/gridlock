// ================= MAP (pan / zoom / GPS routes) + RESPAWN SAFETY =================
const MAPV = { z: 1, cx: N / 2, cy: N / 2, ptrs: {}, sel: null, btns: [], last: 0, key: 0 };
const mapS = () => Math.min(VW, VH) / N * MAPV.z;
const mapToScr = (wx, wy) => [VW / 2 + (wx / T - MAPV.cx) * mapS(), VH / 2 + (wy / T - MAPV.cy) * mapS()];
const scrToMap = (sx, sy) => [((sx - VW / 2) / mapS() + MAPV.cx) * T, ((sy - VH / 2) / mapS() + MAPV.cy) * T];
function mapClamp() { MAPV.z = clamp(MAPV.z, 1, 12); MAPV.cx = clamp(MAPV.cx, 0, N + 14); MAPV.cy = clamp(MAPV.cy, 0, N + 12); }
function mapZoom(f, sx, sy) { const [wx, wy] = scrToMap(sx, sy); MAPV.z = clamp(MAPV.z * f, 1, 12); const S = mapS(); MAPV.cx = wx / T - (sx - VW / 2) / S; MAPV.cy = wy / T - (sy - VH / 2) / S; mapClamp(); }
function mapCentre() { const p = G.scene ? G.outPos : (pCar() || G.player); MAPV.cx = p.x / T; MAPV.cy = p.y / T; }
function closeMap() { G.fullMap = false; MAPV.ptrs = {}; MAPV.sel = null; }
function mapPOIs0() {
  const out = []; for (const b of W.buildings) if (b.door && DOORCOL[b.type]) out.push({ x: b.door.x, y: b.door.y, c: DOORCOL[b.type], r: 4, n: b.name });
  for (const z of W.sprays) out.push({ x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2, c: z.kind === 'chop' ? '#ff7a30' : '#f2c230', r: 5, n: z.b ? z.b.name : z.kind === 'chop' ? 'Chop shop' : 'Customs garage' });
  for (const d of W.dealerSpots) out.push({ x: d.x, y: d.y, c: '#66bb6a', r: 3, n: 'Dealer' });
  if (COOP) out.push({ x: COOP.x, y: COOP.y, c: '#8bc34a', r: 7, n: 'Big Valley Co-op' }); for (const f of FARMS) out.push({ x: f.b.door.x, y: f.b.door.y, c: owned(f.b) ? '#2ecc71' : '#c5e1a5', r: 4.5, n: f.b.name + (owned(f.b) ? '' : ' (for sale)') }); for (const b of W.buildings) if (b.sub === 'market' || b.sub === 'pets') out.push({ x: b.door.x, y: b.door.y, c: b.sub === 'pets' ? '#ff8a65' : '#8bc34a', r: 4.5, n: b.name }); for (const ph of W.phones) out.push({ x: ph.x, y: ph.y, c: '#5dade2', r: 3, n: 'Payphone' });
  return out;
}
function drawFullMap() {
  const now = performance.now(); if (now - MAPV.last > 400) { MAPV.ptrs = {}; MAPV.sel = null; if (!MAPV.init) { MAPV.init = 1; MAPV.z = 2; mapCentre(); mapClamp(); } else if (MAPV.z > 1.05) mapCentre(); } MAPV.last = now;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#0b1622'; ctx.fillRect(0, 0, VW, VH);
  const S = mapS(), [ox, oy] = mapToScr(0, 0), z = MAPV.z;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(MINI, ox, oy, N * S, N * S); ctx.imageSmoothingEnabled = true;
  ctx.font = `bold ${clamp(S * 3, 9, 22)}px Bungee, sans-serif`; ctx.textAlign = 'center'; ctx.fillStyle = `rgba(255,255,255,${z > 3 ? .45 : .8})`;
  for (const l of W.labels) ctx.fillText(l.n, ox + l.x * S, oy + l.y * S);
  ctx.fillStyle = '#7a5a3a'; for (const [px, py, pw, ph] of W.piers) ctx.fillRect(ox + px * S, oy + py * S, pw * S, ph * S);
  if (G.nav && G.nav.path && G.nav.path.length > 1) { ctx.lineJoin = ctx.lineCap = 'round'; ctx.strokeStyle = '#000'; ctx.lineWidth = 6; ctx.beginPath(); G.nav.path.forEach((q, i) => { const [x, y] = mapToScr(q[0], q[1]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 3.5; ctx.stroke(); ctx.lineCap = 'butt'; }
  const k = clamp(.8 + z * .2, 1, 2), dot = (x, y, c, r) => { const [sx, sy] = mapToScr(x, y); if (sx < -10 || sy < -10 || sx > VW + 10 || sy > VH + 10) return; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(sx, sy, r * k, 0, TAU); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); };
  const pois = MAPV.pois = mapPOIs(); drawMapIcons(pois, z);
  if (z > 3.2) { ctx.font = '600 10px Rubik, sans-serif'; ctx.textAlign = 'center'; for (const q of pois) { if (q.r < 4) continue; const [sx, sy] = mapToScr(q.x, q.y); if (sx < 0 || sy < 0 || sx > VW || sy > VH) continue; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeText(q.n, sx, sy - 9); ctx.fillStyle = '#fff'; ctx.fillText(q.n, sx, sy - 9); } }
  Net.drawMini((x, y, c, r) => dot(x, y, c, r * 1.5));
  if (G.mission && G.mission.target) dot(G.mission.target.x, G.mission.target.y, '#f2c230', 7);
  const flag = (wx, wy, col) => { const [sx, sy] = mapToScr(wx, wy); ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 20); ctx.stroke(); ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(sx, sy - 21); ctx.lineTo(sx + 14, sy - 16); ctx.lineTo(sx, sy - 10); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(sx, sy, 3, 0, TAU); ctx.fill(); };
  if (G.nav) flag(G.nav.x, G.nav.y, '#ff4fd8'); if (MAPV.sel) flag(MAPV.sel.x, MAPV.sel.y, '#7fdbff');
  { const p = G.scene ? G.outPos : (pCar() || G.player), [sx, sy] = mapToScr(p.x, p.y); ctx.save(); ctx.translate(sx, sy); ctx.rotate((pCar() || G.player).a || 0); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-7, -7); ctx.lineTo(-3, 0); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); }
  // chrome
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, VW, 30); txt('SAN VARRO', 12, 20, 16, '#f2c230', 'left'); txt('Drag to pan  ·  pinch or + / − to zoom  ·  tap a place to set a GPS route', VW / 2, 20, 11, '#cfd6e2', 'center');
  MAPV.btns = []; const B = (id, label, x, y, w, h, col) => { MAPV.btns.push({ id, r: [x, y, w, h] }); ctx.fillStyle = col || 'rgba(15,20,30,.9)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, 8) : ctx.rect(x, y, w, h); ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.font = '800 ' + (label.length > 2 ? 12 : 20) + 'px Rubik, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x + w / 2, y + h / 2 + 1); ctx.textBaseline = 'alphabetic'; };
  const bw = 44, bx = VW - bw - 10; B('close', '✕', bx, 38, bw, 40, '#8a1c1c'); B('in', '+', bx, 86, bw, 40); B('out', '−', bx, 132, bw, 40); B('me', 'ME', bx, 178, bw, 40); B('key', 'KEY', bx, 224, bw, 40); B('goto', 'GO', bx, 270, bw, 40, '#1b5e20');
  if (MAPV.key) drawIconKey();
  const s = MAPV.sel, nv = G.nav;
  if (s || nv) {
    ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0, VH - 52, VW, 52); const p = G.scene ? G.outPos : (pCar() || G.player), q = s || nv, mi = (Math.hypot(q.x - p.x, q.y - p.y) / T * .012).toFixed(1);
    txt((s ? '' : 'GPS → ') + q.name, 14, VH - 30, 14, s ? '#7fdbff' : '#ff4fd8', 'left'); txt(s ? mi + ' mi away' + (pCar() ? '' : '  ·  the road line shows while you drive') : (nv.len ? (nv.len / T * .012).toFixed(1) + ' mi by road' : mi + ' mi'), 14, VH - 13, 11, '#cfd6e2', 'left');
    if (s) { B('route', 'SET ROUTE', VW - 230, VH - 45, 120, 38, '#1e7a3c'); B('unsel', 'CANCEL', VW - 100, VH - 45, 90, 38); } else B('clear', 'CLEAR ROUTE', VW - 150, VH - 45, 140, 38, '#8a1c1c');
  }
}
function mapDown(e) { MAPV.ptrs[e.pointerId] = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, mv: 0 }; const ids = Object.keys(MAPV.ptrs); if (ids.length === 2) { const a = MAPV.ptrs[ids[0]], b = MAPV.ptrs[ids[1]]; MAPV.pd = Math.hypot(a.x - b.x, a.y - b.y) || 1; a.mv = b.mv = 99; } try { cv.setPointerCapture(e.pointerId); } catch (_) { } }
function mapMove(e) {
  const q = MAPV.ptrs[e.pointerId]; if (!q) return; const dx = e.clientX - q.x, dy = e.clientY - q.y; q.x = e.clientX; q.y = e.clientY; q.mv = Math.max(q.mv, Math.hypot(q.x - q.sx, q.y - q.sy));
  const ids = Object.keys(MAPV.ptrs);
  if (ids.length >= 2) { const a = MAPV.ptrs[ids[0]], b = MAPV.ptrs[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y) || 1; mapZoom(d / MAPV.pd, (a.x + b.x) / 2, (a.y + b.y) / 2); MAPV.pd = d; MAPV.cx -= dx / mapS() / 2; MAPV.cy -= dy / mapS() / 2; mapClamp(); }
  else if (q.mv > 8) { MAPV.cx -= dx / mapS(); MAPV.cy -= dy / mapS(); mapClamp(); }
}
function mapUp(e) {
  const q = MAPV.ptrs[e.pointerId]; if (!q) return; delete MAPV.ptrs[e.pointerId]; if (q.mv > 8 || e.type !== 'pointerup') return; const x = q.x, y = q.y;
  for (const b of MAPV.btns) if (inRect(x, y, b.r)) { Snd.play('ui'); switch (b.id) { case 'close': closeMap(); break; case 'in': mapZoom(1.6, VW / 2, VH / 2); break; case 'out': mapZoom(1 / 1.6, VW / 2, VH / 2); break; case 'me': mapCentre(); if (MAPV.z < 2.5) MAPV.z = 2.5; break; case 'key': MAPV.key = !MAPV.key; break; case 'goto': openGoto(); break; case 'unsel': MAPV.sel = null; break; case 'clear': G.nav = null; break; case 'route': setNav(MAPV.sel); MAPV.sel = null; closeMap(); break; } return; }
  if (y < 30) return; const [wx, wy] = scrToMap(x, y); if (wx < 0 || wy < 0 || wx > N * T || wy > N * T) return;
  let best = null, bd = 18 * 18; for (const p of MAPV.pois || []) { const [sx, sy] = mapToScr(p.x, p.y), d = (sx - x) ** 2 + (sy - y) ** 2; if (d < bd) { bd = d; best = p; } }
  if (!best && G.mission && G.mission.target) { const [sx, sy] = mapToScr(G.mission.target.x, G.mission.target.y); if ((sx - x) ** 2 + (sy - y) ** 2 < 400) best = { x: G.mission.target.x, y: G.mission.target.y, n: 'Job target' }; }
  Snd.play('pop'); MAPV.sel = best ? { x: best.x, y: best.y, name: best.n } : { x: wx, y: wy, name: 'Marker in ' + DISTRICTS[districtAt(clamp(wx, 1, N * T - 1), clamp(wy, 1, N * T - 1))].name };
}
cv.addEventListener('pointerup', e => { if (MAPV.ptrs[e.pointerId]) { mapUp(e); e.stopImmediatePropagation(); } }, true);
cv.addEventListener('pointercancel', e => { if (MAPV.ptrs[e.pointerId]) mapUp(e); }, true);
cv.addEventListener('wheel', e => { if (!G.fullMap || G.mode !== 'play') return; e.preventDefault(); mapZoom(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY); }, { passive: false });
// ---- GPS ----
function setNav(s) { G.nav = { x: s.x, y: s.y, name: s.name, path: null, T: 0 }; navUpdate(1); msg('GPS set: ' + s.name + (pCar() ? '' : ' — get in a vehicle to see the route on the road.'), '#ff4fd8'); }
function navCands(x, y) { // road-graph nodes reachable from a point, with the cost to get to each and an optional on-road entry point
  const fi = (x / T - 2) / RSP, fj = (y / T - 2) / RSP, ri = Math.round(fi), rj = Math.round(fj), i0 = Math.floor(fi), j0 = Math.floor(fj), out = [];
  const onV = Math.abs(fi - ri) * RSP < 2.3 && okInter(ri, j0) && okInter(ri, j0 + 1), onH = Math.abs(fj - rj) * RSP < 2.3 && okInter(i0, rj) && okInter(i0 + 1, rj);
  if (onV) { for (const j of [j0, j0 + 1]) out.push({ i: ri, j, c: Math.abs(roadCY(j) - y), via: [roadCX(ri), y] }); return out; }
  if (onH) { for (const i of [i0, i0 + 1]) out.push({ i, j: rj, c: Math.abs(roadCX(i) - x), via: [x, roadCY(rj)] }); return out; }
  for (const [i, j] of [[i0, j0], [i0 + 1, j0], [i0, j0 + 1], [i0 + 1, j0 + 1], [ri, rj]]) if (okInter(i, j)) out.push({ i, j, c: Math.abs(roadCX(i) - x) + Math.abs(roadCY(j) - y) });
  return out;
}
function navRoute(sx, sy, tx, ty) {
  const D = new Float32Array(NR * NR).fill(1e9), done = new Uint8Array(NR * NR), E = navCands(tx, ty), Sx = navCands(sx, sy); if (!E.length || !Sx.length) return null;
  const endVia = {}; for (const e of E) { const k = e.j * NR + e.i; if (e.c < D[k]) { D[k] = e.c; endVia[k] = e.via; } }
  for (; ;) { let b = -1, bd = 1e9; for (let k = 0; k < NR * NR; k++) if (!done[k] && D[k] < bd) { bd = D[k]; b = k; } if (b < 0) break; done[b] = 1; const i = b % NR, j = (b / NR) | 0; for (const [dx, dy] of DV) { const ni = i + dx, nj = j + dy; if (!okInter(ni, nj)) continue; const k = nj * NR + ni, c = bd + RSP * T; if (c < D[k]) D[k] = c; } }
  let st = null, bc = 1e9; for (const s of Sx) { const c = s.c + D[s.j * NR + s.i]; if (c < bc) { bc = c; st = s; } } if (!st || bc >= 1e9) return null;
  const path = [[sx, sy]]; if (st.via) path.push(st.via); let i = st.i, j = st.j, guard = 0;
  // already on the destination's road segment: go straight there
  const direct = E.some(e => e.via) && Sx.some(s => s.via) && E.every(e => Sx.some(s => s.i === e.i && s.j === e.j));
  if (direct) { path.push(E[0].via, [tx, ty]); return { path, len: Math.hypot(tx - sx, ty - sy) }; }
  for (; guard++ < 400;) { path.push([roadCX(i), roadCY(j)]); const k = j * NR + i; let nb = null, nd = D[k]; for (const [dx, dy] of DV) { const ni = i + dx, nj = j + dy; if (!okInter(ni, nj)) continue; const c = D[nj * NR + ni]; if (c < nd - 1) { nd = c; nb = [ni, nj]; } } if (!nb) { if (endVia[k]) path.push(endVia[k]); break; } i = nb[0]; j = nb[1]; }
  path.push([tx, ty]); return { path, len: bc };
}
function navUpdate(dt) {
  const n = G.nav; if (!n) return; n.T -= dt; if (n.T > 0) return; n.T = .35;
  const p = G.scene ? G.outPos : (pCar() || G.player); if (!p) return;
  if (Math.hypot(n.x - p.x, n.y - p.y) < (pCar() ? 150 : 70)) { G.nav = null; Snd.play('pickup'); msg('You have arrived: ' + n.name, '#ff4fd8'); return; }
  const r = navRoute(p.x, p.y, n.x, n.y); n.path = r ? r.path : [[p.x, p.y], [n.x, n.y]]; n.len = r ? r.len : 0;
}
function drawNavPath() { // on the road, only while driving
  const n = G.nav; if (!n || !n.path || !pCar() || G.scene) return; const pc = pCar(), P = n.path;
  ctx.save(); ctx.lineJoin = ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(pc.x, pc.y); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]);
  ctx.strokeStyle = 'rgba(255,79,216,.34)'; ctx.lineWidth = 22; ctx.stroke(); ctx.strokeStyle = 'rgba(255,170,240,.75)'; ctx.lineWidth = 5; ctx.setLineDash([26, 22]); ctx.lineDashOffset = -G.t * 60; ctx.stroke(); ctx.setLineDash([]);
  const pu = 1 + Math.sin(G.t * 5) * .15; ctx.strokeStyle = 'rgba(255,79,216,.9)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(n.x, n.y, 30 * pu, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(255,79,216,.25)'; ctx.fill(); ctx.restore();
}
function navMini(cx, cy, scale, R, p, sc) {
  const n = G.nav; if (!n) return; const X = x => cx + (x - p.x) / T * scale, Y = y => cy + (y - p.y) / T * scale;
  if (n.path && n.path.length > 1) { ctx.lineJoin = 'round'; ctx.strokeStyle = '#ff4fd8'; ctx.lineWidth = 3 * sc; ctx.beginPath(); ctx.moveTo(cx, cy); for (let i = 1; i < n.path.length; i++) ctx.lineTo(X(n.path[i][0]), Y(n.path[i][1])); ctx.stroke(); }
  const dx = X(n.x) - cx, dy = Y(n.y) - cy, d = Math.hypot(dx, dy), k = d > R - 6 ? (R - 6) / d : 1; ctx.fillStyle = '#ff4fd8'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + dx * k, cy + dy * k, 4.5 * sc, 0, TAU); ctx.fill(); ctx.stroke();
}
// ---- respawn safety: nobody gets to camp the hospital or the station ----
let SAFEPTS = null;
function nearSafe(x, y) { if (!SAFEPTS) SAFEPTS = W.buildings.filter(b => b.door && (b.type === 'hospital' || b.type === 'police')).map(b => [b.door.x, b.door.y]); for (const s of SAFEPTS) if (dist2(x, y, s[0], s[1]) < 520 * 520) return true; return false; }
function gangMayAttack(p, pl) { if (G.t < (G.safeT || 0)) return false; if (G.gangAggro[p.gang] > 0) return true; return G.rep[p.gang] <= -30 && !nearSafe(pl.x, pl.y); }
function respawnSafety() {
  const p = G.player; G.safeT = G.t + 12; G.godT = 4; for (const g in G.gangAggro) if (G.gangAggro[g] < 500) G.gangAggro[g] = 0;
  G.peds = G.peds.filter(q => { if (q.dead || q === p) return true; const near = dist2(q.x, q.y, p.x, p.y) < 700 * 700; if (q.target === p || q.state === 'fight' || (q.role === 'cop' && q.state === 'chase')) { if (near && q.gang) return false; q.state = 'walk'; q.target = null; q.ring = null; q.hostile = 0; } return true; });
  for (const c of G.cars) if (c.ai && c.ai.mode === 'chase') { c.ai.mode = 'traffic'; c.siren = 0; c.ai.wps = []; c.ai.nd = undefined; c.ai.blockT = 0; if (c.ai.cruise === undefined) c.ai.cruise = 260; if (c.ai.lane === undefined) c.ai.lane = 0; if (c.ai.dir === undefined) c.ai.dir = 0; }
  G.lastSeen = -99; G.wantedSince = -99; G.projs = (G.projs || []).filter(q => q.owner === p);
}
