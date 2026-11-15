// ================= INTERIORS III: rooms that look built, tables with stuff on them, people doing things — and bouncers =================
const WALLTH = {
  home: { cap: '#4e342e', face: '#d7ccc8', pat: 'stripe', pc: 'rgba(121,85,72,.18)' }, safehouse: { cap: '#3e2723', face: '#a1887f', pat: 'stripe', pc: 'rgba(0,0,0,.12)' },
  bar: { cap: '#2b1a12', face: '#8d4a3a', pat: 'brick' }, diner: { cap: '#37474f', face: '#eceff1', pat: 'tile', pc: '#e53935' }, office: { cap: '#37474f', face: '#cfd8dc', pat: 'panel' },
  hospital: { cap: '#455a64', face: '#e0f2f1', pat: 'tile', pc: '#4db6ac' }, police: { cap: '#263238', face: '#90a4ae', pat: 'panel' }, bank: { cap: '#3e2723', face: '#d7c4a8', pat: 'panel' },
  store: { cap: '#33691e', face: '#fff8e1', pat: 'tile', pc: '#7cb342' }, club: { cap: '#0d0d1a', face: '#1a1a2e', pat: 'neon' }, strip: { cap: '#1a0a1a', face: '#2a0f2a', pat: 'neon' },
  arcade: { cap: '#0d0d26', face: '#1a237e', pat: 'neon' }, casino: { cap: '#2b0710', face: '#4a0e1f', pat: 'panel' }, gunshop: { cap: '#3e2723', face: '#6d4c41', pat: 'wood' },
  pawn: { cap: '#3e2723', face: '#7b5e4f', pat: 'wood' }, warehouse: { cap: '#37474f', face: '#78909c', pat: 'corrug' }, barn: { cap: '#4e2a1e', face: '#8d3b2a', pat: 'wood' },
};
const theme = s => WALLTH[s.b.type] || WALLTH.office;
function drawInteriorWalls(s, cached) { const th = theme(s), night = darkness() > .5, W2 = s.w, H2 = s.h;
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) { if (!s.solid[y * W2 + x]) continue; const X = x * T, Y = y * T;
    ctx.fillStyle = th.cap; ctx.fillRect(X, Y, T + .5, T + .5);
    if (y === 0 && x > 0 && x < W2 - 1) { // the far wall: you see its face
      const fy = Y + T * .3, fh = T * .7; ctx.fillStyle = th.face; ctx.fillRect(X, fy, T + .5, fh);
      if (th.pat === 'stripe') { ctx.fillStyle = th.pc; for (let i = 0; i < 4; i++) ctx.fillRect(X + i * T / 4, fy, T / 8, fh); }
      else if (th.pat === 'brick') { ctx.fillStyle = 'rgba(0,0,0,.22)'; for (let r = 0; r < 4; r++) { ctx.fillRect(X, fy + r * fh / 4, T, 1.2); for (let k = 0; k < 3; k++) ctx.fillRect(X + ((k + (r % 2) * .5) * T / 3) % T, fy + r * fh / 4, 1.2, fh / 4); } }
      else if (th.pat === 'tile') { ctx.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 4; i++) { ctx.fillRect(X + i * T / 4, fy, 1, fh); ctx.fillRect(X, fy + i * fh / 4, T, 1); } ctx.fillStyle = th.pc; ctx.fillRect(X, fy + fh * .55, T + .5, 4); }
      else if (th.pat === 'panel') { ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.fillRect(X + 4, fy + fh * .5, T - 8, fh * .42); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(X + 4, fy + fh * .5, T - 8, 1.5); }
      else if (th.pat === 'wood') { ctx.fillStyle = 'rgba(0,0,0,.15)'; for (let i = 1; i < 5; i++) ctx.fillRect(X + i * T / 5, fy, 1.2, fh); }
      else if (th.pat === 'corrug') { ctx.fillStyle = 'rgba(255,255,255,.1)'; for (let i = 0; i < 8; i++) ctx.fillRect(X + i * T / 8, fy, T / 16, fh); }
      else if (th.pat === 'neon' && !cached) { const hue = (G.t * 30 + x * 20) % 360; ctx.fillStyle = `hsla(${hue},100%,60%,.85)`; ctx.fillRect(X, fy + fh * .35, T + .5, 2.5); ctx.fillStyle = `hsla(${hue},100%,60%,.15)`; ctx.fillRect(X, fy + fh * .2, T + .5, fh * .3); }
      // windows every few tiles (not on neon rooms)
      if (th.pat !== 'neon' && x % 3 === 1) { const wx = X + T * .18, wy = fy + fh * .12, ww = T * .64, wh = fh * .5; ctx.fillStyle = '#5d4037'; ctx.fillRect(wx - 3, wy - 3, ww + 6, wh + 6);
        const sky = night ? '#0d1b2a' : `hsl(200,70%,${72 - darkness() * 30}%)`; ctx.fillStyle = sky; ctx.fillRect(wx, wy, ww, wh); if (night && (x * 7) % 5 < 2) { ctx.fillStyle = '#ffe082'; ctx.fillRect(wx + ww * .6, wy + wh * .3, 5, 4); }
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(wx + 3, wy + 3, ww * .25, 2); ctx.fillStyle = '#5d4037'; ctx.fillRect(wx + ww / 2 - 1, wy, 2, wh); ctx.fillRect(wx, wy + wh / 2 - 1, ww, 2); }
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(X, Y + T - 5, T + .5, 5); // baseboard
    } else { ctx.fillStyle = 'rgba(255,255,255,.06)'; ctx.fillRect(X, Y, T + .5, 3); }
  }
  // door frame around the exit
  const dx = s.door.x; ctx.fillStyle = '#3e2723'; ctx.fillRect(dx - T * .58, (H2 - 1) * T - 4, 7, T * .9); ctx.fillRect(dx + T * .58 - 7, (H2 - 1) * T - 4, 7, T * .9);
}
function drawFloorDetail(s) { const W2 = s.w, H2 = s.h, g = ctx, sh = (x, y, w, h, dir) => { const gr = dir === 'v' ? g.createLinearGradient(x, y, x, y + h) : g.createLinearGradient(x, y, x + w, y); gr.addColorStop(0, 'rgba(0,0,0,.3)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x, y, w, h); };
  sh(T, T, (W2 - 2) * T, T * .5, 'v'); sh(T, T, T * .4, (H2 - 2) * T, 'h');
  { const gr = g.createLinearGradient((W2 - 1) * T, 0, (W2 - 1.4) * T, 0); gr.addColorStop(0, 'rgba(0,0,0,.25)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect((W2 - 1.4) * T, T, T * .4, (H2 - 2) * T); }
  // daylight falling through the windows
  const dk = darkness(); if (dk < .6 && theme(s).pat !== 'neon') { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,236,190,${.07 * (1 - dk)})`; for (let x = 1; x < W2 - 1; x += 3) { const X = x * T + T * .18; g.beginPath(); g.moveTo(X, T); g.lineTo(X + T * .64, T); g.lineTo(X + T * 1.1, T * 3.2); g.lineTo(X + T * .4, T * 3.2); g.fill(); } g.restore(); }
  for (let i = 0; i < (s.scuffs || (s.scuffs = Array.from({ length: 6 + Math.floor(Math.random() * 6) }, () => [1.3 + Math.random() * (W2 - 2.6), 1.5 + Math.random() * (H2 - 3), Math.random() * TAU, .4 + Math.random() * .8]))).length; i++) { const [x, y, a, k] = s.scuffs[i]; g.save(); g.translate(x * T, y * T); g.rotate(a); g.fillStyle = 'rgba(0,0,0,.05)'; g.beginPath(); g.ellipse(0, 0, 14 * k, 5 * k, 0, 0, TAU); g.fill(); g.restore(); }
}
// small things on tables, desks, counters and bars
const SURF = { table: 2, desk: 3, counter: 3, bar: 4, kcounter: 2, ctable: 2, dining: 4, hightable: 1, booth: 0, reception: 2, teller: 3, bjtable: 0, wbench: 2, dresser: 1, nstand: 1 };
function surfStuff(it) { if (it.stuff) return it.stuff; const r = mulberry32(Math.floor(it.x * 131 + it.y * 977 + it.w * 31)), n = SURF[it.t] | 0, out = [];
  const kinds = it.t === 'desk' || it.t === 'reception' || it.t === 'teller' ? ['paper', 'paper', 'mug', 'phone', 'laptop', 'lamp'] : it.t === 'bar' ? ['glass', 'bottle', 'glass', 'ash', 'bottle'] : it.t === 'wbench' ? ['tool', 'tool', 'box'] : it.t === 'kcounter' || it.t === 'counter' ? ['mug', 'plate', 'bottle', 'fruit', 'paper'] : it.t === 'dresser' || it.t === 'nstand' ? ['vase', 'book', 'phone'] : ['plate', 'mug', 'glass', 'vase', 'book', 'phone', 'fruit'];
  for (let i = 0; i < n; i++) out.push({ k: kinds[Math.floor(r() * kinds.length)], u: .15 + r() * .7, v: .2 + r() * .6, a: r() * TAU });
  return it.stuff = out; }
function drawSurfaceStuff(s) { const g = ctx; for (const it of s.items) { if (!SURF[it.t] || it.stolen) continue; for (const o of surfStuff(it)) { const x = (it.x + it.w * o.u) * T, y = (it.y + it.h * o.v) * T; g.save(); g.translate(x, y); g.rotate(o.a);
    switch (o.k) {
      case 'paper': g.fillStyle = '#fafafa'; g.fillRect(-5, -7, 10, 13); g.fillStyle = 'rgba(0,0,0,.25)'; for (let i = 0; i < 3; i++) g.fillRect(-3, -4 + i * 3, 6, 1); break;
      case 'mug': g.fillStyle = '#eceff1'; g.beginPath(); g.arc(0, 0, 3.6, 0, TAU); g.fill(); g.fillStyle = '#5d4037'; g.beginPath(); g.arc(0, 0, 2.4, 0, TAU); g.fill(); g.fillStyle = '#eceff1'; g.fillRect(3, -1, 2.5, 2); break;
      case 'glass': g.fillStyle = 'rgba(200,230,255,.6)'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); g.fillStyle = 'rgba(255,193,7,.75)'; g.beginPath(); g.arc(0, 0, 2, 0, TAU); g.fill(); break;
      case 'bottle': g.fillStyle = ['#2e7d32', '#6d4c41', '#1565c0'][Math.floor(o.u * 3)]; g.beginPath(); g.arc(0, 0, 2.8, 0, TAU); g.fill(); g.fillStyle = '#fafafa'; g.fillRect(-1, -1, 2, 2); break;
      case 'plate': g.fillStyle = '#fafafa'; g.beginPath(); g.arc(0, 0, 5, 0, TAU); g.fill(); g.fillStyle = ['#ff7043', '#8d6e63', '#9ccc65'][Math.floor(o.v * 3)]; g.beginPath(); g.arc(.5, .5, 2.6, 0, TAU); g.fill(); break;
      case 'phone': g.fillStyle = '#212121'; g.fillRect(-2, -3.5, 4, 7); g.fillStyle = Math.sin(G.t * 2 + o.u * 9) > .6 ? '#81d4fa' : '#37474f'; g.fillRect(-1.4, -2.8, 2.8, 5); break;
      case 'laptop': g.fillStyle = '#90a4ae'; g.fillRect(-7, -5, 14, 10); g.fillStyle = '#263238'; g.fillRect(-6, -4, 12, 5); g.fillStyle = `rgba(100,181,246,${.5 + Math.sin(G.t * 3 + o.u * 7) * .2})`; g.fillRect(-5, -3.5, 10, 4); break;
      case 'lamp': g.fillStyle = '#ffe082'; g.beginPath(); g.arc(0, 0, 3.5, 0, TAU); g.fill(); g.strokeStyle = '#5d4037'; g.lineWidth = 1; g.stroke(); break;
      case 'vase': g.fillStyle = '#5c6bc0'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); for (let i = 0; i < 3; i++) { g.fillStyle = ['#ef5350', '#ffee58', '#ec407a'][i]; g.beginPath(); g.arc(Math.cos(i * 2.1) * 3, Math.sin(i * 2.1) * 3, 1.8, 0, TAU); g.fill(); } break;
      case 'book': g.fillStyle = ['#c62828', '#1565c0', '#2e7d32'][Math.floor(o.u * 3)]; g.fillRect(-4, -5.5, 8, 11); g.fillStyle = '#fafafa'; g.fillRect(3, -5, 1, 10); break;
      case 'fruit': for (let i = 0; i < 3; i++) { g.fillStyle = ['#e53935', '#fdd835', '#43a047'][i]; g.beginPath(); g.arc(-2 + i * 2.5, (i % 2) * 2, 2.2, 0, TAU); g.fill(); } break;
      case 'ash': g.fillStyle = '#9e9e9e'; g.beginPath(); g.arc(0, 0, 3, 0, TAU); g.fill(); g.fillStyle = '#424242'; g.beginPath(); g.arc(0, 0, 1.6, 0, TAU); g.fill(); break;
      case 'tool': g.fillStyle = '#b0bec5'; g.fillRect(-6, -1, 12, 2); g.fillStyle = '#e53935'; g.fillRect(-6, -1.5, 4, 3); break;
      case 'box': g.fillStyle = '#c8a26b'; g.fillRect(-4, -4, 8, 8); break;
    } g.restore(); } } }
// ceiling fans and steam drawn above everything
function drawCeiling(s) { const ty = s.b.type; if (!['home', 'safehouse', 'diner', 'bar', 'office', 'pawn', 'gunshop', 'store', 'police'].includes(ty)) return; const spots = s.fans || (s.fans = ty === 'office' || ty === 'police' ? [[s.w * .3, s.h * .45], [s.w * .7, s.h * .45]] : [[s.w * .55, s.h * .5]]);
  for (const [fx, fy] of spots) { const x = fx * T, y = fy * T; ctx.save(); ctx.translate(x, y); ctx.globalAlpha = .5; ctx.rotate(G.t * 7); ctx.fillStyle = '#3e2723'; for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.ellipse(16, 0, 15, 4, 0, 0, TAU); ctx.fill(); } ctx.globalAlpha = .9; ctx.fillStyle = '#795548'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill(); ctx.restore(); } }
// lighting for every room (bars and clubs keep their own)
function interiorLighting() { const s = G.scene, ty = s.b.type; if (['club', 'strip', 'bar'].includes(ty)) return interiorLighting0(); G.lights = [];
  const night = darkness() > .5, homey = ty === 'home' || ty === 'safehouse', amb = ty === 'warehouse' || ty === 'barn' ? [120, 120, 125] : homey ? (night ? [95, 90, 105] : [170, 160, 150]) : ty === 'casino' ? [130, 100, 95] : [185, 180, 175];
  for (let x = 2; x < s.w; x += 4) for (let y = 2; y < s.h; y += 4) pushLight('pt', x * T, y * T, homey ? 170 : 210, homey ? 'rgba(255,200,140,1)' : ty === 'hospital' || ty === 'office' || ty === 'police' ? 'rgba(220,240,255,1)' : 'rgba(255,225,180,1)', homey ? .55 : .5);
  for (const it of s.items) { const cx = (it.x + it.w / 2) * T, cy = (it.y + it.h / 2) * T;
    if (it.t === 'lamp' || it.t === 'nstand') pushLight('pt', cx, cy, 120, 'rgba(255,190,110,1)', .8); else if (it.t === 'tv' || it.t === 'computer' || it.t === 'arcade' || it.t === 'slot') pushLight('pt', cx, cy + 18, 90, `hsla(${(G.t * 40) % 360},70%,60%,1)`, .5); else if (it.t === 'fridge' || it.t === 'vend' || it.t === 'atm') pushLight('pt', cx, cy + 12, 70, 'rgba(180,220,255,1)', .4); else if (it.t === 'fireplace' || it.t === 'stove' && it.on) pushLight('pt', cx, cy + 14, 140, 'rgba(255,140,60,1)', .8); }
  collectFxLights(); lightPass(amb, 1); }
// ---------- more people, doing things ----------
const EXTRA = { bar: [['patron', 3]], diner: [['patron', 2], ['worker', 1, { waiter: 1 }]], store: [['patron', 2]], office: [['worker', 2]], hospital: [['patron', 2], ['nurse', 1]], police: [['cop', 1]], bank: [['patron', 2]], pawn: [['patron', 1]], gunshop: [['patron', 1]], arcade: [['kid', 2]], club: [['dancer', 3]], warehouse: [['worker', 1]], casino: [['patron', 3]], home: [['resident', 1, { maybe: .35 }]] };
function makeInterior(b) { const s = makeInteriorC(b); for (const [role, n, ex] of EXTRA[b.type] || []) for (let i = 0; i < n; i++) { if (ex && ex.maybe && Math.random() > ex.maybe) continue; for (let k = 0; k < 20; k++) { const x = 1.5 + Math.random() * (s.w - 3), y = 1.6 + Math.random() * (s.h - 3.2); if (s.items.some(it => IT[it.t] && IT[it.t].s && x > it.x - .3 && x < it.x + it.w + .3 && y > it.y - .3 && y < it.y + it.h + .3)) continue; s.npcDefs.push(Object.assign({ role, x, y, roam: 1 }, ex || {}, role === 'dancer' ? { dance: 1 } : {})); break; } } return s; }
const POIT = { bar: 1, counter: 1, shelf: 1, fridge: 1, cooler: 1, arcade: 1, slot: 1, vend: 1, jukebox: 1, pool: 1, books: 1, display: 1, magrack: 1, pshelf: 1, case: 1, atm: 1, printer: 1, filing: 1, sink: 1, tv: 1, dartboard: 1, claw: 1, icechest: 1, teller: 1, reception: 1, czcage: 1, wheel: 1, kcounter: 1, stove: 1 };
const INSIDE_TALK = { bar: ['Another round!', 'Put it on my tab.', 'Who\'s winning?', 'Cheers!'], diner: ['Can I get a refill?', 'Best pie in town.', 'Check, please.', 'More coffee, hon?'], store: ['Do you have this in a bigger size?', 'Prices these days…', 'Where\'s the milk?'], office: ['Did you get my email?', 'Meeting in five.', 'Who touched my stapler?', 'Is it Friday yet?'], hospital: ['How long is the wait?', 'He\'ll be fine.', 'Nurse!'], bank: ['I\'d like to make a deposit.', 'Is the manager in?'], arcade: ['New high score!', 'Gimme a token!', 'Rematch!'], casino: ['Come on, lucky seven!', 'I\'m due.', 'Double down!'], home: ['What\'s for dinner?', 'Did you pay the light bill?', 'Turn that down!'], police: ['Coffee\'s burnt again.', 'Sign here.'], warehouse: ['Lift with your legs.', 'Where does this go?'] };
function insideLifeTick(dt) { const s = G.scene; if (!s || !s.peds) return; const p = G.player, ty = s.b.type;
  if (!s.lifeSet) { s.lifeSet = 1; s.peds.forEach((q, i) => { const d = s.npcDefs[i] || {}; if (d.roam) { q.roam = 1; q.still = 0; q.sit = 0; } if (d.waiter) { q.waiter = 1; q.shirt = '#fafafa'; q.jk = '#212121'; } }); for (const q of s.peds) if (!q.still && !q.sit && !q.lie && !q.dance && !q.shop && q.role !== 'prisoner' && q.role !== 'guard' && q.role !== 'bouncer') q.roam = 1; }
  if (s.trouble) return troubleTick(s, dt);
  const pois = s.pois || (s.pois = s.items.filter(it => POIT[it.t]).map(it => { const cx = (it.x + it.w / 2) * T, cy = (it.y + it.h / 2) * T; let bx = cx, by = (it.y + it.h) * T + 16; if (it.y + it.h > s.h - 1.6) by = it.y * T - 16; if (it.x < .9) { bx = (it.x + it.w) * T + 16; by = cy; } else if (it.x + it.w > s.w - 1.1) { bx = it.x * T - 16; by = cy; } return { it, x: clamp(bx, T * 1.2, (s.w - 1.2) * T), y: clamp(by, T * 1.2, (s.h - 1.4) * T), fx: cx, fy: cy }; }));
  for (const q of s.peds) { if (q.dead || !q.roam || q.talking || q.state !== 'idle') continue;
    if (q.chatT > 0) { q.chatT -= dt; q.timer = 1; q.wander = null; continue; }
    if (q.useT > 0) { q.useT -= dt; q.timer = 1; q.wander = null; if (q.poi) q.a = Math.atan2(q.poi.fy - q.y, q.poi.fx - q.x); if (q.useT <= 0) q.poi = null; continue; }
    if (q.poi && q.wander) { q.timer = 1; if (dist(q.x, q.y, q.poi.x, q.poi.y) < 14) { q.wander = null; q.useT = rnd(3, 8); if (Math.random() < .2) pedSay(q, pick(INSIDE_TALK[ty] || ['Hmm.'])); } continue; }
    if (q.timer > .2) continue; const r = Math.random();
    if (r < .5 && pois.length) { const P = q.waiter ? pick(pois.filter(o => ['counter', 'kcounter', 'stove'].includes(o.it.t)).concat(s.items.filter(it => it.t === 'table' || it.t === 'booth').map(it => ({ x: (it.x + it.w / 2) * T, y: (it.y + it.h) * T + 14, fx: (it.x + it.w / 2) * T, fy: (it.y + it.h / 2) * T })))) : pick(pois); if (P) { q.poi = P; q.wander = [P.x, P.y]; q.timer = 1; continue; } }
    if (r < .72) { const o = s.peds.find(o => o !== q && !o.dead && o.roam && o.state === 'idle' && !(o.chatT > 0) && !o.poi && dist2(o.x, o.y, q.x, q.y) < 150 * 150); if (o) { const L = pick(CHAT); q.chatT = o.chatT = rnd(4, 7); q.a = Math.atan2(o.y - q.y, o.x - q.x); o.a = q.a + Math.PI; q.wander = o.wander = null; pedSay(q, L[0]); setTimeout(() => { if (!o.dead && G.scene === s) pedSay(o, L[1]); }, 1800); continue; } }
    q.timer = rnd(2, 5); q.wander = [clamp(q.x + rnd(-140, 140), T * 1.3, (s.w - 1.3) * T), clamp(q.y + rnd(-120, 120), T * 1.3, (s.h - 1.6) * T)]; }
  // steam off stoves and coffee, now and then
  if (Math.random() < dt * 3) { const it = pick(s.items.filter(it => it.t === 'stove' || it.t === 'kcounter' || it.t === 'counter' && ty === 'diner')); if (it) spawnFx('smoke', (it.x + it.w * Math.random()) * T, (it.y + it.h * .4) * T); }
}
// ---------- start a fight inside and you get thrown out ----------
const KEEPS = new Set(['home', 'safehouse', 'police', 'casino']);
function troubleStart(s) { if (!s || s.trouble || canDecorate()) return; if (s.b.type === 'police' || s.b.type === 'mil') return; s.trouble = { t: G.t };
  const door = s.door; let ej = 0;
  for (const q of s.peds) { if (q.dead) continue; const tough = q.role === 'bouncer' || q.role === 'guard' || (q.role === 'clerk' && q.shop !== 'casino') || q.role === 'worker' && (s.b.type === 'warehouse' || s.b.type === 'bar') || q.role === 'boss' || (q.role === 'patron' && s.b.type === 'bar' && Math.random() < .35);
    if (tough) { q.ejector = 1; q.still = 0; q.sit = 0; q.roam = 0; ej++; if (Math.random() < .7) pedSay(q, pick(['That\'s it, you\'re OUT!', 'Not in here, pal!', 'Take it outside!', 'Get out of my place!'])); }
    else if (q.role !== 'prisoner' && !q.gang) { q.leaving = 1; q.still = 0; q.sit = 0; q.lie = 0; q.dance = 0; q.state = 'goto'; q.goal = [door.x + rnd(-14, 14), door.y - 8]; q.after = 'idle'; q.goSpd = 150; if (Math.random() < .3) Snd.voice('scream', q.vp, q.x, q.y, .7); } }
  if (!ej) { const c = s.peds.find(q => !q.dead && (q.shop || q.role === 'clerk')); if (c) pedSay(c, 'Get out! I\'m calling the cops!'); s.trouble.call = G.t + 6; }
}
function troubleTick(s, dt) { const p = G.player, tr = s.trouble, door = s.door;
  for (let i = s.peds.length - 1; i >= 0; i--) { const q = s.peds[i]; if (q.dead) continue;
    if (q.leaving) { if (dist(q.x, q.y, door.x, door.y) < 30) { s.peds.splice(i, 1); continue; } if (q.state !== 'goto') { q.state = 'goto'; q.goal = [door.x, door.y - 8]; q.goSpd = 150; } continue; }
    if (!q.ejector || q.state === 'fight' || q.state === 'flee' || p.dead) continue;
    const d = dist(q.x, q.y, p.x, p.y); q.state = 'goto'; q.goal = [p.x, p.y]; q.after = 'goto'; q.goSpd = 165; q.a = Math.atan2(p.y - q.y, p.x - q.x);
    if (d < 30 && G.t > (q.shoveT || 0)) { q.shoveT = G.t + .7; const dx = door.x - p.x, dy = door.y - p.y, dl = Math.hypot(dx, dy) || 1; p.kx += dx / dl * 360; p.ky += dy / dl * 360; hurtPlayer(3, q, 'punch'); Snd.play('punch', p.x, p.y); if (Math.random() < .4) pedSay(q, pick(['Out!', 'Keep walking!', 'Move it!', 'Don\'t come back!'])); } }
  if (tr.call && G.t > tr.call) { tr.call = 0; crime(.6, 'Disturbance'); }
  if (!p.dead && dist(p.x, p.y, door.x, door.y) < 46 && s.peds.some(q => q.ejector && !q.dead)) throwOut(s);
  if (G.t - tr.t > 40 && !s.peds.some(q => q.ejector && !q.dead && q.state !== 'idle')) { s.trouble = null; }
}
function throwOut(s) { const b = s.b; s.trouble = null; s.lifeSet = 0; b.banUntil = G.t + 90; exitBuilding(); s.peds = null; const p = G.player; if (b.door) { const [fx, fy] = FACEV[b.door.f]; p.kx = fx * 420; p.ky = fy * 420; } Snd.play('thud', p.x, p.y); G.big = { text: 'THROWN OUT', col: '#ff7043', t: 2.2, small: 1, sub: 'Not welcome at ' + b.name + ' for a while' }; }
const hurtIn0 = Ped.prototype.hurt;
Ped.prototype.hurt = function (n, by, kind) { const was = this.dead; hurtIn0.call(this, n, by, kind); if (by === G.player && G.scene && this.inside) troubleStart(G.scene); };
function playerFire(aimA, charge) { const r = playerFire0(aimA, charge); const w = pw(G.player.weapon); if (G.scene && G.player.weapon > 0 && !w.melee && !G.player.swim) troubleStart(G.scene); return r; }
function enterBuildingY(b) { if (b.banUntil && G.t < b.banUntil && !owned(b)) { toast(`${b.name} won't let you back in yet (${Math.ceil(b.banUntil - G.t)}s)`); G.doorCD = G.t + 2; return; } return enterBuildingZ(b); }
