// ================= PERFORMANCE: 60 fps cap, automatic resolution, cached room backgrounds =================
// 1) phones with 90/120 Hz screens would otherwise run the whole game twice as often
let PF = { last: 0, acc: 0, n: 0, slowT: 0, fastT: 0, at: 0 };
function frame(t) { if (t - PF.last < 15.2) { requestAnimationFrame(frame); return; } const d = PF.last ? t - PF.last : 16.7; PF.last = t; perfAdapt(d); frame0(t); }
// 2) automatic resolution: step the render scale down when frames run long, back up when there's headroom
function perfAdapt(d) { if (d > 200) return; PF.acc += d; PF.n++; if (PF.n < 45) return; const avg = PF.acc / PF.n; PF.acc = 0; PF.n = 0;
  const cap = Math.min(window.devicePixelRatio || 1, G.settings.quality === 'high' ? 2 : 1.25), cur = G.autoDpr || cap, now = performance.now();
  if (avg > 21 && cur > 1 && now - PF.at > 1500) { G.autoDpr = Math.max(1, cur - .25); PF.at = now; resize(); }
  else if (avg < 17.6 && cur < cap) { PF.fastT++; if (PF.fastT >= 4 && now - PF.at > 6000) { G.autoDpr = Math.min(cap, cur + .25); PF.at = now; PF.fastT = 0; resize(); } } else PF.fastT = 0; }
// 3) rooms: floor, shading, walls and windows are painted once into an image (refreshed now and then for daylight)
function drawInteriorStatic(s) { const night = darkness() > .5;
  if (!s.cache || s.cacheFloor !== s.floor || G.t - s.cacheT > 25 || s.cacheNight !== night) { const k = Math.min(1.5, DPR), W2 = s.w * T, H2 = s.h * T;
    if (!s.cache) s.cache = mkCanvas(Math.ceil(W2 * k), Math.ceil(H2 * k)); const g0 = ctx, cg = s.cache.getContext('2d'); cg.setTransform(k, 0, 0, k, 0, 0); cg.clearRect(0, 0, W2, H2);
    ctx = cg; try { drawFloorTiles(s); drawFloorDetail(s); drawInteriorWalls(s, true); } finally { ctx = g0; } s.cacheT = G.t; s.cacheFloor = s.floor; s.cacheNight = night; }
  const sm = ctx.imageSmoothingEnabled; ctx.imageSmoothingEnabled = true; ctx.drawImage(s.cache, 0, 0, s.w * T, s.h * T); ctx.imageSmoothingEnabled = sm;
  if (theme(s).pat === 'neon') for (let x = 1; x < s.w - 1; x++) { const hue = (G.t * 30 + x * 20) % 360, fy = T * .3, fh = T * .7; ctx.fillStyle = `hsla(${hue},100%,60%,.85)`; ctx.fillRect(x * T, fy + fh * .35, T + .5, 2.5); ctx.fillStyle = `hsla(${hue},100%,60%,.15)`; ctx.fillRect(x * T, fy + fh * .2, T + .5, fh * .3); } }
function drawFloorTiles(s) { const fc = FLOORS[s.floor] || FLOORS.wood;
  for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) { if (s.solid[y * s.w + x]) continue;
    if (s.floor === 'wood') { ctx.fillStyle = fc[(y) % 2]; ctx.fillRect(x * T, y * T, T + .5, T + .5); ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(x * T, y * T + T / 2, T, 1.5); ctx.fillRect(x * T + ((x + y) % 2 ? T / 3 : 2 * T / 3), y * T, 1.5, T / 2); }
    else { ctx.fillStyle = fc[(x + y) % 2]; ctx.fillRect(x * T, y * T, T + .5, T + .5); if (s.floor === 'tile' || s.floor === 'marble') { ctx.fillStyle = 'rgba(0,0,0,.08)'; ctx.fillRect(x * T, y * T, T, 1.5); ctx.fillRect(x * T, y * T, 1.5, T); } } } }
