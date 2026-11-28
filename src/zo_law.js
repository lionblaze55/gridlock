// ================= LAW II: surrender & arrest (cops warn before they shoot), charges and fines · titles ==================
// ---------- rap sheet ----------
function crime(sev, label) { const h0 = G.heat, r0 = (G.reports || []).length; crimeT(sev, label); if (G.heat > h0 + .001 || (G.reports || []).length > r0) { const R = G.rap || (G.rap = []); const k = label || 'Disorderly conduct', e = R.find(x => x.k === k); if (e) { e.n++; e.sev = Math.max(e.sev, sev); } else R.push({ k, n: 1, sev }); } }
const FINES = [[/killing a cop/i, 6000], [/murder/i, 2000], [/assault/i, 700], [/armed robbery/i, 1500], [/stealing a police|jacking a cop/i, 1800], [/grand theft/i, 800], [/drug/i, 1200], [/title fraud/i, 1000], [/chop/i, 900], [/gunfire|shots/i, 500], [/robbery|safecracking|burglary/i, 900], [/theft/i, 300], [/vandal/i, 200], [/trespass/i, 150], [/wire fraud/i, 600]];
function chargeFine(e) { for (const [re, f] of FINES) if (re.test(e.k)) return f * e.n; return Math.round(Math.max(100, e.sev * 500) / 50) * 50 * e.n; }
// ---------- when do cops open fire? only if you're a real threat — otherwise they come to arrest you ----------
function plArmed() { const p = G.player, w = WEAPONS[p.weapon]; return p.weapon > 0 && w && !w.melee && !p.car; }
function copMayShoot(cop, st) {
  if (G.surrender) return false; if (cop.hostile) return true; const shot = G.t - (G.pShotT || -99) < 10, armed = plArmed();
  if (armed) { if (!G.armedT) G.armedT = G.t; } else G.armedT = 0;
  if (st >= 5) return true; if (shot) return st >= 2; if (st >= 4) return armed || !!G.player.car; if (st >= 3) return armed && G.t - G.armedT > 3.5; return false;
}
// ---------- surrender ----------
const copsNear = r => { const p = G.player; return G.peds.some(q => !q.dead && (q.role === 'cop' || q.role === 'swat') && dist2(q.x, q.y, p.x, p.y) < r * r) || (!G.scene && G.cars.some(c => !c.dead && (c.type === 'cop' || c.type === 'swat') && c.siren > 0 && dist2(c.x, c.y, p.x, p.y) < r * r)); };
const canSurrender = () => G.mode === 'play' && stars() > 0 && !G.player.dead && !G.scene && copsNear(520);
function toggleSurrender() {
  if (G.surrender) return; if (!canSurrender()) return; G.surrender = { t: G.t }; const p = G.player; p.weapon = 0; G.sitting = null; Snd.play('ui');
  for (const q of G.peds) if ((q.role === 'cop' || q.role === 'swat') && !q.dead && !q.hostile) { if (q.state === 'fight') { q.state = 'chase'; q.target = null; } if (dist2(q.x, q.y, p.x, p.y) < 400 * 400 && Math.random() < .6) pedSay(q, pick(['Keep your hands up!', 'Don\'t move!', 'On your knees!', 'Easy… stay right there.'])); }
  msg('You put your hands up. Stay still and the cops will take you in.', '#7fdbff');
}
function controlPlayerL(dt) {
  const S = G.surrender, p = G.player; if (!S) { controlPlayerK(dt); const c = pCar(); if (c && (c.noEng || (c.missing && !drivable(c.type, c.missing, c.noEng)))) { c.throttle = 0; if (G.t > (G.noEngT || 0)) { G.noEngT = G.t + 4; toast(c.noEng ? 'No engine — fit one in your garage' : 'Missing ' + missText(c.type, c.missing, 0) + ' — fit it in your garage'); } } return; }
  if (p.dead || stars() === 0 || G.scene) { G.surrender = null; return controlPlayerK(dt); }
  const I = Input, mag = Math.hypot(I.mx || 0, I.my || 0);
  if ((mag > .55 || I.fire || I.gas) && G.t - S.t > .6) { G.surrender = null; crime(.8, 'Resisting arrest'); msg('You ran — resisting arrest!', '#ff6b6b'); return controlPlayerK(dt); }
  p.mvx = p.mvy = 0; if (p.car) { p.car.throttle = 0; p.car.brake = 1; p.car.steer = 0; }
  if (G.t - S.t > 1.2) G.arrest += dt * .9 * (copsNear(160) ? 1 : 0);
  I.edge.act = false;
}
// hands-up pose
function drawPed(p) { drawPedZ(p); if (p === G.player && G.surrender && !p.car && !p.dead) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.scale(1.3, 1.3); ctx.fillStyle = p.skin || '#e0ac69'; ctx.beginPath(); ctx.arc(-2, -9, 2.4, 0, TAU); ctx.arc(-2, 9, 2.4, 0, TAU); ctx.fill(); ctx.restore(); } }
// ---------- HUD button + cop warnings ----------
function drawLawHUDL(sc) {
  drawLawHUD0(sc); if (!canSurrender() && !G.surrender) return;
  hudPill({ k: 'law', pri: 60, label: G.surrender ? 'HANDS UP…' : '🙌 SURRENDER', on: !!G.surrender, col: '#7fdbff', fn: G.surrender ? null : toggleSurrender });
}
function lawTick(dt) {
  if ((G.lawT = (G.lawT || 0) - dt) > 0) return; G.lawT = 1.5; const p = G.player; if (!p || p.dead || stars() === 0 || G.scene) return;
  for (const q of G.peds) { if (q.dead || !(q.role === 'cop' || q.role === 'swat') || q.state !== 'chase' || G.surrender) continue; const d2 = dist2(q.x, q.y, p.x, p.y); if (d2 < 360 * 360 && G.t > (q.warnT || 0) && losClear(q.x, q.y, p.x, p.y)) { q.warnT = G.t + rnd(4, 7); pedSay(q, plArmed() ? pick(['Drop the weapon!', 'Put the gun down — NOW!', 'Weapon down or we shoot!']) : pick(['Freeze! Police!', 'Hands where I can see them!', 'Stop right there!', 'Get on the ground!'])); if (!LIFE().surTip) { LIFE().surTip = 1; msg('Tip: tap SURRENDER (or press X) to give yourself up — smaller fine and less time.', '#7fdbff'); } break; } }
}
// ---------- getting booked ----------
function busted() { G.bustInfo = { sur: !!G.surrender, rap: (G.rap || []).slice(), st: stars() }; G.surrender = null; return bustedB(); }
function respawn() {
  const B = G.bustInfo, police = G.respawnKind === 'police'; if (!police || !B) { G.bustInfo = null; G.rap = []; return respawnB(); }
  const p = G.player, ammo = p.ammo.slice(), clip = p.clip.slice(), cash0 = G.cash, bank0 = G.bank;
  respawnB(); G.cash = cash0; G.bank = bank0; // we bill it ourselves
  let total = B.rap.reduce((s, e) => s + chargeFine(e), 0); if (!total) total = 250 * Math.max(1, B.st); const cap = 2500 * Math.max(1, B.st), capped = total > cap; total = Math.min(total, cap); total = Math.round(total * (B.sur ? .65 : 1) / 10) * 10;
  const fromCash = Math.min(G.cash, total), fromBank = Math.min(G.bank, total - fromCash), unpaid = total - fromCash - fromBank; G.cash -= fromCash; G.bank -= fromBank;
  const hrs = clamp(Math.round(total / 1200), 1, 12) * (B.sur ? .5 : 1); G.tod = (G.tod + hrs) % 24;
  if (B.sur) { p.ammo = ammo; p.clip = clip; } // you complied: they hand your gear back
  const lines = B.rap.length ? B.rap.map(e => '• ' + e.k + (e.n > 1 ? ' ×' + e.n : '') + ' — ' + money(chargeFine(e))).join('\n') : '• Evading police — ' + money(250 * Math.max(1, B.st));
  say('SVPD Booking', `${B.sur ? 'You surrendered peacefully — fines cut by a third. Your gear was returned.' : 'You were taken down resisting. Your gear was returned on release.'}\n\nCharges:\n${lines}\n\nTotal fine: ${money(total)}${capped ? ' (capped at ' + money(cap) + ' for a ' + Math.max(1, B.st) + '-star bust)' : ''}${B.sur ? ' (after −35%)' : ''}${unpaid > 0 ? '\nCouldn\'t cover ' + money(unpaid) + ' — the court waived the rest. This time.' : ''}\nTime in a cell: ${hrs} hour${hrs === 1 ? '' : 's'}.`);
  G.bustInfo = null; G.rap = []; doSave(true);
}
function callOffCops() { callOffCopsL(); G.rap = []; G.surrender = null; }
// ---------- titles: honest paperwork through a mechanic (pricey, safe) or forged at a chop shop (cheap, risky) ----------
function forgeTitle(c) { const M = VMK(), F = M.forges = (M.forges || []).filter(t => M.clock - t < 900), fee = r50(Math.max(100, mktValue(c.type, c.mods, 1, 1) * .07)), risk = Math.min(.9, .2 + .18 * F.length);
  return { fee, risk, go: () => { if (!payCash(fee)) return; F.push(M.clock); if (Math.random() < risk) { crime(1.6, 'Title fraud'); G.heat = Math.max(G.heat, 1.05 + .7 * F.length); G.starFlash = 2; markSeen(); msg('Somebody tipped off the cops about the forgery!', '#ff6b6b'); } else { c.legit = 1; c.forged = 1; msg('Forged papers — the ' + c.d.name + ' now has a "clean" title.', '#2ecc71'); } } }; }
