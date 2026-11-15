// ================= DIALOG UI =================
const dlgEl = document.getElementById('dlg');
let dlgTyper = null;
function showDialog(who, text, opts) {
  G.dlgSeq = (G.dlgSeq || 0) + 1;
  const wasOpen = G.dlgOpen; G.dlgOpen = true; dlgEl.classList.add('show'); if (!wasOpen) Snd.play('pop');
  dlgEl.querySelector('.who').textContent = who;
  const por = dlgEl.querySelector('.por'), q = G.talkPed; if (q) { por.style.display = 'block'; drawPortrait(por, q); } else por.style.display = 'none';
  const te = dlgEl.querySelector('.txt'); te.textContent = ''; let ci = 0; if (q) { const m = text.match(/"([^"]+)"/); Snd.speak((m ? m[1] : text).split(/(?<=[.!?])\s/)[0].slice(0, 90), q.vp, undefined, undefined, .7); } if (dlgTyper) clearInterval(dlgTyper);
  dlgTyper = setInterval(() => { ci = Math.min(text.length, ci + 2); te.textContent = text.slice(0, ci); if (ci >= text.length) { clearInterval(dlgTyper); dlgTyper = null; } }, 18);
  te.onclick = () => { if (dlgTyper) { clearInterval(dlgTyper); dlgTyper = null; } te.textContent = text; };
  const o = dlgEl.querySelector('.opts'); o.innerHTML = '';
  (opts || [{ t: 'OK' }]).forEach(op => {
    const b = document.createElement('button'); b.textContent = op.t; if (op.c) b.className = op.c; if (op.d) b.disabled = true;
    b.onclick = e => { e.stopPropagation(); Snd.play('ui'); const s0 = G.dlgSeq; const keep = op.f ? op.f() : null; if (!keep && G.dlgSeq === s0) closeDialog(); };
    o.appendChild(b);
  });
}
function closeDialog() { if (dlgTyper) { clearInterval(dlgTyper); dlgTyper = null; } G.dlgOpen = false; dlgEl.classList.remove('show'); if (G.talkPed) { G.talkPed.talking = 0; G.talkPed = null; } }
const say = (who, text, opts) => { showDialog(who, text, opts); return true; };

// ================= INTERIORS =================
function enterBuilding0(b) {
  const p = G.player;
  if (b.type === 'spray') return;
  let s = G.interiors[b.id]; if (!s) { s = G.interiors[b.id] = makeInterior(b); }
  if (!s.peds) {
    s.peds = s.npcDefs.map(d => {
      const role = d.role, o = {};
      if (role === 'cop') o.role = 'cop'; else if (role === 'gang') o.gang = DISTRICTS[b.d].gang || pick(['kings', 'vipers']); else o.role = role;
      const q = new Ped(d.x * T, d.y * T, o); q.inside = s; q.state = 'idle'; q.persist = 1; q.timer = rnd(0, 3);
      Object.assign(q, { still: d.still, sit: d.sit, lie: d.lie, dance: d.dance, shop: d.shop, desk: d.desk, pole: d.pole });
      if (role === 'clerk' && d.shop === 'gun') { q.weapon = WI.shotgun; q.hp = 120; q.shirt = '#5d4037'; }
      if (role === 'guard') { q.weapon = WI.pistol; q.shirt = '#2c3e50'; q.hat = 1; q.hp = 100; }
      if (role === 'nurse' || role === 'doctor') q.shirt = role === 'nurse' ? '#76d7c4' : '#ecf0f1';
      if (role === 'prisoner') q.shirt = '#e67e22';
      if (role === 'bouncer') { q.shirt = '#111'; q.hp = 140; }
      if (role === 'dj') q.shirt = '#9b59b6';
      if (q.sit || q.lie || q.still || q.dance) q.a = role === 'clerk' || role === 'nurse' || role === 'teller' || q.desk ? Math.PI / 2 : rnd(0, TAU);
      return q;
    });
  }
  G.outPos = { x: b.door.x + FACEV[b.door.f][0] * 18, y: b.door.y + FACEV[b.door.f][1] * 18, b };
  G.scene = s; p.x = s.door.x; p.y = s.door.y - 44; p.a = -Math.PI / 2; p.kx = p.ky = 0; G.fade = 1; G.sitting = null;
  Snd.play('door'); if (['store', 'diner', 'gunshop', 'arcade', 'bank'].includes(b.type)) Snd.play('bell'); toast(b.name);
  if (b.type === 'police' && stars() > 0) { for (const q of s.peds) if (q.role === 'cop') { q.hostile = 1; } msg('You walked into a police station with a wanted level. Bold.', '#ff6b6b'); }
  if (b.type === 'home') { const r = s.peds.find(q => q.role === 'resident' && !q.dead); if (r && !s.greeted) { s.greeted = 1; pedSay(r, pick(['Who are you?!', 'Get out of my house!', 'Uh... can I help you?', 'Is that the pizza guy?'])); } }
  if (G.mission && G.mission.onEnterB) G.mission.onEnterB(b);
}
function exitBuilding0() {
  const p = G.player, o = G.outPos; G.scene = null; p.x = o.x; p.y = o.y; p.kx = p.ky = 0; G.fade = 1; Snd.play('door'); G.spawnT = 0;
}

// ================= INTERACTION =================
function findInteract0() {
  const p = G.player; if (!p || p.dead || p.car || G.dlgOpen) return null;
  let best = null, bd = 1e9;
  const consider = (d, o) => { if (d < bd) { bd = d; best = o; } };
  const fx = p.x + Math.cos(p.a) * 6, fy = p.y + Math.sin(p.a) * 6;
  const peds = G.scene ? G.scene.peds : G.peds;
  for (const q of peds) { if (q.dead || q.state === 'fight' || q.state === 'chase' || q.hostile || q.state === 'flee') continue; const d = dist(fx, fy, q.x, q.y); if (d < 42) consider(d - 6, { k: 'ped', q, label: 'Talk to ' + q.name.split(' ')[0] }); }
  if (G.scene) {
    const s = G.scene;
    for (const it of s.items) { const def = IT[it.t]; let lab = def.act; if (it.t === 'case') lab = caseLabel(it); if (!lab) continue; const cx = clamp(fx, it.x * T, (it.x + it.w) * T), cy = clamp(fy, it.y * T, (it.y + it.h) * T); const d = dist(fx, fy, cx, cy); if (d < 34) consider(d, { k: 'item', it, label: lab }); }
    const d = dist(p.x, p.y, s.door.x, s.door.y + 20); if (d < 60) consider(d + 10, { k: 'exit', label: 'Exit to street' });
  } else {
    for (const pr of propsNear(fx, fy, 50)) { const def = PROPDEF[pr.t]; if (!def.act || (pr.down && pr.t !== 'bench')) continue; const d = dist(fx, fy, pr.x, pr.y) - pr.r; if (d < 28) consider(d, { k: 'prop', p: pr, label: def.act }); }
    const tx = Math.floor(p.x / T), ty = Math.floor(p.y / T);
    for (let yy = ty - 2; yy <= ty + 2; yy++) for (let xx = tx - 2; xx <= tx + 2; xx++) {
      if (!inMap(xx, yy)) continue; const bid = W.bmap[idx(xx, yy)]; if (bid < 0) continue; const b = W.buildings[bid]; if (!b.door || b.type === 'spray') continue;
      const d = dist(p.x, p.y, b.door.x, b.door.y); if (d < 66 && b.type !== 'mil') consider(d * .55 - 8, { k: 'door', b, label: (b.locked && !owned(b) ? 'View ' : 'Enter ') + b.name });
    }
    for (const c of G.cars) { if (c.dead && !c.salv && !(c.fireT > 0) && c.deadT > 1.5) { const d = dist(fx, fy, c.x, c.y); if (d < c.L / 2 + 16) consider(d + 8, { k: 'salv', c, label: 'Salvage wreck' }); }
      if (c.dead || c.driver || !(TRUNKCAP[c.type] > 0)) continue; const rx = c.x - Math.cos(c.a) * c.L * .5, ry = c.y - Math.sin(c.a) * c.L * .5, d = dist(fx, fy, rx, ry); if (d < 24) consider(d + 4, { k: 'trunk', c, label: 'Open trunk' }); }
  }
  return best;
}
function caseLabel(it) { return 'Inspect ' + (it.wpn === 'armor' ? 'body armor' : WEAPONS[WI[it.wpn]].name); }
function doInteract0(o) {
  if (!o) return; const p = G.player;
  if (o.k === 'door') return enterBuilding(o.b);
  if (o.k === 'exit') return exitBuilding();
  if (o.k === 'ped') return talkTo(o.q);
  if (o.k === 'prop') return useProp(o.p);
  if (o.k === 'item') return useItem(o.it);
  if (o.k === 'trunk') return openStorage('trunk', o.c);
  if (o.k === 'salv') return salvageWreck(o.c);
}
function pay(n) { if (G.cash < n) { Snd.play('bad'); toast("You can't afford that"); return false; } G.cash -= n; Snd.play('cash'); return true; }
function heal(n) { const p = G.player; p.hp = Math.min(100, p.hp + n); }
const HEADLINES = ['MAYOR DENIES "GIANT RAT" IN SEWERS', 'LOCAL MAN STEALS 41 CARS IN ONE DAY — "IT WAS A SLOW DAY," HE SAYS', 'DOCK VIPERS AND CROWN KINGS: TURF WAR HEATS UP', 'SVPD BUDGET SPENT ON "MORE DONUTS"', 'BANK OF VARRO VAULT "ABSOLUTELY UNCRACKABLE," SAYS MAN ABOUT TO BE WRONG', 'PIXEL PALACE HIGH SCORE STILL HELD BY UNKNOWN "AAA"', 'TRAFFIC: STILL BAD', 'HOT DOG VENDOR DENIES HOT DOGS ARE MADE OF HOT DOGS', 'RESPRAY SHOPS BOOMING; POLICE "BAFFLED"', 'WEATHER: SUNNY WITH A CHANCE OF EXPLOSIONS'];
function useProp(pr) {
  const p = G.player;
  if (RUSE[pr.t]) return RUSE[pr.t](pr);
  switch (pr.t) {
    case 'phone': return phoneCall(pr);
    case 'atm': Snd.play('beep', pr.x, pr.y); return atmMenu('ATM — First Varro Bank');
    case 'vend': if (pay(5)) { heal(15); Snd.play('clunk'); toast('Fizzy Cola  +15 HP'); } return;
    case 'hotdog': if (pay(8)) { heal(30); Snd.play('munch'); toast('Hot dog!  +30 HP'); } return;
    case 'hydrant': pr.spray = 6; pr.down = 0; Snd.play('splash', pr.x, pr.y); toast('Splash!'); return;
    case 'trash': {
      if (pr.searched) { toast('Already searched. Just garbage now.'); return; } pr.searched = 1; if (Math.random() < .3) giveLoot(lootPick('trash')); Snd.play('clank', pr.x, pr.y, .6); Snd.play('rustle', pr.x, pr.y); for (let i = 0; i < 4; i++) spawnFx('paper', pr.x, pr.y);
      const r = Math.random(); if (r < .35) toast('Just garbage. Ew.'); else if (r < .72) { const n = rint(5, 45); addCash(n); toast('Found ' + money(n)); } else if (r < .9) { giveWeapon('pistol', 12); toast('Found a pistol clip!'); } else { heal(10); toast('Half a sandwich. +10 HP. Gross.'); } return;
    }
    case 'news': Snd.play('rustle'); return say('San Varro Herald', pick(HEADLINES));
    case 'bench': G.sitting = pr; p.x = pr.x; p.y = pr.y; toast('Sitting... (move to stand)'); return;
  }
}
function atmMenu(title) {
  const opts = [
    { t: 'Deposit all (' + money(G.cash) + ')', c: 'y', d: G.cash <= 0, f: () => { G.bank += G.cash; G.cash = 0; Snd.play('cash'); doSave(true); return atmMenu(title); } },
    { t: 'Withdraw $100', d: G.bank < 100, f: () => { G.bank -= 100; G.cash += 100; Snd.play('cash'); return atmMenu(title); } },
    { t: 'Withdraw $1,000', d: G.bank < 1000, f: () => { G.bank -= 1000; G.cash += 1000; Snd.play('cash'); return atmMenu(title); } },
    { t: 'Withdraw all', d: G.bank <= 0, f: () => { G.cash += G.bank; G.bank = 0; Snd.play('cash'); return atmMenu(title); } },
    { t: 'Done' }];
  return say(title, `Cash on hand: ${money(G.cash)}   ·   Bank balance: ${money(G.bank)}\nMoney in the bank is safe when you get wasted or busted.`, opts);
}

// ---------- NPC conversations ----------
const LINES = {
  civ: ['Lovely weather for a crime spree, huh?', 'Have you tried the hot dogs in Varro Park? Don\'t.', 'My cousin got his car stolen three times this week.', 'The Crown Kings run Old Town. Watch yourself down there.', 'Stay out of the Docklands after dark. Vipers everywhere.', 'I heard the bank vault downtown is "uncrackable". Sure it is.', 'If the cops are on you, a respray shop will sort you out.', 'Pay phones still work in this city. Somebody\'s always calling them.', 'You look like you could use a hot dog.', 'I\'m late for work. Again.'],
  cop: ['Move along, citizen.', 'Keep your nose clean and we won\'t have a problem.', 'You look familiar. Have we met?', 'Donut? No. I\'m on a diet. ...Okay, one donut.', 'Another day, another carjacking.'],
  gang: ['You lost or something?', 'This is our turf. Respect it.', 'You got business here?', 'Keep walking, unless you want work.'],
  patron: ['This place has the best coffee in town. Low bar.', 'Shh, I\'m eating.', 'Don\'t mind me.', 'Have you tried the pie?'],
  worker: ['I\'m on a deadline. Go away.', 'Is it five o\'clock yet?', 'The copier is jammed again.', 'Don\'t tell my boss I\'m playing solitaire.'],
  resident: ['What are you doing in my house?!', 'I\'m calling the cops!', 'Please just leave...', 'Are you from the gas company?'],
  kid: ['Bet I can beat your high score.', 'Got any tokens?', 'This machine eats quarters!'],
  dancer: ['Love this song!', 'Woo!', 'Can\'t talk, dancing!'],
  prisoner: ['I\'m innocent, I tell ya!', 'Got a file? Asking for a friend.', 'The food in here is terrible.'],
  doctor: ['Take two aspirin and call me never.', 'You look terrible. Professionally speaking.'],
  boss: ['Who let you in? Security!', 'Time is money and you\'re wasting mine.'],
  default: ['Hey.', 'What do you want?', 'Hmm?'],
};
function talkTo0(q) {
  const p = G.player; q.talking = 1; G.talkPed = q; q.mvx = q.mvy = 0;
  const first = q.name.split(' ')[0];
  if (q.shop === 'pawn') { closeDialog(); return Panel.open('pawn', { name: G.scene.b.name }); }
  if (q.shop && G.scene && G.scene.b.sub && G.scene.b.sub !== 'jewel') { closeDialog(); return Panel.open('look', { kind: G.scene.b.sub, name: G.scene.b.name }); }
  if (q.shop) return shopMenu(q);
  if (q.role === 'perf') return perfMenu(q);
  if (q.dealer) return dealerMenu(q);
  const role = q.gang ? 'gang' : q.role;
  const line = pick(LINES[role] || LINES.default);
  const armed = p.weapon > 0;
  const opts = [];
  opts.push({ t: 'Chat', f: () => say(q.name, pick(LINES[role] || LINES.default), opts) });
  if (role === 'cop') {
    if (stars() > 0) opts.push({ t: `Bribe (${money(200 * stars())})`, c: 'y', f: () => { if (pay(200 * stars())) { G.heat = 0; return say(q.name, 'I didn\'t see anything. Now beat it.'); } crime(1, 'Attempted bribery'); q.hostile = 1; return say(q.name, 'Trying to bribe an officer with empty pockets? You\'re coming with me!'); } });
    opts.push({ t: 'Insult', c: 'r', f: () => { crime(1.1, 'Insulting an officer'); q.hostile = 1; pedSay(q, 'That\'s it!'); } });
  } else if (role === 'gang') {
    const gi = GANGS[q.gang];
    { const sl = gi.sells || ['uzi', 80, 500], rp = G.rep[q.gang] | 0, pr = Math.round(sl[2] * (rp >= 30 ? .6 : 1)); opts.push({ t: `Buy ${WEAPONS[WI[sl[0]]].name} (${money(pr)})`, f: () => { if (pay(pr)) { giveWeapon(sl[0], sl[1]); return say(first, 'No questions asked. Pleasure doing business.'); } } }); if (q.gang === 'reapers') opts.push({ t: 'Buy moonshine ($40)', f: () => { if (pay(40)) { if (!invAdd('moonshine', 1)) G.cash += 40; } return true; } }); }
    opts.push({ t: 'Ask for work', c: 'y', d: !!G.mission, f: () => { offerGangJob(q); return true; } });
    opts.push({ t: 'Run product', d: !!G.mission, f: () => { const m = makeRunMission(q); return say(q.name, `Take this package to our buyer across town. ${m.timer} seconds, and don't get busted. Pays ${money(m.reward)}.`, [{ t: 'Deal', c: 'y', f: () => { startMission(m); } }, { t: 'Pass' }]); } });
    opts.push({ t: 'Diss the ' + gi.name, c: 'r', f: () => { repAdd(q.gang, -10); G.gangAggro[q.gang] = 60; q.state = 'fight'; q.target = p; q.timer = 20; pedSay(q, 'You\'re dead!'); } });
  } else if (role === 'prisoner') {
    opts.push({ t: 'Slip him a file ($50)', f: () => { if (pay(50)) { q.role = 'civ'; q.inside.items.filter(i => i.t === 'bars').forEach(i => i.broken = 1); crime(1.5, 'Aiding a jailbreak'); q.state = 'flee'; q.threat = p; q.timer = 10; return say(first, 'You\'re a real pal! I owe ya one! *runs*'); } } });
  } else {
    opts.push({ t: 'Ask for a tip', f: () => giveTip(q) });
    opts.push({ t: 'Give $20', d: G.cash < 20, f: () => { if (!pay(20)) return; q.mood = Math.min(1, q.mood + .5); if (Math.random() < .35) { const s = W.pickupSpots.filter(s => s.alive).sort((a, b) => dist2(a.x, a.y, p.x, p.y) - dist2(b.x, b.y, p.x, p.y))[0]; if (s) { G.tip = { x: s.x, y: s.y, t: 90, label: 'Stash' }; return say(first, 'Gee, thanks! Here, I\'ll let you in on something — there\'s a stash nearby. I marked it on your map.'); } } return say(first, pick(['Wow, thanks!', 'You\'re too kind!', 'I\'ll put this toward rent. Or lottery tickets.', 'Really? For me?'])); } });
    opts.push({ t: armed ? 'Rob (show weapon)' : 'Rob', c: 'r', f: () => {
        if (armed || Math.random() < .4) { const n = rint(10, 90); addCash(n); if (Math.random() < .3) giveLoot(lootPick('ped')); crime(.45, 'Mugging'); q.state = 'flee'; q.threat = p; q.timer = 8; pedSay(q, 'Take it! Take it!'); toast('Mugged ' + money(n)); }
        else { q.state = 'fight'; q.target = p; q.timer = 10; pedSay(q, 'Not today, punk!'); crime(.2); }
      } });
    opts.push({ t: 'Insult', f: () => { if (Math.random() < .55 && role !== 'kid') { q.state = 'fight'; q.target = p; q.timer = 8; pedSay(q, pick(['Say that again!', 'Oh, you wanna go?', 'You asked for it!'])); } else { q.state = 'flee'; q.threat = p; q.timer = 4; pedSay(q, pick(['How rude!', '*sniff*', 'I\'m telling my mom!'])); } } });
  }
  opts.push({ t: 'Bye' });
  if (role === 'resident' && q.inside) { if (Math.random() < .3) crime(.5, 'Trespassing'); }
  return say(q.name, line, opts);
}
function giveTip(q) {
  const p = G.player, r = Math.random(), first = q.name.split(' ')[0];
  const nearest = type => W.buildings.filter(b => b.type === type && b.door).sort((a, b) => dist2(a.door.x, a.door.y, p.x, p.y) - dist2(b.door.x, b.door.y, p.x, p.y))[0];
  if (r < .5) { const type = pick(['gunshop', 'hospital', 'diner', 'bank', 'store', 'bar']); const b = nearest(type); if (b) { G.tip = { x: b.door.x, y: b.door.y, t: 90, label: b.name }; return say(first, `Looking for ${b.name}? It's not far. I marked it on your map.`); } }
  if (r < .75) { const ph = W.phones.slice().sort((a, b) => dist2(a.x, a.y, p.x, p.y) - dist2(b.x, b.y, p.x, p.y))[0]; if (ph) { G.tip = { x: ph.x, y: ph.y, t: 90, label: 'Payphone' }; return say(first, 'Want work? Answer a ringing payphone. There\'s one nearby — marked it for you.'); } }
  return say(first, pick(['Cops lose interest if they can\'t see you for a while. Hide in a building!', 'Bank your cash at an ATM. Hospitals and cops take a cut of what\'s in your pockets.', 'A Respray shop will make the cops forget your face. Look for the yellow garage doors.', 'Sleep at your apartment to save. Your stash there has free body armor.', 'The handbrake is great for tight corners. Trust me.', 'Gun shops sell rocket launchers. Wild city, huh?']));
}
function shopMenu0(q) {
  const p = G.player, first = q.name.split(' ')[0];
  switch (q.shop) {
    case 'gun': closeDialog(); return Panel.open('gunshop', { name: G.scene.b.name });
    case 'gun_old': {
      const opts = [{ t: '🔧 Customize weapons', c: 'y', f: () => { closeDialog(); Panel.open('guns'); } }].concat(WEAPONS.slice(1).map((w, k) => { const i = k + 1, own = p.ammo[i] > 0; return { t: (own ? w.name + ' ammo ' + money(w.ammoPrice) : w.name + ' ' + money(w.price)), c: own ? '' : 'y', f: () => { if (pay(own ? w.ammoPrice : w.price)) { giveWeapon(w.id); toast(w.name + (own ? ' ammo' : '')); } return shopMenu(q); } }; }));
      opts.push({ t: 'Body Armor $500', f: () => { if (pay(500)) { p.armor = 100; toast('Body Armor'); } return shopMenu(q); } });
      opts.push({ t: 'Leave' });
      return say(q.name + ' — ' + (G.scene.b.name), `"What'll it be?"   Cash: ${money(G.cash)}`, opts);
    }
    case 'food': return say(q.name, `"Welcome! Grab a seat or take it to go."   Cash: ${money(G.cash)}`, [
      { t: 'Coffee $3 (+10)', f: () => { if (pay(3)) heal(10); return shopMenu(q); } }, { t: 'Burger $8 (+30)', c: 'y', f: () => { if (pay(8)) { heal(30); Snd.play('munch'); } return shopMenu(q); } },
      { t: 'Cherry pie $5 (+20)', f: () => { if (pay(5)) heal(20); return shopMenu(q); } }, { t: 'The Works $20 (full)', f: () => { if (pay(20)) heal(100); return shopMenu(q); } }, { t: 'Leave' }]);
    case 'bar': return say(q.name, `"What are you drinking?"   Cash: ${money(G.cash)}`, [
      { t: 'Beer $10', f: () => { if (pay(10)) { Snd.play('clack'); heal(10); G.drunk = Math.min(40, G.drunk + 14); toast('*hic*'); } return shopMenu(q); } }, { t: 'Whiskey $20', c: 'y', f: () => { if (pay(20)) { heal(20); G.drunk = Math.min(40, G.drunk + 24); toast('Whoa...'); } return shopMenu(q); } },
      { t: 'Water $1', f: () => { if (pay(1)) { G.drunk = Math.max(0, G.drunk - 10); heal(3); } return shopMenu(q); } }, { t: 'Ask about rumors', f: () => say(first, pick(['The Kings and the Vipers hate each other. Use that.', 'I heard someone cracked the bank vault once. Got four-star heat for it, though.', 'Payphones around town ring with jobs. Easy money, mostly.', 'If you\'re on the run, duck into a building. Cops can\'t keep eyes on you inside.'])) }, { t: 'Leave' }]);
    case 'store': return say(q.name, `"Quik-Stop, how can I help?"   Cash: ${money(G.cash)}`, [
      { t: 'Medkit $60 (carry)', f: () => { if (pay(60) && !invAdd('medkit', 1)) G.cash += 60; return shopMenu(q); } }, { t: 'Fishing rod $80', d: !!G.inv.rod, f: () => { if (pay(80) && !invAdd('rod', 1)) G.cash += 80; return shopMenu(q); } }, { t: 'Snacks to go ×3 $9', f: () => { if (pay(9) && !invAdd('snack', 3)) G.cash += 9; return shopMenu(q); } },
      { t: 'Chips $3 (+10)', f: () => { if (pay(3)) heal(10); return shopMenu(q); } }, { t: 'Energy drink $6 (+25)', f: () => { if (pay(6)) heal(25); return shopMenu(q); } },
      { t: 'Lottery ticket $5', c: 'y', f: () => { if (pay(5)) { const r = Math.random(); if (r < .02) { addCash(5000); return say(first, 'JACKPOT! $5,000! You lucky dog!'); } if (r < .15) { addCash(50); return say(first, 'Winner! $50.'); } return say(first, 'Not a winner. Better luck next time.', [{ t: 'Again', f: () => shopMenu(q) }, { t: 'Leave' }]); } return shopMenu(q); } },
      { t: 'Leave' }]);
    case 'hospital': return say(q.name, `"Do you have insurance? No? Of course not."   Cash: ${money(G.cash)}`, [
      { t: 'Medkit $60 (carry)', f: () => { if (pay(60) && !invAdd('medkit', 1)) G.cash += 60; return shopMenu(q); } }, { t: 'Bandages ×2 $40', f: () => { if (pay(40) && !invAdd('bandage', 2)) G.cash += 40; return shopMenu(q); } },
      { t: 'Full treatment $100', c: 'y', d: p.hp >= 100, f: () => { if (pay(100)) { p.hp = 100; p.burn = 0; toast('Fully healed'); } } }, { t: 'Leave' }]);
    case 'police': {
      const st = stars();
      return say(q.name, st ? `"You've got ${st} star${st > 1 ? 's' : ''} of heat on you. Pay the fine, or else."` : '"Can I help you, citizen? File a report? No? Then move along."', [
        { t: `Pay fine (${money(250 * st)})`, c: 'y', d: !st, f: () => { if (pay(250 * st)) { G.heat = 0; toast('Wanted level cleared'); for (const c of G.scene.peds) c.hostile = 0; } } },
        { t: 'Report a crime', f: () => say(q.name, pick(['"Someone stole your car? Get in line, pal."', '"We\'ll look into it." *does not look into it*', '"A giant rat? In the sewers? Get out."'])) },
        { t: 'Turn yourself in', d: !st, f: () => { busted(); } }, { t: 'Leave' }]);
    }
    case 'bank': return atmMenu(q.name + ' — Teller');
    case 'arcade': return say(q.name, '"Tokens are $1 a play. No refunds."', [{ t: 'OK' }]);
  }
}
// ---------- interior items ----------
const BOOKS = ['"Grand Theft Ethics" — a slim volume.', '"Car Mechanics for Dummies". Page 1: turn key.', '"101 Hot Dog Recipes". All of them are just hot dogs.', '"A History of San Varro". The city was founded by a guy named Varro. That\'s it.', '"The Art of the Getaway". Highlighted: "ALWAYS CHECK THE GAS".'];
function useItem0(it) {
  const p = G.player, s = G.scene, clerk = s.peds.find(q => q.shop && !q.dead && q.state !== 'flee');
  switch (it.t) {
    case 'case': {
      if (!clerk) { if (it.used) return toast('Empty case'); it.used = 1; if (it.wpn === 'armor') p.armor = 100; else giveWeapon(it.wpn); crime(1, 'Theft'); Snd.play('glass'); return toast('Stolen!'); }
      return Panel.open('gunshop', { name: s.b.name, sel: it.wpn });
      const w = WEAPONS[WI[it.wpn]], own = p.ammo[WI[it.wpn]] > 0; if (pay(own ? w.ammoPrice : w.price)) { giveWeapon(it.wpn); toast(w.name + (own ? ' ammo' : '')); } return;
    }
    case 'register': {
      if (it.used && G.t - it.used < 120) return toast('Register is empty');
      if (clerk && p.weapon === 0) { pedSay(clerk, 'Hands off the register!'); clerk.state = 'fight'; clerk.target = p; clerk.timer = 10; return; }
      it.used = G.t; const n = rint(150, 600); addCash(n); Snd.play('alarm'); crime(2, 'Armed robbery'); toast('Robbed ' + money(n)); if (clerk) { if (clerk.weapon > 0) { clerk.state = 'fight'; clerk.target = p; clerk.timer = 30; } else { clerk.state = 'flee'; clerk.threat = p; clerk.timer = 10; pedSay(clerk, 'Don\'t shoot!'); } } return;
    }
    case 'shelf': Snd.play('rustle'); if (clerk) { if (pay(3)) { heal(8); toast('Snack +8'); } } else { heal(8); toast('Free snack'); } return;
    case 'fridge': Snd.play('clunk'); if (s.b.type === 'store' && clerk) { if (pay(4)) { heal(12); toast('Cold drink +12'); } } else { heal(15); toast('Cold drink +15'); } return;
    case 'stove': Snd.play('fire'); heal(20); toast('You cooked something. It\'s... edible. +20'); return;
    case 'table': if (it.used) return toast('Nothing left'); it.used = 1; heal(5); toast('Leftover fries. +5'); return;
    case 'bed': if (s.b.type === 'safehouse') { Snd.play('snore'); p.hp = 100; G.save.spawn = s.b.id; const sl = sleepPass(); doSave(); G.fade = 2; return say('Your Apartment', 'You slept like a baby' + sl + '. Health restored, game saved, and this is now your spawn point.'); } if (s.b.type === 'home') { crime(.3, 'Trespassing'); toast('Comfy. The owner disagrees.'); return; } return;
    case 'gurney': heal(5); toast('Not as comfy as it looks.'); return;
    case 'tv': if (it.stolen) return toast('A dusty outline where the TV used to be.'); if (['home', 'office', 'bar', 'diner'].includes(s.b.type) && !it.asked) { it.asked = 1; return say('TV', 'A nice flat screen. Bolted down... loosely.', [{ t: 'Watch', f: () => { useItem(it); return true; } }, { t: 'Steal it', c: 'r', f: () => { it.asked = 0; if (invAdd('tv', 1)) { it.stolen = 1; Snd.play('ratchet'); crime(.6, 'Burglary'); toast('Stole the TV'); } else toast('Too heavy for your bag (needs 8 free)'); } }, { t: 'Leave', f: () => { it.asked = 0; } }]); } it.asked = 0; return say('TV', pick(['📺 "...and in other news, a man stole a bus and drove it into the harbor. More at 11."', '📺 "Tonight on Cop Chase: Varro\'s Wildest Getaways!"', '📺 A cooking show. The chef is making hot dogs.', '📺 "Weather: sunny. Crime: also sunny."', '📺 ' + pick(HEADLINES)]));
    case 'sofa': G.sitting = { x: p.x, y: p.y }; toast('Relaxing... (move to stand)'); return;
    case 'arcade': if (pay(1)) { Snd.play('arcade'); if (Math.random() < .15) { addCash(25); return say('PIXEL BLASTER', '★ NEW HIGH SCORE! ★  The machine spits out $25 in prize tickets.'); } toast(pick(['GAME OVER', 'So close!', 'Insert coin', 'You lost a life'])); } return;
    case 'jukebox': case 'dj': { const opts = (INTERIOR_MUSIC[s.b.type] || []).concat(['funk', 'synth', 'lounge', 'oldies', 'blues', 'house', 'rnb', 'chip']).filter((v, i, a) => a.indexOf(v) === i); s.music = opts[(opts.indexOf(s.music || opts[0]) + 1) % opts.length]; Snd.play('static'); G.radioName = { funk: 'Funk', synth: 'Synthwave', lounge: 'Lounge', oldies: 'Oldies', blues: 'Blues', house: 'House', rnb: 'Slow jams', chip: 'Chiptune' }[s.music]; G.radioT = 3; for (let i = 0; i < 4; i++) spawnFx('note', it.x * T + 20, it.y * T); return; }
    case 'atm': Snd.play('beep'); return atmMenu('ATM');
    case 'vend': if (pay(5)) { heal(15); Snd.play('clunk'); toast('Fizzy Cola +15'); } return;
    case 'desk': case 'drawer': { if (it.used) return toast('Nothing else here'); it.used = 1; if (Math.random() < .5) giveLoot(lootPick(s.b.type === 'home' || s.b.type === 'safehouse' ? 'home' : 'office')); const r = Math.random(); const n = r < .5 ? rint(10, 80) : 0; if (n) { addCash(n); toast('Found ' + money(n)); } else toast(pick(['Paperclips.', 'A stapler. Nice.', 'Someone\'s lunch.', 'Tax forms. Yikes.'])); if (s.peds.some(q => !q.dead && (q.role === 'resident' || q.role === 'worker' || q.role === 'boss'))) crime(.4, 'Theft'); return; }
    case 'computer': { Snd.play('beep'); if (it.used) return toast('Logged out.'); it.used = 1; if (Math.random() < .5) { addCash(150); crime(.5, 'Wire fraud'); return say('Computer', 'You found the payroll system and wired yourself $150. Someone will notice.'); } return say('Computer', pick(['Solitaire. You lose.', 'The screensaver is a fish tank. Mesmerizing.', '1,438 unread emails. You close it.'])); }
    case 'cooler': heal(5); toast('Refreshing. +5'); return;
    case 'books': Snd.play('rustle'); return say('Bookshelf', pick(BOOKS));
    case 'crate': { if (it.used) return toast('Already smashed'); it.used = 1; if (Math.random() < .45) giveLoot(lootPick('crate')); Snd.play('thud'); for (let i = 0; i < 5; i++) spawnFx('dust', (it.x + .5) * T, (it.y + .5) * T); const r = Math.random(); if (r < .3) { giveWeapon(pick(['pistol', 'uzi', 'shotgun', 'molotov'])); toast('Found a weapon!'); } else if (r < .6) { const n = rint(50, 300); addCash(n); toast('Found ' + money(n)); } else if (r < .7) { p.armor = Math.max(p.armor, 50); toast('Found body armor'); } else toast(pick(['Rubber ducks.', 'Bootleg DVDs.', 'Packing peanuts.', 'Empty.'])); return; }
    case 'vault': {
      if (it.used) return toast('Vault is empty');
      if (p.weapon === 0) return toast('You need a weapon to rob a bank');
      it.used = 1; { const nb = rint(2, 4), got = invAdd('goldbar', nb, 1); if (got < nb) dropItem('goldbar', nb - got); } Snd.play('ratchet'); setTimeout(() => Snd.play('alarm'), 500); setTimeout(() => Snd.play('alarm'), 2300); addCash(rint(4000, 7000)); G.heat = Math.max(G.heat, 4.2); G.starFlash = 2; msg('BANK ROBBERY! Get out of there!', '#ff6b6b'); Snd.play('mission');
      for (const q of s.peds) { if (q.role === 'guard') { q.state = 'fight'; q.target = p; q.timer = 60; } else if (!q.dead) { q.state = 'flee'; q.threat = p; q.timer = 20; } }
      return;
    }
    case 'safe': { if (it.used) return toast('Empty'); it.used = 1; giveLoot(lootPick('safe')); Snd.play('ratchet'); const n = rint(400, 1200); addCash(n); crime(1.2, 'Safecracking'); return toast('Cracked the safe: ' + money(n)); }
    case 'bars': if (it.broken) return toast('The cell door hangs open.'); Snd.play('thud'); return toast('*clang clang*');
    case 'dance': G.dancing = 3; toast(pick(['Nice moves!', 'You\'re a natural.', 'The crowd goes wild.'])); return;
    case 'bar': { const c2 = s.peds.find(q => q.shop === 'bar' && !q.dead); if (c2) return talkTo(c2); if (pay(10)) { heal(10); G.drunk += 14; } return; }
    case 'pool': if (G.cash < 50) return toast('You need $50 to bet'); for (let i = 0; i < 4; i++) setTimeout(() => Snd.play('clack'), i * 220 + Math.random() * 100); if (Math.random() < .45) { addCash(50); return say('Pool', 'You sink the 8-ball. Easy $50.'); } G.cash -= 50; Snd.play('bad'); return say('Pool', 'You scratched on the 8. Lost $50.');
    case 'piano': { const sc = [262, 294, 330, 392, 440, 523]; for (let i = 0; i < 6; i++) setTimeout(() => Snd.note(sc[rint(0, 5)]), i * 160); for (let i = 0; i < 3; i++) spawnFx('note', (it.x + 1) * T, it.y * T); return; }
    case 'wardrobe': { Snd.play('rustle'); const i = (SHIRT.indexOf(p.shirt) + 1) % SHIRT.length; p.shirt = SHIRT[i]; doSave(true); return toast('New look!'); }
    case 'stash': return openStorage('home');
    case 'wbench': return Panel.open('guns');
    case 'pshelf': return Panel.open('pawn', { name: s.b.name, tab: 'buy' });
    case 'stash_old': { Snd.play('cock'); if (G.t - (G.stashT || -999) < 300) return toast('Stash restocks in ' + Math.ceil(300 - (G.t - G.stashT)) + 's'); G.stashT = G.t; p.armor = 100; giveWeapon('pistol', 20); return toast('Grabbed armor + pistol ammo'); }
    case 'stage': { if (!pay(20)) return; const ps = s.peds.filter(q => q.role === 'perf' && !q.dead); bills((it.x + it.w / 2) * T, (it.y + it.h / 2) * T, 8); if (ps.length) pedSay(pick(ps), pick(['Thanks, baby!', 'Ooh, a big spender.', 'Keep \'em coming!'])); return; }
    case 'vip': if (pay(200)) { G.fade = 2.6; p.hp = 100; G.drunk = 0; setTimeout(() => toast('An hour later... you feel like a million bucks.'), 900); } return;
    case 'toilet': Snd.play('flush'); return toast(pick(['*flush*', 'Ahh.', 'You wash your hands. Good job.']));
    case 'cabinet': { Snd.play('rustle'); if (it.used && G.t - it.used < 120) return toast('Empty'); it.used = G.t; p.hp = 100; crime(.5, 'Theft'); return toast('Medicine! Full health'); }
    case 'change': if (pay(5)) toast('5 tokens. Go play!'); return;
    case 'target': Snd.play('pistol'); return toast('Bullseye! (Not really.)');
    case 'lockers': { Snd.play('clank'); if (it.used) return toast('Nothing left'); it.used = 1; if (Math.random() < .6) giveLoot(lootPick('lockers')); if (s.b.type === 'police') { giveWeapon('shotgun', 12); crime(1, 'Stealing police gear'); return toast('Police shotgun!'); } const n = rint(5, 60); addCash(n); return toast('Found ' + money(n)); }
  }
}

// ================= MISSIONS =================
function randStreetPoint(minD, maxD, kind) {
  const p = G.player;
  for (let i = 0; i < 300; i++) {
    const a = rnd(0, TAU), r = rnd(minD, maxD), x = p.x + Math.cos(a) * r, y = p.y + Math.sin(a) * r, tx = Math.floor(x / T), ty = Math.floor(y / T);
    const t = tileAt(tx, ty); if (t === (kind || TILE.WALK) && inMap(tx, ty)) return { x: (tx + .5) * T, y: (ty + .5) * T };
  }
  return { x: roadCX(8), y: roadCY(4) };
}
const BOSSES = [{ n: 'Mr. Grimaldi', c: '#f2c230' }, { n: 'The Accountant', c: '#7fdbff' }, { n: 'Mama Rosa', c: '#ff6fa8' }, { n: 'Ziggy "Wheels" Kane', c: '#2ecc71' }];
function phoneCall(ph) {
  if (G.mission) return say('Payphone', 'Dial tone. Your contact is waiting for you to finish the current job.', [{ t: 'Abandon job', c: 'r', f: () => failMission('Job abandoned.') }, { t: 'Hang up' }]);
  const boss = pick(BOSSES), m = genMission(boss);
  Snd.play('ring', ph.x, ph.y);
  return say('☎ ' + boss.n, m.pitch + `\n\nPays ${money(m.reward)}.`, [{ t: 'Take the job', c: 'y', f: () => { startMission(m); } }, { t: 'Not now' }]);
}
function offerGangJob(q) {
  const gang = q.gang, rival = pick(Object.keys(GANGS).filter(g => g !== gang && W.blocks.some(b => DISTRICTS[b.d].gang === g))), R = GANGS[rival];
  const turf = W.blocks.filter(b => DISTRICTS[b.d].gang === rival); const blk = pick(turf);
  const m = { gang, rival, title: 'Turf War', reward: 1800, count: 0, need: 3, desc: `Take out 3 ${R.name}`, giver: GANGS[gang].name,
    target: { x: (blk.bx + 6) * T, y: (blk.by + 6) * T, label: R.name + ' turf' },
    onKill(pd) { if (pd.gang === rival) { this.count++; msg(`${R.name}: ${this.count}/${this.need}`, R.col); if (this.count >= this.need) completeMission(); } },
    hud() { return `${this.count}/${this.need} ${R.name}`; } };
  say(q.name, `You want work? The ${R.name} have been stepping on our turf. Take out three of them. You'll find 'em around ${DISTRICTS[blk.d].name}. Pays ${money(m.reward)}.`, [{ t: 'I\'m in', c: 'y', f: () => { startMission(m); G.gangAggro[rival] = 999; } }, { t: 'No thanks' }]);
}
function genMission(boss) {
  const p = G.player, k = pick(['courier', 'jack', 'hit', 'taxi', 'smash', 'courier', 'jack']);
  if (k === 'courier') {
    const a = randStreetPoint(700, 1600), b = randStreetPoint(1600, 3200);
    const d = dist(a.x, a.y, b.x, b.y), tl = Math.round(25 + d / 230);
    return { title: 'Special Delivery', pitch: `"I need a package moved. Pick it up — it's marked on your map — and get it across town in ${tl} seconds after you grab it. Don't open it."`, reward: 400 + Math.round(d / 4 / 50) * 50, stage: 0, a, b, tl,
      target: { x: a.x, y: a.y, label: 'Package' }, icon: 'package',
      update(dt) { const pp = G.player, px = pCar() ? pCar().x : pp.x, py = pCar() ? pCar().y : pp.y; if (G.scene) return;
        if (this.stage === 0 && dist2(px, py, this.a.x, this.a.y) < 50 * 50) { this.stage = 1; this.timer = this.tl; this.target = { x: this.b.x, y: this.b.y, label: 'Drop-off' }; Snd.play('pickup'); msg('Got the package. Move it!', '#f2c230'); }
        else if (this.stage === 1) { this.timer -= dt; if (dist2(px, py, this.b.x, this.b.y) < 55 * 55) completeMission(); else if (this.timer <= 0) failMission('Too slow. The client walked.'); } },
      hud() { return this.stage ? 'Deliver the package' : 'Pick up the package'; } };
  }
  if (k === 'jack') {
    const type = pick(['sports', 'muscle', 'van', 'pickup', 'truck', 'sports']); const spot = randStreetPoint(800, 2000, TILE.ROAD), drop = randStreetPoint(1200, 2600, TILE.ROAD);
    return { title: 'Hot Wheels', pitch: `"A client wants a ${CAR_TYPES[type].name}. I found one — it's marked. Bring it to my garage without too many dents."`, reward: type === 'truck' ? 2200 : type === 'sports' ? 1800 : 1300, type, drop,
      init() { let c = new Car(type, spot.x, spot.y, rint(0, 3) * Math.PI / 2); c.ai = { mode: 'parked' }; c.missionCar = 1; c.persist = 1; G.cars.push(c); this.car = c; this.target = { x: c.x, y: c.y, label: CAR_TYPES[type].name }; },
      update() { const c = this.car; if (!c || c.dead) return failMission('The car got wrecked.'); if (pCar() === c) { this.target = { x: this.drop.x, y: this.drop.y, label: 'Garage' }; if (dist2(c.x, c.y, this.drop.x, this.drop.y) < 70 * 70 && c.spd < 80) { exitCar(true); G.cars.splice(G.cars.indexOf(c), 1); const bonus = Math.round(this.reward * clamp(c.hp / c.d.hp, .3, 1) / 50) * 50; this.reward = bonus; completeMission(); } } else this.target = { x: c.x, y: c.y, label: CAR_TYPES[type].name }; },
      hud() { return pCar() === this.car ? 'Deliver it to the garage' : 'Steal the ' + CAR_TYPES[type].name; }, cleanup() { if (this.car) this.car.missionCar = 0; } };
  }
  if (k === 'hit') {
    const pt = randStreetPoint(900, 2200), name = randName();
    return { title: 'Loose Ends', pitch: `"${name} owes me money and won't pay. Make an example. They hang around with a couple of goons."`, reward: 1600, name, pt,
      init() { const t = new Ped(pt.x, pt.y, { name, shirt: '#ecf0f1', extra: { persist: 1, missionTarget: 1, hp: 120, weapon: WI.pistol } }); t.state = 'idle'; t.still = 0; t.inside = null; G.peds.push(t); this.t = t;
        for (let i = 0; i < 2; i++) { const g = new Ped(pt.x + rnd(-40, 40), pt.y + rnd(-40, 40), { shirt: '#111', extra: { persist: 1, weapon: WI.pistol, hp: 90 } }); g.state = 'idle'; g.guard = t; G.peds.push(g); this.gs = (this.gs || []).concat(g); }
        t.walkGuard = 1; this.target = { x: pt.x, y: pt.y, label: name }; },
      update() { const t = this.t; if (t.dead) return completeMission(); this.target = { x: t.x, y: t.y, label: name.split(' ')[0] }; const pl = G.player; if (!G.scene && dist2(pl.x, pl.y, t.x, t.y) < 260 * 260) { [t].concat(this.gs).forEach(g => { if (!g.dead && g.state !== 'fight' && g.state !== 'flee') { g.state = 'fight'; g.target = pl; g.timer = 40; } }); if (t.hp < 60 && t.state !== 'flee') { t.state = 'flee'; t.threat = pl; t.timer = 30; } } },
      hud() { return 'Take out ' + name; }, cleanup() { [this.t].concat(this.gs || []).forEach(g => { if (g) g.persist = 0; }); } };
  }
  if (k === 'taxi') {
    return { title: 'Cabbie', pitch: '"My driver called in sick. Get a cab and ferry three fares around town. Tips are yours."', reward: 900, fares: 0, stage: 0,
      init() { const s = randStreetPoint(250, 600, TILE.ROAD); const c = new Car('taxi', s.x, s.y, rint(0, 3) * Math.PI / 2); c.ai = { mode: 'parked' }; c.missionCar = 1; G.cars.push(c); this.cab = c; },
      update(dt) {
        const c = pCar(); if (!c || c.type !== 'taxi') { this.stage = this.stage ? this.stage : 0; this.target = this.cab && !this.cab.dead ? { x: this.cab.x, y: this.cab.y, label: 'Taxi' } : null; if (this.timer !== undefined && this.stage === 2) { this.timer -= dt; if (this.timer <= 0) failMission('Your fare got out and walked.'); } return; }
        if (this.stage === 0) { const q = randStreetPoint(500, 1100); this.pick = q; this.stage = 1; const fp = new Ped(q.x, q.y, { extra: { persist: 1 } }); fp.state = 'idle'; fp.still = 1; G.peds.push(fp); this.fp = fp; }
        if (this.stage === 1) { this.target = { x: this.fp.x, y: this.fp.y, label: 'Fare' }; if (this.fp.dead) { this.stage = 0; return; } if (dist2(c.x, c.y, this.fp.x, this.fp.y) < 80 * 80 && c.spd < 50) { G.peds.splice(G.peds.indexOf(this.fp), 1); this.drop = randStreetPoint(900, 2000); this.stage = 2; this.timer = Math.round(20 + dist(c.x, c.y, this.drop.x, this.drop.y) / 220); msg('"' + pick(['Take me downtown, and step on it!', 'To the address on this card, please.', 'I\'m late! Hurry!']) + '"', '#f2c230'); } }
        if (this.stage === 2) { this.timer -= dt; this.target = { x: this.drop.x, y: this.drop.y, label: 'Destination' }; if (dist2(c.x, c.y, this.drop.x, this.drop.y) < 80 * 80 && c.spd < 70) { this.fares++; const tip = rint(60, 200) + Math.round(Math.max(0, this.timer) * 5); addCash(tip); msg(`Fare complete! Tip: ${money(tip)}  (${this.fares}/3)`, '#2ecc71'); if (this.fares >= 3) completeMission(); else { this.stage = 0; this.timer = undefined; } } else if (this.timer <= 0) failMission('Too slow — your fare jumped out.'); }
      },
      hud() { const c = pCar(); if (!c || c.type !== 'taxi') return 'Get in a taxi'; return this.stage === 2 ? 'Drive your fare' : 'Pick up a fare  (' + this.fares + '/3)'; }, cleanup() { if (this.cab) this.cab.missionCar = 0; if (this.fp) this.fp.persist = 0; } };
  }
  return { title: 'Demolition Derby', pitch: '"An insurance thing. I need 4 cars wrecked in 90 seconds. Any cars. Get creative."', reward: 1200, count: 0, timer: 90,
    update(dt) { this.timer -= dt; if (this.timer <= 0) failMission('Out of time.'); }, onWreck() { this.count++; msg('Wrecked: ' + this.count + '/4', '#f39c12'); if (this.count >= 4) completeMission(); }, hud() { return `Wreck cars: ${this.count}/4`; } };
}
function startMission(m) { G.mission = m; if (m.init) m.init(); Snd.play('mission'); msg('JOB: ' + m.title, '#f2c230'); G.big = { text: m.title.toUpperCase(), col: '#f2c230', t: 2.2, small: 1 }; }
function completeMission() { const m = G.mission; if (!m) return; if (m.gang) { repAdd(m.gang, 15); if (m.rival) { repAdd(m.rival, -10); G.gangAggro[m.rival] = 0; } } addCash(m.reward); G.big = { text: 'JOB COMPLETE', col: '#2ecc71', t: 3, sub: '+' + money(m.reward) }; Snd.play('mission'); if (m.cleanup) m.cleanup(); G.mission = null; }
function failMission(r) { const m = G.mission; if (!m) return; if (m.cleanup) m.cleanup(); G.mission = null; G.big = { text: 'JOB FAILED', col: '#e74c3c', t: 3, sub: r }; Snd.play('fail'); }

// ================= MAIN UPDATE =================
function controlPlayer0(dt) {
  const p = G.player, I = Input;
  const blocked = G.dlgOpen || G.mode !== 'play' || G.menuOpen;
  if (blocked) { p.mvx = p.mvy = 0; if (p.car) { p.car.throttle = 0; p.car.brake = 1; } return; }
  if (I.edge.wpn) cycleWeapon(); if (I.edge.reload) startReload(); if (I.edge.inv) { openInv(); return; } updateReload(dt);
  if (I.edge.car) { if (p.car) exitCar(); else { const c = nearestCar(46); if (c) tryEnterCar(c); } }
  if (I.edge.act) { const o = findInteract(); if (o) doInteract(o); }
  if ((I.edge.nos) && p.car && p.car.mods && p.car.mods.nos) { const c = p.car; if (c.nos > 0 && c.nosT <= 0) { c.nos--; c.nosT = 2.4; Snd.play('rocket', c.x, c.y, .6); G.cam.shake = 4; } else if (c.nos <= 0) toast('Nitrous empty — refill at a mod shop'); }
  if (I.edge.radio && (p.car || G.settings.walkman)) { if (I.kbd) tune(((p.car ? p.car.radio : Radio.st) + 1) % STATIONS.length); else { Panel.open('radio'); return; } }
  let mx = I.mx, my = I.my, mag = Math.min(1, Math.hypot(mx, my));
  if (G.drunk > 0) { const wob = Math.sin(G.t * 1.7) * .5 * clamp(G.drunk / 20, 0, 1); const c = Math.cos(wob), s = Math.sin(wob); [mx, my] = [mx * c - my * s, mx * s + my * c]; }
  if (p.car) {
    const c = p.car; c.hand = I.hand ? 1 : 0; c.brake = 0;
    if (I.kbd || G.settings.drive === 'classic') {
      c.steer = I.kbd ? I.steer : clamp(mx * 1.3, -1, 1);
      c.throttle = I.gas ? 1 : I.rev ? -1 : 0;
    } else {
      // D-pad: the car ALWAYS drives forward and turns around to face the stick. Reverse is only brake with no stick.
      c.revMode = 0; c.unstick = 0;
      if (mag > .18) {
        const ta = Math.atan2(my, mx), da = angDiff(c.a, ta), f = c.fwd, ad = Math.abs(da);
        c.steer = ad > .5 ? Math.sign(da) : clamp(da * 2.3, -1, 1);
        c.throttle = ad > 2.2 ? Math.max(.55, mag) : mag;
        if (f < -30) { c.brake = 1; c.throttle = 0; }  // rolling backwards: stop first, then pull away forward
        else if (ad > 1.2 && f > 300) c.brake = 1;      // too fast to turn around: scrub speed while steering
        // nose stuck against a wall: pivot on the spot toward the stick instead of reversing out
        if (Math.abs(f) < 14 && c.spd < 30) { c.blockT = (c.blockT || 0) + dt; if (c.blockT > .9 && ad > .25) { c.a += Math.sign(da) * Math.min(ad, 2.4 * dt); c.av = 0; } } else c.blockT = 0;
      } else { c.throttle = 0; c.steer = 0; c.blockT = 0; if (I.rev) c.throttle = -1; }
      if (I.rev && mag <= .18 && c.fwd < -12) c.backing = 1; if (!I.rev) c.backing = 0;
      if (I.rev && mag > .18 && !c.backing) { c.throttle = 0; c.brake = 1; }  // brake + stick while moving = brake (rev bounce kicks in once slow)
      if (c.backing && mag > .18) { const ta = Math.atan2(my, mx), da = angDiff(c.a + Math.PI, ta); c.throttle = -1; c.brake = 0; c.steer = -clamp(da * 2.3, -1, 1); c.blockT = 0; }  // already reversing: the stick steers the reverse
    }
    // burnout: brake + go at (nearly) a standstill revs in place; letting go of brake launches
    const wantGo = I.kbd || G.settings.drive === 'classic' ? I.gas : mag > .18;
    if (I.rev && wantGo && !c.backing && !c.d.boat && !c.d.pedal && !c.dead && Math.abs(c.fwd) < 70) {
      c.burnT = (c.burnT || 0) + dt; c.burnout = 1; c.throttle = 0; c.brake = 1; c.blockT = 0; c.unstick = 0; c.revMode = 0; c.vx *= .82; c.vy *= .82;
      let st = I.kbd ? I.steer : G.settings.drive === 'classic' ? clamp(mx * 1.3, -1, 1) : clamp(angDiff(c.a, Math.atan2(my, mx)) * 2, -1, 1); c.steer = st;
      c.a += st * 1.6 * dt * clamp(c.burnT * 1.5, 0, 1); c.av = 0;
      burnoutFx(c, dt);
    } else {
      if (c.burnT > .3 && wantGo && !I.rev) { const k = Math.min(1, c.burnT / 1.4); c.unstick = 0; c.blockT = -.6; c.revMode = 0; if (!(I.kbd || G.settings.drive === 'classic')) c.throttle = 1; c.launchT = .5 + .7 * k; c.vx += Math.cos(c.a) * 90 * k; c.vy += Math.sin(c.a) * 90 * k; Snd.play('skid', c.x, c.y, .7); G.cam.shake = Math.max(G.cam.shake, 3 + 3 * k); }
      c.burnT = 0; c.burnout = 0;
    }
    if (I.edge.horn) { Snd.play('horn', c.x, c.y); Net.emitEv('h', {}); c.horn = 0; if (c.siren >= 0) c.siren = c.siren ? 0 : 1; }
    p.x = c.x; p.y = c.y; p.a = c.a;
    if (I.fire) playerFire(I.aiming ? (G.settings.assist ? aimMagnet(I.aimA, 500) : I.aimA) : (G.settings.assist ? autoAim(c.a, 500) : c.a));
  } else {
    if (G.sitting) { if (mag > .3) G.sitting = null; else { heal(dt * 2); p.mvx = p.mvy = 0; return; } }
    const run = mag > .82 || I.sprint; const spd = (run ? 178 : 110 * clamp(mag / .82, 0, 1)) * (G.drunk > 0 ? .85 : 1) * drugSpd() * (p.swim ? .42 : 1);
    if (mag > .12) { p.mvx = mx / (mag || 1) * spd; p.mvy = my / (mag || 1) * spd; if (!I.aiming) p.a = Math.atan2(my, mx); G.dancing = 0; } else { p.mvx = p.mvy = 0; }
    if (I.aiming) p.a = I.aimA;
    if (isThrow(p.weapon)) {
      if (I.fire) { const a = I.aiming ? (G.settings.assist ? aimMagnet(I.aimA, 620) : I.aimA) : (G.settings.assist ? autoAim(p.a, 620) : p.a); p.a = a; G.throwA = a; G.throwCharge = Math.min(1, (G.throwCharge || 0) + dt / 1.1); }
      else if (G.throwCharge > 0) { const ch = G.throwCharge; G.throwCharge = 0; playerFire(G.throwA, ch); }
    } else if (I.fire) { const rng = pw(p.weapon).range || 300, gun = WEAPONS[p.weapon].melee === undefined; const a = I.aiming ? (G.settings.assist && gun ? aimMagnet(I.aimA, rng) : I.aimA) : (G.settings.assist && gun ? autoAim(p.a, rng) : p.a); p.a = a; playerFire(a); }
  }
}
function update0(dt) {
  G.t += dt; updateWorldTime(dt);
  Net.update(dt);
  if (G.mode !== 'play') return;
  const p = G.player;
  for (const k of ['godT', 'hurtFlash', 'cashFlash', 'starFlash', 'radioT', 'districtT', 'fade']) if (G[k] > 0) G[k] -= dt;
  if (G.drunk > 0) G.drunk -= dt; if (G.dancing > 0) G.dancing -= dt;
  if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
  for (const m of G.msgs) m.t -= dt; G.msgs = G.msgs.filter(m => m.t > 0);
  if (G.big) { G.big.t -= dt; if (G.big.t <= 0) G.big = null; }
  if (G.tip) { G.tip.t -= dt; if (G.tip.t <= 0) G.tip = null; }
  for (const g in G.gangAggro) if (G.gangAggro[g] > 0 && G.gangAggro[g] < 500) G.gangAggro[g] -= dt;
  if (p.fireCD > 0) p.fireCD -= dt;
  if (p.dead) { if (G.t > G.respawnAt) respawn(); }
  else controlPlayer(dt);
  Input.clearEdges();
  if (!G.scene) {
    spawnCity(dt);
    for (const c of G.cars) { if (c.ai) updateCarAI(c, dt); updateCar(c, dt); if (c.dead) c.deadT = (c.deadT || 0) + dt; }
    for (let i = 0; i < G.cars.length; i++) for (let j = i + 1; j < G.cars.length; j++) carCarCollide(G.cars[i], G.cars[j]);
    const rc = Net.remoteCars(); if (pCar()) for (const r of rc) carCarCollide(pCar(), r);
    for (const c of G.cars) for (const r of rc) if (c !== pCar() && dist2(c.x, c.y, r.x, r.y) < 1e4) carCarCollide(c, r);
    carPedHits(G.cars.concat(rc));
    for (const q of G.peds) { if (!q.dead) updatePedAI(q, dt); updatePedMove(q, dt); }
    pedsSeparate(G.peds);
    if (!p.car) updatePedMove(p, dt);
    // player vs peds separation
    if (!p.car) for (const q of G.peds) { if (q.dead) continue; const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy, rr = p.r + q.r; if (d2 < rr * rr && d2 > .01) { const d = Math.sqrt(d2), o = (rr - d) / 2; p.x += dx / d * o; p.y += dy / d * o; q.x -= dx / d * o; q.y -= dy / d * o; } }
    garageCheck(); updateDealers(dt); updateBirds(dt); updateRuralSpots(dt);
    for (const pr of W.props) if (pr.spray > 0) { pr.spray -= dt; if (inView(pr.x, pr.y, 50)) for (let i = 0; i < 2; i++) spawnFx('water', pr.x + rnd(-3, 3), pr.y); }
    // district name
    const fa = farmAt(p.x, p.y), dn = inCoop(p.x, p.y) ? 'Big Valley Farm Co-op' : fa && owned(fa.b) ? fa.b.name : inBase(p.x, p.y) ? 'Fort Varro' : DISTRICTS[districtAt(p.x, p.y)].name; if (dn !== G.district) { G.district = dn; G.districtT = 3; }
  } else {
    const s = G.scene;
    for (const q of s.peds) { if (!q.dead) updatePedAI(q, dt); updatePedMove(q, dt); }
    updatePedMove(p, dt);
    for (const q of s.peds) { if (q.dead || q.still || q.sit || q.lie) continue; const dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy, rr = p.r + q.r; if (d2 < rr * rr && d2 > .01) { const d = Math.sqrt(d2), o = (rr - d) / 2; p.x += dx / d * o; p.y += dy / d * o; q.x -= dx / d * o; q.y -= dy / d * o; } }
    if (p.y > (s.h - .7) * T && Math.abs(p.x - s.door.x) < T * .7 && !p.dead) { if (G.t >= (G.bldCD || 0)) exitBuilding(); else p.y = Math.min(p.y, (s.h - .75) * T); }
  }
  updateProj(dt); updateFx(dt); updatePickups(dt); if (G.lightning > 0) G.lightning -= dt * 2.5;
  // wanted
  wantedUpdate(dt); navUpdate(dt); worldTick(dt); lifeTick(dt); combatTick(dt); animalTick(dt); reportTick(dt); cityTick(dt); meetTick(dt); parkLifeTick(dt); stealthTick(dt); insideLifeTick(dt); casinoTick(dt); drugTick(dt);
  if (G.mission && G.mission.update && !p.dead) G.mission.update(dt);
  // camera
  updateCamera(dt);
  // audio
  Snd.listener.x = G.cam.x; Snd.listener.y = G.cam.y;
}
function carPedHits(cars) {
  const pl = G.player;
  for (const c of cars) {
    const sp = c.remote ? Math.hypot(c.vx, c.vy) : c.spd; if (sp < 25) continue;
    const cc = c.remote ? [[c.x, c.y]] : c.circles(), rad = c.remote ? c.L / 2 : c.W / 2;
    const targets = G.peds.concat(pl && !pl.car && !pl.dead ? [pl] : []);
    for (const q of targets) {
      if (q.dead && sp < 120) continue; if (dist2(q.x, q.y, c.x, c.y) > (c.L / 2 + 14) ** 2) continue;
      for (const [x, y] of cc) {
        const dx = q.x - x, dy = q.y - y, d2 = dx * dx + dy * dy, rr = rad + q.r; if (d2 >= rr * rr) continue;
        const d = Math.sqrt(d2) || 1, nx = dx / d, ny = dy / d;
        const vn = c.vx * nx + c.vy * ny;
        q.x = x + nx * rr; q.y = y + ny * rr;
        if (vn > 70 && !q.dead) {
          const by = c.remote ? c.owner : c.driver === pl ? pl : c.driver ? (c.driverPed || null) : null;
          if (q === pl) { if (c === pCar()) continue; if (c.remote && (!G.settings.pvp || c.owner.pm)) continue; if (G.t - (pl.carHitT || -9) > .7) { pl.carHitT = G.t; hurtPlayer(Math.min(70, vn * .1 * Math.sqrt(c.mass || 1)), by, 'car'); } }
          else q.hurt(vn * .2 * (c.mass || 1), by, 'car');
          q.kx += c.vx * .7 + nx * 120; q.ky += c.vy * .7 + ny * 120; Snd.play('thud', q.x, q.y, .8); if (vn > 220) { q.air = Math.min(1, vn / 600); q.wasAir = 1; q.spin = rnd(-9, 9); }
          if (!c.remote) { c.vx *= .96; c.vy *= .96; }
        } else if (q.dead) { q.kx += c.vx * .4; q.ky += c.vy * .4; }
        break;
      }
    }
  }
}
function updateCamera(dt) {
  const p = G.player, cam = G.cam, c = pCar();
  const base = Math.min(VW, VH) / (7.6 * T) * (G.settings.zoom || 1) * (VH > VW * 1.15 ? .84 : 1);
  let tx = p.x, ty = p.y, tz = base;
  if (c) { tx = c.x + c.vx * .38; ty = c.y + c.vy * .38; tz = base * lerp(.95, .58, clamp(c.spd / 650, 0, 1)); }
  if (G.scene) { const s = G.scene; tz = VH > VW * 1.15 ? base * 1.12 : Math.max(base * .7, Math.min(base * 1.1, Math.min(VW / ((s.w + .5) * T), VH / ((s.h + .3) * T)))); tx = clamp(tx, Math.min(s.w * T / 2, VW / 2 / tz - T), Math.max(s.w * T / 2, s.w * T - VW / 2 / tz + T)); ty = clamp(ty, Math.min(s.h * T / 2, VH / 2 / tz - T), Math.max(s.h * T / 2, s.h * T - VH / 2 / tz + T)); }
  const k = 1 - Math.exp(-dt * (c ? 5 : 7));
  if (G.snapCam) { cam.x = tx; cam.y = ty; cam.z = tz; G.snapCam = 0; }
  cam.x = lerp(cam.x, tx, k); cam.y = lerp(cam.y, ty, k); cam.z = lerp(cam.z, tz, 1 - Math.exp(-dt * 2.2));
  if (cam.shake > 0) cam.shake = Math.max(0, cam.shake - dt * 25);
}
