// ================= COUNTRYSIDE =================
Object.assign(PROPDEF, {
  pine: { r: 9, solid: 1 }, fruit: { r: 9, solid: 1, act: 'Pick fruit' }, silo: { r: 26, solid: 1 }, hay: { r: 13, solid: 1, act: 'Search hay bale' }, scarecrow: { r: 5, solid: 1, knock: 1 },
  cow: { r: 13, solid: 1, act: 'Pet the cow' }, campfire: { r: 9, solid: 0, act: 'Sit by the fire' }, fishspot: { r: 8, solid: 0, act: 'Go fishing' }, rock: { r: 14, solid: 1 },
  umbrella: { r: 6, solid: 0, knock: 1, act: 'Relax in the shade' }, wreck: { r: 20, solid: 1, act: 'Strip for parts' }, stand: { r: 13, solid: 1, act: 'Buy apples  $4' }, log: { r: 10, solid: 1 },
  trough: { r: 10, solid: 1 }, lifeguard: { r: 12, solid: 1 }, well: { r: 10, solid: 1, act: 'Draw water' }, mailbox: { r: 4, solid: 1, knock: 1, act: 'Check mailbox' },
});
const TALLP = { lamp: 1, tree: 1, palm: 1, pine: 1, fruit: 1, silo: 1, umbrella: 1, lifeguard: 1 };
function buildTiles2() {
  const sp = (g, r, base, cols, n) => { g.fillStyle = base; g.fillRect(0, 0, 32, 32); for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1 + (r() < .25 ? 1 : 0), 1); } };
  addTile('field0', (g, r) => { sp(g, r, '#c9a94a', ['#b8983e', '#d8bb5c', '#a88a34', '#e4cb72'], 220); g.fillStyle = 'rgba(90,60,10,.22)'; for (let y = 3; y < 32; y += 8) g.fillRect(0, y, 32, 2); g.fillStyle = 'rgba(255,240,170,.25)'; for (let y = 7; y < 32; y += 8) g.fillRect(0, y, 32, 1); }, 2001);
  addTile('field1', (g, r) => { sp(g, r, '#5a4028', ['#4e3620', '#664a30'], 90); for (let y = 0; y < 32; y += 8) { g.fillStyle = '#3f7d2e'; g.fillRect(0, y + 1, 32, 5); for (let x = 0; x < 32; x += 4) { g.fillStyle = r() < .5 ? '#56a03e' : '#2f6424'; g.fillRect(x + (r() * 2 | 0), y + 1 + (r() * 3 | 0), 2, 2); } } }, 2002);
  addTile('field2', (g, r) => { sp(g, r, '#6b4a2e', ['#5c3e25', '#7a5738', '#4f3520'], 160); g.fillStyle = 'rgba(30,15,5,.3)'; for (let y = 2; y < 32; y += 5) g.fillRect(0, y, 32, 2); }, 2003);
  addTile('dirt', (g, r) => { sp(g, r, '#8a6a45', ['#7c5e3c', '#977650', '#6f5334', '#a4835b'], 200); for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(0,0,0,.06)'; g.beginPath(); g.ellipse(r() * 32, r() * 32, 5 + r() * 6, 3 + r() * 4, r() * 3, 0, TAU); g.fill(); } g.fillStyle = '#9a9488'; for (let i = 0; i < 3; i++) g.fillRect(r() * 30 | 0, r() * 30 | 0, 2, 2); }, 2004);
  for (let v = 0; v < 2; v++) addTile('drt' + v, (g, r) => { sp(g, r, '#80623f', ['#735636', '#8d6e49', '#684c2e'], 220); g.fillStyle = 'rgba(40,25,10,.25)'; if (v) g.fillRect(6 + r() * 6, 8 + r() * 10, 9, 5); for (let i = 0; i < 4; i++) { g.fillStyle = '#a39c8d'; g.fillRect(r() * 30 | 0, r() * 30 | 0, 2, 1); } }, 2010 + v);
  const asph = (g, r) => { g.fillStyle = '#44454a'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 170; i++) { const v = r(); g.fillStyle = v < .35 ? '#3a3b40' : v < .7 ? '#4e4f55' : '#34353a'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); } };
  const shoulder = (g, r, side, vert) => { // gravel + grass edge
    for (let i = 0; i < 32; i++) for (let j = 0; j < 20; j++) { const t = j / 20, grass = t > .55 + r() * .25; g.fillStyle = grass ? (r() < .5 ? '#3f7d33' : '#4a8c3c') : (r() < .5 ? '#8f8a7c' : '#a39d8e'); const a = side ? j : 19 - j; if (r() < .12 && !grass) g.fillStyle = '#6f6a5e'; if (vert) g.fillRect(side ? 12 + j : 19 - j, i, 1, 1); else g.fillRect(i, side ? 12 + j : 19 - j, 1, 1); }
  };
  for (let c = 0; c < 4; c++) {
    addTile('crv' + c, (g, r) => { asph(g, r); if (c === 0) shoulder(g, r, 0, 1); if (c === 3) shoulder(g, r, 1, 1); if (c === 0) { g.fillStyle = '#d8d8cc'; g.fillRect(21, 0, 1, 32); } if (c === 3) { g.fillStyle = '#d8d8cc'; g.fillRect(10, 0, 1, 32); } g.fillStyle = '#e3b21f'; if (c === 1) { g.fillRect(31, 2, 1, 12); g.fillRect(31, 18, 1, 12); } if (c === 2) { g.fillRect(0, 2, 1, 12); g.fillRect(0, 18, 1, 12); } }, 2020 + c);
    addTile('crh' + c, (g, r) => { asph(g, r); if (c === 0) shoulder(g, r, 0, 0); if (c === 3) shoulder(g, r, 1, 0); if (c === 0) { g.fillStyle = '#d8d8cc'; g.fillRect(0, 21, 32, 1); } if (c === 3) { g.fillStyle = '#d8d8cc'; g.fillRect(0, 10, 32, 1); } g.fillStyle = '#e3b21f'; if (c === 1) { g.fillRect(2, 31, 12, 1); g.fillRect(18, 31, 12, 1); } if (c === 2) { g.fillRect(2, 0, 12, 1); g.fillRect(18, 0, 12, 1); } }, 2030 + c);
  }
}
function drawCustomCar(g, type, col, L, Wd, wreck) {
  const dk = shade(col, .6), lt = shade(col, 1.3);
  if (type === 'tractor') {
    g.fillStyle = '#0d0d0d'; g.fillRect(1, -3, 12, 5); g.fillRect(1, Wd - 2, 12, 5); g.fillStyle = '#2a2a2a'; for (let x = 2; x < 13; x += 2.4) { g.fillRect(x, -3, 1, 5); g.fillRect(x, Wd - 2, 1, 5); }
    g.fillStyle = '#111'; g.fillRect(L - 8, 1.5, 6, 2.5); g.fillRect(L - 8, Wd - 4, 6, 2.5);
    g.fillStyle = dk; g.fillRect(3, 3, 12, Wd - 6); g.fillStyle = col; g.fillRect(12, 5, L - 14, Wd - 10); g.fillStyle = lt; g.fillRect(13, Wd / 2 - 1.5, L - 16, 3);
    g.fillStyle = wreck ? '#111' : '#1d3044'; g.fillRect(4, 4, 9, Wd - 8); g.fillStyle = wreck ? '#222' : lt; g.fillRect(5, 5, 7, Wd - 10);
    g.fillStyle = '#333'; g.beginPath(); g.arc(L - 9, 6.5, 1.3, 0, TAU); g.fill(); if (!wreck) { g.fillStyle = '#fffbd0'; g.fillRect(L - 2.5, 5.5, 1.5, 2); g.fillRect(L - 2.5, Wd - 7.5, 1.5, 2); }
  } else { // bike
    const m = Wd / 2;
    g.fillStyle = '#0b0b0b'; g.fillRect(-1, m - 1.6, 7, 3.2); g.fillRect(L - 6, m - 1.4, 7, 2.8);
    g.fillStyle = '#777'; g.fillRect(3, m - 3.2, 5, 1.2); g.fillRect(3, m + 2, 5, 1.2);
    g.fillStyle = dk; g.fillRect(4, m - 2.2, L - 9, 4.4); g.fillStyle = col; g.beginPath(); g.ellipse(L * .56, m, 4.2, 2.6, 0, 0, TAU); g.fill(); g.fillStyle = lt; g.fillRect(L * .48, m - .6, 4, 1.2);
    g.fillStyle = '#1a1a1a'; g.fillRect(5, m - 2, 6, 4); g.fillStyle = '#999'; g.fillRect(L - 7.5, 0, 1.2, Wd); g.fillStyle = '#222'; g.fillRect(L - 8, -.6, 2.2, 1.6); g.fillRect(L - 8, Wd - 1, 2.2, 1.6);
    if (!wreck) { g.fillStyle = '#fffbd0'; g.fillRect(L - 1.2, m - 1, 1.4, 2); g.fillStyle = '#d61f1f'; g.fillRect(-.5, m - 1, 1, 2); }
  }
}
function genRural(blk, rng, rr) {
  const { bx, by, d } = blk;
  const set = (x, y, t) => { if (x >= bx && x < bx + 12 && y >= by && y < by + 12) W.tile[idx(x, y)] = t; };
  const fill = (x, y, w, h, t) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, t); };
  const P = (t, tx, ty, ex) => addProp(t, tx * T, ty * T, ex);
  const B = (x, y, w, h, wall, H, type, name) => { const b = makeBuilding({ x, y, w, h }, d, { H: [H, H], walls: [wall] }, rng, rr); b.type = type; b.name = name; return b; };
  const tAt = (x, y) => W.tile[idx(clamp(Math.floor(x), bx, bx + 11), clamp(Math.floor(y), by, by + 11))];
  const scatter = (t, n, ok, ex) => { for (let i = 0; i < n; i++) { const x = bx + .4 + rng() * 11.2, y = by + .4 + rng() * 11.2, tt = tAt(x, y); if (tt === TILE.BLD || tt === TILE.WATER || tt === TILE.DOCK || (ok && !ok(tt, x, y))) continue; P(t, x, y, ex ? ex() : null); } };
  const spot = (kind, tx, ty) => W.ruralSpots.push({ x: tx * T, y: ty * T, kind, ped: null });
  const flip = rng() < .5, RX = (lx, w) => flip ? bx + 12 - lx - w : bx + lx, PX = lx => flip ? bx + 12 - lx : bx + lx;
  const onG = tt => tt === TILE.GRASS;
  switch (d) {
    case 'farmland': {
      fill(bx, by, 12, 12, TILE.FIELD); fill(RX(0, 8), by, 8, 5, TILE.DIRT); fill(bx, by + 8, 12, 1, TILE.DIRT);
      B(RX(0, 3), by + 1, 3, 2, rng() < .5 ? 12 : 13, 1, 'home', 'Farmhouse'); B(RX(4, 3), by + 1, 3, 3, 14, 2, 'barn', 'Barn');
      P('silo', PX(3.5), by + 3.9); P('mailbox', PX(.5), by + .35); if (rng() < .7) W.parkSpots.push({ x: PX(1.5) * T, y: (by + 3.9) * T, a: flip ? 0 : Math.PI, type: 'tractor' }); // nose away from the silo
      if (rng() < .5) W.parkSpots.push({ x: PX(7.4) * T, y: (by + 2.5) * T, a: Math.PI / 2, type: 'pickup' }); P('well', PX(7.3), by + .7);
      scatter('hay', 5, tt => tt === TILE.FIELD); scatter('scarecrow', 2, tt => tt === TILE.FIELD); spot('farmer', PX(3.4), by + .55);
      break;
    }
    case 'woods': {
      const cab = rng() < .65, cx = bx + 3 + rr(0, 4), cy = by + 3 + rr(0, 3);
      if (cab) { fill(cx - 1, cy - 1, 4, 4, TILE.DIRT); fill(cx, cy + 3, 1, by + 12 - cy - 3, TILE.DIRT); B(cx, cy - 1, 2, 2, 4, 1, 'home', 'Cabin'); P('campfire', cx + 1.2, cy + 2.2); P('log', cx + 2.3, cy + 2.4); spot('camper', cx + .2, cy + 2.4); }
      scatter('pine', 52, onG); scatter('tree', 8, onG); scatter('bush', 7, onG); scatter('rock', 3, onG); scatter('log', 2, onG);
      break;
    }
    case 'lake': {
      const cx = bx + 6, cy = by + 6, rx = 4.3 + rng() * .5, ry = 3.6 + rng() * .5;
      for (let y = by; y < by + 12; y++) for (let x = bx; x < bx + 12; x++) { const v = ((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 + (rng() - .5) * .12; if (v < 1) set(x, y, TILE.WATER); else if (v < 1.55) set(x, y, TILE.SAND); }
      for (let lx = 0; lx < 5; lx++) set(RX(lx, 1), by + 6, TILE.DOCK);
      P('fishspot', PX(4.5), by + 6.5); spot('fisher', PX(3.4), by + 6.5);
      B(RX(0, 2), by, 2, 2, 7, 1, 'store', 'Bait & Tackle'); scatter('pine', 16, onG); scatter('bush', 5, onG); scatter('rock', 2, onG); P('umbrella', PX(2.2), by + 9.6, { c: 1 });
      break;
    }
    case 'quarry': {
      fill(bx, by, 12, 12, TILE.DIRT); fill(bx + 3, by + 3, 6, 6, TILE.SAND);
      B(RX(0, 3), by, 3, 2, 10, 1, 'warehouse', 'Quarry Office'); B(RX(8, 3), by + 9, 3, 2, 11, 1, 'warehouse', 'Blast Shed');
      W.parkSpots.push({ x: PX(5.5) * T, y: (by + 1.2) * T, a: 0, type: 'truck' }, { x: PX(9.5) * T, y: (by + 4) * T, a: Math.PI / 2, type: 'truck' });
      scatter('rock', 16); scatter('barrel', 5); spot('worker', PX(3.6), by + 2.6);
      break;
    }
    case 'coast': {
      fill(bx, by, 12, 12, TILE.SAND);
      if (blk.li % 3 === 1) B(RX(1, 3), by + 1, 3, 2, 9, 1, 'bar', 'Tiki Shack'); if (blk.li % 4 === 2) P('lifeguard', bx + 6, by + 9.5);
      scatter('palm', 9); scatter('umbrella', 8, null, () => ({ c: Math.floor(rng() * 4) })); scatter('rock', 2);
      spot('beach', bx + 3 + rng() * 6, by + 6 + rng() * 4); spot('beach', bx + 2 + rng() * 8, by + 4 + rng() * 6);
      break;
    }
    case 'orchard': {
      fill(RX(0, 5), by, 5, 4, TILE.DIRT); B(RX(1, 3), by + 1, 3, 2, 13, 1, 'home', 'Orchard House'); P('stand', PX(4.4), by + .55); spot('farmer', PX(4.5), by + 1.5);
      for (let gy = 1; gy < 12; gy += 2) for (let gx = 1; gx < 12; gx += 2) if (tAt(bx + gx, by + gy) === TILE.GRASS) P('fruit', bx + gx + .5, by + gy + .5);
      break;
    }
    case 'ranch': {
      fill(RX(0, 9), by, 9, 4, TILE.DIRT); B(RX(0, 4), by + 1, 4, 2, 12, 1, 'home', 'Ranch House'); B(RX(5, 3), by, 3, 3, 14, 2, 'barn', 'Stable');
      scatter('cow', 8, (tt, x, y) => tt === TILE.GRASS && y > by + 5, () => ({ a: rng() * 6.28, v: Math.floor(rng() * 3) })); scatter('hay', 3, onG); scatter('tree', 3, onG); P('trough', PX(8.5), by + 4.6); P('well', PX(4.5), by + .5);
      W.parkSpots.push({ x: PX(8.5) * T, y: (by + 2) * T, a: Math.PI / 2, type: 'pickup' }); spot('rancher', PX(4.6), by + 3.5);
      break;
    }
  }
}
// ---- rural props drawing ----
let PINESPR = null;
function pineSprite() {
  if (PINESPR) return PINESPR; const c = mkCanvas(72, 72), g = c.getContext('2d');
  const star = (r, col, rot) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + rot, rr = i % 2 ? r * .62 : r; g.lineTo(36 + Math.cos(a) * rr, 36 + Math.sin(a) * rr); } g.fill(); };
  star(34, '#15351b', 0); star(27, '#1d4a25', .3); star(20, '#27602f', .1); star(13, '#33783b', .45); star(6, '#4c9a52', 0);
  return PINESPR = c;
}
const UMB = [['#e74c3c', '#fff'], ['#3498db', '#fff'], ['#f1c40f', '#e67e22'], ['#2ecc71', '#fff']];
const RPROP = {
  pine(p, sh) { const hx = (p.x - G.cam.x) * .1, hy = (p.y - G.cam.y) * .1; ctx.fillStyle = `rgba(0,0,0,${sh[2] * 1.1})`; ctx.beginPath(); ctx.ellipse(sh[0] * 7, sh[1] * 7, 22, 20, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#3e2a17'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill(); ctx.save(); ctx.translate(hx, hy); ctx.rotate(p.x * .37 + Math.sin(G.t + p.x * .01) * .03); const s = 52 + (p.x * 7 % 14); ctx.drawImage(pineSprite(), -s / 2, -s / 2, s, s); ctx.restore(); },
  fruit(p, sh) { const hx = (p.x - G.cam.x) * .06, hy = (p.y - G.cam.y) * .06; ctx.fillStyle = `rgba(0,0,0,${sh[2]})`; ctx.beginPath(); ctx.ellipse(sh[0] * 5, sh[1] * 5, 19, 17, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#4a2f1a'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill(); ctx.drawImage(TREESPR[1], hx - 22, hy - 22, 44, 44); if (G.t > (p.next || 0)) { ctx.fillStyle = '#e53935'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(hx + Math.cos(i * 1.9 + p.x) * 11, hy + Math.sin(i * 2.3 + p.y) * 11, 2.2, 0, TAU); ctx.fill(); } } },
  silo(p, sh) { const hx = (p.x - G.cam.x) * .12, hy = (p.y - G.cam.y) * .12; ctx.fillStyle = `rgba(0,0,0,${sh[2] + .1})`; ctx.beginPath(); ctx.arc(sh[0] * 9, sh[1] * 9, 26, 0, TAU); ctx.fill(); ctx.fillStyle = '#8d949b'; ctx.beginPath(); ctx.arc(0, 0, 25, 0, TAU); ctx.fill(); ctx.fillStyle = '#a9b0b7'; ctx.beginPath(); ctx.arc(hx * .5, hy * .5, 25, 0, TAU); ctx.fill(); const gr = ctx.createRadialGradient(hx - 7, hy - 7, 2, hx, hy, 25); gr.addColorStop(0, '#f1f4f7'); gr.addColorStop(1, '#9aa2aa'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(hx, hy, 24, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(i / 8 * TAU) * 24, hy + Math.sin(i / 8 * TAU) * 24); ctx.stroke(); } ctx.fillStyle = '#6d747b'; ctx.beginPath(); ctx.arc(hx, hy, 3, 0, TAU); ctx.fill(); },
  hay(p) { ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(3, 4, 13, 0, TAU); ctx.fill(); const gr = ctx.createRadialGradient(-3, -3, 2, 0, 0, 13); gr.addColorStop(0, '#f0d27a'); gr.addColorStop(1, '#b8923a'); ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(0, 0, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(120,85,20,.6)'; ctx.lineWidth = 1; for (let r = 3; r < 13; r += 3) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); } },
  scarecrow(p) { if (p.down) { ctx.rotate(p.a); ctx.fillStyle = '#6d4c41'; ctx.fillRect(0, -1.5, 26, 3); return; } ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-12, 3, 26, 5); ctx.fillStyle = '#6d4c41'; ctx.fillRect(-14, -2, 28, 4); ctx.fillStyle = '#b33939'; ctx.fillRect(-9, -4, 18, 8); ctx.fillStyle = '#e0c068'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.fillStyle = '#8d6e3a'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.arc(0, 0, 4.5, 0, TAU, true); ctx.fill(); },
  cow(p) { ctx.rotate(p.a); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(2, 4, 16, 9, 0, 0, TAU); ctx.fill(); const base = ['#f4f1ea', '#6b4a2e', '#2b2b2b'][p.v || 0], patch = ['#2b2b2b', '#f4f1ea', '#f4f1ea'][p.v || 0]; ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(0, 0, 15, 8.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = patch; ctx.beginPath(); ctx.ellipse(-5, -2, 5, 3.5, .4, 0, TAU); ctx.ellipse(5, 3, 4, 3, -.3, 0, TAU); ctx.fill(); const bob = Math.sin(G.t * 1.5 + p.x) * 1.5; ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(17 + bob, 0, 5.5, 4.5, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#e8a9a0'; ctx.beginPath(); ctx.ellipse(21 + bob, 0, 2.2, 3, 0, 0, TAU); ctx.fill(); ctx.fillStyle = '#ddd'; ctx.fillRect(14 + bob, -6.5, 2, 2.5); ctx.fillRect(14 + bob, 4, 2, 2.5); ctx.strokeStyle = base; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-15, 0); ctx.quadraticCurveTo(-20, Math.sin(G.t * 3 + p.y) * 4, -22, Math.sin(G.t * 3 + p.y) * 6); ctx.stroke(); },
  campfire(p) { ctx.fillStyle = '#555'; for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(Math.cos(i / 8 * TAU) * 10, Math.sin(i / 8 * TAU) * 10, 3.2, 0, TAU); ctx.fill(); } ctx.fillStyle = '#2a1a0e'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#5a3a1a'; ctx.fillRect(-7, -1.5, 14, 3); ctx.save(); ctx.rotate(1.1); ctx.fillRect(-7, -1.5, 14, 3); ctx.restore(); ctx.globalCompositeOperation = 'lighter'; const f = 12 + Math.sin(G.t * 13 + p.x) * 3; ctx.drawImage(radialSprite('rgba(255,150,40,1)', 64), -f, -f, f * 2, f * 2); ctx.drawImage(radialSprite('rgba(255,240,180,1)', 64), -f * .4, -f * .4, f * .8, f * .8); ctx.globalCompositeOperation = 'source-over'; if (Math.random() < .06 && inView(p.x, p.y, 20)) spawnFx('smoke', p.x, p.y); },
  fishspot(p) { ctx.fillStyle = '#e74c3c'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fill(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, .8); ctx.lineTo(0, 0); ctx.arc(0, 0, 8, 1.57, 2.37); ctx.lineTo(0, 0); ctx.arc(0, 0, 8, 3.14, 3.94); ctx.lineTo(0, 0); ctx.arc(0, 0, 8, 4.71, 5.51); ctx.lineTo(0, 0); ctx.fill(); ctx.fillStyle = '#7a5532'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill(); },
  rock(p) { ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(4, 5, 15, 11, 0, 0, TAU); ctx.fill(); ctx.rotate(p.x * .7); ctx.fillStyle = '#7d7f84'; ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-8, -10); ctx.lineTo(4, -13); ctx.lineTo(14, -4); ctx.lineTo(11, 9); ctx.lineTo(-4, 12); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#a2a5aa'; ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(3, -11); ctx.lineTo(6, -2); ctx.lineTo(-5, 1); ctx.closePath(); ctx.fill(); },
  umbrella(p, sh) { if (p.down) { ctx.rotate(p.a); ctx.fillStyle = UMB[p.c || 0][0]; ctx.fillRect(0, -8, 16, 16); return; } const hx = (p.x - G.cam.x) * .06, hy = (p.y - G.cam.y) * .06, C = UMB[p.c || 0]; ctx.fillStyle = `rgba(0,0,0,${sh[2] + .05})`; ctx.beginPath(); ctx.arc(sh[0] * 5 + 3, sh[1] * 5 + 4, 22, 0, TAU); ctx.fill(); ctx.fillStyle = '#4fc3f7'; ctx.fillRect(-16, 8, 26, 10); ctx.fillStyle = '#fff'; ctx.fillRect(-16, 8, 26, 2); for (let i = 0; i < 8; i++) { ctx.fillStyle = C[i % 2]; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.arc(hx, hy, 22, i * TAU / 8, (i + 1) * TAU / 8); ctx.fill(); } ctx.fillStyle = '#eee'; ctx.beginPath(); ctx.arc(hx, hy, 2.5, 0, TAU); ctx.fill(); },
  wreck(p) { ctx.rotate(p.a); const d = CAR_TYPES[p.ct || 'sedan'], spr = carSprite(p.ct || 'sedan', '#555555', true); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-d.L + 3, -d.W + 5, d.L * 2, d.W * 2); ctx.drawImage(spr, -(d.L + 8), -(d.W + 8), (d.L + 8) * 2, (d.W + 8) * 2); if (p.searched) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(d.L * .3, -d.W * .6, d.L * .5, d.W * 1.2); } },
  stand(p) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(-12, -6, 30, 20); ctx.fillStyle = '#8d6e63'; ctx.fillRect(-15, -9, 30, 18); for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#e53935' : '#7cb342'; ctx.beginPath(); ctx.arc(-10 + i * 4, 3, 2.6, 0, TAU); ctx.fill(); } for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#fff' : '#43a047'; ctx.fillRect(-15 + i * 5, -9, 5, 7); } },
  log(p) { ctx.rotate(p.x * .5); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-11, -2, 26, 9); ctx.fillStyle = '#6b4a2a'; ctx.fillRect(-13, -4, 26, 8); ctx.fillStyle = '#8a6540'; ctx.fillRect(-13, -4, 26, 2); ctx.fillStyle = '#c9a36b'; ctx.beginPath(); ctx.ellipse(13, 0, 2, 4, 0, 0, TAU); ctx.fill(); },
  trough(p) { ctx.fillStyle = '#5d4037'; ctx.fillRect(-14, -7, 28, 14); ctx.fillStyle = '#4a90c2'; ctx.fillRect(-12, -5, 24, 10); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-10, -4 + Math.sin(G.t * 2) * 1, 8, 1); },
  lifeguard(p, sh) { const hx = (p.x - G.cam.x) * .1, hy = (p.y - G.cam.y) * .1; ctx.fillStyle = `rgba(0,0,0,${sh[2] + .1})`; ctx.fillRect(-10 + sh[0] * 6, -10 + sh[1] * 6, 26, 26); ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 3; for (const [a, b] of [[-11, -11], [11, -11], [-11, 11], [11, 11]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + hx, b + hy); ctx.stroke(); } ctx.fillStyle = '#f4f4f4'; ctx.fillRect(hx - 14, hy - 14, 28, 28); ctx.fillStyle = '#e53935'; ctx.fillRect(hx - 14, hy - 3, 28, 6); ctx.fillRect(hx - 3, hy - 14, 6, 28); },
  well(p) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(3, 4, 11, 0, TAU); ctx.fill(); ctx.fillStyle = '#8a8d91'; ctx.beginPath(); ctx.arc(0, 0, 11, 0, TAU); ctx.fill(); ctx.fillStyle = '#16344d'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.fillStyle = '#6d4c41'; ctx.fillRect(-12, -1.5, 24, 3); },
  mailbox(p) { if (p.down) ctx.rotate(p.a); ctx.fillStyle = '#555'; ctx.fillRect(-1, -1, 2, 8); ctx.fillStyle = '#1565c0'; ctx.fillRect(-4, -5, 8, 6); ctx.fillStyle = '#e53935'; ctx.fillRect(3, -5, 1.5, 3); },
};
// ---- rural prop interactions ----
const RUSE = {
  fruit(pr) { if (G.t < (pr.next || 0)) return toast('Picked clean. Come back later.'); pr.next = G.t + 180; Snd.play('rustle', pr.x, pr.y); const n = rint(2, 4); const got = invAdd('apple', n, 1); toast(got ? `Picked ${got} apple${got > 1 ? 's' : ''}` : 'Bag full'); },
  hay(pr) { if (pr.searched) return toast('Just hay.'); pr.searched = 1; Snd.play('rustle', pr.x, pr.y); for (let i = 0; i < 5; i++) spawnFx('paper', pr.x, pr.y); if (Math.random() < .3) giveLoot(pick(['moonshine', 'toolbox', 'cigars', 'bandage'])); else if (Math.random() < .3) { const n = rint(20, 120); addCash(n); toast('A stash in the hay: ' + money(n)); } else toast('Needle not found. Just hay.'); },
  cow(pr) { Snd.play('moo', pr.x, pr.y); toast(pick(['Moo.', 'The cow regards you with deep suspicion.', 'Moooo!', 'She likes you.', 'You have made a friend.'])); },
  campfire(pr) { G.sitting = { x: G.player.x, y: G.player.y }; toast('Warming up by the fire... (move to stand)'); },
  fishspot(pr) { if (!G.inv.rod) return say('Fishing spot', 'The water is full of fish, but you need a fishing rod. Pawn shops and stores sell them.'); if (G.fishing) return; G.fishing = { t: rnd(2.5, 6), x: G.player.x, y: G.player.y, bx: pr.x + (pr.x - G.player.x) * 2.2 + rnd(-20, 20), by: pr.y + (pr.y - G.player.y) * 2.2 + 46 }; Snd.play('whoosh'); setTimeout(() => Snd.play('splash', undefined, undefined, .4), 350); toast('Line cast. Hold still...'); },
  umbrella(pr) { G.sitting = { x: pr.x - 4, y: pr.y + 12 }; G.player.x = pr.x - 4; G.player.y = pr.y + 12; toast('Relaxing on the beach... (move to stand)'); },
  wreck(pr) { if (pr.searched) return toast('Already stripped.'); pr.searched = 1; Snd.play('ratchet', pr.x, pr.y); giveLoot(Math.random() < .5 ? 'carparts' : 'copper'); },
  stand(pr) { if (payCash(4)) { const g = invAdd('apple', 3, 1); if (!g) { heal(20); toast('Ate them on the spot. +20'); } else toast('3 fresh apples'); } },
  well(pr) { heal(10); Snd.play('splash', pr.x, pr.y, .4); toast('Cold, clean water. +10'); },
  mailbox(pr) { if (pr.searched) return toast('Empty.'); pr.searched = 1; Snd.play('rustle', pr.x, pr.y); if (Math.random() < .4) { const n = rint(10, 60); addCash(n); crime(.2, 'Mail theft'); toast('A birthday card with ' + money(n) + ' in it. You monster.'); } else toast(pick(['Bills.', 'Seed catalog.', 'A postcard from Aunt Dolores.'])); },
};
Object.assign(LINES, {
  farmer: ['Corn\'s coming in nicely this year.', 'City folk. Always in a hurry.', 'Don\'t spook the cows.', 'Them Road Reapers been tearing up my fields on their bikes.', 'You want fresh? Try the orchard stands.', 'Sheriff\'s in Dusty Creek if you got trouble. Or if you ARE trouble.'],
  fisher: ['Shh. You\'ll scare the bass.', 'Biggest one I ever caught was THIS big.', 'Need a rod? Bait & Tackle\'s right there.', 'Trophy bass sells for a pretty penny at the pawn shop.'],
  camper: ['Nothing like fresh air.', 'I came out here to get away from the sirens.', 'Bears? Nah. Probably.', 'Fire\'s warm. Pull up a log.'],
  beach: ['Surf\'s flat today.', 'Did you bring sunscreen?', 'The Tiki Shack makes a mean drink.', 'I\'m never going back to the office.'],
  rancher: ['Best beef in Varro County.', 'You close that gate behind you.', 'Cow tipping is a myth. Don\'t test it.', 'Lost two head last week. Blame the Reapers.'],
  worker: LINES.worker,
});
const RSPOT = {
  farmer: { shirt: '#b33939', pants: '#34495e', hat: 2, hatCol: '#d9b56b', weapon: 0 }, rancher: { shirt: '#8d6e63', pants: '#283747', hat: 2, hatCol: '#5d4037' }, fisher: { shirt: '#5d8aa8', hat: 2, hatCol: '#7f8c8d' },
  camper: { shirt: '#2e7d32', jk: '#5d4037' }, beach: { shirt: '#ff7043', pants: '#29b6f6' }, worker: { shirt: '#f39c12', hat: 2, hatCol: '#f1c40f' },
};
function updateRuralSpots(dt) {
  const p = G.player;
  for (const s of W.ruralSpots) {
    const d2 = dist2(s.x, s.y, p.x, p.y);
    if (!s.ped && d2 < 950 * 950 && !inView(s.x, s.y, 40) && G.t > (s.next || 0)) {
      const q = new Ped(s.x, s.y, { role: s.kind, extra: Object.assign({ persist: 1 }, RSPOT[s.kind]) }); q.state = 'idle'; q.a = rnd(0, TAU); if (s.kind === 'beach') q.sit = Math.random() < .5 ? 1 : 0; if ((s.kind === 'farmer' || s.kind === 'rancher') && Math.random() < .4) q.weapon = WI.shotgun;
      q.home = [s.x, s.y]; G.peds.push(q); s.ped = q;
    } else if (s.ped && (d2 > 1800 * 1800 || s.ped.dead && s.ped.deadT > 20) && !inView(s.x, s.y, 60)) { const i = G.peds.indexOf(s.ped); if (i >= 0) G.peds.splice(i, 1); if (s.ped.dead) s.next = G.t + 150; s.ped = null; }
  }
  // fishing
  const f = G.fishing; if (f) {
    if (dist2(p.x, p.y, f.x, f.y) > 14 * 14 || p.dead || p.car) { G.fishing = null; toast('You reeled in early.'); return; }
    f.t -= dt;
    if (f.t <= 0) { G.fishing = null; Snd.play('splash', f.bx, f.by); const r = Math.random(); for (let i = 0; i < 6; i++) spawnFx('water', f.bx, f.by);
      if (r < .08) { giveLoot('bigfish'); G.big = { text: 'TROPHY BASS!', col: '#4fc3f7', t: 2, small: 1 }; } else if (r < .68) giveLoot('fish'); else if (r < .8) giveLoot('copper', 'You hooked some scrap metal.'); else if (r < .84) giveLoot('watch', 'You fished up a wristwatch?!'); else toast('It got away.'); }
  }
}
