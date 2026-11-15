// ================= PRICE PASS 2: property, weapons and gear on the same realistic scale as cars =================
{ const WP = { pistol: [400, 30], uzi: [1000, 70], shotgun: [700, 45], molotov: [50, 40], rocket: [9000, 1200], rifle: [1400, 90], bolt: [1000, 60], sniper: [3000, 140], knife: [60, 0] };
  for (const w of WEAPONS) { const s = WP[w.id]; if (s) { w.price = s[0]; w.ammoPrice = s[1]; } }
  const IV = { vest: 400, medkit: 60, bandage: 12, repairkit: 150, rod: 90, supplies: 70 }; for (const k in IV) if (ITEMS[k]) ITEMS[k].v = IV[k]; }
// real estate: homes, businesses and clubs ×2, labs ×1.25 (business & club takings scale with price, so payback time is unchanged)
{ const _er = econRealty; econRealty = function () { _er(); if (!W || !W.realty || W._econ2 || !W._econ) return; W._econ2 = 1; const X = {}; for (const r of W.realty) if (X[r.kind]) r.price = Math.round(r.price * X[r.kind] / 1000) * 1000; }; }
// ---------- shop vs DIY: a shop charges parts + labor + markup; doing it yourself is parts only ----------
const LABOR = 1.25, SHOPREP = 2.2; // installs: part + 25% labor (min $100) · repairs: about 2.2× what the same fix costs you in your own garage
const shopFit = pr => pr ? Math.round(Math.max(pr + 100, pr * LABOR) / 50) * 50 : 0;
function shopRepair(c) { if (!c.st) return 0; ensurePC(c, c.type, c.hp / c.st.hp); let diy = 0; for (const s in c.pc || {}) if (c.pc[s] < .95) diy += repairCost(slotPrice(s, c.type, c.mods), c.pc[s]); const body = (1 - c.hp / c.st.hp) > .01 ? 1 : 0; return body || diy ? Math.round(Math.max(150, diy * SHOPREP) / 10) * 10 : 0; }
function shopRepairDo(c) { if (c.pc) for (const s in c.pc) if (c.pc[s] < .95) c.pc[s] = .95; c.pcAvg = undefined; applyMods(c); }
