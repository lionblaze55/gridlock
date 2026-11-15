'use strict';
// ================= CORE UTILITIES =================
const T = 64;               // world units per tile
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const dist2 = (ax, ay, bx, by) => { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; };
const dist = (ax, ay, bx, by) => Math.sqrt(dist2(ax, ay, bx, by));
function angDiff(a, b) { let d = (b - a) % TAU; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; return d; }
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = (a, b) => a + Math.random() * (b - a);
const rint = (a, b) => Math.floor(rnd(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const now = () => performance.now() / 1000;
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function shade(hex, f) { // f<1 darker, >1 lighter
  const n = parseInt(hex.slice(1), 16); let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  if (f < 1) { r *= f; g *= f; b *= f; } else { r += (255 - r) * (f - 1); g += (255 - g) * (f - 1); b += (255 - b) * (f - 1); }
  return '#' + ((1 << 24) | (clamp(r | 0, 0, 255) << 16) | (clamp(g | 0, 0, 255) << 8) | clamp(b | 0, 0, 255)).toString(16).slice(1);
}
function money(n) { return '$' + Math.floor(n).toLocaleString('en-US'); }
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};

// ================= DEFINITIONS =================
const WEAPONS = [
  { id: 'fist', name: 'Fists', rate: 2.6, dmg: 12, range: 30, melee: 1, sound: 'punch' },
  { id: 'pistol', name: 'Pistol', mag: 12, reload: 1, rate: 3.4, dmg: 22, spread: .03, range: 640, ammo0: 40, price: 250, ammoPrice: 60, sound: 'pistol' },
  { id: 'uzi', name: 'Machine Pistol', mag: 30, reload: 1.3, rate: 11, dmg: 11, spread: .09, range: 560, ammo0: 150, price: 700, ammoPrice: 120, sound: 'uzi' },
  { id: 'shotgun', name: 'Shotgun', mag: 6, reload: 1.7, rate: 1.15, dmg: 14, pellets: 7, spread: .24, range: 380, ammo0: 24, price: 1100, ammoPrice: 150, sound: 'shotgun' },
  { id: 'molotov', name: 'Molotov', rate: 1.3, proj: 'molotov', ammo0: 8, price: 450, ammoPrice: 200, sound: 'throw' },
  { id: 'rocket', name: 'Rocket Launcher', rate: .8, proj: 'rocket', ammo0: 6, price: 3500, ammoPrice: 900, sound: 'rocket' },
  { id: 'rifle', name: 'Assault Rifle', mag: 30, reload: 1.5, rate: 8, dmg: 19, spread: .05, range: 720, ammo0: 90, price: 2400, ammoPrice: 220, sound: 'rifle' },
  { id: 'bolt', name: 'Bolt-Action Rifle', mag: 5, reload: 2.1, rate: .95, dmg: 92, spread: .006, range: 1050, ammo0: 20, price: 1900, ammoPrice: 160, sound: 'bolt', pedMul: 1 },
  { id: 'sniper', name: 'Sniper Rifle', mag: 5, reload: 2.6, rate: .7, dmg: 150, spread: .002, range: 1450, ammo0: 15, price: 4800, ammoPrice: 320, sound: 'boltbig' },
  { id: 'knife', name: 'Combat Knife', melee: 1, rate: 2.5, dmg: 38, range: 34, ammo0: 1, price: 150, ammoPrice: 0, sound: 'whoosh', quiet: 1 },
];
const WI = {}; WEAPONS.forEach((w, i) => WI[w.id] = i);

const CAR_TYPES = {
  compact: { name: 'Pipsqueak', L: 30, W: 16, max: 470, acc: 380, steer: 3.0, grip: 9, hp: 90, mass: .8, cols: ['#e74c3c', '#3498db', '#f1c40f', '#ecf0f1', '#8e44ad', '#16a085', '#d35400'] },
  sedan: { name: 'Stallion', L: 34, W: 17, max: 530, acc: 360, steer: 2.7, grip: 8.5, hp: 110, mass: 1, cols: ['#2c3e50', '#7f8c8d', '#c0392b', '#27ae60', '#bdc3c7', '#2980b9', '#6d4c41', '#34495e'] },
  sports: { name: 'Cheetah GT', L: 34, W: 16, max: 760, acc: 600, steer: 3.1, grip: 10, hp: 85, mass: .9, cols: ['#e74c3c', '#f39c12', '#f1c40f', '#111111', '#ffffff', '#2ecc71'] },
  muscle: { name: 'Boxer', L: 36, W: 18, max: 660, acc: 520, steer: 2.6, grip: 6.5, hp: 120, mass: 1.15, cols: ['#c0392b', '#111111', '#2980b9', '#f39c12', '#8e44ad'] },
  taxi: { name: 'Cabbie', L: 34, W: 17, max: 520, acc: 360, steer: 2.7, grip: 8.5, hp: 110, mass: 1, cols: ['#f5c400'] },
  cop: { name: 'Interceptor', L: 35, W: 17, max: 660, acc: 520, steer: 2.9, grip: 9, hp: 150, mass: 1.1, cols: ['#f4f4f4'] },
  van: { name: 'Hauler', L: 40, W: 19, max: 420, acc: 260, steer: 2.3, grip: 8, hp: 160, mass: 1.6, cols: ['#ecf0f1', '#95a5a6', '#2c3e50', '#16a085', '#a04000'] },
  swat: { name: 'Enforcer', L: 42, W: 20, max: 520, acc: 360, steer: 2.3, grip: 8, hp: 320, mass: 2.4, cols: ['#1b2631'] },
  truck: { name: 'Big Haul', L: 52, W: 20, max: 380, acc: 210, steer: 1.9, grip: 8, hp: 240, mass: 2.6, cols: ['#c0392b', '#2471a3', '#1e8449', '#7d6608'] },
  pickup: { name: 'Rancher', L: 36, W: 18, max: 500, acc: 340, steer: 2.5, grip: 7.5, hp: 130, mass: 1.3, cols: ['#7b241c', '#1a5276', '#145a32', '#b9770e', '#566573'] },
};
CAR_TYPES.tractor = { name: 'Plowboy', custom: 1, L: 28, W: 18, max: 230, acc: 200, steer: 2.4, grip: 9, hp: 180, mass: 1.8, cols: ['#2e7d32', '#c62828', '#1565c0'] };
CAR_TYPES.bike = { name: 'Hellhound', custom: 1, L: 22, W: 9, max: 780, acc: 680, steer: 3.3, grip: 9.5, hp: 55, mass: .45, cols: ['#111111', '#7b1e1e', '#37474f', '#d4af37'] };
const RTRAFFIC = ['pickup', 'pickup', 'pickup', 'truck', 'sedan', 'van', 'tractor', 'muscle', 'compact'];
const TRAFFIC_MIX = ['compact', 'compact', 'sedan', 'sedan', 'sedan', 'sports', 'muscle', 'taxi', 'taxi', 'van', 'truck', 'pickup', 'pickup'];

const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#a0662f', '#5c3a1e'];
const SHIRT = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6', '#ecf0f1', '#34495e', '#e67e22', '#1abc9c', '#7f8c8d', '#c0392b', '#2c3e50', '#ff6fa8'];
const HAIR = ['#111', '#3b2314', '#6a4e23', '#b5893b', '#888', '#d9d9d9', '#7b1e1e'];
const PCOLORS = ['#f2c230', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6', '#ff7f50', '#1abc9c', '#ff6fa8'];
const FIRST = ['Vinny', 'Marla', 'Dex', 'Tony', 'Rosa', 'Chet', 'Gloria', 'Sal', 'Benny', 'Lupe', 'Rex', 'Dot', 'Frankie', 'Mo', 'Trish', 'Earl', 'Nadia', 'Hank', 'Iggy', 'Pearl', 'Lou', 'Kiko', 'Gus', 'Wanda', 'Ray', 'Suki', 'Otis', 'Dolores', 'Jules', 'Bix'];
const LAST = ['Marconi', 'Delgado', 'Kowalski', 'Price', 'Nguyen', 'Brooks', 'Okafor', 'Duval', 'Russo', 'Moon', 'Steele', 'Varga', 'Fontaine', 'Quill', 'Abara', 'Haddad'];
const randName = () => pick(FIRST) + ' ' + pick(LAST);

// ================= SPRITES =================
const SPR = { cars: {} };
const NEONS = ['#ff2bd6', '#00e5ff', '#39ff14', '#ff3b3b', '#ffd400', '#8a5cff', '#ffffff'];
const RIMS = [{ n: 'Stock steel', c: '#8f949b' }, { n: 'Chrome', c: '#eef3f8' }, { n: 'Gold', c: '#d4af37' }, { n: 'Gloss black', c: '#1b1b1b' }, { n: 'Color-matched', c: null }];
const HLCOL = ['#fffbe0', '#bfe6ff', '#ffe27a'];
const PAINTS = ['#e74c3c', '#c0392b', '#ff6f3c', '#f39c12', '#f1c40f', '#c8e636', '#2ecc71', '#16a085', '#1abc9c', '#3498db', '#2457c5', '#1b2a5c', '#8e44ad', '#ff6fa8', '#ecf0f1', '#bdc3c7', '#7f8c8d', '#34495e', '#1a1a1a', '#6d4c41', '#d4af37', '#b87333'];
// one tyre seen from above: dark rubber with a tread that depends on the tyre type, and the rim showing on the outer (visible) edge
function drawTyre(g, x, y, wl, top, rimC, m, roll, h) { h = h || 3.2 + (m.tyr === 3 ? .55 : m.tyr === 2 ? .25 : 0); const ty = m.tyr | 0, rl = roll || 0;
  g.fillStyle = ty === 2 ? '#141414' : '#0b0b0b'; g.beginPath(); g.roundRect ? g.roundRect(x, y, wl, h, ty === 3 ? .6 : 1) : g.rect(x, y, wl, h); g.fill();
  if (ty === 3) { g.fillStyle = '#2b2b2b'; for (let i = .4 + rl % 1.4; i < wl - .6; i += 1.4) { g.fillRect(x + i, y - .25, .9, .7); g.fillRect(x + i, y + h - .45, .9, .7); g.fillRect(x + i + .45, y + h * .4, .7, h * .2); } }
  else if (ty === 2) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + .5, top ? y + .35 : y + h - .75, wl - 1, .4); }
  else if (ty === 1) { g.fillStyle = '#252525'; for (let i = .5 + rl % .9; i < wl - .4; i += .9) g.fillRect(x + i, y, .35, h); }
  else { g.fillStyle = '#262626'; for (let i = 1 + rl % 1.6; i < wl - .4; i += 1.6) g.fillRect(x + i, y, .6, h); }
  // the rim: across the outer, visible edge, with spokes and a shine
  const ry = top ? y + .25 : y + h - 1.35, rh = 1.1, rx = x + 1, rw = wl - 2; g.fillStyle = rimC; g.fillRect(rx, ry, rw, rh);
  const rimI = m.rim | 0; g.fillStyle = rimI === 3 ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.35)'; const sp = rimI === 1 ? .7 : rimI === 2 ? .9 : rimI === 4 ? 1.1 : 1.6; for (let i = rx + .3; i < rx + rw - .2; i += sp) g.fillRect(i, ry, .22, rh);
  if (rimI === 1 || rimI === 2) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(rx + .3, ry + .1, rw * .35, .3); } }
function modKey(m) { return m ? [m.s, m.liv, m.rim, m.sp, m.hd, m.sk, m.tint, m.num, m.tyr, m.mfr, m.mbr, m.mpp, m.mst, m.mtk, m.mlt, m.mbg].join('|') : ''; }
function carBodyPath(g, x, y, L, W, rf, rr) {
  g.beginPath(); g.moveTo(x + rr, y); g.lineTo(x + L - rf, y); g.quadraticCurveTo(x + L, y, x + L, y + rf); g.lineTo(x + L, y + W - rf); g.quadraticCurveTo(x + L, y + W, x + L - rf, y + W);
  g.lineTo(x + rr, y + W); g.quadraticCurveTo(x, y + W, x, y + W - rr); g.lineTo(x, y + rr); g.quadraticCurveTo(x, y, x + rr, y); g.closePath();
}
function carSprite(type, color, wreck, m, full) {
  m = m || {};
  const key = type + color + (wreck ? 'w' : '') + (full ? 'f' : '') + modKey(m);
  if (SPR.cars[key]) return SPR.cars[key];
  const d = CAR_TYPES[type], L = d.L, Wd = d.W, S = 4, PAD = 4;
  const c = mkCanvas((L + PAD * 2) * S, (Wd + PAD * 2) * S), g = c.getContext('2d');
  g.scale(S, S); g.translate(PAD, PAD); g.lineJoin = 'round';
  if (d.custom) { drawCustomCar(g, type, wreck ? '#2b2420' : color, L, Wd, wreck, wreck || full, m); SPR.cars[key] = c; return c; }
  const body = wreck ? '#2b2420' : color, dk = wreck ? '#120e0c' : shade(color, .55), lt = wreck ? '#3d3330' : shade(color, 1.35), sec = m.s || shade(color, .4);
  const glassA = wreck ? '#0a0a0a' : m.tint === 2 ? '#05070a' : m.tint === 1 ? '#0f1824' : '#1d3044', glassB = wreck ? '#151515' : m.tint === 2 ? '#1a1e24' : m.tint === 1 ? '#2a3a4e' : '#5d84a8';
  const rimC = (RIMS[m.rim || 0] || RIMS[0]).c || (m.s || '#ccc');
  const isBox = !!d.box, isTruck = type === 'truck', isPick = !!d.pick;
  const wide = m.sk ? .5 : 0;
  // --- wheels ---
  const wl = Math.max(5.5, L * .17), axF = L * .72, axR = L * .13;
  const wheel = (x, y) => drawTyre(g, x, y, wl, y < 0, rimC, m);
  const tyW = m.tyr === 3 ? .55 : m.tyr === 2 ? .25 : 0, wy0 = -1.3 - wide - tyW, wy1 = Wd - 1.9 + wide + tyW;
  [[axR, wy0], [axR, wy1]].forEach(([x, y]) => wheel(x, y)); if (wreck || full) { wheel(axF, wy0); wheel(axF, wy1); }
  if (isTruck) { wheel(L * .42, wy0); wheel(L * .42, wy1); wheel(L * .52, wy0); wheel(L * .52, wy1); }
  // --- spoiler under/behind ---
  if (!isTruck && !isBox && m.sp === 3) { g.fillStyle = '#111'; g.fillRect(-2.6, -1.2, 2.4, Wd + 2.4); g.fillStyle = sec; g.fillRect(-2.2, -.6, 1.6, Wd + 1.2); g.fillStyle = '#000'; g.fillRect(-2.8, -1.4, 3, 1); g.fillRect(-2.8, Wd + .4, 3, 1); g.fillStyle = '#333'; g.fillRect(-.4, 2, 1.4, 1); g.fillRect(-.4, Wd - 3, 1.4, 1); }
  // shadow-ish outline
  const bodyGrad = (y0, h) => { const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, dk); gr.addColorStop(.18, body); gr.addColorStop(.5, lt); gr.addColorStop(.82, body); gr.addColorStop(1, dk); return gr; };
  if (isTruck) {
    // trailer
    const tw = L * .66; g.fillStyle = '#1a1a1a'; g.fillRect(-.3, -.3, tw + .6, Wd + .6);
    const tg = g.createLinearGradient(0, 0, 0, Wd); tg.addColorStop(0, wreck ? '#222' : '#9aa0a6'); tg.addColorStop(.5, wreck ? '#2c2c2c' : '#e9ecef'); tg.addColorStop(1, wreck ? '#1a1a1a' : '#8a9096');
    g.fillStyle = tg; g.fillRect(0, 0, tw, Wd); g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 2; x < tw; x += 3.2) g.fillRect(x, .6, .6, Wd - 1.2);
    if (!wreck) { g.fillStyle = body; g.fillRect(tw * .2, Wd / 2 - 1.5, tw * .6, 3); }
    // cab
    carBodyPath(g, L * .7, .6, L * .3, Wd - 1.2, 3, 1.5); g.fillStyle = bodyGrad(.6, Wd - 1.2); g.fill(); g.strokeStyle = dk; g.lineWidth = .5; g.stroke();
    g.fillStyle = glassA; g.fillRect(L * .9, 2.2, 2.6, Wd - 4.4); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(L * .91, 2.6, .8, Wd - 5.2);
    g.fillStyle = lt; g.fillRect(L * .74, 2.2, L * .14, Wd - 4.4); g.fillStyle = '#555'; g.fillRect(L * .72, 1, 1.2, 1.2); g.fillRect(L * .72, Wd - 2.2, 1.2, 1.2);
  } else {
    const rf = isBox ? 2.2 : (type === 'sports' || d.low) ? 6 : 4.5, rr = isBox ? 1.6 : 3.2;
    carBodyPath(g, -.4, -.4 - wide * .5, L + .8, Wd + .8 + wide, rf + .3, rr + .3); g.fillStyle = 'rgba(0,0,0,.55)'; g.fill();
    carBodyPath(g, 0, 0, L, Wd, rf, rr); g.fillStyle = bodyGrad(0, Wd); g.fill();
    // liveries (clipped to body)
    g.save(); carBodyPath(g, 0, 0, L, Wd, rf, rr); g.clip();
    if (!wreck) {
      if (m.liv === 1) { g.fillStyle = sec; g.fillRect(0, Wd / 2 - 2.6, L, 1.8); g.fillRect(0, Wd / 2 + .8, L, 1.8); }
      if (m.liv === 2) { g.fillStyle = sec; g.fillRect(0, 0, L * .3, Wd); g.fillRect(L * .8, 0, L * .2, Wd); }
      if (m.liv === 3) { const fg = g.createLinearGradient(L, 0, L * .35, 0); fg.addColorStop(0, '#ffd400'); fg.addColorStop(.45, '#ff6a00'); fg.addColorStop(1, sec); g.fillStyle = fg; for (const side of [0, 1]) { g.beginPath(); const y = side ? Wd : 0, s = side ? -1 : 1; g.moveTo(L, y); for (let i = 0; i <= 6; i++) { const x = L - i * L * .1; g.lineTo(x - L * .05, y + s * (i % 2 ? 1.2 : 4.2)); } g.lineTo(L * .35, y); g.fill(); } }
      if (m.liv === 4) { g.fillStyle = sec; g.fillRect(0, 1.3, L, 1.2); g.fillRect(0, Wd - 2.5, L, 1.2); }
      if (m.liv === 5) { for (let x = L * .7; x < L; x += 1.6) for (let y = 0; y < Wd; y += 1.6) if (((x / 1.6 | 0) + (y / 1.6 | 0)) % 2) { g.fillStyle = '#111'; g.fillRect(x, y, 1.6, 1.6); } else { g.fillStyle = '#f4f4f4'; g.fillRect(x, y, 1.6, 1.6); } }
      if (m.liv === 6) { g.fillStyle = sec; g.fillRect(L * .32, 0, 1.2, Wd); g.fillRect(L * .62, 0, 1.2, Wd); }
    }
    // hood
    if (!wreck && m.hd === 3) { g.fillStyle = '#1c1c1c'; g.fillRect(L * .74, 0, L * .26, Wd); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = .4; for (let i = -Wd; i < L; i += 1.2) { g.beginPath(); g.moveTo(L * .74 + i, 0); g.lineTo(L * .74 + i + Wd, Wd); g.stroke(); } }
    g.restore();
    // panel lines
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = .35;
    if (!isBox && !isPick) { g.beginPath(); g.moveTo(L * .74, 1.2); g.lineTo(L * .74, Wd - 1.2); g.moveTo(L * .22, 1.2); g.lineTo(L * .22, Wd - 1.2); g.stroke(); }
    // bumpers
    g.fillStyle = wreck ? '#111' : '#2a2a2a'; g.fillRect(L - .9, 1.6, .9, Wd - 3.2); g.fillRect(0, 1.6, .8, Wd - 3.2);
    if (m.sk && !wreck) { g.fillStyle = '#151515'; g.fillRect(L * .2, -.5, L * .5, 1); g.fillRect(L * .2, Wd - .5, L * .5, 1); g.fillRect(L - 1.2, 1, 1.4, Wd - 2); }
    if (isBox) {
      g.fillStyle = glassA; g.fillRect(L * .79, 1.6, 3.4, Wd - 3.2); g.fillStyle = glassB; g.fillRect(L * .8, 2.2, 1, Wd - 4.4);
      const rg = g.createLinearGradient(0, 2, 0, Wd - 2); rg.addColorStop(0, shade(wreck ? '#333333' : color, .85)); rg.addColorStop(.5, wreck ? '#3a3330' : shade(color, 1.18)); rg.addColorStop(1, shade(wreck ? '#333333' : color, .85));
      g.fillStyle = rg; g.fillRect(1.6, 2, L * .74, Wd - 4); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .4; for (let x = L * .15; x < L * .74; x += L * .15) { g.beginPath(); g.moveTo(x, 2); g.lineTo(x, Wd - 2); g.stroke(); }
      if (type === 'swat' && !wreck) { g.fillStyle = '#e8e8e8'; g.font = 'bold 5px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(L * .4, Wd / 2); g.rotate(Math.PI / 2); g.fillText('SWAT', 0, 0); g.restore(); g.fillStyle = '#c00'; g.fillRect(L * .74, 2, 1.4, 2.5); g.fillStyle = '#04c'; g.fillRect(L * .74, Wd - 4.5, 1.4, 2.5); }
    } else if (isPick) {
      g.fillStyle = dk; g.fillRect(1.6, 1.8, L * .42, Wd - 3.6); g.fillStyle = shade(wreck ? '#333333' : color, .4); g.fillRect(2.4, 2.6, L * .38, Wd - 5.2);
      g.fillStyle = 'rgba(0,0,0,.3)'; for (let x = 3; x < L * .4; x += 2.2) g.fillRect(x, 2.6, .4, Wd - 5.2);
      g.fillStyle = glassA; g.fillRect(L * .47, 2, 1.8, Wd - 4); g.fillRect(L * .7, 1.6, 3.4, Wd - 3.2); g.fillStyle = glassB; g.fillRect(L * .71, 2.2, .9, Wd - 4.4);
      g.fillStyle = lt; g.fillRect(L * .52, 2, L * .17, Wd - 4);
    } else {
      const lowc = type === 'sports' || d.low, ws = lowc ? .55 : .6, rs = lowc ? .22 : .2;
      // rear glass
      g.fillStyle = glassA; g.beginPath(); g.moveTo(L * rs, 1.6); g.lineTo(L * (rs + .1), 2.3); g.lineTo(L * (rs + .1), Wd - 2.3); g.lineTo(L * rs, Wd - 1.6); g.fill();
      // windshield
      const wg = g.createLinearGradient(L * ws, 0, L * (ws + .14), 0); wg.addColorStop(0, glassA); wg.addColorStop(1, glassB);
      g.fillStyle = wg; g.beginPath(); g.moveTo(L * ws, 2.1); g.lineTo(L * (ws + .14), 1.2); g.lineTo(L * (ws + .14), Wd - 1.2); g.lineTo(L * ws, Wd - 2.1); g.fill();
      if (!wreck) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = .5; g.beginPath(); g.moveTo(L * (ws + .03), 2.6); g.lineTo(L * (ws + .1), Wd * .45); g.stroke(); }
      // roof
      const rgr = g.createLinearGradient(0, 2.3, 0, Wd - 2.3); rgr.addColorStop(0, body); rgr.addColorStop(.45, wreck ? '#463b37' : shade(color, 1.5)); rgr.addColorStop(1, body);
      g.fillStyle = m.liv === 2 && !wreck ? sec : rgr; g.beginPath(); g.roundRect ? g.roundRect(L * (rs + .1), 2.3, L * (ws - rs - .1), Wd - 4.6, 1.4) : g.rect(L * (rs + .1), 2.3, L * (ws - rs - .1), Wd - 4.6); g.fill();
      if (m.liv === 1 && !wreck) { g.fillStyle = sec; g.fillRect(L * (rs + .1), Wd / 2 - 2.6, L * (ws - rs - .1), 1.8); g.fillRect(L * (rs + .1), Wd / 2 + .8, L * (ws - rs - .1), 1.8); }
      // side windows
      g.fillStyle = glassA; g.fillRect(L * (rs + .12), .9, L * (ws - rs - .14), 1.1); g.fillRect(L * (rs + .12), Wd - 2, L * (ws - rs - .14), 1.1);
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(L * ((rs + ws) / 2), .9, .4, 1.1); g.fillRect(L * ((rs + ws) / 2), Wd - 2, .4, 1.1);
      // mirrors
      g.fillStyle = dk; g.fillRect(L * (ws + .02), -1, 1.3, 1.2); g.fillRect(L * (ws + .02), Wd - .2, 1.3, 1.2);
      if (m.liv === 6 && !wreck) { g.fillStyle = '#fff'; g.beginPath(); g.arc(L * ((rs + ws) / 2 + .05), Wd / 2, Wd * .22, 0, TAU); g.fill(); g.fillStyle = '#111'; g.font = `bold ${Wd * .3}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(m.num || 7), L * ((rs + ws) / 2 + .05), Wd / 2 + .3); }
      // hood mods
      if (!wreck && m.hd === 1) { g.fillStyle = '#151515'; g.fillRect(L * .78, Wd / 2 - 2, L * .1, 4); g.fillStyle = sec === color ? dk : sec; g.fillRect(L * .78, Wd / 2 - 2.4, L * .12, .6); g.fillRect(L * .78, Wd / 2 + 1.8, L * .12, .6); }
      if (!wreck && m.hd === 2) { g.fillStyle = '#111'; for (let i = 0; i < 4; i++) { g.fillRect(L * .78 + i * 1.3, 2.6, .6, 2.4); g.fillRect(L * .78 + i * 1.3, Wd - 5, .6, 2.4); } }
      if (type === 'muscle' && !wreck && !m.hd) { g.fillStyle = '#1a1a1a'; g.fillRect(L * .76, Wd / 2 - 1.8, 4.5, 3.6); }
      if (type === 'taxi' && !wreck) { g.fillStyle = '#222'; g.fillRect(L * .38, Wd / 2 - 3, 4, 6); g.fillStyle = '#ff4'; g.fillRect(L * .39, Wd / 2 - 2, 2, 4); for (let x = 1; x < L - 1; x += 3) { g.fillStyle = (x / 3 | 0) % 2 ? '#111' : '#f5c400'; g.fillRect(x, .7, 1.5, .8); g.fillRect(x, Wd - 1.5, 1.5, .8); } }
      if (type === 'cop' && !wreck) { g.fillStyle = '#121212'; g.fillRect(.6, .6, L * .21, Wd - 1.2); g.fillRect(L * .78, .6, L * .21, Wd - 1.2); g.fillStyle = '#1f3a93'; g.fillRect(L * .3, .8, L * .22, .9); g.fillRect(L * .3, Wd - 1.7, L * .22, .9); g.fillStyle = '#222'; g.fillRect(L * .44, 2.4, 2.2, Wd - 4.8); }
      // spoiler lip / ducktail
      if (!wreck && m.sp === 1) { g.fillStyle = '#151515'; g.fillRect(.2, 1.5, .9, Wd - 3); }
      if (!wreck && m.sp === 2) { g.fillStyle = dk; g.beginPath(); g.moveTo(0, 1.4); g.quadraticCurveTo(-1.6, Wd / 2, 0, Wd - 1.4); g.lineTo(1, Wd - 1.4); g.lineTo(1, 1.4); g.fill(); }
    }
  }
  if (!wreck && d.deco) d.deco(g, L, Wd);
  if (!wreck) {
    const hc = HLCOL[m.hl || 0];
    g.fillStyle = hc; g.beginPath(); g.ellipse(L - .9, 2.6, .9, 1.4, 0, 0, TAU); g.ellipse(L - .9, Wd - 2.6, .9, 1.4, 0, 0, TAU); g.fill();
    g.fillStyle = '#d61f1f'; g.fillRect(-.1, 1.4, 1, 2.6); g.fillRect(-.1, Wd - 4, 1, 2.6); g.fillStyle = '#ff6b6b'; g.fillRect(.1, 1.8, .4, 1); g.fillRect(.1, Wd - 3.6, .4, 1);
  } else {
    g.fillStyle = 'rgba(0,0,0,.45)'; for (let i = 0; i < 16; i++) g.fillRect(Math.random() * L, Math.random() * Wd, 2.5, 1.6);
    g.fillStyle = 'rgba(255,90,0,.25)'; for (let i = 0; i < 5; i++) g.fillRect(Math.random() * L, Math.random() * Wd, 1, 1);
  }
  SPR.cars[key] = c; return c;
}
// light / fx sprites
const LSPR = {};
function radialSprite(col, size, inner) {
  const k = col + size + (inner || 0); if (LSPR[k]) return LSPR[k];
  const c = mkCanvas(size, size), g = c.getContext('2d'), r = size / 2, gr = g.createRadialGradient(r, r, r * (inner || 0), r, r, r);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, size, size); return LSPR[k] = c;
}
function coneSprite(col) {
  const k = 'cone' + col; if (LSPR[k]) return LSPR[k];
  const c = mkCanvas(256, 160), g = c.getContext('2d');
  const gr = g.createRadialGradient(0, 80, 4, 0, 80, 250); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, 70); g.lineTo(256, 0); g.lineTo(256, 160); g.lineTo(0, 90); g.closePath(); g.fill();
  return LSPR[k] = c;
}
function smokeSprite() {
  if (LSPR.smoke) return LSPR.smoke; const c = mkCanvas(64, 64), g = c.getContext('2d');
  for (let i = 0; i < 6; i++) { const x = 32 + Math.cos(i) * 8, y = 32 + Math.sin(i * 1.7) * 8, gr = g.createRadialGradient(x, y, 0, x, y, 22); gr.addColorStop(0, 'rgba(90,90,90,.5)'); gr.addColorStop(1, 'rgba(90,90,90,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
  return LSPR.smoke = c;
}
const TREESPR = [];
function buildTreeSprites() {
  const pal = [['#1f4f1c', '#2e6b27', '#46913a', '#6cbf55'], ['#24501f', '#356f2a', '#4f8f3c', '#7bc25a'], ['#3a4f1c', '#57702a', '#7a9a3a', '#a6c95a'], ['#1d4a3a', '#2a6650', '#3f8a6b', '#62b590']];
  for (let v = 0; v < 4; v++) {
    const c = mkCanvas(72, 72), g = c.getContext('2d'), r = mulberry32(v * 31 + 7), P = pal[v];
    const blob = (x, y, rad, col) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, rad, 0, TAU); g.fill(); };
    for (let i = 0; i < 9; i++) blob(36 + (r() - .5) * 26, 36 + (r() - .5) * 26, 11 + r() * 6, P[0]);
    for (let i = 0; i < 8; i++) blob(33 + (r() - .5) * 20, 33 + (r() - .5) * 20, 8 + r() * 5, P[1]);
    for (let i = 0; i < 7; i++) blob(29 + (r() - .5) * 16, 29 + (r() - .5) * 16, 5 + r() * 4, P[2]);
    for (let i = 0; i < 6; i++) blob(26 + (r() - .5) * 12, 26 + (r() - .5) * 12, 2 + r() * 3, P[3]);
    TREESPR.push(c);
  }
  // palm
  const c = mkCanvas(80, 80), g = c.getContext('2d');
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + .2; g.save(); g.translate(40, 40); g.rotate(a); const gr = g.createLinearGradient(0, 0, 36, 0); gr.addColorStop(0, '#2e6b27'); gr.addColorStop(1, '#7cc35a'); g.fillStyle = gr; g.beginPath(); g.moveTo(0, -2); g.quadraticCurveTo(20, -9, 37, 0); g.quadraticCurveTo(20, 7, 0, 2); g.fill(); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .8; g.beginPath(); g.moveTo(2, 0); g.lineTo(34, 0); g.stroke(); g.restore(); }
  g.fillStyle = '#6b4a2a'; g.beginPath(); g.arc(40, 40, 5, 0, TAU); g.fill(); g.fillStyle = '#5a3a1a'; g.beginPath(); g.arc(38, 38, 2, 0, TAU); g.fill();
  TREESPR.push(c);
}
// static ground detail sprites
const DETAIL = {};
function buildDetails() {
  const mk = (n, fn) => { const c = mkCanvas(32, 32), g = c.getContext('2d'); fn(g); DETAIL[n] = c; };
  mk('manhole', g => { g.fillStyle = '#2b2b2e'; g.beginPath(); g.arc(16, 16, 9, 0, TAU); g.fill(); g.strokeStyle = '#4a4a50'; g.lineWidth = 1; g.beginPath(); g.arc(16, 16, 8, 0, TAU); g.stroke(); g.fillStyle = '#3c3c42'; for (let i = -6; i <= 6; i += 3) g.fillRect(10, 16 + i, 12, 1); });
  mk('crack', g => { g.strokeStyle = 'rgba(20,20,22,.7)'; g.lineWidth = .8; g.beginPath(); g.moveTo(3, 8); g.lineTo(10, 12); g.lineTo(14, 10); g.lineTo(20, 17); g.lineTo(27, 18); g.moveTo(14, 10); g.lineTo(13, 4); g.stroke(); });
  mk('stain', g => { const gr = g.createRadialGradient(16, 16, 0, 16, 16, 12); gr.addColorStop(0, 'rgba(10,10,15,.45)'); gr.addColorStop(1, 'rgba(10,10,15,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(16, 16, 12, 8, .5, 0, TAU); g.fill(); g.fillStyle = 'rgba(120,80,200,.08)'; g.beginPath(); g.ellipse(14, 15, 5, 3, .5, 0, TAU); g.fill(); });
  mk('patch', g => { g.fillStyle = 'rgba(30,30,33,.55)'; g.fillRect(6, 9, 18, 13); g.strokeStyle = 'rgba(15,15,15,.5)'; g.strokeRect(6, 9, 18, 13); });
  mk('grate', g => { g.fillStyle = '#1e1e1e'; g.fillRect(9, 2, 14, 6); g.fillStyle = '#3a3a3a'; for (let x = 10; x < 23; x += 2) g.fillRect(x, 2, 1, 6); });
  mk('gum', g => { g.fillStyle = 'rgba(40,40,40,.35)'; for (let i = 0; i < 5; i++) g.fillRect(4 + i * 5, 6 + (i * 7) % 20, 2, 2); });
  mk('slab', g => { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, 0, 16, 16); g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = .6; g.beginPath(); g.moveTo(2, 3); g.lineTo(9, 8); g.lineTo(14, 6); g.stroke(); });
  mk('flowers', g => { const cs = ['#ff6fa8', '#f1c40f', '#fff', '#e74c3c', '#9b59b6']; for (let i = 0; i < 9; i++) { g.fillStyle = cs[i % 5]; g.fillRect(4 + (i * 11) % 24, 4 + (i * 7) % 24, 2, 2); } });
  mk('tuft', g => { g.strokeStyle = '#2a5a22'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(10 + i * 2, 22); g.lineTo(8 + i * 3, 12 + (i % 3) * 2); g.stroke(); } });
}

// tile textures (32px)
const TILE = { WATER: 0, ROAD: 1, WALK: 2, GRASS: 3, ALLEY: 4, LOT: 5, BLD: 6, DOCK: 7, PATH: 8, SAND: 9, FIELD: 10, DIRT: 11 };
const TIMG = [];       // list of canvases
const TIMGI = {};      // name -> index
function addTile(name, fn, seed) {
  const c = mkCanvas(32, 32), g = c.getContext('2d'); const r = mulberry32(seed || name.length * 977 + TIMG.length * 31);
  fn(g, r); TIMGI[name] = TIMG.length; TIMG.push(c); return TIMGI[name];
}
function speckle(g, r, base, cols, n) { g.fillStyle = base; g.fillRect(0, 0, 32, 32); for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; g.fillRect(Math.floor(r() * 32), Math.floor(r() * 32), 1 + (r() < .2 ? 1 : 0), 1); } }
function buildTiles() {
  const asph = (g, r) => {
    g.fillStyle = '#3a3b40'; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 6; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.025)' : 'rgba(0,0,0,.05)'; g.beginPath(); g.ellipse(r() * 32, r() * 32, 4 + r() * 8, 3 + r() * 6, r() * 3, 0, TAU); g.fill(); }
    for (let i = 0; i < 170; i++) { const v = r(); g.fillStyle = v < .35 ? '#313237' : v < .7 ? '#45464c' : v < .9 ? '#2b2c30' : '#55565c'; g.fillRect(Math.floor(r() * 32), Math.floor(r() * 32), 1, 1); }
  };
  for (let v = 0; v < 3; v++) addTile('road' + v, (g, r) => { asph(g, r); if (v === 1) { g.fillStyle = 'rgba(0,0,0,.16)'; g.beginPath(); g.ellipse(10 + r() * 12, 10 + r() * 12, 6, 4, r() * 3, 0, TAU); g.fill(); } }, 100 + v);
  const dash = (g, x, vert) => { g.fillStyle = '#d6d6cc'; if (vert) { g.fillRect(x, 3, 1, 10); g.fillRect(x, 19, 1, 10); } else { g.fillRect(3, x, 10, 1); g.fillRect(19, x, 10, 1); } g.fillStyle = 'rgba(0,0,0,.18)'; if (vert) { g.fillRect(x, 7, 1, 1); g.fillRect(x, 24, 1, 1); } else { g.fillRect(8, x, 1, 1); g.fillRect(25, x, 1, 1); } };
  const yel = (g, x, vert) => { g.fillStyle = '#e3b21f'; if (vert) g.fillRect(x, 0, 1, 32); else g.fillRect(0, x, 32, 1); g.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 3; i < 32; i += 9) if (vert) g.fillRect(x, i, 1, 1); else g.fillRect(i, x, 1, 1); };
  for (let c = 0; c < 4; c++) {
    addTile('rv' + c, (g, r) => { asph(g, r); if (c === 0) dash(g, 31, 1); if (c === 1) yel(g, 30, 1); if (c === 2) yel(g, 1, 1); if (c === 3) dash(g, 0, 1); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(c === 0 || c === 2 ? 8 : 20, 0, 4, 32); }, 200 + c);
    addTile('rh' + c, (g, r) => { asph(g, r); if (c === 0) dash(g, 31, 0); if (c === 1) yel(g, 30, 0); if (c === 2) yel(g, 1, 0); if (c === 3) dash(g, 0, 0); g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(0, c === 0 || c === 2 ? 8 : 20, 32, 4); }, 210 + c);
  }
  addTile('cwv', (g, r) => { asph(g, r); for (let x = 2; x < 32; x += 8) { g.fillStyle = '#d8d8d0'; g.fillRect(x, 4, 4, 24); g.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 0; i < 5; i++) g.fillRect(x + (r() * 4 | 0), 4 + (r() * 24 | 0), 1, 1); } }, 220);
  addTile('cwh', (g, r) => { asph(g, r); for (let y = 2; y < 32; y += 8) { g.fillStyle = '#d8d8d0'; g.fillRect(4, y, 24, 4); g.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 0; i < 5; i++) g.fillRect(4 + (r() * 24 | 0), y + (r() * 4 | 0), 1, 1); } }, 221);
  addTile('stopv_s', (g, r) => { asph(g, r); }, 222);
  for (let m = 0; m < 16; m++) addTile('walk' + m, (g, r) => {
    g.fillStyle = '#9a9a94'; g.fillRect(0, 0, 32, 32);
    for (let sy = 0; sy < 2; sy++) for (let sx = 0; sx < 2; sx++) { const t = r(); g.fillStyle = t < .3 ? '#93938d' : t < .6 ? '#a2a29c' : '#9b9b95'; g.fillRect(sx * 16 + 1, sy * 16 + 1, 14, 14); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(sx * 16 + 1, sy * 16 + 1, 14, 1); }
    for (let i = 0; i < 50; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.08)' : 'rgba(255,255,255,.06)'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); }
    g.fillStyle = '#7c7c77'; g.fillRect(0, 15, 32, 1); g.fillRect(15, 0, 1, 32); g.fillRect(0, 31, 32, 1); g.fillRect(31, 0, 1, 32);
    const curb = (x, y, w, h, sx, sy, sw, sh) => { g.fillStyle = '#c4c4bd'; g.fillRect(x, y, w, h); g.fillStyle = '#56564f'; g.fillRect(sx, sy, sw, sh); };
    if (m & 1) curb(0, 0, 32, 3, 0, 0, 32, 1); if (m & 4) curb(0, 29, 32, 3, 0, 31, 32, 1); if (m & 2) curb(29, 0, 3, 32, 31, 0, 1, 32); if (m & 8) curb(0, 0, 3, 32, 0, 0, 1, 32);
  }, 300 + m);
  for (let v = 0; v < 4; v++) addTile('grass' + v, (g, r) => {
    g.fillStyle = '#3f7d33'; g.fillRect(0, 0, 32, 32);
    for (let i = 0; i < 5; i++) { g.fillStyle = r() < .5 ? 'rgba(80,140,60,.35)' : 'rgba(30,70,25,.3)'; g.beginPath(); g.ellipse(r() * 32, r() * 32, 5 + r() * 7, 4 + r() * 5, r() * 3, 0, TAU); g.fill(); }
    for (let i = 0; i < 160; i++) { const t = r(); g.fillStyle = t < .3 ? '#346b2b' : t < .6 ? '#4a8c3c' : t < .85 ? '#2f6127' : '#62ad4f'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1 + (r() < .3 ? 1 : 0)); }
    if (v === 3) { const cs = ['#f6e05e', '#fff', '#ff8fb6']; for (let i = 0; i < 5; i++) { g.fillStyle = cs[i % 3]; g.fillRect(r() * 30 | 0, r() * 30 | 0, 2, 2); } }
  }, 400 + v);
  for (let v = 0; v < 3; v++) addTile('alley' + v, (g, r) => { g.fillStyle = '#4b4946'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 130; i++) { const t = r(); g.fillStyle = t < .4 ? '#423f3c' : t < .8 ? '#56524e' : '#3a3734'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1, 1); } if (v === 1) { g.fillStyle = 'rgba(30,20,10,.35)'; g.beginPath(); g.ellipse(16, 18, 9, 5, .3, 0, TAU); g.fill(); } if (v === 2) { g.fillStyle = '#2a2a2a'; g.fillRect(11, 11, 10, 10); g.fillStyle = '#444'; for (let i = 12; i < 21; i += 2) g.fillRect(i, 11, 1, 10); } g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 15, 32, 2); }, 500 + v);
  addTile('lot0', (g, r) => asph(g, r), 600);
  addTile('lot1', (g, r) => { asph(g, r); g.fillStyle = '#dcdcd4'; g.fillRect(0, 0, 1, 32); g.fillRect(16, 0, 1, 18); g.fillStyle = '#e3b21f'; g.fillRect(4, 28, 8, 2); g.fillRect(20, 28, 8, 2); }, 601);
  addTile('bld', (g, r) => { g.fillStyle = '#222'; g.fillRect(0, 0, 32, 32); }, 700);
  for (let v = 0; v < 2; v++) addTile('dock' + v, (g, r) => { g.fillStyle = '#7a5532'; g.fillRect(0, 0, 32, 32); for (let y = 0; y < 32; y += 6) { const t = r(); g.fillStyle = t < .5 ? '#835c37' : '#6f4b2a'; g.fillRect(0, y, 32, 5); g.fillStyle = '#4f331b'; g.fillRect(0, y + 5, 32, 1); g.fillRect((r() * 32) | 0, y, 1, 5); } for (let i = 0; i < 40; i++) { g.fillStyle = r() < .5 ? 'rgba(255,255,255,.06)' : 'rgba(0,0,0,.1)'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 3, 1); } if (v) { g.fillStyle = '#222'; g.fillRect(4, 4, 2, 2); g.fillRect(26, 26, 2, 2); } }, 800 + v);
  addTile('path', (g, r) => { g.fillStyle = '#b39c74'; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 180; i++) { const t = r(); g.fillStyle = t < .4 ? '#a68f68' : t < .8 ? '#c2ac84' : '#8f7a55'; g.fillRect(r() * 32 | 0, r() * 32 | 0, 1 + (r() < .2 ? 1 : 0), 1); } }, 900);
  addTile('sand', (g, r) => speckle(g, r, '#d8c48c', ['#cdb87f', '#e2cf99'], 120), 950);
  for (let f = 0; f < 3; f++) addTile('water' + f, (g, r) => { const gr = g.createLinearGradient(0, 0, 32, 32); gr.addColorStop(0, '#1b4d78'); gr.addColorStop(1, '#173f66'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); for (let i = 0; i < 7; i++) { const y = (i * 5 + f * 2) % 32, x = (i * 11 + f * 4) % 32; g.fillStyle = 'rgba(120,180,230,.35)'; g.fillRect(x, y, 5, 1); g.fillStyle = 'rgba(200,230,255,.25)'; g.fillRect((x + 16) % 32, (y + 3) % 32, 3, 1); } }, 1000 + f);
  addTile('shore', (g, r) => { g.fillStyle = '#1d4e7a'; g.fillRect(0, 0, 32, 32); g.fillStyle = '#6d6d6d'; g.fillRect(0, 0, 32, 4); g.fillStyle = '#4a4a4a'; g.fillRect(0, 4, 32, 2); }, 1100);
}

// wall textures: 16px per tile column, 16px per floor, ground floor at row 0
const WALLS = [];
function buildWalls() {
  const styles = [
    { k: 'glass', base: '#2e4a5e', win: '#7fc4e8', win2: '#5aa0c8', frame: '#1e3140' },
    { k: 'glass', base: '#3c3c48', win: '#9ab8d8', win2: '#6888a8', frame: '#25252e' },
    { k: 'glass', base: '#3d5a40', win: '#a8e0c0', win2: '#70b090', frame: '#24382a' },
    { k: 'brick', base: '#8a3b2a', win: '#2b3a4a', win2: '#e8d08a', frame: '#d8cfc0' },
    { k: 'brick', base: '#6e4a36', win: '#22303c', win2: '#e8c070', frame: '#c8bca8' },
    { k: 'concrete', base: '#8a8a86', win: '#2b3a4a', win2: '#c8d8e8', frame: '#6a6a66' },
    { k: 'concrete', base: '#a09682', win: '#33414e', win2: '#d0c090', frame: '#7d7464' },
    { k: 'stucco', base: '#d9b38c', win: '#3a4a5a', win2: '#f0e0a0', frame: '#f4ede0' },
    { k: 'stucco', base: '#9fc6c0', win: '#2c3e50', win2: '#f8f0c0', frame: '#eef' },
    { k: 'stucco', base: '#e3a5b5', win: '#2c3e50', win2: '#fff3b0', frame: '#fff' },
    { k: 'ware', base: '#6c7a85', win: '#2b3540', win2: '#2b3540', frame: '#556' },
    { k: 'ware', base: '#8b6f47', win: '#3a3020', win2: '#3a3020', frame: '#6b5537' },
    { k: 'house', base: '#c9b18a', win: '#34495e', win2: '#f5e6a8', frame: '#fff' },
    { k: 'house', base: '#8fa9c6', win: '#34495e', win2: '#f5e6a8', frame: '#fff' },
    { k: 'house', base: '#9c2b23', win: '#3b1512', win2: '#f5e6a8', frame: '#f4ede0' },
    { k: 'ware', base: '#cfd4d8', win: '#34495e', win2: '#34495e', frame: '#889' },
  ];
  styles.forEach((s, i) => {
    const F = 10, c = mkCanvas(16, 16 * F), g = c.getContext('2d'), r = mulberry32(i * 99 + 5);
    g.fillStyle = s.base; g.fillRect(0, 0, 16, 16 * F);
    for (let f = 0; f < F; f++) {
      const y = f * 16;
      if (s.k === 'brick') { g.fillStyle = shade(s.base, .82); for (let yy = 0; yy < 16; yy += 3) g.fillRect(0, y + yy, 16, 1); }
      if (s.k === 'ware') { g.fillStyle = shade(s.base, .8); for (let x = 0; x < 16; x += 2) g.fillRect(x, y, 1, 16); if (f === 0) { g.fillStyle = s.win; g.fillRect(3, y + 2, 10, 13); g.fillStyle = shade(s.base, .6); for (let yy = 3; yy < 15; yy += 2) g.fillRect(3, y + yy, 10, 1); } else if (f % 2 === 1) { g.fillStyle = s.win; g.fillRect(2, y + 5, 12, 3); } continue; }
      if (s.k === 'glass') { g.fillStyle = s.frame; g.fillRect(0, y, 16, 2); g.fillStyle = r() < .3 ? s.win2 : s.win; g.fillRect(1, y + 3, 14, 12); g.fillStyle = s.frame; g.fillRect(8, y + 3, 1, 12); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(2, y + 4, 3, 5); continue; }
      if (f === 0 && (s.k === 'stucco' || s.k === 'brick' || s.k === 'concrete')) { g.fillStyle = shade(s.base, .7); g.fillRect(0, y, 16, 2); g.fillStyle = s.win; g.fillRect(2, y + 3, 12, 10); g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(3, y + 4, 4, 4); g.fillStyle = s.frame; g.fillRect(1, y + 13, 14, 2); continue; }
      const lit = r() < .25; g.fillStyle = s.frame; g.fillRect(3, y + 3, 10, 10); g.fillStyle = lit ? s.win2 : s.win; g.fillRect(4, y + 4, 8, 8); g.fillStyle = s.frame; g.fillRect(8, y + 4, 1, 8); g.fillRect(4, y + 8, 8, 1);
    }
    WALLS.push({ c, k: s.k, base: s.base });
  });
}
// door texture (one tile x one floor)
function doorTex(col, awn) {
  const c = mkCanvas(16, 16), g = c.getContext('2d');
  g.fillStyle = '#3a2a1a'; g.fillRect(4, 1, 8, 13); g.fillStyle = '#6b4a2a'; g.fillRect(5, 2, 6, 12); g.fillStyle = '#e8c070'; g.fillRect(9, 8, 1, 1);
  if (awn) { g.fillStyle = col; g.fillRect(1, 12, 14, 4); g.fillStyle = 'rgba(255,255,255,.6)'; for (let x = 1; x < 15; x += 4) g.fillRect(x, 12, 2, 4); }
  return c;
}
function garageTex() { const c = mkCanvas(16, 16), g = c.getContext('2d'); g.fillStyle = '#555'; g.fillRect(0, 0, 16, 16); g.fillStyle = '#888'; for (let y = 1; y < 15; y += 2) g.fillRect(1, y, 14, 1); g.fillStyle = '#f2c230'; g.fillRect(0, 14, 16, 2); return c; }

// weapon icon drawing (x,y = center, s = scale)
function drawWeaponIcon(g, id, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = col || '#fff'; g.strokeStyle = col || '#fff'; g.lineWidth = 1.5;
  switch (id) {
    case 'fist': g.beginPath(); g.arc(0, 0, 6, 0, TAU); g.fill(); g.fillStyle = 'rgba(0,0,0,.4)'; for (let i = -1; i < 2; i++) g.fillRect(i * 3 - 1, -6, 1, 5); break;
    case 'pistol': g.fillRect(-8, -4, 14, 4); g.fillRect(-7, 0, 4, 7); break;
    case 'uzi': g.fillRect(-9, -4, 17, 4); g.fillRect(-4, 0, 4, 8); g.fillRect(2, 0, 2, 5); break;
    case 'shotgun': g.fillRect(-11, -3, 22, 3); g.fillRect(-11, 0, 7, 4); g.fillRect(0, 0, 5, 2); break;
    case 'molotov': g.fillRect(-3, -2, 6, 9); g.fillRect(-1.5, -6, 3, 4); g.fillStyle = '#ff8c1a'; g.beginPath(); g.moveTo(0, -12); g.lineTo(3, -6); g.lineTo(-3, -6); g.fill(); break;
    case 'rifle': g.fillRect(-12, -3, 24, 3); g.fillRect(-12, 0, 6, 4); g.fillRect(-2, 0, 3, 7); g.fillRect(4, 0, 2, 3); break;
    case 'bolt': g.fillRect(-13, -2.5, 27, 2.5); g.fillRect(-13, 0, 7, 3.5); g.fillRect(-1, -4.5, 3, 2); g.fillRect(-3, 0, 2, 3); break;
    case 'sniper': g.fillRect(-14, -2, 30, 2); g.fillRect(-14, 0, 7, 4); g.fillRect(-4, -6, 9, 3); g.fillRect(-3, 0, 2, 3); g.fillRect(8, 0, 1, 4); g.fillRect(11, 0, 1, 4); break;
    case 'knife': g.beginPath(); g.moveTo(-2, -2); g.lineTo(11, -1); g.lineTo(6, 2); g.lineTo(-2, 2); g.fill(); g.fillRect(-10, -2, 7, 4); g.fillRect(-3, -4, 1.6, 8); break;
    case 'rocket': g.fillRect(-11, -3, 20, 5); g.fillRect(-4, 2, 3, 5); g.beginPath(); g.moveTo(9, -4); g.lineTo(13, -.5); g.lineTo(9, 3); g.fill(); break;
    case 'health': g.fillStyle = '#e74c3c'; g.fillRect(-7, -2.5, 14, 5); g.fillRect(-2.5, -7, 5, 14); break;
    case 'armor': g.fillStyle = '#5dade2'; g.beginPath(); g.moveTo(0, -8); g.lineTo(7, -5); g.lineTo(6, 3); g.lineTo(0, 8); g.lineTo(-6, 3); g.lineTo(-7, -5); g.fill(); break;
    case 'cash': g.fillStyle = '#2ecc71'; g.fillRect(-8, -5, 16, 10); g.fillStyle = '#145a32'; g.font = 'bold 9px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 0, 1); break;
    case 'package': g.fillStyle = '#c69c6d'; g.fillRect(-7, -6, 14, 12); g.fillStyle = '#7b5a35'; g.fillRect(-1, -6, 2, 12); g.fillRect(-7, -1, 14, 2); break;
  }
  g.restore();
}
