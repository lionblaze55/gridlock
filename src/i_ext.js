// ================= TIME, WEATHER, LIGHTING =================
G.tod = 15.5; G.day = 0; G.weather = { rain: 0, target: 0, t: 200 }; G.drugs = { leaf: 0, haze: 0, glint: 0, ember: 0 }; G.lights = []; G.facePolys = [];
function hash01(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; }
function darkness() { const t = G.tod; if (t >= 7 && t < 17.5) return 0; if (t >= 17.5 && t < 20.5) return (t - 17.5) / 3; if (t >= 4.5 && t < 7) return 1 - (t - 4.5) / 2.5; return 1; }
function ambientColor(dk) {
  let c; if (dk < .45) { const k = dk / .45; c = [lerp(255, 245, k), lerp(255, 168, k), lerp(255, 128, k)]; } else { const k = (dk - .45) / .55; c = [lerp(245, 46, k), lerp(168, 56, k), lerp(128, 108, k)]; }
  const r = G.weather.rain; if (r > 0) { c[0] *= 1 - .24 * r; c[1] *= 1 - .2 * r; c[2] *= 1 - .1 * r; }
  return c;
}
function updateWorldTime(dt) {
  const before = G.tod; G.tod += dt * 24 / 1200; if (G.tod >= 24) { G.tod -= 24; G.day++; newDay(); }
  const w = G.weather; w.t -= dt; if (w.t <= 0) { w.t = rnd(140, 320); w.target = G.settings.weather !== 0 && Math.random() < .3 ? rnd(.6, 1) : 0; if (w.target > 0 && G.mode === 'play' && !G.scene) msg('It\'s starting to rain.', '#9fc5e8'); }
  if (G.settings.weather === 0) w.target = 0;
  w.rain += clamp(w.target - w.rain, -dt / 8, dt / 8);
}
function newDay() {
  const types = Object.keys(CAR_TYPES).filter(t => t !== 'swat' && !CAR_TYPES[t].air);
  G.chopList = []; while (G.chopList.length < 3) { const t = pick(types); if (!G.chopList.includes(t)) G.chopList.push(t); }
  const ds = Object.keys(DISTRICTS), dg = pick(DRUGS);
  G.drugEvent = { d: pick(ds), id: dg.id, f: Math.random() < .5 ? rnd(2, 3) : rnd(.3, .5) };
  if (G.mode === 'play') msg(G.drugEvent.f > 1 ? `Word on the street: ${dg.n} is scarce in ${DISTRICTS[G.drugEvent.d].name}. Prices are up.` : `Word on the street: ${DISTRICTS[G.drugEvent.d].name} is flooded with cheap ${dg.n}.`, '#b39ddb');
}
let LC = null, LG = null, VIG = null;
function pushLight(k, x, y, r, c, a, ang) { G.lights.push({ k, x, y, r, c, a, ang }); }
function lightPass(amb, strength) {
  const w = Math.ceil(VW / 2), h = Math.ceil(VH / 2);
  if (!LC || LC.width !== w || LC.height !== h) { LC = mkCanvas(w, h); LG = LC.getContext('2d'); }
  LG.setTransform(1, 0, 0, 1, 0, 0); LG.globalCompositeOperation = 'source-over'; LG.globalAlpha = 1;
  LG.fillStyle = `rgb(${amb[0] | 0},${amb[1] | 0},${amb[2] | 0})`; LG.fillRect(0, 0, w, h);
  LG.globalCompositeOperation = 'lighter';
  const cam = G.cam, z = cam.z * .5; LG.setTransform(z, 0, 0, z, w / 2 - cam.x * z, h / 2 - cam.y * z);
  for (const P of G.facePolys) { LG.globalAlpha = P.a * strength; LG.fillStyle = P.c; LG.beginPath(); LG.moveTo(P.p[0][0], P.p[0][1]); for (let i = 1; i < P.p.length; i++) LG.lineTo(P.p[i][0], P.p[i][1]); LG.closePath(); LG.fill(); }
  for (const L of G.lights) {
    LG.globalAlpha = clamp(L.a * strength, 0, 1);
    if (L.k === 'pt') LG.drawImage(radialSprite(L.c, 64), L.x - L.r, L.y - L.r, L.r * 2, L.r * 2);
    else if (L.k === 'cone') { LG.save(); LG.translate(L.x, L.y); LG.rotate(L.ang); LG.drawImage(coneSprite(L.c), 0, -L.r * .31, L.r, L.r * .62); LG.restore(); }
    else if (L.k === 'oval') { LG.save(); LG.translate(L.x, L.y); LG.rotate(L.ang); LG.drawImage(radialSprite(L.c, 64), -L.r, -L.r * .55, L.r * 2, L.r * 1.1); LG.restore(); }
  }
  LG.globalAlpha = 1; LG.globalCompositeOperation = 'source-over';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.imageSmoothingEnabled = true;
  ctx.drawImage(LC, 0, 0, VW, VH); ctx.globalCompositeOperation = 'source-over'; ctx.imageSmoothingEnabled = false;
}
function drawVignette() {
  if (!VIG || VIG.width !== Math.round(VW) || VIG.height !== Math.round(VH)) {
    VIG = mkCanvas(Math.round(VW), Math.round(VH)); const g = VIG.getContext('2d'), r = Math.hypot(VW, VH) / 2;
    const gr = g.createRadialGradient(VW / 2, VH / 2, r * .45, VW / 2, VH / 2, r); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH);
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.drawImage(VIG, 0, 0, VW, VH);
}
function drawRain() {
  const r = G.weather.rain; if (r < .05 || G.scene) return;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const n = Math.floor(170 * r), t = G.t;
  ctx.strokeStyle = `rgba(190,210,240,${.32 * r})`; ctx.lineWidth = 1; ctx.beginPath();
  for (let i = 0; i < n; i++) { const x = ((i * 97.31 + t * 120) % (VW + 40)) - 20, y = ((i * 53.17 + t * (700 + (i % 7) * 40)) % (VH + 40)) - 20; ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 16); }
  ctx.stroke();
  ctx.strokeStyle = `rgba(200,220,255,${.4 * r})`; ctx.beginPath();
  for (let i = 0; i < 26 * r; i++) { const k = Math.floor(t * 6) + i * 13, x = (Math.sin(k * 12.9898) * 43758.5453 % 1 + 1) % 1 * VW, y = (Math.sin(k * 78.233) * 12543.53 % 1 + 1) % 1 * VH, ph = (t * 6) % 1; ctx.moveTo(x + 2 + ph * 4, y); ctx.arc(x, y, 2 + ph * 4, 0, TAU); }
  ctx.stroke();
}
function hull(pts) {
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = []; for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}
function sunVec() {
  const dk = darkness(); if (dk > .9) return null;
  const t = clamp(G.tod, 6, 19), ang = (t - 6) / 13 * Math.PI, el = Math.max(.3, Math.sin(ang));
  const len = Math.min(T * .85, T * .26 / el);
  return { x: -Math.cos(ang) * len, y: -len * .45, a: .3 * (1 - dk) * (1 - .6 * G.weather.rain) };
}
function drawShadows(x0, y0, x1, y1) {
  const sv = sunVec(); G.sun = sv; if (!sv || sv.a < .02) return;
  ctx.fillStyle = `rgba(10,12,25,${sv.a})`; ctx.beginPath();
  const m = 10 * Math.max(Math.abs(sv.x), Math.abs(sv.y));
  for (const b of W.buildings) {
    const bx0 = b.x * T, by0 = b.y * T, bx1 = (b.x + b.w) * T, by1 = (b.y + b.h) * T;
    if (bx1 + m < x0 || bx0 - m > x1 || by1 + m < y0 || by0 - m > y1) continue;
    const vx = sv.x * b.H, vy = sv.y * b.H;
    const hp = hull([[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1], [bx0 + vx, by0 + vy], [bx1 + vx, by0 + vy], [bx1 + vx, by1 + vy], [bx0 + vx, by1 + vy]]);
    ctx.moveTo(hp[0][0], hp[0][1]); for (let i = 1; i < hp.length; i++) ctx.lineTo(hp[i][0], hp[i][1]); ctx.closePath();
  }
  ctx.fill();
}
// collect lights for the city
function collectCityLights(vx0, vy0, vx1, vy1, props, dk) {
  if (dk > .05) {
    for (const p of props) {
      if (p.t === 'lamp' && !p.down) { const hx = p.x + (p.x - G.cam.x) * .14, hy = p.y + (p.y - G.cam.y) * .14; pushLight('pt', hx, hy, 150, 'rgba(255,214,150,1)', .85); }
      else if (p.t === 'vend' || p.t === 'atm' || p.t === 'phone') pushLight('pt', p.x, p.y, 45, p.t === 'vend' ? 'rgba(255,90,90,1)' : 'rgba(140,220,255,1)', .7);
      else if (p.t === 'campfire') pushLight('pt', p.x, p.y, 130 + Math.sin(G.t * 11) * 10, 'rgba(255,160,70,1)', .95);
      else if (p.t === 'hotdog') pushLight('pt', p.x, p.y, 60, 'rgba(255,200,120,1)', .7);
    }
    for (const b of W.buildings) { if (!b.door || !DOORCOL[b.type]) continue; const d = b.door; if (d.x < vx0 || d.x > vx1 || d.y < vy0 || d.y > vy1) continue; pushLight('pt', d.x, d.y, 90, hexA(DOORCOL[b.type]), .8); }
    for (const z of W.sprays) { const cx = (z.x0 + z.x1) / 2, cy = (z.y0 + z.y1) / 2; if (inView(cx, cy, 100)) pushLight('pt', cx, cy, 120, z.kind === 'chop' ? 'rgba(255,120,60,1)' : 'rgba(255,215,90,1)', .8); }
  }
  const carL = (c, mods, braking, siren) => {
    const fx = Math.cos(c.a), fy = Math.sin(c.a);
    if (dk > .05 || G.weather.rain > .3) { const hc = mods && mods.hl === 1 ? 'rgba(190,225,255,1)' : mods && mods.hl === 2 ? 'rgba(255,225,130,1)' : 'rgba(255,245,215,1)'; pushLight('cone', c.x + fx * c.L * .45, c.y + fy * c.L * .45, 330, hc, .9, c.a); pushLight('pt', c.x - fx * c.L * .5, c.y - fy * c.L * .5, braking ? 55 : 32, 'rgba(255,40,30,1)', braking ? .9 : .6); }
    if (siren) { const f = Math.floor(G.t * 8) % 2; pushLight('pt', c.x, c.y, 150, f ? 'rgba(255,40,40,1)' : 'rgba(50,90,255,1)', 1.2 / Math.max(.4, dk)); }
    if (mods && mods.neon) pushLight('oval', c.x, c.y, c.L * .9, hexA(NEONS[(mods.neon - 1) % NEONS.length]), 1.1 / Math.max(.4, dk), c.a);
  };
  for (const c of G.cars) { if (c.dead || !c.driver && !(c.mods && c.mods.neon)) continue; if (c.x < vx0 - 300 || c.x > vx1 + 300 || c.y < vy0 - 300 || c.y > vy1 + 300) continue; carL(c, c.mods, c.brake || c.throttle < 0, c.siren > 0); }
  for (const r of Net.remoteCars()) if (!r.dead) carL(r, r.mods, r.brake, r.siren > 0);
  collectFxLights();
}
function collectFxLights() {
  let nFire = 0;
  for (const f of G.fx) {
    if (f.t === 'boom') pushLight('pt', f.x, f.y, f.s * 3, 'rgba(255,170,70,1)', f.life / f.max * 1.5);
    else if (f.t === 'flash') pushLight('pt', f.x, f.y, 90, 'rgba(255,220,140,1)', 1);
    else if (f.t === 'fire' && (nFire++ % 4 === 0)) pushLight('pt', f.x, f.y, 70, 'rgba(255,140,40,1)', .6);
    else if (f.t === 'nos') pushLight('pt', f.x, f.y, 40, 'rgba(80,160,255,1)', .6);
  }
  for (const f of G.fires) pushLight('pt', f.x, f.y, f.r * 2.6, 'rgba(255,150,50,1)', .8);
  for (const p of G.projs) if (p.k === 'rocket') pushLight('pt', p.x, p.y, 60, 'rgba(255,190,90,1)', .9);
}
function hexA(h) { const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},1)`; }
function interiorLighting0() {
  const s = G.scene, ty = s.b.type; if (!['club', 'strip', 'bar'].includes(ty)) return;
  G.lights = []; const t = G.t;
  const amb = ty === 'bar' ? [150, 120, 95] : [70, 45, 95];
  if (ty === 'club' || ty === 'strip') {
    const cols = ['rgba(255,40,200,1)', 'rgba(40,200,255,1)', 'rgba(255,220,60,1)', 'rgba(120,80,255,1)'];
    for (let i = 0; i < 4; i++) { const cx = (s.w * .45 + Math.sin(t * .7 + i * 1.7) * s.w * .25) * T, cy = (s.h * .35 + Math.cos(t * .9 + i * 2.1) * s.h * .2) * T; pushLight('pt', cx, cy, 170, cols[i], .9); }
    for (const it of s.items) { if (it.t === 'stage') pushLight('pt', (it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 260, 'rgba(255,120,190,1)', .8); if (it.t === 'bar') pushLight('pt', (it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 200, 'rgba(255,200,140,1)', .6); if (it.t === 'neonsign') pushLight('pt', (it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 160, 'rgba(255,60,180,1)', .9); if (it.t === 'vip') pushLight('pt', (it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 90, 'rgba(255,70,70,1)', .7); }
  } else { for (let x = 2; x < s.w; x += 4) for (let y = 2; y < s.h; y += 4) pushLight('pt', x * T, y * T, 200, 'rgba(255,210,150,1)', .6); }
  collectFxLights();
  lightPass(amb, 1);
}

// ================= GARAGE (mod shop) =================
const MODOPTS = {
  liv: { n: 'Livery', o: [['None', 0], ['Racing stripes', 400], ['Two-tone', 350], ['Flames', 600], ['Side stripe', 250], ['Checkered hood', 450], ['Race number', 300]] },
  rim: { n: 'Rims', o: RIMS.map((r, i) => [r.n, [0, 700, 950, 450, 550][i]]) },
  sp: { n: 'Spoiler', o: [['None', 0], ['Lip spoiler', 200], ['Ducktail', 350], ['GT wing', 900]] },
  hd: { n: 'Hood', o: [['Stock', 0], ['Hood scoop', 400], ['Vented', 300], ['Carbon fiber', 650]] },
  sk: { n: 'Body kit', o: [['Stock', 0], ['Wide body kit', 750]] },
  tint: { n: 'Window tint', o: [['None', 0], ['Light smoke', 150], ['Limo black', 300]] },
  hl: { n: 'Headlights', o: [['Halogen', 0], ['Xenon blue', 250], ['Golden', 150]] },
  neon: { n: 'Underglow', o: [['None', 0]].concat(['Pink', 'Cyan', 'Green', 'Red', 'Yellow', 'Purple', 'White'].map(n => [n, 600])) },
  eng: { n: 'Engine', o: [['Stock', 0], ['Street tune', 1000], ['Sport tune', 2200], ['Race tune', 4000]] },
  tur: { n: 'Turbo', o: [['None', 0], ['Turbocharger', 3000]] },
  nos: { n: 'Nitrous', o: [['None', 0], ['Nitrous kit (3 shots)', 2500]] },
  brk: { n: 'Brakes', o: [['Stock', 0], ['Sport brakes', 600], ['Race brakes', 1400]] },
  hnd: { n: 'Suspension', o: [['Stock', 0], ['Lowered', 700], ['Race coilovers', 1600]] },
  arm: { n: 'Armor', o: [['None', 0], ['Light plating', 800], ['Heavy plating', 1800], ['Bulletproof', 3200]] },
};
const GTABS = [['paint', 'Paint'], ['style', 'Style'], ['body', 'Body'], ['lights', 'Lights'], ['perf', 'Performance'], ['service', 'Service']];
const gEl = () => document.getElementById('garage');
let GAR = null;
function openGarage(c, z) {
  GAR = { c, z, tab: 'paint', spent: 0, startHeat: stars(), pv: null };
  c.throttle = 0; c.brake = 1; c.vx *= .2; c.vy *= .2; G.garageOpen = true; G.dlgOpen = true;
  gEl().classList.add('show'); gEl().querySelector('.gname').textContent = z.b.name;
  Snd.play('door'); Snd.play('ratchet'); renderGarage();
}
function closeGarage() {
  const c = GAR.c; gEl().classList.remove('show'); G.garageOpen = false; G.dlgOpen = false;
  if (GAR.spent > 0 && c.mods) { G.save.ride = { type: c.type, mods: c.mods, legit: c.legit ? 1 : 0 }; c.isRide = 1; doSave(true); msg('Saved as your ride. It\'ll be parked at your apartment next time you play.', '#2ecc71'); }
  G.inGarage = GAR.z; GAR = null;
}
function carValue(c) { return { tractor: 500, bike: 900, compact: 300, sedan: 450, taxi: 400, sports: 1500, muscle: 1100, van: 600, pickup: 700, truck: 900, cop: 1300, swat: 2600 }[c.type] || 400; }
function modsValue(m) { let v = 0; if (!m) return 0; for (const k in MODOPTS) if (m[k]) v += (MODOPTS[k].o[m[k]] || [0, 0])[1]; return v + (m.p ? 150 : 0) + (m.s ? 100 : 0); }
function statBars(c) {
  const s = c.st; return [['Top speed', s.max / 1000], ['Acceleration', s.acc / 1250], ['Handling', (s.grip / 14 + s.steer / 4) / 2], ['Braking', s.brk / 2400], ['Armor', s.hp / 500]];
}
function drawGaragePreview(c) {
  const cv2 = document.getElementById('gprev'), g = cv2.getContext('2d'), w = cv2.width, h = cv2.height;
  const bg = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w * .6); bg.addColorStop(0, '#3a3f4b'); bg.addColorStop(1, '#0d0f14'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(255,255,255,.05)'; for (let x = 0; x < w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  g.fillStyle = 'rgba(242,194,48,.5)'; g.fillRect(0, h - 8, w, 3);
  const spr = carSprite(c.type, c.color, false, c.mods || {}, true); const sc = Math.min((w * .82) / spr.width, (h * .8) / spr.height);
  const dw = spr.width * sc, dh = spr.height * sc, x = (w - dw) / 2, y = (h - dh) / 2;
  if (c.mods && c.mods.neon) { const col = NEONS[(c.mods.neon - 1) % NEONS.length]; const gr = g.createRadialGradient(w / 2, h / 2, 5, w / 2, h / 2, dw * .6); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .9; g.fillStyle = gr; g.save(); g.translate(w / 2, h / 2); g.scale(1, .6); g.translate(-w / 2, -h / 2); g.fillRect(0, 0, w, h); g.fillRect(0, 0, w, h); g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; }
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(w / 2 + 6, h / 2 + 8, dw * .45, dh * .38, 0, 0, TAU); g.fill();
  g.imageSmoothingEnabled = true; g.drawImage(spr, x, y, dw, dh);
}
function calcSt(d, m) { m = m || {}; const eng = m.eng || 0, tur = m.tur || 0, hnd = m.hnd || 0, brk = m.brk || 0, arm = m.arm || 0; return { max: d.max * (1 + .07 * eng + .06 * tur), acc: d.acc * (1 + .13 * eng + .2 * tur), grip: d.grip * (1 + .13 * hnd + .03 * (m.sp ? 1 : 0) + .03 * (m.sk || 0)), steer: d.steer * (1 + .07 * hnd), brk: 1200 * (1 + .3 * brk), hp: d.hp * (1 + .4 * arm) }; }
function renderGarage() {
  if (!GAR) return; const c = GAR.c, m = c.mods || {}, box = gEl(), pv = GAR.pv;
  box.querySelector('.gcash').textContent = money(G.cash);
  const pm = pv ? Object.assign({}, m, { [pv.k]: pv.v }) : m, pc = { type: c.type, color: pm.p || c.color, mods: pm, d: c.d, st: calcSt(c.d, pm) };
  drawGaragePreview(pc);
  const st = box.querySelector('.gstats'); st.innerHTML = '';
  const t = document.createElement('div'); t.className = 'gcar'; t.textContent = c.d.name + (pv ? '  · preview' : c.isRide ? '  ★ your ride' : ''); st.appendChild(t);
  st.appendChild(barsEl(statBars(c), statBars(pc)));
  const tabs = box.querySelector('.gtabs'); tabs.innerHTML = '';
  if (!garTabs(c).some(t => t[0] === GAR.tab)) GAR.tab = 'paint';
  for (const [id, n] of garTabs(c)) { const b = document.createElement('button'); b.textContent = n; if (id === GAR.tab) b.className = 'on'; b.onclick = () => { Snd.play('ui'); GAR.tab = id; GAR.pv = null; renderGarage(); }; tabs.appendChild(b); }
  const o = box.querySelector('.gopts'); o.innerHTML = '';
  const section = n => { const d = document.createElement('div'); d.className = 'gsec'; d.textContent = n; o.appendChild(d); };
  const mkOpt = (label, sub, cls, fn, dis) => { const b = document.createElement('button'); b.className = 'gopt ' + (cls || ''); const a = document.createElement('span'); a.textContent = label; const p = document.createElement('small'); p.textContent = sub; b.append(a, p); if (dis) b.disabled = true; b.onclick = fn; o.appendChild(b); };
  const swatches = (key, price) => { const d = document.createElement('div'); d.className = 'gsw'; for (const col of PAINTS) { const s = document.createElement('i'); s.style.background = col; const cur = (key === 'p' ? c.color : m.s) === col; if (cur) s.className = 'on'; else if (pv && pv.k === key && pv.v === col) s.className = 'pv'; s.onclick = () => { Snd.play('ui'); GAR.pv = cur ? null : { k: key, v: col, price, label: key === 'p' ? 'Primary paint' : 'Secondary paint', paint: 1 }; renderGarage(); }; d.appendChild(s); } o.appendChild(d); };
  const buyOpt = k => modOpts(k, c).forEach(([n, pr], i) => { const on = (m[k] || 0) === i, sel = pv && pv.k === k && pv.v === i; mkOpt((on ? '✓ ' : sel ? '👁 ' : '') + n, on ? 'Installed' : pr ? money(shopFit(pr)) + ' fitted' : 'Free', (on ? 'on' : '') + (sel ? ' pv' : ''), () => { Snd.play('ui'); GAR.pv = on ? null : { k, v: i, price: shopFit(pr), part: pr, label: n }; renderGarage(); }); });
  if (GAR.tab === 'moto') { for (const k of MOTOK) { section(MODOPTS[k].n); buyOpt(k); } } else switch (GAR.tab) {
    case 'paint': section('Primary color · $150'); swatches('p', 150); section('Secondary color · $100'); swatches('s', 100); break;
    case 'style': section('Livery'); buyOpt('liv'); section('Rims'); buyOpt('rim'); break;
    case 'body': section('Spoiler'); buyOpt('sp'); section('Hood'); buyOpt('hd'); section('Body kit'); buyOpt('sk'); break;
    case 'lights': section('Headlights'); buyOpt('hl'); section('Neon underglow'); buyOpt('neon'); section('Window tint'); buyOpt('tint'); break;
    case 'perf': for (const k of perfKeys(c)) { section(MODOPTS[k].n); buyOpt(k); } break;
    case 'service': {
      const dmg = 1 - c.hp / c.st.hp, rep = shopRepair(c);
      section('Service'); mkOpt(c.flat ? 'Repair & new tyres' : 'Repair body & engine', dmg < .01 && !c.flat ? 'No damage' : money(rep + (c.flat ? 150 : 0)), '', () => buy(rep + (c.flat ? 150 : 0), () => { shopRepairDo(c); c.hp = c.st.hp; c.fireT = 0; c.flat = 0; }), (dmg < .01 && !c.flat) || G.cash < rep + (c.flat ? 150 : 0));
      mkOpt('Quick respray (lose the cops)', '$200', '', () => buy(200, () => { G.heat = 0; Snd.play('splash'); }), G.cash < 200);
      if (m.nos) mkOpt('Refill nitrous (' + nosCap(c) + ' shots)', c.nos >= nosCap(c) ? 'Full' : '$200', '', () => buy(200, () => { c.nos = nosCap(c); }), c.nos >= nosCap(c) || G.cash < 200);
      mkOpt('Save as my ride', c.isRide ? 'Saved' : 'Free', c.isRide ? 'on' : '', () => { G.save.ride = { type: c.type, mods: c.mods || {}, legit: c.legit ? 1 : 0 }; c.isRide = 1; doSave(true); toast('Saved as your ride'); renderGarage(); });
      shopSellOpt(c, mkOpt, section);
    }
  }
  const foot = box.querySelector('.gfoot'); foot.innerHTML = '';
  const info = document.createElement('div'); info.className = 'ginfo'; foot.appendChild(info);
  if (pv) { const b = document.createElement('b'); b.textContent = pv.label + ' — '; info.append(b, MODDESC[pv.k] || ''); } else info.textContent = GAR.tab === 'service' ? '' : 'Tap any part or color to see it on your car and how it changes the stats. Nothing is bought until you confirm.';
  const row = document.createElement('div'); row.className = 'row'; foot.appendChild(row);
  if (pv) { const bb = document.createElement('button'); bb.className = 'btn grn'; bb.style.margin = '0'; bb.textContent = pv.price ? 'Buy  ' + money(pv.price) : 'Fit (free)'; if (pv.price > G.cash) bb.disabled = true; bb.onclick = () => { const q = GAR.pv; GAR.pv = null; buy(q.price, () => setMod(q.k, q.v), q.paint && q.k === 'p'); }; row.appendChild(bb); if (!pv.paint && pv.price && MODOPTS[pv.k] && pv.k !== 'swp') { const b2 = document.createElement('button'); b2.className = 'btn alt'; b2.style.margin = '0'; b2.textContent = 'Part only, to my garage  ' + money(pv.part || pv.price); if ((pv.part || pv.price) > G.cash) b2.disabled = true; b2.onclick = () => { const q = GAR.pv, pp = q.part || q.price; if (G.cash < pp) return; G.cash -= pp; partAdd(q.k, q.v); GAR.pv = null; Snd.play('cash'); toast('Sent to your garage parts shelf'); renderGarage(); }; row.appendChild(b2); } }
  const lb = document.createElement('button'); lb.className = 'btn' + (pv ? ' alt' : ''); lb.style.margin = '0'; lb.textContent = pv ? 'Cancel preview' : 'Drive out'; lb.onclick = () => { Snd.play('ui'); if (GAR.pv) { GAR.pv = null; renderGarage(); } else closeGarage(); }; row.appendChild(lb);
}
function setMod(k, v) { const c = GAR.c; c.mods = Object.assign({}, c.mods || {}); c.mods[k] = v; if (k === 'liv' && v === 6) c.mods.num = rint(1, 99); if (k === 'nos' && v) { c.nos = v === 2 ? 5 : 3; } applyMods(c); }
function buy(price, fn, isPaint) {
  if (!GAR) return; if (G.cash < price) { Snd.play('bad'); return; }
  G.cash -= price; GAR.spent += price; fn(); Snd.play(price ? 'cash' : 'ui'); if (price) Snd.play({ paint: 'spray', style: 'ratchet', body: 'ratchet', lights: 'zap', perf: 'rev', service: 'ratchet' }[GAR.tab]);
  if (isPaint && stars() > 0) { G.heat = 0; msg('Fresh paint — the cops lost track of you.', '#2ecc71'); }
  renderGarage();
}
// ================= CHOP SHOP =================
function openChop(c, z) {
  if (!G.chopList) newDay();
  const CV = chopVal(c), listed = CV.listed, cond = CV.cond, val = CV.val;
  const heat = c.type === 'cop' ? 1.5 : c.type === 'swat' ? 2.5 : 0;
  const names = G.chopList.map(t => CAR_TYPES[t].name).join(', ');
  c.throttle = 0; c.brake = 1; c.vx *= .2; c.vy *= .2; G.inGarage = z;
  const sell = () => {
    const p = G.player; exitCar(true); const i = G.cars.indexOf(c); if (i >= 0) G.cars.splice(i, 1);
    p.x = (z.x0 + z.x1) / 2 + z.fx * T * .9; p.y = (z.y0 + z.y1) / 2 + z.fy * T * .9;
    chopHeat(); addCash(val); Snd.play('grinder'); if (heat) crime(heat, 'Chopping a police vehicle'); if (c.isRide) { delete G.save.ride; doSave(true); }
    for (let i2 = 0; i2 < 10; i2++) spawnFx('spark', (z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2);
    G.big = { text: 'CHOPPED', col: '#f39c12', t: 2.4, sub: '+' + money(val) + (CV.job ? (listed ? '  (wanted list price)' : '  (ordered job)') : '  (street price)'), small: 1 };
    if (G.mission && G.mission.onChop) G.mission.onChop(c);
  };
  const opts = [{ t: `Sell for ${money(val)}`, c: 'y', f: c.isRide ? () => say('Chop shop', 'That\'s your custom ride. Chop it anyway?', [{ t: 'Yes, chop it', c: 'r', f: sell }, { t: 'No way' }]) : sell }, ...(!c.legit && !c.d.siren ? [(F => ({ t: `Forge a title  ${money(F.fee)}  (${Math.round(F.risk * 100)}% risk)`, f: () => { closeDialog(); F.go(); G.inGarage = z; } }))(forgeTitle(c))] : []), { t: 'Strip it for parts → my garage', f: c.isRide ? () => say('Chop shop', 'That\'s your custom ride. Strip it anyway?', [{ t: 'Yes, strip it', c: 'r', f: () => { chopHeat(); stripCar(c, z); } }, { t: 'No way' }]) : () => { chopHeat(); stripCar(c, z); } }, { t: 'Not today' }];
  say(z.b.name, `"${pick(['Nice wheels. Hot, I assume?', 'Let me take a look... yeah, I can strip this.', 'No questions asked.', 'Back again? Let\'s see what you brought.'])}"\n${CAR_TYPES[c.type].name} · condition ${Math.round(cond * 100)}%${listed ? ' · ON THE WANTED LIST — full price' : CV.job ? ' · ordered job — full price' : ' · not on the list, street price only'}\nToday's wanted list: ${names}.${chopWarn()}\n(For real money on a clean car, list it on the phone Marketplace.)`, opts);
}
function garageCheck() {
  const c = pCar(); if (!c || c.dead) { G.inGarage = null; return; }
  let inZ = null; for (const z of W.sprays) if (c.x > z.x0 && c.x < z.x1 && c.y > z.y0 && c.y < z.y1) { inZ = z; break; }
  if (!inZ) { G.inGarage = null; return; }
  if (G.inGarage === inZ || G.dlgOpen || c.spd > 90) return;
  G.inGarage = inZ;
  if (inZ.kind === 'chop') openChop(c, inZ); else openGarage(c, inZ);
}

// ================= DRUG TRADE =================
const DRUGS = [{ id: 'leaf', n: 'Leaf', base: 30, col: '#66bb6a' }, { id: 'haze', n: 'Haze', base: 85, col: '#ba68c8' }, { id: 'glint', n: 'Glint', base: 190, col: '#4fc3f7' }, { id: 'ember', n: 'Ember', base: 380, col: '#ff8a65' }];
const DCAP = 40;
const drugTotal = () => DRUGS.reduce((s, d) => s + (G.drugs[d.id] || 0), 0);
function drugPrice(id, d) {
  const dr = DRUGS.find(x => x.id === id); let f = .55 + hash01(id + d + G.day) * .9;
  if (DISTRICTS[d].gang) f *= .85; if (d === 'downtown' || d === 'suburbs') f *= 1.25;
  if (G.drugEvent && G.drugEvent.d === d && G.drugEvent.id === id) f *= G.drugEvent.f;
  f *= 1 + Math.sin(G.t / 40 + hash01(id + d) * 6) * .06;
  return Math.max(5, Math.round(dr.base * f));
}
function dealerMenu(q) {
  const d = districtAt(q.x, q.y), qty = G.dealQty || 1, first = q.name.split(' ')[0];
  const opts = [];
  for (const dr of DRUGS) {
    const pb = drugPrice(dr.id, d), ps = Math.round(pb * .86), have = G.drugs[dr.id] || 0, n = Math.min(qty, have);
    opts.push({ t: `Buy ${qty} ${dr.n} ${money(pb * qty)}`, d: G.cash < pb * qty || invWeight() + qty > invCap(), f: () => { if (pay(pb * qty)) { G.drugs[dr.id] = have + qty; Snd.play('rustle'); } return dealerMenu(q); } });
    opts.push({ t: `Sell ${dr.n} ${money(ps)}${have ? ' ×' + have : ''}`, c: have ? 'y' : '', d: !have, f: () => { G.drugs[dr.id] = have - n; addCash(ps * n); Snd.play('rustle'); return dealerMenu(q); } });
  }
  opts.push({ t: `Buy ${qty} leaf seeds ${money(55 * qty)}`, d: G.cash < 55 * qty, f: () => { if (pay(55 * qty)) { G.inv.seed_leaf = (G.inv.seed_leaf | 0) + qty; Snd.play('rustle'); toast('Grow them in a planter or a farm field'); } return dealerMenu(q); } });
  opts.push({ t: `Buy ${qty} lab supplies ${money(90 * qty)}`, d: G.cash < 90 * qty || invWeight() + qty > invCap(), f: () => { if (pay(90 * qty)) { G.inv.supplies = (G.inv.supplies | 0) + qty; Snd.play('rustle'); toast('Cook with a Home lab (buy one in your apartment\'s furniture catalog)'); } return dealerMenu(q); } });
  opts.push({ t: 'Qty: ' + qty, f: () => { G.dealQty = qty === 1 ? 5 : qty === 5 ? 10 : 1; return dealerMenu(q); } });
  opts.push({ t: 'Rob him', c: 'r', f: () => { q.state = 'fight'; q.target = G.player; q.timer = 20; q.talking = 0; pedSay(q, 'Big mistake.'); } });
  opts.push({ t: 'Leave' });
  const bag = DRUGS.filter(x => G.drugs[x.id]).map(x => `${x.n} ${G.drugs[x.id]}`).join(', ') || 'empty';
  return say(`${q.name} — ${DISTRICTS[d].name} corner`, `"${pick(['What you need?', 'Keep it quick, cops roll by here.', 'Prices change every day. Shop around.', 'Buy low, sell high. That\'s the game.'])}"   Bag: ${bag} (${invWeight()}/${invCap()})   Cash: ${money(G.cash)}`, opts);
}
function updateDealers(dt) {
  const p = G.player;
  for (const s of W.dealerSpots) {
    const d2 = dist2(s.x, s.y, p.x, p.y);
    if (!s.ped && d2 < 950 * 950 && !inView(s.x, s.y, 40) && G.t > (s.next || 0)) {
      const q = new Ped(s.x, s.y, { role: 'dealer', extra: { persist: 1, weapon: WI.pistol, hp: 90 } }); q.state = 'idle'; q.still = 1; q.jk = '#263238'; q.hood = 1; q.gang = null; q.dealer = 1; q.a = rnd(0, TAU);
      q.home = [s.x, s.y]; G.peds.push(q); s.ped = q;
    } else if (s.ped && (d2 > 1800 * 1800 || s.ped.dead && s.ped.deadT > 20) && !inView(s.x, s.y, 60)) {
      const i = G.peds.indexOf(s.ped); if (i >= 0) G.peds.splice(i, 1); if (s.ped.dead) s.next = G.t + 120; s.ped = null;
    }
  }
  // cops sniff out product
  if (drugTotal() > 0 && !p.car && stars() === 0 && !p.dead) for (const q of G.peds) {
    if (q.role !== 'cop' || q.dead || q.checked || dist2(q.x, q.y, p.x, p.y) > 75 * 75) continue; q.checked = 1;
    if (Math.random() < .35 && losClear(q.x, q.y, p.x, p.y)) { pedSay(q, pick(['Hey! What\'s in the bag?', 'Hold it right there!', 'Is that... drugs?'])); crime(1.1, 'Possession'); }
  }
}
function loseDrugs(reason) { if (drugTotal() > 0) { for (const d of DRUGS) delete G.inv[d.id]; msg(reason, '#ff6b6b'); } }
function makeRunMission(q) {
  const gang = q.gang, G2 = GANGS[gang], b = randStreetPoint(1400, 3000), units = rint(8, 14), tl = Math.round(40 + dist(G.player.x, G.player.y, b.x, b.y) / 200);
  return { gang, title: 'Product Run', reward: 1400 + units * 40, units, timer: tl, target: { x: b.x, y: b.y, label: 'Buyer' }, giver: G2.name,
    update(dt) { this.timer -= dt; const p = G.player, px = pCar() ? pCar().x : p.x, py = pCar() ? pCar().y : p.y; if (G.scene) return; if (dist2(px, py, b.x, b.y) < 60 * 60) completeMission(); else if (this.timer <= 0) failMission('The buyer got spooked and left.'); },
    hud() { return `Deliver ${this.units} units to the buyer`; } };
}

// ================= STRIP CLUB =================
const PERF_LINES = ['Hey sugar, enjoying the show?', 'Tips keep the music playing.', 'The VIP room is worth it, trust me.', 'No touching. Bruno is watching.', 'I\'m saving up for college. Seriously.', 'You look like trouble. I like trouble.'];
function perfMenu(q) {
  const first = q.name.split(' ')[0];
  return say(first, `"${pick(PERF_LINES)}"`, [
    { t: 'Chat', f: () => perfMenu(q) },
    { t: 'Tip $20', c: 'y', d: G.cash < 20, f: () => { if (pay(20)) { bills(q.x, q.y, 6); Snd.voice('laugh', q.vp, q.x, q.y); pedSay(q, pick(['Thanks, hun!', 'Aww, sweet.', 'You\'re a gentleman.'])); } return perfMenu(q); } },
    { t: 'Make it rain ($500)', c: 'r', d: G.cash < 500, f: () => { if (pay(500)) { bills(q.x, q.y, 60); for (const o of G.scene.peds) if (!o.dead && o !== q) setTimeout(() => Snd.voice('cheer', o.vp, o.x, o.y), Math.random() * 600); for (const o of G.scene.peds) if (!o.dead && o !== q) pedSay(o, pick(['WOOO!', 'Big spender!', 'Yeah!', 'Make it rain!'])); pedSay(q, 'Now THAT\'S a tip!'); G.cam.shake = 3; } } },
    { t: 'Leave' }]);
}
function bills(x, y, n) { for (let i = 0; i < n; i++) { const f = spawnFx('bill', x + rnd(-30, 30), y + rnd(-40, 10)); if (f) { f.vy = rnd(-50, 20); f.vx = rnd(-40, 40); } } Snd.play('cash'); }

// ================= MODS ENCODING (multiplayer) =================
const MODKEYS = ['p', 's', 'liv', 'rim', 'sp', 'hd', 'sk', 'tint', 'hl', 'neon', 'num'];
function encMods(m) { if (!m) return ''; const o = {}; for (const k of MODKEYS) if (m[k]) o[k] = m[k]; const s = JSON.stringify(o); return s === '{}' ? '' : s.slice(0, 200); }
const decCache = new Map();
function decMods(s) {
  if (typeof s !== 'string' || !s) return null; if (decCache.has(s)) return decCache.get(s);
  let o = null; try { const r = JSON.parse(s); o = {}; for (const k of MODKEYS) { const v = r[k]; if (k === 'p' || k === 's') { if (typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v)) o[k] = v; } else if (typeof v === 'number' && isFinite(v)) o[k] = clamp(Math.floor(v), 0, 99); } } catch (e) { o = null; }
  if (decCache.size > 200) decCache.clear(); decCache.set(s, o); return o;
}

// ================= PIGEONS =================
G.birds = [];
function updateBirds(dt) {
  if (G.scene || !G.player) return;
  const p = G.player, dk = darkness(), fx = pCar() ? pCar().x : p.x, fy = pCar() ? pCar().y : p.y;
  if (G.birds.length < 16 && dk < .55 && G.weather.rain < .4 && Math.random() < dt * 1.2) {
    for (let k = 0; k < 6; k++) {
      const a = rnd(0, TAU), r = rnd(260, 620), x = fx + Math.cos(a) * r, y = fy + Math.sin(a) * r, t = tileAt(Math.floor(x / T), Math.floor(y / T));
      if ((t !== TILE.WALK && t !== TILE.PATH && t !== TILE.GRASS) || inView(x, y, 20)) continue;
      const n = rint(3, 6); for (let i = 0; i < n; i++) G.birds.push({ x: x + rnd(-24, 24), y: y + rnd(-24, 24), a: rnd(0, TAU), st: 'ground', z: 0, vx: 0, vy: 0, pk: rnd(0, 2), hop: 0, c: pick(['#8a8f99', '#7a7f88', '#9aa0aa', '#6b6f77', '#c8c8c8']) });
      break;
    }
  }
  const shot = G.lastShot && G.t - G.lastShot.t < .3 ? G.lastShot : null; let flapped = false;
  for (let i = G.birds.length - 1; i >= 0; i--) {
    const b = G.birds[i];
    if (b.st === 'ground') {
      b.pk -= dt; if (b.pk <= 0) { b.pk = rnd(.4, 2); b.hop = .25; b.a += rnd(-1, 1); }
      if (b.hop > 0) { b.hop -= dt; b.x += Math.cos(b.a) * 30 * dt; b.y += Math.sin(b.a) * 30 * dt; }
      const dp = dist(b.x, b.y, p.x, p.y), car = G.cars.find(c => c.spd > 40 && dist2(c.x, c.y, b.x, b.y) < 160 * 160);
      if ((!p.car && dp < (p.spd > 120 ? 120 : 70)) || car || (shot && dist2(shot.x, shot.y, b.x, b.y) < 500 * 500) || (G.weather.rain > .5)) {
        b.st = 'air'; const th = car || (shot && dp > 200 ? shot : p), aw = Math.atan2(b.y - th.y, b.x - th.x) + rnd(-.6, .6); b.vx = Math.cos(aw) * rnd(160, 240); b.vy = Math.sin(aw) * rnd(160, 240); b.a = aw; if (!flapped) { Snd.play('flap', b.x, b.y); flapped = true; }
      }
    } else { b.x += b.vx * dt; b.y += b.vy * dt; b.z += 70 * dt; if (b.z > 260) { G.birds.splice(i, 1); continue; } }
    if (dist2(b.x, b.y, fx, fy) > 1600 * 1600) G.birds.splice(i, 1);
  }
}
function drawBirds(air) {
  for (const b of G.birds) {
    if ((b.st === 'air') !== air || !inView(b.x, b.y, 40)) continue;
    const s = 1 + b.z / 110, oy = -b.z * .35;
    if (air) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(b.x + b.z * .3, b.y + b.z * .2, 4, 3, 0, 0, TAU); ctx.fill(); }
    ctx.save(); ctx.translate(b.x, b.y + oy); ctx.rotate(b.a); ctx.scale(s, s);
    if (air) { const w = Math.sin(G.t * 26 + b.x) * 6; ctx.fillStyle = shade(b.c, .85); ctx.beginPath(); ctx.moveTo(1, 0); ctx.lineTo(-3, -7 - w); ctx.lineTo(-5, -1); ctx.moveTo(1, 0); ctx.lineTo(-3, 7 + w); ctx.lineTo(-5, 1); ctx.fill(); }
    ctx.fillStyle = b.c; ctx.beginPath(); ctx.ellipse(0, 0, 5, 3.2, 0, 0, TAU); ctx.fill();
    const peck = b.st === 'ground' && Math.sin(G.t * 9 + b.x) > .6 ? 1.5 : 0;
    ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.arc(4 + peck, 0, 2.2, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(80,200,140,.5)'; ctx.fillRect(2.5, -1.6, 1.5, 3.2); ctx.fillStyle = '#e0a040'; ctx.fillRect(6 + peck, -.5, 1.6, 1);
    ctx.restore();
  }
}

// ================= DIALOG PORTRAITS =================
function drawPortrait(cv, q) {
  const g = cv.getContext('2d'), w = cv.width, r = mulberry32(q.uid * 31 + 7);
  const bgc = q.role === 'cop' ? '#1f3a93' : q.gang ? GANGS[q.gang].col : q.role === 'perf' ? '#8e1d6e' : q.dealer ? '#1b5e20' : q.shop ? '#7a5c00' : '#34495e';
  const bg = g.createLinearGradient(0, 0, 0, w); bg.addColorStop(0, shade(bgc, 1.3)); bg.addColorStop(1, shade(bgc, .5)); g.fillStyle = bg; g.fillRect(0, 0, w, w);
  g.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 5; i++) g.fillRect(0, i * 14 + 4, w, 5);
  const sk = q.skin, hair = q.hair;
  if (q.hs === 4 && !q.hat && !q.hood) { g.fillStyle = hair; g.beginPath(); g.ellipse(32, 38, 18, 22, 0, 0, TAU); g.fill(); }
  g.fillStyle = q.jk || q.shirt; g.beginPath(); g.ellipse(32, 72, 30, 24, 0, 0, TAU); g.fill();
  if (q.jk) { g.fillStyle = q.shirt; g.beginPath(); g.moveTo(26, 50); g.lineTo(38, 50); g.lineTo(32, 64); g.fill(); }
  g.fillStyle = shade(sk, .85); g.fillRect(27, 40, 10, 10);
  const hg = g.createRadialGradient(28, 24, 2, 32, 30, 18); hg.addColorStop(0, shade(sk, 1.15)); hg.addColorStop(1, shade(sk, .8)); g.fillStyle = hg; g.beginPath(); g.ellipse(32, 29, 13, 15.5, 0, 0, TAU); g.fill();
  g.fillStyle = shade(sk, .8); g.beginPath(); g.arc(19, 30, 3, 0, TAU); g.arc(45, 30, 3, 0, TAU); g.fill();
  // hair & hats
  g.fillStyle = hair;
  if (q.hat === 1) { g.fillStyle = q.hair; g.beginPath(); g.ellipse(32, 16, 15, 8, 0, Math.PI, TAU); g.fill(); g.fillRect(17, 15, 30, 4); g.fillStyle = '#111'; g.fillRect(16, 18, 32, 3); g.fillStyle = '#f2c230'; g.fillRect(30, 10, 4, 4); }
  else if (q.hat === 2) { g.fillStyle = q.hatCol || '#111'; g.beginPath(); g.ellipse(32, 17, 15, 9, 0, Math.PI, TAU); g.fill(); g.fillRect(17, 16, 30, 4); g.fillRect(36, 18, 16, 3); }
  else if (q.hood) { g.fillStyle = q.jk || '#263238'; g.beginPath(); g.ellipse(32, 26, 18, 20, 0, Math.PI * .95, Math.PI * 2.05); g.lineTo(50, 44); g.lineTo(14, 44); g.fill(); g.fillStyle = hg; g.beginPath(); g.ellipse(32, 31, 11, 13, 0, 0, TAU); g.fill(); }
  else {
    const hs = q.hs || 0;
    if (hs === 0) { g.beginPath(); g.ellipse(32, 18, 14, 8, 0, Math.PI, TAU); g.fill(); g.fillRect(18, 17, 28, 4); }
    else if (hs === 1) { g.beginPath(); g.ellipse(32, 18, 15, 9, -.15, Math.PI, TAU); g.fill(); g.fillRect(18, 16, 6, 12); }
    else if (hs === 2) { g.beginPath(); g.arc(32, 18, 17, Math.PI * .9, Math.PI * 2.1); g.fill(); }
    else if (hs === 3) { g.globalAlpha = .7; g.beginPath(); g.ellipse(32, 18, 13, 6, 0, Math.PI, TAU); g.fill(); g.globalAlpha = 1; }
    else if (hs === 4) { g.beginPath(); g.ellipse(32, 17, 15, 9, 0, Math.PI, TAU); g.fill(); g.fillRect(17, 16, 5, 22); g.fillRect(42, 16, 5, 22); }
  }
  // face
  const shades = (q.gang || q.dealer || q.role === 'bouncer') && r() < .6;
  if (shades) { g.fillStyle = '#111'; g.fillRect(21, 26, 9, 5); g.fillRect(34, 26, 9, 5); g.fillRect(29, 27, 6, 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(22, 27, 3, 1); g.fillRect(35, 27, 3, 1); }
  else { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(26, 28, 3.2, 2.4, 0, 0, TAU); g.ellipse(38, 28, 3.2, 2.4, 0, 0, TAU); g.fill(); g.fillStyle = '#2b1d14'; g.beginPath(); g.arc(26.5, 28.3, 1.6, 0, TAU); g.arc(38.5, 28.3, 1.6, 0, TAU); g.fill(); g.fillStyle = shade(hair, .9); g.fillRect(22, 23, 8, 1.6); g.fillRect(34, 23, 8, 1.6); }
  if (q.role === 'perf') { g.fillStyle = '#c2185b'; g.beginPath(); g.ellipse(32, 39, 4, 1.8, 0, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(26, 22, 1, 1); }
  g.fillStyle = shade(sk, .7); g.fillRect(31, 30, 2, 5);
  g.strokeStyle = '#5a2e22'; g.lineWidth = 1.4; g.beginPath(); if ((q.mood || .5) > .55 || q.role === 'perf') g.arc(32, 36, 4, .2 * Math.PI, .8 * Math.PI); else { g.moveTo(28, 39); g.lineTo(36, 39); } g.stroke();
  if (q.hp < 50 && !q.dead) { g.fillStyle = 'rgba(160,0,0,.6)'; g.fillRect(40, 33, 3, 6); }
}
