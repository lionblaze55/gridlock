// ================= DESCRIPTIONS (inspect before buying) =================
const FLAVOR = {
  leaf: 'Mild and common. Low risk, low margin.', haze: 'Popular with the club crowd.', glint: 'Expensive stimulant. Downtown pays best.', ember: 'The top shelf. Big money, big trouble.',
  snack: 'A chocolate bar of uncertain age.', soda: 'Fizzy Cola. Now with 40% more fizz.', burger: 'Still warm. Mostly.', apple: 'Crisp, from the Golden Orchards.', fish: 'Caught fresh. Eat it or sell it.', bigfish: 'A monster. Pawn shops pay well for a trophy.',
  moonshine: 'Road Reaper home brew. Handle with care.', bandage: 'Stops the bleeding.', medkit: 'Everything short of a surgeon.', vest: 'Kevlar. Put it on before the shooting starts.', repairkit: 'Wrenches, tape and optimism.', rod: 'A decent spinning rod.',
  toolbox: 'Heavy, but someone will want it.', watch: 'Keeps time. Not yours.', goldwatch: 'Solid gold and very engraved.', ring: 'Someone is going to miss this.', necklace: 'Real pearls, probably.', phone: 'Locked, but parts are parts.',
  laptop: 'Covered in stickers.', camera: 'Still has someone\'s holiday on it.', tv: 'A big flat screen. Takes up most of a backpack.', stereo: 'Pulled from a dashboard.', guitar: 'Slightly out of tune.', painting: 'Abstract. Or upside down.',
  silverware: 'A full set, monogrammed.', console: 'Latest model, one controller.', cigars: 'A sealed box.', wine: 'A very good year.', antique: 'Fragile and extremely old.', goldbar: 'Stamped FIRST VARRO BANK.', diamond: 'Catches the light beautifully.', carparts: 'An alternator and assorted bits.', copper: 'Stripped wire and pipe.',
};
function itemInfo(id, long) {
  const it = ITEMS[id];
  const use = it.heal ? `Restores ${it.heal} health` + (it.drunk ? ' and gets you drunk' : '') : it.armor ? 'Gives full body armor when used' : it.repair ? 'Fully repairs the car you are in or standing next to' : id === 'rod' ? 'Lets you fish at lake piers' : it.k === 'drug' ? ({ leaf: 'Take it: mellow, slowly heals you, a little slower on your feet.', haze: 'Take it: hazy and woozy, you take 30% less damage.', glint: 'Take it: you run 30% faster — then a slow comedown.', ember: 'Take it: you take almost half damage and move faster — then it burns out hard.' }[id] || '') + ' Or sell to dealers. Too much at once can kill you.' : 'Sell at a pawn shop';
  return long ? [FLAVOR[id] || '', use + '.', `Worth ${money(it.v)} · weight ${it.w}`] : `${use} · ${money(it.v)} · w${it.w}`;
}
const WDESC = {
  bolt: 'A hunting rifle. One heavy, accurate round at a time — usually one is all it takes. Takes a suppressor and a scope.', sniper: 'Long-range bolt-action. Drops anyone in one shot from way off-screen. Takes a suppressor and a scope.', knife: 'Silent and fast. Much deadlier than your fists, and nobody hears a thing.',
  pistol: 'A reliable sidearm. Accurate and cheap to feed. Takes a suppressor.', uzi: 'Sprays bullets fast. Short range and a wide spread, but it empties a street.', shotgun: 'Seven pellets a shell. Devastating up close, useless far away.',
  molotov: 'A thrown firebomb. Leaves a burning pool that spreads to anyone who walks in.', rocket: 'Destroys vehicles outright. Slow to fire and you can be caught in the blast.', rifle: 'Fast, accurate and long-ranged. The best all-round gun in the city.', armor: 'Absorbs two thirds of bullet and impact damage until it runs out.',
};
const ADESC = {
  muz: ['Bare barrel.', 'Nearly silent: no witnesses panic and firing draws no police attention. Slightly less damage.', 'Vents gas upward to cut the spread by 30%.', 'Squeezes the pellet pattern by 40% and adds 15% range.'],
  mag: ['Factory magazine.', 'Half again as many rounds before reloading.', 'Two and a half times the rounds. Reloads 25% slower.'],
  sight: ['Plain iron sights.', 'A red laser beam shows exactly where you are aiming and cuts spread by 40%.', '35% more range and a tighter group.'],
  ammo: ['Full metal jacket.', '30% more damage to people, 30% less to vehicles.', 'More than double damage to vehicles — the cop-car killer.', 'Every hit sets the target on fire.'],
  trig: ['Factory trigger.', 'Fires 20% faster.'], head: ['High-explosive warhead.', '35% bigger blast radius.'], mix: ['Petrol and a rag.', 'A wider pool that burns almost twice as long.'],
  skin: ['Plain factory finish.', 'Non-reflective black.', 'Mirror-polished.', 'Plated in real gold. Subtle.', 'For the woods.', 'Impossible to miss.', 'Deep crimson.', 'Clean white.'],
};
const MODDESC = {
  p: 'Primary body color. A fresh color also makes the cops lose you.', s: 'Secondary color — used by liveries, the GT wing and color-matched rims.', liv: 'A paint scheme laid over your primary color.', rim: 'Wheel finish. You can see it on the wheels as you drive.',
  sp: 'Rear aero. Adds a little grip.', hd: 'Hood style.', sk: 'Wider arches and side skirts. Adds a little grip.', tint: 'Darker glass.', hl: 'Headlight color. Changes the color of your beams at night.', neon: 'A glow under the car that lights the road at night. Other players see it too.',
  eng: 'Each stage adds top speed and a lot of acceleration.', tur: 'A big acceleration boost, with a blow-off hiss when you lift off.', nos: 'Three shots of nitrous: 2.4 seconds of extra speed each. Recharges slowly, or refill here.', brk: 'Shorter stopping distances.', hnd: 'More grip and sharper steering.', arm: 'More body health, and bullets do less damage.',
};
function barsEl(base, prev) {
  const f = document.createDocumentFragment();
  base.forEach(([n, v], i) => { const pv = prev ? prev[i][1] : v, a = clamp(Math.min(v, pv), .02, 1), d = clamp(Math.max(v, pv), .02, 1) - a; const r = document.createElement('div'); r.className = 'gbar'; const l = document.createElement('span'); l.textContent = n; const bar = document.createElement('i'), b = document.createElement('b'); b.style.width = a * 100 + '%'; bar.appendChild(b); if (d > .004) { const u = document.createElement('u'); u.style.left = a * 100 + '%'; u.style.width = d * 100 + '%'; if (pv < v) u.className = 'dn'; bar.appendChild(u); } r.append(l, bar); f.appendChild(r); });
  return f;
}
function sliderEl(label, v, fn) { const w = document.createElement('div'); w.className = 'sld'; const l = document.createElement('span'); l.textContent = label; const i = document.createElement('input'); i.type = 'range'; i.min = 0; i.max = 100; i.value = Math.round(v * 100); const o = document.createElement('b'); o.textContent = i.value; i.oninput = () => { o.textContent = i.value; Snd.init(); fn(i.value / 100); }; w.append(l, i, o); return w; }
const saveSettings = () => store.set('gl_settings', G.settings);
const STBLURB = { funk: 'Slap bass and horns', synth: 'Neon arpeggios', punk: 'Three chords, very fast', lounge: 'Vibes and brushes', house: 'Four on the floor', rnb: 'Slow and smooth', oldies: 'Shuffle and sax', blues: 'Twelve bars of trouble', country: 'Twang for the open road', hiphop: 'Boom bap and bells', reggae: 'One drop, offbeat skank', chip: 'Bleeps from the arcade' };
function tune(i) { Radio.set(i); const c = pCar(); if (c) c.radio = i; G.settings.station = i; saveSettings(); G.radioName = STATIONS[i].name; G.radioT = 3; }

// ================= EXTRA PANEL MODES =================
const PMODES = {
  guns(H) {
    const p = H.p; H.title.textContent = 'Weapon workbench';
    const owned = []; for (let i = 1; i < WEAPONS.length; i++) if (p.ammo[i] > 0) owned.push(WEAPONS[i].id);
    if (!owned.length) { H.empty(H.col('No weapons'), 'Buy a gun first, then come back to customize it.'); return; }
    if (!owned.includes(this.tab)) this.tab = owned.includes(WEAPONS[p.weapon].id) ? WEAPONS[p.weapon].id : owned[0];
    for (const id of owned) H.tabBtn(id, WEAPONS[WI[id]].name);
    const id = this.tab, m = G.wmods[id] || {}, pv = this.pv && this.pv.id === id ? this.pv : null, pm = pv ? Object.assign({}, m, { [pv.s]: pv.i }) : m;
    const c = H.col(WEAPONS[WI[id]].name + (pv ? ' — preview' : '')); const cv2 = H.mk('canvas', 'pgun'); cv2.width = 360; cv2.height = 150; c.appendChild(cv2); drawGunPreview(cv2, id, pm);
    c.appendChild(barsEl(gunStats(id, m), gunStats(id, pm)));
    const info = H.mk('div', 'pinfo'); c.appendChild(info);
    if (pv) { const o = WSLOTS[pv.s].o[pv.i], own = pv.i === 0 || G.wown[id + pv.s + pv.i]; info.appendChild(H.mk('b', '', o[0].split(' —')[0])); info.appendChild(H.mk('span', '', ADESC[pv.s][pv.i])); info.appendChild(H.btn(own ? 'Fit it (owned)' : 'Buy & fit  ' + money(o[1]), () => { if (!own) { if (G.cash < o[1]) return Snd.play('bad'); G.cash -= o[1]; G.wown[id + pv.s + pv.i] = 1; Snd.play('cash'); } Snd.play(pv.s === 'skin' ? 'spray' : 'ratchet'); G.wmods[id] = Object.assign({}, G.wmods[id], { [pv.s]: pv.i }); PWC = {}; const wi = WI[id]; p.clip[wi] = Math.min(p.clip[wi], pw(wi).mag || 0); this.pv = null; }, 'y', !own && G.cash < o[1])); }
    else info.appendChild(H.mk('span', '', 'Tap any attachment to see it on the gun and how it changes the stats. Nothing is bought until you confirm.'));
    const c2 = H.col('Attachments — tap to preview');
    for (const s in WSLOTS) { const opts = WSLOTS[s].o.map((o, i) => [o, i]).filter(([o, i]) => i === 0 || o[2].includes(id)); if (opts.length < 2) continue; c2.appendChild(H.mk('div', 'ptitle', WSLOTS[s].n));
      for (const [o, i] of opts) { const on = (m[s] | 0) === i, own = i === 0 || G.wown[id + s + i], sel = pv && pv.s === s && pv.i === i; const b = H.mk('button', 'gopt' + (on ? ' on' : '') + (sel ? ' pv' : '')); b.appendChild(H.mk('span', '', (on ? '✓ ' : sel ? '👁 ' : '') + o[0].split(' —')[0])); b.appendChild(H.mk('small', '', on ? 'Fitted' : own ? 'Owned' : money(o[1]))); b.onclick = () => { Snd.play('ui'); this.pv = on ? null : { id, s, i }; this.render(); }; c2.appendChild(b); } }
  },
  gunshop(H) {
    const p = H.p; H.title.textContent = this.opt.name || 'Gun shop';
    const list = WEAPONS.slice(1).map(w => w.id).concat(['armor']); if (!list.includes(this.sel)) this.sel = this.opt.sel || 'pistol';
    const c = H.col('In stock — tap to inspect');
    for (const id of list) { const w = WEAPONS[WI[id]], own = w && p.ammo[WI[id]] > 0; const r = H.row(c, id === 'armor' ? '🦺' : '', w ? w.name : 'Body armor', w ? (own ? `Owned · ${p.ammo[WI[id]]} rounds · ammo ${money(w.ammoPrice)}` : money(w.price)) : money(500), []); if (w) r.querySelector('.pe').appendChild(this.icon(id, WI[id])); if (id === this.sel) r.classList.add('sel'); r.onclick = () => { Snd.play('ui'); this.sel = id; this.render(); }; }
    const id = this.sel, w = WEAPONS[WI[id]], c2 = H.col(w ? w.name : 'Body armor');
    if (w) { const cv2 = H.mk('canvas', 'pgun'); cv2.width = 360; cv2.height = 130; c2.appendChild(cv2); drawGunPreview(cv2, id, G.wmods[id]); }
    const info = H.mk('div', 'pinfo'); c2.appendChild(info); info.appendChild(H.mk('span', '', WDESC[id]));
    if (w) { const own = p.ammo[WI[id]] > 0; info.appendChild(H.mk('span', 'fact', `${w.melee ? 'Close range · silent' : ''}${w.mag ? 'Magazine ' + pw(WI[id]).mag + ' · reload ' + w.reload + 's · ' : ''}comes with ${w.ammo0} ${w.proj ? 'shots' : 'rounds'}`));
      if (w.melee && own) info.appendChild(H.mk('span', 'fact', 'You have one.')); else info.appendChild(H.btn(own ? `Buy ammo  +${w.ammo0}  ${money(w.ammoPrice)}` : `Buy  ${money(w.price)}`, () => { if (pay(own ? w.ammoPrice : w.price)) { giveWeapon(id); Snd.play('cock'); } }, 'y', G.cash < (own ? w.ammoPrice : w.price)));
      if (own && id !== 'molotov' && id !== 'knife') info.appendChild(H.btn('🔧 Customize at the workbench', () => { this.mode = 'guns'; this.tab = id; this.pv = null; })); }
    if (w) c2.appendChild(barsEl(gunStats(id)));
    if (!w) info.appendChild(H.btn(p.armor >= 100 ? 'Armor already full' : 'Buy  $500', () => { if (pay(500)) { p.armor = 100; Snd.play('armor'); } }, 'y', p.armor >= 100 || G.cash < 500));
  },
  pawn(H) {
    this.tab = this.tab || 'sell'; if (this.tab !== 'buy') return false;
    const p = H.p; H.title.textContent = this.opt.name || 'Pawn shop'; H.tabBtn('sell', 'Sell'); H.tabBtn('buy', 'Buy');
    const pack = G.save.pack || 0, E = [];
    if (pack < 30) E.push({ k: 'pack', e: '🎒', n: 'Backpack', price: 400, d: ['Canvas, lots of pockets.', 'Doubles what you can carry: 60 units instead of 30.'], buy: () => { G.save.pack = 30; } });
    else if (pack < 70) E.push({ k: 'duffel', e: '🧳', n: 'Duffel bag', price: 1200, d: ['The heist special.', 'Carry 100 units.'], buy: () => { G.save.pack = 70; } });
    for (const [id, price] of [['rod', 80], ['medkit', 70], ['bandage', 25], ['repairkit', 300], ['vest', 350]]) E.push({ k: id, e: ITEMS[id].e, n: ITEMS[id].n, price, d: itemInfo(id, 1), buy: () => { if (!invAdd(id, 1)) G.cash += price; } });
    for (const [id, am, price] of [['pistol', 24, 150], ['uzi', 60, 450], ['shotgun', 12, 700], ['rifle', 45, 1700]]) E.push({ k: 'g' + id, gun: id, n: 'Used ' + WEAPONS[WI[id]].name, price, d: [WDESC[id], `Second-hand, comes with ${am} rounds. New price ${money(WEAPONS[WI[id]].price)}.`], buy: () => { giveWeapon(id, am); Snd.play('cock'); } });
    if (!E.some(e => e.k === this.sel)) this.sel = E[0].k;
    const c = H.col('For sale — tap to inspect');
    for (const e of E) { const r = H.row(c, e.e || '', e.n, money(e.price), []); if (e.gun) r.querySelector('.pe').appendChild(this.icon(e.gun, 0)); if (e.k === this.sel) r.classList.add('sel'); r.onclick = () => { Snd.play('ui'); this.sel = e.k; this.render(); }; }
    const e = E.find(x => x.k === this.sel), c2 = H.col(e.n);
    if (e.gun) { const cv2 = H.mk('canvas', 'pgun'); cv2.width = 360; cv2.height = 130; c2.appendChild(cv2); drawGunPreview(cv2, e.gun, G.wmods[e.gun]); c2.appendChild(barsEl(gunStats(e.gun))); } else c2.appendChild(H.mk('div', 'pbig', e.e));
    const info = H.mk('div', 'pinfo'); c2.appendChild(info); for (const t of e.d) if (t) info.appendChild(H.mk('span', '', t));
    info.appendChild(H.btn('Buy  ' + money(e.price), () => { if (pay(e.price)) e.buy(); }, 'y', G.cash < e.price));
  },
  radio(H) {
    H.title.textContent = 'Radio'; const c = H.col('Stations'), car = pCar(), can = car || G.settings.walkman;
    if (!can) H.empty(c, 'Get in a car to listen — or turn on Headphones to keep the radio playing on foot.');
    STATIONS.forEach((s, i) => { const on = Radio.st === i; const r = H.row(c, i ? '📻' : '🔇', i ? s.name.replace(/\s+·\s+/, ' · ') : 'Radio off', i ? STBLURB[s.style] : '', [H.btn(on ? 'On air' : 'Tune', () => tune(i), on ? 'on' : 'y')]); if (on) r.classList.add('sel'); });
    const c2 = H.col('Sound');
    c2.appendChild(sliderEl('Music', Snd.mvol, v => Snd.setMVol(v))); c2.appendChild(sliderEl('Effects', Snd.vol / 1.2, v => Snd.setVol(v * 1.2))); c2.appendChild(sliderEl('Ambience', Snd.avol, v => Snd.setAVol(v)));
    const S = G.settings, tg = (label, key, def, sub) => H.row(c2, '', label, sub, [H.btn((S[key] === undefined ? def : S[key]) ? 'On' : 'Off', () => { S[key] = (S[key] === undefined ? def : S[key]) ? 0 : 1; saveSettings(); if (key === 'walkman' && !S.walkman && !pCar()) Radio.set(0); }, (S[key] === undefined ? def : S[key]) ? 'on' : '')]);
    tg('Headphones', 'walkman', 0, 'Keep the radio playing on foot'); tg('Keep my station', 'keepSt', 0, 'Every car you enter plays your station'); tg('Indoor music', 'mIndoor', 1, 'Clubs, bars, diners, arcade'); tg('Chase music', 'mChase', 1, 'On foot at 3+ stars'); tg('Title music', 'mTitle', 1, 'Main menu theme');
  },
};

// ================= SAVE SLOTS =================
const NSLOT = 6, slotKey = i => 'gl_save_' + i;
(function () { const old = store.get('gl_save', null); if (old && !store.get(slotKey(1), null)) { store.set(slotKey(1), old); store.set('gl_save', null); } })();
G.slot = clamp(store.get('gl_slot', 1) | 0, 1, NSLOT);
const loadSlot = i => store.get(slotKey(i), null);
function slotLine(sv) { if (!sv) return 'Empty'; const guns = (sv.ammo || []).filter(a => a > 0).length, when = sv.t ? new Date(sv.t).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; return `${money((sv.cash || 0) + (sv.bank || 0))} · ${guns} gun${guns === 1 ? '' : 's'}${sv.ride ? ' · ' + CAR_TYPES[sv.ride.type].name : ''}${when ? ' · ' + when : ''}`; }
function slotMenu(mode) { // mode: 'play' (title) or 'save' (pause: save into a slot)
  menuBox.innerHTML = ''; menuBox.append(h('h2', { text: mode === 'save' ? 'Save to a slot' : 'Choose a save slot' }));
  for (let i = 1; i <= NSLOT; i++) {
    const sv = loadSlot(i), cur = i === G.slot, row = h('div', { class: 'slot' + (cur ? ' cur' : '') });
    const info = h('div', { class: 'sinfo' }, [h('b', { text: 'Slot ' + i + (cur && G.inGame ? ' (playing)' : '') }), h('span', { text: slotLine(sv) })]); row.append(info);
    const bs = h('div', { class: 'sbtns' }); row.append(bs);
    const mini = (label, fn, cls) => { const b = h('button', { class: 'btn ' + (cls || ''), text: label }); b.onclick = () => { Snd.init(); Snd.play('ui'); fn(); }; bs.append(b); };
    if (mode === 'save') mini(G._ow === i ? 'Overwrite?' : cur ? 'Save' : 'Save here', () => { if (sv && !cur && G._ow !== i) { G._ow = i; return slotMenu(mode); } G._ow = 0; G.slot = i; store.set('gl_slot', i); doSave(); showMenu(pauseMenu); }, 'grn');
    else {
      mini(sv ? 'Play' : 'New game', () => { G.slot = i; store.set('gl_slot', i); G._del = 0; startGame(false); }, 'grn');
      if (sv) { mini('Copy', () => { for (let j = 1; j <= NSLOT; j++) if (!loadSlot(j)) { store.set(slotKey(j), sv); return slotMenu(mode); } Snd.play('bad'); }, 'alt'); mini(G._del === i ? 'Sure?' : 'Delete', () => { if (G._del !== i) { G._del = i; return slotMenu(mode); } G._del = 0; store.set(slotKey(i), null); slotMenu(mode); }, 'red'); }
    }
    menuBox.append(row);
  }
  menuBox.append(h('div', { class: 'small', text: mode === 'save' ? 'The game also saves by itself to the slot you are playing when you sleep, close a menu, or get released.' : 'Each slot keeps its own cash, weapons, backpack, home stash, car and gang standing.' }));
  menuBox.append(btn('Back', () => { G._ow = G._del = 0; showMenu(mode === 'save' ? pauseMenu : mainMenu); }, 'alt'));
}

// ================= LAN MULTIPLAYER =================
function lanConnect(addr) {
  return new Promise((resolve, reject) => {
    let ws; try { ws = new WebSocket('ws://' + addr + '/ws'); } catch (e) { return reject(e); }
    let myId = 0, mine = {}, done = false, sched = false, left = []; const peers = new Map(), hP = [], hC = [], hE = [];
    const fire = () => { sched = false; const me = { peer: 'L' + myId, sameTab: true, presence: mine }, list = [me]; for (const [id, pr] of peers) list.push({ peer: 'L' + id, sameTab: false, presence: pr }); const ch = { peers: list, left: left.map(id => ({ peer: 'L' + id })), joined: [], updated: list }; left = []; hP.forEach(f => f(ch)); };
    const queue = () => { if (!sched) { sched = true; setTimeout(fire, 16); } };
    const room = {
      lan: true, name: addr,
      presence(patch) { Object.assign(mine, patch); if (ws.readyState === 1) ws.send(JSON.stringify({ p: mine })); return Promise.resolve(); },
      onPeers(f, err) { hP.push(f); if (err) hE.push(err); queue(); return () => { }; }, onConnection(f) { hC.push(f); setTimeout(() => f(ws.readyState === 1), 5); return () => { }; },
      peers: () => [], connected: () => ws.readyState === 1, leave() { done = true; try { ws.close(); } catch (e) { } return Promise.resolve(); },
    };
    const to = setTimeout(() => { if (!myId) { done = true; try { ws.close(); } catch (e) { } reject(new Error('timeout')); } }, 5000);
    ws.onmessage = ev => { let d; try { d = JSON.parse(ev.data); } catch (e) { return; } if (!d || typeof d !== 'object') return;
      if (d.t === 'hi' && !myId) { myId = d.id | 0; clearTimeout(to); resolve(room); return; }
      if (typeof d.f !== 'number') return; if (d.x) { if (peers.delete(d.f)) { left.push(d.f); queue(); } return; }
      if (d.m && typeof d.m === 'object' && d.m.p && typeof d.m.p === 'object') { peers.set(d.f, d.m.p); queue(); } };
    ws.onclose = () => { clearTimeout(to); if (!myId) return reject(new Error('closed')); hC.forEach(f => f(false)); if (!done) hE.forEach(f => f({ code: 'closed' })); };
    ws.onerror = () => { };
  });
}
const lanOK = () => location.protocol !== 'https:';
const cleanAddr = a => { a = String(a || '').trim().replace(/^\w+:\/\//, '').replace(/\/.*$/, ''); if (a && !/:\d+$/.test(a)) a += ':8080'; return /^[\w.\-]+:\d{2,5}$/.test(a) ? a : ''; };
async function doJoinLan(addr, hosting) {
  addr = cleanAddr(addr); if (!addr) { Snd.play('bad'); return; }
  menuBox.querySelectorAll('button').forEach(b => b.disabled = true);
  const ok = await Net.joinLan(addr, hosting);
  if (!ok) { Snd.play('bad'); if (hosting && window.AndroidLan) try { AndroidLan.stop(); } catch (e) { } mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t reach ' + addr + '. Check that the host has started the game and that you are both on the same Wi-Fi.' })); return; }
  store.set('gl_lanaddr', addr);
  if (!G.inGame) startGame(true); else hideMenu();
  msg(hosting ? 'LAN game started. Friends on your Wi-Fi can join at ' + hosting : 'Joined the LAN game.', '#7fdbff');
}
function lanSection() {
  const out = [h('div', { class: 'lbl', text: 'LAN — same Wi-Fi, no internet needed' })];
  if (!lanOK()) { out.push(h('div', { class: 'small', text: 'LAN play works in the Android app and in the downloaded game file. This online page can only use room codes.' })); return out; }
  if (window.AndroidLan) out.push(btn('Host a LAN game', () => { let a = ''; try { a = AndroidLan.start(); } catch (e) { } if (!a) { Snd.play('bad'); mpMenu(); menuBox.append(h('div', { class: 'small', style: 'color:#ff6b6b', text: 'Couldn\'t start hosting. Connect to Wi-Fi (or turn on your hotspot) and try again.' })); return; } doJoinLan('127.0.0.1:' + a.split(':')[1], a); }, 'grn', 'this phone becomes the host'));
  if (location.protocol === 'http:' && location.host) out.push(btn('Join this host\'s game', () => doJoinLan(location.host), 'grn', location.host));
  const inp = h('input', { type: 'text', maxlength: '40', placeholder: '192.168.1.20:8080', inputmode: 'url' }); inp.value = store.get('gl_lanaddr', '') || '';
  out.push(h('div', { class: 'row' }, [inp, btn('Join LAN', () => doJoinLan(inp.value))]));
  out.push(h('div', { class: 'small', html: window.AndroidLan ? 'Hosting shows an address like <b>192.168.1.20:8080</b>. Friends type it here in their app — or just open <b>http://that-address</b> in any phone or computer browser on the same Wi-Fi. No install needed.' : 'Type the address the host shows. To host from a computer, run <b>node lan-server.js</b> next to gridlock.html, or host from the Android app.' }));
  return out;
}
