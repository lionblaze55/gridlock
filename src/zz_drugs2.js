// ================= DRUG EMPIRE: four new (fictional) products, home cooking for all of them, more labs, and a lab business you can scale up =================
DRUGS.push({ id: 'caps', n: 'Caps', base: 40, col: '#a1887f' }, { id: 'syrup', n: 'Syrup', base: 100, col: '#9575cd' }, { id: 'frost', n: 'Frost', base: 200, col: '#b3e5fc' }, { id: 'velvet', n: 'Velvet', base: 450, col: '#e57373' });
Object.assign(ITEMS, { caps: { n: 'Caps', v: 40, w: 1, k: 'drug', e: '🍄' }, syrup: { n: 'Syrup', v: 100, w: 1, k: 'drug', e: '🧃' }, frost: { n: 'Frost', v: 200, w: 1, k: 'drug', e: '❄' }, velvet: { n: 'Velvet', v: 450, w: 1, k: 'drug', e: '🌹' } });
Object.assign(DFX, {
  caps: { dur: 60, load: 1.5, n: 'Tripping', col: [161, 136, 127], txt: ['The sidewalk is melting. Nicely.', 'Every streetlight has a face.', 'Woah. Woah.'] },
  syrup: { dur: 55, load: 2, n: 'Leaned', col: [149, 117, 205], txt: ['Everything is slooow.', 'You could sleep standing up.', 'Purple. Everything\'s purple.'] },
  frost: { dur: 35, load: 3, crash: 22, n: 'Frosted', col: [179, 229, 252], txt: ['Ice cold focus.', 'You see every move before it happens.', 'Sharp. Clear. Cold.'] },
  velvet: { dur: 28, load: 4.5, crash: 25, n: 'Velvet', col: [229, 115, 115], txt: ['Pure bliss.', 'Nothing hurts. Nothing matters.', 'Like floating on silk.'] } });
LABREC.unshift({ id: 'caps', ing: { supplies: 1 }, out: 4, diff: .8, note: 'Grows in a damp box. Hard to mess up.' });
LABREC.push({ id: 'syrup', ing: { supplies: 2 }, out: 3, diff: 1.2, note: 'Cough syrup, cut and sweetened.' }, { id: 'frost', ing: { glint: 1, supplies: 2 }, out: 3, diff: 1.6, note: 'Glint, washed and crystallised.' }, { id: 'velvet', ing: { ember: 1, frost: 1, supplies: 2 }, out: 2, diff: 2.2, note: 'The top shelf. One slip and the room goes up.' });
// dealers each carry Leaf plus a few others (all eight would be a wall of buttons on a phone)
{ const ALL = DRUGS.slice(), _dm = dealerMenu; dealerMenu = function (q) { const k = hash01(q.name || 'x'), sub = ALL.filter((d, i) => i === 0 || hash01((q.name || 'x') + d.id) < .45 || (G.inv[d.id] | 0) > 0).slice(0, 5); DRUGS.length = 0; DRUGS.push(...sub); try { return _dm(q); } finally { DRUGS.length = 0; DRUGS.push(...ALL); } }; }
// ---------- more lab properties (one per new product) ----------
function addLabs2() { if (!W || !W.realty || W._labs2) return; W._labs2 = 1; const used = new Set();
  for (const [drug, pr, nm, types] of [['caps', 40000, 'Mushroom Cellar', ['barn', 'warehouse']], ['syrup', 70000, 'Syrup Works', ['warehouse', 'factory']], ['frost', 120000, 'Frost Lockup', ['warehouse', 'factory']], ['velvet', 200000, 'Velvet Lab', ['warehouse', 'factory', 'office']]]) {
    const C = W.buildings.filter(b => types.includes(b.type) && b.door && !b.realty && !used.has(b.id) && !(W.nOld !== undefined && b.id >= W.nOld) && !inBase(b.door.x, b.door.y)).sort((a, b) => hash01(nm + a.id) - hash01(nm + b.id)); const b = C[0]; if (!b) continue; used.add(b.id);
    b.name = nm; b.locked = 1; b.realty = { id: b.id, name: nm, kind: 'lab', price: pr, drug }; W.realty.push(b.realty); } }
{ const _er = econRealty; econRealty = function () { _er(); addLabs2(); }; }
// ---------- the lab as a business ----------
const LABRATE = [0, .8, 1.4, 2.2, 3.2, 4.5], labLvl = O => clamp(O.lvl | 0, 1, 5);
const LMUL = new WeakMap(), labMul = O => { if (LMUL.has(O)) return LMUL.get(O); const r = W.realty.find(x => LIFE().own[x.id] === O), D = r && DRUGS.find(d => d.id === r.drug), m = D ? clamp(Math.sqrt(450 / D.base), 1, 3.6) : 1; if (r) LMUL.set(O, m); return m; };
const labCap = O => Math.round((40 * labLvl(O) + 30 * (O.cooks | 0)) * labMul(O));
const labRate = O => LABRATE[labLvl(O)] * (1 + .35 * (O.cooks | 0)) * labMul(O);
const labBurn = O => (4 * (1 + .25 * (labLvl(O) - 1)) * (1 + .3 * (O.cooks | 0))) / 4;
const labSupply = (O, D) => Math.max(200, Math.round(50 / labBurn(O) * labRate(O) * D.base * .22 / 50) * 50);
const labRaid = O => .005 * (O.up && O.up.sec ? .25 : 1) * (1 + .15 * (labLvl(O) - 1) + .25 * (O.crew | 0) + .1 * (O.cooks | 0));
function labCrew(b, r, O, h) { const n = O.crew | 0; if (!n || O.prod < 1) return; const D = DRUGS.find(d => d.id === r.drug) || ITEMS[r.drug]; const sell = Math.min(O.prod, 1.6 * n * h * labMul(O)); O.prod -= sell; O.safe = (O.safe || 0) + sell * (D.base || D.v) * .7;
  if (Math.random() < .004 * n * h * (O.up && O.up.sec ? .5 : 1)) { O.crew = n - 1; const lost = Math.floor(O.prod * .25); O.prod -= lost; msg('A street crew from ' + b.name + ' got busted' + (lost ? ' — ' + lost + ' units seized.' : '.'), '#ff6b6b'); if (Math.random() < .3) { G.heat = Math.max(G.heat, 1.2); markSeen(); msg('One of them talked. The cops are looking for you.', '#ff6b6b'); } } }
function labPanel(H, c2, b, r, O, at, gps, upg, collect) { const D = DRUGS.find(d => d.id === r.drug), units = Math.floor(O.prod), cap = labCap(O), lv = labLvl(O), sp = labSupply(O, D);
  H.row(c2, ITEMS[r.drug] ? ITEMS[r.drug].e : '🧪', `${D.n}: ${units} / ${cap} units`, O.sup > 0 ? `Cooking · supplies ${Math.round(O.sup)}% · ~${labRate(O).toFixed(1)} units/hour · street value ${money(units * D.base)}` : 'Stopped — no supplies');
  H.row(c2, '📦', 'Buy supplies', '+50% · ' + money(sp), [H.btn('Order', () => { if (payAny(sp)) O.sup = Math.min(100, O.sup + 50); }, 'y', O.sup > 50 || !canPay(sp))]);
  if ((O.crew | 0) > 0 || O.safe > 0) collect();
  H.row(c2, '🚐', 'Sell a shipment', units >= 5 ? `Drive ${units} units to a buyer for about ${money(units * D.base * .8)}+` : 'Needs at least 5 units', [H.btn('Load van', () => startShipment(b, units), 'y', units < 5 || !!G.mission)]);
  H.row(c2, '🎒', 'Carry product yourself', at ? 'Take what fits in your bag' : 'You have to be at the lab', [at ? H.btn('Take', () => { let n = 0; while (O.prod >= 1 && invAdd(r.drug, 1, 1)) { O.prod--; n++; } toast(n ? 'Took ' + n + ' ' + D.n : 'Your bag is full'); }, '', units < 1) : gps(b)]);
  c2.appendChild(H.mk('div', 'ptitle', 'Grow the operation'));
  const next = Math.round(r.price * [0, .4, .8, 1.3, 2][lv] / 500) * 500; if (lv < 5) H.row(c2, '⬆', 'Equipment level ' + (lv + 1) + ' of 5', `${(LABRATE[lv + 1] * (1 + .35 * (O.cooks | 0)) * labMul(O)).toFixed(1)} units/hour · stores ${Math.round((40 * (lv + 1) + 30 * (O.cooks | 0)) * labMul(O))} · ${money(next)}`, [H.btn('Upgrade', () => { if (payAny(next)) { O.lvl = lv + 1; Snd.play('cash'); } }, 'y', !canPay(next))]); else H.row(c2, '✓', 'Equipment level 5', 'Industrial scale');
  const ck = O.cooks | 0, ckP = Math.round(r.price * .15 / 500) * 500 + 4000; H.row(c2, '👨‍🍳', 'Cooks: ' + ck + ' / 3', ck < 3 ? `+35% output & +30 storage each · uses more supplies · ${money(ckP)} to hire` : 'Fully staffed', ck < 3 ? [H.btn('Hire', () => { if (payAny(ckP)) O.cooks = ck + 1; }, 'y', !canPay(ckP))] : []);
  const cr = O.crew | 0, crP = 6000 + cr * 4000; H.row(c2, '🧢', 'Street crews: ' + cr + ' / 3', cr < 3 ? `Sell ~${(1.6 * labMul(O)).toFixed(1)} units/hour each straight from the lab, 70% of street price into the safe · busts happen · ${money(crP)}` : 'Max crews', cr < 3 ? [H.btn('Hire', () => { if (payAny(crP)) O.crew = cr + 1; }, 'y', !canPay(crP))] : []);
  upg('sec', 'Security crew', 'Far fewer raids and busts', 5000);
  H.row(c2, '🚨', 'Raid risk', ['Low', 'Moderate', 'High', 'Very high'][clamp(Math.floor(labRaid(O) / .005), 0, 3)] + ' — bigger operations draw attention', []); }
// ---------- home cooking: point people at it ----------
{ const ph = PMODES.phone; PMODES.phone = function (H) { const r = ph.call(this, H); if (this.tab !== 'empire') return r; const col = H.body.querySelector('.pcol'); if (!col) return r; const has = (LIFE().deco || {}) && JSON.stringify(G.save.decor || G.save.deco || {}).includes('chemlab');
  H.row(col, '⚗', 'Home cooking', has ? 'Your home lab can cook ' + LABREC.map(x => ITEMS[x.id].n).join(', ') + '. Buy lab supplies from dealers.' : 'Buy a Home lab from your stash › furniture ($2,500) to cook all 7 lab drugs at home. Dealers sell supplies.', []); return r; }; }
