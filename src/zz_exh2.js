// ================= NO EXHAUST = STRAIGHT PIPED · NO HOOD = YOU SEE THE ENGINE =================
// "Straight pipe" is no longer something you buy: pull the exhaust system off and the car runs straight-piped (and sounds it).
function exhTier(car) { if (!car) return 0; const m = car.mods || {}; if (car.missing && (car.missing.exhaustp | 0) > 0) return 2; return clamp(m.exh | 0, 0, 3); }
MODOPTS.exh.o[2][0] = 'Straight pipe (no exhaust fitted)';
// old saves: a fitted "straight pipe" becomes a car with no exhaust system; spare straight pipes are dropped
function exhMigrate() { if (!G.save || G.save.exh2) return; G.save.exh2 = 1; const fix = r => { if (r && r.mods && r.mods.exh === 2) { r.mods.exh = 0; r.missing = r.missing || {}; r.missing.exhaustp = Math.max(1, r.missing.exhaustp | 0); } };
  try { for (const r of myCars()) fix(r); } catch (e) { } for (const c of G.cars) if (c.owned) { fix(c); if (c.mods && c.mods.exh === 0 && typeof applyMods === 'function') applyMods(c, c.mods); }
  const P = PARTS(); if (P['exh:2']) delete P['exh:2']; if (G.save.lc && G.save.lc['exh:2']) delete G.save.lc['exh:2']; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play' && G.save && !G.save.exh2) exhMigrate(); }; }
// AI cars that would have rolled "straight pipe" get a sport exhaust instead
{ const _am = applyMods; applyMods = function (c, m) { if (m !== undefined && m && m.exh === 2 && !c.owned) m.exh = 1; return _am(c, m); }; }

// ---------- engine bay: with the hood (a body panel) missing, the engine shows ----------
const BAYCOL = { eng_i4: '#8d99a6', eng_i4t: '#90a4ae', eng_v6: '#a1887f', eng_v8: '#b71c1c', eng_sc8: '#c62828', eng_ev: '#1e88e5', eng_bike: '#9e9e9e' };
function drawBay(g, d, L, Wd, eng, trunkOpen) { const x0 = L * .74, x1 = L - 1, y0 = 1.3, y1 = Wd - 1.3, w = x1 - x0, h = y1 - y0;
  g.fillStyle = '#16181b'; g.fillRect(x0, y0, w, h); g.fillStyle = '#26292e'; g.fillRect(x0 + .3, y0 + .3, w - .6, h - .6);
  g.fillStyle = '#3a3f45'; g.fillRect(x0 + .4, y0 + .4, 1.4, 1.4); g.fillRect(x0 + .4, y1 - 1.8, 1.4, 1.4); // strut towers
  g.fillStyle = '#455a64'; g.fillRect(x1 - 1.1, y0 + .6, .9, h - 1.2); g.fillStyle = 'rgba(0,0,0,.4)'; for (let y = y0 + .9; y < y1 - .7; y += .7) g.fillRect(x1 - 1.05, y, .8, .25); // radiator
  g.fillStyle = '#212121'; g.fillRect(x0 + 1.2, y1 - 2.6, 2, 1.6); g.fillStyle = '#c62828'; g.fillRect(x0 + 1.4, y1 - 2.5, .5, .4); // battery
  if (!eng) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(x0 + 2, y0 + 1.5, w - 3.5, h - 3); g.strokeStyle = '#555'; g.lineWidth = .25; g.beginPath(); g.moveTo(x0 + 2.5, y0 + 2); g.lineTo(x0 + w * .7, y1 - 2); g.stroke(); return; }
  const c = BAYCOL[eng] || '#9e9e9e', cx = x0 + w * .45, cy = Wd / 2;
  if (eng === 'eng_ev') { g.fillStyle = '#263238'; g.beginPath(); g.arc(cx, cy, Math.min(w, h) * .26, 0, TAU); g.fill(); g.strokeStyle = c; g.lineWidth = .6; g.stroke(); g.fillStyle = '#ff6f00'; g.fillRect(cx - w * .3, cy - .3, w * .25, .6); return; }
  const v = /v6|v8|sc8/.test(eng), banks = v ? 2 : 1, cyl = eng === 'eng_v6' ? 3 : v ? 4 : 4, bw = v ? h * .26 : h * .32, bl = w * .58;
  for (let b = 0; b < banks; b++) { const by = banks === 2 ? cy + (b ? 1 : -1) * h * .17 - bw / 2 : cy - bw / 2; g.fillStyle = '#37474f'; g.fillRect(cx - bl / 2, by - .2, bl, bw + .4); g.fillStyle = c; g.fillRect(cx - bl / 2 + .2, by, bl - .4, bw);
    g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(cx - bl / 2 + .3, by + .15, bl - .6, .3); g.fillStyle = '#111'; for (let i = 0; i < cyl; i++) g.fillRect(cx - bl / 2 + .6 + i * (bl - 1) / cyl, by + bw * .45, .45, .45); }
  if (v) { g.fillStyle = '#546e7a'; g.fillRect(cx - bl * .35, cy - h * .06, bl * .7, h * .12); }
  if (eng === 'eng_sc8') { g.fillStyle = '#9e9e9e'; g.fillRect(cx - bl * .3, cy - h * .16, bl * .6, h * .32); g.fillStyle = '#212121'; for (let i = 0; i < 4; i++) g.fillRect(cx - bl * .26 + i * bl * .14, cy - h * .12, bl * .06, h * .24); g.fillStyle = '#bdbdbd'; g.beginPath(); g.arc(cx + bl * .38, cy, h * .1, 0, TAU); g.fill(); }
  if (eng === 'eng_i4t') { g.fillStyle = '#b0bec5'; g.beginPath(); g.arc(cx + bl * .45, y0 + h * .22, h * .14, 0, TAU); g.fill(); g.strokeStyle = '#78909c'; g.lineWidth = .3; g.beginPath(); g.arc(cx + bl * .45, y0 + h * .22, h * .07, 0, 4.5); g.stroke(); }
  g.fillStyle = '#1b1b1b'; g.beginPath(); g.arc(x0 + w * .82, cy, h * .09, 0, TAU); g.fill(); // air filter / intake
}
{ const _cs = carSprite; carSprite = function (type, color, wreck, m, full) { if (!m || (!m._bay && !m._nobay)) return _cs(type, color, wreck, m, full); const key = type + color + (wreck ? 'w' : '') + (full ? 'f' : '') + modKey(m) + '|bay' + m._bay;
  if (SPR.cars[key]) return SPR.cars[key]; const m2 = Object.assign({}, m); delete m2._bay; const base = _cs(type, color, wreck, m2, full), c = mkCanvas(base.width, base.height), g = c.getContext('2d'); g.drawImage(base, 0, 0);
  const d = CAR_TYPES[type]; if (!d.custom && !d.boat && !d.air && !d.two && !d.rider && !d.box && type !== 'truck') { g.scale(4, 4); g.translate(4, 4); drawBay(g, d, d.L, d.W, m._bay === 'none' ? null : m._bay); }
  return SPR.cars[key] = c; }; }
{ const _dc = drawCar0; drawCar0 = function (c, alpha) { const miss = c.missing && (c.missing.panels | 0) > 0; if (!miss || c.dead) return _dc(c, alpha); const mods = c.mods, eng = typeof engIdOf === 'function' ? engIdOf(c.type, c.mods, c.noEng) : null;
  c.mods = Object.assign({}, mods || {}, { _bay: eng || 'none' }); try { return _dc(c, alpha); } finally { c.mods = mods; } }; }
