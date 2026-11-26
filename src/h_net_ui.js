// ================= MULTIPLAYER (room capability) =================
const Net = {
  api: null, avail: null, room: null, code: null, me: null, name: store.get('gl_name', 'Player' + rint(10, 99)), col: store.get('gl_col', 0),
  peers: new Map(), ring: [], seq: 0, sendT: 0, lobbyPeers: [], feed: [], connected: false, chatBtn: null, boardBtn: null, joining: false,
  async initLobby() {
    try {
      if (typeof claude === 'undefined' || !claude.use) { this.avail = false; refreshMenu(); return; }
      const api = await claude.use('room');
      if (!api) { this.avail = false; refreshMenu(); return; }
      this.api = api; this.avail = true;
      api.onPeers(ch => { this.lobbyPeers = ch.peers; refreshMenu(); }, err => { this.avail = false; refreshMenu(); });
      api.presence({ n: this.name.slice(0, 16), g: null }).catch(() => { });
      refreshMenu();
    } catch (e) { this.avail = false; refreshMenu(); }
  },
  games() { const m = new Map(); for (const p of this.lobbyPeers) { const g = p.presence && p.presence.g; if (typeof g === 'string' && /^[A-Z0-9]{4}$/.test(g)) m.set(g, (m.get(g) || 0) + 1); } return m; },
  async join(code) {
    if (!this.api || this.joining) return false; this.joining = true;
    try {
      code = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length !== 4) throw new Error('bad code');
      const r = await this.api.join('gl-' + code.toLowerCase());
      this.room = r; this.code = code; this.jt = Date.now(); this.todSynced = 0; this.peers.clear(); this.ring = []; this.feed = [];
      r.onPeers(ch => this.onPeers(ch), () => { this.feedAdd('Connection to the game was lost.', '#ff6b6b'); });
      r.onConnection(c => { this.connected = c; });
      this.api.presence({ n: this.name.slice(0, 16), g: code }).catch(() => { });
      this.joining = false; return true;
    } catch (e) { this.joining = false; return false; }
  },
  async joinLan(addr, hosting) {
    if (this.joining) return false; this.joining = true;
    try { const r = await lanConnect(addr); this.room = r; this.code = 'LAN'; this.lan = hosting || addr; this.lanHost = !!hosting; this.jt = Date.now(); this.todSynced = 0; this.peers.clear(); this.ring = []; this.feed = []; this.connected = true;
      r.onPeers(ch => this.onPeers(ch), () => { this.feedAdd('Connection to the LAN game was lost.', '#ff6b6b'); this.connected = false; }); r.onConnection(c => { this.connected = c; }); this.joining = false; return true;
    } catch (e) { this.joining = false; return false; }
  },
  async leave() {
    if (this.lanHost && window.AndroidLan) { try { AndroidLan.stop(); } catch (e) { } } this.lan = null; this.lanHost = false;
    if (this.room) { try { await this.room.leave(); } catch (e) { } }
    this.room = null; this.code = null; this.peers.clear();
    if (this.api) this.api.presence({ n: this.name.slice(0, 16), g: null }).catch(() => { });
  },
  emitEv(k, d) {
    if (!this.room) return; const now = Date.now();
    this.ring.push(Object.assign({ i: ++this.seq, k, t: now }, d));
    while (this.ring.length > 14 || (this.ring.length && now - this.ring[0].t > 1800)) this.ring.shift();
  },
  myScene() { return G.scene ? G.scene.b.id : -1; },
  update(dt) {
    if (!this.room || G.mode !== 'play') return;
    this.sendT -= dt;
    if (this.sendT <= 0) {
      this.sendT = 1 / 15; const p = G.player, c = p.car, now = Date.now();
      while (this.ring.length && now - this.ring[0].t > 1800) this.ring.shift();
      const s = { n: this.name.slice(0, 16), c: this.col, x: Math.round(c ? c.x : p.x), y: Math.round(c ? c.y : p.y), a: +(c ? c.a : p.a).toFixed(2), in: this.myScene(), hp: Math.max(0, Math.round(p.hp)), dead: p.dead ? 1 : 0, w: p.weapon, sh: p.shirt, sk: p.skin, k: G.kills, d: G.deaths, m: Math.floor(G.cash), pm: G.settings.pvp ? 0 : 1, st: stars(), mv: p.moving ? 1 : 0 };
      if (c) { s.car = c.type; s.cc = c.color; s.vx = Math.round(c.vx); s.vy = Math.round(c.vy); s.sr = c.siren > 0 ? 1 : 0; s.cd = c.dead ? 1 : 0; s.br = (c.brake || c.throttle < 0) ? 1 : 0; const md = encMods(c.mods); if (md) s.md = md; if (c.nosT > 0) s.nz = 1; }
      s.tod = +G.tod.toFixed(2); s.jt = this.jt; { const fm = farmsEnc(); if (fm) s.fm = fm; }
      const pres = { s, ev: this.ring.slice(-12) }; if (typeof netXtra === 'function') try { netXtra(pres); } catch (e) { } this.room.presence(pres).catch(() => { });
    }
    // prune remote
    const t = performance.now();
    for (const [k, e] of this.peers) if (t - e.seen > 15000) this.peers.delete(k);
  },
  onPeers(ch) {
    if (typeof netXrecv === 'function') try { netXrecv(ch); } catch (e) { console.error('netXrecv', e); }
    for (const p of ch.left) { const e = this.peers.get(p.peer); if (e) { this.feedAdd(e.name + ' left the game', '#aaa'); this.peers.delete(p.peer); } }
    for (const p of ch.peers) {
      if (p.sameTab) { this.me = p.peer; continue; }
      const pr = p.presence; if (!pr || !pr.s || typeof pr.s !== 'object') continue;
      const s = pr.s; if (typeof s.x !== 'number' || typeof s.y !== 'number') continue;
      let e = this.peers.get(p.peer);
      if (!e) { e = { peer: p.peer, snaps: [], lastEv: Math.max(0, ...((Array.isArray(pr.ev) ? pr.ev : []).map(v => +v.i || 0))), ent: { isRemote: true, peer: p.peer, x: s.x, y: s.y, name: '', pm: 0 }, seen: 0 }; this.peers.set(p.peer, e); this.feedAdd(String(s.n || 'Someone').slice(0, 16) + ' joined', '#7fdbff'); }
      e.seen = performance.now();
      const last = e.snaps[e.snaps.length - 1];
      if (!last || last.s !== s) { e.snaps.push({ t: performance.now(), s }); if (e.snaps.length > 12) e.snaps.shift(); }
      if (typeof s.tod === 'number' && isFinite(s.tod) && !this.todSynced && typeof s.jt === 'number' && s.jt < this.jt) { G.tod = clamp(s.tod, 0, 23.99); this.todSynced = 1; }
      e.name = String(s.n || 'Player').slice(0, 16); e.col = PCOLORS[(s.c | 0) % PCOLORS.length]; e.s = s;
      e.ent.name = e.name; e.ent.pm = s.pm ? 1 : 0; e.ent.x = s.x; e.ent.y = s.y;
      if (Array.isArray(pr.ev)) for (const ev of pr.ev.slice().sort((a, b) => a.i - b.i)) { if (!ev || typeof ev.i !== 'number' || ev.i <= e.lastEv) continue; e.lastEv = ev.i; try { this.handleEv(e, ev); } catch (er) { } }
    }
  },
  handleEv(e, ev) {
    const same = e.s && e.s.in === this.myScene() && G.mode === 'play';
    const n = v => typeof v === 'number' && isFinite(v) ? v : 0;
    switch (ev.k) {
      case 's': if (!same || !Array.isArray(ev.as)) return; { const w = WEAPONS[[1, 2, 3, 6].includes(n(ev.w)) ? n(ev.w) : 1]; for (const a of ev.as.slice(0, 8)) fireHitscan(e.ent, n(ev.x), n(ev.y), n(a), w, false, true); Snd.play(w.sound, n(ev.x), n(ev.y)); spawnFx('flash', n(ev.x), n(ev.y)); } break;
      case 'r': if (!same) return; G.projs.push({ k: 'rocket', x: n(ev.x), y: n(ev.y), a: n(ev.a), t: 0, owner: e.ent }); Snd.play('rocket', n(ev.x), n(ev.y)); break;
      case 'm': if (!same) return; G.projs.push({ k: 'molotov', x: n(ev.x), y: n(ev.y), x0: n(ev.x), y0: n(ev.y), x1: n(ev.tx), y1: n(ev.ty), t: 0, dur: .6, owner: e.ent, z: 0 }); break;
      case 'x': if (!same) return; explosion(n(ev.x), n(ev.y), 120, e.ent, true); break;
      case 'p': { if (!same) return; const p = G.player; if (!p || p.dead || p.car) return; const d = dist(p.x, p.y, n(ev.x), n(ev.y)); if (d < 34 && Math.abs(angDiff(n(ev.a), Math.atan2(p.y - n(ev.y), p.x - n(ev.x)))) < 1.1) { hurtPlayer(12, e.ent, 'punch'); if (G.settings.pvp && !e.ent.pm) { p.kx += Math.cos(n(ev.a)) * 200; p.ky += Math.sin(n(ev.a)) * 200; Snd.play('punch', p.x, p.y); } } } break;
      case 'h': if (same) Snd.play('horn', e.s.x, e.s.y, .7); break;
      case 'd': { const by = typeof ev.by === 'string' ? ev.by : null; if (by && by === this.me) { G.kills++; addCash(250, 1); this.feedAdd('You wasted ' + e.name + '  +$250', '#57e389'); } else if (by) { const k = this.peers.get(by); this.feedAdd((k ? k.name : 'Someone') + ' wasted ' + e.name, '#ff6b6b'); } else this.feedAdd(e.name + ' got wasted', '#ff6b6b'); } break;
      case 'b': this.feedAdd(e.name + ' got busted', '#5dade2'); break;
      case 'z': casinoNet(e, ev, same); break;
      case 'c': if (typeof ev.t === 'string') this.feedAdd(e.name + ': ' + ev.t.slice(0, 80), '#fff', true); break;
    }
  },
  feedAdd(text, col, chat) { this.feed.push({ text, col, t: chat ? 9 : 6 }); if (this.feed.length > 6) this.feed.shift(); },
  interp(e) {
    const sn = e.snaps; if (!sn.length) return null; const rt = performance.now() - 120;
    let a = sn[0], b = sn[sn.length - 1];
    for (let i = sn.length - 1; i > 0; i--) if (sn[i - 1].t <= rt) { a = sn[i - 1]; b = sn[i]; break; }
    const f = b.t === a.t ? 1 : clamp((rt - a.t) / (b.t - a.t), 0, 1.3);
    const s = b.s, sa = a.s;
    if (Math.abs(s.x - sa.x) > 400 || Math.abs(s.y - sa.y) > 400 || s.in !== sa.in) return { x: s.x, y: s.y, a: s.a, s };
    return { x: lerp(sa.x, s.x, f), y: lerp(sa.y, s.y, f), a: sa.a + angDiff(sa.a, s.a) * Math.min(f, 1), s };
  },
  visible() {
    const out = []; if (!this.room) return out; const sc = this.myScene();
    for (const e of this.peers.values()) { if (!e.s || e.s.in !== sc) continue; const r = this.interp(e); if (r) { e.ent.x = r.x; e.ent.y = r.y; out.push([e, r]); } }
    return out;
  },
  remoteCars() {
    if (!this.room || G.scene) return [];
    const out = [];
    for (const [e, r] of this.visible()) {
      const s = r.s; if (!s.car || !CAR_TYPES[s.car]) continue; const d = CAR_TYPES[s.car];
      const o = { remote: true, mods: decMods(s.md), owner: e.ent, driver: e.ent, x: r.x, y: r.y, a: r.a, vx: +s.vx || 0, vy: +s.vy || 0, av: 0, L: d.L * 2, W: d.W * 2, mass: 50, d, type: s.car, color: typeof s.cc === 'string' ? s.cc : '#888', dead: s.cd, siren: s.sr ? 1 : -1, brake: s.br, throttle: 0, hp: d.hp };
      const n = o.L > 90 ? 4 : 3; o.circ = []; for (let i = 0; i < n; i++) o.circ.push(lerp(-o.L / 2 + o.W / 2, o.L / 2 - o.W / 2, i / (n - 1)));
      o.circles = () => { const c = Math.cos(o.a), sn = Math.sin(o.a); return o.circ.map(k => [o.x + c * k, o.y + sn * k]); }; o.damage = () => { };
      out.push(o);
    }
    return out;
  },
  remoteTargets() {
    const out = [];
    for (const [e, r] of this.visible()) { if (r.s.dead) continue; out.push({ x: r.x, y: r.y, rad: r.s.car ? 22 : 11, isRemoteTarget: true, isRemote: true, peer: e.peer, pm: r.s.pm, inCar: !!r.s.car, dead: 0 }); }
    return out;
  },
  drawRemotes(g, interior, kind) {
    for (const [e, r] of this.visible()) {
      const s = r.s;
      if (kind === 'car' && s.car && CAR_TYPES[s.car]) { const d = CAR_TYPES[s.car]; drawCar({ type: s.car, color: typeof s.cc === 'string' ? s.cc : '#888', dead: s.cd, d, L: d.L * 2, W: d.W * 2, x: r.x, y: r.y, a: r.a, hp: d.hp, st: { hp: d.hp }, brake: s.br, throttle: 0, driver: 1, siren: s.sr ? 1 : -1, mods: decMods(s.md), nosT: s.nz ? 1 : 0 }); }
      if (kind === 'ped' && !s.car) drawPed({ x: r.x, y: r.y, a: r.a, shirt: typeof s.sh === 'string' ? s.sh : e.col, skin: typeof s.sk === 'string' ? s.sk : '#e0ac69', pants: '#1b2631', hair: '#2b1a10', weapon: clamp(s.w | 0, 0, WEAPONS.length - 1), moving: s.mv, phase: G.t * 9, dead: s.dead, kx: 0 });
    }
  },
  drawTags() {
    for (const [e, r] of this.visible()) {
      const [sx, sy] = toScreen(r.x, r.y); if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) continue;
      ctx.font = '800 12px Rubik, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const label = e.name + (r.s.pm ? ' ☮' : '') + (r.s.st ? ' ' + '★'.repeat(clamp(r.s.st | 0, 0, 5)) : ''); const w = ctx.measureText(label).width + 10;
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(sx - w / 2, sy - (r.s.car ? 46 : 34), w, 17); ctx.fillStyle = e.col; ctx.fillText(label, sx, sy - (r.s.car ? 37 : 25));
      const hp = clamp((r.s.hp | 0) / 100, 0, 1); ctx.fillStyle = '#400'; ctx.fillRect(sx - 16, sy - (r.s.car ? 28 : 16), 32, 3); ctx.fillStyle = '#e74c3c'; ctx.fillRect(sx - 16, sy - (r.s.car ? 28 : 16), 32 * hp, 3);
    }
  },
  drawMini(dot) { if (!this.room) return; for (const e of this.peers.values()) if (e.s && e.s.in === -1 && !G.scene || e.s && G.scene && e.s.in === -1) dot(e.s.x, e.s.y, e.col, 3.2); },
  drawHUD(sc) {
    this.chatBtn = null; this.boardBtn = null;
    if (!this.room) return;
    const y = 52 * sc; ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(8, y, 38 * sc, 30 * sc); ctx.font = `${16 * sc}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('💬', 8 + 19 * sc, y + 15 * sc);
    this.chatBtn = [8, y, 38 * sc, 30 * sc];
    const np = this.peers.size + 1; const lab = `${this.lan ? 'LAN ' + this.lan : 'ROOM ' + this.code} · ${np} ${np === 1 ? 'player' : 'players'}` + (this.connected ? '' : ' · connecting…');
    ctx.font = `700 ${11 * sc}px Rubik, sans-serif`; const w = ctx.measureText(lab).width + 12; ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(8, y + 34 * sc, w, 18 * sc); ctx.fillStyle = '#7fdbff'; ctx.textAlign = 'left'; ctx.fillText(lab, 14, y + 43 * sc);
    this.boardBtn = [8, y + 34 * sc, w, 18 * sc];
    // feed
    let fy = y + 66 * sc; for (const f of this.feed) { f.t -= 1 / 60; if (f.t <= 0) continue; ctx.globalAlpha = Math.min(1, f.t); ctx.font = `600 ${12 * sc}px Rubik, sans-serif`; const tw = Math.min(VW * .5, ctx.measureText(f.text).width + 10); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(8, fy - 9 * sc, tw, 18 * sc); ctx.fillStyle = f.col; ctx.fillText(f.text, 13, fy, VW * .5 - 10); fy += 20 * sc; ctx.globalAlpha = 1; }
    this.feed = this.feed.filter(f => f.t > 0);
    if (G.showBoard) {
      const rows = [{ n: this.name + ' (you)', k: G.kills, d: G.deaths, m: G.cash, c: PCOLORS[this.col] }].concat([...this.peers.values()].filter(e => e.s).map(e => ({ n: e.name, k: e.s.k | 0, d: e.s.d | 0, m: e.s.m | 0, c: e.col }))).sort((a, b) => b.k - a.k || b.m - a.m);
      const bw = Math.min(360, VW - 40), bh = 34 + rows.length * 22, bx = (VW - bw) / 2, by = VH * .2;
      ctx.fillStyle = 'rgba(10,12,16,.92)'; ctx.fillRect(bx, by, bw, bh); ctx.strokeStyle = '#f2c230'; ctx.lineWidth = 2; ctx.strokeRect(bx, by, bw, bh);
      ctx.font = '800 12px Rubik, sans-serif'; ctx.fillStyle = '#f2c230'; ctx.textAlign = 'left'; ctx.fillText('PLAYER', bx + 10, by + 16); ctx.textAlign = 'right'; ctx.fillText('KILLS', bx + bw - 130, by + 16); ctx.fillText('DEATHS', bx + bw - 70, by + 16); ctx.fillText('CASH', bx + bw - 10, by + 16);
      rows.forEach((r, i) => { const yy = by + 38 + i * 22; ctx.fillStyle = r.c; ctx.textAlign = 'left'; ctx.font = '700 13px Rubik, sans-serif'; ctx.fillText(r.n, bx + 10, yy, bw - 200); ctx.fillStyle = '#fff'; ctx.textAlign = 'right'; ctx.fillText(String(r.k), bx + bw - 130, yy); ctx.fillText(String(r.d), bx + bw - 70, yy); ctx.fillText(money(r.m), bx + bw - 10, yy); });
    }
  }
};

// ================= MENUS =================
const menuEl = document.getElementById('menu'), menuBox = document.getElementById('menubox');
let menuView = null;
function showMenu(fn) { menuView = fn; menuEl.classList.add('show'); G.menuOpen = true; fn(); }
function hideMenu() { menuEl.classList.remove('show'); menuView = null; G.menuOpen = false; }
function refreshMenu() { if (menuView === mpMenu) mpMenu(); }
function h(tag, attrs, kids) { const e = document.createElement(tag); if (attrs) for (const k in attrs) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'html') e.innerHTML = attrs[k]; else if (k.startsWith('on')) e[k] = attrs[k]; else e.setAttribute(k, attrs[k]); } (kids || []).forEach(c => c && e.appendChild(c)); return e; }
function btn(label, fn, cls, small) { const b = h('button', { class: 'btn ' + (cls || '') }); b.textContent = label; if (small) { const s = h('small', { text: small }); b.appendChild(s); } b.onclick = () => { Snd.init(); Snd.play('ui'); fn(); }; return b; }
function nameField() {
  const inp = h('input', { type: 'text', maxlength: '16', placeholder: 'Your name' }); inp.value = Net.name;
  inp.oninput = () => { Net.name = inp.value.replace(/[^\w \-.']/g, '').slice(0, 16) || 'Player'; store.set('gl_name', Net.name); if (Net.api) Net.api.presence({ n: Net.name, g: Net.code }).catch(() => { }); };
  return inp;
}
function mainMenu() {
  menuBox.innerHTML = '';
  menuBox.append(h('div', { class: 'title', text: 'GRIDLOCK' }), h('div', { class: 'sub', text: 'SAN VARRO · TOP-DOWN CRIME' }));
  const sv = loadSlot(G.slot);
  menuBox.append(
    btn(G.inGame ? 'Resume' : sv ? 'Continue' : 'Play Solo', () => { if (G.inGame) hideMenu(); else startGame(false); }, '', sv && !G.inGame ? 'Slot ' + G.slot + ' · ' + money((sv.cash || 0) + (sv.bank || 0)) : ''),
    G.inGame ? '' : btn('Save slots', () => showMenu(() => slotMenu('play')), 'alt', NSLOT + ' slots'),
    btn('Multiplayer', () => showMenu(mpMenu), 'grn', 'online or LAN'),
    btn('How to Play', () => showMenu(howTo), 'alt'),
    btn('Settings', () => showMenu(() => settingsMenu(mainMenu)), 'alt'),
  );
  menuBox.append(h('div', { class: 'small', html: 'Steal cars, take jobs from ringing payphones, walk into any door, and talk to anyone. <span class="kbd">Phone</span> touch controls · <span class="kbd">Desktop</span> WASD + mouse' }));
}
function defaultSave() { return { cash: 500, bank: 0 }; }
function mpMenu() {
  menuBox.innerHTML = '';
  menuBox.append(h('h2', { text: 'Multiplayer' }));
  menuBox.append(h('div', { class: 'lbl', text: 'Your name' }), nameField());
  const sw = h('div', { class: 'sw' }); PCOLORS.forEach((c, i) => { const d = h('i', { style: 'background:' + c }); if (i === Net.col) d.className = 'on'; d.onclick = () => { Net.col = i; store.set('gl_col', i); mpMenu(); }; sw.appendChild(d); });
  menuBox.append(h('div', { class: 'lbl', text: 'Name tag color' }), sw);
  if (Net.room) {
    menuBox.append(h('div', { class: 'small', html: Net.lan ? (Net.lanHost ? `You're hosting a LAN game at <b>${Net.lan}</b>. ` + (G.settings.lanBcast !== 0 ? 'Phones on the same Wi-Fi see it under Multiplayer → Games nearby.' : 'It isn\'t broadcast (Settings), so friends type this address under Join LAN.') : `You're in the LAN game at <b>${Net.lan}</b>.`) : `You're in room ${Net.code}. Share the code with friends so they can join.` }), btn('Back to game', () => hideMenu(), 'grn'), btn('Leave room', () => { Net.leave(); mpMenu(); }, 'red'), btn('Back', () => showMenu(G.inGame ? pauseMenu : mainMenu), 'alt'));
    return;
  }
  if (Net.avail === null) { menuBox.append(h('div', { class: 'small', text: 'Connecting to the lobby…' })); }
  else if (!Net.avail) {
    menuBox.append(h('div', { class: 'lbl', text: 'Online rooms' }), h('div', { class: 'small', html: 'Room codes work when the game is opened from its Claude link. Here, use LAN play below.' }));
  } else {
    const games = Net.games();
    menuBox.append(h('div', { class: 'lbl', text: 'Open games' }));
    const list = h('div', { class: 'games' });
    if (!games.size) list.append(h('div', { class: 'small', text: 'No open games right now. Create one and share the code!' }));
    for (const [code, n] of games) { const row = h('div', { class: 'game' }, [h('span', {}, [h('b', { text: code }), h('span', { class: 'small', text: `  ${n} player${n > 1 ? 's' : ''}` })])]); const jb = h('button', { class: 'btn grn', style: 'width:auto;margin:0;padding:8px 14px' }); jb.textContent = 'Join'; jb.onclick = () => doJoin(code); row.append(jb); list.append(row); }
    menuBox.append(list);
    menuBox.append(btn('Create a new game', () => { const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += ch[Math.floor(Math.random() * ch.length)]; doJoin(c, true); }, 'grn', 'get a room code'));
    const inp = h('input', { type: 'text', maxlength: '4', placeholder: 'CODE', style: 'text-transform:uppercase;letter-spacing:4px;font-family:Bungee' });
    const jb = btn('Join', () => doJoin(inp.value));
    menuBox.append(h('div', { class: 'lbl', text: 'Join with a code' }), h('div', { class: 'row' }, [inp, jb]));
  }
  menuBox.append(...lanSection());
  menuBox.append(btn('Back', () => showMenu(G.inGame ? pauseMenu : mainMenu), 'alt'));
}
async function doJoin(code) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== 4) { Snd.play('bad'); return; }
  menuBox.querySelectorAll('button').forEach(b => b.disabled = true);
  const ok = await Net.join(code);
  if (!ok) { Snd.play('bad'); mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t join that room. Try again in a moment.' })); return; }
  if (!G.inGame) startGame(true); else hideMenu();
  msg(`Joined room ${code}. Share the code so friends can join!`, '#7fdbff');
}
function pauseMenu() {
  menuBox.innerHTML = '';
  menuBox.append(h('h2', { text: Net.room ? 'Menu · Room ' + Net.code : 'Paused' }));
  const p = G.player;
  menuBox.append(h('div', { class: 'small', text: `Cash ${money(G.cash)} · Bank ${money(G.bank)} · Kills ${G.kills} · Deaths ${G.deaths}${G.mission ? ' · Job: ' + G.mission.title : ''}` }));
  menuBox.append(btn('Resume', () => hideMenu()), btn('City Map', () => { hideMenu(); G.fullMap = true; }, 'alt'), btn('Save game', () => showMenu(() => slotMenu('save')), 'alt', 'slot ' + G.slot), btn('Radio & music', () => { hideMenu(); Panel.open('radio'); }, 'alt'), btn('Multiplayer', () => showMenu(mpMenu), 'grn', Net.room ? 'room ' + Net.code : 'join or create'), btn('Settings', () => showMenu(() => settingsMenu(pauseMenu)), 'alt'), btn('How to Play', () => showMenu(howTo), 'alt'));
  if (G.mission) menuBox.append(btn('Abandon job', () => { failMission('Job abandoned.'); hideMenu(); }, 'red'));
  menuBox.append(btn('Quit to title', () => { doSave(true); Net.leave(); G.inGame = false; G.mode = 'menu'; G.mission = null; closeDialog(); showMenu(mainMenu); }, 'red', 'progress is saved'));
}
function openPause() { if (G.dlgOpen) closeDialog(); showMenu(pauseMenu); }
function seg(label, opts, cur, fn) {
  const d = h('div', { class: 'seg' }); opts.forEach(([v, l]) => { const b = h('button', { text: l }); if (v === cur) b.className = 'on'; b.onclick = () => { Snd.init(); Snd.play('ui'); fn(v); }; d.appendChild(b); });
  return [h('div', { class: 'lbl', text: label }), d];
}
function settingsMenu(back) {
  const S = G.settings, save = () => store.set('gl_settings', S), re = () => settingsMenu(back);
  menuBox.innerHTML = ''; menuBox.append(h('h2', { text: 'Settings' }));
  menuBox.append(...seg('Driving controls (touch)', [['point', 'Point-to-steer'], ['classic', 'Classic: steer + pedals']], S.drive, v => { S.drive = v; save(); re(); }));
  menuBox.append(h('div', { class: 'small', text: S.drive === 'point' ? 'Push the stick the way you want to go — the car turns and accelerates there. Pull back to reverse.' : 'Stick left/right steers. Hold GAS and BRAKE buttons.' }));
  menuBox.append(...seg('Button size', [[.85, 'Small'], [1, 'Normal'], [1.18, 'Large']], S.ctrlScale, v => { S.ctrlScale = v; save(); re(); }));
  menuBox.append(...seg('Aim assist', [[1, 'On'], [0, 'Off']], S.assist, v => { S.assist = v; save(); re(); }));
  menuBox.append(...seg('Camera zoom', [[1.25, 'Close'], [1, 'Normal'], [.8, 'Far']], S.zoom || 1, v => { S.zoom = v; save(); re(); }));
  menuBox.append(...seg('Graphics', [['low', 'Fast'], ['high', 'Sharp']], S.quality, v => { S.quality = v; G.autoDpr = 0; save(); resize(); re(); }));
  const onv = (k, d) => S[k] === undefined ? d : S[k];
  menuBox.append(h('div', { class: 'lbl', text: 'Sound' }), sliderEl('Music', Snd.mvol, v => Snd.setMVol(v)), sliderEl('Effects', Snd.vol / 1.2, v => Snd.setVol(v * 1.2)), sliderEl('Ambience', Snd.avol, v => Snd.setAVol(v)));
  menuBox.append(h('div', { class: 'lbl', text: 'World' }), sliderEl('City population (people & traffic)', S.pop === undefined ? .5 : S.pop, v => { S.pop = v; save(); }), sliderEl('Gang presence on the streets', S.gangs === undefined ? .5 : S.gangs, v => { S.gangs = v; save(); }));
  menuBox.append(...seg('Title music', [[1, 'On'], [0, 'Off']], onv('mTitle', 1), v => { S.mTitle = v; save(); re(); }));
  menuBox.append(...seg('Indoor music (clubs, bars, diners)', [[1, 'On'], [0, 'Off']], onv('mIndoor', 1), v => { S.mIndoor = v; save(); re(); }));
  menuBox.append(...seg('Chase music', [[1, 'On'], [0, 'Off']], onv('mChase', 1), v => { S.mChase = v; save(); re(); }));
  menuBox.append(...seg('Headphones (radio on foot)', [[1, 'On'], [0, 'Off']], onv('walkman', 0), v => { S.walkman = v; save(); re(); }));
  menuBox.append(...seg('Keep my station in every car', [[1, 'On'], [0, 'Off']], onv('keepSt', 0), v => { S.keepSt = v; save(); re(); }));
  if (G.inGame) menuBox.append(btn('Choose radio station', () => { hideMenu(); Panel.open('radio'); }, 'alt', STATIONS.length - 1 + ' stations'));
  menuBox.append(...seg('Multiplayer PvP', [[1, 'PvP on'], [0, 'Passive ☮']], S.pvp, v => { S.pvp = v; save(); re(); }));
  menuBox.append(h('div', { class: 'small', text: 'Passive players can\'t hurt or be hurt by other players.' }));
  menuBox.append(...seg('Broadcast my LAN games', [[1, 'On'], [0, 'Off']], onv('lanBcast', 1), v => { S.lanBcast = v; save(); re(); }));
  menuBox.append(h('div', { class: 'small', text: 'When you host a LAN game, phones on the same Wi-Fi see it in their Multiplayer menu automatically. Turn off to only let in people you give the address to.' }));
  menuBox.append(...seg('Lighting (day/night)', [[1, 'On'], [0, 'Off (faster)']], S.lights === undefined ? 1 : S.lights, v => { S.lights = v; save(); re(); }));
  menuBox.append(...seg('Weather', [[1, 'Rain sometimes'], [0, 'Always clear']], S.weather === undefined ? 1 : S.weather, v => { S.weather = v; save(); re(); }));
  menuBox.append(...seg('Minimap', [[1, 'On'], [0, 'Off']], S.minimap, v => { S.minimap = v; save(); re(); }));
  menuBox.append(btn('Back', () => showMenu(back), 'alt'));
}
function howTo() {
  menuBox.innerHTML = '';
  menuBox.append(h('h2', { text: 'How to Play' }));
  menuBox.append(h('div', { class: 'small', html: `
<b>Touch</b><br>• Left side: drag anywhere to move. Push all the way to run.<br>• <b>Fire</b> (big red button): tap to shoot where you face, or drag it to aim. Aim assist locks onto nearby targets.<br>• <b>USE</b> pops up near people, doors and objects — talk, shop, enter buildings, rob registers, read papers, play arcades…<br>• <b>GET IN</b> appears near cars. Jack anything, even with someone inside.<br>• In a car: push the stick toward where you want to go. <b>DRIFT</b> = handbrake, <b>BRAKE</b> = brake/reverse. Fire shoots forward.<br><br>
<b>Keyboard</b><br><span class="kbd">WASD</span> move/drive · <span class="kbd">Mouse</span> aim · <span class="kbd">Click</span>/<span class="kbd">J</span> shoot · <span class="kbd">F</span> car · <span class="kbd">E</span> use · <span class="kbd">Space</span> handbrake · <span class="kbd">Shift</span> run · <span class="kbd">Q</span> weapon · <span class="kbd">R</span> radio · <span class="kbd">H</span> horn/siren · <span class="kbd">N</span> nitrous · <span class="kbd">I</span> backpack · <span class="kbd">V</span> reload · <span class="kbd">M</span> map · <span class="kbd">T</span> chat · <span class="kbd">1-9</span> pick dialog option<br><br>
<b>The city</b><br>• Ringing <b>payphones</b> offer jobs: deliveries, car thefts, hits, taxi fares, demolition. Gang members offer turf-war work.<br>• Crimes earn <b>wanted stars</b>. Break line of sight, hide indoors, use a <b>Respray</b> garage, bribe a cop, or pay the fine at a police station.<br>• Cash in your pocket is lost when you're wasted or busted. Use an <b>ATM</b> or bank teller.<br>• Sleep in <b>Your Apartment</b> to save and heal. The stash there restocks armor.<br>• Every door is enterable: shops, diners, bars, a nightclub, strip clubs, offices, homes, warehouses, a bank (with a vault…).<br>• <b>Customs garages</b> (wrench icon): drive in to paint, add liveries, rims, spoilers, neon, and tune engine, turbo, nitrous, brakes, suspension and armor. Your modded car is saved as your ride.<br>• <b>Chop shops</b> (orange): sell stolen cars. Cars on the daily wanted list pay double.<br>• <b>Backpack</b> (bag button, top left): everything you find goes here — use food and medkits, drop things, or sell loot at <b>pawn shops</b>. Your <b>home stash</b> holds 5,000 units and every car has a <b>trunk</b> (stand behind it and tap USE).<br>• <b>Gun shops</b> have a workbench: suppressors, mags, sights, ammo types and finishes. Guns now have magazines and reload.<br>• <b>Out of town</b>: drive west or south for farms, forests, lakes (fishing!), a quarry, the beach, Dusty Creek and the Road Reapers' trailer park. Five gangs each hold turf; work for them or cross them and your standing changes.<br>• <b>Street dealers</b> (green dots): buy low, sell high. Prices differ by district and change daily. Cops may search you, and you lose your product if busted or wasted.<br><br>
<b>Multiplayer</b><br>Online: create a room and share the 4-letter code. <b>LAN</b> (Android app or the downloaded file): one phone hosts, and friends on the same Wi-Fi join by its address — or just open that address in a browser. Everyone shares the city; traffic and pedestrians are local to each player. Tap the room label to see the scoreboard.` }));
  menuBox.append(btn('Back', () => showMenu(G.inGame ? pauseMenu : mainMenu), 'alt'));
}
// chat
const chatEl = document.getElementById('chatin'), chatText = document.getElementById('chattext');
function openChat() { if (!Net.room) return; chatEl.classList.add('show'); chatText.value = ''; setTimeout(() => chatText.focus(), 30); G.chatOpen = true; }
function closeChat() { chatEl.classList.remove('show'); chatText.blur(); G.chatOpen = false; }
function sendChat() { const t = chatText.value.trim().slice(0, 80); if (t) { Net.emitEv('c', { t }); Net.feedAdd('You: ' + t, '#f2c230', true); } closeChat(); }
document.getElementById('chatsend').onclick = sendChat;

// ================= GAME START / LOOP =================
function startGame(mp) {
  G.save = loadSlot(G.slot) || defaultSave();
  G.cash = G.save.cash || 0; G.bank = G.save.bank || 0; G.kills = 0; G.deaths = 0; G.heat = 0; G.mission = null;
  G.cars = []; G.peds = []; G.projs = []; G.fires = []; G.drops = []; G.fx = []; G.scene = null; G.interiors = {};
  const sp = spawnPoint(); G.player = newPlayer(sp.x, sp.y); G.player.a = Math.PI / 2;
  G.mode = 'play'; G.inGame = true; G.snapCam = 1; G.fade = 1.5; G.godT = 2; G.spawnT = 0; G.district = null;
  hideMenu(); Snd.init();
  // a starter car nearby
  const near = randStreetPoint(60, 260, TILE.ROAD); let ride = G.save.ride && CAR_TYPES[G.save.ride.type] ? G.save.ride : null;
  // the starter car is a one-time gift: brand-new saves get it (as your ride); once you sell / scrap / lose it, it's gone for good
  const firstCar = !ride && !G.save.starterGiven && !G.save.t; if (!ride) G.save.starterGiven = 1;
  if (firstCar) ride = G.save.ride = { type: 'compact', mods: { p: '#3498db' }, legit: 1, starter: 1 };
  if (ride) { const sc = new Car(ride ? ride.type : 'compact', near.x, near.y, 0, '#3498db'); if (ride) { applyMods(sc, Object.assign({}, ride.mods)); sc.isRide = 1; sc.persist = 1; sc.owned = 1; sc.legit = ride.legit === 0 ? 0 : 1; } else { sc.legit = 1; sc.owned = 1; sc.persist = 1; sc.starter = 1; } sc.ai = { mode: 'parked' }; G.cars.push(sc); if (ride.starter) sc.starter = 1; }
  loadInv(); if (ride) { const sc = G.cars.find(c => c.isRide); if (sc) sc.trunk = ride.trunk || {}; } newDay(); G.tod = 15.5; G.weather = { rain: 0, target: 0, t: 160 };
  if (ride) setTimeout(() => msg(ride.starter ? (firstCar ? 'Your first car — the little blue compact — is parked outside. Look for 🔑 YOURS.' : 'Your blue compact is parked outside.') : 'Your custom ride is parked nearby.', '#2ecc71'), 1200);
  msg(mp ? 'Welcome to San Varro. Your friends are out there somewhere.' : 'Welcome to San Varro. Find a ringing payphone for work.', '#f2c230');
  if (!store.get('gl_seenhelp', 0)) { store.set('gl_seenhelp', 1); setTimeout(() => msg('Tip: walk up to people, doors and objects and tap USE.', '#7fdbff'), 2500); }
}
function attract(dt) {
  // menu background: drift along a road with live traffic
  const p = G.player; if (!p) return; G.godT = 99;
  G.attractA = (G.attractA || 0) + dt * .05; G.tod = 19.2 + Math.sin(G.t * .05) * .4;
  p.x += 70 * dt; if (p.x > (N - 6) * T) p.x = 6 * T; p.y = roadCY(4) + Math.sin(G.attractA) * 10;
  G.cam.z = Math.min(VW, VH) / (9 * T); G.cam.x = p.x; G.cam.y = p.y;
  spawnCity(dt); for (const c of G.cars) { if (c.ai) updateCarAI(c, dt); updateCar(c, dt); }
  for (let i = 0; i < G.cars.length; i++) for (let j = i + 1; j < G.cars.length; j++) carCarCollide(G.cars[i], G.cars[j]);
  for (const q of G.peds) { if (!q.dead) updatePedAI(q, dt); updatePedMove(q, dt); }
  updateFx(dt);
}
let lastT = performance.now();
function frame0(t) {
  let dt = Math.min(.05, (t - lastT) / 1000); lastT = t; const rdt = dt;
  if (G.mode === 'play' && G.player && G.player.dead && G.t - (G.deathT || -9) < .9) dt *= .3;
  try {
    pollKeys();
    if (G.mode === 'menu') { attract(dt); Net.update(dt); }
    else if (!(G.menuOpen && !Net.room)) update(dt);
    else { Input.clearEdges(); }
    G.player.hidden = G.mode === 'menu'; if (G.mode === 'menu') { Snd.listener.x = G.cam.x; Snd.listener.y = G.cam.y; } Snd.update(rdt);
    render(); if (G.fullMap && G.mode === 'play') drawFullMap();
    G.errStreak = 0;
  } catch (e) { console.error(e); G.errStreak = (G.errStreak || 0) + 1;
    // something keeps crashing every frame: get the player out of the interior instead of freezing
    if (G.errStreak > 45 && G.mode === 'play') { G.errStreak = 0; try { if (G.scene) { const o = G.outPos; G.scene = null; if (o && G.player) { G.player.x = o.x; G.player.y = o.y; } } if (typeof Panel !== 'undefined' && Panel.mode) Panel.close(); G.dlgOpen = 0; toast('Something went wrong — you were moved outside.'); } catch (e2) { } } }
  requestAnimationFrame(frame);
}
document.addEventListener('pointerdown', () => Snd.init(), true);
document.addEventListener('keydown', () => Snd.init(), true);
function boot() {
  buildTiles(); buildTiles2(); buildWalls(); buildTreeSprites(); buildDetails(); GARAGETEX = garageTex(); genCity(); buildMinimap(); resize();
  G.save = loadSlot(G.slot) || defaultSave();
  const sp = spawnPoint(); G.player = newPlayer(sp.x, sp.y);
  G.cam.x = sp.x; G.cam.y = sp.y; G.cam.z = 1;
  showMenu(mainMenu);
  Net.initLobby();
  requestAnimationFrame(frame);
}
boot();
