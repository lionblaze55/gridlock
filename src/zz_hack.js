// ================= HACKING THE CITY (Watch Dogs-style) =================
// Profiler: turn on 📡 HACK (or J) and everything hackable in your phone's range lights up. Tap a person to see their
// profile — name, job, income, a secret — and hack them: skim their bank account, read their texts, ring their phone
// to distract them. Tap cars to stall them, swerve them or pop their locks; tap junctions to flip every signal; blow
// steam pipes under pursuers; black out streetlights; loop security cameras; jam police radios; make ATMs pay out.
// Every hack costs battery and takes a moment to upload (faster on a faster phone). City infrastructure in each
// district only answers once you've broken into that district's CityNet relay tower — a node-routing puzzle.
// Hacks earn XP; levels give points for the hacking skill tree.
const HKS = () => { const S = G.save; if (!S.hk) S.hk = { xp: 0, lvl: 0, pts: 2, sk: {}, nodes: {}, n: 0 }; return S.hk; };
const HSK = {
  skim: ['💸', 'Bank skim', 'Drain the bank account of anyone you profile.', 0, null],
  texts: ['💬', 'Text intercept', 'Read people\'s messages. Gang phones leak their supply runs.', 0, null],
  lamps: ['💡', 'Streetlight blackout', 'Kill the lights around a lamp post for a minute. Needs the district relay.', 0, null],
  unlock: ['🔓', 'Car lock bypass', 'Pop a parked car\'s locks and start it — no hotwiring.', 0, null],
  lights: ['🚦', 'Traffic signals', 'Flip a junction all-green for a crash, or all-red to box traffic in. Needs the relay.', 1, null],
  distract: ['📳', 'Distraction', 'Ring someone\'s phone or set off a car alarm: guards and witnesses look away.', 1, null],
  stall: ['🛑', 'Engine kill', 'Shut down a moving car\'s engine for a few seconds. Cop cars too.', 1, null],
  cams: ['📹', 'Camera loop', 'Loop a security camera\'s feed so it can\'t report you. Needs the relay.', 1, null],
  steam: ['♨', 'Steam pipes', 'Blow a steam pipe under the road — cars get thrown. Needs the relay.', 2, 'lights'],
  swerve: ['↪', 'Remote steer', 'Take over a car\'s steering for a moment and yank it sideways.', 2, 'stall'],
  radio: ['📻', 'Police radio jam', 'Cops can\'t call in your position for 10 seconds.', 2, 'stall'],
  atm: ['🏧', 'ATM jackpot', 'Make a cash machine spit out its drawer. Loud.', 2, 'skim'],
  battery: ['🔋', 'Battery mod', '+1 battery segment on any phone.', 2, null],
  focus: ['⏱', 'Focus', 'Slow time to 40% for five seconds — line up hacks in a chase. Uses one battery.', 2, 'stall'],
  mass: ['📡', 'Mass skim', 'Skim every phone in range at once. Uses three batteries.', 3, 'skim'],
  blackout: ['🌑', 'Neighborhood blackout', 'Every streetlight in a wide area goes dark for two minutes. Drains the battery.', 3, 'lamps'] };
const hasSk = k => !!HSK[k] && (HSK[k][3] === 0 || !!HKS().sk[k]);
const hkNext = () => 60 + HKS().lvl * 45;
function hkXP(n) { const H = HKS(); H.xp += n; let up = 0; while (H.xp >= hkNext()) { H.xp -= hkNext(); H.lvl++; H.pts++; up = 1; } if (up) { G.big = { text: 'HACKER LEVEL ' + (H.lvl + 1), col: '#00e5ff', t: 2.5, sub: '+1 skill point — open the skill tree from 📡 HACK', small: 1 }; Snd.play('mission'); } }
{ const _ds = devStats; devStats = function (d) { const s = _ds(d); if (d && DEV_MODELS[d.m].f === 'phone' && G.save.hk && G.save.hk.sk.battery) s.charges++; return s; }; }
// ---------- city infrastructure: relays, steam pipes, cameras ----------
const CITYD = { downtown: 4, midtown: 3, oldtown: 3, docks: 2, industrial: 3, suburbs: 2, park: 2, town: 2 };
function hackGen() { W.relays = []; W.vents = []; W.cams = []; const byD = {};
  for (let j = 1; j < NR - 1; j++) for (let i = 1; i < NR - 1; i++) { if (!hasLight(i, j)) continue; const cx = roadCX(i), cy = roadCY(j), d = districtAt(cx, cy); if (!CITYD[d]) continue; (byD[d] = byD[d] || []).push([i, j]);
    if (((i * 31 + j * 17) % 5) < 2) { const [dx, dy] = DV[(i + j) % 4]; W.vents.push({ x: cx + dx * 2.6 * T + dy * .8 * T, y: cy + dy * 2.6 * T + dx * .8 * T, cd: 0, d }); } }
  for (const d in byD) { const L = byD[d], mx = L.reduce((a, q) => a + q[0], 0) / L.length, my = L.reduce((a, q) => a + q[1], 0) / L.length; L.sort((a, b) => Math.hypot(a[0] - mx, a[1] - my) - Math.hypot(b[0] - mx, b[1] - my)); const [i, j] = L[0];
    W.relays.push({ d, x: roadCX(i) + 3.3 * T, y: roadCY(j) + 3.3 * T, lvl: CITYD[d], i, j }); }
  for (const b of W.buildings) { if (!b.door || !['store', 'gunshop', 'pawn', 'bar', 'club', 'jewel', 'diner'].includes(b.type) || !CITYD[b.d]) continue; const [fx, fy] = FACEV[b.door.f] || [0, 1]; W.cams.push({ x: b.door.x + fy * 26 - fx * 4, y: b.door.y + fx * 26 - fy * 4, fx, fy, d: b.d, off: 0 }); } }
{ const _sg = storeGen; storeGen = function () { _sg(); try { hackGen(); } catch (e) { console.error('hackGen', e); W.relays = []; W.vents = []; W.cams = []; } }; }
const relayOK = (x, y) => !!HKS().nodes[districtAt(x, y)] || !CITYD[districtAt(x, y)];
// hacked traffic lights
{ const _ls = lightState; lightState = function (i, j, axis) { const h = G.lhk && G.lhk[i + ',' + j]; if (h && h.until > G.t) return h.m === 'green' ? 'g' : 'r'; return _ls(i, j, axis); }; }
function lightHackArea(o, r, m, secs) { G.lhk = G.lhk || {}; let n = 0; for (let j = 1; j < NR - 1; j++) for (let i = 1; i < NR - 1; i++) if (hasLight(i, j) && dist2(roadCX(i), roadCY(j), o.x, o.y) < r * r) { G.lhk[i + ',' + j] = { m, until: G.t + secs }; n++; } return n; }
// hacked cars
const isCopCar = c => !!((c.driver && c.driver.role === 'cop') || /police|cruiser|swat|interceptor/.test(c.type));
{ const _ai = updateCarAI; updateCarAI = function (c, dt) { if (c.hkStall > G.t) { c.throttle = 0; c.brake = .7; c.steer = 0; if (Math.random() < dt * 3) spawnFx('smoke', c.x, c.y); return; } if (c.hkSwerve > G.t) { c.throttle = 1; c.brake = 0; c.steer = c.hkDir; return; } return _ai(c, dt); }; }
// distracted people don't see you; jammed radios don't report you
{ const _sp = seesPlayer; seesPlayer = function (q, r) { if (q && q.distT > G.t) return false; return _sp(q, r); }; }
{ const _pw = pickWitness; pickWitness = function (p) { const w = _pw(p); if (w && w.distT > G.t) return null; if (w instanceof Car && w.driver && w.driver.distT > G.t) return null; return w; }; }
{ const _ms = markSeen; markSeen = function () { if (G.jamT > G.t) return; return _ms.apply(this, arguments); }; }
// security cameras report what they see
function camSees(cm) { if (cm.off > G.t) return false; const p = G.player, px = p.car ? p.car.x : p.x, py = p.car ? p.car.y : p.y, dx = px - cm.x, dy = py - cm.y, d = Math.hypot(dx, dy); if (d > 300 * playerVis() + 60) return false; return (dx * cm.fx + dy * cm.fy) / (d || 1) > .25 && losClear(cm.x, cm.y, px, py); }
{ const _c = crime; crime = function (sev, label) { const r0 = (G.reports || []).length, s0 = stars(); const r = _c(sev, label); if (!G.scene && sev >= .3 && (G.reports || []).length === r0 && stars() === s0 && W.cams) { const p = G.player, cm = W.cams.find(c => dist2(c.x, c.y, p.x, p.y) < 380 * 380 && camSees(c)); if (cm) { try { fileDesc(lookNow(), 'cam'); } catch (e) { } reportCrime(sev >= .8 ? 2 : 1, label || 'Caught on camera', 'alarm'); msg('📹 A security camera caught that.', '#ff9f43'); } } return r; }; }
// payphones with a cut line
{ const _u = update; update = function (dt) { _u(dt); if (!G.reports) return; for (const r of G.reports) if (r.phone && r.phone.cut > G.t && r.calling && !r.cutDone) { r.cutDone = 1; const w = r.who; if (w) { pedSay(w, pick(['The line\'s dead!', 'Hello? HELLO?', 'This phone\'s busted!'])); w.still = 0; w.toPhone = null; } G.reports.splice(G.reports.indexOf(r), 1); break; } }; }
// ---------- profiles ----------
const OCC = ['Barista', 'Night-shift nurse', 'Software tester', 'Real-estate agent', 'Between jobs', 'Line cook', 'Dentist', 'Bike courier', 'Accountant', 'Street musician', 'Influencer (2.1k followers)', 'Retired teacher', 'Mall security', 'Day trader', 'Tattoo artist', 'Ride-share driver', 'Insurance adjuster', 'Yoga instructor', 'Plumber', 'Grad student', 'Pet psychic', 'Wedding DJ', 'Paralegal', 'Food-truck owner'];
const QUIRK = ['Searched "how to fake your own death" 14 times', 'Owes $11,400 in parking fines', 'Writes fan fiction under a pen name', 'Allergic to cats — owns four', 'Bought 300 lbs of glitter last month', 'Cheats at online chess', 'Lied about a PhD on a dating profile', 'Donates monthly to a llama sanctuary', 'Banned for life from Varro Zoo', '47 unread voicemails from Mom', 'Collects antique spoons', 'Training for a hot-dog eating contest', 'Terrified of pigeons', 'Sleeps in a race-car bed', 'Under tax audit for three years', 'Hosts a conspiracy podcast (9 listeners)', 'Won $50 on a scratch card, quit their job', 'Wanted for overdue library books in two counties', 'Talks to houseplants daily', 'Runs six burner email accounts', 'Bought a boat. Doesn\'t own a car.', 'Recently Googled "is my boss a vampire"'];
const TEXTS = ['"Did u feed the iguana or did I"', '"I\'m not mad. I\'m just disappointed. Also mad."', '"Mom says the casserole was a cry for help"', '"Pick up milk. And bail money for Kevin"', '"New phone who dis"', '"Do NOT tell Dana about the boat"', '"Running late, a pigeon stole my sandwich"', '"Did you just like my post from 2014??"', '"Wire me $40 and I\'ll explain later"', '"The ferret is back in the vents"'];
function hkHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function profileOf(q) { if (q.prof) return q.prof; const h = hkHash((q.name || '') + (q.uid || '')), r = k => ((h >>> (k * 3)) % 1000) / 1000;
  if (q.role === 'cop') return q.prof = { job: 'Officer, Varro PD', inc: '$58,000', line: 'Badge #' + (1000 + h % 8999) + ' · ' + (h % 4) + ' complaints on file', bal: 0, cop: 1 };
  if (q.gang) return q.prof = { job: 'Known associate — ' + GANGS[q.gang].name, inc: 'Unreported', line: 'Encrypted group chat · ' + (1 + h % 9) + ' burner numbers', bal: r(2) < .5 ? Math.round(80 + r(3) * 600) : 0, gang: q.gang };
  const rich = r(1) < .06; return q.prof = { job: rich ? pick(['Hedge fund manager', 'Surgeon', 'Tech founder', 'Heir to a mattress fortune']) : OCC[h % OCC.length], inc: '$' + Math.round(rich ? 400 + r(2) * 2000 : 18 + r(2) * 90) + ',000', line: QUIRK[(h >>> 5) % QUIRK.length], bal: rich ? Math.round(900 + r(3) * 3500) : r(3) < .55 ? Math.round(30 + r(4) * 420) : 0 }; }
// ---------- targets ----------
const HKC = { ped: '#00e5ff', cop: '#4f8cff', gang: '#ff5c8a', car: '#ffd23f', copcar: '#4f8cff', parked: '#ffd23f', lamp: '#fff59d', hydrant: '#ff5252', atm: '#69f0ae', vend: '#69f0ae', phone: '#b388ff', light: '#39e075', vent: '#ff9f43', cam: '#ff9f43', relay: '#00e5ff' };
const HKI = { ped: '👤', cop: '👮', gang: '☠', car: '🚗', copcar: '🚓', parked: '🔒', lamp: '💡', hydrant: '🚒', atm: '🏧', vend: '🥤', phone: '☎', light: '🚦', vent: '♨', cam: '📹', relay: '📡' };
const hkPos = () => { const p = G.player; return p.car ? { x: p.car.x, y: p.car.y } : { x: p.x, y: p.y }; };
function hkScan() { const o = hkPos(), d = activePhone(), R = d ? devStats(d).range : 0, R2 = R * R, out = [], add = (k, ob, x, y) => out.push({ k, o: ob, x, y });
  if (!R || G.scene) return out; const peds = G.peds.filter(q => !q.dead && !q.isPlayer && !q.remote && !q.inside && !q.ko && dist2(q.x, q.y, o.x, o.y) < R2).sort((a, b) => dist2(a.x, a.y, o.x, o.y) - dist2(b.x, b.y, o.x, o.y)).slice(0, 14);
  for (const q of peds) add(q.role === 'cop' ? 'cop' : q.gang ? 'gang' : 'ped', q);
  for (const c of G.cars) { if (c.dead || c === pCar() || c.remote || c.owned || c.d.boat || dist2(c.x, c.y, o.x, o.y) > R2) continue; add(c.driver ? (isCopCar(c) ? 'copcar' : 'car') : 'parked', c); }
  for (const p of propsNear(o.x, o.y, R)) { if (dist2(p.x, p.y, o.x, o.y) > R2) continue; if (p.t === 'lamp' && !p.down) add('lamp', p); else if (p.t === 'hydrant') add('hydrant', p); else if (p.t === 'atm') add('atm', p); else if (p.t === 'vend') add('vend', p); }
  for (const ph of W.phones || []) if (dist2(ph.x, ph.y, o.x, o.y) < R2) add('phone', ph);
  for (let j = 1; j < NR - 1; j++) for (let i = 1; i < NR - 1; i++) { if (!hasLight(i, j)) continue; const x = roadCX(i), y = roadCY(j); if (dist2(x, y, o.x, o.y) < R2) add('light', { i, j, x, y }); }
  for (const v of W.vents || []) if (dist2(v.x, v.y, o.x, o.y) < R2) add('vent', v); for (const cm of W.cams || []) if (dist2(cm.x, cm.y, o.x, o.y) < R2) add('cam', cm); for (const rl of W.relays || []) if (dist2(rl.x, rl.y, o.x, o.y) < R2 * 1.5) add('relay', rl);
  const cap = { lamp: 6, light: 4, cam: 4, hydrant: 3, atm: 3, vend: 2, phone: 2, vent: 3, parked: 5, car: 6, copcar: 4 }, cnt = {}; return out.map(t => [t, dist2(t.o.x !== undefined ? t.o.x : t.x, t.o.y !== undefined ? t.o.y : t.y, o.x, o.y)]).sort((a, b) => a[1] - b[1]).filter(([t]) => (cnt[t.k] = (cnt[t.k] || 0) + 1) <= (cap[t.k] || 99)).map(a => a[0]); }
const hX = t => t.o.x !== undefined ? t.o.x : t.x, hY = t => t.o.y !== undefined ? t.o.y : t.y;
// what you can do to a target: [id, label, battery, upload seconds, needs relay?]
function hkActs(t) { const o = t.o, A = [], S = (k, ...a) => { if (hasSk(k)) A.push(a); }, d = activePhone();
  switch (t.k) {
    case 'ped': case 'gang': { const P = profileOf(o); if (P.bal && !o.skimmed) S('skim', 'skim', '💸 Skim ' + money(P.bal), 1, .9); S('texts', 'texts', '💬 Read texts', 1, .7); S('distract', 'ring', '📳 Ring phone', 1, .4); S('mass', 'mass', '📡 Mass skim', 3, 1.8); break; }
    case 'cop': S('radio', 'jam', '📻 Jam radio', 2, 1.2); S('distract', 'ring', '📳 Ring phone', 1, .5); break;
    case 'car': case 'copcar': S('stall', 'stall', '🛑 Kill engine', 1, .6); S('swerve', 'swerve', '↪ Steer it', 1, .5); if (t.k === 'copcar') S('radio', 'jam', '📻 Jam radio', 2, 1.2); break;
    case 'parked': { const tier = typeof carTier === 'function' ? carTier(o) : 1; if (!o.wired) S('unlock', 'unlock', '🔓 Unlock & start' + (tier >= 3 && !d.adds.exploit ? ' (needs exploit suite)' : ''), 1, .8 + tier * .5); S('distract', 'alarm', '🚨 Set off alarm', 1, .4); break; }
    case 'lamp': S('lamps', 'lamp', '💡 Lights out', 1, .4, 1); S('blackout', 'blackout', '🌑 Blackout area', 99, 1.6, 1); break;
    case 'hydrant': A.push(['burst', '🚒 Burst it', 1, .5, 1]); break;
    case 'atm': S('atm', 'atm', '🏧 Jackpot it', 2, 2.4); break;
    case 'vend': A.push(['vend', '🥤 Free sodas', 1, .5]); break;
    case 'phone': A.push(['cut', '✂ Cut the line', 1, .5]); break;
    case 'light': S('lights', 'green', '🟢 All green — crash', 1, .6, 1); S('lights', 'red', '🔴 All red — box in', 1, .6, 1); break;
    case 'vent': S('steam', 'steam', '♨ Blow the pipe', 2, .5, 1); break;
    case 'cam': S('cams', 'loop', '📹 Loop the feed', 1, .8, 1); break;
    case 'relay': A.push(['relay', HKS().nodes[o.d] ? '✔ Relay is yours' : '📡 Break into the relay', 0, 0]); break; }
  return A; }
// ---------- hack mode ----------
function toggleHack() { if (G.mode !== 'play' || G.scene) return; const d = activePhone(); if (!d) return toast('You need a phone'); G.hkOn = !G.hkOn; G.hkSel = null; Snd.play(G.hkOn ? 'beep' : 'ui'); if (G.hkOn) { G.hkT = 0; G.hkList = hkScan(); if (!HKS().seen) { HKS().seen = 1; msg('📡 Profiler on. Tap anything highlighted to profile it and hack it. Battery recharges over time — faster in a car or at home.', '#00e5ff'); } } }
function hkScreen(x, y) { const c = G.cam; return [(x - c.x) * c.z + VW / 2, (y - c.y) * c.z + VH / 2]; }
function hackTap(x, y) { if (!G.hkOn || G.scene || G.mode !== 'play') return false; const sc = G.hkSc || 1; let best = null, bd = (42 * sc) ** 2;
  for (const t of G.hkList || []) { const [sx, sy] = hkScreen(hX(t), hY(t)), d = (sx - x) ** 2 + (sy - 26 - y) ** 2; if (d < bd) { bd = d; best = t; } }
  if (!best) { if (G.hkSel) { G.hkSel = null; return true; } return false; } G.hkSel = best; Snd.play('ui'); if (best.k === 'ped' || best.k === 'gang' || best.k === 'cop') profileOf(best.o); return true; }
function hkStart(t, a) { const [id, , cost, up, relay] = a, d = activePhone(), ch = phoneCharge(), st = devStats(d);
  if (id === 'relay') return relayHack(t.o); if (relay && !relayOK(hX(t), hY(t))) { Snd.play('bad'); return toast('🔒 ' + (DISTRICTS[districtAt(hX(t), hY(t))] || {}).name + '\'s CityNet relay is locked. Find the 📡 tower and break in first.'); }
  if (id === 'unlock' && carTier(t.o) >= 3 && !d.adds.exploit) { Snd.play('bad'); return toast('High-end locks need an exploit suite on your phone (Byte Depot).'); }
  const need = cost === 99 ? Math.max(3, ch.max) : cost; if (ch.n < need) { Snd.play('bad'); return toast(cost === 99 ? 'Blackout needs a full battery (at least 3).' : '🔋 Not enough battery — it recharges over time.'); }
  if (G.hkUp) return; d.chg -= need; G.hkUp = { t: 0, need: up * clamp(2.4 / Math.max(.5, st.speed), .25, 1.7), tgt: t, id }; Snd.play('beep'); devWear(d, .002); }
function hkDone(U) { const t = U.tgt, o = t.o, id = U.id, d = activePhone(), quiet = () => { if (d.adds.ghost) return; const cop = G.peds.find(q => !q.dead && q.role === 'cop' && dist2(q.x, q.y, G.player.x, G.player.y) < 260 * 260 && seesPlayer(q, 260)); if (cop) { pedSay(cop, 'Hey — what are you doing with that phone?'); crime(.3, 'Hacking'); } }, loud = (s, l) => crime(s, l);
  let xp = 4; HKS().n++;
  switch (id) {
    case 'skim': { const P = profileOf(o); G.bank += P.bal; o.skimmed = 1; msg('💸 Skimmed ' + money(P.bal) + ' from ' + o.name + ' → your bank.', '#2ecc71'); Snd.play('cash'); P.bal = 0; quiet(); xp = 6; break; }
    case 'mass': { let n = 0, v = 0; for (const x of G.hkList) if ((x.k === 'ped' || x.k === 'gang') && !x.o.skimmed) { const P = profileOf(x.o); if (P.bal) { v += P.bal; P.bal = 0; x.o.skimmed = 1; n++; } } G.bank += v; msg('📡 Mass skim: ' + n + ' phones, ' + money(v) + ' → your bank.', '#2ecc71'); if (v) Snd.play('cash'); xp = 5 + n * 2; quiet(); break; }
    case 'texts': { const P = profileOf(o); if (P.gang) { const g = P.gang, F = FAC()[g]; facSeen()[g] = 1; if (F) F.convCD = Math.min(F.convCD || 999, rnd(12, 30)); msg('💬 ' + o.name + ': "Truck\'s coming to the spot soon. Keep it quiet." — the ' + GANGS[g].name + ' hideout is on your map and a supply run is about to roll.', GANGS[g].col); xp = 8; } else msg('💬 ' + o.name + ': ' + pick(TEXTS), '#b388ff'); break; }
    case 'ring': { o.distT = G.t + 7; o.state = o.state === 'fight' ? o.state : 'idle'; o.timer = 4; o.sus = 0; pedSay(o, pick(['Hello? Hello?', 'Who is this?', 'Unknown number again…', 'Ugh, spam.'])); Snd.play('beep', o.x, o.y); xp = 3; break; }
    case 'alarm': { o.alarmT = 10; Snd.play('alarm', o.x, o.y); for (const q of G.peds) if (!q.dead && dist2(q.x, q.y, o.x, o.y) < 380 * 380) { q.distT = G.t + 8; q.a = Math.atan2(o.y - q.y, o.x - q.x); q.sus = 0; } toast('Car alarm — everyone\'s looking at it.'); xp = 3; break; }
    case 'jam': { G.jamT = G.t + 10; G.lastSeen = Math.min(G.lastSeen || 0, G.t - 5); const p = hkPos(), a = rnd(0, TAU); G.lastKnown = { x: p.x + Math.cos(a) * 1600, y: p.y + Math.sin(a) * 1600 }; msg('📻 Police radio jammed — they lost your position. 10 seconds.', '#4f8cff'); xp = 10; break; }
    case 'stall': { o.hkStall = G.t + (isCopCar(o) ? 4 : 6); Snd.play('clunk', o.x, o.y); xp = isCopCar(o) ? 8 : 4; break; }
    case 'swerve': { o.hkSwerve = G.t + .9; o.hkDir = Math.random() < .5 ? -1 : 1; xp = 5; break; }
    case 'unlock': { o.locked = 0; o.wired = 1; Snd.play('beep', o.x, o.y); toast('🔓 Unlocked and running. Get in.'); quiet(); xp = 6; break; }
    case 'lamp': { let n = 0; for (const p of propsNear(o.x, o.y, 170)) if (p.t === 'lamp') { p.hackOff = G.t + 60; n++; } Snd.play('zap', o.x, o.y); spawnFx('spark', o.x, o.y); xp = 3; break; }
    case 'blackout': { let n = 0; for (const p of propsNear(o.x, o.y, 1200)) if (p.t === 'lamp') { p.hackOff = G.t + 120; n++; } lightHackArea(o, 1200, 'red', 20); msg('🌑 Blackout: ' + n + ' streetlights dark for two minutes.', '#9b8cff'); Snd.play('zap'); xp = 15; break; }
    case 'burst': { o.spray = 10; o.down = 0; Snd.play('splash', o.x, o.y); for (const q of G.peds) { const dd = dist(q.x, q.y, o.x, o.y); if (!q.dead && dd < 90) { q.kx = (q.kx || 0) + (q.x - o.x) / (dd || 1) * 380; q.ky = (q.ky || 0) + (q.y - o.y) / (dd || 1) * 380; q.distT = G.t + 4; } } for (const c of G.cars) { const dd = dist(c.x, c.y, o.x, o.y); if (dd < 80 && c !== pCar()) { c.vx += (c.x - o.x) / (dd || 1) * 160 / c.mass; c.vy += (c.y - o.y) / (dd || 1) * 160 / c.mass; } } xp = 4; break; }
    case 'atm': { if (o.hkT > G.t) { toast('This ATM is already empty.'); break; } o.hkT = G.t + 300; const v = Math.round(rnd(250, 900) * (1 + devStats(d).speed * .06)); addCash(v); Snd.play('cash', o.x, o.y); for (let i = 0; i < 8; i++) spawnFx('deb', o.x, o.y); msg('🏧 Jackpot: ' + money(v) + ' sprayed out of the ATM.', '#2ecc71'); loud(.45, 'ATM hacking'); xp = 12; break; }
    case 'vend': { if (o.hkT > G.t) { toast('Empty.'); break; } o.hkT = G.t + 200; if (dist2(o.x, o.y, G.player.x, G.player.y) < 120 * 120 && typeof invAdd === 'function') { invAdd('soda', 3, 1); toast('Three free sodas. Living the dream.'); } else toast('Sodas clatter out onto the sidewalk.'); Snd.play('clunk', o.x, o.y); xp = 2; break; }
    case 'cut': { o.cut = G.t + 120; Snd.play('zap', o.x, o.y); toast('☎ Line cut for two minutes — no one\'s calling the cops from here.'); xp = 3; break; }
    case 'green': case 'red': { G.lhk = G.lhk || {}; G.lhk[o.i + ',' + o.j] = { m: id, until: G.t + (id === 'green' ? 9 : 14) }; Snd.play('beep', o.x, o.y); xp = 6; if (id === 'green') loud(.2, 'Hacking'); break; }
    case 'steam': { if (o.cd > G.t) { toast('That pipe needs to build pressure again.'); break; } o.cd = G.t + 60; steamBlast(o); loud(.6, 'Sabotage'); xp = 12; break; }
    case 'loop': { o.off = G.t + 120; Snd.play('beep', o.x, o.y); toast('📹 Camera feed looped for two minutes.'); xp = 4; break; } }
  hkXP(xp); doSave(); }
function steamBlast(v) { Snd.play('boom', v.x, v.y); for (let i = 0; i < 26; i++) spawnFx('smoke', v.x + rnd(-30, 30), v.y + rnd(-30, 30)); G.cam.shake = Math.max(G.cam.shake, 8); addDecal('scorch', v.x, v.y);
  for (const c of G.cars) { if (c.dead || c === pCar()) continue; const d = dist(c.x, c.y, v.x, v.y); if (d < 150) { const f = 1 - d / 150; c.vx += (c.x - v.x) / (d || 1) * 900 * f / c.mass + rnd(-200, 200) * f; c.vy += (c.y - v.y) / (d || 1) * 900 * f / c.mass + rnd(-200, 200) * f; c.av += rnd(-6, 6) * f; c.damage(70 * f, G.player); if (c.ai) c.hkStall = G.t + 3; } }
  for (const q of G.peds) { if (q.dead) continue; const d = dist(q.x, q.y, v.x, v.y); if (d < 110) { q.kx = (q.kx || 0) + (q.x - v.x) / (d || 1) * 420; q.ky = (q.ky || 0) + (q.y - v.y) / (d || 1) * 420; q.hurt(18 * (1 - d / 110), G.player); } }
  const p = G.player, pd = dist(p.x, p.y, v.x, v.y); if (!p.car && pd < 90) hurtPlayer(15 * (1 - pd / 90), null, 'boom'); else if (p.car && pd < 120) p.car.damage(30 * (1 - pd / 120)); }
// ---------- relay towers: the node puzzle ----------
function relayHack(rl) { const H = HKS(), dn = (DISTRICTS[rl.d] || {}).name || rl.d; if (H.nodes[rl.d]) return toast('📡 ' + dn + ' relay is already yours.'); const p = hkPos(); if (dist2(p.x, p.y, rl.x, rl.y) > 130 * 130) return toast('Get right up to the relay box to break in.');
  hackPuzzle(rl.lvl, devStats(activePhone()), ok => { if (!ok) { Snd.play('bad'); return toast('Connection dropped. Try again.'); } H.nodes[rl.d] = 1; hkXP(40); G.big = { text: 'RELAY HACKED', col: '#00e5ff', t: 3, sub: dn + ' — lights, steam pipes, cameras and streetlights are yours', small: 1 }; Snd.play('mission'); doSave(true); }); }
{ const _mp = mapPOIs; mapPOIs = function () { const out = _mp(); try { for (const rl of W.relays || []) out.push({ x: rl.x, y: rl.y, c: HKS().nodes[rl.d] ? '#00e5ff' : '#7a8794', ic: '📡', r: 5, n: (DISTRICTS[rl.d] || {}).name + ' relay' + (HKS().nodes[rl.d] ? ' (hacked)' : ''), pr: 4 }); } catch (e) { } return out; }; }
// node-routing puzzle: rotate the tiles to carry the signal from the left port to the right port before time runs out
function hackPuzzle(level, st, cb) { let ov = document.getElementById('hackov'); if (!ov) { ov = document.createElement('div'); ov.id = 'hackov'; ov.innerHTML = '<canvas width="480" height="540"></canvas>'; document.body.appendChild(ov); }
  const cv = ov.querySelector('canvas'), g = cv.getContext('2d'), n = clamp(3 + Math.ceil(level / 2), 4, 6), r0 = Math.floor(Math.random() * n), r1 = Math.floor(Math.random() * n), cell = 420 / n, ox = 30, oy = 80;
  const rot = m => ((m << 1) | (m >> 3)) & 15, DIRS = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
  // carve a random path
  const M = Array.from({ length: n }, () => Array(n).fill(0)); let path = null; const seen = new Set(), dfs = (x, y, acc) => { if (x === n - 1 && y === r1) { path = acc; return true; } for (const [dx, dy] of DIRS.map(v => v).sort(() => Math.random() - .5)) { const nx = x + dx, ny = y + dy, k = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= n || ny >= n || seen.has(k)) continue; if (acc.length > n * 2.2 && Math.random() < .5) continue; seen.add(k); if (dfs(nx, ny, acc.concat([[nx, ny]]))) return true; } return false; };
  seen.add('0,' + r0); if (!dfs(0, r0, [[0, r0]])) { path = []; for (let x = 0; x < n; x++) path.push([x, r0]); for (let y = r0; y !== r1; y += Math.sign(r1 - r0)) path.push([n - 1, y + Math.sign(r1 - r0)]); }
  for (let k = 0; k < path.length; k++) { const [x, y] = path[k], prev = k ? path[k - 1] : [x - 1, y], next = k < path.length - 1 ? path[k + 1] : [x + 1, y]; for (const [px, py] of [prev, next]) { const dd = DIRS.find(v => v[0] === px - x && v[1] === py - y); if (dd) M[y][x] |= dd[2]; } }
  const SH = [5, 10, 3, 6, 12, 9, 7, 14]; for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { if (!M[y][x]) M[y][x] = SH[Math.floor(Math.random() * (level > 3 ? 8 : 6))]; const k = Math.floor(Math.random() * 4); for (let i = 0; i < k; i++) M[y][x] = rot(M[y][x]); }
  const lim = Math.max(14, 30 + (st ? st.speed : 2) * 2.5 - level * 3); let t0 = performance.now(), done = false, lit = new Set();
  const flow = () => { lit = new Set(); if (!(M[r0][0] & 8)) return false; const Q = [[0, r0]]; lit.add('0,' + r0); let win = false; while (Q.length) { const [x, y] = Q.shift(); if (x === n - 1 && y === r1 && (M[y][x] & 2)) win = true; for (const [dx, dy, a, b] of DIRS) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= n || ny >= n || !(M[y][x] & a) || !(M[ny][nx] & b) || lit.has(nx + ',' + ny)) continue; lit.add(nx + ',' + ny); Q.push([nx, ny]); } } return win; };
  const end = ok => { if (done) return; done = true; ov.classList.remove('show'); ov.onpointerdown = null; window.removeEventListener('keydown', kd, true); Snd.play(ok ? 'mission' : 'bad'); cb(ok); };
  const kd = e => { e.stopImmediatePropagation(); if (e.key === 'Escape') { e.preventDefault(); end(false); } }; window.addEventListener('keydown', kd, true);
  ov.onpointerdown = e => { e.preventDefault(); e.stopPropagation(); const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 480, y = (e.clientY - r.top) / r.height * 540; if (y < 60 && x > 400) return end(false);
    const cx = Math.floor((x - ox) / cell), cy = Math.floor((y - oy) / cell); if (cx >= 0 && cy >= 0 && cx < n && cy < n) { M[cy][cx] = rot(M[cy][cx]); Snd.play('ui'); if (flow()) { setTimeout(() => end(true), 350); } } };
  flow(); ov.classList.add('show');
  const draw = () => { if (done) return; const left = lim - (performance.now() - t0) / 1000; if (left <= 0) return end(false); g.clearRect(0, 0, 480, 540); g.fillStyle = 'rgba(4,14,22,.96)'; g.beginPath(); g.roundRect(0, 0, 480, 540, 18); g.fill(); g.strokeStyle = '#00e5ff'; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#00e5ff'; g.font = '800 20px Rubik,sans-serif'; g.textAlign = 'left'; g.fillText('CITYNET INTRUSION · LVL ' + level, 22, 36); g.fillStyle = '#ff6b6b'; g.textAlign = 'center'; g.fillText('✕', 448, 38); g.fillStyle = '#1b2a36'; g.fillRect(22, 50, 436, 8); g.fillStyle = left < 6 ? '#ff4d4d' : '#00e5ff'; g.fillRect(22, 50, 436 * left / lim, 8);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const X = ox + x * cell, Y = oy + y * cell, m = M[y][x], on = lit.has(x + ',' + y); g.fillStyle = on ? '#06303a' : '#0b1720'; g.fillRect(X + 2, Y + 2, cell - 4, cell - 4); g.strokeStyle = on ? '#00e5ff' : '#4a5d6b'; g.lineWidth = cell * .16; g.lineCap = 'round';
      const cxp = X + cell / 2, cyp = Y + cell / 2; g.beginPath(); for (const [dx, dy, a] of DIRS) if (m & a) { g.moveTo(cxp, cyp); g.lineTo(cxp + dx * cell / 2, cyp + dy * cell / 2); } g.stroke(); g.fillStyle = on ? '#00e5ff' : '#4a5d6b'; g.beginPath(); g.arc(cxp, cyp, cell * .1, 0, TAU); g.fill(); }
    g.fillStyle = '#39e075'; g.fillRect(ox - 22, oy + r0 * cell + cell * .3, 20, cell * .4); g.fillStyle = '#ff9f43'; g.fillRect(ox + n * cell + 2, oy + r1 * cell + cell * .3, 20, cell * .4);
    g.fillStyle = '#9fb3c2'; g.font = '600 14px Rubik,sans-serif'; g.textAlign = 'center'; g.fillText('Tap tiles to rotate. Route the signal from green to orange.', 240, 525); requestAnimationFrame(draw); }; requestAnimationFrame(draw); }
// ---------- update: scan, uploads, focus ----------
{ const _u = update; update = function (dt) { const rdt = dt; if (G.focusT > 0) { G.focusT -= rdt; if (!Net.room) dt *= .4; } _u(dt); if (G.mode !== 'play') return;
  if (G.hkOn && (G.scene || G.player.dead || !activePhone())) { G.hkOn = false; G.hkSel = null; G.hkUp = null; }
  if (!G.hkOn) { G.hkUp = null; return; } G.hkT = (G.hkT || 0) - rdt; if (G.hkT <= 0) { G.hkT = .25; G.hkList = hkScan(); if (G.hkSel && !G.hkList.some(t => t.o === G.hkSel.o)) G.hkSel = null; }
  const U = G.hkUp; if (U) { if (U.tgt.o.dead || !(G.hkList || []).some(t => t.o === U.tgt.o)) { G.hkUp = null; Snd.play('bad'); toast('Signal lost.'); } else { U.t += rdt; if (U.t >= U.need) { G.hkUp = null; hkDone(U); } } } }; }
function focusNow() { const ch = phoneCharge(), d = activePhone(); if (G.focusT > 0) return; if (ch.n < 1) return toast('🔋 No battery for Focus.'); d.chg--; G.focusT = 5; Snd.play('zap'); }
// ---------- drawing: world icons ----------
{ const _df = drawFx; drawFx = function () { _df(); if (G.scene) return; const g = ctx;
  for (const v of W.vents || []) if (inView(v.x, v.y, 30)) { g.fillStyle = '#2b2f35'; g.beginPath(); g.arc(v.x, v.y, 11, 0, TAU); g.fill(); g.strokeStyle = '#474d55'; g.lineWidth = 2; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(v.x - 8, v.y + i * 4); g.lineTo(v.x + 8, v.y + i * 4); g.stroke(); } if (Math.random() < .03) spawnFx('smoke', v.x, v.y); }
  for (const rl of W.relays || []) if (inView(rl.x, rl.y, 60)) { const own = HKS().nodes[rl.d]; g.fillStyle = '#37474f'; g.fillRect(rl.x - 13, rl.y - 10, 26, 22); g.fillStyle = '#263238'; g.fillRect(rl.x - 2, rl.y - 46, 4, 38); g.strokeStyle = own ? '#00e5ff' : '#90a4ae'; g.lineWidth = 2; for (let k = 1; k <= 3; k++) { g.globalAlpha = (Math.sin(G.t * 3 - k) + 1) / 2; g.beginPath(); g.arc(rl.x, rl.y - 46, k * 7, -2.4, -.7); g.stroke(); } g.globalAlpha = 1; g.fillStyle = own ? '#00e5ff' : Math.sin(G.t * 6) > 0 ? '#ff4d4d' : '#5a1010'; g.fillRect(rl.x - 8, rl.y - 4, 5, 5); }
  for (const cm of W.cams || []) if (inView(cm.x, cm.y, 30)) { g.fillStyle = '#cfd8dc'; g.save(); g.translate(cm.x, cm.y); g.rotate(Math.atan2(cm.fy, cm.fx)); g.fillRect(-4, -4, 12, 8); g.fillStyle = cm.off > G.t ? '#555' : (Math.sin(G.t * 4) > 0 ? '#ff1744' : '#600'); g.fillRect(6, -1.5, 3, 3); g.restore(); }
  if (!G.hkOn) return; const o = hkPos(), d = activePhone(), R = devStats(d).range, z = G.cam.z;
  g.strokeStyle = 'rgba(0,229,255,.25)'; g.lineWidth = 2 / z; g.setLineDash([10 / z, 8 / z]); g.beginPath(); g.arc(o.x, o.y, R, 0, TAU); g.stroke(); g.setLineDash([]);
  for (const t of G.hkList || []) { const x = hX(t), y = hY(t) - 26 / z, sel = G.hkSel && G.hkSel.o === t.o, s = (sel ? 15 : 11) / z, col = HKC[t.k], locked = (t.k === 'light' || t.k === 'vent' || t.k === 'cam' || t.k === 'lamp' || t.k === 'hydrant') && !relayOK(x, y);
    g.globalAlpha = locked ? .45 : .9; g.fillStyle = 'rgba(5,15,25,.8)'; g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s, y); g.lineTo(x, y + s); g.lineTo(x - s, y); g.closePath(); g.fill(); g.strokeStyle = col; g.lineWidth = (sel ? 3 : 1.6) / z; g.stroke();
    g.font = `${(sel ? 13 : 10) / z}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#fff'; g.fillText(locked ? '🔒' : HKI[t.k], x, y + .5 / z); g.globalAlpha = 1;
    if (sel) { const bx = hX(t), by = hY(t), b = 22 / z; g.strokeStyle = col; g.lineWidth = 2.5 / z; for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { g.beginPath(); g.moveTo(bx + sx * b, by + sy * b * .5); g.lineTo(bx + sx * b, by + sy * b); g.lineTo(bx + sx * b * .5, by + sy * b); g.stroke(); } } }
  const U = G.hkUp; if (U) { const x = hX(U.tgt), y = hY(U.tgt); g.strokeStyle = '#00e5ff'; g.lineWidth = 4 / z; g.beginPath(); g.arc(x, y, 28 / z, -Math.PI / 2, -Math.PI / 2 + TAU * U.t / U.need); g.stroke(); g.strokeStyle = 'rgba(0,229,255,.5)'; g.lineWidth = 1.5 / z; g.setLineDash([4 / z, 4 / z]); g.beginPath(); g.moveTo(o.x, o.y); g.lineTo(x, y); g.stroke(); g.setLineDash([]); } }; }
// ---------- drawing: HUD (button, battery, profile card) ----------
{ const _dl = drawLawHUDL; drawLawHUDL = function (sc) { _dl(sc); Input.xBtns = (Input.xBtns || []).filter(b => b.k !== 'hack'); const p = G.player; G.hkSc = sc; if (G.mode !== 'play' || !p || p.dead || G.scene || G.surrender || !G.save.dev) return; const d = activePhone(); if (!d) return;
  const g = ctx, h = 30 * sc, x = 14 * sc + 86 * sc + 96 * sc, y = VH - 250 * sc, btn = (bx, by, bw, label, on, col, fn) => { g.fillStyle = on ? 'rgba(4,24,34,.88)' : 'rgba(0,0,0,.55)'; g.beginPath(); g.roundRect(bx, by, bw, h, 8); g.fill(); g.strokeStyle = col; g.lineWidth = on ? 2.5 : 1.5; g.stroke(); txt(label, bx + bw / 2, by + h * .67, 12 * sc, on ? col : '#ddd', 'center'); Input.xBtns.push({ k: 'hack', r: [bx, by, bw, h], fn }); };
  btn(x, y, 86 * sc, '📡 HACK', !!G.hkOn, '#00e5ff', toggleHack); const ch = phoneCharge(); for (let i = 0; i < ch.max; i++) { g.fillStyle = i < ch.n ? '#00e5ff' : 'rgba(255,255,255,.18)'; g.fillRect(x + 94 * sc + i * 9 * sc, y + 9 * sc, 6 * sc, 12 * sc); }
  const H = HKS(); if (G.hkOn) { btn(x + 94 * sc + ch.max * 9 * sc + 6 * sc, y, 60 * sc, H.pts ? '🧠 ' + H.pts : '🧠', false, H.pts ? '#ffd23f' : '#9fb3c2', () => Panel.open('hacksk')); if (H.sk.focus) btn(x, y - h - 8 * sc, 86 * sc, G.focusT > 0 ? '⏱ ' + G.focusT.toFixed(1) : '⏱ FOCUS', G.focusT > 0, '#ffd23f', focusNow); }
  if (G.focusT > 0) { g.fillStyle = 'rgba(0,40,60,.18)'; g.fillRect(0, 0, VW, VH); }
  if (G.jamT > G.t) txt('📻 RADIO JAMMED ' + Math.ceil(G.jamT - G.t), VW / 2, 92 * sc, 14 * sc, '#4f8cff', 'center');
  if (!G.hkOn) return; g.strokeStyle = 'rgba(0,229,255,.35)'; g.lineWidth = 6 * sc; g.strokeRect(3 * sc, 3 * sc, VW - 6 * sc, VH - 6 * sc);
  const t = G.hkSel; if (!t) { txt('PROFILER — tap a highlighted target', VW / 2, VH > VW ? VH - 300 * sc : VH - 24 * sc, 12 * sc, '#00e5ff', 'center'); return; }
  const acts = hkActs(t), W2 = Math.min(VW - 20 * sc, 340 * sc), cx = VW / 2 - W2 / 2; let lines = [];
  if (t.k === 'ped' || t.k === 'gang' || t.k === 'cop') { const P = profileOf(t.o); lines = [[t.o.name, '#fff', 14], [P.job + ' · income ' + P.inc, '#9fdfff', 11], [P.line, '#ffd23f', 11], [P.bal && !t.o.skimmed ? 'Bank: ' + money(P.bal) + ' skimmable' : 'Bank: nothing worth taking', '#9fb3c2', 10.5]]; }
  else if (t.k === 'car' || t.k === 'copcar' || t.k === 'parked') { const c = t.o; lines = [[c.d.name + (t.k === 'copcar' ? ' · police' : t.k === 'parked' ? ' · parked' : ''), '#fff', 14], [c.driver ? 'Driver: ' + (c.driver.name || 'unknown') : (c.locked === 0 || c.wired ? 'Unlocked' : 'Locked · ' + ['beater', 'standard', 'good', 'high-end'][typeof carTier === 'function' ? carTier(c) : 1] + ' security'), '#9fdfff', 11]]; }
  else { const nm = { lamp: 'Streetlight', hydrant: 'Fire hydrant', atm: 'Cash machine · Varro Savings', vend: 'Vending machine', phone: 'Payphone', light: 'Traffic signal', vent: 'Steam pipe', cam: 'Security camera', relay: 'CityNet relay tower' }[t.k], dn = (DISTRICTS[districtAt(hX(t), hY(t))] || {}).name;
    lines = [[nm, '#fff', 14], [t.k === 'relay' ? (HKS().nodes[t.o.d] ? 'Hacked — ' + dn + ' infrastructure is open' : 'Break in to control ' + dn + '\'s lights, pipes, cameras and streetlights') : (['light', 'vent', 'cam', 'lamp', 'hydrant'].includes(t.k) && !relayOK(hX(t), hY(t)) ? '🔒 Needs the ' + dn + ' relay' : dn), '#9fdfff', 11]]; }
  const bh = 30 * sc, rows = Math.ceil(acts.length / 2), Hh = 14 * sc + lines.length * 16 * sc + (acts.length ? rows * (bh + 6 * sc) + 6 * sc : 24 * sc), cy = VH > VW ? VH - 290 * sc - Hh : VH - 12 * sc - Hh;
  g.fillStyle = 'rgba(4,14,22,.9)'; g.beginPath(); g.roundRect(cx, cy, W2, Hh, 12 * sc); g.fill(); g.strokeStyle = HKC[t.k]; g.lineWidth = 2; g.stroke();
  lines.forEach((l, i) => txt(l[0], cx + 12 * sc, cy + 22 * sc + i * 16 * sc, l[2] * sc, l[1], 'left'));
  const by0 = cy + 14 * sc + lines.length * 16 * sc, bw = (W2 - 30 * sc) / 2, ch2 = phoneCharge(); acts.forEach((a, i) => { const bx = cx + 10 * sc + (i % 2) * (bw + 10 * sc), by = by0 + Math.floor(i / 2) * (bh + 6 * sc), need = a[2] === 99 ? Math.max(3, ch2.max) : a[2], ok = ch2.n >= need && !G.hkUp && !(a[4] && !relayOK(hX(t), hY(t)));
    g.globalAlpha = ok || a[0] === 'relay' ? 1 : .5; btn(bx, by, bw, a[1] + (need ? '  ' + '▮'.repeat(Math.min(need, 6)) : ''), false, HKC[t.k], () => { hkStart(t, a); }); g.globalAlpha = 1; });
  if (!acts.length) txt('No hacks unlocked for this — check the 🧠 skill tree', cx + 12 * sc, by0 + 14 * sc, 10.5 * sc, '#9fb3c2', 'left'); }; }
// ---------- skill tree ----------
PMODES.hacksk = function (H) { const K = HKS(); H.title.textContent = '🧠 Hacking skills · level ' + (K.lvl + 1) + ' · ' + K.pts + ' point' + (K.pts === 1 ? '' : 's');
  const c = H.col('XP ' + Math.floor(K.xp) + ' / ' + hkNext() + ' · relays hacked ' + Object.keys(K.nodes).length + ' / ' + (W.relays || []).length);
  for (const k in HSK) { const [e, n, dsc, cost, pre] = HSK[k], own = hasSk(k), blocked = pre && !hasSk(pre); H.row(c, e, n + (cost === 0 ? ' · starter' : ''), dsc + (blocked ? ' · needs ' + HSK[pre][1] : ''), own ? [H.btn('✓ Unlocked', () => { }, 'on', true)] : [H.btn('Unlock · ' + cost + ' pt' + (cost > 1 ? 's' : ''), () => { if (K.pts < cost) return; K.pts -= cost; K.sk[k] = 1; Snd.play('mission'); doSave(true); }, 'y', K.pts < cost || !!blocked)]); }
  H.foot.appendChild(H.mk('span', 'pnote', 'Earn XP by hacking. Relay towers give big XP — find the 📡 towers on your map.')); };
