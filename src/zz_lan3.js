// ================= LAN on Android: host from a phone, and find games on your Wi-Fi automatically =================
// window.AndroidNet (the app's socket bridge) only moves bytes: listen/accept/read/write/close for TCP, and
// open/send/recv for UDP. Everything else is here: a WebSocket server speaking the same protocol as
// lan/lan-server.js (so every client — phones and the downloaded file on a computer — joins the same way),
// and a broadcast beacon so phones on the same Wi-Fi see each other's games without typing addresses.
const LAN_UDP = 47771, LAN_NONCE = Math.random().toString(36).slice(2, 10);
const lanBcastOn = () => !G.settings || G.settings.lanBcast !== 0;
// ---------- bytes ----------
const utf8b = s => { const u = new TextEncoder().encode(s); let o = ''; for (let i = 0; i < u.length; i += 4096) o += String.fromCharCode.apply(null, u.subarray(i, i + 4096)); return o; };
const butf8 = b => { const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i) & 255; return new TextDecoder().decode(u); };
function sha1b64(str) { // str: latin-1 bytes; returns base64 of SHA-1
  const m = []; for (let i = 0; i < str.length; i++) m[i >> 2] |= (str.charCodeAt(i) & 255) << (24 - (i & 3) * 8);
  const l = str.length * 8; m[l >> 5] |= 0x80 << (24 - l % 32); m[(((l + 64) >> 9) << 4) + 15] = l;
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476, e = 0xc3d2e1f0; const w = new Array(80);
  for (let i = 0; i < m.length; i += 16) { let A = a, B = b, C = c, D = d, E = e;
    for (let j = 0; j < 80; j++) { w[j] = j < 16 ? (m[i + j] | 0) : ((x => (x << 1) | (x >>> 31))(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16]));
      const f = j < 20 ? (B & C) | (~B & D) : j < 40 ? B ^ C ^ D : j < 60 ? (B & C) | (B & D) | (C & D) : B ^ C ^ D, k = j < 20 ? 0x5a827999 : j < 40 ? 0x6ed9eba1 : j < 60 ? 0x8f1bbcdc : 0xca62c1d6;
      const t = (((A << 5) | (A >>> 27)) + f + E + k + w[j]) | 0; E = D; D = C; C = (B << 30) | (B >>> 2); B = A; A = t; }
    a = (a + A) | 0; b = (b + B) | 0; c = (c + C) | 0; d = (d + D) | 0; e = (e + E) | 0; }
  let raw = ''; for (const x of [a, b, c, d, e]) raw += String.fromCharCode((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255); return btoa(raw); }
const wsFrame = (text, op) => { const p = utf8b(text), n = p.length; op = op || 1;
  const h = n < 126 ? String.fromCharCode(0x80 | op, n) : n < 65536 ? String.fromCharCode(0x80 | op, 126, n >> 8, n & 255) : String.fromCharCode(0x80 | op, 127, 0, 0, 0, 0, (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255); return h + p; };
const ipStr = n => n ? [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255].join('.') : '';
// ---------- the host ----------
const LH = { on: false, port: 0, ip: '', conns: new Map(), nextId: 1, timer: null, beaconT: 0 };
function lanSend(c, data) { if (!AndroidNet.write(c.id, data)) lanDrop(c); }
function lanDrop(c) { if (!LH.conns.has(c.id)) return; LH.conns.delete(c.id); try { AndroidNet.close(c.id); } catch (e) { } if (c.ws) { const m = wsFrame(`{"f":${c.pid},"x":1}`); for (const o of LH.conns.values()) if (o.ws) lanSend(o, m); } }
function lanServe(c) {
  if (!c.ws) { const e = c.buf.indexOf('\r\n\r\n'); if (e < 0) { if (c.buf.length > 16384) lanDrop(c); return; } const head = c.buf.slice(0, e), key = (head.match(/sec-websocket-key:\s*(\S+)/i) || [])[1]; c.buf = c.buf.slice(e + 4);
    if (!key) { lanSend(c, 'HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\n\r\n' + utf8b('<!doctype html><meta name=viewport content="width=device-width"><body style="font:16px sans-serif;padding:24px;background:#111;color:#eee"><h2>Gridlock LAN game</h2><p>Open the Gridlock app (or the downloaded game file) and go to <b>Multiplayer → LAN</b>. This game shows up there automatically, or type this address under <b>Join LAN</b>.</p>')); lanDrop(c); return; }
    lanSend(c, 'HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + sha1b64(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11') + '\r\n\r\n');
    c.ws = true; c.pid = LH.nextId++; lanSend(c, wsFrame(JSON.stringify({ t: 'hi', id: c.pid }))); }
  for (;;) { const B = c.buf; if (B.length < 2) return; const b0 = B.charCodeAt(0), b1 = B.charCodeAt(1), op = b0 & 15, masked = b1 & 128; let len = b1 & 127, off = 2;
    if (len === 126) { if (B.length < 4) return; len = (B.charCodeAt(2) << 8) | B.charCodeAt(3); off = 4; } else if (len === 127) { if (B.length < 10) return; len = (B.charCodeAt(6) << 24 >>> 0) + (B.charCodeAt(7) << 16) + (B.charCodeAt(8) << 8) + B.charCodeAt(9); off = 10; }
    if (len > 65536) return lanDrop(c); if (B.length < off + (masked ? 4 : 0) + len) return;
    const mk = masked ? [0, 1, 2, 3].map(i => B.charCodeAt(off + i)) : null; off += masked ? 4 : 0; let p = '';
    for (let i = 0; i < len; i++) p += String.fromCharCode(B.charCodeAt(off + i) ^ (mk ? mk[i & 3] : 0)); c.buf = B.slice(off + len);
    if (op === 8) return lanDrop(c); if (op === 9) { lanSend(c, String.fromCharCode(0x8a, Math.min(125, p.length)) + p.slice(0, 125)); continue; }
    if (op !== 1 || p.charCodeAt(0) !== 0x7b) continue; let txt; try { txt = butf8(p); JSON.parse(txt); } catch (e) { continue; }
    const out = wsFrame(`{"f":${c.pid},"m":${txt}}`); for (const o of LH.conns.values()) if (o !== c && o.ws) lanSend(o, out); } }
function lanTick() { if (!LH.on) return; let n = 0, id;
  while (n++ < 4 && (id = AndroidNet.accept()) >= 0) LH.conns.set(id, { id, buf: '', ws: false });
  for (const c of [...LH.conns.values()]) { let got = 0, r; while (got < 8 && (r = AndroidNet.read(c.id))) { c.buf += r; got++; } if (r === null || r === undefined) { lanDrop(c); continue; } if (got) lanServe(c); }
  if (lanBcastOn() && performance.now() - LH.beaconT > 2000) { LH.beaconT = performance.now(); lanBeacon(); } }
function lanBeacon() { if (!lanUdp()) return; const n = [...LH.conns.values()].filter(c => c.ws).length, msg = JSON.stringify({ gl: 1, v: 1, n: (Net.name || 'Player').slice(0, 16), p: LH.port, c: n, id: LAN_NONCE });
  AndroidNet.udpSend('255.255.255.255', LAN_UDP, msg); if (LH.ip) AndroidNet.udpSend(LH.ip.replace(/\.\d+$/, '.255'), LAN_UDP, msg); }
function lanHostStart() { if (!window.AndroidNet) return ''; if (LH.on) return (LH.ip || '127.0.0.1') + ':' + LH.port;
  let port = 0; for (const p of [8080, 8081, 8082, 8083, 8090]) if (AndroidNet.listen(p)) { port = p; break; } if (!port) return '';
  LH.on = true; LH.port = port; LH.conns.clear(); LH.nextId = 1; LH.ip = ipStr(AndroidNet.wifiIp()) || LD.selfIp || ''; LH.beaconT = 0; LH.timer = setInterval(() => { try { lanTick(); } catch (e) { console.error('lan host', e); } }, 25);
  return (LH.ip || '127.0.0.1') + ':' + port; }
function lanHostStop() { if (!LH.on) return; LH.on = false; clearInterval(LH.timer); for (const c of [...LH.conns.values()]) lanDrop(c); try { AndroidNet.stop(); } catch (e) { } }
// ---------- discovery ----------
const LD = { open: false, hosts: new Map(), timer: null, selfIp: '', el: null };
function lanUdp() { if (LD.open) return true; if (!window.AndroidNet) return false; try { LD.open = !!AndroidNet.udpOpen(LAN_UDP); } catch (e) { LD.open = false; } if (LD.open && !LD.timer) LD.timer = setInterval(lanListen, 300); return LD.open; }
function lanListen() { let r, n = 0; while (n++ < 20 && (r = AndroidNet.udpRecv())) { const k = r.indexOf('|'); if (k < 0) continue; const ip = r.slice(0, k); let m; try { m = JSON.parse(r.slice(k + 1)); } catch (e) { continue; }
    if (!m || m.gl !== 1 || !(m.p > 0 && m.p < 65536)) continue; if (m.id === LAN_NONCE) { if (!LD.selfIp && !/^127\./.test(ip)) { LD.selfIp = ip; if (LH.on && !LH.ip) LH.ip = ip; } continue; }
    LD.hosts.set(ip + ':' + (m.p | 0), { addr: ip + ':' + (m.p | 0), n: String(m.n || 'Player').slice(0, 16), c: Math.max(0, m.c | 0), seen: performance.now() }); }
  for (const [k, h] of LD.hosts) if (performance.now() - h.seen > 7000) LD.hosts.delete(k); lanRenderNearby(); }
function lanRenderNearby() { const el = LD.el; if (!el || !el.isConnected) return; const L = [...LD.hosts.values()].sort((a, b) => a.n.localeCompare(b.n)), key = L.map(h => h.addr + h.n + h.c).join();
  if (el._k === key) return; el._k = key; el.innerHTML = '';
  if (!L.length) { el.append(h('div', { class: 'small', text: 'Looking for games on your Wi-Fi…' })); return; }
  for (const g of L) { const row = h('div', { class: 'game' }, [h('span', {}, [h('b', { text: g.n + '’s game' }), h('span', { class: 'small', text: `  ${Math.max(1, g.c)} player${g.c > 1 ? 's' : ''} · ${g.addr}` })])]); const jb = h('button', { class: 'btn grn', style: 'width:auto;margin:0;padding:8px 14px' }); jb.textContent = 'Join'; jb.onclick = () => doJoinLan(g.addr); row.append(jb); el.append(row); } }
// ---------- menu ----------
lanSection = function () {
  const out = [h('div', { class: 'lbl', text: 'LAN — same Wi-Fi, no internet needed' })];
  if (!lanOK()) { out.push(h('div', { class: 'small', text: 'LAN play works in the Android app and in the downloaded game file. This online page can only use room codes.' })); return out; }
  if (window.AndroidNet) {
    out.push(btn('Host a LAN game', () => { const a = lanHostStart(); if (!a) { Snd.play('bad'); mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t start hosting. Connect to Wi-Fi (or turn on your hotspot) and try again.' })); return; } doJoinLan('127.0.0.1:' + LH.port, a); }, 'grn', lanBcastOn() ? 'this phone hosts · shown to everyone on your Wi-Fi' : 'this phone hosts · not broadcast (see Settings)'));
    out.push(h('div', { class: 'lbl', text: 'Games nearby' })); LD.el = h('div', { class: 'games' }); LD.el._k = null; out.push(LD.el);
    if (!lanUdp()) LD.el.append(h('div', { class: 'small', text: 'Couldn\'t listen for games on this network. You can still type an address below.' })); else lanRenderNearby(); }
  if (location.protocol === 'http:' && location.host) out.push(btn('Join this host\'s game', () => doJoinLan(location.host), 'grn', location.host));
  const inp = h('input', { type: 'text', maxlength: '40', placeholder: '192.168.1.20:8080', inputmode: 'url' }); inp.value = store.get('gl_lanaddr', '') || '';
  out.push(h('div', { class: 'row' }, [inp, btn('Join LAN', () => doJoinLan(inp.value))]));
  out.push(h('div', { class: 'small', html: window.AndroidNet ? 'Games hosted on your Wi-Fi appear above by themselves. You can also type the host’s address. Hosting from a computer: run <b>node lan-server.js</b> next to the game file.' : 'Type the address the host shows. To host from a computer, run <b>node lan-server.js</b> next to gridlock.html, or host from the Android app.' }));
  return out; };
{ const _l = Net.leave; Net.leave = async function () { if (this.lanHost) lanHostStop(); return _l.apply(this, arguments); }; }
