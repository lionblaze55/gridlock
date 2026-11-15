// ================= COOKING: a recipe book that tells you what's missing, and a stop-the-needle mini-game — nail the gold zone for bonus portions =================
const COOK = () => G.save.cook || (G.save.cook = {});
const COOK_MASTER = 5;
const cookDiff = ing => { const n = Object.keys(ing).length; return { spd: .55 + n * .16, zone: Math.max(.07, .17 - n * .025) }; };
function ingSource(k) { const it = ITEMS[k]; if (!it) return ''; if (GROCER.includes(k)) return 'grocery store'; if (k === 'flour' || k === 'butter' || k === 'cheese') return 'Process tab'; if (/meat|venison|beef|pork|poultry|turkey|mutton|fish/.test(k)) return k === 'fish' ? 'fishing' : 'hunting or a farm'; if (k === 'egg' || k === 'milk' || k === 'wool') return 'farm animals'; if (k === 'bread') return 'cook it first'; return 'grow it on a farm'; }
function cookRows(L) { return RECIPES.filter(r => r[2] === 'k').map(([id, ing]) => { const can = Math.min(...Object.keys(ing).map(k => Math.floor(have(k, L) / ing[k]))); const miss = Object.keys(ing).filter(k => have(k, L) < ing[k]); return { id, ing, can, miss }; }).sort((a, b) => (b.can > 0) - (a.can > 0) || a.miss.length - b.miss.length || ITEMS[a.id].n.localeCompare(ITEMS[b.id].n)); }
function stars5(n) { const k = Math.min(COOK_MASTER, n | 0); return '★'.repeat(k) + '☆'.repeat(COOK_MASTER - k); }
{ const kt = PMODES.kitchen; PMODES.kitchen = function (H) { if (this.tab && this.tab !== 'cook') return kt.call(this, H); this.tab = 'cook'; const P = this, L = srcList(), rows = cookRows(L), C = COOK();
  H.title.textContent = '🍳 Kitchen'; H.tabBtn('cook', '🍳 Cook'); H.tabBtn('proc', 'Process'); H.tabBtn('craft', 'Craft');
  if (!P.ck || !rows.some(r => r.id === P.ck)) P.ck = (rows.find(r => r.can > 0) || rows[0]).id;
  const c = H.col('Recipe book — ' + rows.filter(r => r.can > 0).length + ' ready to cook');
  for (const r of rows) { const it = ITEMS[r.id], row = H.row(c, it.e, it.n + '  ' + stars5(C[r.id]), r.can > 0 ? 'Ready · can make ' + r.can + (it.heal ? ' · heals ' + it.heal : '') : 'Missing ' + r.miss.map(k => ITEMS[k].n.toLowerCase()).join(', '), [H.btn(P.ck === r.id ? '✓' : 'View', () => { P.ck = r.id; P.cq = 1; }, P.ck === r.id ? 'on' : '')]); if (P.ck === r.id) row.classList.add('sel'); if (r.can < 1) row.style.opacity = .62; }
  const r = rows.find(x => x.id === P.ck), it = ITEMS[r.id], c2 = H.col(it.e + ' ' + it.n), lvl = C[r.id] | 0, mastered = lvl >= COOK_MASTER;
  const big = H.mk('div', 'pbig', it.e); big.style.fontSize = '54px'; big.style.padding = '2px 0'; c2.appendChild(big);
  H.row(c2, '⭐', 'Proficiency ' + stars5(lvl), mastered ? 'Mastered — auto-cook unlocked' : (COOK_MASTER - lvl) + ' more good cook' + (COOK_MASTER - lvl > 1 ? 's' : '') + ' to unlock auto-cook');
  c2.appendChild(H.mk('div', 'ptitle', 'Ingredients (for one)'));
  for (const k in r.ing) { const h = have(k, L), ok = h >= r.ing[k], x = H.row(c2, ok ? '✅' : '❌', ITEMS[k].e + ' ' + ITEMS[k].n + '  ' + h + '/' + r.ing[k], ok ? 'In your bag' + (canDecorate() ? ' / stash' : '') : 'Get it: ' + ingSource(k)); if (!ok) x.querySelector('b').style.color = '#ff8a80'; }
  if (r.can > 0) { P.cq = clamp(P.cq || 1, 1, r.can); const q = H.mk('div', 'pbs'); q.style.cssText = 'display:flex;gap:6px;align-items:center;justify-content:center;max-width:none;margin:6px 0';
    q.appendChild(H.btn('−', () => { P.cq = Math.max(1, P.cq - 1); }, '', P.cq <= 1)); const n = H.mk('b', '', 'Make ' + P.cq); n.style.cssText = 'color:#fff;font:800 15px Rubik,sans-serif;min-width:80px;text-align:center'; q.appendChild(n); q.appendChild(H.btn('+', () => { P.cq = Math.min(r.can, P.cq + 1); }, '', P.cq >= r.can)); q.appendChild(H.btn('Max', () => { P.cq = r.can; }, '', P.cq >= r.can)); c2.appendChild(q);
    const go = H.btn('🍳 Cook ' + P.cq + ' — stop the needle in the gold zone', () => cookGame(r, P.cq), 'y'); go.style.cssText = 'width:100%;padding:14px;font-size:15px'; c2.appendChild(go);
    const au = H.btn(mastered ? '⚡ Auto-cook ' + P.cq + ' (normal result)' : '⚡ Auto-cook — master it first', () => cookDone(r, P.cq, 'good'), '', !mastered); au.style.cssText = 'width:100%;padding:11px;margin-top:4px'; c2.appendChild(au); }
  else H.row(c2, '🛒', 'Missing ingredients', 'Groceries sell the basics. Farms, hunting and fishing get you the rest.');
  H.foot.appendChild(H.mk('span', 'pnote', 'Perfect timing = bonus portions. Good = what you planned. Under or over = half of it is ruined. Uses ingredients from your bag' + (canDecorate() ? ' and home stash' : '') + (nearFarm() ? ' and farm storage' : '') + '.')); }; }
// ---- the mini-game ----
function cookGame(r, n) { const el = document.getElementById('panel'); const old = el.querySelector('.ckmodal'); if (old) old.remove(); const it = ITEMS[r.id], D = cookDiff(r.ing), lvl = COOK()[r.id] | 0, zone = D.zone + Math.min(lvl, COOK_MASTER) * .008, z0 = .45 + (hash01(r.id) - .5) * .3, z1 = z0 + zone, g0 = z0 - .13, g1 = z1 + .13;
  const ov = document.createElement('div'); ov.className = 'ckmodal'; ov.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.78);z-index:7;display:flex;align-items:center;justify-content:center';
  const pct = v => (v * 100).toFixed(1) + '%';
  ov.innerHTML = `<div style="width:min(560px,94%);background:#161a22;border:3px solid #f2c230;border-radius:14px;padding:14px 16px;text-align:center;font-family:Rubik,system-ui,sans-serif;color:#fff">
    <div style="font:800 13px Rubik,system-ui,sans-serif;color:#f2c230;letter-spacing:1px;text-transform:uppercase">Cooking ${n} × ${it.n}</div>
    <div class="ckdish" style="font-size:64px;line-height:1.1;margin:6px 0;transition:transform .2s">${it.e}</div>
    <div class="cksteam" style="height:16px;font-size:14px;opacity:.7;letter-spacing:6px">~ ~ ~</div>
    <div style="position:relative;height:34px;margin:10px 4px 4px;border-radius:17px;overflow:hidden;background:linear-gradient(90deg,#3a4a5a 0%,#46586b ${pct(g0)},#b8862b ${pct(g0)},#d9a43b ${pct(z0)},#ffd740 ${pct(z0)},#fff2a8 ${pct((z0 + z1) / 2)},#ffd740 ${pct(z1)},#d9a43b ${pct(z1)},#b8862b ${pct(g1)},#7a2e1e ${pct(g1)},#3b1410 100%);box-shadow:inset 0 0 0 2px rgba(0,0,0,.4)">
      <div class="ckneedle" style="position:absolute;top:-4px;bottom:-4px;width:6px;margin-left:-3px;background:#fff;border-radius:3px;box-shadow:0 0 8px #fff,0 0 2px #000;left:0"></div></div>
    <div style="position:relative;height:16px;font:700 11px Rubik,system-ui,sans-serif;color:#9aa3b5;margin:0 6px"><span style="position:absolute;left:0">Raw</span><span style="position:absolute;left:${pct((z0 + z1) / 2)};transform:translateX(-50%);color:#ffd740;white-space:nowrap">▲ Perfect</span><span style="position:absolute;right:0">Burnt</span></div>
    <div class="ckmsg" style="font:700 15px Rubik,system-ui,sans-serif;min-height:22px;margin:10px 0 8px;color:#cfd6e4">Tap STOP when the needle is in the gold</div>
    <button class="ckstop" style="width:100%;min-height:60px;border:0;border-radius:10px;background:#f2c230;color:#111;font:900 22px Bungee,Impact,sans-serif;letter-spacing:2px;box-shadow:0 4px 0 #8a6d12">STOP</button></div>`;
  el.appendChild(ov); Snd.play('fire');
  const nd = ov.querySelector('.ckneedle'), msgE = ov.querySelector('.ckmsg'), stop = ov.querySelector('.ckstop'), dish = ov.querySelector('.ckdish'), steam = ov.querySelector('.cksteam'); let x = 0, dir = 1, last = performance.now(), live = true, t0 = last;
  const tick = now => { if (!live || !ov.isConnected) return; const dt = Math.min(.05, (now - last) / 1000); last = now; const sp = D.spd * (1 + Math.min(.6, (now - t0) / 9000)); x += dir * sp * dt; if (x >= 1) { x = 1; dir = -1; } if (x <= 0) { x = 0; dir = 1; } nd.style.left = pct(x); steam.style.opacity = .3 + .5 * Math.abs(Math.sin(now / 300)); steam.style.transform = 'translateY(' + (Math.sin(now / 200) * 2) + 'px)'; G._ckRaf = requestAnimationFrame(tick); };
  G._ckRaf = requestAnimationFrame(tick);
  stop.onclick = e => { e.stopPropagation(); if (!live) return; live = false; const res = x >= z0 && x <= z1 ? 'perfect' : x >= g0 && x <= g1 ? 'good' : x < g0 ? 'raw' : 'burnt';
    const out = cookDone(r, n, res, true); dish.style.transform = res === 'perfect' ? 'scale(1.25) rotate(-6deg)' : res === 'good' ? 'scale(1.1)' : 'scale(.9)'; if (res === 'burnt') dish.style.filter = 'grayscale(.7) brightness(.6)';
    msgE.innerHTML = res === 'perfect' ? '<span style="color:#ffd740">✨ PERFECT!</span> Delicious — ' + out + ' made (+' + (out - n) + ' bonus)' : res === 'good' ? '<span style="color:#2ecc71">🙂 Good</span> — ' + out + ' made' : res === 'raw' ? '<span style="color:#81d4fa">💧 Undercooked</span> — only ' + out + ' was edible' : '<span style="color:#ff7043">🔥 Burnt!</span> — only ' + out + ' saved';
    stop.textContent = 'DONE'; stop.style.background = '#2ecc71'; stop.onclick = ev => { ev.stopPropagation(); ov.remove(); Panel.render(); }; };
  ov.addEventListener('click', ev => { if (ev.target === ov && !live) { ov.remove(); Panel.render(); } }); }
function cookDone(r, n, res, quiet) { const L = srcList(), it = ITEMS[r.id]; if (Math.min(...Object.keys(r.ing).map(k => Math.floor(have(k, L) / r.ing[k]))) < n) { toast('Missing ingredients'); return 0; }
  for (let i = 0; i < n; i++) for (const k in r.ing) take(k, r.ing[k], L);
  const out = res === 'perfect' ? n + Math.max(1, Math.round(n * .5)) : res === 'good' ? n : Math.floor(n / 2); if (out > 0) giveTo(r.id, out);
  const C = COOK(); if (res === 'perfect') C[r.id] = (C[r.id] | 0) + 2; else if (res === 'good') C[r.id] = (C[r.id] | 0) + 1;
  Snd.play(res === 'perfect' ? 'mission' : res === 'good' ? 'fire' : 'bad'); if (!quiet) toast('Made ' + it.n + (out > 1 ? ' ×' + out : '')); if ((C[r.id] | 0) >= COOK_MASTER && (C[r.id] | 0) - (res === 'perfect' ? 2 : 1) < COOK_MASTER) msg('⭐ ' + it.n + ' mastered — auto-cook unlocked', '#ffd740'); doSave(true); return out; }
{ const _pc = Panel.close; Panel.close = function () { const m = document.querySelector('#panel .ckmodal'); if (m) m.remove(); return _pc.apply(this, arguments); }; }
