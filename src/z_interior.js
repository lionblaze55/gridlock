// ================= INTERIORS II: right-sized furniture and lived-in rooms =================
const FURN_K = .74;
const SHRINK = new Set(['bed', 'drawer', 'sofa', 'tv', 'fridge', 'stove', 'table', 'chair', 'toilet', 'books', 'plant', 'wardrobe', 'stash', 'stool', 'booth', 'jukebox', 'arcade', 'piano', 'pool', 'gurney', 'cabinet', 'desk', 'computer', 'cooler', 'safe', 'crate', 'forklift', 'vend', 'atm', 'case', 'pshelf', 'target', 'wbench', 'register', 'change', 'lockers', 'vip', 'shelf', 'rug',
  'kingbed', 'bunk', 'lamp', 'aquarium', 'fireplace', 'hottub', 'gym', 'pingpong', 'records', 'guitar', 'trophy', 'safebox', 'beanbag', 'dining', 'cattree', 'telescope', 'xmastree']);
// new clutter: [solid, action label, w, h]
const CLUT = {
  nstand: [1, 'Search nightstand', .42, .42], kcounter: [1, 0, 2, .55], sink: [1, 'Wash up', .55, .42], tub: [1, 'Take a bath', 1.05, .55], ctable: [1, 0, .9, .45], armchair: [1, 'Sit down', .6, .6],
  bin: [1, 'Search trash', .3, .3], box: [1, 'Search box', .45, .45], clock: [0, 0, .34, .12], coat: [1, 0, .32, .32], shoes: [0, 0, .5, .22], laundry: [1, 0, .4, .4], wshelf: [1, 0, 1, .22],
  filing: [1, 'Search files', .5, .42], printer: [1, 0, .55, .38], wboard: [0, 'Read the whiteboard', 1.6, .14], ivstand: [1, 0, .28, .28], bench2: [1, 'Sit down', 1.4, .4], stanch: [1, 0, 2.4, .14],
  keg: [1, 'Pour a beer  $5', .42, .42], pallet: [1, 0, .95, .95], barrel2: [1, 0, .48, .48], hayb: [1, 0, .9, .55], claw: [1, 'Claw machine  $2', .85, .85], magrack: [1, 'Read a magazine', .7, .32],
  display: [1, 0, .9, .55], basket: [0, 0, .42, .32], icechest: [1, 'Grab ice  $2', .8, .48], poster: [0, 0, .9, .1], console: [0, 'Play video games', .5, .28], hightable: [1, 0, .5, .5], pwall: [1, 0, 1, .16],
  boxes: [1, 'Search boxes', .8, .6], dresser: [1, 'Search dresser', .95, .45], micro: [1, 'Microwave a snack', .45, .3], mirror: [0, 0, .5, .1], chest: [1, 'Open chest', .7, .42],
};
for (const k in CLUT) IT[k] = { s: CLUT[k][0], act: CLUT[k][1] || undefined };
// shrink, keeping whichever side touched a wall against it
function shrinkItems(s) { for (const it of s.items) { if (!SHRINK.has(it.t) || it.small) continue; it.small = 1; const nw = Math.max(.32, it.w * FURN_K), nh = Math.max(.24, it.h * FURN_K);
  const top = it.y < .95, bot = it.y + it.h > s.h - 1.05, left = it.x < .95, right = it.x + it.w > s.w - 1.05;
  it.x = left ? it.x + it.w - nw : right ? it.x : it.x + (it.w - nw) / 2; it.y = top ? it.y + it.h - nh : bot ? it.y : it.y + (it.h - nh) / 2; it.w = nw; it.h = nh; } }
function makeInterior(b) { const s = makeInterior0(b); shrinkItems(s); furnish(s, b); return s; }
// the decor catalogue and already-placed decor move to the new sizes (saved decor is migrated once)
for (const d of DECOR) if (SHRINK.has(d[0])) { d[2] = Math.round(d[2] * FURN_K * 100) / 100; d[3] = Math.round(d[3] * FURN_K * 100) / 100; }
function applyDecor(s) { const D = LIFE().decor[s.b.id]; if (D && !D.k2) { D.k2 = 1; for (const it of D.items) if (SHRINK.has(it.t)) { const nw = it.w * FURN_K, nh = it.h * FURN_K; it.x += (it.w - nw) / 2; it.y += (it.h - nh) / 2; it.w = nw; it.h = nh; } } applyDecor0(s); for (const it of s.items) if (it.deco) it.small = 1; }
function furnish(s, b) {
  const r = mulberry32(b.id * 3301 + 7), R = (a, c) => a + r() * (c - a), W2 = s.w, H2 = s.h, dx = Math.floor(W2 / 2) + .5;
  const WALLM = new Set(['poster', 'painting', 'clock', 'mirror', 'wboard', 'neon', 'dartboard']), SEAT = new Set(['chair', 'stool']);
  const sol = k => CLUT[k] ? !!CLUT[k][0] : IT[k] ? !!IT[k].s : true;
  const free = (x, y, w, h) => { const t = t0, wm = WALLM.has(t), seat = SEAT.has(t); if (x < (wm ? .15 : .3) || y < (wm ? .1 : .3) || x + w > W2 - .2 || y + h > H2 - .3) return false; if (!wm && Math.abs(x + w / 2 - dx) < .8 + w / 2 && y + h > H2 - 2.1) return false;
    const m = seat ? -.12 : wm ? 0 : .1; for (const it of s.items) { if (!(x < it.x + it.w + m && x + w + m > it.x && y < it.y + it.h + m && y + h + m > it.y)) continue; if (wm) { if (WALLM.has(it.t) || it.y < .9) return false; continue; } if (seat && ['table', 'desk', 'hightable', 'bar', 'counter', 'dining'].includes(it.t)) continue; if (sol(t) || sol(it.t)) return false; }
    if (!seat && !wm) for (const n of s.npcDefs) if (n.x > x - .3 && n.x < x + w + .3 && n.y > y - .3 && n.y < y + h + .3) return false; return true; };
  let t0 = '';
  const put = (t, x, y, ex) => { t0 = t; const c = CLUT[t] || [1, 0, .5, .5], w = ex && ex.w || c[2], h = ex && ex.h || c[3]; if (!free(x, y, w, h)) { (s.failed || (s.failed = [])).push(t + '@' + x.toFixed(1) + ',' + y.toFixed(1)); return null; } const it = Object.assign({ t, x, y, w, h, used: 0, small: 1 }, ex || {}); it.w = w; it.h = h; s.items.push(it); return it; };
  const wallT = (t, x, ex) => { const h = (ex && ex.h) || (CLUT[t] || [0, 0, .5, .5])[3]; return put(t, x, 1 - h * .55, ex); };
  const wallL = (t, y, ex) => { const w = (ex && ex.w) || (CLUT[t] || [0, 0, .5, .5])[2]; return put(t, 1 - w * .55, y, ex); };
  const wallR = (t, y, ex) => { const w = (ex && ex.w) || (CLUT[t] || [0, 0, .5, .5])[2]; return put(t, W2 - 1 - w * .45, y, ex); };
  const wallB = (t, x, ex) => { const h = (ex && ex.h) || (CLUT[t] || [0, 0, .5, .5])[3]; return put(t, x, H2 - 1 - h * .45, ex); };
  const scatter = (list, n) => { for (let i = 0; i < n * 6 && n > 0; i++) { const t = list[Math.floor(r() * list.length)], side = Math.floor(r() * 4), c = CLUT[t] || [1, 0, .5, .5]; const ok = side === 0 ? wallT(t, R(1, W2 - 2)) : side === 1 ? wallL(t, R(1.2, H2 - 2)) : side === 2 ? wallR(t, R(1.2, H2 - 2)) : wallB(t, R(1, W2 - 2)); if (ok) n--; } };
  const deco = (t, x, y, w, h) => { t0 = t; if (!free(x, y, w, h)) return null; const it = { t, x, y, w, h, used: 0, small: 1 }; s.items.push(it); return it; };
  switch (b.type) {
    case 'home': case 'safehouse': {
      const sh = b.type === 'safehouse', A = (tt, x, y, w, h, ex) => s.items.push(Object.assign({ t: tt, x, y, w, h, used: 0, small: 1 }, ex || {}));
      s.items = []; s.npcDefs = s.npcDefs.filter(n => !(n.x > 8.3 && n.y > 5.7));
      // bedroom
      A('rug', 1.15, 2.25, 1.7, .95); A('bed', 1.05, .75, .95, 1.35); A('nstand', 2.12, .66, .42, .42); A('lamp', 2.16, .7, .34, .34); A('dresser', 3.0, .55, .95, .45); A('mirror', 3.22, .2, .5, .1); A('drawer', .62, 3.05, .45, .9, { v: 1 });
      if (sh) A('wardrobe', 4.0, .5, 1.2, .52); else A('laundry', 4.45, .62, .4, .4); A('painting', 1.15, .16, .8, .12);
      // desk corner
      A('desk', 5.35, .55, 1.15, .55); A('computer', 5.6, .55, .6, .38); A('chair', 5.72, 1.22, .38, .38); A('plant', 6.62, .62, .42, .42);
      // kitchen
      A('kcounter', 7.15, .55, 1.75, .5); A('sink', 7.3, .58, .55, .42); A('micro', 8.3, .6, .45, .3); A('stove', 8.95, .5, .74, .55); A('fridge', 9.75, .38, .74, .62); A('bin', 10.62, 1.3, .3, .3); A('clock', 9.0, .14, .34, .12);
      A('table', 8.55, 2.3, 1.05, .9); A('chair', 8.12, 2.55, .38, .38); A('chair', 9.67, 2.55, .38, .38); A('chair', 8.88, 3.27, .38, .38); A('plant', 10.55, 3.6, .42, .42);
      // living room
      A('rug', 1.75, 4.65, 2.5, 1.75); A('books', .62, 4.0, .37, 1.48, { v: 1 }); A('tv', 2.45, 4.0, .95, .3); A('console', 2.68, 4.42, .5, .28); A('ctable', 2.47, 5.35, .9, .45); A('sofa', 1.95, 6.62, 1.95, .6); A('armchair', 4.35, 5.2, .6, .6); A('lamp', 1.12, 6.75, .34, .34); A('plant', 4.55, 7.25, .42, .42); A('poster', 4.2, 3.92, .9, .1);
      A('coat', 5.15, 7.55, .32, .32); A('shoes', 7.45, 7.72, .5, .22); A('wshelf', 6.9, 3.95, 1, .22);
      // bathroom behind a partition with a doorway
      const bx = 8.35, by = 5.75; A('pwall', bx, by, .85, .16); A('pwall', bx + 1.7, by, 11.1 - bx - 1.7, .16); A('pwall', bx, by, .16, 8.05 - by);
      A('tub', bx + .3, 7.38, 1.05, .55); A('toilet', 10.42, 7.38, .52, .52); A('sink', 10.4, 6.05, .55, .42); A('mirror', 10.42, 5.93, .5, .1); A('bin', 9.65, 7.6, .3, .3);
      if (sh) { A('stash', 4.05, 2.95, .74, .59); A('boxes', 3.15, 2.95, .7, .5); }
      break; }
    case 'store': for (const x of [5.85, 8.35]) put('display', x, 6.3); wallR('icechest', 4.5); put('magrack', 1.2, 4.6); put('basket', 3.3, 7.6); put('bin', 3.9, 7.6); wallT('poster', 3.2); put('boxes', 10.3, 5.6); scatter(['box', 'boxes', 'plant'], 2); break;
    case 'bar': for (const [x, y] of [[8.2, 6.4], [9.9, 6.4], [2.4, 4.3], [4.6, 4.3]]) { put('hightable', x, y); put('stool', x - .45, y + .1, { w: .4, h: .4 }); put('stool', x + .6, y + .1, { w: .4, h: .4 }); }
      put('dartboard', 11.1, 3.6, { w: .2, h: .55 }); put('neon', 4.2, .22, { w: 1.2, h: .14 }); for (let i = 0; i < 3; i++) put('keg', 7.2 + i * .5, .55); put('boxes', 1.2, 5.2); put('coat', dx - 1.5, H2 - 1.5); put('poster', 9.4, .2); scatter(['bin', 'barrel2', 'plant'], 2); break;
    case 'diner': put('display', 4.6, .5, { w: .9, h: .5 }); put('plant', 8.6, 7.4, { w: .45, h: .45 }); put('bin', 5.6, 7.5); put('magrack', 1.2, 7.9); put('poster', 5.6, .2); put('clock', 8.2, .25); put('hightable', 6.1, 4.2); scatter(['plant', 'bin', 'box'], 2); break;
    case 'office': put('sofa', 1.1, 8.45, { w: 1.7, h: .55 }); put('ctable', 1.5, 7.65); put('plant', 3.0, 8.5, { w: .42, h: .42 }); for (let rr = 0; rr < 2; rr++) for (let c = 0; c < 3; c++) put('chair', 2.3 + c * 4, 3.2 + rr * 3.5, { w: .38, h: .38 }); wallT('filing', 4.6); wallT('filing', 5.2); wallT('printer', 8.4); wallT('wboard', 10.2); put('bin', 3.9, 2.2); put('bin', 7.9, 5.7); put('plant', 12.7, 7.2, { w: .45, h: .45 }); put('boxes', 1.1, 8.3); put('clock', 7, .25); scatter(['filing', 'plant', 'box', 'bin'], 3); break;
    case 'hospital': for (let x = 1.2; x < 12; x += 2.5) put('ivstand', x + 1.05, .9); for (const x of [3.5, 4.3, 10, 10.8, 11.6]) put('chair', x, 7.2, { w: .42, h: .42 }); put('ctable', 5, 7.95); put('magrack', 7.4, 8.55); put('bin', 9, 5.2); put('poster', 6.3, .2); put('cabinet', 12.6, 6.1, { w: .5, h: .9 }); scatter(['plant', 'bin', 'box'], 2); break;
    case 'police': put('desk', 2.2, 7.1, { w: 1.3, h: .65 }); put('chair', 2.6, 7.8, { w: .38, h: .38 }); put('desk', 10.3, 7.1, { w: 1.3, h: .65 }); put('chair', 10.7, 7.8, { w: .38, h: .38 }); wallT('filing', 8.3); wallT('filing', 8.9); wallT('wboard', 3.4); put('bench2', 5.3, 8.3); put('bin', 9.9, 5.2); put('poster', 10.4, .2); scatter(['boxes', 'filing', 'plant'], 2); break;
    case 'bank': put('stanch', 5.8, 4.4); put('stanch', 5.8, 5.3); put('bench2', 1.2, 8.3); put('bench2', 11.3, 8.3); put('desk', 1.3, 5.6, { w: 1.3, h: .65 }); put('chair', 1.7, 6.35, { w: .38, h: .38 }); put('desk', 11.3, 5.6, { w: 1.3, h: .65 }); put('clock', 7, .25); put('poster', 3, .2); put('poster', 10, .2); break;
    case 'gunshop': wallL('poster', 3.5, { w: .1, h: .9 }); put('boxes', 10.4, 3.5); put('box', 11, 4.4); put('barrel2', 1.1, 8.3); put('display', 5.4, 7.6); put('bin', 3.1, 3.6); scatter(['box', 'boxes'], 2); break;
    case 'pawn': for (const [x, y] of [[10.6, 3.4], [10.6, 4.2], [1.1, 7.6]]) put('boxes', x, y); put('display', 5.6, 3.5); put('guitar', 11, 6.7, { w: .3, h: .7 }); put('trophy', 9.7, .55, { w: .34, h: .34 }); put('bin', 4.6, 7.9); scatter(['box', 'chest', 'records'], 3); break;
    case 'barn': case 'warehouse': if (b.type === 'barn') { for (let i = 0; i < 4; i++) put('hayb', 1.2 + i * 1.05, 8.2); put('chest', 12.2, 1.2); } for (let i = 0; i < 6; i++) { const t = r() < .5 ? 'pallet' : r() < .5 ? 'barrel2' : 'boxes'; put(t, R(1.2, 12), R(1.2, 7.5)); } wallT('wshelf', 3); wallT('wshelf', 8); scatter(['barrel2', 'box', 'boxes'], 3); break;
    case 'arcade': put('claw', 11, 2.3); put('claw', 11, 3.4); put('bench2', 4.2, 2.8); put('vend', 11.1, 4.6, { w: .65, h: .6 }); put('bin', 5.9, 7.7); put('poster', 2, .2); put('poster', 6, .2); for (let x = 1.4; x < 10; x += 1.8) put('arcade', x, 7.3, { w: .74, h: .66 }); break;
    case 'club': case 'strip': for (const [x, y] of [[1.9, 1.2], [2.2, 8.2], [10.6, 8.2]]) put('hightable', x, y); put('speaker2', 3.4, .45, { w: .6, h: .6 }); put('speaker2', 10, .45, { w: .6, h: .6 }); put('plant', 13.1, 6.8, { w: .45, h: .45 }); put('coat', 3.8, 8.5); scatter(['bin', 'plant'], 1); break;
  }
}
CLUT.speaker2 = [1, 0, .6, .6]; IT.speaker2 = { s: 1 };
// draw
function drawClutter(g, it, x, y, w, h) {
  const sh = () => { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + 2, y + 3, w, h); }, bx = (c, c2) => { sh(); g.fillStyle = c; g.fillRect(x, y, w, h); if (c2) { g.fillStyle = c2; g.fillRect(x + 2, y + 2, w - 4, h - 4); } }, circ = (cx, cy, r2, c) => { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r2, 0, TAU); g.fill(); };
  switch (it.t) {
    case 'pwall': g.fillStyle = '#3a3a4a'; g.fillRect(x, y, w, h); g.fillStyle = '#5a5a6e'; g.fillRect(x, y, w, Math.min(h, 4)); break;
    case 'nstand': bx('#6d4c41', '#8d6e63'); g.fillStyle = '#4e342e'; g.fillRect(x + w * .3, y + h * .55, w * .4, 2); break;
    case 'dresser': bx('#5d4037', '#795548'); g.fillStyle = '#3e2723'; for (let i = 1; i < 3; i++) g.fillRect(x + w * i / 3, y + 3, 1.5, h - 6); g.fillStyle = '#d7ccc8'; for (let i = 0; i < 3; i++) g.fillRect(x + w * (i + .5) / 3 - 2, y + h * .6, 4, 2); break;
    case 'kcounter': bx('#8d6e63', '#cfd8dc'); g.fillStyle = 'rgba(0,0,0,.1)'; for (let i = 1; i < 4; i++) g.fillRect(x + w * i / 4, y + 2, 1, h - 4); break;
    case 'micro': bx('#424242', '#212121'); g.fillStyle = '#80cbc4'; g.fillRect(x + 3, y + 3, w * .6, h - 6); g.fillStyle = '#9e9e9e'; g.fillRect(x + w - 7, y + 4, 4, 2); break;
    case 'sink': bx('#eceff1'); g.fillStyle = '#b0bec5'; g.beginPath(); g.ellipse(x + w / 2, y + h * .55, w * .32, h * .3, 0, 0, TAU); g.fill(); g.fillStyle = '#78909c'; g.fillRect(x + w / 2 - 1.5, y + 2, 3, 6); break;
    case 'tub': bx('#eceff1'); g.fillStyle = '#90caf9'; g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w * .42, h * .32, 0, 0, TAU); g.fill(); g.fillStyle = '#78909c'; g.fillRect(x + 3, y + h / 2 - 2, 4, 4); break;
    case 'mirror': g.fillStyle = '#b3e5fc'; g.fillRect(x, y, w, Math.max(4, h)); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x + 3, y + 1, 5, 2); break;
    case 'ctable': bx('#5d4037', '#6d4c41'); g.fillStyle = '#ffcc80'; g.fillRect(x + w * .2, y + h * .3, 6, 4); circ(x + w * .7, y + h * .5, 3, '#e0e0e0'); break;
    case 'armchair': sh(); g.fillStyle = '#5c6bc0'; g.fillRect(x, y, w, h); g.fillStyle = '#7986cb'; g.fillRect(x + 4, y + 6, w - 8, h - 9); g.fillStyle = '#3f51b5'; g.fillRect(x, y, w, 6); break;
    case 'bin': circ(x + w / 2 + 2, y + h / 2 + 2, w / 2, 'rgba(0,0,0,.25)'); circ(x + w / 2, y + h / 2, w / 2, '#607d8b'); circ(x + w / 2, y + h / 2, w / 2 - 3, '#37474f'); break;
    case 'box': bx('#c8a26b', '#d7b47e'); g.fillStyle = '#a1887f'; g.fillRect(x + w / 2 - 2, y, 4, h); break;
    case 'boxes': sh(); g.fillStyle = '#c8a26b'; g.fillRect(x, y + h * .3, w * .55, h * .7); g.fillStyle = '#b8935c'; g.fillRect(x + w * .45, y, w * .55, h * .6); g.fillStyle = '#d7b47e'; g.fillRect(x + w * .1, y + h * .05, w * .4, h * .4); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + w * .45, y + h * .3, 2, h * .7); break;
    case 'clock': circ(x + w / 2, y + 5, 8, '#fafafa'); g.strokeStyle = '#333'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x + w / 2, y + 5); g.lineTo(x + w / 2 + Math.cos(G.t * .05) * 6, y + 5 + Math.sin(G.t * .05) * 6); g.moveTo(x + w / 2, y + 5); g.lineTo(x + w / 2, y); g.stroke(); break;
    case 'coat': circ(x + w / 2 + 2, y + h / 2 + 2, w / 2, 'rgba(0,0,0,.25)'); circ(x + w / 2, y + h / 2, w / 2, '#5d4037'); circ(x + w * .3, y + h * .4, 5, '#1565c0'); circ(x + w * .7, y + h * .6, 5, '#795548'); break;
    case 'shoes': g.fillStyle = '#8d6e63'; g.fillRect(x, y, w, h); for (let i = 0; i < 3; i++) { g.fillStyle = ['#212121', '#e53935', '#fafafa'][i]; g.fillRect(x + 3 + i * w / 3.2, y + 3, w / 5, h - 6); } break;
    case 'laundry': circ(x + w / 2, y + h / 2, w / 2, '#bcaaa4'); circ(x + w * .4, y + h * .45, w * .2, '#42a5f5'); circ(x + w * .62, y + h * .55, w * .18, '#ef5350'); break;
    case 'wshelf': bx('#6d4c41'); { const n = Math.max(2, Math.floor(Math.max(w, h) / 9)); for (let i = 0; i < n; i++) { g.fillStyle = ['#c62828', '#1565c0', '#2e7d32', '#f9a825', '#6a1b9a'][i % 5]; if (w > h) g.fillRect(x + 2 + i * (w - 4) / n, y + 2, (w - 4) / n - 2, h - 4); else g.fillRect(x + 2, y + 2 + i * (h - 4) / n, w - 4, (h - 4) / n - 2); } } break;
    case 'filing': bx('#78909c', '#90a4ae'); g.fillStyle = '#546e7a'; g.fillRect(x + 3, y + h / 2 - 1, w - 6, 2); g.fillRect(x + w / 2 - 3, y + h * .25, 6, 2); break;
    case 'printer': bx('#eceff1', '#cfd8dc'); g.fillStyle = '#fafafa'; g.fillRect(x + w * .2, y - 3, w * .6, 6); g.fillStyle = '#4caf50'; g.fillRect(x + w - 6, y + h - 5, 3, 3); break;
    case 'wboard': g.fillStyle = '#9e9e9e'; g.fillRect(x, y, w, Math.max(6, h)); g.fillStyle = '#fafafa'; g.fillRect(x + 2, y + 1, w - 4, Math.max(4, h - 2)); g.strokeStyle = '#1e88e5'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 8, y + 3); g.lineTo(x + w * .4, y + 4); g.moveTo(x + w * .5, y + 3); g.lineTo(x + w * .8, y + 5); g.stroke(); break;
    case 'ivstand': circ(x + w / 2, y + h / 2, 3, '#9e9e9e'); g.fillStyle = '#e3f2fd'; g.fillRect(x + w / 2 - 5, y - 4, 10, 8); g.strokeStyle = '#bdbdbd'; g.lineWidth = 1; g.strokeRect(x + w / 2 - 5, y - 4, 10, 8); break;
    case 'bench2': bx('#8d6e63'); g.fillStyle = '#6d4c41'; for (let i = 1; i < 4; i++) g.fillRect(x + w * i / 4, y, 1.5, h); break;
    case 'stanch': g.strokeStyle = '#b71c1c'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 4, y + h / 2); g.quadraticCurveTo(x + w / 4, y + h / 2 + 5, x + w / 2, y + h / 2); g.quadraticCurveTo(x + w * .75, y + h / 2 + 5, x + w - 4, y + h / 2); g.stroke(); for (const px of [x + 4, x + w / 2, x + w - 4]) circ(px, y + h / 2, 4, '#d4af37'); break;
    case 'keg': circ(x + w / 2 + 2, y + h / 2 + 2, w / 2, 'rgba(0,0,0,.25)'); circ(x + w / 2, y + h / 2, w / 2, '#9e9e9e'); circ(x + w / 2, y + h / 2, w / 2 - 4, '#bdbdbd'); circ(x + w / 2, y + h / 2, 3, '#424242'); break;
    case 'pallet': sh(); g.fillStyle = '#a1887f'; for (let i = 0; i < 5; i++) g.fillRect(x, y + i * h / 5, w, h / 5 - 2); if ((it.x * 7 | 0) % 2) { g.fillStyle = '#c8a26b'; g.fillRect(x + 4, y + 4, w - 8, h - 8); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(x + w / 2, y + 4, 2, h - 8); } break;
    case 'barrel2': circ(x + w / 2 + 2, y + h / 2 + 2, w / 2, 'rgba(0,0,0,.25)'); circ(x + w / 2, y + h / 2, w / 2, (it.x * 3 | 0) % 2 ? '#1565c0' : '#c62828'); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 2; g.beginPath(); g.arc(x + w / 2, y + h / 2, w / 2 - 5, 0, TAU); g.stroke(); break;
    case 'hayb': sh(); g.fillStyle = '#e0c068'; g.fillRect(x, y, w, h); g.fillStyle = '#c9a74a'; for (let i = 0; i < 6; i++) g.fillRect(x + 2, y + 3 + i * (h - 6) / 6, w - 4, 1.2); g.fillStyle = '#8d6e63'; g.fillRect(x + w * .3, y, 2, h); g.fillRect(x + w * .7, y, 2, h); break;
    case 'claw': bx('#e91e63'); g.fillStyle = 'rgba(200,240,255,.5)'; g.fillRect(x + 4, y + 4, w - 8, h * .6); for (let i = 0; i < 5; i++) circ(x + 9 + i * (w - 18) / 4, y + h * .55, 4, ['#ffeb3b', '#4caf50', '#03a9f4', '#ff9800', '#9c27b0'][i]); g.fillStyle = '#fafafa'; g.fillRect(x + w / 2 - 1, y + 4, 2, 10 + Math.sin(G.t * 2) * 4); break;
    case 'magrack': bx('#5d4037'); for (let i = 0; i < 4; i++) { g.fillStyle = ['#e53935', '#fdd835', '#1e88e5', '#43a047'][i]; g.fillRect(x + 3 + i * (w - 6) / 4, y + 3, (w - 6) / 4 - 2, h - 6); } break;
    case 'display': bx('#90a4ae', '#cfd8dc'); for (let i = 0; i < 8; i++) { g.fillStyle = ['#ef5350', '#ffca28', '#66bb6a', '#42a5f5', '#ab47bc', '#ff7043', '#26c6da', '#d4e157'][i]; g.fillRect(x + 4 + (i % 4) * (w - 8) / 4, y + 4 + Math.floor(i / 4) * (h - 8) / 2, (w - 8) / 4 - 2, (h - 8) / 2 - 2); } break;
    case 'basket': g.fillStyle = '#e53935'; g.fillRect(x, y, w, h); g.fillStyle = '#b71c1c'; for (let i = 1; i < 4; i++) g.fillRect(x + w * i / 4, y, 1, h); break;
    case 'icechest': bx('#e3f2fd', '#bbdefb'); g.fillStyle = '#1e88e5'; g.font = 'bold 9px sans-serif'; g.textAlign = 'center'; g.fillText('ICE', x + w / 2, y + h / 2 + 3); break;
    case 'poster': { const c = ['#e53935', '#1e88e5', '#8e24aa', '#fb8c00'][(it.x * 5 | 0) % 4]; const vert = h > w; g.fillStyle = c; g.fillRect(x, y, vert ? 6 : w, vert ? h : 6); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 2, y + 1, vert ? 2 : w * .5, vert ? h * .5 : 2); break; }
    case 'console': g.fillStyle = '#212121'; g.fillRect(x, y, w, h); g.fillStyle = '#4caf50'; g.fillRect(x + 3, y + 3, 3, 3); circ(x + w + 6, y + h + 4, 4, '#424242'); break;
    case 'hightable': circ(x + w / 2 + 2, y + h / 2 + 2, w / 2, 'rgba(0,0,0,.25)'); circ(x + w / 2, y + h / 2, w / 2, '#37474f'); circ(x + w / 2, y + h / 2, w / 2 - 3, '#546e7a'); circ(x + w * .35, y + h * .4, 3, '#ffca28'); break;
    case 'chest': bx('#6d4c41', '#8d6e63'); g.fillStyle = '#d4af37'; g.fillRect(x, y + h * .4, w, 2); g.fillRect(x + w / 2 - 3, y + h * .35, 6, 6); break;
    case 'speaker2': bx('#111'); circ(x + w / 2, y + h * .6, w * .28 * (1 + Math.max(0, Math.sin(G.t * 12)) * .12), '#424242'); circ(x + w / 2, y + h * .22, w * .12, '#424242'); break;
    default: bx('#777');
  }
}
// interactions for the new clutter
const SEARCHLOOT = ['cash', 'cash', 'watch', 'ring', 'phone', 'pills', 'cash'];
function clutterUse(it) {
  if (!CLUT[it.t]) return false; const p = G.player;
  switch (it.t) {
    case 'nstand': case 'dresser': case 'filing': case 'box': case 'boxes': case 'chest': case 'bin': {
      if (it.used) { toast('Nothing else in there'); return true; } it.used = 1; Snd.play('rustle');
      const own = canDecorate(); if (!own && G.scene && ['home', 'office', 'safehouse'].includes(G.scene.b.type) && G.scene.peds.some(q => !q.dead && q.role !== 'prisoner' && dist2(q.x, q.y, p.x, p.y) < 300 * 300)) crime(.5, 'Theft');
      if (Math.random() < .55) { const id = pick(SEARCHLOOT); if (id === 'cash' || !ITEMS[id]) { const n = rint(5, 60); addCash(n); toast('Found ' + money(n)); } else giveLoot(id); } else toast(pick(['Just old receipts', 'Nothing useful', 'Junk', 'Empty']));
      return true; }
    case 'sink': heal(2); Snd.play('splash'); toast('Washed up'); return true;
    case 'tub': heal(15); Snd.play('splash'); toast('Nice long soak  +15 health'); return true;
    case 'armchair': case 'bench2': toast('You take a seat for a moment'); heal(2); return true;
    case 'keg': if (pay(5)) { heal(4); G.drunk += 6; Snd.play('pour'); toast('Cold one.'); } return true;
    case 'claw': if (pay(2)) { if (Math.random() < .15) { toast('You won a plush toy!'); Snd.play('mission'); } else { toast('So close…'); Snd.play('bad'); } } return true;
    case 'magrack': toast(pick(['"10 Tips for a Faster Getaway"', '"San Varro\'s Hottest Clubs"', '"Is Your Neighbor a Gangster?"', '"Tuner Monthly: Redline Special"'])); return true;
    case 'icechest': if (pay(2)) { heal(3); toast('Brain freeze.'); } return true;
    case 'micro': if (pay(3)) { heal(10); Snd.play('beep'); toast('Ding! Microwave burrito  +10'); } return true;
    case 'console': heal(1); toast(pick(['You beat the high score.', 'Just one more level…', 'Rage quit.'])); return true;
    case 'wboard': toast(pick(['"Q3 targets: MORE"', '"Meeting moved to never"', '"Who took my yogurt??"', '"WANTED: the parking lot hit & run"'])); return true;
  }
  return false;
}
function useItemZ(it) { if (clutterUse(it)) return; return useItemH(it); }
