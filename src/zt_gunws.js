// ================= HOME GUN WORKSHOP: strip and fit attachments yourself, only with parts you own =================
const GPARTS = () => G.save.gparts || (G.save.gparts = {});
const GSLOTS = Object.keys(WSLOTS).filter(s => s !== 'skin');
const gpFits = (id, s, v) => v > 0 && WSLOTS[s] && WSLOTS[s].o[v] && (WSLOTS[s].o[v][2] || []).includes(id);
const gpName = (s, v) => WSLOTS[s].n + ' — ' + WSLOTS[s].o[v][0].split(' —')[0];
function gpAdd(s, v) { const P = GPARTS(), k = s + ':' + v; P[k] = (P[k] | 0) + 1; }
function gunRefresh(id) { PWC = {}; const p = G.player, i = WI[id], w = pw(i); if (w.mag && p.clip[i] > w.mag) { p.ammo[i] += 0; p.clip[i] = w.mag; } }
function gPull(id, s) { const m = G.wmods[id] || {}, v = m[s] | 0; if (!v) return; gpAdd(s, v); G.wmods[id] = Object.assign({}, m, { [s]: 0 }); delete G.wown[id + s + v]; gunRefresh(id); Snd.play('ratchet'); doSave(true); }
function gFit(id, s, v) { const P = GPARTS(), k = s + ':' + v; if (!(P[k] > 0) || !gpFits(id, s, v)) return; const m = G.wmods[id] || {}, old = m[s] | 0; if (old) { gpAdd(s, old); delete G.wown[id + s + old]; } if (!--P[k]) delete P[k]; G.wmods[id] = Object.assign({}, m, { [s]: v }); G.wown[id + s + v] = 1; gunRefresh(id); Snd.play('cock'); doSave(true); }
const myGuns = () => WEAPONS.map((w, i) => [w, i]).filter(([w, i]) => i > 0 && !w.melee && G.player.ammo[i] > 0).map(([w]) => w.id);
PMODES.gunws = function (H) {
  H.title.textContent = '🔧 Gun workshop'; const L = myGuns(), P = GPARTS();
  if (!L.includes(this.gsel)) this.gsel = L[0] || null;
  const c0 = H.col('Your guns'); if (!L.length) { H.empty(c0, 'You don\'t own any guns. Buy one at a gun shop.'); return; }
  for (const id of L) { const w = WEAPONS[WI[id]], m = G.wmods[id] || {}, n = GSLOTS.filter(s => m[s]).length; const r = H.row(c0, '', w.name, n ? n + ' attachment' + (n > 1 ? 's' : '') : 'Stock', [H.btn(this.gsel === id ? 'On bench' : 'Work on', () => { this.gsel = id; }, this.gsel === id ? 'on' : '')]); r.querySelector('.pe').appendChild(this.icon(id, WI[id])); if (this.gsel === id) r.classList.add('sel'); }
  const id = this.gsel, m = G.wmods[id] || {}, c1 = H.col('Fitted on the ' + WEAPONS[WI[id]].name);
  const cv = H.mk('canvas', 'pgun'); cv.width = 360; cv.height = 130; c1.appendChild(cv); drawGunPreview(cv, id, m);
  for (const s of GSLOTS) { if (!WSLOTS[s].o.some((o, v) => gpFits(id, s, v))) continue; const v = m[s] | 0; H.row(c1, v ? '🔩' : '·', WSLOTS[s].n, v ? WSLOTS[s].o[v][0].split(' —')[0] : 'Stock', v ? [H.btn('Pull', () => gPull(id, s))] : []); }
  c1.appendChild(barsEl(gunStats(id)));
  const c2 = H.col('Loose parts on your bench'), ks = Object.keys(P).filter(k => P[k] > 0).sort();
  if (!ks.length) H.empty(c2, 'No spare attachments. Pull them off a gun, buy them online (Phone › Shop), or pick "Buy for my bench" at a gun shop.');
  for (const k of ks) { const [s, vs] = k.split(':'), v = +vs; if (!WSLOTS[s] || !WSLOTS[s].o[v]) continue; const fits = gpFits(id, s, v), cur = (m[s] | 0) === v; H.row(c2, '📦', gpName(s, v) + (P[k] > 1 ? ' ×' + P[k] : ''), !fits ? 'Doesn\'t fit this gun' : cur ? 'Already fitted' : m[s] ? 'Hot-swap: ' + WSLOTS[s].o[m[s]][0].split(' —')[0] + ' goes on the bench' : 'Attach it', [H.btn('Fit', () => gFit(id, s, v), 'y', !fits || cur)]); }
};
function gunPartsCol(H, title, mult) { const c = H.col(title);
  for (const s of GSLOTS) WSLOTS[s].o.forEach((o, v) => { if (!v || !o[1]) return; const pr = Math.round(o[1] * mult / 10) * 10, have = GPARTS()[s + ':' + v] | 0; H.row(c, '🔩', WSLOTS[s].n + ' — ' + o[0].split(' —')[0], money(pr) + ' · fits ' + (o[2] || []).map(g => WEAPONS[WI[g]] ? WEAPONS[WI[g]].name.split(' ')[0] : g).join(', ') + (have ? ' · on bench ' + have : ''), [H.btn('Buy', () => { if (payAny(pr)) { gpAdd(s, v); toast('Sent to your home gun bench'); } }, 'y', !canPay(pr))]); }); }
// gun shops: an extra column to buy loose parts for home
{ const gs0 = PMODES.gunshop; PMODES.gunshop = function (H) { const r = gs0.call(this, H); gunPartsCol(H, 'Buy for my bench (loose parts)', 1); return r; }; }
// the workbench at home
IT.gbench = { s: 1, act: 'Gun workshop' };
function addGunBench(s) { if (s.items.some(it => it.t === 'gbench')) return; const w = 1.1, h = .55; for (let y = 1; y < s.h - 2.2; y += .5) for (let x = 1; x < s.w - 2; x += .5) { if (s.items.some(it => x < it.x + it.w + .15 && x + w + .15 > it.x && y < it.y + it.h + .15 && y + h + .15 > it.y)) continue; s.items.push({ t: 'gbench', x, y, w, h, used: 0, small: 1 }); return; } }
function useItem(it) { if (it.t === 'gbench') { if (!canDecorate()) return toast('This isn\'t your workbench'); return Panel.open('gunws'); } return useItemS(it); }
function enterBuildingQ(b) { enterBuildingQ0(b); const s = G.scene; if (s && s.b === b && (b.type === 'safehouse' || (b.realty && owned(b) && (b.realty.kind === 'home' || b.realty.kind === 'farm'))) && canDecorate()) addGunBench(s); }
function drawItem(it, s) { if (it.t !== 'gbench') return drawItemS(it, s); const g = ctx, x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#5d4037'; g.fillRect(x, y, w, h); g.fillStyle = '#8d6e63'; g.fillRect(x + 2, y + 2, w - 4, 5); g.fillStyle = '#263238'; g.fillRect(x + w * .18, y + h * .4, w * .5, 6); g.fillRect(x + w * .18, y + h * .4 + 6, 6, 8); g.fillStyle = '#b0bec5'; g.fillRect(x + w * .75, y + h * .35, 8, 8); g.fillStyle = '#ffb300'; for (let i = 0; i < 3; i++) g.fillRect(x + w * .3 + i * 5, y + h * .78, 3, 4); }
