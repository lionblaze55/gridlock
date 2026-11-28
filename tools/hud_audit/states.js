// each state: name -> setup code (run in page). All start from a fresh "base" reset.
window.__HS = {
  base() { if (window.__undo) { try { __undo(); } catch (e) { } window.__undo = null; } const p = G.player; G.bi = null; G.bac = 0; G.reports.length = 0; for (const g in G.gangAggro) G.gangAggro[g] = 0; if (Net.room) { Net.feed.push({ text: 'Player64 joined', col: '#7fdbff', t: 6 }); Net.feed.push({ text: 'Player64: anyone near the docks want to race for pinks?', col: '#fff', t: 6 }); } G.godT = 1e9; G.heat = 0; G.mission = null; G.msgs = []; G.toast = null; G.big = null; G.hkOn = false; G.hkSel = null; G.surrender = 0; G.districtT = 0; G.radioT = 0; if (pCar()) exitCar(true); if (G.scene) { try { exitInterior(); } catch (e) { } } p.sneak = false; p.armor = 0; G.bank = 0; G.nav = null; G.settings.minimap = 1; G.tip = null;
    p.x = 8300; p.y = 4224; G.cars = G.cars.filter(c => dist2(c.x, c.y, p.x, p.y) > 200 * 200); G.peds = G.peds.filter(q => q === p || dist2(q.x, q.y, p.x, p.y) > 160 * 160); G.cash = 123456; },
  foot() { __HS.base(); },
  footFull() { __HS.base(); const p = G.player; giveWeapon('pistol', 99); giveWeapon('uzi', 200); p.weapon = WI.pistol; p.armor = 60; G.bank = 2500000;
    const c = new Car('sedan', p.x + 36, p.y, 0); c.ai = { mode: 'parked' }; G.cars.push(c); const q = new Ped(p.x - 26, p.y, {}); q.still = 1; G.peds.push(q); msg('GPS set: Maple Grove — get in a vehicle to see the route on the road.', '#ff4fd8'); msg('Bought 5 × Bandage', '#fff'); toast('🥷 Sneaking — slow and quiet'); G.districtT = 3; G.district = G.district || 'Downtown'; },
  wanted() { __HS.footFull(); G.heat = 3.2; G.lastSeen = G.t; const p = G.player; const q = new Ped(p.x + 60, p.y + 30, { role: 'cop' }); G.peds.push(q); G.gangAggro.reapers = 60; },
  sneak() { __HS.footFull(); G.player.sneak = true; const p = G.player; const q = new Ped(p.x + 24, p.y, {}); q.a = 0; q.still = 1; G.peds.push(q); p.a = 0; },
  hack() { __HS.footFull(); G.hkOn = true; const p = G.player; const q = new Ped(p.x + 70, p.y - 40, {}); q.still = 1; G.peds.push(q); window.__after = () => { const t = (G.hkList || []).find(t => t.k === 'ped') || (G.hkList || [])[0]; if (t) G.hkSel = t; }; },
  car() { __HS.base(); const p = G.player; giveWeapon('pistol', 99); giveWeapon('uzi', 99); const c = new Car('sports', p.x, p.y, 0); c.ai = null; applyMods(c, { nos: 1 }); c.nos = 2; G.cars.push(c); enterCar(c); G.radioT = 3; G.radioName = G.radioName || 'San Varro FM'; msg('GPS set: Airport', '#ff4fd8'); },
  carWanted() { __HS.car(); G.heat = 4.3; G.lastSeen = G.t; },
  carClassic() { __HS.car(); G.settings.drive = 'classic'; },
  mission() { __HS.footFull(); G.mission = { title: 'Deliver the package to the docks before the buyer leaves', hud() { return 'Deliver the package to the docks before the buyer leaves'; }, timer: 87, target: { x: G.player.x + 5000, y: G.player.y } }; G.big = { text: 'MISSION PASSED', sub: '+$5,000 · respect up', col: '#f2c230', t: 2.2 }; },
  everything() { __HS.wanted(); const p = G.player; G.hkOn = true; p.sneak = true; p.a = 0; const q = new Ped(p.x + 24, p.y, {}); q.a = 0; q.still = 1; G.peds.push(q); G.reports.push({ t: G.t + 20 }); G.bac = .14; G.bi = { c: G.cars.find(c => c.ai && c.ai.mode === 'parked' && dist2(c.x, c.y, p.x, p.y) < 90 * 90), stage: 'pick', t: 1, need: 3, x: p.x, y: p.y };
    G.mission = { title: 'Tail the van without being spotted', hud() { return 'Tail the van without being spotted'; }, timer: 44, target: { x: p.x + 5000, y: p.y - 900 } }; window.__after = () => { const t = (G.hkList || []).find(t => t.k === 'ped') || (G.hkList || [])[0]; if (t) G.hkSel = t; G.player.x = 8300; G.player.y = 4224; if (G.bi) G.bi.t = 1; }; },
  hackWanted() { __HS.wanted(); const p = G.player; G.hkOn = true; p.sneak = true; p.a = 0; const q = new Ped(p.x + 24, p.y, {}); q.a = 0; q.still = 1; G.peds.push(q); G.reports.push({ t: G.t + 20 }); window.__after = () => { const t = (G.hkList || []).find(t => t.k === 'ped') || (G.hkList || [])[0]; if (t) G.hkSel = t; G.player.x = 8300; G.player.y = 4224; }; },
  kbd() { __HS.hackWanted(); Input.kbd = true; window.__undo = () => { Input.kbd = false; }; },
  breakin() { __HS.footFull(); const p = G.player; G.bi = { c: G.cars.find(c => c.ai && c.ai.mode === 'parked' && dist2(c.x, c.y, p.x, p.y) < 90 * 90), stage: 'pick', t: 1, need: 3, x: p.x, y: p.y }; },
  plane() { __HS.base(); const p = G.player; const c = new Car('cessna', p.x, p.y, 0); c.ai = null; G.cars.push(c); enterCar(c); },
  interior() { __HS.footFull(); const p = G.player, b = W.buildings.filter(b => b.door).sort((x, y) => dist2(x.door.x, x.door.y, p.x, p.y) - dist2(y.door.x, y.door.y, p.x, p.y))[0]; enterBuilding(b); msg('Welcome back', '#fff'); },
  bigMap() { __HS.wanted(); G.settings.miniSize = 2; window.__undo = () => { G.settings.miniSize = 0; }; },
  noMap() { __HS.wanted(); G.settings.minimap = 0; G.reports.push({ t: G.t + 20 }); window.__undo = () => { G.settings.minimap = 1; G.reports.length = 0; }; },
  bigBtns() { __HS.everything(); G.settings.ctrlScale = 1.18; window.__undo = () => { G.settings.ctrlScale = 1; }; },
  carBig() { __HS.car(); G.settings.ctrlScale = 1.18; G.settings.drive = 'classic'; G.hkOn = true; G.heat = 2.4; window.__undo = () => { G.settings.ctrlScale = 1; }; },
  net() { __HS.footFull(); },
};
