// ================= MAP ICONS · STREET GIGS · CHASERS FOLLOW YOU INDOORS =================
// ---------- icon badges (cached) ----------
const ICS = new Map();
const lum = c => { const h = c.replace('#', ''), n = parseInt(h.length === 3 ? h.replace(/./g, x => x + x) : h, 16); return ((n >> 16) * .299 + ((n >> 8) & 255) * .587 + (n & 255) * .114) / 255; };
function iconSpr(ic, col, px) {
  px = Math.max(7, Math.round(px)); const k = ic + px; let c = ICS.get(k); if (c) return c;
  const S = 3, w = (px + 4) * S, m = w / 2, o = Math.max(1.6, px * .13) * S; c = mkCanvas(w, w); const g = c.getContext('2d');
  // white silhouette of the symbol
  const sh = mkCanvas(w, w), h = sh.getContext('2d'); h.font = `bold ${px * S * .92}px "Segoe UI Emoji","Noto Color Emoji","Apple Color Emoji",sans-serif`; h.textAlign = 'center'; h.textBaseline = 'middle'; h.fillStyle = '#fff'; h.fillText(ic, m, m + px * S * .06); h.globalCompositeOperation = 'source-in'; h.fillStyle = '#fff'; h.fillRect(0, 0, w, w);
  const bl = mkCanvas(w, w), b = bl.getContext('2d'); b.drawImage(sh, 0, 0); b.globalCompositeOperation = 'source-in'; b.fillStyle = '#000'; b.fillRect(0, 0, w, w);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.drawImage(bl, Math.cos(a) * o, Math.sin(a) * o); }
  g.drawImage(sh, 0, 0);
  if (ICS.size > 400) ICS.clear(); ICS.set(k, c); return c;
}
function drawIcon(ic, col, x, y, px) { const c = iconSpr(ic, col, px), w = px + 4; ctx.drawImage(c, x - w / 2, y - w / 2, w, w); }
Object.assign(DOORICON, { casino: '♠', pawn: '💍', strip: '💃', gunshop: '🔫', diner: '🍴', bar: '🍺', club: '🎵', store: '🛒', hospital: '✚', police: '★', bank: '🏛', safehouse: '🏠', arcade: '👾' });
const PRI = { safehouse: 9, police: 7, hospital: 7, gunshop: 6, casino: 6, factory: 5, bank: 5, club: 4, strip: 4, bar: 3, pawn: 3, store: 2, diner: 2, arcade: 2 };
function mapPOIs() {
  const out = [], add = (x, y, c, ic, r, n, pr) => out.push({ x, y, c, ic, r, n, pr });
  for (const b of W.buildings) if (b.door && DOORCOL[b.type]) add(b.door.x, b.door.y, DOORCOL[b.type], DOORICON[b.type] || '•', b.type === 'safehouse' ? 6 : 4, b.name, PRI[b.type] || 2);
  for (const b of W.buildings) if (b.door && b.realty && owned(b) && b.realty.kind !== 'farm') add(b.door.x, b.door.y, '#2ecc71', b.realty.kind === 'home' ? '🔑' : b.realty.kind === 'club' ? '🎵' : b.realty.kind === 'lab' ? '⚗' : '💼', 5, b.realty.name || b.name, 8);
  for (const z of W.sprays) add((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, z.kind === 'chop' ? '#ff7a30' : '#f2c230', z.kind === 'chop' ? '⚙' : '🔧', 5, z.b ? z.b.name : z.kind === 'chop' ? 'Chop shop' : 'Customs garage', 6);
  for (const g of homeGarages()) add(g.x, g.y, '#4fc3f7', 'P', 5, 'Your garage', 9);
  for (const d of W.dealerSpots) add(d.x, d.y, '#66bb6a', '💊', 3, 'Dealer', 1);
  if (typeof COOP !== 'undefined' && COOP) add(COOP.x, COOP.y, '#8bc34a', '🌾', 7, 'Big Valley Co-op', 5);
  for (const f of FARMS) add(f.b.door.x, f.b.door.y, owned(f.b) ? '#2ecc71' : '#c5e1a5', '🚜', 4.5, f.b.name + (owned(f.b) ? '' : ' (for sale)'), owned(f.b) ? 8 : 3);
  for (const b of W.buildings) if (b.sub === 'market' || b.sub === 'pets') add(b.door.x, b.door.y, b.sub === 'pets' ? '#ff8a65' : '#8bc34a', b.sub === 'pets' ? '🐾' : '🥕', 4.5, b.name, 3);
  for (const ph of W.phones) add(ph.x, ph.y, '#5dade2', '☎', 3, 'Payphone', 0);
  for (const q of G.peds) if (q.gig && !q.dead) add(q.x, q.y, '#ffd600', '$', 3.5, 'Someone offering work', 4);
  return out;
}
// draw a list of POIs as icons, biggest priority first, skipping ones that would overlap
function drawPoiIcons(list, toScr, px, minPr, bounds) {
  const cell = px * 1.05, used = new Set(), L = list.slice().sort((a, b) => b.pr - a.pr);
  for (const q of L) { if (q.pr < minPr) continue; const [sx, sy] = toScr(q.x, q.y); if (bounds && !bounds(sx, sy)) continue; const k = Math.round(sx / cell) + ',' + Math.round(sy / cell); if (used.has(k)) continue; used.add(k); drawIcon(q.ic, q.c, sx, sy, px * (q.pr >= 8 ? 1.15 : 1)); }
}
function drawMapIcons(pois, z) { const px = clamp(8 + z * 1.6, 11, 19); drawPoiIcons(pois, mapToScr, px, z < 1.6 ? 2 : z < 2.6 ? 1 : 0, (x, y) => x > -20 && y > -20 && x < VW + 20 && y < VH + 20); }
function drawMiniIcons(cx, cy, R, scale, p, sc) {
  const pois = G.miniPois && G.t - G.miniPoisT < 1 ? G.miniPois : (G.miniPoisT = G.t, G.miniPois = mapPOIs()), r2 = (R - 5) * (R - 5);
  drawPoiIcons(pois, (x, y) => [cx + (x - p.x) / T * scale, cy + (y - p.y) / T * scale], 10 * sc, G.mission ? 1 : 0, (x, y) => (x - cx) * (x - cx) + (y - cy) * (y - cy) < r2);
  if (!G.scene) for (const c of G.cars) if (c.isRide && c !== pCar()) { const x = cx + (c.x - p.x) / T * scale, y = cy + (c.y - p.y) / T * scale; if ((x - cx) ** 2 + (y - cy) ** 2 < r2) drawIcon('🚗', '#ffffff', x, y, 11 * sc); }
}
function drawIconKey() {
  const leg = [['🏠', '#f2c230', 'Your apartment'], ['🔑', '#2ecc71', 'Your property'], ['🔫', '#c0392b', 'Guns'], ['🍴', '#e67e22', 'Food'], ['🛒', '#27ae60', 'Store'], ['✚', '#ecf0f1', 'Hospital'], ['★', '#2c5aa0', 'Police'], ['🏛', '#16a085', 'Bank'], ['🔧', '#f2c230', 'Customs'], ['⚙', '#ff7a30', 'Chop shop'], ['💊', '#66bb6a', 'Dealer'], ['☎', '#5dade2', 'Payphone jobs'], ['$', '#ffd600', 'Street gig'], ['P', '#4fc3f7', 'Your garage'], ['🍺', '#8e44ad', 'Bar'], ['🎵', '#ff00cc', 'Club'], ['♠', '#ffd54f', 'Casino'], ['🏭', '#ffb300', 'Factory'], ['💍', '#d4a017', 'Pawn shop']];
  const rows = Math.ceil(leg.length / 2), h = rows * 22 + 12; ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fillRect(6, 36, 260, h); ctx.font = '600 11px Rubik, sans-serif'; ctx.textAlign = 'left';
  leg.forEach(([ic, c, n], i) => { const x = 20 + (i >= rows ? 128 : 0), y = 52 + (i % rows) * 22; drawIcon(ic, c, x, y, 15); ctx.fillStyle = '#fff'; ctx.fillText(n, x + 14, y + 4); });
}

// ---------- street gigs: people on the street who'll pay a few bucks ----------
const GIGS = [
  { k: 'parcel', legal: 1, pay: [25, 60], pitch: ['Can you run this parcel over to my cousin? I\'ll give you {$}.', 'My back is killing me. Drop this box off for me? {$} for your trouble.'] },
  { k: 'coffee', legal: 1, pay: [20, 40], pitch: ['I can\'t leave this spot. Grab me a coffee from a diner or a store? {$} and you keep the change.', 'Get me something to eat from a diner? I\'ll pay {$}.'] },
  { k: 'lost', legal: 1, pay: [35, 70], pitch: ['I dropped my phone somewhere around here. Help me find it? {$} reward.', 'Lost my wallet on the way here. Find it and there\'s {$} in it for you.'] },
  { k: 'lift', legal: 1, pay: [40, 90], pitch: ['You got wheels? Drive me across town and I\'ll pay {$}.', 'Missed my bus. Give me a lift? {$}, cash.'] },
  { k: 'tag', legal: 0, pay: [45, 90], pitch: ['Spray my crew\'s tag on that wall down the street. {$}. Don\'t get seen.', 'Got a can of paint and a grudge. Tag a wall for me, {$}.'] },
  { k: 'bag', legal: 0, pay: [70, 150], pitch: ['Drop this bag off. Don\'t open it. {$}.', 'Take this to a guy waiting nearby. No questions, {$}.'] },
  { k: 'smash', legal: 0, pay: [60, 120], pitch: ['Guy owes me money. Smash up his car, it\'s parked close by. {$}.', 'See that car? Trash it. My ex\'s new boyfriend. {$}.'] },
  { k: 'rough', legal: 0, pay: [80, 140], pitch: ['Some punk keeps hassling my sister. Rough him up a little. {$}.', 'A guy round the corner stiffed me. Go teach him a lesson. {$}.'] },
  { k: 'look', legal: 0, pay: [40, 80], pitch: ['Be my lookout for half a minute. Stand at the corner, {$}.', 'Keep watch while my buddy does a thing. {$}.'] },
];
function gigFor() { const g = pick(GIGS); return { g, pay: Math.round(rint(g.pay[0], g.pay[1]) / 5) * 5, line: pick(g.pitch) }; }
function gigTick(dt) {
  const p = G.player; if (!p || p.dead || G.scene || G.mode !== 'play') return;
  for (const q of G.peds) if (q.gig && (q.dead || G.t > q.gigT || q.state === 'flee' || q.state === 'fight')) { q.gig = null; q.still = q.gigWait ? 0 : q.still; }
  for (const q of G.peds) if (q.gig && !q.dead && !q.gigWait && dist2(q.x, q.y, p.x, p.y) < 130 * 130 && G.t > (q.gigSayT || 0) && !pCar()) { q.gigSayT = G.t + 7; pedSay(q, pick(['Hey! You looking to make a few bucks?', 'Psst. Got a job for you.', 'Hey you — wanna earn some cash?', 'Excuse me! Could you help me out?'])); }
  if ((G.gigT = (G.gigT || 0) - dt) > 0) return; G.gigT = rnd(14, 26);
  if (G.mission || stars() > 0) return; const live = G.peds.filter(q => q.gig && !q.dead).length; if (live >= 2) return;
  const C = G.peds.filter(q => !q.dead && !q.gig && !q.amb && !q.persist && !q.car && (q.role === 'civ' || !q.role) && !q.gang && q.state === 'walk' && dist2(q.x, q.y, p.x, p.y) > 160 * 160 && dist2(q.x, q.y, p.x, p.y) < 700 * 700);
  const q = C.length ? pick(C) : null; if (!q) return; q.gig = gigFor(); q.gigT = G.t + 160; q.persist = 1; q.state = 'idle'; q.still = 1; q.timer = 160;
}
function gigTalk(q) {
  const o = q.gig, txt = '"' + o.line.replace('{$}', money(o.pay)) + '"' + (o.g.legal ? '' : '\n(This one\'s not exactly legal.)');
  if (G.mission) return say(q.name, '"Looks like you\'re busy. Come back when you\'re free."');
  say(q.name, txt, [{ t: 'Deal', c: 'y', f: () => { closeDialog(); startGig(q); } }, { t: 'Not interested', f: () => { closeDialog(); pedSay(q, pick(['Your loss.', 'Whatever.', 'Fine, I\'ll ask someone else.'])); q.gig = null; q.still = 0; q.state = 'walk'; q.persist = 0; } }]);
}
function gigPed(x, y, ex) { const t = new Ped(x, y, { extra: Object.assign({ persist: 1 }, ex || {}) }); t.state = 'idle'; t.still = 1; G.peds.push(t); return t; }
function startGig(q) {
  const o = q.gig, g = o.g, pay = o.pay; q.gig = null; q.gigWait = 1; q.still = 1; q.state = 'idle'; q.persist = 1; const back = { x: q.x, y: q.y, label: q.name.split(' ')[0] };
  const done = () => { q.gigWait = 0; q.still = 0; q.state = 'walk'; q.persist = 0; pedSay(q, pick(['Thanks, you\'re a lifesaver.', 'Nice work.', 'Pleasure doing business.', 'Here, as promised.'])); completeMission(); };
  const fin = () => { q.gigWait = 0; q.still = 0; q.state = 'walk'; q.persist = 0; };
  const base = { title: g.legal ? 'Favor' : 'Shady Favor', reward: pay, gig: 1, cleanup() { fin(); if (this.extra) for (const e of this.extra) { e.persist = 0; e.still = 0; e.state = 'walk'; } } };
  const near = (o2, r) => dist2((pCar() || G.player).x, (pCar() || G.player).y, o2.x, o2.y) < r * r;
  let m;
  if (g.k === 'parcel' || g.k === 'bag') { const d = randStreetPoint(500, 1200); const rx = gigPed(d.x, d.y); m = { target: { x: d.x, y: d.y, label: g.k === 'bag' ? 'The guy' : 'Cousin' }, extra: [rx], update(dt) { if (rx.dead) return failMission('The contact is down.'); if (near(rx, 60)) { pedSay(rx, g.k === 'bag' ? 'You didn\'t look inside, right?' : 'Oh great, thanks!'); if (g.k === 'bag' && Math.random() < .25) { crime(1.2, 'Drug running'); msg('An undercover cop was watching the handoff!', '#ff6b6b'); } completeMission(); } }, hud() { return g.k === 'bag' ? 'Drop the bag off' : 'Deliver the parcel'; } }; }
  if (g.k === 'coffee') { m = { stage: 0, target: null, update() { if (this.stage === 0) { const b = G.scene && G.scene.b; this.target = null; if (b && (b.type === 'diner' || b.type === 'store')) { this.stage = 1; toast('Got it — take it back'); } } else { this.target = back; if (!G.scene && near(q, 50)) done(); if (q.dead) failMission('Your customer is gone.'); } }, hud() { return this.stage ? 'Bring it back to ' + back.label : 'Go into any diner or store'; } }; }
  if (g.k === 'lost') { const d = randStreetPoint(250, 650); m = { stage: 0, target: { x: d.x, y: d.y, label: 'Somewhere here…' }, update() { if (this.stage === 0) { if (near(d, 45) && !pCar()) { this.stage = 1; Snd.play('pickup'); toast('Found it!'); this.target = back; } } else { this.target = back; if (near(q, 50)) done(); if (q.dead) failMission('The owner is gone.'); } }, hud() { return this.stage ? 'Return it to ' + back.label : 'Search the marked area on foot'; } }; }
  if (g.k === 'lift') { const d = randStreetPoint(1000, 2200); m = { stage: 0, target: back, update() { const c = pCar(); if (this.stage === 0) { this.target = { x: q.x, y: q.y, label: back.label }; if (q.dead) return failMission('Your passenger is gone.'); if (c && near(q, 90) && c.spd < 50 && !c.d.two) { this.stage = 1; const i = G.peds.indexOf(q); if (i >= 0) G.peds.splice(i, 1); Snd.play('cardoor'); msg('"' + pick(['Thanks! Here\'s the address.', 'Appreciate it. Don\'t crash.']) + '"', '#f2c230'); this.target = { x: d.x, y: d.y, label: 'Drop-off' }; } } else { if (!c) return failMission('You ditched your passenger.'); if (near(d, 90) && c.spd < 60) { q.x = c.x + 30; q.y = c.y; G.peds.push(q); completeMission(); } } }, cleanup() { q.gigWait = 0; q.still = 0; q.state = 'walk'; q.persist = 0; }, hud() { return this.stage ? 'Drive to the drop-off' : (pCar() ? 'Pull up next to ' + back.label : 'Get a car and pick up ' + back.label); } }; }
  if (g.k === 'tag') { const d = randStreetPoint(300, 800, TILE.WALK); m = { t: 0, target: { x: d.x, y: d.y, label: 'Wall' }, update(dt) { if (near(d, 45) && !pCar()) { this.t += dt; if (Math.random() < dt * 8) spawnFx('dust', d.x + rnd(-8, 8), d.y + rnd(-8, 8)); if (this.t >= 3) { G.decals.push({ t: 'graffiti', x: d.x, y: d.y, a: rnd(-.3, .3), s: 1, life: 900, col: pick(['#e91e63', '#00e5ff', '#76ff03', '#ffea00', '#ff3d00']), w: pick(['VX', 'K1NG', 'SV', 'Z3D', 'NOX']) }); crime(.4, 'Vandalism'); completeMission(); } } else this.t = Math.max(0, this.t - dt); }, hud() { return this.t > 0 ? 'Spraying… ' + Math.round(this.t / 3 * 100) + '%' : 'Stand at the wall to tag it'; } }; }
  if (g.k === 'smash') { const s = randStreetPoint(300, 800, TILE.ROAD); const c = new Car(pick(['sedan', 'compact', 'luxsedan', 'pickup']), s.x, s.y, rint(0, 3) * Math.PI / 2); c.ai = { mode: 'parked' }; c.persist = 1; c.missionCar = 1; G.cars.push(c); m = { target: { x: c.x, y: c.y, label: 'His car' }, update() { if (c.dead || c.hp < c.st.hp * .7) { crime(.5, 'Vandalism'); completeMission(); } }, cleanup() { c.missionCar = 0; fin(); }, hud() { return 'Wreck the car (' + Math.round(100 - c.hp / c.st.hp * 100) + '/30% damage)'; } }; }
  if (g.k === 'rough') { const s = randStreetPoint(300, 800); const t = gigPed(s.x, s.y, { hp: 90 }); t.still = 0; t.state = 'walk'; t.name = randName(); m = { extra: [t], target: { x: t.x, y: t.y, label: t.name.split(' ')[0] }, update() { this.target = { x: t.x, y: t.y, label: t.name.split(' ')[0] }; if (t.dead || t.hp < 50) { if (!t.dead) { t.state = 'flee'; t.threat = G.player; t.timer = 8; pedSay(t, 'Okay, okay! I get it!'); } completeMission(); } }, hud() { return 'Rough up ' + t.name.split(' ')[0]; } }; }
  if (g.k === 'look') { const d = randStreetPoint(200, 500, TILE.WALK); m = { t: 0, target: { x: d.x, y: d.y, label: 'Corner' }, update(dt) { if (near(d, 70)) { this.t += dt; if (this.t > 12 && !this.cop && Math.random() < .4) { this.cop = 1; msg('A patrol car is cruising by — act natural.', '#ffb300'); } if (this.t >= 30) completeMission(); } }, hud() { return near(d, 70) ? 'Keep watch… ' + Math.max(0, Math.ceil(30 - this.t)) + 's' : 'Get to the corner'; } }; }
  const M = Object.assign(base, m); const cu = m.cleanup; M.cleanup = function () { if (cu) cu.call(this); fin(); if (this.extra) for (const e of this.extra) { e.persist = 0; e.still = 0; if (!e.dead) e.state = 'walk'; } };
  const comp = completeMission; startMission(M); void comp; void done;
}
function talkToZ(q) { if (q.gig && !q.dead) return gigTalk(q); if (q.gigWait) return say(q.name, '"' + pick(['Well? Get going.', 'Still waiting on you.', 'Clock\'s ticking.']) + '"'); return talkToH(q); }
// overhead "$" bubble on people offering work
function drawPedZ(p) { drawPedK(p); if (p.gig && !p.dead && !G.scene) { const y = p.y - 30 - Math.abs(Math.sin(G.t * 3)) * 4; ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(p.x + 1, y + 2, 9, 0, TAU); ctx.fill(); drawIcon('$', '#ffd600', p.x + 15, y + 12, 18); } }

// ---------- chasers follow you into buildings (and back out) ----------
const noEntry = (q, b) => b.type === 'mil' || (b.type === 'police' && q.role !== 'cop' && q.role !== 'swat');
function chasersFor(b) { const p = G.player, d0 = b.door; return G.peds.filter(q => !q.dead && !q.car && !q.inside && (q.state === 'chase' || (q.state === 'fight' && q.target === p) || q.hostile && dist2(q.x, q.y, p.x, p.y) < 400 * 400) && dist2(q.x, q.y, d0.x, d0.y) < 520 * 520 && (dist2(q.x, q.y, p.x, p.y) < 240 * 240 || losClear(q.x, q.y, p.x, p.y) || losClear(q.x, q.y, d0.x + FACEV[d0.f][0] * 24, d0.y + FACEV[d0.f][1] * 24)) && !noEntry(q, b)).slice(0, 4); }
function enterBuilding(b) {
  const out = !G.scene, F = out ? chasersFor(b) : []; enterBuildingY(b); const s = G.scene; if (!s || s.b !== b) return;
  G.follow = F.map(q => ({ q, s, at: G.t + clamp(dist(q.x, q.y, b.door.x, b.door.y) / 130, 1.2, 5) }));
}
function exitBuilding() {
  const s = G.scene, back = s && s.peds ? s.peds.filter(q => q.followed && !q.dead && (q.state === 'chase' || q.state === 'fight' || q.hostile)) : []; exitBuilding0();
  if (s && s.peds) { s.peds = s.peds.filter(q => !q.followed || q.dead); for (const q of s.peds) if (q.followed && q.dead) q.followed = 0; }
  G.follow = back.map(q => ({ q, s: null, at: G.t + rnd(1, 2.2) }));
}
function followTick() {
  if (!G.follow || !G.follow.length) return; const p = G.player;
  G.follow = G.follow.filter(f => {
    if (G.t < f.at) return true; const q = f.q; if (q.dead) return false;
    if (f.s) { if (G.scene !== f.s) return false; const i = G.peds.indexOf(q); if (i < 0) return false; G.peds.splice(i, 1); const s = f.s; q.x = s.door.x + rnd(-10, 10); q.y = s.door.y - 26; q.inside = s; q.followed = 1; q.ring = null; q.still = 0; q.sit = 0; if (q.state !== 'chase') { q.state = 'fight'; q.target = p; q.timer = 25; } s.peds.push(q); Snd.play('door'); msg((q.role === 'cop' || q.role === 'swat' ? 'A cop' : q.name.split(' ')[0]) + ' followed you inside!', '#ff6b6b'); }
    else { if (G.scene) return false; const o = G.outPos || p; q.inside = null; q.followed = 0; q.x = o.x + rnd(-12, 12); q.y = o.y + rnd(-12, 12); q.ring = null; if (q.state !== 'chase') { q.state = 'fight'; q.target = p; q.timer = 20; } G.peds.push(q); Snd.play('door'); }
    return false;
  });
}
function updateZ(dt) { updateK(dt); if (G.mode === 'play') { gigTick(dt); followTick(); copTick(dt); hgTick(); lawTick(dt); npcLawTick(dt); biTick(dt); } }
// ---------- hard crashes throw NPC drivers out — dead or badly hurt ----------
function crashEject0(c, v, other) {
  if (!c || c.dead || c.remote || c === pCar() || !c.driver || c.d.two || c.d.boat || v < 430 || c.driver === G.player) return; if (c.ai && c.ai.mode === 'parked' && !c.driver) return;
  const dr = c.driver, cop = dr.role === 'cop' || dr.role === 'swat' || c.d.siren, q = new Ped(c.x, c.y, { role: cop ? 'cop' : 'civ', gang: dr.gang || null });
  for (const k of ['skin', 'shirt', 'pants', 'hair', 'name']) if (dr[k]) q[k] = dr[k];
  const sp = Math.hypot(c.vx, c.vy) || 1, ux = c.vx / sp, uy = c.vy / sp, side = Math.random() < .5 ? 1 : -1;
  q.x = c.x + (-uy * side) * (c.W / 2 + 10); q.y = c.y + (ux * side) * (c.W / 2 + 10); q.kx = ux * v * .55 - uy * side * 120; q.ky = uy * v * .55 + ux * side * 120; q.air = .5; q.wasAir = 1;
  G.peds.push(q); c.driver = null; c.ai = { mode: 'parked' }; c.throttle = 0; c.brake = 1; c.abandoned = 1;
  const by = other && other === pCar() ? G.player : (other && other.driver) || null;
  if (v > 640 || Math.random() < (v - 430) / 400) q.hurt(999, by, 'crash');
  else { q.hurt(q.hp - rnd(8, 28), by, 'crash'); if (!q.dead) { q.hp = Math.min(q.hp, rnd(8, 28)); q.state = 'flee'; q.threat = G.player; q.timer = 8; q.speed = 45; pedSay(q, pick(['Aaagh!', 'My leg…', 'Help me…', 'Ugh…'])); } }
  for (let i = 0; i < 6; i++) spawnFx('deb', c.x + ux * c.L * .4, c.y + uy * c.L * .4);
}
// ---------- fewer cops: caps on officers on foot, and chase spawns drift away once you're clear ----------
const footCops = () => G.peds.reduce((n, q) => n + (!q.dead && (q.role === 'cop' || q.role === 'swat') && q.state === 'chase' ? 1 : 0), 0);
const footCap = () => [0, 2, 3, 4, 6, 7][stars()] || 0;
function copTick(dt) { if ((G.copTk = (G.copTk || 0) - dt) > 0) return; G.copTk = 1; if (G.scene) return; const p = G.player, st = stars();
  if (st === 0) G.peds = G.peds.filter(q => !(q.chaseSpawn && !q.dead && q.state !== 'fight' && !inView(q.x, q.y, 60) && dist2(q.x, q.y, p.x, p.y) > 700 * 700));
  const cops = G.peds.filter(q => !q.dead && q.role === 'cop' && !q.chaseSpawn && q.state !== 'chase' && q.state !== 'fight'); if (cops.length > 2) { let n = cops.length - 2; for (const q of cops) { if (n <= 0) break; if (!inView(q.x, q.y, 60)) { const i = G.peds.indexOf(q); if (i >= 0) { G.peds.splice(i, 1); n--; } } } } }
// ---------- home garages: a painted pad outside every home you own — drive onto it (or walk up) to store / take out cars ----------
function homeGarages() { if (G.hgT && G.t - G.hgT < 2 && G.hgL) return G.hgL; G.hgT = G.t; return G.hgL = W.buildings.filter(b => b.door && (b.name === 'Your Apartment' || (b.realty && owned(b) && ['home', 'farm', 'biz', 'club'].includes(b.realty.kind)))).map(garagePad).filter(Boolean); }
function garagePad(b) { if (b.gpad) return b.gpad; const d = b.door, [fx, fy] = FACEV[d.f], px = -fy, py = fx, ok = (tx, ty) => inMap(tx, ty) && !W.solid[idx(tx, ty)] && W.bmap[idx(tx, ty)] < 0 && [TILE.WALK, TILE.ROAD, TILE.LOT, TILE.DIRT, TILE.GRASS, TILE.ALLEY, TILE.PATH].includes(W.tile[idx(tx, ty)]);
  for (const [k, l] of [[1, 0], [1, 1], [1, -1], [2, 0], [0, 1], [0, -1], [0, 2], [0, -2]]) { const tx = d.tx + fx * k + px * l, ty = d.ty + fy * k + py * l; if (ok(tx, ty)) return b.gpad = { b, x: (tx + .5) * T, y: (ty + .5) * T, x0: tx * T, y0: ty * T, x1: (tx + 1) * T, y1: (ty + 1) * T }; }
  return null; }
const onPad = (g, o) => o.x > g.x0 - 6 && o.x < g.x1 + 6 && o.y > g.y0 - 6 && o.y < g.y1 + 6;
function drawGaragePads() { if (G.scene) return; for (const g of homeGarages()) { if (g.bld || !inView(g.x, g.y, 80)) continue; const pul = .55 + .25 * Math.sin(G.t * 3);
  ctx.fillStyle = 'rgba(79,195,247,.18)'; ctx.fillRect(g.x0 + 3, g.y0 + 3, T - 6, T - 6); ctx.strokeStyle = `rgba(79,195,247,${pul})`; ctx.lineWidth = 3; ctx.setLineDash([10, 6]); ctx.strokeRect(g.x0 + 3, g.y0 + 3, T - 6, T - 6); ctx.setLineDash([]);
  drawIcon('P', '#fff', g.x, g.y + 4, 26); ctx.font = 'bold 10px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText('GARAGE', g.x, g.y - 18); ctx.fillStyle = '#4fc3f7'; ctx.fillText('GARAGE', g.x, g.y - 18); } }
function garageNear(r) { const o = pCar() || G.player; return homeGarages().find(g => dist2(g.x, g.y, o.x, o.y) < r * r); }
function hgTick() { const c = pCar(); if (c && !c.d.boat && G.t > 15 && !LIFE().gtip) { LIFE().gtip = 1; msg('Tip: drive onto the blue GARAGE pad outside your apartment (P on the map) to park — or stand on it and tap USE to walk in.', '#4fc3f7'); } if (G.scene || !c) { if (!c) G.hgIn = null; return; } const g = homeGarages().find(g => onPad(g, c)); if (!g) { G.hgIn = null; return; } if (G.hgIn === g || G.dlgOpen || c.spd > 70) return; G.hgIn = g; c.throttle = 0; c.brake = 1; Panel.open('hgarage', { g }); }
function padCar(g) { const k = pCar(); if (k && !k.d.boat) return k; let b = null, bd = 260 * 260; for (const c of G.cars) { if (c.dead || c.driver || !c.owned || c.d.boat) continue; const d = dist2(c.x, c.y, g.x, g.y); if (d < bd) { bd = d; b = c; } } return b; }
function takeOut(i, g) { const L = myCars(), rec = L[i]; if (!rec) return; const sp = nearRoadSpot({ x: g.x, y: g.y }, 6); if (!sp) return toast('No room on the street to bring it out');
  const c = new Car(rec.type, sp[0], sp[1], sp[2]); applyMods(c, Object.assign({}, rec.mods || {})); c.trunk = rec.trunk || {}; if (rec.cond !== undefined) { c.hp = c.st.hp * rec.cond; if (rec.cond < .1) c.flat = 1; } c.legit = isLegitRec(rec) ? 1 : 0; c.noEng = rec.noEng ? 1 : 0; c.owned = 1; c.persist = 1; c.ai = { mode: 'parked' }; G.cars.push(c); L.splice(i, 1); Snd.play('door'); doSave(true);
  Panel.close(); if (!pCar()) { const p = G.player; if (dist2(p.x, p.y, c.x, c.y) < 400 * 400) enterCar(c); } msg(c.d.name + ' is out — drive safe.', '#2ecc71'); }
PMODES.hgarage = function (H) {
  const g = this.opt.g, L = myCars(), cap = garCap(); H.title.textContent = '🅿 ' + (g.b.name === 'Your Apartment' ? 'Your garage' : g.b.realty.name + ' garage');
  const c1 = H.col('Park a vehicle'), k = padCar(g);
  if (k) H.row(c1, '', k.d.name + (k.driver ? ' (driving)' : ' (parked nearby)'), L.length >= cap ? 'Garage is full — take one out or buy a bigger property' : 'Keeps its paint, mods, damage and trunk', [H.btn('Store it', () => { const was = k.driver === G.player; if (was) exitCar(true); storeCar(k); Panel.close(); toast(k.d.name + ' stored'); }, 'y', L.length >= cap)]).querySelector('.pe').appendChild(carThumb(k.type, k.color, k.mods));
  else H.empty(c1, 'Drive a car you own onto the blue GARAGE pad, or park it right next to it, to store it here.');
  H.empty(c1, 'Space: ' + garSlots().map(s => s[0] + ' ' + s[1]).join(' · ') + ' = ' + cap + '. Every home you own has a pad like this one; they all share the same garage.');
  const c2 = H.col('In the garage ' + L.length + '/' + cap); if (!L.length) H.empty(c2, 'Empty.');
  L.forEach((r, i) => { const d = CAR_TYPES[r.type]; if (!d) return; thumbRow(H, c2, r.type, recColor(r), r.mods, d.name, condWord(r.cond === undefined ? 1 : r.cond) + (isLegitRec(r) ? '' : ' · no title'), [H.btn('Take out', () => takeOut(i, g), 'y')]); });
  H.foot.appendChild(H.btn('🔧 Project garage (build / part out)', () => Panel.open('project', { tab: 'cars' })));
};
function findInteractM() { const o = findInteractK(); if (G.scene || pCar() || G.dlgOpen) return o; const g = garageNear(70); if (!g) return o; const p = G.player, d = dist(p.x, p.y, g.x, g.y); return o && o.k === 'door' && dist(p.x, p.y, o.b.door.x, o.b.door.y) < d - 10 ? o : { k: 'hgar', g, label: 'Enter garage' }; }
function doInteractM(o) { if (o && o.k === 'hgar') return enterGarage(o.g); return doInteractK(o); }
