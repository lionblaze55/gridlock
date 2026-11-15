// ================= MORE VEHICLES, TUNING, ENGINE SWAPS, PROJECT GARAGE =================
Object.assign(CAR_TYPES.van, { box: 1 }); Object.assign(CAR_TYPES.swat, { box: 1, siren: 1, eb: 24 }); Object.assign(CAR_TYPES.cop, { siren: 1 });
Object.assign(CAR_TYPES.pickup, { pick: 1, off: .75 }); Object.assign(CAR_TYPES.truck, { eb: 22, off: .4 }); Object.assign(CAR_TYPES.sports, { off: .15 }); Object.assign(CAR_TYPES.muscle, { off: .25 });
Object.assign(CAR_TYPES.tractor, { off: 1, eb: 20 }); Object.assign(CAR_TYPES.bike, { two: 1, rider: 1, off: .45, eb: 25, wl: 6.5, wt: 2.8, seat: 8, bar: 14.5, loud: .3 });
Object.assign(CAR_TYPES, {
  suv: { name: 'Bulldog', L: 36, W: 19, max: 520, acc: 370, steer: 2.5, grip: 8, hp: 150, mass: 1.4, off: .6, cols: ['#1c1c1c', '#34495e', '#7b241c', '#ecf0f1', '#1e8449', '#5d6d7e'], deco(g, L, Wd) { g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(L * .3, 3.2, L * .3, .7); g.fillRect(L * .3, Wd - 3.9, L * .3, .7); g.fillStyle = '#111'; g.fillRect(-.9, Wd / 2 - 2.6, 1.3, 5.2); } },
  limo: { name: 'Senator', L: 52, W: 17, max: 500, acc: 300, steer: 1.9, grip: 8, hp: 140, mass: 1.5, cols: ['#111111', '#f4f4f4', '#2c3e50'], deco(g, L, Wd) { g.fillStyle = 'rgba(0,0,0,.45)'; for (const f of [.3, .38, .46, .54]) { g.fillRect(L * f, .9, .4, 1.1); g.fillRect(L * f, Wd - 2, .4, 1.1); } g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(L * .34, Wd / 2 - 1.6, L * .22, 3.2); } },
  ambulance: { name: 'Lifeline', box: 1, siren: 1, barX: 22, L: 40, W: 19, max: 540, acc: 380, steer: 2.4, grip: 8, hp: 180, mass: 1.7, cols: ['#f4f4f4'], deco(g, L, Wd) { g.fillStyle = '#d32f2f'; g.fillRect(1.6, 2, L * .74, 1.1); g.fillRect(1.6, Wd - 3.1, L * .74, 1.1); g.fillRect(L * .34, Wd / 2 - 3.4, 2.2, 6.8); g.fillRect(L * .34 - 2.3, Wd / 2 - 1.1, 6.8, 2.2); g.fillStyle = '#ff9800'; g.fillRect(L * .1, Wd / 2 - .5, L * .14, 1); } },
  jeep: { name: 'Mudhen', custom: 1, dynF: 1, L: 31, W: 17, max: 480, acc: 400, steer: 2.8, grip: 8, hp: 130, mass: 1.1, off: .95, wt: 3.6, cols: ['#556b2f', '#b9770e', '#7b241c', '#d5d8dc', '#1a5276'] },
  boxtruck: { name: 'Mule', custom: 1, dynF: 1, L: 46, W: 20, max: 400, acc: 230, steer: 2.0, grip: 8, hp: 220, mass: 2.2, axF: .78, eb: 24, cols: ['#c0392b', '#2471a3', '#1e8449', '#d68910', '#6c3483'] },
  dump: { name: 'Dumper', custom: 1, dynF: 1, L: 46, W: 22, max: 340, acc: 200, steer: 1.9, grip: 8, hp: 340, mass: 3.2, off: .6, axF: .76, wt: 3.8, eb: 20, cols: ['#f1c40f', '#e67e22', '#839192'] },
  bus: { name: 'Metro Liner', custom: 1, dynF: 1, L: 58, W: 20, max: 390, acc: 200, steer: 1.7, grip: 8, hp: 300, mass: 3, axF: .76, eb: 22, cols: ['#2e86c1', '#f4f4f4', '#27ae60', '#e67e22'] },
  firetruck: { name: 'Blaze', custom: 1, dynF: 1, siren: 1, barX: 30, L: 54, W: 21, max: 470, acc: 300, steer: 1.9, grip: 8, hp: 320, mass: 3, axF: .78, wt: 3.6, eb: 22, cols: ['#c62828'] },
  sportbike: { name: 'Wasp RR', custom: 1, two: 1, rider: 1, L: 21, W: 8, max: 880, acc: 780, steer: 3.4, grip: 10, hp: 45, mass: .4, off: .15, eb: 56, wl: 6, wt: 2.8, seat: 7.5, bar: 14.5, cols: ['#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#f4f4f4', '#111111'] },
  dirtbike: { name: 'Scrambler', custom: 1, two: 1, rider: 1, L: 20, W: 8, max: 600, acc: 700, steer: 3.6, grip: 9, hp: 45, mass: .35, off: 1, eb: 58, wl: 6.5, wt: 2.6, seat: 7.5, bar: 13.6, cols: ['#e67e22', '#27ae60', '#2980b9', '#f1c40f', '#c0392b'] },
  scooter: { name: 'Pronto', custom: 1, two: 1, rider: 1, nohelm: 1, L: 17, W: 8, max: 360, acc: 380, steer: 3.6, grip: 10, hp: 40, mass: .3, off: .3, eb: 64, wl: 4.5, wt: 2.4, seat: 5.5, bar: 12.2, cols: ['#48c9b0', '#f5b7b1', '#f7dc6f', '#ecf0f1', '#e74c3c', '#85c1e9'] },
  bmx: { name: 'BMX', custom: 1, two: 1, rider: 1, pedal: 1, nohelm: 1, L: 15, W: 7, max: 250, acc: 330, steer: 4, grip: 11, hp: 30, mass: .12, off: .7, wl: 5.5, wt: 1.4, seat: 5, bar: 10.5, cols: ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#111111', '#9b59b6'] },
  quad: { name: 'Mudcat', custom: 1, dynF: 1, rider: 1, L: 19, W: 14, max: 520, acc: 560, steer: 3.2, grip: 8.5, hp: 60, mass: .5, off: 1, eb: 46, wl: 6, wt: 4, axF: .63, seat: 6.5, bar: 11.8, cols: ['#c0392b', '#27ae60', '#f39c12', '#2471a3', '#111111'] },
});
TRAFFIC_MIX.push('suv', 'suv', 'boxtruck', 'bus', 'scooter', 'scooter', 'sportbike', 'limo', 'compact', 'sedan'); RTRAFFIC.push('jeep', 'jeep', 'dump', 'quad', 'dirtbike', 'suv', 'pickup');
const PARK_MIX = ['compact', 'compact', 'sedan', 'sedan', 'sports', 'muscle', 'taxi', 'van', 'pickup', 'suv', 'suv', 'jeep', 'scooter', 'scooter', 'sportbike', 'bmx', 'bmx', 'dirtbike', 'limo'];
Object.assign(TRUNKCAP, { suv: 70, limo: 60, ambulance: 100, jeep: 45, boxtruck: 260, dump: 300, bus: 150, firetruck: 120, sportbike: 4, dirtbike: 4, scooter: 8, bmx: 0, quad: 14 });
const CARVAL = { tractor: 500, bike: 900, compact: 300, sedan: 450, taxi: 400, sports: 1500, muscle: 1100, van: 600, pickup: 700, truck: 900, cop: 1300, swat: 2600, suv: 800, limo: 1400, ambulance: 1200, jeep: 750, boxtruck: 850, dump: 1000, bus: 1100, firetruck: 2200, sportbike: 1300, dirtbike: 600, scooter: 200, bmx: 60, quad: 550 };
function carValue(c) { return CARVAL[c.type] || 400; }

// ---------- tuning ----------
const ENGS = [{ id: 'stock', n: 'Stock engine' }, { id: 'eng_i4t', n: 'Turbo four "Screamer"', max: 1.06, acc: 1.18, eb: 44 }, { id: 'eng_v6', n: 'V6 "Torque Six"', max: 1.1, acc: 1.22, eb: 34 }, { id: 'eng_v8', n: 'V8 "Brute 5.7"', max: 1.18, acc: 1.38, eb: 27, grip: .97 }, { id: 'eng_sc8', n: 'Supercharged V8 "Hellfire"', max: 1.3, acc: 1.6, eb: 25, grip: .94, loud: .2 }, { id: 'eng_ev', n: 'Electric "Volt" drive', max: 1.12, acc: 1.75, ev: 1, eb: 74 }, { id: 'eng_i4', n: 'Economy four', max: .92, acc: .88, eb: 40 }];
Object.assign(MODOPTS, {
  swp: { n: 'Engine swap', o: [['Stock engine', 0], [ENGS[1].n, 3500], [ENGS[2].n, 5000], [ENGS[3].n, 8000], [ENGS[4].n, 14000], [ENGS[5].n, 11000], [ENGS[6].n, 400]] },
  trn: { n: 'Transmission', o: [['Stock', 0], ['Short-ratio gearbox', 900], ['Race 6-speed', 2400]] },
  exh: { n: 'Exhaust', o: [['Stock', 0], ['Sport cat-back', 450], ['Straight pipe', 0], ['Race exhaust', 1800]] },
  ecu: { n: 'ECU', o: [['Stock map', 0], ['Performance remap', 1200]] },
  wgt: { n: 'Weight reduction', o: [['None', 0], ['Stripped interior', 800], ['Full race shell', 2200]] },
  drv: { n: 'Drivetrain', o: [['Stock', 0], ['All-wheel drive', 2600], ['Drift setup', 1500]] },
  tyr: { n: 'Tires', o: [['Street', 0], ['Sport', 500], ['Racing slicks', 1300], ['Off-road knobbies', 700]] },
});
MODOPTS.nos.o.push(['Big bottle (5 shots)', 4200]);
Object.assign(MODDESC, {
  swp: 'A whole different engine. Changes top speed, acceleration and the sound of the car. Big engines in light cars get twitchy; the electric drive is nearly silent and launches hardest. Stacks with engine tuning.',
  trn: 'Short ratios trade a little top speed for punch. The race box gives you both.', exh: 'Frees up power and gets louder at every step. The top option is fitted to suit the vehicle — side pipes, stacks, a shorty or a flame-spitting race system.',
  ecu: 'Remapped fuel and ignition: a clean bump in speed and acceleration.', wgt: 'Less weight: faster off the line and quicker to turn, but the body takes less punishment.',
  drv: 'All-wheel drive launches harder, grips more and copes better off-road. The drift setup breaks the rear loose on purpose — less grip, much sharper steering.',
  tyr: 'Sport tires grip more. Slicks grip most on dry tarmac but are bad in rain and useless on grass. Knobbies let you keep your speed off-road.',
  nos: 'Nitrous: 2.4 seconds of extra speed per shot. The kit holds 3 shots, the big bottle 5. Recharges slowly, or refill at a garage.',
});
const EXH3 = c => c.d.two ? 'Shorty pipe' : c.L > 88 ? 'Chrome stacks' : (c.type === 'muscle' || c.d.pick || c.type === 'suv' || c.type === 'jeep') ? 'Side pipes' : 'Titanium race (spits flame)';
function modOpts(k, c) { const o = MODOPTS[k].o; if (k === 'exh') return o.map((e, i) => i === 3 ? [EXH3(c), e[1]] : e); return o; }
function perfKeys(c) { const d = c.d; if (d.pedal) return []; if (d.rider) return ['eng', 'trn', 'exh', 'ecu', 'tyr', 'nos', 'brk', 'hnd']; return ['eng', 'swp', 'tur', 'trn', 'exh', 'ecu', 'wgt', 'drv', 'tyr', 'nos', 'brk', 'hnd', 'arm']; }
function garTabs0(c) { const d = c.d; if (d.pedal) return GTABS.filter(t => t[0] === 'paint' || t[0] === 'service'); if (d.custom) return GTABS.filter(t => t[0] !== 'style' && t[0] !== 'body'); return GTABS; }
const nosCap = c => c.mods && c.mods.nos === 2 ? 5 : 3;
function calcSt0(d, m) {
  m = m || {}; const eng = m.eng || 0, tur = m.tur || 0, hnd = m.hnd || 0, brk = m.brk || 0, arm = m.arm || 0, trn = m.trn || 0, tyr = m.tyr || 0, wgt = m.wgt || 0, exh = m.exh || 0, ecu = m.ecu || 0, drv = m.drv || 0, E = ENGS[m.swp || 0] || ENGS[0];
  const fast = clamp((d.max - 450) / 400, 0, 1) * .6, em = E.max ? lerp(E.max, 1 + (E.max - 1) * .35, fast) : 1, ea = E.acc ? lerp(E.acc, 1 + (E.acc - 1) * .5, fast) : 1;
  const max = (1 + .07 * eng + .06 * tur + [0, -.03, .05][trn] + [0, .02, .03, .04][exh] + .04 * ecu) * em;
  const acc = (1 + .13 * eng + .2 * tur + [0, .1, .13][trn] + [0, .06, .12][wgt] + [0, .03, .05, .07][exh] + .05 * ecu) * ea;
  const grip = (1 + .13 * hnd + .03 * (m.sp ? 1 : 0) + .03 * (m.sk || 0) + [0, .08, .16, -.05, .26][tyr] + [0, .05, -.24][drv]) * (E.grip || 1);
  return { max: d.max * max, acc: d.acc * acc, grip: d.grip * grip, steer: d.steer * (1 + .07 * hnd + [0, .03, .06][wgt] + [0, 0, .12][drv]), brk: 1200 * (1 + .3 * brk) * (1 + [0, .05, .1, 0, .14][tyr]), hp: d.hp * (1 + .4 * arm) * [1, .95, .9][wgt],
    off: clamp((d.off === undefined ? .35 : d.off) + [0, -.05, -.25, .4, -.18][tyr] + [0, .15, 0][drv], 0, 1), rainK: tyr === 2 ? .8 : tyr === 4 ? .9 : 1, launch: (drv === 1 ? 1.25 : 1) * (E.ev ? 1.2 : 1), eb: E.eb || 0, ev: E.ev || 0, loud: [0, .15, .35, .5][exh] + (E.loud || 0) + (d.loud || 0) };
}
function applyMods(c, m) {
  if (m !== undefined) c.mods = m; m = c.mods || {}; const hpOld = c.st ? c.st.hp : c.d.hp;
  c.st = calcSt(c.d, m); if (c.hp > 0 && c.st.hp !== hpOld) c.hp = c.hp / hpOld * c.st.hp;
  if (m.nos && c.nos === 0 && !c.nosInit) { c.nos = nosCap(c); c.nosInit = 1; }
  if (m.p) c.color = m.p;
}
function statBars(c) { const s = c.st; return [['Top speed', s.max / 1000], ['Acceleration', s.acc / 1250], ['Handling', (s.grip / 14 + s.steer / 4) / 2], ['Braking', s.brk / 2400], ['Armor', s.hp / 500], ['Off-road', s.off === undefined ? .35 : s.off]]; }
function surfK(c) { // speed factor for the ground under the vehicle
  const t = tileAt(Math.floor(c.x / T), Math.floor(c.y / T)), off = c.st.off === undefined ? .35 : c.st.off;
  if (t === TILE.DIRT || t === TILE.PATH) return lerp(.84, 1, off);
  if (t === TILE.GRASS || t === TILE.FIELD || t === TILE.SAND) return lerp(.5, 1, off);
  return 1;
}
function vehTick(c, d, dt, rainG) { // called from updateCar with the frame's working stats
  tyreTick(c, d, dt);
  const base = c.st;
  if (!c.remote && !G.scene) { const k = surfK(c); if (k < 1) { d.max *= k; d.acc *= .6 + .4 * k; d.grip *= .72 + .28 * k; if (c.driver && c.spd > 150 && Math.random() < dt * 14 && dist2(c.x, c.y, G.cam.x, G.cam.y) < 5e5) { const f = spawnFx('exh', c.x - Math.cos(c.a) * c.L * .4 + rnd(-6, 6), c.y - Math.sin(c.a) * c.L * .4 + rnd(-6, 6)); if (f) { f.s = (f.s || 4) * 1.5; } } } }
  if (rainG < 1 && base.rainK) d.grip *= base.rainK;
  if (base.launch > 1 && Math.abs(c.fwd) < base.max * .35) d.acc *= base.launch;
  if (c.mods && c.mods.exh === 3 && !c.d.two && c.L <= 88 && c.driver) { if (c.lastTh > .5 && c.throttle <= 0 && c.spd > base.max * .45) c.popT = .35; c.lastTh = c.throttle; if (c.popT > 0) { c.popT -= dt; if (Math.random() < dt * 22) spawnFx('fire', c.x - Math.cos(c.a) * (c.L / 2 + 5) + rnd(-3, 3), c.y - Math.sin(c.a) * (c.L / 2 + 5) + rnd(-3, 3)); } }
}
function riderCrash(c, v) {
  if (!c.d.rider || c.dead) return; const lim = c.d.pedal ? 190 : 270; if (v < lim) return;
  if (c === pCar()) { const pl = G.player, vx = c.vx, vy = c.vy; exitCar(true); pl.kx = -vx * .5 + Math.cos(c.a) * 160; pl.ky = -vy * .5 + Math.sin(c.a) * 160; hurtPlayer(Math.min(50, 8 + (v - lim) * .1), null, 'crash'); toast('Thrown off!'); G.cam.shake = 10; }
  else if (c.driver && c.ai && c.ai.mode !== 'parked') { const q = new Ped(c.x, c.y, { role: 'civ', gang: c.driver.gang || null }); if (c.driver.skin) q.skin = c.driver.skin; if (c.driver.shirt) q.shirt = c.driver.shirt; q.kx = Math.cos(c.a) * 200; q.ky = Math.sin(c.a) * 200; q.state = 'flee'; q.timer = 6; G.peds.push(q); c.driver = null; c.ai = { mode: 'parked' }; }
}

// ---------- drawing ----------
function frontWheelSpec(d, m) {
  if (d.two) { const wl = d.wl || 6; return { x: d.L - wl / 2 + .6, ys: [0], wl, wt: d.wt || 2.8 }; }
  const wl = d.wl || Math.max(5.5, d.L * .17), y = d.W / 2 - .3 + (d.wo || 0) + (m && m.sk ? .5 : 0);
  return { x: d.L * (d.axF || .72) + wl / 2, ys: [-y, y], wl, wt: d.wt || 3.2 };
}
function drawFrontWheels(c) {
  const d = c.d; if (c.dead || (d.custom && !d.dynF && !d.two)) return; const m = c.mods || {}, F = frontWheelSpec(d, m);
  c.sv = lerp(c.sv || 0, (c.steer || 0) * (d.two ? .6 : .5), .25); c.roll = (c.roll || 0) + (c.remote ? (Math.hypot(c.vx, c.vy) || 0) : Math.abs(c.fwd || 0)) * .016;
  const rimC = d.custom ? '#8f949b' : ((RIMS[m.rim || 0] || RIMS[0]).c || m.s || '#ccc'), wl = F.wl, wt = F.wt, off = c.roll % 3.2;
  for (const y of F.ys) {
    const tyW = !d.two && !d.custom ? (m.tyr === 3 ? 1.1 : m.tyr === 2 ? .5 : 0) : 0; ctx.save(); ctx.translate((F.x - d.L / 2) * 2, (y + Math.sign(y) * tyW * .5) * 2); ctx.rotate(c.sv);
    if (!d.two) { ctx.scale(2, 2); drawTyre(ctx, -wl / 2, -wt / 2 - tyW / 2, wl, y < 0, rimC, d.custom ? {} : m, off / 2, wt + tyW); }
    else { ctx.fillStyle = '#0b0b0b'; ctx.fillRect(-wl, -wt, wl * 2, wt * 2); ctx.fillStyle = '#2a2a2a'; for (let x = -wl + off; x < wl - 1; x += 3.2) ctx.fillRect(x, -wt, 1.1, wt * 2); }
    if (d.two && !d.pedal) { ctx.fillStyle = '#9aa0a6'; ctx.fillRect(-wl * .5, -wt - 1.4, wl * 1.2, 1.2); ctx.fillRect(-wl * .5, wt + .2, wl * 1.2, 1.2); }
    ctx.restore();
  }
}
function drawRider(c) {
  const d = c.d; if (!d.rider || !c.driver || c.dead) return; const dr = c.driver, sx = ((d.seat || d.L * .38) - d.L / 2) * 2, bx = ((d.bar || d.L * .7) - d.L / 2) * 2, hw = d.W - 1.5;
  const jk = dr.gang ? '#1c1c1c' : (dr.shirt || '#445'), skin = dr.skin || '#e0ac69', el = (x, y, a, b) => { ctx.beginPath(); ctx.ellipse(x, y, a, b, 0, 0, TAU); ctx.fill(); };
  ctx.save(); ctx.rotate((c.sv || 0) * .22);
  if (d.pedal) { const ph = (c.roll || 0) * .5; ctx.fillStyle = '#2c3e50'; ctx.fillRect(sx + 3 + Math.sin(ph) * 2.5, -5.2, 6, 2.6); ctx.fillRect(sx + 3 - Math.sin(ph) * 2.5, 2.6, 6, 2.6); }
  ctx.strokeStyle = jk; ctx.lineWidth = 3.2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(sx + 3, -4.6); ctx.lineTo(bx, -hw); ctx.moveTo(sx + 3, 4.6); ctx.lineTo(bx, hw); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(bx, -hw, 1.9, 0, TAU); ctx.arc(bx, hw, 1.9, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.5)'; el(sx, 0, 7.4, 6.9); ctx.fillStyle = jk; el(sx, 0, 6.5, 6); ctx.fillStyle = 'rgba(255,255,255,.12)'; el(sx - 1, -1.5, 3, 2.4);
  const hx = sx + 4.6;
  if (d.nohelm && !dr.gang) { ctx.fillStyle = dr.hair || '#3b2314'; el(hx, 0, 4.7, 4.7); ctx.fillStyle = skin; el(hx + 1.7, 0, 3, 3.3); }
  else { ctx.fillStyle = dr.gang ? '#111' : c.type === 'sportbike' ? shade(c.color, .9) : c.type === 'dirtbike' || c.type === 'quad' ? '#f4f4f4' : '#c0392b'; el(hx, 0, 5.2, 5); ctx.fillStyle = '#0d1117'; ctx.fillRect(hx + 1.6, -3.4, 2.6, 6.8); ctx.fillStyle = 'rgba(255,255,255,.35)'; el(hx - 1, -1.8, 1.8, 1.4); }
  ctx.restore();
}
function drawCarExtras(c) { // exhaust hardware that shows on the body
  if (c.d.boat) return drawWake(c);
  drawFlats(c);
  const m = c.mods; if (!m || m.exh !== 3 || c.dead || c.d.two) return;
  if (c.L > 88) { ctx.fillStyle = '#cfd4da'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(c.L * .16, s * (c.W / 2 - 3), 3, 0, TAU); ctx.fill(); } ctx.fillStyle = '#222'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(c.L * .16, s * (c.W / 2 - 3), 1.5, 0, TAU); ctx.fill(); } }
  else if (EXH3(c) === 'Side pipes') { ctx.fillStyle = '#cfd4da'; ctx.fillRect(-c.L * .22, -c.W / 2 - 2.2, c.L * .42, 2); ctx.fillRect(-c.L * .22, c.W / 2 + .2, c.L * .42, 2); ctx.fillStyle = '#333'; ctx.fillRect(-c.L * .22 - 2, -c.W / 2 - 2.2, 2, 2); ctx.fillRect(-c.L * .22 - 2, c.W / 2 + .2, 2, 2); }
  else { ctx.fillStyle = '#b8c6d6'; ctx.fillRect(-c.L / 2 - 3, -6.5, 4, 3.2); ctx.fillRect(-c.L / 2 - 3, 3.3, 4, 3.2); ctx.fillStyle = '#111'; ctx.fillRect(-c.L / 2 - 3, -5.7, 1.5, 1.6); ctx.fillRect(-c.L / 2 - 3, 4.1, 1.5, 1.6); }
}
function drawCustomCar0(g, type, col, L, Wd, wreck, fw) {
  const d = CAR_TYPES[type], dk = shade(col, .6), lt = shade(col, 1.3), m = Wd / 2, glass = wreck ? '#0a0a0a' : '#16283a', glassB = wreck ? '#151515' : '#5d84a8', lamp = '#fffbd0';
  const rr = (x, y, w, h, r) => { g.beginPath(); g.roundRect ? g.roundRect(x, y, w, h, r) : g.rect(x, y, w, h); g.fill(); };
  const wheel = (x, y, l, t, knob) => { g.fillStyle = '#0b0b0b'; rr(x, y, l, t, Math.min(1, t / 2)); g.fillStyle = knob ? '#3a3a3a' : '#262626'; for (let i = .8; i < l - .4; i += knob ? 1.3 : 1.6) g.fillRect(x + i, y, .6, t); };
  const F = frontWheelSpec(d, {}), fws = () => { if (fw) for (const y of F.ys) wheel(F.x - F.wl / 2, m + y - F.wt / 2, F.wl, F.wt, type === 'dirtbike' || type === 'quad'); };
  const rears = (ax, l, t) => { const y = d.W / 2 - .3 + (d.wo || 0); wheel(L * ax, m - y - t / 2, l, t); wheel(L * ax, m + y - t / 2, l, t); };
  const body = (x, y, w, h, r, c1) => { g.fillStyle = 'rgba(0,0,0,.55)'; rr(x - .4, y - .4, w + .8, h + .8, r + .3); const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, shade(c1, .6)); gr.addColorStop(.2, c1); gr.addColorStop(.5, shade(c1, 1.3)); gr.addColorStop(.8, c1); gr.addColorStop(1, shade(c1, .6)); g.fillStyle = gr; rr(x, y, w, h, r); };
  const lights = (y0, y1) => { if (wreck) return; g.fillStyle = lamp; g.fillRect(L - 1.3, y0, 1.3, 2.2); g.fillRect(L - 1.3, y1 - 2.2, 1.3, 2.2); g.fillStyle = '#d61f1f'; g.fillRect(0, y0, .9, 2); g.fillRect(0, y1 - 2, .9, 2); };
  switch (type) {
    default: drawCustom2(g, type, col, L, Wd, wreck); break;
    case 'tractor': {
      g.fillStyle = '#0d0d0d'; g.fillRect(1, -3, 12, 5); g.fillRect(1, Wd - 2, 12, 5); g.fillStyle = '#2a2a2a'; for (let x = 2; x < 13; x += 2.4) { g.fillRect(x, -3, 1, 5); g.fillRect(x, Wd - 2, 1, 5); }
      g.fillStyle = '#111'; g.fillRect(L - 8, 1.5, 6, 2.5); g.fillRect(L - 8, Wd - 4, 6, 2.5);
      g.fillStyle = dk; g.fillRect(3, 3, 12, Wd - 6); g.fillStyle = col; g.fillRect(12, 5, L - 14, Wd - 10); g.fillStyle = lt; g.fillRect(13, m - 1.5, L - 16, 3);
      g.fillStyle = wreck ? '#111' : '#1d3044'; g.fillRect(4, 4, 9, Wd - 8); g.fillStyle = wreck ? '#222' : lt; g.fillRect(5, 5, 7, Wd - 10);
      g.fillStyle = '#333'; g.beginPath(); g.arc(L - 9, 6.5, 1.3, 0, TAU); g.fill(); if (!wreck) { g.fillStyle = lamp; g.fillRect(L - 2.5, 5.5, 1.5, 2); g.fillRect(L - 2.5, Wd - 7.5, 1.5, 2); } break;
    }
    case 'bike': {
      wheel(-1, m - 1.6, 7, 3.2); fws(); g.fillStyle = '#9aa0a6'; g.fillRect(L - 9, m - .5, 5, 1);
      g.fillStyle = '#8a8f96'; g.fillRect(2, m - 3.3, 6.5, 1.1); g.fillRect(2, m + 2.2, 6.5, 1.1);
      g.fillStyle = dk; rr(4, m - 2.2, L - 10, 4.4, 1.2); g.fillStyle = col; g.beginPath(); g.ellipse(L * .56, m, 4.2, 2.6, 0, 0, TAU); g.fill(); g.fillStyle = lt; g.fillRect(L * .48, m - .6, 4, 1.2);
      g.fillStyle = '#1a1a1a'; rr(4.5, m - 2, 6.5, 4, 1.2); g.fillStyle = '#b9bec4'; g.fillRect(L - 8, 0, 1.1, Wd); g.fillStyle = '#222'; g.fillRect(L - 8.5, -.6, 2.2, 1.6); g.fillRect(L - 8.5, Wd - 1, 2.2, 1.6);
      if (!wreck) { g.fillStyle = lamp; g.beginPath(); g.arc(L - 5.6, m, 1.2, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(3.2, m - 1, 1, 2); } break;
    }
    case 'sportbike': {
      wheel(-.5, m - 1.5, 6, 3); fws(); g.fillStyle = '#8a8f96'; g.fillRect(3, m - .6, 5, 1.2); g.fillRect(L - 8, m - .5, 4, 1);
      g.fillStyle = 'rgba(0,0,0,.5)'; g.beginPath(); g.moveTo(2.6, m); g.lineTo(6, m - 2.6); g.lineTo(L * .62, m - 3.6); g.lineTo(L - 3.2, m - 1.4); g.lineTo(L - 3.2, m + 1.4); g.lineTo(L * .62, m + 3.6); g.lineTo(6, m + 2.6); g.fill();
      g.fillStyle = col; g.beginPath(); g.moveTo(3, m); g.lineTo(6, m - 2.2); g.lineTo(L * .62, m - 3.2); g.lineTo(L - 3.6, m - 1.2); g.lineTo(L - 3.6, m + 1.2); g.lineTo(L * .62, m + 3.2); g.lineTo(6, m + 2.2); g.fill();
      g.fillStyle = lt; g.beginPath(); g.ellipse(L * .52, m, 2.8, 1.7, 0, 0, TAU); g.fill(); g.fillStyle = '#141414'; rr(5.2, m - 1.5, 4.6, 3, 1); g.fillStyle = wreck ? '#111' : shade(col, .45); g.fillRect(L * .3, m - 2.6, 3, .7); g.fillRect(L * .3, m + 1.9, 3, .7);
      g.fillStyle = glass; g.beginPath(); g.moveTo(L * .66, m - 2.2); g.lineTo(L * .78, m - 1.2); g.lineTo(L * .78, m + 1.2); g.lineTo(L * .66, m + 2.2); g.fill();
      g.fillStyle = '#222'; g.fillRect(L * .68, m - 3.9, 1, 1.9); g.fillRect(L * .68, m + 2, 1, 1.9); g.fillStyle = '#b9bec4'; g.fillRect(1.6, m + 1.6, 4, 1);
      if (!wreck) { g.fillStyle = lamp; g.fillRect(L - 4.4, m - .9, 1, 1.8); g.fillStyle = '#d61f1f'; g.fillRect(2.6, m - .8, .9, 1.6); } break;
    }
    case 'dirtbike': {
      wheel(-.5, m - 1.5, 6.5, 3, 1); fws(); g.fillStyle = '#8a8f96'; g.fillRect(3, m - .5, 5, 1); g.fillRect(L - 8.5, m - .5, 4.5, 1);
      g.fillStyle = '#b9bec4'; g.fillRect(2.5, m + 1.5, 6, 1); g.fillStyle = dk; rr(4.5, m - 1.7, L - 10.5, 3.4, 1); g.fillStyle = col; rr(L * .42, m - 1.9, 4.6, 3.8, 1.4); g.fillStyle = lt; g.fillRect(L * .46, m - .5, 3, 1);
      g.fillStyle = '#141414'; rr(3.6, m - 1.2, 6.4, 2.4, 1); g.fillStyle = col; rr(1.2, m - 1.1, 3, 2.2, .8); rr(L - 6.6, m - 1, 2.6, 2, .7);
      g.fillStyle = '#9aa0a6'; g.fillRect(L * .68, m - 3.9, .9, 7.8); g.fillStyle = '#111'; g.fillRect(L * .68 - .3, m - 4.1, 1.5, 1.6); g.fillRect(L * .68 - .3, m + 2.5, 1.5, 1.6);
      if (!wreck) { g.fillStyle = '#f4f4f4'; g.fillRect(L * .74, m - 1.3, 1.5, 2.6); g.fillStyle = '#111'; g.fillRect(L * .74 + .4, m - .5, .7, 1); } break;
    }
    case 'scooter': {
      wheel(0, m - 1.3, 4.5, 2.6); fws(); body(1.4, m - 2.7, 7.4, 5.4, 2, col); g.fillStyle = '#2b2b2b'; g.fillRect(8.4, m - 2.2, 3.6, 4.4); g.fillStyle = 'rgba(255,255,255,.08)'; for (let x = 8.8; x < 12; x += 1) g.fillRect(x, m - 2.2, .3, 4.4);
      g.fillStyle = dk; rr(11.4, m - 3.1, 2.8, 6.2, 1.4); g.fillStyle = col; rr(11.7, m - 2.8, 2.2, 5.6, 1.2); g.fillStyle = lt; g.fillRect(12.2, m - 1.6, 1, 3.2);
      g.fillStyle = '#3a2a1e'; rr(2.4, m - 1.9, 5.6, 3.8, 1.6); g.fillStyle = '#b9bec4'; g.fillRect(L * .71, m - 3.5, .8, 7); g.fillStyle = '#111'; g.fillRect(L * .71 - .3, m - 3.8, 1.4, 1.5); g.fillRect(L * .71 - .3, m + 2.3, 1.4, 1.5);
      if (!wreck) { g.fillStyle = lamp; g.beginPath(); g.arc(13.6, m, .9, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(1.2, m - .8, .8, 1.6); } break;
    }
    case 'bmx': {
      g.fillStyle = '#151515'; rr(0, m - .7, 5.5, 1.4, .6); if (fw) rr(F.x - F.wl / 2, m - .7, F.wl, 1.4, .6); g.fillStyle = '#8a8f96'; g.fillRect(1, m - .25, 3.5, .5);
      g.strokeStyle = col; g.lineWidth = 1.1; g.lineCap = 'round'; g.beginPath(); g.moveTo(2.8, m); g.lineTo(L - 3.6, m); g.stroke(); g.lineCap = 'butt';
      g.fillStyle = '#9aa0a6'; g.fillRect(6.4, m - 2.7, 1.3, 5.4); g.fillStyle = '#222'; g.fillRect(6.1, m - 3.3, 1.9, 1.2); g.fillRect(6.1, m + 2.1, 1.9, 1.2);
      g.fillStyle = '#141414'; rr(3.4, m - 1, 2.8, 2, .8); g.fillStyle = '#cfd4da'; g.fillRect(L * .7, m - 3.2, .8, 6.4); g.fillStyle = col; g.fillRect(L * .7 - .2, m - 3.5, 1.2, 1.3); g.fillRect(L * .7 - .2, m + 2.2, 1.2, 1.3); break;
    }
    case 'quad': {
      rears(.03, 6, 4); fws(); g.fillStyle = '#3a3a3a'; g.fillRect(2.5, m - .6, L - 5, 1.2); g.fillRect(3.2, 1, 1.2, Wd - 2); g.fillRect(L - 4.6, 1, 1.2, Wd - 2);
      body(3, m - 3.3, L - 5.4, 6.6, 2.2, col); g.fillStyle = col; rr(.6, .9, 6.4, 2.8, 1); rr(.6, Wd - 3.7, 6.4, 2.8, 1); rr(L - 7.6, .9, 6, 2.6, 1); rr(L - 7.6, Wd - 3.5, 6, 2.6, 1);
      g.fillStyle = lt; g.fillRect(1.4, 1.5, 4.6, .6); g.fillRect(1.4, Wd - 2.1, 4.6, .6); g.fillStyle = '#141414'; rr(4, m - 2.1, 6.8, 4.2, 1.6);
      g.fillStyle = '#6b7178'; g.fillRect(.4, m - 2.6, 3, .5); g.fillRect(.4, m - .25, 3, .5); g.fillRect(.4, m + 2.1, 3, .5); g.fillRect(L - 4.6, m - 2.4, 3.4, .5); g.fillRect(L - 4.6, m + 1.9, 3.4, .5); g.fillRect(L - 1.6, m - 2.4, .5, 4.8);
      g.fillStyle = '#9aa0a6'; g.fillRect(L * .62, m - 4.8, .9, 9.6); g.fillStyle = '#111'; g.fillRect(L * .62 - .3, m - 5.1, 1.5, 1.7); g.fillRect(L * .62 - .3, m + 3.4, 1.5, 1.7);
      if (!wreck) { g.fillStyle = lamp; g.fillRect(L - 3.4, m - 2.2, 1, 1.4); g.fillRect(L - 3.4, m + .8, 1, 1.4); } break;
    }
    case 'jeep': {
      rears(.1, 6, 3.6); fws(); body(0, 0, L, Wd, 2, col); g.fillStyle = '#111'; g.beginPath(); g.arc(.4, m, 3.4, 0, TAU); g.fill(); g.fillStyle = '#6b7178'; g.beginPath(); g.arc(.4, m, 1.4, 0, TAU); g.fill();
      g.fillStyle = '#26282c'; g.fillRect(L * .2, 2, L * .4, Wd - 4); g.fillStyle = wreck ? '#2a2420' : '#8a6a45'; rr(L * .43, 2.8, 4.2, 4.6, 1); rr(L * .43, Wd - 7.4, 4.2, 4.6, 1); rr(L * .23, 2.8, 3.6, Wd - 5.6, 1);
      g.fillStyle = '#111'; g.beginPath(); g.arc(L * .56, Wd - 5, 1.5, 0, TAU); g.fill(); g.fillStyle = '#4a4f55'; g.fillRect(L * .37, 1.2, 1.2, Wd - 2.4); g.fillRect(L * .2, 1.2, L * .18, .9); g.fillRect(L * .2, Wd - 2.1, L * .18, .9);
      g.fillStyle = glass; g.fillRect(L * .6, 1.4, 1.5, Wd - 2.8); g.fillStyle = glassB; g.fillRect(L * .6 + .9, 2, .5, Wd - 4); g.fillStyle = lt; g.fillRect(L * .68, 3, L * .26, Wd - 6); g.fillStyle = 'rgba(0,0,0,.45)'; for (let i = 0; i < 3; i++) { g.fillRect(L * .72 + i * 1.5, 4, .6, 3); g.fillRect(L * .72 + i * 1.5, Wd - 7, .6, 3); }
      g.fillStyle = '#222'; g.fillRect(L - .9, 1.2, .9, Wd - 2.4); if (!wreck) { g.fillStyle = lamp; g.beginPath(); g.arc(L - 1.6, 3.6, 1.2, 0, TAU); g.arc(L - 1.6, Wd - 3.6, 1.2, 0, TAU); g.fill(); g.fillStyle = '#d61f1f'; g.fillRect(0, 1.6, .9, 1.8); g.fillRect(0, Wd - 3.4, .9, 1.8); } break;
    }
    case 'boxtruck': {
      rears(.1, 7, 3.4); rears(.1, 7, 3.4); fws(); g.fillStyle = '#1a1a1a'; g.fillRect(L * .68, 3, L * .08, Wd - 6);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(-.4, -.4, L * .7 + .8, Wd + .8); const tg = g.createLinearGradient(0, 0, 0, Wd); tg.addColorStop(0, wreck ? '#222' : '#aab0b6'); tg.addColorStop(.5, wreck ? '#2c2c2c' : '#f2f4f6'); tg.addColorStop(1, wreck ? '#1a1a1a' : '#9aa0a6'); g.fillStyle = tg; g.fillRect(0, 0, L * .7, Wd);
      g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 2.4; x < L * .7; x += 3.4) g.fillRect(x, .5, .5, Wd - 1); if (!wreck) { g.fillStyle = col; g.fillRect(0, m - 2.6, L * .7, 5.2); g.fillStyle = lt; g.fillRect(L * .08, m - .6, L * .54, 1.2); } g.fillStyle = '#333'; g.fillRect(0, 1, .7, Wd - 2);
      body(L * .73, 1, L * .27, Wd - 2, 2.4, col); g.fillStyle = glass; g.fillRect(L * .9, 2.6, 2.6, Wd - 5.2); g.fillStyle = glassB; g.fillRect(L * .9 + 1.6, 3.2, .7, Wd - 6.4); g.fillStyle = lt; g.fillRect(L * .76, 2.6, L * .12, Wd - 5.2); g.fillStyle = dk; g.fillRect(L * .9, .2, 1.3, 1.2); g.fillRect(L * .9, Wd - 1.4, 1.3, 1.2); lights(2, Wd - 2); break;
    }
    case 'dump': {
      rears(.06, 7, 3.8); rears(.24, 7, 3.8); fws(); g.fillStyle = '#1a1a1a'; g.fillRect(2, 3, L * .74, Wd - 6);
      g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(-.4, -.4, L * .68 + .8, Wd + .8); g.fillStyle = col; g.fillRect(0, 0, L * .68, Wd); g.fillStyle = dk; g.fillRect(1.4, 1.4, L * .68 - 2.8, Wd - 2.8);
      if (!wreck) { g.fillStyle = '#6b4a2b'; g.beginPath(); g.ellipse(L * .3, m - 1, L * .22, Wd * .3, 0, 0, TAU); g.fill(); g.fillStyle = '#7d5a36'; g.beginPath(); g.ellipse(L * .42, m + 2, L * .14, Wd * .22, 0, 0, TAU); g.ellipse(L * .2, m + 1, L * .1, Wd * .2, 0, 0, TAU); g.fill(); g.fillStyle = '#5a3d22'; for (let i = 0; i < 14; i++) g.fillRect(L * .1 + (i * 7.3 % (L * .48)), 3 + (i * 5.1 % (Wd - 7)), 1, 1); }
      g.fillStyle = lt; for (let x = 0; x < L * .68; x += 5.5) g.fillRect(x, 0, .7, 1.4), g.fillRect(x, Wd - 1.4, .7, 1.4); g.fillStyle = col; g.fillRect(L * .64, 1, L * .1, Wd - 2); g.fillStyle = dk; g.fillRect(L * .64, 1, .6, Wd - 2);
      body(L * .75, 1.6, L * .25, Wd - 3.2, 2.2, col); g.fillStyle = glass; g.fillRect(L * .8, 3, 2.4, Wd - 6); g.fillStyle = glassB; g.fillRect(L * .8 + 1.5, 3.6, .6, Wd - 7.2); g.fillStyle = lt; g.fillRect(L * .87, 3.4, L * .1, Wd - 6.8); g.fillStyle = '#333'; g.fillRect(L * .86, 2, 1, 1.4); lights(2.4, Wd - 2.4); break;
    }
    case 'bus': {
      rears(.16, 7.5, 3.4); fws(); body(0, 0, L, Wd, 2.6, col); g.fillStyle = wreck ? '#1a1a1a' : shade(col, .5); g.fillRect(1, m - 6.2, L - 4, 1); g.fillRect(1, m + 5.2, L - 4, 1);
      const rg = g.createLinearGradient(0, 2.6, 0, Wd - 2.6); rg.addColorStop(0, wreck ? '#262626' : '#cfd4da'); rg.addColorStop(.5, wreck ? '#333' : '#f4f6f8'); rg.addColorStop(1, wreck ? '#222' : '#bfc5cc'); g.fillStyle = rg; rr(1.6, 2.6, L - 6.4, Wd - 5.2, 1.6);
      g.fillStyle = wreck ? '#1a1a1a' : '#8a9097'; rr(L * .18, m - 2.6, 6, 5.2, .8); rr(L * .56, m - 2.6, 6, 5.2, .8); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 4; i++) { g.fillRect(L * .18 + 1 + i * 1.3, m - 2, .5, 4); g.fillRect(L * .56 + 1 + i * 1.3, m - 2, .5, 4); } g.fillStyle = wreck ? '#222' : '#aeb4bb'; rr(L * .38, m - 1.6, 3.2, 3.2, .6);
      g.fillStyle = glass; for (let x = L * .06; x < L * .84; x += 4.4) { g.fillRect(x, .8, 3.6, 1.2); g.fillRect(x, Wd - 2, 3.6, 1.2); } g.fillRect(L - 4.2, 1.8, 2.6, Wd - 3.6); g.fillStyle = glassB; g.fillRect(L - 2.7, 2.6, .7, Wd - 5.2);
      g.fillStyle = dk; g.fillRect(L - 4.4, -.5, 1.4, 1.2); g.fillRect(L - 4.4, Wd - .7, 1.4, 1.2); if (!wreck) { g.fillStyle = '#ffb300'; g.fillRect(L - 1.2, m - 3, .8, 6); } lights(1.4, Wd - 1.4); break;
    }
    case 'firetruck': {
      rears(.08, 7, 3.6); rears(.22, 7, 3.6); fws(); body(0, 0, L, Wd, 2.2, col); g.fillStyle = wreck ? '#222' : '#f1c40f'; g.fillRect(1, 1, L * .72, .8); g.fillRect(1, Wd - 1.8, L * .72, .8);
      g.fillStyle = wreck ? '#2a2a2a' : '#b9bec4'; g.fillRect(1.6, 3.2, L * .56, Wd - 6.4); g.fillStyle = 'rgba(0,0,0,.12)'; for (let x = 2; x < L * .56; x += 1.6) g.fillRect(x, 3.2, .3, Wd - 6.4);
      g.fillStyle = wreck ? '#333' : '#e8eaed'; g.fillRect(1, m - 3.2, L * .62, 1); g.fillRect(1, m + 2.2, L * .62, 1); g.fillStyle = wreck ? '#2a2a2a' : '#8a9097'; for (let x = 2; x < L * .62; x += 2.4) g.fillRect(x, m - 2.2, .8, 4.4);
      g.fillStyle = wreck ? '#222' : '#d0d4d9'; g.fillRect(L * .6, 1.6, L * .12, Wd - 3.2); if (!wreck) { g.fillStyle = '#111'; for (const y of [4.2, m, Wd - 4.2]) { g.beginPath(); g.arc(L * .66, y, 1.3, 0, TAU); g.fill(); } g.fillStyle = '#c62828'; g.beginPath(); g.arc(L * .66, m, .6, 0, TAU); g.fill(); }
      g.fillStyle = glass; g.fillRect(L * .89, 2.4, 2.8, Wd - 4.8); g.fillStyle = glassB; g.fillRect(L * .89 + 1.8, 3, .7, Wd - 6); g.fillStyle = wreck ? '#2a2a2a' : '#f4f4f4'; g.fillRect(L * .76, 2.8, L * .11, Wd - 5.6); g.fillStyle = dk; g.fillRect(L * .89, -.4, 1.4, 1.2); g.fillRect(L * .89, Wd - .8, 1.4, 1.2);
      g.fillStyle = '#cfd4da'; g.fillRect(L - 1, 1.4, 1, Wd - 2.8); g.fillRect(0, 1.4, .9, Wd - 2.8); lights(2.2, Wd - 2.2); break;
    }
  }
}

// ---------- car parts, salvage, project garage ----------
Object.assign(ITEMS, {
  eng_i4: { n: 'Four-cylinder engine', v: 900, w: 20, k: 'part', e: '⚙' }, eng_i4t: { n: 'Turbo four engine', v: 2300, w: 22, k: 'part', e: '⚙' }, eng_v6: { n: 'V6 engine', v: 3200, w: 26, k: 'part', e: '⚙' }, eng_v8: { n: 'V8 engine', v: 5200, w: 30, k: 'part', e: '⚙' },
  eng_sc8: { n: 'Supercharged V8', v: 9500, w: 30, k: 'part', e: '⚙' }, eng_ev: { n: 'Electric drive unit', v: 7500, w: 28, k: 'part', e: '🔋' }, eng_bike: { n: 'Motorcycle engine', v: 1100, w: 12, k: 'part', e: '⚙' },
  gearbox: { n: 'Transmission', v: 700, w: 14, k: 'part', e: '🔩' }, wheelset: { n: 'Wheel & tire', v: 150, w: 6, k: 'part', e: '🛞' }, exhaustp: { n: 'Exhaust system', v: 300, w: 8, k: 'part', e: '💨' },
  panels: { n: 'Body panels', v: 400, w: 12, k: 'part', e: '🚪' }, wiring: { n: 'Wiring & ECU', v: 350, w: 3, k: 'part', e: '🔌' }, seats: { n: 'Seats & interior', v: 250, w: 8, k: 'part', e: '💺' },
});
Object.assign(FLAVOR, { eng_i4: 'Small, reliable, slow.', eng_i4t: 'Small engine, big boost.', eng_v6: 'The sensible middle.', eng_v8: 'Torque for days.', eng_sc8: 'Whines like a jet. Goes like one too.', eng_ev: 'Silent and instant.', eng_bike: 'For anything you sit on, not in.', gearbox: 'Every build needs one.', wheelset: 'Sold singly — a car needs four.', exhaustp: 'Manifold to tailpipe.', panels: 'Doors, wings, bonnet. A car needs two sets.', wiring: 'Loom, fuse box and ECU.', seats: 'Somewhere to sit.' });
const STOCKENG = { compact: 'eng_i4', sports: 'eng_i4t', muscle: 'eng_v8', cop: 'eng_v8', swat: 'eng_v8', truck: 'eng_v8', boxtruck: 'eng_v8', dump: 'eng_v8', bus: 'eng_v8', firetruck: 'eng_v8', tractor: 'eng_v8' };
const stockEng = t => { const d = CAR_TYPES[t]; return d.pedal ? null : d.rider ? 'eng_bike' : (STOCKENG[t] || 'eng_v6'); };
function buildReq(t) { const d = CAR_TYPES[t]; if (d.pedal) return { wheelset: 2 }; if (d.rider) return { gearbox: 1, wheelset: d.two ? 2 : 4, exhaustp: 1, wiring: 1 }; return { gearbox: 1, wheelset: d.L > 44 ? 6 : 4, exhaustp: 1, panels: 2, wiring: 1, seats: 1 }; }
const shells = () => (G.save.shells = G.save.shells || {}), myCars = () => (G.save.garage = G.save.garage || []);
const partHave = id => (G.stash.items[id] | 0) + (G.inv[id] | 0);
function partTake(id, n) { const a = Math.min(n, G.stash.items[id] | 0); if (a) { G.stash.items[id] -= a; if (!G.stash.items[id]) delete G.stash.items[id]; } if (n - a > 0) invDel(id, n - a); }
function stripCar(c, z) {
  const p = G.player, cond = clamp(c.hp / c.st.hp, .25, 1), got = [], S = G.stash.items, add = (id, n) => { if (n > 0) { S[id] = (S[id] | 0) + n; got.push(ITEMS[id].n + (n > 1 ? ' ×' + n : '')); } };
  exitCar(true); const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); p.x = (z.x0 + z.x1) / 2 + z.fx * T * .9; p.y = (z.y0 + z.y1) / 2 + z.fy * T * .9;
  const req = buildReq(c.type), E = c.mods && c.mods.swp ? ENGS[c.mods.swp].id : stockEng(c.type);
  if (E && Math.random() < cond + .1) add(E, 1); for (const k in req) { let n = 0; for (let j = 0; j < req[k]; j++) if (Math.random() < cond * .85) n++; add(k, n); }
  for (const k in c.mods || {}) if (MODOPTS[k] && !PART_EXCL.has(k) && c.mods[k] > 0 && Math.random() < .4 + cond * .5) { partAdd(k, c.mods[k]); got.push(partN(k, c.mods[k])); }
  if (garUsed() < garCap()) myCars().push(shellRec(c.type)); else { addCash(200); got.push('(garage full — shell scrapped for $200)'); } if (c.isRide) delete G.save.ride; if (c.type === 'cop' || c.type === 'swat') crime(1.5, 'Stripping a police vehicle');
  Snd.play('grinder'); for (let k = 0; k < 10; k++) spawnFx('spark', (z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2);
  G.big = { text: 'STRIPPED', col: '#f39c12', t: 2.6, sub: CAR_TYPES[c.type].name + ' shell + ' + got.length + ' part types sent to your garage', small: 1 }; msg('Sent to your home garage: ' + CAR_TYPES[c.type].name + ' shell' + (got.length ? ', ' + got.join(', ') : '') + '.', '#f2c230');
  if (G.mission && G.mission.onChop) G.mission.onChop(c); doSave(true);
}
function salvageWreck(c) {
  if (c.salv) return; c.salv = 1; const d = c.d, pool = d.pedal ? ['wheelset'] : d.rider ? ['wheelset', 'wiring', 'exhaustp', 'copper'] : ['wheelset', 'wheelset', 'wiring', 'exhaustp', 'seats', 'copper', 'copper', 'panels', 'gearbox', 'carparts'];
  Snd.play('ratchet'); giveLoot(pick(pool)); if (Math.random() < .35) giveLoot('copper');
}
function deliverCar(i) {
  const L = myCars(), rec = L[i]; if (!rec) return; const o = G.scene ? G.outPos : G.player, tx0 = Math.floor(o.x / T), ty0 = Math.floor(o.y / T); let best = null, bd = 1e9;
  for (let dy = -7; dy <= 7; dy++) for (let dx = -7; dx <= 7; dx++) { const tx = tx0 + dx, ty = ty0 + dy, t = tileAt(tx, ty); if (t !== TILE.ROAD && t !== TILE.LOT && t !== TILE.DIRT) continue; const x = (tx + .5) * T, y = (ty + .5) * T, d = Math.hypot(dx, dy) + (t === TILE.ROAD ? 0 : -.5); if (d < 1.5 || d >= bd) continue; if (G.cars.some(c => dist2(c.x, c.y, x, y) < 90 * 90)) continue; bd = d; best = [x, y, t]; }
  if (!best) { toast('No room outside to deliver it'); return; }
  let a = 0; if (best[2] === TILE.ROAD) { const fx = ((best[0] / T - 2) % RSP + RSP) % RSP; a = fx < 2.2 || fx > RSP - 2.2 ? Math.PI / 2 : 0; }
  const c = new Car(rec.type, best[0], best[1], a); applyMods(c, Object.assign({}, rec.mods || {})); c.trunk = rec.trunk || {}; if (rec.cond !== undefined) { c.hp = c.st.hp * rec.cond; if (rec.cond < .3) c.flat = 1; } c.legit = isLegitRec(rec) ? 1 : 0; c.noEng = rec.noEng ? 1 : 0; c.missing = Object.assign({}, rec.missing || {}); c.owned = 1; c.persist = 1; c.ai = { mode: 'parked' }; G.cars.push(c); L.splice(i, 1); Snd.play('door'); msg(c.d.name + ' is parked outside.', '#2ecc71'); doSave(true);
}
function storableCar() { const o = G.scene ? G.outPos : G.player; let b = null, bd = 420 * 420; for (const c of G.cars) { if (c.dead || c.driver || c.d.siren && !c.owned) continue; const d = dist2(c.x, c.y, o.x, o.y); if (d < bd) { bd = d; b = c; } } return b; }
function storeCar(c) { const L = myCars(); if (garUsed() >= garCap()) return toast('Garage is full'); L.push({ type: c.type, mods: Object.assign({}, c.mods || {}, { p: c.color }), trunk: c.trunk || {}, cond: clamp(c.hp / c.st.hp, .05, 1), legit: c.legit ? 1 : 0, noEng: c.noEng ? 1 : 0, missing: Object.assign({}, c.missing || {}) }); if (c.isRide) delete G.save.ride; if (c.spot) c.spot.car = null; const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1); Snd.play('door'); doSave(true); }
PMODES.store = function (H) { if (this.opt.kind === 'home') { H.tabBtn('stash', 'Stash'); const b = H.mk('button', '', '🅿 Garage & workshop'); b.onclick = () => { Snd.play('ui'); openGarageAny(); }; H.el.querySelector('.ptabs').appendChild(b); const b2 = H.mk('button', '', '🛒 Order car parts'); b2.onclick = () => { Snd.play('ui'); Panel.open('project', { tab: 'order' }); }; H.el.querySelector('.ptabs').appendChild(b2); if (!this.tab) this.tab = 'stash'; } return false; };
PMODES.project = function (H) {
  H.title.textContent = 'Project garage'; const S = shells(), L = myCars(), tab = this.tab || (this.tab = 'build');
  H.tabBtn('build', 'Build'); H.tabBtn('cars', `My cars ${L.length}/${garCap()}`); H.tabBtn('order', 'Order parts'); { const b = H.mk('button', '', '← Stash'); b.onclick = () => { Snd.play('ui'); Panel.open('store', { kind: 'home' }); }; H.el.querySelector('.ptabs').appendChild(b); }
  const eRow = t => CAR_TYPES[t].two ? '🏍' : CAR_TYPES[t].L > 44 ? '🚚' : '🚗';
  if (tab === 'build') {
    const c = H.col('Shells'), types = Object.keys(S).filter(t => S[t] > 0 && CAR_TYPES[t]);
    if (!types.length) H.empty(c, 'Bare shells now sit in your garage list (drive onto your GARAGE pad) — select one there and fit parts one by one to build it. Old note: take a car to a chop shop and choose "Strip for parts" — the bare shell and whatever parts survive are sent here. You can also order shells and parts on the Order tab, and salvage parts from wrecks.');
    if (!types.includes(this.sel)) this.sel = types[0] || null;
    for (const t of types) { const r = H.row(c, eRow(t), CAR_TYPES[t].name + (S[t] > 1 ? ' ×' + S[t] : ''), 'Bare shell', [H.btn(this.sel === t ? 'Selected' : 'Select', () => { this.sel = t; this.eng = null; }, this.sel === t ? 'on' : ''), H.btn('Scrap $200', () => { S[t]--; if (!S[t]) delete S[t]; addCash(200); Snd.play('grinder'); toast('Shell scrapped — $200'); doSave(true); })]); if (this.sel === t) r.classList.add('sel'); }
    const c2 = H.col(this.sel ? 'Build: ' + CAR_TYPES[this.sel].name : 'Build'); if (!this.sel) { H.empty(c2, 'Select a shell to see what it needs.'); return; }
    const t = this.sel, d = CAR_TYPES[t], req = buildReq(t), se = stockEng(t); let ok = true;
    if (se) {
      const engs = d.rider ? ['eng_bike'] : ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev'], own = engs.filter(e => partHave(e) > 0); if (!own.includes(this.eng)) this.eng = own.includes(se) ? se : own[0] || null;
      if (!own.length) { ok = false; H.row(c2, '✗', 'Engine', d.rider ? 'Needs a motorcycle engine' : 'Needs any car engine — the engine you fit decides how it drives', []); }
      for (const e of own) { const r = H.row(c2, this.eng === e ? '✓' : '⚙', ITEMS[e].n + (e === se ? '  (factory fit)' : ''), 'In stock: ' + partHave(e), [H.btn(this.eng === e ? 'Fitting' : 'Use', () => { this.eng = e; }, this.eng === e ? 'on' : '')]); if (this.eng === e) r.classList.add('sel'); }
    }
    const ev = this.eng === 'eng_ev';
    for (const k in req) { if (k === 'exhaustp' && ev) continue; const have = partHave(k), need = req[k]; if (have < need) ok = false; H.row(c2, have >= need ? '✓' : '✗', ITEMS[k].n + (need > 1 ? ' ×' + need : ''), 'In stock: ' + have + (have < need ? '  — need ' + (need - have) + ' more' : ''), []).querySelector('.pe').style.color = have >= need ? '#2ecc71' : '#ff6b6b'; }
    if (se && this.eng) { const swp = this.eng === se ? 0 : Math.max(0, ENGS.findIndex(e => e.id === this.eng)), pc = { st: calcSt(d, { swp }) }; c2.appendChild(barsEl(statBars({ st: calcSt(d, {}) }), statBars(pc))); }
    const full = garUsed() >= garCap();
    H.foot.appendChild(H.mk('span', 'pnote', ok ? (full ? 'Your garage is full — deliver or scrap a car first.' : 'Everything is here. Parts are used up when you build.') : 'Parts are counted from your home stash and your backpack.'));
    H.foot.appendChild(H.btn('🔧 Build it', () => {
      const swp = !se || this.eng === se ? 0 : Math.max(0, ENGS.findIndex(e => e.id === this.eng)); if (se) partTake(this.eng, 1); for (const k in req) { if (k === 'exhaustp' && ev) continue; partTake(k, req[k]); }
      S[t]--; if (!S[t]) delete S[t]; L.push({ type: t, mods: swp ? { swp } : {}, built: 1, legit: 1 }); Snd.play('ratchet'); Snd.play('cash'); msg('Built: ' + d.name + (swp ? ' with a ' + ENGS[swp].n : '') + '. It is in your garage — deliver it from the My cars tab.', '#2ecc71'); this.tab = 'cars'; doSave(true);
    }, 'y', !ok || full));
  } else if (tab === 'cars') {
    const c = H.col('In your garage'); if (!L.length) H.empty(c, 'Empty. Build a car, or store one that is parked outside. Stored cars keep their paint, mods and trunk.');
    L.forEach((r, i) => { const d = CAR_TYPES[r.type]; if (!d) return; const m = r.mods || {}, bits = []; if (m.swp) bits.push(ENGS[m.swp].n); if (m.eng) bits.push('engine stage ' + m.eng); if (m.tur) bits.push('turbo'); if (m.nos) bits.push('nitrous'); if (r.built) bits.push('home-built'); H.row(c, eRow(r.type), d.name, bits.join(' · ') || 'Stock', [H.btn('Deliver', () => deliverCar(i), 'y'), H.btn('Part out', () => partOut(i)), H.btn('Scrap $200', () => scrapRec(i))]); });
    const c2 = H.col('Parked outside'), sc = storableCar();
    if (sc) H.row(c2, eRow(sc.type), sc.d.name, 'Closest empty vehicle', [H.btn('Store it', () => storeCar(sc), 'y', garUsed() >= garCap())]); else H.empty(c2, 'Park a vehicle near your front door and it can be stored here — up to ' + garCap() + ' vehicles.');
    H.foot.appendChild(H.mk('span', 'pnote', 'Delivered cars are parked on the street outside.'));
  } else {
    const c = H.col('Engines & stock parts'), buy = (id, pr) => { if (!payAny(pr)) return; G.stash.items[id] = (G.stash.items[id] | 0) + 1; Snd.play('cash'); };
    for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike', 'gearbox', 'wheelset', 'exhaustp', 'panels', 'wiring', 'seats']) { const it = ITEMS[id], pr = Math.round(it.v * 1.5 / 10) * 10; H.row(c, it.e, it.n, money(pr) + ' · in stock ' + partHave(id), [H.btn('Buy', () => buy(id, pr), 'y', G.cash < pr)]); }
    const c2 = H.col('Bare shells');
    for (const t of Object.keys(CAR_TYPES)) { const d = CAR_TYPES[t]; if (d.siren || d.air || t === 'taxi') continue; const pr = Math.round(carValue({ type: t }) * .5 / 10) * 10; H.row(c2, eRow(t), d.name, money(pr) + (S[t] ? ' · you have ' + S[t] : ''), [H.btn('Buy', () => { if (garUsed() >= garCap()) return toast('Garage is full'); if (pay(pr)) { myCars().push(shellRec(t)); Snd.play('cash'); toast('Shell delivered to your garage'); } }, 'y', G.cash < pr)]); }
    H.foot.appendChild(H.mk('span', 'pnote', 'Buying new is the expensive way. Stripping stolen cars at a chop shop is free.'));
  }
};
