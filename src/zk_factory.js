// ================= VARRO ASSEMBLY PLANT: town factory with an indoor forklift operator job =================
DOORCOL.factory = '#ffb300'; DOORICON.factory = '🏭'; FLOORS.factory = ['#707274', '#686a6c']; WALLTH.factory = { cap: '#37474f', face: '#8a9aa6', pat: 'corrug' };
Object.assign(IT, { prack: { s: 1 }, conveyor: { s: 1 }, fmachine: { s: 1 }, fbay: {}, fdock: {}, pallet: {}, fkpark: {}, timeclock: { s: 1 }, fsign: {} });
const FK_BAYS = [['A', '#ffca28'], ['B', '#29b6f6'], ['C', '#66bb6a'], ['D', '#ef5350']];
function factoryGen() {
  const L = W.buildings.filter(b => b.id < 572 && b.type === 'warehouse' && b.door && b.d === 'industrial' && !b.realty && !b.sub).sort((a, c) => c.w * c.h - a.w * a.h || a.id - c.id);
  const b = L[0] || W.buildings.find(b => b.type === 'warehouse' && b.door && !b.realty && !b.sub); if (!b) return; b.type = 'factory'; b.name = 'Varro Assembly Plant'; W.factory = b; W.labels.push({ n: 'Varro Assembly Plant', x: b.x + b.w / 2, y: b.y + b.h + 1 });
}
function makeFactory(b) {
  const w = 24, h = 15, items = [], npcs = [], I = (t, x, y, ww, hh, ex) => items.push(Object.assign({ t, x, y, w: ww, h: hh, used: 0, small: 1 }, ex || {})), P = (role, x, y, ex) => npcs.push(Object.assign({ role, x, y }, ex || {}));
  FK_BAYS.forEach(([k, c], i) => { const x0 = 1.4 + i * 5.4; I('prack', x0, .55, 4.8, 1.25, { col: c }); I('fbay', x0 + .2, 2.2, 4.4, 2.2, { bay: k, col: c }); });
  I('fdock', 1.2, 10.2, 5.4, 3.6); I('conveyor', 8.4, 6.6, 9.2, .7); for (const x of [9.2, 12.6, 16]) I('fmachine', x, 7.5, 1.6, 1.3);
  I('fkpark', 18.4, 11.2, 2.2, 1.6); I('timeclock', 21.8, 9.6, .6, .5); I('fsign', 21.1, 9.0, 1.9, .3); I('lockers', 22.9, 11.4, .6, 2.2); I('vend', 22.8, 13.2, .7, .7); I('bench2', 20.2, 13.6, 1.6, .4);
  P('worker', 21.2, 10.6, { still: 1, fore: 1 }); P('worker', 10.2, 9.3, { still: 1 }); P('worker', 13.6, 9.3, { still: 1 }); P('worker', 17, 9.3, { still: 1 }); P('worker', 12, 5.6, { roam: 1 }); P('worker', 20.5, 6, { roam: 1 });
  const solid = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) solid[y * w + x] = 1; const dx = 12; solid[(h - 1) * w + dx] = 0;
  return { b, w, h, floor: 'factory', items, npcDefs: npcs, solid, door: { x: (dx + .5) * T, y: (h - .6) * T }, peds: null, loot: {} };
}
// ---------- job state ----------
const FJ = () => LIFE().fjob || (LIFE().fjob = { shifts: 0, pallets: 0, earned: 0, lastT: -1e9 });
const inFactory = () => G.scene && G.scene.b.type === 'factory';
function fkSpawnPallet(s) { const k = pick(FK_BAYS), x = 1.6 + Math.random() * 4, y = 10.6 + Math.random() * 2.6; if (s.items.some(it => it.t === 'pallet' && Math.abs(it.x - x) < 1.1 && Math.abs(it.y - y) < 1.1)) return fkSpawnPallet(s); s.items.push({ t: 'pallet', x, y, w: .9, h: .9, bay: k[0], col: k[1], box: rint(0, 2), used: 0 }); }
function clockIn() {
  const s = G.scene, J = G.fjob; if (J) return clockOut(false);
  const left = Math.ceil((FJ().lastT + 45 - G.t)); if (left > 0) return say('Foreman', 'You just finished a shift. Grab a coffee — next one starts in ' + left + 's.');
  s.items = s.items.filter(it => it.t !== 'pallet'); const n = 6; for (let i = 0; i < 4; i++) fkSpawnPallet(s);
  G.fjob = { need: n, done: 0, spawned: 4, t: 0, lim: 210, pay: 0, errs: 0 }; Snd.play('beep');
  say('Foreman', 'Clocked in. Hop on the forklift, pick up pallets at the receiving dock (bottom left) and drop each one in the bay marked on it — A, B, C or D. ' + n + ' pallets, ' + Math.round(210 / 60 * 10) / 10 + ' minutes. $45 a pallet plus a bonus for speed.');
}
function clockOut(done) {
  const J = G.fjob; if (!J) return; const s = G.scene; G.fjob = null; if (G.fork && G.fork.load) G.fork.load = null; if (s) s.items = s.items.filter(it => it.t !== 'pallet');
  const base = J.done * 45, bonus = done ? Math.max(0, Math.round((J.lim - J.t) * 1.2)) + 60 : 0, pay = Math.max(0, base + bonus - J.errs * 10); const F = FJ();
  F.lastT = G.t; if (pay > 0) { addCash(pay); F.earned += pay; } F.pallets += J.done; if (done) F.shifts++;
  G.big = { text: done ? 'SHIFT DONE' : 'CLOCKED OUT', col: done ? '#2ecc71' : '#ffb300', t: 2.8, sub: J.done + ' pallets · +' + money(pay) + (bonus ? ' (incl. ' + money(bonus) + ' speed bonus)' : ''), small: 1 }; Snd.play(pay ? 'cash' : 'ui'); doSave(true);
}
function forkOn() { const p = G.player, s = G.scene, k = s.items.find(it => it.t === 'fkpark'); if (!k) return; k.out = 1; G.fork = { load: null, spd: 0 }; p.x = (k.x + k.w / 2) * T; p.y = (k.y + k.h / 2) * T; p.a = -Math.PI / 2; p.r0 = p.r; p.r = 17; Snd.play('start', p.x, p.y, .5); toast(G.fjob ? 'Drive to the dock and lift a pallet' : 'Forklift — clock in at the time clock to get paid'); }
function forkOff(silent) { const p = G.player, f = G.fork; if (!f) return; if (f.load && G.scene) dropPallet(true); G.fork = null; if (p.r0) p.r = p.r0; const s = G.scene, k = s && s.items.find(it => it.t === 'fkpark'); if (k) { k.out = 0; if (!silent) { p.x = (k.x - .4) * T; p.y = (k.y + k.h / 2) * T; } } }
const forkTip = () => { const p = G.player; return [p.x + Math.cos(p.a) * 40, p.y + Math.sin(p.a) * 40]; };
function nearPallet() { const [fx, fy] = forkTip(); let b = null, bd = 46; for (const it of G.scene.items) { if (it.t !== 'pallet') continue; const d = dist(fx, fy, (it.x + it.w / 2) * T, (it.y + it.h / 2) * T); if (d < bd) { bd = d; b = it; } } return b; }
function bayAt(x, y) { return G.scene.items.find(it => it.t === 'fbay' && x > it.x * T && x < (it.x + it.w) * T && y > it.y * T && y < (it.y + it.h) * T); }
function liftPallet(it) { const s = G.scene; s.items.splice(s.items.indexOf(it), 1); G.fork.load = it; Snd.play('clunk'); if (G.fjob && !it.placed) toast('Pallet for bay ' + it.bay + ' — follow the ' + it.bay + ' markings up top'); }
function dropPallet(quiet) {
  const f = G.fork, it = f.load; if (!it) return; f.load = null; const [fx, fy] = forkTip(), s = G.scene, bay = bayAt(fx, fy);
  it.x = fx / T - it.w / 2; it.y = fy / T - it.h / 2; s.items.push(it); Snd.play('thud'); if (quiet) return;
  const J = G.fjob; if (!J || !bay) return; if (it.placed) return;
  if (bay.bay !== it.bay) { J.errs++; toast('Wrong bay! That pallet goes to ' + it.bay + ' (−$10)'); Snd.play('bad'); return; }
  it.placed = 1; J.done++; Snd.play('cash'); toast('Pallet ' + J.done + '/' + J.need + ' in bay ' + it.bay); for (let i = 0; i < 4; i++) spawnFx('dust', fx, fy);
  if (J.spawned < J.need) { fkSpawnPallet(s); J.spawned++; }
  if (J.done >= J.need) { forkOff(); clockOut(true); }
}
// ---------- hooks ----------
function findInteractK() { const o = findInteractH(); if (!inFactory()) return o; const p = G.player, s = G.scene;
  if (G.fork) { if (G.fork.load) return { k: 'fk', a: 'drop', label: 'Lower pallet' + (bayAt(...forkTip()) ? ' in bay ' + bayAt(...forkTip()).bay : '') }; const pl = nearPallet(); if (pl) return { k: 'fk', a: 'lift', it: pl, label: 'Lift pallet (bay ' + pl.bay + ')' }; const k = s.items.find(it => it.t === 'fkpark'); if (k && dist(p.x, p.y, (k.x + k.w / 2) * T, (k.y + k.h / 2) * T) < 90) return { k: 'fk', a: 'off', label: 'Park & get off forklift' }; return { k: 'fk', a: 'off', label: 'Get off forklift' }; }
  const near = (t, r) => { const it = s.items.find(q => q.t === t); return it && dist(p.x, p.y, (it.x + it.w / 2) * T, (it.y + it.h / 2) * T) < r ? it : null; };
  if (near('timeclock', 70)) return { k: 'fk', a: 'clock', label: G.fjob ? 'Clock out (' + G.fjob.done + '/' + G.fjob.need + ' done)' : 'Clock in — forklift shift' };
  const fk = near('fkpark', 95); if (fk && !fk.out) return { k: 'fk', a: 'on', label: 'Drive the forklift' };
  return o;
}
function doInteractK(o) { if (o && o.k === 'fk') { if (o.a === 'clock') return clockIn(); if (o.a === 'on') return forkOn(); if (o.a === 'off') return forkOff(); if (o.a === 'lift') return liftPallet(o.it); if (o.a === 'drop') return dropPallet(); return; } return doInteractH(o); }
function controlPlayerK(dt) {
  const f = G.fork, p = G.player; if (!f) return controlPlayer0(dt); if (!inFactory() || p.dead) { forkOff(true); return controlPlayer0(dt); }
  const I = Input; if (G.dlgOpen || G.mode !== 'play' || G.menuOpen) { p.mvx = p.mvy = 0; return; }
  if (I.edge.act) { const o = findInteract(); if (o) doInteract(o); } if (I.edge.car) return forkOff();
  if (!G.fork) return; const mx = I.mx, my = I.my, mag = Math.min(1, Math.hypot(mx, my)), top = f.load ? 120 : 150;
  if (I.kbd) { p.a += (I.steer || 0) * 2.4 * dt * (f.spd >= 0 ? 1 : -1); const want = (I.gas ? 1 : 0) - (I.rev ? .6 : 0); f.spd += clamp(want * top - f.spd, -260 * dt, 220 * dt); }
  else if (mag > .15) { const want = Math.atan2(my, mx), da = angDiff(p.a, want); if (Math.abs(da) > 2.4 && f.spd < 30) { p.a += Math.sign(da) * 2.6 * dt; f.spd += clamp(-50 * mag - f.spd, -260 * dt, 220 * dt); } else { p.a += clamp(da, -2.6 * dt, 2.6 * dt); f.spd += clamp(top * mag * (1 - Math.min(.6, Math.abs(da) / 2)) - f.spd, -300 * dt, 200 * dt); } }
  else f.spd += clamp(-f.spd, -320 * dt, 320 * dt);
  p.mvx = Math.cos(p.a) * f.spd; p.mvy = Math.sin(p.a) * f.spd; f.ph = (f.ph || 0) + f.spd * dt;
  if (Math.abs(f.spd) > 20 && Math.random() < dt * 2) Snd.play('rev', p.x, p.y, .12);
}
function drawItemK(it, s) {
  if (!IT[it.t] || !['prack', 'conveyor', 'fmachine', 'fbay', 'fdock', 'pallet', 'fkpark', 'timeclock', 'fsign'].includes(it.t)) return drawItem0(it, s);
  const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T;
  switch (it.t) {
    case 'fbay': { const J = G.fjob, want = G.fork && G.fork.load && G.fork.load.bay === it.bay, pul = want ? .45 + .35 * Math.sin(G.t * 6) : .25; g.fillStyle = it.col; g.globalAlpha = pul; for (let i = -h; i < w; i += 22) { g.beginPath(); g.moveTo(x + i, y + h); g.lineTo(x + i + 10, y + h); g.lineTo(x + i + 10 + h, y); g.lineTo(x + i + h, y); g.fill(); } g.globalAlpha = 1; g.strokeStyle = it.col; g.lineWidth = 5; g.strokeRect(x, y, w, h); g.fillStyle = it.col; g.font = 'bold 54px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.globalAlpha = .85; g.fillText(it.bay, x + w / 2, y + h / 2 + 4); g.globalAlpha = 1; void J; break; }
    case 'fdock': { g.fillStyle = 'rgba(255,214,0,.12)'; g.fillRect(x, y, w, h); g.strokeStyle = '#ffd600'; g.lineWidth = 4; g.setLineDash([16, 10]); g.strokeRect(x, y, w, h); g.setLineDash([]); g.fillStyle = '#ffd600'; g.font = 'bold 22px sans-serif'; g.textAlign = 'center'; g.fillText('RECEIVING', x + w / 2, y + h - 12); g.fillStyle = '#5d6166'; g.fillRect(x - T * 1.05, y + 20, 18, h - 40); for (let yy = y + 26; yy < y + h - 24; yy += 12) { g.fillStyle = '#80868c'; g.fillRect(x - T * 1.05, yy, 18, 6); } break; }
    case 'prack': { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 6, w, h); g.fillStyle = '#e65100'; g.fillRect(x, y, w, h); g.fillStyle = '#2b2f33'; g.fillRect(x + 4, y + 4, w - 8, h - 8); for (let i = 0; i < 4; i++) { const bx = x + 10 + i * (w - 20) / 4; g.fillStyle = '#a1887f'; g.fillRect(bx, y + 10, (w - 20) / 4 - 8, h - 20); g.fillStyle = i % 2 ? '#c8b28c' : '#bfa57a'; g.fillRect(bx + 4, y + 14, (w - 20) / 4 - 16, h - 28); } g.fillStyle = '#ff6d00'; for (let i = 0; i <= 4; i++) g.fillRect(x + 4 + i * (w - 12) / 4, y, 5, h); break; }
    case 'conveyor': { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 6, w, h); g.fillStyle = '#455a64'; g.fillRect(x, y, w, h); g.fillStyle = '#263238'; g.fillRect(x, y + 6, w, h - 12); const off = (G.t * 60) % 24; g.fillStyle = '#37474f'; for (let i = -24; i < w; i += 24) g.fillRect(x + i + off, y + 6, 3, h - 12); for (let i = 0; i < 5; i++) { const bx = x + ((G.t * 60 + i * w / 5) % w); g.fillStyle = '#c8a165'; g.fillRect(bx - 12, y + 8, 22, h - 16); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(bx - 1, y + 8, 2, h - 16); } break; }
    case 'fmachine': { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 6, w, h); g.fillStyle = '#90a4ae'; g.fillRect(x, y, w, h); g.fillStyle = '#607d8b'; g.fillRect(x + 6, y + 6, w - 12, h - 12); const on = Math.sin(G.t * 4 + it.x) > 0; g.fillStyle = on ? '#76ff03' : '#33691e'; g.fillRect(x + w - 16, y + 8, 8, 8); g.fillStyle = '#ffeb3b'; g.fillRect(x, y + h - 6, w, 6); g.fillStyle = '#111'; for (let i = 0; i < w; i += 12) g.fillRect(x + i, y + h - 6, 6, 6); g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(G.t * 3); g.fillStyle = '#cfd8dc'; g.fillRect(-12, -2, 24, 4); g.fillRect(-2, -12, 4, 24); g.restore(); break; }
    case 'pallet': drawPallet(g, x, y, w, h, it); break;
    case 'fkpark': { g.strokeStyle = '#ffd600'; g.lineWidth = 3; g.strokeRect(x, y, w, h); if (!it.out) { g.save(); g.translate(x + w / 2, y + h / 2); g.rotate(-Math.PI / 2); drawForklift(g, null, 0); g.restore(); } break; }
    case 'timeclock': { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#263238'; g.fillRect(x, y, w, h); g.fillStyle = G.fjob ? '#76ff03' : '#ff5252'; g.fillRect(x + 6, y + 6, w - 12, 8); g.fillStyle = '#b0bec5'; g.fillRect(x + w - 10, y + h - 12, 6, 8); break; }
    case 'fsign': { g.fillStyle = '#1565c0'; g.fillRect(x, y, w, h); g.fillStyle = '#fff'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FORKLIFT OPERATORS WANTED', x + w / 2, y + h / 2 + 1); break; }
  }
}
function drawPallet(g, x, y, w, h, it) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 4, y + 5, w, h); g.fillStyle = '#8d6e63'; g.fillRect(x, y, w, h); g.fillStyle = '#a1887f'; for (let i = 0; i < 4; i++) g.fillRect(x + 2, y + 3 + i * (h - 6) / 3.2, w - 4, 6);
  const c = it.box === 1 ? '#5d4037' : it.box === 2 ? '#78909c' : '#c8a165'; g.fillStyle = c; g.fillRect(x + 6, y + 6, w - 12, h - 12); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x + 6, y + 6, w - 12, 4); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + w / 2, y + 6); g.lineTo(x + w / 2, y + h - 6); g.moveTo(x + 6, y + h / 2); g.lineTo(x + w - 6, y + h / 2); g.stroke();
  if (it.col && !it.placed) { g.fillStyle = it.col; g.fillRect(x + w / 2 - 13, y + h / 2 - 13, 26, 26); g.fillStyle = '#111'; g.font = 'bold 20px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.bay, x + w / 2, y + h / 2 + 1); }
}
// forklift drawn facing +x, centred on the driver seat
function drawForklift(g, load, ph) {
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-30, -20, 66, 44);
  g.fillStyle = '#212121'; for (const [wx, wy] of [[-22, -21], [-22, 15], [14, -21], [14, 15]]) { g.fillRect(wx, wy, 14, 6); g.fillStyle = '#424242'; for (let i = ((ph || 0) % 4); i < 14; i += 4) g.fillRect(wx + i, wy, 1.5, 6); g.fillStyle = '#212121'; }
  g.fillStyle = '#37474f'; g.fillRect(-32, -15, 10, 30); g.fillStyle = '#f9a825'; g.fillRect(-24, -17, 46, 34); g.fillStyle = '#fbc02d'; g.fillRect(-24, -17, 46, 6);
  g.fillStyle = '#111'; g.fillRect(-12, -11, 18, 22); g.fillStyle = '#263238'; g.fillRect(-8, -7, 9, 14); g.strokeStyle = '#212121'; g.lineWidth = 3; g.strokeRect(-16, -15, 30, 30);
  g.fillStyle = '#9e9e9e'; g.fillRect(22, -16, 5, 32); g.fillStyle = '#757575'; g.fillRect(24, -14, 2, 28);
  g.fillStyle = '#bdbdbd'; g.fillRect(27, -11, 30, 4); g.fillRect(27, 7, 30, 4);
  g.fillStyle = '#ff6d00'; g.beginPath(); g.arc(-4, 0, 3, 0, TAU); g.fill();
  if (load) { g.save(); g.translate(42, 0); drawPallet(g, -27, -27, 54, 54, load); g.restore(); }
}
function drawPedK(p) {
  if (p === G.player && G.fork && G.scene) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); drawForklift(ctx, G.fork.load, G.fork.ph); ctx.restore(); ctx.save(); ctx.translate(p.x - Math.cos(p.a) * 4, p.y - Math.sin(p.a) * 4); ctx.scale(.85, .85); ctx.translate(-p.x, -p.y); const hid = p.hidden; drawPedP(p); p.hidden = hid; ctx.restore(); return; }
  drawPedP(p);
}
function factoryTick(dt) {
  const J = G.fjob; if (!J) return; if (!inFactory()) { G.fjob = null; FJ().lastT = G.t; if (J.done) { const pay = J.done * 45; addCash(pay); msg('You walked off the job. Paid ' + money(pay) + ' for ' + J.done + ' pallets.', '#ffb300'); } if (G.fork) forkOff(true); return; }
  J.t += dt; if (J.t >= J.lim) { forkOff(); clockOut(false); msg('Out of time — the foreman sent you home.', '#ffb300'); }
}
function drawFactoryHUD() { const J = G.fjob; if (!J || !G.scene) return; const sc = hudSc(), g = ctx, left = Math.max(0, Math.ceil(J.lim - J.t)), tx = 'FORKLIFT  ' + J.done + '/' + J.need + '   ⏱ ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0') + (G.fork && G.fork.load ? '   → BAY ' + G.fork.load.bay : ''); hudLine(tx, left < 30 ? '#ff5252' : '#ffd600', 14 * sc); }
function updateK(dt) { update0(dt); if (G.mode === 'play') { marketTick(dt); factoryTick(dt); } }
