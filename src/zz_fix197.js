// ================= 1.97: autosave =================
// Saves quietly every minute of play, and whenever the app goes to the background or the page closes, so
// swiping the app away or a phone call never costs more than a minute.
{ let acc = 0; const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play' || !G.inGame || (Net.room && !G.guest && !Net.worldHost) || !G.player || G.player.dead) return; acc += dt; if (acc >= 60) { acc = 0; doSave(true); } }; }
{ const bg = () => { try { if (G.inGame && (!Net.room || G.guest || Net.worldHost) && G.player && !G.player.dead) doSave(true); } catch (e) { } }; document.addEventListener('visibilitychange', () => { if (document.hidden) bg(); }); window.addEventListener('pagehide', bg); }
