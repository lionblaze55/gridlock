// ================= THE LAW APPLIES TO EVERYONE: NPCs who assault you (or others) get chased, cuffed or shot by cops =================
const isCopP = q => q && (q.role === 'cop' || q.role === 'swat');
const npcAttacker = by => by instanceof Ped && !by.isPlayer && !by.isRemote && !isCopP(by) && !by.dead ? by : null;
function npcOffense(a, victim, n, kind) {
  if (victim === G.player && G.t - (a.provokedT || -99) < 20) return; // you started it — self-defence
  if (victim instanceof Ped && victim !== G.player && G.t - (a.provokedT || -99) < 10 && victim === a.lastProvoker) return;
  const sev = kind === 'punch' ? 1 : kind === 'stab' ? 2 : kind === 'crash' ? 1.5 : 2;
  a.npcCrime = (a.npcCrime || 0) + sev; a.npcCrimeT = G.t; if (!a.npcCrimeAt) a.npcCrimeAt = G.t; a.victimPl = a.victimPl || victim === G.player;
}
{ const hurtN = Ped.prototype.hurt; Ped.prototype.hurt = function (n, by, kind) { if (!this.dead) { const a = npcAttacker(by); if (a && a !== this) npcOffense(a, this, n, kind); if (by === G.player) { this.provokedT = G.t; } else if (by instanceof Ped) this.lastProvoker = by; } return hurtN.call(this, n, by, kind); }; }
function hurtPlayer(n, by, kind) { const a = npcAttacker(by); if (a && !G.player.dead) npcOffense(a, G.player, n, kind); return hurtPlayerD(n, by, kind); }
function copEngage(cop, a) {
  cop.npcT = a; cop.state = 'fight'; cop.target = a; cop.timer = 35; cop.still = 0; cop.ring = null; if (cop.w0 === undefined) cop.w0 = cop.weapon;
  const armed = a.weapon > 0 && WEAPONS[a.weapon] && !WEAPONS[a.weapon].melee; if (!armed) cop.weapon = 0; // unarmed suspects get tackled, not shot
  pedSay(cop, armed ? pick(['Drop the weapon!', 'Police! Gun down!']) : pick(['Police! Stop right there!', 'Hey! You\'re under arrest!', 'Freeze!']));
  if (a.gang || armed || (a.npcCrime || 0) > 4) { a.state = 'fight'; a.target = cop; a.timer = 20; } else { a.state = 'flee'; a.threat = cop; a.timer = 14; a.speed = Math.min(a.speed || 60, 72); }
  a.copOn = cop;
}
function copRelease(cop) { if (cop.w0 !== undefined) { cop.weapon = cop.w0; cop.w0 = undefined; } cop.npcT = null; cop.target = null; cop.state = cop.inside ? 'idle' : 'walk'; cop.ring = null; }
function npcLawTick(dt) {
  if ((G.nlT = (G.nlT || 0) - dt) > 0) return; G.nlT = .4; const p = G.player, peds = G.scene ? G.scene.peds : G.peds; if (!p) return;
  const crooks = peds.filter(a => !a.dead && a.npcCrime > 0 && G.t - a.npcCrimeT < 45);
  for (const cop of peds) { if (!isCopP(cop) || cop.dead) continue;
    if (cop.npcT) { const a = cop.npcT; if (a.dead || !peds.includes(a) || G.t - (a.npcCrimeT || 0) > 90) { if (a.dead && Math.random() < .5) pedSay(cop, 'Suspect down.'); copRelease(cop); continue; }
      if ((cop.state !== 'fight' && cop.state !== 'goto') || cop.target !== a) { cop.state = 'fight'; cop.target = a; cop.timer = 30; }
      const armedA = a.weapon > 0 && WEAPONS[a.weapon] && !WEAPONS[a.weapon].melee && a.state === 'fight', dd = dist2(cop.x, cop.y, a.x, a.y);
      if (armedA) { if (!cop.weapon) cop.weapon = cop.w0 || WI.pistol; cop.state = 'fight'; cop.target = a; cop.timer = 30; }
      if (!armedA && dd > 34 * 34) { cop.state = 'goto'; cop.goal = [a.x, a.y]; cop.after = 'goto'; cop.goSpd = 185; cop.target = a; } // run them down
      if (dd < 40 * 40 && !armedA) { if (a.state === 'fight' && Math.random() < .5) { a.hurt(6, cop, 'punch'); Snd.play('punch', a.x, a.y); } a.cuffT = (a.cuffT || 0) + .4; a.state = a.hp < 60 ? 'idle' : a.state; if (a.cuffT > 1.2) { pedSay(cop, pick(['You\'re under arrest.', 'Got him. Cuffs on.', 'Hands behind your back!'])); a.npcCrime = 0; a.state = 'idle'; a.still = 1; a.cuffed = 1; copRelease(cop); lawCuffed(cop, a); if (a.victimPl && dist2(a.x, a.y, p.x, p.y) < 700 * 700) msg('The cops arrested ' + a.name.split(' ')[0] + ' for attacking you.', '#7fdbff'); } }
      continue; }
    if (stars() > 0 && cop.state === 'chase') continue; // busy with you
    for (const a of crooks) { if (a.copOn && !a.copOn.dead && a.copOn.npcT === a) continue; if (dist2(cop.x, cop.y, a.x, a.y) < 460 * 460 && (dist2(cop.x, cop.y, a.x, a.y) < 200 * 200 || losClear(cop.x, cop.y, a.x, a.y))) { copEngage(cop, a); break; } } }
  // nobody in uniform saw it? a bystander calls it in
  if (!G.scene) for (const a of crooks) { if (a.reported || a.copOn || a.npcCrime < 2 || G.t - a.npcCrimeAt < 6) continue; a.reported = 1; if (Math.random() > .9) continue;
    for (let k = 0; k < 10; k++) { const ang = rnd(0, TAU), r = rnd(520, 760), x = a.x + Math.cos(ang) * r, y = a.y + Math.sin(ang) * r; if (tileAt(Math.floor(x / T), Math.floor(y / T)) !== TILE.WALK || inView(x, y, 40)) continue; const cop = new Ped(x, y, { role: 'cop' }); cop.chaseSpawn = 1; G.peds.push(cop); copEngage(cop, a); if (a.victimPl) msg('📞 Someone called the cops on ' + a.name.split(' ')[0] + '.', '#7fdbff'); break; } }
  // cuffed suspects get led away
  for (let i = peds.length - 1; i >= 0; i--) { const a = peds[i]; if (a.leaveT && G.t > a.leaveT && !inView(a.x, a.y, -60)) peds.splice(i, 1); else if (a.leaveT && G.t > a.leaveT + 6) peds.splice(i, 1); }
}
// suspects can't outrun the cops on foot; cops sprint after them
function updatePedAI(p, dt) { updatePedAI0(p, dt); const s = Math.hypot(p.mvx, p.mvy); if (!s) return;
  if (p.copOn && !p.copOn.dead && p.state === 'flee' && s > 95) { p.mvx *= 95 / s; p.mvy *= 95 / s; }
  else if (p.npcT && p.state === 'fight' && s < 175 && s > 20) { p.mvx *= 175 / s; p.mvy *= 175 / s; } }
