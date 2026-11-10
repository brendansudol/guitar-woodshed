/* Audio audit harness. Dev only: not part of the site build.
   Load it in the page served by `npm run dev` (for example: eval(await (await fetch('/scripts/audio-audit.js')).text()))
   and call the functions on window.AUDIT. Each render builds a fresh copy of js/audio.js on an OfflineAudioContext,
   so what is measured is exactly what the app would send to the speakers. */
(function () {
  const SR = 44100;
  let src = null;
  const audioSrc = async () => src || (src = await (await fetch('/js/audio.js?' + Date.now())).text());

  /* Render `seconds` of audio. `setup(A, ctx)` schedules sound; return true from it to also drive the step sequencer. */
  async function render(seconds, setup) {
    const code = await audioSrc();
    const off = new OfflineAudioContext(1, Math.ceil(SR * seconds), SR);
    const realResume = off.resume.bind(off);
    off.resume = () => Promise.resolve();
    const RealAC = window.AudioContext, realSI = window.setInterval, realST = window.setTimeout, keepAudio = window.W.audio;
    const ticks = [];
    window.AudioContext = function () { return off; };
    window.setInterval = (fn, ms) => (ms === 25 ? (ticks.push(fn), -1) : realSI(fn, ms));
    window.setTimeout = (fn, ms) => -1; // UI callbacks are not needed offline
    try {
      (0, eval)(code);
      const A = window.W.audio;
      A.ensure();
      await setup(A, off);
      if (ticks.length) {
        const q = 128 / SR;
        for (let t = 0.1; t < seconds - 0.05; t += 0.1) {
          const at = Math.round(t / q) * q;
          off.suspend(at).then(() => { ticks[ticks.length - 1](); realResume(); });
        }
      }
      const buf = await off.startRendering();
      return buf.getChannelData(0);
    } finally {
      window.AudioContext = RealAC; window.setInterval = realSI; window.setTimeout = realST; window.W.audio = keepAudio;
    }
  }

  /* ---------- Measurement ---------- */
  const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
  function fft(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (-2 * Math.PI) / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t;
        }
      }
    }
  }
  function spectrum(x, start, n = 8192) {
    const re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 0; i < n; i++) re[i] = (x[start + i] || 0) * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (n - 1)));
    fft(re, im);
    const mag = new Float32Array(n / 2);
    for (let i = 0; i < n / 2; i++) mag[i] = Math.hypot(re[i], im[i]) / (n / 4);
    return mag;
  }
  const centroid = (mag, sr = SR) => { let a = 0, b = 0; for (let i = 1; i < mag.length; i++) { const p = mag[i] * mag[i]; a += p * i; b += p; } return b ? ((a / b) * sr) / (mag.length * 2) : 0; };
  /* Level of harmonic k of f0: the strongest bin within 3% of k*f0. */
  function harmonics(mag, f0, count = 12, sr = SR) {
    const binHz = sr / (mag.length * 2), out = [];
    for (let k = 1; k <= count; k++) {
      const c = (k * f0) / binHz, lo = Math.max(1, Math.floor(c * 0.97)), hi = Math.min(mag.length - 1, Math.ceil(c * 1.03));
      let m = 0;
      for (let i = lo; i <= hi; i++) if (mag[i] > m) m = mag[i];
      out.push(db(m));
    }
    return out;
  }
  function envelope(x, sr = SR, frame = 0.02) {
    const n = Math.floor(sr * frame), out = [];
    for (let i = 0; i + n <= x.length; i += n) { let s = 0; for (let j = 0; j < n; j++) s += x[i + j] * x[i + j]; out.push(Math.sqrt(s / n)); }
    return out;
  }
  /* Decay rate in dB per second, from a straight-line fit of the level between t0 and t1. */
  function decayRate(x, t0, t1, sr = SR) {
    const env = envelope(x, sr), pts = [];
    env.forEach((v, i) => { const t = i * 0.02; if (t >= t0 && t <= t1 && v > 1e-6) pts.push([t, db(v)]); });
    if (pts.length < 4) return null;
    const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    return -pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
  }
  function pitch(x, start, sr = SR, n = 16384) {
    const A = window.W.audio, seg = x.subarray(start, start + n);
    return A.detectPitch(seg, sr);
  }
  const peak = (x) => { let m = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > m) m = a; } return m; };
  const rms = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
  const onset = (x, thr) => { for (let i = 0; i < x.length; i++) if (Math.abs(x[i]) > thr) return i; return -1; };
  const round = (v, d = 1) => (v == null ? null : Math.round(v * 10 ** d) / 10 ** d);

  /* One note, described the same way whether it came from the app or from a recording. */
  function describeNote(x, f0Expected, sr = SR) {
    const pk = peak(x), start = Math.max(0, onset(x, pk * 0.1)), at = (s) => start + Math.floor(s * sr);
    const f0 = pitch(x, at(0.15), sr) || f0Expected;
    const m0 = spectrum(x, at(0.03), 8192), m1 = spectrum(x, at(0.6), 8192);
    const env = envelope(x.subarray(start), sr, 0.005), pkEnv = Math.max(...env.slice(0, 60));
    return {
      cents: round(1200 * Math.log2(f0 / f0Expected), 1),
      peak: round(pk, 3), level: round(db(rms(x, at(0), at(0.3))), 1),
      attackMs: round(env.findIndex((v) => v >= pkEnv * 0.9) * 5, 0),
      decayDbPerSec: round(decayRate(x.subarray(start), 0.15, Math.min(2, x.length / sr - start / sr - 0.3), sr), 1),
      bright0: Math.round(centroid(m0, sr)), bright600: Math.round(centroid(m1, sr)),
      harm0: harmonics(m0, f0, 10, sr).map((v) => Math.round(v)), harm600: harmonics(m1, f0, 10, sr).map((v) => Math.round(v)),
    };
  }
  const midiHz = (m) => 440 * Math.pow(2, (m - 69) / 12);

  /* ---------- The two standard reports ---------- */
  /* Every open string and a few fretted notes: tuning error in cents, decay in dB per second, brightness in Hz at the start and after 0.6 s. */
  async function noteReport() {
    const out = {};
    for (const [m, s] of [[40, 0], [45, 1], [50, 2], [55, 3], [59, 4], [64, 5], [67, 5], [71, 5], [76, 5]]) {
      const x = await render(3.8, (A) => { A.pluck(m, 0.05, 0.9, s); });
      const d = describeNote(x, midiHz(m));
      out[m] = `${d.cents} cents, peak ${d.peak}, decay ${d.decayDbPerSec} dB/s, brightness ${d.bright0} > ${d.bright600} Hz, partials [${d.harm0.slice(0, 8).map((v) => v - Math.max(...d.harm0)).join(' ')}]`;
    }
    return out;
  }
  /* Levels of everything the app can play: peak, average level, samples that would clip, and how often the limiter is near. */
  async function mixReport() {
    const T = window.W.T, out = {};
    const chords = ['Am', 'G', 'F', 'G'].map(T.parseChord);
    const stat = (x) => { let clip = 0, hot = 0; for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > 0.999) clip++; if (a > 0.7) hot++; } return `peak ${round(peak(x), 2)}, average ${round(db(rms(x, 4410)), 1)} dB, clipped ${clip}, above 0.7 ${round((100 * hot) / x.length, 2)}%`; };
    const mix = (o) => render(8, (A) => { A.play('t', Object.assign({ chords, bpm: 96, pattern: 'folk', vel: 0.55, guitar: false, drums: false, bass: false, click: false }, o)); return true; });
    out['band: all'] = stat(await mix({ guitar: true, drums: true, bass: true }));
    out['band: guitar only'] = stat(await mix({ guitar: true }));
    out['band: drums only'] = stat(await mix({ drums: true }));
    out['band: bass only'] = stat(await mix({ bass: true }));
    out['song playback'] = stat(await mix({ guitar: true, drums: true, bass: true, vel: 0.7 }));
    out['blues shuffle'] = stat(await mix({ guitar: true, drums: true, bass: true, pattern: 'eighths', swing: 0.33, chords: ['A7', 'D7', 'E7'].map(T.parseChord), bpm: 110 }));
    out['strum lab with click'] = stat(await mix({ guitar: true, click: true, vel: 0.8, pattern: 'eighths' }));
    out['click only'] = stat(await mix({ click: true }));
    if (window.W.audio.PICKS) out['pick lab: travis'] = stat(await mix({ guitar: true, pick: 'travis', vel: 0.85 }));
    const one = async (name, fn) => { out[name] = stat(await render(3.8, fn)); };
    await one('strum G, hard', (A) => A.strum(T.voicingMidis(T.voicing(T.parseChord('G'))), { when: 0.05, vel: 0.95, spread: 0.03 }));
    await one('strum E', (A) => A.strum(T.voicingMidis(T.voicing(T.parseChord('E'))), { when: 0.05, vel: 0.8 }));
    await one('one note', (A) => A.pluck(52, 0.05, 0.9, 2));
    await one('tuner tone A', (A) => A.tone(45));
    return out;
  }

  window.AUDIT = { SR, render, spectrum, centroid, harmonics, envelope, decayRate, pitch, peak, rms, onset, db, round, describeNote, midiHz, noteReport, mixReport };
})();
