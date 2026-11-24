// ================= SKILLS: nine things your character gets better at by doing them =================
// Each skill runs from level 1 to 20 and levels up by doing the thing: punch to get strong, run to build stamina,
// drive fast to drive better, land shots to aim better, cook, haggle, hack, talk your way through things, and gamble
// and take chances for luck. SKM (in a_core) holds each skill as 0..1 for the systems that read it.
const SKDEF = {
  str: ['💪', 'Strength', 'Land punches and melee hits, knock people out, lift weights at home.', f => `Melee damage +${Math.round(100 * f)}% · damage taken −${Math.round(20 * f)}%`],
  sta: ['🏃', 'Stamina', 'Run and swim. The weight bench helps too.', f => `Run speed +${Math.round(15 * f)}% · swim +${Math.round(40 * f)}% · heal ${(1.5 * f).toFixed(1)} HP/s out of combat`],
  drv: ['🏎', 'Driving', 'Drive fast without slowing down for anything.', f => `Grip +${Math.round(30 * f)}% · acceleration +${Math.round(15 * f)}% · crash damage −${Math.round(25 * f)}%`],
  aim: ['🎯', 'Aiming', 'Land shots with guns.', f => `Bullet spread −${Math.round(55 * f)}% · reload ${Math.round(35 * f)}% faster`],
  cook: ['🍳', 'Cooking', 'Cook at a kitchen and ship product from your labs.', f => `Lab output +${Math.round(30 * f)}% · bigger perfect zone when cooking`],
  bar: ['🤝', 'Bartering', 'Buy and sell in shops, with dealers, at the pawn shop and the chop shop.', f => `Buy ${Math.round(15 * f)}% cheaper · sell for ${Math.round(20 * f)}% more`],
  hack: ['💻', 'Hacking', 'Hack anything — on the street or from a computer.', f => `Uploads ${Math.round(45 * f)}% faster · +${Math.round(50 * f)}% puzzle time · trace −${Math.round(30 * f)}%` + (f >= 1 ? ' · +2 battery' : f >= .5 ? ' · +1 battery' : '')],
  cha: ['😎', 'Charisma', 'Talk to people, finish jobs, bribe cops.', f => `Mission pay +${Math.round(25 * f)}% · rep gains +${Math.round(50 * f)}% · bribes +${Math.round(22 * f)}% likelier · ${Math.round(25 * f)}% of witnesses look away`],
  luck: ['🍀', 'Luck', 'Gamble, and live dangerously — it grows with every lucky break.', f => `${Math.round(12 * f)}% critical hits · ${Math.round(15 * f)}% lucky dodges · casino winnings +${Math.round(10 * f)}% · find cash in the street`] };
const SK_MAX = 20, skNeed = l => Math.round(20 * Math.pow(1.22, l - 1));
const SKS = () => { const S = G.save; if (!S.sk) { S.sk = {}; for (const k in SKDEF) S.sk[k] = { l: 1, x: 0 };
  // existing saves start with credit for what they've already done
  try { const H = S.hk; if (H && H.lvl) S.sk.hack.l = Math.min(SK_MAX, 1 + H.lvl * 2); const C = S.cook; if (C) S.sk.cook.l = Math.min(10, 1 + Math.floor(Object.values(C).reduce((a, v) => a + (v | 0), 0) / 3)); } catch (e) { } }
  for (const k in SKDEF) if (!S.sk[k]) S.sk[k] = { l: 1, x: 0 }; return S.sk; };
const skF = k => (SKS()[k].l - 1) / (SK_MAX - 1);
function skSync() { if (!G.save) return; const S = SKS(); for (const k in SKDEF) SKM[k] = (S[k].l - 1) / (SK_MAX - 1); }
function skGain(k, n) { if (!G.save || !SKDEF[k] || !(n > 0) || (typeof Net !== 'undefined' && Net.room && G.player && G.player.dead)) return; const s = SKS()[k]; if (s.l >= SK_MAX) return; s.x += n;
  while (s.l < SK_MAX && s.x >= skNeed(s.l)) { s.x -= skNeed(s.l); s.l++; skSync(); const D = SKDEF[k]; msg(D[0] + ' ' + D[1] + ' is now level ' + s.l + (s.l === SK_MAX ? ' — MAXED!' : '') + ' · ' + D[3](skF(k)), '#ffd23f'); Snd.play('mission'); G.skFlash = { k, t: G.t }; }
  if (s.l >= SK_MAX) s.x = 0; }
// ---------- combat: aim, strength, luck ----------
const SKF = { on: 0, crit: 0 };
{ const _pw = pw; pw = function (i) { const w = _pw(i); if (!SKF.on || !w) return w; const m = (w.melee ? 1 + SKM.str : 1) * (SKF.crit ? 2 : 1); return Object.assign({}, w, { spread: (w.spread || 0) * (1 - SKM.aim * .55), dmg: w.dmg * m }); }; }
{ const _f = playerFire0; playerFire0 = function () { SKF.on = 1; SKF.crit = Math.random() < SKM.luck * .12; try { return _f.apply(this, arguments); } finally { SKF.on = 0; } }; }
{ const _h = Ped.prototype.hurt; Ped.prototype.hurt = function (n, by, kind) { const alive = !this.dead; const r = _h.apply(this, arguments);
  if (alive && by === G.player && SKF.on && !this.isPlayer) { const w = WEAPONS[G.player.weapon] || {}; if (w.melee) skGain('str', 2); else skGain('aim', 1); if (SKF.crit) { G.critT = G.t; skGain('luck', .5); } } return r; }; }
{ const _sr = startReload; startReload = function () { const p = G.player, t0 = p.reloadT; _sr(); if (!(t0 > 0) && p.reloadT > 0) { p.reloadT *= 1 - SKM.aim * .35; p.reloadMax = p.reloadT; } }; }
{ const _hp = hurtPlayer; hurtPlayer = function (n, by, kind) { const p = G.player; if (n > 0 && p && !p.dead) { G.skHurtT = G.t;
  if (by && by !== p && Math.random() < SKM.luck * .15) { n *= .3; G.luckyT = G.t; skGain('luck', 1); } n *= 1 - SKM.str * .2; } return _hp.call(this, n, by, kind); }; }
{ const _d = Car.prototype.damage; Car.prototype.damage = function (n) { if (n > 0 && this === pCar() && this.driver === G.player) arguments[0] = n * (1 - SKM.drv * .25); return _d.apply(this, arguments); }; }
{ const _t = takedownNow; takedownNow = function () { const q = takedownTarget(), was = q && q.ko; const r = _t.apply(this, arguments); if (q && q.ko && !was) skGain('str', 15); return r; }; }
{ const _du = decorUse; decorUse = function (it) { const r = _du.apply(this, arguments); if (it && it.t === 'gym' && r && !(G.skGymT > G.t)) { G.skGymT = G.t + 90; skGain('str', 20); skGain('sta', 20); } return r; }; }
// ---------- moving: stamina and driving; healing; street finds ----------
{ let lx = null, ly = null, lc = null; const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play' || !G.save || !G.player) return; const p = G.player, c = pCar();
  if (!G.skSynced) { G.skSynced = 1; skSync(); } const o = c || p, d = lx === null || lc !== c ? 0 : Math.hypot(o.x - lx, o.y - ly); lx = o.x; ly = o.y; lc = c;
  if (!p.dead && d > 0 && d < 60 && !G.scene) { const v = d / Math.max(dt, 1e-4);
    if (!c) { if (p.swim) skGain('sta', d / 250); else if (v > 150) skGain('sta', d / 400); }
    else if (c.driver === p && v > 220 && !c.d.boat) skGain('drv', d / 900); }
  if (!p.dead && p.hp < 100 && SKM.sta > 0 && G.t - (G.skHurtT || -99) > 6) p.hp = Math.min(100, p.hp + dt * SKM.sta * 1.5);
  if (!c && !p.dead && !G.scene && SKM.luck > 0) { G.skFindT = (G.skFindT || 0) + dt; if (G.skFindT > 90) { G.skFindT = 0; if (Math.random() < SKM.luck * .35) { const v = Math.round(rnd(20, 200) * (1 + SKM.luck)); addCash(v); msg('🍀 Lucky find: ' + money(v) + ' lying in the gutter.', '#2ecc71'); skGain('luck', 3); } } } }; }
// ---------- bartering: shops, dealers, the pawn shop, the chop shop, property ----------
const SK_BUY = new Set(['shopk', 'gunshop', 'pawn', 'market', 'tech', 'devws', 'decor', 'bar', 'shopk', 'hgarage', 'yard', 'airport', 'guns', 'gunws', 'pets', 'lab']);
const SK_SELL = new Set(['pawn', 'market', 'devws', 'yard', 'gunws', 'guns', 'farm']);
const tradeDlg = () => (G.dlgOpen && G.skTradeDlg && G.skTradeDlg === G.dlgSeq) || performance.now() < (G.skTradeUntil || 0);
const buyCtx = () => (G.invOpen && Panel.mode && SK_BUY.has(Panel.mode)) || G._skBuy || tradeDlg(), sellCtx = () => (G.invOpen && Panel.mode && SK_SELL.has(Panel.mode)) || tradeDlg();
const barXP = n => 3 + Math.log10(Math.max(10, n)) * 3;
{ const _sd = showDialog; showDialog = function () { const trade = G._skNextTrade || tradeDlg(); G._skNextTrade = 0; const r = _sd.apply(this, arguments); G.skTradeDlg = trade ? G.dlgSeq : 0;
  const q = G.talkPed; if (q && !q._skT && !q.isPlayer) { q._skT = 1; skGain('cha', 4); } return r; }; }
{ const _cd = closeDialog; closeDialog = function () { if (G.dlgOpen && G.skTradeDlg === G.dlgSeq) G.skTradeUntil = performance.now() + 60; return _cd.apply(this, arguments); }; }
{ const _dm = dealerMenu; dealerMenu = function () { G._skNextTrade = 1; try { return _dm.apply(this, arguments); } finally { G._skNextTrade = 0; } }; }
{ const _oc = openChop; openChop = function () { G._skNextTrade = 1; try { return _oc.apply(this, arguments); } finally { G._skNextTrade = 0; } }; }
{ const _bp = buyProperty; buyProperty = function () { G._skBuy = 1; try { return _bp.apply(this, arguments); } finally { G._skBuy = 0; } }; }
let skHagT = 0; const haggled = (off, n) => { if (performance.now() - skHagT > 1500) { skHagT = performance.now(); toast('🤝 Haggled ' + money(off) + ' off'); } skGain('bar', barXP(n)); };
for (const nm of ['payAny', 'payCash']) { const _p = nm === 'payAny' ? payAny : payCash; const w = function (n) { const casino = G.invOpen && Panel.mode === 'casino';
  if (n > 0 && !casino && buyCtx()) { const off = Math.floor(n * SKM.bar * .15); const r = _p.call(this, n - off); if (r) { if (off >= 1) haggled(off, n); else skGain('bar', barXP(n)); } return r; }
  const r = _p.apply(this, arguments); if (r && casino && n > 0) skGain('luck', 1.5); return r; }; if (nm === 'payAny') payAny = w; else payCash = w; }
{ const _ac = addCash; addCash = function (n, quiet) { if (n > 0) { if (G.invOpen && Panel.mode === 'casino') n = Math.round(n * (1 + SKM.luck * .1));
  else if (sellCtx()) { const b = Math.round(n * SKM.bar * .2); if (b > 0) { n += b; if (performance.now() - skHagT > 1500) { skHagT = performance.now(); toast('🤝 Talked them up ' + money(b)); } } skGain('bar', barXP(n)); } } return _ac.call(this, n, quiet); }; }
// ---------- charisma ----------
{ const _cm = completeMission; completeMission = function () { const m = G.mission; if (m && m.reward > 0 && SKM.cha > 0 && !m._skBoost) { m._skBoost = 1; m.reward = Math.round(m.reward * (1 + SKM.cha * .25)); }
  const r = _cm.apply(this, arguments); if (m) { skGain('cha', m.heistId ? 60 : 25); skGain('luck', 5); if (/shipment/i.test(m.title || '')) skGain('cook', 20); } return r; }; }
{ const _ra = repAdd; repAdd = function (g, n) { return _ra.call(this, g, n > 0 ? Math.round(n * (1 + SKM.cha * .5)) : n); }; }
{ const _pw2 = pickWitness; pickWitness = function () { const w = _pw2.apply(this, arguments); if (w && Math.random() < SKM.cha * .25) return null; return w; }; }
// ---------- cooking & hacking ----------
{ const _cd = cookDone; cookDone = function (r, n, res) { const out = _cd.apply(this, arguments); if (out) skGain('cook', 6 * (n | 0 || 1) + (res === 'perfect' ? 6 : 0)); return out; }; }
{ const _x = hkXP; hkXP = function (n) { skGain('hack', n); return _x.apply(this, arguments); }; }
{ const _p = pcDo; pcDo = function () { skGain('hack', 8); return _p.apply(this, arguments); }; }
{ const _t = traceAdd; traceAdd = function (n, d) { return _t.call(this, n * (1 - SKM.hack * .3), d); }; }
{ const _ds = devStats; devStats = function (d) { const s = _ds(d); if (d && DEV_MODELS[d.m].f === 'phone') s.charges += (SKM.hack >= .5 ? 1 : 0) + (SKM.hack >= 1 ? 1 : 0); return s; }; }
// ---------- the Skills screen ----------
(() => { const st = document.createElement('style'); st.textContent = `#panel .skbar{height:7px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:4px}#panel .skbar b{display:block;height:100%;background:linear-gradient(90deg,#ffd23f,#ff9f43)}#panel .sklv{font-weight:800;color:#ffd23f}`; document.head.appendChild(st); })();
PMODES.skills = function (H) { const S = SKS(); H.title.textContent = '⭐ Skills'; const tot = Object.values(S).reduce((a, s) => a + s.l, 0), c = H.col('Total level ' + tot + ' / ' + SK_MAX * 9);
  for (const k in SKDEF) { const [e, n, how, eff] = SKDEF[k], s = S[k], f = (s.l - 1) / (SK_MAX - 1), r = H.row(c, e, n + '  ·  level ' + s.l + (s.l >= SK_MAX ? ' (max)' : ''), (s.l === 1 ? 'Up to: ' + eff(1) : eff(f)) + ' — ' + how, []);
    const bar = H.mk('div', 'skbar'), b = H.mk('b'); b.style.width = (s.l >= SK_MAX ? 100 : Math.round(100 * s.x / skNeed(s.l))) + '%'; bar.appendChild(b); const t = r.querySelector('.pt'); if (t) t.appendChild(bar); }
  H.foot.appendChild(H.mk('span', 'pnote', 'Skills grow by doing. Every level makes that part of the game a bit easier.')); };
{ const _ph = PMODES.phone; PMODES.phone = function (H) { const r = _ph.call(this, H); try { const tabs = H.el.querySelector('.ptabs'); if (tabs) { const b = H.mk('button', '', '⭐ Skills'); b.onclick = () => { Snd.play('ui'); Panel.open('skills'); }; tabs.appendChild(b); } } catch (e) { } return r; }; }
// ---------- HUD: crit and lucky-dodge pops, level-up glow ----------
{ const _dl = drawLawHUDL; drawLawHUDL = function (sc) { _dl(sc); if (G.mode !== 'play') return;
  const pop = (t, s, col) => { const a = 1 - (G.t - t) / .7; if (a <= 0) return; ctx.globalAlpha = a; txt(s, VW / 2, VH * .38 - (1 - a) * 24 * sc, 18 * sc, col, 'center'); ctx.globalAlpha = 1; };
  if (G.critT) pop(G.critT, '💥 CRIT', '#ff6b6b'); if (G.luckyT) pop(G.luckyT, '🍀 LUCKY', '#2ecc71'); }; }
