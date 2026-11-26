// Stand-in for the Android Lan bridge: same calls, same return conventions, real TCP sockets, simulated Wi-Fi broadcast.
const http = require('http'), net = require('net');
const dev = new Map(); // who -> {srv, pending[], cons[], udp:bool, inbox[]}
const D = w => { if (!dev.has(w)) dev.set(w, { srv: null, pending: [], cons: [], udp: false, inbox: [] }); return dev.get(w); };
const api = {
  listen(d, [port]) { if (d.srv) return 0; let ok = 1; const s = net.createServer(sock => { sock.setNoDelay(true); const c = { sock, buf: [], closed: false }; sock.on('data', b => c.buf.push(b)); sock.on('close', () => c.closed = true); sock.on('error', () => c.closed = true); d.pending.push(c); });
    try { s.listen(port, '0.0.0.0'); } catch (e) { return 0; } d.srv = s; return new Promise(r => { s.once('listening', () => r(1)); s.once('error', () => { d.srv = null; r(0); }); }); },
  accept(d) { const c = d.pending.shift(); if (!c) return -1; d.cons.push(c); return d.cons.length - 1; },
  read(d, [id]) { const c = d.cons[id]; if (!c) return null; if (c.buf.length) { const b = Buffer.concat(c.buf.splice(0)); return b.toString('latin1'); } return c.closed ? null : ''; },
  write(d, [id, s]) { const c = d.cons[id]; if (!c || c.closed) return 0; c.sock.write(Buffer.from(s, 'latin1')); return 1; },
  close(d, [id]) { const c = d.cons[id]; if (c) { d.cons[id] = null; c.sock.destroy(); } },
  stop(d) { if (d.srv) { d.srv.close(); d.srv = null; } },
  udpOpen(d) { d.udp = true; return 1; },
  udpSend(d, [host, port, msg]) { if (!d.udp) return 0; for (const o of dev.values()) if (o.udp) o.inbox.push('127.0.0.1|' + msg); return 1; },
  udpRecv(d) { return d.inbox.shift() || ''; },
  udpClose(d) { d.udp = false; },
  wifiIp() { return 0; },
};
http.createServer((req, res) => { let body = ''; req.on('data', x => body += x); req.on('end', async () => {
  res.setHeader('Access-Control-Allow-Origin', '*'); if (req.method !== 'POST') return res.end('ok');
  const { w, m, a } = JSON.parse(body); let r; try { r = await api[m](D(w), a || []); } catch (e) { r = null; } res.end(JSON.stringify({ r: r === undefined ? null : r })); }); }).listen(9911, '127.0.0.1');
