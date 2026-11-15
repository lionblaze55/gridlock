// ================= GRID INVENTORY: items as icon tiles you can filter, sort, tap and drag between bag, stash, trunk and farm storage =================
(() => { const st = document.createElement('style'); st.textContent = `
#panel .ggrid{flex:none;display:grid;grid-template-columns:repeat(auto-fill,minmax(62px,1fr));gap:6px;padding:2px 0 6px;min-height:70px;border-radius:8px;transition:background .15s}
#panel .ggrid.over{background:rgba(242,194,48,.12);outline:2px dashed #f2c230}
#panel .gtile{position:relative;aspect-ratio:1;min-height:60px;background:#1d222d;border:2px solid #2b3140;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:pan-y;overflow:hidden}
#panel .gtile .ge{font-size:26px;line-height:1}
#panel .gtile .gn{font:600 9px Rubik,system-ui,sans-serif;color:#aab3c5;max-width:94%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:3px}
#panel .gtile .gc{position:absolute;right:3px;bottom:2px;font:800 11px Rubik,system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000}
#panel .gtile .gk{position:absolute;left:0;bottom:0;height:3px}
#panel .gtile.sel{border-color:#4fc3f7;background:#11263a;box-shadow:0 0 0 2px rgba(79,195,247,.35)}
#panel .gtile.eq{border-color:#2ecc71}
#panel .gtile canvas{display:block;width:86%;height:auto}
#panel .gchips{flex:none;display:flex;gap:4px;flex-wrap:nowrap;overflow-x:auto;margin:2px 0 4px;scrollbar-width:none}
#panel .gchips button{flex:none;padding:4px 8px;border-radius:12px;border:1.5px solid #2b3140;background:#1b1f29;color:#cfd6e4;font:700 11px Rubik,system-ui,sans-serif}
#panel .gchips button.on{border-color:#f2c230;color:#f2c230;background:#3a3216}
#panel .gcap{flex:none;height:6px;background:#232835;border-radius:3px;overflow:hidden;margin:2px 0 6px}
#panel .gcap b{display:block;height:100%;background:linear-gradient(90deg,#2ecc71,#f2c230)}
#panel .gcap b.full{background:#e74c3c}
#panel .gdet{flex:none;display:flex;gap:10px;align-items:center;background:#11263a;border:2px solid #4fc3f7;border-radius:10px;padding:8px;margin-bottom:6px}
#panel .gdet .gde{font-size:38px;flex:none;width:52px;text-align:center}
#panel .gdet .gdt{flex:1;min-width:0;display:flex;flex-direction:column}
#panel .gdet .gdt b{font:800 14px Rubik,system-ui,sans-serif;color:#fff}
#panel .gdet .gdt small{font:500 11px Rubik,system-ui,sans-serif;color:#9aa3b5;line-height:1.3}
#panel .gdet .pbs{max-width:none;flex-wrap:wrap;justify-content:flex-end}
#panel .ghint{flex:none;font:500 10px Rubik,system-ui,sans-serif;color:#7f8899;margin:-2px 0 4px}
.gghost{position:fixed;z-index:99;pointer-events:none;font-size:34px;filter:drop-shadow(0 4px 6px #000);transform:translate(-50%,-50%)}`; document.head.appendChild(st); })();
const GCATS = [['all', 'All'], ['eat', '🍔 Food'], ['med', '⛑ Meds'], ['gear', '🎒 Gear'], ['loot', '💍 Loot'], ['farm', '🌾 Farm'], ['drug', '🌿 Drugs'], ['part', '🔩 Parts'], ['gun', '🔫 Guns']];
const gcatOf = id => { if (id.startsWith('gun:')) return 'gun'; const k = (ITEMS[id] || {}).k; return k === 'food' || k === 'pantry' || k === 'meat' ? 'eat' : k === 'med' ? 'med' : k === 'gear' || k === 'cloth' ? 'gear' : k === 'loot' ? 'loot' : k === 'farm' || k === 'seed' ? 'farm' : k === 'drug' ? 'drug' : k === 'part' ? 'part' : 'loot'; };
const GSORT = [['type', 'Type'], ['value', 'Value'], ['name', 'A–Z'], ['weight', 'Weight']];
const GORD = ['gear', 'med', 'food', 'pantry', 'farm', 'meat', 'seed', 'cloth', 'loot', 'drug', 'part'];
function gSort(ids, obj) { const s = Panel.gsort || 'type', v = id => id.startsWith('gun:') ? WEAPONS[WI[id.slice(4)]].price : (ITEMS[id].v | 0) * (obj[id] | 0), w = id => id.startsWith('gun:') ? 0 : ITEMS[id].w * (obj[id] | 0), nm = id => id.startsWith('gun:') ? WEAPONS[WI[id.slice(4)]].name : ITEMS[id].n;
  return ids.sort((a, b) => s === 'value' ? v(b) - v(a) : s === 'name' ? nm(a).localeCompare(nm(b)) : s === 'weight' ? w(b) - w(a) : (a.startsWith('gun:') - b.startsWith('gun:')) || GORD.indexOf((ITEMS[a] || {}).k) - GORD.indexOf((ITEMS[b] || {}).k) || nm(a).localeCompare(nm(b))); }
// chips + sort row; returns nothing, re-renders the panel when changed
function gControls(H, col, present) { const P = Panel, f = P.gfilt || 'all', bar = H.mk('div', 'gchips');
  for (const [k, n] of GCATS) { if (k !== 'all' && !present.has(k)) continue; const b = H.mk('button', k === f ? 'on' : '', n); b.onclick = e => { e.stopPropagation(); Snd.play('ui'); P.gfilt = k; P.gsel = null; Panel.render(); }; bar.appendChild(b); }
  const s = H.mk('button', '', '⇅ ' + (GSORT.find(x => x[0] === (P.gsort || 'type')) || GSORT[0])[1]); s.onclick = e => { e.stopPropagation(); Snd.play('ui'); const i = GSORT.findIndex(x => x[0] === (P.gsort || 'type')); P.gsort = GSORT[(i + 1) % GSORT.length][0]; Panel.render(); }; bar.insertBefore(s, bar.firstChild); col.appendChild(bar); }
function gCap(H, col, used, cap) { const b = H.mk('div', 'gcap'), i = H.mk('b', used >= cap ? 'full' : ''); i.style.width = Math.min(100, used / cap * 100) + '%'; b.appendChild(i); col.appendChild(b); }
// one tile; tap selects, press-and-drag moves to another grid
function gTile(H, grid, side, key, e, name, n, opt) { const P = Panel, t = H.mk('div', 'gtile'); opt = opt || {}; if (P.gsel && P.gsel.side === side && P.gsel.key === key) t.classList.add('sel'); if (opt.eq) t.classList.add('eq');
  if (opt.canvas) t.appendChild(opt.canvas); else t.appendChild(H.mk('span', 'ge', e)); t.appendChild(H.mk('span', 'gn', name)); if (n !== undefined && n !== null && n !== '') t.appendChild(H.mk('span', 'gc', typeof n === 'number' ? '×' + n : n));
  if (opt.cond !== undefined) { const k = H.mk('i', 'gk'); k.style.width = Math.round(opt.cond * 100) + '%'; k.style.background = condCol(opt.cond); t.appendChild(k); }
  t.onclick = ev => { ev.stopPropagation(); if (t._drag) return; Snd.play('ui'); P.gsel = P.gsel && P.gsel.side === side && P.gsel.key === key ? null : { side, key }; Panel.render(); };
  t.addEventListener('pointerdown', ev => { if (!opt.drop) return; const x0 = ev.clientX, y0 = ev.clientY, touch = ev.pointerType === 'touch'; let ghost = null, armed = !touch, hold = touch ? setTimeout(() => { armed = true; if (navigator.vibrate) navigator.vibrate(15); t.style.transform = 'scale(1.08)'; }, 260) : null;
    const mv = e2 => { const d = Math.hypot(e2.clientX - x0, e2.clientY - y0); if (!ghost && touch && !armed && d > 8) { clearTimeout(hold); cleanup(); return; } if (!ghost && armed && d > 10) { ghost = document.createElement('div'); ghost.className = 'gghost'; ghost.textContent = e || '📦'; document.body.appendChild(ghost); t._drag = 1; } if (ghost) { e2.preventDefault(); ghost.style.left = e2.clientX + 'px'; ghost.style.top = e2.clientY + 'px'; document.querySelectorAll('#panel .ggrid').forEach(g => g.classList.toggle('over', g.contains(document.elementFromPoint(e2.clientX, e2.clientY)) && g.dataset.side !== side)); } };
    const up = e2 => { clearTimeout(hold); if (ghost) { const tg = document.elementFromPoint(e2.clientX, e2.clientY), g = tg && tg.closest && tg.closest('#panel .ggrid'); ghost.remove(); if (g && g.dataset.side && g.dataset.side !== side) opt.drop(g.dataset.side); setTimeout(() => { t._drag = 0; Panel.render(); }, 0); } cleanup(); };
    const cleanup = () => { t.style.transform = ''; window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); document.querySelectorAll('#panel .ggrid.over').forEach(g => g.classList.remove('over')); };
    window.addEventListener('pointermove', mv, { passive: false }); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up); });
  grid.appendChild(t); return t; }
function gGrid(H, col, side) { const g = H.mk('div', 'ggrid'); g.dataset.side = side; col.appendChild(g); return g; }
function gDetail(H, col, e, name, sub, btns) { const d = H.mk('div', 'gdet'); d.appendChild(H.mk('span', 'gde', e)); const t = H.mk('div', 'gdt'); t.appendChild(H.mk('b', '', name)); if (sub) t.appendChild(H.mk('small', '', sub)); d.appendChild(t); const bb = H.mk('div', 'pbs'); (btns || []).forEach(b => b && bb.appendChild(b)); d.appendChild(bb); col.insertBefore(d, col.children[1] || null); return d; }
const gunTiles = ammo => { const o = {}; for (const id in ammo) if (ammo[id] > 0 && WI[id] !== undefined) o['gun:' + id] = ammo[id]; return o; };
const playerGuns = () => { const o = {}, p = G.player; for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) o['gun:' + WEAPONS[i].id] = p.ammo[i]; return o; };
const gunIcon = id => Panel.icon(id, WI[id]);

// ---------------- two-sided transfer screen (bag ⇄ stash / trunk / farm) ----------------
// A, B: { side, name, obj, cap, weight(), guns (bool), empty }
function moveItems(from, to, id, n) { if (id.startsWith('gun:')) { const g = id.slice(4), p = G.player;
    if (from.side === 'bag') { const a = p.ammo[WI[g]] | 0; if (!a) return; if (!to.guns) return toast('Guns only go in your home gun locker'); G.stash.guns[g] = (G.stash.guns[g] | 0) + a; p.ammo[WI[g]] = 0; p.clip[WI[g]] = 0; if (p.weapon === WI[g]) p.weapon = bestWeapon(); }
    else { giveWeapon(g, G.stash.guns[g] | 0); delete G.stash.guns[g]; } Snd.play('cock'); return; }
  const it = ITEMS[id], room = it.w ? Math.floor((to.cap - to.weight()) / it.w) : 99999, k = Math.min(n, from.obj[id] | 0, room); if (k <= 0) { Snd.play('bad'); toast(to.name + ' is full'); return; }
  from.obj[id] -= k; if (!from.obj[id]) delete from.obj[id]; to.obj[id] = (to.obj[id] | 0) + k; Snd.play('rustle'); }
function transferView(H, A, B, extraFoot) { const P = Panel, sides = { [A.side]: [A, B], [B.side]: [B, A] }, present = new Set();
  const listOf = S => { const ids = Object.keys(S.obj).filter(k => ITEMS[k] && S.obj[k] > 0); if (S.guns) { const g = S.side === 'bag' ? playerGuns() : gunTiles(G.stash.guns); ids.push(...Object.keys(g)); } return ids; };
  const countOf = (S, id) => id.startsWith('gun:') ? (S.side === 'bag' ? G.player.ammo[WI[id.slice(4)]] : G.stash.guns[id.slice(4)]) | 0 : S.obj[id] | 0;
  for (const S of [A, B]) for (const id of listOf(S)) present.add(gcatOf(id));
  if (P.gsel && !sides[P.gsel.side]) P.gsel = null; if (P.gsel && !countOf(sides[P.gsel.side][0], P.gsel.key)) P.gsel = null;
  [A, B].forEach((S, i) => { const c = H.col(S.name + '  ' + S.weight() + ' / ' + S.cap); gCap(H, c, S.weight(), S.cap); if (!i) gControls(H, c, present); else c.appendChild(H.mk('div', 'ghint', 'Tap an item to move part of a stack · press and drag to move it all'));
    const g = gGrid(H, c, S.side), f = P.gfilt || 'all', ids = gSort(listOf(S).filter(id => f === 'all' || gcatOf(id) === f), S.obj);
    for (const id of ids) { const O = sides[S.side][1], gun = id.startsWith('gun:'), n = countOf(S, id); gTile(H, g, S.side, id, gun ? '🔫' : ITEMS[id].e, gun ? WEAPONS[WI[id.slice(4)]].name : ITEMS[id].n, gun ? n + 'rd' : n, { canvas: gun ? gunIcon(id.slice(4)) : null, drop: side => side === O.side && moveItems(S, O, id, 9999) }); }
    if (!ids.length) g.appendChild(H.mk('div', 'pempty', S.empty || 'Empty.')).style.gridColumn = '1 / -1'; });
  // the selected stack: move some or all of it
  if (P.gsel) { const [S, O] = sides[P.gsel.side], id = P.gsel.key, gun = id.startsWith('gun:'), n = countOf(S, id), col = H.body.querySelectorAll('.pcol')[S === A ? 0 : 1], arrow = S === A ? '→' : '←';
    const btns = gun ? [H.btn(arrow + ' ' + (S.side === 'bag' ? 'Lock it up' : 'Take it'), () => { moveItems(S, O, id, 1); P.gsel = null; }, 'y', S.side === 'bag' && !O.guns)] : [n > 1 ? H.btn(arrow + ' 1', () => moveItems(S, O, id, 1)) : null, n > 3 ? H.btn(arrow + ' Half', () => moveItems(S, O, id, Math.ceil(n / 2))) : null, H.btn(arrow + ' All ' + n, () => { moveItems(S, O, id, 9999); if (!(S.obj[id] > 0)) P.gsel = null; }, 'y')];
    if (!gun && S.side === 'bag') { const it = ITEMS[id]; if (it.heal || it.armor || it.repair || DFX[id]) btns.unshift(H.btn(DFX[id] ? 'Take' : 'Use', () => useInv(id))); }
    gDetail(H, col, gun ? '🔫' : ITEMS[id].e, gun ? WEAPONS[WI[id.slice(4)]].name + ' · ' + n + ' rounds' : ITEMS[id].n + ' ×' + n, gun ? '' : itemInfo(id), btns); }
  const fr = H.mk('div', ''); fr.style.cssText = 'display:flex;gap:6px;width:100%'; const fb = (l, f, dis) => { const b = H.btn(l, f, '', dis); b.style.flex = '1'; b.style.margin = '0'; fr.appendChild(b); };
  const f = P.gfilt || 'all', bulk = (S, O) => { for (const id of listOf(S).filter(id => !id.startsWith('gun:') && (f === 'all' || gcatOf(id) === f))) moveItems(S, O, id, 9999); };
  fb('Move ' + (f === 'all' ? 'all' : GCATS.find(x => x[0] === f)[1]) + ' →', () => bulk(A, B)); fb('← Take ' + (f === 'all' ? 'all' : GCATS.find(x => x[0] === f)[1]), () => bulk(B, A)); if (extraFoot) extraFoot(H, fb); H.foot.appendChild(fr); fr.querySelectorAll('.pb').forEach(b => b.style.padding = '8px 6px'); }
const BAG = () => ({ side: 'bag', name: 'Backpack', obj: G.inv, cap: invCap(), weight: invWeight, guns: false, empty: 'Your bag is empty.' });
// home stash & car trunks
{ const ps = PMODES.store; PMODES.store = function (H) { const r = ps.call(this, H), home = this.opt.kind === 'home', car = this.opt.car; if (home && this.tab && this.tab !== 'stash') return r;
  if (!home && !car) return r; const S = home ? G.stash.items : car.trunk || (car.trunk = {}), cap = home ? HOMECAP : (TRUNKCAP[car.type] || 30); H.title.textContent = home ? '🏠 Home stash' : '🚗 ' + car.d.name + ' trunk';
  transferView(H, Object.assign(BAG(), { guns: home }), { side: home ? 'stash' : 'trunk', name: home ? 'Stash' : 'Trunk', obj: S, cap, weight: () => weightOf(S), guns: home, empty: home ? 'Safe forever — up to ' + HOMECAP + '. Guns go in the locker too.' : 'Empty trunk.' }, home ? (H2, fb) => { const cd = 300 - (G.t - (G.stashT || -999)), p = G.player; fb(cd > 0 ? `🛡 Free armor (${Math.ceil(cd)}s)` : '🛡 Free armor & ammo', () => { G.stashT = G.t; p.armor = 100; giveWeapon('pistol', 20); Snd.play('armor'); }, cd > 0); } : null); }; }
// farm storage
{ const pf = PMODES.farm; PMODES.farm = function (H) { if (this.tab !== 'store') return pf.call(this, H); const f = this.opt.farm, F = farmData(f); H.title.textContent = f.b.name; H.tabBtn('over', 'Overview'); H.tabBtn('store', 'Storage'); H.tabBtn('stand', 'Farm stand'); H.tabBtn('up', 'Upgrades');
  transferView(H, BAG(), { side: 'farm', name: 'Farm storage', obj: F.store, cap: 1000, weight: () => weightOf(F.store), empty: 'Harvests and animal products land here.' }); }; }
// ---------------- the backpack ----------------
PMODES.inv = function (H) { const P = this, p = G.player, bag = G.inv, guns = playerGuns(), all = Object.keys(bag).filter(k => ITEMS[k] && bag[k] > 0).concat(Object.keys(guns)), present = new Set(all.map(gcatOf));
  H.title.textContent = '🎒 Backpack'; const c = H.col('Carrying ' + invWeight() + ' / ' + invCap()); gCap(H, c, invWeight(), invCap()); gControls(H, c, present);
  const g = gGrid(H, c, 'bag'), f = P.gfilt || 'all', ids = gSort(all.filter(id => f === 'all' || gcatOf(id) === f), bag);
  if (P.gsel && !(P.gsel.key.startsWith('gun:') ? guns[P.gsel.key] : bag[P.gsel.key])) P.gsel = null;
  for (const id of ids) { if (id.startsWith('gun:')) { const w = id.slice(4), i = WI[w]; gTile(H, g, 'bag', id, '🔫', WEAPONS[i].name, guns[id] + 'rd', { canvas: gunIcon(w), eq: p.weapon === i }); } else gTile(H, g, 'bag', id, ITEMS[id].e, ITEMS[id].n, bag[id]); }
  if (!ids.length) g.appendChild(H.mk('div', 'pempty', all.length ? 'Nothing in this category.' : 'Empty. Search trash cans, desks, crates, car trunks and hay bales — or go fishing.')).style.gridColumn = '1 / -1';
  const c2 = H.col(P.gsel ? 'Selected' : 'Tap an item');
  if (P.gsel) { const id = P.gsel.key; if (id.startsWith('gun:')) { const w = id.slice(4), i = WI[w], m = G.wmods[w] || {}, mods = Object.keys(WSLOTS).filter(s => m[s]).map(s => WSLOTS[s].o[m[s]][0].split(' —')[0].split(' (')[0]); const big = H.mk('div', ''); big.style.cssText = 'display:flex;justify-content:center;padding:6px'; const cv = P.icon(w, i); cv.style.width = '130px'; big.appendChild(cv); c2.appendChild(big);
      H.row(c2, '🔫', WEAPONS[i].name, guns[id] + ' rounds' + (pw(i).mag ? ' · mag ' + pw(i).mag : '') + (mods.length ? ' · ' + mods.join(', ') : ''), [H.btn(p.weapon === i ? 'Equipped' : 'Equip', () => { p.weapon = i; p.reloadT = 0; Snd.play('cock'); }, p.weapon === i ? 'on' : 'y')]).classList.add('pmsg'); }
    else { const it = ITEMS[id], n = bag[id]; const big = H.mk('div', 'pbig', it.e); big.style.cssText = 'font-size:58px;padding:4px 0;text-align:center'; c2.appendChild(big);
      const r = H.row(c2, '', it.n + ' ×' + n, itemInfo(id) + (n > 1 ? ' · ' + it.w * n + ' weight total' : ''), [(it.heal || it.armor || it.repair || DFX[id]) ? H.btn(DFX[id] ? 'Take' : 'Use', () => useInv(id), 'y') : null, H.btn('Drop 1', () => { invDel(id, 1); dropItem(id, 1); Snd.play('thud'); }), n > 1 ? H.btn('Drop all', () => { invDel(id, n); dropItem(id, Math.min(n, 30)); Snd.play('thud'); P.gsel = null; }, 'r') : null].filter(Boolean)); r.classList.add('pmsg'); r.querySelector('.pe').remove(); } }
  else { H.row(c2, '👆', 'Tap any tile', 'See what it does, use it, equip it or drop it. Filters and ⇅ sorting are at the top.'); const tot = Object.keys(bag).reduce((a, k) => a + (ITEMS[k] ? ITEMS[k].v * bag[k] : 0), 0); H.row(c2, '💰', 'Bag worth about ' + money(tot), 'Pawn shops buy loot; markets buy produce.'); }
  c2.appendChild(H.mk('div', 'ptitle', 'Gang standing')); const gl = H.mk('div', ''); gl.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px 10px;font:600 11px Rubik,system-ui,sans-serif;color:#cfd6e4;padding:2px 4px';
  for (const k in GANGS) { const r = G.rep[k] | 0, s = H.mk('span', '', '● ' + GANGS[k].name + ' ' + (r <= -30 ? '☠' : r >= 30 ? '♥' : '·')); s.style.color = r <= -30 ? '#ff6b6b' : r >= 30 ? '#2ecc71' : '#cfd6e4'; s.title = String(r); gl.appendChild(s); } c2.appendChild(gl); };
// ---------------- parts shelf: the rows become tiles; tap one to get its buttons ----------------
function tileizeRows(H, col, side) { const P = Panel, rows = [...col.children].filter(x => x.classList && x.classList.contains('prow')); if (!rows.length) return; let grid = null, idx = 0;
  for (const el of [...col.children]) { if (el.classList.contains('ptitle')) { grid = null; continue; } if (!el.classList.contains('prow')) continue; if (!grid) { grid = H.mk('div', 'ggrid'); grid.dataset.side = side; col.insertBefore(grid, el); }
    const key = side + ':' + (idx++) + ':' + ((el.querySelector('b') || {}).textContent || ''), nm = (el.querySelector('b') || {}).textContent || '', sub = (el.querySelector('small') || {}).textContent || '', e = (el.querySelector('.pe') || {}).textContent || '📦';
    const m = nm.match(/×(\d+)\s*$/), pc = sub.match(/(\d+)%/), short = nm.replace(/\s*×\d+\s*$/, '').split(' — ').pop();
    const t = gTile(H, grid, side, key, e, short, m ? +m[1] : null, { cond: pc ? +pc[1] / 100 : undefined }); if (el.style.opacity) t.style.opacity = el.style.opacity;
    if (P.gsel && P.gsel.key === key) { el.classList.add('pmsg'); el.style.cssText += ';outline:2px solid #4fc3f7;background:#11263a'; col.insertBefore(el, col.children[1] || null); } else el.remove(); }
  if (P.gsel && P.gsel.key && P.gsel.key.startsWith(side + ':') && ![...col.querySelectorAll('.gtile.sel')].length) P.gsel = null; }
{ const pt = partsTab; partsTab = function (H) { pt(H); const c1 = H.body.querySelector('.pcol'); if (!c1) return; const keep = Panel.gsel; tileizeRows(H, c1, 'shelf');
  if (!Panel.gsel) { const tip = H.mk('div', 'pempty', 'Tap a part to fix, slow-fix, sell or scrap it. The colour bar is its condition.'); c1.insertBefore(tip, c1.children[1] || null); } }; }
{ const _o = Panel.open; Panel.open = function (mode, opt) { if (mode !== this.mode) { this.gsel = null; this.gfilt = 'all'; } return _o.call(this, mode, opt); }; }
