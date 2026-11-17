// ================= registers: talk or rob · gun shops fight back · defenders don't shoot each other =================
// Walking up to a staffed register asks what you want: talk to the clerk, or rob it.
{ const _u0 = useItem0; useItem0 = function (it) { const s = G.scene;
  if (!it || it.t !== 'register' || it._go || !s) return _u0(it);
  const clerk = s.peds.find(q => q.shop && !q.dead && q.state !== 'flee'), rob = () => { it._go = 1; const was = it.used; try { _u0(it); } finally { it._go = 0; } if (it.used !== was) { s.robT = G.t; if (s.b.type === 'gunshop' && typeof gunshopAlarm === 'function') gunshopAlarm(); } };
  if (!clerk) return rob();
  const empty = it.used && G.t - it.used < 120, nm = clerk.name || 'Clerk'; G.talkPed = clerk; clerk.talking = 1;
  say(nm, '"' + pick(['What can I get you?', 'Help you with something?', 'Hey. What do you need?', 'Yeah?']) + '"', [
    { t: '💬 Talk to ' + nm.split(' ')[0], f: () => { closeDialog(); talkTo(clerk); return 1; } },
    { t: empty ? '💵 Register is empty' : '💵 Rob the register', c: 'r', d: empty, f: () => { closeDialog(); rob(); } },
    { t: 'Never mind' }]); }; }

// a fight you started: you robbed the place, shot in it, or hurt someone in it
const youStartedIt = s => !!s && (s.goHot || s.trouble || (s.robT && G.t - s.robT < 180));
const onYou = q => q && q instanceof Ped && !q.dead && q.state === 'fight' && q.target === G.player;
const defender = q => q && (q.gunOwner || q.sec || q.role === 'guard' || q.role === 'cop' || q.role === 'swat' || q.shop || q.hostile || onYou(q));
// people fighting YOU don't hit each other in the crossfire, and nobody calls security on them for it
{ const _h = Ped.prototype.hurt; Ped.prototype.hurt = function (n, by, kind) {
  if (by && by !== G.player && by !== this && onYou(by) && G.scene && youStartedIt(G.scene)) { if (defender(this)) return; const ej = by.ejOf; by.ejOf = this; try { return _h.call(this, n, by, kind); } finally { by.ejOf = ej; } }
  return _h.call(this, n, by, kind); }; }
// shooting at you after you started it is self-defence, not "trouble" — security comes for YOU, not the shop owner
{ const _hp = hurtPlayer; hurtPlayer = function (n, by, kind) { const s = G.scene; if (s && by && by !== G.player && by instanceof Ped && youStartedIt(s)) { const ej = by.ejOf; by.ejOf = G.player; try { return _hp(n, by, kind); } finally { by.ejOf = ej; } } return _hp(n, by, kind); }; }
// anyone already marked as trouble for defending the shop gets cleared, and security sides with them
{ const _u = update; update = function (dt) { _u(dt); const s = G.scene; if (!s || !s.peds || G.mode !== 'play' || !youStartedIt(s)) return;
  for (const q of s.peds) { if (q.dead) continue; if (q.ejOf && q.ejOf !== G.player && defender(q.ejOf) && onYou(q.ejOf)) { q.ejOf = G.player; } if (q.troubleT && onYou(q)) q.troubleT = 0;
    if (q.sec && !q.dead && q.weapon > 0 && q.state !== 'fight') { q.state = 'fight'; q.target = G.player; q.timer = 30; } }
  if (s.secFor && s.secFor !== G.player && onYou(s.secFor)) s.secFor = G.player; }; }
// NPC-law: an NPC shooting at you during your robbery isn't committing a crime
{ const _no = npcOffense; npcOffense = function (a, v, n, kind) { if (onYou(a) && G.scene && youStartedIt(G.scene)) return; return _no(a, v, n, kind); }; }
