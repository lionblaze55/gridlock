// ================= VARRO LINKS: a 9-hole golf course you can actually play =================
const YD = .45; // yards per pixel
const CLUBS = [{ n: 'Driver', c: 560, t: 2.0, acc: .045 }, { n: '3 Wood', c: 480, t: 2.1, acc: .04 }, { n: '5 Iron', c: 410, t: 2.2, acc: .035 }, { n: '7 Iron', c: 340, t: 2.3, acc: .03 }, { n: '9 Iron', c: 270, t: 2.4, acc: .026 }, { n: 'Wedge', c: 190, t: 2.6, acc: .022 }, { n: 'Putter', c: 430, t: 0, acc: .012, putt: 1 }];
const HOLES_L = [[150, 180, 900, 150, 0], [1060, 190, 1470, 170, 0, 1], [1620, 160, 2660, 210, 90], [2660, 720, 1920, 690, 0], [1780, 740, 1330, 720, 0, 1], [1170, 700, 180, 760, -100], [150, 1260, 980, 1220, 0], [1150, 1290, 1600, 1250, 0, 1], [1760, 1240, 2660, 1300, 60]];
const GFRIC = { green: 175, fairway: 430, tee: 430, rough: 1150, sand: 6000 }, GBOUNCE = { green: .42, fairway: .5, tee: .5, rough: .26, sand: 0 };
function linksGen(M) { const B = W._bc, x0 = M.x0, y0 = M.y0, x1 = M.x1, y1 = M.y1, ox = x0 * T, oy = (y0 + 5) * T;
  const club = B.mkB(x0 + 2, y0, 10, 4, 12, 2, 'bar', 'Varro Links Clubhouse', 'links', 0); if (club) { club.links = 1; club.clubhouse = 'links'; }
  for (let y = y0; y < y0 + 4; y++) for (let x = x0 + 13; x < x0 + 22; x++) B.setT(x, y, TILE.LOT); for (let i = 0; i < 4; i++) W.parkSpots.push({ x: (x0 + 14 + i * 2) * T, y: (y0 + 2) * T, a: Math.PI / 2 });
  const holes = HOLES_L.map(([tx, ty, px, py, dog, pond], i) => { const t = { x: ox + tx, y: oy + ty }, p = { x: ox + px, y: oy + py }, dx = p.x - t.x, dy = p.y - t.y, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, m = { x: (t.x + p.x) / 2 + nx * dog, y: (t.y + p.y) / 2 + ny * dog };
    const len = Math.hypot(m.x - t.x, m.y - t.y) + Math.hypot(p.x - m.x, p.y - m.y), par = len < 560 ? 3 : len < 1000 ? 4 : 5, bunk = [{ x: p.x + nx * 100, y: p.y + ny * 100, rx: 34, ry: 20 }, { x: p.x - nx * 92 - dx / L * 20, y: p.y - ny * 92 - dy / L * 20, rx: 28, ry: 18 }];
    if (par >= 4) bunk.push({ x: m.x + nx * 60, y: m.y + ny * 60, rx: 40, ry: 22 });
    if (pond) B.pond((t.x + dx * .52) / T, (t.y + dy * .52) / T, 2.3, 1.7);
    return { n: i + 1, tee: t, pin: p, mid: m, par, len, bunk, gr: 74 }; });
  W.links = { x0: ox, y0: oy - 40, x1: x1 * T, y1: y1 * T, holes, club, tee1: holes[0].tee };
  // tree lines between the rows of holes, and along the edges
  for (let x = x0 + 1; x < x1 - 1; x += 1.5) for (const ly of [y0 + 5 + 7.1, y0 + 5 + 14.8]) if (B.rng() < .75) B.P(B.rng() < .5 ? 'pine' : 'tree', x + B.rng() * .6, ly + (B.rng() - .5) * 1.2);
  for (let y = y0 + 6; y < y1 - 1; y += 1.6) for (const lx of [x0 + .6, x1 - .6]) if (B.rng() < .7) B.P('tree', lx, y);
  W.lifeSpots.push({ x: holes[0].tee.x - 70, y: holes[0].tee.y - 30, kind: 'npc', role: 'civ', name: 'Starter — Varro Links', gstart: 1 });
  W.labels.push({ n: 'Varro Links', x: (x0 + x1) / 2, y: y1 - .8, big: 1 }); }
// ---------- what the ball is sitting on ----------
function segDist(px, py, a, b) { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy, t = clamp(((px - a.x) * dx + (py - a.y) * dy) / l2, 0, 1); return Math.hypot(px - a.x - dx * t, py - a.y - dy * t); }
function lieAt(x, y) { const L = W.links, t = tileAt(Math.floor(x / T), Math.floor(y / T)); if (t === TILE.WATER) return 'water'; if (x < L.x0 || x > L.x1 || y < L.y0 || y > L.y1) return 'ob'; if (t === TILE.SAND) return 'sand';
  for (const h of L.holes) { if (Math.hypot(x - h.pin.x, y - h.pin.y) < h.gr) return 'green'; for (const b of h.bunk) if (((x - b.x) / b.rx) ** 2 + ((y - b.y) / b.ry) ** 2 < 1) return 'sand'; }
  for (const h of L.holes) { if (Math.abs(x - h.tee.x) < 34 && Math.abs(y - h.tee.y) < 24) return 'tee'; if (segDist(x, y, h.tee, h.mid) < 52 || segDist(x, y, h.mid, h.pin) < 52) return 'fairway'; }
  return 'rough'; }
// ---------- drawing the course ----------
function drawLinks() { const L = W.links; if (!L || G.scene || !inView((L.x0 + L.x1) / 2, (L.y0 + L.y1) / 2, 3400)) return; const g = ctx; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const h of L.holes) { if (!inView((h.tee.x + h.pin.x) / 2, (h.tee.y + h.pin.y) / 2, 900)) continue; const path = () => { g.beginPath(); g.moveTo(h.tee.x, h.tee.y); g.quadraticCurveTo(h.mid.x * 2 - (h.tee.x + h.pin.x) / 2, h.mid.y * 2 - (h.tee.y + h.pin.y) / 2, h.pin.x, h.pin.y); };
    g.strokeStyle = '#5a9e3f'; g.lineWidth = 116; path(); g.stroke(); g.strokeStyle = '#74b84f'; g.lineWidth = 104; path(); g.stroke(); g.setLineDash([46, 46]); g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 104; path(); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#6aa847'; g.beginPath(); g.arc(h.pin.x, h.pin.y, h.gr + 9, 0, TAU); g.fill(); g.fillStyle = '#8fd96a'; g.beginPath(); g.arc(h.pin.x, h.pin.y, h.gr, 0, TAU); g.fill();
    for (let r = h.gr - 14; r > 10; r -= 18) { g.strokeStyle = 'rgba(255,255,255,.07)'; g.lineWidth = 6; g.beginPath(); g.arc(h.pin.x, h.pin.y, r, 0, TAU); g.stroke(); }
    for (const b of h.bunk) { g.fillStyle = '#c9b27a'; g.beginPath(); g.ellipse(b.x, b.y, b.rx + 4, b.ry + 4, 0, 0, TAU); g.fill(); g.fillStyle = '#ead9a4'; g.beginPath(); g.ellipse(b.x, b.y, b.rx, b.ry, 0, 0, TAU); g.fill(); }
    g.fillStyle = '#5f9b45'; g.fillRect(h.tee.x - 34, h.tee.y - 24, 68, 48); g.fillStyle = '#82c35f'; g.fillRect(h.tee.x - 30, h.tee.y - 20, 60, 40); g.fillStyle = '#fafafa'; g.beginPath(); g.arc(h.tee.x - 14, h.tee.y, 3, 0, TAU); g.arc(h.tee.x + 14, h.tee.y, 3, 0, TAU); g.fill();
    g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(h.tee.x - 44, h.tee.y - 58, 88, 26); g.fillStyle = '#fff'; g.font = 'bold 12px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(h.n + ' · Par ' + h.par + ' · ' + Math.round(h.len * YD) + ' yd', h.tee.x, h.tee.y - 45);
    g.fillStyle = '#111'; g.beginPath(); g.arc(h.pin.x, h.pin.y, 6, 0, TAU); g.fill(); }
  g.restore(); }
function drawFlags() { const L = W.links; if (!L || G.scene) return; const g = ctx, gf = G.golf; for (const h of L.holes) { if (!inView(h.pin.x, h.pin.y, 200)) continue; if (gf && gf.cur === h.n && gf.ball && Math.hypot(gf.ball.x - h.pin.x, gf.ball.y - h.pin.y) < 140 && gf.state === 'aim') continue; const w = Math.sin(G.t * 3 + h.n) * 3;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(h.pin.x + 2, h.pin.y - 2, 22, 4); g.strokeStyle = '#eeeeee'; g.lineWidth = 3; g.beginPath(); g.moveTo(h.pin.x, h.pin.y); g.lineTo(h.pin.x + 3, h.pin.y - 46); g.stroke(); g.fillStyle = h.n % 2 ? '#e53935' : '#fdd835'; g.beginPath(); g.moveTo(h.pin.x + 3, h.pin.y - 46); g.lineTo(h.pin.x + 26 + w, h.pin.y - 40); g.lineTo(h.pin.x + 3, h.pin.y - 33); g.fill(); g.fillStyle = '#111'; g.font = 'bold 9px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText(h.n, h.pin.x + 11, h.pin.y - 39); } }
{ const _dg = drawGaragePads; drawGaragePads = function () { _dg(); drawLinks(); }; }

// ---------- the round ----------
const GOLF_FEE = 150;
function golfStart(opt) { const L = W.links; if (!L) return; if (pCar()) return toast('Park the car first'); opt = opt || {}; if (!opt.free && !payAny(GOLF_FEE)) return; closeDialog(); Panel.close();
  G.golf = { cur: 1, cards: [], strokes: 0, wager: opt.wager || null, state: 'aim', ball: null, club: 0, aim: 0, wind: null }; golfHole(1); msg('⛳ Tee off at hole 1. Aim with the stick, hold SWING to charge power, let go to hit.', '#a5d6a7'); }
function golfHole(n) { const gf = G.golf, h = W.links.holes[n - 1]; gf.cur = n; gf.strokes = 0; gf.ball = { x: h.tee.x, y: h.tee.y, z: 0, vx: 0, vy: 0, vz: 0 }; gf.last = { x: h.tee.x, y: h.tee.y }; gf.state = 'aim'; gf.aim = Math.atan2(h.mid.y - h.tee.y, h.mid.x - h.tee.x);
  const r = mulberry32((G.hrId || 1) * 97 + n * 13 + (G.golfSeed = (G.golfSeed || 0) + 1)); const ws = r() * 26, wa = r() * TAU; gf.wind = { x: Math.cos(wa) * ws, y: Math.sin(wa) * ws, mph: Math.round(ws * .55) }; golfAutoClub(); golfPlace(); }
function golfPlace() { const gf = G.golf, p = G.player, b = gf.ball, a = gf.aim + Math.PI / 2; p.x = b.x + Math.cos(a) * 16 - Math.cos(gf.aim) * 6; p.y = b.y + Math.sin(a) * 16 - Math.sin(gf.aim) * 6; p.a = gf.aim; p.vx = p.vy = 0; }
function golfAutoClub() { const gf = G.golf, h = W.links.holes[gf.cur - 1], b = gf.ball, d = Math.hypot(h.pin.x - b.x, h.pin.y - b.y), lie = lieAt(b.x, b.y); if (lie === 'green') return gf.club = 6;
  let k = 5; for (let i = 5; i >= 0; i--) if (CLUBS[i].c * (lie === 'rough' ? .82 : lie === 'sand' ? .6 : 1) >= d * .92) { k = i; break; } else k = 0; if (k === 0 && lie !== 'tee') k = 1; if (lie === 'sand') k = Math.max(k, 4); gf.club = k; }
function golfShoot(p) { const gf = G.golf, cl = CLUBS[gf.club], b = gf.ball, lie = lieAt(b.x, b.y), bac = G.bac || 0; gf.strokes++; gf.last = { x: b.x, y: b.y }; gf.state = 'fly'; Snd.play(cl.putt ? 'clack' : 'thud', b.x, b.y, .5);
  const err = (Math.random() + Math.random() + Math.random() - 1.5) * (cl.acc * (lie === 'rough' ? 1.6 : lie === 'sand' ? 2.2 : 1) * (p > .97 ? 2 : 1) + bac * 1.2), a = gf.aim + err;
  if (cl.putt) { const d = 430 * p, v0 = Math.sqrt(2 * GFRIC.green * d); b.vx = Math.cos(a) * v0; b.vy = Math.sin(a) * v0; b.z = 0; b.vz = 0; gf.state = 'roll'; return; }
  const lf = lie === 'rough' ? (gf.club === 5 ? .9 : .82) : lie === 'sand' ? (gf.club >= 4 ? .85 : .55) : 1, carry = cl.c * p * lf * (1 + (Math.random() - .5) * .06), tf = cl.t * (.75 + .25 * p), v = carry / tf;
  b.vx = Math.cos(a) * v; b.vy = Math.sin(a) * v; b.vz = 300 * tf / 2; b.z = .1; }
function golfPenalty(why) { const gf = G.golf, b = gf.ball; gf.strokes++; msg('⛳ ' + why + ' — penalty stroke.', '#ffb74d'); b.x = gf.last.x; b.y = gf.last.y; b.z = b.vx = b.vy = b.vz = 0; golfStop(); }
function golfStop() { const gf = G.golf; gf.state = 'aim'; const h = W.links.holes[gf.cur - 1]; gf.aim = Math.atan2(h.pin.y - gf.ball.y, h.pin.x - gf.ball.x); golfAutoClub(); golfPlace(); if (gf.strokes >= 10) { msg('⛳ Picked up at 10.', '#ffb74d'); golfHoled(1); } }
const SCN = d => d <= -3 ? 'Albatross!' : d === -2 ? 'Eagle!' : d === -1 ? 'Birdie!' : d === 0 ? 'Par' : d === 1 ? 'Bogey' : d === 2 ? 'Double bogey' : '+' + d;
function golfHoled(picked) { const gf = G.golf, h = W.links.holes[gf.cur - 1]; gf.cards.push(gf.strokes); gf.state = 'done'; gf.doneT = G.t; const d = gf.strokes - h.par;
  if (!picked) { G.big = { text: gf.strokes === 1 ? 'HOLE IN ONE!' : SCN(d).toUpperCase(), col: d < 0 ? '#2ecc71' : d === 0 ? '#fff' : '#ffb74d', t: 2.2 }; Snd.play(d < 0 ? 'mission' : 'pop'); } }
function golfEnd(quit) { const gf = G.golf; if (!gf) return; G.golf = null; const par = W.links.holes.slice(0, gf.cards.length).reduce((s, h) => s + h.par, 0), tot = gf.cards.reduce((a, b) => a + b, 0), rel = tot - par, rs = rel === 0 ? 'E' : (rel > 0 ? '+' : '') + rel;
  let line = (quit ? 'You walked off after ' + gf.cards.length + ' hole' + (gf.cards.length === 1 ? '' : 's') : 'Round over') + ': ' + tot + ' strokes (' + rs + ').'; const W2 = gf.wager;
  if (W2) { const theirs = W2.scores.slice(0, 9).reduce((a, b) => a + b, 0); if (quit) { line += '\n' + W2.name + ' keeps your ' + money(W2.stake) + ' stake. "Forfeit\'s a forfeit."'; }
    else if (tot < theirs) { addCash(W2.stake * 2); line += '\n' + W2.name + ' shot ' + theirs + '. You win ' + money(W2.stake * 2) + '. He pays up through gritted teeth.'; Snd.play('cash'); }
    else if (tot === theirs) { addCash(W2.stake); line += '\n' + W2.name + ' also shot ' + theirs + ' — a push. Stakes returned.'; }
    else line += '\n' + W2.name + ' shot ' + theirs + ' and pockets your ' + money(W2.stake) + '.'; }
  say('Scorecard — Varro Links', gf.cards.map((s, i) => (i + 1) + ': ' + s).join('   ') + '\n' + line, [{ t: 'OK' }]); }
// ---------- the swing, the flight, the roll ----------
function golfTick(dt) { const gf = G.golf; if (!gf) return; if (G.scene || G.player.dead || pCar()) return golfEnd(1); const b = gf.ball, h = W.links.holes[gf.cur - 1], K = Input.keys || {}, H = Input.held || {};
  if (gf.state === 'aim') { const mx = gf.mx, my = gf.my, m = Math.hypot(mx, my); if (m > .35 && !Input.kbd) gf.aim += angDiff(gf.aim, Math.atan2(my, mx)) * Math.min(1, dt * 6); if (K.arrowleft || K.a) gf.aim -= dt * .9; if (K.arrowright || K.d) gf.aim += dt * .9;
    if ((Input.edge.club || (K.c && !gf.cK)) && !gf.charging) { gf.club = (gf.club + 1) % CLUBS.length; Snd.play('ui'); } gf.cK = K.c;
    const down = !!(H.swing || K[' '] || K.enter); if (down && !gf.charging) { gf.charging = 1; gf.ct = 0; } if (gf.charging) { gf.ct += dt; gf.pw = (1 - Math.cos(gf.ct * 2.3)) / 2; if (!down) { gf.charging = 0; golfShoot(Math.max(.04, gf.pw)); } } golfPlace(); return; }
  if (gf.state === 'done') { if (G.t - gf.doneT > 2.4) { if (gf.cur >= 9) return golfEnd(0); golfHole(gf.cur + 1); } return; }
  if (gf.state === 'fly') { const s = 1 - Math.exp(-dt * 0); b.x += (b.vx + gf.wind.x * .55) * dt; b.y += (b.vy + gf.wind.y * .55) * dt; b.z += b.vz * dt; b.vz -= 300 * dt;
    if (b.z < 70 && b.z > 4 && propsNear(b.x, b.y, 30).some(p => (p.t === 'tree' || p.t === 'pine') && dist(p.x, p.y, b.x, b.y) < 24)) { b.vx *= .1; b.vy *= .1; b.vz = Math.min(b.vz, 0); toast('Clipped a tree!'); }
    if (b.z <= 0) { b.z = 0; const lie = lieAt(b.x, b.y); if (lie === 'water') return golfPenalty('Splash! Water hazard'); if (lie === 'ob') return golfPenalty('Out of bounds'); const k = GBOUNCE[lie] || .3; b.vx *= k; b.vy *= k; gf.state = 'roll'; Snd.play('thud', b.x, b.y, .3); } return; }
  if (gf.state === 'roll') { const lie = lieAt(b.x, b.y), sp = Math.hypot(b.vx, b.vy); if (lie === 'water') return golfPenalty('Rolled into the water'); if (lie === 'ob') return golfPenalty('Rolled out of bounds');
    const dp = Math.hypot(b.x - h.pin.x, b.y - h.pin.y); if (dp < 6.5) { if (sp < 300) { b.x = h.pin.x; b.y = h.pin.y; b.vx = b.vy = 0; Snd.play('clack', b.x, b.y, .8); return golfHoled(0); } const nx = (b.x - h.pin.x) / (dp || 1), ny = (b.y - h.pin.y) / (dp || 1); b.vx += nx * 60; b.vy += ny * 60; toast('Lipped out!'); }
    const ns = Math.max(0, sp - (GFRIC[lie] || 400) * dt); if (ns < 6) { b.vx = b.vy = 0; return golfStop(); } b.vx *= ns / sp; b.vy *= ns / sp; b.x += b.vx * dt; b.y += b.vy * dt; } }
// input: while golfing the stick aims, SWING hits; nothing else moves the player
{ const _u = update; update = function (dt) { const gf = G.golf; if (gf && G.mode === 'play') { gf.mx = Input.mx; gf.my = Input.my; Input.mx = Input.my = 0; Input.fire = false; if (Input.mouse) Input.mouse.down = false; } _u(dt); if (G.mode === 'play') golfTick(dt); }; }
{ const _lo = Input.layout; Input.layout = function () { const L = _lo.call(this); if (!G.golf) return L; const s = L.s, fire = L.btns.find(b => b.id === 'fire') || L.btns[0];
  L.btns = [{ id: 'swing', x: fire.x, y: fire.y, r: fire.r * 1.1, label: 'SWING', col: '#2e7d32', show: true }, { id: 'club', x: fire.x - 112 * s, y: fire.y + 10 * s, r: 30 * s, label: 'CLUB', col: '#37474f', show: true }, { id: 'gquit', x: fire.x - 4 * s, y: fire.y - 150 * s, r: 24 * s, label: 'QUIT', col: '#5b1010', show: true }]; this._L = L; return L; }; }
{ const _ui = Input.clearEdges; Input.clearEdges = function () { if (G.golf && Input.edge && Input.edge.gquit) { const gf = G.golf; say('Leave the course?', gf.wager ? 'You\'ll forfeit your ' + money(gf.wager.stake) + ' wager.' : 'Your round ends here.', [{ t: 'Walk off', c: 'r', f: () => { closeDialog(); golfEnd(1); } }, { t: 'Keep playing' }]); } return _ui.apply(this, arguments); }; }
{ const _ucm = updateCamera; updateCamera = function (dt) { const gf = G.golf; if (!gf || G.scene) return _ucm(dt); const cam = G.cam, b = gf.ball, h = W.links.holes[gf.cur - 1], k = 1 - Math.exp(-dt * 3);
  let tx = b.x, ty = b.y, z = Math.min(VW, VH) / (7.6 * T) * (G.settings.zoom || 1) * .55; if (gf.state === 'aim') { const cl = CLUBS[gf.club], rch = cl.putt ? 220 : cl.c * .55; tx = b.x + Math.cos(gf.aim) * rch * .5; ty = b.y + Math.sin(gf.aim) * rch * .5; if (cl.putt) z *= 1.7; }
  cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, k); cam.z = lerp(cam.z, z, 1 - Math.exp(-dt * 2)); }; }
// aim line, landing ring, ball and its shadow — drawn above everything on the ground
function drawGolfBall() { const gf = G.golf; drawFlags(); if (!gf || G.scene) return; const g = ctx, b = gf.ball, cl = CLUBS[gf.club];
  if (gf.state === 'aim') { const rch = cl.putt ? 430 * (gf.charging ? gf.pw : .5) : cl.c * (gf.charging ? gf.pw : 1) * (lieAt(b.x, b.y) === 'rough' ? .82 : lieAt(b.x, b.y) === 'sand' ? .6 : 1), ex = b.x + Math.cos(gf.aim) * rch, ey = b.y + Math.sin(gf.aim) * rch;
    g.save(); g.setLineDash([10, 9]); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]); g.strokeStyle = gf.charging ? '#ffeb3b' : '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(ex, ey, cl.putt ? 8 : 22, 0, TAU); g.stroke(); g.restore(); }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.arc(b.x + b.z * .35, b.y + b.z * .5, 3.6, 0, TAU); g.fill(); const r = 4 + b.z * .02; g.fillStyle = '#fff'; g.beginPath(); g.arc(b.x, b.y - b.z * .15, r, 0, TAU); g.fill(); g.strokeStyle = '#bbb'; g.lineWidth = 1; g.stroke(); }
{ const _db = drawBirds; drawBirds = function (air) { if (air) drawGolfBall(); return _db(air); }; }
{ const _rh = renderHUD; renderHUD = function () { _rh(); const gf = G.golf; if (!gf || G.mode !== 'play') return; const sc = hudSc(), h = W.links.holes[gf.cur - 1], b = gf.ball, d = Math.round(Math.hypot(h.pin.x - b.x, h.pin.y - b.y) * YD), cl = CLUBS[gf.club], lie = lieAt(b.x, b.y);
  const tot = gf.cards.reduce((a, c) => a + c, 0), par = W.links.holes.slice(0, gf.cards.length).reduce((s, k) => s + k.par, 0), rel = tot - par, w = Math.min(VW * .82, 560 * sc), y = 110 * sc;
  ctx.fillStyle = 'rgba(10,30,14,.82)'; ctx.fillRect(VW / 2 - w / 2, y - 16 * sc, w, 46 * sc); txt('⛳ Hole ' + h.n + ' · Par ' + h.par + ' · ' + Math.round(h.len * YD) + ' yd · Stroke ' + (gf.strokes + 1) + '   |   Card ' + (gf.cards.length ? (rel === 0 ? 'E' : (rel > 0 ? '+' : '') + rel) : '—'), VW / 2, y, 12 * sc, '#c8e6c9', 'center');
  txt(cl.n + ' (' + (cl.putt ? 'rolls' : Math.round(cl.c * YD) + ' yd') + ') · ' + d + ' yd to pin · lie: ' + lie + ' · wind ' + gf.wind.mph + ' mph ' + '↑↗→↘↓↙←↖'[Math.round(((Math.atan2(gf.wind.y, gf.wind.x) + Math.PI / 2) / TAU * 8 + 8)) % 8], VW / 2, y + 20 * sc, 11 * sc, '#fff', 'center');
  if (gf.wager) { const thru = gf.cards.length, theirs = gf.wager.scores.slice(0, thru).reduce((a, c) => a + c, 0), tp = W.links.holes.slice(0, thru).reduce((s, k) => s + k.par, 0); txt(gf.wager.name + ': ' + (thru ? ((theirs - tp) === 0 ? 'E' : (theirs - tp > 0 ? '+' : '') + (theirs - tp)) + ' thru ' + thru : 'on the tee') + ' · ' + money(gf.wager.stake) + ' on it', VW / 2, y + 40 * sc, 11 * sc, '#ffcc80', 'center'); }
  if (gf.charging) { const L = Input._L || Input.layout(), sw = L.btns.find(b => b.id === 'swing'), bx = sw ? sw.x - sw.r - 40 * sc : VW - 120 * sc, by = sw ? sw.y - sw.r : VH / 2, bh = 140 * sc; ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(bx, by - bh * .2, 18 * sc, bh); ctx.fillStyle = gf.pw > .97 ? '#ff5252' : '#ffeb3b'; ctx.fillRect(bx + 2 * sc, by - bh * .2 + bh * (1 - gf.pw), 14 * sc, bh * gf.pw); }
  if (gf.state === 'aim' && !gf.charging && gf.strokes === 0 && gf.cur === 1) { ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(VW / 2 - w / 2, VH * .72, w, 22 * sc); txt('Stick: aim · CLUB: change club · hold SWING, release at the power you want (red = mishit risk)', VW / 2, VH * .72 + 15 * sc, 11 * sc, '#fff', 'center'); } }; }
// the starter at the first tee
{ const _m2 = makeSpotPed2; makeSpotPed2 = function (s) { if (s.gstart) { const q = new Ped(s.x, s.y, { role: 'civ', name: s.name }); q.state = 'idle'; q.still = 1; q.home = [s.x, s.y]; q.a = 0; q.gstart = 1; return q; } return _m2(s); }; }
{ const _tt = talkTo; talkTo = function (q) { if (q.gstart) { if (G.golf) return toast('You\'re mid-round'); return say(q.name, '"Nine holes, par ' + W.links.holes.reduce((s, h) => s + h.par, 0) + '. Green fee is ' + money(GOLF_FEE) + '. Members can arrange a friendly wager — ask around the clubhouse."', [{ t: 'Play 9 holes — ' + money(GOLF_FEE), c: 'y', d: !canPay(GOLF_FEE), f: () => golfStart() }, { t: 'Not today' }]); } return _tt(q); }; }
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(); if (W.links) o.push({ x: W.links.tee1.x, y: W.links.tee1.y, c: '#a5d6a7', ic: '⛳', r: 6, n: 'Varro Links', pr: 6 }); return o; }; }
