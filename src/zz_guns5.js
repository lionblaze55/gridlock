// ================= guns are individual items, handled like car parts =================
// One grid of every gun you own (carried + collection), never stacked. Tap one → a card like the car-part card:
// work on it, carry / store, Fix now (pay for an instant repair), Slow fix (clean & oil), strip, scrap.
// Spare core parts and attachments are tiles too, with Fix now and Scrap. No top tabs: the back button lives in the title.
WSLOTS.barrel.n = 'Barrel length';
const GRFIX = [1, 1.6, 2.4], r5g = v => Math.round(v / 5) * 5;
const compW = k => (GCOMP.find(x => x[0] === k) || [0, 0, .25])[2];
function coreFixCost(id, k, c, g) { if (c >= .95) return 0; return Math.max(25, r5g(repairCost(WEAPONS[WI[id]].price * compW(k), c) * 2.2 * GRFIX[g | 0])); }
function gunFixCost(id, wc) { const g = wc.g || {}, ms = wc.miss || {}; return GCOMP.reduce((s, [k]) => s + (ms[k] ? 0 : coreFixCost(id, k, wc[k] ?? 1, g[k])), 0); }
const gunScrapVal = (id, wc) => Math.max(10, r5g(gunValue(id, {}, wc) * .08));
const attScrapVal = (s, v) => Math.max(5, r5g(WSLOTS[s].o[v][1] * .12));
const attList = m => Object.keys(m || {}).filter(s => m[s] && s !== 'skin' && WSLOTS[s] && WSLOTS[s].o[m[s]]);
const gName = id => WEAPONS[WI[id]].name;

// ---------- working on a gun from the collection: mount its data on the bench while it's open ----------
let GMOUNT = null;
function gMount(sp) { gUnmount(); const id = sp.id; GMOUNT = { uid: sp.uid, id, m: G.wmods[id], c: WCOND()[id] }; G.wmods[id] = Object.assign({}, sp.mods || {}); WCOND()[id] = JSON.parse(JSON.stringify(sp.wc || {})); PWC = {}; }
function gUnmount() { const M = GMOUNT; if (!M) return; GMOUNT = null; const sp = SPARES().find(s => s.uid === M.uid);
  if (sp) { sp.mods = Object.assign({}, G.wmods[M.id] || {}); sp.wc = JSON.parse(JSON.stringify(WCOND()[M.id] || sp.wc)); }
  if (M.m === undefined) delete G.wmods[M.id]; else G.wmods[M.id] = M.m; if (M.c === undefined) delete WCOND()[M.id]; else WCOND()[M.id] = M.c; PWC = {}; }
{ const _ds = doSave; doSave = function (q) { if (!GMOUNT) return _ds(q); const sp = SPARES().find(s => s.uid === GMOUNT.uid); gUnmount(); const r = _ds(q); if (sp) gMount(sp); return r; }; }
{ const _o = Panel.open; Panel.open = function () { gUnmount(); this.wbSp = null; this.gwSel = null; this.gpSel = null; this.gwConf = null; return _o.apply(this, arguments); }; }
{ const _c = Panel.close; Panel.close = function () { gUnmount(); return _c.apply(this, arguments); }; }
{ const _ct = cleanTick; cleanTick = function () { const CL = G.save && G.save.wclean; if (GMOUNT && CL && CL.id === GMOUNT.id) { CL.last = G.t; return; } return _ct(); }; }

// ---------- the back button goes in the title bar, not in tabs ----------
wbBack = function (H, P) { const t = H.title, b = document.createElement('button'); b.className = 'gtback'; b.textContent = '‹ Guns'; b.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); gUnmount(); P.wbGun = null; P.wbSp = null; P.pv = null; P.cslot = null; P.copt = null; Panel.render(); };
  const nm = gName(P.wbGun) + (P.wbSp ? ' · collection' : ''); t.textContent = ''; t.appendChild(b); t.appendChild(document.createTextNode(nm)); const tabs = H.el.querySelector('.ptabs'); if (tabs && !tabs.children.length) tabs.style.display = 'none'; };
(() => { const st = document.createElement('style'); st.textContent = `#panel .gtback{background:#12151d;color:#f2c230;border:0;border-radius:10px;font:800 14px Rubik,system-ui,sans-serif;padding:7px 12px;margin-right:10px;cursor:pointer;vertical-align:middle;letter-spacing:0}
#panel .gtile .gfx.car{background:#4fc3f7;color:#062033}#panel .ldet .lhd canvas.gbig{width:84px;height:54px}
#panel .gdet2 .pbs{flex:1 1 100%!important;width:100%!important;max-width:none!important}#panel .gdet2 .pbs .pb{flex:1 1 0!important;min-width:0}
#panel .gwnote{font:600 12px Rubik,system-ui,sans-serif;color:#9aa3b5;padding:4px 2px}`; document.head.appendChild(st); })();

// ---------- the home gun workshop ----------
function gunHome(H, P) { gUnmount(); H.title.textContent = '🔧 Gun workshop'; const p = G.player, S = SPARES();
  const guns = myGuns().map(id => ({ key: 'c:' + id, id, carried: 1, mods: G.wmods[id] || {}, wc: gcond(id), ammo: p.ammo[WI[id]] | 0 }))
    .concat(S.map(sp => ({ key: 's:' + sp.uid, id: sp.id, sp, mods: sp.mods || {}, wc: sp.wc, ammo: sp.ammo | 0 })));
  const c = H.col('Your guns · ' + guns.length + (S.length ? ' (' + S.length + ' in the collection)' : ''));
  let sel = guns.find(g => g.key === P.gwSel) || null; if (!sel) P.gwSel = null;
  if (!guns.length) H.empty(c, 'You don\'t own any guns. Buy one at a gun shop — every extra one you buy or pick up is kept here.');
  else { if (sel) c.appendChild(gunCard(H, P, sel)); const g = gGrid(H, c, 'gw'); g.style.gridTemplateColumns = 'repeat(auto-fill,minmax(96px,1fr))';
    for (const x of guns) { const t = gTile(H, g, 'gw', x.key, '🔫', gName(x.id), null, { canvas: gunIconBig(x.id, undefined, x.mods), cond: cAvg(x.wc) }); t.classList.add('gun');
      if (x.carried) t.appendChild(H.mk('span', 'gfx car', 'CARRIED')); else if (attList(x.mods).length) t.appendChild(H.mk('span', 'gfx own', attList(x.mods).length + ' ATT'));
      if (sel === x) t.classList.add('sel'); t.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.gwSel = P.gwSel === x.key ? null : x.key; P.gpSel = null; P.gwConf = null; Panel.render(); }; }
    if (!sel) c.appendChild(H.mk('div', 'gwnote', 'Tap a gun to work on it, carry it, fix it or scrap it.')); }
  // spare parts: core parts (each its own, with wear) and attachments
  const R = GCORE(), B = GPARTS(), aks = Object.keys(B).filter(k => { const [s, v] = k.split(':'); return B[k] > 0 && WSLOTS[s] && WSLOTS[s].o[+v]; });
  const c2 = H.col('Spare parts on the bench · ' + (R.length + aks.reduce((a, k) => a + B[k], 0)));
  if (!R.length && !aks.length) { H.empty(c2, 'Parts you pull off a gun, strip from one or buy for the bench land here.'); return; }
  const psel = P.gpSel; let card = null; const g2 = gGrid(H, c2, 'gp');
  R.forEach((r, i) => { const key = 'k' + i, t = gTile(H, g2, 'gp', key, '🔩', (r.g ? GRN[r.g].split('-')[0] + ' ' : '') + gName(r.id).split(' ')[0] + ' ' + coreName(r.k).split(' ')[0].toLowerCase(), null, { canvas: coreIcon(r.id, r.k), cond: r.c });
    if (r.g) t.appendChild(H.mk('span', 'gfx own', GRB[r.g])); if (psel === key) { t.classList.add('sel'); card = coreCard(H, P, r); } t.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.gpSel = P.gpSel === key ? null : key; P.gwSel = null; Panel.render(); }; });
  for (const k of aks) { const [s, v] = k.split(':'), key = 'a' + k, t = gTile(H, g2, 'gp', key, '🔩', WSLOTS[s].o[+v][0].split(' —')[0], B[k] > 1 ? B[k] : null, { canvas: wmIcon(s, +v) });
    if (psel === key) { t.classList.add('sel'); card = attCard(H, P, s, +v, B[k]); } t.onclick = ev => { ev.stopPropagation(); Snd.play('ui'); P.gpSel = P.gpSel === key ? null : key; P.gwSel = null; Panel.render(); }; }
  if (psel && !card) P.gpSel = null; if (card) c2.insertBefore(card, g2); else c2.appendChild(H.mk('div', 'gwnote', 'Tap a part to fix it or scrap it. To fit one, open a gun and tap its slot.')); }

// the card shell, same look as the car-part card
function gCardShell(H, P, icon, title, sub, onClose) { const d = H.mk('div', 'ldet'), x = H.mk('button', 'lx', '✕'); x.onclick = ev => { ev.stopPropagation(); onClose(); Panel.render(); }; d.appendChild(x);
  const hd = H.mk('div', 'lhd'); hd.appendChild(icon); const tx = H.mk('div', ''); tx.style.minWidth = '0'; tx.appendChild(H.mk('b', '', title)); tx.appendChild(H.mk('small', '', sub)); hd.appendChild(tx); d.appendChild(hd);
  const bb = H.mk('div', 'lbtns'), B = (l, s, fn, cls, dis, wide) => { const b = H.btn(l, fn, cls, dis); b.textContent = ''; b.appendChild(H.mk('span', '', l)); if (s) b.appendChild(H.mk('small', '', s)); if (wide) b.classList.add('wide'); bb.appendChild(b); return b; };
  return { d, bb, B, bar: c => { const cb = H.mk('div', 'pcbar'), ci = H.mk('b'); ci.style.width = Math.round(c * 100) + '%'; ci.style.background = condCol(c); cb.appendChild(ci); d.appendChild(cb); }, hint: t => d.appendChild(H.mk('div', 'lhint', t)), done: () => { if ([...bb.children].filter(b => !b.classList.contains('wide')).length % 2) bb.lastChild.classList.add('wide'); d.appendChild(bb); return d; } }; }

function gunCard(H, P, x) { const id = x.id, nm = gName(id), avg = cAvg(x.wc), gr = x.wc.g || {}, at = attList(x.mods), ic = gunIconBig(id, 64, x.mods); ic.classList.add('gbig');
  const K = gCardShell(H, P, ic, nm + (x.carried ? ' · carried' : ' · collection'), condWord2(avg) + ' ' + pct(avg) + ' · ' + GCOMP.map(([k]) => (gr[k] ? GRB[gr[k]] + ' ' : '') + coreName(k).split(' ')[0].replace('Trigger', 'Action').replace('Magazine', 'Feed').toLowerCase() + ' ' + pct(x.wc[k] ?? 1)).join(' · '), () => { P.gwSel = null; P.gwConf = null; });
  K.bar(avg); K.hint((gMissAny(x.wc) ? '⚠ Missing ' + GCOMP.filter(([k]) => gMiss(x.wc, k)).map(([k]) => coreName(k).split(' ')[0].replace('Trigger', 'action').replace('Magazine', 'feed').toLowerCase()).join(' & ') + ' — won\'t fire · ' : '') + (at.length ? 'Fitted: ' + at.map(s => WSLOTS[s].o[x.mods[s]][0].split(' —')[0]).join(', ') : 'No attachments') + ' · ' + x.ammo + ' rounds');
  const B = K.B, open = () => { if (x.carried) { gUnmount(); P.wbSp = null; } else { gMount(x.sp); P.wbSp = x.sp.uid; } P.wbGun = id; P.cslot = 'c:barrel'; P.copt = null; P.pv = null; P.gwSel = null; };
  B('🔧 Work on it', 'Core parts, wear & attachments', open, 'y', false, true);
  if (x.carried) B('📦 Store it', 'Into your collection', () => { if (!addToCollection(id, x.mods, x.wc, x.ammo)) return; dropGun(id); P.gwSel = null; Snd.play('cock'); toast(nm + ' stored in your collection'); }, '', SPARES().length >= GUNCAP);
  else B('🎒 Carry it', ownsGun(id) ? 'Swaps with the ' + nm + ' you carry' : 'Take it with you', () => { const k = 'c:' + id; spareCarry(x.sp); P.gwSel = k; });
  const fix = gunFixCost(id, x.wc); B('⚡ Fix now', fix ? '→ 100% · ' + money(fix) : 'Nothing to fix', () => { if (!payAny(fix)) return Snd.play('bad'); const w = x.carried ? gcond(id) : x.sp.wc; for (const [k] of GCOMP) if (!(w.miss && w.miss[k])) w[k] = 1; if (x.carried && G.save.wclean && G.save.wclean.id === id) G.save.wclean = null; PWC = {}; Snd.play('ratchet'); toast('✨ ' + nm + ' fixed up — good as new'); doSave(true); }, fix ? 'r' : '', !fix || !canPay(fix));
  if (x.carried) { const CL = G.save.wclean, cc = cleanCost(id), on = CL && CL.id === id; B('🐢 Slow fix', on ? 'Cleaning now…' : cc ? money(cc) + ' · clean & oil while you play' : 'Nothing to clean', () => startClean(id), '', on || !cc || !canPay(cc)); }
  else { B('🧩 Strip for parts', 'Barrel, action, feed' + (at.length ? ' + ' + at.length + ' attachment' + (at.length > 1 ? 's' : '') : '') + ' → bench', () => { spareStrip(x.sp); P.gwSel = null; }); }
  const sv = gunScrapVal(id, x.wc), conf = P.gwConf === x.key;
  B('🗑 Scrap', conf ? 'Tap again — it\'s gone for good' : '+' + money(sv) + (at.length ? ' · attachments → bench' : ''), () => { if (!conf) { P.gwConf = x.key; return; } P.gwConf = null; for (const s of at) gpAdd(s, x.mods[s]);
    if (x.carried) dropGun(id); else { const S = SPARES(), i = S.indexOf(x.sp); if (i >= 0) S.splice(i, 1); } addCash(sv); Snd.play('grinder'); toast('Scrapped the ' + nm + ' — ' + money(sv)); P.gwSel = null; doSave(true); }, 'r');
  return K.done(); }

function coreCard(H, P, r) { const R = GCORE(), nm = (r.g ? GRN[r.g] + ' ' : 'Stock ') + coreName(r.k).toLowerCase(), fix = coreFixCost(r.id, r.k, r.c, r.g), sv = Math.round(coreScrap(r.id, r.k, r.c) * GRM[r.g | 0]);
  const fits = [...new Set(myGuns().concat(SPARES().map(s => s.id)).filter(id => gfam(id) === gfam(r.id)).map(gName))];
  const K = gCardShell(H, P, coreIcon(r.id, r.k, 64), nm, 'From a ' + gName(r.id) + ' · ' + condWord2(r.c) + ' ' + pct(r.c), () => { P.gpSel = null; });
  K.bar(r.c); K.hint((r.g ? GRFX[r.k][r.g] + ' · ' : '') + (fits.length ? 'Fits your ' + fits.join(', ') : 'Fits the ' + gName(r.id) + ' (you don\'t have one right now)'));
  K.B('⚡ Fix now', fix ? '→ 100% · ' + money(fix) : 'Nothing to fix', () => { if (!payAny(fix)) return Snd.play('bad'); r.c = 1; Snd.play('ratchet'); doSave(true); }, fix ? 'r' : '', !fix || !canPay(fix));
  K.B('🗑 Scrap', '+' + money(sv), () => { const i = R.indexOf(r); if (i >= 0) R.splice(i, 1); addCash(sv); Snd.play('grinder'); P.gpSel = null; doSave(true); }, 'r');
  return K.done(); }

function attCard(H, P, s, v, n) { const o = WSLOTS[s].o[v], sv = attScrapVal(s, v), fits = (o[2] || []).filter(id => WI[id] !== undefined).map(gName);
  const K = gCardShell(H, P, wmIcon(s, v, 64), o[0].split(' —')[0] + (n > 1 ? '  ×' + n : ''), WSLOTS[s].n + ' · attachment · worth ≈ ' + money(o[1]), () => { P.gpSel = null; });
  K.hint((fits.length ? 'Fits: ' + fits.join(', ') : 'Fits most guns') + '. Open a gun and tap its ' + WSLOTS[s].n + ' slot to fit it.');
  const scrap = k => { const B = GPARTS(), key = s + ':' + v; B[key] -= k; if (B[key] <= 0) { delete B[key]; P.gpSel = null; } addCash(sv * k); Snd.play('grinder'); doSave(true); };
  K.B('🗑 Scrap one', '+' + money(sv), () => scrap(1), 'r'); if (n > 1) K.B('🗑 Scrap all ' + n, '+' + money(sv * n), () => scrap(n), 'r');
  const ds = itemDesc('wm:' + s + ':' + v); if (ds) K.d.appendChild(H.mk('div', 'pdesc', ds)); return K.done(); }

{ const gw = PMODES.gunws; PMODES.gunws = function (H) { const P = this; if (!P.wbGun) return gunHome(H, P);
  if (P.wbSp) { const sp = SPARES().find(s => s.uid === P.wbSp); if (!sp) { gUnmount(); P.wbGun = null; P.wbSp = null; return gunHome(H, P); } if (!GMOUNT || GMOUNT.uid !== sp.uid) gMount(sp); } else gUnmount();
  const p = G.player, i = WI[P.wbGun], fake = P.wbSp && !(p.ammo[i] > 0); if (fake) p.ammo[i] = 1;
  try { return gw.call(this, H); } finally { if (fake) p.ammo[i] = 0; } }; }
// the shop workbench gets the same title back button (via wbBack); its gun picker keeps only carried guns

// ---------- core parts on the bench work like car parts: pull off, fit, swap, fix, scrap ----------
const gMiss = (c, k) => !!(c.miss && c.miss[k]);
const gMissAny = c => !!(c && c.miss && Object.keys(c.miss).some(k => c.miss[k]));
function coreBench(H, P, id, shop) { const k = P.cslot.slice(2), c = gcond(id), miss = gMiss(c, k), cur = miss ? 0 : (c[k] ?? 1), g0 = cgrade(id, k), R = GCORE(), canSwap = k !== 'frame';
  const loose = canSwap ? R.filter(r => r.k === k && gfam(r.id) === gfam(id)) : [], price = r5g(compPrice(id, k)), done = () => { PWC = {}; P.copt = 'cur'; doSave(true); };
  const opts = [miss ? { key: 'cur', name: 'Empty slot', e: '✕', badge: 'NONE' } : { key: 'cur', name: 'Fitted', cv: coreIcon(id, k), cond: cur, badge: 'FITTED' }];
  loose.forEach(r => opts.push({ key: 'l' + R.indexOf(r), name: (r.g ? GRN[r.g] + ' ' : 'Stock ') + coreName(k).split(' ')[0].toLowerCase(), cv: coreIcon(r.id, k), cond: r.c, badge: r.g ? GRB[r.g] : 'BENCH', badgeCls: 'own' }));
  if (shop && canSwap) for (let g = 0; g < 3; g++) opts.push({ key: 'new' + g, name: 'New ' + GRN[g].toLowerCase(), cv: coreIcon(id, k), cond: 1, price: money(r5g(price * GRM[g])), badge: GRB[g], badgeCls: 'own' });
  if (!opts.some(o => o.key === P.copt)) P.copt = 'cur'; const sel = P.copt, nm = coreName(k), short = nm.split(' ')[0].replace('Trigger', 'Action').replace('Magazine', 'Feed').toLowerCase();
  const wear = k === 'barrel' ? 'A worn barrel throws shots wide and short.' : k === 'action' ? 'A worn action misfires.' : k === 'mag' ? 'A worn magazine and feed jams.' : 'A worn frame rattles and can misfire.';
  let card;
  if (sel === 'cur') { const btns = [];
    if (miss) btns.push(H.btn(loose.length ? 'Tap a spare above to fit it' : 'No spare ' + short + ' on your bench', () => { }, '', true));
    else { if (canSwap) btns.push(H.btn('🔧 Pull it off → bench', () => { R.push({ id, k, c: cur, g: g0 }); c.miss = Object.assign({}, c.miss, { [k]: 1 }); c[k] = 0; setGrade(id, k, 0); Snd.play('ratchet'); toast(nm + ' is on your bench — the gun won\'t fire without one'); done(); }, 'y'));
      const fc = shop ? smithCost(id, k) : coreFixCost(id, k, cur, g0); btns.push(H.btn(fc ? '⚡ Fix now · ' + money(fc) : 'No repair needed', () => { if (!payAny(fc)) return Snd.play('bad'); c[k] = 1; Snd.play('ratchet'); done(); }, shop ? 'y' : '', !fc || !canPay(fc)));
      if (!shop) btns.push(GMOUNT ? H.btn('🐢 Slow fix: carry it first', () => { }, '', true) : H.btn(cur < .95 ? '🐢 Clean & oil (slow, cheap)' : 'Clean — in good shape', () => startClean(id), '', cur >= .95 || !!G.save.wclean)); }
    card = { cv: miss ? null : coreIcon(id, k, 60), e: '✕', name: miss ? nm + ' · missing' : (g0 ? GRN[g0] + ' ' : '') + nm + ' · ' + condWord2(cur) + ' ' + pct(cur),
      sub: !canSwap ? 'The frame is the gun itself — it can be repaired but not swapped.' : miss ? 'The gun can\'t fire until a ' + short + ' is fitted.' : loose.length ? loose.length + ' spare on your bench fit' + (loose.length > 1 ? '' : 's') + ' this gun — tap one above to swap it in' : 'No spares on your bench. Strip a spare gun for parts' + (shop ? ', or buy a new one here.' : ', or buy new at a gun shop.'), desc: miss ? '' : wear, btns }; }
  else if (sel.startsWith('new')) { const g = +sel.slice(3), pr = r5g(price * GRM[g]);
    card = { cv: coreIcon(id, k, 60), name: 'New ' + GRN[g].toLowerCase() + ' ' + nm.toLowerCase(), sub: g ? GRFX[k][g] : 'Factory spec — 100%', desc: (g ? GRFX[k][0] + '. ' : '') + (miss ? 'Fit it now, or buy it for your bench.' : 'Fit it now (your old one, ' + pct(cur) + ', goes to your bench) or buy it for the bench to stockpile.'),
      btns: [H.btn((miss ? 'Buy & fit · ' : 'Buy & swap in · ') + money(pr), () => { if (!payAny(pr)) return; if (!miss) R.push({ id, k, c: cur, g: g0 }); if (c.miss) delete c.miss[k]; c[k] = 1; setGrade(id, k, g); Snd.play('ratchet'); done(); }, 'y', !canPay(pr)), H.btn('Buy for bench · ' + money(pr), () => { if (!payAny(pr)) return; R.push({ id, k, c: 1, g }); Snd.play('cash'); toast('On your bench at home'); doSave(true); }, '', !canPay(pr))] }; }
  else { const r = R[+sel.slice(1)], fc = coreFixCost(r.id, k, r.c, r.g), sv = Math.round(coreScrap(r.id, k, r.c) * GRM[r.g | 0]);
    card = { cv: coreIcon(r.id, k, 60), name: (r.g ? GRN[r.g] + ' ' : 'Stock ') + nm.toLowerCase() + ' · ' + pct(r.c), sub: (r.g ? GRFX[k][r.g] + ' · ' : '') + (miss ? 'The slot is empty' : r.c > cur ? 'Better than the fitted one (' + pct(cur) + ')' : 'Worse than the fitted one (' + pct(cur) + ')'), desc: 'From a ' + gName(r.id) + '. ' + (miss ? 'Fit it to get the gun firing again.' : 'Swapping puts the fitted one on your bench.'),
      btns: [H.btn(miss ? '🔧 Fit it' : '🔁 Swap it in', () => { if (miss) { c[k] = r.c; setGrade(id, k, r.g | 0); delete c.miss[k]; R.splice(R.indexOf(r), 1); } else { const old = c[k] ?? 1; c[k] = r.c; setGrade(id, k, r.g | 0); r.c = old; r.g = g0; r.id = id; } Snd.play('ratchet'); done(); }, 'y'),
        H.btn(fc ? '⚡ Fix · ' + money(fc) : 'Fix — not needed', () => { if (!payAny(fc)) return Snd.play('bad'); r.c = 1; Snd.play('ratchet'); doSave(true); }, '', !fc || !canPay(fc)),
        H.btn('🗑 Scrap · +' + money(sv), () => { addCash(sv); R.splice(R.indexOf(r), 1); Snd.play('grinder'); done(); }, 'r')] }; }
  const cv = H.mk('canvas', 'cfgpv'); cv.width = 360; cv.height = 150; drawGunPreview(cv, id, G.wmods[id] || {});
  cfgRender(H, { title: gName(id) + ' · ' + (gMissAny(c) ? 'missing parts — won\'t fire' : condWord2(gcAvg(id)) + ' ' + pct(gcAvg(id)) + ' · misfire ' + Math.round(misfireChance(id) * 100) + '%'), top: cv, bars: barsEl(gunStats(id)), slotTitle: 'Core parts & attachment slots', selSlot: P.cslot, onSlot: s => { P.cslot = s; P.copt = null; P.pv = null; },
    slots: coreSlots(id).concat(attTiles(id, !shop)), opts, selOpt: sel, onOpt: o => { P.copt = o; }, card }); }
// an empty core slot shows as empty, and the gun won't fire
{ const _cs = coreSlots; coreSlots = function (id) { const c = gcond(id); return _cs(id).map(t => { const k = t.key.slice(2); if (gMiss(c, k)) { t.empty = 1; t.badge = 'NONE'; t.badgeCls = ''; delete t.cond; } return t; }); }; }
{ const _pf = playerFire0; playerFire0 = function (aimA, charge) { const p = G.player, b = WEAPONS[p.weapon]; if (b && p.weapon > 0 && isGunW(b) && gMissAny(gcond(b.id))) { if (G.t - (G.missTip || -9) > 2) { G.missTip = G.t; Snd.play('bad'); toast('Your ' + b.name + ' is missing its ' + GCOMP.filter(([k]) => gMiss(gcond(b.id), k)).map(x => coreName(x[0]).split(' ')[0].replace('Trigger', 'action').replace('Magazine', 'feed').toLowerCase()).join(' and ') + ' — fit one at your gun bench'); } return; } return _pf(aimA, charge); }; }
{ const _ct = cleanTick; cleanTick = function () { const CL = G.save && G.save.wclean; const r = _ct(); if (CL) { const c = gcond(CL.id); if (c.miss) for (const k in c.miss) if (c.miss[k]) c[k] = 0; } return r; }; }

// ---------- the home locker holds individual guns (the same ones as the collection) ----------
function lockerMigrate() { const L = G.stash && G.stash.guns; if (!L) return; for (const id in L) { const a = L[id] | 0; delete L[id]; if (a <= 0 || WI[id] === undefined) continue; const p = G.player;
    addToCollection(id, G.wmods[id] || {}, Object.assign({}, gcond(id)), a); if (!(p.ammo[WI[id]] > 0)) { delete G.wmods[id]; delete WCOND()[id]; } } }
{ const _u = update; update = function (dt) { if (G.stash && G.stash.guns && Object.keys(G.stash.guns).length) lockerMigrate(); return _u(dt); }; }
const gcat5 = id => id.startsWith('gsp:') ? 'gun' : gcatOf(id);
{ const _gs = gSort; gSort = function (ids, obj) { const sp = ids.filter(id => id.startsWith('gsp:')), rest = _gs(ids.filter(id => !id.startsWith('gsp:')), obj); return rest.concat(sp); }; }
const spareBy = key => SPARES().find(s => 'gsp:' + s.uid === key);
function moveItems(from, to, id, n) { const p = G.player;
  if (id.startsWith('gun:')) { const g = id.slice(4); if (from.side !== 'bag') return; const a = p.ammo[WI[g]] | 0; if (!a) return; if (!to.guns) return toast('Guns only go in your home gun locker');
    if (!addToCollection(g, G.wmods[g] || {}, Object.assign({}, gcond(g)), a)) return; dropGun(g); Snd.play('cock'); return; }
  if (id.startsWith('gsp:')) { const sp = spareBy(id); if (sp) spareCarry(sp); return; }
  const it = ITEMS[id], room = it.w ? Math.floor((to.cap - to.weight()) / it.w) : 99999, k = Math.min(n, from.obj[id] | 0, room); if (k <= 0) { Snd.play('bad'); toast(to.name + ' is full'); return; }
  from.obj[id] -= k; if (!from.obj[id]) delete from.obj[id]; to.obj[id] = (to.obj[id] | 0) + k; Snd.play('rustle'); }
function transferView(H, A, B, extraFoot) { const P = Panel, sides = { [A.side]: [A, B], [B.side]: [B, A] }, present = new Set();
  const listOf = S => { const ids = Object.keys(S.obj).filter(k => ITEMS[k] && S.obj[k] > 0); if (S.guns) { if (S.side === 'bag') ids.push(...Object.keys(playerGuns())); else ids.push(...SPARES().map(s => 'gsp:' + s.uid)); } return ids; };
  const countOf = (S, id) => id.startsWith('gun:') ? G.player.ammo[WI[id.slice(4)]] | 0 : id.startsWith('gsp:') ? (spareBy(id) ? 1 : 0) : S.obj[id] | 0;
  const isGun = id => id.startsWith('gun:') || id.startsWith('gsp:'), gunOf = id => id.startsWith('gun:') ? { id: id.slice(4), wc: gcond(id.slice(4)), mods: G.wmods[id.slice(4)] || {}, ammo: G.player.ammo[WI[id.slice(4)]] | 0 } : spareBy(id);
  for (const S of [A, B]) for (const id of listOf(S)) present.add(gcat5(id));
  if (P.gsel && !sides[P.gsel.side]) P.gsel = null; if (P.gsel && !countOf(sides[P.gsel.side][0], P.gsel.key)) P.gsel = null;
  [A, B].forEach((S, i) => { const c = H.col(S.name + '  ' + S.weight() + ' / ' + S.cap); gCap(H, c, S.weight(), S.cap); if (!i) gControls(H, c, present); else c.appendChild(H.mk('div', 'ghint', 'Tap an item to move part of a stack · press and drag to move it all'));
    const g = gGrid(H, c, S.side), f = P.gfilt || 'all', ids = gSort(listOf(S).filter(id => f === 'all' || gcat5(id) === f), S.obj);
    for (const id of ids) { const O = sides[S.side][1], gun = isGun(id), n = countOf(S, id), gg = gun ? gunOf(id) : null;
      gTile(H, g, S.side, id, gun ? '🔫' : ITEMS[id].e, gun ? gName(gg.id) : ITEMS[id].n, gun ? null : n, Object.assign({ canvas: gun ? gunIconBig(gg.id, undefined, gg.mods) : null, drop: side => side === O.side && moveItems(S, O, id, 9999) }, gun ? { cond: cAvg(gg.wc) } : {})); }
    if (!ids.length) g.appendChild(H.mk('div', 'pempty', S.empty || 'Empty.')).style.gridColumn = '1 / -1'; });
  if (P.gsel) { const [S, O] = sides[P.gsel.side], id = P.gsel.key, gun = isGun(id), n = countOf(S, id), col = H.body.querySelectorAll('.pcol')[S === A ? 0 : 1], arrow = S === A ? '→' : '←', gg = gun ? gunOf(id) : null;
    const carriesSame = gun && id.startsWith('gsp:') && ownsGun(gg.id);
    const btns = gun ? [H.btn(arrow + ' ' + (S.side === 'bag' ? 'Lock it up' : carriesSame ? 'Take it (swap)' : 'Take it'), () => { moveItems(S, O, id, 1); P.gsel = null; }, 'y', S.side === 'bag' && !O.guns)] : [n > 1 ? H.btn(arrow + ' 1', () => moveItems(S, O, id, 1)) : null, n > 3 ? H.btn(arrow + ' Half', () => moveItems(S, O, id, Math.ceil(n / 2))) : null, H.btn(arrow + ' All ' + n, () => { moveItems(S, O, id, 9999); if (!(S.obj[id] > 0)) P.gsel = null; }, 'y')];
    if (!gun && S.side === 'bag') { const it = ITEMS[id]; if (it.heal || it.armor || it.repair || DFX[id]) btns.unshift(H.btn(DFX[id] ? 'Take' : 'Use', () => useInv(id))); }
    gDetail(H, col, gun ? '🔫' : ITEMS[id].e, gun ? gName(gg.id) + ' · ' + condWord2(cAvg(gg.wc)) + ' ' + pct(cAvg(gg.wc)) : ITEMS[id].n + ' ×' + n, gun ? (gg.ammo | 0) + ' rounds' + (attList(gg.mods).length ? ' · ' + attList(gg.mods).map(s => WSLOTS[s].o[gg.mods[s]][0].split(' —')[0]).join(', ') : '') + (carriesSame ? ' · swaps with the one you carry' : '') : itemInfo(id), btns); if (gun) { const d = col.querySelector('.gdet .gde'); if (d) { d.textContent = ''; const cv = gunIconBig(gg.id, 60, gg.mods); cv.style.width = '72px'; d.appendChild(cv); } } }
  const fr = H.mk('div', ''); fr.style.cssText = 'display:flex;gap:6px;width:100%'; const fb = (l, f, dis) => { const b = H.btn(l, f, '', dis); b.style.flex = '1'; b.style.margin = '0'; fr.appendChild(b); };
  const f = P.gfilt || 'all', bulk = (S, O) => { for (const id of listOf(S).filter(id => !isGun(id) && (f === 'all' || gcat5(id) === f))) moveItems(S, O, id, 9999); };
  fb('Move ' + (f === 'all' ? 'all' : GCATS.find(x => x[0] === f)[1]) + ' →', () => bulk(A, B)); fb('← Take ' + (f === 'all' ? 'all' : GCATS.find(x => x[0] === f)[1]), () => bulk(B, A)); if (extraFoot) extraFoot(H, fb); H.foot.appendChild(fr); fr.querySelectorAll('.pb').forEach(b => b.style.padding = '8px 6px'); }
// backpack: a gun is one item, not a stack of rounds
{ const _gt = gTile; gTile = function (H, grid, side, key, e, name, n, opt) { if (side === 'bag' && typeof key === 'string' && key.startsWith('gun:') && typeof n === 'string' && /rd$/.test(n)) n = null; return _gt(H, grid, side, key, e, name, n, opt); }; }
