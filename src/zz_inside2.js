// ================= INSIDE: anyone who starts trouble gets thrown out, not just you. Hospitals, banks & clinics have security. =================
const SECURED = new Set(['hospital', 'bank', 'casino', 'mall', 'club', 'strip']);
const lawful = (a) => a && (a.role === 'cop' || a.role === 'swat' || a.role === 'guard' && !a.troubleT);
function isStaffTough(q, s) { return q.role === 'bouncer' || q.role === 'guard' || q.sec || (q.role === 'clerk' && q.shop !== 'casino') || q.role === 'worker' && (s.b.type === 'warehouse' || s.b.type === 'bar') || q.role === 'boss'; }
function npcTrouble(s, a) { if (!s || !a || a === G.player || a.dead || !(a instanceof Ped) || !s.peds || !s.peds.includes(a)) return; if (lawful(a) && G.wanted > 0) return; if (s.b.type === 'police' || s.b.type === 'mil' || canDecorate()) return;
  if (a.troubleT && G.t - a.troubleT < 20) return; a.troubleT = G.t; let n = 0;
  for (const q of s.peds) { if (q === a || q.dead || q.troubleT) continue;
    if (isStaffTough(q, s)) { q.ejOf = a; q.still = 0; q.sit = 0; q.roam = 0; n++; if (Math.random() < .7) pedSay(q, pick(['Hey! You — OUT!', 'Not in here!', 'Security! Take him out!', 'That\'s it, you\'re done here.'])); }
    else if (!q.gang && q.role !== 'prisoner' && Math.random() < .6) { q.state = 'flee'; q.threat = a; q.timer = 6; if (Math.random() < .3) Snd.voice('scream', q.vp, q.x, q.y, .6); } }
  if (!n) { const c = s.peds.find(q => !q.dead && (q.shop || q.role === 'clerk' || q.role === 'nurse')); if (c) pedSay(c, pick(['Security! Somebody call security!', 'I\'m calling the police!'])); s.secCall = G.t + rnd(3, 6); s.secFor = a; } }
function secGuard(s, at) { const q = new Ped(s.door.x + rnd(-12, 12), s.door.y - 20, { role: 'guard' }); q.name = 'Security'; q.shirt = '#2c3e50'; q.hat = 1; q.weapon = WI.pistol; q.hp = 100; q.sec = 1; q.inside = s; q.ejOf = at; s.peds.push(q); pedSay(q, pick(['Security! Nobody move!', 'Where is he?!'])); return q; }
function ejectTick(s, dt) { if (!s || !s.peds) return; const door = s.door;
  if (s.secCall && G.t > s.secCall) { s.secCall = 0; const a = s.secFor; if (a && !a.dead && s.peds.includes(a)) { secGuard(s, a); if (Math.random() < .5) secGuard(s, a); } }
  for (let i = s.peds.length - 1; i >= 0; i--) { const q = s.peds[i], a = q.ejOf; if (!a || q.dead) continue;
    if (a.dead || !s.peds.includes(a)) { q.ejOf = null; q.state = 'idle'; if (q.sec && Math.random() < .5) pedSay(q, 'All clear.'); continue; }
    const armed = a.weapon > 0 && a.state === 'fight';
    if (armed && q.weapon > 0) { q.state = 'fight'; q.target = a; q.timer = 8; continue; } // shooters get shot back by armed security
    const d = dist(q.x, q.y, a.x, a.y); q.state = 'goto'; q.goal = [a.x, a.y]; q.after = 'goto'; q.goSpd = 175; q.a = Math.atan2(a.y - q.y, a.x - q.x);
    if (d < 32 && G.t > (q.shoveT || 0)) { q.shoveT = G.t + .6; a.state = 'goto'; a.goal = [door.x, door.y - 6]; a.goSpd = 140; a.target = null; a.timer = 3; a.hurt(4, q, 'punch'); Snd.play('punch', a.x, a.y); a.ejected = 1; if (Math.random() < .4) pedSay(q, pick(['Out!', 'Keep walking!', 'Move it!'])); } }
  for (let i = s.peds.length - 1; i >= 0; i--) { const a = s.peds[i]; if (!a.ejected || a.dead) continue; if (a.state !== 'goto') { a.state = 'goto'; a.goal = [door.x, door.y - 6]; a.goSpd = 140; }
    if (dist(a.x, a.y, door.x, door.y) < 40) { s.peds.splice(i, 1); for (const q of s.peds) if (q.ejOf === a) { q.ejOf = null; q.state = 'idle'; } if (Math.random() < .6) toast((a.name || 'Someone') + ' got thrown out'); } } }
// someone other than you hurts anyone inside → they're the troublemaker
{ const h0 = Ped.prototype.hurt; Ped.prototype.hurt = function (n, by, kind) { const self = this; if (G.scene && by && by !== G.player && by instanceof Ped && by !== self && !self.ejOf && !(self.ejected)) { if (!(by.ejOf === self || by.sec && by.target === self)) npcTrouble(G.scene, by); }
    if (G.scene && by === G.player && (self.troubleT || self.ejected || self.target === G.player && self.state === 'fight')) { self.selfDef = 1; const s = G.scene, tr = s.trouble; h0.call(this, n, by, kind); if (!tr && s.trouble && Date.now()) { s.trouble = null; for (const q of s.peds || []) { q.ejector = 0; if (q.leaving) q.leaving = 0; } npcTrouble(s, self); } return; }
    return h0.call(this, n, by, kind); }; }
{ const _hp = hurtPlayer; hurtPlayer = function (n, by, kind) { if (G.scene && by && by !== G.player && by instanceof Ped && !(by.ejOf === G.player)) npcTrouble(G.scene, by); return _hp(n, by, kind); }; }
// shooting back at someone already shooting at you inside doesn't get YOU thrown out
{ const _pf = playerFire; playerFire = function (aimA, charge) { const s = G.scene; if (s && s.peds && s.peds.some(q => !q.dead && q.troubleT && G.t - q.troubleT < 20)) { const t0 = s.trouble; const r = playerFire0(aimA, charge); if (!t0 && s.trouble) s.trouble = null; return r; } return _pf(aimA, charge); }; }
// hospitals, banks, malls & clubs always have someone on the door
{ const _eb = enterBuilding; enterBuilding = function (b) { const r = _eb.apply(this, arguments); const s = G.scene; if (s && s.b === b && SECURED.has(b.type) && s.peds && !s.peds.some(q => q.sec || q.role === 'guard' || q.role === 'bouncer')) { const q = secGuard(s, null); q.ejOf = null; q.x = s.door.x + T * 1.2; q.y = s.door.y - T * .9; q.still = 1; q.state = 'idle'; q.a = -Math.PI / 2; q.say = null; } return r; }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play' && G.scene && G.scene.peds) ejectTick(G.scene, dt); }; }
// no shooting while you're picking a lock or hotwiring
{ const _pf = playerFire; playerFire = function (aimA, charge) { if (G.bi) return; return _pf(aimA, charge); }; }
// ---------- you can't steal from your own place ----------
const ownPlace = () => { const s = G.scene; if (!s || !s.b) return false; if (s.garage || canDecorate()) return true; const L = typeof LIFE === 'function' ? LIFE() : null; return !!(L && L.own && L.own[s.b.id]) || (s.b.type === 'safehouse' && (s.b.name !== 'Your Apartment' || aptMine())); };
{ const _cr = crime; crime = function (sev, label) { if (ownPlace() && /theft|steal|shoplift|burglar/i.test(label || '')) return; return _cr(sev, label); }; }
