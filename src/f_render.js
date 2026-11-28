// ================= RENDERING =================
const cv = document.getElementById('c'); let ctx = cv.getContext('2d');
let VW = 800, VH = 450, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, G.settings.quality === 'high' ? 2 : 1.25, G.autoDpr || 9);
  VW = window.innerWidth; VH = window.innerHeight; cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
  ctx.imageSmoothingEnabled = false;
}
window.addEventListener('resize', resize);
const HK = .042; // building perspective per level
let DOORTEX = {}, GARAGETEX = null;
const DOORCOL = { pawn: '#d4a017', strip: '#ff2bd6', gunshop: '#c0392b', diner: '#e67e22', bar: '#8e44ad', club: '#ff00cc', store: '#27ae60', hospital: '#ecf0f1', police: '#2c5aa0', bank: '#16a085', safehouse: '#f2c230', arcade: '#3498db' };
const DOORICON = { pawn: '💍', strip: '💃', gunshop: '🔫', diner: '🍔', bar: '🍺', club: '🎵', store: '🛒', hospital: '✚', police: '★', bank: '$', safehouse: '⌂', arcade: '👾' };

function worldXform(z) { const c = G.cam; const sx = G.shk[0], sy = G.shk[1]; ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * (VW / 2 - c.x * z + sx), DPR * (VH / 2 - c.y * z + sy)); }
function toScreen(x, y) { const c = G.cam; return [(x - c.x) * c.z + VW / 2, (y - c.y) * c.z + VH / 2]; }

function render() {
  G.shk = [(Math.random() - .5) * G.cam.shake, (Math.random() - .5) * G.cam.shake];
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#163c60'; ctx.fillRect(0, 0, VW, VH);
  if (!G.player) return;
  if (G.scene) renderInterior(); else renderCity();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  renderOverlays();
  if (G.mode === 'play') { renderHUD(); renderControls(); }
}
function renderCity() {
  const cam = G.cam, z = cam.z; worldXform(z);
  const [vx0, vy0, vx1, vy1] = viewRect(T);
  const tx0 = Math.max(-3, Math.floor(vx0 / T)), ty0 = Math.max(-3, Math.floor(vy0 / T)), tx1 = Math.min(N + OCE + 3, Math.ceil(vx1 / T)), ty1 = Math.min(N + OCS + 3, Math.ceil(vy1 / T));
  const wf = Math.floor(G.t * 2) % 3, hi = G.settings.quality === 'high', rainA = G.weather.rain, dk0 = darkness();
  for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) {
    let img, t = TILE.WATER;
    if (!inMap(tx, ty)) { const xt = W.xt.get((ty + 64) * 8192 + tx + 64); if (xt) { t = xt; img = TIMG[TIMGI['dock' + ((tx + ty) % 7 === 0 ? 1 : 0)]]; } else img = TIMG[TIMGI['water' + wf]]; }
    else { const k = idx(tx, ty); t = W.tile[k]; img = t === TILE.WATER ? TIMG[TIMGI['water' + wf]] : TIMG[W.timg[k]]; }
    ctx.drawImage(img, tx * T, ty * T, T + .6, T + .6);
    if (t !== TILE.WATER && hi) {
      const h = ((tx * 73856093) ^ (ty * 19349663)) >>> 0; let dname = null;
      if (t === TILE.ROAD) dname = W.rur[idx(tx, ty)] ? null : h % 41 === 0 ? 'manhole' : h % 17 === 0 ? 'crack' : h % 23 === 0 ? 'stain' : h % 29 === 0 ? 'patch' : null;
      else if (t === TILE.WALK) dname = h % 13 === 0 ? 'gum' : h % 19 === 0 ? 'slab' : null;
      else if (t === TILE.GRASS) dname = h % 7 === 0 ? 'tuft' : h % 11 === 0 ? 'flowers' : null;
      else if (t === TILE.ALLEY || t === TILE.LOT) dname = h % 9 === 0 ? 'stain' : h % 13 === 0 ? 'crack' : null;
      if (dname) ctx.drawImage(DETAIL[dname], tx * T, ty * T, T, T);
      if (dname === 'manhole' && (dk0 > .3 || rainA > .3) && Math.random() < .04) spawnFx('steam', tx * T + T / 2 + rnd(-6, 6), ty * T + T / 2);
      if (rainA > .15 && (t === TILE.ROAD || t === TILE.ALLEY || t === TILE.LOT) && h % 9 === 3) { const px = tx * T + 14 + h % 30, py = ty * T + 16 + (h >> 4) % 26; ctx.fillStyle = `rgba(120,140,170,${.32 * rainA})`; ctx.beginPath(); ctx.ellipse(px, py, 16 + h % 9, 9 + h % 5, (h % 7) * .4, 0, TAU); ctx.fill(); ctx.fillStyle = `rgba(220,235,255,${.12 * rainA})`; ctx.beginPath(); ctx.ellipse(px - 4, py - 2, 8, 3, (h % 7) * .4, 0, TAU); ctx.fill(); if (rainA > .4) { const rr = ((G.t * 1.6 + (h % 13) * .17) % 1); ctx.strokeStyle = `rgba(220,235,255,${.4 * (1 - rr) * rainA})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(px + (h % 11) - 5, py + (h % 7) - 3, rr * 9, rr * 5, 0, 0, TAU); ctx.stroke(); } }
    }
  }
  // seawall + foam at the city edge, harbor boats
  const E = N * T, foam = 6 + Math.sin(G.t * 2) * 3;
  ctx.fillStyle = '#7d7d78';
  if (vx0 < 0) ctx.fillRect(-10, Math.max(vy0, -10), 10, Math.min(vy1, E + 10) - Math.max(vy0, -10));
  if (vx1 > E) ctx.fillRect(E, Math.max(vy0, -10), 10, Math.min(vy1, E + 10) - Math.max(vy0, -10));
  if (vy0 < 0) ctx.fillRect(Math.max(vx0, -10), -10, Math.min(vx1, E + 10) - Math.max(vx0, -10), 10);
  if (vy1 > E) ctx.fillRect(Math.max(vx0, -10), E, Math.min(vx1, E + 10) - Math.max(vx0, -10), 10);
  ctx.fillStyle = 'rgba(220,240,255,.35)';
  if (vx0 < 0) ctx.fillRect(-10 - foam, vy0, foam, vy1 - vy0); if (vx1 > E) ctx.fillRect(E + 10, vy0, foam, vy1 - vy0);
  if (vy0 < 0) ctx.fillRect(vx0, -10 - foam, vx1 - vx0, foam); if (vy1 > E) ctx.fillRect(vx0, E + 10, vx1 - vx0, foam);
  for (const bt of BOATS) if (bt.x > vx0 - 200 && bt.x < vx1 + 200 && bt.y > vy0 - 200 && bt.y < vy1 + 200) drawBoat(bt);
  // decals
  for (const d of G.decals) { if (d.x < vx0 || d.x > vx1 || d.y < vy0 || d.y > vy1) continue; drawDecal(d); }
  drawNavPath(); drawFarmsAndAnimals(); drawWorld2(); drawRaceCPs();
  // building shadows
  if (G.settings.lights !== 0) drawShadows(vx0, vy0, vx1, vy1); else G.sun = null;
  // garage zones
  drawGaragePads();
  for (const z2 of W.sprays) { if (z2.x1 < vx0 || z2.x0 > vx1 || z2.y1 < vy0 || z2.y0 > vy1) continue; const chop = z2.kind === 'chop', col = chop ? '#ff7a30' : '#f2c230'; ctx.fillStyle = chop ? 'rgba(255,122,48,.16)' : 'rgba(242,194,48,.16)'; ctx.fillRect(z2.x0, z2.y0, z2.x1 - z2.x0, z2.y1 - z2.y0); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -G.t * 20; ctx.strokeRect(z2.x0 + 3, z2.y0 + 3, z2.x1 - z2.x0 - 6, z2.y1 - z2.y0 - 6); ctx.setLineDash([]); ctx.fillStyle = col; ctx.font = 'bold 14px Bungee, Impact, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(chop ? 'CHOP SHOP' : 'CUSTOMS', (z2.x0 + z2.x1) / 2, (z2.y0 + z2.y1) / 2); }
  // door mats
  for (const b of W.buildings) { if (!b.door || b.type === 'spray') continue; const d = b.door; if (d.x < vx0 || d.x > vx1 || d.y < vy0 || d.y > vy1) continue; ctx.fillStyle = DOORCOL[b.type] || '#6b4a2a'; ctx.globalAlpha = .75; ctx.fillRect(d.x - 14, d.y - 14, 28, 28); ctx.globalAlpha = .35; ctx.fillStyle = '#000'; ctx.fillRect(d.x - 10, d.y - 10, 20, 20); ctx.globalAlpha = 1; }
  for (const s of W.pickupSpots) if (s.alive && s.x > vx0 && s.x < vx1 && s.y > vy0 && s.y < vy1) drawPickup(s.x, s.y, s.t);
  for (const d of G.drops) if (d.x > vx0 && d.x < vx1 && d.y > vy0 && d.y < vy1) (d.t === 'item' ? drawItemDrop(d) : drawPickup(d.x, d.y, d.t, .8));
  const m = G.mission; if (m && m.target) drawMarker(m.target.x, m.target.y, '#f2c230');
  if (G.tip) drawMarker(G.tip.x, G.tip.y, '#7fdbff');
  const props = []; for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) { if (!inMap(tx, ty)) continue; const a = W.pgrid[idx(tx, ty)]; if (a) props.push(...a); }
  for (const p of props) if (!TALLP[p.t]) drawProp(p);
  for (const f of G.fires) { const gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r); gr.addColorStop(0, 'rgba(255,140,30,.35)'); gr.addColorStop(1, 'rgba(255,80,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill(); }
  // neon underglow on the ground
  ctx.globalCompositeOperation = 'lighter';
  for (const c of G.cars) if (c.mods && c.mods.neon && !c.dead && c.x > vx0 - 60 && c.x < vx1 + 60 && c.y > vy0 - 60 && c.y < vy1 + 60) drawNeon(c);
  for (const r of Net.remoteCars()) if (r.mods && r.mods.neon && !r.dead) drawNeon(r);
  ctx.globalCompositeOperation = 'source-over';
  drawBirds(false);
  for (const p of G.peds) if (p.dead && p.x > vx0 && p.x < vx1 && p.y > vy0 && p.y < vy1) drawPed(p);
  for (const p of G.peds) if (!p.dead && p.x > vx0 && p.x < vx1 && p.y > vy0 && p.y < vy1) { drawPed(p); if (p.inst) drawInstrument(p); }
  const pl = G.player; if (!pl.car) { drawPed(pl); drawPlayerExtras(pl); }
  Net.drawRemotes(ctx, false, 'ped');
  for (const c of G.cars) if (c.x > vx0 - 60 && c.x < vx1 + 60 && c.y > vy0 - 60 && c.y < vy1 + 60) drawCar(c);
  Net.drawRemotes(ctx, false, 'car');
  for (const p of G.projs) drawProj(p);
  for (const p of props) if (TALLP[p.t]) drawProp(p);
  G.lights = []; drawTrafficLights(vx0, vy0, vx1, vy1, G.settings.lights === 0 ? 0 : darkness());
  const dk = G.settings.lights === 0 ? 0 : darkness();
  G.facePolys = []; G.collectFaces = dk > .1;
  drawBuildings(vx0 - T, vy0 - T, vx1 + T, vy1 + T);
  worldXform(z);
  drawFx(); drawBirds(true);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const b of W.buildings) { if (!b.door || !DOORICON[b.type]) continue; const d = b.door; if (d.x < vx0 || d.x > vx1 || d.y < vy0 || d.y > vy1) continue; const bob = Math.sin(G.t * 3 + b.id) * 3, pd = dist(G.player.x, G.player.y, d.x, d.y); ctx.globalAlpha = clamp((pd - 30) / 80, .25, 1); const iy = d.y - 46 + bob; ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.beginPath(); ctx.arc(d.x, iy, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = DOORCOL[b.type]; ctx.lineWidth = 2.5; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.fillText(DOORICON[b.type], d.x, iy + 1); ctx.globalAlpha = 1; }
  for (const z2 of W.sprays) { const cx = (z2.x0 + z2.x1) / 2 - z2.fx * T * 1.6, cy = (z2.y0 + z2.y1) / 2 - z2.fy * T * 1.6; if (!inView(cx, cy, 40)) continue; ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, TAU); ctx.fill(); ctx.strokeStyle = z2.kind === 'chop' ? '#ff7a30' : '#f2c230'; ctx.lineWidth = 3; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.fillText(z2.kind === 'chop' ? '⚙' : '🔧', cx, cy + 1); }
  for (const s of W.dealerSpots) if (s.ped && !s.ped.dead && inView(s.x, s.y, 30)) { const q = s.ped; ctx.fillStyle = 'rgba(102,187,106,.9)'; ctx.beginPath(); ctx.moveTo(q.x, q.y - 22); ctx.lineTo(q.x - 6, q.y - 32); ctx.lineTo(q.x + 6, q.y - 32); ctx.fill(); }
  // lighting
  if (dk > .03 || G.weather.rain > .05) { collectCityLights(vx0, vy0, vx1, vy1, props, dk); lightPass(ambientColor(dk), Math.max(dk, G.weather.rain * .35)); }
  drawRain();
  drawVignette();
}
const BOATS = [];
(function () { const r = mulberry32(99); for (let i = 0; i < 9; i++) BOATS.push({ x: (N + OCE + 4) * T + r() * 520, y: 6 * T + r() * (N - 12) * T, a: r() < .5 ? Math.PI / 2 : -Math.PI / 2, L: 70 + r() * 70, c: ['#ecf0f1', '#c0392b', '#2c3e50', '#f1c40f'][i % 4], k: i % 3 }); for (let i = 0; i < 5; i++) BOATS.push({ x: 10 * T + r() * (N - 20) * T, y: N * T + 160 + r() * 400, a: 0, L: 60 + r() * 60, c: ['#ecf0f1', '#16a085', '#8e44ad'][i % 3], k: i % 3 }); })();
function drawBoat(b) {
  const bob = Math.sin(G.t * 1.3 + b.x) * .04; ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a + bob); const L = b.L, W2 = L * .32;
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-L * .55, 0, L * .3, W2 * .5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.moveTo(L / 2 + 6, 6); ctx.quadraticCurveTo(L * .2 + 6, -W2 / 2 + 6, -L / 2 + 6, -W2 / 2 + 6); ctx.lineTo(-L / 2 + 6, W2 / 2 + 6); ctx.quadraticCurveTo(L * .2 + 6, W2 / 2 + 6, L / 2 + 6, 6); ctx.fill();
  ctx.fillStyle = b.c; ctx.beginPath(); ctx.moveTo(L / 2, 0); ctx.quadraticCurveTo(L * .2, -W2 / 2, -L / 2, -W2 / 2); ctx.lineTo(-L / 2, W2 / 2); ctx.quadraticCurveTo(L * .2, W2 / 2, L / 2, 0); ctx.fill();
  ctx.fillStyle = '#c69c6d'; ctx.beginPath(); ctx.moveTo(L * .4, 0); ctx.quadraticCurveTo(L * .15, -W2 * .36, -L * .44, -W2 * .38); ctx.lineTo(-L * .44, W2 * .38); ctx.quadraticCurveTo(L * .15, W2 * .36, L * .4, 0); ctx.fill();
  ctx.fillStyle = b.k === 1 ? '#ecf0f1' : '#34495e'; ctx.fillRect(-L * .15, -W2 * .25, L * .28, W2 * .5); ctx.fillStyle = '#1c3a55'; ctx.fillRect(L * .07, -W2 * .2, L * .05, W2 * .4);
  ctx.restore();
}
function drawNeon(c) { const col = NEONS[(c.mods.neon - 1) % NEONS.length]; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.globalAlpha = .55 + Math.sin(G.t * 4) * .1; ctx.drawImage(radialSprite(hexA(col), 64), -c.L * .75, -c.W * 1.1, c.L * 1.5, c.W * 2.2); ctx.restore(); ctx.globalAlpha = 1; }
function drawDecal(d) {
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a); const a = Math.min(1, d.life / 8);
  if (d.t === 'skid') { ctx.fillStyle = `rgba(15,15,15,${.35 * a})`; ctx.fillRect(-5, -3, 10, 6); }
  else if (d.t === 'blood') { ctx.fillStyle = `rgba(120,10,10,${.75 * a})`; ctx.beginPath(); ctx.arc(0, 0, d.s, 0, TAU); ctx.arc(d.s, 2, d.s * .5, 0, TAU); ctx.fill(); }
  else if (d.t === 'bloodpool') { ctx.fillStyle = `rgba(100,5,5,${.8 * a})`; ctx.beginPath(); ctx.ellipse(0, 0, d.s * 1.4, d.s, 0, 0, TAU); ctx.fill(); }
  else if (d.t === 'graffiti') { ctx.globalAlpha = Math.min(1, a * 1.5); ctx.font = 'bold 26px Bungee, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineWidth = 6; ctx.strokeStyle = '#111'; ctx.strokeText(d.w, 0, 0); ctx.fillStyle = d.col; ctx.fillText(d.w, 0, 0); ctx.globalAlpha = 1; }
  else if (d.t === 'scorch') { const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, d.s); gr.addColorStop(0, `rgba(0,0,0,${.7 * a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, d.s, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function drawMarker(x, y, col) {
  const r = 34 + Math.sin(G.t * 5) * 6; ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.globalAlpha = .9; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
  ctx.globalAlpha = .25; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  const b = Math.abs(Math.sin(G.t * 4)) * 12; ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(x, y - 30 - b); ctx.lineTo(x - 12, y - 52 - b); ctx.lineTo(x + 12, y - 52 - b); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.stroke();
}
function drawPickup(x, y, t, s) {
  s = s || 1; const bob = Math.sin(G.t * 4 + x) * 3, sc = Math.abs(Math.cos(G.t * 2.5 + y)) * .7 + .3;
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(x, y + 8, 12 * s, 5 * s, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(x, y - 6 + bob); ctx.scale(sc * s, s);
  ctx.fillStyle = WI[t] !== undefined ? '#1b1f2a' : '#fff'; ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 2; ctx.fillRect(-13, -13, 26, 26); ctx.strokeRect(-13, -13, 26, 26);
  drawWeaponIcon(ctx, WI[t] !== undefined ? t : t, 0, 0, 1.05, WI[t] !== undefined ? '#f2c230' : undefined);
  ctx.restore();
}
function drawProp(p) {
  const cam = G.cam; ctx.save(); ctx.translate(p.x, p.y);
  const sh = G.sun ? [G.sun.x * .12, G.sun.y * .12, G.sun.a] : [4, 4, .2];
  if (RPROP[p.t]) { RPROP[p.t](p, sh); ctx.restore(); return; }
  switch (p.t) {
    case 'lamp': {
      if (p.down) { ctx.rotate(p.a); ctx.fillStyle = '#4a4d52'; ctx.fillRect(0, -2, 44, 4); ctx.fillStyle = '#ccc'; ctx.fillRect(40, -4, 8, 8); break; }
      const hx = (p.x - cam.x) * .14, hy = (p.y - cam.y) * .14;
      ctx.strokeStyle = `rgba(0,0,0,${sh[2]})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(sh[0] * 4, sh[1] * 4); ctx.stroke();
      ctx.fillStyle = '#2d2f33'; ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#5b5f66'; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(hx, hy); ctx.stroke(); ctx.strokeStyle = '#80858c'; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#3d4045'; ctx.fillRect(hx - 6, hy - 6, 12, 12); const on = darkness() > .1; ctx.fillStyle = on ? '#fff6c8' : '#e9e4c8'; ctx.fillRect(hx - 4, hy - 4, 8, 8);
      if (on) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite('rgba(255,220,150,.9)', 64), hx - 18, hy - 18, 36, 36); ctx.globalCompositeOperation = 'source-over'; }
      break;
    }
    case 'tree': { const hx = (p.x - cam.x) * .07, hy = (p.y - cam.y) * .07, v = (Math.floor(p.x * 7 + p.y * 3) % 4 + 4) % 4; ctx.fillStyle = `rgba(0,0,0,${sh[2] * 1.1})`; ctx.beginPath(); ctx.ellipse(sh[0] * 6, sh[1] * 6, 24, 22, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4a2f1a'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.sin(G.t * 1.1 + p.x * .013) * (.04 + G.weather.rain * .07)); ctx.drawImage(TREESPR[v], -30, -30, 60, 60); ctx.restore(); break; }
    case 'palm': { const hx = (p.x - cam.x) * .1, hy = (p.y - cam.y) * .1; ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; ctx.beginPath(); ctx.ellipse(sh[0] * 8, sh[1] * 8, 26, 20, .4, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7a5a36'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(hx * .3 + 4, hy * .5, hx, hy); ctx.stroke(); ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.x * .01 + Math.sin(G.t * 1.2 + p.x) * (.06 + G.weather.rain * .1)); ctx.drawImage(TREESPR[4], -34, -34, 68, 68); ctx.restore(); break; }
    case 'bush': ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(4, 4, 12, 0, TAU); ctx.fill(); ctx.drawImage(TREESPR[(Math.floor(p.x) % 4 + 4) % 4], -15, -15, 30, 30); break;
    case 'hydrant': if (p.down) { ctx.fillStyle = '#7a1010'; ctx.fillRect(-6, -3, 12, 6); } else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(3, 3, 7, 0, TAU); ctx.fill(); const gr = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7); gr.addColorStop(0, '#ff6b5b'); gr.addColorStop(1, '#a3281b'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill(); ctx.fillStyle = '#c0392b'; ctx.fillRect(-9, -2, 18, 4); ctx.fillStyle = '#e8c070'; ctx.beginPath(); ctx.arc(0, 0, 2, 0, TAU); ctx.fill(); } break;
    case 'trash': if (p.down) { ctx.rotate(p.a); ctx.fillStyle = '#2e4d2e'; ctx.fillRect(-10, -7, 20, 14); ctx.fillStyle = '#998'; ctx.fillRect(10, -6, 6, 4); ctx.fillRect(12, 3, 5, 3); ctx.fillStyle = '#c8b'; ctx.fillRect(16, -1, 3, 3); } else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(3, 3, 9, 0, TAU); ctx.fill(); const gr = ctx.createRadialGradient(-3, -3, 1, 0, 0, 9); gr.addColorStop(0, '#5c8a5c'); gr.addColorStop(1, '#253f25'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1a2e1a'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = '#1a2e1a'; ctx.fillRect(-1, -5, 2, 10); } break;
    case 'phone': { ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-8, -8, 22, 22); ctx.fillStyle = '#1f3a93'; ctx.fillRect(-11, -11, 22, 22); ctx.fillStyle = '#3b5bc4'; ctx.fillRect(-11, -11, 22, 4); ctx.fillStyle = '#9fd3f5'; ctx.fillRect(-8, -6, 16, 14); ctx.fillStyle = '#222'; ctx.fillRect(2, -4, 5, 9); ctx.rotate(-p.a);
      if (!G.mission && Math.floor(G.t * 3) % 3 === 0) { ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 18 + (G.t * 30) % 10, 0, TAU); ctx.stroke(); } break; }
    case 'atm': ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-6, -7, 18, 20); ctx.fillStyle = '#4f5b66'; ctx.fillRect(-8, -9, 16, 18); ctx.fillStyle = '#6c7a89'; ctx.fillRect(-8, -9, 16, 3); ctx.fillStyle = '#2ecc71'; ctx.fillRect(2, -5, 4, 10); ctx.fillStyle = '#ddd'; ctx.fillRect(-5, -6, 4, 3); break;
    case 'vend': ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-6, -9, 18, 24); { const gr = ctx.createLinearGradient(-8, 0, 8, 0); gr.addColorStop(0, '#8e1b12'); gr.addColorStop(.5, '#e74c3c'); gr.addColorStop(1, '#8e1b12'); ctx.fillStyle = gr; } ctx.fillRect(-8, -11, 16, 22); ctx.fillStyle = '#fff'; ctx.fillRect(2, -9, 3, 18); ctx.fillStyle = '#f1c40f'; ctx.fillRect(-6, -9, 6, 4); break;
    case 'bench': ctx.rotate(p.a + Math.PI / 2); if (p.down) ctx.rotate(.6); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-12, -5, 28, 13); ctx.fillStyle = '#7b5a43'; for (let i = -1; i <= 1; i++) { ctx.fillRect(-14, i * 4 - 1.5, 28, 3); } ctx.fillStyle = 'rgba(255,255,255,.12)'; for (let i = -1; i <= 1; i++) ctx.fillRect(-14, i * 4 - 1.5, 28, 1); ctx.fillStyle = '#2d2d2d'; ctx.fillRect(-12, -6, 2, 12); ctx.fillRect(10, -6, 2, 12); break;
    case 'news': if (p.down) ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-4, -4, 13, 13); ctx.fillStyle = '#2471a3'; ctx.fillRect(-6, -6, 12, 12); ctx.fillStyle = '#eee'; ctx.fillRect(-4, -2, 8, 4); break;
    case 'hotdog': ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(6, 6, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.fillRect(-14, -8, 28, 16); ctx.save(); ctx.translate((p.x - cam.x) * .05, (p.y - cam.y) * .05); for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? '#e74c3c' : '#fff'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 20, i * TAU / 8, (i + 1) * TAU / 8); ctx.fill(); } ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill(); ctx.restore(); break;
    case 'barrel': ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(3, 3, 9, 0, TAU); ctx.fill(); { const gr = ctx.createRadialGradient(-3, -3, 1, 0, 0, 9); gr.addColorStop(0, p.down ? '#7a5a3a' : '#d35400'); gr.addColorStop(1, p.down ? '#3a2a1a' : '#6e2c00'); ctx.fillStyle = gr; } ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a1e00'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.stroke(); break;
    case 'cone': ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); break;
  }
  ctx.restore();
}
const HAIRSTY = 6;
function drawPed0(p) {
  if (p.hidden) return;
  const air = p.air > 0 ? p.air : 0;
  if (air) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(p.x + 4, p.y + 6, 10, 8, 0, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.translate(p.x, p.y - air * 30); ctx.scale(1.3 * (1 + air * .5), 1.3 * (1 + air * .5)); if (air) ctx.rotate(p.spin * (1 - air));
  const O = 'rgba(0,0,0,.55)';
  if (p.dead) {
    const fk = clamp((p.fallT === undefined ? 1 : p.fallT) / .32, 0, 1), ea = 1 - (1 - fk) * (1 - fk);
    ctx.rotate(lerp(p.a, (p.fallA || p.a) + .4, ea)); ctx.scale(lerp(.55, 1, ea), 1); ctx.fillStyle = p.pants; ctx.fillRect(-17, -5, 11, 4); ctx.fillRect(-17, 1, 11, 4); ctx.fillStyle = p.shoe || '#111'; ctx.fillRect(-19, -5, 3, 4); ctx.fillRect(-19, 1, 3, 4);
    ctx.fillStyle = p.jk || p.shirt; ctx.beginPath(); ctx.ellipse(-1, 0, 7, 8, 0, 0, TAU); ctx.fill(); ctx.fillStyle = p.skin; ctx.fillRect(-4, -13, 4, 6); ctx.fillRect(-2, 7, 4, 6); ctx.beginPath(); ctx.arc(9, 0, 5, 0, TAU); ctx.fill(); ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(10, 0, 4, 0, TAU); ctx.fill();
    ctx.restore(); return;
  }
  const sv = G.sun; ctx.fillStyle = `rgba(0,0,0,${sv ? sv.a + .05 : .25})`; ctx.beginPath(); ctx.ellipse(sv ? sv.x * .05 + 2 : 3, sv ? sv.y * .05 + 3 : 3, 9, 11, 0, 0, TAU); ctx.fill();
  const sitting = p.sit || p.lie || (p.isPlayer && G.sitting);
  ctx.rotate(p.a + (p.isPlayer && G.dancing > 0 ? Math.sin(G.t * 12) * .6 : 0));
  const run = (p.spd || 0) > 140, amp = run ? 1.35 : 1, ph = p.moving ? Math.sin(p.phase) * amp : 0, talkG = p.talking || p.sayT > 1.2, ph2 = p.dance || p.pole ? Math.sin(p.phase * 2) : talkG ? Math.sin(G.t * 9 + p.uid) * .6 : 0;
  if (run) ctx.translate(1.5, 0);
  const breath = p.moving ? 0 : Math.sin(G.t * 2.4 + p.uid) * .05, rc = p.recoil > 0 ? p.recoil * 30 : 0;
  if (p.lie) { ctx.fillStyle = '#ecf0f1'; ctx.fillRect(-16, -9, 30, 18); ctx.fillStyle = '#aed6f1'; ctx.fillRect(-16, -9, 18, 18); ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(10, 0, 5, 0, TAU); ctx.fill(); ctx.restore(); return; }
  // legs + shoes
  if (!sitting) { const l1 = ph * 6, l2 = -ph * 6; ctx.fillStyle = p.pants; ctx.fillRect(-3 + l1, -6, 7, 4); ctx.fillRect(-3 + l2, 2, 7, 4); ctx.fillStyle = p.shoe || '#111'; ctx.fillRect(3 + l1, -6, 3, 4); ctx.fillRect(3 + l2, 2, 3, 4); }
  else { ctx.fillStyle = p.pants; ctx.fillRect(1, -6, 9, 4); ctx.fillRect(1, 2, 9, 4); ctx.fillStyle = p.shoe || '#111'; ctx.fillRect(9, -6, 3, 4); ctx.fillRect(9, 2, 3, 4); }
  // arms
  const armed = p.weapon > 0, swing = p.swing > 0 ? 8 : 0, sleeve = p.jk || p.shirt;
  if (armed) {
    ctx.translate(-rc, 0);
    ctx.fillStyle = sleeve; ctx.fillRect(1, 3, 6, 4); ctx.fillRect(1, -7, 5, 4); ctx.fillStyle = p.skin; ctx.fillRect(6, 3.2, 6, 3.4); ctx.fillRect(5, -6.5, 6, 3.4);
    const pwm = p.isPlayer ? pw(p.weapon) : null, wl = (p.weapon === WI.sniper ? 22 : p.weapon === WI.bolt ? 20 : p.weapon === WI.shotgun || p.weapon === WI.rocket || p.weapon === WI.rifle ? 17 : p.weapon === WI.uzi ? 12 : p.weapon === WI.knife ? 6 : 9) + (pwm && pwm.quiet ? 5 : 0);
    ctx.fillStyle = p.isPlayer ? gunColor(p.weapon) : '#151515'; ctx.fillRect(9, 1, wl, 3.6); ctx.fillStyle = '#3a3a3a'; ctx.fillRect(9, 1, wl, 1);
    if (p.weapon === WI.rocket) { ctx.fillStyle = '#4a5a3a'; ctx.fillRect(-5, -.5, 28, 6); ctx.fillStyle = '#6b7f52'; ctx.fillRect(-5, -.5, 28, 1.5); }
    if (p.weapon === WI.knife) { ctx.fillStyle = '#cfd8dc'; ctx.fillRect(14, 1.2, 7, 2.2); ctx.fillStyle = '#3e2723'; ctx.fillRect(9, 1, 5, 3.6); }
    if (p.weapon === WI.sniper) { ctx.fillStyle = '#111'; ctx.fillRect(13, -1.2, 7, 2.4); }
    if (p.weapon === WI.molotov) { ctx.fillStyle = '#7fb069'; ctx.fillRect(10, 2, 5, 3); ctx.fillStyle = '#ff8c1a'; ctx.fillRect(15, 2.5, 2, 2); }
  } else {
    const a1 = -2 - ph * 5, a2 = -2 + ph * 5, d2 = ph2 * 3;
    if (swing) { const k = Math.sin((1 - p.swing / .2) * Math.PI); ctx.fillStyle = sleeve; ctx.fillRect(0, -9 + k * 3, 6 + k * 8, 4); ctx.fillStyle = p.skin; ctx.beginPath(); ctx.arc(7 + k * 9, -7 + k * 3, 2.6, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = sleeve; ctx.fillRect(a1, -10 - d2, 5, 4); ctx.fillStyle = p.skin; ctx.fillRect(a1 + 4, -10 - d2, 3, 4); }
    ctx.fillStyle = sleeve; ctx.fillRect(a2, 6 + d2, 5, 4); ctx.fillStyle = p.skin; ctx.fillRect(a2 + 4, 6 + d2, 3, 4);
  }
  // torso
  if (armed) ctx.translate(rc, 0);
  ctx.save(); ctx.scale(1 + breath * .4, 1 + breath);
  ctx.fillStyle = O; ctx.beginPath(); ctx.ellipse(0, 0, 6.3, 9.8, 0, 0, TAU); ctx.fill();
  const tg = ctx.createLinearGradient(0, -9, 0, 9); tg.addColorStop(0, shade(p.shirt, .7)); tg.addColorStop(.45, shade(p.shirt, 1.15)); tg.addColorStop(1, shade(p.shirt, .7));
  ctx.fillStyle = tg; ctx.beginPath(); ctx.ellipse(0, 0, 5.5, 9, 0, 0, TAU); ctx.fill();
  if (p.jk) { ctx.fillStyle = p.jk; ctx.beginPath(); ctx.ellipse(-.5, 0, 5.6, 9.1, 0, Math.PI * .62, Math.PI * 1.38); ctx.fill(); ctx.beginPath(); ctx.ellipse(-.5, -5, 5, 4.2, 0, Math.PI, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-.5, 5, 5, 4.2, 0, 0, Math.PI); ctx.fill(); }
  if (p.sparkle) { ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 4; i++) { const tw = Math.sin(G.t * 9 + i * 2 + p.uid); if (tw > .3) ctx.fillRect(-3 + i * 2, -6 + (i * 5) % 12, 1.2, 1.2); } }
  if (p.role === 'cop' && !p.swat) { ctx.fillStyle = '#f2c230'; ctx.fillRect(1, -4, 2, 2); }
  if (p.swat) { ctx.fillStyle = '#444'; ctx.fillRect(-4, -6, 8, 12); ctx.fillStyle = '#ddd'; ctx.font = 'bold 3px sans-serif'; }
  ctx.restore();
  // head
  ctx.fillStyle = O; ctx.beginPath(); ctx.arc(1, 0, 5.5, 0, TAU); ctx.fill();
  const hg = ctx.createRadialGradient(2.5, -1, .5, 1, 0, 5); hg.addColorStop(0, shade(p.skin, 1.15)); hg.addColorStop(1, shade(p.skin, .8)); ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(1, 0, 4.8, 0, TAU); ctx.fill();
  if (p.hat === 1) { ctx.fillStyle = p.hair; ctx.beginPath(); ctx.arc(0, 0, 5.1, 0, TAU); ctx.fill(); ctx.fillRect(2, -3.8, 5, 7.6); ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.beginPath(); ctx.arc(-1, -1.5, 2, 0, TAU); ctx.fill(); ctx.fillStyle = '#f2c230'; ctx.fillRect(1, -1, 2, 2); }
  else if (p.hat === 2) { ctx.fillStyle = p.hatCol || '#111'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.fillRect(-7.5, -3.2, 4, 6.4); }
  else if (p.hood) { ctx.fillStyle = p.jk || '#263238'; ctx.beginPath(); ctx.arc(-.5, 0, 5.4, Math.PI * .35, Math.PI * 1.65); ctx.fill(); }
  else {
    ctx.fillStyle = p.hair; const hs = p.hs || 0;
    if (hs === 0) { ctx.beginPath(); ctx.arc(-.5, 0, 4.4, Math.PI * .45, Math.PI * 1.55); ctx.fill(); }
    else if (hs === 1) { ctx.beginPath(); ctx.arc(-.3, 0, 4.9, Math.PI * .35, Math.PI * 1.65); ctx.fill(); ctx.fillRect(-6, -2, 3, 4); }
    else if (hs === 2) { ctx.beginPath(); ctx.arc(-.5, 0, 5.8, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.beginPath(); ctx.arc(-1.5, -1.5, 2.5, 0, TAU); ctx.fill(); }
    else if (hs === 3) { ctx.beginPath(); ctx.arc(-.5, 0, 3.6, Math.PI * .55, Math.PI * 1.45); ctx.fill(); }
    else if (hs === 4) { ctx.beginPath(); ctx.arc(-.5, 0, 5, Math.PI * .3, Math.PI * 1.7); ctx.fill(); ctx.beginPath(); ctx.ellipse(-6, 0, 4, 3, 0, 0, TAU); ctx.fill(); }
    else { ctx.fillStyle = shade(p.skin, .85); ctx.beginPath(); ctx.arc(.5, 0, 4.4, 0, TAU); ctx.fill(); }
  }
  if (p.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${p.flash * 6})`; ctx.beginPath(); ctx.ellipse(0, 0, 6, 9.5, 0, 0, TAU); ctx.arc(1, 0, 5.2, 0, TAU); ctx.fill(); }
  if (p.burn > 0) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite('rgba(255,140,30,1)', 64), -14, -14, 28, 28); ctx.globalCompositeOperation = 'source-over'; }
  ctx.restore();
  if (p.missionTarget && !p.dead) { ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(p.x, p.y, 20 + Math.sin(G.t * 6) * 2, 0, TAU); ctx.stroke(); }
}
function drawCar0(c, alpha) {
  const spr = carSprite(c.type, c.color, c.dead, c.mods); const Ls = (c.d.L + 8) * 2, Ws = (c.d.W + 8) * 2;
  const sv = G.sun;
  ctx.save(); ctx.translate(c.x, c.y);
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  // soft shadow (world space)
  ctx.save(); ctx.translate(sv ? sv.x * .1 : 3, sv ? sv.y * .1 + 3 : 5); ctx.rotate(c.a); ctx.fillStyle = `rgba(0,0,0,${sv ? sv.a + .12 : .35})`; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-c.L / 2 - 1, -c.W / 2 - 1, c.L + 2, c.W + 2, 6) : ctx.rect(-c.L / 2, -c.W / 2, c.L, c.W); ctx.fill(); ctx.restore();
  ctx.rotate(c.a);
  // front wheels (steer + rolling tread), drawn under the body
  drawFrontWheels(c);
  // body roll / pitch
  let bx = 0, by = 0;
  if (!c.dead && !c.remote && c.driver) { by = clamp(-(c.steer || 0) * (c.fwd || 0) / 260, -2.4, 2.4); bx = c.brake && Math.abs(c.fwd) > 60 ? 1.6 : c.throttle > .5 && Math.abs(c.fwd) < 200 ? -1 : 0; if (c === pCar() && c.spd < 8) { bx += (Math.random() - .5) * .5; by += (Math.random() - .5) * .4; } }
  c.bx = lerp(c.bx || 0, bx, .2); c.by = lerp(c.by || 0, by, .2);
  ctx.drawImage(spr, -Ls / 2 + c.bx, -Ws / 2 + c.by, Ls, Ws);
  drawCarExtras(c); drawRider(c);
  const hpMax = (c.st && c.st.hp) || c.d.hp;
  if (!c.dead && !c.d.rider && c.hp < hpMax * .6) { const k = 1 - c.hp / hpMax; ctx.fillStyle = `rgba(0,0,0,${.15 + k * .25})`; ctx.fillRect(c.L * .18, -c.W / 2 + 2, 9, 6); ctx.fillRect(-c.L * .32, c.W / 2 - 8, 11, 5); if (k > .5) { ctx.fillRect(c.L * .38, c.W / 2 - 7, 7, 5); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = .8; ctx.beginPath(); ctx.moveTo(c.L * .14, -5); ctx.lineTo(c.L * .2, 2); ctx.lineTo(c.L * .16, 6); ctx.stroke(); } }
  if (!c.dead && (c.brake || c.throttle < 0) && c.driver) { ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite('rgba(255,40,40,1)', 64), -c.L / 2 - 12, -c.W / 2 - 6, 20, 20); ctx.drawImage(radialSprite('rgba(255,40,40,1)', 64), -c.L / 2 - 12, c.W / 2 - 14, 20, 20); ctx.globalCompositeOperation = 'source-over'; }
  if (c.nosT > 0 && !c.dead) { ctx.globalCompositeOperation = 'lighter'; const fl = 14 + Math.random() * 12; ctx.drawImage(radialSprite('rgba(80,170,255,1)', 64), -c.L / 2 - fl * 1.6, -9, fl * 1.8, 18); ctx.drawImage(radialSprite('rgba(220,240,255,1)', 64), -c.L / 2 - fl * .8, -5, fl, 10); ctx.globalCompositeOperation = 'source-over'; }
  if (c.siren > 0 && !c.dead) {
    const f = Math.floor(G.t * 8) % 2, bo = c.d.barX || 0, c2 = c.type === 'firetruck' ? '#ffffff' : c.type === 'ambulance' ? '#ffffff' : '#2050ff'; ctx.fillStyle = f ? '#ff2020' : c2; ctx.fillRect(bo - 4, -c.W / 2 + 4, 8, c.W / 2 - 4); ctx.fillStyle = f ? c2 : '#ff2020'; ctx.fillRect(bo - 4, 0, 8, c.W / 2 - 4);
    ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite(f ? 'rgba(255,40,40,.7)' : 'rgba(40,80,255,.7)', 64), -34, (f ? -10 : 10) - 34, 68, 68); ctx.globalCompositeOperation = 'source-over';
  } else if (c.siren === 0 && !c.dead && c.d.siren) { const bo = c.d.barX || 0; ctx.fillStyle = '#922'; ctx.fillRect(bo - 4, -c.W / 2 + 4, 8, c.W / 2 - 4); ctx.fillStyle = '#229'; ctx.fillRect(bo - 4, 0, 8, c.W / 2 - 4); }
  ctx.restore(); ctx.globalAlpha = 1;
}
function drawProj(p) {
  if (p.k === 'rocket') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = '#556b2f'; ctx.fillRect(-8, -3, 16, 6); ctx.fillStyle = '#c0392b'; ctx.fillRect(6, -3, 3, 6); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite('rgba(255,180,60,1)', 64), -24, -8, 18, 16); ctx.globalCompositeOperation = 'source-over'; ctx.restore(); }
  else { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#7fb069'; ctx.beginPath(); ctx.arc(p.x, p.y - p.z, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#ff8c1a'; ctx.beginPath(); ctx.arc(p.x + 3, p.y - p.z - 4, 3, 0, TAU); ctx.fill(); }
}
function drawFx() {
  const smoke = smokeSprite();
  for (const f of G.fx) {
    const a = f.life / f.max;
    switch (f.t) {
      case 'smoke': { const s = f.s * (2.6 - a) * 2.2; ctx.globalAlpha = .75 * a; ctx.drawImage(smoke, f.x - s, f.y - s, s * 2, s * 2); ctx.globalAlpha = 1; break; }
      case 'fire': { ctx.globalCompositeOperation = 'lighter'; const s = f.s * (.6 + a) * 1.6; ctx.globalAlpha = a; ctx.drawImage(radialSprite('rgba(255,150,40,1)', 64), f.x - s, f.y - s, s * 2, s * 2); ctx.drawImage(radialSprite('rgba(255,240,180,1)', 64), f.x - s * .4, f.y - s * .4, s * .8, s * .8); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; break; }
      case 'exh': { const s = f.s * (2.2 - a) * 2; ctx.globalAlpha = .35 * a; ctx.drawImage(smoke, f.x - s, f.y - s, s * 2, s * 2); ctx.globalAlpha = 1; break; }
      case 'steam': { const s = f.s * (2.4 - a) * 2.2; ctx.globalAlpha = .45 * a; ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(smoke, f.x - s, f.y - s, s * 2, s * 2); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; break; }
      case 'sp': ctx.fillStyle = `rgba(255,230,120,${a})`; ctx.fillRect(f.x - 1.5, f.y - 1.5, 3, 3); break;
      case 'flash': { ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.globalCompositeOperation = 'lighter'; ctx.drawImage(radialSprite('rgba(255,230,140,1)', 64), -14, -14, 28, 28); ctx.fillStyle = 'rgba(255,250,210,.9)'; ctx.beginPath(); ctx.moveTo(0, -3); ctx.lineTo(16, 0); ctx.lineTo(0, 3); ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.restore(); break; }
      case 'paper': ctx.fillStyle = `rgba(230,230,220,${a})`; ctx.fillRect(f.x, f.y, f.s, f.s * .7); break;
      case 'water': ctx.fillStyle = `rgba(170,215,255,${a})`; ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, TAU); ctx.fill(); break;
      case 'blood': ctx.fillStyle = `rgba(150,10,10,${a})`; ctx.fillRect(f.x, f.y, f.s, f.s); break;
      case 'dust': { const s = f.s * 2; ctx.globalAlpha = a * .5; ctx.drawImage(smoke, f.x - s, f.y - s, s * 2, s * 2); ctx.globalAlpha = 1; break; }
      case 'note': ctx.fillStyle = `rgba(242,194,48,${a})`; ctx.font = 'bold 16px sans-serif'; ctx.fillText('♪', f.x, f.y); break;
      case 'tracer': { if (!isFinite(f.x + f.y + f.x2 + f.y2)) break; const g2 = ctx.createLinearGradient(f.x, f.y, f.x2, f.y2); g2.addColorStop(0, `rgba(255,240,170,${a * .2})`); g2.addColorStop(1, `rgba(255,250,210,${a})`); ctx.strokeStyle = g2; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x2, f.y2); ctx.stroke(); break; }
      case 'boom': { const r = f.s * (1.3 - a * .7); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(radialSprite('rgba(255,160,40,1)', 64), f.x - r * 1.2, f.y - r * 1.2, r * 2.4, r * 2.4); ctx.drawImage(radialSprite('rgba(255,250,210,1)', 64), f.x - r * .5, f.y - r * .5, r, r); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = `rgba(255,240,220,${a * .6})`; ctx.lineWidth = 3 * a + 1; ctx.beginPath(); ctx.arc(f.x, f.y, f.s * (1.6 - a * 1.2), 0, TAU); ctx.stroke(); break; }
      case 'deb': ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a + G.t * 8); ctx.fillStyle = `rgba(40,35,30,${a})`; ctx.fillRect(-f.s / 2, -f.s / 3, f.s, f.s * .66); ctx.restore(); break;
      case 'shell': ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a + (1 - a) * 20); ctx.fillStyle = `rgba(212,175,55,${Math.min(1, a * 3)})`; ctx.fillRect(-1.5, -.8, 3, 1.6); ctx.restore(); break;
      case 'bill': ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a + Math.sin(G.t * 6 + f.x) * .8); ctx.fillStyle = `rgba(76,175,80,${Math.min(1, a * 2)})`; ctx.fillRect(-5, -2.5, 10, 5); ctx.fillStyle = `rgba(27,94,32,${Math.min(1, a * 2)})`; ctx.fillRect(-1.5, -1.5, 3, 3); ctx.restore(); break;
      case 'nos': { ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a; ctx.drawImage(radialSprite('rgba(90,170,255,1)', 64), f.x - 9, f.y - 9, 18, 18); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; break; }
    }
  }
}
// ---- pseudo 3D buildings ----
function drawBuildings(x0, y0, x1, y1) {
  const cam = G.cam, list = [];
  for (const b of W.buildings) { if (b.gone) continue; const bx0 = b.x * T, by0 = b.y * T, bx1 = (b.x + b.w) * T, by1 = (b.y + b.h) * T; if (bx1 < x0 || bx0 > x1 || by1 < y0 || by0 > y1) continue; const cx = clamp(cam.x, bx0, bx1), cy = clamp(cam.y, by0, by1); b._d = dist2(cx, cy, cam.x, cam.y); list.push(b); }
  list.sort((a, b) => b._d - a._d);
  const z = cam.z, ox = VW / 2 - cam.x * z + G.shk[0], oy = VH / 2 - cam.y * z + G.shk[1];
  for (const b of list) drawBuilding(b, z, ox, oy);
  worldXform(z);
}
function drawBuilding(b, z, ox, oy) {
  const cam = G.cam, s = 1 + b.H * HK, H = b.H, tex = WALLS[b.wall].c;
  const bx0 = b.x * T, by0 = b.y * T, bx1 = (b.x + b.w) * T, by1 = (b.y + b.h) * T;
  const S = (x, y) => [(x * z + ox) * DPR, (y * z + oy) * DPR];
  const R = (x, y) => [cam.x + (x - cam.x) * s, cam.y + (y - cam.y) * s];
  const faces = [];
  if (cam.y < by0) faces.push(0); if (cam.x > bx1) faces.push(1); if (cam.y > by1) faces.push(2); if (cam.x < bx0) faces.push(3);
  for (const f of faces) {
    const len = f === 0 || f === 2 ? b.w : b.h;
    const P = t => f === 0 ? [bx0 + t * T, by0] : f === 2 ? [bx0 + t * T, by1] : f === 3 ? [bx0, by0 + t * T] : [bx1, by0 + t * T];
    for (let t = 0; t < len; t++) {
      const A = P(t), B = P(t + 1.02), RA = R(A[0], A[1]);
      const [ax, ay] = S(A[0], A[1]), [bx, by] = S(B[0], B[1]), [rx, ry] = S(RA[0], RA[1]);
      ctx.setTransform((bx - ax) / 16, (by - ay) / 16, (rx - ax) / (16 * H), (ry - ay) / (16 * H), ax, ay);
      ctx.drawImage(tex, 0, 0, 16, 16 * H, 0, 0, 16, 16 * H);
      if (b.door && b.door.f === f && b.door.t === t && b.type !== 'spray') { const dt = DOORTEX[b.type] || (DOORTEX[b.type] = doorTex(DOORCOL[b.type] || '#6b4a2a', !!DOORCOL[b.type])); ctx.drawImage(dt, 0, 0); }
      if (b.garage && b.garage.f === f && (b.garage.t === t || b.garage.t + 1 === t)) ctx.drawImage(GARAGETEX, 0, 0);
    }
    if (G.collectFaces) { const A = P(0), B = P(len), RA = R(A[0], A[1]), RB = R(B[0], B[1]); G.facePolys.push({ p: [A, B, RB, RA], c: WALLS[b.wall].k === 'glass' ? 'rgba(150,200,255,1)' : 'rgba(255,190,110,1)', a: .2 + (b.id % 5) * .03 }); }
    // shading
    const alpha = f === 0 ? .38 : f === 3 ? .22 : f === 1 ? .1 : 0;
    if (alpha) {
      const A = P(0), B = P(len), RA = R(A[0], A[1]), RB = R(B[0], B[1]);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = `rgba(0,0,0,${alpha})`; ctx.beginPath();
      const pts = [A, B, RB, RA].map(q => [q[0] * z + ox, q[1] * z + oy]); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.fill();
    }
  }
  // roof
  const [r0x, r0y] = R(bx0, by0), [r1x, r1y] = R(bx1, by1);
  ctx.setTransform(DPR * z, 0, 0, DPR * z, DPR * ox, DPR * oy);
  ctx.drawImage(b.roof, r0x, r0y, r1x - r0x, r1y - r0y);
  if (b.H >= 2 && (b.type && DOORICON[b.type] || b.type === 'spray')) {
    const cx = (r0x + r1x) / 2, cy = (r0y + r1y) / 2; ctx.font = `bold ${Math.min(18, (r1x - r0x) / 7) | 0}px Bungee, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,.5)'; const tw = ctx.measureText(b.name).width; ctx.fillRect(cx - tw / 2 - 6, cy - 12, tw + 12, 24); ctx.fillStyle = b.gk === 'chop' ? '#ff7a30' : DOORCOL[b.type] || '#f2c230'; ctx.fillText(b.name, cx, cy + 1);
  }
}

// ---- interiors ----
const FLOORS = { wood: ['#7a5232', '#6b4628'], tile: ['#c9ccd1', '#b9bcc2'], check: ['#e8e8e8', '#222'], carpet: ['#7b2d3b', '#6e2734'], dark: ['#1c1428', '#241a33'], marble: ['#e4ddd0', '#d6cebf'], concrete: ['#6d6d6d', '#666'] };
function renderInterior() {
  const s = G.scene, z = G.cam.z; worldXform(z);
  ctx.fillStyle = '#05060a'; ctx.fillRect(-2000, -2000, s.w * T + 4000, s.h * T + 4000);
  drawInteriorStatic(s);
  // exit mat
  ctx.fillStyle = '#c0392b'; ctx.fillRect(s.door.x - T * .45, (s.h - 1) * T, T * .9, T * .8); ctx.fillStyle = '#fff'; ctx.font = 'bold 13px Bungee, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EXIT', s.door.x, (s.h - .55) * T);
  for (const d of (s.decals || [])) drawDecal(d);
  for (const it of s.items) drawItem(it, s);
  drawSurfaceStuff(s);
  drawFarmsAndAnimals();
  for (const p of s.peds) if (p.dead) drawPed(p);
  for (const p of s.peds) if (!p.dead) drawPed(p);
  drawPed(G.player); drawPlayerExtras(G.player);
  Net.drawRemotes(ctx, true, 'ped');
  drawCeiling(s);
  for (const f of G.fires) { ctx.fillStyle = 'rgba(255,120,20,.2)'; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.fill(); }
  for (const p of G.projs) drawProj(p);
  drawFx();
  if (G.settings.lights !== 0) interiorLighting();
  drawVignette();
}
function drawItem0(it, s) {
  if (it.stolen) return;
  const x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; const g = ctx;
  const box = (c, c2) => { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 5, w, h); g.fillStyle = c; g.fillRect(x, y, w, h); if (c2) { g.fillStyle = c2; g.fillRect(x, y, w, Math.min(6, h * .25)); } };
  if (it.t === 'chemlab') return drawLab(g, x, y, w, h);
  if (CZITEMS.has(it.t)) return drawCasinoItem(g, it, x, y, w, h);
  if (CLUT[it.t]) return drawClutter(g, it, x, y, w, h);
  if (IT[it.t] && DECOR2.some(d => d[0] === it.t) || it.t === 'jewels') return drawDecor2(g, it, x, y, w, h);
  switch (it.t) {
    case 'counter': case 'reception': case 'teller': box('#8d6e63', '#a1887f'); if (it.t === 'teller') { g.fillStyle = 'rgba(180,220,255,.35)'; g.fillRect(x, y - 6, w, 6); } break;
    case 'bar': box('#5d4037', '#8d6e63'); g.fillStyle = '#d4ac0d'; g.fillRect(x, y + h - 3, w, 3); break;
    case 'register': g.fillStyle = '#333'; g.fillRect(x + 8, y + 8, w - 16, h - 16); g.fillStyle = it.used ? '#555' : '#2ecc71'; g.fillRect(x + 12, y + 12, w - 24, 6); break;
    case 'shelf': box('#bdc3c7'); for (let i = 0; i < h / 10; i++) { g.fillStyle = ['#e74c3c', '#f1c40f', '#3498db', '#2ecc71', '#e67e22'][i % 5]; g.fillRect(x + 4, y + 4 + i * 10, w - 8, 6); } break;
    case 'fridge': box('#d6eaf8', '#fff'); g.fillStyle = 'rgba(52,152,219,.4)'; g.fillRect(x + 4, y + 8, w - 8, h - 12); break;
    case 'case': box('#34495e'); g.fillStyle = 'rgba(180,220,255,.35)'; g.fillRect(x + 3, y + 3, w - 6, h - 6); if (!it.used) { if (it.wpn === 'armor') drawWeaponIcon(g, 'armor', x + w / 2, y + h / 2, 1.3); else drawWeaponIcon(g, it.wpn, x + w / 2, y + h / 2, 1.5, '#ddd'); } break;
    case 'rack': box('#4e342e'); for (let i = 0; i < 3; i++) { g.fillStyle = '#222'; g.fillRect(x + 6 + i * 22, y + 4, 4, h - 8); } break;
    case 'table': box('#795548', '#8d6e63'); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w * .3, y + h * .5, 7, 0, TAU); g.arc(x + w * .7, y + h * .5, 7, 0, TAU); g.fill(); break;
    case 'chair': case 'stool': g.fillStyle = it.t === 'stool' ? '#c0392b' : '#6d4c41'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 2, 0, TAU); g.fill(); break;
    case 'booth': box('#922b21', '#c0392b'); break;
    case 'planter': drawPlanter(g, it, x, y, w, h); break;
    case 'bed': { // headboard at the top, two pillows, turned-down duvet
      box('#6d4c33', '#8a6242'); g.fillStyle = '#f4f1ea'; g.fillRect(x + 3, y + 6, w - 6, h - 9);
      const pw = (w - 12) / 2; g.fillStyle = '#ffffff'; g.fillRect(x + 5, y + 9, pw, h * .15); g.fillRect(x + 7 + pw, y + 9, pw, h * .15); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(x + 5, y + 9 + h * .15 - 2, pw, 2); g.fillRect(x + 7 + pw, y + 9 + h * .15 - 2, pw, 2);
      const dy = y + h * .33; g.fillStyle = '#3f6fa6'; g.fillRect(x + 3, dy, w - 6, y + h - 3 - dy); g.fillStyle = '#5b8ac4'; g.fillRect(x + 3, dy, w - 6, 5); g.fillStyle = 'rgba(255,255,255,.08)'; for (let k = dy + 12; k < y + h - 6; k += 10) g.fillRect(x + 5, k, w - 10, 1.5);
      g.fillStyle = '#6d4c33'; g.fillRect(x, y, w, 6); break; }
    case 'gurney': box('#bdc3c7'); g.fillStyle = '#ecf0f1'; g.fillRect(x + 4, y + 4, w - 8, h - 8); break;
    case 'tv': box('#111'); g.fillStyle = `hsl(${(G.t * 40) % 360},50%,40%)`; g.fillRect(x + 3, y + 3, w - 6, h - 5); break;
    case 'sofa': box('#6c3483', '#884ea0'); break;
    case 'arcade': box('#1b2631'); g.fillStyle = `hsl(${(G.t * 90 + x) % 360},80%,55%)`; g.fillRect(x + 6, y + h - 22, w - 12, 14); g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(x + w / 2, y + 12, 5, 0, TAU); g.fill(); break;
    case 'jukebox': box('#a04000'); g.fillStyle = `hsl(${(G.t * 120) % 360},90%,60%)`; g.fillRect(x + 6, y + 6, w - 12, h - 12); break;
    case 'atm': box('#566573'); g.fillStyle = '#2ecc71'; g.fillRect(x + 8, y + 6, w - 16, 10); break;
    case 'vend': box('#c0392b'); g.fillStyle = '#fff'; g.fillRect(x + w - 14, y + 4, 6, h - 8); break;
    case 'desk': box('#6e4b3a', '#8b6a55'); break;
    case 'computer': g.fillStyle = '#222'; g.fillRect(x, y, w, h); g.fillStyle = it.used ? '#333' : '#3498db'; g.fillRect(x + 4, y + 4, w - 8, h - 10); break;
    case 'cooler': g.fillStyle = '#ecf0f1'; g.fillRect(x, y, w, h); g.fillStyle = '#5dade2'; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 3, 0, TAU); g.fill(); break;
    case 'plant': g.fillStyle = '#6d4c41'; g.beginPath(); g.arc(x + 16, y + 16, 12, 0, TAU); g.fill(); g.fillStyle = '#27ae60'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(x + 16 + Math.cos(i) * 10, y + 16 + Math.sin(i) * 10, 8, 0, TAU); g.fill(); } break;
    case 'books': box('#5d4037'); for (let i = 0; i < h / 8; i++) { g.fillStyle = ['#c0392b', '#2980b9', '#27ae60', '#f39c12'][i % 4]; g.fillRect(x + 3, y + 3 + i * 8, w - 6, 5); } break;
    case 'crate': if (it.used) { g.fillStyle = '#6b4f2a'; for (let i = 0; i < 5; i++) g.fillRect(x + i * 12, y + (i % 2) * 20 + 10, 18, 6); break; } box('#a07a45', '#b88f55'); g.strokeStyle = '#6b4f2a'; g.lineWidth = 3; g.strokeRect(x + 3, y + 3, w - 6, h - 6); g.beginPath(); g.moveTo(x + 3, y + 3); g.lineTo(x + w - 3, y + h - 3); g.stroke(); break;
    case 'vault': box('#7f8c8d'); g.fillStyle = it.used ? '#222' : '#bdc3c7'; g.beginPath(); g.arc(x + w / 2, y + h / 2 + 4, 16, 0, TAU); g.fill(); g.strokeStyle = '#555'; g.lineWidth = 3; g.stroke(); break;
    case 'bars': if (it.broken) { g.fillStyle = '#555'; g.fillRect(x, y, w * .3, h); break; } g.fillStyle = '#888'; for (let i = 0; i < w; i += 10) g.fillRect(x + i, y, 4, h); break;
    case 'dance': for (let yy = 0; yy < it.h; yy++) for (let xx = 0; xx < it.w; xx++) { g.fillStyle = `hsl(${((xx * 3 + yy * 5) * 40 + G.t * 200) % 360},90%,${45 + 15 * Math.sin(G.t * 4 + xx + yy)}%)`; g.fillRect(x + xx * T + 1, y + yy * T + 1, T - 2, T - 2); } break;
    case 'dj': box('#222'); g.fillStyle = '#444'; g.beginPath(); g.arc(x + 30, y + h / 2, 18, 0, TAU); g.arc(x + w - 30, y + h / 2, 18, 0, TAU); g.fill(); break;
    case 'pool': box('#6e2c00'); g.fillStyle = '#1e8449'; g.fillRect(x + 8, y + 8, w - 16, h - 16); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w * .3, y + h / 2, 4, 0, TAU); g.fill(); g.fillStyle = '#111'; g.beginPath(); g.arc(x + w * .65, y + h / 2, 4, 0, TAU); g.fill(); break;
    case 'piano': box('#111'); g.fillStyle = '#fff'; g.fillRect(x + 4, y + h - 16, w - 8, 12); g.fillStyle = '#111'; for (let i = 8; i < w - 8; i += 10) g.fillRect(x + i, y + h - 16, 4, 7); break;
    case 'wardrobe': box('#6e4b3a'); g.fillStyle = '#4e342e'; g.fillRect(x + w / 2 - 1, y, 2, h); break;
    case 'stash': box('#2c3e50'); g.fillStyle = '#f2c230'; g.fillRect(x + w / 2 - 5, y + h / 2 - 3, 10, 6); break;
    case 'toilet': g.fillStyle = '#ecf0f1'; g.fillRect(x, y, w, h * .35); g.beginPath(); g.ellipse(x + w / 2, y + h * .65, w * .4, h * .35, 0, 0, TAU); g.fill(); break;
    case 'cabinet': box('#ecf0f1'); g.fillStyle = '#e74c3c'; g.fillRect(x + w / 2 - 6, y + h / 2 - 2, 12, 4); g.fillRect(x + w / 2 - 2, y + h / 2 - 6, 4, 12); break;
    case 'rug': g.fillStyle = 'rgba(160,60,40,.6)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(240,200,120,.6)'; g.lineWidth = 3; g.strokeRect(x + 5, y + 5, w - 10, h - 10); break;
    case 'safe': box('#555'); g.fillStyle = '#999'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 8, 0, TAU); g.fill(); break;
    case 'forklift': box('#f1c40f'); g.fillStyle = '#333'; g.fillRect(x + 4, y - 14, 6, 16); g.fillRect(x + w - 10, y - 14, 6, 16); break;
    case 'drawer': box('#8d6e63'); g.fillStyle = '#5d4037'; g.fillRect(x + 4, y + h / 2, w - 8, 2); break;
    case 'stove': box('#bdc3c7'); g.fillStyle = '#333'; [[.3, .4], [.7, .4]].forEach(([a, b]) => { g.beginPath(); g.arc(x + w * a, y + h * b + 6, 7, 0, TAU); g.fill(); }); break;
    case 'change': box('#f1c40f'); g.fillStyle = '#111'; g.fillRect(x + 6, y + 8, w - 12, 8); break;
    case 'target': g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 22, 0, TAU); g.fill(); g.fillStyle = '#e74c3c'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 14, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + w / 2, y + h / 2, 6, 0, TAU); g.fill(); break;
    case 'stage': { const gr = g.createLinearGradient(x, y, x, y + h); gr.addColorStop(0, '#3a1030'); gr.addColorStop(1, '#5a1848'); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 5, y + 6, w, h); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w, y + h * .7); g.quadraticCurveTo(x + w / 2, y + h * 1.15, x, y + h * .7); g.closePath(); g.fill(); g.strokeStyle = `hsl(${(G.t * 80) % 360},90%,60%)`; g.lineWidth = 3; g.stroke(); for (let i = 0; i < 12; i++) { g.fillStyle = Math.sin(G.t * 6 + i) > 0 ? '#ffe066' : '#7a5a00'; const t2 = i / 11; g.beginPath(); g.arc(x + t2 * w, y + h * .7 + Math.sin(t2 * Math.PI) * h * .22, 2.5, 0, TAU); g.fill(); } break; }
    case 'pole': g.fillStyle = '#ddd'; g.beginPath(); g.arc(x + 8, y + 8, 4, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 7, y + 7, 1.5, 0, TAU); g.fill(); break;
    case 'vip': box('#4a0d1f', '#7a1530'); g.fillStyle = '#b71c1c'; for (let i = 0; i < w; i += 8) g.fillRect(x + i, y + h - 6, 5, 6); g.fillStyle = '#f2c230'; g.font = 'bold 12px Bungee, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VIP', x + w / 2, y + h / 2); break;
    case 'neonsign': g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(x, y, w, h); g.fillStyle = `hsl(${320 + Math.sin(G.t * 3) * 20},100%,${60 + Math.sin(G.t * 9) * 8}%)`; g.font = 'bold 18px Bungee, Impact, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s.b.name.toUpperCase(), x + w / 2, y + h / 2, w - 6); break;
    case 'wbench': box('#5d4037', '#8d6e63'); g.fillStyle = '#9aa3aa'; g.fillRect(x + 8, y + 10, 30, 6); g.fillStyle = '#c0392b'; g.fillRect(x + 46, y + 8, 14, 10); g.fillStyle = '#222'; g.fillRect(x + 64, y + 12, 12, 3); break;
    case 'pshelf': box('#4e342e', '#6d4c41'); g.font = '26px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(it.e || '📦', x + w / 2, y + h / 2 + 2); g.fillStyle = '#f2c230'; g.fillRect(x + w - 16, y + h - 12, 12, 8); break;
    case 'lockers': box('#5d6d7e'); for (let i = 0; i < h; i += 20) { g.fillStyle = '#34495e'; g.fillRect(x + 2, y + i + 2, w - 4, 1); } break;
  }
}

// ================= HUD =================
function txt(s, x, y, size, col, align, font) {
  ctx.font = `${size}px ${font || 'Bungee, Impact, sans-serif'}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
  ctx.lineWidth = Math.max(3, size / 5); ctx.strokeStyle = '#000'; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function renderOverlays() {
  // speech bubbles & name tags
  if (G.mode === 'play') {
    const list = G.scene ? G.scene.peds : G.peds;
    for (const p of list) if (p.say && p.sayT > 0 && !p.dead) { const [sx, sy] = toScreen(p.x, p.y); if (sx < -50 || sx > VW + 50 || sy < -50 || sy > VH + 50) continue; const pk = Math.min(1, (2.5 - p.sayT) * 8), ov = pk < 1 ? 1 + Math.sin(pk * Math.PI) * .25 : 1; ctx.save(); ctx.translate(sx, sy - 33); ctx.scale(pk * ov, pk * ov); ctx.translate(-sx, -(sy - 33)); ctx.globalAlpha = Math.min(1, p.sayT * 2); ctx.font = '600 13px Rubik, sans-serif'; const w = ctx.measureText(p.say).width + 14; ctx.fillStyle = 'rgba(255,255,255,.92)'; ctx.fillRect(sx - w / 2, sy - 44, w, 22); ctx.beginPath(); ctx.moveTo(sx - 5, sy - 22); ctx.lineTo(sx + 5, sy - 22); ctx.lineTo(sx, sy - 15); ctx.fill(); ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.say, sx, sy - 33); ctx.restore(); }
    Net.drawTags();
  }
  // effects
  if (G.hurtFlash > 0) { ctx.fillStyle = `rgba(200,0,0,${G.hurtFlash * .6})`; ctx.fillRect(0, 0, VW, VH); }
  if (G.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${Math.min(1, G.fade)})`; ctx.fillRect(0, 0, VW, VH); }
  if (G.drunk > 0) { ctx.fillStyle = `rgba(255,180,60,${Math.min(.18, G.drunk / 150)})`; ctx.fillRect(0, 0, VW, VH); }
  if (G.lightning > 0 && !G.scene) { ctx.fillStyle = `rgba(230,240,255,${Math.min(.65, G.lightning * .6)})`; ctx.fillRect(0, 0, VW, VH); }
  if (G.player && G.player.dead && G.mode === 'play') { const k = clamp((G.t - (G.deathT || 0)) / 1.2, 0, 1); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${.9 * k})`; ctx.fillRect(0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = `rgba(0,0,0,${.3 * k})`; ctx.fillRect(0, 0, VW, VH); }
}
function renderHUD() {
  const p = G.player, sc = Math.min(1.15, Math.max(.75, Math.min(VW, VH) / 420)); hudBegin(sc); drugOverlay(sc);
  // top left: menu btn, cash, health
  const L = 52 * sc;
  ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(8, 8, 38 * sc, 38 * sc); ctx.fillStyle = '#fff'; ctx.fillRect(8 + 12 * sc, 8 + 11 * sc, 5 * sc, 16 * sc); ctx.fillRect(8 + 21 * sc, 8 + 11 * sc, 5 * sc, 16 * sc);
  Input.menuBtn = [8, 8, 38 * sc, 38 * sc]; drawPhoneBtn(L, sc);
  { const bxx = L + 138 * sc, bw = 34 * sc, full = invWeight() >= invCap(); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(bxx, 6, bw, bw); ctx.fillStyle = '#b08850'; ctx.fillRect(bxx + 8 * sc, 12 * sc, 18 * sc, 17 * sc); ctx.fillStyle = '#8a6a3c'; ctx.fillRect(bxx + 8 * sc, 12 * sc, 18 * sc, 5 * sc); ctx.strokeStyle = '#8a6a3c'; ctx.lineWidth = 2 * sc; ctx.beginPath(); ctx.arc(bxx + 17 * sc, 12 * sc, 5 * sc, Math.PI, 0); ctx.stroke(); ctx.fillStyle = '#f2c230'; ctx.fillRect(bxx + 15 * sc, 19 * sc, 4 * sc, 4 * sc); txt(invWeight() + '/' + invCap(), bxx + bw / 2, 6 + bw + 6 * sc, 8 * sc, full ? '#ff6b6b' : '#fff', 'center', 'Rubik, sans-serif'); Input.bagBtn = [bxx, 6, bw, bw + 10 * sc]; }
  G.cashShown = G.cashShown === undefined ? G.cash : Math.abs(G.cash - G.cashShown) < 1 ? G.cash : G.cashShown + (G.cash - G.cashShown) * .12;
  const cashStr = money(Math.round(G.cashShown));
  txt(cashStr, L + 6, 22 * sc, 24 * sc, G.cashFlash > 0 ? '#fff' : '#57e389');
  // health & armor
  const bw = 120 * sc, bx = L + 6, by = 40 * sc;
  ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx - 2, by - 2, bw + 4, 12 * sc + 4); ctx.fillStyle = '#5b1010'; ctx.fillRect(bx, by, bw, 12 * sc); ctx.fillStyle = p.hp < 25 && Math.floor(G.t * 4) % 2 ? '#ff7070' : '#e74c3c'; ctx.fillRect(bx, by, bw * clamp(p.hp / 100, 0, 1), 12 * sc);
  if (p.armor > 0) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx - 2, by + 14 * sc, bw + 4, 7 * sc + 4); ctx.fillStyle = '#5dade2'; ctx.fillRect(bx, by + 14 * sc + 2, bw * p.armor / 100, 7 * sc); }
  // weapon box
  const wy = by + (p.armor > 0 ? 28 : 18) * sc;
  if (p.weapon > 0) { const at = p.reloadT > 0 ? 'RELOAD' : pw(p.weapon).mag ? (p.clip[p.weapon] | 0) + ' / ' + (p.ammo[p.weapon] - (p.clip[p.weapon] | 0)) : String(p.ammo[p.weapon]); ctx.font = `${14 * sc}px Bungee, Impact, sans-serif`; const ww = Math.max(96 * sc, 48 * sc + ctx.measureText(at).width); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(bx - 2, wy, ww, 26 * sc); drawWeaponIcon(ctx, WEAPONS[p.weapon].id, bx + 18 * sc, wy + 13 * sc, 1.1 * sc, '#f2c230'); txt(at, bx + 40 * sc, wy + 13 * sc, 14 * sc, '#fff'); HUD.wpnW = bx + ww; }
  HUD.leftY = p.weapon > 0 ? wy + 26 * sc : wy - 2 * sc; HUD.leftW = Math.max(bx + bw + 2, p.weapon > 0 ? HUD.wpnW || 0 : 0); if (G.bank > 0) hudBadge('Bank ' + money(G.bank), '#9fe6b8');
  // clock
  { const hh = Math.floor(G.tod), mm = Math.floor((G.tod - hh) * 60), night = darkness() > .5; txt((night ? '☾ ' : '☀ ') + String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0') + (G.weather.rain > .3 ? ' ☂' : ''), VW - 14 * sc, 28 * sc, 12 * sc, night ? '#9fc5e8' : '#ffe082', 'right', 'Rubik, sans-serif'); }
  // product bag
  { const n = drugTotal(); if (n > 0) { const yy = HUD.leftY + 3 * sc; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(bx - 2, yy, 96 * sc, 22 * sc); ctx.fillStyle = '#8d6e63'; ctx.fillRect(bx + 4 * sc, yy + 5 * sc, 12 * sc, 12 * sc); ctx.fillStyle = '#66bb6a'; ctx.fillRect(bx + 7 * sc, yy + 3 * sc, 6 * sc, 4 * sc); txt(n + '/' + DCAP, bx + 22 * sc, yy + 11 * sc, 12 * sc, '#c5e1a5', 'left', 'Rubik, sans-serif');  HUD.leftY = yy + 22 * sc; HUD.leftW = Math.max(HUD.leftW, bx + 96 * sc); } }
  hudLeftExtras(sc);
  // speedometer & nitrous
  const pc = pCar(); if (pc && pc.nosT > 0) { ctx.strokeStyle = 'rgba(180,220,255,.25)'; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i < 24; i++) { const a = i / 24 * TAU + G.t, r1 = Math.min(VW, VH) * .42, r2 = r1 + 40 + Math.random() * 60; ctx.moveTo(VW / 2 + Math.cos(a) * r1, VH / 2 + Math.sin(a) * r1); ctx.lineTo(VW / 2 + Math.cos(a) * r2, VH / 2 + Math.sin(a) * r2); } ctx.stroke(); }
  // minimap
  if (G.settings.minimap) drawMinimap(sc); hudStatus(sc);
  // messages (pager)
  hudMessages(sc);
  // mission arrow
  const tg = G.mission && G.mission.target && !G.scene ? G.mission.target : G.tip && !G.scene ? G.tip : null;
  if (tg) {
    const [sx, sy] = toScreen(tg.x, tg.y), m = 60;
    if (sx < m || sx > VW - m || sy < m || sy > VH - m) {
      const a = Math.atan2(sy - VH / 2, sx - VW / 2), [ex, ey] = hudNudge(clamp(sx, m, VW - m), clamp(sy, m + 30, VH - m - 30) + 6, 26);
      ctx.save(); ctx.translate(ex, ey - 6); ctx.rotate(a); ctx.fillStyle = G.mission ? '#f2c230' : '#7fdbff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-10, -13); ctx.lineTo(-4, 0); ctx.lineTo(-10, 13); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
      const d = Math.round(dist(G.player.x, G.player.y, tg.x, tg.y) / T * 4); txt(d + 'm', ex, ey + 22, 11 * sc, '#fff', 'center');
    }
  }
  drawCombatHUD(sc); drawLawHUD(sc); drawFactoryHUD();
  Net.drawHUD(sc); hudEnd(sc);
}
const hudSc = () => Math.min(1.15, Math.max(.75, Math.min(VW, VH) / 420));
function drawStar(x, y, r, fill, stroke) {
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = stroke; ctx.stroke();
}
let MINI = null;
function buildMinimap() {
  const c = mkCanvas(N, N), g = c.getContext('2d'), id = g.createImageData(N, N);
  const col = { [TILE.FIELD]: [176, 150, 70], [TILE.DIRT]: [138, 106, 69], [TILE.SAND]: [216, 196, 140], [TILE.WATER]: [29, 78, 122], [TILE.ROAD]: [70, 70, 76], [TILE.WALK]: [140, 140, 136], [TILE.GRASS]: [61, 122, 50], [TILE.ALLEY]: [76, 74, 71], [TILE.LOT]: [70, 71, 76], [TILE.BLD]: [180, 170, 150], [TILE.DOCK]: [122, 85, 50], [TILE.PATH]: [179, 156, 116] };
  for (let i = 0; i < N * N; i++) { const cc = col[W.tile[i]] || [0, 0, 0]; id.data[i * 4] = cc[0]; id.data[i * 4 + 1] = cc[1]; id.data[i * 4 + 2] = cc[2]; id.data[i * 4 + 3] = 255; }
  g.putImageData(id, 0, 0); MINI = c;
}
function drawMinimap0(sc) {
  const R = 54 * sc * MSZ(), cx = VW - R - 12, cy = 46 * sc + R + 6, scale = 3.2 * sc * MZ(); // px per tile
  Input.miniBtn = [cx - R, cy - R, R * 2, R * 2];
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fillStyle = '#1d4e7a'; ctx.fill(); ctx.clip();
  const p = G.scene ? G.outPos : (pCar() || G.player);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(MINI, cx - p.x / T * scale, cy - p.y / T * scale, N * scale, N * scale);
  const dot = (x, y, c, r) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx + (x - p.x) / T * scale, cy + (y - p.y) / T * scale, r * sc, 0, TAU); ctx.fill(); };
  drawMiniIcons(cx, cy, R, scale, p, sc);
  if (!G.scene) for (const c of G.cars) if (c.siren > 0) dot(c.x, c.y, Math.floor(G.t * 6) % 2 ? '#f00' : '#00f', 2.2);
  Net.drawMini(dot);
  if (G.mission && G.mission.target) { const t = G.mission.target; const dx = (t.x - p.x) / T * scale, dy = (t.y - p.y) / T * scale, d = Math.hypot(dx, dy); const k = d > R - 6 ? (R - 6) / d : 1; ctx.fillStyle = '#f2c230'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx + dx * k, cy + dy * k, 4.5 * sc, 0, TAU); ctx.fill(); ctx.stroke(); }
  navMini(cx, cy, scale, R, p, sc);
  if (G.tip) { const t = G.tip; const dx = (t.x - p.x) / T * scale, dy = (t.y - p.y) / T * scale, d = Math.hypot(dx, dy); const k = d > R - 6 ? (R - 6) / d : 1; ctx.fillStyle = '#7fdbff'; ctx.beginPath(); ctx.arc(cx + dx * k, cy + dy * k, 4 * sc, 0, TAU); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(G.player.a); ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(7 * sc, 0); ctx.lineTo(-5 * sc, -5 * sc); ctx.lineTo(-2 * sc, 0); ctx.lineTo(-5 * sc, 5 * sc); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function drawFullMap() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = 'rgba(0,0,0,.85)'; ctx.fillRect(0, 0, VW, VH);
  const S = Math.min(VW - 20, VH - 60) / N, ox = (VW - N * S) / 2, oy = 40;
  ctx.imageSmoothingEnabled = false; ctx.drawImage(MINI, ox, oy, N * S, N * S);
  txt('SAN VARRO', VW / 2, 20, 18, '#f2c230', 'center');
  const dot = (x, y, c, r) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(ox + x / T * S, oy + y / T * S, r, 0, TAU); ctx.fill(); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke(); };
  for (const b of W.buildings) if (b.door && DOORCOL[b.type]) dot(b.door.x, b.door.y, DOORCOL[b.type], 4);
  for (const z of W.sprays) dot((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, z.kind === 'chop' ? '#ff7a30' : '#f2c230', 5);
  for (const d of W.dealerSpots) dot(d.x, d.y, '#66bb6a', 3);
  for (const ph of W.phones) dot(ph.x, ph.y, '#5dade2', 3);
  Net.drawMini((x, y, c, r) => dot(x, y, c, r * 1.5));
  if (G.mission && G.mission.target) dot(G.mission.target.x, G.mission.target.y, '#f2c230', 7);
  const p = G.scene ? G.outPos : (pCar() || G.player); dot(p.x, p.y, '#fff', 6);
  for (const [bi, bj] of [[7, 3], [11, 3], [4, 0], [5, 6], [7, 7], [9, 6], [9, 0], [2, 4], [1, 2], [0, 0], [5, 9], [6, 11], [1, 5], [3, 8], [3, 1], [2, 0], [10, 9]]) { const d = DISTRICTS[districtFor(bi, bj)]; ctx.font = `bold ${Math.max(9, S * 3)}px Bungee, sans-serif`; ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.textAlign = 'center'; ctx.fillText(d.name, ox + (bi * RSP + 10) * S, oy + (bj * RSP + 10) * S); }
  const leg = [['#c0392b', 'Guns'], ['#e67e22', 'Food'], ['#27ae60', 'Store'], ['#ecf0f1', 'Hospital'], ['#2c5aa0', 'Police'], ['#16a085', 'Bank'], ['#f2c230', 'Home / Customs'], ['#ff7a30', 'Chop shop'], ['#66bb6a', 'Dealer'], ['#5dade2', 'Payphone (jobs)'], ['#8e44ad', 'Bar'], ['#ff00cc', 'Club'], ['#ff2bd6', 'Strip club'], ['#d4a017', 'Pawn shop']];
  ctx.font = '600 11px Rubik, sans-serif'; ctx.textAlign = 'left'; leg.forEach(([c, n], i) => { const x = 8, y = oy + 8 + i * 16; ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 5, y, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.fillText(n, x + 13, y + 1); });
  txt('Tap anywhere to close', VW / 2, VH - 10, 11, '#aaa', 'center');
}
function renderControls() {
  if (Input.kbd) return;
  const L = Input.layout(); const p = G.player;
  // joystick
  const js = Input.stick;
  const bx = js.active ? js.ox : L.stick.x, by = js.active ? js.oy : L.stick.y, R = L.stick.r;
  ctx.globalAlpha = js.active ? .55 : .3; ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by, R, 0, TAU); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  ctx.globalAlpha = js.active ? .9 : .5; ctx.fillStyle = '#ddd'; ctx.beginPath(); ctx.arc(bx + (js.active ? js.dx : 0) * R, by + (js.active ? js.dy : 0) * R, R * .42, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  for (const b of L.btns) {
    if (!b.show) continue; const down = Input.held[b.id]; const br0 = b.r; if (down) b.r *= .92;
    ctx.globalAlpha = down ? .85 : .55; ctx.fillStyle = b.col || '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; ctx.strokeStyle = b.ring || 'rgba(255,255,255,.8)'; ctx.lineWidth = 2.5; ctx.stroke();
    if (b.id === 'fire' && Input.aim.active) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(b.x + Math.cos(Input.aimA) * b.r * .6, b.y + Math.sin(Input.aimA) * b.r * .6, b.r * .3, 0, TAU); ctx.fill(); }
    if (b.icon) drawWeaponIcon(ctx, b.icon, b.x, b.y - (b.sub ? 5 : 0), b.r / 16, '#fff');
    if (b.label) { const fs = Math.max(10, Math.min(15, b.r * .36)); ctx.font = `800 ${fs}px Rubik, sans-serif`; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.label, b.x, b.y + (b.icon ? b.r * .45 : 0)); }
    if (b.sub) { ctx.font = `700 ${Math.max(9, b.r * .3)}px Rubik, sans-serif`; ctx.fillStyle = '#f2c230'; ctx.textAlign = 'center'; ctx.fillText(b.sub, b.x, b.y + b.r * .55); }
    b.r = br0;
    if (b.tip) { const r = hudTipRect(b, L); ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(r[0], r[1], r[2], r[3]); ctx.fillStyle = '#f2c230'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(b.tip, r[0] + r[2] / 2, r[1] + 11, r[2] - 10); }
  }
}
