/* Audio: plucked-string synthesis (Karplus-Strong), drums, bass, and a step sequencer. */
(function () {
  const W = window.W;
  const T = W.T;
  let ctx = null, master = null, noise = null;
  const bufs = {};
  const stringVoice = [null, null, null, null, null, null];

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.85;
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 4;
      master.connect(comp); comp.connect(ctx.destination);
      const len = ctx.sampleRate;
      noise = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  const now = () => (ctx ? ctx.currentTime : 0);

  function stringBuffer(midi) {
    if (bufs[midi]) return bufs[midi];
    const sr = ctx.sampleRate;
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    const N = Math.max(2, Math.round(sr / freq - 0.5));
    const actual = sr / (N + 0.5);
    const len = Math.floor(sr * 2.6);
    const buf = ctx.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);
    const ring = new Float32Array(N);
    let prev = 0;
    for (let i = 0; i < N; i++) { const n = Math.random() * 2 - 1; prev = prev * 0.45 + n * 0.55; ring[i] = prev; }
    const decay = 0.9945 + 0.0045 * Math.min(1, Math.max(0, (midi - 40) / 34));
    let idx = 0;
    for (let i = 0; i < len; i++) {
      const nxt = idx + 1 === N ? 0 : idx + 1;
      const v = ring[idx];
      ring[idx] = decay * 0.5 * (v + ring[nxt]);
      out[i] = v;
      idx = nxt;
    }
    const fade = Math.floor(sr * 0.15);
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    return (bufs[midi] = { buf, rate: freq / actual });
  }

  /* Pluck one note. `string` (0-5) lets a new note on the same string cut the old one, like a real guitar. */
  function pluck(midi, when, vel = 0.8, string = null, dur = 2.4) {
    if (!ensure()) return;
    const t = Math.max(when || 0, ctx.currentTime);
    const sb = stringBuffer(midi);
    const src = ctx.createBufferSource();
    src.buffer = sb.buf; src.playbackRate.value = sb.rate;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 1400 + vel * 4200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vel * 0.4, t);
    g.gain.setValueAtTime(vel * 0.4, t + dur - 0.12);
    g.gain.linearRampToValueAtTime(0, t + dur);
    src.connect(lp); lp.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.02);
    if (string !== null) {
      const old = stringVoice[string];
      if (old) { try { old.g.gain.cancelScheduledValues(t); old.g.gain.setTargetAtTime(0, t, 0.012); old.src.stop(t + 0.1); } catch (e) {} }
      stringVoice[string] = { src, g };
    }
  }

  /* Strum six strings. midis[i] is null for a muted string. */
  function strum(midis, { when, dir = 'D', vel = 0.8, spread = 0.016 } = {}) {
    if (!ensure()) return;
    const t0 = Math.max(when || 0, ctx.currentTime);
    let order = [0, 1, 2, 3, 4, 5].filter((s) => midis[s] != null);
    if (dir === 'U') order = order.reverse().slice(0, 4);
    order.forEach((s, i) => {
      const v = vel * (dir === 'U' ? 0.7 : 1) * (0.86 + Math.random() * 0.14);
      pluck(midis[s], t0 + i * spread, v, s);
    });
  }
  function muteStrings(when) {
    if (!ctx) return;
    const t = Math.max(when || 0, ctx.currentTime);
    stringVoice.forEach((v, i) => { if (v) { try { v.g.gain.cancelScheduledValues(t); v.g.gain.setTargetAtTime(0, t, 0.03); v.src.stop(t + 0.25); } catch (e) {} stringVoice[i] = null; } });
  }

  function env(g, t, peak, len) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  }
  function kick(t, v = 0.9) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.11);
    env(g, t, v, 0.28); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.3);
  }
  function noiseHit(t, v, len, type, freq) {
    const s = ctx.createBufferSource(); s.buffer = noise;
    const f = ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = ctx.createGain(); env(g, t, v, len);
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t, Math.random() * 0.5); s.stop(t + len + 0.02);
  }
  function snare(t, v = 0.5) {
    noiseHit(t, v, 0.16, 'highpass', 1500);
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
    env(g, t, v * 0.6, 0.1); o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.12);
  }
  const hat = (t, v = 0.18) => noiseHit(t, v, 0.045, 'highpass', 7500);
  function click(t, accent) {
    if (!ensure()) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.value = accent ? 1760 : 1175;
    env(g, Math.max(t, ctx.currentTime), accent ? 0.35 : 0.2, 0.05);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.07);
  }
  function bass(pc, t, len, v = 0.5) {
    const midi = 28 + T.mod(pc - 4);
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const o = ctx.createOscillator(), o2 = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(260, t + 0.2);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.012);
    g.gain.setValueAtTime(v, t + len * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(lp); o2.connect(lp); lp.connect(g); g.connect(master);
    o.start(t); o2.start(t); o.stop(t + len + 0.02); o2.stop(t + len + 0.02);
  }

  /* ---------- Sequencer: eighth-note steps with look-ahead scheduling ---------- */
  const seq = { timer: null, uiTimers: [], bpm: 90, swing: 0 };
  function seqStart({ bpm, swing = 0, onStep, onUi }) {
    seqStop();
    if (!ensure()) return;
    seq.bpm = bpm; seq.swing = swing;
    let step = 0, next = ctx.currentTime + 0.1;
    const tick = () => {
      while (next < ctx.currentTime + 0.14) {
        const stepDur = 60 / seq.bpm / 2;
        const t = next + (step % 2 ? seq.swing * stepDur : 0);
        const keepGoing = onStep(step, t, stepDur);
        const s = step;
        if (onUi) seq.uiTimers.push(setTimeout(() => onUi(s), Math.max(0, (t - ctx.currentTime) * 1000)));
        if (seq.uiTimers.length > 64) seq.uiTimers.splice(0, 32);
        step++; next += stepDur;
        if (keepGoing === false) { clearInterval(seq.timer); seq.timer = null; return; }
      }
    };
    seq.timer = setInterval(tick, 25);
    tick();
  }
  function seqStop() {
    if (seq.timer) clearInterval(seq.timer);
    seq.timer = null;
    seq.uiTimers.forEach(clearTimeout); seq.uiTimers = [];
  }

  /* ---------- Player: loops a chord progression with optional band ---------- */
  const PATTERNS = {
    fours: { name: 'Steady fours', p: ['D', 0, 'D', 0, 'D', 0, 'D', 0], say: 'Down on every beat. Count 1, 2, 3, 4.' },
    eighths: { name: 'Down-up eighths', p: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], say: 'Down on the number, up on the “and”. The hand is a pendulum.' },
    folk: { name: 'Folk strum', p: ['D', 0, 'D', 'U', 'D', 0, 'D', 'U'], say: '1, 2-and, 3, 4-and.' },
    faithful: { name: 'Old Faithful', p: ['D', 0, 'D', 'U', 0, 'U', 'D', 'U'], say: '1, 2-and, (miss 3) and-4-and. The hand still swings down on 3; it just misses the strings.' },
    push: { name: 'The push', p: ['D', 0, 0, 'U', 0, 'U', 'D', 0], say: '1, (2) and, (3) and-4. Syncopated: the upstrokes land early and pull the song forward.' },
    whole: { name: 'One strum per bar', p: ['D', 0, 0, 0, 0, 0, 0, 0], say: 'One strum, let it ring.' },
  };

  /* Fingerpicking patterns, one entry per eighth note. Each letter is a voice plucked on that step:
     R thumb on the root, A thumb on its second bass string, i m a index, middle, ring. Two letters are a pinch. */
  const PICKS = {
    roll: { name: 'Forward roll', p: ['R', 'i', 'm', 'a', 'R', 'i', 'm', 'a'], say: 'Thumb, index, middle, ring, one string each, twice a bar. Count 1 & 2 & 3 & 4 &.' },
    ballad: { name: 'Eight-note roll', p: ['R', 'i', 'm', 'i', 'a', 'i', 'm', 'i'], say: 'One thumb stroke a bar. The index finger comes back between every other note, like a hinge.' },
    six: { name: 'Up and back', p: ['R', 'i', 'm', 'a', 'm', 'i'], say: 'Six notes to the bar: up the strings and back down. Count 1 2 3, 4 5 6 and lean on 1 and 4.' },
    thumb: { name: 'Thumb alone', alt: true, p: ['R', 0, 'A', 0, 'R', 0, 'A', 0], say: 'Only the thumb, once per beat, rocking between two bass strings. Keep going until you can hold a conversation over it.' },
    pinch: { name: 'Thumb and pinch', alt: true, p: ['Rm', 0, 'A', 0, 'Rm', 0, 'A', 0], say: 'The thumb keeps rocking. On beats 1 and 3 a finger plucks at the same moment: a pinch.' },
    travis: { name: 'Travis pattern', alt: true, p: ['Rm', 0, 'A', 'i', 'R', 'm', 'A', 'i'], say: 'The thumb never changes. Pinch on 1, then fingers fall in the gaps: index after 2, middle after 3, index after 4.' },
  };

  const player = { id: null, opts: null };
  function play(id, o) {
    stop();
    if (!ensure()) return;
    const opts = Object.assign({ bpm: 90, pattern: 'fours', beats: 4, loop: true, drums: false, bass: false, guitar: true, click: false, swing: 0, vel: 0.8, countIn: false }, o);
    player.id = id; player.opts = opts;
    const shapes = opts.chords.map((c) => T.voicing(c));
    const voiced = shapes.map(T.voicingMidis);
    const pk = opts.pick ? PICKS[opts.pick] : null;
    const maps = pk ? opts.chords.map((c, i) => T.pickMap(c, shapes[i], pk.alt)) : null;
    const perChord = pk ? pk.p.length : opts.beats * 2;
    const beatLen = perChord === 6 ? 3 : 2;
    const total = voiced.length * perChord;
    const lead = opts.countIn ? 8 : 0;
    let lastChord = -1;
    seqStart({
      bpm: opts.bpm, swing: opts.swing,
      onStep(step, t, stepDur) {
        const o2 = player.opts;
        seq.bpm = o2.bpm;
        if (step < lead) { if (step % 2 === 0) click(t, step === 0); return; }
        const s = step - lead;
        if (!o2.loop && s >= total) { strum(voiced[0], { when: t, vel: o2.vel }); return false; }
        const pos = s % total, ci = Math.floor(pos / perChord), inBar = pos % perChord;
        if (pk) {
          const hit = pk.p[inBar];
          if (o2.guitar && hit) hit.split('').forEach((v) => {
            const str = maps[ci][v], thumb = v === 'R' || v === 'A';
            if (voiced[ci][str] != null) pluck(voiced[ci][str], t, o2.vel * (thumb ? 1 : 0.8) * (inBar === 0 ? 1 : 0.9), str);
          });
          if (o2.click && inBar % beatLen === 0) click(t, inBar === 0);
          return;
        }
        const pat = (PATTERNS[o2.pattern] || PATTERNS.fours).p;
        const hit = pat[inBar];
        if (o2.guitar && hit) strum(voiced[ci], { when: t, dir: hit, vel: o2.vel * (inBar % 4 === 0 ? 1 : 0.82) });
        if (o2.click && inBar % 2 === 0) click(t, inBar === 0);
        if (o2.drums) {
          hat(t, inBar % 2 ? 0.1 : 0.17);
          if (inBar === 0 || inBar === 4 || (inBar === 5 && o2.swing === 0)) kick(t, inBar === 5 ? 0.55 : 0.9);
          if (inBar === 2 || inBar === 6) snare(t);
        }
        if (o2.bass) {
          const c = o2.chords[ci];
          if (inBar === 0) bass(c.root, t, stepDur * 2.6, 0.5);
          if (inBar === 3) bass(c.root, t, stepDur * 0.9, 0.36);
          if (inBar === 4) bass(c.root + 7, t, stepDur * 1.8, 0.42);
          if (inBar === 6) bass(c.root, t, stepDur * 1.6, 0.42);
        }
      },
      onUi(step) {
        if (player.id !== id) return;
        if (step < lead) { opts.onCount && opts.onCount(Math.floor(step / 2) + 1); return; }
        const s = step - lead;
        if (!opts.loop && s >= total) { setTimeout(() => { if (player.id === id) stop(); }, 1200); return; }
        const pos = s % total, ci = Math.floor(pos / perChord);
        opts.onStep && opts.onStep(pos % perChord, ci, pos);
        if (ci !== lastChord) { lastChord = ci; opts.onChord && opts.onChord(ci); }
      },
    });
    W.onPlayerChange && W.onPlayerChange();
  }
  function stop() {
    const was = player.opts;
    seqStop();
    player.id = null; player.opts = null;
    muteStrings();
    if (was && was.onStop) was.onStop();
    W.onPlayerChange && W.onPlayerChange();
  }
  const toggle = (id, o) => (player.id === id ? stop() : play(id, o));

  /* One-shot helpers */
  function strumChord(ch, dir) { stop(); strum(T.voicingMidis(T.voicing(ch)), { dir: dir || 'D', spread: 0.028 }); }
  function playNote(s, f) { pluck(T.TUNING[s] + f, 0, 0.9, s); }
  /* Play chords one after another (ear training). Returns total seconds. */
  function sequence(chords, gap = 0.95) {
    stop();
    if (!ensure()) return 0;
    const t0 = ctx.currentTime + 0.06;
    chords.forEach((c, i) => strum(T.voicingMidis(T.voicing(c)), { when: t0 + i * gap, spread: 0.022 }));
    return chords.length * gap;
  }

  /* ---------- Tuner: a held reference tone, and pitch detection from the microphone ---------- */
  let ref = null;
  function toneStop() {
    if (!ref) return;
    const t = ctx.currentTime;
    try { ref.g.gain.cancelScheduledValues(t); ref.g.gain.setTargetAtTime(0, t, 0.04); ref.o1.stop(t + 0.3); ref.o2.stop(t + 0.3); } catch (e) {}
    ref = null;
  }
  function tone(midi) {
    toneStop();
    if (!ensure()) return;
    const f = 440 * Math.pow(2, (midi - 69) / 12), t = ctx.currentTime;
    const g = ctx.createGain(), g2 = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.2, t + 0.1);
    g2.gain.value = 0.5; // an octave above, so the low strings are audible on small speakers
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
    o1.type = 'triangle'; o1.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
    o1.connect(g); o2.connect(g2); g2.connect(g); g.connect(master);
    o1.start(t); o2.start(t);
    ref = { o1, o2, g };
    pluck(midi, 0, 0.8);
  }

  /* Fundamental frequency of a buffer, or null. Normalised square difference (McLeod), which copes with
     guitar strings whose fundamental is weaker than their overtones. */
  function detectPitch(buf, sr) {
    const n = buf.length;
    let rms = 0;
    for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.01) return null;
    const maxLag = Math.min(Math.floor(sr / 60), n >> 1), minLag = Math.floor(sr / 1200);
    const nsdf = new Float32Array(maxLag + 2);
    for (let tau = 0; tau <= maxLag + 1; tau++) {
      let acf = 0, m = 0;
      for (let i = 0, e = n - tau; i < e; i++) { const a = buf[i], b = buf[i + tau]; acf += a * b; m += a * a + b * b; }
      nsdf[tau] = m > 0 ? (2 * acf) / m : 0;
    }
    let tau = 1, best = 0;
    const peaks = [];
    while (tau < maxLag && nsdf[tau] > 0) tau++;
    while (tau < maxLag) {
      while (tau < maxLag && nsdf[tau] <= 0) tau++;
      let pk = -1, pv = 0;
      while (tau < maxLag && nsdf[tau] > 0) { if (nsdf[tau] > pv) { pv = nsdf[tau]; pk = tau; } tau++; }
      if (pk > 0) { peaks.push([pk, pv]); if (pv > best) best = pv; }
    }
    if (best < 0.8) return null;
    const t0 = peaks.find((p) => p[1] >= 0.9 * best)[0];
    if (t0 < minLag) return null;
    const a = nsdf[t0 - 1], b = nsdf[t0], c = nsdf[t0 + 1], den = a - 2 * b + c;
    return sr / (t0 + (den ? (a - c) / (2 * den) : 0));
  }

  let mic = null;
  const micAvailable = () => !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext);
  async function micStart(onPitch) {
    micStop();
    const c = ensure();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const src = c.createMediaStreamSource(stream), an = c.createAnalyser();
    an.fftSize = 4096;
    src.connect(an);
    const buf = new Float32Array(an.fftSize), hist = [];
    const timer = setInterval(() => {
      an.getFloatTimeDomainData(buf);
      const f = detectPitch(buf, c.sampleRate);
      if (!f) { hist.length = 0; onPitch(null); return; }
      hist.push(f); if (hist.length > 5) hist.shift();
      onPitch(hist.slice().sort((x, y) => x - y)[hist.length >> 1]);
    }, 80);
    mic = { stream, src, timer };
  }
  function micStop() {
    if (!mic) return;
    clearInterval(mic.timer);
    mic.stream.getTracks().forEach((t) => t.stop());
    try { mic.src.disconnect(); } catch (e) {}
    mic = null;
  }

  W.audio = { ensure, now, pluck, strum, click, strumChord, playNote, sequence, PATTERNS, PICKS, play, stop, toggle, player, tone, toneStop, detectPitch, micAvailable, micStart, micStop };
})();
