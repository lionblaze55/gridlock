// ================= MOTORCYCLES II (models + parts) · GARAGE SPACE BY PROPERTY · CHOP SHOP STREET PRICES · RIDERS STEER ROUND SIDEWALK CLUTTER =================
// ---------- new bikes ----------
Object.assign(CAR_TYPES, {
  cruiser: { name: 'Road Baron', custom: 1, two: 1, rider: 1, L: 24, W: 9, max: 700, acc: 560, steer: 2.9, grip: 8.6, hp: 65, mass: .55, off: .2, eb: 21, wl: 7, wt: 3.4, seat: 8, bar: 16.5, cols: ['#111111', '#7b1e1e', '#1a3a5a', '#d4af37', '#eeeeee', '#2e4d2e'] },
  chopper: { name: 'Outlaw', custom: 1, two: 1, rider: 1, nohelm: 1, L: 28, W: 9, max: 680, acc: 600, steer: 2.4, grip: 8, hp: 55, mass: .5, off: .1, eb: 19, wl: 6.6, wt: 2.4, seat: 7.5, bar: 17.5, cols: ['#111111', '#b71c1c', '#ff6f00', '#6a1b9a', '#cfd8dc'] },
  supermoto: { name: 'Hooligan', custom: 1, two: 1, rider: 1, L: 20, W: 8, max: 740, acc: 790, steer: 3.8, grip: 10.2, hp: 45, mass: .36, off: .6, eb: 62, wl: 6, wt: 2.8, seat: 7.2, bar: 13.8, cols: ['#ff6d00', '#f4f4f4', '#d50000', '#1565c0', '#c6ff00'] },
  touring: { name: 'Interstate', custom: 1, two: 1, rider: 1, L: 26, W: 11, max: 730, acc: 520, steer: 2.6, grip: 9, hp: 85, mass: .75, off: .2, eb: 27, wl: 7, wt: 3.4, seat: 9, bar: 17, cols: ['#5d4037', '#212121', '#b0bec5', '#0d47a1', '#7b1e1e'] },
  cafe: { name: 'Ton-Up', custom: 1, two: 1, rider: 1, L: 21, W: 8, max: 770, acc: 690, steer: 3.4, grip: 9.6, hp: 45, mass: .4, off: .15, eb: 42, wl: 6.4, wt: 2.6, seat: 7.6, bar: 15.2, cols: ['#2e7d32', '#e0e0e0', '#111111', '#b71c1c', '#c9a227'] },
  hyperbike: { name: 'Viper R', custom: 1, two: 1, rider: 1, L: 22, W: 8.5, max: 1010, acc: 960, steer: 3.3, grip: 10.6, hp: 45, mass: .42, off: .05, eb: 64, wl: 6, wt: 3, seat: 7.6, bar: 15, cols: ['#111111', '#00e676', '#ff1744', '#2962ff', '#eeeeee'] },
});
TRAFFIC_MIX.push('cruiser', 'cruiser', 'touring', 'cafe', 'hyperbike', 'supermoto'); RTRAFFIC.push('cruiser', 'chopper', 'supermoto');
PARK_MIX.push('cruiser', 'chopper', 'cafe', 'supermoto', 'touring', 'hyperbike');
Object.assign(TRUNKCAP, { cruiser: 8, chopper: 4, supermoto: 4, touring: 30, cafe: 4, hyperbike: 4 });
Object.assign(CARVAL, { cruiser: 1800, chopper: 2200, supermoto: 1100, touring: 2000, cafe: 1500, hyperbike: 3200 });
DEALER_LAND.splice(DEALER_LAND.indexOf('sportbike') + 1, 0, 'cafe', 'supermoto', 'cruiser', 'touring', 'chopper', 'hyperbike');
MK_POOL.push('cruiser', 'chopper', 'cafe', 'supermoto', 'touring', 'hyperbike');
const MOTO_NEW = new Set(['cruiser', 'chopper', 'supermoto', 'touring', 'cafe', 'hyperbike']);
// ---------- bike parts ----------
Object.assign(MODOPTS, {
  mfr: { n: 'Fairing', o: [['Stock', 0], ['Naked — stripped down', 300], ['Race fairing', 1400], ['Touring screen', 900]] },
  mbr: { n: 'Handlebars', o: [['Stock', 0], ['Clip-ons', 350], ['Ape hangers', 600], ['Drag bars', 400]] },
  mpp: { n: 'Pipes', o: [['Stock', 0], ['Carbon slip-on', 800], ['Twin shotguns', 1100], ['Upswept dual', 1300]] },
  mst: { n: 'Seat', o: [['Stock', 0], ['Solo race cowl', 450], ['Brown leather', 300], ['Sissy bar & pad', 500]] },
  mtk: { n: 'Tank art', o: [['None', 0], ['Racing stripe', 250], ['Flames', 500], ['Checker', 350], ['Pinstripe', 400]] },
  mlt: { n: 'Lights', o: [['Stock', 0], ['Twin projectors', 600], ['LED halo', 700], ['Spotlights', 500]] },
  mbg: { n: 'Luggage', o: [['None', 0], ['Leather saddlebags', 600], ['Hard cases', 1100]] },
});
Object.assign(MODDESC, { mfr: 'Race fairings cut through the air for more top speed. Naked is lighter and punchier. A touring screen soaks up hits.', mbr: 'Clip-ons sharpen the steering. Ape hangers look outrageous but turn slower. Drag bars help launches.', mpp: 'Louder pipes free up power — and everyone hears you coming.', mst: 'Purely for looks.', mtk: 'Paint on the tank in your second color.', mlt: 'Headlight style.', mbg: 'Bags and cases add a little armor.' });
const MOTOK = ['mfr', 'mbr', 'mpp', 'mst', 'mtk', 'mlt', 'mbg'];
function garTabs(c) { const t = garTabs0(c).slice(); if (c.d.two && !c.d.pedal) t.splice(1, 0, ['moto', 'Bike parts']); return t; }
function calcSt(d, m) { const s = calcSt0(d, m); { const rm = s.max / d.max, ra = s.acc / d.acc; if (rm > 1.35) s.max = d.max * (1.35 + (rm - 1.35) * .4); if (ra > 1.8) s.acc = d.acc * (1.8 + (ra - 1.8) * .4); } if (!m || !d.two || d.pedal) return s;
  const f = m.mfr | 0, b = m.mbr | 0, p = m.mpp | 0, g = m.mbg | 0;
  if (f === 1) { s.acc *= 1.04; s.max *= .98; } if (f === 2) { s.max *= 1.06; } if (f === 3) { s.max *= .98; s.hp *= 1.12; }
  if (b === 1) { s.steer *= 1.07; s.grip *= 1.03; } if (b === 2) { s.steer *= .9; } if (b === 3) { s.acc *= 1.03; }
  s.acc *= [1, 1.04, 1.05, 1.06][p] || 1; if (p === 2) s.max *= 1.02; if (g) { s.hp *= g === 2 ? 1.12 : 1.06; s.acc *= .98; }
  return s; }
// ---------- drawing ----------
function drawCustomCar(g, type, col, L, Wd, wreck, fw, m) {
  if (type === 'skate') { const M = Wd / 2; g.fillStyle = '#111'; for (const x of [1.6, L - 3]) { g.fillRect(x, M - 2.6, 1.6, 1.2); g.fillRect(x, M + 1.4, 1.6, 1.2); } g.fillStyle = col; g.beginPath(); g.roundRect ? g.roundRect(0, M - 1.7, L, 3.4, 1.7) : g.rect(0, M - 1.7, L, 3.4); g.fill(); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(1.5, M - 1, L - 3, 2); g.fillStyle = '#ddd'; g.fillRect(2, M - .5, .8, 1); g.fillRect(L - 2.8, M - .5, .8, 1); return; }
  if (MOTO_NEW.has(type)) drawNewBike(g, type, col, L, Wd, wreck, fw); else drawCustomCar0(g, type, col, L, Wd, wreck, fw);
  const d = CAR_TYPES[type]; if (m && d.two && !d.pedal && !wreck) drawMotoMods(g, d, col, L, Wd, m);
}
function drawNewBike(g, type, col, L, Wd, wreck, fw) {
  const d = CAR_TYPES[type], m = Wd / 2, dk = shade(col, .55), lt = shade(col, 1.35), lamp = '#fffbd0', chrome = wreck ? '#333' : '#d5dadf';
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); };
  const wheel = (x, l, t, knob) => { g.fillStyle = '#0b0b0b'; rr(x, m - t / 2, l, t, Math.min(1, t / 2)); g.fillStyle = knob ? '#3a3a3a' : '#262626'; for (let i = .8; i < l - .4; i += knob ? 1.3 : 1.6) g.fillRect(x + i, m - t / 2, .6, t); };
  const F = frontWheelSpec(d, {}), front = knob => { if (fw) wheel(F.x - F.wl / 2, F.wl, F.wt, knob); };
  const bars = (x, half, c2) => { g.fillStyle = c2 || '#9aa0a6'; g.fillRect(x, m - half, .9, half * 2); g.fillStyle = '#111'; g.fillRect(x - .3, m - half - .3, 1.5, 1.6); g.fillRect(x - .3, m + half - 1.3, 1.5, 1.6); };
  const tank = (x, w, h) => { g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(x, m, w + .4, h + .4, 0, 0, TAU); g.fill(); const gr = g.createLinearGradient(0, m - h, 0, m + h); gr.addColorStop(0, dk); gr.addColorStop(.35, lt); gr.addColorStop(.65, col); gr.addColorStop(1, dk); g.fillStyle = gr; g.beginPath(); g.ellipse(x, m, w, h, 0, 0, TAU); g.fill(); };
  switch (type) {
    case 'cruiser': {
      wheel(-.6, 7.2, 3.6); front(); g.fillStyle = dk; rr(1, m - 2.2, 6, 4.4, 1.6);
      g.fillStyle = chrome; g.fillRect(-1.2, m + 2.6, L * .5, 1.1); g.fillRect(-1.2, m + 3.9, L * .44, 1.1); g.fillStyle = '#222'; g.fillRect(4, m - 1.4, L - 12, 2.8);
      g.fillStyle = chrome; g.beginPath(); g.arc(L * .44, m - 2.6, 1.9, 0, TAU); g.arc(L * .44, m + 2.6, 1.9, 0, TAU); g.fill(); g.fillStyle = '#7c8389'; g.beginPath(); g.arc(L * .44, m - 2.6, .9, 0, TAU); g.arc(L * .44, m + 2.6, .9, 0, TAU); g.fill();
      tank(L * .58, 3.6, 2.6); g.fillStyle = wreck ? '#111' : '#2b1a12'; rr(L * .2, m - 2.3, 5.4, 4.6, 2); g.fillStyle = '#3e2723'; rr(L * .14, m - 1.6, 2.6, 3.2, 1.2);
      g.fillStyle = col; rr(L - 6.6, m - 1.6, 4, 3.2, 1.4); g.strokeStyle = chrome; g.lineWidth = .8; g.beginPath(); g.moveTo(L * .74, m - 4.8); g.quadraticCurveTo(L * .7, m, L * .74, m + 4.8); g.stroke(); g.fillStyle = '#111'; g.fillRect(L * .73, m - 5.2, 1.6, 1.4); g.fillRect(L * .73, m + 3.8, 1.6, 1.4);
      if (!wreck) { g.fillStyle = lamp; g.beginPath(); g.arc(L - 3.6, m, 1.5, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(.4, m - .9, .9, 1.8); } break;
    }
    case 'chopper': {
      wheel(-.6, 7, 3.4); front(); g.fillStyle = chrome; g.fillRect(L * .62, m - 1.4, L * .34, .7); g.fillRect(L * .62, m + .7, L * .34, .7);
      g.fillStyle = chrome; g.fillRect(-1.4, m + 2.4, L * .5, 1); g.fillRect(-1.4, m - 3.4, L * .5, 1); g.fillStyle = '#1c1c1c'; g.fillRect(3, m - 1, L * .6, 2);
      g.fillStyle = chrome; g.beginPath(); g.arc(L * .38, m - 2.2, 1.7, 0, TAU); g.arc(L * .38, m + 2.2, 1.7, 0, TAU); g.fill();
      tank(L * .52, 2.6, 1.7); g.fillStyle = wreck ? '#111' : '#1a1a1a'; rr(L * .2, m - 1.7, 4.2, 3.4, 1.6); g.fillStyle = chrome; g.fillRect(.6, m - 2.6, .8, 5.2); g.fillRect(.6, m - 2.6, 2.4, .8); g.fillRect(.6, m + 1.8, 2.4, .8);
      g.strokeStyle = chrome; g.lineWidth = .8; g.beginPath(); g.moveTo(L * .62, m - 5.4); g.lineTo(L * .58, m - 4.6); g.lineTo(L * .6, m); g.lineTo(L * .58, m + 4.6); g.lineTo(L * .62, m + 5.4); g.stroke(); g.fillStyle = '#111'; g.fillRect(L * .61, m - 5.9, 1.6, 1.4); g.fillRect(L * .61, m + 4.5, 1.6, 1.4);
      if (!wreck) { g.fillStyle = lamp; g.beginPath(); g.arc(L * .66, m, 1.1, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(.2, m - .7, .8, 1.4); } break;
    }
    case 'supermoto': {
      wheel(-.5, 6, 3); front(); g.fillStyle = '#8a8f96'; g.fillRect(3, m - .5, 5, 1); g.fillStyle = '#cfd4da'; g.fillRect(2.6, m + 1.4, 6.4, 1.2);
      g.fillStyle = dk; rr(4.4, m - 1.6, L - 10, 3.2, 1); g.fillStyle = col; rr(L * .4, m - 2.1, 5, 4.2, 1.4); g.fillStyle = '#f4f4f4'; g.fillRect(L * .44, m - 2.1, 1, 4.2);
      g.fillStyle = '#141414'; rr(3.4, m - 1.1, 6.6, 2.2, 1); g.fillStyle = col; rr(1, m - 1, 3, 2, .8); g.fillStyle = '#f4f4f4'; rr(L - 6.4, m - 1.3, 2.4, 2.6, .6); g.fillStyle = '#111'; g.font = 'bold 1.8px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('7', L - 5.2, m + .1);
      bars(L * .68, 4); if (!wreck) { g.fillStyle = lamp; g.fillRect(L - 4.2, m - .7, .8, 1.4); g.fillStyle = '#d61f1f'; g.fillRect(.4, m - .6, .7, 1.2); } break;
    }
    case 'touring': {
      wheel(-.4, 7, 3.4); front(); g.fillStyle = dk; rr(.4, .2, 7.6, 2.8, 1); rr(.4, Wd - 3, 7.6, 2.8, 1); g.fillStyle = chrome; g.fillRect(.8, 1.3, 6.8, .4); g.fillRect(.8, Wd - 1.7, 6.8, .4);
      g.fillStyle = dk; rr(-.8, m - 2.8, 4.2, 5.6, 1.4); g.fillStyle = '#d61f1f'; if (!wreck) g.fillRect(-.8, m - 2, .6, 4);
      g.fillStyle = '#1c1c1c'; g.fillRect(4, m - 2, L - 12, 4); tank(L * .55, 3.8, 3); g.fillStyle = wreck ? '#111' : '#2b2b2b'; rr(L * .22, m - 2.8, 6.4, 5.6, 2.2); g.fillStyle = '#333'; rr(L * .17, m - 2.2, 2, 4.4, 1);
      g.fillStyle = col; g.beginPath(); g.moveTo(L * .7, m - 5); g.lineTo(L * .86, m - 3.4); g.lineTo(L - 1.6, m - 1.6); g.lineTo(L - 1.6, m + 1.6); g.lineTo(L * .86, m + 3.4); g.lineTo(L * .7, m + 5); g.closePath(); g.fill(); g.fillStyle = 'rgba(160,200,230,.55)'; g.beginPath(); g.moveTo(L * .7, m - 3.6); g.lineTo(L * .8, m - 2.6); g.lineTo(L * .8, m + 2.6); g.lineTo(L * .7, m + 3.6); g.fill();
      if (!wreck) { g.fillStyle = lamp; g.fillRect(L - 2.4, m - 1.6, .9, 1.2); g.fillRect(L - 2.4, m + .4, .9, 1.2); } break;
    }
    case 'cafe': {
      wheel(-.5, 6.4, 2.6); front(); g.fillStyle = chrome; g.fillRect(-1, m + 1.8, L * .5, 1); g.fillStyle = '#1c1c1c'; g.fillRect(4, m - 1.2, L - 10, 2.4);
      g.fillStyle = chrome; rr(L * .38, m - 2.6, 3, 5.2, 1.2); tank(L * .56, 3.2, 2.2); g.fillStyle = shade(col, .5); g.fillRect(L * .56 - 3, m - .3, 6.4, .6);
      g.fillStyle = '#3e2723'; rr(L * .24, m - 1.6, 3.6, 3.2, 1.2); g.fillStyle = col; rr(L * .12, m - 1.8, 2.6, 3.6, 1.4);
      g.fillStyle = '#9aa0a6'; g.fillRect(L * .7, m - 3.2, .8, 1.8); g.fillRect(L * .7, m + 1.4, .8, 1.8); g.fillStyle = '#111'; g.fillRect(L * .7 - .3, m - 3.6, 1.4, 1.2); g.fillRect(L * .7 - .3, m + 2.4, 1.4, 1.2);
      if (!wreck) { g.fillStyle = chrome; g.beginPath(); g.arc(L - 4, m, 1.7, 0, TAU); g.fill(); g.fillStyle = lamp; g.beginPath(); g.arc(L - 3.9, m, 1.2, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(.6, m - .6, .7, 1.2); } break;
    }
    case 'hyperbike': {
      wheel(-.5, 6.2, 3.2); front(); g.fillStyle = '#8a8f96'; g.fillRect(3, m - .6, 5, 1.2);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.moveTo(2.2, m); g.lineTo(5.6, m - 2.8); g.lineTo(L * .62, m - 4); g.lineTo(L - 2.8, m - 1.2); g.lineTo(L - 2.8, m + 1.2); g.lineTo(L * .62, m + 4); g.lineTo(5.6, m + 2.8); g.fill();
      g.fillStyle = col; g.beginPath(); g.moveTo(2.6, m); g.lineTo(5.8, m - 2.4); g.lineTo(L * .62, m - 3.6); g.lineTo(L - 3.2, m - 1); g.lineTo(L - 3.2, m + 1); g.lineTo(L * .62, m + 3.6); g.lineTo(5.8, m + 2.4); g.fill();
      g.fillStyle = '#111'; g.beginPath(); g.moveTo(L * .7, m - 3.4); g.lineTo(L * .82, m - 4.6); g.lineTo(L * .8, m - 3); g.fill(); g.beginPath(); g.moveTo(L * .7, m + 3.4); g.lineTo(L * .82, m + 4.6); g.lineTo(L * .8, m + 3); g.fill();
      g.fillStyle = lt; g.beginPath(); g.ellipse(L * .5, m, 3, 1.8, 0, 0, TAU); g.fill(); g.fillStyle = '#141414'; rr(4.8, m - 1.5, 4.8, 3, 1); g.fillStyle = '#0d1520'; g.beginPath(); g.moveTo(L * .66, m - 2.2); g.lineTo(L * .8, m - 1); g.lineTo(L * .8, m + 1); g.lineTo(L * .66, m + 2.2); g.fill();
      g.fillStyle = '#b9bec4'; g.fillRect(1.6, m - 2.2, 3, .8); g.fillRect(1.6, m + 1.4, 3, .8); g.fillStyle = '#222'; g.fillRect(L * .68, m - 4.2, 1, 1.9); g.fillRect(L * .68, m + 2.3, 1, 1.9);
      if (!wreck) { g.fillStyle = '#e8f6ff'; g.fillRect(L - 4, m - 1, .8, .7); g.fillRect(L - 4, m + .3, .8, .7); g.fillStyle = '#ff1744'; g.fillRect(2.4, m - 1, .7, 2); } break;
    }
  }
}
function drawMotoMods(g, d, col, L, Wd, m) {
  const M = Wd / 2, sec = m.s || shade(col, .4), chrome = '#d5dadf', bx = (d.bar || L * .7) - .6;
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); };
  // tank art
  if (m.mtk) { g.save(); g.beginPath(); g.ellipse(L * .55, M, 3, 2, 0, 0, TAU); g.clip(); const x0 = L * .55 - 3.2;
    if (m.mtk === 1) { g.fillStyle = sec; g.fillRect(x0, M - .6, 6.4, 1.2); }
    if (m.mtk === 2) { const fg = g.createLinearGradient(x0 + 6.4, 0, x0, 0); fg.addColorStop(0, '#ffd400'); fg.addColorStop(.5, '#ff6a00'); fg.addColorStop(1, 'rgba(255,0,0,0)'); g.fillStyle = fg; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x0 + 6.4, M + s * .2); for (let i = 0; i <= 4; i++) g.lineTo(x0 + 6.4 - i * 1.5, M + s * (i % 2 ? 2 : 1)); g.lineTo(x0, M + s * .2); g.fill(); } }
    if (m.mtk === 3) for (let x = x0; x < x0 + 6.4; x += .8) for (let y = M - 2; y < M + 2; y += .8) { g.fillStyle = (((x - x0) / .8 | 0) + ((y - M + 2) / .8 | 0)) % 2 ? '#111' : '#f4f4f4'; g.fillRect(x, y, .8, .8); }
    if (m.mtk === 4) { g.strokeStyle = sec; g.lineWidth = .3; g.beginPath(); g.ellipse(L * .55, M, 2.2, 1.3, 0, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x0 + 1, M); g.lineTo(x0 + 5.4, M); g.stroke(); }
    g.restore(); }
  // fairing
  if (m.mfr === 2) { g.fillStyle = col; g.beginPath(); g.moveTo(L * .6, M - 3.4); g.lineTo(L - 2.6, M - 1.2); g.lineTo(L - 2.6, M + 1.2); g.lineTo(L * .6, M + 3.4); g.closePath(); g.fill(); g.fillStyle = sec; g.fillRect(L * .62, M - 3.1, L * .2, .6); g.fillRect(L * .62, M + 2.5, L * .2, .6); g.fillStyle = '#0d1520'; g.beginPath(); g.moveTo(L * .64, M - 2); g.lineTo(L * .76, M - 1); g.lineTo(L * .76, M + 1); g.lineTo(L * .64, M + 2); g.fill(); }
  if (m.mfr === 3) { g.fillStyle = shade(col, .8); g.beginPath(); g.moveTo(L * .66, M - 4.6); g.lineTo(L * .84, M - 3.2); g.lineTo(L * .84, M + 3.2); g.lineTo(L * .66, M + 4.6); g.closePath(); g.fill(); g.fillStyle = 'rgba(170,210,240,.6)'; g.fillRect(L * .68, M - 3.4, 1.4, 6.8); }
  if (m.mfr === 1) { g.fillStyle = '#5f6469'; g.fillRect(L * .5, M - 1.2, L * .2, 2.4); }
  // bars
  if (m.mbr) { g.save(); g.fillStyle = 'rgba(0,0,0,0)'; const hb = m.mbr === 2 ? 5.6 : m.mbr === 3 ? 4.6 : 3; g.strokeStyle = m.mbr === 2 ? chrome : '#9aa0a6'; g.lineWidth = .8;
    if (m.mbr === 1) { g.beginPath(); g.moveTo(bx - 1, M - 3); g.lineTo(bx - 2.2, M - 3.4); g.moveTo(bx - 1, M + 3); g.lineTo(bx - 2.2, M + 3.4); g.stroke(); }
    else { g.beginPath(); g.moveTo(bx, M - hb); g.lineTo(bx, M + hb); g.stroke(); if (m.mbr === 2) { g.beginPath(); g.moveTo(bx, M - hb); g.lineTo(bx - 2, M - hb - .4); g.moveTo(bx, M + hb); g.lineTo(bx - 2, M + hb + .4); g.stroke(); } }
    g.fillStyle = '#111'; const gx = m.mbr === 2 ? bx - 2.4 : m.mbr === 1 ? bx - 2.6 : bx - .3, gy = m.mbr === 1 ? 3.4 : hb; g.fillRect(gx, M - gy - .7, 1.5, 1.4); g.fillRect(gx, M + gy - .7, 1.5, 1.4); g.restore(); }
  // pipes
  if (m.mpp === 1) { g.fillStyle = '#212121'; rr(-1.8, M + 1.4, 4, 1.6, .7); g.fillStyle = '#555'; g.fillRect(-1.8, M + 1.7, .6, 1); }
  if (m.mpp === 2) { g.fillStyle = chrome; g.fillRect(-1.6, M + 2.2, L * .55, .9); g.fillRect(-2, M + 3.3, L * .52, .9); g.fillStyle = '#333'; g.fillRect(-2, M + 3.3, .5, .9); g.fillRect(-1.6, M + 2.2, .5, .9); }
  if (m.mpp === 3) { g.fillStyle = chrome; for (const s of [-1, 1]) { g.fillRect(-.6, M + s * 1.6 - .5, 5, 1); } g.fillStyle = '#222'; g.beginPath(); g.arc(-.6, M - 1.6, .6, 0, TAU); g.arc(-.6, M + 1.6, .6, 0, TAU); g.fill(); }
  // seat
  const sx = (d.seat || L * .38) - 3.2;
  if (m.mst === 1) { g.fillStyle = col; rr(sx - 2.6, M - 1.9, 3.2, 3.8, 1.6); g.fillStyle = sec; g.fillRect(sx - 2.2, M - .4, 2.4, .8); }
  if (m.mst === 2) { g.fillStyle = '#6d4c41'; rr(sx - .6, M - 2, 5.6, 4, 1.8); g.fillStyle = '#4e342e'; g.fillRect(sx, M - .2, 4.4, .4); }
  if (m.mst === 3) { g.fillStyle = chrome; g.fillRect(.6, M - 2.4, .8, 4.8); g.fillRect(.6, M - 2.4, 2.6, .7); g.fillRect(.6, M + 1.7, 2.6, .7); g.fillStyle = '#212121'; rr(-.2, M - 1.4, 1.4, 2.8, .6); }
  // luggage
  if (m.mbg) { const c2 = m.mbg === 1 ? '#5d4037' : '#263238', w = m.mbg === 1 ? 2.2 : 2.6; g.fillStyle = 'rgba(0,0,0,.4)'; rr(.2, M - 4.8 - .3, 6.8, w + .6, .9); rr(.2, M + 4.8 - w - .3, 6.8, w + .6, .9); g.fillStyle = c2; rr(.4, M - 4.8, 6.4, w, .8); rr(.4, M + 4.8 - w, 6.4, w, .8); g.fillStyle = m.mbg === 1 ? '#a1887f' : '#90a4ae'; g.fillRect(1.2, M - 4.8 + w / 2 - .2, 4.8, .4); g.fillRect(1.2, M + 4.8 - w / 2 - .2, 4.8, .4); }
  // lights
  if (m.mlt === 1) { g.fillStyle = '#e8f6ff'; g.beginPath(); g.arc(L - 3.4, M - .9, .8, 0, TAU); g.arc(L - 3.4, M + .9, .8, 0, TAU); g.fill(); }
  if (m.mlt === 2) { g.strokeStyle = '#80d8ff'; g.lineWidth = .5; g.beginPath(); g.arc(L - 3.6, M, 1.5, 0, TAU); g.stroke(); }
  if (m.mlt === 3) { g.fillStyle = '#333'; g.fillRect(L * .78, M - 3.4, 1.4, 1.4); g.fillRect(L * .78, M + 2, 1.4, 1.4); g.fillStyle = '#fff9c4'; g.fillRect(L * .78 + .9, M - 3.1, .6, .8); g.fillRect(L * .78 + .9, M + 2.3, .6, .8); }
}
// ---------- garage space grows with the property you own ----------
function garSlots() { const out = [['Your Apartment', 6]], L = G.save && G.save.life; if (!L || !L.own) return out;
  for (const id in L.own) { const b = W.buildings[id], r = b && b.realty; if (!r) continue; const n = r.kind === 'lab' ? 0 : r.kind === 'biz' || r.kind === 'club' ? 20 : (r.price || 0) >= (r.kind === 'home' ? 100000 : 150000) ? 10 : 6; if (n) out.push([r.name || b.name, n]); }
  return out; }
const garCap = () => Math.min(80, garSlots().reduce((s, a) => s + a[1], 0));
// ---------- chop shops: no limit, street prices, heat if you run too many ----------
function chopVal(c) { const listed = (G.chopList || []).includes(c.type), job = listed || !!c.missionCar || !!c.forChop, cond = clamp(c.hp / c.st.hp, .25, 1); return { listed, job, cond, val: r50(mktValue(c.type, c.mods, cond, 1) * (job ? .3 : .1)) }; }
function chopHeat() { const now = G.t; G.chopLog = (G.chopLog || []).filter(t => now - t < 300); const n = G.chopLog.length; G.chopLog.push(now); if (n >= 2) { crime(.7 + .5 * (n - 2), 'Running a chop operation'); G.heat = Math.max(G.heat, Math.min(4.05, 1.05 + (n - 2) * .9)); G.starFlash = 2; if (typeof markSeen === 'function') markSeen(); msg('Too many hot cars through the chop shop — somebody tipped off the cops.', '#ff6b6b'); } }
const chopWarn = () => { const n = (G.chopLog || []).filter(t => G.t - t < 300).length; return n >= 2 ? '\n⚠ Cops are watching this place — another one this soon brings heat.' : n === 1 ? '\nCareful: run too many through here in a short time and the cops notice.' : ''; };
// ---------- riders steer around sidewalk clutter instead of jamming on it ----------
function riderBlocked(x, y, me) { if (solidT(Math.floor(x / T), Math.floor(y / T))) return true; if (me) for (const q of G.peds) if (q !== me && !q.dead && Math.abs(q.x - x) < 14 && Math.abs(q.y - y) < 14) return true; for (const o of propsNear(x, y, 40)) if (o.solid && !o.dead && o.r > 12 && dist2(o.x, o.y, x, y) < (o.r + 10) * (o.r + 10)) return true; return false; }
function riderSteer(p, dt) {
  const sp = Math.hypot(p.mvx, p.mvy); if (sp < 30) { p.pinT = 0; return; }
  p.chkT = (p.chkT || 0) + dt; if (p.chkT > .5) { const mv = p.lx === undefined ? 99 : Math.hypot(p.x - p.lx, p.y - p.ly); p.lx = p.x; p.ly = p.y; p.pinT = mv < sp * p.chkT * .25 ? (p.pinT || 0) + p.chkT : 0; p.chkT = 0;
    if (p.pinT >= 1) { p.pinT = 0; if (p.state === 'walk' && p.ring) { p.dir = -(p.dir || 1); p.dodgeT = 0; } else p.ghostT = 1.2; } }
  if (p.ghostT > 0) p.ghostT -= dt; const ux = p.mvx / sp, uy = p.mvy / sp, rot = a => { const c = Math.cos(a), s = Math.sin(a); return [ux * c - uy * s, ux * s + uy * c]; };
  if (p.dodgeT > 0) { p.dodgeT -= dt; const [vx, vy] = rot(p.dodgeA); const k = .8; p.mvx = vx * sp * k; p.mvy = vy * sp * k; p.a = Math.atan2(vy, vx); return; }
  const look = 16 + sp * .14; if (!riderBlocked(p.x + ux * look, p.y + uy * look, p) && !riderBlocked(p.x + ux * look * .5, p.y + uy * look * .5, p)) return;
  const pref = p.dodgeS || (p.dodgeS = Math.random() < .5 ? 1 : -1);
  for (const a of [.55, .95, 1.35, 1.75]) for (const s of [pref, -pref]) { const [vx, vy] = rot(a * s); if (!riderBlocked(p.x + vx * look, p.y + vy * look) && !riderBlocked(p.x + vx * look * .5, p.y + vy * look * .5)) { p.dodgeA = a * s; p.dodgeT = .3 + a * .15; p.mvx = vx * sp * .8; p.mvy = vy * sp * .8; p.a = Math.atan2(vy, vx); return; } }
  p.mvx *= .3; p.mvy *= .3; p.dodgeS = -pref;
}
function updatePedMove(p, dt) { if (p.ride && !p.dead && !p.isPlayer && !G.scene && !p.car) riderSteer(p, dt); updatePedMoveW(p, dt); }
// riders slip past thin street furniture (lamps, hydrants, bins, meters) instead of jamming on it; big things still block
function riderPushBig(p) { if (p.ghostT > 0) return; for (const o of propsNear(p.x, p.y, 48)) { if (!o.solid || o.dead || o.r <= 12) continue; const dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy), m = o.r + p.r; if (d < m && d > .01) { p.x = o.x + dx / d * m; p.y = o.y + dy / d * m; } } }
