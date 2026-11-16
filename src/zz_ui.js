// ================= MENU CLEAN-UP: one garage screen, one parts catalogue =================
function openGarageAny() { const gs = homeGarages(); if (!gs.length) return toast('No garage here'); const p = G.scene ? G.outPos : G.player; let g = gs[0]; for (const h of gs) if (dist2(h.x, h.y, p.x, p.y) < dist2(g.x, g.y, p.x, p.y)) g = h; Panel.open('hgarage', { g }); }
{ const pj = PMODES.project; PMODES.project = function (H) { if (typeof migrateShells === 'function') migrateShells(); this.tab = 'order'; const r = pj.call(this, H); H.title.textContent = '🛒 Car parts & shells — delivered to your garage';
  const tabs = H.el.querySelector('.ptabs'); if (tabs) { tabs.innerHTML = ''; const mk = (t, f) => { const b = H.mk('button', '', t); b.onclick = () => { Snd.play('ui'); f(); }; tabs.appendChild(b); }; mk('🅿 Garage & workshop', openGarageAny); if (G.scene) mk('← Stash', () => Panel.open('store', { kind: 'home' })); mk('📱 Phone', () => Panel.open('phone', { tab: 'shop' })); }
  partsShopCol(H); return r; }; }
// ---------- property: buying adds garage space (and says so); selling is blocked while the cars wouldn't fit ----------
const propSlots = id => { const b = W.buildings[id], r = b && b.realty; if (!r) return 0; const e = garSlots().find(s => s[0] === (r.name || b.name)); return e ? e[1] : 0; };
{ const _bp = buyProperty; buyProperty = function (r) { const c0 = garCap(), ok = _bp(r); if (ok && garCap() > c0) msg('🅿 Garage space: ' + c0 + ' → ' + garCap() + ' (+' + (garCap() - c0) + ' from ' + r.name + '). It has its own GARAGE pad outside.', '#4fc3f7'); return ok; }; }
// selling property lives in zz_estate.js
// ---------- performance mods: side effects that were missing (weight, armor, ride height) — brake upgrades now count for normal braking too ----------
{ const _cs = calcSt; calcSt = function (d, m) { const s = _cs(d, m); m = m || {}; const wgt = Math.min(2, m.wgt | 0), arm = m.arm | 0, hnd = m.hnd | 0;
  s.brk *= [1, 1.06, 1.12][wgt] * (1 - .04 * arm); s.acc *= 1 - .035 * arm; s.max *= 1 - .012 * arm; s.grip *= [1, 1.02, 1.04][wgt] * (1 - .015 * arm); s.steer *= 1 - .02 * arm;
  if (typeof s.off === 'number') s.off = clamp(s.off - .07 * hnd, 0, 1); return s; }; }
