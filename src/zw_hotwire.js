// ================= BREAKING INTO PARKED CARS: locks, smashed windows, alarms, and a fiddly hotwire =================
const carTier = c => { const v = CARVAL[c.type] || 400; return v >= 30000 ? 3 : v >= 9000 ? 2 : v >= 3500 ? 1 : 0; }; // 0 beater … 3 high-end
const needsBreakIn = c => c && !c.dead && !c.driver && !c.owned && !c.deadIgn && !c.remote && !c.d.pedal && !c.wired && !(c.ai && c.ai.mode === 'traffic');
function tryEnterCar(c) {
  if (!needsBreakIn(c)) return enterCar(c);
  if (c.locked === undefined) c.locked = Math.random() < [.45, .6, .75, .92][carTier(c)] ? 1 : 0;
  if (!c.locked || c.d.two) return startWire(c);
  say(c.d.name, 'Locked. ' + ['Old and rusty.', 'A regular lock.', 'A decent lock — probably alarmed.', 'High-end. Alarm for sure.'][carTier(c)], [
    { t: 'Smash the window  (fast · loud)', c: 'r', f: () => { closeDialog(); smashIn(c); } },
    { t: 'Pick the lock  (slow · quiet)', c: 'y', f: () => { closeDialog(); G.bi = { c, stage: 'pick', t: 0, need: 2.5 + carTier(c) * 1.2, x: G.player.x, y: G.player.y }; toast('Picking the lock… stay still'); } },
    { t: 'Leave it' }]);
}
function smashIn(c) { Snd.play('glass', c.x, c.y); for (let i = 0; i < 6; i++) spawnFx('deb', c.x, c.y); c.locked = 0; c.smashed = 1; theftCrime(.6, 'Breaking into a car', 1); if (Math.random() < [.3, .5, .75, .95][carTier(c)]) carAlarm(c); startWire(c); }
function carAlarm0(c) { if (c.alarmT > 0) return; c.alarmT = 14; Snd.play('alarm', c.x, c.y); theftCrime(.5, 'Car theft (alarm)', 2); msg('🚨 The car alarm went off!', '#ff6b6b');
  if (Math.random() < .2 && !G.scene) { const a = rnd(0, TAU), o = new Ped(c.x + Math.cos(a) * 260, c.y + Math.sin(a) * 260, {}); o.state = 'fight'; o.target = G.player; o.timer = 12; G.peds.push(o); pedSay(o, pick(['HEY! That\'s my car!', 'Get away from my car!', 'Thief!!'])); } }
function startWire(c) { enterCar(c); if (pCar() !== c) return; c.owned = 0; const tier = carTier(c); G.bi = { c, stage: 'wire', hits: 0, need: [2, 3, 3, 4][tier], zone: rnd(.25, .75), w: [.28, .22, .17, .13][tier], spd: [2.2, 2.6, 3.1, 3.6][tier], ph: rnd(0, 6), fails: 0 }; toast('Hotwiring — tap FIRE (or E) when the needle is in the green'); }
function biTick(dt) {
  for (const c of G.cars) if (c.alarmT > 0) { c.alarmT -= dt; c.alarmBeep = (c.alarmBeep || 0) - dt; if (c.alarmBeep <= 0) { c.alarmBeep = .55; Snd.play('horn', c.x, c.y, .6); } }
  const B = G.bi; if (!B) return; const c = B.c, p = G.player;
  if (c.dead || p.dead) { G.bi = null; return; }
  if (B.stage === 'pick') { if (pCar() || dist2(p.x, p.y, B.x, B.y) > 30 * 30 || dist2(p.x, p.y, c.x, c.y) > 90 * 90) { G.bi = null; toast('Gave up on the lock'); return; } B.t += dt; if (Math.random() < dt * 3) Snd.play('ratchet', c.x, c.y, .15);
    if (B.t >= B.need) { c.locked = 0; if (Math.random() < [.1, .2, .35, .55][carTier(c)]) carAlarm(c); else toast('Click. Unlocked.'); startWire(c); } return; }
  if (B.stage === 'wire') { if (pCar() !== c) { G.bi = null; return; } c.throttle = 0; c.brake = 1; B.ph += dt * B.spd; }
}
const needlePos = B => (Math.sin(B.ph) + 1) / 2;
function wireTap() { const B = G.bi, c = B.c, n = needlePos(B);
  if (Math.abs(n - B.zone) < B.w / 2) { B.hits++; Snd.play('zap', c.x, c.y, .3); B.zone = rnd(.2, .8); B.spd *= 1.08; if (B.hits >= B.need) { c.wired = 1; c.owned = 1; G.bi = null; Snd.play('start', c.x, c.y); toast('Vroom — it\'s running'); } }
  else { B.fails++; Snd.play('zap', c.x, c.y, .7); hurtPlayer(4 + carTier(c) * 2, null, 'shock'); spawnFx('spark', c.x, c.y); toast('Zap! Wrong wire'); if (Math.random() < .3 + carTier(c) * .1) carAlarm(c); if (B.fails >= 4 && Math.random() < .5) { G.bi = null; c.wired = 0; c.deadIgn = 1; toast('You fried the ignition. This one isn\'t going anywhere.'); } } }
function drawBreakIn(sc) { const B = G.bi; if (!B) return; const w = 240 * sc, h = 16 * sc;
  hudPrompt(w + 16 * sc, h + 38 * sc, (px, py) => { const x = px + 8 * sc, y = py + 26 * sc, mid = px + w / 2 + 8 * sc; ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(px, py, w + 16 * sc, h + 38 * sc);
    if (B.stage === 'pick') { const k = clamp(B.t / B.need, 0, 1); ctx.fillStyle = '#37474f'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#4fc3f7'; ctx.fillRect(x, y, w * k, h); txt('PICKING THE LOCK — stay still', mid, y - 8 * sc, 12 * sc, '#fff', 'center'); return; }
    ctx.fillStyle = '#37474f'; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#43a047'; ctx.fillRect(x + w * (B.zone - B.w / 2), y, w * B.w, h); const nx = x + w * needlePos(B); ctx.fillStyle = '#ffeb3b'; ctx.fillRect(nx - 2 * sc, y - 4 * sc, 4 * sc, h + 8 * sc);
    txt('HOTWIRE ' + B.hits + '/' + B.need + ' — tap FIRE in the green', mid, y - 8 * sc, 12 * sc, '#fff', 'center'); }, 20); }
function controlPlayer(dt) { const B = G.bi, I = Input;
  if (B && B.stage === 'wire' && pCar() === B.c && !G.dlgOpen) { const tap = I.edge.act || (I.fire && !G.biFire); G.biFire = !!I.fire; if (tap) { I.edge.act = false; wireTap(); } const f = I.fire; I.fire = false; controlPlayerL(dt); I.fire = f; if (G.bi) { B.c.throttle = 0; B.c.brake = 1; } return; }
  G.biFire = !!I.fire; controlPlayerL(dt); const c = pCar(); if (c && (c.deadIgn || c.totaled)) { c.throttle = 0; c.boost = 0; } }
function drawLawHUD(sc) { drawLawHUDL(sc); drawBreakIn(sc); }
// ---------- stealing a parked car only counts if somebody actually sees (or an alarm makes them look) ----------
function theftWitness(loud) {
  const p = G.player, peds = G.scene ? G.scene.peds : G.peds, R = [200, 260, 400][loud | 0], best = [];
  for (const q of peds) { if (q.dead || q.gang || q.dealer || q.role === 'cop' || q.isPlayer || q.hostile || q.state === 'fight' || q.state === 'flee') continue; const d2 = dist2(q.x, q.y, p.x, p.y); if (d2 > R * R || !losClear(q.x, q.y, p.x, p.y)) continue;
    const da = Math.abs(((Math.atan2(p.y - q.y, p.x - q.x) - (q.a || 0)) % TAU + TAU + Math.PI) % TAU - Math.PI); // is the ped looking this way?
    if (loud || da < 1.3 || d2 < 90 * 90) best.push([q, d2]); }
  if (!G.scene) for (const c of G.cars) { const dr = c.driver; if (!dr || dr === p || c.dead || dr.gang || dr.role === 'cop' || c.remote) continue; const d2 = dist2(c.x, c.y, p.x, p.y); if (d2 < (loud ? 300 : 170) ** 2 && losClear(c.x, c.y, p.x, p.y) && (loud || (c.spd || 0) < 200)) best.push([c, d2 * 1.6]); }
  best.sort((a, b) => a[1] - b[1]); return best.length ? best[0][0] : null;
}
function theftCrime(sev, label, loud) {
  if (copSees()) return crime(sev, label);
  const w = theftWitness(loud); if (!w) return; // nobody saw a thing
  if (w instanceof Ped && Math.random() < .6) pedSay(w, pick(['Hey! That\'s not your car!', 'Is he stealing that car?!', 'Car thief!', 'I see you!']));
  G._wit = w; try { crime(sev, label); } finally { G._wit = null; }
}
{ const _pw = pickWitness; pickWitness = function (p) { if (G._wit && !G._wit.dead) return G._wit; return _pw(p); }; }
