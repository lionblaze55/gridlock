// ================= 1.95 fixes: GPS to the airport & new places, respawn grace for hit squads, gang grudge repair =================
NAVCATS.push(['✈', 'Airport', () => W.airport ? [{ x: W.airport.office.x, y: W.airport.office.y, n: 'San Varro Airport' }] : []],
  ['🔌', 'Byte Depot (electronics)', () => W.byteDepot && W.byteDepot.door ? [{ x: W.byteDepot.door.x, y: W.byteDepot.door.y, n: 'Byte Depot' }] : []],
  ['💼', 'Office for sale', () => W.buildings.filter(b => b.office && b.door && !owned(b)).map(b => ({ x: b.door.x, y: b.door.y, n: b.name + ' (for sale)' }))],
  ['📡', 'CityNet relay (not hacked)', () => (W.relays || []).filter(r => !HKS().nodes[r.d]).map(r => ({ x: r.x, y: r.y, n: (DISTRICTS[r.d] || {}).name + ' relay' }))],
  ['🪖', 'Fort Varro', () => W.base ? [{ x: (W.base.x0 + W.base.x1) / 2, y: W.base.y1 + T, n: 'Fort Varro' }] : []]);
{ const _rs = respawnSafety; respawnSafety = function () { G.respawnT = G.t; return _rs.apply(this, arguments); }; }
// a bug in 1.92–1.94 blamed you whenever a gang's supply truck crashed or lost its driver (−20 rep and a grudge each time).
// Saves from those versions get one amnesty: gangs that turned on you cool off to wary, hunts and grudges are dropped.
{ const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play' || !G.save || G.save.fix195) return; G.save.fix195 = 1; let n = 0;
  try { for (const g in GANGS) { if ((G.rep[g] | 0) <= -30) { G.rep[g] = -20; n++; } if (G.gangAggro[g] > 0 && G.gangAggro[g] < 500) G.gangAggro[g] = 0; } const F = typeof FAC === 'function' ? FAC() : {}; for (const g in F) if (F[g]) { F[g].hunt = 0; F[g].hitCD = 120; } } catch (e) { }
  if (n) msg('🤝 Word on the street: the ' + n + ' crew' + (n > 1 ? 's' : '') + ' that wanted you dead have cooled off — for now.', '#2ecc71'); doSave(); }; }
