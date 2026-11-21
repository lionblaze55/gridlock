// ================= one slot per part of the gun =================
// The Barrel, Action and Feed core parts used to sit next to the "Barrel length", "Trigger" and "Magazine" attachment
// slots, which read as duplicates. Now there's one tile per part; inside it a switch flips between the part itself
// (wear, grade, pull/swap/fix) and its upgrade (length, trigger, magazine size).
const SLOTPAIR = { barrel: 'c:barrel', trig: 'c:action', mag: 'c:mag' };
const PAIRSUB = { 'c:barrel': ['barrel', 'Barrel', 'Length'], 'c:action': ['trig', 'Action', 'Trigger'], 'c:mag': ['mag', 'Feed', 'Magazine'] };
(() => { const st = document.createElement('style'); st.textContent = `#panel .cseg{display:flex;gap:6px;margin:10px 0 6px;grid-column:1/-1}
#panel .cseg button{flex:1;min-width:0;background:#1d2230;color:#cfd6e4;border:1px solid #2f3647;border-radius:10px;padding:7px 6px;font:700 13px Rubik,system-ui,sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px}
#panel .cseg button small{font:600 11px Rubik,system-ui,sans-serif;opacity:.75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
#panel .cseg button.on{background:#f2c230;color:#12151d;border-color:#f2c230}#panel .gtile .gfx.up{left:auto;right:4px;top:4px;bottom:auto;background:#4fc3f7;color:#062033}`; document.head.appendChild(st); })();
{ const _cr = cfgRender; cfgRender = function (H, o) { const keys = new Set((o.slots || []).map(s => s.key)), att = {};
  o.slots = (o.slots || []).filter(s => { const pk = SLOTPAIR[s.key]; if (pk && keys.has(pk)) { att[pk] = s; return false; } return true; });
  const real = o.selSlot, shown = SLOTPAIR[real] && att[SLOTPAIR[real]] ? SLOTPAIR[real] : real, pair = PAIRSUB[shown] && att[shown] ? shown : null; o.selSlot = shown;
  const r = _cr(H, o), id = Panel.wbGun, m = (id && G.wmods[id]) || {};
  // the merged tile shows when the part has an upgrade fitted
  for (const pk in att) { const a = att[pk], ak = PAIRSUB[pk][0]; if ((m[ak] | 0) || a.badge && /SPARE/.test(a.badge)) { const t = H.body.querySelector('.gtile[data-k="' + pk + '"]'); if (t) t.appendChild(H.mk('span', 'gfx up', (m[ak] | 0) ? '+UP' : a.badge)); } }
  if (pair) { const [ak, pn, un] = PAIRSUB[pair], titles = H.body.querySelectorAll('.ptitle.csub'), el = titles[titles.length - 1]; if (el) { const seg = H.mk('div', 'cseg'), c = id ? gcond(id) : {}, k = pair.slice(2), v = m[ak] | 0;
    const B = (lab, sub, key) => { const b = H.mk('button', real === key ? 'on' : ''); b.appendChild(H.mk('span', '', lab)); b.appendChild(H.mk('small', '', sub)); b.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); o.onSlot(key); Panel.render(); }; seg.appendChild(b); };
    B(pn + ' part', c.miss && c.miss[k] ? 'missing' : (GRN[cgrade(id, k)] || 'Stock') + ' · ' + pct(c[k] ?? 1), pair); B(un, v ? WSLOTS[ak].o[v][0].split(' —')[0] : 'standard', ak); el.replaceWith(seg); } }
  return r; }; }
// tiles need to know their key so the merged badge can find them
{ const _gt = gTile; gTile = function (H, grid, side, key, e, name, n, opt) { const t = _gt(H, grid, side, key, e, name, n, opt); try { if (t && typeof key === 'string') t.dataset.k = key; } catch (er) { } return t; }; }

// ================= gun benches work like the car menu on phones =================
// Held upright, the card for whatever you've selected (a gun, a spare part, or the slot/option on the bench) is pinned
// as a bottom sheet with its buttons, and only the grids above it scroll — no scrolling down to act on a part.
(() => { const st = document.createElement('style'); st.textContent = `@media (orientation:portrait){#panel .pbody.gsheet>.pcol.gunsheet{flex:0 1 auto;max-height:58%}
#panel .gunsheet .gdet2{margin:0;border:0;background:transparent;padding:2px 2px 4px}#panel .gunsheet .gdet2 .pbs .pb{padding:12px 6px;font-size:14px;min-height:46px}
#panel .gunsheet .ldet{margin:0;border:0;background:transparent;padding:2px}#panel .gunsheet .ldet .lx{display:none}#panel .gunsheet .ldet .lbtns .pb{min-height:48px}}`; document.head.appendChild(st); })();
{ const _r = Panel.render; Panel.render = function () { const pe = pEl(), old = pe && pe.querySelector('.pbody > .gtop'), sc = old && this._gsMode === this.mode + ':' + (this.wbGun || '') ? old.scrollTop : null;
  const r = _r.apply(this, arguments);
  try { if ((this.mode !== 'gunws' && this.mode !== 'guns' && this.mode !== 'devws') || !matchMedia('(orientation:portrait)').matches) return r; const body = pEl().querySelector('.pbody'); if (!body || body.classList.contains('gsheet')) return r;
    const d = body.querySelector(this.wbGun ? '.gdet2' : '.ldet'); if (!d) { this._gsMode = null; return r; }
    const cols = body.querySelectorAll(':scope > .pcol'), top = document.createElement('div'); top.className = 'gtop'; body.insertBefore(top, cols[0]); cols.forEach(c => top.appendChild(c));
    const sh = document.createElement('div'); sh.className = 'pcol gsheetc gunsheet'; const h = document.createElement('div'); h.className = 'gsheetx'; sh.appendChild(h);
    if (!this.wbGun) h.onclick = e => { e.stopPropagation(); this.gwSel = null; this.gpSel = null; this.gwConf = null; this.render(); };
    sh.appendChild(d); body.appendChild(sh); body.classList.add('gsheet');
    if (sc !== null) top.scrollTop = sc; else { const s = top.querySelectorAll('.gtile.sel'); const last = s[s.length - 1]; if (last) setTimeout(() => last.scrollIntoView({ block: 'nearest' }), 0); }
    this._gsMode = this.mode + ':' + (this.wbGun || ''); } catch (e) { console.error(e); } return r; }; }
