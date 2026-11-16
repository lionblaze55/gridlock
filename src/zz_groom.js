// ================= WALK-IN GARAGE: a real room with your cars parked in bays (drive in → the car is parked, you step out inside) =================
function garLayout(n) { const per = Math.min(Math.max(n, 3), 5), rows = Math.ceil(n / per); return { per, rows, w: Math.max(9, Math.ceil(per * 2.3 + 2.4)), h: Math.ceil(rows * 3.5 + 3.6) }; }
function garSig() { return myCars().map(r => recId(r) + JSON.stringify([r.type, r.mods, r.missing, r.noEng, r.shell])).join('|') + '#' + garCap(); }
function garItems(s) { const L = myCars(), cap = Math.max(garCap(), L.length), lay = garLayout(cap), items = [];
  for (let i = 0; i < cap; i++) { const col = i % lay.per, row = Math.floor(i / lay.per), bx = 1.3 + col * 2.3, by = 1.2 + row * 3.5, r = L[i]; if (r) recId(r);
    if (r) { const d = CAR_TYPES[r.type], lw = Math.min(1.5, d.W * 2 / T), lh = Math.min(3, d.L * 2 / T); items.push({ t: 'gcar', x: bx + (1.9 - lw) / 2, y: by + (3 - lh) / 2, w: lw, h: lh, bx, by, rid: r.id, used: 0 }); }
    else items.push({ t: 'gbay', x: bx, y: by, w: 1.9, h: 3, used: 0, small: 1, flat: 1, n: i + 1 }); }
  items.push({ t: 'gshelf', x: lay.w - 1.75, y: lay.h - 3.4, w: .7, h: 2, used: 0 }); s.items = items; s.sig = garSig(); }
function enterGarage(g) { const lay = garLayout(Math.max(garCap(), myCars().length)), w = lay.w, h = lay.h, solid = new Uint8Array(w * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (x === 0 || y === 0 || x === w - 1 || y === h - 1) solid[y * w + x] = 1;
  const dx = Math.floor(w / 2); solid[(h - 1) * w + dx] = 0; const s = { b: g.b, garage: g, w, h, floor: 'concrete', items: [], npcDefs: [], solid, door: { x: (dx + .5) * T, y: (h - .6) * T }, peds: [], loot: {} }; garItems(s);
  const p = G.player; G.outPos = { x: g.ax + g.f[0] * 12, y: g.ay + g.f[1] * 12, b: g.b }; G.scene = s; p.x = s.door.x; p.y = s.door.y - 44; p.a = -Math.PI / 2; p.kx = p.ky = 0; G.fade = 1; G.sitting = null; G.hgIn = g; Snd.play('door'); toast((g.b.name === 'Your Apartment' ? 'Your garage' : 'Garage') + ' · ' + myCars().length + '/' + garCap()); }
function garRoomTick() { const s = G.scene; if (!s || !s.garage) return; if ((G.grT = (G.grT || 0) - 1) > 0) return; G.grT = 20; if (s.sig !== garSig()) garItems(s); }
function garCarObj(it) { const r = myCars().find(r => r.id === it.rid); if (!r) return null; if (!it.car) { const c = new Car(r.type, 0, 0, -Math.PI / 2); applyMods(c, Object.assign({}, r.mods || {})); if (r.mods && r.mods.p) c.color = r.mods.p; c.missing = r.missing || {}; c.noEng = r.noEng; c.ai = { mode: 'parked' }; it.car = c; } it.car.x = (it.bx + .95) * T; it.car.y = (it.by + 1.5) * T; return it.car; }
{ const _di = drawItem; drawItem = function (it, s) { const g = ctx;
  if (it.t === 'gbay' || it.t === 'gcar') { const x = (it.bx === undefined ? it.x : it.bx) * T, y = (it.by === undefined ? it.y : it.by) * T; g.strokeStyle = 'rgba(242,194,48,.55)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y + 3 * T); g.lineTo(x, y); g.lineTo(x + 1.9 * T, y); g.lineTo(x + 1.9 * T, y + 3 * T); g.stroke();
    if (it.t === 'gbay') { g.fillStyle = 'rgba(255,255,255,.14)'; g.font = 'bold 26px Rubik, sans-serif'; g.textAlign = 'center'; g.fillText(it.n, x + .95 * T, y + 1.6 * T); return; }
    const c = garCarObj(it); if (!c) return; g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(c.x - c.W / 2 + 4, c.y - c.L / 2 + 5, c.W, c.L); drawCar(c);
    const r = myCars().find(r => r.id === it.rid), ok = drivable(r.type, r.missing, r.noEng); g.font = 'bold 10px Rubik, sans-serif'; g.textAlign = 'center'; g.lineWidth = 3; g.strokeStyle = '#000'; const t = c.d.name + (ok ? '' : ' (project)'); g.strokeText(t, x + .95 * T, y + 3 * T + 12); g.fillStyle = ok ? '#e8ecf3' : '#ff9f43'; g.fillText(t, x + .95 * T, y + 3 * T + 12); return; }
  if (it.t === 'gshelf') { const x = it.x * T, y = it.y * T, w = it.w * T, h = it.h * T, hz = w > h, n = Math.max(2, Math.round((hz ? w : h) / 26)), v = it.v | 0; g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 3, y + 4, w, h); g.fillStyle = '#3d4852'; g.fillRect(x, y, w, h); g.strokeStyle = '#6b7c8a'; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, w - 2, h - 2);
    for (let i = 0; i < n; i++) { const k = (v * 7 + i * 13) % 6, cx = hz ? x + (i + .5) * w / n : x + w / 2, cy = hz ? y + h / 2 : y + (i + .5) * h / n, sz = Math.min(hz ? w / n : w, hz ? h : h / n) * .38;
      if (k === 0 || k === 3) { g.fillStyle = '#15171b'; g.beginPath(); g.arc(cx, cy, sz, 0, TAU); g.fill(); g.fillStyle = '#7f8c8d'; g.beginPath(); g.arc(cx, cy, sz * .45, 0, TAU); g.fill(); }
      else if (k === 1) { g.fillStyle = '#b07a3c'; g.fillRect(cx - sz, cy - sz * .8, sz * 2, sz * 1.6); g.fillStyle = '#8a5d2b'; g.fillRect(cx - sz, cy - 1, sz * 2, 2); }
      else if (k === 2) { g.fillStyle = '#5d6d7e'; g.fillRect(cx - sz * .9, cy - sz * .9, sz * 1.8, sz * 1.8); g.fillStyle = '#95a5a6'; g.beginPath(); g.arc(cx, cy, sz * .5, 0, TAU); g.fill(); }
      else if (k === 4) { g.fillStyle = ['#c0392b', '#2980b9', '#f2c230'][(v + i) % 3]; g.fillRect(cx - sz * .55, cy - sz, sz * 1.1, sz * 2); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(cx - sz * .55, cy - sz * .3, sz * 1.1, sz * .4); }
      else { g.fillStyle = '#7f8c8d'; g.fillRect(cx - sz, cy - sz * .35, sz * 2, sz * .7); g.fillStyle = '#566573'; g.fillRect(cx - sz * .4, cy - sz * .7, sz * .8, sz * 1.4); } }
    if (it.v === undefined || it.v === 0) { g.font = 'bold 9px Rubik, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#4fc3f7'; g.fillText('PARTS', x + w / 2, y - 4); } return; }
  return _di(it, s); }; }
{ const _ui = useItem; useItem = function (it) { const s = G.scene, g = s && s.garage;
  if (it.t === 'gcar') { Panel.open('hgarage', { g }); Panel.tab = 'veh'; Panel.wsel = it.rid; Panel.render(); return; }
  if (it.t === 'gshelf') { Panel.open('hgarage', { g }); Panel.tab = 'parts'; Panel.render(); return; }
  if (it.t === 'gbay') return toast('Empty bay — drive a car onto the GARAGE pad outside to park it here');
  return _ui(it); }; }
// taking a car out from inside the room: you leave with it
{ const _t = takeOut; takeOut = function (i, g) { const s = G.scene, n = G.cars.length; if (!(s && s.garage)) return _t(i, g); _t(i, s.garage); if (G.cars.length > n) { const c = G.cars[G.cars.length - 1]; Panel.close(); exitBuilding(); const p = G.player; p.x = c.x; p.y = c.y; enterCar(c); } }; }
// driving into the bay parks the car and puts you in the room
{ const _hg = hgTick; hgTick = function () { const c = pCar(); if (c && !G.scene && !G.dlgOpen && !c.d.boat) { const g = homeGarages().find(g => onPad(g, c)); if (g) { if (c.spd > 70) { c.vx *= .9; c.vy *= .9; return; } if (G.hgIn === g) return;
      if (garUsed() >= garCap()) { G.hgIn = g; return toast('Garage is full (' + garUsed() + '/' + garCap() + ') — back out, or walk in and make room'); }
      if (c.scamOf || c.missionCar || c.meetCar) { G.hgIn = g; return toast('You can\'t park that one here'); }
      c.throttle = 0; storeIt(c); if (G.cars.includes(c)) { G.hgIn = g; return; } enterGarage(g); msg(c.d.name + ' parked in your garage.', '#2ecc71'); return; } }
  _hg(); garRoomTick(); }; }
// ---------- part picker: Add / Swap opens a big popup with just the parts that fit ----------
{ const hg = PMODES.hgarage; PMODES.hgarage = function (H) { const r = hg.call(this, H); const old = H.el.querySelector('.pkmodal'); if (old) old.remove(); const slot = this.tab === 'parts' ? null : curSlot(); if (!slot) return r; const g = this.opt.g, t = gTarget(this.wsel, g); if (!t) return r;
  const ov = H.mk('div', 'pkmodal'); ov.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,.72);z-index:6;display:flex;align-items:center;justify-content:center;border-radius:inherit';
  const box = H.mk('div', 'pcol'); box.style.cssText = 'width:min(600px,94%);max-height:88%;overflow-y:auto;background:#161a22;border:2px solid #4fc3f7;border-radius:12px;padding:10px;flex:none';
  const empty = slot === 'eng' ? t.noEng : slot.startsWith('m:') ? !(t.mods[slot.slice(2)] | 0) : (t.missing[slot] | 0) > 0;
  box.appendChild(H.mk('div', 'ptitle', (empty ? 'Add: ' : 'Swap: ') + slotName(slot) + ' — ' + t.d.name));
  G._pk = 1; try { looseRows(H, box, t, engIdOf(t.type, t.mods, t.noEng), stockEng(t.type), reqOf(t.type), t.missing, t.mods); } finally { G._pk = 0; }
  { const f = box.querySelector('.prow'); if (f && !f.querySelector('.pbs button')) f.remove(); } const psel = unifyCol(this, H, box, 0, 'pk'); if (psel) { const cd = unifyCard(H, psel); cd.classList.remove('gdet'); cd.classList.add('gdet2'); box.appendChild(cd); } box.querySelectorAll('.prow').forEach(x => { x.classList.add('pmsg'); });
  box.addEventListener('click', ev => { if (ev.target.tagName === 'BUTTON' && /^(Fit|Swap)/.test(ev.target.textContent)) Panel.slot = null; }, true);
  const cb = H.btn('Close', () => { Panel.slot = null; }); cb.style.cssText = 'width:100%;min-height:44px;margin-top:8px;font-size:15px'; box.appendChild(cb);
  ov.addEventListener('click', ev => { if (ev.target === ov) { Panel.slot = null; Panel.render(); } }); ov.appendChild(box); H.el.appendChild(ov); return r; }; }
{ const _pc = padCar; padCar = function (g) { return G.scene ? null : _pc(g); }; }
