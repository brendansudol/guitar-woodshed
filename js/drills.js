/* More trainers: Work It Out (songs by ear), interval and echo ear drills, and the Chord Gym. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc, chips } = R;
  const { finish, roundBar, roundDone, newRun, later, bump, stopTimer, pick } = W.trn;
  const rand = (n) => Math.floor(Math.random() * n);

  Object.assign(U.tr.ear, { mode: 'chord', ivl: { level: 1, run: null }, echo: { level: 1, run: null } });
  U.tr.work = { level: 1, run: null };
  U.tr.chords = { ch: null, a: null, b: null, view: 'finger' };
  const stat = (k) => (S.drills[k] = S.drills[k] || [0, 0]);
  const lifetime = (k) => { const [c, t] = stat(k); return t ? `<p class="note">Lifetime: ${c} of ${t} correct (${Math.round((c / t) * 100)}%).</p>` : ''; };
  const pluckAt = (midi, delay, string) => { const ctx = A.ensure(); if (ctx) A.pluck(midi, ctx.currentTime + 0.05 + delay, 0.9, string == null ? null : string); };

  /* ================= Ear: find the second note ================= */
  const IVLS = {
    5: ['perfect 4th', 'one string thinner, same fret'], 7: ['perfect 5th', 'one string thinner, two frets higher'],
    12: ['octave', 'two strings thinner, two frets higher'], 4: ['major 3rd', 'one string thinner, one fret lower'],
    3: ['minor 3rd', 'three frets higher on the same string'], 2: ['major 2nd', 'two frets higher on the same string'],
    9: ['major 6th', 'one string thinner, four frets higher'], 10: ['minor 7th', 'two strings thinner, same fret'],
  };
  const IVL_LEVELS = { 1: [5, 7, 12], 2: [5, 7, 12, 4, 3, 2], 3: [5, 7, 12, 4, 3, 2, 9, 10] };
  function ivlQ(st, prev) {
    let s, f, iv;
    do { s = rand(2); f = 1 + rand(7); iv = pick(IVL_LEVELS[st.level]); } while (prev && prev.s === s && prev.f === f && prev.iv === iv);
    const root = T.TUNING[s] + f, target = root + iv;
    let best = null;
    for (let s2 = s; s2 < 6; s2++) { const f2 = target - T.TUNING[s2]; if (f2 >= 0 && f2 <= 12 && (!best || Math.abs(f2 - f) < Math.abs(best.f - f))) best = { s: s2, f: f2 }; }
    return { s, f, iv, root, target, at: best };
  }
  const ivlPlay = (q) => { A.stop(); pluckAt(q.root, 0); pluckAt(q.target, 0.8); };
  function ivlTab() {
    const st = U.tr.ear.ivl, run = st.run;
    if (!run) {
      return `<p class="lede">You hear two notes. The first is shown on the neck. Find the second one by ear and tap it. Sing the second note before you reach for it: that is the link between your ear and your hand.</p>
        <div class="stack tight"><span class="label">Level</span>${chips([{ v: 1, l: '1 · 4th, 5th, octave' }, { v: 2, l: '2 · add 2nds and 3rds' }, { v: 3, l: '3 · add 6ths and 7ths' }], st.level, 'set', 'data-path="tr.ear.ivl.level"')}</div>
        <div class="row"><button type="button" class="btn primary big" data-act="ivlStart">Start 10 pairs</button></div>${lifetime('ivl')}`;
    }
    if (run.done) return roundDone(run, 'ivlStart', '<button type="button" class="btn quiet" data-act="earMode" data-v="interval">Change level</button>');
    const q = run.q, marks = {};
    marks[q.s + ':' + q.f] = { t: '1', d: 1 };
    if (run.fb) {
      marks[run.fb.s + ':' + run.fb.f] = { t: run.fb.ok ? '2' : '×', state: run.fb.ok ? 'right' : 'wrong' };
      if (!run.fb.ok) marks[q.at.s + ':' + q.at.f] = { t: '2', state: 'ask' };
    }
    W.FB.ivl = (s, f) => {
      if (run.fb || f > 12) return;
      A.playNote(s, f);
      const ok = T.TUNING[s] + f === q.target;
      bump(stat('ivl'), ok);
      if (ok) run.score++;
      run.fb = { s, f, ok };
      W.save(); W.render();
      later(() => { run.i++; run.fb = null; if (run.i >= run.n) finish('ivl' + st.level, run); else { run.q = ivlQ(st, q); ivlPlay(run.q); } W.render(); }, ok ? 1500 : 3000);
    };
    const [name, shape] = IVLS[q.iv];
    return `${roundBar(run)}<div class="bigq">Where is the second note?</div>
      <div class="row"><button type="button" class="btn" data-act="ivlReplay"><span class="btn-ico" aria-hidden="true"></span>Hear it again</button></div>
      ${R.fretboard({ id: 'ivl', frets: 12, marks })}
      <p class="note">${run.fb ? `${run.fb.ok ? 'Yes.' : 'Not that one.'} That jump is ${name === 'octave' ? 'an' : 'a'} <strong>${name}</strong>: ${shape}.` : 'The red 1 is the first note. Sing the second, then tap where you think it is. Any spot with the right pitch counts.'}</p>
      <div class="row"><button type="button" class="btn sm quiet" data-act="earMode" data-v="interval">End round</button></div>`;
  }

  /* ================= Ear: echo a phrase ================= */
  const BOX_FRET = 5; // A minor pentatonic, box 1
  const boxNotes = (() => {
    const root = T.TUNING[0] + BOX_FRET, out = [];
    for (let s = 0; s < 6; s++) for (let f = BOX_FRET; f <= BOX_FRET + 3; f++) if (T.SCALES.minPent.steps.includes(T.mod(T.TUNING[s] + f - root))) out.push({ s, f, midi: T.TUNING[s] + f });
    return out.sort((a, b) => a.midi - b.midi);
  })();
  function echoQ(st) {
    const n = 2 + st.level;
    let i = pick([0, 5, 10]);
    const notes = [boxNotes[i]];
    while (notes.length < n) {
      const j = Math.max(0, Math.min(boxNotes.length - 1, i + pick([-2, -1, -1, 1, 1, 2])));
      if (j === i) continue;
      i = j; notes.push(boxNotes[i]);
    }
    return { notes, pos: 0, misses: 0, miss: null };
  }
  const echoPlay = (q) => { A.stop(); q.notes.forEach((nt, k) => pluckAt(nt.midi, k * 0.5)); };
  function echoTab() {
    const st = U.tr.ear.echo, run = st.run;
    if (!run) {
      return `<p class="lede">You hear a short phrase from the A minor pentatonic box. Play it back by tapping the notes in order. This is the skill behind riffing: hearing a line, then finding it under your fingers. Do it on your guitar at the same time.</p>
        <div class="stack tight"><span class="label">Phrase length</span>${chips([{ v: 1, l: '3 notes' }, { v: 2, l: '4 notes' }, { v: 3, l: '5 notes' }], st.level, 'set', 'data-path="tr.ear.echo.level"')}</div>
        <div class="row"><button type="button" class="btn primary big" data-act="echoStart">Start 8 phrases</button></div>${lifetime('echo')}`;
    }
    if (run.done) return roundDone(run, 'echoStart', '<button type="button" class="btn quiet" data-act="earMode" data-v="echo">Change length</button>');
    const q = run.q, marks = {};
    boxNotes.forEach((nt) => { marks[nt.s + ':' + nt.f] = { d: 0 }; });
    q.notes.slice(0, q.pos).forEach((nt, k) => { marks[nt.s + ':' + nt.f] = { t: String(k + 1), state: 'right' }; });
    if (q.pos === 0) { const a = q.notes[0]; marks[a.s + ':' + a.f] = { t: '1', d: 0, ring: true }; }
    if (q.miss) marks[q.miss.s + ':' + q.miss.f] = { t: '×', state: 'wrong' };
    const doneNow = q.pos >= q.notes.length;
    W.FB.echo = (s, f) => {
      const nt = boxNotes.find((b) => b.s === s && b.f === f);
      if (!nt || doneNow) return;
      A.playNote(s, f);
      if (nt.midi === q.notes[q.pos].midi) { q.pos++; q.miss = null; } else { q.misses++; q.miss = { s, f }; }
      if (q.pos >= q.notes.length) {
        const ok = q.misses === 0;
        bump(stat('echo'), ok);
        if (ok) run.score++;
        W.save();
        later(() => { run.i++; if (run.i >= run.n) finish('echo' + st.level, run); else { run.q = echoQ(st); echoPlay(run.q); } W.render(); }, 1300);
      }
      W.render();
    };
    return `${roundBar(run)}<div class="bigq">Play it back</div>
      <div class="row"><button type="button" class="btn" data-act="echoReplay"><span class="btn-ico" aria-hidden="true"></span>Hear it again</button></div>
      ${R.fretboard({ id: 'echo', frets: 12, marks, window: [BOX_FRET, BOX_FRET + 3] })}
      <p class="note">${doneNow ? (q.misses ? `Got there, with ${q.misses} wrong turn${q.misses === 1 ? '' : 's'}. Only clean phrases score.` : 'Clean. That one scores.') : q.pos === 0 ? `${q.notes.length} notes. The ringed dot is where the phrase starts. Is the next note higher or lower?` : `${q.pos} of ${q.notes.length}. Keep going.`}</p>
      <div class="row"><button type="button" class="btn sm quiet" data-act="earMode" data-v="echo">End round</button></div>`;
  }

  /* ----- Ear tab: three drills behind one tab ----- */
  const earChord = W.TRAIN.fns.ear;
  W.TRAIN.fns.ear = function () {
    const e = U.tr.ear;
    const busy = [e.run, e.ivl.run, e.echo.run].some((r) => r && !r.done);
    const modes = `<div class="stack tight"><span class="label">Drill</span>${chips([{ v: 'chord', l: 'Name the chord' }, { v: 'interval', l: 'Find the second note' }, { v: 'echo', l: 'Echo a phrase' }], e.mode, 'earMode')}</div>`;
    return (busy ? '' : modes) + ({ chord: earChord, interval: ivlTab, echo: echoTab }[e.mode] || earChord)();
  };
  const earReset = () => { stopTimer(); A.stop(); const e = U.tr.ear; e.run = null; e.ivl.run = null; e.echo.run = null; };

  /* ================= Work It Out ================= */
  const ALL_KEYS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], EASY_KEYS = [7, 0, 2, 9, 4];
  const WORK = {
    1: { pool: [0, 3, 4], keys: EASY_KEYS, say: 'Three chords: the I, IV and V. The loop starts at home.', progs: [[0, 3, 4, 3], [0, 0, 3, 4], [0, 3, 0, 4], [0, 4, 3, 0], [0, 3, 4, 4], [0, 4, 3, 4]] },
    2: { pool: [0, 3, 4, 5], keys: EASY_KEYS, say: 'Four chords: I, IV, V and vi. The loop starts at home.', progs: [[0, 4, 5, 3], [0, 5, 3, 4], [0, 3, 5, 4], [0, 5, 4, 3], [0, 4, 3, 5], [0, 3, 0, 5], [0, 5, 0, 4]] },
    3: { pool: [0, 1, 2, 3, 4, 5], keys: ALL_KEYS, say: 'All six chords, any key, and the loop may start on the vi.', progs: [[5, 3, 0, 4], [0, 1, 3, 4], [0, 2, 3, 4], [5, 4, 3, 4], [0, 4, 1, 3], [5, 1, 3, 4], [0, 2, 5, 3]] },
  };
  function workNew(level, prev) {
    const cfg = WORK[level];
    let key, prog;
    do { key = pick(cfg.keys); prog = pick(cfg.progs); } while (prev && prev.key === key && prev.prog === prog);
    const fam = T.diatonic(key);
    const guesses = prog.map(() => null);
    if (prog[0] === 0) guesses[0] = 0; // the loop starts at home: bar 1 is given
    return { level, key, fam, prog, chords: prog.map((i) => fam[i].chord), step: 'home', pick: null, homeTries: 0, homeMsg: '', guesses, bar: prog[0] === 0 ? 1 : 0, results: null, tries: 0 };
  }
  function workTab() {
    const st = U.tr.work, run = st.run, solved = stat('work')[0];
    if (!run) {
      return `<p class="lede">The skill you came for: hearing a song and working out its chords with no chart. A band plays a loop in a key it doesn’t tell you. You find home, then name each chord.</p>
        <ol class="points"><li><strong>Listen</strong> to the loop a few times before touching anything.</li>
          <li><strong>Find home.</strong> Hum the note the loop wants to rest on, then hunt for it on the two thickest strings.</li>
          <li><strong>Name the chords.</strong> Once you know the key, there are only a few chords it can be. Check one bar at a time.</li></ol>
        <div class="stack tight"><span class="label">Level</span>${chips([{ v: 1, l: '1 · I, IV, V' }, { v: 2, l: '2 · add the vi' }, { v: 3, l: '3 · all six, any key' }], st.level, 'set', 'data-path="tr.work.level"')}</div>
        <p class="note">${WORK[st.level].say}</p>
        <div class="row"><button type="button" class="btn primary big" data-act="workStart">Give me a loop</button></div>
        ${solved ? `<p class="note">Loops worked out so far: <strong>${solved}</strong>.</p>` : ''}`;
    }
    const hl = W.hl('work');
    const loopId = W.reg('work', () => Object.assign({ chords: run.chords, bpm: 92, pattern: 'folk', bass: true, drums: true, vel: 0.65 }, hl));
    const head = `<div class="row between"><span class="score">Level ${run.level} · Step ${run.step === 'home' ? '1 of 2: find home' : run.step === 'chords' ? '2 of 2: name the chords' : 'solved'}</span><button type="button" class="btn sm quiet" data-act="workQuit">Give up on this one</button></div>`;

    if (run.step === 'home') {
      const marks = {};
      if (run.pick) marks[run.pick.s + ':' + run.pick.f] = { t: T.noteName(T.TUNING[run.pick.s] + run.pick.f, false), d: 0, ring: true };
      W.FB.work = (s, f) => { if (f > 12) return; A.playNote(s, f); run.pick = { s, f }; run.homeMsg = ''; W.render(); };
      const name = run.pick ? T.noteName(T.TUNING[run.pick.s] + run.pick.f, false) : '';
      return `${head}<div class="bigq">Which note is home?</div>
        <div class="row">${R.playBtn(loopId, 'Hear the loop', 'primary')}${run.pick ? `<button type="button" class="btn" data-act="workHome">${esc(name)} is home</button>` : ''}</div>
        <div class="barrow" data-prog="work">${run.prog.map((_, i) => `<div class="barbox" data-ci="${i}"><small>Bar ${i + 1}</small><b>?</b></div>`).join('')}</div>
        ${R.fretboard({ id: 'work', frets: 12, marks, strings: [0, 1] })}
        <p class="note">${run.homeMsg || 'Let the loop run and tap notes on the two thick strings. Most will sound like they want to move. Home is the one that sounds finished, as if the song could end on it.'}</p>
        ${run.homeTries >= 3 ? '<div class="row"><button type="button" class="btn sm quiet" data-act="workReveal">Show me home</button></div>' : ''}`;
    }

    const pool = WORK[run.level].pool;
    const bars = (final) => `<div class="barrow" data-prog="work">${run.prog.map((ix, i) => {
      const g = final ? ix : run.guesses[i];
      const res = final ? 'right' : run.results ? (run.results[i] ? 'right' : 'wrong') : '';
      return `<button type="button" class="barbox${!final && i === run.bar ? ' sel' : ''}${res ? ' ' + res : ''}" data-ci="${i}" data-act="workBar" data-i="${i}"${final ? ' disabled' : ''}><small>Bar ${i + 1}</small><b>${g == null ? '?' : esc(run.fam[g].chord.name)}</b>${g == null ? '' : R.degTag(run.fam[g].numeral, g + 1)}</button>`;
    }).join('')}</div>`;

    if (run.step === 'done') {
      const match = T.matchProg(run.chords, run.key);
      return `<div class="row between"><span class="score">Level ${run.level} · solved in ${run.tries} ${run.tries === 1 ? 'check' : 'checks'}</span></div>
        <div class="bigq">Key of ${esc(T.keyName(run.key))}. Worked out.</div>
        ${bars(true)}
        <p class="note">${match ? `<strong>${esc(match.name)}</strong> (${esc(match.nums)}). ` : ''}Pick up your guitar and play it along with the loop. You just did by ear what a chord chart would have told you.</p>
        <div class="row">${R.playBtn(loopId, 'Hear the loop')}<button type="button" class="btn primary" data-act="workStart">Next loop</button><button type="button" class="btn quiet" data-act="workQuit">Change level</button></div>
        <p class="note">Loops worked out so far: <strong>${solved}</strong>.</p>`;
    }

    const filled = run.guesses.every((g) => g != null);
    const allRight = run.results && run.results.every(Boolean);
    return `${head}<div class="bigq">Key of ${esc(T.keyName(run.key))}. Name the chords.</div>
      <div class="row">${R.playBtn(loopId, 'Hear the loop', 'primary')}<button type="button" class="btn" data-act="workHear"><span class="btn-ico" aria-hidden="true"></span>Hear bar ${run.bar + 1} alone</button></div>
      ${bars(false)}
      <div class="stack tight"><span class="label">Bar ${run.bar + 1} is…</span>
        <div class="quiz-opts">${pool.map((ix) => `<button type="button" class="opt" data-act="workGuess" data-g="${ix}" style="display:flex;flex-direction:column;align-items:center;gap:4px;min-width:74px"><span style="font-family:var(--font-display);font-weight:800;font-size:24px;line-height:1">${esc(run.fam[ix].chord.name)}</span>${R.degTag(run.fam[ix].numeral, ix + 1)}</button>`).join('')}</div></div>
      ${run.viHome ? `<p class="note">You landed on the vi, which is where this loop sits. Its chords come from the key of ${esc(T.keyName(run.key))}.</p>` : run.revealed ? `<p class="note">Home was ${esc(T.keyName(run.key))}. Play the loop again and listen for how it keeps pulling back to that note.</p>` : ''}
      <p class="note">${run.results && !allRight ? 'Close. The red bars are wrong: tap one, hear it alone, and compare it with each choice.' : 'Tapping a choice plays that chord, so you can compare it with the bar. Home feels settled, the IV feels open, the V leans back toward home, the vi is home’s sad twin.'}</p>
      <div class="row"><button type="button" class="btn primary" data-act="workCheck"${filled ? '' : ' disabled'}>Check my answer</button></div>`;
  }

  /* ================= Chord Gym ================= */
  let ccTimers = [];
  const ccClear = () => { ccTimers.forEach(clearTimeout); ccTimers = []; document.querySelectorAll('.cc-row.now').forEach((e) => e.classList.remove('now')); };
  const ROLE = { 0: 'root', 3: 'minor 3rd', 4: '3rd', 7: '5th', 10: '7th', 11: 'major 7th', 2: '2nd', 5: '4th', 9: '6th' };
  /* Any chord in two taps: a root and a type. No typing with a guitar on your lap. */
  const GYM_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const GYM_TYPES = [['maj', 'Major'], ['min', 'Minor'], ['dom7', '7'], ['min7', 'm7'], ['maj7', 'maj7'], ['sus4', 'sus4'], ['sus2', 'sus2'], ['add9', 'add9'],
    ['six', '6'], ['nine', '9'], ['min6', 'm6'], ['dim', 'dim'], ['m7b5', 'm7b5'], ['aug', 'aug'], ['five', '5'], ['dom7sus4', '7sus4']];
  function chordsTab() {
    const st = U.tr.chords;
    const names = S.known.filter((n) => T.parseChord(n));
    const list = names.length ? names : ['G', 'C', 'D', 'Em', 'Am'];
    if (!T.parseChord(st.ch)) st.ch = list[0];
    const ch = T.parseChord(st.ch), v = T.voicing(ch), fingers = st.view !== 'ivl';
    const mine = list.find((n) => { const k = T.parseChord(n); return k.root === ch.root && k.q === ch.q; }) || '';
    const pick = (attr, val, label, on) => `<button type="button" class="chip${on ? ' on' : ''}" data-act="gymPick" ${attr}="${val}" aria-pressed="${on}">${esc(label)}</button>`;
    return `<section class="stack"><h2>Chord check</h2>
        <p class="note">A chord is only as good as its worst string. Hold the shape, then play each string on its own along with the app. A dead or buzzing string usually means a neighboring finger is leaning on it, or your fingertip isn’t close enough to the fret.</p>
        <div class="stack tight"><span class="label">Your chords</span>${chips(list, mine, 'set', 'data-path="tr.chords.ch"')}</div>
        <div class="stack tight"><span class="label">Or any chord: pick a root, then a type</span>
          <div class="chips" role="group" aria-label="Root">${GYM_ROOTS.map((n, pc) => pick('data-root', pc, n, pc === ch.root)).join('')}</div>
          <div class="chips" role="group" aria-label="Type">${GYM_TYPES.map(([q, l]) => pick('data-q', q, l, q === ch.q)).join('')}</div></div>
        <div class="row" style="align-items:baseline;gap:12px"><span class="tile-name" style="font-size:44px">${esc(ch.name)}</span><span class="muted">${esc(T.Q[ch.q].label)}${mine ? '' : ' · not in your chords yet'}</span></div>
        <div class="stack tight"><span class="label">Numbers show</span>${chips([{ v: 'finger', l: 'Fingers' }, { v: 'ivl', l: 'Chord notes' }], st.view, 'set', 'data-path="tr.chords.view" data-keep="1"')}
          <span class="small muted">${fingers
            ? 'Which finger goes on each dot: 1 index, 2 middle, 3 ring, 4 little finger. Red is the root.'
            : 'Which note of the chord each string plays: 1 is the root, 3 the third, 5 the fifth. Each number keeps its color everywhere in the app.'}</span></div>
        <div class="row" style="gap:28px;align-items:flex-start">
          <div style="width:170px;max-width:100%">${R.chordBox(ch, fingers ? { labels: 'finger' } : { tones: true, labels: 'ivl' }).replace('class="cbox"', 'class="cbox" style="width:100%"')}</div>
          <div class="stack" style="flex:1;min-width:240px">
            <div class="cc">${v.frets.map((f, s) => { const pc = (T.TUNING[s] + Math.max(f, 0)) % 12; return `<div class="cc-row" data-s="${s}"><b>${T.STRING_ORD[s]}</b><span>${f < 0 ? 'Don’t play it' : f === 0 ? 'Open' : 'Fret ' + f + (v.fingers[s] ? ', finger ' + v.fingers[s] : '')}</span><span class="muted">${f < 0 ? '' : T.noteName(pc, ch.flats) + ' · ' + (ROLE[T.mod(pc - ch.root)] || '')}</span></div>`; }).join('')}</div>
            <div class="row"><button type="button" class="btn primary" data-act="chordCheck" data-chord="${esc(ch.name)}"><span class="btn-ico" aria-hidden="true"></span>Play it string by string</button>
              <button type="button" class="btn" data-act="strum" data-chord="${esc(ch.name)}">Strum it</button></div>
          </div>
        </div></section>
      <section class="stack"><h2>One-minute changes</h2>
        <p class="note">Pick two chords and count clean changes for sixty seconds. Thirty a minute is the point where songs stop falling apart. Sixty is fluent.</p>
        ${W.changesBlock(st, 'tr.chords.')}</section>`;
  }

  Object.assign(W.TRAIN.labels, { work: 'Work It Out', chords: 'Chord Gym' });
  Object.assign(W.TRAIN.fns, { work: workTab, chords: chordsTab });
  W.TRAIN.order = ['notes', 'keys', 'chords', 'ear', 'work', 'strum'];

  const leaveOnce = (fn) => { if (!W.leave.includes(fn)) W.leave.push(fn); };
  const workQuit = () => { A.stop(); U.tr.work.run = null; };
  Object.assign(W.ACT, {
    gymPick(el) {
      const cur = T.parseChord(U.tr.chords.ch) || T.parseChord('G');
      const root = el.dataset.root != null ? +el.dataset.root : cur.root, q = el.dataset.q || cur.q;
      A.stop(); ccClear();
      U.tr.chords.ch = T.chord(root, q, GYM_ROOTS[root].includes('b')).name;
      W.render();
    },
    earMode(el) { earReset(); U.tr.ear.mode = el.dataset.v; W.render(); },
    ivlStart() { const st = U.tr.ear.ivl; stopTimer(); st.run = newRun(); st.run.q = ivlQ(st); leaveOnce(earReset); W.render(); ivlPlay(st.run.q); },
    ivlReplay() { const r = U.tr.ear.ivl.run; if (r && !r.done) ivlPlay(r.q); },
    echoStart() { const st = U.tr.ear.echo; stopTimer(); st.run = newRun(); st.run.n = 8; st.run.q = echoQ(st); leaveOnce(earReset); W.render(); echoPlay(st.run.q); },
    echoReplay() { const r = U.tr.ear.echo.run; if (r && !r.done) echoPlay(r.q); },

    workStart() { const st = U.tr.work; A.stop(); st.run = workNew(st.level, st.run); leaveOnce(workQuit); W.render(); },
    workQuit() { workQuit(); W.render(); },
    workHome() {
      const run = U.tr.work.run;
      if (!run || !run.pick) return;
      const pc = (T.TUNING[run.pick.s] + run.pick.f) % 12, viRoot = T.mod(run.key + 9);
      if (pc === run.key || (run.prog[0] === 5 && pc === viRoot)) {
        run.step = 'chords';
        run.viHome = pc !== run.key;
      } else {
        run.homeTries++;
        const d = T.mod(pc - run.key);
        run.homeMsg = `Not ${T.noteName(pc, false)}. ${d === 7 || d === 5 || d === 4 || d === 9 ? 'That note fits the loop, which is why it’s tempting, but the song wouldn’t end on it.' : 'Listen for the note the loop keeps falling back to at the start of each time round.'}`;
      }
      W.render();
    },
    workReveal() { const run = U.tr.work.run; if (run) { run.step = 'chords'; run.revealed = true; W.render(); } },
    workBar(el) { const run = U.tr.work.run; if (run) { run.bar = +el.dataset.i; W.render(); } },
    workHear() {
      const run = U.tr.work.run;
      if (run) A.play('work-bar', { chords: [run.chords[run.bar]], loop: false, bass: true, pattern: 'folk', bpm: 92, vel: 0.7 });
    },
    workGuess(el) {
      const run = U.tr.work.run;
      if (!run) return;
      const g = +el.dataset.g;
      A.strumChord(run.fam[g].chord);
      if (run.prog[0] === 0 && run.bar === 0) { W.render(); return; } // bar 1 is given
      run.guesses[run.bar] = g;
      run.results = null;
      const next = run.guesses.findIndex((x, i) => x == null && i > run.bar);
      const any = run.guesses.findIndex((x) => x == null);
      if (next >= 0) run.bar = next; else if (any >= 0) run.bar = any;
      W.render();
    },
    workCheck() {
      const run = U.tr.work.run;
      if (!run || run.guesses.some((g) => g == null)) return;
      A.stop();
      run.tries++;
      run.results = run.guesses.map((g, i) => g === run.prog[i]);
      const st = stat('work');
      if (run.results.every(Boolean)) {
        run.step = 'done';
        st[0]++;
        W.logBlock('w');
      } else {
        st[1]++;
        run.bar = run.results.indexOf(false);
        W.save();
      }
      W.render();
    },

    chordCheck(el) {
      const ch = T.parseChord(el.dataset.chord);
      if (!ch) return;
      A.stop(); ccClear();
      const v = T.voicing(ch), step = 800;
      v.frets.forEach((f, s) => ccTimers.push(setTimeout(() => {
        document.querySelectorAll('.cc-row').forEach((r) => r.classList.toggle('now', +r.dataset.s === s));
        if (f >= 0) A.pluck(T.TUNING[s] + f, 0, 0.9, s);
      }, s * step)));
      ccTimers.push(setTimeout(() => { ccClear(); A.strum(T.voicingMidis(v), { spread: 0.03 }); }, 6 * step + 200));
      leaveOnce(ccClear);
    },
  });
})();
