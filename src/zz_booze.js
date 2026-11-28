// ================= ALCOHOL: a real drinks menu at every bar, and a blood-alcohol level that actually does things to you =================
Object.assign(ITEMS, { wine: { n: 'Bottle of wine', v: 30, w: 2, k: 'food', e: '🍷', heal: 4, drunk: 11 }, vodka: { n: 'Vodka', v: 35, w: 1, k: 'food', e: '🍸', heal: 3, drunk: 16 } });
// BAC: drinks add to it, the body burns ~0.05 off a minute. 0.08 legally drunk, 0.30+ blackout.
const BACL = [[.3, 'Blacking out', '#ff1744'], [.2, 'Wasted', '#ff5252'], [.12, 'Drunk', '#ff9800'], [.06, 'Tipsy', '#ffc107'], [.025, 'Buzzed', '#ffe082']];
const bacState = b => BACL.find(l => b >= l[0]) || null;
function drink(a) { G.bac = Math.min(.42, (G.bac || 0) + a); G.bacPeak = Math.max(G.bacPeak || 0, G.bac); G.hang = 0; const s = bacState(G.bac); if (s && s[1] !== G.bacLast) { G.bacLast = s[1]; msg('🍺 You\'re ' + s[1].toLowerCase() + '.', s[2]); } }
function sober(a) { G.bac = Math.max(0, (G.bac || 0) - a); }
const DRINKS = [['beer', '🍺', 'Draft beer', 8, .022, 'Cold, cheap, honest.'], ['ipa', '🍻', 'Craft IPA', 12, .03, 'Hoppy. Stronger than it tastes.'], ['wine', '🍷', 'Glass of red', 14, .028, 'Pairs with bad decisions.'], ['vodka', '🍸', 'Vodka shot', 15, .04, 'Down the hatch.'],
  ['whiskey', '🥃', 'Whiskey, neat', 18, .042, 'Warms you right up.'], ['tequila', '🌵', 'Tequila shot', 16, .046, 'Salt, shot, lime, regret.'], ['cocktail', '🍹', 'Varro Sunrise', 22, .05, 'House cocktail. Mostly rum.'], ['moonshine', '🫙', 'Moonshine', 30, .08, 'From a guy who knows a guy. Careful.']];
// ---------- the bar ----------
PMODES.bar = function (H) { const s = G.scene, b = s && s.b, free = b && (owned(b)), sc = G.bac || 0, st = bacState(sc); H.title.textContent = '🍸 ' + (b ? b.name : 'The bar') + (free ? ' — on the house' : '');
  const c = H.col('Drinks'), buy = (pr, f) => { if (free || payAny(pr)) { Snd.play('pour'); f(); } }, P = this;
  for (const [id, e, n, pr, a, ds] of DRINKS) H.row(c, e, n + '  ' + (free ? 'free' : money(pr)), ds + ' · ' + (a >= .045 ? 'strong' : a >= .03 ? 'medium' : 'light'), [H.btn('Drink', () => buy(pr, () => { drink(a); heal(4); P.lastD = n; }), 'y', !free && !canPay(pr))]);
  H.row(c, '🎉', 'Buy a round for the bar  ' + money(150), 'Everyone cheers. You have one too.', [H.btn('Buy round', () => buy(150, () => { drink(.025); heal(8); if (s) for (const q of s.peds) if (!q.dead && q !== G.player && q.role !== 'cop') pedSay(q, pick(['Cheers!', 'Hey, thanks pal!', 'Legend!', '🍺!'])); }), '', !free && !canPay(150))]);
  const c2 = H.col('Sober up & to go'); H.row(c2, '💧', 'Water  ' + money(2), 'Takes the edge off', [H.btn('Drink', () => buy(2, () => { sober(.015); heal(2); }))]); H.row(c2, '☕', 'Black coffee  ' + money(5), 'Sobers you a bit and cures a hangover', [H.btn('Drink', () => buy(5, () => { sober(.03); G.hang = 0; heal(5); }))]);
  for (const [id, n, pr, k] of [['beer', 'Six-pack to go', 40, 6], ['wine', 'Bottle of wine', 45, 1], ['vodka', 'Bottle of vodka', 55, 1], ['whiskey', 'Bottle of whiskey', 60, 1]]) H.row(c2, ITEMS[id].e, n + '  ' + money(pr), 'Goes in your backpack', [H.btn('Buy', () => { if (!payAny(pr)) return; const got = invAdd(id, k); if (got < k) toast('Backpack full'); Snd.play('cash'); }, '', !canPay(pr))]);
  const c3 = H.col('You'); H.row(c3, st ? '🥴' : '🙂', st ? st[1] : 'Sober', 'Blood alcohol ' + sc.toFixed(3) + (sc >= .08 ? ' — over the limit to drive' : ''), []).classList.add('pmsg');
  H.row(c3, 'ℹ', 'How it hits you', 'Buzzed: braver, shrug off a little damage. Tipsy/drunk: double vision, swaying, wobbly driving and aim. Wasted: you might be sick. 0.30+: you black out and wake up somewhere else, lighter in the wallet.').classList.add('pmsg');
  if (this.lastD) H.foot.appendChild(H.mk('span', 'pnote', 'Bartender: "' + this.lastD + ', coming right up."')); };
{ const _sm = shopMenu; shopMenu = function (q) { if (q && q.shop === 'bar') { closeDialog(); return Panel.open('bar', {}); } return _sm(q); }; }
// ---------- the effects ----------
function boozeTick(dt) { const p = G.player; if (!p) return; if (p.dead) { G.bac = 0; return; } let b = G.bac || 0;
  if (b > 0) { b = Math.max(0, b - dt * .00085); G.bac = b; } G.drunk = Math.max(G.drunk || 0, b * 160);
  const st = bacState(b); if (!st) G.bacLast = null; else if (st[1] !== G.bacLast && b < (G.bacPrev || 0)) G.bacLast = st[1]; G.bacPrev = b;
  // hangover after a heavy night
  if (b < .015 && (G.bacPeak || 0) >= .15) { G.bacPeak = 0; G.hang = 150; msg('🤕 Hangover. Coffee, water or a meal will help.', '#b0bec5'); } if (G.hang > 0) G.hang -= dt;
  // being sick
  if (b > .2 && !G.scene && (G.pukeT = (G.pukeT || rnd(10, 25)) - dt) <= 0) { G.pukeT = rnd(18, 34); const c = pCar(); (G.puke || (G.puke = [])).push({ x: (c || p).x + rnd(-10, 10), y: (c || p).y + rnd(-10, 10), t: G.t }); if (G.puke.length > 12) G.puke.shift(); p.hp = Math.max(1, p.hp - 3); sober(.02); toast('🤮 *hurl*'); Snd.play('splash', p.x, p.y, .5); }
  // blackout
  if (b >= .3 && !G.blackT) { G.blackT = G.t + 1.2; G.fade = 3; G.big = { text: 'BLACKOUT', col: '#ff1744', t: 2 }; }
  if (G.blackT && G.t > G.blackT) { G.blackT = 0; blackout(); }
  // drunk driving: weaving, and cops notice
  const c = pCar(); if (c && b >= .06 && !c.d.air) { const k = Math.min(1, (b - .04) / .16), sp = Math.min(1, Math.abs(c.fwd || 0) / 500); c.a += (Math.sin(G.t * 1.3 + c.uid) * .55 + Math.sin(G.t * 3.1) * .25) * k * sp * dt;
    if (b >= .08 && Math.abs(c.fwd || 0) > 120 && G.t > (G.duiT || 0)) { const cop = copSees() || G.cars.find(k2 => k2.d.siren && k2.driver && !k2.dead && dist2(k2.x, k2.y, c.x, c.y) < 520 * 520); if (cop) { G.duiT = G.t + 45; crime(.7, 'Driving under the influence'); msg('🚨 A cop saw you weaving — DUI.', '#ff6b6b'); } } } }
function blackout() { const p = G.player, c = pCar(); if (c) exitCar(true); if (G.scene) exitBuilding(); const sp = typeof randStreetPoint === 'function' ? randStreetPoint(0, 99999, TILE.WALK) : null, a = Math.random() * TAU;
  let x = p.x + Math.cos(a) * rnd(600, 1600), y = p.y + Math.sin(a) * rnd(600, 1600); for (let i = 0; i < 40 && solidW(x, y); i++) { x = p.x + Math.cos(a + i) * rnd(300, 1800); y = p.y + Math.sin(a + i) * rnd(300, 1800); } if (!solidW(x, y)) { p.x = x; p.y = y; }
  const robbed = Math.random() < .6 ? Math.round(G.cash * rnd(.1, .4)) : 0; G.cash -= robbed; G.tod = (G.tod + 4) % 24; G.bac = .07; G.bacPeak = .2; p.hp = Math.max(10, p.hp - 10); G.fade = 2.5;
  setTimeout(() => say('…ugh.', 'You wake up in ' + (DISTRICTS[districtAt(p.x, p.y)] || {}).name + ' with no idea how you got here. Four hours are gone.' + (robbed ? ' So is ' + money(robbed) + ' from your wallet.' : ' Your wallet, miraculously, is not.'), [{ t: 'Never again' }]), 900); }
// courage: a few drinks take the edge off pain; aim suffers
{ const _h = Ped.prototype.hurt; Ped.prototype.hurt = function (n, by, kind) { if (this === G.player && (G.bac || 0) > .025) n *= 1 - Math.min(.2, G.bac * 1.2); return _h.call(this, n, by, kind); }; }
{ const _pc = pwCalc; pwCalc = function (b, m) { const w = _pc(b, m); const k = G.bac || 0; if (w && k > .04 && typeof w.spread === 'number') return Object.assign({}, w, { spread: w.spread * (1 + (k - .04) * 9) + (k - .04) * .08 }); return w; }; }
// ---------- what it looks like: double vision, tunnel vision, a warm haze ----------
function boozeFX() { const b = G.bac || 0; if (G.mode !== 'play') return; const g = ctx;
  if (b > .045) { const k = Math.min(1, (b - .045) / .18), dx = Math.sin(G.t * 1.15) * (6 + 22 * k) * DPR, dy = Math.cos(G.t * .9) * (3 + 10 * k) * DPR; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .18 + .22 * k; g.drawImage(cv, dx, dy); g.restore(); }
  if (b > .1) { const k = Math.min(1, (b - .1) / .2), gr = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * (.42 - .14 * k), VW / 2, VH / 2, Math.max(VW, VH) * .72); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,0,0,' + (.35 + .4 * k) + ')'); g.fillStyle = gr; g.fillRect(0, 0, VW, VH); }
  if (G.hang > 0) { g.fillStyle = 'rgba(60,70,80,' + Math.min(.16, G.hang / 900) + ')'; g.fillRect(0, 0, VW, VH); } }
{ const _rh = renderHUD; renderHUD = function () { boozeFX(); _rh(); }; }
function boozeBadge() { const b = G.bac || 0, st = bacState(b); if (!st && !(G.hang > 0)) return null; return [st ? '🍺 ' + st[1] + ' ' + b.toFixed(2) : '🤕 Hangover', st ? st[2] : '#b0bec5']; }
{ const _dg = drawGaragePads; drawGaragePads = function () { _dg(); if (G.scene || !G.puke) return; for (const k of G.puke) { const a = Math.max(0, 1 - (G.t - k.t) / 90); if (a <= 0 || !inView(k.x, k.y, 30)) continue; ctx.fillStyle = 'rgba(150,170,60,' + .7 * a + ')'; ctx.beginPath(); ctx.ellipse(k.x, k.y, 12, 8, k.t, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(k.x + 10, k.y - 5, 4, 0, TAU); ctx.fill(); } }; }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode === 'play') boozeTick(dt); }; }
// your properties in green on the map and minimap
const OWNC = '#2ecc71';
{ const _is = iconSpr; iconSpr = function (ic, col, px) { if (col !== OWNC) return _is(ic, col, px); px = Math.max(7, Math.round(px)); const k = 'G' + ic + px; let c = ICS.get(k); if (c) return c; const base = _is(ic, '#fff', px); c = mkCanvas(base.width, base.height); const g = c.getContext('2d'); g.drawImage(base, 0, 0);
  g.globalCompositeOperation = 'source-atop'; const t = mkCanvas(base.width, base.height), h = t.getContext('2d'); h.drawImage(base, 0, 0); h.globalCompositeOperation = 'source-in'; h.fillStyle = '#000'; h.fillRect(0, 0, t.width, t.height); // dark outline only
  g.globalCompositeOperation = 'multiply'; g.fillStyle = '#39e27c'; g.fillRect(0, 0, c.width, c.height); g.globalCompositeOperation = 'destination-in'; g.drawImage(base, 0, 0); ICS.set(k, c); return c; }; }
{ const _mp = mapPOIs; mapPOIs = function () { const o = _mp(), a = aptB(); for (const q of o) { if (a && aptMine() && Math.abs(q.x - a.door.x) < 1 && Math.abs(q.y - a.door.y) < 1) { q.c = OWNC; q.pr = Math.max(q.pr, 9); q.n = 'Your Apartment'; } if (W.bunker && bunkOwned() && Math.abs(q.x - W.bunker.door.x) < 1 && Math.abs(q.y - W.bunker.door.y) < 1) q.c = OWNC; } return o; }; }
// building footprints on the map/minimap image turn green when they're yours
function ownMiniSync() { if (!MINI) return; const own = W.buildings.filter(b => !b.gone && (isMyApt(b) || owned(b))).map(b => b.id), sig = own.join(','); if (sig === G.ownSig && MINI === G.ownMini) return; G.ownSig = sig; G.ownMini = MINI; const g = MINI.getContext('2d');
  for (const [id, data] of G.ownSaved || []) { const b = W.buildings[id]; g.putImageData(data, b.x, b.y); } G.ownSaved = [];
  for (const id of own) { const b = W.buildings[id]; if (!b || b.w <= 0) continue; G.ownSaved.push([id, g.getImageData(b.x, b.y, b.w, b.h)]); g.fillStyle = '#2ecc71'; g.fillRect(b.x, b.y, b.w, b.h); g.fillStyle = '#1b8a4a'; g.fillRect(b.x, b.y + b.h - 1, b.w, 1); } }
{ const _u = update; update = function (dt) { _u(dt); if ((G.ownT = (G.ownT || 0) - dt) <= 0) { G.ownT = 1; try { ownMiniSync(); } catch (e) { } } }; }
