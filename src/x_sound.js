// ================= SOUND II: per-vehicle horns, exhaust rumble & crackle, turbo spool/blow-off, word-driven voices =================
// ---------- horns ----------
const HORNS = {
  car: { f: [415, 494], w: 'square', bp: 1500, q: 1.4, v: .2 },
  compact: { f: [523, 622], w: 'square', bp: 1900, q: 1.6, v: .17 },
  sports: { f: [440, 554], w: 'square', bp: 1700, q: 1.5, v: .2 },
  muscle: { f: [370, 466], w: 'sawtooth', bp: 1300, q: 1.2, v: .22 },
  van: { f: [349, 415], w: 'square', bp: 1200, q: 1.3, v: .21 },
  air: { f: [185, 233, 277], w: 'sawtooth', bp: 900, q: .9, v: .26, air: 1 },
  bike: { f: [392], w: 'square', bp: 2100, q: 2, v: .15 },
  scoot: { f: [880], w: 'square', bp: 2400, q: 2, v: .12 },
  bell: { bell: 1, v: .2 },
  boat: { f: [110, 139], w: 'sawtooth', bp: 500, q: .8, v: .3, air: 1 },
};
function hornKind(c) { if (!c) return 'car'; const t = c.type, d = c.d || {}; if (d.boat) return 'boat'; if (d.pedal) return 'bell'; if (t === 'scooter') return 'scoot'; if (d.two || d.rider) return 'bike';
  if (['truck', 'boxtruck', 'bus', 'firetruck', 'garbage', 'armored', 'tank', 'swat', 'semi'].includes(t)) return 'air'; if (['van', 'pickup', 'jeep', 'ambulance'].includes(t)) return 'van';
  if (t === 'compact' || t === 'taxi') return 'compact'; if (t === 'muscle') return 'muscle'; if (t === 'sports') return 'sports'; return 'car'; }
let HSHAPE = null;
Snd.hornTone = function (kind, dur, x, y, v) {
  if (!this.ctx) return; const c = this.ctx, a = this.att(x, y) * (v === undefined ? 1 : v); if (a < .02) return; const H = HORNS[kind] || HORNS.car, t = c.currentTime, o = this.out(x, y);
  if (H.bell) { for (let i = 0; i < 2; i++) { this.tone('triangle', 2637, 2600, .5, .12 * a, t + i * .16, o); this.tone('sine', 3951, 3900, .35, .06 * a, t + i * .16, o); } return; }
  if (!HSHAPE) { HSHAPE = new Float32Array(256); for (let i = 0; i < 256; i++) { const x2 = i / 128 - 1; HSHAPE[i] = Math.tanh(x2 * 3); } }
  const ws = c.createWaveShaper(); ws.curve = HSHAPE; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = H.bp; bp.Q.value = H.q; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = H.air ? 2400 : 4200;
  const g = c.createGain(), d = Math.max(.08, dur); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(H.v * a, t + (H.air ? .06 : .012)); g.gain.setValueAtTime(H.v * a, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + (H.air ? .18 : .06));
  const pre = c.createGain(); pre.gain.value = .5; pre.connect(ws); ws.connect(bp); bp.connect(lp); const dry = c.createGain(); dry.gain.value = .35; ws.connect(dry); dry.connect(lp); lp.connect(g); g.connect(o);
  for (const f of H.f) { const os = c.createOscillator(); os.type = H.w; const det = 1 + (Math.random() - .5) * .012; os.frequency.setValueAtTime(f * det * (H.air ? .9 : .97), t); os.frequency.exponentialRampToValueAtTime(f * det, t + (H.air ? .12 : .03)); os.connect(pre); os.start(t); os.stop(t + d + .3); }
};
// a honk "gesture": a tap, a double tap, or leaning on it
Snd.honk = function (c, mood, v) { const k = hornKind(c), x = c ? c.x : undefined, y = c ? c.y : undefined;
  if (mood === 'tap') this.hornTone(k, .12, x, y, v); else if (mood === 'double') { this.hornTone(k, .1, x, y, v); setTimeout(() => this.hornTone(k, .14, c ? c.x : x, c ? c.y : y, v), 170); }
  else if (mood === 'lean') this.hornTone(k, rnd(.7, 1.3), x, y, v); else this.hornTone(k, .38, x, y, v); };
const playS0 = Snd.play;
Snd.play = function (n, x, y, v) {
  if (n === 'horn' && this.ctx) { let best = null, bd = 60 * 60; if (x !== undefined) for (const c of G.cars) { const d = dist2(c.x, c.y, x, y); if (d < bd) { bd = d; best = c; } }
    const k = best ? hornKind(best) : 'car', mood = best && best.ai && best.ai.flee ? pick(['lean', 'double']) : best && best.driver && best.driver !== G.player ? pick(['tap', 'double', 'tap', 'norm']) : 'norm';
    if (best) return this.honk(best, mood, v); return this.hornTone(k, .38, x, y, v); }
  return playS0.call(this, n, x, y, v);
};
// ---------- exhaust rumble, pops & crackles, turbo ----------
Snd.carLoops = function () { const c = this.ctx, L = this.L; if (L.exh) return;
  { const s = this.loopSrc(this.brown), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 260; lp.Q.value = 2; const am = c.createGain(); am.gain.value = .5; const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 30; const lg = c.createGain(); lg.gain.value = .5; lfo.connect(lg); lg.connect(am.gain); const g = c.createGain(); g.gain.value = 0; s.connect(lp); lp.connect(am); am.connect(g); g.connect(this.sfx); lfo.start(); L.exh = { lp, lfo, g }; }
  { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 2000; const g = c.createGain(); g.gain.value = 0; o.connect(g); g.connect(this.sfx); o.start(); const s = this.loopSrc(this.noise), bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3000; bp.Q.value = 6; const g2 = c.createGain(); g2.gain.value = 0; s.connect(bp); bp.connect(g2); g2.connect(this.sfx); L.turbo = { o, g, bp, g2, boost: 0 }; }
};
Snd.pop = function (x, y, big, v) { if (!this.ctx) return; const c = this.ctx, a = this.att(x, y) * (v || 1); if (a < .02) return; const t = c.currentTime, o = this.out(x, y);
  this.nz(big ? .14 : .05, big ? 700 : rnd(900, 1700), 'bandpass', (big ? .9 : .45) * a, t, big ? .8 : 1.4, o); this.tone('sine', big ? 95 : 140, big ? 38 : 60, big ? .16 : .06, (big ? .7 : .3) * a, t, o); if (big) this.nz(.3, 300, 'lowpass', .3 * a, t + .02, 0, o); };
Snd.blowoff = function (x, y, flutter) { if (!this.ctx) return; const c = this.ctx, a = this.att(x, y); if (a < .02) return; const t = c.currentTime, o = this.out(x, y);
  if (!flutter) { const f = this.nz(.42, 2400, 'bandpass', .6 * a, t, 1.6, o, .01); f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(5200, t + .35); }
  else for (let i = 0; i < 7; i++) this.nz(.045, 1800 - i * 90, 'bandpass', .55 * a * (1 - i / 9), t + i * .042, 2, o); };
const updS0 = Snd.update;
Snd.update = function (dt) { updS0.call(this, dt); if (!this.ctx) return; this.carLoops(); const c = this.ctx, t = c.currentTime, L = this.L, set = (p, v, k) => p.setTargetAtTime(v, t, k || .06);
  const car = G.mode === 'play' ? pCar() : null, E = L.exh, TU = L.turbo;
  if (car && !car.dead && !car.d.pedal && !car.st.ev && !car.d.boat) {
    const m = car.mods || {}, ex = exhTier(car), tur = m.tur | 0, e = L.engine, rpm = e.lastRpm || 0, thr = car.throttle > 0 ? car.throttle : 0;
    const base = car.st.eb || car.d.eb || 36, fire = (base + rpm * base * 2.4) * (car.d.two ? 1 : .5);
    set(E.lfo.frequency, Math.max(8, fire), .04); set(E.lp.frequency, 180 + rpm * 260 + ex * 70, .08);
    set(E.g.gain, (.03 + ex * .035 + (car.type === 'muscle' ? .04 : 0)) * (.45 + rpm * .55 + thr * .4), .07);
    // turbo boost builds with throttle at revs, bleeds off fast
    if (tur) { TU.boost = clamp(TU.boost + (thr > .4 && rpm > .35 ? dt * 1.4 : -dt * 4), 0, 1); set(TU.o.frequency, 1600 + TU.boost * 4600 + rpm * 600, .05); set(TU.g.gain, TU.boost * .03, .05); set(TU.g2.gain, TU.boost * .05, .05); set(TU.bp.frequency, 2500 + TU.boost * 3500, .05); }
    else { TU.boost = 0; set(TU.g.gain, 0); set(TU.g2.gain, 0); }
    // lift-off: blow-off valve, then crackle & pop from the tailpipe
    const lifted = (car.sndThr || 0) > .5 && car.throttle <= 0 && rpm > .55;
    if (lifted) { if (tur && TU.boost > .45) this.blowoff(car.x, car.y, m.liv === 2 || (car.uid || 0) % 3 === 0); TU.boost = 0;
      const n = [0, 2, 4, 8][ex] + (car.type === 'muscle' || car.type === 'sports' ? 1 : 0); for (let i = 0; i < n; i++) setTimeout(() => { const cc = pCar(); if (!cc) return; this.pop(cc.x, cc.y, ex >= 2 && Math.random() < .2, .8); if (ex >= 2 && Math.random() < .35 && !G.scene) spawnFx('fire', cc.x - Math.cos(cc.a) * (cc.L / 2 + 5), cc.y - Math.sin(cc.a) * (cc.L / 2 + 5)); }, 60 + Math.random() * 650); }
    if (e.gear > (car.sndGear || 1) && thr > .5 && ex >= 2 && Math.random() < .6) this.pop(car.x, car.y, false, .7); car.sndGear = e.gear; car.sndThr = car.throttle;
  } else { set(E.g.gain, 0, .1); set(TU.g.gain, 0, .05); set(TU.g2.gain, 0, .05); if (TU) TU.boost = 0; }
  // tuned AI cars nearby (race rivals, meet cars) crackle on the overrun too
  if (G.mode === 'play' && !G.scene) for (const k of G.cars) { if (k === car || !k.driver || k.dead || !k.mods || exhTier(k) + (k.mods.tur | 0) < 1 || dist2(k.x, k.y, this.listener.x, this.listener.y) > 900 * 900) continue; if ((k.sndThr || 0) > .5 && k.throttle <= 0 && k.spd > 150) { if (k.mods.tur && Math.random() < .5) this.blowoff(k.x, k.y, Math.random() < .4); for (let i = 0; i < 3; i++) setTimeout(() => this.pop(k.x, k.y, false, .6), 80 + Math.random() * 500); } k.sndThr = k.throttle; }
};
// ---------- voices driven by the words being said ----------
const VF = { a: [730, 1090, 2440], e: [530, 1840, 2480], i: [300, 2200, 2950], o: [520, 920, 2400], u: [330, 1000, 2350], y: [400, 2000, 2600], '@': [500, 1450, 2450] };
const FRIC = { s: [5500, 4], z: [5000, 4], f: [4000, 1], v: [3500, 1], h: [1500, .5], c: [5200, 3], x: [5000, 3], j: [2600, 3] }, STOP = { p: 900, b: 600, t: 3200, d: 2500, k: 1800, g: 1500, q: 1800 }, NAS = { m: 260, n: 300 };
Snd.speak = function (text, pitch, x, y, v) {
  if (!this.ctx || !text) return; const c = this.ctx, a = this.att(x, y) * (v === undefined ? 1 : v); if (a < .03) return; const now = c.currentTime; if (now < (this.talkUntil || 0) - .2 && x === undefined) return;
  const s = text.toLowerCase().replace(/[^a-z!?.,' ]/g, ''), shout = /!/.test(text), ask = /\?\s*["”']?$/.test(text.trim()); let P = pitch || 130; if (shout) P *= 1.15;
  // syllables: onset consonants + vowel nucleus
  const syl = []; let on = ''; for (let i = 0; i < s.length && syl.length < 11; i++) { const ch = s[i]; if (ch === ' ' || ch === ',' || ch === '.') { if (ch !== ' ' && syl.length) syl[syl.length - 1].pause = 1; on = ''; continue; } if ('aeiouy'.includes(ch)) { const nx = s[i + 1]; syl.push({ on, v: 'aeiouy'.includes(nx || '') ? (ch === 'o' && nx === 'u' ? 'u' : ch === 'e' && nx === 'e' ? 'i' : ch) : ch }); on = ''; if ('aeiouy'.includes(nx || '')) i++; } else on += ch; }
  if (!syl.length) syl.push({ on: 'h', v: 'u' });
  const fk = P > 165 ? 1.17 : 1, o = this.out(x, y), t0 = now + .01, sd = shout ? .1 : .125; let t = t0; const total = syl.reduce((s2, q) => s2 + sd + (q.pause ? .09 : 0), 0);
  const src = c.createOscillator(); src.type = 'sawtooth'; const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.5; vg.gain.value = P * .02; vib.connect(vg); vg.connect(src.frequency);
  const br = c.createBufferSource(); br.buffer = this.noise; const brg = c.createGain(); brg.gain.value = .06;
  const vgain = c.createGain(); vgain.gain.setValueAtTime(.0001, t0); const F = [0, 1, 2].map(i => { const b = c.createBiquadFilter(); b.type = 'bandpass'; b.Q.value = [6, 9, 11][i]; const g = c.createGain(); g.gain.value = [1, .55, .22][i]; vgain.connect(b); b.connect(g); g.connect(o); return b; });
  src.connect(vgain); br.connect(brg); brg.connect(vgain);
  const amp = (shout ? .5 : .34) * a;
  src.frequency.setValueAtTime(P * (shout ? 1.12 : 1.05), t0);
  syl.forEach((q, i) => { const k = i / Math.max(1, syl.length - 1), last = i === syl.length - 1;
    // consonant onset
    for (const ch of q.on.slice(-2)) { if (FRIC[ch]) this.nz(.07, FRIC[ch][0] * (fk > 1 ? 1.08 : 1), 'bandpass', .14 * a, t, FRIC[ch][1], o, .01); else if (STOP[ch]) this.nz(.025, STOP[ch], 'bandpass', .22 * a, t, 1.5, o); }
    const nas = [...q.on].some(ch => NAS[ch]), ct = q.on ? .035 : 0, vs = t + ct, ve = t + sd + (q.pause ? .02 : 0);
    // pitch contour: declination, emphasis on the first syllable, rise for questions
    const pf = P * (ask && last ? 1.35 : (1.05 - k * .2) * (i === 0 && shout ? 1.12 : 1) * (1 + (Math.random() - .5) * .08));
    src.frequency.linearRampToValueAtTime(pf, vs + (ve - vs) * .6);
    const tgt = VF[q.v] || VF['@']; F.forEach((b, j) => b.frequency.linearRampToValueAtTime(tgt[j] * fk * (nas && j === 0 ? .7 : 1), vs + .03));
    vgain.gain.setTargetAtTime(nas ? amp * .5 : amp * .25, t, .008); vgain.gain.setTargetAtTime(amp * (last ? .9 : 1), vs, .012); vgain.gain.setTargetAtTime(amp * (q.pause || last ? .02 : .35), ve - .03, .02);
    t = ve + (q.pause ? .07 : 0); });
  vgain.gain.setTargetAtTime(.0001, t, .03); src.start(t0); vib.start(t0); br.start(t0, Math.random()); for (const n of [src, vib, br]) n.stop(t + .25); this.talkUntil = t; return total;
};
function pedSay(p, s) { p.say = s; p.sayT = 2.5; p.sayAge = 0; Snd.speak(s, p.vp, p.x, p.y, .9); }
