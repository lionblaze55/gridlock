// ================= COMBAT / FX =================
function spawnFx(t, x, y, a) {
  if (G.fx.length > 600) G.fx.shift();
  const f = { t, x, y, a: a || 0, life: 1, max: 1, vx: 0, vy: 0, s: 1 };
  switch (t) {
    case 'smoke': f.max = f.life = rnd(1, 1.8); f.vx = rnd(-15, 15); f.vy = rnd(-25, -5); f.s = rnd(6, 10); break;
    case 'fire': f.max = f.life = rnd(.35, .7); f.vx = rnd(-10, 10); f.vy = rnd(-40, -15); f.s = rnd(5, 9); break;
    case 'spark': for (let i = 0; i < 5; i++) { if (G.fx.length > 500) break; G.fx.push({ t: 'sp', x, y, vx: rnd(-160, 160), vy: rnd(-160, 160), life: .25, max: .25 }); } return;
    case 'flash': f.max = f.life = .06; break;
    case 'paper': f.max = f.life = rnd(1, 2); f.vx = rnd(-60, 60); f.vy = rnd(-60, 60); f.a = rnd(0, 6); f.s = rnd(2, 4); break;
    case 'water': f.max = f.life = rnd(.4, .8); f.vx = rnd(-30, 30); f.vy = rnd(-120, -40); f.s = rnd(2, 4); break;
    case 'blood': f.max = f.life = .4; f.vx = rnd(-70, 70); f.vy = rnd(-70, 70); f.s = rnd(2, 3); break;
    case 'boom': f.max = f.life = .7; f.s = a || 100; break;
    case 'tracer': f.max = f.life = .07; break;
    case 'dust': f.max = f.life = .5; f.vx = rnd(-30, 30); f.vy = rnd(-30, 30); f.s = rnd(3, 6); break;
    case 'note': f.max = f.life = 1.2; f.vy = -40; f.vx = rnd(-10, 10); break;
    case 'deb': f.max = f.life = rnd(.6, 1.2); const da = rnd(0, TAU), ds = rnd(150, 420); f.vx = Math.cos(da) * ds; f.vy = Math.sin(da) * ds; f.s = rnd(3, 7); f.a = rnd(0, 6); break;
    case 'shell': f.max = f.life = 1.4; f.vx = Math.cos((a || 0) + 1.6) * rnd(60, 110); f.vy = Math.sin((a || 0) + 1.6) * rnd(60, 110); f.a = rnd(0, 6); break;
    case 'bill': f.max = f.life = rnd(2, 3.5); f.a = rnd(0, 6); break;
    case 'exh': f.max = f.life = rnd(.5, .9); f.s = rnd(2, 3.5); break;
    case 'steam': f.max = f.life = rnd(1.5, 2.5); f.vx = rnd(-6, 6); f.vy = rnd(-22, -12); f.s = rnd(5, 8); break;
    case 'nos': f.max = f.life = .25; f.vx = -Math.cos(a || 0) * 120; f.vy = -Math.sin(a || 0) * 120; break;
  }
  G.fx.push(f); return f;
}
function addDecal(t, x, y, a) {
  if (G.scene) { if (t === 'skid') return; }
  const list = G.scene ? (G.scene.decals || (G.scene.decals = [])) : G.decals;
  list.push({ t, x, y, a: a || Math.random() * TAU, s: t === 'bloodpool' ? rnd(10, 15) : t === 'scorch' ? rnd(40, 60) : rnd(3, 6), life: t === 'skid' ? 25 : 90 });
  if (list.length > 450) list.splice(0, list.length - 450);
}
function rayCircle(x, y, dx, dy, cx, cy, r) {
  const fx = x - cx, fy = y - cy, b = fx * dx + fy * dy, c = fx * fx + fy * fy - r * r, h = b * b - c;
  if (h < 0) return -1; const t = -b - Math.sqrt(h); return t >= 0 ? t : (c < 0 ? 0 : -1);
}
function fireHitscan(shooter, x, y, a, w, isPlayerShot, net) {
  const dx = Math.cos(a), dy = Math.sin(a), range = w.range || 500;
  if (isPlayerShot && shooter === G.player && sceneSolid(Math.floor(x / T), Math.floor(y / T))) { const o = aimOrigin(); x = o[0]; y = o[1]; }
  const LT = isPlayerShot && G.settings.assist && G.aimLockT > G.t - .25 ? LK.t : null;
  // walls
  let tw = range;
  for (let s = 0; s < range; s += 8) { if (sceneSolid(Math.floor((x + dx * s) / T), Math.floor((y + dy * s) / T))) { tw = s; break; } }
  let best = null, bt = tw;
  const peds = G.scene ? G.scene.peds : G.peds;
  for (const p of peds) { if (p === shooter || p.dead) continue; const t = rayCircle(x, y, dx, dy, p.x, p.y, p.r + (isPlayerShot ? (p === LT ? 14 : 5) : 2)); if (t >= 0 && t < bt) { bt = t; best = p; } }
  const pl = G.player;
  if (pl && !pl.dead && !pl.car && shooter !== pl) { const t = rayCircle(x, y, dx, dy, pl.x, pl.y, pl.r + 2); if (t >= 0 && t < bt) { bt = t; best = pl; } }
  if (!G.scene) for (const c of G.cars) { if (c === (shooter && shooter.car)) continue; for (const [cx, cy] of c.circles()) { const t = rayCircle(x, y, dx, dy, cx, cy, c.W / 2 + (c === LT ? 8 : 0)); if (t >= 0 && t < bt) { bt = t; best = c; } } }
  { const ah = animalRayHit(x, y, dx, dy, bt); if (ah) { best = ah[0]; bt = ah[1]; } }
  if (isPlayerShot) for (const r of Net.remoteTargets()) { const t = rayCircle(x, y, dx, dy, r.x, r.y, r.rad); if (t >= 0 && t < bt) { bt = t; best = r; } }
  const hx = x + dx * bt, hy = y + dy * bt;
  const tr = spawnFx('tracer', x, y); tr.x2 = hx; tr.y2 = hy;
  if (!best) { if (bt < range) { spawnFx('dust', hx, hy); if (Math.random() < .3) Snd.play('ric', hx, hy, .7); } return; }
  if (best.isAnimal) { Snd.play('flesh', hx, hy, .7); for (let i = 0; i < 3; i++) spawnFx('blood', hx, hy); best.hurt(w.dmg * (w.pedMul || 1) * (w.pellets ? 1.4 : 1), shooter); return; }
  if (best instanceof Car) { carShot(best, hx, hy, shooter, isPlayerShot, w); Snd.play('clank', hx, hy, .6); best.damage(w.dmg * .45 * (w.carMul || 1) * (best.mods && best.mods.arm ? 1 - .18 * best.mods.arm : 1), shooter); spawnFx('spark', hx, hy); if (isPlayerShot && best.ai && best.ai.mode === 'traffic' && best.driver) { best.ai.cruise = 520; if (best.type === 'cop') crime(.6); } return; }
  if (best.isRemoteTarget) { spawnFx('blood', hx, hy); return; }
  if (best === pl && (net || shooter.isRemote)) { if (!G.settings.pvp || (shooter.pm)) return; }
  Snd.play('flesh', hx, hy, .7); for (let i = 0; i < 3; i++) spawnFx('blood', hx, hy);
  best.kx += dx * 90; best.ky += dy * 90;
  if (w.burn && best !== pl) { best.burn = 3; best.burnBy = shooter; }
  best.hurt(best === pl && !shooter.isRemote ? w.dmg * .38 : w.dmg * (w.pedMul || 1), shooter, 'gun');
}
function explosion(x, y, r, by, net) {
  Snd.play('boom', x, y); spawnFx('boom', x, y, r); for (let i = 0; i < 12; i++) spawnFx('deb', x, y); for (let i = 0; i < 14; i++) spawnFx(i % 2 ? 'fire' : 'smoke', x + rnd(-r / 2, r / 2), y + rnd(-r / 2, r / 2));
  addDecal('scorch', x, y);
  const d0 = dist(x, y, G.cam.x, G.cam.y); G.cam.shake = Math.max(G.cam.shake, clamp(22 - d0 / 40, 0, 22));
  const peds = G.scene ? G.scene.peds : G.peds;
  for (const p of peds) { if (p.dead) { const d = dist(x, y, p.x, p.y); if (d < r) { p.kx += (p.x - x) / (d || 1) * 300; p.ky += (p.y - y) / (d || 1) * 300; } continue; } const d = dist(x, y, p.x, p.y); if (d < r * 1.2) { const f = 1 - d / (r * 1.2); p.kx += (p.x - x) / (d || 1) * 500 * f; p.ky += (p.y - y) / (d || 1) * 500 * f; p.hurt(140 * f, by, 'boom'); } }
  for (const a of G.animals) { if (a.dead) continue; const d = dist(x, y, a.x, a.y); if (d < r * 1.2) a.hurt(220 * (1 - d / (r * 1.2)), by); }
  const pl = G.player;
  if (pl && !pl.dead) {
    const px = pl.car ? pl.car.x : pl.x, py = pl.car ? pl.car.y : pl.y, d = dist(x, y, px, py);
    const remoteSrc = by && by.isRemote; const allowed = !remoteSrc || (G.settings.pvp && !by.pm);
    if (d < r * 1.2 && allowed) { const f = 1 - d / (r * 1.2); if (pl.car) pl.car.damage(160 * f, by); else { pl.kx += (px - x) / (d || 1) * 500 * f; pl.ky += (py - y) / (d || 1) * 500 * f; hurtPlayer(130 * f, by, 'boom'); } }
  }
  if (!G.scene) {
    for (const c of G.cars) { if (c === pCar()) continue; const d = dist(x, y, c.x, c.y); if (d < r * 1.4) { const f = 1 - d / (r * 1.4); c.vx += (c.x - x) / (d || 1) * 600 * f / c.mass; c.vy += (c.y - y) / (d || 1) * 600 * f / c.mass; c.av += rnd(-4, 4) * f; c.damage(180 * f, by); } }
    for (const p of propsNear(x, y, r)) if (PROPDEF[p.t].knock && !p.down && dist(x, y, p.x, p.y) < r) { p.down = 1; p.a = Math.atan2(p.y - y, p.x - x); if (p.t === 'hydrant') p.spray = 10; }
  }
  if (by === G.player) crime(.5);
}
function explodeCar(c) {
  if (c.d.pedal) { c.dead = 1; c.hp = 0; c.fireT = 0; c.deadT = 0; c.throttle = 0; if (c === pCar()) exitCar(true); else c.driver = null; return; }
  c.dead = 1; c.fireT = 0; c.hp = 0; c.deadT = 0; c.throttle = 0;
  if (c.lastHitBy === G.player && G.mission && G.mission.onWreck) G.mission.onWreck(c);
  if (c.lastHitBy === G.player) { addCash(100, 1); crime(.3); }
  explosion(c.x, c.y, 120, c.lastHitBy || null);
  c.vx += rnd(-60, 60); c.vy += rnd(-60, 60); c.av += rnd(-3, 3);
  if (c === pCar()) { const pl = G.player; Net.emitEv('x', { x: Math.round(c.x), y: Math.round(c.y) }); exitCar(true); if (!pl.dead) hurtPlayer(200, c.lastHitBy, 'boom'); }
  else if (c.driver && c.driver !== G.player) { c.driver = null; }
}
function updateProj(dt) {
  for (let i = G.projs.length - 1; i >= 0; i--) {
    const p = G.projs[i]; p.t += dt;
    if (p.k === 'rocket') {
      p.x += Math.cos(p.a) * 720 * dt; p.y += Math.sin(p.a) * 720 * dt; if (Math.random() < .8) spawnFx('smoke', p.x - Math.cos(p.a) * 10, p.y - Math.sin(p.a) * 10);
      let hit = p.t > 1.5 || sceneSolid(Math.floor(p.x / T), Math.floor(p.y / T));
      if (!hit) { const peds = G.scene ? G.scene.peds : G.peds; for (const q of peds) if (!q.dead && q !== p.owner && dist2(q.x, q.y, p.x, p.y) < 20 * 20) { hit = true; break; } }
      if (!hit && !G.scene) for (const c of G.cars) if (c !== (p.owner && p.owner.car) && dist2(c.x, c.y, p.x, p.y) < (c.L / 2) ** 2) { hit = true; break; }
      if (!hit && G.player && p.owner !== G.player && !G.player.dead) { const px = pCar() ? pCar().x : G.player.x, py = pCar() ? pCar().y : G.player.y; if (dist2(px, py, p.x, p.y) < 26 * 26) hit = true; }
      if (!hit && p.owner === G.player) for (const r of Net.remoteTargets()) if (dist2(r.x, r.y, p.x, p.y) < (r.rad + 6) ** 2) { hit = true; break; }
      if (hit) { explosion(p.x, p.y, 110 * (p.blast || 1), p.owner); G.projs.splice(i, 1); }
    } else if (p.k === 'molotov') {
      const f = clamp(p.t / p.dur, 0, 1); const nx = lerp(p.x0, p.x1, f), ny = lerp(p.y0, p.y1, f);
      if (sceneSolid(Math.floor(nx / T), Math.floor(ny / T))) { p.x1 = p.x; p.y1 = p.y; p.t = p.dur; }
      else { p.x = nx; p.y = ny; }
      p.z = Math.sin(f * Math.PI) * 40;
      if (p.t >= p.dur) { Snd.play('glass', p.x, p.y); Snd.play('ignite', p.x, p.y); G.fires.push({ x: p.x, y: p.y, r: p.nap ? 70 : 55, life: p.nap ? 11 : 6, by: p.owner }); addDecal('scorch', p.x, p.y); if (p.owner === G.player) crime(.3); G.projs.splice(i, 1); }
    }
  }
  for (let i = G.fires.length - 1; i >= 0; i--) {
    const f = G.fires[i]; f.life -= dt; if (f.life <= 0) { G.fires.splice(i, 1); continue; }
    if (Math.random() < dt * 30) spawnFx('fire', f.x + rnd(-f.r, f.r) * .8, f.y + rnd(-f.r, f.r) * .8);
    const peds = G.scene ? G.scene.peds : G.peds;
    for (const p of peds) if (!p.dead && dist2(p.x, p.y, f.x, f.y) < f.r * f.r && !p.burn) { p.burn = 3; p.burnBy = f.by; }
    const pl = G.player; if (pl && !pl.dead && !pl.car && dist2(pl.x, pl.y, f.x, f.y) < f.r * f.r) { const ok = !(f.by && f.by.isRemote) || (G.settings.pvp && !f.by.pm); if (ok) hurtPlayer(dt * 30, f.by, 'fire'); }
    if (!G.scene) for (const c of G.cars) if (dist2(c.x, c.y, f.x, f.y) < (f.r + 20) ** 2) c.damage(dt * 25, f.by);
  }
}
function updateFx(dt) {
  for (let i = G.fx.length - 1; i >= 0; i--) { const f = G.fx[i]; f.life -= dt; if (f.life <= 0) { G.fx.splice(i, 1); continue; } f.x += f.vx * dt; f.y += f.vy * dt; if (f.t === 'sp' || f.t === 'blood' || f.t === 'paper' || f.t === 'deb' || f.t === 'shell') { f.vx *= .9; f.vy *= .9; } else if (f.t === 'bill') { f.vx *= .97; f.vy = f.vy * .95 + 12 * dt * 60 * .05; } }
  const dl = G.scene ? (G.scene.decals || []) : G.decals; for (let i = dl.length - 1; i >= 0; i--) { dl[i].life -= dt; if (dl[i].life <= 0) dl.splice(i, 1); }
}

// ================= PLAYER =================
function newPlayer0(x, y) {
  const sv = G.save;
  const p = new Ped(x, y, { role: 'player', shirt: sv.outfit || '#f2c230', skin: sv.skin || '#e0ac69', hair: '#2b1a10', pants: '#1b2631', name: Net.name || 'You' });
  p.isPlayer = true; p.hp = 100; p.r = 9; p.armor = sv.armor || 0; p.ammo = sv.ammo ? sv.ammo.slice() : emptyAmmo(); while (p.ammo.length < WEAPONS.length) p.ammo.push(0); p.ammo[0] = Infinity; p.clip = p.ammo.map((a, i) => Math.min(a, WEAPONS[i].mag || 0)); p.reloadT = 0; p.weapon = 0; p.fireCD = 0; p.state = 'player';
  for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) p.weapon = i;
  return p;
}
function hurtPlayer0(n, by, kind) {
  const p = G.player; if (!p || p.dead || G.godT > 0) return;
  if (by && by.isRemote) { if (!G.settings.pvp || by.pm) return; p.lastRemote = { by, t: G.t }; }
  if (p.armor > 0 && kind !== 'fire') { const ab = Math.min(p.armor, n * .66); p.armor -= ab; n -= ab; }
  p.hp -= n; G.hurtFlash = .35; p.flash = .12; if (kind !== 'fire' || Math.random() < .1) Snd.voice(n > 25 ? 'ow' : 'grunt', p.vp || 120, p.x, p.y);
  if (kind !== 'fire') addDecal('blood', p.x + rnd(-5, 5), p.y + rnd(-5, 5));
  if (p.hp <= 0) playerDie(by);
}
function playerDie(by) {
  const p = G.player; p.hp = 0; p.dead = 1; p.deadT = 0; G.deaths++;
  if (p.car) { const c = p.car; c.driver = null; p.car = null; p.x = c.x; p.y = c.y; }
  G.big = { text: 'WASTED', col: '#e74c3c', t: 4 }; G.deathT = G.t; Snd.play('wasted');
  let killer = null; if (p.lastRemote && G.t - p.lastRemote.t < 6) killer = p.lastRemote.by.peer;
  Net.emitEv('d', { by: killer });
  if (G.mission) failMission('You died.');
  loseDrugs('Your stash was lost.');
  closeDialog(); G.respawnAt = G.t + 3.8; G.respawnKind = 'hospital';
}
function bustedB() {
  const p = G.player; if (p.dead) return; p.dead = 1; p.busted = 1; G.big = { text: 'BUSTED', col: '#3498db', t: 4 }; G.deathT = G.t; Snd.play('whistle'); setTimeout(() => Snd.play('fail'), 500);
  if (p.car) { const c = p.car; c.driver = null; p.car = null; p.x = c.x - Math.sin(c.a) * 30; p.y = c.y + Math.cos(c.a) * 30; }
  if (G.mission) failMission('You got busted.');
  loseDrugs('The cops confiscated your product.');
  closeDialog(); G.respawnAt = G.t + 3.8; G.respawnKind = 'police'; Net.emitEv('b', {});
}
function respawnB() {
  const p = G.player, kind = G.respawnKind;
  let fine = 0;
  if (kind === 'police') { fine = Math.min(G.cash, 250 * Math.max(1, stars())); p.ammo = emptyAmmo(); p.clip = p.ammo.map(() => 0); p.reloadT = 0; p.armor = 0; }
  else { fine = Math.min(G.cash, 100 + Math.floor(G.cash * .1)); p.ammo = emptyAmmo(); p.clip = p.ammo.map(() => 0); p.reloadT = 0; p.armor = 0; }
  G.cash -= fine; G.heat = 0; G.arrest = 0; p.weapon = 0;
  const bs = W.buildings.filter(b => b.type === (kind === 'police' ? 'police' : 'hospital') && b.door);
  let b = null, bd = 1e18; for (const q of bs) { const d = dist2(q.door.x, q.door.y, p.x, p.y); if (d < bd) { bd = d; b = q; } }
  G.scene = null;
  if (b) { p.x = b.door.x + FACEV[b.door.f][0] * 20; p.y = b.door.y + FACEV[b.door.f][1] * 20; } else { const s = spawnPoint(); p.x = s.x; p.y = s.y; }
  p.dead = 0; p.busted = 0; p.hp = 100; p.burn = 0; p.kx = p.ky = 0; G.godT = 2; respawnSafety();
  if (!(kind === 'police' && G.bustInfo)) msg(kind === 'police' ? `Released from SVPD. Fine paid: ${money(fine)}` : `Patched up at the hospital. Bill: ${money(fine)}`, '#7fdbff');
  doSave(true);
}
function addCash(n, quiet) { G.cash += n; if (!quiet) { Snd.play('cash'); } G.cashFlash = .5; }
function crime(sev, label) {
  const p = G.player; if (!p || p.dead) return;
  let seen = false; const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) if (q.role === 'cop' && !q.dead && dist2(q.x, q.y, p.x, p.y) < 450 * 450) { seen = true; break; }
  if (!G.scene) for (const c of G.cars) if (c.type === 'cop' && c.driver && !c.dead && dist2(c.x, c.y, p.x, p.y) < 500 * 500) { seen = true; break; }
  const before = stars();
  G.heat = Math.min(5.99, G.heat + sev * (seen ? 1 : .45));
  if (stars() > 0) G.lastSeen = G.t;
  if (stars() > before) { G.starFlash = 1.5; Snd.play('starup'); if (before === 0) msg(label ? label + '! The cops are on to you.' : 'The cops are on to you!', '#ff6b6b'); }
}
function msg(text, col) { G.msgs.push({ text, col: col || '#fff', t: 4.5 }); if (G.msgs.length > 3) G.msgs.shift(); }
function toast(text) { G.toast = { text, t: 2.5 }; }

function spawnPoint() {
  const sb = W.buildings.find(b => b.type === 'safehouse' && G.save.spawn !== undefined && b.id === G.save.spawn) || W.buildings.find(b => b.name === 'Your Apartment') || W.buildings.find(b => b.type === 'safehouse');
  if (sb) return { x: sb.door.x + FACEV[sb.door.f][0] * 22, y: sb.door.y + FACEV[sb.door.f][1] * 22 };
  return { x: roadCX(8), y: roadCY(4) };
}
function doSave(quiet) {
  const p = G.player; if (!p) return;
  G.save = Object.assign(G.save, { cash: G.cash, bank: G.bank, ammo: p.ammo.map(a => a === Infinity ? 0 : a), armor: Math.round(p.armor), outfit: p.shirt, skin: p.skin, inv: G.inv, stash: G.stash, wmods: G.wmods, wown: G.wown, rep: G.rep });
  const rc = G.cars.find(c => c.isRide); if (rc && G.save.ride) G.save.ride.trunk = rc.trunk || {};
  G.save.t = Date.now(); store.set(slotKey(G.slot), G.save); if (!quiet) msg('Game saved.', '#2ecc71');
}

// ---------- cars: enter / exit ----------
function nearestCar(maxD) {
  const p = G.player; let best = null, bd = maxD;
  for (const c of G.cars) { if (c.dead || c.driver === p) continue; const d = dist(p.x, p.y, c.x, c.y) - c.L / 2; if (d < bd) { bd = d; best = c; } }
  return best;
}
function enterCar0(c) {
  const p = G.player, theft = !c.owned && !c.missionCar && c.driver !== p && !c.remote;
  if (c.driver && c.driver !== p) {
    // carjack
    const dr = c.driver, side = c.a - Math.PI / 2;
    const q = new Ped(c.x + Math.cos(side) * (c.W / 2 + 14), c.y + Math.sin(side) * (c.W / 2 + 14), dr.role === 'cop' ? { role: 'cop' } : dr.gang ? { gang: dr.gang } : { role: 'civ', skin: dr.skin, shirt: dr.shirt, name: dr.name });
    q.kx = Math.cos(side) * 160; q.ky = Math.sin(side) * 160;
    if (q.role === 'cop') { q.hostile = 1; crime(1, 'Jacking a cop car'); }
    else if (q.gang) { q.state = 'fight'; q.target = p; q.timer = 15; G.gangAggro[q.gang] = 40; crime(.25); }
    else { if (Math.random() < .25) { q.state = 'fight'; q.target = p; q.timer = 8; pedSay(q, 'Hey! My car!'); } else { q.state = 'flee'; q.threat = p; q.timer = 6; pedSay(q, pick(['My car!', 'Thief!', 'Not again...', 'Help! Carjacker!'])); } crime(.3, 'Carjacking'); }
    G.peds.push(q); Snd.play('punch', c.x, c.y);
  } else if (c.ai && c.ai.mode === 'parked' && c.type === 'cop') crime(.6, 'Stealing a police car');
  else if (!c.owned && Math.random() < .3) { Snd.play('glass', c.x, c.y, .6); }
  if (theft) { const tl = c.d.pedal ? 'Petty theft (' + c.d.name.toLowerCase() + ')' : c.d.boat ? 'Boat theft' : c.d.two || c.d.rider ? 'Motorcycle theft' : 'Grand theft auto', sv = c.d.pedal ? .35 : c.d.two || c.d.rider ? .8 : 1.05; (c.driver && c.driver !== p ? crime : theftCrime)(sv, tl); }
  c.driver = p; c.ai = null; c.persist = 1; c.owned = 1; p.car = c; c.throttle = c.steer = 0; c.brake = 0; c.hand = 0;
  if (c.siren >= 0) c.siren = 0;
  Snd.play('cardoor', c.x, c.y); setTimeout(() => Snd.play('start', c.x, c.y), 250); toast(c.d.name); if (G.settings.keepSt && G.settings.station !== undefined && STATIONS[G.settings.station]) c.radio = G.settings.station; G.radioName = STATIONS[c.radio].name; G.radioT = 3; Radio.set(c.radio);
  if (G.mission && G.mission.onEnter) G.mission.onEnter(c);
  G.sitting = null;
}
function exitCar(force) {
  const p = G.player, c = p.car; if (!c) return;
  const tries = [c.a - Math.PI / 2, c.a + Math.PI / 2, c.a + Math.PI, c.a];
  let ok = false;
  if (c.d.boat) { const s = boatShore(c, force ? 40 : 0); if (s) { p.x = s[0]; p.y = s[1]; ok = true; } else { const a2 = c.a + Math.PI / 2; p.x = c.x + Math.cos(a2) * (c.W / 2 + 16); p.y = c.y + Math.sin(a2) * (c.W / 2 + 16); ok = true; if (!force) { p.swim = 1; p.swimT = 0; msg('You dive into the water.', '#4fc3f7'); } } }
  for (const a of ok ? [] : tries) {
    const off = (a === c.a || a === c.a + Math.PI) ? c.L / 2 + 14 : c.W / 2 + 14; const x = c.x + Math.cos(a) * off, y = c.y + Math.sin(a) * off;
    if (!solidW(x, y)) { p.x = x; p.y = y; ok = true; break; }
  }
  if (!ok) { if (!force) { toast("Can't open the door here"); return; } p.x = c.x; p.y = c.y; }
  const sp = c.spd;
  c.driver = null; p.car = null; c.throttle = 0; c.steer = 0; c.hand = sp > 140 ? 0 : 1; c.brake = sp > 140 ? 0 : 1;
  c.ai = { mode: 'parked' }; if (sp > 140) { c.ai = null; c.coast = 1; }
  if (sp > 160 && !force) { hurtPlayer(Math.min(30, sp / 15), null, 'fall'); p.kx = c.vx * .5; p.ky = c.vy * .5; toast('Bailed out!'); }
  if (!G.settings.walkman) Radio.set(0); Snd.play('cardoor', c.x, c.y);
}

// ---------- weapons ----------
function playerFire0(aimA, charge) {
  if (G.player.swim && !G.player.car) return;
  const p = G.player, w = pw(p.weapon);
  if (p.fireCD > 0) return;
  if (w.mag) { if (p.reloadT > 0) return; if ((p.clip[p.weapon] | 0) <= 0 && p.ammo[p.weapon] > 0) { startReload(); return; } }
  p.fireCD = 1 / w.rate;
  if (!w.melee && p.ammo[p.weapon] <= 0) { Snd.play('empty'); p.weapon = bestWeapon(); toast('Out of ammo'); return; }
  const c = p.car;
  const ox = c ? c.x + Math.cos(aimA) * (c.L / 2 + 6) : p.x + Math.cos(aimA) * 12, oy = c ? c.y + Math.sin(aimA) * (c.L / 2 + 6) : p.y + Math.sin(aimA) * 12;
  if (w.melee) {
    p.swing = .2; Snd.play('whoosh', p.x, p.y, .6); let hit = false;
    const peds = G.scene ? G.scene.peds : G.peds;
    for (const q of peds) { if (q.dead) continue; const d = dist(p.x, p.y, q.x, q.y); if (d < 30 && Math.abs(angDiff(aimA, Math.atan2(q.y - p.y, q.x - p.x))) < 1) { q.kx += Math.cos(aimA) * 220; q.ky += Math.sin(aimA) * 220; q.hurt(w.dmg + rint(0, 6), p, w.id === 'knife' ? 'stab' : 'punch'); hit = true; Snd.play('punch', q.x, q.y); if (w.id === 'knife') for (let k = 0; k < 3; k++) spawnFx('blood', q.x, q.y); break; } }
    if (!hit) for (const a of G.animals) { if (a.dead || (G.scene ? a.scene !== G.scene.b.id : a.scene !== undefined)) continue; if (dist(p.x, p.y, a.x, a.y) < 30 + a.r && Math.abs(angDiff(aimA, Math.atan2(a.y - p.y, a.x - p.x))) < 1.1) { a.hurt(w.dmg + rint(0, 6), p); hit = true; Snd.play('punch', a.x, a.y); break; } }
    if (!G.scene && !hit) for (const cc of G.cars) { if (dist(p.x, p.y, cc.x, cc.y) < cc.L / 2 + 12) { cc.damage(2, p); Snd.play('thud', cc.x, cc.y, .5); break; } }
    Net.emitEv('p', { x: Math.round(p.x), y: Math.round(p.y), a: +aimA.toFixed(2) });
    for (const pr of propsNear(p.x, p.y, 34)) if (PROPDEF[pr.t].knock && !pr.down && dist(p.x, p.y, pr.x, pr.y) < 30 && pr.t !== 'lamp') { pr.down = 1; pr.a = aimA; if (pr.t === 'hydrant') pr.spray = 8; Snd.play('thud', pr.x, pr.y); }
    return;
  }
  p.ammo[p.weapon]--; if (w.mag) p.clip[p.weapon]--; p.recoil = w.id === 'shotgun' || w.id === 'rocket' ? .12 : .07;
  Snd.play(w.sound, p.x, p.y); if (!w.quiet) spawnFx('flash', ox, oy, aimA);
  if (w.proj === 'rocket') { G.projs.push({ k: 'rocket', x: ox, y: oy, a: aimA, t: 0, owner: p, blast: w.blast || 1 }); Net.emitEv('r', { x: Math.round(ox), y: Math.round(oy), a: +aimA.toFixed(3) }); G.cam.shake = 5; }
  else if (w.proj === 'molotov') { const r = charge === undefined ? 240 : throwRange(charge); let tx = ox + Math.cos(aimA) * r, ty = oy + Math.sin(aimA) * r; G.projs.push({ k: 'molotov', x: ox, y: oy, x0: ox, y0: oy, x1: tx, y1: ty, t: 0, dur: .3 + r / 800, owner: p, z: 0, nap: w.nap || 0 }); Net.emitEv('m', { x: Math.round(ox), y: Math.round(oy), tx: Math.round(tx), ty: Math.round(ty) }); }
  else {
    const n = w.pellets || 1, as = []; if (w.quiet && !c) silentFire(); else G.sil = null;
    const spr = (w.spread || 0) * (G.aimLockT === G.t ? (c ? .6 : .45) : 1); for (let i = 0; i < n; i++) { const a = aimA + rnd(-spr, spr); as.push(+a.toFixed(3)); fireHitscan(p, ox, oy, a, w, true); }
    if (!c) { spawnFx('shell', p.x, p.y, aimA); if (Math.random() < .5) setTimeout(() => Snd.play('tink', p.x, p.y, .6), 300); }
    Net.emitEv('s', { x: Math.round(ox), y: Math.round(oy), w: p.weapon, as }); G.lastShot = { x: p.x, y: p.y, t: G.t }; G.pShotT = G.t;
    G.sil = null; if (w.quiet) { if (c) alarmNear(p.x, p.y, 80, p); } else { alarmNear(p.x, p.y, 300, p); scareCars(p.x, p.y, 520, p); if (!huntingShot(aimA)) crime(.35, 'gunfire'); }
    if (n > 1) G.cam.shake = Math.max(G.cam.shake, 4);
  }
  if (p.ammo[p.weapon] <= 0) setTimeout(() => { if (p.ammo[p.weapon] <= 0) p.weapon = bestWeapon(); }, 200);
  else if (w.mag && p.clip[p.weapon] <= 0) startReload();
}
function bestWeapon() { const p = G.player; for (let i = WEAPONS.length - 1; i > 0; i--) if (p.ammo[i] > 0 && i !== WI.rocket && i !== WI.molotov) return i; return 0; }
function cycleWeapon() { const p = G.player; for (let k = 1; k <= WEAPONS.length; k++) { const i = (p.weapon + k) % WEAPONS.length; if (i === 0 || p.ammo[i] > 0) { p.weapon = i; p.reloadT = 0; toast(WEAPONS[i].name); Snd.play('cock'); return; } } }
function giveWeapon(id, ammo) { const p = G.player, i = WI[id]; const had = p.ammo[i] > 0; p.ammo[i] = (p.ammo[i] || 0) + (ammo || WEAPONS[i].ammo0); if (!had) p.clip[i] = Math.min(p.ammo[i], pw(i).mag || 0); if (!had && (p.weapon === 0 || i < WI.molotov)) p.weapon = i; }
function autoAim0(a, range) {
  const p = G.player; let best = null, bs = .5; const ox = p.car ? p.car.x : p.x, oy = p.car ? p.car.y : p.y;
  const peds = G.scene ? G.scene.peds : G.peds;
  const cand = peds.filter(q => !q.dead && !q.talking).concat(G.settings.pvp ? Net.remoteTargets().filter(r => !r.inCar) : []);
  for (const q of cand) { const d = dist(ox, oy, q.x, q.y); if (d > range) continue; const da = Math.abs(angDiff(a, Math.atan2(q.y - oy, q.x - ox))); const pri = (q.hostile || q.state === 'fight' || q.state === 'chase' || q.isRemoteTarget) ? .6 : 1; const sc = da * pri + d / range * .2; if (da < .5 && sc < bs && losClear(ox, oy, q.x, q.y)) { bs = sc; best = q; } }
  return best ? Math.atan2(best.y - oy, best.x - ox) : a;
}

// ================= SPAWNING =================
function viewRect(margin) { const z = G.cam.z, hw = VW / 2 / z + margin, hh = VH / 2 / z + margin; return [G.cam.x - hw, G.cam.y - hh, G.cam.x + hw, G.cam.y + hh]; }
function inView(x, y, m) { const r = viewRect(m || 0); return x > r[0] && x < r[2] && y > r[1] && y < r[3]; }
function spawnCity(dt) {
  G.spawnT -= dt; if (G.spawnT > 0) return; G.spawnT = .3;
  const pl = G.player, fx = pCar() ? pCar().x : pl.x, fy = pCar() ? pCar().y : pl.y;
  const hi = G.settings.quality === 'high';
  // cull
  G.cars = G.cars.filter(c => { const d = dist2(c.x, c.y, fx, fy); if (c === pCar() || c.missionCar) return true; if (c.gone) return false; if (c.owned && c.legit && !c.dead) return true; if (c.abandoned && !inView(c.x, c.y, 60) && G.t - c.abandoned > 4) return false; if (c.dead && c.deadT > 40 && !inView(c.x, c.y, 50)) return false; if (d > 1900 * 1900 && !inView(c.x, c.y, 100)) { if (c.spot) c.spot.car = null; return false; } return true; });
  G.peds = G.peds.filter(p => { if (p.persist) return true; const d = dist2(p.x, p.y, fx, fy); if (p.dead && p.deadT > 30 && !inView(p.x, p.y, 40)) return false; return d < 1700 * 1700 || inView(p.x, p.y, 60); });
  const nAI = G.cars.filter(c => c.ai && c.ai.mode === 'traffic').length;
  const popK = G.settings.pop === undefined ? 1 : .25 + G.settings.pop * 1.5, want = Math.round((hi ? 15 : 10) * popK);
  if (nAI < want) {
    for (let tries = 0; tries < 4; tries++) {
      const ang = rnd(0, TAU), r = rnd(700, 1150), x = fx + Math.cos(ang) * r, y = fy + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
      if (!inMap(tx, ty) || inView(x, y, 80) || inBase(x, y)) continue;
      const vc = isRoadCol(tx), hr = isRoadRow(ty); if (vc === hr) continue; if (tileAt(tx, ty) !== TILE.ROAD) continue;
      let dir, lane = Math.random() < .5 ? 0 : 1, cx, cy;
      if (vc) { const i = Math.round((tx - 2) / RSP); dir = Math.random() < .5 ? 1 : 3; const o = laneOff(lane); cx = roadCX(i) + (dir === 1 ? -o : o); cy = y; }
      else { const j = Math.round((ty - 2) / RSP); dir = Math.random() < .5 ? 0 : 2; const o = laneOff(lane); cy = roadCY(j) + (dir === 0 ? o : -o); cx = x; }
      if (G.cars.some(c => dist2(c.x, c.y, cx, cy) < 110 * 110)) continue;
      let type = Math.random() < .03 + stars() * .008 ? 'cop' : pick(TRAFFIC_MIX);
      const dn0 = districtAt(cx, cy), rur0 = RURALSET.has(dn0); let gdrv = null;
      if (type !== 'cop') { if (rur0) type = pick(RTRAFFIC); if ((rur0 || DISTRICTS[dn0].gang === 'reapers') && Math.random() < .13 * gangK()) { type = 'bike'; gdrv = 'reapers'; } }
      const c = new Car(type, cx, cy, dir * Math.PI / 2); c.driver = gdrv ? { gang: gdrv } : { role: type === 'cop' ? 'cop' : 'civ', name: randName(), skin: pick(SKIN), shirt: pick(SHIRT) };
      const dg = DISTRICTS[districtAt(cx, cy)].gang; if (dg && type !== 'cop' && !gdrv && Math.random() < .2 * gangK()) { c.driver = { gang: dg }; c.color = GANGS[dg].col; }
      if (!(c.driver && c.driver.gang && c.type === 'bike')) streetMods(c, dn0);
      makeTrafficAI(c, dir, lane); const f = c.ai.cruise * .7; c.vx = Math.cos(c.a) * f; c.vy = Math.sin(c.a) * f;
      G.cars.push(c); break;
    }
  }
  // parked cars in lots
  for (const s of W.parkSpots) {
    if (s.car || dist2(s.x, s.y, fx, fy) > 1000 * 1000 || inView(s.x, s.y, 60) || Math.random() > .3) continue;
    if (G.cars.some(c => dist2(c.x, c.y, s.x, s.y) < 60 * 60)) continue;
    const c = new Car(s.type || pick(PARK_MIX), s.x, s.y, s.a); c.ai = { mode: 'parked' }; c.spot = s; s.car = c; if (!s.type) streetMods(c, districtAt(s.x, s.y)); G.cars.push(c);
  }
  // pedestrians
  const nP = G.peds.filter(p => !p.dead && !p.persist).length, wantP = Math.round((hi ? 26 : 16) * popK);
  if (nP < wantP) {
    for (let tries = 0; tries < 5; tries++) {
      const ang = rnd(0, TAU), r = rnd(520, 950), x = fx + Math.cos(ang) * r, y = fy + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
      if (tileAt(tx, ty) !== TILE.WALK || inView(x, y, 40)) continue;
      const dname = districtAt(x, y), g = DISTRICTS[dname].gang;
      const o = Math.random() < .022 ? { role: 'cop' } : g && Math.random() < (DISTRICTS[dname].gd || .4) * gangK() ? { gang: g } : {};
      const p = new Ped((tx + .5) * T + rnd(-14, 14), (ty + .5) * T + rnd(-14, 14), o); G.peds.push(p); break;
    }
  }
  policeResponse(fx, fy);
}
function updatePickups(dt) {
  const p = G.player; if (!p || p.dead) return; const px = pCar() ? pCar().x : p.x, py = pCar() ? pCar().y : p.y, r = pCar() ? 40 : 24;
  if (!G.scene) for (const s of W.pickupSpots) {
    if (!s.alive) { if (G.t > s.next) s.alive = true; continue; }
    if (dist2(px, py, s.x, s.y) < r * r) { s.alive = false; s.next = G.t + 60; collect(s.t, s.v); }
  }
  for (let i = G.drops.length - 1; i >= 0; i--) { const d = G.drops[i]; d.life -= dt; if (d.life <= 0) { G.drops.splice(i, 1); continue; } if (!G.scene && dist2(px, py, d.x, d.y) < r * r) { if (d.t === 'item') { if (!invAdd(d.id, 1, 1)) { if (G.t - (d.fullT || -9) > 3) { d.fullT = G.t; toast('Bag full'); } continue; } G.drops.splice(i, 1); Snd.play('pickup'); toast('Picked up ' + ITEMS[d.id].n); } else { G.drops.splice(i, 1); collect(d.t, d.v); } } }
}
function collect(t, v) {
  const p = G.player; Snd.play(t === 'health' ? 'heal' : t === 'armor' ? 'armor' : t === 'cash' ? 'cash' : WI[t] !== undefined ? 'cock' : 'pickup'); if (WI[t] !== undefined) Snd.play('pickup');
  if (t === 'health') { p.hp = Math.min(100, p.hp + 50); toast('+ Health'); }
  else if (t === 'armor') { p.armor = 100; toast('Body Armor'); }
  else if (t === 'cash') { const n = v || rint(150, 450); addCash(n); toast('+ ' + money(n)); }
  else if (WI[t] !== undefined) { giveWeapon(t); toast(WEAPONS[WI[t]].name + ' +' + WEAPONS[WI[t]].ammo0); }
  if (G.mission && G.mission.onPickup) G.mission.onPickup(t);
}
