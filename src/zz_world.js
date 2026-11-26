// ================= HOSTED WORLDS: host one of your own saves; guests keep their progress in it =================
// The host plays one of their normal save slots. Each guest gets a profile in that world — money, stuff, cars,
// properties, skills, everything a save holds — stored inside the HOST's save, keyed by the guest's player id.
// While a guest is away their profile is frozen; when they come back the host hands it over and they carry on.
// A guest's own save slots are never touched: in someone else's world they play their world profile, which is
// also cached on their device. Profiles travel between devices in small acknowledged chunks inside the room's
// presence (works the same online and on LAN, and stays inside the room service's 4 KB presence limit).
const WH = { tx: null, q: [], rx: {}, acks: {}, roster: new Map(), served: {}, lastPres: null, pumpT: null, saveT: 0, saveDirty: false };
if (!store.get('gl_pid', null)) store.set('gl_pid', 'p' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36));
Net.pid = store.get('gl_pid', 'p0');
const isWorldHost = () => !!(Net.room && (Net.worldHost || Net.lanHost));
const asciiJSON = o => JSON.stringify(o).replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));
const W_CH = 800;
function wSend(to, kind, obj) { const d = asciiJSON(obj), parts = []; for (let i = 0; i < d.length; i += W_CH) parts.push(d.slice(i, i + W_CH)); if (!parts.length) parts.push('null');
  const item = { to, kind, parts }; const k = WH.q.findIndex(x => x.to === to && x.kind === kind); if (k >= 0) WH.q[k] = item; else WH.q.push(item); wNext(); }
function wNext() { if (WH.tx || !WH.q.length) return; const it = WH.q.shift(); WH.tx = Object.assign(it, { id: Math.random().toString(36).slice(2, 9), i: 0, t: performance.now() }); }
// what we add to our own presence
function netXtra(pres) { const s = pres.s; if (s) { s.pid = Net.pid; if (isWorldHost()) s.wh = (G.save && G.save.wid) || 1; if (G.guestWait) s.wq = 1; }
  const T = WH.tx; pres.x = null;
  if (T) { if (!WH.roster.has(T.to) || performance.now() - T.t > 90000) { WH.tx = null; wNext(); }
    else { const base = new TextEncoder().encode(JSON.stringify(pres)).length, room = 3900 - base - 160, n = Math.max(0, Math.min(3, Math.floor(room / (W_CH + 4))));
      if (n) { pres.x = [T.to, T.id, T.i, T.parts.length, T.kind]; for (let k = 0; k < n && T.i + k < T.parts.length; k++) pres.x.push(T.parts[T.i + k]); } } }
  const now = performance.now(); for (const k in WH.acks) if (now - WH.acks[k].t > 15000) delete WH.acks[k];
  const xa = Object.values(WH.acks).map(a => a.v); pres.xa = xa.length ? xa : null; WH.lastPres = pres; return pres; }
// what we read from everyone else's presence
function netXrecv(ch) { let me = null; const now = performance.now();
  for (const p of ch.peers) { if (p.sameTab) { me = p.peer; continue; } WH.roster.set(p.peer, now); }
  for (const [k, t] of WH.roster) if (now - t > 20000) WH.roster.delete(k);
  if (!me) return;
  for (const p of ch.peers) { if (p.sameTab) continue; const pr = p.presence || {};
    if (Array.isArray(pr.xa) && WH.tx && WH.tx.to === p.peer) for (const a of pr.xa) if (Array.isArray(a) && a[0] === me && a[1] === WH.tx.id && typeof a[2] === 'number') { WH.tx.i = Math.max(WH.tx.i, a[2] | 0); WH.tx.t = now; if (WH.tx.i >= WH.tx.parts.length) { WH.tx = null; wNext(); } }
    const x = pr.x; if (Array.isArray(x) && x[0] === me && typeof x[1] === 'string' && x[3] > 0 && x[3] <= 600 && typeof x[2] === 'number') { let r = WH.rx[p.peer];
      if (!r || r.id !== x[1]) r = WH.rx[p.peer] = { id: x[1], n: x[3] | 0, kind: String(x[4]), parts: [], done: false };
      for (let k = 5; k < x.length && k < 9; k++) if (typeof x[k] === 'string' && x[2] + k - 5 < r.n) r.parts[x[2] + k - 5] = x[k];
      let k = 0; while (k < r.n && typeof r.parts[k] === 'string') k++; WH.acks[p.peer] = { v: [p.peer, r.id, k], t: now };
      if (k >= r.n && !r.done) { r.done = true; let data; try { data = JSON.parse(r.parts.join('')); } catch (e) { data = undefined; } if (data !== undefined) try { wDeliver(r.kind, p, data); } catch (e) { console.error('world deliver', e); } } }
    // a guest asking for their profile in my world
    const s = pr.s; if (isWorldHost() && s && s.wq && typeof s.pid === 'string' && s.pid.length < 40) { const key = p.peer + s.pid; if (!WH.served[key] || now - WH.served[key] > 12000) { WH.served[key] = now; const gs = (G.save.guests || {})[s.pid];
      wSend(p.peer, 'prof', { wid: G.save.wid, hn: Net.name, sv: gs ? gs.sv : null, t: gs ? gs.t : 0 }); } } }
  if (G.guestWait && !G.guestWait.host) { const h = ch.peers.find(p => !p.sameTab && p.presence && p.presence.s && p.presence.s.wh); if (h) G.guestWait.host = h.peer; } }
function wDeliver(kind, p, data) {
  if (kind === 'prof' && G.guestWait && data && typeof data === 'object') return guestFinish(data);
  if (kind === 'save' && isWorldHost() && data && typeof data === 'object' && data.sv && typeof data.sv === 'object') { const s = p.presence && p.presence.s; if (!s || s.pid !== data.pid) return;
    const G2 = G.save.guests || (G.save.guests = {}); G2[data.pid] = { n: String(data.n || s.n || 'Guest').slice(0, 16), t: Date.now(), sv: data.sv }; WH.saveDirty = true; } }
// host: write guest profiles into the world save soon after they arrive (and on every normal save)
setInterval(() => { if (WH.saveDirty && G.inGame && isWorldHost() && Date.now() - WH.saveT > 3000) { WH.saveDirty = false; WH.saveT = Date.now(); doSave(true); } }, 1000);
// keep presence flowing while we're in a menu (joining, quitting, paused) so transfers finish
WH.pumpT = setInterval(() => { if (!Net.room || (G.mode === 'play' && G.inGame && !G.guestWait)) return; if (!WH.tx && !G.guestWait && !Object.keys(WH.acks).length) return;
  const base = WH.lastPres && !G.guestWait ? { s: WH.lastPres.s, ev: [] } : { s: { n: Net.name.slice(0, 16), c: Net.col, x: -99999, y: -99999, a: 0, in: -99, hp: 100, dead: 0, jt: Net.jt || 0 }, ev: [] };
  netXtra(base); Net.room.presence(base).catch(() => { }); }, 80);
// ---------- guests ----------
const wKey = wid => 'w_' + String(wid).replace(/[^\w-]/g, '').slice(0, 40);
function guestBegin(label) { if (G.inGame) { try { doSave(true); } catch (e) { } } G.guestWait = { t0: performance.now(), label, host: null }; G.inGame = false; G.mode = 'menu';
  showMenu(guestWaitMenu); const tick = setInterval(() => { const W = G.guestWait; if (!W) return clearInterval(tick); const el = performance.now() - W.t0;
    if (!Net.room) { clearInterval(tick); G.guestWait = null; showMenu(mpMenu); return; }
    if ((!W.host && el > 7000) || el > 25000) { clearInterval(tick); guestFinish({ wid: (Net.code === 'LAN' ? 'lan-' + Net.lan : 'room-' + Net.code), hn: '', sv: null, t: 0, nohost: 1 }); } }, 250); }
function guestWaitMenu() { menuBox.innerHTML = ''; const W = G.guestWait || {}; menuBox.append(h('h2', { text: 'Joining…' }), h('div', { class: 'small', text: W.host ? 'Getting your things in this world from the host…' : 'Connecting to ' + (W.label || 'the game') + '…' }),
  btn('Cancel', () => { G.guestWait = null; Net.leave(); showMenu(mpMenu); }, 'alt')); }
function guestFinish(prof) { const W = G.guestWait; if (!W) return; G.guestWait = null; const key = wKey(prof.wid || 'x'), local = loadSlot(key);
  let sv = prof.sv && typeof prof.sv === 'object' ? prof.sv : null; if (local && (!sv || (local.t || 0) > (prof.t || 0))) sv = local; const fresh = !sv; if (!sv) sv = defaultSave();
  store.set(slotKey(key), sv); if (G.prevSlot === undefined || G.prevSlot === null) G.prevSlot = G.slot; G.slot = key; G.guest = { wid: prof.wid, hn: prof.hn || 'the host', key, host: W.host, nohost: !!prof.nohost };
  startGame(true);
  msg(prof.nohost ? '🌍 Nobody here is hosting a saved world, so your progress in this game stays on this device.' : fresh ? `🌍 Welcome to ${G.guest.hn}'s world. You start fresh here — your own saves are untouched. ${G.guest.hn} keeps your progress for next time.` : `🌍 Welcome back to ${G.guest.hn}'s world — everything's right where you left it.`, '#7fdbff'); }
// a guest's saves go to their world profile (doSave already writes to slotKey(G.slot)) and up to the host
{ const _ds = doSave; doSave = function () { const r = _ds.apply(this, arguments); try { if (G.guest && G.inGame && Net.room && !G.guest.nohost) { const hp = [...WH.roster.keys()].includes(G.guest.host) ? G.guest.host : null; if (hp) wSend(hp, 'save', { pid: Net.pid, n: Net.name, sv: G.save }); } } catch (e) { } return r; }; }
{ const _l = Net.leave; Net.leave = async function () { const g = G.guest, wasIn = G.inGame;
  if (g) { if (G.inGame) try { doSave(true); } catch (e) { } G.guest = null; if (G.prevSlot !== null && G.prevSlot !== undefined) { G.slot = G.prevSlot; G.prevSlot = null; }
    const t0 = performance.now(); while (WH.tx && performance.now() - t0 < 5000) await new Promise(r => setTimeout(r, 100)); }
  WH.tx = null; WH.q = []; WH.rx = {}; WH.acks = {}; WH.served = {}; const r = await _l.apply(this, arguments); this.worldHost = false;
  if (g && G.inGame) { G.inGame = false; G.mode = 'menu'; showMenu(mainMenu); msg(`Left ${g.hn}'s world — your progress there is saved.`, '#7fdbff'); } return r; }; }
// in someone else's world you can't copy your world profile into one of your own slots
{ const _sm = slotMenu; slotMenu = function (mode) { if (mode === 'save' && G.guest) { menuBox.innerHTML = ''; menuBox.append(h('h2', { text: 'Saving' }), h('div', { class: 'small', text: `In ${G.guest.hn}'s world your progress saves automatically — on this phone and with ${G.guest.hn}. Your own save slots aren't touched.` }), btn('Back', () => showMenu(pauseMenu), 'alt')); return; } return _sm.apply(this, arguments); }; }
// ---------- joining: guests load their world profile; hosts get a world id ----------
doJoin = async function (code, create) {
  code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (code.length !== 4) { Snd.play('bad'); return; }
  menuBox.querySelectorAll('button').forEach(b => b.disabled = true);
  const ok = await Net.join(code);
  if (!ok) { Snd.play('bad'); mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t join that room. Try again in a moment.' })); return; }
  if (create) { Net.worldHost = true; if (!G.inGame) startGame(true); else hideMenu(); worldReady(); msg(`Hosting your world in room ${code}. Share the code — guests' progress is kept in your save.`, '#7fdbff'); }
  else guestBegin('room ' + code); };
doJoinLan = async function (addr, hosting) {
  addr = cleanAddr(addr); if (!addr) { Snd.play('bad'); return; }
  menuBox.querySelectorAll('button').forEach(b => b.disabled = true);
  const ok = await Net.joinLan(addr, hosting);
  if (!ok) { Snd.play('bad'); if (hosting && typeof lanHostStop === 'function') lanHostStop(); mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t reach ' + addr + '. Check that the host has started the game and that you are both on the same Wi-Fi.' })); return; }
  store.set('gl_lanaddr', addr);
  if (hosting) { if (!G.inGame) startGame(true); else hideMenu(); worldReady(); msg('Hosting your world on LAN at ' + hosting + '. Guests\' progress is kept in your save.', '#7fdbff'); }
  else guestBegin(addr); };
function worldReady() { if (!G.save.wid) G.save.wid = 'w' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); if (!G.save.guests) G.save.guests = {}; doSave(true); }
// ---------- menus: choose which of your saves to host; see who has progress in your world ----------
{ const _mp = mpMenu; mpMenu = function () { _mp.apply(this, arguments); try {
  if (!Net.room && !G.inGame) { const L = []; for (let i = 1; i <= NSLOT; i++) { const sv = loadSlot(i); if (sv) L.push([i, 'Slot ' + i]); } if (!L.length) L.push([G.slot, 'New world']);
    if (!L.some(x => x[0] === G.slot)) { G.slot = L[0][0]; }
    const sv = loadSlot(G.slot), ng = sv && sv.guests ? Object.keys(sv.guests).length : 0, box = [h('div', { class: 'lbl', text: 'World you host' }), ...seg('', L, G.slot, v => { G.slot = v; store.set('gl_slot', v); mpMenu(); }).slice(1),
      h('div', { class: 'small', text: (sv ? slotLine(sv) : 'A brand-new world') + (ng ? ' · ' + ng + ' guest' + (ng > 1 ? 's have' : ' has') + ' progress here' : '') + '. When you host, friends join this world; when you join theirs, you play a separate profile in their world.' })];
    const anchor = menuBox.querySelector('.sw'); if (anchor) anchor.after(...box); }
  if (Net.room && (isWorldHost() || G.guest)) { const c = [h('div', { class: 'lbl', text: isWorldHost() ? 'Guests in your world' : 'This world' })];
    if (isWorldHost()) { const gs = Object.values(G.save.guests || {}).sort((a, b) => b.t - a.t); if (!gs.length) c.push(h('div', { class: 'small', text: 'Nobody has played here yet. Guests\' progress will be kept in this save.' }));
      for (const g of gs.slice(0, 12)) { const on = [...Net.peers.values()].some(e => e.s && e.s.n === g.n); c.push(h('div', { class: 'small', text: `${g.n} · ${on ? 'here now' : 'last here ' + new Date(g.t).toLocaleDateString()} · ${money((g.sv.cash || 0) + (g.sv.bank || 0))}` })); } }
    else c.push(h('div', { class: 'small', text: G.guest.nohost ? 'Your progress in this game is saved on this device.' : `You're a guest in ${G.guest.hn}'s world. Your progress saves with them and on this phone; your own saves are untouched.` }));
    const back = [...menuBox.querySelectorAll('button')].find(b => /Back to game/.test(b.textContent)); if (back) back.before(...c); else menuBox.append(...c); } } catch (e) { console.error('world menu', e); } }; }
