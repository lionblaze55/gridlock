// ================= DEVICES: phones and computers built like cars and guns =================
// Every phone and computer is an individual device with its own core parts (each with a tier and wear) and add-on
// slots. Models range from budget to performance, but nothing is capped: any part fits any device of its kind — a
// budget phone with elite parts is a monster, as long as it has the cooling to keep up (or it throttles and cooks
// its parts). Loose parts and add-ons are stockpiled in your parts bin (kept at your office); pull, fit, swap, fix
// and scrap them at a bench, exactly like car parts and gun parts.
const DEV_MODELS = {
  // phones
  kestrel: { f: 'phone', n: 'Kestrel A1', tag: 'budget', price: 250, base: { cpu: 1, ram: 1, pwr: 1, sig: 1, cool: 0 }, add: 1, col: '#5d6d7e' },
  nova: { f: 'phone', n: 'Nova 5', tag: 'mid-range', price: 700, base: { cpu: 2, ram: 2, pwr: 2, sig: 2, cool: 1 }, add: 2, col: '#2e86c1' },
  pulse: { f: 'phone', n: 'Pulse Pro', tag: 'flagship', price: 1500, base: { cpu: 3, ram: 3, pwr: 3, sig: 3, cool: 1 }, add: 3, col: '#1c2833' },
  cipher: { f: 'phone', n: 'Cipher X', tag: 'performance', price: 3400, base: { cpu: 4, ram: 4, pwr: 4, sig: 4, cool: 2 }, add: 4, col: '#7d3c98' },
  // computers
  lumen: { f: 'pc', n: 'Lumen 14 laptop', tag: 'budget · portable', price: 650, base: { cpu: 1, ram: 1, gpu: 1, sto: 1, pwr: 1, sig: 1, cool: 1 }, add: 1, port: 1, col: '#aab7b8' },
  officemate: { f: 'pc', n: 'Officemate desktop', tag: 'budget', price: 900, base: { cpu: 2, ram: 1, gpu: 1, sto: 2, pwr: 2, sig: 2, cool: 1 }, add: 2, col: '#616a6b' },
  vista: { f: 'pc', n: 'Vista 27 all-in-one', tag: 'mid-range', price: 1900, base: { cpu: 2, ram: 2, gpu: 2, sto: 2, pwr: 2, sig: 2, cool: 2 }, add: 2, col: '#d5d8dc' },
  forge: { f: 'pc', n: 'Forge RTX tower', tag: 'performance', price: 4200, base: { cpu: 4, ram: 3, gpu: 4, sto: 3, pwr: 3, sig: 3, cool: 3 }, add: 3, col: '#c0392b' },
  atlas: { f: 'pc', n: 'Atlas workstation', tag: 'workstation', price: 7800, base: { cpu: 5, ram: 5, gpu: 4, sto: 4, pwr: 4, sig: 4, cool: 4 }, add: 4, col: '#17202a' },
};
const DEV_SLOTS = { phone: ['cpu', 'ram', 'pwr', 'sig', 'cool'], pc: ['cpu', 'gpu', 'ram', 'sto', 'pwr', 'sig', 'cool'] };
const SLOTN = { cpu: 'Processor', gpu: 'Graphics', ram: 'Memory', sto: 'Storage', pwr: 'Battery', sig: 'Radio', cool: 'Cooling' };
const SLOTN_PC = { pwr: 'Power supply', sig: 'Network card' };
const devSlotName = (f, k) => (f === 'pc' && SLOTN_PC[k]) || SLOTN[k];
const SLOTE = { cpu: '🧠', gpu: '🎮', ram: '💾', sto: '🗄', pwr: '🔋', sig: '📡', cool: '❄' };
const TIERN = ['None', 'Basic', 'Standard', 'Advanced', 'Pro', 'Elite', 'Quantum'];
const TIERC = ['#555', '#95a5a6', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#ff4d6d'];
const PART_PRICE = (f, k, t) => Math.round((f === 'pc' ? 1.4 : 1) * ({ cpu: 160, gpu: 190, ram: 70, sto: 60, pwr: 80, sig: 90, cool: 70 }[k]) * Math.pow(2.05, t - 1) / 10) * 10;
// add-ons (stack in the bin like gun attachments)
const ADDONS = {
  vpn: { n: 'VPN chip', e: '🛡', f: 'both', price: 900, d: 'Routes everything through a chain of proxies: −40% trace from online crime and hacks.' },
  exploit: { n: 'Exploit suite', e: '🧨', f: 'both', price: 2400, d: 'Zero-days for cars, ATMs, cop radios and traffic signals. Needed for the serious hacks.' },
  amp: { n: 'Signal amplifier', e: '📶', f: 'phone', price: 650, d: '+40% hacking range in the field.' },
  oc: { n: 'Overclock firmware', e: '⚡', f: 'both', price: 800, d: '+30% speed — and a lot more heat. Bring cooling.' },
  scanner: { n: 'Police scanner', e: '🚨', f: 'phone', price: 1200, d: 'Listens to dispatch: police show on your minimap while it\'s your active phone.' },
  ghost: { n: 'Ghost mode', e: '👻', f: 'phone', price: 1500, d: 'People nearby don\'t notice you hacking them.' },
  rig: { n: 'Cracking rig', e: '🔓', f: 'pc', price: 1600, d: 'GPU-accelerated password cracking: big boost to online crime and network hacks.' },
  farm: { n: 'Crypto miner', e: '🪙', f: 'pc', price: 1100, d: 'Mines while the computer sits idle. Pays per hour of play — more with a strong GPU — but runs hot.' },
};
const DEV = () => { const S = G.save; if (!S.dev) S.dev = { list: [], bin: [], adds: {}, active: null, trace: 0, xp: 0, uid: 1 }; const D = S.dev;
  if (!D.list.some(d => DEV_MODELS[d.m].f === 'phone')) { const d = newDevice('kestrel', .8); d.loc = 'carry'; D.list.push(d); D.active = d.uid; } return D; };
function newDevice(m, cond) { const M = DEV_MODELS[m], D = G.save.dev || { uid: 1 }, parts = {}; for (const k of DEV_SLOTS[M.f]) if (M.base[k] !== undefined) parts[k] = M.base[k] ? { t: M.base[k], c: cond ?? 1 } : null;
  return { uid: (G.save.dev ? G.save.dev.uid++ : Date.now() % 1e6), m, parts, adds: {}, loc: M.f === 'phone' || M.port ? 'carry' : 'home', name: M.n }; }
const devName = d => DEV_MODELS[d.m].n;
const devOf = uid => DEV().list.find(d => d.uid === uid);
const activePhone = () => { const D = DEV(); let d = devOf(D.active); if (!d || DEV_MODELS[d.m].f !== 'phone') { d = D.list.find(x => DEV_MODELS[x.m].f === 'phone'); D.active = d ? d.uid : null; } return d || null; };
const addCount = d => Object.keys(d.adds).filter(k => d.adds[k]).length;
// ---------- stats: parts × condition, throttled by heat ----------
function partT(d, k) { const p = d.parts[k]; return p ? p.t * (.45 + .55 * p.c) : 0; }
function devStats(d) { const f = DEV_MODELS[d.m].f, A = d.adds, oc = A.oc ? 1.3 : 1;
  const load = partT(d, 'cpu') * oc + partT(d, 'gpu') * .8 * (A.farm ? 1.3 : 1) + (A.oc ? 1.2 : 0), cap = 1.6 + partT(d, 'cool') * 1.35 + (f === 'pc' ? 1.5 : 0), heat = load / cap, thr = heat > 1 ? 1 / Math.pow(heat, .8) : 1;
  const speed = (partT(d, 'cpu') * 1 + partT(d, 'ram') * .45 + (f === 'pc' ? partT(d, 'gpu') * .25 : 0)) * oc * thr;
  return { f, speed, heat, thr, crack: (f === 'pc' ? partT(d, 'gpu') * (A.rig ? 1.6 : 1) + partT(d, 'cpu') * .4 : 0) * thr,
    range: Math.round((260 + partT(d, 'sig') * 95) * (A.amp ? 1.4 : 1)), charges: Math.max(1, Math.round(1 + partT(d, 'pwr') * 1.6)), store: partT(d, 'sto'),
    power: Math.round((speed * 10 + (f === 'pc' ? partT(d, 'gpu') * 4 + partT(d, 'sto') * 2 : partT(d, 'sig') * 3 + partT(d, 'pwr') * 2))) }; }
const devPower = d => devStats(d).power;
// heat cooks parts: every bit of use wears the hottest parts a little, more when throttling
function devWear(d, amt) { const st = devStats(d); const k = 1 + Math.max(0, st.heat - 1) * 3; for (const s of ['cpu', 'gpu', 'pwr']) { const p = d.parts[s]; if (p) p.c = Math.max(.05, p.c - amt * k * (s === 'cpu' ? 1 : .6) * rnd(.6, 1.2)); } }
const devCond = d => { const ps = Object.values(d.parts).filter(Boolean); return ps.length ? ps.reduce((a, p) => a + p.c, 0) / ps.length : 1; };
function devValue(d) { const M = DEV_MODELS[d.m]; let v = M.price * .45 * (.5 + .5 * devCond(d)); for (const k in d.parts) { const p = d.parts[k]; if (p && p.t > (M.base[k] || 0)) v += PART_PRICE(M.f, k, p.t) * .35 * p.c; } for (const k in d.adds) if (d.adds[k]) v += ADDONS[k].price * .3; return Math.round(v / 10) * 10; }
const partFixCost = (f, k, p) => p.c >= .95 ? 0 : Math.max(20, Math.round(PART_PRICE(f, k, p.t) * .45 * (1 - p.c) / 5) * 5);
const partScrap = (f, k, p) => Math.max(5, Math.round(PART_PRICE(f, k, p.t) * .08 * p.c / 5) * 5);
// ---------- phone charges for field hacking ----------
function phoneCharge() { const d = activePhone(); if (!d) return { n: 0, max: 0 }; const st = devStats(d); if (d.chg === undefined) d.chg = st.charges; d.chg = Math.min(d.chg, st.charges); return { n: d.chg, max: st.charges }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play') return; const d = G.save.dev && activePhone(); if (!d) return; const st = devStats(d); if (d.chg === undefined) d.chg = st.charges;
  const home = G.scene && G.scene.b && (owned(G.scene.b) || G.scene.b.type === 'safehouse'), car = !!pCar(); if (d.chg < st.charges) { d.chgT = (d.chgT || 0) + dt * (home ? 4 : car ? 2 : 1); if (d.chgT >= 13) { d.chgT = 0; d.chg++; } } }; }
// ---------- trace: how close the cyber unit is to finding you ----------
function traceAdd(n, d) { const D = DEV(); const vpn = d && d.adds.vpn ? .6 : 1, office = typeof atBase === 'function' && atBase() ? .75 : 1; D.trace = clamp(D.trace + n * vpn * office, 0, 100);
  if (D.trace >= 100) { D.trace = 45; const at = G.scene ? G.outPos : G.player; G.heat = Math.max(G.heat, 2.2); G.heatT = Math.max(G.heatT || 0, 1.2); markSeen(); G.lastKnown = { x: at.x, y: at.y }; G.starFlash = 2; Snd.play('starup');
    const seized = Math.min(G.bank, Math.round(G.bank * .1), 15000); G.bank -= seized; msg('🚨 The Cyber Crimes Unit traced you!' + (seized ? ' They froze ' + money(seized) + ' of your bank account.' : '') + ' Units are on the way.', '#ff4d4d'); } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play' && G.save.dev) G.save.dev.trace = Math.max(0, G.save.dev.trace - dt * .08); }; }
// ---------- the bin ----------
const BIN = () => DEV().bin;
function binAdd(f, k, t, c) { BIN().push({ f, k, t, c: c ?? 1 }); }
function addonAdd(k, n) { const A = DEV().adds; A[k] = (A[k] || 0) + (n || 1); }
// drawing a device icon
function devIcon(d, px) { const M = DEV_MODELS[d.m], c = document.createElement('canvas'); c.width = 132; c.height = 90; const g = c.getContext('2d'); g.translate(66, 45);
  if (M.f === 'phone') { const w = 30 + ['kestrel', 'nova', 'pulse', 'cipher'].indexOf(d.m) * 2, h = w * 1.95; g.fillStyle = '#0d0f12'; g.beginPath(); g.roundRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 8); g.fill(); g.fillStyle = M.col; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 7); g.fill();
    const sg = g.createLinearGradient(0, -h / 2, 0, h / 2); sg.addColorStop(0, '#1e3c72'); sg.addColorStop(1, '#2a5298'); g.fillStyle = sg; g.beginPath(); g.roundRect(-w / 2 + 3, -h / 2 + 6, w - 6, h - 12, 4); g.fill(); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-w / 2 + 3, -h / 2 + 6, w - 6, 8); g.fillStyle = '#111'; g.beginPath(); g.arc(0, -h / 2 + 3.4, 1.4, 0, TAU); g.fill(); }
  else if (M.port) { g.fillStyle = '#2c3e50'; g.beginPath(); g.roundRect(-40, -30, 80, 46, 4); g.fill(); g.fillStyle = '#5dade2'; g.fillRect(-36, -26, 72, 38); g.fillStyle = M.col; g.beginPath(); g.moveTo(-48, 18); g.lineTo(48, 18); g.lineTo(42, 28); g.lineTo(-42, 28); g.closePath(); g.fill(); }
  else if (d.m === 'vista') { g.fillStyle = '#ecf0f1'; g.beginPath(); g.roundRect(-46, -36, 92, 58, 5); g.fill(); g.fillStyle = '#1b4f72'; g.fillRect(-42, -32, 84, 46); g.fillStyle = '#bdc3c7'; g.fillRect(-6, 22, 12, 10); g.fillRect(-20, 30, 40, 4); }
  else { const tw = d.m === 'atlas' ? 42 : 36; g.fillStyle = '#151a20'; g.beginPath(); g.roundRect(-14, -38, tw, 76, 4); g.fill(); g.fillStyle = M.col; g.fillRect(-12, -34, 4, 68); if (d.m === 'forge' || d.m === 'atlas') { const rg = g.createLinearGradient(0, -30, 0, 30); rg.addColorStop(0, '#ff4d6d'); rg.addColorStop(.5, '#7b2ff7'); rg.addColorStop(1, '#00d2ff'); g.fillStyle = rg; g.fillRect(-4, -30, tw - 14, 60); g.fillStyle = 'rgba(0,0,0,.55)'; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(-4 + (tw - 14) / 2, -18 + i * 18, 7, 0, TAU); g.fill(); } }
    g.fillStyle = '#2c3e50'; g.beginPath(); g.roundRect(-52, -30, 34, 26, 2); g.fill(); g.fillStyle = '#5dade2'; g.fillRect(-50, -28, 30, 20); }
  const pw = devPower(d); g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.roundRect(18, 22, 46, 18, 6); g.fill(); g.fillStyle = pw > 60 ? '#ff4d6d' : pw > 40 ? '#f39c12' : pw > 22 ? '#3498db' : '#95a5a6'; g.font = '800 13px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText('⚡' + pw, 41, 36);
  if (px) c.style.width = px + 'px'; return c; }
function partIcon(f, k, t, px) { const c = document.createElement('canvas'); c.width = 132; c.height = 90; const g = c.getContext('2d'); g.translate(66, 45);
  g.fillStyle = '#0b3d2e'; g.beginPath(); g.roundRect(-38, -26, 76, 52, 5); g.fill(); g.strokeStyle = '#1abc9c'; g.lineWidth = 1; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-34, -18 + i * 9); g.lineTo(34, -14 + i * 7); g.stroke(); }
  g.fillStyle = TIERC[t] || '#888'; g.beginPath(); g.roundRect(-16, -16, 32, 32, 4); g.fill(); g.font = '20px sans-serif'; g.textAlign = 'center'; g.fillText(SLOTE[k], 0, 7); g.fillStyle = '#fff'; g.font = '800 12px Rubik, sans-serif'; g.fillText('T' + t, 30, -14);
  if (px) c.style.width = px + 'px'; return c; }
