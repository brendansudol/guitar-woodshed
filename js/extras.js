/* The guide ("how to read this app"), the tuner, and the per-stage "move on when" targets. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc } = R;

  /* ================= Move-on targets ================= */
  const days = (key) => (S.goals[key] || []).length;
  const GOALS = {
    1: { text: 'Score 9 out of 10 in Note Finder on the low E and A strings, on two different days.', need: 2, unit: 'days', have: () => days('notes65'), go: { hash: 'train', tab: 'notes', label: 'Note Finder' } },
    2: { text: 'Score 8 out of 10 in Key Chords, on two different days.', need: 2, unit: 'days', have: () => days('keys8'), go: { hash: 'train', tab: 'keys', label: 'Key Chords' } },
    3: { text: 'Decode three of your own songs in the Songbook.', need: 3, unit: 'songs', have: () => S.songs.filter((s) => !s.example).length, go: { hash: 'songs', label: 'Songbook' } },
    4: { text: 'Reach 30 clean changes in one minute between any two chords.', need: 30, unit: 'changes', have: () => Math.max(0, ...Object.values(S.changes)), go: { lesson: '4-3', label: 'One-minute changes' } },
    5: { text: 'Work out five loops by ear in Work It Out, at any level.', need: 5, unit: 'loops', have: () => (S.drills.work || [0])[0], go: { hash: 'train', tab: 'work', label: 'Work It Out' } },
    6: { text: 'Play in the Jam Room on five different days.', need: 5, unit: 'days', have: () => Object.values(S.log).filter((d) => d.j).length, go: { hash: 'jam', label: 'Jam Room' } },
    7: { text: 'Score 9 out of 10 in Note Finder on the low E and A strings with sharps switched on.', need: 1, unit: 'round', have: () => days('notes65s'), go: { hash: 'train', tab: 'notes', label: 'Note Finder' } },
    F: { label: 'This track has stuck when', text: 'You have played along in Pick Lab for a minute or more, on five different days.', need: 5, unit: 'days', have: () => days('pick'), go: { hash: 'train', tab: 'pick', label: 'Pick Lab' } },
  };
  function goal(n) {
    const g = GOALS[n];
    if (!g) return null;
    const have = g.have();
    return { n, label: g.label || 'Move on when', text: g.text, need: g.need, unit: g.unit, have: Math.min(have, g.need), met: have >= g.need, go: g.go };
  }
  function goalHit(key) {
    const a = (S.goals[key] = S.goals[key] || []), d = W.dayKey();
    if (!a.includes(d)) a.push(d);
  }
  /* The earliest stage whose lessons are all read but whose target is not reached yet. */
  function holdStage() {
    for (const st of W.STAGES) {
      const g = goal(st.n);
      if (g && !g.met && W.LESSONS.filter((l) => l.stage === st.n).every((l) => S.lessons[l.id])) return g;
    }
    return null;
  }
  const goBtn = (go, cls = 'sm') => go.lesson
    ? `<button type="button" class="btn ${cls}" data-act="openLesson" data-id="${go.lesson}">${esc(go.label)}</button>`
    : `<button type="button" class="btn ${cls}" data-act="go" data-hash="${go.hash}"${go.tab ? ` data-tab="${go.tab}"` : ''}>${esc(go.label)}</button>`;
  function goalBlock(n) {
    const g = goal(n);
    if (!g) return '';
    return `<div class="goal${g.met ? ' met' : ''}"><span class="label">${g.met ? 'Target reached' : g.label}</span>
      <p>${esc(g.text)}</p>
      <div class="row"><div class="bar"><i style="width:${(g.have / g.need) * 100}%"></i></div><span class="mono small">${g.have} of ${g.need} ${g.unit}</span>${g.met ? '' : goBtn(g.go)}</div></div>`;
  }

  /* ================= Guide ================= */
  W.VIEWS.guide = function () {
    const G = T.parseChord('G'), F = T.parseChord('F'), Csm = T.parseChord('C#m');
    const fam = T.diatonic(7);
    const neck = R.fretboard({ id: 'guide', frets: 12, marks: { '0:3': { t: 'G', d: 1 }, '1:3': { t: 'C', d: 4 }, '2:0': { t: 'D', d: 5 }, '4:8': { t: 'G', d: 1, ring: true } } });
    const terms = Object.values(W.GLOSSARY).slice().sort((a, b) => a.t.localeCompare(b.t));
    const part = (n, title, left, points) => `<section class="stage"><div class="stage-n">${n}</div>
      <div class="stack"><h2>${title}</h2>${left}<ul class="points">${points.map((p) => `<li>${p}</li>`).join('')}</ul></div></section>`;
    return `<div class="head"><span class="eyebrow">Guide · two minutes</span><h1>How to read this app</h1>
        <p class="lede">The same few pictures turn up on every screen. Once you can read them, the rest of the app explains itself. Any word with a dotted underline can be tapped for a plain definition.</p></div>
      <div>
      ${part(1, 'The neck', neck, [
        '<strong>The thickest string is at the bottom</strong>, the thinnest at the top. It is the neck as you see it looking down at your own guitar, and the same way tab is written.',
        'The pale strip on the left is the <strong>nut</strong>. A dot to the left of it means: play that string open.',
        'The numbers underneath are <strong>frets</strong>. The pale inlay dots sit at 3, 5, 7, 9 and 12, exactly as on your guitar.',
        'A colored dot is a note to play. <strong>Tap any spot on any neck to hear it.</strong>',
      ])}
      ${part(2, 'Chord boxes', `<div class="tiles">${[G, F, Csm].map((c) => R.chordTile(c, null, { box: true })).join('')}</div>`, [
        'A chord box is the neck stood upright: <strong>strings run top to bottom, thickest on the left</strong>. The heavy bar across the top is the nut.',
        'A dot is a fingertip. A small <strong>circle</strong> above a string means play it open. A <strong>×</strong> means don’t play that string.',
        'Where the dots carry numbers, the screen says what they mean: <strong>fingers</strong> (1 index, 2 middle, 3 ring, 4 little finger) or the <strong>notes of the chord</strong> (1 root, 3 third, 5 fifth).',
        'A long bar across several strings is a <strong>barre</strong>: one finger laid flat across them.',
        '“4fr” beside a box means it starts at fret 4, not at the nut.',
        'The <strong>red</strong> dot is the root, the note the chord is named after. Tap a chord to hear it strummed.',
      ])}
      ${part(3, 'Numbers and colors', `<div class="stack"><div class="legend">${T.SCALES.major.steps.map((st, i) => `<span class="pair">${R.degTag(String(i + 1), i + 1)} ${T.noteName(7 + st)}</span>`).join('')}</div>
          <div class="tiles">${[0, 3, 4, 5].map((i) => R.chordTile(fam[i].chord, 7, {})).join('')}</div></div>`, [
        'Every key has seven notes, numbered <strong>1 to 7</strong>. Above is the key of G. Each number keeps the same color everywhere, and <strong>red is always 1</strong>, the home note.',
        'Chords get the same numbers, written as <strong>roman numerals</strong>. Capitals are major chords, lower-case are minor. In G: G is I, C is IV, D is V, Em is vi.',
        'You don’t need to understand why yet. Stage 2 explains where the numbers come from. For now, read them as labels that stay the same when the key changes.',
      ])}
      ${part(4, 'Rings, dashes, arrows and grids', `<div class="stack"><div class="tiles">${R.chordTile(T.parseChord('Bm'), 7, { cls: 'new' })}</div>${R.strumGrid('faithful')}${R.pickGrid(T.parseChord('C'), 'roll')}</div>`, [
        'A <strong>ring</strong> around a note (see the G on the neck in part 1) means it belongs to the chord playing right now. Good notes to land on.',
        'A <strong>dashed outline</strong> on a chord means it isn’t in your list of chords yet. Change the list on the Today screen.',
        'In strumming patterns, <strong>solid arrows</strong> hit the strings. Faint arrows are your hand passing by without touching them.',
        'In picking patterns, <strong>each row is a string and each dot is one pluck</strong>, thinnest string on top. The letter is the finger: p thumb, i index, m middle, a ring.',
      ])}
      </div>
      <div class="row"><button type="button" class="btn primary big" data-act="guideDone">Got it</button></div>
      <section class="stack"><h2>Words you’ll meet</h2>
        <dl class="gloss-list">${terms.map((g) => `<dt>${esc(g.t)}</dt><dd>${esc(g.d)}</dd>`).join('')}</dl></section>`;
  };
  W.ACT.guideDone = function () { S.guideSeen = true; W.save(); W.go('today'); };

  /* ================= Tuner ================= */
  const midiToFreq = (m) => 440 * Math.pow(2, (m - 69) / 12);
  let idleTimer = null;
  function showPitch(f) {
    const box = document.getElementById('tuner');
    if (!box) return;
    if (!f) { if (!idleTimer) idleTimer = setTimeout(() => { box.classList.add('idle'); idleTimer = null; }, 900); return; }
    clearTimeout(idleTimer); idleTimer = null;
    const m = 69 + 12 * Math.log2(f / 440);
    let s = 0;
    T.TUNING.forEach((t, i) => { if (Math.abs(m - t) < Math.abs(m - T.TUNING[s])) s = i; });
    const cents = (m - T.TUNING[s]) * 100, far = Math.abs(cents) > 250;
    const ok = Math.abs(cents) <= 5;
    box.classList.remove('idle');
    box.classList.toggle('ok', ok && !far);
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('tu-note', far ? T.SHARP[((Math.round(m) % 12) + 12) % 12] : T.SHARP[T.TUNING[s] % 12]);
    set('tu-string', far ? 'Not close to any open string' : `${T.STRING_ORD[s]} string · ${T.STRING_NAMES[s]}`);
    set('tu-cents', far ? '' : (cents > 0 ? '+' : '') + Math.round(cents));
    set('tu-msg', far ? 'Pluck one open string on its own.' : ok ? 'In tune.' : cents < 0 ? 'Too low. Tighten the string.' : 'Too high. Loosen the string.');
    const needle = document.getElementById('tu-needle');
    if (needle) needle.style.left = 50 + Math.max(-50, Math.min(50, far ? 0 : cents)) + '%';
    document.querySelectorAll('[data-act="refTone"]').forEach((b) => b.classList.toggle('heard', !far && +b.dataset.s === s));
  }
  function tuneOff() { A.micStop(); A.toneStop(); clearTimeout(idleTimer); idleTimer = null; U.tune.listening = false; U.tune.ref = null; }

  W.VIEWS.tune = function () {
    const tu = U.tune, can = A.micAvailable() && !window.claude;
    const words = ['thickest', '', '', '', '', 'thinnest'];
    return `<div class="head"><span class="eyebrow">Tuner</span><h1>Tune up first</h1>
        <p class="lede">An out-of-tune guitar makes every exercise sound wrong, and it teaches your ear the wrong thing. Thirty seconds here before each session.</p></div>
      ${can ? `<section class="panel tuner idle" id="tuner">
        <div class="row between" style="align-items:flex-end"><div class="stack tight"><span class="label" id="tu-string">${tu.listening ? 'Pluck one open string' : 'Listening tuner'}</span><div class="now-chord" id="tu-note">–</div></div>
          <div class="stack tight" style="align-items:flex-end"><div class="stat-n" id="tu-cents"></div><span class="label">cents off</span></div></div>
        <div class="meter" aria-hidden="true"><i class="meter-zone"></i><i class="meter-mid"></i><i class="meter-needle" id="tu-needle"></i></div>
        <div class="row between"><span class="small muted">too low</span><strong id="tu-msg">${tu.listening ? 'Pluck one open string and let it ring.' : 'Uses your microphone. Nothing is recorded or sent anywhere.'}</strong><span class="small muted">too high</span></div>
        <div class="row"><button type="button" class="btn ${tu.listening ? '' : 'primary'} big" data-act="micToggle">${tu.listening ? 'Stop listening' : 'Start listening'}</button></div>
        ${tu.err ? `<p class="small" style="color:var(--bad);font-weight:600">${esc(tu.err)}</p>` : ''}
      </section>` : `<p class="note">The listening tuner needs your microphone, which isn’t available in this view. It works when the app is opened as its own website. The reference tones below work everywhere.</p>`}
      <section class="stack"><h2>Reference tones</h2>
        <p class="note">Tap a string to hold its note, then pluck the same string on your guitar. If the two sounds wobble against each other, you’re close: turn the peg slowly until the wobble slows down and stops. Tap again to silence it.</p>
        <div class="tiles">${T.TUNING.map((m, s) => `<button type="button" class="tile${tu.ref === s ? ' now' : ''}" data-act="refTone" data-s="${s}" aria-pressed="${tu.ref === s}" style="min-width:84px">
          <span class="tile-name">${T.SHARP[m % 12]}</span><span class="tile-sub">${T.STRING_ORD[s]} string${words[s] ? '<br>' + words[s] : ''}</span></button>`).join('')}</div>
        <p class="note">Thickest to thinnest: <strong>E A D G B E</strong>. One way to remember it: Eddie Ate Dynamite, Good Bye Eddie.</p>
      </section>`;
  };
  Object.assign(W.ACT, {
    refTone(el) {
      const s = +el.dataset.s;
      if (U.tune.ref === s) { A.toneStop(); U.tune.ref = null; }
      else { A.tone(T.TUNING[s]); U.tune.ref = s; if (!W.leave.includes(tuneOff)) W.leave.push(tuneOff); }
      document.querySelectorAll('[data-act="refTone"]').forEach((b) => { const on = +b.dataset.s === U.tune.ref; b.classList.toggle('now', on); b.setAttribute('aria-pressed', on); });
    },
    async micToggle() {
      const tu = U.tune;
      if (tu.listening) { A.micStop(); tu.listening = false; W.render(); return; }
      A.toneStop(); tu.ref = null; tu.err = '';
      try {
        await A.micStart(showPitch);
        tu.listening = true;
        if (!W.leave.includes(tuneOff)) W.leave.push(tuneOff);
      } catch (e) {
        tu.err = 'The microphone was blocked or isn’t available. Allow it in your browser’s site settings and try again, or use the reference tones below.';
      }
      W.render();
    },
  });

  Object.assign(W, { GOALS, goal, goalHit, holdStage, goalBlock, goBtn, midiToFreq });
})();
