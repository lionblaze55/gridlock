// ================= HUD LAYOUT: one place decides where everything on screen goes =================
// Fixed things reserve their space first: the touch controls, the top-left stats and the minimap. Everything else —
// action pills (SNEAK, HACK…), info cards, prompts, toasts, messages — asks for a spot and is put where nothing else is.
// Rule for new HUD: never draw at a hard-coded screen position; use hudPill / hudPrompt / hudLine / hudBadge / hudFit.
const HUD = { res: [], pills: [], prompts: [], sc: 1, tall: false, leftY: 0, leftW: 0, msgY: 0, msgX0: 0, msgX1: 0, statL: 0, rightB: 0, star: [0, 0], clL: 0, stick: null, kbd: false };
function hudReserve(x, y, w, h, tag) { if (w > 0 && h > 0) HUD.res.push([x, y, w, h, tag || '']); }
// the free horizontal gaps across the band y0..y1
function hudGaps(y0, y1, xa, xb) { let gaps = [[xa === undefined ? 6 : xa, xb === undefined ? VW - 6 : xb]];
  for (const r of HUD.res) { if (r[1] >= y1 || r[1] + r[3] <= y0) continue; const a = r[0] - 4, b = r[0] + r[2] + 4, out = [];
    for (const g of gaps) { if (b <= g[0] || a >= g[1]) { out.push(g); continue; } if (a > g[0]) out.push([g[0], a]); if (b < g[1]) out.push([b, g[1]]); } gaps = out; }
  return gaps.filter(g => g[1] - g[0] > 8); }
// the lowest free spot for a w×h box whose bottom is at or above yBottom, as close to centred on cx as it can be
function hudFit(w, h, yBottom, cx, minY, maxShift) { cx = cx === undefined ? VW / 2 : cx; minY = minY === undefined ? VH * .28 : minY; w = Math.min(w, VW - 12); maxShift = maxShift === undefined ? VW * .22 : maxShift;
  for (let y = yBottom; y - h >= minY; y -= 4) { let best = null, bd = Infinity; for (const g of hudGaps(y - h - 3, y + 3)) { if (g[1] - g[0] < w) continue; const x = clamp(cx - w / 2, g[0], g[1] - w), d = Math.abs(x + w / 2 - cx); if (d < bd) { bd = d; best = x; } }
    if (best !== null && bd <= maxShift) return [best, y - h]; }
  if (maxShift < VW) return hudFit(w, h, yBottom, cx, Math.min(minY, VH * .16), VW); // nothing near the centre: take any clear spot
  if (HUD.res.some(r => r[4] === 'msg')) { const keep = HUD.res; HUD.res = keep.filter(r => r[4] !== 'msg'); try { return hudFit(w, h, yBottom, cx, minY, VW); } finally { HUD.res = keep; } } // out of room: messages give way
  return [clamp(cx - w / 2, 6, VW - w - 6), Math.max(minY, VH * .3)]; }
// push a marker in from the edge until it is clear of everything reserved so far
function hudNudge(x, y, r) { for (let i = 0; i < 40; i++) { if (!HUD.res.some(q => x + r > q[0] && x - r < q[0] + q[2] && y + r > q[1] && y - r < q[1] + q[3])) break; const dx = VW / 2 - x, dy = VH / 2 - y, d = Math.hypot(dx, dy) || 1; x += dx / d * 8; y += dy / d * 8; } return [x, y]; }
function hudWrap(text, maxW, maxLines) { const words = String(text).split(' '), out = []; let cur = '';
  for (const wd of words) { const t = cur ? cur + ' ' + wd : wd; if (ctx.measureText(t).width <= maxW || !cur) cur = t; else { out.push(cur); cur = wd; } } if (cur) out.push(cur);
  const trim = l => { while (l.length > 3 && ctx.measureText(l + '…').width > maxW) l = l.slice(0, -1); return l + '…'; };
  if (out.length > maxLines) { out.length = maxLines; out[maxLines - 1] = trim(out[maxLines - 1]); } for (let i = 0; i < out.length; i++) if (ctx.measureText(out[i]).width > maxW) out[i] = trim(out[i]); return out; }
// where the label above the USE button goes (kept clear of the SWAP button and the screen edge)
function hudTipRect(b, L) { ctx.font = '700 13px Rubik, sans-serif'; const tw = Math.min(ctx.measureText(b.tip).width + 14, VW - 16), ty = b.y - b.r - 16, sw = L.btns.find(q => q.id === 'wpn' && q.show);
  let hi = VW - tw / 2 - 4; if (sw && Math.abs(sw.y - ty) < sw.r + 14) hi = Math.min(hi, sw.x - sw.r - 6 - tw / 2); const tx = clamp(b.x, tw / 2 + 4, Math.max(tw / 2 + 4, hi)); return [tx - tw / 2, ty - 11, tw, 22]; }
// ---------- start of a frame: the controls take their space ----------
function hudBegin(sc) { const H = HUD; H.res = []; H.pills = []; H.prompts = []; H.sc = sc; H.tall = VH > VW * 1.15; H.kbd = !!Input.kbd; H.clL = VW; H.clT = VH; H.stick = null; H.leftW = 0;
  Input.xBtns = []; Input.surBtn = Input.bribeBtn = null; Input.miniSBtn = Input.miniZBtn = null; Net.boardBtn = null;
  if (Input.kbd) return; const L = Input.layout(), st = L.stick; H.stick = st; hudReserve(0, st.y - st.r - 4, st.x + st.r + 4, VH - (st.y - st.r - 4), 'stick');
  for (const b of L.btns) { hudReserve(b.x - b.r, b.y - b.r, b.r * 2, b.r * 2, b.id); if (b.x > VW / 2) { H.clL = Math.min(H.clL, b.x - b.r); H.clT = Math.min(H.clT, b.y - b.r - (b.id === 'act' ? 30 : 0)); }
    if (b.id === 'act') { hudReserve(Math.max(4, b.x - 66), b.y - b.r - 28, 132, 24, 'tip'); if (b.show && b.tip) { const r = hudTipRect(b, L); hudReserve(r[0], r[1], r[2], r[3], 'tip'); } } } }
// ---------- top left: small status tags that stack under the weapon box ----------
function hudBadge(t, col) { const sc = HUD.sc, x = 52 * sc + 4, y = HUD.leftY + 3 * sc, h = 16 * sc; ctx.font = `600 ${10.5 * sc}px Rubik, sans-serif`; const w = ctx.measureText(t).width + 12 * sc;
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(x, y, w, h); ctx.fillStyle = col || '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(t, x + 6 * sc, y + h / 2 + .5); HUD.leftY = y + h; HUD.leftW = Math.max(HUD.leftW, x + w); return [x, y, w, h]; }
function hudLeftExtras(sc) { const out = []; try { if (typeof drugBadges === 'function') out.push(...drugBadges()); if (typeof boozeBadge === 'function') { const b = boozeBadge(); if (b) out.push(b); } } catch (e) { }
  for (const [t, col] of out) hudBadge(t, col);
  if (Net.room) { const np = Net.peers.size + 1; const r = hudBadge(`${Net.lan ? 'LAN ' + Net.lan : 'ROOM ' + Net.code} · ${np} ${np === 1 ? 'player' : 'players'}` + (Net.connected ? '' : ' · connecting…'), '#7fdbff'); Net.boardBtn = [r[0] - 4, r[1] - 4, r[2] + 8, r[3] + 8]; }
  hudReserve(0, 0, 52 * sc + 216 * sc, 44 * sc, 'top'); HUD.leftW = Math.max(HUD.leftW, 52 * sc + 132 * sc); hudReserve(0, 44 * sc, HUD.leftW + 4, HUD.leftY - 44 * sc + 4, 'stats'); }
// ---------- top right: clock, minimap, and the wanted / threat tags (beside the minimap on wide screens, under it on tall ones) ----------
function hudReportLeft() { const p = G.player; if (!p || p.dead || !G.reports) return null; const r = G.reports.filter(r => !(r.who && r.who.dead)).sort((a, b) => a.t - b.t)[0]; return r ? Math.max(0, Math.ceil(r.t - G.t)) : null; }
function hudStatus(sc) { const H = HUD, mm = !!G.settings.minimap, R = 54 * sc * MSZ(), mL = VW - 2 * R - 12, gpsL = mL - 4 * sc - (R > 60 * sc ? 18 * sc : 0), mB = 46 * sc + 2 * R + 6;
  if (mm) hudReserve(gpsL - 2, 0, VW - gpsL + 2, mB + 2, 'mini'); else hudReserve(VW - 84 * sc, 0, 84 * sc, 40 * sc, 'clock');
  const st = stars(), rep = hudReportLeft(), dead = G.player && G.player.dead; let lines = []; try { if (!dead && typeof threatLines === 'function') lines = threatLines().slice(0, 4); } catch (e) { }
  const side = mm && !H.tall, cxm = VW - R - 12, xr = side ? gpsL - 10 : VW - 10, y0 = side ? 8 : mm ? mB + 6 : 44 * sc; let y = y0, left = xr;
  const place = w => { const x = side || !mm ? xr - w : clamp(cxm - w / 2, 6, VW - 6 - w); left = Math.min(left, x); return x; };
  const sw = 112 * sc, sh = 26 * sc, rw = 48 * sc;
  if (st > 0 || rep !== null) { const tot = (st > 0 ? sw : 0) + (rep !== null ? rw : 0) + (st > 0 && rep !== null ? 6 * sc : 0), x = place(tot);
    if (rep !== null) { const on = Math.floor(G.t * 3) % 2; ctx.fillStyle = on ? 'rgba(200,30,30,.85)' : 'rgba(0,0,0,.6)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y + 1 * sc, rw, 24 * sc, 6) : ctx.rect(x, y + 1 * sc, rw, 24 * sc); ctx.fill(); txt('☎ ' + rep, x + rw / 2, y + 14 * sc, 13 * sc, '#fff', 'center'); }
    if (st > 0) { const sx = x + tot - sw, gap = 21 * sc, x0 = sx + 14 * sc, ry = y + sh / 2; H.star = [sx + sw / 2, ry];
      ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(sx, y, sw, sh, 13 * sc) : ctx.rect(sx, y, sw, sh); ctx.fill();
      for (let i = 0; i < 5; i++) { const on = i < st, flash = on && (G.starFlash > 0 || (G.t - G.lastSeen < 1.5 && Math.floor(G.t * 5) % 2));
        drawStar(x0 + i * gap, ry, 10 * sc, on ? (flash ? '#fff' : (typeof starCol === 'function' ? starCol(i, st) : '#f2c230')) : 'rgba(255,255,255,.12)', on ? '#000' : 'rgba(255,255,255,.3)'); } }
    y += sh + 4 * sc; }
  ctx.save(); ctx.font = `700 ${10.5 * sc}px Rubik, sans-serif`; ctx.textBaseline = 'middle';
  for (const [t, c] of lines) { const w = ctx.measureText(t).width + 14 * sc, x = place(w); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, 15 * sc, 7 * sc) : ctx.rect(x, y, w, 15 * sc); ctx.fill(); ctx.fillStyle = c; ctx.textAlign = 'center'; ctx.fillText(t, x + w / 2, y + 8 * sc); y += 18 * sc; }
  ctx.restore();
  if (y > y0) hudReserve(left, y0, (side || !mm ? xr : VW - 6) - left, y - y0, 'status');
  H.statL = side ? left : mm ? VW - 10 : left; H.rightB = side ? 0 : Math.max(mm ? mB : 40 * sc, y); }
function starRow() { return HUD.star; }
// ---------- top centre: one message column for the job line, messages, multiplayer feed and anything a mode adds ----------
function hudMsgBegin(sc) { const H = HUD;
  if (H.tall) { H.msgX0 = 8; H.msgX1 = VW - 8; H.msgY = Math.max(H.leftY, H.rightB) + 8 * sc; }
  else { H.msgX0 = H.leftW + 12; H.msgX1 = H.statL - 10; H.msgY = 48 * sc; } }
function hudLine(text, col, size, bg, alpha) { const H = HUD, sc = H.sc; size = size || 14 * sc; const font = `600 ${size}px Rubik, sans-serif`, pad = 10 * sc, full = Math.max(80, H.msgX1 - H.msgX0); ctx.font = font; text = String(text);
  const lines = ctx.measureText(text).width + 2 * pad > full ? hudWrap(text, full - 2 * pad, 2) : [text]; let w = 0; for (const l of lines) w = Math.max(w, ctx.measureText(l).width); w = Math.min(w, full - 2 * pad) + 2 * pad;
  const lh = size * 1.28, h = lines.length * lh + 5 * sc, half = Math.min(VW / 2 - H.msgX0, H.msgX1 - VW / 2), cx = w <= 2 * half ? VW / 2 : (H.msgX0 + H.msgX1) / 2, x = cx - w / 2, y = H.msgY;
  ctx.globalAlpha = alpha === undefined ? 1 : clamp(alpha, 0, 1); if (bg !== null) { ctx.fillStyle = bg || 'rgba(0,0,0,.6)'; ctx.fillRect(x, y, w, h); }
  ctx.fillStyle = col || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; lines.forEach((l, i) => ctx.fillText(l, cx, y + 2.5 * sc + lh * (i + .5), w - pad)); ctx.globalAlpha = 1;
  H.msgY = y + h + 3 * sc; hudReserve(x, y, w, h, 'msg'); return [x, y, w, h]; }
function hudMessages(sc) { const H = HUD; hudMsgBegin(sc);
  if (G.mission) { const m = G.mission, line = m.hud ? m.hud() : m.title, tm = m.timer !== undefined && m.timer > 0 ? '  ' + Math.ceil(m.timer) + 's' : ''; hudLine(line + tm, '#f2c230', 14 * sc, 'rgba(0,0,0,.55)'); }
  const n = H.tall ? 3 : 2; for (const m of G.msgs.slice(-n)) hudLine(m.text, m.col, 13.5 * sc, 'rgba(0,0,0,.6)', Math.min(m.t, (4.5 - m.t) * 5));
  if (Net.room) for (const f of Net.feed.filter(f => f.t > 0).slice(-n)) hudLine(f.text, f.col, 12 * sc, 'rgba(0,0,0,.5)', f.t); }
// a big outlined title that shrinks to whatever room there is at its height
function hudTitle(s, y, size, col, minSize) { ctx.font = `${size}px Bungee, Impact, sans-serif`; let g = hudGaps(y - size * .55, y + size * .55).find(g => g[0] <= VW / 2 && g[1] >= VW / 2); const half = g ? Math.min(VW / 2 - g[0], g[1] - VW / 2) - 6 : VW * .3, tw = ctx.measureText(s).width;
  if (tw > 2 * half) size = Math.max(minSize || 11, size * 2 * half / tw); txt(s, VW / 2, y, size, col, 'center'); const w = Math.min(tw, 2 * half) + 8; hudReserve(VW / 2 - w / 2, y - size * .55, w, size * 1.1, 'title'); return size; }
function hudBanners(sc) { const H = HUD;
  if (G.districtT > 0 && !G.scene && !G.big) { ctx.globalAlpha = Math.min(1, G.districtT); const y = Math.max(VH * .26, H.msgY + 20 * sc); hudTitle(G.district, y, 26 * sc, '#7fdbff'); H.msgY = y + 18 * sc; ctx.globalAlpha = 1; }
  if (G.radioT > 0 && !G.big) { ctx.globalAlpha = Math.min(1, G.radioT); const y = Math.max(VH * .33, H.msgY + 14 * sc); hudTitle('♫ ' + G.radioName, y, 14 * sc, '#ff9ff3'); H.msgY = y + 12 * sc; ctx.globalAlpha = 1; }
  if (G.big) { const b = G.big, s2 = b.small ? .6 : 1, pop = 1 + Math.max(0, (b.t - (b.small ? 1.8 : 3.4))) * 2, s0 = Math.min(64, VW / 9) * s2 * pop, y = Math.max(VH * .42, H.msgY + s0 * .6 + 4); const size = hudTitle(b.text, y, s0, b.col, 18); if (b.sub) hudTitle(b.sub, y + size * .6 + 16 * sc, 16 * sc, '#fff'); } }
// ---------- bottom: action pills, then cards and prompts above them, then the toast ----------
function hudPill(q) { HUD.pills.push(q); }
function hudPrompt(w, h, draw, pri) { HUD.prompts.push({ w, h, draw, pri: pri || 20 }); }
function hudDrawPill(q, x, y, h) { const g = ctx, sc = HUD.sc, pw = q.pips ? q.pips.max * 8 * sc + 6 * sc : 0; g.fillStyle = q.on ? 'rgba(12,24,36,.9)' : 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect ? g.roundRect(x, y, q.w, h, 9 * sc) : g.rect(x, y, q.w, h); g.fill(); g.strokeStyle = q.col; g.lineWidth = q.on ? 2.5 : 1.5; g.stroke();
  g.font = `700 ${12 * sc}px Rubik, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = q.on ? q.col : '#e6e6e6'; g.fillText(q.label, x + (q.w - pw) / 2, y + h / 2 + .5);
  if (q.pips) for (let i = 0; i < q.pips.max; i++) { g.fillStyle = i < q.pips.n ? q.col : 'rgba(255,255,255,.2)'; g.fillRect(x + q.w - pw - 3 * sc + i * 8 * sc, y + h / 2 - 6 * sc, 5 * sc, 12 * sc); }
  if (q.fn) { const r = [x - 2, y - 3, q.w + 4, h + 6]; Input.xBtns.push({ k: q.k, r, fn: q.fn }); if (q.k === 'bribe') Input.bribeBtn = r; if (q.k === 'law') Input.surBtn = r; } hudReserve(x, y, q.w, h, 'pill'); }
function hudEnd(sc) { const H = HUD, pc = pCar(), g = ctx; hudBanners(sc);
  // speed (and nitrous) — under the stick on tall screens, bottom centre otherwise
  if (pc) { const mph = Math.round(Math.abs(pc.fwd) * .13), t = mph + ' MPH', nos = pc.mods && pc.mods.nos; g.font = `${15 * sc}px Bungee, Impact, sans-serif`; const tw = g.measureText('188 MPH').width, w = tw + (nos ? 46 * sc : 0) + 8 * sc, h = 22 * sc; let x, y;
    if (H.tall && H.stick) { x = clamp(H.stick.x - w / 2, 6, VW - w - 6); y = VH - h - 4; } else { [x, y] = hudFit(w, h, VH - 6, VW / 2, VH * .5); hudReserve(x, y, w, h, 'speed'); }
    txt(t, x + 4 * sc + tw / 2, y + h / 2, 15 * sc, pc.nosT > 0 ? '#4fc3f7' : '#fff', 'center'); if (nos) for (let i = 0; i < 3; i++) { g.fillStyle = i < pc.nos ? '#4fc3f7' : 'rgba(255,255,255,.2)'; g.fillRect(x + tw + 10 * sc + i * 13 * sc, y + h / 2 - 3 * sc, 10 * sc, 6 * sc); } }
  // pills: fixed order, left to right, in the first free row above the bottom edge; extra ones wrap to the next row up
  const pills = H.pills.sort((a, b) => a.pri - b.pri), h = 32 * sc, gap = 6 * sc; g.font = `700 ${12 * sc}px Rubik, sans-serif`;
  for (const q of pills) q.w = Math.max(54 * sc, g.measureText(q.label).width + 18 * sc + (q.pips ? q.pips.max * 8 * sc + 6 * sc : 0));
  { const rest = pills.slice(); let y = VH - 8, guard = 0; while (rest.length && y - h > VH * .25 && guard++ < 300) { let placed = 0;
      for (const gp of hudGaps(y - h - 2, y + 2, 8, y < H.clT - 4 ? VW - 8 : Math.min(VW - 8, H.clL - 6))) { let x = gp[0]; while (rest.length && x + rest[0].w <= gp[1]) { const q = rest.shift(); hudDrawPill(q, x, y - h, h); x += q.w + gap; placed++; } }
      y -= placed ? h + gap : 4; } }
  // cards and prompts: lowest free spot near the centre
  const yLow = H.tall && H.stick ? Math.min(H.clT, H.stick.y - H.stick.r) - 6 : VH - 46 * sc; // on tall screens, small notes sit above the whole control area, not between buttons
  for (const p of H.prompts.sort((a, b) => a.pri - b.pri)) { const w = Math.min(p.w, VW - 12), [x, y] = hudFit(w, p.h, p.pri >= 40 ? yLow : VH - 8, VW / 2, VH * .2); hudReserve(x, y, w, p.h, 'prompt'); try { p.draw(x, y, w); } catch (e) { } }
  // toast: one line (two if it must), above everything at the bottom
  if (G.toast) { const size = 16 * sc; g.font = `${size}px Bungee, Impact, sans-serif`; const maxW = Math.min(VW - 24, 520 * sc); let lines = [G.toast.text]; if (g.measureText(G.toast.text).width > maxW) lines = hudWrap(G.toast.text, maxW, 2);
    let w = 0; for (const l of lines) w = Math.max(w, g.measureText(l).width); const lh = size * 1.25, hh = lines.length * lh + 4, [x, y] = hudFit(w + 12, hh, yLow, VW / 2, VH * .3, Math.max(0, (VW - w) / 2 - 8) * (H.tall ? .25 : .5));
    g.globalAlpha = Math.min(1, G.toast.t * 2); lines.forEach((l, i) => txt(l, x + w / 2 + 6, y + 2 + lh * (i + .5), size, '#fff', 'center')); g.globalAlpha = 1; hudReserve(x, y, w + 12, hh, 'toast'); } }
