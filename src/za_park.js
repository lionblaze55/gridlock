// ================= PARK LIFE: dog walkers, cyclists and skateboarders (busiest in the parks) =================
const BIKECOL = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#8e24aa', '#212121', '#ff7043', '#00acc1'], DECKCOL = ['#ff5722', '#3949ab', '#212121', '#00897b', '#f06292', '#ffb300'];
const parkBase = d => { const b = DISTRICTS[d] && (DISTRICTS[d].as || d); return b === 'park'; };
function parkBlocksNear(x, y, r) { return W.blocks.filter(b => parkBase(b.d) && dist2((b.bx + 6) * T, (b.by + 6) * T, x, y) < r * r); }
function ambSpawnSpot(px, py, blk) {
  for (let k = 0; k < 14; k++) { let tx, ty; if (blk) { tx = blk.bx - 1 + Math.floor(Math.random() * 14); ty = blk.by - 1 + Math.floor(Math.random() * 14); } else { const a = rnd(0, TAU), r = rnd(600, 1000); tx = Math.floor((px + Math.cos(a) * r) / T); ty = Math.floor((py + Math.sin(a) * r) / T); }
    if (!inMap(tx, ty) || W.solid[idx(tx, ty)]) continue; const t = W.tile[idx(tx, ty)]; if (t !== TILE.WALK && t !== TILE.PATH) continue; const x = (tx + .5) * T, y = (ty + .5) * T; if (inView(x, y, 60) || dist2(x, y, px, py) < 420 * 420) continue; if (propsNear(x, y, 22).some(p => p.solid)) continue; return [x, y]; }
  return null;
}
function parkRoam(q, blk) { // cut across the park on its footpaths, then carry on along the sidewalks
  if (!blk) return; const P = []; for (let y = blk.by; y < blk.by + 12; y++) for (let x = blk.bx; x < blk.bx + 12; x++) if (W.tile[idx(x, y)] === TILE.PATH && !W.solid[idx(x, y)]) P.push([x, y]); if (!P.length) return;
  const [gx, gy] = P[Math.floor(Math.random() * P.length)], path = tilePath(q.x, q.y, (x, y) => x === gx && y === gy, 900); if (!path || !path.length) return; q.state = 'goto'; q.pathQ = path; q.goal = q.pathQ.shift(); q.after = 'walk'; q.goSpd = q.speed;
}
function makeRider(x, y, kind) {
  const q = new Ped(x, y, {}); q.amb = kind; q.state = 'walk';
  if (kind === 'bike') { q.ride = 'bike'; q.speed = rnd(135, 170); q.rideCol = pick(BIKECOL); if (Math.random() < .6) { q.hat = 2; q.hatCol = pick(['#fafafa', '#e53935', '#212121', '#1e88e5']); } }
  else if (kind === 'skate') { q.ride = 'skate'; q.speed = rnd(105, 135); q.rideCol = pick(DECKCOL); q.shirt = pick(['#212121', '#e53935', '#5d4037', '#7cb342', '#fafafa', '#3949ab']); if (Math.random() < .5) { q.hat = 2; q.hatCol = pick(['#212121', '#d32f2f', '#455a64']); } }
  else { q.speed = rnd(48, 62); }
  G.peds.push(q); return q;
}
function parkLifeTick(dt) {
  const p = G.player; if (!p || G.scene || G.mode !== 'play') return;
  G.parkT = (G.parkT || 0) - dt;
  // riders: fall off if hurt, ring the bell at you, kick-push the board
  for (const q of G.peds) { if (!q.ride) continue;
    if (q.dead || q.hp < (q.rideHp || q.hp) || q.state === 'fight' || q.car) { if (!q.dead && !q.car) { q.speed = 60; pedSay(q, pick(['Whoa!', 'My bike!', 'Ow!', 'Hey!'])); } if (!q.car) addProp(q.ride === 'bike' ? 'downbike' : 'downboard', q.x + rnd(-10, 10), q.y + rnd(-10, 10), { col: q.rideCol, a: rnd(0, TAU) }); q.ride = null; continue; }
    q.rideHp = q.hp; if (q.ride === 'skate') { q.pushT = (q.pushT || rnd(1, 3)) - dt; if (q.pushT < 0) { if (q.pushT < -.45) q.pushT = rnd(1.2, 3); } else q.phase = 0; }
    if (q.ride === 'bike' && q.moving && dist2(q.x, q.y, p.x, p.y) < 90 * 90 && G.t > (q.bellT || 0)) { const fx = Math.cos(q.a), fy = Math.sin(q.a); if ((p.x - q.x) * fx + (p.y - q.y) * fy > 0) { q.bellT = G.t + 4; Snd.hornTone('bell', .2, q.x, q.y, .7); if (Math.random() < .5) pedSay(q, pick(['On your left!', 'Coming through!', 'Bike lane, buddy!'])); } } }
  // dog walkers whose walker is gone take their dog with them
  G.animals = G.animals.filter(a => !(a.walkDog && !a.dead && (!a.leash || a.leash.dead) && !inView(a.x, a.y, 60)));
  for (const a of G.animals) if (a.walkDog && a.leash && !G.peds.includes(a.leash)) a.leash = null;
  if (G.parkT > 0) return; G.parkT = rnd(1, 2);
  const dn = districtAt(p.x, p.y), base = DISTRICTS[dn].as || dn; if (RURALSET.has(dn) || ['woods', 'base', 'docks', 'industrial', 'junkyard', 'quarry'].includes(base)) return;
  const parks = parkBlocksNear(p.x, p.y, 1500), amb = G.peds.filter(q => q.amb && !q.dead), cap = Math.round((parks.length ? 9 : 3) * (G.settings.pop === undefined ? 1 : .25 + G.settings.pop * 1.5));
  for (const q of amb) if (dist2(q.x, q.y, p.x, p.y) > 2000 * 2000 && !inView(q.x, q.y, 80)) { const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1); }
  if (amb.length >= cap) return;
  const blk = parks.length && Math.random() < .75 ? pick(parks) : null, s = ambSpawnSpot(p.x, p.y, blk); if (!s) return;
  const r = Math.random(), kind = blk ? (r < .36 ? 'dog' : r < .7 ? 'bike' : 'skate') : (r < .3 ? 'dog' : r < .72 ? 'bike' : 'skate');
  const q = makeRider(s[0], s[1], kind);
  if (kind === 'dog') { const n = Math.random() < .25 ? 2 : 1; for (let i = 0; i < n; i++) { const dg = new Animal('dog', s[0] + 18 + i * 10, s[1] + 10, { leash: q, stray: 1, walkDog: 1, name: pick(['Max', 'Lola', 'Bear', 'Coco', 'Daisy', 'Milo', 'Rosie', 'Zeus']) }); dg.wa = null; dg.fur = pick(['#c8a165', '#3e2723', '#fafafa', '#9e9e9e', '#d7a86e']); G.animals.push(dg); } }
  if (blk && Math.random() < .8) parkRoam(q, blk);
}
// fallen bikes and boards left behind
Object.assign(PROPDEF, { downbike: { r: 10, solid: 0 }, downboard: { r: 6, solid: 0 } });
Object.assign(RPROP, {
  downbike(p) { ctx.rotate(p.a || 0); drawBike(p.col || '#e53935', 0); },
  downboard(p) { ctx.rotate(p.a || 0); drawBoard(p.col || '#ff5722'); },
});
function drawBike(col, ph) { ctx.fillStyle = '#1a1a1a'; for (const x of [-14, 14]) { ctx.beginPath(); ctx.ellipse(x, 0, 7.5, 2.8, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = col; ctx.lineWidth = 3.4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(10, 0); ctx.stroke(); ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(-4, 0); ctx.lineTo(10, -1.5); ctx.stroke();
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(11, -7); ctx.lineTo(11, 7); ctx.stroke(); ctx.fillStyle = '#111'; ctx.fillRect(10, -8.5, 3, 3); ctx.fillRect(10, 5.5, 3, 3); ctx.lineCap = 'butt';
  ctx.fillStyle = '#bdbdbd'; ctx.beginPath(); ctx.arc(-2, Math.sin(ph) * 2.5, 2, 0, TAU); ctx.arc(-2, -Math.sin(ph) * 2.5, 2, 0, TAU); ctx.fill(); }
function drawBoard(col) { ctx.fillStyle = '#eceff1'; for (const x of [-10, 10]) for (const y of [-4.6, 4.6]) { ctx.beginPath(); ctx.arc(x, y, 1.8, 0, TAU); ctx.fill(); } ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(0, 0, 17, 5.2, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(-11, -1, 22, 2); }
function drawPedP(p) {
  if (p.swim && !p.dead && !p.car && !G.scene) return drawSwimmer(p);
  if (p.ride && !p.dead && !p.car && !p.hidden) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1.3, 1.3); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(-18, -4, 38, 9); if (p.ride === 'bike') drawBike(p.rideCol, p.phase); else drawBoard(p.rideCol); ctx.restore(); }
  drawPed0(p);
}
