// ================= EXHAUST VOICES: stock is muffled, sport burbles, a straight pipe is raw & crackly, a race system screams and backfires =================
const EXHP = [
  // muf: muffler (main engine lowpass ×) · rum: low rumble gain · rumLP: rumble tone · rasp: high-rev rasp amount · rf: rasp harmonic · drv: distortion · crk: off-throttle crackle per second · spit: on-throttle spits at high revs · big: share of big bangs
  { muf: .55, rum: .5, rumLP: 170, rasp: 0, rf: 2, drv: 1, crk: 0, spit: 0, big: 0, rough: 0 },
  { muf: .95, rum: 1.5, rumLP: 210, rasp: .55, rf: 2, drv: 4, crk: 1.6, spit: 0, big: .1, rough: .15 },
  { muf: 1.7, rum: 2.4, rumLP: 520, rasp: .95, rf: 1.5, drv: 22, crk: 7, spit: 1.4, big: .25, rough: .55 },
  { muf: 1.45, rum: 1.6, rumLP: 300, rasp: 1.25, rf: 3, drv: 9, crk: 4.5, spit: 2.2, big: .45, rough: .2 }];
function shapeCurve(k) { const n = 1024, a = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; a[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return a; }
Snd.exhLoops = function () { const c = this.ctx, L = this.L; if (L.rasp) return;
  const o = c.createOscillator(), o2 = c.createOscillator(); o.type = 'sawtooth'; o2.type = 'square'; o2.detune.value = 14;
  const ws = c.createWaveShaper(); ws.curve = shapeCurve(4); ws.oversample = '2x'; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.6; const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 220;
  const mix = c.createGain(); mix.gain.value = .5; const g = c.createGain(); g.gain.value = 0; o.connect(mix); o2.connect(mix); mix.connect(ws); ws.connect(bp); bp.connect(hp); hp.connect(g); g.connect(this.sfx); o.start(); o2.start();
  // choppy amplitude for lumpy idles (straight pipe)
  const am = c.createGain(); am.gain.value = 1; g.disconnect(); g.connect(am); am.connect(this.sfx); const lfo = c.createOscillator(); lfo.type = 'square'; const lg = c.createGain(); lg.gain.value = 0; lfo.connect(lg); lg.connect(am.gain); lfo.start();
  L.rasp = { o, o2, ws, bp, g, lfo, lg, k: 4, crkT: 0 }; };
{ const upd = Snd.update; Snd.update = function (dt) { upd.call(this, dt); if (!this.ctx || !this.L.engine) return; this.exhLoops(); const c = this.ctx, t = c.currentTime, L = this.L, R = L.rasp, E = L.exh, e = L.engine, set = (p, v, k) => p.setTargetAtTime(v, t, k || .05);
  const car = G.mode === 'play' ? pCar() : null;
  if (!car || car.dead || car.d.pedal || car.st.ev || car.d.boat || G.scene && !car) { set(R.g.gain, 0, .08); set(R.lg.gain, 0); return; }
  const m = car.mods || {}, ex = clamp(m.exh | 0, 0, 3), P = EXHP[ex], rpm = e.lastRpm || 0, thr = car.throttle > 0 ? car.throttle : 0, ty = car.type;
  const base = car.st.eb || car.d.eb || (ty === 'truck' || ty === 'swat' ? 24 : ty === 'van' || ty === 'pickup' ? 30 : ty === 'sports' ? 44 : ty === 'muscle' ? 30 : 36), f = base + rpm * base * 2.4;
  // muffler: re-voice the main engine tone
  set(e.f.frequency, (260 + rpm * 1000 + (thr ? 400 : 0) + (ty === 'sports' ? 500 : 0)) * P.muf, .06);
  // low rumble / burble
  if (E) { set(E.lp.frequency, P.rumLP + rpm * (ex === 2 ? 700 : 260) + ex * 40, .08); set(E.g.gain, (.02 + .03 * P.rum) * (.45 + rpm * .55 + thr * .4) * (car.d.two ? .7 : 1), .07); }
  // rasp & scream that climbs hard with revs
  if (R.k !== P.drv) { R.ws.curve = shapeCurve(P.drv); R.k = P.drv; }
  set(R.o.frequency, f * P.rf, .03); set(R.o2.frequency, f * P.rf * 1.003, .03); set(R.bp.frequency, f * P.rf * 2 + 500 + rpm * (ex === 3 ? 2600 : 1200), .05);
  set(R.g.gain, P.rasp * (.006 + .07 * Math.pow(rpm, 2.2)) * (thr ? 1 : .3) * (1 + (car.st.loud || 0)), .05);
  // lumpy idle
  set(R.lfo.frequency, Math.max(4, f * .25 + Math.sin(t * 3.1) * 1.5), .1); set(R.lg.gain, P.rough * (1 - rpm) * .6, .1);
  // crackle on the overrun, spits under load at the top of the rev range, limiter bounce
  const off = thr === 0 && rpm > .32 && Math.abs(car.fwd) > 40, top = thr > .6 && rpm > .82;
  if (off && P.crk && Math.random() < dt * P.crk) { const big = Math.random() < P.big; this.pop(car.x, car.y, big, big ? .9 : .5 + Math.random() * .3); if (big && ex >= 2 && !G.scene) spawnFx('fire', car.x - Math.cos(car.a) * (car.L / 2 + 5), car.y - Math.sin(car.a) * (car.L / 2 + 5)); }
  if (top && P.spit && Math.random() < dt * P.spit) this.pop(car.x, car.y, Math.random() < P.big * .5, .55);
  if (ex >= 2 && thr > .9 && rpm > .97 && Math.random() < dt * 6) this.pop(car.x, car.y, false, .45); }; }
// pops get their own character too: straight pipe = sharp crack, race = deep bang
{ const pop0 = Snd.pop; Snd.pop = function (x, y, big, v) { pop0.call(this, x, y, big, v); if (!this.ctx) return; const car = pCar(), ex = car && dist2(car.x, car.y, x, y) < 40 * 40 ? (car.mods || {}).exh | 0 : 0; if (ex < 2) return; const a = this.att(x, y) * (v || 1); if (a < .02) return; const t = this.ctx.currentTime, o = this.out(x, y);
  if (ex === 2) this.nz(.025, rnd(2400, 4200), 'highpass', .35 * a, t, 0, o); else if (big) this.tone('sine', 70, 30, .22, .45 * a, t, o); }; }
