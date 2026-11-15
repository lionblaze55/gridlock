// ================= BEATERS: not every car on the road is fresh off the lot — faded paint, primer panels, rust, smoke. Rougher parts of town, rougher cars =================
const BEAT_ODDS = { trailer: .5, junkyard: .46, quarry: .38, industrial: .38, docks: .34, oldtown: .3, town: .28, farmland: .3, ranch: .3, orchard: .24, woods: .26, lake: .2, coast: .16, midtown: .12, park: .12, downtown: .07, suburbs: .06, base: 0 };
const BEAT_POSH = new Set(['luxsedan', 'luxsuv', 'limo', 'super', 'hyper', 'coupe']);
function beatOdds(dn) { const k = String(dn || '').replace(/\d+$/, ''), d = DISTRICTS[dn]; let o = BEAT_ODDS[k]; if (o === undefined) o = .15; if (d && d.gang) o += .08; return Math.min(.6, o); }
const PRIMER = ['#7d8287', '#6f7377', '#8c8f8a', '#a39e93'], MISMATCH = ['#8e2c2c', '#2c4a8e', '#c9c2a8', '#3f6b3a', '#b5651d', '#d8d3c4', '#4a4a4a'];
function fadePaint(hex) { if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return hex; const n = parseInt(hex.slice(1), 16), g = [138, 132, 120], f = .38; const ch = i => Math.round(((n >> (16 - i * 8)) & 255) * (1 - f) + g[i] * f); return shade('#' + ((1 << 24) | (ch(0) << 16) | (ch(1) << 8) | ch(2)).toString(16).slice(1), .86); }
// turn a freshly spawned street car into a beater: worn parts, low condition, cheap or no mods, tired paint
function makeBeater(c, k) { const d = c.d; if (!c.st) applyMods(c);
  const keepRim = c.mods && c.mods.rim && Math.random() < .25 ? c.mods.rim : 0, keepExh = Math.random() < .2 && MODOPTS.exh ? 1 : 0;
  const m = { p: fadePaint(c.color) }; if (keepRim) m.rim = keepRim; if (keepExh && carKeys(c).includes('exh')) m.exh = 1; applyMods(c, m);
  c.beater = { k, prim: Math.random() < .55 ? pick(Math.random() < .6 ? PRIMER : MISMATCH) : null, side: Math.random() < .5 ? -1 : 1, spot: rint(0, 2), rust: [], tape: Math.random() < .3, crack: Math.random() < .35 };
  for (let i = 0, n = rint(2, 5); i < n; i++) c.beater.rust.push([rnd(-.44, .44), Math.random() < .5 ? -1 : 1, rnd(2.2, 4)]);
  const cond = clamp(rnd(.28, .66) * (1.15 - k * .3), .22, .7);
  try { ensurePC(c, c.type, cond); for (const s in c.pc) { const tired = s === 'eng' || s === 'exhaustp' || s === 'gearbox' || s === 'm:exh'; c.pc[s] = clamp(c.pc[s] * rnd(tired ? .6 : .8, 1.15), .08, .9); } c.pcAvg = pcAvg(c.pc, Object.keys(c.pc)); } catch (e) { c.pcAvg = cond; }
  c.hp = c.st.hp * clamp(c.pcAvg || cond, .2, .9); }
{ const _sm = streetMods; streetMods = function (c, district) { const fresh = !(c.mods && Object.keys(c.mods).length); _sm(c, district);
  if (!fresh || c.beater || NOMOD.has(c.type) || c.d.boat || c.d.pedal || c.owned || c.missionCar) return;
  let o = beatOdds(district); if (BEAT_POSH.has(c.type)) o *= .2; if (c.driver && c.driver.gang) o *= .6;
  if (Math.random() < o) makeBeater(c, o); }; }
{ const _mt = makeTrafficAI; makeTrafficAI = function (c, dir, lane) { _mt(c, dir, lane); if (c.beater && c.ai && !c.owned) c.ai.cruise *= rnd(.78, .9); }; }
// the look: drawn on top of the body, in the car's own frame (x = length, front is +x)
function drawBeater(c) { const B = c.beater; if (!B || c.dead || c.d.boat || c.d.rider || c.d.two) return; const g = ctx, L = c.L, W = c.W;
  g.save(); g.globalAlpha = .9;
  if (B.prim) { g.fillStyle = B.prim; if (B.spot === 0) g.fillRect(L * .22, -W / 2 + 2, L * .22, W - 4); // hood
    else if (B.spot === 1) g.fillRect(-L * .08, B.side < 0 ? -W / 2 + 1 : 0, L * .2, W / 2 - 1); // a door
    else g.fillRect(L * .36, B.side < 0 ? -W / 2 + 1 : 1, L * .12, W / 2 - 2); } // a fender
  for (const [x, s, r] of B.rust) { g.fillStyle = '#6b3d1c'; g.beginPath(); g.arc(x * L, s * (W / 2 - 2.5), r, 0, TAU); g.fill(); g.fillStyle = '#a0612c'; g.beginPath(); g.arc(x * L + r * .3, s * (W / 2 - 2.5), r * .5, 0, TAU); g.fill(); }
  if (B.tape) { g.globalAlpha = .9; g.fillStyle = '#b8bcc2'; g.fillRect(-L / 2 + 1, -W * .3, 3, W * .6); }
  if (B.crack) { g.globalAlpha = .7; g.strokeStyle = '#fff'; g.lineWidth = .7; g.beginPath(); g.moveTo(L * .16, -W * .2); g.lineTo(L * .2, 0); g.lineTo(L * .15, W * .12); g.moveTo(L * .2, 0); g.lineTo(L * .24, W * .08); g.stroke(); }
  g.restore(); }
{ const _de = drawCarExtras; drawCarExtras = function (c) { _de(c); if (c.beater) drawBeater(c); }; }
// they sound and smell like it too: a blue haze off the tailpipe and the odd backfire
function beaterTick(dt) { if ((G.btT = (G.btT || 0) - dt) > 0) return; G.btT = .12; const p = pCar() || G.player; if (!p || G.scene) return;
  for (const c of G.cars) { if (!c.beater || c.dead || !c.driver || c.d.boat || c.totaled) continue; const d2 = dist2(c.x, c.y, p.x, p.y); if (d2 > 900 * 900) continue;
    const th = c === pCar() ? Math.max(0, c.throttle || 0) : .6, ex = c.x - Math.cos(c.a) * c.L * .55, ey = c.y - Math.sin(c.a) * c.L * .55;
    if (Math.random() < .12 * (.4 + th) * (1.4 - (c.pcAvg || .5)) && inView(ex, ey, 40)) spawnFx('smoke', ex, ey);
    if (d2 < 500 * 500 && Math.random() < .006 * (1.5 - (c.pcAvg || .5))) Snd.pop(ex, ey, Math.random() < .35, .55); } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') beaterTick(dt); }; }
// once it's yours it stays rough-looking until a body shop sorts it out
{ const _sr = shopRepairDo; shopRepairDo = function (c) { _sr(c); if (c.beater) { c.beater = null; } }; }
{ const _sc = storeCar; storeCar = function (c) { const L = myCars(), n = L.length; _sc(c); if (c.beater && L.length > n) L[L.length - 1].beat = c.beater; };
  const _to = takeOut; takeOut = function (i, g) { const rec = myCars()[i], n = G.cars.length; _to(i, g); const c = G.cars[G.cars.length - 1]; if (rec && rec.beat && G.cars.length > n && c && c.type === rec.type) c.beater = rec.beat; };
  const _dc = deliverCar; deliverCar = function (i) { const rec = myCars()[i], n = G.cars.length; _dc(i); const c = G.cars[G.cars.length - 1]; if (rec && rec.beat && G.cars.length > n && c && c.type === rec.type) c.beater = rec.beat; }; }
