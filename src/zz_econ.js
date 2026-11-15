// ================= ECONOMY REBALANCE: cars, parts, property and pay on one sensible scale =================
// target private-sale value of a mint, titled, stock vehicle; CARVAL is stored so that mktValue (CARVAL × 1.86) lands on it
{ const V = { bmx: 130, skate: 40, scooter: 640, bike: 2000, dirtbike: 1700, quad: 2200, sportbike: 5000, supermoto: 3600, cafe: 4500, cruiser: 6100, touring: 7700, chopper: 8700, hyperbike: 15900,
    compact: 2400, minitruck: 2800, sedan: 4000, taxi: 3200, van: 4800, jeep: 6400, suv: 7700, pickup: 5800, workpick: 8200, pickup4: 12200, muscle: 13800, sports: 20100, luxsedan: 25400, luxsuv: 29700, coupe: 33900, roadster: 46600, super: 100700, hyper: 222600,
    limo: 22300, cop: 17000, ambulance: 24400, boxtruck: 14800, truck: 19100, dump: 24400, bus: 32900, firetruck: 66200, swat: 50400, armored: 79500, tractor: 9500, dinghy: 1700, speedboat: 24400, trawler: 38200, jetski: 5000, tank: 318000 };
  for (const t in V) CARVAL[t] = Math.round(V[t] / 1.86); }
// parts: performance mods ×1.5, engines ×2, stock mechanical parts ×1.6 (cosmetics stay put)
for (const k of ['eng', 'tur', 'nos', 'brk', 'hnd', 'arm', 'trn', 'exh', 'ecu', 'wgt', 'drv', 'tyr', 'swp'].concat(typeof MOTOK !== 'undefined' ? MOTOK : [])) if (MODOPTS[k]) for (const o of MODOPTS[k].o) if (o[1]) o[1] = Math.round(o[1] * 1.5 / 50) * 50;
for (const id of ['eng_i4', 'eng_i4t', 'eng_v6', 'eng_v8', 'eng_sc8', 'eng_ev', 'eng_bike']) if (ITEMS[id]) ITEMS[id].v = Math.round(ITEMS[id].v * 2 / 50) * 50;
for (const id of ['gearbox', 'wheelset', 'exhaustp', 'panels', 'wiring', 'seats']) if (ITEMS[id]) ITEMS[id].v = Math.round(ITEMS[id].v * 1.6 / 10) * 10;
// honest work and missions pay more; street gigs a bit more
for (const J of JOBS) if (J.pay) J.pay = Math.round(J.pay * 1.5);
for (const g of GIGS) if (g.pay) g.pay = g.pay.map(v => Math.round(v * 1.5));
{ const _sm = startMission; startMission = function (m) { if (m && !m.job && typeof m.reward === 'number' && !m._econ) { m.reward = Math.round(m.reward * 1.5 / 50) * 50; m._econ = 1; } return _sm(m); }; }
// drugs follow the pricier labs; fines follow the bigger paychecks
for (const d of DRUGS) d.base = Math.round(d.base * 1.2);
for (const f of FINES) f[1] = Math.round(f[1] * 1.3);
// real estate, scaled once per world (business & club takings are a share of the price, so payback time stays the same)
const REALTY_X = { home: 4, biz: 3, club: 3, lab: 2, farm: 2.5 };
function econRealty() { if (!W || !W.realty || W._econ) return; W._econ = 1; for (const r of W.realty) { const k = REALTY_X[r.kind] || 2; r.price = Math.round(r.price * k / 1000) * 1000; } }
{ const _u = update; update = function (dt) { econRealty(); _u(dt); }; }
// ---------- realistic price sheet (absolute, overrides the multipliers above) ----------
{ const SET = { eng: [0, 500, 1200, 2700, 5400, 7200], tur: [0, 2100, 5400, 6600], brk: [0, 400, 950, 2700], tyr: [0, 350, 850, 550, 1300], trn: [0, 700, 1800], exh: [0, 250, 0, 1100], ecu: [0, 400, 1800, 2700, 3900], hnd: [0, 500, 1100, 3000], nos: [0, 900, 1700], arm: [0, 700, 1500, 2700, 9000], wgt: [0, 550, 1500], drv: [0, 2100, 1200] };
  for (const k in SET) if (MODOPTS[k]) MODOPTS[k].o.forEach((o, i) => { if (SET[k][i] !== undefined) o[1] = SET[k][i]; });
  const R = MODOPTS.rim && MODOPTS.rim.o.find(o => /magnesium/i.test(o[0])); if (R) R[1] = 2700;
  const EV = { eng_i4: 1500, eng_i4t: 2700, eng_v6: 3300, eng_v8: 4800, eng_sc8: 8400, eng_ev: 7200, eng_bike: 1100 }; for (const id in EV) if (ITEMS[id]) ITEMS[id].v = EV[id];
  const MV = { gearbox: 900, wheelset: 150, exhaustp: 350, panels: 500, wiring: 300, seats: 350 }; for (const id in MV) if (ITEMS[id]) ITEMS[id].v = MV[id];
  if (MODOPTS.swp) MODOPTS.swp.o.forEach((o, i) => { const e = ENGS[i]; if (i && e && ITEMS[e.id]) o[1] = Math.round(ITEMS[e.id].v * 1.25 / 50) * 50; }); }
