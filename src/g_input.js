// ================= INPUT =================
const Input = {
  mx: 0, my: 0, aimA: 0, aiming: false, fire: false, hand: false, rev: false, gas: false, sprint: false, steer: 0, kbd: false,
  edge: {}, held: {}, stick: { active: false }, aim: { active: false }, ptr: {}, keys: {}, mouse: { x: 0, y: 0, t: -9, down: false },
  menuBtn: null, miniBtn: null, _L: null,
  clearEdges() { this.edge = {}; },
  layout() {
    const s = G.settings.ctrlScale * clamp(Math.min(VW, VH) / 400, .8, 1.25), p = G.player, inCar = p && !!p.car, classic = G.settings.drive === 'classic';
    const tall = VH > VW * 1.15;
    const fire = { id: 'fire', x: VW - (tall ? 70 : 78) * s, y: VH - (tall ? 80 : 84) * s, r: 44 * s, col: '#8e1b12', icon: p ? WEAPONS[p.weapon].id : 'fist', sub: p && p.weapon > 0 ? (p.reloadT > 0 ? '···' : pw(p.weapon).mag ? String(p.clip[p.weapon] | 0) : String(p.ammo[p.weapon])) : '', show: true };
    const btns = [fire];
    const nOwned = p ? p.ammo.filter(a => a > 0).length : 1;
    btns.push({ id: 'wpn', x: fire.x + 14 * s, y: fire.y - 108 * s, r: 23 * s, label: 'SWAP', show: nOwned > 1 });
    if (p && stars() > 0) { const [, ry] = starRow(), low = ry + 14 * hudSc() + 23 * s + 4, maxY = fire.y - fire.r - 23 * s - 4; if (btns[1].y < low) btns[1].y = Math.min(low, maxY); }
    if (inCar && tall) { // stacked column on the right, clear of the steering stick
      const hasNos = p.car.mods && p.car.mods.nos; btns[1].x = fire.x - 104 * s; btns[1].y = fire.y - 196 * s;
      btns.push({ id: 'hand', x: fire.x - 2 * s, y: fire.y - 104 * s, r: 33 * s, label: 'DRIFT', col: '#1d3557', show: true });
      btns.push({ id: 'nos', x: fire.x - 2 * s, y: fire.y - 184 * s, r: 26 * s, label: 'NOS', sub: '●'.repeat(p.car.nos) || '—', col: '#0d47a1', ring: '#4fc3f7', show: !!hasNos });
      if (classic) {
        btns.push({ id: 'gas', x: fire.x - 94 * s, y: fire.y + 22 * s, r: 34 * s, label: 'GAS', col: '#1e6b3c', show: true });
        btns.push({ id: 'rev', x: fire.x - 98 * s, y: fire.y - 60 * s, r: 28 * s, label: 'BRAKE', col: '#5b1010', show: true });
        btns.push({ id: 'car', x: fire.x - 100 * s, y: fire.y - 130 * s, r: 24 * s, label: 'EXIT', show: true });
      } else {
        btns.push({ id: 'rev', x: fire.x - 92 * s, y: fire.y + 24 * s, r: 30 * s, label: 'BRAKE', col: '#5b1010', show: true });
        btns.push({ id: 'car', x: fire.x - 98 * s, y: fire.y - 66 * s, r: 26 * s, label: 'EXIT', show: true });
      }
      btns.push({ id: 'horn', x: 34 * s, y: VH * .55 - 34 * s, r: 22 * s, label: 'HORN', show: true });
      btns.push({ id: 'radio', x: 34 * s, y: VH * .55 + 16 * s, r: 22 * s, label: '♫', show: true });
    } else if (inCar) {
      btns.push({ id: 'hand', x: fire.x - 96 * s, y: fire.y - 74 * s, r: 34 * s, label: 'DRIFT', col: '#1d3557', show: true });
      const hasNos = p.car.mods && p.car.mods.nos;
      if (classic) {
        btns.push({ id: 'gas', x: fire.x - 108 * s, y: VH - 56 * s, r: 38 * s, label: 'GAS', col: '#1e6b3c', show: true });
        btns.push({ id: 'rev', x: fire.x - 196 * s, y: VH - 46 * s, r: 30 * s, label: 'BRAKE', col: '#5b1010', show: true });
        btns.push({ id: 'car', x: fire.x - 262 * s, y: VH - 44 * s, r: 25 * s, label: 'EXIT', show: true });
        btns.push({ id: 'nos', x: fire.x - 190 * s, y: fire.y - 104 * s, r: 27 * s, label: 'NOS', sub: '●'.repeat(p.car.nos) || '—', col: '#0d47a1', ring: '#4fc3f7', show: !!hasNos });
      } else {
        btns.push({ id: 'nos', x: fire.x - 186 * s, y: fire.y - 80 * s, r: 28 * s, label: 'NOS', sub: '●'.repeat(p.car.nos) || '—', col: '#0d47a1', ring: '#4fc3f7', show: !!hasNos });
        btns.push({ id: 'car', x: fire.x - 104 * s, y: VH - 42 * s, r: 29 * s, label: 'EXIT', show: true });
        btns.push({ id: 'rev', x: fire.x - 186 * s, y: VH - 46 * s, r: 30 * s, label: 'BRAKE', col: '#5b1010', show: true });
      }
      btns.push({ id: 'horn', x: 34 * s, y: VH * .5 - 34 * s, r: 22 * s, label: 'HORN', show: true });
      btns.push({ id: 'radio', x: 34 * s, y: VH * .5 + 16 * s, r: 22 * s, label: '♫', show: true });
    } else if (p) {
      const it = G.mode === 'play' ? findInteract() : null; this.inter = it;
      btns.push({ id: 'act', x: fire.x - 96 * s, y: fire.y - 74 * s, r: 34 * s, label: 'USE', col: '#7a5c00', ring: '#f2c230', show: !!it, tip: it ? it.label : '' });
      const nc = !G.scene && G.mode === 'play' ? nearestCar(46) : null;
      btns.push({ id: 'car', x: fire.x - 104 * s, y: VH - 42 * s, r: 29 * s, label: 'GET IN', col: '#1d3557', show: !!nc });
    }
    const L = { stick: { x: 92 * s, y: VH - 96 * s, r: 58 * s }, btns, s };
    this._L = L; return L;
  },
  btnAt(x, y) { const L = this._L || this.layout(); for (const b of L.btns) if (b.show && dist2(x, y, b.x, b.y) < (b.r * 1.18) ** 2) return b; return null; },
};
const inRect = (x, y, r) => r && x >= r[0] && y >= r[1] && x <= r[0] + r[2] && y <= r[1] + r[3];
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); Snd.init();
  if (e.pointerType !== 'mouse') Input.kbd = false;
  const x = e.clientX, y = e.clientY;
  if (G.mode !== 'play') return;
  if (G.fullMap) { mapDown(e); return; }
  if (G.dlgOpen) return;
  if (inRect(x, y, Input.menuBtn)) { openPause(); return; }
  if (Input.miniSBtn && inRect(x, y, Input.miniSBtn)) { G.settings.miniSize = ((G.settings.miniSize | 0) + 1) % 3; saveSettings(); return; }
  if (Input.gpsBtn && inRect(x, y, Input.gpsBtn)) { openGoto(); return; }
  if (Input.miniZBtn && inRect(x, y, Input.miniZBtn)) { G.settings.miniZoom = ((G.settings.miniZoom | 0) + 1) % 3; saveSettings(); return; }
  if (inRect(x, y, Input.miniBtn)) { G.fullMap = true; return; }
  if (G.placing && !G.dlgOpen) { if (inRect(x, y, Input.bagBtn) || inRect(x, y, Input.menuBtn)) G.placing = null; else { placeTap(x, y); return; } }
  if (inRect(x, y, Input.bagBtn)) { openInv(); return; }
  if (Input.bribeBtn && inRect(x, y, Input.bribeBtn)) { bribeOffer(); return; }
  if (Input.surBtn && inRect(x, y, Input.surBtn)) { toggleSurrender(); return; }
  if (Input.phoneBtn && inRect(x, y, Input.phoneBtn)) { openPhone(); return; }
  if (Net.chatBtn && inRect(x, y, Net.chatBtn)) { openChat(); return; }
  if (Net.boardBtn && inRect(x, y, Net.boardBtn)) { G.showBoard = !G.showBoard; return; }
  if (Input.kbd && e.pointerType === 'mouse') { Input.mouse.down = true; Input.mouse.t = G.t; return; }
  const b = Input.btnAt(x, y);
  if (b) {
    Input.ptr[e.pointerId] = b.id; Input.held[b.id] = true;
    if (b.id === 'fire') { Input.aim = { active: true, ox: b.x, oy: b.y, moved: false }; Input.fire = true; }
    else if (b.id === 'hand') Input.hand = true; else if (b.id === 'rev') Input.rev = true; else if (b.id === 'gas') Input.gas = true;
    else Input.edge[b.id] = true;
    try { cv.setPointerCapture(e.pointerId); } catch (_) { }
    return;
  }
  if (x < VW * .55 && !Input.stick.active) {
    Input.stick = { active: true, id: e.pointerId, ox: x, oy: y, dx: 0, dy: 0 }; Input.ptr[e.pointerId] = 'stick';
    try { cv.setPointerCapture(e.pointerId); } catch (_) { }
  }
}, { passive: false });
cv.addEventListener('pointermove', e => {
  const r = Input.ptr[e.pointerId], x = e.clientX, y = e.clientY;
  if (G.fullMap) { mapMove(e); return; }
  if (Input.kbd && e.pointerType === 'mouse') { Input.mouse.x = x; Input.mouse.y = y; Input.mouse.t = G.t; return; }
  if (r === 'stick') { const L = Input._L || Input.layout(), R = L.stick.r; let dx = (x - Input.stick.ox) / R, dy = (y - Input.stick.oy) / R; const m = Math.hypot(dx, dy); if (m > 1) { /* drag base */ Input.stick.ox += (dx / m) * (m - 1) * R * .5; Input.stick.oy += (dy / m) * (m - 1) * R * .5; dx /= m; dy /= m; } Input.stick.dx = dx; Input.stick.dy = dy; }
  else if (r === 'fire') { const dx = x - Input.aim.ox, dy = y - Input.aim.oy; if (Math.hypot(dx, dy) > 16) { Input.aiming = true; Input.aimA = Math.atan2(dy, dx); } }
});
function endPtr(e) {
  const r = Input.ptr[e.pointerId]; if (!r) { if (e.pointerType === 'mouse') Input.mouse.down = false; return; }
  delete Input.ptr[e.pointerId]; Input.held[r] = false;
  if (r === 'stick') Input.stick = { active: false, dx: 0, dy: 0 };
  else if (r === 'fire') { Input.fire = false; Input.aiming = false; Input.aim = { active: false }; }
  else if (r === 'hand') Input.hand = false; else if (r === 'rev') Input.rev = false; else if (r === 'gas') Input.gas = false;
}
cv.addEventListener('pointerup', endPtr); cv.addEventListener('pointercancel', endPtr); cv.addEventListener('lostpointercapture', endPtr);
cv.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('keydown', e => {
  if (document.activeElement && document.activeElement.tagName === 'INPUT') { if (e.key === 'Enter' && document.activeElement.id === 'chattext') sendChat(); if (e.key === 'Escape') closeChat(); return; }
  const k = e.key.toLowerCase(); if (Input.keys[k]) return; Input.keys[k] = true; Input.kbd = true; Snd.init();
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'tab'].includes(k)) e.preventDefault();
  if (G.mode !== 'play') return;
  if (G.fullMap) { if (k === 'm' || k === 'escape') closeMap(); else if (k === '+' || k === '=') mapZoom(1.4, VW / 2, VH / 2); else if (k === '-') mapZoom(1 / 1.4, VW / 2, VH / 2); return; }
  if (G.dlgOpen) { if (G.invOpen) { if (k === 'escape' || k === 'i' || k === 'b') Panel.close(); return; } if (k === 'escape') { if (G.garageOpen) closeGarage(); else closeDialog(); } else if (/^[1-9]$/.test(k)) { const bs = dlgEl.querySelectorAll('.opts button'); const b = bs[+k - 1]; if (b && !b.disabled) b.click(); } return; }
  if (k === 'f' || k === 'enter') Input.edge.car = true;
  if (k === 'e') Input.edge.act = true;
  if (k === 'q' || k === 'tab') Input.edge.wpn = true;
  if (k === 'h') Input.edge.horn = true;
  if (k === 'r') Input.edge.radio = true;
  if (k === 'n') Input.edge.nos = true;
  if (k === 'x') toggleSurrender();
  if (k === 'm') G.fullMap = !G.fullMap;
  if (k === 'g') openGoto();
  if (k === 'i' || k === 'b') Input.edge.inv = true;
  if (k === 'c') openPhone();
  if (k === 'v') Input.edge.reload = true;
  if (k === 't' && Net.room) { e.preventDefault(); openChat(); }
  if (k === 'escape' || k === 'p') openPause();
});
window.addEventListener('keyup', e => { Input.keys[e.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { Input.keys = {}; Input.fire = false; Input.mouse.down = false; });
cv.addEventListener('mousedown', e => { if (Input.kbd && G.mode === 'play' && !G.dlgOpen) Input.mouse.down = true; });
window.addEventListener('mouseup', () => { Input.mouse.down = false; });
function pollKeys() {
  if (!Input.kbd) {
    const s = Input.stick; Input.mx = s.active ? s.dx : 0; Input.my = s.active ? s.dy : 0; Input.sprint = false; Input.steer = 0; return;
  }
  const K = Input.keys, l = K.a || K.arrowleft, r = K.d || K.arrowright, u = K.w || K.arrowup, d = K.s || K.arrowdown;
  Input.mx = (r ? 1 : 0) - (l ? 1 : 0); Input.my = (d ? 1 : 0) - (u ? 1 : 0);
  const m = Math.hypot(Input.mx, Input.my); if (m > 1) { Input.mx /= m; Input.my /= m; }
  Input.sprint = !!K.shift; Input.steer = (r ? 1 : 0) - (l ? 1 : 0); Input.gas = !!u; Input.rev = !!d; Input.hand = !!K[' '];
  Input.fire = !!(K.j || K.control || Input.mouse.down);
  const p = G.player;
  if (p && G.t - Input.mouse.t < 3 && !p.car) { const [sx, sy] = toScreen(p.x, p.y); Input.aiming = true; Input.aimA = Math.atan2(Input.mouse.y - sy, Input.mouse.x - sx); }
  else Input.aiming = false;
}
