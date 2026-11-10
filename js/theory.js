/* Music theory core: notes, scales, chords, keys, voicings. No DOM, no audio. */
(function () {
  const W = (window.W = window.W || {});

  const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  const LETTER = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const FLAT_KEYS = new Set([5, 10, 3, 8, 1]); // F Bb Eb Ab Db
  const TUNING = [40, 45, 50, 55, 59, 64]; // E2 A2 D3 G3 B3 E4, index 0 = low E
  const STRING_NAMES = ['low E', 'A', 'D', 'G', 'B', 'high E'];
  const STRING_ORD = ['6th', '5th', '4th', '3rd', '2nd', '1st'];

  const mod = (n, m = 12) => ((n % m) + m) % m;
  const noteName = (pc, flats) => (flats ? FLAT : SHARP)[mod(pc)];
  const keyFlats = (majorPc) => FLAT_KEYS.has(mod(majorPc));
  const keyName = (pc) => noteName(pc, keyFlats(pc));
  const minorKeyName = (pc) => noteName(pc, keyFlats(pc + 3));

  /* Chord-chart spelling (F#, Bb, bVII): what every chart online uses, and what the display face can draw. */
  const pretty = (s) => String(s);

  function parseNote(str) {
    const m = /^([A-Ga-g])([#b]?)$/.exec(String(str).trim());
    if (!m) return null;
    const acc = m[2] === '#' ? 1 : m[2] ? -1 : 0;
    return mod(LETTER[m[1].toUpperCase()] + acc);
  }

  const SCALES = {
    major: { name: 'Major scale', steps: [0, 2, 4, 5, 7, 9, 11], formula: 'W W H W W W H' },
    minor: { name: 'Natural minor', steps: [0, 2, 3, 5, 7, 8, 10], formula: 'W H W W H W W' },
    majPent: { name: 'Major pentatonic', steps: [0, 2, 4, 7, 9], formula: '1 2 3 5 6' },
    minPent: { name: 'Minor pentatonic', steps: [0, 3, 5, 7, 10], formula: '1 b3 4 5 b7' },
    blues: { name: 'Blues scale', steps: [0, 3, 5, 6, 7, 10], formula: '1 b3 4 b5 5 b7' },
  };
  const IVL = ['1', 'b2', '2', 'b3', '3', '4', 'b5', '5', 'b6', '6', 'b7', '7'];
  const DEG_OF = [1, 2, 2, 3, 3, 4, 5, 5, 6, 6, 7, 7]; // semitone -> scale-degree number (for colour)

  const Q = {
    maj: { s: '', iv: [0, 4, 7], third: 'maj', label: 'major' },
    min: { s: 'm', iv: [0, 3, 7], third: 'min', label: 'minor' },
    dom7: { s: '7', iv: [0, 4, 7, 10], third: 'maj', label: 'dominant 7' },
    maj7: { s: 'maj7', iv: [0, 4, 7, 11], third: 'maj', label: 'major 7' },
    min7: { s: 'm7', iv: [0, 3, 7, 10], third: 'min', label: 'minor 7' },
    sus4: { s: 'sus4', iv: [0, 5, 7], third: 'maj', label: 'sus4' },
    sus2: { s: 'sus2', iv: [0, 2, 7], third: 'maj', label: 'sus2' },
    dim: { s: 'dim', iv: [0, 3, 6], third: 'dim', label: 'diminished' },
    aug: { s: 'aug', iv: [0, 4, 8], third: 'maj', label: 'augmented' },
    five: { s: '5', iv: [0, 7], third: 'maj', label: 'power chord' },
    add9: { s: 'add9', iv: [0, 4, 7, 2], third: 'maj', label: 'add9' },
    six: { s: '6', iv: [0, 4, 7, 9], third: 'maj', label: '6' },
    min6: { s: 'm6', iv: [0, 3, 7, 9], third: 'min', label: 'minor 6' },
    nine: { s: '9', iv: [0, 4, 7, 10, 2], third: 'maj', label: '9' },
    m7b5: { s: 'm7b5', iv: [0, 3, 6, 10], third: 'dim', label: 'half-diminished' },
    dom7sus4: { s: '7sus4', iv: [0, 5, 7, 10], third: 'maj', label: '7sus4' },
  };
  const ALIAS = {
    '': 'maj', maj: 'maj', M: 'maj', major: 'maj',
    m: 'min', min: 'min', '-': 'min', minor: 'min',
    7: 'dom7', dom7: 'dom7', maj7: 'maj7', M7: 'maj7', maj9: 'maj7',
    m7: 'min7', min7: 'min7', '-7': 'min7', m9: 'min7', m11: 'min7',
    sus4: 'sus4', sus: 'sus4', sus2: 'sus2', dim: 'dim', '°': 'dim', dim7: 'dim',
    aug: 'aug', '+': 'aug', 5: 'five', add9: 'add9', 2: 'add9', 6: 'six', m6: 'min6',
    9: 'nine', 11: 'dom7', 13: 'dom7', m7b5: 'm7b5', 'ø': 'm7b5', '7sus4': 'dom7sus4', '7sus': 'dom7sus4',
  };

  function chord(root, q = 'maj', flats = false) {
    root = mod(root);
    const def = Q[q];
    return {
      root, q, flats,
      name: noteName(root, flats) + def.s,
      tones: def.iv.map((i) => mod(root + i)),
      third: def.third,
    };
  }

  function parseChord(str) {
    const m = /^([A-Ga-g])([#b]?)([^/\s]*)(?:\/[A-Ga-g][#b]?)?$/.exec(String(str).trim());
    if (!m) return null;
    const flat = m[2] === 'b';
    const root = mod(LETTER[m[1].toUpperCase()] + (m[2] ? (flat ? -1 : 1) : 0));
    let raw = m[3];
    let q = ALIAS[raw];
    if (!q) q = ALIAS[raw.toLowerCase()];
    if (!q) {
      if (/^(m|min|-)(?!aj)/.test(raw)) q = 'min';
      else if (/^[a-z0-9#+()]*$/i.test(raw)) q = raw.includes('7') ? 'dom7' : 'maj';
      else return null;
    }
    return chord(root, q, flat);
  }

  const NUM = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
  const NUM_SUF = {
    maj: '', min: '', dom7: '7', maj7: 'maj7', min7: '7', sus4: 'sus4', sus2: 'sus2', dim: '°', aug: '+',
    five: '5', add9: 'add9', six: '6', min6: '6', nine: '9', m7b5: 'ø', dom7sus4: '7sus4',
  };
  function numeral(ch, keyPc, bare) {
    let n = NUM[mod(ch.root - keyPc)];
    if (ch.third !== 'maj') n = n.replace(/[IV]+/, (x) => x.toLowerCase());
    if (bare) return n + (ch.third === 'dim' ? '°' : '');
    return n + NUM_SUF[ch.q];
  }
  const degreeOf = (pc, keyPc) => DEG_OF[mod(pc - keyPc)];

  const DIATONIC_Q = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
  function diatonic(keyPc) {
    const flats = keyFlats(keyPc);
    return SCALES.major.steps.map((st, i) => {
      const ch = chord(keyPc + st, DIATONIC_Q[i], flats);
      return { chord: ch, numeral: numeral(ch, keyPc), degree: i + 1 };
    });
  }

  /* Guess the (relative-major) key of a list of chords. */
  function detectKey(chords) {
    if (!chords.length) return { key: 0, minor: false, confidence: 0 };
    let best = null;
    const scores = [];
    for (let k = 0; k < 12; k++) {
      let s = 0;
      const has = {};
      chords.forEach((ch) => {
        const d = mod(ch.root - k);
        const idx = SCALES.major.steps.indexOf(d);
        if (idx >= 0) {
          const want = DIATONIC_Q[idx];
          const ok = (want === 'dim' ? ch.third === 'dim' : ch.third === want) &&
            !(ch.q === 'dom7' && idx !== 4) && !(ch.q === 'maj7' && idx !== 0 && idx !== 3);
          s += ok ? 1 : 0.25;
          if (ok) has[idx] = true;
          if (idx === 4 && ch.q === 'dom7') s += 0.5;
        } else if (d === 10 && ch.third === 'maj') s += 0.4;
        else s -= 0.5;
      });
      s = s / chords.length * 4;
      const first = mod(chords[0].root - k), last = mod(chords[chords.length - 1].root - k);
      if (first === 0 && chords[0].third === 'maj') s += 0.6;
      if (first === 9 && chords[0].third === 'min') s += 0.35;
      if (last === 0 && chords[chords.length - 1].third === 'maj') s += 0.3;
      if (has[0]) s += 0.3;
      if (has[3] && has[4]) s += 0.3;
      scores.push(s);
      if (!best || s > best.s) best = { k, s };
    }
    const k = best.k;
    const first = chords[0];
    const minor = mod(first.root - k) === 9 && first.third === 'min' && !chords.some((c) => mod(c.root - k) === 0 && c === chords[chords.length - 1]);
    const sorted = scores.slice().sort((a, b) => b - a);
    return { key: k, minor, confidence: sorted[0] - sorted[1] };
  }

  /* ---------- Voicings ---------- */
  const OPEN = {
    'C': 'x32010', 'D': 'xx0232', 'G': '320003', 'F': '133211', 'B': 'x24442',
    'Dm': 'xx0231', 'Bm': 'x24432',
    'C7': 'x32310', 'D7': 'xx0212', 'G7': '320001', 'B7': 'x21202',
    'Cmaj7': 'x32000', 'Dmaj7': 'xx0222', 'Gmaj7': '320002', 'Fmaj7': 'xx3210',
    'Dm7': 'xx0211', 'Em7': '022030',
    'Dsus2': 'xx0230', 'Dsus4': 'xx0233', 'Gsus4': '330013', 'Csus4': 'x33011', 'Csus2': 'x30033',
    'Cadd9': 'x32030', 'Gadd9': '320203', 'Dadd9': 'xx0230', 'G6': '320000', 'C6': 'x32210', 'D6': 'xx0202',
    'D5': 'xx023x',
  };
  const X = -1;
  const E_SHAPE = {
    maj: (f) => [f, f + 2, f + 2, f + 1, f, f],
    min: (f) => [f, f + 2, f + 2, f, f, f],
    dom7: (f) => [f, f + 2, f, f + 1, f, f],
    min7: (f) => [f, f + 2, f, f, f, f],
    maj7: (f) => [f, X, f + 1, f + 1, f, X],
    sus4: (f) => [f, f + 2, f + 2, f + 2, f, f],
    dom7sus4: (f) => [f, f + 2, f, f + 2, f, f],
    five: (f) => [f, f + 2, f + 2, X, X, X],
  };
  const A_SHAPE = {
    maj: (a) => [X, a, a + 2, a + 2, a + 2, a],
    min: (a) => [X, a, a + 2, a + 2, a + 1, a],
    dom7: (a) => [X, a, a + 2, a, a + 2, a],
    min7: (a) => [X, a, a + 2, a, a + 1, a],
    maj7: (a) => [X, a, a + 2, a + 1, a + 2, a],
    sus4: (a) => [X, a, a + 2, a + 2, a + 3, a],
    sus2: (a) => [X, a, a + 2, a + 2, a, a],
    dom7sus4: (a) => [X, a, a + 2, a, a + 3, a],
    dim: (a) => [X, a, a + 1, a + 2, a + 1, X],
    m7b5: (a) => [X, a, a + 1, a, a + 1, X],
    aug: (a) => [X, a, a + 3, a + 2, a + 2, a + 1],
    five: (a) => [X, a, a + 2, a + 2, X, X],
  };
  const REDUCE = { add9: 'maj', six: 'maj', min6: 'min', nine: 'dom7' };

  function voicing(ch, force) {
    const key = SHARP[ch.root] + Q[ch.q].s;
    if (!force && OPEN[key]) {
      return { frets: OPEN[key].split('').map((c) => (c === 'x' ? X : +c)), shape: key === 'F' || key === 'B' || key === 'Bm' ? 'barre' : 'open' };
    }
    const q = E_SHAPE[ch.q] || A_SHAPE[ch.q] ? ch.q : REDUCE[ch.q] || 'maj';
    const f = mod(ch.root - 4), a = mod(ch.root - 9);
    const useE = force ? force === 'E' : E_SHAPE[q] && (!A_SHAPE[q] || f <= a);
    const frets = useE && E_SHAPE[q] ? E_SHAPE[q](f) : A_SHAPE[q](a);
    const pos = useE && E_SHAPE[q] ? f : a;
    return { frets, shape: pos === 0 ? 'open' : useE && E_SHAPE[q] ? 'E' : 'A', pos };
  }
  const voicingMidis = (v) => v.frets.map((f, s) => (f < 0 ? null : TUNING[s] + f));

  /* Fingerstyle: the string each picking-hand voice plays for a chord shape.
     R is the lowest root, under the thumb. A is the thumb's second bass string. i, m, a are index, middle, ring.
     `alt` says the pattern rocks the thumb between R and A; on D-type shapes that takes the G string away from the index finger. */
  function pickMap(ch, v, alt) {
    v = v || voicing(ch);
    const fr = v.frets, on = (s) => s >= 0 && s < 6 && fr[s] >= 0;
    let R = [0, 1, 2].find((s) => on(s) && (TUNING[s] + fr[s]) % 12 === ch.root);
    if (R === undefined) R = fr.findIndex((f) => f >= 0);
    let A = R <= 1 ? 2 : R + 1;
    if (!on(A)) { A = [R + 1, R + 2, R - 1].find(on); if (A === undefined) A = R; }
    const want = alt && A >= 3 ? { i: 4, m: 5, a: 5 } : { i: 3, m: 4, a: 5 };
    const out = { R, A };
    Object.keys(want).forEach((k) => { let s = want[k]; while (s > R && !on(s)) s--; out[k] = s; });
    return out;
  }

  /* ---------- Progression library (semitones above the major-key tonic) ---------- */
  const P = (list) => list.map(([d, q]) => ({ d, q: q || 'maj' }));
  const PROGS = [
    { id: 'axis', name: 'The four-chord song', nums: 'I – V – vi – IV', steps: P([[0], [7], [9, 'min'], [5]]), note: 'The most common loop in pop. Thousands of songs are exactly this.' },
    { id: 'three', name: 'Three-chord trick', nums: 'I – IV – V – IV', steps: P([[0], [5], [7], [5]]), note: 'Rock, country, folk, punk. If a song has three chords, they are almost always these.' },
    { id: 'fifties', name: 'The 50s loop', nums: 'I – vi – IV – V', steps: P([[0], [9, 'min'], [5], [7]]), note: 'Doo-wop and early rock and roll. Same four chords as above, different order.' },
    { id: 'minorstart', name: 'The minor start', nums: 'vi – IV – I – V', steps: P([[9, 'min'], [5], [0], [7]]), note: 'The four-chord song begun from the vi. Same chords, moodier.' },
    { id: 'climb', name: 'The climb', nums: 'I – IV – vi – V', steps: P([[0], [5], [9, 'min'], [7]]), note: 'Lifts into the chorus. Common in anthems.' },
    { id: 'blues', name: '12-bar blues', nums: 'I I I I · IV IV I I · V IV I V', steps: P([[0, 'dom7'], [0, 'dom7'], [0, 'dom7'], [0, 'dom7'], [5, 'dom7'], [5, 'dom7'], [0, 'dom7'], [0, 'dom7'], [7, 'dom7'], [5, 'dom7'], [0, 'dom7'], [7, 'dom7']]), note: 'The shared language of every jam. Twelve bars, three chords, everyone knows where they are.' },
  ];
  const progChords = (prog, keyPc) => prog.steps.map((s) => chord(keyPc + s.d, s.q, keyFlats(keyPc)));

  /* Name the pattern in a list of chords, if it is one of the classics. */
  function matchProg(chords, keyPc) {
    const seq = [];
    chords.forEach((c) => {
      const n = numeral(c, keyPc, true);
      if (seq[seq.length - 1] !== n) seq.push(n);
    });
    if (seq.length > 1 && seq[0] === seq[seq.length - 1]) seq.pop();
    const set = new Set(seq);
    for (const p of PROGS) {
      if (p.id === 'blues' || p.id === 'three') continue;
      const pat = p.steps.map((s) => numeral(chord(s.d, s.q), 0, true));
      if (seq.length % pat.length !== 0) continue;
      for (let r = 0; r < pat.length; r++) {
        if (seq.every((n, i) => n === pat[(i + r) % pat.length])) {
          const exact = r === 0 ? p : PROGS.find((x) => x.id !== 'blues' && x.steps.length === pat.length && x.steps.every((s, i) => numeral(chord(s.d, s.q), 0, true) === pat[(i + r) % pat.length]));
          return exact || p;
        }
      }
    }
    if (set.size === 3 && set.has('I') && set.has('IV') && set.has('V')) return PROGS[1];
    if (set.size === 4 && ['I', 'IV', 'V', 'vi'].every((n) => set.has(n))) return { id: 'fourset', name: 'The four-chord family', nums: 'I, IV, V and vi', note: 'Same four chords as the four-chord song, in its own order.' };
    return null;
  }

  W.T = {
    SHARP, FLAT, TUNING, STRING_NAMES, STRING_ORD, SCALES, IVL, DEG_OF, Q, PROGS, NUM,
    mod, noteName, keyFlats, keyName, minorKeyName, pretty, parseNote, chord, parseChord, numeral, degreeOf,
    diatonic, detectKey, voicing, voicingMidis, pickMap, progChords, matchProg,
  };
})();
