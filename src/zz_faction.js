// ================= LIVING FACTIONS: supply, convoys, turf, extortion, wars, payback =================
// Every gang with turf runs a small economy that ticks whether you're watching or not:
//  • Supply (0–100) drains as they arm their people and refills when a contraband convoy reaches their hideout.
//  • Convoys are real trucks (with an escort) when they run near you — hit one and their supply crashes, their
//    soldiers turn up with knives and old pistols, their gun dealer runs dry, and they send a crew after you.
//    Far away they're simulated: they arrive, or a rival at war with them jacks the load.
//  • Soldiers hang around each gang's hideout; patrols, shakedowns of local shops and street fights with rivals at
//    war happen around you on their turf. Kill an extortionist before he's done and the owner pays you for it.
//  • "Hunt" is how badly a gang wants you: it rises when you hit them, decays over time, and spawns hit squads.
const FAC_SHOPS = new Set(['store', 'liquor', 'diner', 'bar', 'pawn', 'barber', 'clothes', 'pharmacy', 'gunshop', 'arcade', 'club', 'strip', 'tattoo', 'cafe', 'pizza', 'burger', 'laundry', 'florist', 'hardware']);
const facTurfGangs = () => [...new Set(W.blocks.map(b => DISTRICTS[b.d] && DISTRICTS[b.d].gang).filter(g => g && GANGS[g]))];
const facGangAt = (x, y) => { const d = DISTRICTS[districtAt(x, y)]; return d && d.gang && GANGS[d.gang] ? d.gang : null; };
function FAC() { const S = G.save; if (!S.fac) S.fac = {}; const L = facTurfGangs();
  for (const g of L) if (!S.fac[g]) S.fac[g] = { sup: rnd(45, 80), cash: 0, hunt: 0, convCD: rnd(25, 120), hitCD: 0, war: {} };
  if (!S.facWars) { const pairs = [['kings', 'syndicate'], ['vipers', 'saints'], ['reapers', 'hounds'], ['reapers', 'vultures'], ['kings', 'vipers']]; S.facWars = pairs.filter(([a, b]) => L.includes(a) && L.includes(b)).slice(0, 3); if (!S.facWars.length && L.length > 1) S.facWars = [[L[0], L[1]]]; }
  return S.fac; }
const facSup = g => { const F = FAC()[g]; return F ? F.sup : 60; };
const facRivals = g => (G.save.facWars || []).filter(p => p.includes(g)).map(p => p[0] === g ? p[1] : p[0]);
const facPriceMul = g => { const s = facSup(g); return s < 25 ? 1.8 : s < 45 ? 1.25 : s > 80 ? .9 : 1; };
const facOut = g => facSup(g) < 12;
const facSupWord = s => s < 12 ? 'dry' : s < 30 ? 'short' : s < 60 ? 'steady' : s < 85 ? 'well stocked' : 'flush';

// ---------- hideouts ----------
const HIDE = {};
function facHideouts() { if (HIDE._done) return; HIDE._done = 1; for (const g of facTurfGangs()) { const C = W.blocks.filter(b => DISTRICTS[b.d] && DISTRICTS[b.d].gang === g); if (!C.length) continue;
    const cx = C.reduce((s, b) => s + b.bx, 0) / C.length * T + 6 * T, cy = C.reduce((s, b) => s + b.by, 0) / C.length * T + 6 * T;
    const cand = W.buildings.filter(b => b.door && !b.realty && !b.hideout && !FAC_SHOPS.has(b.type) && !['police', 'hospital', 'bank', 'casino', 'safehouse', 'mil', 'factory'].includes(b.type) && facGangAt(b.door.x, b.door.y) === g).sort((a, b) => dist2(a.door.x, a.door.y, cx, cy) - dist2(b.door.x, b.door.y, cx, cy));
    const b = cand[0]; if (b) { b.hideout = g; HIDE[g] = b; } } }
const facSeen = () => G.save.facSeen || (G.save.facSeen = {});

// ---------- arming people by supply ----------
function facArm(q) { if (!q.gang || q.facArmed || !FAC()[q.gang]) return; q.facArmed = 1; const s = facSup(q.gang);
  if (s < 25) { if (q.weapon > 0 && Math.random() < .6) { q.weapon = Math.random() < .5 ? 0 : (WI.knife ?? 0); q.gunI = null; } }
  else if (s > 75 && Math.random() < .35) { const id = pick(['uzi', 'rifle', 'shotgun']); if (WI[id] !== undefined) { q.weapon = WI[id]; q.gunI = null; } } }
function facPed(g, x, y, armed) { const q = new Ped(x, y, { gang: g }); q.persist = 1; if (armed && !(q.weapon > 0)) { const s = facSup(g), id = s < 25 ? pick(['pistol', 'knife', 'knife']) : s > 75 ? pick(['uzi', 'rifle', 'shotgun', 'pistol']) : pick(['pistol', 'pistol', 'uzi', 'shotgun']); if (WI[id] !== undefined) q.weapon = WI[id]; } q.facArmed = 1; G.peds.push(q); return q; }
const facFree = (x, y) => !sceneSolid(Math.floor(x / T), Math.floor(y / T));
function facSpotNear(x, y, r0, r1, off) { for (let k = 0; k < 30; k++) { const a = rnd(0, TAU), r = rnd(r0, r1), px = x + Math.cos(a) * r, py = y + Math.sin(a) * r; if (facFree(px, py) && !(off && inView(px, py, 40))) return { x: px, y: py }; } return null; }

// ---------- cars on faction business drive with the same routing the police jobs use ----------
{ const _u = updateCarAI; updateCarAI = function (c, dt) { if (!c.ai || c.ai.mode !== 'fac') return _u(c, dt); if (c.dead) return; const g = c.facGoal ? c.facGoal(c) : null;
  if (!g) { c.throttle = 0; c.brake = 1; return; } const [gx, gy, stopR] = g, d = dist(c.x, c.y, gx, gy); if (d < stopR) { c.throttle = 0; c.brake = 1; c.steer = 0; return; }
  const [nx, ny] = lawNav(c, gx, gy), ob = obstacleAhead(c, 70); driveToward(c, nx, ny, ob ? 120 : Math.min(c.facMax || 460, Math.max(90, (d - stopR) * 1.5)), dt); }; }
function facCar(type, pt, g) { const c = new Car(type, pt.x, pt.y, pt.a); c.color = GANGS[g].col; c.driver = { gang: g, name: randName() }; c.ai = { mode: 'fac', stuck: 0, rev: 0, blockT: 0, wps: [], lane: 0, dir: 0 }; c.persist = 1; c.facG = g; G.cars.push(c); return c; }
function facUnloadCar(c, n, armed, target) { const out = []; if (target === G.player) G.gangAggro[c.facG] = Math.max(G.gangAggro[c.facG] || 0, 75); for (let i = 0; i < n; i++) { const s = facSpotNear(c.x, c.y, 26, 60) || c; const q = facPed(c.facG, s.x, s.y, armed); if (target) { q.state = 'fight'; q.target = target; q.timer = 40; if (target === G.player) q.hostile = 1; } out.push(q); } c.driver = null; c.ai = { mode: 'parked' }; c.abandoned = G.t; c.persist = 0; return out; }

// ---------- convoys ----------
const FACX = { conv: [], ext: [], fights: [], squads: [] };
function convoyDue(g) { const F = FAC()[g], H = HIDE[g], p = G.player, px = G.scene ? G.outPos.x : p.x, py = G.scene ? G.outPos.y : p.y;
  F.convCD = rnd(120, 240);
  const near = H && !G.scene && (dist2(px, py, H.door.x, H.door.y) < 2400 * 2400 || facGangAt(px, py) === g);
  if (near && FACX.conv.length < 2) { const to = roadNear(H.door.x, H.door.y, 40, 260, false), from = roadNear(H.door.x, H.door.y, 1100, 1700, true);
    if (to && from) { const tr = facCar(pick(['boxtruck', 'van', 'panelvan']), from, g); tr.convoy = 1; tr.facMax = 360; tr.facGoal = () => [to.x, to.y, 120];
      const eb = { x: from.x - Math.cos(from.a) * 90, y: from.y - Math.sin(from.a) * 90, a: from.a }, es = facCar(pick(['suv', 'bruiser', 'sedan']), eb, g); es.escort = 1; es.facMax = 420; es.facGoal = () => tr.dead ? null : [tr.x - Math.cos(tr.a) * 80, tr.y - Math.sin(tr.a) * 80, 50];
      FACX.conv.push({ g, tr, es, to, t0: G.t, cargo: pick(['guns', 'guns', 'drugs']) });
      if (facGangAt(px, py) === g || dist2(px, py, from.x, from.y) < 1800 * 1800) msg('🚚 A ' + GANGS[g].name + ' supply truck is on its way to their hideout. Hit it and they\'ll feel it.', GANGS[g].col); return; } }
  // simulated far away
  const R = facRivals(g).filter(r => FAC()[r]), jack = R.length && Math.random() < .2 ? pick(R) : null;
  if (jack) { FAC()[jack].sup = Math.min(100, FAC()[jack].sup + 15); const w = F.war; w[jack] = (w[jack] || 0) + 1; if (facGangAt(px, py) === g || facGangAt(px, py) === jack) msg('📰 Word on the street: the ' + GANGS[jack].name + ' jacked a ' + GANGS[g].name + ' shipment.', '#9fc5e8'); }
  else F.sup = Math.min(100, F.sup + rnd(25, 35)); }
function convoyHit(C, how) { if (C.hit) return; C.hit = 1; const g = C.g, F = FAC()[g], p = G.player; F.sup = Math.max(0, F.sup - 25); F.hunt = Math.min(6, F.hunt + 2.2); repAdd(g, -20); G.gangAggro[g] = Math.max(G.gangAggro[g] || 0, 90);
  const tr = C.tr; if (C.es && !C.es.dead && C.es.driver) facUnloadCar(C.es, 3, 1, p);
  if (p.car === tr) { const cash = rint(400, 900); addCash(cash); if (C.cargo === 'guns') { const id = pick(['uzi', 'shotgun', 'rifle', 'pistol']); giveWeapon(id, 40); msg('📦 The back is full of ' + GANGS[g].name + ' hardware — you grab a ' + WEAPONS[WI[id]].name + ', ammo and ' + money(cash) + '.', '#2ecc71'); } else { invAdd('leaf', 6); invAdd('glint', 3); msg('📦 The back is packed with product — and ' + money(cash) + ' in a gym bag.', '#2ecc71'); } }
  else { for (let i = 0; i < 4; i++) G.drops.push({ x: tr.x + rnd(-30, 30), y: tr.y + rnd(-30, 30), t: i === 0 ? 'cash' : C.cargo === 'guns' ? pick(['uzi', 'shotgun', 'pistol', 'rifle']) : 'item', v: rint(150, 400), id: C.cargo === 'drugs' ? pick(['leaf', 'glint', 'haze']) : undefined, life: 120 }); }
  msg('💥 You hit the ' + GANGS[g].name + ' supply run — their soldiers will be short on guns. Expect payback.', '#ff9f43'); }
function convoyTick() { for (const C of FACX.conv.slice()) { const tr = C.tr, p = G.player;
    if (!C.hit && (tr.dead || tr.hp <= 0 || p.car === tr || !tr.driver)) convoyHit(C, 'hit');
    if (!C.hit && dist(tr.x, tr.y, C.to.x, C.to.y) < 170) { FAC()[C.g].sup = Math.min(100, FAC()[C.g].sup + 30); C.done = 1; tr.ai = { mode: 'parked' }; tr.persist = 0; if (C.es && !C.es.dead) { C.es.ai = { mode: 'parked' }; C.es.persist = 0; } }
    if (!C.hit && !C.done && G.t - C.t0 > 200) { C.done = 1; FAC()[C.g].sup = Math.min(100, FAC()[C.g].sup + 30); tr.persist = 0; if (C.es) C.es.persist = 0; }
    if (C.hit || C.done) FACX.conv.splice(FACX.conv.indexOf(C), 1); } }

// ---------- hideout guards ----------
function hideTick() { const p = G.player; if (G.scene) return; for (const g in HIDE) { if (g === '_done') continue; const H = HIDE[g], d2 = dist2(p.x, p.y, H.door.x, H.door.y);
    if (d2 < 500 * 500 && !facSeen()[g]) { facSeen()[g] = 1; msg('📍 You found the ' + GANGS[g].name + ' hideout — ' + H.name + '. Their soldiers hang around here.', GANGS[g].col); }
    H.guards = (H.guards || []).filter(q => !q.dead && G.peds.includes(q));
    if (d2 < 900 * 900) { const want = 2 + (facSup(g) > 60 ? 2 : facSup(g) > 30 ? 1 : 0); while (H.guards.length < want) { const s = facSpotNear(H.door.x, H.door.y + 30, 30, 150, true); if (!s) break; const q = facPed(g, s.x, s.y, Math.random() < .8); q.state = 'idle'; q.hideG = g; H.guards.push(q); } }
    else if (d2 > 1500 * 1500 && H.guards.length) { for (const q of H.guards) { q.persist = 0; if (!inView(q.x, q.y, 40)) removePed(q); } H.guards = []; } } }

// ---------- shakedowns ----------
function extortTick() { const p = G.player; for (const E of FACX.ext.slice()) { const q = E.q, b = E.b;
    if (q.dead) { FACX.ext.splice(FACX.ext.indexOf(E), 1); if (E.by === p || q.killedBy === p) { const cash = rint(120, 300); addCash(cash); repAdd(E.g, -6); FAC()[E.g].hunt += .6; msg('🙏 The owner of ' + b.name + ' slips you ' + money(cash) + ' for running off the ' + GANGS[E.g].name + '.', '#2ecc71'); } continue; }
    if (E.ph === 'in') { if (dist(q.x, q.y, b.door.x, b.door.y) < 34) { E.ph = 'inside'; E.t = G.t; removePed(q); } else walkTo(q, b.door.x, b.door.y + 6, 100); }
    else if (E.ph === 'inside' && G.t - E.t > 8) { E.ph = 'out'; q.x = b.door.x; q.y = b.door.y + 26; G.peds.push(q); pedSay(q, pick(['Same time next week.', 'Pleasure doing business.', 'Don\'t make me come back.'])); FAC()[E.g].cash += 150; b.extorted = { g: E.g, t: G.t }; E.away = facSpotNear(q.x, q.y, 380, 520) || { x: q.x + 400, y: q.y }; }
    else if (E.ph === 'out') { walkTo(q, E.away.x, E.away.y, 85); if (dist(q.x, q.y, E.away.x, E.away.y) < 60 || G.t - E.t > 40) { q.persist = 0; q.state = 'walk'; FACX.ext.splice(FACX.ext.indexOf(E), 1); } } } }
function extortStart(g) { const p = G.player; const shops = W.buildings.filter(b => b.door && FAC_SHOPS.has(b.type) && !owned(b) && facGangAt(b.door.x, b.door.y) === g && dist2(b.door.x, b.door.y, p.x, p.y) < 700 * 700 && dist2(b.door.x, b.door.y, p.x, p.y) > 120 * 120);
  const b = pick(shops); if (!b) return; const s = facSpotNear(b.door.x, b.door.y + 30, 220, 340, true); if (!s) return; const q = facPed(g, s.x, s.y, 1); q.extort = b; FACX.ext.push({ g, b, q, ph: 'in', t: G.t });
  setTimeout(() => { if (!q.dead && FACX.ext.some(e => e.q === q)) pedSay(q, pick(['Time to pay up.', 'Protection money. Now.', 'Nice shop. Shame if it burned.'])); }, 2500); }

// ---------- street fights between gangs at war ----------
function fightStart(a, b) { const p = G.player; let home = G.peds.filter(q => !q.dead && q.gang === a && dist2(q.x, q.y, p.x, p.y) < 650 * 650 && !q.cuffed);
  if (home.length < 2) for (let i = home.length; i < 2; i++) { const s = facSpotNear(p.x, p.y, 260, 480, true); if (s) home.push(facPed(a, s.x, s.y, 1)); }
  const s0 = facSpotNear(p.x, p.y, 560, 760, true); if (!s0 || !home.length) return; const att = []; for (let i = 0; i < 3; i++) { const s = facSpotNear(s0.x, s0.y, 0, 60) || s0; att.push(facPed(b, s.x, s.y, 1)); }
  const tgt = (q, L) => L.filter(x => !x.dead).sort((x, y) => dist2(x.x, x.y, q.x, q.y) - dist2(y.x, y.y, q.x, q.y))[0];
  for (const q of att) { q.state = 'fight'; q.target = tgt(q, home); q.timer = 45; } for (const q of home) { q.state = 'fight'; q.target = tgt(q, att); q.timer = 45; }
  FACX.fights.push({ a, b, home, att, t: G.t }); if (Math.random() < .7) pedSay(att[0], pick(['This is ' + GANGS[b].name + ' turf now!', 'Run, ' + GANGS[a].name + '!', 'Light \'em up!'])); }
function fightTick() { for (const Fi of FACX.fights.slice()) { const aL = Fi.home.filter(q => !q.dead), bL = Fi.att.filter(q => !q.dead);
    for (const q of aL) if (!q.target || q.target.dead) { const t = bL[0]; if (t) { q.state = 'fight'; q.target = t; q.timer = 30; } }
    for (const q of bL) if (!q.target || q.target.dead) { const t = aL[0]; if (t) { q.state = 'fight'; q.target = t; q.timer = 30; } }
    if (!aL.length || !bL.length || G.t - Fi.t > 70) { const win = !bL.length ? Fi.a : !aL.length ? Fi.b : null; if (win) { const lose = win === Fi.a ? Fi.b : Fi.a; FAC()[win].sup = Math.min(100, FAC()[win].sup + 5); FAC()[lose].sup = Math.max(0, FAC()[lose].sup - 5); }
      for (const q of aL.concat(bL)) { q.persist = 0; if (q.state === 'fight' && q.target !== G.player) { q.state = 'walk'; q.target = null; } } FACX.fights.splice(FACX.fights.indexOf(Fi), 1); } } }

// ---------- payback: hit squads ----------
function squadStart(g) { const p = G.player, F = FAC()[g], pt = roadNear(p.x, p.y, 700, 1050, true); if (!pt) return; const c = facCar(pick(['suv', 'bruiser', 'sedan', 'luxsuv']), pt, g); c.facMax = 560; c.facGoal = () => { const P = pCar() || p; return [P.x, P.y, 150]; };
  FACX.squads.push({ g, c, t: G.t }); F.hunt = Math.max(0, F.hunt - 1.6); F.hitCD = 100; msg('☠ The ' + GANGS[g].name + ' sent a crew after you.', '#ff6b6b'); Snd.play('alarm'); }
function squadTick() { const p = G.player; for (const S of FACX.squads.slice()) { const c = S.c; if (c.dead || !c.driver) { FACX.squads.splice(FACX.squads.indexOf(S), 1); continue; }
    const P = pCar() || p, d = dist(c.x, c.y, P.x, P.y), stuck = G.t - S.t > 35;
    if (d < 190 || stuck || (G.scene && G.t - S.t > 10)) { if (!G.scene && d < 500) { const L = facUnloadCar(c, 3, 1, p); pedSay(L[0], pick(['That\'s them! Light \'em up!', 'You hit the wrong crew!', 'Payback time!'])); } else { c.ai = { mode: 'parked' }; c.persist = 0; } FACX.squads.splice(FACX.squads.indexOf(S), 1); } } }

// ---------- the clock ----------
function facTick(dt) { const F = FAC(); facHideouts(); const p = G.player, here = G.scene ? null : facGangAt(p.x, p.y), safe = G.scene || (typeof nearSafe === 'function' && nearSafe(p.x, p.y));
  for (const g in F) { const f = F[g]; f.sup = clamp(f.sup - dt * .035, 0, 100); f.hunt = Math.max(0, f.hunt - dt * .006); f.convCD -= dt; f.hitCD = Math.max(0, (f.hitCD || 0) - dt); if (f.convCD <= 0) convoyDue(g);
    if (f.hunt >= 2 && f.hitCD <= 0 && !safe && !p.dead && stars() < 3 && !FACX.squads.some(s => s.g === g)) squadStart(g); }
  for (const q of G.peds) if (q.gang && !q.facArmed) facArm(q);
  if (here && !p.dead && !safe) { G.facExtCD = (G.facExtCD ?? rnd(30, 60)) - dt; if (G.facExtCD <= 0 && FACX.ext.length < 1) { G.facExtCD = rnd(55, 100); extortStart(here); }
    const R = facRivals(here); G.facFightCD = (G.facFightCD ?? rnd(40, 80)) - dt; if (R.length && G.facFightCD <= 0 && !FACX.fights.length && stars() < 2) { G.facFightCD = rnd(70, 130); fightStart(here, pick(R)); } } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play' || !W.blocks) return; G.facT = (G.facT || 0) - dt; if (G.facT > 0) return; G.facT = .5;
  try { facTick(.5); convoyTick(); hideTick(); extortTick(); fightTick(); squadTick(); } catch (e) { console.error(e); } }; }
// killing a gang's people makes them hunt you (more so on their own turf)
{ const _d = Ped.prototype.die; Ped.prototype.die = function (by, kind) { const was = this.dead, r = _d.apply(this, arguments); if (!was && this.dead && this.gang && by === G.player && FAC()[this.gang]) { const F = FAC()[this.gang]; F.hunt = Math.min(6, F.hunt + (facGangAt(this.x, this.y) === this.gang ? .4 : .25)); } return r; }; }

// ---------- the map shows hideouts you've found and convoys on the move ----------
{ const _mp = mapPOIs; mapPOIs = function () { const out = _mp(); try { for (const g in HIDE) if (g !== '_done' && facSeen()[g]) out.push({ x: HIDE[g].door.x, y: HIDE[g].door.y, c: GANGS[g].col, ic: '☠', r: 5.5, n: GANGS[g].name + ' hideout', pr: 7 });
    for (const C of FACX.conv) if (!C.tr.dead) out.push({ x: C.tr.x, y: C.tr.y, c: GANGS[C.g].col, ic: '🚚', r: 5, n: GANGS[C.g].name + ' supply truck', pr: 8 }); } catch (e) { } return out; }; }
