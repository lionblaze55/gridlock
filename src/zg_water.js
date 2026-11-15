// ================= WATER: cars that go in sink, people swim, and you can swim out to boats =================
const isSwimT = (tx, ty) => { if (tx < -2 || ty < -2 || tx >= N + OCE || ty >= N + OCS) return false; return tileAt(tx, ty) === TILE.WATER; };
const inWater = (x, y) => !G.scene && isSwimT(Math.floor(x / T), Math.floor(y / T));
const swimmerSolid = (tx, ty) => sceneSolid(tx, ty) && !isSwimT(tx, ty);
const wetCarSolid = (tx, ty) => solidT(tx, ty) && !isSwimT(tx, ty);
function nearestLand(x, y, R) { const tx0 = Math.floor(x / T), ty0 = Math.floor(y / T); for (let r = 1; r <= (R || 24); r++) { let best = null, bd = 1e9; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const tx = tx0 + dx, ty = ty0 + dy; if (!inMap(tx, ty) || isSwimT(tx, ty) || solidT(tx, ty)) continue; const d = dx * dx + dy * dy; if (d < bd) { bd = d; best = [(tx + .5) * T, (ty + .5) * T]; } } if (best) return best; } return null; }
function splashAt(x, y, big) { Snd.play('splash', x, y, big ? 1 : .6); for (let i = 0; i < (big ? 14 : 6); i++) spawnFx('water', x + rnd(-20, 20), y + rnd(-20, 20)); }
// ---------- cars ----------
function updateCar(c, dt) {
  if (c.d.boat || G.scene) return updateCarP(c, dt);
  if (c.sinkT > 1.6) { c.throttle = 0; c.brake = 0; } else if (c.sinkT > 0) c.throttle *= .45; // flooded engines don't run; a dunked one barely does
  SOLIDFN = wetCarSolid; try { updateCar0(c, dt); } finally { SOLIDFN = null; }
  const w = inWater(c.x, c.y);
  if (c.dripT > 0) { c.dripT -= dt; if (Math.random() < dt * 8) spawnFx('water', c.x + rnd(-c.L / 2, c.L / 2), c.y + rnd(-c.W / 2, c.W / 2)); }
  if (w && !c.sinkT) { c.sinkT = .001; splashAt(c.x, c.y, 1); if (c === pCar()) { G.cam.shake = 6; msg('You\'re in the water! The car is sinking — get out!', '#4fc3f7'); } }
  if (!c.sinkT) return;
  if (!w) { if (c.sinkT < 4) { const was = c.sinkT; c.sinkT = 0; c.dripT = 4; c.damage(was * 6); if (c === pCar()) msg(was > 1 ? 'Phew — you got it out. The engine\'s soaked.' : 'Splash!', '#4fc3f7'); } return; } // back on land in time: saved
  c.sinkT += dt; const fl = c.sinkT > 1.6; if (fl && !c.floodMsg) { c.floodMsg = 1; if (c === pCar()) msg('The engine flooded — it\'s going under!', '#ff8a80'); }
  c.vx *= Math.exp(-(fl ? 3.5 : 1.4) * dt); c.vy *= Math.exp(-(fl ? 3.5 : 1.4) * dt); c.av *= Math.exp(-3 * dt); c.nosT = 0; c.siren = Math.min(c.siren, 0);
  if (Math.random() < dt * 10) spawnFx('water', c.x + rnd(-c.L / 2, c.L / 2), c.y + rnd(-c.W / 2, c.W / 2));
  if (c.sinkT > 2.2) { if (c === pCar()) bailIntoWater(c); else if (c.driver && c.driver !== G.player) { const dr = c.driver; c.driver = null; const q = new Ped(c.x + rnd(-10, 10), c.y + rnd(-10, 10), dr.role === 'cop' ? { role: 'cop' } : dr.gang ? { gang: dr.gang } : {}); q.swimmer = 1; q.swim = 1; q.state = 'idle'; q.timer = 0; G.peds.push(q); swimToLand(q); if (Math.random() < .5) pedSay(q, pick(['Help!', 'My car!', 'Glub…', 'I can\'t feel my legs!'])); } }
  if (c.sinkT > 4.6 && !c.gone) { c.gone = 1; c.driver = null; if (c.isRide) { G.save.ride = null; msg('Your car is at the bottom of the water now.', '#9fc5e8'); } splashAt(c.x, c.y); }
}
function bailIntoWater(c) { const p = G.player; exitCar(true); const a = c.a + Math.PI / 2; p.x = c.x + Math.cos(a) * 8; p.y = c.y + Math.sin(a) * 8; p.swim = 1; p.swimT = 0; splashAt(p.x, p.y); msg('Swim for it! Head for the shore or a boat.', '#4fc3f7'); }
// ---------- swimmers ----------
function swimToLand(q) { const L = nearestLand(q.x, q.y); if (!L) return; q.state = 'goto'; q.goal = L; q.pathQ = null; q.after = 'walk'; q.goSpd = 45; }
function updatePedMoveW(p, dt) {
  const sw = !G.scene && (p.isPlayer || p.swimmer);
  if (sw) { SOLIDFN = swimmerSolid; try { updatePedMoveS(p, dt); } finally { SOLIDFN = null; } } else updatePedMoveS(p, dt);
  if (G.scene || p.dead || p.car) { if (p.isPlayer) p.swim = 0; return; }
  const w = inWater(p.x, p.y); if (w !== !!p.swim) { p.swim = w ? 1 : 0; if (w || p.isPlayer) splashAt(p.x, p.y); if (!w && p.swimmer) { p.swimmer = 0; p.goSpd = null; } }
  if (p.swim) { p.swimT = (p.swimT || 0) + dt; if (Math.random() < dt * (p.moving ? 4 : 1)) spawnFx('water', p.x + rnd(-8, 8), p.y + rnd(-8, 8));
    if (p.isPlayer) { if (p.swimT > 90) { if (!p.tiredMsg) { p.tiredMsg = 1; msg('You\'re exhausted — get out of the water!', '#ff8a80'); } hurtPlayer(dt * 4, null, 'fall'); } }
    else if (p.swimT > 60) p.hurt(999); else if (p.state !== 'goto' && !p.dead && Math.random() < dt) swimToLand(p); }
  else { p.swimT = 0; p.tiredMsg = 0; } }
// ---------- drawing ----------
function drawSwimmer(p) { const t = G.t + (p.uid || 0), mv = p.moving ? 1 : .3; ctx.save(); ctx.translate(p.x, p.y);
  for (let i = 0; i < 2; i++) { const r = 10 + ((t * 10 + i * 8) % 16); ctx.strokeStyle = `rgba(230,245,255,${.5 - r / 40})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, r * 1.2, r, 0, 0, TAU); ctx.stroke(); }
  ctx.rotate(p.a); ctx.scale(1.3, 1.3); const st = Math.sin(t * 7) * mv;
  ctx.strokeStyle = p.skin || '#e0ac69'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(5 + st * 4, -8 - st * 2); ctx.moveTo(0, 5); ctx.lineTo(5 - st * 4, 8 - st * 2); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.fillStyle = 'rgba(20,60,90,.35)'; ctx.beginPath(); ctx.ellipse(-3, 0, 7, 6, 0, 0, TAU); ctx.fill(); ctx.fillStyle = p.shirt || '#555'; ctx.globalAlpha = .55; ctx.beginPath(); ctx.ellipse(-2, 0, 5, 6, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = p.hair || '#2b1a10'; ctx.beginPath(); ctx.arc(1, 0, 4.2, 0, TAU); ctx.fill(); ctx.restore();
  if (p.isPlayer && p.swimT > 70) { const k = clamp((p.swimT - 70) / 20, 0, 1); ctx.fillStyle = '#263238'; ctx.fillRect(p.x - 14, p.y - 26, 28, 4); ctx.fillStyle = k > .8 ? '#ff5252' : '#4fc3f7'; ctx.fillRect(p.x - 14, p.y - 26, 28 * (1 - k), 4); } }
function drawCar(c, alpha) { if (c.gone && c.sinkT > 0) return; if (!(c.sinkT > 0)) return drawCar0(c, alpha); const k = clamp(c.sinkT / 4.6, 0, 1); drawCar0(c, (alpha === undefined ? 1 : alpha) * (1 - k * .85));
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.fillStyle = `rgba(40,110,160,${.25 + k * .5})`; ctx.fillRect(-c.L / 2 - 2, -c.W / 2 - 2, c.L + 4, c.W + 4); ctx.restore();
  for (let i = 0; i < 3; i++) { const bt = (G.t * 1.6 + i * .33) % 1; ctx.strokeStyle = `rgba(255,255,255,${.6 * (1 - bt)})`; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(c.x + Math.sin(i * 2.1 + c.uid) * c.L * .3, c.y + Math.cos(i * 1.7) * c.W * .3, 2 + bt * 6, 0, TAU); ctx.stroke(); } }
