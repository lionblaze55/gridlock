#!/usr/bin/env node
// Gridlock LAN host for computers. No dependencies.
//   node lan-server.js            (serves gridlock.html from this folder on port 8080)
// Then everyone on the same Wi-Fi opens  http://<this computer's IP>:8080
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto'), os = require('os');
const PORT = +process.argv[2] || 8080, FILE = ['gridlock.html', 'index.html'].map(f => path.join(__dirname, f)).find(f => fs.existsSync(f));
if (!FILE) { console.error('Put gridlock.html next to lan-server.js'); process.exit(1); }
const clients = new Map(); let nextId = 1;
const frame = (text, op = 1) => { const p = Buffer.from(text); const h = p.length < 126 ? Buffer.from([0x80 | op, p.length]) : Buffer.from([0x80 | op, 126, p.length >> 8, p.length & 255]); return Buffer.concat([h, p]); };
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url.startsWith('/index.html') || req.url.startsWith('/?')) { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(fs.readFileSync(FILE)); }
  else { res.writeHead(404); res.end('Not found'); }
});
server.on('upgrade', (req, sock) => {
  const key = req.headers['sec-websocket-key']; if (!key) return sock.destroy();
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64') + '\r\n\r\n');
  sock.setNoDelay(true); const id = nextId++; clients.set(id, sock); sock.write(frame(JSON.stringify({ t: 'hi', id })));
  let buf = Buffer.alloc(0);
  const bye = () => { if (!clients.delete(id)) return; for (const c of clients.values()) c.write(frame(`{"f":${id},"x":1}`)); console.log(`player ${id} left (${clients.size} connected)`); };
  console.log(`player ${id} joined (${clients.size} connected)`);
  sock.on('data', d => {
    buf = Buffer.concat([buf, d]);
    for (;;) {
      if (buf.length < 2) return; const op = buf[0] & 15, masked = buf[1] & 128; let len = buf[1] & 127, off = 2;
      if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; } else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
      if (len > 65536) return sock.destroy();
      if (buf.length < off + (masked ? 4 : 0) + len) return;
      const mask = masked ? buf.subarray(off, off + 4) : null; off += masked ? 4 : 0;
      const data = Buffer.from(buf.subarray(off, off + len)); if (mask) for (let i = 0; i < data.length; i++) data[i] ^= mask[i & 3];
      buf = buf.subarray(off + len);
      if (op === 8) return sock.end(); if (op === 9) { sock.write(frame(data, 10)); continue; }
      if (op !== 1 || data[0] !== 0x7b) continue;
      const msg = frame(`{"f":${id},"m":${data.toString()}}`); for (const [k, c] of clients) if (k !== id) c.write(msg);
    }
  });
  sock.on('close', bye); sock.on('error', bye);
});
// announce the game on the Wi-Fi so phones list it under "Games nearby" (turn off with --no-broadcast)
if (!process.argv.includes('--no-broadcast')) { const dgram = require('dgram'); const u = dgram.createSocket({ type: 'udp4', reuseAddr: true }); u.on('error', () => { });
  u.bind(() => { try { u.setBroadcast(true); } catch (e) { } setInterval(() => { const msg = Buffer.from(JSON.stringify({ gl: 1, v: 1, n: (os.hostname() || 'Computer').slice(0, 16), p: PORT, c: clients.size, id: 'node' }));
    const dests = new Set(['255.255.255.255']); for (const a of Object.values(os.networkInterfaces()).flat()) if (a && a.family === 'IPv4' && !a.internal) dests.add(a.address.replace(/\.\d+$/, '.255'));
    for (const d of dests) u.send(msg, 47771, d, () => { }); }, 2000); }); }
server.listen(PORT, () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter(a => a && a.family === 'IPv4' && !a.internal).map(a => a.address);
  console.log('Gridlock LAN game is running.\nOn this computer:   http://localhost:' + PORT + '\n' + ips.map(ip => 'On the same Wi-Fi:  http://' + ip + ':' + PORT).join('\n') + '\nIn the game: Multiplayer -> Join this host\'s game.  Ctrl+C to stop.');
});
