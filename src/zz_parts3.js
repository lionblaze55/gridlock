// ================= garage › Vehicles: the loose-parts column is an icon grid with a full action card (fit, fix, slow fix, sell, scrap) =================
// While a part list is being built, remember which part id each row belongs to (looseGroups(id) is always asked right before that id's rows).
let _lgCur = null, _lgGroups = null, _lgIdx = 0;
{ const _lg = looseGroups; looseGroups = function (id) { const r = _lg(id); _lgCur = id; _lgGroups = r; _lgIdx = 0; return r; }; }
// run a row-building function with a wrapped H: each row's emoji becomes the part's drawn icon, and every row is reported to onRow
function iconRows(H, fn, onRow) { const H2 = Object.assign({}, H); _lgCur = null;
  H2.row = function (c, e, name, sub, btns) { const g = _lgCur && _lgGroups && _lgIdx < _lgGroups.length ? _lgGroups[_lgIdx++] : null, id = g ? _lgCur : null; if (onRow && id && g) return onRow({ id, g, e, name, sub, btns: btns || [] }) || H.mk('div');
    const r = H.row(c, e, name, sub, btns); if (id) { const pe = r.querySelector('.pe'); if (pe) { pe.textContent = ''; pe.appendChild(itemIcon(id, 40)); pe.classList.add('pei'); } } return r; };
  try { return fn(H2); } finally { _lgCur = null; _lgGroups = null; } }
(() => { const st = document.createElement('style'); st.textContent = `#panel .prow .pe.pei{width:44px;display:flex;align-items:center;justify-content:center}#panel .prow .pe.pei canvas{width:40px;height:40px}
#panel .gtile .gfit{position:absolute;left:3px;top:3px;background:#2ecc71;color:#06210f;font:800 9px Rubik,system-ui,sans-serif;border-radius:6px;padding:1px 4px;line-height:1.3}
#panel .gtile .gfit.no{background:#3b4456;color:#9aa3b5}
#panel .ldet{position:relative;background:#141924;border:2px solid #4fc3f7;border-radius:12px;padding:8px;margin:2px 0 8px;display:flex;flex-direction:column;gap:6px;flex:none}
#panel .ldet .lhd{display:flex;gap:10px;align-items:center;padding-right:54px}#panel .ldet .lhd canvas{width:54px;height:54px;flex:none}
#panel .ldet .lhd b{font:800 15px Rubik,system-ui,sans-serif;color:#fff;display:block}#panel .ldet .lhd small{font:600 11px Rubik,system-ui,sans-serif;color:#9aa3b5;display:block;margin-top:2px}
#panel .ldet .lhint{font:600 11px Rubik,system-ui,sans-serif;color:#cfe8ff;background:#11263a;border-radius:8px;padding:6px 8px}
#panel .ldet .lbtns{display:grid;grid-template-columns:1fr 1fr;gap:6px}#panel .ldet .lbtns .pb{margin:0;padding:10px 8px;display:flex;flex-direction:column;align-items:flex-start;gap:1px;text-align:left;min-height:46px}
#panel .ldet .lbtns .pb small{font:600 11px Rubik,system-ui,sans-serif;opacity:.85}#panel .ldet .lbtns .pb.wide{grid-column:1 / -1}
#panel .ldet .pcbar{margin:0}#panel .ldet .lx{position:absolute;top:6px;right:8px;background:none;border:0;color:#9aa3b5;font:700 12px Rubik,system-ui,sans-serif;padding:0 2px;cursor:pointer}
@media (orientation:portrait){#panel .pbody.gsheet>.pcol.gsheetc .ldet{border:0;background:transparent;padding:4px;margin:0}#panel .ldet .lbtns .pb{min-height:52px;font-size:14px}}`; document.head.appendChild(st); })();
const LFILT = [['all', 'All'], ['fit', '✓ Fits this car'], ['Engines', '⚙ Engines'], ['Stock parts', '🔧 Stock'], ['Performance', '🏁 Perf'], ['Wheels', '🛞 Wheels'], ['Body & style', '🎨 Body']];
const looseName = id => id.includes(':') ? partN(id.split(':')[0], +id.split(':')[1]) : (partCat(id) === 'Stock parts' ? 'Stock ' + ITEMS[id].n.toLowerCase() : ITEMS[id].n);
{ const _lr = looseRows; looseRows = function (H, col, t, e, se, req, M, m) {
  if (G._pk) return iconRows(H, H2 => _lr(H2, col, t, e, se, req, M, m)); // the Add/Swap picker: same rows, drawn icons
  // collect every loose part (with its fit button for this car, if it fits) instead of drawing rows
  const L = []; iconRows(H, H2 => _lr(H2, col, t, e, se, req, M, m), r => { const fit = r.btns.find(b => /^(Fit|Swap)/.test(b.textContent)) || null; L.push({ id: r.id, c: r.g.c, n: r.g.n, hint: (r.sub || '').replace(/ · \d+%.*$/, ''), fit, cat: partCat(r.id), nm: looseName(r.id) }); });
  if (!L.length) return 0;
  const P = Panel, key = a => a.id + '@' + Math.round(a.c * 20), nFit = L.filter(a => a.fit).length; let f = P.lfilt || 'all'; if (f === 'fit' && !nFit) f = 'all';
  const bar = H.mk('div', 'gchips'); for (const [k, nm] of LFILT) { if (k === 'fit' ? !nFit : k !== 'all' && !L.some(a => a.cat === k)) continue; const b = H.mk('button', k === f ? 'on' : '', k === 'fit' ? nm + ' (' + nFit + ')' : nm); b.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.lfilt = k; Panel.render(); }; bar.appendChild(b); }
  const list = L.filter(a => f === 'all' || (f === 'fit' ? a.fit : a.cat === f)).sort((a, b) => (b.fit ? 1 : 0) - (a.fit ? 1 : 0) || LFILT.findIndex(x => x[0] === a.cat) - LFILT.findIndex(x => x[0] === b.cat) || a.nm.localeCompare(b.nm) || b.c - a.c);
  let sel = P.gsel && P.gsel.side === 'loose' ? L.find(a => key(a) === P.gsel.key) : null;
  if (P.gsel && P.gsel.side === 'loose' && !sel && P.gsel.id) { sel = L.filter(a => a.id === P.gsel.id).sort((a, b) => Math.abs(a.c - P.gsel.c) - Math.abs(b.c - P.gsel.c))[0] || null; if (sel) P.gsel = { side: 'loose', key: key(sel), id: sel.id, c: sel.c }; else P.gsel = null; }
  if (sel) col.appendChild(looseCard(H, sel, t));
  col.appendChild(bar); const grid = gGrid(H, col, 'loose');
  for (const a of list) { const tl = gTile(H, grid, 'loose', key(a), '🔩', a.nm.split(' — ').pop().replace(/\s*\(.*\)$/, ''), a.n > 1 ? a.n : null, { cond: a.c, canvas: itemIcon(a.id) });
    tl.appendChild(H.mk('span', 'gfit' + (a.fit ? '' : ' no'), a.fit ? '✓ FITS' : '—')); tl.title = a.nm + ' — ' + a.hint;
    tl.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.gsel = P.gsel && P.gsel.key === key(a) ? null : { side: 'loose', key: key(a), id: a.id, c: a.c }; Panel.render(); }; if (sel === a) tl.classList.add('sel'); }
  if (!list.length) grid.appendChild(H.mk('div', 'pempty', 'Nothing in this category.')).style.gridColumn = '1 / -1';
  if (!sel) col.appendChild(H.mk('div', 'pempty', 'Tap a part to fit it, fix it, sell it or scrap it.'));
  return 1; }; }
function looseCard(H, a, t) { const id = a.id, c = a.c, price = loosePrice(id), each = unitValue(id, c), d = H.mk('div', 'ldet'), P = Panel;
  const x = H.mk('button', 'lx', '✕'); x.onclick = ev => { ev.stopPropagation(); P.gsel = null; Panel.render(); }; d.appendChild(x);
  const hd = H.mk('div', 'lhd'); hd.appendChild(itemIcon(id, 64)); const tx = H.mk('div', ''); tx.style.minWidth = '0'; tx.appendChild(H.mk('b', '', a.nm + (a.n > 1 ? '  ×' + a.n : ''))); tx.appendChild(H.mk('small', '', a.cat + ' · ' + condWord2(c) + ' ' + pct(c) + ' · worth ≈ ' + money(each) + (a.n > 1 ? ' each' : ''))); hd.appendChild(tx); d.appendChild(hd);
  const cb = H.mk('div', 'pcbar'), ci = H.mk('b'); ci.style.width = Math.round(c * 100) + '%'; ci.style.background = condCol(c); cb.appendChild(ci); d.appendChild(cb);
  d.appendChild(H.mk('div', 'lhint', (a.fit ? '✓ ' : '✕ ') + a.hint + (c < REPAIR_MIN ? ' · BROKEN — fix or scrap it first' : '')));
  const bb = H.mk('div', 'lbtns'), B = (l, s, fn, cls, dis, wide) => { const b = H.btn(l, fn, cls, dis); b.textContent = ''; b.appendChild(H.mk('span', '', l)); if (s) b.appendChild(H.mk('small', '', s)); if (wide) b.classList.add('wide'); bb.appendChild(b); return b; };
  if (a.fit) { const lbl = a.fit.textContent; a.fit.textContent = ''; a.fit.appendChild(H.mk('span', '', (lbl === 'Swap' ? '🔁 Swap it in' : '🔧 Fit to the ' + t.d.name))); a.fit.appendChild(H.mk('small', '', 'Goes on the selected car')); a.fit.classList.add('wide'); a.fit.style.margin = '0'; bb.appendChild(a.fit); }
  if (c >= REPAIR_MIN && c < .95) { const cost = repairCost(price, c); B('🔧 Fix now', '→ 95% · ' + money(cost), () => fixLoose(id, c), cost > price * .45 ? 'r' : '', !canPay(cost)); }
  if (c < .95 && typeof benchAdd === 'function') { const sc = slowCost(price, c); B('🐢 Slow fix', money(sc) + ' · ~' + Math.ceil((95 - c * 100) / SLOW_RATE / 60) + ' min', () => benchAdd(id, c), '', !canPay(sc)); }
  B('🏷 Sell', 'Marketplace ≈ ' + money(each), () => sellPart(id, c), a.fit ? '' : 'y');
  B('🗑 Scrap', '+' + money(scrapVal(id, c)), () => { scrapLoose(id, c); P.gsel = null; }, 'r');
  if (bb.children.length % 2 && !a.fit) bb.lastChild.classList.add('wide'); d.appendChild(bb);
  const ds = itemDesc(id); if (ds) d.appendChild(H.mk('div', 'pdesc', ds)); return d; }
// phones held upright: the selected part's card becomes the bottom sheet, like the backpack
{ const _r = Panel.render; Panel.render = function () { const r = _r.apply(this, arguments); try { if (this.mode !== 'hgarage') { const pk = pEl() && pEl().querySelector('.pkmodal'); if (pk) pk.remove(); } if (this.mode !== 'hgarage' || this.tab === 'parts' || !this.gsel || this.gsel.side !== 'loose' || !matchMedia('(orientation:portrait)').matches) return r;
    const body = pEl().querySelector('.pbody'), d = body && body.querySelector('.ldet'); if (!d || body.classList.contains('gsheet')) return r; const cols = body.querySelectorAll(':scope > .pcol'), top = document.createElement('div'); top.className = 'gtop'; body.insertBefore(top, cols[0]); cols.forEach(c => top.appendChild(c));
    const sh = document.createElement('div'); sh.className = 'pcol gsheetc'; const hnd = document.createElement('div'); hnd.className = 'gsheetx'; hnd.onclick = e => { e.stopPropagation(); this.gsel = null; this.render(); }; sh.appendChild(hnd); sh.appendChild(d); body.appendChild(sh); body.classList.add('gsheet'); const s = top.querySelector('.gtile.sel'); if (s) setTimeout(() => s.scrollIntoView({ block: 'nearest' }), 0); } catch (e) { } return r; }; }
// the marketplace's "On your shelf" list gets the drawn icons too
{ const _ps = partsSellView; partsSellView = function (H, P, top, M) { return iconRows(H, H2 => _ps(H2, P, top, M)); }; }
// fitted parts get their drawn icons too
{ const _fr = fittedRows; fittedRows = function (H, c1, t, PC, e, se, req, M, m, red) { const H2 = Object.assign({}, H);
  H2.row = function (c, em, name, sub, btns) { const r = H.row(c, em, name, sub, btns); try { const nm = String(name).replace(/\s+\d+\/\d+$/, ''); let id = null;
      if (nm === 'Engine') id = e || null; else { const k = MECH.find(k => ITEMS[k] && ITEMS[k].n === nm); if (k) { const vk = VAR[k]; id = vk && (m[vk] | 0) ? pkey(vk, m[vk]) : k; } else { const mk = Object.keys(MODOPTS).find(k => MODOPTS[k].n === nm); if (mk && (m[mk] | 0)) id = pkey(mk, m[mk]); } }
      if (id && (ITEMS[id] || id.includes(':'))) { const pe = r.querySelector('.pe'); if (pe) { pe.textContent = ''; pe.appendChild(itemIcon(id, 40)); pe.classList.add('pei'); } } } catch (er) { } return r; };
  return _fr(H2, c1, t, PC, e, se, req, M, m, red); }; }
