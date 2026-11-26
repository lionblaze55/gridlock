(() => {
  // strict validation, as the real room service does: plain JSON only, identifier keys, 4 KiB, depth 8
  const BAD = new Set(Object.getOwnPropertyNames(Object.prototype));
  const check = (v, d, path) => { if (d > 8) return path + ': too deep'; if (v === null || typeof v === 'string' || typeof v === 'boolean') return null;
    if (typeof v === 'number') return Number.isFinite(v) ? null : path + ': non-finite number ' + v; if (v === undefined) return path + ': undefined';
    if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const e = check(v[i], d + 1, path + '[' + i + ']'); if (e) return e; } return null; }
    if (typeof v === 'object') { if (Object.getPrototypeOf(v) !== Object.prototype && Object.getPrototypeOf(v) !== null) return path + ': not a plain object'; for (const k of Object.keys(v)) { if (!/^[A-Za-z_][A-Za-z0-9_-]*$/.test(k) || k.length > 64 || BAD.has(k)) return path + ': bad key ' + JSON.stringify(k); const e = check(v[k], d + 1, path + '.' + k); if (e) return e; } return null; }
    return path + ': exotic ' + typeof v; };
  window.__roomRejects = [];
  const vet = (what, obj) => { const e = check(obj, 0, what) || (new TextEncoder().encode(JSON.stringify(obj)).length > 4096 ? what + ': over 4 KiB' : null); if (e) { if (window.__roomRejects.length < 50) window.__roomRejects.push(e); return Promise.reject({ code: 'invalid_argument', message: e }); } return null; };
  const myPeer = 'p' + Math.random().toString(36).slice(2, 10);
  function makeRoom(name) {
    const bc = new BroadcastChannel('mock-' + name);
    const peers = new Map(); let mine = {}; const listeners = []; const evL = {};
    const snap = () => [...peers.entries()].map(([k, v]) => Object.freeze({ peer: k, by: null, isMe: k === myPeer, sameTab: k === myPeer, kind: 'viewer', guest: false, presence: v.p, updatedAt: v.t }));
    let pending = { joined: [], left: [], updated: [] }, sched = false;
    const fire = () => { sched = false; const s = snap(); const ch = { peers: s, joined: s.filter(p => pending.joined.includes(p.peer)), left: pending.left.map(k => ({ peer: k, presence: {} })), updated: s }; pending = { joined: [], left: [], updated: [] }; listeners.forEach(f => f(ch)); };
    const queue = () => { if (!sched) { sched = true; setTimeout(fire, 16); } };
    const set = (k, p) => { if (!peers.has(k)) pending.joined.push(k); peers.set(k, { p, t: Date.now() }); queue(); };
    bc.onmessage = e => { const m = e.data; if (m.t === 'pres') set(m.k, m.p); if (m.t === 'hello') { bc.postMessage({ t: 'pres', k: myPeer, p: mine }); } if (m.t === 'bye') { peers.delete(m.k); pending.left.push(m.k); queue(); } if (m.t === 'ev') (evL[m.topic] || []).forEach(f => f({ topic: m.topic, data: m.data, peer: m.k })); };
    set(myPeer, mine); bc.postMessage({ t: 'hello' }); bc.postMessage({ t: 'pres', k: myPeer, p: mine });
    return {
      name, presence: async patch => { const merged = Object.assign({}, mine, patch); for (const k in merged) if (merged[k] === null) delete merged[k]; const bad = vet('presence', merged); if (bad) return bad; mine = Object.assign({}, mine, patch); for (const k in mine) if (mine[k] === null) delete mine[k]; JSON.stringify(mine).length > 4096 && console.error('presence too big', JSON.stringify(mine).length); set(myPeer, mine); bc.postMessage({ t: 'pres', k: myPeer, p: mine }); },
      onPeers: f => { listeners.push(f); setTimeout(fire, 5); return () => { }; }, peers: snap, connected: () => true, onConnection: f => { setTimeout(() => f(true), 5); return () => { }; },
      emit: async (topic, data) => { const bad = vet('emit:' + topic, data === undefined ? null : data); if (bad) return bad; return bc.postMessage({ t: 'ev', topic, data, k: myPeer }); }, on: (topic, f) => { (evL[topic] = evL[topic] || []).push(f); return () => { }; },
      leave: async () => { bc.postMessage({ t: 'bye', k: myPeer }); bc.close(); },
    };
  }
  const lobby = makeRoom('lobby'); lobby.join = async n => makeRoom(n);
  window.claude = { use: async n => n === 'room' ? lobby : null };
})();
