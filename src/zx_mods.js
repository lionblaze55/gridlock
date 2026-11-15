// ================= MODDED CARS ON THE STREET: lots of rides have rims, wings, neon, tunes — and the odd full build =================
const NOMOD = new Set(['cop', 'swat', 'taxi', 'bus', 'ambulance', 'firetruck', 'truck', 'dump', 'boxtruck', 'tractor', 'tank', 'armored']);
function streetMods(c, district) {
  const t = c.type, d = c.d; if (NOMOD.has(t) || d.boat || d.pedal || c.mods && Object.keys(c.mods).length) return;
  const sporty = ['sports', 'muscle', 'coupe', 'super', 'hyper', 'roadster', 'compact', 'sportbike', 'hyperbike', 'cafe'].includes(t), rich = ['luxsedan', 'luxsuv', 'limo', 'super', 'hyper'].includes(t);
  const r = Math.random(), tier = r < (sporty ? .3 : .45) ? 0 : r < (sporty ? .62 : .78) ? 1 : r < (sporty ? .9 : .95) ? 2 : 3; if (!tier) return;
  const m = {}, set = (k, v) => { if (MODOPTS[k] && MODOPTS[k].o[v]) m[k] = v; }, keys = new Set(carKeys(c));
  const may = k => keys.has(k);
  if (d.two) { const pk = ['mbr', 'mpp', 'mtk', 'mlt', 'mfr', 'mst', 'mbg']; for (let i = 0; i < tier + 1; i++) { const k = pick(pk); if (may(k)) set(k, rint(1, MODOPTS[k].o.length - 1)); } if (tier >= 2) set('exh', rint(1, 2)); if (tier >= 2) set('eng', rint(1, 2)); applyMods(c, m); return; }
  if (may('rim')) set('rim', rint(1, MODOPTS.rim.o.length - 1)); if (may('tint') && Math.random() < .6) set('tint', rint(1, 2));
  if (tier >= 2) { if (may('sp') && !rich) set('sp', rint(1, 3)); if (may('liv') && Math.random() < .55 && !rich) set('liv', rint(1, MODOPTS.liv.o.length - 1)); if (may('neon') && Math.random() < .45) set('neon', rint(1, MODOPTS.neon.o.length - 1)); if (may('hd') && Math.random() < .4) set('hd', rint(1, 3)); set('eng', rint(1, 2)); if (may('exh')) set('exh', rint(1, 2)); if (may('tyr') && Math.random() < .4) set('tyr', rint(1, 2)); }
  if (tier >= 3) { if (may('sk')) set('sk', 1); if (may('sp')) set('sp', 3); set('eng', 3); set('tur', 1); if (may('nos') && Math.random() < .5) set('nos', 1); if (may('hnd')) set('hnd', rint(1, 2)); if (may('exh')) set('exh', 3); if (Math.random() < .5) m.s = pick(['#111111', '#f4f4f4', '#ffd600', '#00e5ff', '#ff1744', '#76ff03']); }
  if (district && DISTRICTS[district] && DISTRICTS[district].gang && Math.random() < .3 && may('neon')) set('neon', rint(1, MODOPTS.neon.o.length - 1));
  m.p = c.color; applyMods(c, m);
}
