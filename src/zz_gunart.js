// ================= GUN ART v2: detailed side-view gun models =================
// Every gun has its own drawn model (no more shared silhouettes), with shaded metal, polymer and wood,
// and every attachment is drawn on it: optics, lasers (with beam in the preview), muzzle devices,
// magazines, barrel lengths, foregrips, bipods, stocks and finishes. Used by every gun tile, card and workbench preview.
const GART = (() => {
  let g = null, M = false, bb = null, OL = 1, SK = 0, BODY = '#3a3f47', BEAM = null, SEED = 1;
  const C = { poly: '#2c2f35', steel: '#3d424a', dark: '#1e2125', wood: '#8b5631', rubber: '#17191c', olive: '#5a653d', tan: '#a8915f', green: '#4c6a3a', blade: '#c3ccd3', brass: '#c9a23a', glass: 'rgba(150,200,130,.5)', cream: '#e6dfc6' };
  const ext = (x, y) => { if (x < bb[0]) bb[0] = x; if (y < bb[1]) bb[1] = y; if (x > bb[2]) bb[2] = x; if (y > bb[3]) bb[3] = y; };
  const colOf = m => m === 'body' ? BODY : m === 'frame' ? ([1, 4, 5, 6, 7].includes(SK) ? BODY : C.poly) : C[m] || m;
  function fillFor(m, y0, y1) { const c = colOf(m); if (c[0] !== '#') return c; const gr = g.createLinearGradient(0, y0, 0, y1), shiny = m === 'body' && (SK === 2 || SK === 3);
    if (shiny) { gr.addColorStop(0, shade(c, 1.7)); gr.addColorStop(.3, c); gr.addColorStop(.55, shade(c, .55)); gr.addColorStop(.78, shade(c, 1.15)); gr.addColorStop(1, shade(c, .5)); }
    else { gr.addColorStop(0, shade(c, 1.45)); gr.addColorStop(.38, c); gr.addColorStop(1, shade(c, .6)); } return gr; }
  const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
  function fin(build, mat, b, o) { if (M) { ext(b[0], b[1]); ext(b[2], b[3]); return; } build(); g.fillStyle = fillFor(mat, b[1], b[3]); g.fill();
    const camo = SK === 4 && (mat === 'body' || mat === 'frame'), wood = mat === 'wood';
    if (camo || wood) { g.save(); build(); g.clip(); SEED = 1 + Math.floor(Math.abs(b[0] * 31 + b[1] * 17)) % 9999;
      if (wood) { g.lineWidth = .45; for (let i = 0; i < 7; i++) { const y = b[1] + (i + .5) * (b[3] - b[1]) / 7 + (rnd() - .5) * 2; g.strokeStyle = i % 2 ? 'rgba(60,30,10,.32)' : 'rgba(255,220,170,.12)'; g.beginPath(); g.moveTo(b[0], y); g.bezierCurveTo(b[0] + (b[2] - b[0]) * .3, y + (rnd() - .5) * 4, b[0] + (b[2] - b[0]) * .7, y + (rnd() - .5) * 4, b[2], y + (rnd() - .5) * 3); g.stroke(); } }
      if (camo) for (let i = 0; i < 14; i++) { g.fillStyle = ['#2c3a20', '#7a7442', '#3e2f1e', '#55683a'][i % 4]; g.beginPath(); g.ellipse(b[0] + rnd() * (b[2] - b[0]), b[1] + rnd() * (b[3] - b[1]), 3 + rnd() * 6, 2 + rnd() * 3, rnd() * 3, 0, 6.283); g.fill(); }
      g.restore(); }
    if (!(o && o.no)) { build(); g.lineWidth = OL; g.strokeStyle = 'rgba(6,7,9,.92)'; g.stroke(); } }
  const pathPts = pts => () => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  function P(pts, mat, o) { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } fin(pathPts(pts), mat, [x0, y0, x1, y1], o); }
  function RR(x, y, w, h, r, mat, o) { if (w < 0) { x += w; w = -w; } r = Math.min(r || 0, w / 2, h / 2); fin(() => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }, mat, [x, y, x + w, y + h], o); }
  function Ci(x, y, r, mat, o) { fin(() => { g.beginPath(); g.arc(x, y, r, 0, 6.283); }, mat, [x - r, y - r, x + r, y + r], o); }
  function Ln(x1, y1, x2, y2, c, w, outline) { if (M) { ext(x1, y1); ext(x2, y2); return; } g.lineCap = 'round'; if (outline) { g.strokeStyle = 'rgba(6,7,9,.92)'; g.lineWidth = w + OL * 2; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); } g.strokeStyle = colOf(c); g.lineWidth = w; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.lineCap = 'butt'; }
  const HOLE = pts => { if (M) return; g.save(); g.globalCompositeOperation = 'destination-out'; pathPts(pts)(); g.fill(); g.restore(); pathPts(pts)(); g.lineWidth = OL * .8; g.strokeStyle = 'rgba(6,7,9,.9)'; g.stroke(); };
  const Hi = (x1, x2, y, a) => { if (M) return; g.fillStyle = 'rgba(255,255,255,' + (a || .22) + ')'; g.fillRect(x1, y, x2 - x1, .9); };
  const Gv = (x1, x2, y1, y2, n, c) => { if (M) return; g.fillStyle = c || 'rgba(0,0,0,.42)'; const st = (x2 - x1) / Math.max(1, n - 1); for (let i = 0; i < n; i++) g.fillRect(x1 + i * st - .45, y1, .9, y2 - y1); };
  const Tex = (x1, y1, x2, y2, st) => { if (M) return; g.fillStyle = 'rgba(0,0,0,.33)'; st = st || 2.2; for (let y = y1; y < y2; y += st) for (let x = x1 + ((y / st) % 2) * st / 2; x < x2; x += st) g.fillRect(x, y, .7, .7); };
  const Dot = (x, y, r, c) => { if (M) return; g.fillStyle = colOf(c || 'steel'); g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = OL * .6; g.stroke(); };
  const rail = (x1, x2, y) => { RR(x1, y - 2.6, x2 - x1, 2.6, .4, 'dark'); if (!M) { g.fillStyle = 'rgba(0,0,0,.65)'; for (let x = x1 + 1.5; x < x2 - 1.5; x += 3) g.fillRect(x, y - 2.6, 1.3, 1.5); } };
  const trig = (x, y) => P([[x, y], [x + 2.4, y], [x + 1.6, y + 3.5], [x + .3, y + 6.5], [x - .8, y + 6]], 'dark');
  const guard = (pts, hole, mat) => { P(pts, mat || 'frame'); HOLE(hole); };
  const pgrip = (x, y, len, mat) => { len = len || 22; P([[x, y], [x + 10, y], [x + 8.5, y + 5], [x + 4, y + len], [x - 5.5, y + len], [x - 3, y + 5]], mat || 'frame'); if (mat !== 'wood') Tex(x - 2, y + 6, x + 6, y + len - 2); };
  const stockM4 = (x, y) => { RR(x - 32, y, 33, 6.5, 2.5, 'dark'); P([[x - 22, y - 3], [x - 46, y - 2], [x - 50, y], [x - 50, y + 22], [x - 45, y + 23], [x - 36, y + 14], [x - 22, y + 9]], 'frame'); RR(x - 53, y - 2.5, 4, 26.5, 1.2, 'rubber'); Ln(x - 30, y + 8.5, x - 24, y + 11, 'dark', 1.2); Hi(x - 46, x - 24, y - 1.6); };
  const stockTac = (x, y) => { P([[x, y - 2], [x - 44, y - 3], [x - 52, y - 1], [x - 52, y + 24], [x - 46, y + 25], [x - 16, y + 13], [x, y + 13]], 'frame'); HOLE([[x - 38, y + 6], [x - 20, y + 6], [x - 30, y + 14], [x - 40, y + 17]]); RR(x - 55, y - 1.5, 4, 26.5, 1.2, 'rubber'); Hi(x - 44, x - 4, y - 1.4); };
  const endCap = (x, y, h) => RR(x - 4, y, 5, h || 8, 2, 'dark');
  const hider = (x, y, r, u) => { RR(x, y - r - .8, 7 * u, 2 * r + 1.6, .8, 'dark'); Gv(x + 2 * u, x + 6 * u, y - r - .8, y - r + 1.6, 3, 'rgba(255,255,255,.12)'); };
  function curvedMag(x, y, len, w, curve, mat) { const fr = [], rr = []; for (let i = 0; i <= 8; i++) { const t = i / 8, dx = Math.pow(t, 1.5) * curve; fr.push([x + w + dx - t * 1.2, y + len * t]); rr.push([x + dx, y + len * t]); } P(fr.concat(rr.reverse()), mat || 'dark'); if (!M) for (let i = 1; i < 4; i++) { const t = i / 4, dx = Math.pow(t, 1.5) * curve; Ln(x + dx + 1.5, y + len * t, x + dx + w - 2.5, y + len * t, 'rgba(255,255,255,.08)', .8); } }
  const drum = (x, y, r) => { Ci(x, y, r, 'dark'); Ci(x, y, r * .62, 'steel'); Ci(x, y, r * .22, 'dark'); Hi(x - r * .6, x + r * .6, y - r + 1.2, .14); };
  const ironF = (x, y) => P([[x - 1.5, y], [x - .6, y - 3.2], [x + .9, y - 3.2], [x + 1.5, y]], 'dark');
  const ironR = (x, y) => { RR(x - 2.5, y - 2.8, 5, 2.8, .5, 'dark'); };

  // ---------- the guns. Units: muzzle points right, y down. Each returns anchors for attachments. ----------
  const D = {
    pistol: { body: '#2f333a', draw(m) { const L = m.barrel === 2 ? 76 : m.barrel === 3 ? 58 : 66;
      if (m.mag === 1) { P([[4, 44], [19, 44], [18.5, 58], [3.5, 58]], 'dark'); RR(2.5, 57, 17.5, 3.4, 1.2, 'frame'); }
      P([[4, 11], [L - 4, 11], [L - 4, 17.5], [L - 22, 17.5], [33, 19], [25.5, 19], [20.5, 46.5], [2, 46.5], [.5, 42], [5.5, 20], [2, 14]], 'frame'); Tex(5, 24, 19, 42);
      RR(1.5, 45, 19.5, 3, 1.2, 'dark'); Gv(L - 21, L - 7, 15, 17.5, 5);
      guard([[25, 18], [45, 18], [45, 21], [41, 28.5], [28, 28.5], [24.5, 23]], [[28.2, 20.2], [41.6, 20.2], [39.2, 26.4], [29.6, 26.4], [27.2, 23]]); trig(32, 19.6);
      RR(L - 3.5, 3, 3.5 + (m.barrel === 2 ? 2 : 0), 5.8, .6, 'steel');
      P([[0, 1.6], [1.6, 0], [L - 5, 0], [L, 2.6], [L, 11], [0, 11]], 'body'); Gv(3.5, 13.5, 1.8, 9.6, 7); RR(29, 1.4, 15, 4.8, .8, 'dark'); RR(30, 2, 12, 3.4, .5, m.barrel === 1 ? 'brass' : 'steel', { no: 1 }); Hi(2, L - 5, .7);
      ironF(L - 5, 0); ironR(6, 0); Dot(22, 15, .9, 'steel');
      return { muz: [L + (m.barrel === 2 ? 2 : 0), 5.9], bore: 2.2, rail: [8, 48, 0], railC: 21, under: [L - 13, 17.5], u: .78 }; } },
    revolver: { body: '#9aa1aa', draw(m) { const L = m.barrel === 2 ? 104 : m.barrel === 3 ? 70 : 88;
      P([[11, 15], [28, 18], [26, 25], [22, 47], [7.5, 48], [3.5, 44], [7, 26]], 'wood'); Dot(15, 33, 1, 'steel');
      guard([[24, 16], [39, 16], [38, 24], [31, 29], [24.5, 26]], [[27, 18.4], [36, 18.4], [35, 23], [31, 26], [27.4, 23.5]], 'body'); trig(29.5, 17.5);
      RR(40, 9, L - 46, 6.5, 1.2, 'body'); RR(38, 1.6, L - 38, 8, 1, 'body'); RR(40, -.4, L - 43, 2.2, .5, 'body'); Hi(40, L - 2, 2.4, .3); Gv(42, L - 6, -.4, 1.6, Math.round((L - 48) / 3), 'rgba(0,0,0,.3)');
      P([[10, 4], [18, 0], [40, 0], [42, 2], [42, 16], [26, 18], [11, 16]], 'body'); RR(19.5, 2.4, 20, 13.4, 2.6, 'steel'); for (let i = 0; i < 3; i++) RR(22 + i * 5.3, 4.2, 2.6, 9.8, 1.2, 'rgba(0,0,0,.35)', { no: 1 }); Hi(21, 38, 3.2, .3);
      P([[10, 4], [12.5, -3], [17.5, -4.2], [16.5, 1]], 'dark'); P([[L - 7, -.4], [L - 4, -3.6], [L - 1.4, -3.6], [L - 1.4, -.4]], 'dark'); RR(L - 1.5, 2.4, 1.5, 6.4, .3, 'dark');
      return { muz: [L, 5.6], bore: 2.6, rail: [44, L - 8, -.4], railC: 56, mount: 1, under: [L - 15, 15.5], u: .86 }; } },
    hcannon: { body: '#b8bdc4', draw(m) { const L = m.barrel === 2 ? 94 : m.barrel === 3 ? 72 : 84;
      if (m.mag === 1) { P([[5, 48], [23, 48], [22.5, 62], [4.5, 62]], 'dark'); RR(3.5, 61, 20, 3.4, 1.2, 'steel'); }
      P([[6, 13], [L - 6, 13], [L - 6, 20], [48, 20], [39, 22], [30, 22], [24.5, 50], [3.5, 50], [1.5, 45], [7.5, 22], [3, 16]], 'body'); P([[8.5, 24], [25, 24], [21.5, 46], [5.5, 46]], 'rubber'); Tex(9, 26, 22, 44, 1.8);
      RR(2.5, 49, 23, 3.2, 1.2, 'dark');
      guard([[29, 21], [53, 21], [53, 25], [49, 32], [32, 32], [28, 26]], [[32, 23.4], [49.5, 23.4], [46.5, 29.4], [33.8, 29.4], [31, 26]], 'body'); trig(37, 22.5);
      P([[0, 3], [3, 0], [L - 2.5, 0], [L, 2.4], [L, 13], [0, 13]], 'body'); Gv(3.5, 16, 2, 11.5, 8); RR(26, 2, 15, 5.6, .8, 'dark'); RR(L - 34, -2.4, 32, 2.4, .4, 'dark');
      if (!M) { g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.moveTo(L - 28, 4.5); g.lineTo(L - 12, 4.5); g.lineTo(L - 20, 10.5); g.closePath(); g.fill(); } Ln(L - 31, 1, L - 31, 12.5, 'rgba(0,0,0,.45)', .8); Hi(2, L - 3, .7, .35);
      ironF(L - 4, -2.4); ironR(6, 0);
      return { muz: [L, 6.5], bore: 2.9, rail: [6, 44, 0], railC: 22, under: [L - 18, 20], u: .95 }; } },
    uzi: { body: '#3a3f47', draw(m) { const L = m.barrel === 2 ? 96 : m.barrel === 3 ? 76 : 86;
      if (m.stock === 1) stockM4(1, 3); else if (m.stock !== 2) { Ln(0, 3.5, -36, 4, 'steel', 2.2, 1); Ln(0, 12, -36, 15, 'steel', 2.2, 1); RR(-40, 1, 4.5, 17.5, 1.2, 'steel'); Dot(-1, 7.5, 1.6, 'dark'); } else endCap(0, 3, 9);
      RR(70, 5.4, L - 70, 5.2, .7, 'steel'); RR(68, 3.2, 6.5, 9.6, 1.2, 'dark');
      if (m.mag === 2) drum(37, 52, 12.5); else { const ml = m.mag === 1 ? 28 : 12; RR(32, 38, 10.5, ml, 1, 'dark'); RR(31, 37 + ml, 12.5, 3, 1, 'steel'); }
      P([[29.5, 15], [44.5, 15], [43.5, 41], [30.5, 41]], 'frame'); Tex(32, 18, 42, 39); RR(27.5, 18, 3, 13, 1.2, 'steel');
      guard([[44, 15], [61, 15], [59, 22], [51, 27], [44.5, 25]], [[46.4, 17], [57.2, 17], [55.6, 21.2], [50.6, 24.6], [46.6, 23]], 'body'); trig(48.5, 16);
      RR(0, 0, 70, 15, 2.2, 'body'); Gv(5, 62, .6, 3.4, 15, 'rgba(0,0,0,.32)'); Hi(2, 67, 4.2); RR(16, 6, 22, 5, .8, 'dark'); RR(44, -3.4, 6.5, 4.2, 1.2, 'dark'); ironR(6, 0); ironF(63, 0);
      return { muz: [L, 8], bore: 2.5, rail: [8, 58, 0], railC: 30, under: [66, 15], fg: [64, 15], u: .9 }; } },
    pdw: { body: '#2b2e34', draw(m) { const L = m.barrel === 2 ? 98 : m.barrel === 3 ? 80 : 88;
      if (m.stock === 1) stockM4(1, 3.5); else if (m.stock !== 2) { RR(-28, 2.5, 29, 3.2, 1, 'frame'); RR(-28, 10.5, 29, 3.2, 1, 'frame'); RR(-32, -.5, 6, 18, 2, 'rubber'); } else endCap(0, 2, 12);
      RR(70, 5.8, L - 70, 4.6, .6, 'steel');
      const ml = m.mag === 2 ? 26 : m.mag === 1 ? 20 : 7; RR(25.5, 44, 10.5, ml, 1, 'dark'); RR(24.5, 43 + ml, 12.5, 2.8, 1, 'frame');
      P([[22, 19], [36, 19], [37.5, 45], [24, 45]], 'frame'); Tex(25, 22, 35, 43);
      guard([[36, 17], [51, 17], [49, 26], [38.5, 26]], [[38.6, 19], [48, 19], [46.6, 23.8], [39.6, 23.8]]); trig(41, 18);
      if (m.grip !== 1 && m.grip !== 2) RR(52, 17, 15, 4.2, 1.6, 'frame');
      P([[0, 2], [4, 0], [66, 0], [73, 4], [73, 14], [61, 18.5], [40, 18.5], [36, 20], [22, 20], [17, 16], [0, 14]], 'body'); RR(40, 4.5, 13, 4.6, .6, 'dark'); RR(-2.5, 3, 4, 4.5, 1, 'dark'); Hi(4, 64, .8); Dot(30, 12, 1.1, 'steel');
      rail(5, 62, 0); ironF(60, -2.6);
      return { muz: [L, 8.1], bore: 2.3, rail: [6, 60, -2.6], railC: 30, under: [66, 14], fg: [59, 18.5], u: .9 }; } },
    shotgun: { body: '#30343b', draw(m) { const L = m.barrel === 2 ? 152 : m.barrel === 3 ? 108 : 130, te = m.mag === 1 ? L - 8 : Math.min(L - 14, 104);
      if (m.stock === 2) pgrip(-2, 9, 24); else if (m.stock === 1) { stockM4(1, 4); pgrip(-1, 10, 22); }
      else { P([[0, 1.5], [0, 15.5], [-6, 18.5], [-50, 26.5], [-62, 27.5], [-62, 4], [-50, 3.5], [-12, 2]], 'wood'); RR(-65, 3.5, 4, 24.5, 1.2, 'rubber'); }
      if (m.mag === 2) drum(18, 30, 12);
      RR(35, 8.8, te - 35, 5.4, 1.8, 'steel'); RR(te - 2.5, 8.2, 3.5, 6.6, 1.2, 'dark');
      RR(35, 2.4, L - 35, 6.2, 1, 'steel'); RR(37, .6, L - 39, 1.8, .3, 'dark'); Hi(36, L - 2, 3.3, .25); if (!M) for (let x = 40; x < L - 4; x += 6) { g.fillStyle = '#16181b'; g.fillRect(x, 2.2, 1.5, .8); }
      Ci(L - 3, .1, 1.2, 'brass');
      RR(0, 0, 37, 16, 2, 'body'); RR(14, 3, 13, 6.4, .8, 'dark'); RR(15.5, 4.2, 9, 4, 1.2, 'brass', { no: 1 }); Hi(2, 34, .8); Dot(30, 12, 1, 'steel'); Dot(8, 12, 1, 'steel');
      guard([[8, 16], [29, 16], [27, 22.5], [12, 23.5], [8, 20]], [[11, 17.6], [25.4, 17.6], [24, 21], [13, 21.6]], 'body'); trig(17, 16.5);
      const fx = 52; RR(fx, 7.4, 34, 10, 3.4, 'wood'); Gv(fx + 4, fx + 30, 9, 15.8, 9, 'rgba(0,0,0,.33)');
      return { muz: [L, 5.5], bore: 3.1, rail: [3, 33, 0], railC: 18, mount: 1, under: [te - 9, 14.2], fg: [fx + 17, 17.4], u: 1.05 }; } },
    sawnoff: { body: '#3a3e44', draw(m) { const L = m.barrel === 2 ? 90 : m.barrel === 3 ? 60 : 74;
      if (m.stock === 1) { stockM4(1, 4); pgrip(-1, 11, 20, 'wood'); } else P([[0, 3], [0, 14], [-6, 16], [-14, 34], [-27, 34], [-20, 14], [-8, 2]], 'wood');
      RR(26, 11.5, 22, 6, 2.6, 'wood'); RR(24, .8, L - 24, 6.6, 1.2, 'steel'); RR(24, 7, L - 24, 6.2, 1.2, 'steel'); Ln(25, 7.1, L - 1, 7.1, 'rgba(0,0,0,.6)', .7); Hi(25, L - 2, 1.8, .28); Ci(L - 2, .8, .9, 'brass');
      RR(0, 0, 25, 15, 2.4, 'body'); if (!M) { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = .5; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(12, 8, 3 + i * 1.6, .4, 2.6); g.stroke(); } }
      P([[2, 1], [3.5, -5], [8, -6.4], [7.5, 1]], 'dark'); P([[9, 1], [10.5, -4.6], [14.5, -5.6], [14, 1]], 'dark');
      guard([[5, 15], [21, 15], [19.5, 21], [8, 21.5], [5, 18.5]], [[7.6, 16.4], [18.4, 16.4], [17.4, 19.6], [9, 20]], 'body'); trig(11, 15.5);
      return { muz: [L, 7], bore: 3.4, rail: [1, 23, 0], railC: 12, mount: 1, under: [L - 12, 13.2], u: 1 }; } },
    autoshot: { body: '#26292e', draw(m) { const L = m.barrel === 2 ? 150 : m.barrel === 3 ? 108 : 128, te = m.mag === 1 ? L - 6 : L - 26;
      if (m.stock === 1) stockM4(1, 4); else if (m.stock === 2) endCap(1, 4, 8); else stockTac(1, 4); pgrip(4, 15, 23);
      if (m.mag === 2) drum(22, 30, 12);
      RR(38, 8.8, te - 38, 5.2, 1.8, 'steel'); RR(te - 2, 8.2, 3, 6.4, 1, 'dark'); RR(38, 2.4, L - 38, 5.6, 1, 'steel'); Hi(39, L - 2, 3.2, .25);
      RR(0, 0, 40, 16, 2.2, 'body'); RR(16, 3.4, 13, 5.6, .8, 'dark'); RR(17, 4.4, 9, 3.6, 1.2, '#b71c1c', { no: 1 }); Hi(2, 37, .8);
      guard([[13, 16], [32, 16], [30, 22.5], [16, 22.5]], [[15.6, 17.6], [29, 17.6], [28, 21], [16.8, 21]]); trig(21, 16.5);
      RR(40, 7.2, 42, 9.6, 2.4, 'frame'); Gv(46, 78, 9, 15, 7, 'rgba(0,0,0,.4)'); rail(3, 37, 0); RR(30, -6.8, 5.5, 4.4, 1, 'dark'); P([[L - 9, 2.4], [L - 8, -4], [L - 5.5, -4], [L - 4.5, 2.4]], 'dark');
      return { muz: [L, 5.2], bore: 2.9, rail: [3, 28, -2.6], railC: 15, under: [te - 8, 14], fg: [62, 16.8], u: 1.05 }; } },
    rifle: { body: '#3b3f45', draw(m) { const BE = m.barrel === 2 ? 150 : m.barrel === 3 ? 116 : 134;
      if (m.stock === 1) stockM4(1, 4); else if (m.stock === 2) endCap(1, 3, 10); else { P([[0, 2.5], [0, 14], [-6, 16], [-52, 26], [-56, 26.5], [-56, 6], [-50, 5], [-10, 2]], 'wood'); RR(-59, 5.5, 3.6, 21.5, 1, 'steel'); }
      pgrip(19, 15, 25, m.stock === 1 ? 'frame' : 'wood');
      if (m.mag === 2) drum(45, 33, 15); else curvedMag(38, 13, m.mag === 1 ? 46 : 34, 11.5, m.mag === 1 ? 22 : 15, m.skin ? 'dark' : '#5a2e1a');
      guard([[28, 15], [47, 15], [46.5, 17], [42, 22.5], [32, 22.5], [29.5, 17]], [[31.2, 16.6], [44.4, 16.6], [41, 20.8], [33, 20.8]], 'steel'); trig(35, 15.5);
      RR(96, 7.4, BE - 96, 4.2, .8, 'steel'); RR(60, 7, 36, 9, 2.2, 'wood'); RR(64, 1, 26, 5.6, 2.6, 'wood'); RR(89, 1.6, 14, 4.4, 1.2, 'steel');
      P([[104, 1], [110, 1], [110, 12.4], [104, 12.4]], 'steel'); P([[BE - 10, 7.4], [BE - 8.6, -3.6], [BE - 6, -3.6], [BE - 5, 7.4]], 'steel'); RR(BE - 9.6, -4.6, 1.2, 4, .3, 'steel');
      if (!m.muz) { RR(BE, 6.4, 8, 6.2, .9, 'steel'); P([[BE + 1, 6.4], [BE + 8, 6.4], [BE + 8, 7.8]], 'rgba(0,0,0,.4)', { no: 1 }); }
      P([[0, 2], [2, 0], [56, 0], [58, 2], [58, 15], [0, 15]], 'body'); RR(0, -1.4, 56, 6, 3, 'body'); Hi(3, 54, -.4, .3); for (const x of [6, 22, 40, 52]) Dot(x, 12.5, .8, 'steel'); Ln(6, 7.4, 28, 9.4, 'steel', 1.3, 1);
      P([[56, -1.2], [66, -1.2], [66, 6], [56, 6]], 'steel'); RR(57.5, -3.4, 7, 2.4, .5, 'dark');
      return { muz: [BE + (m.muz ? 0 : 0), 9.5], bore: 2.1, rail: [4, 54, -1.4], railC: 30, mount: 1, under: [88, 16], fg: [78, 16], u: 1.12 }; } },
    carbine: { body: '#2f3238', draw(m) { const BE = m.barrel === 2 ? 150 : m.barrel === 3 ? 112 : 128;
      if (m.stock === 1) stockTac(1, 3); else if (m.stock === 2) endCap(1, 3, 7); else stockM4(1, 3);
      pgrip(15, 18, 24);
      if (m.mag === 2) { drum(31, 35, 11); drum(44, 35, 11); } else curvedMag(29, 18, m.mag === 1 ? 40 : 28, 12, m.mag === 1 ? 7 : 5);
      P([[2, 11], [49, 11], [49, 18.5], [41, 18.5], [37, 22.5], [21, 22.5], [17, 18.5], [2, 18.5]], 'body');
      guard([[25, 20], [41, 20], [41, 22], [37, 27], [27, 27]], [[28, 21.4], [38.6, 21.4], [36.2, 25.4], [28.6, 25.4]], 'body'); trig(31, 20.8);
      RR(100, 5.6, BE - 100, 3.6, .6, 'steel');
      RR(0, 0, 52, 11.2, 1.2, 'body'); RR(22, 3, 14, 5, .6, 'dark'); Ci(47, 6.5, 2, 'steel'); RR(-3, 1, 5, 3.4, 1, 'dark'); Hi(2, 50, .7);
      RR(52, .4, 47, 14.4, 1.6, 'frame'); if (!M) for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(57 + i * 7, 7.6, 2, 3, 0, 0, 6.283); g.fill(); } rail(1, 99, .4);
      P([[100, 10], [100, 2], [104, -8.6], [107, -8.6], [111, 2], [111, 10]], 'body'); RR(104.4, -11, 1.4, 3, .3, 'dark');
      if (!m.muz) hider(BE, 7.4, 2.2, 1);
      return { muz: [BE, 7.4], bore: 1.9, rail: [4, 50, -2.2], railC: 26, under: [92, 14.8], fg: [76, 14.8], u: 1.08 }; } },
    lmg: { body: '#30343a', draw(m) { const BE = m.barrel === 2 ? 178 : m.barrel === 3 ? 144 : 162;
      if (m.stock === 1) stockM4(1, 4); else if (m.stock === 2) endCap(1, 4, 10); else { P([[0, 3], [0, 17], [-10, 19], [-48, 25], [-53, 25], [-53, 5], [-46, 3]], 'frame'); HOLE([[-40, 9], [-14, 8], [-14, 14], [-40, 19]]); RR(-56, 4.5, 4, 21, 1, 'rubber'); }
      pgrip(16, 20, 23);
      const bx = m.mag === 2 ? [22, 20, 36, 30, 'tan'] : m.mag === 1 ? [24, 20, 32, 30, 'olive'] : [26, 20, 26, 22, 'olive']; RR(bx[0], bx[1], bx[2], bx[3], m.mag === 2 ? 6 : 2, bx[4]); RR(bx[0] + 3, bx[1] + 4, bx[2] - 6, 2, .6, 'rgba(0,0,0,.3)', { no: 1 });
      if (!M) for (let i = 0; i < 5; i++) { RR(bx[0] + bx[2] - 2 + i * 1.6, 19 - i * 2.2, 3, 2.2, .5, 'brass'); }
      guard([[26, 20], [44, 20], [42, 26], [30, 27]], [[29, 21.6], [41, 21.6], [40, 24.6], [30.6, 25]]); trig(33, 21);
      RR(62, 4.8, BE - 62, 5.4, .8, 'steel'); Gv(96, 132, 4.8, 10.2, 10, 'rgba(0,0,0,.35)'); RR(92, 11.6, 28, 4.2, 1.2, 'steel');
      if (m.grip !== 2 && m.grip !== 1) { Ln(112, 12.4, 140, 12.4, 'steel', 1.8, 1); Ln(112, 14.8, 138, 15.6, '#4a5058', 1.6, 1); }
      RR(62, 5.6, 30, 12.4, 2.2, 'frame'); Gv(66, 88, 7, 16, 8, 'rgba(0,0,0,.4)');
      P([[66, 0], [68.5, -9.5], [90, -9.5], [92.5, 0], [88, 0], [86, -5.5], [72.5, -5.5], [70.5, 0]], 'dark');
      RR(0, 0, 63, 20, 2.4, 'body'); P([[13, -4.4], [56, -4.4], [60, 0], [9, 0]], 'body'); Dot(57, 2.4, 1.2, 'steel'); RR(30, 10, 16, 5, .6, 'dark'); Hi(3, 60, .8); rail(16, 54, -4.4);
      P([[BE - 9, 4.8], [BE - 8, -3.6], [BE - 5.5, -3.6], [BE - 4.5, 4.8]], 'dark'); if (!m.muz) hider(BE, 7.5, 2.7, 1.2);
      return { muz: [BE, 7.5], bore: 2.7, rail: [16, 54, -7], railC: 34, under: [108, 17], fg: [100, 18], bip: 16, u: 1.22 }; } },
    bolt: { body: '#33373d', draw(m) { const BE = m.barrel === 2 ? 192 : m.barrel === 3 ? 148 : 172;
      if (m.stock === 1) { stockM4(-2, 5); P([[-4, 4], [0, 6], [104, 7], [108, 9], [106, 13], [44, 14], [10, 16], [2, 17.5], [-8, 22], [-14, 32], [-24, 32], [-18, 18], [-6, 12]], 'wood'); }
      else if (m.stock === 2) P([[-4, 4], [0, 6], [104, 7], [108, 9], [106, 13], [44, 14], [10, 16], [2, 17.5], [-8, 22], [-14, 32], [-24, 32], [-18, 18], [-6, 12]], 'wood');
      else { P([[-62, 3], [-30, 2], [-4, 4], [0, 6], [104, 7], [108, 9], [106, 13], [44, 14], [10, 16], [0, 17.5], [-10, 22], [-20, 26], [-58, 30], [-62, 30]], 'wood'); RR(-66, 2.5, 4.4, 28, 1.2, 'rubber'); if (!M) { g.strokeStyle = 'rgba(40,20,6,.35)'; g.lineWidth = .45; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-18 + i * 2.4, 16); g.lineTo(-10 + i * 2.4, 24); g.stroke(); g.beginPath(); g.moveTo(-10 + i * 2.4, 16); g.lineTo(-18 + i * 2.4, 24); g.stroke(); } } }
      guard([[7, 15.5], [25, 15.5], [23, 21.5], [12, 22]], [[10, 16.8], [22, 16.8], [21, 20], [12.4, 20.4]], 'steel'); trig(15, 16.2);
      if (m.mag === 1 || m.mag === 2) RR(28, 13, 13, m.mag === 2 ? 20 : 12, 1, 'dark'); else RR(27, 14, 18, 2.2, .6, 'steel');
      P([[44, .8], [BE, 2.2], [BE, 5.6], [44, 7.2]], 'body'); Hi(46, BE - 2, 1.6, .25);
      RR(0, 0, 46, 8.2, 2.4, 'body'); RR(-4.5, 1.4, 6, 5.4, 2, 'body'); RR(20, 1.6, 10, 3.6, .8, 'dark'); Ln(13, 4, 9, 12, 'steel', 2.1, 1); Ci(8.4, 13.2, 2.7, 'steel'); Hi(2, 44, .7, .3);
      if (!m.sight) { P([[BE - 7, 2.2], [BE - 6, -1.8], [BE - 3.5, -1.8], [BE - 3, 2.2]], 'dark'); RR(58, -1.5, 4, 2.6, .4, 'dark'); }
      return { muz: [BE, 3.9], bore: 1.9, rail: [2, 44, -.2], railC: 22, mount: 1, under: [94, 13.4], fg: [88, 13.6], u: 1.15 }; } },
    sniper: { body: '#4f5a34', draw(m) { const BE = m.barrel === 2 ? 210 : m.barrel === 3 ? 166 : 190;
      if (m.stock === 1) stockM4(-6, 3); else if (m.stock === 2) endCap(-6, 2, 9);
      else { P([[-64, 1.5], [-22, 0], [-6, 3], [-6, 18], [-10, 18.5], [-20, 30], [-30, 30.5], [-36, 26], [-64, 30]], 'body'); HOLE([[-24, 7], [-12, 7], [-14, 15], [-24, 18]]); RR(-50, -4.4, 30, 5, 1.6, 'body'); RR(-68, 1, 4.6, 29.5, 1.2, 'rubber'); Ln(-46, 30, -46, 38, 'dark', 2.2, 1); }
      P([[-6, 3], [62, 5], [66, 9], [62, 16], [10, 16], [2, 18], [-6, 18]], 'body'); pgrip(1, 17, 22, 'body'); Gv(30, 60, 8, 14, 6, 'rgba(0,0,0,.35)');
      guard([[10, 15.5], [26, 15.5], [24, 21.5], [13, 22]], [[13, 16.8], [23, 16.8], [22, 20], [13.6, 20.4]], 'dark'); trig(16, 16.2);
      RR(30, 14, 12.5, m.mag === 1 ? 20 : m.mag === 2 ? 24 : 11, 1, 'dark');
      RR(56, 1, BE - 56, 5.2, .8, 'steel'); if (!M) for (let i = 0; i < 3; i++) Ln(64, 2.2 + i * 1.4, BE - 20, 2.2 + i * 1.4, 'rgba(0,0,0,.3)', .5);
      if (!m.muz) { RR(BE, -.4, 11, 8, 1.2, 'dark'); Gv(BE + 2.5, BE + 9, -.4, 7.6, 4, 'rgba(255,255,255,.14)'); }
      RR(0, -1, 54, 8.2, 1.8, 'steel'); RR(-6, -.4, 7, 6.4, 2, 'steel'); Ln(16, 3, 13, 12.4, 'steel', 2, 1); Ci(12.4, 13.4, 3.1, 'rubber'); Hi(2, 52, 0, .3); rail(2, 52, -1);
      return { muz: [BE, 3.6], bore: 2.4, rail: [2, 52, -3.6], railC: 26, under: [56, 16], fg: [48, 16], bip: 4, u: 1.25, defSight: 4 }; } },
    dmr: { body: '#3a3e44', draw(m) { const BE = m.barrel === 2 ? 192 : m.barrel === 3 ? 150 : 170;
      const fore = [[0, 6], [110, 7], [114, 9], [112, 13], [50, 14], [44, 16], [10, 16], [2, 17.5]];
      if (m.stock === 1) { stockM4(-2, 4); P([[-4, 4]].concat(fore, [[-8, 22], [-14, 32], [-24, 32], [-18, 18], [-6, 12]]), 'wood'); }
      else if (m.stock === 2) P([[-4, 4]].concat(fore, [[-8, 22], [-14, 32], [-24, 32], [-18, 18], [-6, 12]]), 'wood');
      else { P([[-62, 3], [-30, 2], [-4, 4]].concat(fore, [[-10, 22], [-20, 26], [-58, 30], [-62, 30]]), 'wood'); RR(-66, 2.5, 4.4, 28, 1.2, 'steel'); }
      guard([[6, 15.5], [24, 15.5], [22, 21.5], [11, 22]], [[9, 16.8], [21, 16.8], [20, 20], [11.4, 20.4]], 'steel'); trig(14, 16.2);
      if (m.mag === 2) drum(38, 26, 12); else RR(30, 13, 14, m.mag === 1 ? 28 : 17, 1.2, 'dark');
      RR(100, 3, BE - 100, 4.2, .7, 'steel'); RR(100, 7.8, 20, 5.6, 1.2, 'steel'); P([[BE - 9, 3], [BE - 8, -3.6], [BE - 5.4, -3.6], [BE - 4.4, 3]], 'steel');
      RR(52, 0, 50, 6, 2.6, 'frame'); RR(52, 8, 46, 3, 1, 'steel');
      RR(0, -1, 54, 9.2, 1.8, 'body'); RR(38, 7.6, 7, 4, 1, 'steel'); RR(4, -5.4, 6, 4.6, 1, 'dark'); Hi(2, 52, -.2, .3);
      if (!m.muz) { RR(BE, 2, 9, 6.6, 1, 'steel'); Gv(BE + 2, BE + 8, 2, 4.4, 4, 'rgba(0,0,0,.5)'); }
      return { muz: [BE, 5.1], bore: 2.1, rail: [10, 50, -1], railC: 28, mount: 1, under: [96, 13.4], fg: [86, 14], u: 1.18 }; } },
    rocket: { body: '#4f5a39', draw(m) {
      P([[-40, .5], [-40, 8.5], [-56, 13], [-56, -4]], 'steel'); RR(-40, 0, 126, 9, 3, 'body'); RR(-6, -2, 34, 13, 3.4, 'wood'); Ln(-4, -2, -4, 11, 'steel', 1.2); Ln(26, -2, 26, 11, 'steel', 1.2);
      P([[22, 9], [30, 9], [29.5, 28], [22.5, 28]], 'frame'); trig(18, 10); P([[2, 9], [9, 9], [8.5, 22], [2.5, 22]], 'frame'); RR(13, -10, 12, 8, 1.6, 'dark'); RR(24.4, -8.6, 1.2, 5, .3, 'rgba(90,170,255,.85)');
      Hi(-38, 84, 1);
      if (m.head === 1) { RR(84, -7, 20, 23, 5, 'green'); P([[104, -6], [134, 2], [134, 7], [104, 15]], 'green'); RR(132, 1.5, 6, 6, 2, '#ff7043'); Ln(88, -7, 88, 16, 'rgba(0,0,0,.4)', 1); }
      else { RR(84, -3, 14, 15, 3, 'green'); P([[98, -3], [120, 2.6], [120, 6.4], [98, 12]], 'green'); RR(119, 3, 3, 3, 1, 'dark'); }
      return { u: 1.3 }; } },
    knife: { body: '#17191c', draw() { RR(-34, 1, 6, 8, 2.4, 'steel'); RR(-30, 0, 30, 10, 4, 'body'); Gv(-26, -4, 0, 10, 6, 'rgba(255,255,255,.08)'); RR(0, -4.5, 4, 19, 1.6, 'steel');
      P([[4, 1], [50, 1], [58, -.6], [73, 4], [64, 8.2], [50, 10], [4, 10]], 'blade'); Ln(8, 4.2, 46, 4.2, 'rgba(0,0,0,.25)', 1.4); Ln(6, 9.1, 62, 8.4, 'rgba(255,255,255,.75)', .7); if (!M) { g.fillStyle = 'rgba(0,0,0,.35)'; for (let x = 8; x < 26; x += 2.6) g.fillRect(x, 1, 1.2, 1.6); }
      return {}; } },
    molotov: { body: '#2b2e34', draw(m) { RR(-12, 12, 24, 40, 7, m.mix ? 'rgba(150,90,40,.7)' : 'rgba(150,200,120,.55)'); RR(-10, 26, 20, 24, 5, m.mix ? 'rgba(160,60,10,.9)' : 'rgba(230,160,40,.85)', { no: 1 }); RR(-4, -1, 8, 15, 2, 'rgba(150,200,120,.55)');
      RR(-10, 31, 20, 10, 1, 'cream'); Ln(-7, 35, 7, 35, 'rgba(120,30,20,.7)', 1.2); Hi(-9, -7, 16, .5); if (!M) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(-9, 16, 1.6, 30); }
      P([[-3, -1], [3, -1], [6, -13], [0, -9], [-5, -15]], '#d8cfb5'); P([[-7, -13], [-2, -30], [1, -22], [4, -34], [8, -13]], '#ff8c1a', { no: 1 }); P([[-3, -13], [1, -26], [4, -13]], '#ffe082', { no: 1 });
      return {}; } },
  };

  function atts(A, m) { const u = A.u || 1;
    if (A.bore && m.muz) { const [x, y] = A.muz, r = A.bore;
      if (m.muz === 1) { const l = 26 * u, h = Math.max(r * 2 + 4, 8.5 * u); RR(x - 1, y - h / 2, l, h, h / 2.4, 'dark'); for (let i = 1; i < 4; i++) RR(x + l * i / 4, y - h / 2 + .4, .9, h - .8, 0, 'rgba(255,255,255,.08)', { no: 1 }); Hi(x + 2, x + l - 3, y - h / 2 + 1.1, .2); }
      else if (m.muz === 2) { const l = 9 * u, h = r * 2 + 3 * u; RR(x - 1, y - h / 2, l, h, 1, 'steel'); if (!M) for (let i = 0; i < 3; i++) { g.fillStyle = '#0b0c0e'; g.fillRect(x + 1.2 + i * 2.5 * u, y - h / 2, 1.2 * u, h * .42); } }
      else if (m.muz === 3) { const l = 8 * u; P([[x - 1, y - r - .8], [x + l, y - r - 2.2], [x + l, y + r + 2.2], [x - 1, y + r + .8]], 'steel'); RR(x + l - 2.2, y - r - 2.2, 1.1, 2 * r + 4.4, 0, 'rgba(0,0,0,.45)', { no: 1 }); } }
    const sg = m.sight || A.defSight || 0;
    if (sg && A.rail) { const [x1, x2, y] = A.rail, cx = A.railC ?? (x1 + x2) / 2, s = u;
      if (A.mount) { RR(cx - 15 * s, y - 2.4 * s, 30 * s, 2.4 * s, .6, 'dark'); }
      const yb = y - (A.mount ? 2.4 * s : 0);
      if (sg === 1) { RR(cx - 7 * s, yb - 2.8 * s, 14 * s, 2.8 * s, .6, 'dark'); RR(cx - 6 * s, yb - 11 * s, 12 * s, 8.6 * s, 3 * s, 'dark'); RR(cx + 4 * s, yb - 10 * s, 1.6 * s, 6.6 * s, .6, 'rgba(255,90,90,.9)'); RR(cx - 2 * s, yb - 12.8 * s, 3.2 * s, 2 * s, .6, 'dark'); Hi(cx - 5 * s, cx + 3 * s, yb - 10 * s, .2); }
      else if (sg === 2) { RR(cx - 10 * s, yb - 2.8 * s, 20 * s, 2.8 * s, .6, 'dark'); P([[cx - 9 * s, yb - 2.8 * s], [cx - 9 * s, yb - 13.5 * s], [cx + 8 * s, yb - 13.5 * s], [cx + 10 * s, yb - 2.8 * s]], 'dark'); RR(cx - 6.6 * s, yb - 11.6 * s, 13 * s, 6.8 * s, .8, 'rgba(120,200,255,.6)'); if (!M) { g.fillStyle = '#ff3b3b'; g.beginPath(); g.arc(cx, yb - 8.2 * s, .8 * s, 0, 6.283); g.fill(); } RR(cx - 8.4 * s, yb - 6 * s, 2 * s, 2 * s, .4, 'steel'); }
      else { const L = (sg === 3 ? 42 : 58) * s, ob = (sg === 3 ? 4.6 : 6.8) * s, tr = 3.1 * s, cy = yb - 9.4 * s;
        RR(cx - L * .26 - 2 * s, yb - 6.6 * s, 4 * s, 6.6 * s, .8, 'dark'); RR(cx + L * .16 - 2 * s, yb - 6.6 * s, 4 * s, 6.6 * s, .8, 'dark');
        RR(cx - L / 2 + 6 * s, cy - tr, L - 14 * s, 2 * tr, tr, 'dark'); P([[cx - L / 2, cy - tr - 1.3 * s], [cx - L / 2 + 7 * s, cy - tr], [cx - L / 2 + 7 * s, cy + tr], [cx - L / 2, cy + tr + 1.3 * s]], 'dark');
        P([[cx + L / 2 - 11 * s, cy - tr], [cx + L / 2 - 4 * s, cy - ob], [cx + L / 2, cy - ob], [cx + L / 2, cy + ob], [cx + L / 2 - 4 * s, cy + ob], [cx + L / 2 - 11 * s, cy + tr]], 'dark');
        RR(cx + L / 2 - .9 * s, cy - ob + .9 * s, 1.5 * s, 2 * ob - 1.8 * s, .5, 'rgba(90,170,255,.9)', { no: 1 }); RR(cx - 3.2 * s, cy - tr - 3.6 * s, 6.4 * s, 3.6 * s, .8, 'dark'); RR(cx - 2.6 * s, cy + tr, 5.2 * s, 2.6 * s, .6, 'dark'); Hi(cx - L / 2 + 8 * s, cx + L / 2 - 12 * s, cy - tr + 1 * s, .2); } }
    BEAM = null;
    if (m.laser && A.under) { const [x, y] = A.under, s = u, c = m.laser === 2 ? '#3dff6a' : '#ff3b3b';
      if (m.laser === 3) { RR(x - 11 * s, y, 20 * s, 7.6 * s, 2 * s, 'dark'); RR(x + 8.2 * s, y + 1 * s, 1.6 * s, 5.6 * s, .6, '#fff7cc'); if (!M) { g.fillStyle = c; g.beginPath(); g.arc(x - 6 * s, y + 5.6 * s, 1 * s, 0, 6.283); g.fill(); } BEAM = [x + 9.8 * s, y + 3.8 * s, c, 1]; }
      else { RR(x - 8 * s, y, 15 * s, 5.6 * s, 1.6 * s, 'dark'); RR(x + 6.2 * s, y + 1.4 * s, 1.4 * s, 2.8 * s, .5, c); BEAM = [x + 7.6 * s, y + 2.8 * s, c, 0]; } }
    if (A.fg && m.grip === 1) { const [x, y] = A.fg, s = u; P([[x - 3.6 * s, y], [x + 3.6 * s, y], [x + 3 * s, y + 15 * s], [x - 3 * s, y + 15 * s]], 'frame'); RR(x - 3.9 * s, y + 13.4 * s, 7.8 * s, 3 * s, 1.4 * s, 'frame'); if (!M) for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x - 3 * s, y + 3 * s + i * 2.6 * s, 6 * s, .8 * s); } }
    if (A.fg && m.grip === 2) { const x = A.fg[0] + (A.bip || 12) * u, y = A.fg[1], s = u; Ln(x, y + 2 * s, x - 5 * s, y + 23 * s, '#4a5058', 2.1 * s, 1); RR(x - 3.2 * s, y - 1 * s, 6.4 * s, 4.4 * s, 1, 'dark'); Ln(x, y + 2 * s, x + 6 * s, y + 24 * s, '#2a2e33', 2.3 * s, 1); RR(x + 4 * s, y + 23.4 * s, 4 * s, 1.8 * s, .6, 'rubber'); RR(x - 7 * s, y + 22.4 * s, 4 * s, 1.8 * s, .6, 'rubber'); } }

  // draw gun `id` with mods `m` into context g0, fitted into w×h. o: { pad, beam, shadow }
  function draw(g0, w, h, id, m, o) { const def = D[id]; if (!def) return false; m = m || {}; o = o || {}; SK = m.skin | 0; BODY = SK && SKINCOL[SK] ? SKINCOL[SK] : def.body;
    M = true; bb = [1e9, 1e9, -1e9, -1e9]; g = null; atts(def.draw(m), m); M = false;
    const pad = o.pad ?? 6, bw = bb[2] - bb[0], bh = bb[3] - bb[1], K = Math.min((w - 2 * pad) / bw, (h - 2 * pad) / bh), tx = w / 2 - (bb[0] + bw / 2) * K, ty = h / 2 - (bb[1] + bh / 2) * K;
    const off = document.createElement('canvas'); off.width = w; off.height = h; g = off.getContext('2d'); g.translate(tx, ty); g.scale(K, K); OL = 1.15 / K; g.lineJoin = 'round';
    atts(def.draw(m), m); const beam = BEAM; g = null;
    g0.save(); if (o.shadow !== false) { g0.shadowColor = 'rgba(0,0,0,.6)'; g0.shadowBlur = Math.max(4, w / 40); g0.shadowOffsetY = Math.max(2, h / 40); } g0.drawImage(off, 0, 0); g0.restore();
    if (o.beam && beam) { const bx = tx + beam[0] * K, by = ty + beam[1] * K, gr = g0.createLinearGradient(bx, 0, w, 0); gr.addColorStop(0, beam[2]); gr.addColorStop(1, 'rgba(0,0,0,0)'); g0.save(); g0.globalAlpha = .75; g0.strokeStyle = gr; g0.lineWidth = Math.max(1, K * .35); g0.beginPath(); g0.moveTo(bx, by); g0.lineTo(w, by); g0.stroke();
      if (beam[3]) { const gl = g0.createRadialGradient(bx, by, 0, bx, by, K * 30); gl.addColorStop(0, 'rgba(255,248,200,.35)'); gl.addColorStop(1, 'rgba(255,248,200,0)'); g0.fillStyle = gl; g0.beginPath(); g0.moveTo(bx, by); g0.lineTo(w, by - K * 26); g0.lineTo(w, by + K * 26); g0.closePath(); g0.fill(); } g0.restore(); }
    return true; }
  return { draw, has: id => !!D[id] };
})();

// the mods to show for a gun: an explicit set (a collection gun), else the one you carry
const gunModsOf = id => (typeof ownsGun === 'function' && ownsGun(id) && G.wmods[id]) || {};
{ const _gb = gunIconBig; gunIconBig = function (id, px, mods) { if (!GART.has(id)) return _gb(id, px); const c = document.createElement('canvas'); c.width = 264; c.height = 180; GART.draw(c.getContext('2d'), 264, 180, id, mods || gunModsOf(id), { pad: 14 }); if (px) c.style.width = px + 'px'; return c; }; }
gunIcon = id => gunIconBig(id);
{ const _ic = Panel.icon; Panel.icon = function (id, i) { if (!GART.has(id)) return _ic.call(this, id, i); if (Panel._big) return gunIconBig(id); const c = document.createElement('canvas'); c.width = 132; c.height = 90; GART.draw(c.getContext('2d'), 132, 90, id, gunModsOf(id), { pad: 6 }); c.style.width = '44px'; return c; }; }
{ const _dp = drawGunPreview; drawGunPreview = function (cv, id, m) { if (!GART.has(id)) return _dp(cv, id, m); if (cv.width < 600) { cv.width = 720; cv.height = 300; } const g = cv.getContext('2d'), w = cv.width, h = cv.height;
  const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#2c313c'); bg.addColorStop(1, '#0f1116'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 1; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  const sp = g.createRadialGradient(w / 2, h * .45, 10, w / 2, h * .45, w * .55); sp.addColorStop(0, 'rgba(255,255,255,.07)'); sp.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = sp; g.fillRect(0, 0, w, h);
  GART.draw(g, w, h, id, m || {}, { pad: 26, beam: 1 }); }; }
