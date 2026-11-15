// ================= v1.67 POLISH: bug fixes, menu clean-up and UI tweaks =================
// ---- a seized engine really is dead: no throttle until it's fixed or swapped ----
{ const _vt = vehTick; vehTick = function (c, d, dt, r) { if (c.pc && c.pc.eng !== undefined && c.pc.eng <= .02 && !c.d.pedal && !c.d.boat && !c.noEng) { c.throttle = 0; c.nosT = 0; c.burnout = 0; } return _vt(c, d, dt, r); }; }
// ---- never lose the player to a bad coordinate ----
{ const _u = update; update = function (dt) { const p = G.player; if (p) { if (isFinite(p.x) && isFinite(p.y)) G._okPos = [p.x, p.y]; else if (G._okPos) { p.x = G._okPos[0]; p.y = G._okPos[1]; p.vx = p.vy = 0; } } _u(dt); }; }
// ---- the phone: 7 tabs instead of 11; related screens share a tab with a sub-bar ----
const PHONE_GROUPS = [
  ['home', 'Home', [['home', 'Overview'], ['bank', 'Bank']]],
  ['work', 'Work', [['jobs', 'Jobs'], ['contracts', 'Contracts', () => hasOps()], ['heists', 'Heists', () => HEISTS.some(h => heistAvail(h.id))]]],
  ['prop', 'Property', [['empire', 'Mine'], ['realty', 'For sale']]],
  ['cars', 'Vehicles', [['cars', 'Vehicles']]],
  ['market', 'Marketplace', [['market', 'Marketplace']]],
  ['shop', 'Shop', [['shop', 'Shop']]],
  ['race', 'Racing', [['redline', 'Racing']]]];
const phoneGroup = leaf => PHONE_GROUPS.find(g => g[2].some(l => l[0] === leaf)) || PHONE_GROUPS[0];
{ const _r = Panel.render; Panel.render = function () { const el = pEl(), o = el && el.querySelector('.psub'); if (o) o.remove(); return _r.apply(this, arguments); }; }
{ const ph = PMODES.phone; PMODES.phone = function (H) { const P = this; if (!P.tab) P.tab = 'home'; if (P.tab === 'empire' && !Object.keys(LIFE().own).length) P.tab = 'realty';
  const gr = phoneGroup(P.tab); P.lastSub = P.lastSub || {}; P.lastSub[gr[0]] = P.tab;
  const r = ph.call(this, Object.assign({}, H, { tabBtn() { } }));
  const tabs = H.el.querySelector('.ptabs'); tabs.innerHTML = ''; const un = mktUnread();
  for (const [gid, gn, leaves] of PHONE_GROUPS) { const b = H.mk('button', gid === gr[0] ? 'on' : '', gn + (gid === 'market' && un ? ' (' + un + ')' : '')); b.onclick = () => { Snd.play('ui'); const vis = leaves.filter(l => !l[2] || l[2]()); P.tab = P.lastSub[gid] && vis.some(l => l[0] === P.lastSub[gid]) ? P.lastSub[gid] : vis[0][0]; P.sel = null; Panel.render(); }; tabs.appendChild(b); }
  const vis = gr[2].filter(l => !l[2] || l[2]()); if (vis.length > 1) { const bar = H.mk('div', 'psub'); bar.style.cssText = 'display:flex;gap:6px;padding:6px 8px 0;overflow-x:auto';
    for (const [id, n] of vis) { const b = H.mk('button', '', n); const on = id === P.tab; b.style.cssText = 'flex:none;padding:6px 14px;border-radius:14px;border:2px solid ' + (on ? '#f2c230' : '#2b3140') + ';background:' + (on ? '#3a3216' : '#1b1f29') + ';color:' + (on ? '#f2c230' : '#cfd6e4') + ';font:800 12px Rubik,system-ui,sans-serif'; b.onclick = () => { Snd.play('ui'); P.tab = id; P.sel = null; Panel.render(); }; bar.appendChild(b); }
    tabs.after(bar); }
  return r; }; }
// ---- screens behind a dialog refresh as soon as the dialog closes (accepting, paying, meeting…) ----
{ const _cd = closeDialog; closeDialog = function () { const r = _cd.apply(this, arguments); if (Panel.mode) setTimeout(() => { if (Panel.mode && !G.dlgOpen) Panel.render(); }, 0); return r; }; }
// ---- the marketplace refreshes itself when messages or listings change while you're looking at it ----
function mktSig() { const M = G.save && G.save.mkt; if (!M) return ''; return (M.msgs || []).map(m => m.id + m.kind + (m.done ? 1 : 0) + (m.unread ? 1 : 0) + (m.text || '').length).join() + '|' + (M.feed || []).length + '|' + (M.pfeed || []).length + '|' + (M.list || []).length + '|' + (M.plist || []).length + '|' + (M.meets || []).map(x => x.state).join(); }
setInterval(() => { if (Panel.mode !== 'phone' || Panel.tab !== 'market' || G.dlgOpen || document.querySelector('#panel .ckmodal,#panel .pkmodal')) { G.mkSig = null; return; } const s = mktSig(); if (G.mkSig !== null && G.mkSig !== undefined && s !== G.mkSig) Panel.render(); G.mkSig = s; }, 500);
// ---- minimizing the app (or switching tabs) silences everything and pauses the game; coming back resumes the sound ----
{ const bgOff = () => { if (G._bgMute) return; G._bgMute = 1; try { if (Snd.ctx && Snd.ctx.state === 'running') Snd.ctx.suspend(); } catch (e) { } try { if (G.inGame && G.mode === 'play' && !G.menuOpen) openPause(); } catch (e) { } };
  const bgOn = () => { if (!G._bgMute) return; G._bgMute = 0; try { if (Snd.ctx && Snd.ctx.state === 'suspended') Snd.ctx.resume(); } catch (e) { } };
  document.addEventListener('visibilitychange', () => document.hidden ? bgOff() : bgOn()); window.addEventListener('pagehide', bgOff); window.addEventListener('pageshow', () => { if (!document.hidden) bgOn(); }); document.addEventListener('freeze', bgOff); document.addEventListener('resume', bgOn);
  if (/Android/i.test(navigator.userAgent)) { window.addEventListener('blur', bgOff); window.addEventListener('focus', bgOn); }
  const _in = Snd.init; Snd.init = function () { if (G._bgMute && document.hidden) return; return _in.apply(this, arguments); }; }
