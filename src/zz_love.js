// ================= A CAR YOU LOVE: wrecks come home to be rebuilt slowly, worn engines misfire & seize, and a cheap slow DIY fix =================
const beloved = c => c && c.owned && !c.remote && !c.missionCar && !c.d.boat && !c.d.pedal && !c.scamOf && !c.meetCar && (c.gid || c.isRide || c.starter || c.legit || c.wasMine);
// a wreck: every part battered, but it's still yours and still fixable
function wreckOf(rec) { const r = JSON.parse(JSON.stringify(rec)); ensurePC(r, r.type, .3); for (const s in r.pc) r.pc[s] = clamp(rnd(.02, .14) * (/panels|wheelset|m:sp|m:sk|m:hd|m:rim/.test(s) ? .6 : 1), .01, 1); r.pcAvg = pcAvg(r.pc, Object.keys(r.pc)); r.cond = r.pcAvg; r.trunk = {}; r.wreck = 1; delete r.gar; return r; }
function towWreck(rec, name, why) { const r = wreckOf(rec);
  if (garUsed() < garCap()) { myCars().push(r); garAssign(); const g = homeGarages().find(g => g.b.id === r.gar); msg('🚛 ' + (why || 'Your wrecked ' + name + ' was towed home') + (g ? ' — it\'s in the ' + garName(g.b) + ' garage. Fix it up over time.' : '.'), '#4fc3f7'); }
  else { const g = homeGarages()[0], s = g && nearRoadSpot({ x: g.x, y: g.y }, 6); if (!s) return; const c = new Car(r.type, s[0], s[1], s[2]); applyMods(c, Object.assign({}, r.mods || {})); c.pc = r.pc; c.pcAvg = r.pcAvg; c.hp = c.st.hp * Math.max(.05, r.cond); c.owned = 1; c.persist = 1; c.legit = r.legit; c.gid = r.id; c.wasMine = 1; c.flat = 1; c.ai = { mode: 'parked' }; applyMods(c); G.cars.push(c); msg('🚛 ' + (why || 'Your wrecked ' + name + ' was towed home') + ' — your garages are full, so it\'s parked outside ' + garName(g.b) + '.', '#ff9f43'); }
  doSave(true); }
{ const _ft = fileClaim; fileClaim = function (c, wreck) { c.wasMine = 1; return _ft(c, wreck); }; }
function loveTick(dt) { if ((G.lvT = (G.lvT || 0) - dt) > 0) return; G.lvT = .5; const p = pCar(); if (p && p.owned) p.wasMine = 1;
  for (const c of G.cars) { if (!(c.dead || c.gone) || c.claimed || !beloved(c)) continue; c.claimed = 1; if (c.isRide && G.save.ride) delete G.save.ride; ensurePC(c, c.type, .3); const rr = insRec(c, 0); rr.legit = c.legit ? 1 : 0; towWreck(rr, c.d.name, 'Your burnt-out ' + c.d.name + ' was towed home in pieces'); }
  slowFixTick(); }
// dying away from an untitled car you love: it gets towed home as it is (titled ones already go through insurance)
{ const _rs = respawn; respawn = function () { const c = G.lastLove, ok = c && !c.dead && !c.claimed && !insuredCar(c) && beloved(c) && G.cars.includes(c) && c.driver !== G.player; if (ok) { G.cars.splice(G.cars.indexOf(c), 1); c.claimed = 1; } _rs.apply(this, arguments); if (ok) { const r = insRec(c, 0); r.legit = c.legit ? 1 : 0; if (garUsed() < garCap()) { myCars().push(r); garAssign(); msg('🚛 Your ' + c.d.name + ' was towed home while you were out.', '#4fc3f7'); } } G.lastLove = null; }; }
{ const _it = insTick; insTick = function (dt) { _it(dt); const p = pCar(); if (p && beloved(p)) G.lastLove = p; }; }
// ---------- worn engines misfire, then seize ----------
function engTick(dt) { const c = pCar(); if (!c || !c.pc || c.pc.eng === undefined || G.scene) return; const e = c.pc.eng;
  if (e <= .02) { c.throttle = 0; c.vx *= .97; c.vy *= .97; if (!c.seizeMsg) { c.seizeMsg = 1; Snd.play('bad'); msg('💀 The engine seized. Fix or swap it — or tow it home (Phone › Vehicles › Store).', '#ff6b6b'); } return; }
  c.seizeMsg = 0; if (e < .1 && c.throttle > .3 && Math.random() < dt * (1.6 - e * 10)) { c.vx *= .9; c.vy *= .9; Snd.pop(c.x, c.y, Math.random() < .3, .6); if (!c.misMsg) { c.misMsg = 1; msg('⚠ The engine is misfiring (' + pct(e) + ') — it\'s close to seizing.', '#ff9f43'); } } }
// ---------- slow DIY fix: costs pocket change, takes real time while the car sits in a garage ----------
const SLOW_RATE = 1 / 12; // % per second → about 19 minutes from wrecked to 95%
const slowCost = (price, c) => Math.max(5, Math.round(price * .035 * (1 - c) / 5) * 5);
function slowFixTick() { const now = G.t, L = myCars(); for (const r of L) { const f = r.sfix; if (!f || !r.pc || r.pc[f.s] === undefined) { if (f) delete r.sfix; continue; }
    const d = Math.max(0, now - (f.t || now)); f.t = now; if (d > 5) continue; r.pc[f.s] = Math.min(.95, r.pc[f.s] + d * SLOW_RATE / 100); r.pcAvg = pcAvg(r.pc, Object.keys(r.pc)); r.cond = r.pcAvg;
    if (r.pc[f.s] >= .95) { delete r.sfix; if (r.wreck && Object.values(r.pc).every(v => v >= .5)) delete r.wreck; mkNote && mkNote(slotName(f.s) + ' on your ' + CAR_TYPES[r.type].name + ' is fixed'); msg('🔧 Finished working on the ' + slotName(f.s).toLowerCase() + ' of your ' + CAR_TYPES[r.type].name + ' (95%).', '#2ecc71'); } } }
function startSlow(t, s) { const r = t.r; if (!r) return toast('Park it in a garage first'); const c = r.pc[s], cost = slowCost(slotPrice(s, t.type, t.mods), c); if (!payAny(cost)) return; r.sfix = { s, t: G.t }; Snd.play('ratchet'); toast('Working on it slowly — about ' + Math.ceil((95 - c * 100) / SLOW_RATE / 60) + ' min while it sits in the garage'); doSave(true); }
{ const _fb = fixBtn; fixBtn = function (H, t, s) { const out = _fb(H, t, s); const o = tOwner(t), c = (o.pc || {})[s]; if (c === undefined || c >= .95) return out; if (t.kind === 'car') return out;
  const f = o.sfix; if (f && f.s === s) return [H.btn('🔧 ' + pct(c) + ' — stop', () => { delete o.sfix; })]; const cost = slowCost(slotPrice(s, t.type, t.mods), c);
  return out.concat([H.btn('Slow fix ' + money(cost), () => startSlow(t, s), '', !!f)]); }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') { loveTick(dt); engTick(dt); } }; }
// ---------- maintain everything at once: quick DIY fix-all, or queue the slow fixes ----------
function wornSlots(t) { const pc = tPC(t); return Object.keys(pc).filter(s => pc[s] < .95); }
function fixAllCost(t) { const pc = tOwner(t).pc || {}; return wornSlots(t).reduce((a, s) => a + repairCost(slotPrice(s, t.type, t.mods), pc[s]), 0); }
function slowAllCost(t) { const pc = tOwner(t).pc || {}; return wornSlots(t).reduce((a, s) => a + slowCost(slotPrice(s, t.type, t.mods), pc[s]), 0); }
function fixAll(t) { const L = wornSlots(t), cost = fixAllCost(t); if (!L.length) return; if (!payAny(cost)) return; const pc = tPC(t); for (const s of L) pc[s] = .95; const o = tOwner(t); if (o.sfix) delete o.sfix; o.sfixQ = null; tRecalc(t); Snd.play('ratchet'); toast('Serviced ' + L.length + ' part' + (L.length > 1 ? 's' : '') + ' — ' + money(cost)); doSave(true); }
function slowAll(t) { const r = t.r; if (!r) return toast('Park it in a garage first'); const L = wornSlots(t).sort((a, b) => r.pc[a] - r.pc[b]), cost = slowAllCost(t); if (!L.length) return; if (!payAny(cost)) return; r.sfixQ = L.slice(1); r.sfix = r.sfix || { s: L[0], t: G.t }; Snd.play('ratchet'); toast('Queued ' + L.length + ' slow fixes — about ' + Math.ceil(L.reduce((a, s) => a + (95 - r.pc[s] * 100), 0) / SLOW_RATE / 60) + ' min in the garage'); doSave(true); }
{ const _st = slowFixTick; slowFixTick = function () { const before = myCars().map(r => r.sfix && r.sfix.s); _st(); myCars().forEach((r, i) => { if (!r.sfix && r.sfixQ && r.sfixQ.length) { let s; while ((s = r.sfixQ.shift()) && !(r.pc && r.pc[s] < .95)); if (s) r.sfix = { s, t: G.t }; } }); }; }
{ const hg = PMODES.hgarage; PMODES.hgarage = function (H) { const r = hg.call(this, H); if (this.tab === 'parts' || !this.wsel || (this.slot && this.slotCar === this.wsel)) return r; const t = gTarget(this.wsel, this.opt.g); if (!t) return r; const n = wornSlots(t).length; if (!n) return r;
  const fc = fixAllCost(t), sc = slowAllCost(t), o = tOwner(t), q = (o.sfixQ || []).length + (o.sfix ? 1 : 0); const fr = H.mk('div', ''); fr.style.cssText = 'display:flex;gap:6px;width:100%;margin-bottom:6px';
  const b1 = H.btn('🔧 Fix all ' + n + ' worn — ' + money(fc), () => fixAll(t), 'y', !canPay(fc)); const b2 = q ? H.btn('🐢 Slow-fixing (' + q + ' left) — stop', () => { o.sfix = null; o.sfixQ = null; }) : H.btn('🐢 Slow fix all — ' + money(sc), () => slowAll(t), '', t.kind === 'car' || !canPay(sc));
  for (const b of [b1, b2]) { b.style.flex = '1'; b.style.margin = '0'; fr.appendChild(b); } H.foot.insertBefore(fr, H.foot.firstChild); return r; }; }
// ---------- the workbench: slow-fix loose parts too (they sit on the bench while you work on them) ----------
const BENCH = () => G.save.bench || (G.save.bench = []);
function benchAdd(id, c) { if (c >= .95) return; const cost = slowCost(loosePrice(id), c); if (!payAny(cost)) return; const got = unitTake(id, c); if (got === null) return; BENCH().push({ id, c: got, t: G.t }); Snd.play('ratchet'); toast((unitName(id).split(' — ')[1] || unitName(id)) + ' is on the workbench (' + (BENCH().length > 1 ? BENCH().length - 1 + ' ahead of it' : 'working on it now') + ')'); doSave(true); }
function benchOff(i) { const j = BENCH()[i]; if (!j) return; BENCH().splice(i, 1); unitGive(j.id, j.c); doSave(true); }
function benchTick() { const B = G.save && G.save.bench; if (!B || !B.length) return; const j = B[0], d = Math.max(0, G.t - (j.t || G.t)); j.t = G.t; if (d > 5) return; j.c = Math.min(.95, j.c + d * SLOW_RATE / 100);
  if (j.c >= .95) { B.shift(); unitGive(j.id, .95); msg('🔧 Workbench: ' + (unitName(j.id).split(' — ')[1] || unitName(j.id)) + ' fixed (95%) — back on your shelf.', '#2ecc71'); if (B[0]) B[0].t = G.t; doSave(true); } }
{ const _st = slowFixTick; slowFixTick = function () { _st(); benchTick(); }; }
// Parts tab: a Slow fix button on every worn part, and the bench at the top
{ const pt = partsTab; partsTab = function (H) { pt(H); const c1 = H.body.querySelector('.pcol'); if (!c1) return;
  const B = BENCH(); if (B.length) { const box = H.mk('div', ''); box.appendChild(H.mk('div', 'ptitle', '🛠 Workbench — ' + B.length + ' part' + (B.length > 1 ? 's' : '')));
    B.forEach((j, i) => { const r = tintRow(H.row(box, i ? '⏳' : '🔧', (unitName(j.id).split(' — ')[1] || unitName(j.id)), (i ? 'Waiting · ' : 'Working · ') + pct(j.c) + ' → 95%' + (i ? '' : ' · ~' + Math.ceil((95 - j.c * 100) / SLOW_RATE / 60) + ' min'), [H.btn('Take off', () => benchOff(i))]), j.c); r.classList.add('pmsg'); box.appendChild(r); });
    c1.insertBefore(box, c1.children[1] || null); } }; }
// ---------- the workbench as a real spot in the garage ----------
IT.gwbench = { s: 1, act: 'Workbench' };
{ const _di = drawItem; drawItem = function (it, s) { if (it.t !== 'gwbench') return _di(it, s); const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T, B = BENCH(), j = B[0];
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 4, y + 5, w, h); g.fillStyle = '#8d6e63'; g.fillRect(x, y, w, h); g.fillStyle = '#a1887f'; g.fillRect(x + 3, y + 3, w - 6, h - 6); g.strokeStyle = '#6d4c41'; g.lineWidth = 1; for (let k = 1; k < 4; k++) { g.beginPath(); g.moveTo(x + 3, y + h * k / 4); g.lineTo(x + w - 3, y + h * k / 4); g.stroke(); }
  g.fillStyle = '#546e7a'; g.fillRect(x + w - 26, y + 4, 18, 12); g.fillStyle = '#37474f'; g.fillRect(x + w - 30, y + 8, 6, 4); // vise
  g.fillStyle = '#c0392b'; g.fillRect(x + 8, y + h - 12, 14, 4); g.fillStyle = '#95a5a6'; g.fillRect(x + 22, y + h - 11, 10, 2); // tools
  if (j) { const cx = x + w * .45, cy = y + h / 2; g.fillStyle = '#5d6d7e'; g.fillRect(cx - 14, cy - 9, 28, 18); g.fillStyle = '#95a5a6'; g.beginPath(); g.arc(cx, cy, 6, 0, TAU); g.fill();
    if (Math.random() < .08) spawnFx('spark', cx + rnd(-8, 8), cy + rnd(-6, 6)); const pw = w - 16, pr = clamp((j.c - .0) / .95, 0, 1); g.fillStyle = '#1b1e24'; g.fillRect(x + 8, y - 9, pw, 5); g.fillStyle = condCol(j.c); g.fillRect(x + 8, y - 9, pw * pr, 5); }
  g.font = 'bold 9px Rubik, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000'; const lb = 'WORKBENCH' + (B.length ? ' · ' + pct(j.c) + (B.length > 1 ? ' (+' + (B.length - 1) + ')' : '') : ''); g.strokeText(lb, x + w / 2, y - (j ? 13 : 4)); g.fillStyle = '#f2c230'; g.fillText(lb, x + w / 2, y - (j ? 13 : 4)); }; }
{ const _ui = useItem; useItem = function (it) { if (it.t === 'gwbench') { const s = G.scene; Panel.open('hgarage', { g: s.garage }); Panel.tab = 'parts'; Panel.render(); if (!BENCH().length) toast('Tap "Slow fix" on a worn part to put it on the bench'); return; } return _ui(it); }; }
// ---------- cars take more punishment: a big hit totals a car (smoking, won't drive) instead of always blowing up ----------
{ const d0 = Car.prototype.damage; Car.prototype.damage = function (n, by) { if (this.dead) return; const crash = !by || by instanceof Car; if (crash) n *= .65; const hp0 = this.hp, max = this.st ? this.st.hp : 100;
    if (this.hp - n <= 0 && !this.fireT) { const after = this.hp - n; if (after < -max * .35 || (!crash && Math.random() < .35) || (crash && Math.random() < .12)) return d0.call(this, n, by); this.hp = Math.max(after, -max * .34); if (by) this.lastHitBy = by; if (!this.totaled) { this.totaled = 1; if (this === pCar()) msg('💥 Totaled — it won\'t drive. Fix it or tow it home (Phone › Vehicles › Store).', '#ff6b6b'); } return; }
    return d0.call(this, n, by); }; }
function totalTick(dt) { for (const c of G.cars) { if (!c.totaled) continue; if (c.dead || c.hp > 0) { c.totaled = 0; continue; } c.throttle = 0; c.boost = 0; if (c.driver && c.driver !== G.player && c.ai) { c.ai.cruise = 0; } if (Math.random() < dt * 3 && inView(c.x, c.y, 60)) spawnFx('smoke', c.x + rnd(-8, 8), c.y + rnd(-8, 8)); } }
{ const _u2 = update; update = function (dt) { _u2(dt); if (G.mode === 'play') totalTick(dt); }; }
{ const _sd = shopRepairDo; shopRepairDo = function (c) { _sd(c); c.totaled = 0; }; }
