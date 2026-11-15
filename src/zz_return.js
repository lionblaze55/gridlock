// ---------- drivers want their cars back: carjacked / crash-ejected / alarm owners return to their car and drive off when hurt or once you give up ----------
function tagOwner(q, c, hurtOnly) {
  if (!q || q.dead || !c || c.dead || c.d.boat || q.role === 'cop' || q.role === 'swat' || c.missionCar) return;
  if (Math.random() > (hurtOnly ? .85 : .75)) return; // "often", not always
  q.ownCar = c; q.hp0 = Math.max(60, q.hp); q.retT = G.t + rnd(1.2, 3.5);
}
function enterCar(c) {
  const before = G.peds.length, dr = c && c.driver && c.driver !== G.player ? c.driver : null; if (c) c._wasOwned = c.owned && !!dr;
  enterCar0(c);
  if (dr && G.peds.length > before) tagOwner(G.peds[G.peds.length - 1], c);
}
function crashEject(c, v, other) {
  const before = G.peds.length; crashEject0(c, v, other);
  if (G.peds.length > before) { const q = G.peds[G.peds.length - 1]; if (!q.dead) tagOwner(q, c, 1); }
}
function carAlarm(c) {
  const before = G.peds.length; carAlarm0(c);
  if (G.peds.length > before) tagOwner(G.peds[G.peds.length - 1], c);
}
function retTick(dt) {
  if ((G.retTk = (G.retTk || 0) - dt) > 0) return; G.retTk = .25; if (G.scene) return;
  const p = G.player, pc = pCar();
  for (const q of G.peds) {
    const c = q.ownCar; if (!c) continue;
    if (q.dead || q.inside || c.dead || c.remote || G.cars.indexOf(c) < 0 || dist2(q.x, q.y, c.x, c.y) > 900 * 900) { q.ownCar = null; continue; }
    if (c.driver) { if (c.driver === p && dist2(c.x, c.y, q.x, q.y) > 500 * 500) q.ownCar = null; continue; } // you got away with it
    if (G.t < q.retT) continue;
    if (q.down || q.cuffed) continue; const hurt = q.hp < (q.hp0 || 60) * .75, pd = pc ? 9e9 : dist(p.x, p.y, c.x, c.y);
    // in a fight and still healthy → keep fighting; hurt → bail to the car instead
    if (q.state === 'fight' && !hurt && q.timer > 0) continue;
    if (pd < 70 && !hurt) continue; // you're standing at the car, they hang back
    const side = c.a - Math.PI / 2, dx = c.x + Math.cos(side) * (c.W / 2 + 10), dy = c.y + Math.sin(side) * (c.W / 2 + 10), d = dist(q.x, q.y, dx, dy);
    if (d < 26) { reclaim(q, c, hurt); continue; }
    if (q.state !== 'goto' || !q.retGo) {
      q.state = 'goto'; q.goal = [dx, dy]; q.pathQ = null; q.after = 'idle'; q.retGo = 1; q.target = null;
      q.goSpd = hurt ? 95 : 165; if (Math.random() < .5) pedSay(q, hurt ? pick(['I\'m getting out of here…', 'Ugh… my car…', 'Just let me go…']) : pick(['That\'s MY car!', 'I\'m taking my car back.', 'Mine. Back off.', 'Nope, not today.']));
    } else q.goal = [dx, dy];
  }
}
function reclaim(q, c, hurt) {
  const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1);
  if (G.bi && G.bi.c === c) G.bi = null;
  c.driver = { role: 'civ', name: q.name, skin: q.skin, shirt: q.shirt, gang: q.gang || null }; c.owned = 0; c.persist = 0; c.wired = 0; c.abandoned = 0;
  c.hand = 0; c.brake = 0; c.alarmT = 0;
  const dir = ((Math.round(c.a / (Math.PI / 2)) % 4) + 4) % 4;
  makeTrafficAI(c, dir, 1); c.ai.flee = { x: G.player.x, y: G.player.y }; c.ai.cruise = hurt ? 360 : 440; planRoute(c);
  c.horn = .6; Snd.play('cardoor', c.x, c.y);
  if (dist2(c.x, c.y, G.player.x, G.player.y) < 500 * 500) toast(hurt ? 'The driver limped back to their car and took off.' : 'The owner jumped back in their car and drove off.');
}
function update(dt) { updateZ(dt); if (G.mode === 'play') retTick(dt); }
// ---------- marketplace: accepting an offer clears the rest, block buyers/sellers ----------
function clearOthers(m) { const M = VMK(); const n0 = M.msgs.length; M.msgs = M.msgs.filter(x => x === m || !(x.side === 'sell' && x.kind === 'offer' && (x.lid === m.lid || (m.gid && x.gid === m.gid)))); return n0 - M.msgs.length; }
function sellToR(m) { sellToY(m); if (m.kind === 'sold') { const n = clearOthers(m); if (n) toast('Sold — cleared ' + n + ' other offer' + (n > 1 ? 's' : '')); } }
function blockWho(who, lid) { const M = VMK(); M.bwho = M.bwho || []; if (!M.bwho.includes(who)) M.bwho.push(who); if (M.bwho.length > 200) M.bwho.shift();
  if (lid && !M.blocked.includes(lid)) M.blocked.push(lid);
  for (const l of (M.feed || []).concat(M.pfeed || [])) if (l.seller === who && !M.blocked.includes(l.id)) M.blocked.push(l.id);
  M.msgs = M.msgs.filter(x => x.who !== who); if (Panel.sel && typeof Panel.sel === 'string' && M.blocked.includes(Panel.sel)) Panel.sel = null;
  toast('Blocked ' + who); Snd.play('pop'); }
function marketTick(dt) { marketTickY(dt); const M = VMK(); if (M.bwho && M.bwho.length) M.msgs = M.msgs.filter(x => !M.bwho.includes(x.who)); }
