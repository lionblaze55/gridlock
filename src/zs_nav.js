// ================= BIGGER MINIMAP + QUICK GPS ("go to nearest…", your homes, garages and cars) =================
const MSZ = () => [1, 1.3, 1.6][G.settings.miniSize | 0];
function drawMiniButtons(sc) { const R = 54 * sc * MSZ(), cx = VW - R - 12, cy = 46 * sc + R + 6, bw = 34 * sc, bh = 24 * sc, bx = cx - R - 4 * sc - (R > 60 * sc ? 18 * sc : 0), by0 = cy - R + 64 * sc;
  const btn = (y, label, key) => { Input[key] = [bx - 8, y - 4, bw + 16, bh + 8]; ctx.fillStyle = 'rgba(10,14,22,.85)'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, y, bw, bh, 7) : ctx.rect(bx, y, bw, bh); ctx.fill(); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 1.5; ctx.stroke(); txt(label, bx + bw / 2, y + bh * .7, 11 * sc, '#f2c230', 'center'); };
  btn(by0 - 30 * sc, ['S', 'M', 'L'][G.settings.miniSize | 0], 'miniSBtn'); btn(by0 - 60 * sc, 'GPS', 'gpsBtn'); }
function drawMinimap(sc) { drawMinimapV(sc); drawMiniButtons(sc); }
// ---------- destinations ----------
const NAVCATS = [
  ['🏠', 'Your homes', () => residences().filter(b => b.door).map(b => ({ x: b.door.x, y: b.door.y, n: b.name }))],
  ['P', 'Garage pad', () => homeGarages().map(g => ({ x: g.x, y: g.y, n: 'Garage — ' + (g.b.realty ? g.b.realty.name : g.b.name) }))],
  ['🚗', 'Your cars', () => G.cars.filter(c => c.owned && c.persist && !c.dead && c !== pCar() && !c.d.boat).map(c => ({ x: c.x, y: c.y, n: 'Your ' + c.d.name }))],
  ['⛵', 'Your boats', () => G.cars.filter(c => c.owned && c.d.boat && !c.dead).map(c => ({ x: c.x, y: c.y, n: 'Your ' + c.d.name }))],
  ['🔑', 'Your properties', () => W.buildings.filter(b => b.door && b.realty && owned(b)).map(b => ({ x: b.door.x, y: b.door.y, n: b.realty.name || b.name }))],
  ['✚', 'Hospital', () => byType('hospital')], ['★', 'Police', () => byType('police')], ['🔫', 'Gun shop', () => byType('gunshop')], ['🔧', 'Mod shop', () => W.sprays.filter(z => z.kind === 'mod').map(z => ({ x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2, n: z.b ? z.b.name : 'Mod shop' }))],
  ['⚙', 'Chop shop', () => W.sprays.filter(z => z.kind === 'chop').map(z => ({ x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2, n: z.b ? z.b.name : 'Chop shop' }))], ['🏛', 'Bank', () => byType('bank')], ['$', 'ATM / bank', () => byType('bank')],
  ['🛒', 'Store', () => byKind('conv', 'gas', 'general')], ['🍴', 'Food', () => byType('diner')], ['🍺', 'Bar', () => byType('bar')], ['🎵', 'Club', () => byType('club')], ['💍', 'Pawn shop', () => byType('pawn')],
  ['💊', 'Pharmacy', () => byKind('pharmacy')], ['🚲', 'Bikes & boards', () => byKind('sports')], ['🔨', 'Hardware', () => byKind('hardware')], ['🎣', 'Bait & tackle', () => byKind('tackle')], ['👕', 'Clothes', () => byKind('clothes')], ['✂', 'Salon', () => byKind('salon')],
  ['🥕', 'Market', () => byKind('market')], ['🐾', 'Pet shop', () => byKind('pets')], ['⛽', 'Gas station', () => byKind('gas')], ['🎰', 'Casino', () => byType('casino')], ['🏭', 'Factory', () => byType('factory')],
  ['☎', 'Payphone (jobs)', () => W.phones.map(p => ({ x: p.x, y: p.y, n: 'Payphone' }))], ['🌿', 'Dealer', () => W.dealerSpots.map(d => ({ x: d.x, y: d.y, n: 'Dealer' }))], ['$', 'Street gig', () => G.peds.filter(q => q.gig && !q.dead).map(q => ({ x: q.x, y: q.y, n: 'Someone offering work' }))],
];
const byType = t => W.buildings.filter(b => b.type === t && b.door).map(b => ({ x: b.door.x, y: b.door.y, n: b.name }));
const byKind = (...k) => W.buildings.filter(b => b.type === 'store' && b.door && k.includes(b.kind2)).map(b => ({ x: b.door.x, y: b.door.y, n: b.name }));
function nearestOf(list) { const o = herePos(); let b = null, bd = 1e18; for (const q of list) { const d = dist2(q.x, q.y, o.x, o.y); if (d < bd) { bd = d; b = q; } } return b; }
const mdist = q => { const o = herePos(), d = Math.hypot(q.x - o.x, q.y - o.y) / T * 4; return d < 1000 ? Math.round(d / 10) * 10 + ' m' : (d / 1000).toFixed(1) + ' km'; };
PMODES.goto = function (H) {
  H.title.textContent = '🧭 Quick GPS'; const mine = NAVCATS.slice(0, 5), rest = NAVCATS.slice(5);
  const c1 = H.col('Your stuff'); let any = 0;
  for (const [ic, n, f] of mine) for (const q of f().sort((a, b) => dist2(a.x, a.y, herePos().x, herePos().y) - dist2(b.x, b.y, herePos().x, herePos().y)).slice(0, n === 'Your cars' ? 6 : 4)) { any = 1; H.row(c1, ic, q.n, mdist(q), [H.btn('Go', () => { setNav({ x: q.x, y: q.y, name: q.n }); Panel.close(); closeMap(); }, 'y')]); }
  if (!any) H.empty(c1, 'Nothing yet.');
  const c2 = H.col('Nearest…');
  for (const [ic, n, f] of rest) { const q = nearestOf(f()); if (!q) continue; H.row(c2, ic, n, q.n + ' · ' + mdist(q), [H.btn('Go', () => { setNav({ x: q.x, y: q.y, name: q.n }); Panel.close(); closeMap(); }, 'y')]); }
  if (G.nav) H.foot.appendChild(H.btn('Clear GPS route (' + G.nav.name + ')', () => { G.nav = null; }));
};
function openGoto() { if (G.mode !== 'play' || !G.player || G.player.dead) return; Panel.open('goto'); }
