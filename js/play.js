/* The Jam Room and the trainers. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc, chips } = R;
  const P = T.pretty;
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const $ = (id) => document.getElementById(id);

  /* ================= Jam Room ================= */
  const D7 = 'dom7';
  const JAMS = {
    major: [
      { n: 'I – V – vi – IV', s: [[0], [7], [9, 'min'], [5]] },
      { n: 'I – IV – V – IV', s: [[0], [5], [7], [5]] },
      { n: 'I – vi – IV – V', s: [[0], [9, 'min'], [5], [7]] },
      { n: 'I – IV vamp', s: [[0], [5]] },
    ],
    minor: [
      { n: 'vi – V – IV – V', s: [[9, 'min'], [7], [5], [7]] },
      { n: 'vi – IV – I – V', s: [[9, 'min'], [5], [0], [7]] },
      { n: 'vi – ii vamp', s: [[9, 'min'], [2, 'min']] },
    ],
    blues: [{ n: '12-bar blues', s: [[0, D7], [0, D7], [0, D7], [0, D7], [5, D7], [5, D7], [0, D7], [0, D7], [7, D7], [5, D7], [0, D7], [7, D7]] }],
  };
  const SCALE_OPTS = { major: ['majPent', 'major'], minor: ['minPent', 'minor', 'blues'], blues: ['minPent', 'blues'] };
  const TIPS = {
    major: 'In a major key the box sits three frets below the key note. Lean on the red note and it sounds sweet.',
    minor: 'In a minor key the box starts on the key note itself. Red is home. Bend the 4 toward the 5 for instant blues.',
    blues: 'Minor pentatonic over major chords is the blues sound: that clash is the point. Rest on red, b7 and 5.',
  };

  function jamSetup() {
    const j = U.jam, custom = j.custom;
    const list = JAMS[j.feel];
    if (j.prog >= list.length) j.prog = 0;
    const majorKey = custom ? custom.majorKey : j.feel === 'minor' ? T.mod(j.key + 3) : j.key;
    const fl = T.keyFlats(majorKey);
    const chords = custom ? custom.chords : list[j.prog].s.map(([d, q]) => T.chord(majorKey + d, q || 'maj', fl));
    const scales = SCALE_OPTS[j.feel];
    if (!scales.includes(j.scale)) j.scale = scales[0];
    const mroot = j.feel === 'major' ? j.key - 3 : j.key, f = T.mod(mroot - 4);
    const pent = j.scale !== 'major' && j.scale !== 'minor';
    return { majorKey, fl, chords, scales, tonic: j.key, f, win: pent ? [f, f + 3] : [Math.max(0, f - 1), f + 4] };
  }
  function jamBoard(ci) {
    const j = U.jam, s = jamSetup(), ch = s.chords[ci || 0], box = j.pos === 'box';
    const marks = R.scaleMarks({ root: s.tonic, pcs: T.SCALES[j.scale].steps.map((x) => s.tonic + x), label: j.label, colorRoot: s.tonic, from: box ? s.win[0] : 0, to: box ? s.win[1] : 15, dimOutside: box, ringPcs: ch.tones, flats: s.fl });
    return R.fretboard({ id: 'jam', marks, window: box ? s.win : null });
  }
  function jamNow(big, small) { const a = $('jam-now'), b = $('jam-sub'); if (a) a.textContent = big; if (b) b.textContent = small; }

  W.VIEWS.jam = function () {
    const j = U.jam, s = jamSetup(), ci = A.player.id === 'jam' ? j.ci || 0 : 0;
    const blues = j.feel === 'blues';
    const hl = W.hl('jam');
    const id = W.reg('jam', () => {
      const t0 = Date.now();
      j.ci = 0;
      return {
        chords: s.chords, bpm: j.bpm, pattern: blues ? 'eighths' : 'folk', swing: blues ? 0.33 : 0, drums: j.drums, bass: j.bass, guitar: j.guitar, vel: 0.55, countIn: true,
        onCount(n) { jamNow(String(n), 'count in'); },
        onChord(i) {
          j.ci = i; hl.onChord(i);
          const c = s.chords[i];
          jamNow(P(c.name), `${P(T.numeral(c, s.majorKey))} · chord ${i + 1} of ${s.chords.length}`);
          const box = $('jam-fb');
          if (box) { const old = box.querySelector('.fb-wrap'), x = old ? old.scrollLeft : 0; box.innerHTML = jamBoard(i); const nw = box.querySelector('.fb-wrap'); if (nw) nw.scrollLeft = x; }
        },
        onStep(step) { document.querySelectorAll('#jam-beats i').forEach((el, b) => el.classList.toggle('now', b === Math.floor(step / 2))); },
        onStop() { hl.onStop(); j.ci = 0; document.querySelectorAll('#jam-beats i').forEach((el) => el.classList.remove('now')); if (Date.now() - t0 > 45000) W.logBlock('j'); },
      };
    });
    const c0 = s.chords[ci];
    const keyLabel = j.feel === 'minor' ? T.minorKeyName(j.key) + ' minor' : T.keyName(j.key) + (blues ? ' blues' : ' major');
    const mixChip = (k, l) => `<button type="button" class="chip${j[k] ? ' on' : ''}" data-act="jamMix" data-k="${k}" aria-pressed="${j[k]}">${l}</button>`;
    return `<div class="head"><span class="eyebrow">Jam room</span><h1>${P(keyLabel)}</h1>
        <p class="lede">A band that never gets tired. Strum along with the chords, or take the lead: every dot on the neck is a safe note, and the <strong>ringed</strong> ones belong to the chord playing right now.</p></div>
      ${j.custom ? `<div class="row"><span class="tag">Your song</span><strong>${esc(j.custom.title)}</strong><button type="button" class="btn sm quiet" data-act="jamClear">Back to the standard loops</button></div>` : `
      <div class="row" style="gap:20px 28px;align-items:flex-start">
        <div class="stack tight"><span class="label">Feel</span>${chips([{ v: 'major', l: 'Major' }, { v: 'minor', l: 'Minor' }, { v: 'blues', l: 'Blues' }], j.feel, 'jamSet', 'data-k="feel"')}</div>
        <div class="stack tight"><span class="label">Key</span>${chips(W.KEY_ORDER.map((pc) => ({ v: pc, l: j.feel === 'minor' ? T.minorKeyName(pc) + 'm' : T.keyName(pc) })), j.key, 'jamSet', 'data-k="key"')}</div>
        ${JAMS[j.feel].length > 1 ? `<div class="stack tight"><span class="label">Loop</span>${chips(JAMS[j.feel].map((p, i) => ({ v: i, l: p.n })), j.prog, 'jamSet', 'data-k="prog"')}</div>` : ''}
      </div>`}
      <section class="panel">
        <div class="row between" style="align-items:flex-end;gap:20px">
          <div class="stack tight"><span class="label" id="jam-sub">${P(T.numeral(c0, s.majorKey))} · chord ${ci + 1} of ${s.chords.length}</span>
            <div class="now-chord" id="jam-now">${P(c0.name)}</div></div>
          <div class="stack" style="align-items:flex-end"><div class="beats" id="jam-beats"><i></i><i></i><i></i><i></i></div>
            ${R.playBtn(id, 'Start the band', 'primary big')}</div>
        </div>
        ${W.progStrip('jam', s.chords, s.majorKey, { mini: true })}
        <div class="transport">
          <label class="field"><span class="label">Tempo <span data-out="jam.bpm">${j.bpm}</span> bpm</span><input id="jam-bpm" type="range" min="56" max="150" value="${j.bpm}" data-on="range" data-path="jam.bpm" data-live="bpm"></label>
          <div class="stack tight"><span class="label">Band</span><div class="chips">${mixChip('drums', 'Drums')}${mixChip('bass', 'Bass')}${mixChip('guitar', 'Rhythm guitar')}</div></div>
        </div>
      </section>
      <section class="stack">
        <div class="row" style="gap:16px 28px;align-items:flex-start">
          <div class="stack tight"><span class="label">Scale</span>${chips(s.scales.map((k) => ({ v: k, l: T.SCALES[k].name })), j.scale, 'set', 'data-path="jam.scale" data-keep="1"')}</div>
          <div class="stack tight"><span class="label">Where</span>${chips([{ v: 'box', l: s.f === 0 ? 'Box 1 (open)' : 'Box 1 (fret ' + s.f + ')' }, { v: 'neck', l: 'Whole neck' }], j.pos, 'set', 'data-path="jam.pos" data-keep="1"')}</div>
          <div class="stack tight"><span class="label">Label with</span>${chips([{ v: 'degree', l: 'Numbers' }, { v: 'note', l: 'Note names' }], j.label, 'set', 'data-path="jam.label" data-keep="1"')}</div>
        </div>
        <div id="jam-fb">${jamBoard(ci)}</div>
        <p class="note">${TIPS[j.feel]} Start with one ringed note per chord, held for the whole bar.</p>
      </section>`;
  };

  Object.assign(W.ACT, {
    jamSet(el) {
      A.stop();
      const k = el.dataset.k, v = el.dataset.v;
      U.jam.custom = null;
      U.jam[k] = k === 'feel' ? v : +v;
      if (k === 'feel') U.jam.prog = 0;
      W.render();
    },
    jamMix(el) {
      const k = el.dataset.k;
      U.jam[k] = !U.jam[k];
      if (A.player.id === 'jam') A.player.opts[k] = U.jam[k];
      el.classList.toggle('on', U.jam[k]);
      el.setAttribute('aria-pressed', U.jam[k]);
    },
    jamClear() { A.stop(); U.jam.custom = null; W.render(); },
    jamIn(el) { U.jam.custom = null; U.jam.feel = 'major'; U.jam.key = +el.dataset.key; U.jam.prog = 0; W.go('jam'); },
  });

  /* ================= Trainers ================= */
  let timer = null;
  const later = (fn, ms) => { clearTimeout(timer); timer = setTimeout(fn, ms); };
  const bump = (arr, ok) => { arr[1]++; if (ok) arr[0]++; };
  function finish(kind, run) {
    run.done = true;
    const key = kind, prev = S.drills.best[key] || 0;
    run.best = Math.max(prev, run.score);
    S.drills.best[key] = run.best;
    W.logBlock('w');
  }
  function roundBar(run) {
    return `<div class="row between"><span class="score">Question ${Math.min(run.i + 1, run.n)} of ${run.n}</span><span class="score">Score ${run.score}</span></div><div class="bar"><i style="width:${(run.i / run.n) * 100}%"></i></div>`;
  }
  function roundDone(run, act, extra = '') {
    const msg = run.score >= 9 ? 'Solid. Make it harder next round.' : run.score >= 6 ? 'Getting there. Same settings tomorrow.' : 'This is exactly what the drill is for. Short rounds, every day.';
    return `<div class="row" style="gap:28px;align-items:flex-end"><div><div class="stat-n">${run.score}/${run.n}</div><span class="label">this round</span></div>
        <div><div class="stat-n muted">${run.best}/${run.n}</div><span class="label">your best</span></div></div>
      <p class="note">${msg} Today’s warm-up is ticked off.</p>
      <div class="row"><button type="button" class="btn primary" data-act="${act}">Go again</button>${extra}</div>`;
  }

  /* ----- Note Finder ----- */
  function noteQ(st, prev) {
    const strings = st.strings.length ? st.strings : [0];
    for (let n = 0; n < 60; n++) {
      const s = pick(strings), f = Math.floor(Math.random() * 12), pc = (T.TUNING[s] + f) % 12;
      if (st.nat && T.SHARP[pc].includes('#')) continue;
      if (prev && prev.s === s && prev.f === f) continue;
      return { s, f, pc };
    }
    return { s: strings[0], f: 3, pc: (T.TUNING[strings[0]] + 3) % 12 };
  }
  function noteAnswer(ok, fb) {
    const st = U.tr.notes, run = st.run, q = run.q;
    const k = q.s + ':' + q.f, rec = (S.drills.notes[k] = S.drills.notes[k] || [0, 0]);
    bump(rec, ok);
    if (ok) run.score++;
    run.fb = Object.assign({ ok }, fb);
    W.save(); W.render();
    later(() => {
      run.i++; run.fb = null;
      if (run.i >= run.n) finish('notes', run); else run.q = noteQ(st, q);
      W.render();
    }, ok ? 650 : 1700);
  }
  function notesTab() {
    const st = U.tr.notes, run = st.run;
    const settings = `<div class="row" style="gap:16px 28px;align-items:flex-start">
        <div class="stack tight"><span class="label">Strings</span><div class="chips">${[0, 1, 2, 3, 4, 5].map((s) => `<button type="button" class="chip${st.strings.includes(s) ? ' on' : ''}" data-act="noteString" data-s="${s}" aria-pressed="${st.strings.includes(s)}">${T.STRING_ORD[s]} · ${T.SHARP[T.TUNING[s] % 12]}</button>`).join('')}</div></div>
        <div class="stack tight"><span class="label">Drill</span>${chips([{ v: 'find', l: 'Find the note' }, { v: 'name', l: 'Name the note' }], st.mode, 'set', 'data-path="tr.notes.mode"')}</div>
        <div class="stack tight"><span class="label">Notes</span>${chips([{ v: true, l: 'Plain letters' }, { v: false, l: 'Sharps too' }], st.nat, 'set', 'data-path="tr.notes.nat"')}</div>
      </div>`;
    if (!run) {
      const heat = {};
      Object.entries(S.drills.notes).forEach(([k, [c, t]]) => { if (!t) return; const [s, f] = k.split(':').map(Number), acc = c / t; heat[k] = { t: T.SHARP[(T.TUNING[s] + f) % 12], d: acc >= 0.85 ? 4 : acc >= 0.6 ? 3 : 1 }; });
      const any = Object.keys(heat).length;
      return `${settings}
        <div class="row"><button type="button" class="btn primary big" data-act="noteStart">Start 10 notes</button></div>
        <section class="stack"><h2>Your neck so far</h2>
          ${any ? `${R.fretboard({ id: 'heat', frets: 12, marks: heat })}<div class="legend"><span class="pair"><span class="deg d4">&nbsp;</span> solid</span><span class="pair"><span class="deg d3">&nbsp;</span> shaky</span><span class="pair"><span class="deg d1">&nbsp;</span> keep drilling</span></div>`
            : `${R.fretboard({ id: 'heat', frets: 12, marks: {} })}<p class="note">Empty for now. Every note you’re asked about gets a dot here: green when you know it, red when you don’t. Start with strings 6 and 5 and add a string once those are green.</p>`}
        </section>`;
    }
    if (run.done) return roundDone(run, 'noteStart', '<button type="button" class="btn quiet" data-act="noteQuit">Change settings</button>');
    const q = run.q, name = T.SHARP[q.pc], marks = {};
    let prompt, answers = '';
    if (st.mode === 'find') {
      prompt = `Find <span style="color:var(--accent)">${P(name)}</span> on the ${T.STRING_NAMES[q.s]} string`;
      if (run.fb) {
        marks[run.fb.s + ':' + run.fb.f] = { t: T.SHARP[(T.TUNING[run.fb.s] + run.fb.f) % 12], state: run.fb.ok ? 'right' : 'wrong' };
        if (!run.fb.ok) marks[q.s + ':' + q.f] = { t: name, state: 'ask' };
      }
      W.FB.drill = (s, f) => {
        if (run.fb || f > 12) return;
        A.playNote(s, f);
        noteAnswer(s === q.s && (T.TUNING[s] + f) % 12 === q.pc, { s, f });
      };
    } else {
      prompt = `Which note is this?`;
      marks[q.s + ':' + q.f] = run.fb ? { t: name, state: run.fb.ok ? 'right' : 'wrong' } : { t: '?', state: 'ask' };
      const opts = T.SHARP.map((n, pc) => ({ n, pc })).filter((o) => !st.nat || !o.n.includes('#'));
      answers = `<div class="chips">${opts.map((o) => `<button type="button" class="chip${run.fb && o.pc === q.pc ? ' right' : run.fb && run.fb.pc === o.pc ? ' wrong' : ''}" data-act="noteName" data-pc="${o.pc}" style="min-width:48px;font-size:17px">${P(o.n)}</button>`).join('')}</div>`;
      W.FB.drill = () => {};
    }
    return `${roundBar(run)}<div class="bigq">${prompt}</div>
      ${R.fretboard({ id: 'drill', frets: 12, marks, strings: st.mode === 'find' ? [q.s] : [0, 1, 2, 3, 4, 5], noStringNames: st.mode === 'name' })}
      ${answers}
      <p class="note">${run.fb ? (run.fb.ok ? 'Yes.' : `That one is ${P(name)}, at fret ${q.f}.`) : st.mode === 'find' ? 'Tap the fret. Say the note name out loud as you do.' : 'Count up from the open string if you need to. It gets faster.'}</p>
      <div class="row"><button type="button" class="btn sm quiet" data-act="noteQuit">End round</button></div>`;
  }

  /* ----- Key Chords ----- */
  function keysQ(st) {
    const key = pick(st.all ? W.KEY_ORDER : [7, 0, 2, 9, 4]);
    const fam = T.diatonic(key).slice(0, 6), i = Math.floor(Math.random() * 6);
    const others = shuffle(fam.filter((_, x) => x !== i)).slice(0, 3);
    const opts = shuffle([fam[i]].concat(others));
    const byChord = Math.random() < 0.5;
    return {
      prompt: byChord ? `Key of ${T.keyName(key)}: what is the <span style="color:var(--accent)">${fam[i].numeral}</span>?` : `Key of ${T.keyName(key)}: <span style="color:var(--accent)">${P(fam[i].chord.name)}</span> is the…`,
      opts: opts.map((o) => (byChord ? o.chord.name : o.numeral)), c: opts.indexOf(fam[i]),
      why: `${P(fam[i].chord.name)} is the ${fam[i].numeral} in ${P(T.keyName(key))}.`,
    };
  }
  function keysTab() {
    const st = U.tr.keys, run = st.run;
    if (!run) {
      const [c, t] = S.drills.keys;
      return `<p class="lede">Which chord is the IV in A? The faster you can answer, the faster you can follow a song called out in numbers.</p>
        <div class="stack tight"><span class="label">Keys</span>${chips([{ v: false, l: 'G C D A E' }, { v: true, l: 'All twelve' }], st.all, 'set', 'data-path="tr.keys.all"')}</div>
        <div class="row"><button type="button" class="btn primary big" data-act="keysStart">Start 10 questions</button></div>
        ${t ? `<p class="note">Lifetime: ${c} of ${t} correct (${Math.round((c / t) * 100)}%).</p>` : ''}`;
    }
    if (run.done) return roundDone(run, 'keysStart', '<button type="button" class="btn quiet" data-act="keysQuit">Change settings</button>');
    const q = run.q;
    return `${roundBar(run)}<div class="bigq">${P(q.prompt)}</div>
      <div class="quiz-opts">${q.opts.map((o, i) => `<button type="button" class="opt${q.pick != null && i === q.c ? ' right' : q.pick === i ? ' wrong' : ''}" data-act="keysAns" data-i="${i}" style="min-width:84px;font-family:var(--font-display);font-weight:800;font-size:26px;text-align:center">${P(o)}</button>`).join('')}</div>
      <p class="note">${q.pick != null ? q.why : 'Think: major, minor, minor, major, major, minor.'}</p>
      <div class="row"><button type="button" class="btn sm quiet" data-act="keysQuit">End round</button></div>`;
  }

  /* ----- Ear ----- */
  const EAR_LEVELS = { 1: [0, 3, 4], 2: [0, 3, 4, 5], 3: [0, 1, 2, 3, 4, 5] };
  const FEEL = ['home', 'restless', 'floating', 'away', 'tension', 'home’s shadow'];
  function earQ(st, prev) {
    const set = EAR_LEVELS[st.level];
    let key, i;
    do { key = pick([7, 0, 2, 9, 4]); i = pick(set); } while (prev && prev.key === key && prev.i === i);
    return { key, i, fam: T.diatonic(key) };
  }
  function earPlay(q) {
    A.stop();
    const ctx = A.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + 0.08, f = q.fam;
    [0, 3, 4, 0].forEach((ix, n) => A.strum(T.voicingMidis(T.voicing(f[ix].chord)), { when: t0 + n * 0.52, vel: 0.6 }));
    A.strum(T.voicingMidis(T.voicing(f[q.i].chord)), { when: t0 + 4 * 0.52 + 0.75, vel: 0.95, spread: 0.03 });
  }
  function earTab() {
    const st = U.tr.ear, run = st.run;
    if (!run) {
      const [c, t] = S.drills.ear;
      return `<p class="lede">You hear four chords that set up home, a pause, then one mystery chord. Which number is it? Don’t work it out. Notice how it feels next to home.</p>
        <div class="stack tight"><span class="label">Level</span>${chips([{ v: 1, l: '1 · I, IV, V' }, { v: 2, l: '2 · add the vi' }, { v: 3, l: '3 · all six' }], st.level, 'set', 'data-path="tr.ear.level"')}</div>
        <div class="row"><button type="button" class="btn primary big" data-act="earStart">Start 10 chords</button></div>
        ${t ? `<p class="note">Lifetime: ${c} of ${t} correct (${Math.round((c / t) * 100)}%).</p>` : ''}`;
    }
    if (run.done) return roundDone(run, 'earStart', '<button type="button" class="btn quiet" data-act="earQuit">Change level</button>');
    const q = run.q, set = EAR_LEVELS[st.level];
    return `${roundBar(run)}<div class="bigq">What’s the last chord?</div>
      <div class="row"><button type="button" class="btn" data-act="earReplay"><span class="btn-ico" aria-hidden="true"></span>Hear it again</button></div>
      <div class="quiz-opts">${set.map((i) => `<button type="button" class="opt${q.pick != null && i === q.i ? ' right' : q.pick === i ? ' wrong' : ''}" data-act="earAns" data-i="${i}" style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:96px">${R.degTag(q.fam[i].numeral, i + 1)}<span class="small">${FEEL[i]}</span></button>`).join('')}</div>
      <p class="note">${q.pick != null ? `It was ${P(q.fam[q.i].chord.name)}, the ${q.fam[q.i].numeral} in ${P(T.keyName(q.key))}.` : 'The first four chords are always I – IV – V – I.'}</p>
      <div class="row"><button type="button" class="btn sm quiet" data-act="earQuit">End round</button></div>`;
  }

  /* ----- Strum Lab ----- */
  function strumTab() {
    const st = U.tr.strum, pat = A.PATTERNS[st.pat];
    const chords = st.text.split(/[\s,|]+/).map(T.parseChord).filter(Boolean);
    const use = chords.length ? chords : [T.parseChord('G')];
    const det = T.detectKey(use).key;
    const id = W.reg('lab', () => Object.assign({ chords: use, bpm: st.bpm, pattern: st.pat, click: st.click, drums: st.drums }, W.hl('lab')));
    const tog = (k, l) => `<button type="button" class="chip${st[k] ? ' on' : ''}" data-act="toggle" data-path="tr.strum.${k}" aria-pressed="${st[k]}">${l}</button>`;
    return `<p class="lede">One motion, down on the numbers and up on the “&”s. A pattern is a choice of which strokes hit the strings. Mute the strings first, then add chords.</p>
      <div class="stack tight"><span class="label">Pattern</span>${chips(['fours', 'eighths', 'folk', 'faithful', 'push'].map((k) => ({ v: k, l: A.PATTERNS[k].name })), st.pat, 'set', 'data-path="tr.strum.pat"')}</div>
      <div class="stack" data-prog="lab">${R.strumGrid(st.pat)}<p class="note">${esc(pat.say)}</p>
        <div class="tiles">${use.map((c, i) => R.chordTile(c, det, { idx: i, cls: 'mini' })).join('')}</div></div>
      <div class="transport">${R.playBtn(id, 'Play along', 'primary')}
        <label class="field"><span class="label">Tempo <span data-out="tr.strum.bpm">${st.bpm}</span> bpm</span><input id="lab-bpm" type="range" min="50" max="160" value="${st.bpm}" data-on="range" data-path="tr.strum.bpm" data-live="bpm"></label>
        <label class="field" style="min-width:180px"><span class="label">Chords, one bar each</span><input id="lab-text" type="text" value="${esc(st.text)}" data-change="strumText" autocomplete="off" spellcheck="false"></label>
        <div class="stack tight"><span class="label">With</span><div class="chips">${tog('click', 'Click')}${tog('drums', 'Drums')}</div></div>
      </div>`;
  }

  W.VIEWS.train = function () {
    const tab = U.tr.tab;
    const tabs = [['notes', 'Note Finder'], ['keys', 'Key Chords'], ['ear', 'Ear'], ['strum', 'Strum Lab']];
    const body = { notes: notesTab, keys: keysTab, ear: earTab, strum: strumTab }[tab]();
    return `<div class="head"><span class="eyebrow">Trainers</span><h1>Three minutes, every day</h1></div>
      <div class="tabs" role="tablist">${tabs.map(([k, l]) => `<button type="button" role="tab" aria-selected="${k === tab}" class="tab${k === tab ? ' on' : ''}" data-act="trTab" data-v="${k}">${l}</button>`).join('')}</div>
      <div class="stack" style="gap:20px">${body}</div>`;
  };

  function newRun() { return { i: 0, n: 10, score: 0, q: null, fb: null, done: false }; }
  Object.assign(W.ACT, {
    trTab(el) { A.stop(); clearTimeout(timer); U.tr.tab = el.dataset.v; W.render(); },
    noteString(el) {
      const st = U.tr.notes, s = +el.dataset.s, i = st.strings.indexOf(s);
      if (i >= 0) { if (st.strings.length > 1) st.strings.splice(i, 1); } else st.strings.push(s);
      W.render();
    },
    noteStart() { const st = U.tr.notes; st.run = newRun(); st.run.q = noteQ(st); W.leave.push(() => { clearTimeout(timer); st.run = null; }); W.render(); },
    noteQuit() { clearTimeout(timer); U.tr.notes.run = null; W.render(); },
    noteName(el) {
      const run = U.tr.notes.run;
      if (!run || run.fb) return;
      const pc = +el.dataset.pc;
      A.playNote(run.q.s, run.q.f);
      noteAnswer(pc === run.q.pc, { pc });
    },
    keysStart() { const st = U.tr.keys; st.run = newRun(); st.run.q = keysQ(st); W.leave.push(() => { clearTimeout(timer); st.run = null; }); W.render(); },
    keysQuit() { clearTimeout(timer); U.tr.keys.run = null; W.render(); },
    keysAns(el) {
      const st = U.tr.keys, run = st.run, q = run.q;
      if (q.pick != null) return;
      q.pick = +el.dataset.i;
      const ok = q.pick === q.c;
      if (ok) run.score++;
      bump(S.drills.keys, ok);
      W.save(); W.render();
      later(() => { run.i++; if (run.i >= run.n) finish('keys', run); else run.q = keysQ(st); W.render(); }, ok ? 700 : 1900);
    },
    earStart() { const st = U.tr.ear; st.run = newRun(); st.run.q = earQ(st); W.leave.push(() => { clearTimeout(timer); st.run = null; }); W.render(); earPlay(st.run.q); },
    earQuit() { clearTimeout(timer); A.stop(); U.tr.ear.run = null; W.render(); },
    earReplay() { const run = U.tr.ear.run; if (run && !run.done) earPlay(run.q); },
    earAns(el) {
      const st = U.tr.ear, run = st.run, q = run.q;
      if (q.pick != null) return;
      q.pick = +el.dataset.i;
      const ok = q.pick === q.i;
      if (ok) run.score++;
      bump(S.drills.ear, ok);
      A.strumChord(q.fam[q.i].chord);
      W.save(); W.render();
      later(() => {
        run.i++;
        if (run.i >= run.n) { finish('ear' + st.level, run); W.render(); }
        else { run.q = earQ(st, q); W.render(); earPlay(run.q); }
      }, ok ? 1300 : 2400);
    },
  });
  W.ON.strumText = function (el) { A.stop(); U.tr.strum.text = el.value; W.render(); };
})();
