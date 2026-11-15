// ================= AUDIO ENGINE =================
const Snd = {
  ctx: null, master: null, sfx: null, mus: null, amb: null, noise: null, brown: null, vol: store.get('gl_vol', .8), mvol: store.get('gl_mvol', .5), avol: store.get('gl_avol', .7),
  listener: { x: 0, y: 0 }, L: {}, timers: {}, lastVoice: 0,
  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      const c = this.ctx = new AC();
      const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(c.destination);
      this.master = c.createGain(); this.master.connect(comp);
      this.sfx = c.createGain(); this.sfx.gain.value = this.vol; this.sfx.connect(this.master);
      this.mus = c.createGain(); this.mus.gain.value = this.mvol * .5; this.mus.connect(this.master);
      this.amb = c.createGain(); this.amb.gain.value = this.avol * this.vol; this.amb.connect(this.master);
      // noise buffers
      const len = c.sampleRate * 2, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; this.noise = b;
      const bb = c.createBuffer(1, len, c.sampleRate), bd = bb.getChannelData(0); let last = 0;
      for (let i = 0; i < len; i++) { last = (last + .02 * (Math.random() * 2 - 1)) / 1.02; bd[i] = last * 3.5; } this.brown = bb;
      // echo (outdoors) + reverb (indoors)
      const dl = c.createDelay(1); dl.delayTime.value = .21; const fb = c.createGain(); fb.gain.value = .3; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200;
      this.echoSend = c.createGain(); this.echoSend.gain.value = .2; this.sfx.connect(this.echoSend); this.echoSend.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(this.master);
      const conv = c.createConvolver(), ir = c.createBuffer(2, c.sampleRate * 1.4, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) { const x = ir.getChannelData(ch); for (let i = 0; i < x.length; i++) x[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / x.length, 2.6); }
      conv.buffer = ir; this.revSend = c.createGain(); this.revSend.gain.value = 0; this.sfx.connect(this.revSend); this.revSend.connect(conv); conv.connect(this.master);
      this.musRev = c.createGain(); this.musRev.gain.value = 0; this.mus.connect(this.musRev); this.musRev.connect(conv);
      this.buildLoops();
    } catch (e) { this.ctx = null; }
  },
  loopSrc(buf) { const s = this.ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = Math.random(); s.start(0, Math.random()); return s; },
  buildLoops() {
    const c = this.ctx, L = this.L;
    const chain = (src, nodes, dest) => { let n = src; for (const x of nodes) { n.connect(x); n = x; } n.connect(dest); return n; };
    const flt = (type, f, q) => { const x = c.createBiquadFilter(); x.type = type; x.frequency.value = f; if (q) x.Q.value = q; return x; };
    const gain = v => { const g = c.createGain(); g.gain.value = v; return g; };
    // engine
    { const o1 = c.createOscillator(), o2 = c.createOscillator(), o3 = c.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square'; o3.type = 'sine';
      const f = flt('lowpass', 500, 1.5), g = gain(0), g2 = gain(.45), g3 = gain(.7); o1.connect(f); o2.connect(g2); g2.connect(f); o3.connect(g3); g3.connect(g); f.connect(g); g.connect(this.sfx); [o1, o2, o3].forEach(o => o.start());
      L.engine = { o1, o2, o3, f, g, gear: 1, lastRpm: 0 }; }
    // siren
    { const o = c.createOscillator(); o.type = 'square'; const f = flt('lowpass', 1800), g = gain(0); o.connect(f); f.connect(g); g.connect(this.sfx); o.start(); L.siren = { o, g }; }
    // tire squeal, nitrous roar
    { const s = this.loopSrc(this.noise), f = flt('bandpass', 1900, 4), g = gain(0); chain(s, [f, g], this.sfx); L.skid = { g, f }; }
    { const s = this.loopSrc(this.noise), f = flt('bandpass', 700, 1.2), g = gain(0); chain(s, [f, g], this.sfx); L.nos = { g, f }; }
    // ambience
    { const s = this.loopSrc(this.brown), f = flt('lowpass', 220), g = gain(0); chain(s, [f, g], this.amb); L.traffic = { g }; }
    { const s = this.loopSrc(this.noise), f1 = flt('highpass', 900), f2 = flt('lowpass', 6500), g = gain(0); chain(s, [f1, f2, g], this.amb); L.rain = { g, f2 }; }
    { const s = this.loopSrc(this.brown), f = flt('lowpass', 520), g = gain(0), lfo = c.createOscillator(), lg = gain(.5); lfo.frequency.value = .13; lfo.connect(lg); const mg = gain(.5); lg.connect(mg.gain); chain(s, [f, mg, g], this.amb); lfo.start(); L.waves = { g }; }
    { const s = this.loopSrc(this.noise), f = flt('bandpass', 950, 1.6), g = gain(0), mg = gain(.6), l1 = c.createOscillator(), lg = gain(.35); l1.frequency.value = .7; l1.connect(lg); lg.connect(mg.gain); l1.start(); chain(s, [f, mg, g], this.amb); L.crowd = { g }; }
    { const o = c.createOscillator(); o.frequency.value = 4300; const am = gain(0), l1 = c.createOscillator(); l1.type = 'square'; l1.frequency.value = 17; const lg = gain(.5); l1.connect(lg); lg.connect(am.gain); const l2 = c.createOscillator(); l2.frequency.value = .45; const l2g = gain(.5); l2.connect(l2g); const g = gain(0); const ag = gain(.5); l2g.connect(ag.gain); o.connect(am); am.connect(ag); ag.connect(g); g.connect(this.amb); [o, l1, l2].forEach(x => x.start()); L.crickets = { g }; }
    { const s = this.loopSrc(this.noise), f = flt('bandpass', 1100, .8), g = gain(0); chain(s, [f, g], this.amb); L.fire = { g }; }
    { const o = c.createOscillator(); o.type = 'sawtooth'; const f = flt('lowpass', 400), g = gain(0); o.connect(f); f.connect(g); g.connect(this.sfx); o.start(); L.pass = { o, g, f }; }
  },
  setVol(v) { this.vol = v; store.set('gl_vol', v); if (this.sfx) { this.sfx.gain.value = v; this.amb.gain.value = this.avol * v; } },
  setMVol(v) { this.mvol = v; store.set('gl_mvol', v); if (this.mus) this.mus.gain.value = v * .5; },
  setAVol(v) { this.avol = v; store.set('gl_avol', v); if (this.amb) this.amb.gain.value = v * this.vol; },
  att(x, y) { if (x === undefined) return 1; const d = dist(x, y, this.listener.x, this.listener.y); return clamp(1 - d / 1500, 0, 1) ** 1.3; },
  out(x, y) { const c = this.ctx; if (x === undefined || !c.createStereoPanner) return this.sfx; const p = c.createStereoPanner(); p.pan.value = clamp((x - this.listener.x) / 700, -1, 1) * .75; p.connect(this.sfx); return p; },
  nz(dur, freq, type, vol, t0, q, dest, atk) {
    const c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise; s.playbackRate.value = .7 + Math.random() * .6;
    const f = c.createBiquadFilter(); f.type = type || 'lowpass'; f.frequency.value = freq; if (q) f.Q.value = q;
    const g = c.createGain(), t = t0 || c.currentTime;
    if (atk) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); } else g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.sfx); s.start(t, Math.random()); s.stop(t + dur + .05); return f;
  },
  tone(type, f0, f1, dur, vol, t0, dest, atk) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), t = t0 || c.currentTime;
    o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(f1, 1), t + dur);
    if (atk) { g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + atk); } else g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + .05); return o;
  },
  play(n, x, y, v) {
    if (!this.ctx) return; const vv = v === undefined ? 1 : v, a = this.att(x, y) * vv; if (a <= .01) return;
    const t = this.ctx.currentTime, o = this.out(x, y), nz = (d, f, ty, vo, t0, q, at) => this.nz(d, f, ty, vo * a, t0 || t, q, o, at), tn = (ty, f0, f1, d, vo, t0, at) => this.tone(ty, f0, f1, d, vo * a, t0 || t, o, at);
    switch (n) {
      case 'rifle': nz(.13, 2000, 'bandpass', .85, 0, .7); tn('sine', 150, 48, .11, .65); nz(.4, 800, 'lowpass', .1, t + .03); break;
      case 'supp': nz(.07, 3200, 'bandpass', .22, 0, 2); tn('sine', 190, 90, .05, .14); break;
      case 'bolt': case 'boltbig': nz(.22, n === 'boltbig' ? 1300 : 1700, 'bandpass', 1, 0, .6); tn('sine', n === 'boltbig' ? 110 : 140, 36, .2, .8); nz(.9, 600, 'lowpass', .16, t + .04); nz(.04, 3200, 'bandpass', .3, t + .42, 5); nz(.05, 1900, 'bandpass', .35, t + .58, 4); tn('sine', 2400, 1800, .02, .08, t + .6); break;
      case 'suppb': nz(.09, 2600, 'bandpass', .3, 0, 2); tn('sine', 160, 70, .06, .18); nz(.04, 3200, 'bandpass', .25, t + .42, 5); nz(.05, 1900, 'bandpass', .3, t + .58, 4); break;
      case 'reload': nz(.05, 2600, 'bandpass', .4, 0, 4); nz(.06, 1400, 'bandpass', .45, t + .35, 3); tn('sine', 2000, 1500, .03, .1, t + .36); break;
      case 'moo': { const o1 = tn('sawtooth', 150, 105, 1, .16, 0, .15); nz(1, 500, 'bandpass', .1, 0, 2, .2); break; }
      case 'pistol': nz(.18, 2400, 'bandpass', .9, 0, .7); tn('sine', 170, 45, .14, .7); nz(.5, 900, 'lowpass', .12, t + .03); break;
      case 'uzi': nz(.08, 2800, 'bandpass', .6, 0, .8); tn('sine', 150, 60, .06, .35); break;
      case 'shotgun': nz(.38, 1300, 'lowpass', 1.2); tn('sine', 120, 38, .25, .9); nz(.9, 600, 'lowpass', .18, t + .05); setTimeout(() => this.play('pump', x, y, vv), 380); break;
      case 'pump': nz(.06, 2000, 'bandpass', .4, 0, 3); nz(.07, 1500, 'bandpass', .4, t + .12, 3); break;
      case 'rocket': nz(.9, 500, 'bandpass', .7, 0, .5, .05); tn('sawtooth', 90, 40, .4, .2); break;
      case 'throw': nz(.22, 700, 'bandpass', .35, 0, 2); break;
      case 'ignite': nz(.7, 1400, 'lowpass', .7, 0, 0, .04); tn('sine', 80, 50, .5, .4); break;
      case 'boom': nz(1.6, 360, 'lowpass', 1.5); tn('sine', 72, 22, 1.1, 1.1); nz(.25, 3000, 'highpass', .4); setTimeout(() => this.play('debris', x, y, vv * .7), 250); break;
      case 'debris': for (let i = 0; i < 7; i++) nz(.06, 1500 + Math.random() * 2500, 'bandpass', .25, t + i * .07 + Math.random() * .05, 3); break;
      case 'punch': nz(.08, 650, 'lowpass', .9); tn('sine', 130, 55, .07, .6); break;
      case 'whoosh': nz(.14, 1000, 'bandpass', .25, 0, 1.5, .03); break;
      case 'flesh': nz(.07, 500, 'lowpass', .5); break;
      case 'ric': { const f = 1800 + Math.random() * 2600; tn('sine', f, f * .55, .25, .12); nz(.05, 4000, 'highpass', .25); break; }
      case 'clank': tn('square', 420 + Math.random() * 200, 300, .12, .12); nz(.08, 2500, 'bandpass', .35, 0, 4); break;
      case 'tink': for (let i = 0; i < 2; i++) tn('sine', 5200 + Math.random() * 1500, 5000, .05, .06, t + i * .09); break;
      case 'cock': nz(.04, 3000, 'bandpass', .45, 0, 4); nz(.05, 2200, 'bandpass', .45, t + .08, 4); break;
      case 'empty': tn('square', 2400, 2400, .02, .12); break;
      case 'hurt': tn('square', 300, 140, .12, .12); break;
      case 'crash': nz(.32, 900, 'bandpass', 1.1, 0, .6); nz(.14, 3200, 'highpass', .35); tn('sine', 90, 40, .2, .5); if (Math.random() < .5) setTimeout(() => this.play('glass', x, y, vv * .5), 60); break;
      case 'thud': nz(.13, 280, 'lowpass', .9); tn('sine', 90, 45, .1, .5); break;
      case 'clang': tn('triangle', 620, 580, .5, .2); tn('triangle', 940, 900, .4, .12); nz(.06, 3000, 'bandpass', .3, 0, 3); break;
      case 'pickup': tn('square', 660, 660, .08, .14); tn('square', 990, 990, .12, .14, t + .08); break;
      case 'heal': [523, 659, 784, 1046].forEach((f, i) => tn('triangle', f, f, .14, .18, t + i * .06)); break;
      case 'armor': tn('triangle', 300, 300, .25, .2); tn('square', 600, 1200, .2, .06, t + .05); nz(.2, 3000, 'bandpass', .3, t, 6); break;
      case 'cash': tn('triangle', 1320, 1320, .06, .25); tn('triangle', 1760, 1760, .25, .25, t + .06); nz(.05, 6000, 'highpass', .2, t + .02); break;
      case 'trainhorn': tn('sawtooth', 220, 210, 1.4, .14); tn('sawtooth', 277, 265, 1.4, .12); tn('sawtooth', 330, 318, 1.4, .1); break;
      case 'horn': tn('square', 330, 330, .4, .16); tn('square', 415, 415, .4, .13); break;
      case 'door': tn('sine', 180, 85, .15, .5); nz(.1, 400, 'lowpass', .4); break;
      case 'bell': tn('sine', 1318, 1318, .5, .2); tn('sine', 1046, 1046, .7, .2, t + .22); break;
      case 'cardoor': nz(.08, 900, 'bandpass', .5, 0, 1.5); tn('sine', 140, 60, .12, .5, t + .05); break;
      case 'start': { const e = this.ctx; for (let i = 0; i < 4; i++) nz(.07, 300, 'lowpass', .5, t + i * .09); tn('sawtooth', 40, 90, .5, .25, t + .36, .05); break; }
      case 'blowoff': nz(.25, 3500, 'bandpass', .35, 0, 2, .01); break;
      case 'shift': tn('square', 1800, 1800, .015, .03); break;
      case 'nos': nz(.5, 400, 'lowpass', .7, 0, 0, .02); tn('sawtooth', 60, 140, .4, .25); break;
      case 'ui': tn('square', 880, 880, .035, .07); break;
      case 'pop': tn('sine', 500, 900, .06, .12); break;
      case 'bark': tn('sawtooth', 430, 250, .09, .3); nz(.07, 900, 'bandpass', .3); tn('sawtooth', 410, 240, .09, .26, t + .16); break;
      case 'meow': tn('triangle', 650, 1050, .13, .2); tn('triangle', 1050, 560, .26, .18, t + .12); break;
      case 'cluck': for (let i = 0; i < 3; i++) tn('square', 950, 600, .045, .1, t + i * .09); break;
      case 'oink': nz(.2, 520, 'bandpass', .45, 0, 6); tn('sawtooth', 190, 130, .2, .18); break;
      case 'bad': tn('square', 220, 110, .25, .15); break;
      case 'ring': for (let i = 0; i < 6; i++) tn('square', 1400 + (i % 2) * 140, 1400, .045, .06, t + i * .06); break;
      case 'beep': tn('square', 1600, 1600, .06, .08); tn('square', 1600, 1600, .06, .08, t + .1); break;
      case 'clunk': nz(.12, 400, 'lowpass', .6, t + .2); nz(.4, 5000, 'highpass', .25, t + .5, 0, .02); break;
      case 'munch': for (let i = 0; i < 3; i++) nz(.06, 1200, 'bandpass', .3, t + i * .14, 2); break;
      case 'splash': nz(.7, 1600, 'highpass', .45); nz(.4, 500, 'lowpass', .3); break;
      case 'glass': nz(.25, 5200, 'highpass', .5); for (let i = 0; i < 4; i++) tn('sine', 3000 + Math.random() * 3000, 2500, .08, .05, t + Math.random() * .15); break;
      case 'flush': nz(1.4, 600, 'bandpass', .5, 0, .4, .1); break;
      case 'spray': nz(1.1, 5500, 'highpass', .35, 0, 0, .05); break;
      case 'ratchet': for (let i = 0; i < 6; i++) nz(.025, 3500, 'bandpass', .4, t + i * .055, 6); break;
      case 'rev': tn('sawtooth', 60, 220, .5, .25, 0, .03); tn('sawtooth', 220, 70, .5, .22, t + .5); break;
      case 'zap': tn('sawtooth', 2400, 300, .15, .12); tn('square', 120, 120, .2, .05, t + .05); break;
      case 'grinder': nz(1.2, 3800, 'bandpass', .5, 0, 3, .05); tn('sawtooth', 1200, 900, 1.1, .05); setTimeout(() => this.play('crash', x, y, vv * .8), 800); break;
      case 'rustle': nz(.25, 2500, 'bandpass', .3, 0, .8, .03); break;
      case 'whistle': tn('sine', 2400, 2500, .25, .2); tn('sine', 2400, 2600, .5, .2, t + .3); break;
      case 'starup': tn('sawtooth', 220, 220, .35, .12); tn('sawtooth', 233, 233, .35, .1); tn('sawtooth', 330, 330, .35, .08); break;
      case 'starlost': [392, 494, 587].forEach((f, i) => tn('triangle', f, f, .5, .12, t + i * .05)); break;
      case 'wasted': tn('sawtooth', 220, 55, 1.8, .3); tn('sawtooth', 330, 82, 1.8, .2); nz(1.5, 300, 'lowpass', .4, 0, 0, .3); break;
      case 'mission': [523, 659, 784, 1046].forEach((f, i) => { tn('square', f, f, .16, .12, t + i * .1); tn('triangle', f / 2, f / 2, .3, .12, t + i * .1); }); break;
      case 'complete': [523, 659, 784, 1046, 784, 1046, 1318].forEach((f, i) => tn('square', f, f, .18, .1, t + i * .09)); [262, 330, 392].forEach(f => tn('triangle', f, f, 1, .12, t + .54)); break;
      case 'fail': [392, 330, 262, 196].forEach((f, i) => tn('square', f, f, .22, .12, t + i * .15)); break;
      case 'arcade': for (let i = 0; i < 12; i++) tn('square', 200 + Math.random() * 900, 200 + Math.random() * 900, .07, .08, t + i * .07); break;
      case 'fire': nz(.5, 800, 'lowpass', .25); break;
      case 'thunder': nz(3.5, 180, 'lowpass', 1.2, 0, 0, .1); nz(1.2, 600, 'lowpass', .5, t + .1, 0, .02); break;
      case 'flap': for (let i = 0; i < 6; i++) nz(.05, 900, 'bandpass', .25, t + i * .07, 1.5); break;
      case 'bird': { const f = 2600 + Math.random() * 1600; for (let i = 0; i < 3; i++) tn('sine', f, f * (1.2 + Math.random() * .3), .07, .05, t + i * .1); break; }
      case 'gull': tn('sawtooth', 1300, 900, .35, .04); tn('sawtooth', 1350, 1000, .3, .03, t + .4); break;
      case 'heart': tn('sine', 60, 40, .12, .5); tn('sine', 55, 38, .1, .4, t + .18); break;
      case 'chatter': for (let i = 0; i < 8; i++) nz(.05, 1400 + Math.random() * 800, 'bandpass', .12, t + i * .07, 4); nz(.15, 3000, 'bandpass', .1, t + .6, 2); break;
      case 'whoop': tn('square', 600, 1300, .25, .08); tn('square', 1300, 700, .25, .08, t + .25); break;
      case 'clack': tn('sine', 2200, 1800, .04, .25); break;
      case 'alarm': for (let i = 0; i < 8; i++) tn('square', i % 2 ? 950 : 750, i % 2 ? 950 : 750, .2, .08, t + i * .22); break;
      case 'snore': nz(.8, 300, 'lowpass', .3, 0, 0, .3); break;
      case 'static': nz(.3, 3000, 'bandpass', .3, 0, .4); break;
      case 'skid': nz(.25, 1700, 'bandpass', .18, 0, 3); break;
      case 'step': nz(.035, x === undefined ? 1200 : 900 + Math.random() * 500, 'bandpass', .14, 0, 1.2); break;
    }
  },
  note(f) { if (!this.ctx) return; const t = this.ctx.currentTime; this.tone('triangle', f, f, .9, .25, t); this.tone('sine', f * 2, f * 2, .5, .08, t); },
  // footstep by surface
  step(p) {
    if (!this.ctx) return; const pl = p.isPlayer, a = this.att(p.x, p.y) * (pl ? 1 : .35); if (a < .05) return;
    const t = this.ctx.currentTime, o = this.out(p.x, p.y); let surf = 'hard';
    if (G.scene) surf = { wood: 'wood', carpet: 'soft', dark: 'hard', tile: 'hard', check: 'hard', marble: 'hard', concrete: 'hard' }[G.scene.floor] || 'hard';
    else { const tt = tileAt(Math.floor(p.x / T), Math.floor(p.y / T)); surf = tt === TILE.GRASS || tt === TILE.PATH ? 'soft' : tt === TILE.DOCK ? 'wood' : 'hard'; }
    const run = Math.hypot(p.mvx, p.mvy) > 140 ? 1.3 : 1;
    if (surf === 'hard') this.nz(.04, 1100 + Math.random() * 400, 'bandpass', .16 * a * run, t, 1.3, o);
    else if (surf === 'soft') this.nz(.07, 600, 'lowpass', .12 * a * run, t, 0, o);
    else { this.nz(.05, 500, 'bandpass', .2 * a * run, t, 1.5, o); this.tone('sine', 110, 80, .05, .1 * a, t, o); }
    if (!G.scene && G.weather.rain > .3) this.nz(.08, 2500, 'highpass', .08 * a * G.weather.rain, t, 0, o);
  },
  // formant voice barks
  voice(kind, pitch, x, y, v) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime, a = this.att(x, y) * (v || 1); if (a < .03) return;
    if (kind !== 'babble' && kind !== 'laugh' && t - this.lastVoice < .25) return; if (kind !== 'babble') this.lastVoice = t;
    const o = this.out(x, y), V = { a: [800, 1250], e: [480, 1950], i: [320, 2300], o: [520, 900], u: [360, 820] };
    const make = (vow, f0s, f0e, dur, amp, t0) => {
      const os = c.createOscillator(); os.type = 'sawtooth'; os.frequency.setValueAtTime(f0s, t0); os.frequency.exponentialRampToValueAtTime(f0e, t0 + dur);
      const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 6; vg.gain.value = f0s * .025; vib.connect(vg); vg.connect(os.frequency);
      const g = c.createGain(); g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(amp * a, t0 + .02); g.gain.setValueAtTime(amp * a, t0 + dur * .65); g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
      const [f1, f2] = V[vow], b1 = c.createBiquadFilter(), b2 = c.createBiquadFilter(), g2 = c.createGain(); b1.type = b2.type = 'bandpass'; b1.frequency.value = f1; b2.frequency.value = f2; b1.Q.value = 5; b2.Q.value = 7; g2.gain.value = .55;
      os.connect(b1); b1.connect(g); os.connect(b2); b2.connect(g2); g2.connect(g); g.connect(o);
      os.start(t0); vib.start(t0); os.stop(t0 + dur + .05); vib.stop(t0 + dur + .05);
    };
    const P = pitch || 130;
    switch (kind) {
      case 'scream': make('a', P * 2.6, P * 1.7, .6, .55, t); break;
      case 'hey': make('e', P * 1.35, P * 1.0, .2, .5, t); break;
      case 'grunt': make('u', P * .95, P * .6, .14, .55, t); break;
      case 'ow': make('o', P * 1.6, P * .85, .3, .5, t); break;
      case 'laugh': for (let i = 0; i < 4; i++) make('a', P * 1.5 - i * 6, P * 1.35, .09, .35, t + i * .12); break;
      case 'cheer': make('o', P * 1.2, P * 2, .55, .45, t); break;
      case 'huh': make('a', P, P * 1.45, .2, .4, t); break;
      case 'babble': make(pick(['a', 'e', 'i', 'o', 'u']), P * (1 + Math.random() * .35), P * (.9 + Math.random() * .3), .065, .28, t); break;
    }
  },
  // per-frame loop updates
  update(dt) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime, L = this.L, set = (p, v, k) => p.setTargetAtTime(v, t, k || .08);
    const play = G.mode === 'play', inside = !!G.scene, car = play ? pCar() : null, out = !inside;
    set(this.echoSend.gain, inside ? 0 : .2, .2); set(this.revSend.gain, inside ? .35 : 0, .2); set(this.musRev.gain, inside && !car ? .22 : 0, .3);
    // engine with simulated gears
    const e = L.engine;
    if (car && !car.dead) {
      const d = car.st, frac = clamp(Math.abs(car.fwd) / d.max, 0, 1.3), gears = [0, .16, .34, .54, .76, 1.4];
      let gi = 1; while (gi < 5 && frac > gears[gi]) gi++;
      const rpm = car.burnout ? .86 + Math.random() * .1 : clamp((frac - gears[gi - 1]) / (gears[gi] - gears[gi - 1]), 0, 1) * .75 + .25 * (car.throttle !== 0 ? 1 : .4);
      if (gi > e.gear && car.throttle > 0 && !car.d.pedal && !car.st.ev) { this.play('shift', car.x, car.y, .5); e.dip = .12; }
      e.gear = gi; e.lastRpm = rpm; e.lastThr = car.throttle; if (e.dip > 0) e.dip -= dt;
      const ty = car.type, base = car.st.eb || car.d.eb || (ty === 'truck' || ty === 'swat' ? 24 : ty === 'van' || ty === 'pickup' ? 30 : ty === 'sports' ? 44 : ty === 'muscle' ? 30 : 36);
      const f = base + rpm * base * 2.4 * (e.dip > 0 ? .8 : 1) + (car.nosT > 0 ? 25 : 0);
      set(e.o1.frequency, f, .04); set(e.o2.frequency, f / 2, .04); set(e.o3.frequency, f / 4, .04);
      set(e.f.frequency, 260 + rpm * 1000 + (car.throttle > 0 ? 400 : 0) + (ty === 'sports' ? 500 : 0), .06);
      set(e.g.gain, (car.d.pedal ? 0 : car.st.ev ? .3 : 1) * (1 + (car.st.loud || 0)) * (.07 + rpm * .06 + (car.throttle > 0 ? .03 : 0) + (ty === 'muscle' ? .03 : 0)), .08);
      const fx = Math.cos(car.a), fy = Math.sin(car.a), lat = Math.abs(-car.vx * fy + car.vy * fx);
      const sk = clamp((lat - 110) / 260, 0, 1) + (car.hand && Math.abs(car.fwd) > 100 ? .5 : 0);
      set(L.skid.g.gain, Math.min(.22, sk * .2), .05); set(L.skid.f.frequency, 1500 + lat, .1);
      set(L.nos.g.gain, car.nosT > 0 ? .3 : 0, .08); set(L.nos.f.frequency, car.nosT > 0 ? 900 + Math.sin(t * 20) * 200 : 500, .1);
    } else { set(e.g.gain, 0, .1); set(L.skid.g.gain, 0, .05); set(L.nos.g.gain, 0, .1); }
    // siren (nearest)
    let sir = 0; if (play && out) for (const k of G.cars) if (k.siren > 0 && !k.dead) { const d = dist(k.x, k.y, this.listener.x, this.listener.y); sir = Math.max(sir, clamp(1 - d / 1300, 0, 1)); }
    set(L.siren.g.gain, sir * .05, .2); set(L.siren.o.frequency, 760 + Math.sin(t * (stars() >= 3 ? 9 : 4.5)) * 230, .03);
    // passing traffic doppler (nearest moving AI car)
    let best = null, bd = 380; if (play && out) for (const k of G.cars) { if (k === car || !k.ai || k.dead || k.spd < 60) continue; const d = dist(k.x, k.y, this.listener.x, this.listener.y); if (d < bd) { bd = d; best = k; } }
    if (best) { const dx = this.listener.x - best.x, dy = this.listener.y - best.y, dd = Math.hypot(dx, dy) || 1, vr = (best.vx * dx + best.vy * dy) / dd; set(L.pass.o.frequency, (34 + best.spd * .06) * (1 + vr / 1200), .05); set(L.pass.g.gain, (1 - bd / 380) * .06, .1); } else set(L.pass.g.gain, 0, .2);
    // ambience
    const dk = darkness(), rain = G.weather.rain;
    let nCars = 0; if (out) for (const k of G.cars) if (!k.dead && k.spd > 30 && dist2(k.x, k.y, this.listener.x, this.listener.y) < 9e5) nCars++;
    set(L.traffic.g.gain, play && out ? .05 + Math.min(.12, nCars * .012) : (G.mode === 'menu' ? .08 : .015), .5);
    set(L.rain.g.gain, rain * (inside ? .04 : .16), .5); set(L.rain.f2.frequency, inside ? 1500 : 6500, .3);
    const nearGreen = out && play && (() => { const d = districtAt(this.listener.x, this.listener.y); return d === 'park' || d === 'suburbs' || RURALSET.has(d); })();
    set(L.crickets.g.gain, out && dk > .6 && rain < .3 ? (nearGreen ? .03 : .012) : 0, 1);
    const edge = Math.min(this.listener.x, this.listener.y, N * T - this.listener.x, N * T - this.listener.y), docks = out && (edge < 500 || districtAt(this.listener.x, this.listener.y) === 'docks');
    set(L.waves.g.gain, docks ? .1 * clamp(1 - edge / 900, .3, 1) : 0, .8);
    const crowdT = inside ? { bar: .05, casino: .06, club: .07, strip: .06, diner: .035, arcade: .03, bank: .02, hospital: .015, police: .02, store: .012 }[G.scene.b.type] || 0 : 0; set(L.crowd.g.gain, crowdT, .5);
    let fireN = 0; if (play) { for (const f of G.fires) if (dist2(f.x, f.y, this.listener.x, this.listener.y) < 4e5) fireN++; for (const k of G.cars) if (k.fireT > 0 && dist2(k.x, k.y, this.listener.x, this.listener.y) < 4e5) fireN++; }
    set(L.fire.g.gain, Math.min(.2, fireN * .07) * (.6 + Math.random() * .4), .03);
    // one-shot ambience timers
    const T2 = this.timers, tick = (k, lo, hi, fn) => { T2[k] = (T2[k] === undefined ? rnd(lo, hi) : T2[k]) - dt; if (T2[k] <= 0) { T2[k] = rnd(lo, hi); fn(); } };
    if (play && out) {
      if (dk < .5 && rain < .3) tick('bird', nearGreen ? 2 : 6, nearGreen ? 6 : 16, () => this.play('bird', this.listener.x + rnd(-300, 300), this.listener.y + rnd(-300, 300), .8));
      if (docks) tick('gull', 5, 14, () => this.play('gull', this.listener.x + rnd(-400, 400), this.listener.y, .9));
      tick('horn', 9, 26, () => { const k = pick(G.cars.filter(c2 => c2.ai && !c2.dead) || []); if (k && dist2(k.x, k.y, this.listener.x, this.listener.y) < 1.2e6) this.play('horn', k.x, k.y, .35); });
      if (stars() > 0) tick('chatter', 4, 9, () => this.play('chatter', this.listener.x, this.listener.y, .5));
      if (rain > .75) tick('thunder', 14, 40, () => { G.lightning = 1; setTimeout(() => this.play('thunder'), 400 + Math.random() * 1500); });
      if (!G.mission) tick('ring', 2.2, 2.4, () => { for (const ph of W.phones) if (dist2(ph.x, ph.y, this.listener.x, this.listener.y) < 280 * 280) { this.play('ring', ph.x, ph.y, .7); break; } });
      for (const pr of W.props) if (pr.spray > 0 && dist2(pr.x, pr.y, this.listener.x, this.listener.y) < 2.5e5 && Math.random() < dt * 2) this.play('splash', pr.x, pr.y, .4);
    }
    if (play && G.player && !G.player.dead && G.player.hp < 30) tick('heart', .75, .75, () => this.play('heart', undefined, undefined, 1 - G.player.hp / 40));
    Music.choose();
  },
};

// ================= MUSIC (song-structured procedural) =================
const SCALES = { minor: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], major: [0, 2, 4, 5, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], mixo: [0, 2, 4, 5, 7, 9, 10], blues: [0, 3, 5, 6, 7, 10], harm: [0, 2, 3, 5, 7, 8, 11] };
const STY = {
  funk: { bpm: 104, swing: .1, sc: 'dorian', root: [40, 43, 45], A: [0, 0, 3, 3], B: [5, 4, 3, 4], kit: 'funk', bass: 'funk', lead: 'brass', pad: 'organ' },
  synth: { bpm: 116, swing: 0, sc: 'minor', root: [45, 43, 47], A: [0, 5, 2, 6], B: [3, 4, 0, 0], kit: 'four', bass: 'octave', lead: 'saw', pad: 'pad', arp: 1 },
  punk: { bpm: 172, swing: 0, sc: 'mixo', root: [40, 45, 43], A: [0, 0, 3, 4], B: [5, 3, 0, 4], kit: 'punk', bass: 'eighths', gtr: 1 },
  lounge: { bpm: 84, swing: .22, sc: 'major', root: [41, 43, 39], A: [0, 5, 1, 4], B: [3, 2, 1, 4], kit: 'brush', bass: 'walk', lead: 'vibes', pad: 'epiano', sev: 1 },
  house: { bpm: 124, swing: .04, sc: 'minor', root: [45, 47, 43], A: [0, 0, 5, 5], B: [3, 4, 0, 0], kit: 'house', bass: 'offbeat', lead: 'stab', pad: 'pad', sev: 1 },
  rnb: { bpm: 72, swing: .14, sc: 'minor', root: [44, 46, 41], A: [0, 5, 3, 4], B: [3, 4, 5, 4], kit: 'trap', bass: 'sub', lead: 'bell', pad: 'epiano', sev: 1 },
  blues: { bpm: 94, swing: .3, sc: 'mixo', root: [40, 45], A: [0, 3, 0, 0], B: [4, 3, 0, 4], kit: 'shuffle', bass: 'walk', lead: 'organlead', pad: 'organ', gtr: 2 },
  chip: { bpm: 140, swing: 0, sc: 'major', root: [48, 50, 45], A: [0, 5, 3, 4], B: [3, 4, 0, 0], kit: 'chip', bass: 'chipbass', lead: 'pulse', arp: 2 },
  oldies: { bpm: 120, swing: .3, sc: 'major', root: [48, 46], A: [0, 5, 3, 4], B: [3, 3, 0, 4], kit: 'shuffle', bass: 'walk', lead: 'sax', pad: 'organ' },
  country: { bpm: 118, swing: .12, sc: 'major', root: [43, 45, 40], A: [0, 3, 4, 0], B: [3, 0, 4, 4], kit: 'train', bass: 'rootfifth', lead: 'pluck', gtr: 2 },
  hiphop: { bpm: 90, swing: .08, sc: 'minor', root: [41, 43, 38], A: [0, 0, 5, 3], B: [3, 4, 0, 0], kit: 'boom', bass: 'sub', lead: 'bell', pad: 'epiano', sev: 1 },
  reggae: { bpm: 74, swing: .16, sc: 'major', root: [45, 43, 40], A: [0, 3, 0, 4], B: [5, 3, 4, 0], kit: 'onedrop', bass: 'reggae', pad: 'skank', lead: 'organlead' },
  chase: { bpm: 148, swing: 0, sc: 'phrygian', root: [40], A: [0, 0, 1, 0], B: [0, 5, 6, 1], kit: 'chase', bass: 'ostinato', lead: 'stab', pad: 'pad' },
  title: { bpm: 98, swing: 0, sc: 'minor', root: [45], A: [0, 5, 2, 6], B: [3, 4, 0, 4], kit: 'four', bass: 'octave', lead: 'saw', pad: 'pad', arp: 1, soft: 1 },
};
const STATIONS = [
  { name: 'Radio Off' },
  { name: 'KGRD 101.4  ·  Funk Haul', style: 'funk', seed: 11 },
  { name: 'NEON 88.8  ·  Synth City', style: 'synth', seed: 7 },
  { name: 'RUST 93  ·  Garage Punk', style: 'punk', seed: 3 },
  { name: 'SMOOTH 104  ·  Late Lounge', style: 'lounge', seed: 19 },
  { name: 'BASS 99.9  ·  Club Varro', style: 'house', seed: 23 },
  { name: 'SLOW JAM 96  ·  After Hours', style: 'rnb', seed: 31 },
  { name: 'RANCH 102  ·  Country Roads', style: 'country', seed: 47 },
  { name: 'BLOCK 94.7  ·  Hip-Hop', style: 'hiphop', seed: 53 },
  { name: 'IRIE 89.3  ·  Reggae', style: 'reggae', seed: 59 },
  { name: 'GOLD 97.1  ·  Oldies', style: 'oldies', seed: 41 },
  { name: 'DELTA 91.5  ·  Blues', style: 'blues', seed: 43 },
  { name: '8-BIT FM  ·  Chiptune', style: 'chip', seed: 61 },
];
const INTERIOR_MUSIC = { club: ['house', 'synth'], strip: ['rnb', 'house'], bar: ['blues', 'lounge'], diner: ['oldies', 'lounge'], arcade: ['chip'], store: ['lounge'] };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const Music = {
  key: null, song: null, step: 0, next: 0, timer: null, out: null, songN: 0,
  want(key) { if (!Snd.ctx) return; if (key === this.key) return; this.key = key; this.stopNow(); if (key) this.start(key); },
  choose() {
    let k = null;
    const MS = G.settings, on = key => MS[key] === undefined || MS[key];
    if (G.mode === 'menu') k = on('mTitle') ? 'title|0' : null;
    else if (G.mode === 'play') {
      const c = pCar();
      if ((c || MS.walkman) && Radio.st > 0 && !G.player.dead) k = STATIONS[Radio.st].style + '|' + STATIONS[Radio.st].seed;
      else if (G.scene && INTERIOR_MUSIC[G.scene.b.type] && on('mIndoor')) k = (G.scene.music || INTERIOR_MUSIC[G.scene.b.type][0]) + '|' + G.scene.b.id;
      else if (stars() >= 3 && !c && !G.player.dead && on('mChase')) k = 'chase|5';
    }
    this.want(k);
  },
  start(key) {
    const [style, seed] = key.split('|'); const c = Snd.ctx;
    this.out = c.createGain(); this.out.gain.setValueAtTime(.0001, c.currentTime); this.out.gain.exponentialRampToValueAtTime(1, c.currentTime + .6);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = style === 'chase' || style === 'title' ? 9000 : 12000; this.out.connect(lp); lp.connect(Snd.mus); this.lp = lp;
    this.style = style; this.seed = +seed || 0; this.songN = Math.floor(Math.random() * 4); this.song = buildSong(STY[style], this.seed * 97 + this.songN); this.step = 0; this.next = c.currentTime + .08;
    this.timer = setInterval(() => this.tick(), 35);
  },
  stopNow() {
    if (this.timer) clearInterval(this.timer); this.timer = null;
    if (this.out) { const o = this.out, t = Snd.ctx.currentTime; o.gain.cancelScheduledValues(t); o.gain.setValueAtTime(o.gain.value || .5, t); o.gain.exponentialRampToValueAtTime(.0001, t + .4); setTimeout(() => { try { o.disconnect(); } catch (e) { } }, 900); this.out = null; }
  },
  tick() {
    const c = Snd.ctx; if (!c || !this.song) return; const S = this.song, sp = 60 / S.bpm / 4;
    while (this.next < c.currentTime + .18) {
      if (this.step >= S.steps) { this.songN++; this.song = buildSong(STY[this.style], this.seed * 97 + this.songN); this.step = 0; }
      const k = this.step, swing = k % 2 ? S.swing * sp : 0;
      playStep(this.song, k, this.next + swing, sp, this.out);
      this.next += sp; this.step++;
    }
  },
};
function chordOf(sc, root, deg, sev) { const s = SCALES[sc], n = s.length; const tone = i => root + s[(deg + i) % n] + 12 * Math.floor((deg + i) / n); const r = [tone(0), tone(2), tone(4)]; if (sev) r.push(tone(6)); return r; }
function buildSong(st, seed) {
  const r = mulberry32(seed * 7919 + 17), rn = () => r(), ri = (a, b) => a + Math.floor(rn() * (b - a + 1));
  const root = st.root[Math.floor(rn() * st.root.length)], sc = st.sc, s = SCALES[sc];
  const form = st.soft ? ['I', 'A', 'B', 'A', 'B', 'O'] : ['I', 'A', 'A', 'B', 'A', 'B', 'B', 'O'];
  const bars = []; // {sec, deg, fill, first}
  for (const sec of form) { const prog = sec === 'B' ? st.B : st.A, n = sec === 'I' || sec === 'O' ? 2 : 4; for (let i = 0; i < n; i++) bars.push({ sec, deg: prog[i % prog.length], fill: i === n - 1 && sec !== 'O', first: i === 0 }); }
  // motifs: rhythm + scale steps
  const motif = () => { const m = []; for (let i = 0; i < 32; i++) { const strong = i % 4 === 0; m.push(rn() < (strong ? .6 : .28) ? { d: ri(0, 6) - (rn() < .3 ? 7 : 0), len: rn() < .3 ? 4 : 2 } : null); } return m; };
  const mA = motif(), mB = motif();
  const bassPat = []; for (let i = 0; i < 16; i++) bassPat.push(rn());
  return { st, root, sc, bars, mA, mB, bassPat, bpm: st.bpm * (1 + (rn() - .5) * .04), swing: st.swing, steps: bars.length * 16, r };
}
// drum templates
const KITS = {
  four: { K: 'x...x...x...x...', S: '....x.......x...', H: '..x...x...x...x.', h: 'xxxxxxxxxxxxxxxx' },
  house: { K: 'x...x...x...x...', C: '....x.......x...', O: '..x...x...x...x.', h: 'x.x.x.x.x.x.x.x.' },
  funk: { K: 'x......x..x.....', S: '....x..x....x..x', h: 'xxxxxxxxxxxxxxxx', g: '.x.....x.x......' },
  punk: { K: 'x.x...x.x.x...x.', S: '....x.......x...', H: 'x.x.x.x.x.x.x.x.' },
  brush: { K: 'x.........x.....', B: '....x.......x...', R: 'x...x.x.x...x.x.' },
  trap: { K: 'x......x..x.....', C: '........x.......', h: 'x.x.x.x.xxx.x.xx' },
  shuffle: { K: 'x.......x.......', S: '....x.......x...', H: 'x.x.x.x.x.x.x.x.' },
  chip: { K: 'x.......x.......', S: '....x.......x...', H: '..x...x...x...x.' },
  train: { K: 'x.......x.......', S: '....x.......x...', B: 'x.x.x.x.x.x.x.x.', h: '..x...x...x...x.' },
  boom: { K: 'x.....x...x.....', S: '....x.......x...', h: 'x.x.x.x.x.x.x.x.', g: '.......x........' },
  onedrop: { K: '........x.......', C: '........x.......', h: 'x.x.x.x.x.x.x.x.', g: '...x.......x....' },
  chase: { K: 'x..x..x.x..x..x.', S: '....x.......x...', h: 'xxxxxxxxxxxxxxxx', T: '..............xx' },
};
function playStep(S, k, t, sp, out) {
  const c = Snd.ctx, st = S.st, bi = Math.floor(k / 16), i = k % 16, bar = S.bars[bi]; if (!bar) return;
  const kit = KITS[st.kit], intro = bar.sec === 'I', outro = bar.sec === 'O', soft = st.soft ? .7 : 1;
  const chord = chordOf(S.sc, S.root, bar.deg, st.sev), rootN = chord[0];
  const g = (v) => { const x = c.createGain(); x.gain.value = v; x.connect(out); return x; };
  const env = (node, v, a, d, t0) => { const x = c.createGain(); x.gain.setValueAtTime(.0001, t0); x.gain.exponentialRampToValueAtTime(v, t0 + a); x.gain.exponentialRampToValueAtTime(.0001, t0 + a + d); node.connect(x); x.connect(out); return x; };
  const noise = (dur, type, f, v, q, t0) => { const s = c.createBufferSource(); s.buffer = Snd.noise; const fl = c.createBiquadFilter(); fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; s.connect(fl); env(fl, v, .002, dur, t0); s.start(t0, Math.random()); s.stop(t0 + dur + .05); };
  const osc = (type, f, dur, v, t0, a, cut, q, glide) => { const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); if (glide) o.frequency.exponentialRampToValueAtTime(glide, t0 + dur * .5); let n = o; if (cut) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut * 2.2, t0); fl.frequency.exponentialRampToValueAtTime(cut, t0 + dur * .6); if (q) fl.Q.value = q; o.connect(fl); n = fl; } const A = a || .005; env(n, v, A, dur, t0); o.start(t0); o.stop(t0 + dur + A + .05); return o; };
  const at = (pat, j) => pat && pat[j] === 'x';
  const fillZone = bar.fill && i >= 12;
  // drums
  if (!(intro && st.kit !== 'four' && i % 4 !== 0 && !st.soft)) {
    if (at(kit.K, i) && !(outro && i > 8)) { const o = c.createOscillator(); o.frequency.setValueAtTime(st.kit === 'chip' ? 120 : 150, t); o.frequency.exponentialRampToValueAtTime(42, t + .13); env(o, .95 * soft, .002, .22, t); o.start(t); o.stop(t + .3); }
    if ((at(kit.S, i) || fillZone && st.kit !== 'brush' && st.kit !== 'trap') && !intro) { noise(.16, 'bandpass', st.kit === 'chip' ? 2500 : 1800, .5 * (fillZone && !at(kit.S, i) ? .6 : 1) * soft, .7, t); osc('triangle', 190, .08, .25 * soft, t); }
    if (at(kit.C, i) && !intro) { for (let n = 0; n < 3; n++) noise(.06, 'bandpass', 1300, .35, 1, t + n * .008); }
    if (at(kit.g, i)) noise(.05, 'bandpass', 1800, .12, .7, t);
    if (at(kit.H, i)) noise(.05, 'highpass', 7500, .22 * soft, 0, t);
    if (at(kit.h, i)) noise(.03, 'highpass', 9000, (i % 4 === 2 ? .14 : .07) * soft, 0, t);
    if (at(kit.O, i)) noise(.22, 'highpass', 7000, .16, 0, t);
    if (at(kit.R, i)) { osc('square', 5200, .15, .025, t); noise(.2, 'highpass', 8000, .06, 0, t); }
    if (at(kit.B, i)) noise(.25, 'bandpass', 2500, .12, .4, t);
    if (at(kit.T, i) && bar.fill) osc('sine', 160 - (i - 14) * 40, .2, .5, t, .002, 0, 0, 70);
    if (bar.first && i === 0 && bar.sec !== 'I' && st.kit !== 'chip') noise(1.2, 'highpass', 5000, .14 * soft, 0, t);
  }
  // bass
  const bt = st.bass, bv = .34 * soft, br = rootN - 12 + (rootN > 52 ? -12 : 0), p = S.bassPat[i];
  const B = (m, dur, type, cut) => osc(type || 'sawtooth', mtof(m), dur, bv, t, .005, cut || 500, 4);
  if (bt === 'octave' && i % 2 === 0) B(i % 4 === 0 ? br : br + 12, sp * 1.6);
  if (bt === 'funk' && (i === 0 || p < .38)) B(br + (p < .1 ? 12 : p < .2 ? 7 : p < .25 ? 10 : 0), sp * (p < .2 ? .9 : 1.6), 'square', 700);
  if (bt === 'eighths' && i % 2 === 0) B(br, sp * 1.5, 'sawtooth', 900);
  if (bt === 'walk' && i % 4 === 0) { const steps = [0, 4, 7, 9], nx = chordOf(S.sc, S.root, (S.bars[bi + 1] || bar).deg)[0] - 12; B(i === 12 ? nx - 1 : br + steps[i / 4], sp * 3.5, 'triangle', 900); }
  if (bt === 'offbeat' && i % 4 === 2) B(br, sp * 1.6, 'sawtooth', 600);
  if (bt === 'offbeat' && i === 0 && bar.first) B(br - 12, sp * 3, 'sine');
  if (bt === 'sub' && (i === 0 || i === 10)) osc('sine', mtof(br), sp * 5, .36 * soft, t, .01, 0, 0, i === 10 ? mtof(br - 2) : 0);
  if (bt === 'chipbass' && i % 2 === 0) B(br + (i % 4 ? 12 : 0), sp * 1.3, 'square', 2000);
  if (bt === 'rootfifth' && i % 4 === 0) B(i % 8 === 0 ? br : br - 5, sp * 3, 'triangle', 900);
  if (bt === 'reggae' && [0, 3, 6, 10, 13].includes(i)) B(br + [0, 0, 7, 0, 4][[0, 3, 6, 10, 13].indexOf(i)], sp * 2.4, 'triangle', 420);
  if (bt === 'ostinato') B(br + [0, 0, 12, 0, 1, 0, 12, 0, 0, 0, 12, 0, 3, 1, 12, 0][i], sp * .9, 'sawtooth', 800);
  // pad / chords
  if (!outro || i < 8) {
    if (st.pad === 'pad' && i === 0) for (const m of chord) { for (const det of [-7, 7]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m + 12); o.detune.value = det; const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 1400; o.connect(fl); env(fl, .035 * soft, .35, sp * 15, t); o.start(t); o.stop(t + sp * 16 + .5); } }
    if (st.pad === 'organ' && (i === 0 || i === 8)) for (const m of chord) for (const h of [1, 2, 4]) osc('sine', mtof(m + 12) * h, sp * 7.5, .03 / h, t, .02);
    if (st.pad === 'skank' && i % 4 === 2) for (const m of chord) { osc('sawtooth', mtof(m + 12), sp * .7, .05, t, .003, 1900, 2); if (i % 8 === 6) osc('sawtooth', mtof(m + 12), sp * .5, .035, t + sp, .003, 1900, 2); }
    if (st.pad === 'epiano' && (i === 0 || i === 6 || i === 10)) for (const m of chord) { osc('sine', mtof(m + 12), sp * 6, .06, t, .005); osc('sine', mtof(m + 24), sp * 2, .015, t, .002); }
  }
  if (st.gtr === 1 && !intro && i % 2 === 0) { const sh = c.createWaveShaper(); const cv = new Float32Array(256); for (let n = 0; n < 256; n++) { const x = n / 128 - 1; cv[n] = Math.tanh(x * 6); } sh.curve = cv; for (const m of [rootN, rootN + 7, rootN + 12]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m - 12); o.connect(sh); o.start(t); o.stop(t + sp * 1.8); } const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = 2600; sh.connect(fl); env(fl, .06, .003, sp * 1.6, t); }
  if (st.gtr === 2 && (i === 0 || i === 6 || i === 8 || i === 14) && !intro) for (const m of [rootN, rootN + 7]) osc('sawtooth', mtof(m), sp * 1.5, .05, t, .005, 1500);
  // arps
  if (st.arp && !intro && (st.arp === 1 || i % 2 === 0)) { const seq = chord.concat(chord.map(m => m + 12)); osc(st.arp === 2 ? 'square' : 'triangle', mtof(seq[(i + bi) % seq.length] + 12), sp * .9, .045 * soft, t, .003, st.arp === 2 ? 0 : 3000); }
  // lead melody
  if (st.lead && (bar.sec === 'A' || bar.sec === 'B')) {
    const mot = bar.sec === 'B' ? S.mB : S.mA, n = mot[(bi % 2) * 16 + i]; if (n) {
      const s = SCALES[S.sc], deg = bar.deg + n.d, m = S.root + 24 + s[((deg % s.length) + s.length) % s.length] + 12 * Math.floor(deg / s.length) + (bar.sec === 'B' ? 12 : 0), dur = sp * n.len * 1.1;
      const L2 = st.lead;
      if (L2 === 'saw') { osc('sawtooth', mtof(m), dur, .06 * soft, t, .01, 2600); osc('sawtooth', mtof(m) * 1.004, dur, .04 * soft, t, .01, 2600); }
      else if (L2 === 'brass') { osc('sawtooth', mtof(m - 12), dur * .8, .07, t, .02, 1800, 2); osc('sawtooth', mtof(m - 5), dur * .8, .04, t, .02, 1800, 2); }
      else if (L2 === 'vibes') { osc('sine', mtof(m), dur * 2, .08, t, .003); osc('sine', mtof(m) * 4, dur * .5, .015, t, .002); }
      else if (L2 === 'stab' && i % 4 === 2) for (const q of chord) osc('sawtooth', mtof(q + 12), sp * .7, .045, t, .003, 2200, 3);
      else if (L2 === 'bell') { osc('sine', mtof(m), dur * 2, .07, t, .003); osc('sine', mtof(m) * 2.76, dur * .6, .02, t, .002); }
      else if (L2 === 'pulse') osc('square', mtof(m), dur, .045, t, .002);
      else if (L2 === 'organlead') { osc('square', mtof(m - 12), dur, .04, t, .01, 2400); osc('sine', mtof(m), dur, .05, t, .01); }
      else if (L2 === 'pluck') { osc('triangle', mtof(m - 12), dur * .7, .1, t, .002); osc('square', mtof(m - 12), .05, .03, t, .001, 3000); }
      else if (L2 === 'sax') { const o = osc('sawtooth', mtof(m - 12), dur, .06, t, .03, 1600, 3); const v = c.createOscillator(), vg = c.createGain(); v.frequency.value = 5; vg.gain.value = 6; v.connect(vg); vg.connect(o.frequency); v.start(t); v.stop(t + dur + .1); }
    }
  }
}
const Radio = {
  st: 0,
  set(i) {
    this.st = i;
    if (!Snd.ctx) return; Snd.play('static');
    if (i > 0) { const t = Snd.ctx.currentTime; [784, 988, 1175].forEach((f, k) => Snd.tone('triangle', f, f, .25, .06, t + .25 + k * .09, Snd.mus)); }
  }
};
