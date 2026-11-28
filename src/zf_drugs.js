// ================= MAKE IT, USE IT: grow Leaf, cook the rest at a home lab, and get high (all fictional street drugs) =================
// ---------- growing ----------
CROPS.leaf = { seed: 60, h: 16, y: 5, c: '#2e7d32', illicit: 1 };
ITEMS.seed_leaf = { n: 'Leaf seeds', v: 30, w: 0, k: 'seed', e: '🌱', crop: 'leaf' }; PLANTER_OK.push('leaf');
CCODE.leaf = 'l'; CDEC.l = 'leaf';
ITEMS.supplies = { n: 'Lab supplies', v: 70, w: 1, k: 'gear', e: '🧪' };
// ---------- the home lab (furniture) ----------
CLUT.chemlab = [1, 'Use the home lab', 1.3, .6]; IT.chemlab = { s: 1, act: 'Use the home lab' }; DECOR.push(['chemlab', 'Home lab', 1.3, .6, 2500, '⚗']);
const LABREC = [
  { id: 'haze', ing: { leaf: 2, supplies: 1 }, out: 3, diff: 1, note: 'Leaf, refined. Forgiving to cook.' },
  { id: 'glint', ing: { supplies: 3 }, out: 2, diff: 1.4, note: 'Pure lab product. The heat wanders more.' },
  { id: 'ember', ing: { glint: 1, supplies: 2 }, out: 2, diff: 1.9, note: 'The hard stuff. Tight window, real fire risk.' },
];
const CK = { s: null };
function labHas(k, n) { const L = srcList(); return have(k, L) >= n; }
PMODES.lab = function (H) {
  const S = CK.s; H.title.textContent = '⚗ Home lab';
  if (S) { const c = H.col('Cooking ' + ITEMS[S.r.id].n + ' — keep it in the green');
    const bar = H.mk('div', ''); bar.style.cssText = 'position:relative;height:34px;margin:8px 4px;border-radius:8px;background:linear-gradient(90deg,#1565c0,#2e7d32 40%,#2e7d32 60%,#c62828);opacity:.9';
    const zone = H.mk('div', ''); zone.style.cssText = 'position:absolute;top:0;bottom:0;border:3px solid #fff;border-radius:6px;box-sizing:border-box;background:rgba(255,255,255,.18)'; bar.appendChild(zone);
    const nd = H.mk('div', ''); nd.style.cssText = 'position:absolute;top:-6px;bottom:-6px;width:6px;margin-left:-3px;background:#ffd740;border-radius:3px;box-shadow:0 0 6px #000'; bar.appendChild(nd); c.appendChild(bar);
    const info = H.mk('div', 'pempty', ''); c.appendChild(info); S.el = { zone, nd, info };
    H.row(c, '🔥', 'Burner', 'Tap to nudge the heat', [H.btn('▼ Cool', () => { S.v -= .07 * (1 + S.r.diff * .2); }), H.btn('Heat ▲', () => { S.v += .07 * (1 + S.r.diff * .2); }, 'y')]);
    cookPaint(); return; }
  const c = H.col('Recipes'), L = srcList();
  for (const r of LABREC) { const it = ITEMS[r.id], can = Object.keys(r.ing).every(k => have(k, L) >= r.ing[k]);
    H.row(c, it.e, `${it.n} — makes ${r.out} (more with a clean cook)`, Object.keys(r.ing).map(k => `${ITEMS[k].n} ${have(k, L)}/${r.ing[k]}`).join(' · ') + ' · ' + r.note, [H.btn('Cook', () => cookStart(r), 'y', !can)]); }
  const c2 = H.col('How it works'); H.row(c2, '🌱', 'Leaf', 'Grow it from seed in a planter or a farm field. Dealers sell seeds and lab supplies.');
  H.row(c2, '🌡', 'The cook', 'Keep the needle inside the moving white box. The cleaner the cook, the bigger the batch. Let it run hot or cold and it can catch fire.');
  H.row(c2, '💊', 'Your stash', DRUGS.map(d => `${ITEMS[d.id].e} ${have(d.id, L)}`).join('   ')); if (CK.last) H.row(c2, '📋', 'Last batch', CK.last);
  H.foot.appendChild(H.mk('span', 'pnote', 'Uses ingredients from your bag and home stash. Sell to dealers or take it yourself.'));
};
function cookStart(r) { const L = srcList(); for (const k in r.ing) take(k, r.ing[k], L); CK.s = { r, t: 0, dur: 11, x: .5, v: 0, good: 0, n: 0, zc: .5 }; Snd.play('fire'); Panel.render(); }
function cookPaint() { const S = CK.s; if (!S || !S.el) return; const w = .24 - S.r.diff * .03; S.el.zone.style.left = ((S.zc - w / 2) * 100) + '%'; S.el.zone.style.width = (w * 100) + '%'; S.el.nd.style.left = (clamp(S.x, 0, 1) * 100) + '%';
  S.el.info.textContent = `${Math.max(0, Math.ceil(S.dur - S.t))}s left · clean ${S.n ? Math.round(S.good / S.n * 100) : 0}%`; S.el.info.style.color = Math.abs(S.x - S.zc) < w / 2 ? '#69f0ae' : '#ff8a80'; }
setInterval(() => { const S = CK.s; if (!S) return; if (Panel.mode !== 'lab') { CK.s = null; toast('You walked away from the burner. Batch ruined.'); return; } const dt = .06, w = .24 - S.r.diff * .03;
  S.t += dt; S.zc = .5 + Math.sin(S.t * (.55 + S.r.diff * .2)) * .2 + Math.sin(S.t * 1.7) * .05 * S.r.diff;
  S.v += (Math.random() - .5) * .022 * S.r.diff + (S.x > .5 ? .002 : -.002); S.v *= .97; S.x += S.v * dt * 10; if (S.x < 0) { S.x = 0; S.v = 0; } if (S.x > 1) { S.x = 1; S.v = 0; }
  S.n++; if (Math.abs(S.x - S.zc) < w / 2) S.good++; if (Math.random() < .05) Snd.play('fire', undefined, undefined, .25); cookPaint();
  if (S.t >= S.dur) { CK.s = null; cookDone(S, S.good / S.n); } }, 60);
function cookDone(S, q) { const r = S.r, it = ITEMS[r.id], p = G.player;
  if (q < .28 && Math.random() < .3 + (.28 - q) * 2 * r.diff * .5) { CK.last = `${it.n} — botched (${Math.round(q * 100)}% clean). It went up in flames.`; Panel.close(); Snd.play('boom'); G.cam.shake = 8; for (let i = 0; i < 14; i++) spawnFx('fire', p.x + rnd(-30, 30), p.y - 40 + rnd(-20, 20)); for (let i = 0; i < 10; i++) spawnFx('smoke', p.x + rnd(-40, 40), p.y - 40); hurtPlayer(14 + r.diff * 6, null, 'fire'); msg('The batch caught fire! Everything in the pot is gone.', '#ff6b6b'); return; }
  const n = Math.max(1, Math.round(r.out * (.5 + q * 1.1))); giveTo(r.id, n); CK.last = `${it.n} ×${n} (${Math.round(q * 100)}% clean)`; Snd.play('mission'); toast(`Cooked ${it.n} ×${n} — ${q > .8 ? 'flawless batch' : q > .55 ? 'solid batch' : 'rough batch'}`); Panel.render(); }
// ---------- using ----------
const DFX = {
  leaf: { dur: 45, load: 1, n: 'Mellow', col: [76, 175, 80], txt: ['Ahh. Everything\'s fine.', 'Whoa… colors.', 'You could really go for a hot dog.'] },
  haze: { dur: 50, load: 2, n: 'Hazy', col: [171, 71, 188], txt: ['The street is breathing.', 'You feel bulletproof. Mostly.', 'Everything\'s soft around the edges.'] },
  glint: { dur: 40, load: 3, crash: 25, n: 'Wired', col: [79, 195, 247], txt: ['GO GO GO.', 'You can hear your own heartbeat.', 'Fast. So fast.'] },
  ember: { dur: 30, load: 4, crash: 20, n: 'Burning', col: [255, 112, 67], txt: ['Nothing can stop you.', 'Your blood is on fire.', 'Pain is a rumor.'] },
};
const FX = () => G.dfx || (G.dfx = { load: 0, crash: 0 });
function takeDrug(id) { const p = G.player, d = DFX[id], F = FX(); if (!d || !(G.inv[id] > 0) || p.dead) return;
  G.inv[id]--; if (!G.inv[id]) delete G.inv[id]; F[id] = d.dur; F.load += d.load; F.crash = 0; Snd.play('rustle'); msg(pick(d.txt), `rgb(${d.col})`); if (Panel.mode) Panel.close();
  if (!G.scene || G.scene.b.type !== 'safehouse') { const cop = copSees(); if (cop) crime(.45, 'Drug use'); }
  if (id === 'haze') G.drunk = Math.max(G.drunk, 10);
  if (F.load > 9.5) return overdose();
  if (F.load > 6.5) msg('Your heart is pounding. Maybe slow down.', '#ff8a80'); }
function overdose() { const F = FX(), p = G.player; for (const k in DFX) F[k] = 0; F.load = 0; F.crash = 0; G.drunk = 0; playerDie(null); G.big = { text: 'OVERDOSED', col: '#ab47bc', t: 4, sub: 'Too much, too fast.' }; }
const drugSpd = () => { const F = G.dfx; if (!F) return 1; return (F.glint > 0 ? 1.3 : 1) * (F.ember > 0 ? 1.12 : 1) * (F.leaf > 0 ? .93 : 1) * (F.crash > 0 ? .85 : 1) * (F.frost > 0 ? 1.18 : 1) * (F.syrup > 0 ? .88 : 1); };
const drugDmg = () => { const F = G.dfx; if (!F) return 1; return (F.haze > 0 ? .7 : 1) * (F.ember > 0 ? .55 : 1) * (F.crash > 0 ? 1.1 : 1) * (F.velvet > 0 ? .5 : 1) * (F.syrup > 0 ? .8 : 1); };
function drugTick(dt) { const F = G.dfx, p = G.player; if (!F || !p) return; if (p.dead) { for (const k in DFX) F[k] = 0; F.crash = 0; F.load = 0; return; }
  F.load = Math.max(0, F.load - dt / 30);
  for (const k in DFX) if (F[k] > 0) { F[k] -= dt; if (F[k] <= 0) { F[k] = 0; if (DFX[k].crash) { F.crash = Math.max(F.crash, DFX[k].crash); msg(k === 'glint' ? 'The rush is gone. You feel heavy.' : 'The fire burns out. Everything aches.', '#9e9e9e'); } } }
  if (F.leaf > 0) p.hp = Math.min(100, p.hp + dt * .7);
  if (F.haze > 0) G.drunk = Math.max(G.drunk, 4);
  if (F.crash > 0) { F.crash -= dt; if (p.hp > 20) p.hp -= dt * .5; } }
function drugOverlay(sc) { const F = G.dfx; if (!F) return; let any = 0, k0 = null, tl = 0;
  for (const k in DFX) if (F[k] > 0) { any = 1; const d = DFX[k], f = Math.min(1, F[k] / 6), pulse = .5 + .5 * Math.sin(G.t * (k === 'glint' ? 9 : k === 'haze' ? 1.6 : 3));
    if (k === 'ember' || k === 'glint') { const g = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * .3, VW / 2, VH / 2, Math.max(VW, VH) * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(${d.col},${(.28 + pulse * .12) * f})`); ctx.fillStyle = g; ctx.fillRect(0, 0, VW, VH); }
    else { ctx.fillStyle = `rgba(${d.col},${(.07 + pulse * .06) * f})`; ctx.fillRect(0, 0, VW, VH); }
    if (F[k] > tl) { tl = F[k]; k0 = k; } }
  if (F.crash > 0) { ctx.fillStyle = 'rgba(30,30,40,.22)'; ctx.fillRect(0, 0, VW, VH); }
  G.dfxLbl = k0 ? [`${ITEMS[k0].e} ${DFX[k0].n} ${Math.ceil(tl)}s`, `rgb(${DFX[k0].col})`] : F.crash > 0 ? [`😵 Comedown ${Math.ceil(F.crash)}s`, '#bdbdbd'] : null; }
function drugBadges() { const F = G.dfx, out = []; if (!F || !G.dfxLbl) return out; out.push(G.dfxLbl); if (F.load > 6.5 && Math.floor(G.t * 2) % 2) out.push(['♥ heart racing', '#ff5252']); return out; }
function useInv(id) { if (DFX[id]) return takeDrug(id); return useInvW(id); }
function hurtPlayerD(n, by, kind) { if (by && by !== G.player && (by instanceof Ped || by instanceof Car || by.isRemoteTarget)) { G.attacker = by instanceof Car ? by : by; G.attackT = G.t; } return hurtPlayer0(n * drugDmg(), by, kind); }
function drawLab(g, x, y, w, h) { g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#546e7a'; g.fillRect(x, y, w, h); g.fillStyle = '#cfd8dc'; g.fillRect(x + 3, y + 3, w - 6, h - 6);
  const on = !!CK.s, t = G.t; g.fillStyle = '#37474f'; g.fillRect(x + 8, y + h * .3, 18, h * .5); g.fillStyle = on ? `rgba(255,${120 + Math.sin(t * 20) * 60},0,.9)` : '#263238'; g.beginPath(); g.arc(x + 17, y + h * .55, 5, 0, TAU); g.fill();
  for (const [cx, c] of [[x + w * .5, '#4fc3f7'], [x + w * .68, '#ab47bc'], [x + w * .84, '#66bb6a']]) { g.fillStyle = 'rgba(255,255,255,.7)'; g.beginPath(); g.arc(cx, y + h * .5, 6.5, 0, TAU); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(cx, y + h * .56, 4.5, 0, Math.PI); g.fill(); }
  if (on && Math.random() < .3) spawnFx('smoke', x + 17, y); }
function useItemD(it) { if (it.t === 'chemlab') { if (stars() > 0) return toast('Not with the cops on you'); return Panel.open('lab'); } return useItemC(it); }
