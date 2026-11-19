// ================= WITNESSES, DESCRIPTIONS, DISGUISES & MEMORY =================
// • Witnesses describe what they saw: your car (make and colour) and your clothes. When the call goes through, dispatch
//   puts out that description — even if you were long gone.
// • Half the witnesses don't carry a phone: they run for the nearest payphone. Stop them before they get there (or
//   just get out of sight) and the call never happens.
// • While the description is out, cops who spot the hot car or the matching outfit recognise you — even at 0★. Ditch
//   or respray the car, change clothes, and you're a stranger again; stars also fade faster when you don't match.
// • Laying low inside, unseen, cools you off; in your own safehouse, fast.
// • Neighbourhoods remember: keep doing crimes in the same ride or outfit in one district and it becomes your
//   signature there — locals and that district's cops will know you on sight.
const NAMED = [['black', '#111111'], ['white', '#f2f2f2'], ['grey', '#808080'], ['silver', '#bfc5cc'], ['red', '#c0392b'], ['maroon', '#7b1e1e'], ['orange', '#e67e22'], ['yellow', '#f1c40f'], ['gold', '#c9a23a'], ['green', '#27ae60'], ['dark green', '#1e4d2b'], ['olive', '#556b2f'], ['teal', '#16a085'], ['blue', '#2471a3'], ['navy', '#1b2a4a'], ['light blue', '#5dade2'], ['purple', '#8e44ad'], ['pink', '#ff6fae'], ['brown', '#6e4b2a'], ['beige', '#d8c3a5']];
function colName(hex) { if (typeof hex !== 'string' || hex[0] !== '#') return ''; const h = hex.length === 4 ? '#' + [...hex.slice(1)].map(c => c + c).join('') : hex, v = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); let best = '', bd = 1e9;
  for (const [n, c] of NAMED) { const w = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)), d = (v[0] - w[0]) ** 2 * .3 + (v[1] - w[1]) ** 2 * .59 + (v[2] - w[2]) ** 2 * .11; if (d < bd) { bd = d; best = n; } } return best; }
const carDesc = c => c ? colName(c.color) + ' ' + (c.d && c.d.name ? c.d.name : c.type) : '';
const carKey = c => c ? c.type + ':' + c.color : null;
function lookNow() { const p = G.player, c = pCar(); return { car: c || null, carKey: carKey(c), carTxt: carDesc(c), shirt: p.shirt, shirtTxt: colName(p.shirt) }; }
const DESC_LIFE = 480;
const descLive = () => G.desc && (stars() > 0 || G.t - G.desc.t < DESC_LIFE);
const matchCar = () => { const D = G.desc, c = pCar(); return !!(D && D.car && c && c === D.car && c.color === D.carColor); };
const matchShirt = () => !!(G.desc && G.desc.shirt && G.player.shirt === G.desc.shirt);
function fileDesc(look, how) { if (!look) return; const old = G.desc; G.desc = { car: look.car, carColor: look.car && look.car.color, carTxt: look.carTxt, shirt: look.shirt, shirtTxt: look.shirtTxt, t: G.t };
  const bits = []; if (look.car) bits.push('in a ' + look.carTxt); if (look.shirtTxt) bits.push('wearing ' + look.shirtTxt); if (bits.length && !(old && old.carTxt === G.desc.carTxt && old.shirt === G.desc.shirt && G.t - old.t < 30)) msg('📻 Dispatch: suspect ' + bits.join(', ') + '.', '#7fdbff'); }

// ---------- witnesses carry a description, and some run for a payphone ----------
{ const _rc = reportCrime; reportCrime = function (st, label, how, forcedWho) { const n0 = G.reports.length, r = _rc(st, label, how, forcedWho); const R = G.reports[G.reports.length - 1];
  if (G.reports.length > n0 && R) { R.look = lookNow(); memAdd(R.look);
    const w = R.who; if (w instanceof Ped && !G.scene && !w.inside && W.phones.length && Math.random() < .5) { const ph = W.phones.slice().sort((a, b) => dist2(a.x, a.y, w.x, w.y) - dist2(b.x, b.y, w.x, w.y))[0];
      if (ph && dist2(ph.x, ph.y, w.x, w.y) < 750 * 750) { R.phone = ph; R.t = G.t + 999; w.toPhone = ph; w.persist = 1; pedSay(w, pick(['Where\'s a phone?!', 'I need a phone!', 'Somebody call the cops — I\'ll find a phone!'])); } } }
  return r; }; }
{ const _rt = reportTick; reportTick = function () { const before = G.reports.slice(); _rt(); for (const r of before) if (!G.reports.includes(r) && !(r.who && r.who.dead) && r.look && !G.player.dead) fileDesc(r.look, 'witness');
  for (const r of G.reports) if (r.phone && r.who) { const w = r.who; if (w.dead) continue; const d = dist(w.x, w.y, r.phone.x, r.phone.y);
    if (d < 34) { if (!r.calling) { r.calling = 1; r.t = G.t + 3; w.state = 'idle'; w.still = 1; pedSay(w, pick(['Police? I need to report a crime!', '911? Yes — I saw everything!', 'Hello, police? Hurry!'])); } }
    else if (G.t - r.t0 > 45) { r.t = G.t + 1; } else walkTo(w, r.phone.x, r.phone.y + 10, 150); } }; }
// a cop seeing it himself files the description on the spot
{ const _ct = crimeT; crimeT = function (sev, label) { const cop = G.sil ? G.sil.cop : copSees(); const r = _ct(sev, label); if (cop && sev >= .3) { const L = lookNow(); fileDesc(L, 'cop'); memAdd(L); } return r; }; }

// ---------- neighbourhood memory ----------
const MEM = () => G.save.mem || (G.save.mem = {});
function memAdd(look) { const p = G.player, x = G.scene ? G.outPos.x : p.x, y = G.scene ? G.outPos.y : p.y, d = districtAt(x, y), M = MEM(), m = M[d] || (M[d] = { car: {}, shirt: {}, t: 0 }); m.t = Date.now();
  if (look.carKey) m.car[look.carKey] = (m.car[look.carKey] || 0) + 1; if (look.shirt) m.shirt[look.shirt] = (m.shirt[look.shirt] || 0) + 1; }
function knownHere() { const p = G.player; if (G.scene) return null; const m = MEM()[districtAt(p.x, p.y)]; if (!m) return null; const c = pCar(), ck = carKey(c);
  if (ck && (m.car[ck] || 0) >= 3) return 'car'; if ((m.shirt[p.shirt] || 0) >= 3 && !c) return 'shirt'; return null; }

// ---------- the tick: recognition, cooling off, laying low ----------
function copLooking(r) { const p = G.player, P = pCar() || p; for (const q of G.peds) if (q.role === 'cop' && !q.dead && !q.lawJob && dist2(q.x, q.y, P.x, P.y) < r * r && losClear(q.x, q.y, P.x, P.y)) return q;
  for (const c of G.cars) if ((c.type === 'cop' || c.type === 'swat') && c.driver && !c.dead && !c.lawJob && dist2(c.x, c.y, P.x, P.y) < (r + 60) ** 2 && losClear(c.x, c.y, P.x, P.y)) return c; return null; }
function witnessTick(dt) { const p = G.player; if (p.dead) return; const st = stars(), live = descLive(), mc = live && matchCar(), ms = live && matchShirt();
  // changed your look?
  if (G.desc && live) { const lookOK = !mc && !ms; if (lookOK && !G.desc.lostMsg && (G.desc.car || G.desc.shirt)) { G.desc.lostMsg = 1; if (st > 0 || G.t - G.desc.t < 60) msg('🕶 You don\'t match the description anymore.', '#2ecc71'); } if (!lookOK) G.desc.lostMsg = 0; }
  if (G.desc && !live) G.desc = null;
  // stars: hot car slows the search down, a new look speeds it up, hiding inside cools you off
  if (st > 0) { const un = G.t - G.lastSeen; if (un > 1) { if (mc) G.lastSeen += dt * .5; else if (G.desc && !ms) G.lastSeen -= dt * .8;
      if (G.scene) { const safe = G.scene.b && (G.scene.b.type === 'safehouse' || (owned(G.scene.b) && G.scene.b.realty && G.scene.b.realty.kind !== 'biz')); G.lastSeen -= dt * (safe ? 2.5 : 1); } } }
  // recognition when you're not wanted (or between stars)
  if ((G.recT = (G.recT || 0) - dt) > 0 || G.scene) return; G.recT = 1;
  if (st === 0 && live && (mc || ms)) { const q = copLooking(mc ? 380 : 220); if (q && Math.random() < (mc ? .45 : .2)) { G.heat = Math.max(G.heat, 1.2); G.heatL = Math.max(G.heatL || 0, 1.2); markSeen(); G.starFlash = 1.5; Snd.play('starup'); msg(mc ? '🚔 "That\'s the ' + G.desc.carTxt + ' from the call!"' : '🚔 "Hey — you match the description!"', '#ff6b6b'); if (q instanceof Ped) { pedSay(q, mc ? 'That\'s the car!' : 'Hold it right there!'); q.state = 'chase'; } } }
  const kh = knownHere(); if (kh && (G.knownT = (G.knownT || 0) - 1) <= 0) { G.knownT = rnd(25, 45); const near = G.peds.find(q => !q.dead && !q.gang && q.role !== 'cop' && dist2(q.x, q.y, p.x, p.y) < 200 * 200); if (near) pedSay(near, kh === 'car' ? pick(['That car again…', 'Isn\'t that the car from the news?', 'Not this guy again.']) : pick(['Hey… I know you.', 'You\'re the one from before…', 'Keep walking, trouble.']));
    if (st === 0) { const q = copLooking(300); if (q && Math.random() < .3) { G.heat = Math.max(G.heat, .7); toast('A cop around here knows your ' + (kh === 'car' ? 'ride' : 'face') + ' — he\'s watching you.'); } } } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') try { witnessTick(dt); } catch (e) { console.error(e); } }; }
// neighbourhood memory fades over real days
{ const _u = update; update = function (dt) { _u(dt); if ((G.memT = (G.memT || 0) - dt) > 0) return; G.memT = 60; const M = MEM(), now = Date.now(); for (const d in M) { const m = M[d]; if (now - m.t > 36e5 * 6) { for (const k in m.car) if (--m.car[k] <= 0) delete m.car[k]; for (const k in m.shirt) if (--m.shirt[k] <= 0) delete m.shirt[k]; m.t = now - 36e5 * 5; } } }; }

// ---------- HUD tags (drawn under the stars) ----------
function descLines() { const out = []; if (!descLive()) { const kh = knownHere(); if (kh) out.push(['👁 KNOWN AROUND HERE', '#f2c230']); return out; }
  if (matchCar()) out.push(['🚗 HOT CAR', '#ff6b6b']); if (matchShirt()) out.push(['👕 OUTFIT DESCRIBED', '#ff9f43']); if (!matchCar() && !matchShirt()) out.push(['🕶 NO MATCH', '#2ecc71']);
  const kh = knownHere(); if (kh) out.push(['👁 KNOWN AROUND HERE', '#f2c230']); return out; }
