// ================= STEALTH II: sneaking, light, noise, suspicion and takedowns =================
// • SNEAK (button, or Z) on foot: you move at about half speed and quietly; you can't sprint.
// • How visible you are depends on light and what you're doing: darkness away from street lamps and headlights hides
//   you, bushes/trees/dumpsters next to you hide you more, standing still helps, sprinting doesn't. The eye meter by
//   the SNEAK button shows it. Witnesses (and cops looking for you) only see you within a range scaled by that, and
//   past arm's length they have to be facing you.
// • Guards who care about trespassers — soldiers on the base and gang hideout guards — fill a suspicion meter (?)
//   while they can see you; when it fills (!) they come for you. Break line of sight and it drains.
// • Sneak up behind someone who hasn't noticed you and TAKEDOWN (button, or K) knocks them out cold for a while —
//   silently, if nobody else saw it.
const SNEAK_SPEED = .55;
const lampOff = pr => pr.hackOff && G.t < pr.hackOff;
function playerLit() { const p = G.player; if (G.scene) return 1; const dk = darkness(); if (dk < .12) return 1;
  for (const pr of propsNear(p.x, p.y, 175)) if (pr.t === 'lamp' && !pr.down && !lampOff(pr)) return 1 - dk * .15;
  for (const c of G.cars) if (c.driver && !c.dead && dist2(c.x, c.y, p.x, p.y) < 160 * 160) return 1 - dk * .25;
  return 1 - dk * .62; }
function playerVis() { const p = G.player; if (!p || p.car) return 1; let v = playerLit(); if (p.sneak) v *= .6;
  const mv = Math.hypot(Input.mx || 0, Input.my || 0); if (mv < .1) v *= .85; else if (Input.sprint && !p.sneak) v *= 1.12;
  if (!G.scene && propsNear(p.x, p.y, 42).some(pr => (pr.t === 'bush' || pr.t === 'tree' || pr.t === 'palm' || pr.t === 'dumpster') && !pr.down)) v *= .68;
  return clamp(v, .18, 1.15); }
const behindOf = (q, p) => Math.abs(angDiff(q.a, Math.atan2(p.y - q.y, p.x - q.x))) > 1.5;
// eye contact now depends on visibility; sneaking up behind someone doesn't get you "felt" until you're touching
seesPlayer = function (q, range) { const p = G.player, v = playerVis(), R = (range || 380) * v, d2 = dist2(q.x, q.y, p.x, p.y); if (d2 > R * R) return false;
  if (d2 < 56 * 56) { if (!(p.sneak && behindOf(q, p) && d2 > 20 * 20)) return true; return false; }
  if (Math.abs(angDiff(q.a, Math.atan2(p.y - q.y, p.x - q.x))) > 1.15) return false; return losClear(q.x, q.y, p.x, p.y); };
// witnesses to ordinary crimes: close ones notice anyway (noise), further ones must see you
function pickWitness(p) { const C = [], peds = G.scene ? G.scene.peds : G.peds, v = playerVis(), near = 110 * v;
  for (const q of peds) { if (q.dead || q.gang || q.dealer || q.role === 'cop' || q.isPlayer || q.hostile || q.state === 'fight' || q.ko) continue; const d2 = dist2(q.x, q.y, p.x, p.y);
    if (d2 > 380 * 380 * v * v || !losClear(q.x, q.y, p.x, p.y)) continue; if (d2 > near * near && Math.abs(angDiff(q.a, Math.atan2(p.y - q.y, p.x - q.x))) > 1.3) continue; C.push([q, d2, .6]); }
  if (!G.scene) for (const c of G.cars) { const dr = c.driver; if (!dr || dr === p || c.dead || dr.gang || dr.role === 'cop' || c.remote) continue; const d2 = dist2(c.x, c.y, p.x, p.y); if (d2 < 460 * 460 * v * v && losClear(c.x, c.y, p.x, p.y)) C.push([c, d2, .35]); }
  C.sort((a, b) => a[1] - b[1]); for (const [o, , pr] of C) if (Math.random() < pr) return o; return null; }
function sceneWitness(p) { const s = G.scene; if (!s) return null; const v = playerVis(); let best = null, bd = 1e12; for (const q of s.peds) { if (q === p || q.dead || q.isPlayer || q.cuffed || q.gang || q.ko) continue; const d = dist2(q.x, q.y, p.x, p.y); if (d < 900 * 900 * v * v && losClear(q.x, q.y, p.x, p.y) && d < bd) { bd = d; best = q; } } return best; }
// cops searching for you: in the dark, sneaking, they have to be closer to actually spot you
{ const _ms = markSeen; markSeen = function () { const p = G.player; if (p && !p.car && !p.dead && stars() > 0 && G.t - (G.crimeAt || -9) > 1) { const v = playerVis(); if (v < .9) { if (G._msF !== G.frameN) { G._msF = G.frameN; G._msOK = false; const R = 520 * v;
        for (const q of G.peds) if (q.role === 'cop' && !q.dead && dist2(q.x, q.y, p.x, p.y) < R * R && losClear(q.x, q.y, p.x, p.y)) { G._msOK = true; break; }
        if (!G._msOK) for (const c of G.cars) if ((c.type === 'cop' || c.type === 'swat') && c.driver && !c.dead && dist2(c.x, c.y, p.x, p.y) < R * R && losClear(c.x, c.y, p.x, p.y)) { G._msOK = true; break; } }
      if (!G._msOK) return; } } return _ms(); }; }
{ const _c = crime; crime = function (sev, label) { G.crimeAt = G.t; return _c(sev, label); }; }

// ---------- sneak mode ----------
function toggleSneak() { const p = G.player; if (!p || p.car || p.dead) return; p.sneak = !p.sneak; Snd.play('ui'); toast(p.sneak ? '🥷 Sneaking — slow and quiet' : 'Walking'); }
{ const _u = update; update = function (dt) { G.frameN = (G.frameN || 0) + 1; const p = G.player; if (G.mode === 'play' && p && p.sneak) { if (p.car || p.dead) p.sneak = false; else { Input.mx = (Input.mx || 0) * SNEAK_SPEED; Input.my = (Input.my || 0) * SNEAK_SPEED; Input.sprint = false; } }
  _u(dt); if (G.mode === 'play') try { susTick(dt); koTick(dt); } catch (e) { console.error(e); } }; }

// ---------- suspicion: guards who care about trespassers ----------
function watcher(q) { if (q.dead || q.ko || q.state === 'fight' || q.cuffed) return false; if (q.army) return true; if (q.hideG && (G.rep[q.hideG] | 0) < 30) { const H = typeof HIDE !== 'undefined' && HIDE[q.hideG], p = G.player; return !!(H && H.door && dist2(p.x, p.y, H.door.x, H.door.y) < 210 * 210); } return false; }
function susTick(dt) { const p = G.player; if (!p || p.dead || p.car) return; const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) { if (!watcher(q)) { if (q.sus) q.sus = Math.max(0, q.sus - dt); continue; }
    if (seesPlayer(q, 340)) { const d = dist(q.x, q.y, p.x, p.y); q.sus = (q.sus || 0) + dt * (p.weapon > 0 ? 1.4 : .8) * clamp(1.6 - d / 300, .35, 1.6); if (!q.susSaid && q.sus > .35) { q.susSaid = 1; pedSay(q, pick(['Hey… who\'s there?', 'Did you hear that?', 'Hold on…'])); q.a = Math.atan2(p.y - q.y, p.x - q.x); }
      if (q.sus >= 1) { q.sus = 0; q.susSaid = 0; if (q.army) { crime(1.2, 'Trespassing on a military base'); G.baseSpotted = 1; G.heat = Math.max(G.heat, 3.2); G.starFlash = 1.5; Snd.play('alarm'); q.state = 'fight'; q.target = p; q.timer = 25; q.hostile = 1; pedSay(q, 'Intruder! Weapons free!'); }
        else { const H = HIDE[q.hideG]; G.gangAggro[q.hideG] = Math.max(G.gangAggro[q.hideG] || 0, 12); for (const r of (H && H.guards) || [q]) if (!r.dead && dist2(r.x, r.y, p.x, p.y) < 500 * 500) { r.state = 'fight'; r.target = p; r.timer = 20; r.hostile = 1; } q.state = 'fight'; q.target = p; q.timer = 20; pedSay(q, pick(['Who sent you?!', 'Light him up!', 'You picked the wrong door!'])); } Snd.play('alert'); } }
    else if (q.sus) { q.sus = Math.max(0, q.sus - dt * .35); if (!q.sus) q.susSaid = 0; } } }
{ const _dp = drawPed; drawPed = function (q) { if (q.ko && !q.dead) return drawKO(q); _dp(q); if (q.sus > .02 && !q.dead) { const g = ctx, a = clamp(q.sus, 0, 1); g.save(); g.translate(q.x, q.y - 30); g.lineWidth = 3.5; g.strokeStyle = 'rgba(0,0,0,.55)'; g.beginPath(); g.arc(0, 0, 9, 0, TAU); g.stroke();
    g.strokeStyle = a > .7 ? '#ff4d4d' : '#ffd23f'; g.beginPath(); g.arc(0, 0, 9, -Math.PI / 2, -Math.PI / 2 + TAU * a); g.stroke(); g.fillStyle = a > .7 ? '#ff4d4d' : '#ffd23f'; g.font = '800 12px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('?', 0, 4.5); g.restore(); } }; }

// ---------- takedowns ----------
function drawKO(q) { const g = ctx; g.save(); g.translate(q.x, q.y); g.rotate(q.koA || 0); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(2, 2, 15, 8, 0, 0, TAU); g.fill();
  g.fillStyle = q.shirt || '#888'; g.beginPath(); g.ellipse(-2, 0, 11, 7, 0, 0, TAU); g.fill(); g.fillStyle = q.pants || '#333'; g.fillRect(-16, -5, 8, 10); g.fillStyle = q.skin || '#d9a07a'; g.beginPath(); g.arc(11, 0, 5, 0, TAU); g.fill(); g.restore();
  g.save(); g.fillStyle = 'rgba(200,220,255,' + (.6 + .4 * Math.sin(G.t * 3)) + ')'; g.font = '700 11px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('z z', q.x + 6, q.y - 16 - (G.t * 6 % 6)); g.restore(); }
function takedownTarget() { const p = G.player; if (!p || p.car || p.dead || !p.sneak) return null; const peds = G.scene ? G.scene.peds : G.peds; let best = null, bd = 48 * 48;
  for (const q of peds) { if (q === p || q.dead || q.ko || q.isPlayer || q.state === 'fight' || q.boss || q.lie || q.sit || q.remote) continue; const d = dist2(q.x, q.y, p.x, p.y); if (d < bd && behindOf(q, p) && (q.sus || 0) < .7) { bd = d; best = q; } } return best; }
function takedownNow() { const q = takedownTarget(); if (!q) return toast('Sneak up behind someone who hasn\'t noticed you'); const p = G.player, peds = G.scene ? G.scene.peds : G.peds;
  const seen = peds.filter(o => o !== q && !o.dead && !o.ko && !o.isPlayer && seesPlayer(o, 360));
  q.ko = G.t + rnd(50, 80); q.koA = p.a + rnd(-.4, .4); q.state = 'idle'; q.still = 1; q.sus = 0; q.target = null; q.mvx = q.mvy = 0; Snd.play('punch', q.x, q.y); G.cam.shake = Math.max(G.cam.shake || 0, 3);
  if (q.weapon > 0 && Math.random() < .5 && typeof takeGun === 'function') { /* their gun stays on them — loot it from the body later */ }
  if (seen.length) { const cop = seen.find(o => o.role === 'cop'); crime(cop ? 1 : .6, q.role === 'cop' ? 'Assaulting an officer' : 'Assault'); for (const o of seen) if (CIVR.has(o.role)) { o.state = 'flee'; o.threat = p; o.timer = 8; } }
  else if (q.role === 'cop' || q.army || q.hideG) toast('Out cold. Nobody saw a thing.'); }
function koTick() { const peds = G.scene ? G.scene.peds : G.peds; for (const q of peds) if (q.ko && !q.dead && G.t > q.ko) { q.ko = 0; q.still = 0; q.state = 'walk'; pedSay(q, pick(['Ugh… my head…', 'What hit me?', 'Where…?'])); if (q.army || q.hideG || q.role === 'cop') q.sus = .6; } }
// knocked-out people can't see, talk or call anyone
{ const _ai = updatePedAI; updatePedAI = function (q, dt) { if (q.ko && !q.dead) { q.mvx = q.mvy = 0; return; } return _ai(q, dt); }; }

// ---------- HUD: SNEAK, TAKEDOWN and the eye meter ----------
{ const _dl = drawLawHUDL; drawLawHUDL = function (sc) { _dl(sc); const p = G.player; Input.xBtns = (Input.xBtns || []).filter(b => b.k !== 'stealth'); if (G.mode !== 'play' || !p || p.dead || p.car || G.surrender) return;
  const w = 86 * sc, h = 30 * sc, x = 14 * sc, y = VH - 250 * sc, g = ctx; const btn = (bx, by, bw, label, on, col, fn) => { g.fillStyle = on ? 'rgba(20,30,40,.85)' : 'rgba(0,0,0,.55)'; g.beginPath(); g.roundRect ? g.roundRect(bx, by, bw, h, 8) : g.rect(bx, by, bw, h); g.fill(); g.strokeStyle = col; g.lineWidth = on ? 2.5 : 1.5; g.stroke(); txt(label, bx + bw / 2, by + h * .67, 12 * sc, on ? col : '#ddd', 'center'); Input.xBtns.push({ k: 'stealth', r: [bx, by, bw, h], fn }); };
  btn(x, y, w, '🥷 SNEAK', !!p.sneak, '#9b8cff', toggleSneak);
  if (p.sneak) { const v = playerVis(), lv = v < .45 ? 0 : v < .75 ? 1 : 2; g.save(); g.font = `${16 * sc}px sans-serif`; g.textAlign = 'left'; g.globalAlpha = [.45, .75, 1][lv]; g.fillText('👁', x + w + 8 * sc, y + h * .72); g.restore(); txt(['hidden', 'dim', 'exposed'][lv], x + w + 30 * sc, y + h * .68, 10.5 * sc, ['#7fff9f', '#ffd23f', '#ff6b6b'][lv], 'left'); }
  const tq = takedownTarget(); if (tq) { btn(x, y - h - 8 * sc, w + 20 * sc, '✋ TAKEDOWN', true, '#ff9f43', takedownNow); } }; }
