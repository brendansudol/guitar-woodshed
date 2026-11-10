/* Fingerstyle: the Pick Lab trainer, and the demos used by the fingerstyle side track. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc, chips } = R;
  const P = T.pretty;

  Object.assign(W.GLOSSARY, {
    travis: { t: 'Travis picking', re: /\btravis picking\b/i, d: 'A steady alternating bass from the thumb, with the fingers plucking in the gaps between the beats. Named after the guitarist Merle Travis.' },
    altbass: { t: 'Alternating bass', re: /\balternating bass\b/i, d: 'The thumb plays a bass note on every beat, rocking between the chord’s root and a second bass string.' },
    fingerstyle: { t: 'Fingerstyle', re: /\bfingerstyle\b/i, d: 'Plucking single strings with the thumb and fingers of the picking hand instead of strumming. Also called fingerpicking.' },
    pima: { t: 'p, i, m, a', re: /\bp, i, m and a\b/i, d: 'Letters for the picking-hand fingers, from their Spanish names: p is the thumb, i the index, m the middle and a the ring finger. The little finger sits out.' },
    arpeggio: { t: 'Arpeggio', re: /\barpeggios?\b/i, d: 'A chord played one note at a time instead of all at once.' },
    pinch: { t: 'Pinch', re: /\bpinch\b/i, d: 'The thumb and a finger plucking two strings at the same moment.' },
    tenth: { t: '10th', re: /\b10ths?\b/i, d: 'Two notes ten scale steps apart: a bass note, and the 3rd of its chord in the next octave up.' },
    sus: { t: 'Sus and add chords', re: /\bsus4\b/i, d: 'A chord with one note swapped or added. Sus4 and sus2 replace the 3rd with the 4th or the 2nd. Add9 keeps the 3rd and adds the 2nd on top.' },
  });

  const parse = (text) => String(text).split(/[\s,|]+/).map(T.parseChord).filter(Boolean);
  const PICK_ORDER = ['roll', 'ballad', 'six', 'thumb', 'pinch', 'travis'];
  U.tr.pick = { pat: 'roll', bpm: 66, text: 'C Am F G', click: true, song: null };

  /* ================= Shared: one picking loop on screen ================= */
  function thumbLine(ch, patKey) {
    const pat = A.PICKS[patKey], v = T.voicing(ch), m = T.pickMap(ch, v, pat.alt);
    const fl = ch.flats || T.keyFlats(ch.root);
    const note = (s) => P(T.noteName(T.TUNING[s] + v.frets[s], fl));
    const isRoot = (T.TUNING[m.R] + v.frets[m.R]) % 12 === ch.root;
    return `<strong>${esc(P(ch.name))}</strong>: thumb on the ${T.STRING_NAMES[m.R]} string (${note(m.R)}${isRoot ? ', the root' : ''})`
      + (pat.alt && m.A !== m.R ? `, then the ${T.STRING_NAMES[m.A]} string (${note(m.A)}).` : '.');
  }
  function pickPanel(scope, chords, patKey, keyPc, box) {
    return `<div class="stack" data-prog="${scope}">
      <div data-pick-grid>${R.pickGrid(chords[0], patKey)}</div>
      <p class="note" data-pick-thumb>${thumbLine(chords[0], patKey)}</p>
      <div class="tiles">${chords.map((c, i) => R.chordTile(c, keyPc, { idx: i, cls: box ? '' : 'mini', box })).join('')}</div></div>`;
  }
  const LEGEND = `<div class="legend">${[['p', 'thumb'], ['i', 'index'], ['m', 'middle'], ['a', 'ring']].map(([k, n]) => `<span class="pair"><b class="pick-dot">${k}</b> ${n}</span>`).join('')}<span class="pair"><b class="pick-dot root"></b> red is the chord’s root note</span></div>`;

  /* Player options for a picking loop. The grid is redrawn for each chord, because the thumb changes string. */
  function pickOpts(scope, chords, patKey, bpm, extra) {
    const root = () => document.querySelector(`[data-prog="${scope}"]`);
    const hl = W.hl(scope), t0 = Date.now();
    let step = 0;
    const mark = () => { const r = root(); if (r) r.querySelectorAll('[data-step]').forEach((el) => el.classList.toggle('now', +el.dataset.step === step)); };
    const draw = (i) => {
      const r = root();
      if (!r) return;
      const g = r.querySelector('[data-pick-grid]'), t = r.querySelector('[data-pick-thumb]');
      if (g) g.innerHTML = R.pickGrid(chords[i], patKey);
      if (t) t.innerHTML = thumbLine(chords[i], patKey);
    };
    return Object.assign({
      chords, bpm, pick: patKey, vel: 0.85,
      onStep(s) { step = s; mark(); },
      onChord(i) { hl.onChord(i); draw(i); mark(); },
      onStop() {
        hl.onStop(); draw(0);
        if (Date.now() - t0 >= 60000) { W.goalHit('pick'); W.logBlock('w'); }
      },
    }, extra);
  }

  /* ================= Pick Lab ================= */
  function pickTab() {
    const st = U.tr.pick, pat = A.PICKS[st.pat];
    const typed = parse(st.text).slice(0, 16);
    const use = typed.length ? typed : [T.parseChord('C')];
    const key = T.detectKey(use).key;
    const id = W.reg('pick', () => pickOpts('pick', use, st.pat, st.bpm, { click: st.click }));
    const days = (S.goals.pick || []).length;
    return `<p class="lede">${W.term('fingerstyle', 'Fingerstyle')} keeps the fretting hand you already have and gives the other hand a new job. The thumb looks after the three thick strings. Index, middle and ring take one thin string each.</p>
      ${st.song ? `<div class="row"><span class="tag">Your song</span><strong>${esc(st.song)}</strong></div>` : ''}
      <div class="stack tight"><span class="label">Pattern</span>${chips(PICK_ORDER.map((k) => ({ v: k, l: A.PICKS[k].name })), st.pat, 'set', 'data-path="tr.pick.pat"')}</div>
      <p class="note">${esc(pat.say)}</p>
      ${pickPanel('pick', use, st.pat, key)}
      ${LEGEND}
      <div class="transport">${R.playBtn(id, 'Play along', 'primary')}
        <label class="field"><span class="label">Tempo <span data-out="tr.pick.bpm">${st.bpm}</span> bpm</span><input id="pick-bpm" type="range" min="40" max="132" value="${st.bpm}" data-on="range" data-path="tr.pick.bpm" data-live="bpm"></label>
        <label class="field" style="min-width:180px"><span class="label">Chords, one bar each</span><input id="pick-text" type="text" value="${esc(st.text)}" data-change="pickText" autocomplete="off" spellcheck="false"></label>
        <div class="stack tight"><span class="label">With</span><div class="chips"><button type="button" class="chip${st.click ? ' on' : ''}" data-act="pickClick" aria-pressed="${st.click}">Click</button></div></div>
      </div>
      <p class="note">Each row is a string, thinnest on top, as in tab. Each dot is one pluck and the letter is the finger. Hold the chord, rest each finger on its string, and start slower than feels necessary: even notes at 50 are worth more than uneven ones at 100.${days ? ` You have played along here on ${days} day${days === 1 ? '' : 's'}.` : ''}</p>`;
  }
  Object.assign(W.TRAIN.labels, { pick: 'Pick Lab' });
  Object.assign(W.TRAIN.fns, { pick: pickTab });
  W.TRAIN.order = W.TRAIN.order.concat('pick');

  /* ================= Lesson demos ================= */
  W.WIDGETS = W.WIDGETS || {};

  /* A picking pattern over fixed chords, or over one chord at a time when the lesson is about where the thumb goes. */
  W.WIDGETS.pick = function (l, st, path) {
    const w = l.w, all = parse(w.chords);
    if (st.pat === undefined) st.pat = w.patterns[0];
    if (st.bpm === undefined) st.bpm = w.bpm || 60;
    if (st.ch === undefined) st.ch = all[0].name;
    const chords = w.one ? [T.parseChord(st.ch) || all[0]] : all;
    const key = T.detectKey(all).key, pat = A.PICKS[st.pat];
    const id = W.reg('w-pick', () => pickOpts('w-pick', chords, st.pat, st.bpm, { click: true }));
    return `${w.one ? `<div class="stack tight"><span class="label">Chord</span>${chips(all.map((c) => c.name), st.ch, 'set', `data-path="${path}ch"`)}</div>` : ''}
      ${w.patterns.length > 1 ? `<div class="stack tight"><span class="label">Pattern</span>${chips(w.patterns.map((k) => ({ v: k, l: A.PICKS[k].name })), st.pat, 'set', `data-path="${path}pat"`)}</div>` : ''}
      <p class="note">${esc(pat.say)}</p>
      ${pickPanel('w-pick', chords, st.pat, key, w.one)}
      ${LEGEND}
      <div class="transport">${R.playBtn(id, 'Play along')}
        <label class="field"><span class="label">Tempo <span data-out="${path}bpm">${st.bpm}</span> bpm</span><input id="w-bpm" type="range" min="40" max="120" value="${st.bpm}" data-on="range" data-path="${path}bpm" data-live="bpm"></label></div>`;
  };

  /* Timed one-shot demos: plain timers, so they can be cancelled when the screen changes. */
  let timers = [];
  const demoStop = () => { timers.forEach(clearTimeout); timers = []; document.querySelectorAll('.pair-btn.now').forEach((b) => b.classList.remove('now')); };
  const at = (ms, fn) => timers.push(setTimeout(fn, ms));
  const demoStart = () => { A.stop(); demoStop(); A.ensure(); if (!W.leave.includes(demoStop)) W.leave.push(demoStop); };

  /* Pairs of notes a 10th apart on the A and B strings, one per chord of the key. */
  function tenthPairs(key) {
    const fam = T.diatonic(key), fl = T.keyFlats(key), f0 = T.mod(key - 9);
    return [0, 2, 4, 5, 7, 9].map((stepUp, i) => {
      let f = f0 + stepUp;
      if (f > 12) f -= 12;
      const minor = fam[i].chord.third === 'min', g = f + (minor ? 1 : 2);
      return { i, f, g, minor, num: fam[i].numeral, chord: fam[i].chord, low: T.noteName(key + stepUp, fl), high: T.noteName(T.TUNING[4] + g, fl) };
    }).sort((a, b) => a.f - b.f);
  }
  const playPair = (p) => { A.pluck(T.TUNING[1] + p.f, 0, 0.9, 1); A.pluck(T.TUNING[4] + p.g, 0, 0.8, 4); };
  W.WIDGETS.tenths = function (l, st, path) {
    if (st.key === undefined) st.key = 0;
    const pairs = tenthPairs(st.key), sel = pairs.find((p) => p.i === st.sel);
    const marks = {};
    pairs.forEach((p) => {
      const dim = !!sel && sel !== p;
      marks['1:' + p.f] = { t: p.low, d: p.i + 1, dim };
      marks['4:' + p.g] = { t: p.high, d: ((p.i + 2) % 7) + 1, dim };
    });
    marks['3:0'] = { t: 'G', d: T.degreeOf(7, st.key), ring: true };
    return `<div class="stack tight"><span class="label">Key</span>${W.keyChips(path + 'key', st.key, [0, 7, 2])}</div>
      ${R.fretboard({ id: 'w', frets: 14, marks, strings: [1, 3, 4] })}
      <div class="stack tight"><span class="label">Tap a pair to hear it</span>
        <div class="pairs">${pairs.map((p) => `<button type="button" class="pair-btn${sel === p ? ' now' : ''}" data-act="tenth" data-l="${l.id}" data-i="${p.i}">${R.degTag(p.num, p.i + 1)}<b>${esc(P(p.low))} + ${esc(P(p.high))}</b><small>${p.minor ? 'narrow · minor' : 'wide · major'}</small></button>`).join('')}</div></div>
      <div class="row"><button type="button" class="btn" data-act="tenthClimb" data-l="${l.id}"><span class="btn-ico" aria-hidden="true"></span>Hear the climb</button>
        <span class="note">Each pair, with the open G string between them.</span></div>
      <p class="note">The lower note is on the A string and names the chord. The upper note is on the B string: <strong>two frets higher for a major chord, one fret higher for a minor</strong>. The ringed open G string belongs to the key, so it can ring under every pair.</p>`;
  };

  /* Melody notes within reach of an open chord shape, and what each one turns the chord into. */
  const TOP_SHAPES = ['D', 'C', 'G', 'A', 'E'];
  function topMoves(ch) {
    const v = T.voicing(ch), scale = T.SCALES.major.steps.map((x) => T.mod(ch.root + x));
    const thirds = v.frets.filter((f, s) => f >= 0 && T.mod(T.TUNING[s] + f - ch.root) === 4).length;
    const out = [];
    for (let s = 5; s >= 3; s--) {
      if (v.frets[s] < 0) continue;
      const orig = T.mod(T.TUNING[s] + v.frets[s] - ch.root);
      for (let f = 0; f <= 3; f++) {
        const pc = (T.TUNING[s] + f) % 12, ivl = T.mod(pc - ch.root);
        if (f === v.frets[s] || !scale.includes(pc)) continue;
        const sus = orig === 4 && thirds === 1;
        const tag = [0, 4, 7].includes(ivl) ? '' : ivl === 2 ? (sus ? 'sus2' : 'add9') : ivl === 5 ? (sus ? 'sus4' : null) : ivl === 9 ? '6' : ivl === 11 ? 'maj7' : null;
        out.push({ s, f, ivl, name: tag === null ? `${ch.name} + the 4` : ch.name + tag, same: tag === '' });
      }
    }
    return { v, moves: out };
  }
  W.WIDGETS.topnotes = function (l, st, path) {
    if (st.ch === undefined) st.ch = 'D';
    const ch = T.parseChord(st.ch) || T.parseChord('D'), { v, moves } = topMoves(ch);
    const marks = {};
    v.frets.forEach((f, s) => { if (f >= 0) { const ivl = T.mod(T.TUNING[s] + f - ch.root); marks[s + ':' + f] = { t: T.IVL[ivl], d: T.DEG_OF[ivl], ring: true }; } });
    moves.forEach((m) => { marks[m.s + ':' + m.f] = { t: T.IVL[m.ivl], d: T.DEG_OF[m.ivl] }; });
    const where = (m) => `${T.STRING_NAMES[m.s]}, ${m.f === 0 ? 'open' : 'fret ' + m.f}`;
    return `<div class="stack tight"><span class="label">Hold this shape</span>${chips(TOP_SHAPES, st.ch, 'set', `data-path="${path}ch"`)}</div>
      <div style="max-width:420px">${R.fretboard({ id: 'w', frets: 5, marks })}</div>
      <p class="note"><strong>Ringed</strong> notes are the ${esc(P(ch.name))} shape itself. The plain dots are the other notes of the ${esc(P(ch.name))} major scale your fingers can reach on the three thin strings without letting go of the chord.</p>
      <div class="stack tight"><span class="label">Tap a note to hear what it does to the chord</span>
        <div class="pairs">${moves.map((m) => `<button type="button" class="pair-btn" data-act="topHear" data-ch="${esc(ch.name)}" data-s="${m.s}" data-f="${m.f}">${R.degTag(T.IVL[m.ivl], T.DEG_OF[m.ivl])}<b>${esc(P(m.name))}</b><small>${where(m)}${m.same ? ' · same chord' : ''}</small></button>`).join('')}</div></div>
      <div class="row"><button type="button" class="btn" data-act="topTune" data-ch="${esc(ch.name)}"><span class="btn-ico" aria-hidden="true"></span>Hear a tune on top</button>
        <span class="note">Thumb on the root, the tune on the high E string, index and middle filling in the chord.</span></div>`;
  };

  Object.assign(W.ACT, {
    pickClick() {
      const st = U.tr.pick;
      st.click = !st.click;
      if (A.player.id === 'pick') A.player.opts.click = st.click;
      W.render();
    },
    pickSong(el) {
      const song = S.songs.find((s) => s.id === el.dataset.id);
      if (!song) return;
      const an = W.analyze(song), line = an.lines.find((x) => x.chords.length) || { chords: an.all };
      Object.assign(U.tr.pick, { text: line.chords.slice(0, 8).map((c) => c.name).join(' '), song: song.title });
      U.tr.tab = 'pick';
      W.go('train');
    },
    tenth(el) {
      const st = U.w[el.dataset.l];
      if (!st) return;
      demoStart();
      const p = tenthPairs(st.key).find((x) => x.i === +el.dataset.i);
      st.sel = p.i;
      playPair(p);
      at(340, () => A.pluck(T.TUNING[3], 0, 0.6, 3));
      W.render();
    },
    tenthClimb(el) {
      const st = U.w[el.dataset.l];
      if (!st) return;
      demoStart();
      st.sel = null;
      W.render();
      const key = st.key, gap = 380;
      tenthPairs(key).forEach((p, k) => {
        at(k * gap * 2, () => {
          if (st.key !== key) return demoStop();
          document.querySelectorAll('.pair-btn').forEach((b) => b.classList.toggle('now', +b.dataset.i === p.i));
          playPair(p);
        });
        at(k * gap * 2 + gap, () => A.pluck(T.TUNING[3], 0, 0.6, 3));
      });
      at(6 * gap * 2 + 600, demoStop);
    },
    topHear(el) {
      const ch = T.parseChord(el.dataset.ch);
      if (!ch) return;
      demoStart();
      const midis = T.voicingMidis(T.voicing(ch)), s = +el.dataset.s;
      midis[s] = T.TUNING[s] + +el.dataset.f;
      A.strum(midis, { spread: 0.05 });
      at(900, () => A.pluck(midis[s], 0, 0.95, s));
    },
    topTune(el) {
      const ch = T.parseChord(el.dataset.ch);
      if (!ch) return;
      demoStart();
      const { v, moves } = topMoves(ch), map = T.pickMap(ch, v, false), midis = T.voicingMidis(v);
      const frets = [...new Set(moves.filter((m) => m.s === 5).map((m) => m.f).concat(v.frets[5]))].sort((a, b) => a - b);
      const tune = frets.concat(frets.slice(0, -1).reverse()), gap = 270;
      tune.forEach((f, k) => {
        const t = k * gap * 4;
        at(t, () => { A.pluck(midis[map.R], 0, 0.85, map.R); A.pluck(T.TUNING[5] + f, 0, 0.95, 5); });
        [map.i, map.m, map.i].forEach((s, n) => at(t + (n + 1) * gap, () => A.pluck(midis[s], 0, 0.5, s)));
      });
      at(tune.length * gap * 4, () => A.strum(midis, { spread: 0.05, vel: 0.7 }));
    },
  });
  W.ON.pickText = function (el) { A.stop(); U.tr.pick.text = el.value; U.tr.pick.song = null; W.render(); };
})();
