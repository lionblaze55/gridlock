(() => {
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
      name, presence: async patch => { mine = Object.assign({}, mine, patch); for (const k in mine) if (mine[k] === null) delete mine[k]; JSON.stringify(mine).length > 4096 && console.error('presence too big', JSON.stringify(mine).length); set(myPeer, mine); bc.postMessage({ t: 'pres', k: myPeer, p: mine }); },
      onPeers: f => { listeners.push(f); setTimeout(fire, 5); return () => { }; }, peers: snap, connected: () => true, onConnection: f => { setTimeout(() => f(true), 5); return () => { }; },
      emit: async (topic, data) => bc.postMessage({ t: 'ev', topic, data, k: myPeer }), on: (topic, f) => { (evL[topic] = evL[topic] || []).push(f); return () => { }; },
      leave: async () => { bc.postMessage({ t: 'bye', k: myPeer }); bc.close(); },
    };
  }
  const lobby = makeRoom('lobby'); lobby.join = async n => makeRoom(n);
  window.claude = { use: async n => n === 'room' ? lobby : null };
})();
