// ================= SHARED CITY: one street population for everyone in a game =================
// One player (the world host, else whoever joined first, among players who are outdoors) is the "city authority":
// only it spawns ambient traffic, parked cars and pedestrians — around every player, not just itself.
// Anyone may own entities (their own cops, squads, mission people, cars they took). Each client simulates what it owns
// and streams it to the others, who see interpolated copies ("puppets"). Hits on a puppet are sent to its owner.
const SH = { pup: new Map(), info: new Map(), byId: new Map(), sent: new Map(), exq: [], hq: new Map(), cq: new Map(), need: new Map(), iqWant: new Set(), rx: new Map(), px: new Map(), pin: new Map(),
  nid: 1, seq: 0, frame: 0, nShare: 0, auth: false, inSince: 0, released: 0, dirty: 0, cap: null, nsBud: 8, coll: 0, dieOK: 0, owT: 0, owS: '', owgT: 0, owgS: '', tickT: 0, aiT: 0, me: null, active: 0 };
const SH_R = 1500, SH_KEEP = 1750;
const shNow = () => performance.now();
SH.live = () => !!(Net.room && SH.nShare > 0);
const shKey = (o, i) => o + ':' + i;
// players who take part (this version or newer), seen recently, and actually in the game
function shPeers() { const out = [], now = shNow(); for (const e of Net.peers.values()) { const s = e.s; if (s && s.sh && s.pl && now - e.seen < 5000) out.push(e); } return out; }
function shOutEff(e) { const s = e.s; if (s.in === -1) return true; const r = SH.pin.get(e.peer); return !!(r && r.leftT && shNow() - r.leftT < 800); }
const shMyOut = () => G.mode === 'play' && G.inGame && (!G.scene || shNow() - SH.inSince < 800);
const shMyPos = () => { const c = pCar(), p = G.player; return c ? [c.x, c.y] : [p.x, p.y]; };
const shCmp = (a, b) => { for (let i = 0; i < a.length; i++) { if (a[i] < b[i]) return -1; if (a[i] > b[i]) return 1; } return 0; };
// who spawns the ambient city right now
function shCalcAuth() { let best = null, bk = null; const me = SH.me || Net.me || '~';
  const take = (id, wh, jt) => { const k = [wh ? 0 : 1, jt || 0, id]; if (!bk || shCmp(k, bk) < 0) { bk = k; best = id; } };
  if (shMyOut()) take(me, isWorldHost(), Net.jt);
  for (const e of shPeers()) if (shOutEff(e)) take(e.peer, e.s.wh, e.s.jt);
  return best === me; }
// whose clock and weather everyone follows (outdoors or not)
function shMaster() { let best = null, bk = [isWorldHost() ? 0 : 1, Net.jt || 0, SH.me || Net.me || '~'];
  for (const e of shPeers()) { const k = [e.s.wh ? 0 : 1, e.s.jt || 0, e.peer]; if (shCmp(k, bk) < 0) { bk = k; best = e; } } return best; }
// remote players standing outdoors: [x, y, peer]
function shRemoteFoci() { const out = []; for (const e of shPeers()) if (e.s.in === -1) out.push([e.s.x, e.s.y, e.peer]); return out; }
function shFoci() { const F = shRemoteFoci(); if (!G.scene) { const [x, y] = shMyPos(); F.push([x, y, null]); } return F; }
const shMinD2 = (F, x, y) => { let m = Infinity; for (const f of F) { const d = (f[0] - x) ** 2 + (f[1] - y) ** 2; if (d < m) m = d; } return m; };
// a stand-in for a remote player that this client's NPCs can flee from, chase and fight
function shProx(peer) { let p = SH.px.get(peer); if (!p) { p = { isProxy: 1, peer, x: 0, y: 0, dead: 0, name: 'Player', r: 9, hurtT: 0, hurt(n, by, kind) { if (G.t - this.hurtT < .3) return; this.hurtT = G.t; Net.emitEv('ph', { to: this.peer, n: Math.round(Math.min(40, n)), kd: String(kind || 'punch').slice(0, 8), i: (by && by.sid) || 0 }); } }; SH.px.set(peer, p); }
  const e = Net.peers.get(peer); if (e && e.s) { p.x = e.ent.x; p.y = e.ent.y; p.dead = e.s.dead || e.s.in !== -1 ? 1 : 0; p.name = e.name; } else p.dead = 1; return p; }
// ---------- encoding what we own ----------
function shSid(o) { if (!o.sid) { o.sid = SH.nid++; SH.byId.set(o.sid, o); } return o.sid; }
const shPF = p => (p.dead ? 1 : 0) | (p.ko ? 2 : 0) | (p.state === 'fight' ? 4 : 0) | (p.sit ? 8 : 0) | (p.lie ? 16 : 0) | (p.burn > 0 ? 32 : 0) | (p.state === 'flee' ? 64 : 0);
const shCF = c => (c.dead ? 1 : 0) | (c.fireT > 0 ? 2 : 0) | (c.siren > 0 ? 4 : 0) | (c.brake ? 8 : 0) | (c.driver ? 16 : 0);
const shNT = c => !!(c.missionCar || (c.owned && c.legit) || c.isRide || c.persist || c.convoy);
function shPInfo(p) { return ['p', p.sid, String(p.role || 'civ').slice(0, 10), p.gang || 0, p.skin || 0, p.shirt || 0, p.pants || 0, p.hair || 0, p.hat || 0, p.hatCol || 0, p.jk || 0, p.hs | 0, p.shoe || 0, p.weapon | 0, String(p.name || '').slice(0, 24), Math.round(p.vp || 120), (p.swat ? 1 : 0) | (p.sparkle ? 2 : 0) | (p.shades ? 4 : 0) | (p.hood ? 8 : 0)]; }
function shCInfo(c) { const d = c.driver && c.driver !== G.player ? [c.driver.gang || 0, c.driver.role || 0, c.driver.skin || 0, c.driver.shirt || 0] : 0;
  return ['c', c.sid, c.type, String(c.color || '#888'), (typeof encMods === 'function' && encMods(c.mods)) || 0, (shNT(c) ? 1 : 0) | (c.ai && c.ai.mode === 'traffic' ? 2 : 0) | (c.ai && c.ai.mode === 'parked' ? 4 : 0), d]; }
const shPS = p => [p.sid, Math.round(p.x), Math.round(p.y), Math.round(p.a * 100), shPF(p)];
const shCS = c => { const st = [c.sid, Math.round(c.x), Math.round(c.y), Math.round(c.a * 100), shCF(c), Math.round(clamp(c.hp / ((c.st && c.st.hp) || c.d.hp || 100), 0, 1) * 20)]; if (c.alt > 0) st.push(Math.round(c.alt * 100)); return st; };
// gangs that would attack me on sight — other players' gang members use this to pick fights with me
function shHostileGangs() { if (G.t < (G.safeT || 0) || !G.player || G.scene) return ''; const [x, y] = shMyPos(), out = [];
  for (const g in GANGS) if ((G.gangAggro[g] || 0) > 0 || ((G.rep || {})[g] <= -30 && !nearSafe(x, y))) out.push(g); return out.join(','); }
function shOwnList() { if (G.t - SH.owT < 2) return SH.owS; SH.owT = G.t; try { SH.owS = Object.keys(LIFE().own || {}).join(',').slice(0, 700); } catch (e) { SH.owS = ''; } return SH.owS; }
// the host also speaks for guests who aren't here: their property stays theirs while they're away
function shGuestOwn() { if (!isWorldHost() || !G.save || !G.save.guests) return ''; if (G.t - SH.owgT < 5) return SH.owgS; SH.owgT = G.t;
  const here = new Set(shPeers().map(e => e.s.pid)), parts = [];
  for (const pid in G.save.guests) { if (here.has(pid)) continue; const gu = G.save.guests[pid]; let sv = gu && gu.sv; try { if (typeof sv === 'string') sv = JSON.parse(sv); } catch (e) { sv = null; }
    const own = sv && sv.life && sv.life.own ? Object.keys(sv.life.own) : []; if (own.length) parts.push(String(gu.n || 'Guest').replace(/[:;,]/g, '').slice(0, 16) + ':' + own.join(',')); }
  SH.owgS = parts.join(';').slice(0, 600); return SH.owgS; }
// ---------- what we put in our presence ----------
function shOut(pres) { const s = pres.s; pres.ep = pres.ec = pres.ei = pres.ex = pres.eq = null; if (!s) return;
  s.sh = 1; s.pl = G.mode === 'play' && G.inGame ? 1 : 0; delete s.hg; delete s.ow; delete s.owg; delete s.iq; delete s.wr;
  if (!s.pl) return;
  { const hg = shHostileGangs(); if (hg) s.hg = hg; const ow = shOwnList(); if (ow) s.ow = ow; const og = shGuestOwn(); if (og) s.owg = og; }
  if (!shMaster()) s.wr = [Math.round(G.weather.rain * 100), Math.round(G.weather.target * 100)];
  // ask owners for looks we're missing
  for (const [o, set] of SH.need) { if (!set.size) { SH.need.delete(o); continue; } s.iq = [o, ...[...set].slice(0, 24)]; set.clear(); break; }
  // hits on other players' entities → their owners
  for (const [o, l] of SH.hq) { Net.emitEv('eh', { o, l: l.slice(0, 30) }); } SH.hq.clear();
  for (const [o, l] of SH.cq) { Net.emitEv('ec', { o, l: l.slice(0, 30) }); } SH.cq.clear();
  pres.ev = Net.ring.slice(pres.x ? -12 : -16);
  const F = shRemoteFoci(), now = shNow(); SH.frame++;
  const cand = [];
  for (const c of G.cars) { if (c.pup || c.remote) continue; c._shM = SH.frame; if (c === pCar() || !F.length || !CAR_TYPES[c.type]) continue; const d2 = shMinD2(F, c.x, c.y); if (d2 < SH_R * SH_R) cand.push([c, d2, 1]); }
  for (const p of G.peds) { if (p.pup || p.isPlayer) continue; p._shM = SH.frame; if (!F.length || p.inside) continue; const d2 = shMinD2(F, p.x, p.y); if (d2 < SH_R * SH_R) cand.push([p, d2, 0]); }
  // what we used to send that is gone now
  for (const [sid, o] of SH.sent) { if (o._shM !== SH.frame || o === pCar() || o.pup) { SH.exq.push([sid, now]); SH.sent.delete(sid); SH.byId.delete(sid); } else if (now - (o._shT || 0) > 12000) SH.sent.delete(sid); }
  SH.exq = SH.exq.filter(x => now - x[1] < 2000); if (SH.exq.length > 60) SH.exq.splice(0, SH.exq.length - 60);
  if (!F.length) { if (SH.exq.length) { pres.ex = SH.exq.map(x => x[0]); pres.eq = ++SH.seq; } return; }
  for (const k of cand) { const o = k[0], car = k[2], f = car ? shCF(o) : shPF(o), sp = car ? Math.hypot(o.vx, o.vy) : Math.hypot(o.mvx || 0, o.mvy || 0), age = now - (o._shT || 0), mov = sp > 4 || f !== o._shF;
    k[3] = !o._shT ? 1e7 - k[1] / 1e3 : age * (mov ? 1 : age > 1500 ? 4 : .12) * (k[1] < 700 * 700 ? 1.6 : 1); k[4] = f; }
  cand.sort((a, b) => b[3] - a[3]);
  const base = new TextEncoder().encode(JSON.stringify(pres)).length; let room = 3880 - base - 90; if (room < 160) return;
  const ep = [], ec = [], ei = []; let infoB = 0; const infoCap = room * .45;
  for (const k of cand) { const o = k[0], car = k[2]; shSid(o); const sid = o.sid;
    let inf = null; const ist = JSON.stringify(car ? shCInfo(o) : shPInfo(o)), changed = ist !== o._shIh;
    if (changed || (o._shIC || 0) < 3 || now - (o._shIT || 0) > 5000 || SH.iqWant.has(sid)) inf = ist;
    if (inf && infoB + inf.length + 1 > infoCap) { if (!o._shIC) continue; inf = null; }
    const st = car ? shCS(o) : shPS(o), sl = JSON.stringify(st).length + 1 + (inf ? inf.length + 1 : 0); if (sl > room) break;
    room -= sl; (car ? ec : ep).push(st); o._shT = now; o._shF = k[4]; SH.sent.set(sid, o);
    if (inf) { ei.push(JSON.parse(inf)); infoB += inf.length + 1; o._shIh = ist; o._shIT = now; o._shIC = (o._shIC || 0) + 1; SH.iqWant.delete(sid); } }
  pres.ep = ep.length ? ep : null; pres.ec = ec.length ? ec : null; pres.ei = ei.length ? ei : null; pres.ex = SH.exq.length ? SH.exq.map(x => x[0]) : null; pres.eq = ++SH.seq;
  shFit(pres); }
// never let a presence go over the room's 4 KiB
function shFit(pres) { const sz = () => new TextEncoder().encode(JSON.stringify(pres)).length; let n = 0;
  while (sz() > 4000 && n++ < 40) { if (pres.ei && pres.ei.length) pres.ei.pop(); else if (pres.ep && pres.ep.length) pres.ep.pop(); else if (pres.ec && pres.ec.length) pres.ec.pop(); else if (pres.ex && pres.ex.length) pres.ex = null; else if (pres.ev && pres.ev.length > 6) pres.ev = pres.ev.slice(-6); else break; } }
{ const _x = netXtra; netXtra = function (pres) { const r = _x(pres); try { shOut(pres); } catch (e) { console.error('shOut', e); pres.ep = pres.ec = pres.ei = pres.ex = null; } return r; }; }
// ---------- what others send us ----------
function shCheckInfo(inf) { return Array.isArray(inf) && (inf[0] === 'p' || inf[0] === 'c') && typeof inf[1] === 'number'; }
function shApplyLook(p, inf) { const [, , role, gang, skin, shirt, pants, hair, hat, hatCol, jk, hs, shoe, weapon, name, vp, fl] = inf;
  Object.assign(p, { role: role || 'civ', gang: gang && GANGS[gang] ? gang : null, skin: skin || p.skin, shirt: shirt || p.shirt, pants: pants || p.pants, hair: hair || p.hair, hat: hat || 0, hatCol: hatCol || null, jk: jk || null, hs: hs | 0, shoe: shoe || p.shoe, weapon: WEAPONS[weapon] ? weapon : 0, name: String(name || p.name), vp: +vp || 120, swat: fl & 1 ? 1 : 0, sparkle: fl & 2 ? 1 : 0, shades: fl & 4 ? 1 : 0, hood: fl & 8 ? 1 : 0 }); }
function shMkPup(o, st, inf) { const key = shKey(o, st[0]), a = (st[3] || 0) / 100; let e;
  if (inf[0] === 'p') { e = new Ped(st[1], st[2], { role: inf[2] === 'cop' ? 'cop' : 'civ', gang: inf[3] && GANGS[inf[3]] ? inf[3] : null }); shApplyLook(e, inf); e.a = a; e.facArmed = 1; e.state = 'walk'; G.peds.push(e); }
  else { if (!CAR_TYPES[inf[2]]) return null; e = new Car(inf[2], st[1], st[2], a, inf[3]); if (inf[4] && typeof decMods === 'function') try { applyMods(e, decMods(inf[4])); } catch (er) { } e.ai = null; e.pdrv = inf[6] ? { gang: inf[6][0] || undefined, role: inf[6][1] || 'civ', skin: inf[6][2] || pick(SKIN), shirt: inf[6][3] || pick(SHIRT), name: randName() } : null; if (e.pdrv && !e.pdrv.gang) delete e.pdrv.gang; G.cars.push(e); }
  e.pup = { o, i: st[0], sn: [], lt: shNow(), f: 0, nt: inf[0] === 'c' && !!(inf[5] & 1), tr: inf[0] === 'c' && !!(inf[5] & 2), pk: inf[0] === 'c' && !!(inf[5] & 4) };
  SH.pup.set(key, e); return e; }
function shState(o, st, car) { if (!Array.isArray(st) || st.length < 5) return; for (let i = 0; i < 5; i++) if (typeof st[i] !== 'number') return;
  const key = shKey(o, st[0]); let e = SH.pup.get(key);
  if (!e) { if (G.scene || G.mode !== 'play') return; const [mx, my] = shMyPos(); if ((st[1] - mx) ** 2 + (st[2] - my) ** 2 > 1650 * 1650) return; if (st[4] & 1) return;
    const inf = SH.info.get(key); if (!inf || (inf[0] === 'c') !== car) { let s = SH.need.get(o); if (!s) SH.need.set(o, s = new Set()); s.add(st[0]); return; }
    e = shMkPup(o, st, inf); if (!e) return; e.x = st[1]; e.y = st[2]; }
  const P = e.pup, now = shNow(); P.lt = now; P.sn.push([now, st[1], st[2], st[3] / 100]); if (P.sn.length > 8) P.sn.shift();
  const f = st[4]; P.f = f;
  if (car) { if (f & 1 && !e.dead) shPupCarDie(e); e.siren = f & 4 ? 1 : (e.d.siren ? 0 : -1); e.brake = f & 8 ? 1 : 0; if (!e.dead) e.driver = f & 16 ? (e.driver || e.pdrv || { role: 'civ', skin: pick(SKIN), shirt: pick(SHIRT) }) : null; e.fireT = f & 2 ? Math.max(e.fireT || 0, .5) : 0;
    if (typeof st[5] === 'number') e.hp = Math.max(e.dead ? 0 : 1, st[5] / 20 * ((e.st && e.st.hp) || e.d.hp)); e.alt = typeof st[6] === 'number' ? st[6] / 100 : 0; }
  else { if (f & 1) { if (!e.dead) shPupDie(e); return; }
    if (f & 2) { e.ko = G.t + 30; e.still = 1; } else if (e.ko) { e.ko = 0; e.still = 0; }
    e.state = f & 4 ? 'fight' : f & 64 ? 'flee' : 'walk'; e.target = null; e.sit = f & 8 ? 1 : 0; e.lie = f & 16 ? 1 : 0; e.burn = f & 32 ? 1 : 0; } }
function shRecv(peer, pr) { if (!Net.room || !pr || !pr.s || !pr.s.sh) return; const R = SH.rx.get(peer) || {}; SH.rx.set(peer, R);
  if (Array.isArray(pr.s.iq) && pr.s.iq[0] === SH.me) for (const sid of pr.s.iq.slice(1, 30)) if (typeof sid === 'number') SH.iqWant.add(sid);
  if (typeof pr.eq !== 'number' || pr.eq === R.eq) return; R.eq = pr.eq;
  if (Array.isArray(pr.ei)) for (const inf of pr.ei.slice(0, 80)) { if (!shCheckInfo(inf)) continue; const key = shKey(peer, inf[1]); SH.info.set(key, inf); const e = SH.pup.get(key); if (e && inf[0] === 'p' && e instanceof Ped) shApplyLook(e, inf); }
  if (SH.info.size > 900) { let n = SH.info.size - 700; for (const k of SH.info.keys()) { if (n-- <= 0) break; if (!SH.pup.has(k)) SH.info.delete(k); } }
  if (Array.isArray(pr.ev)) for (const ev of pr.ev) if (ev && ev.k === 'rl' && ev.to === SH.me && Array.isArray(ev.l)) for (const sid of ev.l.slice(0, 60)) { const p = SH.pup.get(shKey(peer, sid)); if (p) shAdopt(p); }
  if (Array.isArray(pr.ex)) for (const sid of pr.ex.slice(0, 80)) { const e = SH.pup.get(shKey(peer, sid)); if (e) shKill(e); }
  if (Array.isArray(pr.ep)) for (const st of pr.ep.slice(0, 120)) shState(peer, st, false);
  if (Array.isArray(pr.ec)) for (const st of pr.ec.slice(0, 120)) shState(peer, st, true); }
function shKill(e) { if (e.pup) SH.pup.delete(shKey(e.pup.o, e.pup.i)); e._shK = 1; SH.dirty = 1; if (e.spot) { e.spot.car = null; e.spot = null; } }
// ours now: the entity keeps going under our own AI
function shAdopt(e) { const P = e.pup; if (!P) return; SH.pup.delete(shKey(P.o, P.i)); e.pup = null; e.sid = 0; e._shT = 0; e._shIC = 0;
  if (e instanceof Ped) { e.state = e.dead ? 'dead' : 'walk'; e.target = null; e.timer = 0; e.sit = 0; e.lie = 0; if (e.ko) e.ko = G.t + 15; }
  else { if (!e.dead && e.driver) { const dir = ((Math.round(e.a / (Math.PI / 2)) % 4) + 4) % 4; try { makeTrafficAI(e, dir, 0); e.ai.cruise = Math.max(160, Math.hypot(e.vx, e.vy)); } catch (er) { e.ai = { mode: 'parked' }; } }
    else if (!e.dead) { e.ai = { mode: 'parked' }; e.driver = null; if (!P.pk) e.abandoned = G.t; } } }
function shOwnerGone(peer) { const F = shFoci(); for (const e of [...SH.pup.values()]) { if (e.pup.o !== peer) continue;
    let best = null, bd = Infinity; for (const f of F) { if (f[2] === peer) continue; const d = (f[0] - e.x) ** 2 + (f[1] - e.y) ** 2; if (d < bd) { bd = d; best = f; } }
    if (best && best[2] === null) shAdopt(e); else shKill(e); }
  SH.rx.delete(peer); SH.pin.delete(peer); SH.px.delete(peer); }
function shAdoptAll() { for (const e of [...SH.pup.values()]) shAdopt(e); SH.need.clear(); SH.rx.clear(); }
{ const _r = netXrecv; netXrecv = function (ch) { try { for (const p of ch.peers) if (p.sameTab) SH.me = p.peer; for (const p of ch.peers) if (!p.sameTab) shRecv(p.peer, p.presence); for (const p of ch.left || []) shOwnerGone(p.peer); } catch (e) { console.error('shRecv', e); } return _r(ch); }; }
// ---------- how puppets move: smoothly along what their owner reported ----------
function shInterp(P, now) { const sn = P.sn; if (!sn.length) return null; const rt = now - 200, b = sn[sn.length - 1];
  if (rt >= b[0]) { if (sn.length >= 2) { const p = sn[sn.length - 2], dv = b[0] - p[0]; if (dv > 0 && dv < 700 && Math.abs(b[1] - p[1]) < 300 && Math.abs(b[2] - p[2]) < 300) { const k = Math.min(rt - b[0], 250) / dv; return [b[1] + (b[1] - p[1]) * k, b[2] + (b[2] - p[2]) * k, b[3] + angDiff(p[3], b[3]) * Math.min(k, 1)]; } } return [b[1], b[2], b[3]]; }
  let a = sn[0], c = b; for (let i = sn.length - 1; i > 0; i--) if (sn[i - 1][0] <= rt) { a = sn[i - 1]; c = sn[i]; break; }
  if (rt <= a[0]) return [a[1], a[2], a[3]]; if (Math.abs(c[1] - a[1]) > 300 || Math.abs(c[2] - a[2]) > 300) return [c[1], c[2], c[3]];
  const f = (rt - a[0]) / ((c[0] - a[0]) || 1); return [lerp(a[1], c[1], f), lerp(a[2], c[2], f), a[3] + angDiff(a[3], c[3]) * f]; }
function shPupCar(c, dt) { const r = shInterp(c.pup, shNow()); if (r) { const ox = c.x, oy = c.y, oa = c.a; c.x = r[0]; c.y = r[1]; c.a = r[2];
    if (dt > 0) { const k = Math.min(1, dt * 12); c.vx = lerp(c.vx, (c.x - ox) / dt, k); c.vy = lerp(c.vy, (c.y - oy) / dt, k); c.av = lerp(c.av || 0, angDiff(oa, c.a) / dt, k); } }
  c.steer = clamp((c.av || 0) * .8, -1, 1); c.throttle = c.brake ? 0 : c.spd > 15 ? .5 : 0;
  if (c.fireT > 0 && Math.random() < dt * 20) spawnFx('fire', c.x + rnd(-c.L / 3, c.L / 3), c.y + rnd(-8, 8)); }
function shPupPed(p, dt) { p.kx = p.ky = 0; if (p.sayT > 0) p.sayT -= dt; if (p.flash > 0) p.flash -= dt;
  const r = shInterp(p.pup, shNow()); if (r) { const ox = p.x, oy = p.y; p.x = r[0]; p.y = r[1]; p.a = r[2]; if (dt > 0) { const k = Math.min(1, dt * 12); p.mvx = lerp(p.mvx, (p.x - ox) / dt, k); p.mvy = lerp(p.mvy, (p.y - oy) / dt, k); } }
  const sp = Math.hypot(p.mvx, p.mvy); p.phase += sp * dt * .11; p.moving = sp > 5; p.spd = sp;
  if (p.burn && Math.random() < dt * 12) spawnFx('fire', p.x + rnd(-5, 5), p.y + rnd(-5, 5)); }
{ const _u = updateCar; updateCar = function (c, dt) { if (c.pup) return shPupCar(c, dt); return _u.apply(this, arguments); }; }
{ const _m = updatePedMove; updatePedMove = function (p, dt) { if (p.pup && !p.dead) return shPupPed(p, dt); return _m.apply(this, arguments); }; }
{ const _a = updatePedAI; updatePedAI = function (p, dt) { if (p.pup) return; return _a.apply(this, arguments); }; }
{ const _a = updateCarAI; updateCarAI = function (c, dt) { if (c.pup) return; return _a.apply(this, arguments); }; }
{ const _c = carCarCollide; carCarCollide = function (a, b) { if (a.pup && b.pup) return; SH.coll = 1; try { return _c.apply(this, arguments); } finally { SH.coll = 0; } }; }
{ const _f = facArm; facArm = function (q) { if (q.pup) return; return _f.apply(this, arguments); }; }
// ---------- damage: hits on puppets go to their owner; replays never double-count ----------
function shFwd(e, n, kind, by) { const P = e.pup; if (by === G.player || (by && by === pCar())) { P.hb = G.t; P.hk = kind; } const Q = e instanceof Car ? SH.cq : SH.hq;
  let l = Q.get(P.o); if (!l) Q.set(P.o, l = []); const k = String(kind || 'gun').slice(0, 8), hit = l.find(x => x[0] === P.i && x[2] === k); if (hit) hit[1] = Math.round(hit[1] + n); else l.push([P.i, Math.round(n * 10) / 10, k]); }
{ const _h = Ped.prototype.hurt; SH.h0 = _h;
  Ped.prototype.hurt = function (n, by, kind) {
    if (this.isPlayer || !SH.live()) return _h.apply(this, arguments);
    if (kind === 'car') { if (this.pup) { if (!this.dead) addDecal('blood', this.x, this.y); return; } if (by && by.isRemote) by = shProx(by.peer); return _h.call(this, n, by, kind); }
    if (G._netReplay || (by && by.isRemote)) return;
    if (this.pup) { if (this.dead) return; const hp0 = this.hp; this.hp = 1e9; try { _h.call(this, n, by, kind); } finally { this.hp = hp0; } shFwd(this, n, kind, by); return; }
    return _h.apply(this, arguments); }; }
{ const _d = Ped.prototype.die;
  Ped.prototype.die = function (by, kind) {
    if (this.pup && !SH.dieOK) { if (!this.dead && SH.live() && !G._netReplay) shFwd(this, 9999, kind || 'gun', by); return; }
    if (!this.pup && by && (by.isProxy || by.isRemote)) { const n0 = G.drops.length; try { return _d.apply(this, arguments); } finally { G.drops.length = Math.min(G.drops.length, n0); } }
    return _d.apply(this, arguments); }; }
{ const _cd = Car.prototype.damage; SH.cd0 = _cd;
  Car.prototype.damage = function (n, by) {
    if (!SH.live() || this === pCar()) return _cd.apply(this, arguments);
    if (SH.coll) { if (this.pup) return; return _cd.apply(this, arguments); }
    if (G._netReplay || (by && by.isRemote)) return;
    if (this.pup) { if (!this.dead && n > 0) shFwd(this, n, 'hit', by); return; }
    return _cd.apply(this, arguments); }; }
{ const _x = explosion; explosion = function (x, y, r, by, net) { if (SH.live() && by && by.isRemote && !G._netReplay) { G._netReplay = 1; try { return _x.apply(this, arguments); } finally { G._netReplay = 0; } } return _x.apply(this, arguments); }; }
// a puppet died at its owner's: play it out here; whoever landed the last hit gets the credit (and the drops)
function shPupDie(p) { const mine = p.pup.hb && G.t - p.pup.hb < 3, n0 = G.drops.length; SH.dieOK = 1; try { p.die(mine ? G.player : null, p.pup.hk || 'gun'); } catch (e) { p.dead = 1; p.state = 'dead'; p.deadT = 0; } finally { SH.dieOK = 0; }
  if (!mine) G.drops.length = Math.min(G.drops.length, n0); }
function shPupCarDie(c) { const mine = c.pup.hb && G.t - c.pup.hb < 4; c.dead = 1; c.hp = 0; c.deadT = 0; c.fireT = 0; c.throttle = 0; c.driver = null;
  if (c.d.pedal) return; if (mine) { addCash(100, 1); crime(.3); if (G.mission && G.mission.onWreck) try { G.mission.onWreck(c); } catch (e) { } }
  G._netReplay = 1; try { explosion(c.x, c.y, 120, mine ? G.player : null); } finally { G._netReplay = 0; } }
// NPC gunfire near other players is replayed on their screens, where it can hit them
{ const _f = fireHitscan; fireHitscan = function (sh, x, y, a) { if (SH.cap) SH.cap.push([x, y, a]); return _f.apply(this, arguments); }; }
{ const _n = npcShoot; npcShoot = function (p, a) {
    if (!SH.live() || p.pup || G.scene || SH.nsBud <= 0 || !shRemoteFoci().some(f => (f[0] - p.x) ** 2 + (f[1] - p.y) ** 2 < 950 * 950)) return _n.apply(this, arguments);
    SH.cap = []; try { return _n.apply(this, arguments); } finally { const c = SH.cap; SH.cap = null; if (c.length) { SH.nsBud--; Net.emitEv('ns', { i: p.sid || 0, x: Math.round(c[0][0]), y: Math.round(c[0][1]), w: p.weapon | 0, as: c.slice(0, 8).map(v => Math.round(v[2] * 1000) / 1000) }); } } }; }
// ---------- taking someone else's car, knocking out someone else's pedestrian, hacking someone else's things ----------
{ const _e = enterCar; enterCar = function (c) { if (c && c.pup) { if (c.pup.nt) { const e = Net.peers.get(c.pup.o); toast('🔒 That belongs to ' + (e ? e.name : 'another player')); return; } const o = c.pup.o, i = c.pup.i; shAdopt(c); Net.emitEv('et', { o, i }); } return _e.apply(this, arguments); }; }
{ const _t = takedownNow; takedownNow = function () { const q = takedownTarget(), r = _t.apply(this, arguments); if (q && q.pup && q.ko) Net.emitEv('ek', { o: q.pup.o, i: q.pup.i, d: Math.round(q.ko - G.t) }); return r; }; }
const SH_ENV = { lamp: 1, blackout: 1, burst: 1, steam: 1, green: 1, red: 1 }, SH_ENT = { stall: 1, swerve: 1, ring: 1, alarm: 1 };
{ const _k = hkDone; hkDone = function (U) { const o = U && U.tgt && U.tgt.o, id = U && U.id; const r = _k.apply(this, arguments);
    try { if (SH.live() && o) { if (o.pup && SH_ENT[id]) Net.emitEv('eq', { o: o.pup.o, i: o.pup.i, h: id, d: o.hkDir || 1 }); else if (SH_ENV[id]) Net.emitEv('hk', { h: id, x: Math.round(o.x || 0), y: Math.round(o.y || 0), gi: o.i | 0, gj: o.j | 0 }); } } catch (e) { } return r; }; }
// ---------- events from other players ----------
const SHX = {
  eh(e, ev) { if (ev.o !== SH.me || !Array.isArray(ev.l)) return; const by = shProx(e.peer);
    for (const h of ev.l.slice(0, 30)) { if (!Array.isArray(h)) continue; const p = SH.byId.get(h[0]), n = +h[1]; if (!(p instanceof Ped) || p.dead || p.pup || !(n > 0)) continue; SH.h0.call(p, Math.min(n, 9999), by, typeof h[2] === 'string' ? h[2] : 'gun'); } },
  ec(e, ev) { if (ev.o !== SH.me || !Array.isArray(ev.l)) return; const by = shProx(e.peer);
    for (const h of ev.l.slice(0, 30)) { if (!Array.isArray(h)) continue; const c = SH.byId.get(h[0]), n = +h[1]; if (!(c instanceof Car) || c.dead || c.pup || c === pCar() || !(n > 0)) continue; SH.cd0.call(c, Math.min(n, 5000), by); } },
  et(e, ev) { if (ev.o !== SH.me) return; const c = SH.byId.get(ev.i); if (!(c instanceof Car) || c === pCar() || c.pup || shNT(c)) return; if (c.spot) { c.spot.car = null; c.spot = null; } c.driver = null; G.cars = G.cars.filter(x => x !== c); },
  rl(e, ev) { if (ev.to !== SH.me || !Array.isArray(ev.l)) return; for (const sid of ev.l.slice(0, 60)) { const p = SH.pup.get(shKey(e.peer, sid)); if (p) shAdopt(p); } },
  ek(e, ev) { if (ev.o !== SH.me) return; const q = SH.byId.get(ev.i); if (!(q instanceof Ped) || q.dead || q.pup) return; q.ko = G.t + clamp(+ev.d || 60, 5, 90); q.state = 'idle'; q.still = 1; q.target = null; q.mvx = q.mvy = 0; },
  eq(e, ev) { if (ev.o !== SH.me) return; const o = SH.byId.get(ev.i); if (!o || o.dead || o.pup) return;
    if (ev.h === 'stall') o.hkStall = G.t + (typeof isCopCar === 'function' && isCopCar(o) ? 4 : 6); else if (ev.h === 'swerve') { o.hkSwerve = G.t + .9; o.hkDir = ev.d < 0 ? -1 : 1; }
    else if (ev.h === 'ring') { o.distT = G.t + 7; if (o.state !== 'fight') o.state = 'idle'; o.timer = 4; o.sus = 0; }
    else if (ev.h === 'alarm') { o.alarmT = 10; for (const q of G.peds) if (!q.dead && !q.pup && dist2(q.x, q.y, o.x, o.y) < 380 * 380) { q.distT = G.t + 8; q.a = Math.atan2(o.y - q.y, o.x - q.x); q.sus = 0; } } },
  hk(e, ev) { const x = +ev.x || 0, y = +ev.y || 0, h = ev.h; if (!SH_ENV[h]) return;
    if (h === 'lamp' || h === 'blackout') { for (const p of propsNear(x, y, h === 'lamp' ? 170 : 1200)) if (p.t === 'lamp') p.hackOff = G.t + (h === 'lamp' ? 60 : 120); if (h === 'blackout') lightHackArea({ x, y }, 1200, 'red', 20); }
    else if (h === 'green' || h === 'red') { G.lhk = G.lhk || {}; G.lhk[(ev.gi | 0) + ',' + (ev.gj | 0)] = { m: h, until: G.t + (h === 'green' ? 9 : 14) }; }
    else if (h === 'burst') { const hy = propsNear(x, y, 14).find(p => p.t === 'hydrant'); if (hy) { hy.spray = 10; hy.down = 0; } }
    else if (h === 'steam' && !G.scene) { G._netReplay = 1; try { steamBlast({ x, y }); } finally { G._netReplay = 0; } } },
  ns(e, ev) { if (G.scene || G.mode !== 'play' || !Array.isArray(ev.as)) return; const w = WEAPONS[ev.w | 0]; if (!w || w.melee) return; const x = +ev.x || 0, y = +ev.y || 0, pl = G.player;
    if (!pl || (pl.x - x) ** 2 + (pl.y - y) ** 2 > 1300 * 1300) return; const sh = SH.pup.get(shKey(e.peer, ev.i)) || { x, y, ghost: 1 };
    G._netReplay = 1; try { for (const a of ev.as.slice(0, 8)) if (typeof a === 'number') fireHitscan(sh, x, y, a, w, false, false); } finally { G._netReplay = 0; }
    Snd.play(w.sound, x, y, .8); spawnFx('flash', x, y, ev.as[0] || 0); if (sh instanceof Ped) { sh.recoil = .08; sh.a = ev.as[0] || sh.a; } G.lastShot = { x, y, t: G.t }; },
  ph(e, ev) { if (ev.to !== SH.me || G.scene || G.mode !== 'play') return; const pl = G.player; if (!pl || pl.dead) return; const by = SH.pup.get(shKey(e.peer, ev.i)) || null; hurtPlayer(clamp(+ev.n || 0, 0, 40), by, typeof ev.kd === 'string' ? ev.kd : 'punch'); } };
{ const _he = Net.handleEv; Net.handleEv = function (e, ev) {
    if (ev && SHX[ev.k]) { try { SHX[ev.k](e, ev); } catch (er) { console.error('shEv', ev.k, er); } return; }
    if (ev && SH.live() && (ev.k === 's' || ev.k === 'x')) { G._netReplay = 1; try { return _he.call(this, e, ev); } finally { G._netReplay = 0; } }
    return _he.call(this, e, ev); }; }
// more room in the event ring: hits and NPC gunfire now travel too
Net.emitEv = function (k, d) { if (!this.room) return; const now = Date.now(); this.ring.push(Object.assign({ i: ++this.seq, k, t: now }, d)); while (this.ring.length > 24 || (this.ring.length && now - this.ring[0].t > 1800)) this.ring.shift(); };
// ---------- the city: the authority spawns around everyone; everyone keeps what's near anyone ----------
function shCull(F) { const fr = r => (x, y) => shMinD2(F, x, y) > r * r;
  G.cars = G.cars.filter(c => { if (c.pup) return true; if (c === pCar() || c.missionCar) return true; if (c.gone) return false; if (c.owned && c.legit && !c.dead) return true; const far = fr(700);
    if (c.abandoned && !inView(c.x, c.y, 60) && G.t - c.abandoned > 4 && far(c.x, c.y)) return false; if (c.dead && c.deadT > 40 && !inView(c.x, c.y, 50) && far(c.x, c.y)) return false;
    if (shMinD2(F, c.x, c.y) > 1900 * 1900 && !inView(c.x, c.y, 100)) { if (c.spot) c.spot.car = null; return false; } return true; });
  G.peds = G.peds.filter(p => { if (p.pup || p.persist) return true; if (p.dead && p.deadT > 30 && !inView(p.x, p.y, 40) && fr(600)(p.x, p.y)) return false; return shMinD2(F, p.x, p.y) < 1700 * 1700 || inView(p.x, p.y, 60); }); }
function shSpawnAt(fx, fy, F) { const hi = G.settings.quality === 'high', popK = G.settings.pop === undefined ? 1 : .25 + G.settings.pop * 1.5;
  const want = Math.round((hi ? 15 : 10) * popK), wantP = Math.round((hi ? 26 : 16) * popK), clear = (x, y, r) => shMinD2(F, x, y) > r * r && !inView(x, y, 80);
  const nAI = G.cars.filter(c => !c.dead && (c.pup ? c.pup.tr : c.ai && c.ai.mode === 'traffic') && (c.x - fx) ** 2 + (c.y - fy) ** 2 < 1300 * 1300).length;
  if (nAI < want) for (let tries = 0; tries < 4; tries++) {
    const ang = rnd(0, TAU), r = rnd(700, 1150), x = fx + Math.cos(ang) * r, y = fy + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (!inMap(tx, ty) || !clear(x, y, 640) || inBase(x, y)) continue;
    const vc = isRoadCol(tx), hr = isRoadRow(ty); if (vc === hr) continue; if (tileAt(tx, ty) !== TILE.ROAD) continue;
    let dir, lane = Math.random() < .5 ? 0 : 1, cx, cy;
    if (vc) { const i = Math.round((tx - 2) / RSP); dir = Math.random() < .5 ? 1 : 3; const o = laneOff(lane); cx = roadCX(i) + (dir === 1 ? -o : o); cy = y; }
    else { const j = Math.round((ty - 2) / RSP); dir = Math.random() < .5 ? 0 : 2; const o = laneOff(lane); cy = roadCY(j) + (dir === 0 ? o : -o); cx = x; }
    if (G.cars.some(c => dist2(c.x, c.y, cx, cy) < 110 * 110)) continue;
    let type = Math.random() < .03 + stars() * .008 ? 'cop' : pick(TRAFFIC_MIX);
    const dn0 = districtAt(cx, cy), rur0 = RURALSET.has(dn0); let gdrv = null;
    if (type !== 'cop') { if (rur0) type = pick(RTRAFFIC); if ((rur0 || DISTRICTS[dn0].gang === 'reapers') && Math.random() < .13 * gangK()) { type = 'bike'; gdrv = 'reapers'; } }
    const c = new Car(type, cx, cy, dir * Math.PI / 2); c.driver = gdrv ? { gang: gdrv } : { role: type === 'cop' ? 'cop' : 'civ', name: randName(), skin: pick(SKIN), shirt: pick(SHIRT) };
    const dg = DISTRICTS[districtAt(cx, cy)].gang; if (dg && type !== 'cop' && !gdrv && Math.random() < .2 * gangK()) { c.driver = { gang: dg }; c.color = GANGS[dg].col; }
    if (!(c.driver && c.driver.gang && c.type === 'bike')) streetMods(c, dn0);
    makeTrafficAI(c, dir, lane); const f = c.ai.cruise * .7; c.vx = Math.cos(c.a) * f; c.vy = Math.sin(c.a) * f; G.cars.push(c); break; }
  for (const s of W.parkSpots) { if (s.car || dist2(s.x, s.y, fx, fy) > 1000 * 1000 || !clear(s.x, s.y, 560) || Math.random() > .3) continue; if (G.cars.some(c => dist2(c.x, c.y, s.x, s.y) < 60 * 60)) continue;
    const c = new Car(s.type || pick(PARK_MIX), s.x, s.y, s.a); c.ai = { mode: 'parked' }; c.spot = s; s.car = c; if (!s.type) streetMods(c, districtAt(s.x, s.y)); G.cars.push(c); }
  const nP = G.peds.filter(p => !p.dead && !p.persist && (p.x - fx) ** 2 + (p.y - fy) ** 2 < 1100 * 1100).length;
  if (nP < wantP) for (let tries = 0; tries < 5; tries++) {
    const ang = rnd(0, TAU), r = rnd(520, 950), x = fx + Math.cos(ang) * r, y = fy + Math.sin(ang) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
    if (tileAt(tx, ty) !== TILE.WALK || !clear(x, y, 500)) continue;
    const dname = districtAt(x, y), g = DISTRICTS[dname].gang;
    const o = Math.random() < .022 ? { role: 'cop' } : g && Math.random() < (DISTRICTS[dname].gd || .4) * gangK() ? { gang: g } : {};
    G.peds.push(new Ped((tx + .5) * T + rnd(-14, 14), (ty + .5) * T + rnd(-14, 14), o)); break; } }
{ const _sc = spawnCity; spawnCity = function (dt) { if (!SH.live()) return _sc.apply(this, arguments);
    G.spawnT -= dt; if (G.spawnT > 0) return; G.spawnT = .3; const F = shFoci(); shCull(F);
    const [fx, fy] = shMyPos(); if (SH.auth) for (const f of F) shSpawnAt(f[0], f[1], F); else shTrim(fx, fy);
    policeResponse(fx, fy); }; }
// joining someone's city: thin out our own leftover crowd as theirs fills in, so the streets aren't doubled
function shTrim(fx, fy) { const hi = G.settings.quality === 'high', popK = G.settings.pop === undefined ? 1 : .25 + G.settings.pop * 1.5, near = (o, r) => (o.x - fx) ** 2 + (o.y - fy) ** 2 < r * r;
  const tr = G.cars.filter(c => !c.dead && (c.pup ? c.pup.tr : c.ai && c.ai.mode === 'traffic') && near(c, 1300));
  if (tr.length > Math.round((hi ? 15 : 10) * popK) + 3) { const c = tr.find(c => !c.pup && !shNT(c) && c !== pCar() && c.type !== 'cop' && !inView(c.x, c.y, 80)); if (c) { c._shK = 1; SH.dirty = 1; } }
  const pd = G.peds.filter(p => !p.dead && !p.persist && near(p, 1100));
  if (pd.length > Math.round((hi ? 26 : 16) * popK) + 4) { const p = pd.find(p => !p.pup && p.state !== 'fight' && p.role !== 'cop' && !inView(p.x, p.y, 40)); if (p) { p._shK = 1; SH.dirty = 1; } } }
// heading indoors with others still outside: hand what's near them to them, so their streets don't freeze
function shRelease() { const F = shRemoteFoci(); if (!F.length) return; const give = new Map();
  const pick1 = (o) => { let best = null, bd = SH_R * SH_R; for (const f of F) { const d = (f[0] - o.x) ** 2 + (f[1] - o.y) ** 2; if (d < bd) { bd = d; best = f[2]; } } return best; };
  for (const c of G.cars) { if (c.pup || c === pCar() || shNT(c) || c.alt > 0 || !c.sid || !SH.sent.has(c.sid)) continue; const to = pick1(c); if (to) { (give.get(to) || give.set(to, []).get(to)).push(c); } }
  for (const p of G.peds) { if (p.pup || p.isPlayer || p.persist || p.inside || !p.sid || !SH.sent.has(p.sid)) continue; const to = pick1(p); if (to) { (give.get(to) || give.set(to, []).get(to)).push(p); } }
  for (const [to, L] of give) { for (let i = 0; i < L.length; i += 50) Net.emitEv('rl', { to, l: L.slice(i, i + 50).map(o => o.sid) }); for (const o of L) { SH.exq.push([o.sid, shNow()]); SH.sent.delete(o.sid); SH.byId.delete(o.sid); o._shK = 1; if (o.spot) { o.spot.car = null; o.spot = null; } } }
  if (give.size) SH.dirty = 1; }
// ---------- per-frame upkeep ----------
function shTick(dt) {
  if (!Net.room) { if (SH.active || SH.pup.size) { shAdoptAll(); SH.active = 0; SH.nShare = 0; SH.auth = false; } return; }
  SH.active = 1; const now = shNow(), P = shPeers(); const was = SH.nShare; SH.nShare = P.length;
  if (was && !SH.nShare) shAdoptAll();
  for (const e of P) { const r = SH.pin.get(e.peer) || { in: e.s.in, leftT: 0 }; if (r.in !== e.s.in) { if (r.in === -1) r.leftT = now; r.in = e.s.in; } SH.pin.set(e.peer, r); }
  if (G.scene) { if (!SH.inSince) SH.inSince = now; } else { SH.inSince = 0; SH.released = 0; }
  SH.nsBud = Math.min(8, SH.nsBud + dt * 8);
  if (!SH.live()) return;
  SH.auth = shCalcAuth();
  if (G.scene && !SH.released && now - SH.inSince > 800) { SH.released = 1; try { shRelease(); } catch (e) { console.error('shRelease', e); } }
  // follow the master's clock and weather
  const M = shMaster(); if (M && M.s) { const s = M.s; if (typeof s.tod === 'number' && isFinite(s.tod)) { const d = ((s.tod - G.tod + 36) % 24) - 12; if (Math.abs(d) > .08) G.tod = (s.tod + 24) % 24; else G.tod = (G.tod + d * Math.min(1, dt * 2) + 24) % 24; }
    if (Array.isArray(s.wr) && typeof s.wr[0] === 'number' && typeof s.wr[1] === 'number') { const w = G.weather; w.target = clamp(s.wr[1] / 100, 0, 1); w.t = Math.max(w.t || 0, 60); if (Math.abs(w.rain - s.wr[0] / 100) > .12) w.rain = clamp(s.wr[0] / 100, 0, 1); } }
  SH.tickT -= dt; if (SH.tickT <= 0) { SH.tickT = .25; const [mx, my] = shMyPos();
    for (const e of SH.pup.values()) { if (now - e.pup.lt > 4000 || (!G.scene && (e.x - mx) ** 2 + (e.y - my) ** 2 > SH_KEEP * SH_KEEP) || (!Net.peers.has(e.pup.o) && now - e.pup.lt > 1500)) shKill(e); }
    for (const p of SH.px.keys()) shProx(p); }
  // our gang members and cops pick fights with other players the way they would with us
  SH.aiT -= dt; if (SH.aiT <= 0) { SH.aiT = .3; for (const e of P) { const s = e.s; if (s.in !== -1 || s.dead) continue; const hg = typeof s.hg === 'string' && s.hg ? s.hg.split(',') : null, wanted = (s.st | 0) >= 2; if (!hg && !wanted) continue; let px = null;
      for (const q of G.peds) { if (q.pup || q.dead || q.ko || q.inside || q.state === 'fight' || q.isPlayer) continue; const d2 = (q.x - s.x) ** 2 + (q.y - s.y) ** 2; if (d2 > 380 * 380) continue;
        if ((q.gang && hg && hg.includes(q.gang)) || (wanted && q.role === 'cop' && d2 < 320 * 320)) { px = px || shProx(e.peer); q.state = 'fight'; q.target = px; q.timer = 20; } } } }
  if (SH.dirty) { SH.dirty = 0; G.peds = G.peds.filter(p => !p._shK); G.cars = G.cars.filter(c => !c._shK); } }
{ const _u = update; update = function (dt) { _u(dt); if (G.mode !== 'play' || !G.inGame) return; try { shTick(dt); } catch (e) { console.error('shTick', e); } }; }
// leaving: everything we were watching becomes ours, so the city carries on as it was
{ const _l = Net.leave; Net.leave = function () { try { shAdoptAll(); SH.nShare = 0; SH.auth = false; SH.active = 0; SH.sent.clear(); SH.byId.clear(); SH.exq = []; SH.px.clear(); SH.pin.clear(); } catch (e) { } return _l.apply(this, arguments); }; }
// ---------- property: one owner per building across everyone in the game (and the host's absent guests) ----------
function shPropOwner(id) { id = String(id); for (const e of shPeers()) { if (typeof e.s.ow === 'string' && e.s.ow.split(',').includes(id)) return e.name;
    if (typeof e.s.owg === 'string') for (const part of e.s.owg.split(';')) { const [n, l] = part.split(':'); if (l && l.split(',').includes(id)) return n + ' (away)'; } }
  if (isWorldHost()) { shGuestOwn(); for (const part of SH.owgS.split(';')) { const [n, l] = part.split(':'); if (l && l.split(',').includes(id)) return n + ' (away)'; } } return null; }
{ const _b = buyProperty; buyProperty = function (r) { if (Net.room && r && !LIFE().own[r.id]) { const who = shPropOwner(r.id); if (who) { toast(who + ' already owns this'); return false; } } return _b.apply(this, arguments); }; }
