// ================= LAW, GTA-STYLE: cops react to what they see; alarms and witnesses phone it in =================
G.reports = [];
const ALARM_PLACES = ['store', 'gunshop', 'bank', 'pawn', 'diner', 'bar', 'arcade', 'strip', 'club'];
function copSees() {
  const p = G.player, peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) if (q.role === 'cop' && !q.dead && dist2(q.x, q.y, p.x, p.y) < 420 * 420 && losClear(q.x, q.y, p.x, p.y)) return q;
  if (!G.scene) for (const c of G.cars) if ((c.type === 'cop' || c.type === 'swat') && c.driver && c.driver !== p && !c.dead && dist2(c.x, c.y, p.x, p.y) < 460 * 460 && losClear(c.x, c.y, p.x, p.y)) return c;
  return null;
}
function crimeT(sev, label) {
  const p = G.player; if (!p || p.dead) return;
  const S = G.sil, cop = S ? S.cop : copSees(), before = stars(), gun = label === 'gunfire'; if (!gun && sev >= .45 && !S) scareCars(p.x, p.y, 460, p);
  if (cop) {
    G.heat = Math.min(5.99, G.heat + sev); if (stars() > 0) markSeen();
    if (stars() > before) { if (before === 0) G.wantedSince = G.t; G.starFlash = 1.5; Snd.play('starup'); if (before === 0) msg(gun ? 'Shots fired in front of the police!' : label ? label + ' — right in front of a cop!' : 'A cop saw that!', '#ff6b6b'); if (cop instanceof Ped && Math.random() < .7) pedSay(cop, pick(['Freeze!', 'Police! Stop right there!', 'Hey! Hold it!'])); }
    return;
  }
  if (S) return silentCrime(sev, label); // silenced and no cop looking: no heat at all
  // nobody in uniform saw it: a little heat now, and maybe a phone call in a few seconds
  const add = sev * .15; G.heat = before === 0 ? Math.min(.95, G.heat + add) : Math.min(5.99, G.heat + add);
  if (gun) { G.shotsN = (G.t - (G.shotsT || -99) < 15 ? (G.shotsN || 0) : 0) + 1; G.shotsT = G.t; if (G.shotsN >= 4) { G.shotsN = 0; reportCrime(1, 'Shots fired', 'witness'); } return; }
  if (sev < .45) return;
  const alarm = G.scene && ALARM_PLACES.includes(G.scene.b.type) && ['Armed robbery', 'Safecracking', 'Theft', 'Burglary'].includes(label);
  let st = sev >= 1.5 ? 2 : 1;
  if (label === 'Armed robbery') st = G.pShotT > G.t - 20 && Math.random() < .4 ? 2 : 1;
  if (label === 'Murder') { G.kills5 = (G.kills5 || []).filter(t => G.t - t < 60); G.kills5.push(G.t); if (G.kills5.length >= 3) st = 2; }
  reportCrime(st, label || 'Crime', alarm ? 'alarm' : 'witness');
}
function reportCrime(st, label, how) {
  const p = G.player, spot = G.scene ? { x: G.outPos.x, y: G.outPos.y, b: G.scene.b } : { x: p.x, y: p.y };
  let who = null;
  if (how === 'witness') {
    who = pickWitness(p); if (!who) return; // gangsters don't snitch; drivers mostly just floor it
  }
  const ex = G.reports.find(r => dist2(r.x, r.y, spot.x, spot.y) < 900 * 900);
  if (ex) { ex.st = Math.max(ex.st, st); if (how === 'alarm') ex.how = 'alarm'; return; }
  G.reports.push({ t: G.t + (how === 'alarm' ? rnd(9, 11) : rnd(8, 14)), t0: G.t, st, label, how, who, x: spot.x, y: spot.y, b: spot.b });
  if (who instanceof Car) { reactCar(who, 'fear', p); who.caller = 1; toast('A passing driver is on the phone to the cops'); }
  else if (who) { pedSay(who, pick(['I\'m calling the cops!', 'Somebody call 911!', 'Police! Help!', 'I saw that! I\'m calling it in!'])); who.state = 'flee'; who.threat = p; who.timer = 12; who.caller = 1; }
}
function reportTick() {
  const p = G.player; if (!p) return;
  for (let i = G.reports.length - 1; i >= 0; i--) {
    const r = G.reports[i]; if (r.who && r.who.dead) { G.reports.splice(i, 1); msg('The witness won\'t be calling anyone.', '#9fc5e8'); continue; }
    if (G.t < r.t) continue; G.reports.splice(i, 1); if (p.dead) continue; if (r.anon) { anonResponse(r); continue; }
    const px = G.scene ? G.outPos.x : p.x, py = G.scene ? G.outPos.y : p.y, there = (G.scene && r.b && G.scene.b === r.b) || dist2(px, py, r.x, r.y) < 900 * 900;
    const who = r.how === 'alarm' ? 'The alarm company called the police' : 'A witness called the cops';
    if (there) { const before = stars(); G.heat = Math.max(G.heat, r.st + .05); G.lastKnown = { x: r.x, y: r.y }; G.lastSeen = G.t - 1.5; G.holdStarsT = G.t + 14; if (before === 0) G.wantedSince = G.t - 6; G.starFlash = 1.5; Snd.play('starup'); msg(`${who}! (${r.label})`, '#ff6b6b'); }
    else { if (stars() === 0) G.heat = Math.min(.95, G.heat + .35); msg(`${who} — but you were long gone.`, '#9fc5e8'); }
  }
}
// a phoned-in report keeps the stars while patrols search the scene
function wantedUpdate(dt) { if (G.t < (G.holdStarsT || 0) && stars() > 0 && G.t - G.lastSeen > 1.3) G.lastSeen = G.t - 1.4; if (G.player && G.player.dead) G.reports = []; wantedUpdate0(dt); }
function drawLawHUD0(sc) {
  const r = G.reports.filter(r => !(r.who && r.who.dead)).sort((a, b) => a.t - b.t)[0]; if (!r || !G.player || G.player.dead) return;
  const left = Math.ceil(r.t - G.t), x = VW - 18 * sc - 5 * 25 * sc - 14 * sc, y = 24 * sc, on = Math.floor(G.t * 3) % 2;
  ctx.fillStyle = on ? 'rgba(200,30,30,.85)' : 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 34 * sc, y - 12 * sc, 46 * sc, 24 * sc, 6) : ctx.rect(x - 34 * sc, y - 12 * sc, 46 * sc, 24 * sc); ctx.fill();
  txt('☎ ' + left, x - 11 * sc, y + 5 * sc, 14 * sc, '#fff', 'center');
}
