// ================= heat that reacts to how you act =================
// The stars still say how hard the city wants you, but now there are two kinds of heat behind them:
//  • LOCAL PD — noise, speeding, theft, property damage, fistfights. Patrol cars and beat cops, no SWAT, no chopper.
//  • TACTICAL — gunfire, killings, armed robbery, explosives, heavy weapons. SWAT vans and teams roll from 2★,
//    and the police chopper only joins at 5★ when it's tactical.
// Gangs don't care about the law: they care about what happens on their turf in front of their people.
const TAC_RE = /gunfire|shots|murder|killing|armed robbery|explos|rocket|grenade|tank|heavy weapon|assaulting an officer|cop/i;
const heatTac = () => (G.heatT || 0) >= 1 && (G.heatT || 0) >= G.heat * .4;
function swatOdds(st, car) { if (!heatTac()) return st >= 5 ? .1 : 0; return st >= 4 ? (car ? .5 : .55) : st >= 2 ? (car ? .3 : .35) : 0; }
{ const _c = crime; crime = function (sev, label) { const h0 = G.heat, p = G.player; const r = _c(sev, label); const dh = Math.max(0, G.heat - h0);
  if (dh > 0) { if (TAC_RE.test(label || '') || (!label && sev >= 1.5)) G.heatT = Math.min(5.99, (G.heatT || 0) + dh); else G.heatL = Math.min(5.99, (G.heatL || 0) + dh); }
  // gangs: violence on their turf, seen by their own people, is personal
  if (p && !G.scene && /gunfire|shots|murder|assault|killing/i.test(label || '') && typeof facGangAt === 'function') { const g = facGangAt(p.x, p.y);
    if (g && G.peds.some(q => q.gang === g && !q.dead && dist2(q.x, q.y, p.x, p.y) < 520 * 520 && losClear(q.x, q.y, p.x, p.y))) { const F = FAC()[g]; if (F) { F.hunt = Math.min(6, F.hunt + (/murder|killing/i.test(label) ? .35 : .1)); if (!G.facWarnT || G.t - G.facWarnT > 30) { G.facWarnT = G.t; toast('The ' + GANGS[g].name + ' saw that — this is their turf.'); } } } }
  return r; }; }
{ const _u = update; update = function (dt) { _u(dt); if (stars() === 0) { G.heatT = Math.max(0, (G.heatT || 0) - dt * .1); G.heatL = Math.max(0, (G.heatL || 0) - dt * .1); } else { const k = G.heat / Math.max(.01, (G.heatT || 0) + (G.heatL || 0)); if (k < 1) { G.heatT *= k; G.heatL *= k; } } }; }
// callOffCops wipes both kinds
{ const _co = callOffCops; callOffCops = function () { G.heatT = 0; G.heatL = 0; return _co.apply(this, arguments); }; }

// ---------- corrupt officers ----------
// About one cop in four is on the take. They're the ones eyeing your wallet: they'll take a bribe up to 3★ and for
// most things short of murder, and they take it far more often. A straight cop rarely does.
function copCorrupt(q) { if (q.corrupt === undefined) q.corrupt = q.role === 'cop' && !q.swat && ((q.uid * 2654435761) >>> 0) % 100 < 26 ? 1 : 0; return q.corrupt; }

// ---------- HUD: what kind of heat, and who else is hunting you ----------
// the tags shown with the wanted stars: who is after you, and whether your description is out
function threatLines() { const lines = [];
  if (stars() > 0) lines.push(heatTac() ? ['🛡 SWAT RESPONSE', STAR_TAC] : ['🚓 POLICE', STAR_LOCAL]);
  if (typeof FAC === 'function') { const F = FAC(); for (const g in F) if (F[g].hunt >= 1.5 || (G.gangAggro[g] || 0) > 0) lines.push(['☠ ' + GANGS[g].name, GANGS[g].col === '#111' ? '#ccc' : GANGS[g].col]); }
  if (typeof descLines === 'function') lines.push(...descLines());
  return lines; }

// ---------- colour-coded stars ----------
// One scale: the number of stars is how hard the city is coming for you. The colour of the whole row says who:
// blue = police only (local heat), red = it's gone tactical and SWAT is cleared to roll.
const STAR_LOCAL = '#4fa3ff', STAR_TAC = '#ff4d4d';
function starCol() { return heatTac() ? STAR_TAC : STAR_LOCAL; }
