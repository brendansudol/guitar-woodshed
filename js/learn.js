/* Today, the Path, and the interactive pieces inside lessons. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc, chips } = R;
  const P = T.pretty;

  const KEY_ORDER = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
  const keyChips = (path, cur, list = KEY_ORDER) => chips(list.map((pc) => ({ v: pc, l: T.keyName(pc) })), cur, 'set', `data-path="${path}"`);
  const CHORD_CHOICES = ['G', 'C', 'D', 'A', 'E', 'Em', 'Am', 'Dm', 'F', 'Bm', 'F#m', 'B7', 'A7', 'D7', 'E7', 'G7', 'C7', 'Cadd9', 'Dsus4', 'Asus2', 'Fmaj7', 'Am7', 'Em7', 'Bb'];
  const TOOL_TAB = { '1-2': 'notes', '4-2': 'strum', '5-2': 'work', '5-3': 'ear', '6-4': 'ear', 'f-1': 'pick', 'f-2': 'pick', 'f-3': 'pick', 'f-5': 'pick' };
  const TOOL_MODE = { '5-3': 'chord', '6-4': 'echo' };
  const toolAttrs = (id) => (TOOL_TAB[id] ? ` data-tab="${TOOL_TAB[id]}"` : '') + (TOOL_MODE[id] ? ` data-mode="${TOOL_MODE[id]}"` : '');

  /* ---------- Shared blocks (also used by the Keys screen) ---------- */
  function familyBlock(key, scope) {
    const fam = T.diatonic(key);
    const feel = ['home', '', '', 'away', 'tension', 'home’s shadow', ''];
    const id = W.reg(scope + '-cad', () => Object.assign({ chords: [fam[0], fam[3], fam[4], fam[0]].map((x) => x.chord), bpm: 92, pattern: 'fours', loop: false }, W.hl(scope + '-fam')));
    return `<div class="stack">
      <div class="tiles" data-prog="${scope}-fam">${fam.map((x, i) => R.chordTile(x.chord, key, { box: true, sub: feel[i], cls: W.isKnown(x.chord) ? '' : 'new', idx: [0, -1, -1, 1, 2, -1, -1][i] })).join('')}</div>
      <div class="row">${R.playBtn(id, 'Hear I – IV – V – I', 'sm')}<span class="note">Tap any chord to hear it. Dashed outline: not in your chords yet.</span></div>
    </div>`;
  }

  function progList(key, scope) {
    return `<div class="stack">${T.PROGS.map((p) => {
      const chords = T.progChords(p, key);
      const blues = p.id === 'blues';
      const sid = `${scope}-${p.id}`;
      const id = W.reg(sid, () => Object.assign({ chords, bpm: blues ? 104 : 100, pattern: blues ? 'eighths' : 'folk', swing: blues ? 0.33 : 0, bass: true, drums: true, vel: 0.7 }, W.hl(sid)));
      return `<div class="stack tight" style="padding:14px 0;border-top:1px solid var(--line)">
        <div class="row between"><div class="stack tight"><h3>${esc(p.name)}</h3><span class="mono small muted">${esc(p.nums)}</span></div>${R.playBtn(id, 'Play along', 'sm')}</div>
        ${W.progStrip(sid, chords, key, { mini: true, markNew: true })}
        <p class="note">${esc(p.note)}</p>
      </div>`;
    }).join('')}</div>`;
  }

  const SHAPE_KEYS = [7, 0, 2, 9, 4];
  function capoWays(key) {
    return SHAPE_KEYS.map((sh) => ({ sh, capo: T.mod(key - sh) })).filter((x) => x.capo <= 7).sort((a, b) => a.capo - b.capo);
  }
  function capoTable(shape, capo) {
    const sounding = T.mod(shape + capo);
    const a = T.diatonic(shape), b = T.diatonic(sounding);
    const pick = [0, 3, 4, 5];
    return `<div class="stack">
      <h2>${P(T.keyName(shape))} shapes + capo ${capo} = key of ${P(T.keyName(sounding))}</h2>
      <div class="song-line"><span class="label">You fret</span><div class="tiles">${pick.map((i) => R.chordTile(a[i].chord, shape, { cls: 'mini' })).join('')}</div></div>
      <div class="song-line"><span class="label">It sounds</span><div class="tiles">${pick.map((i) => R.chordTile(b[i].chord, sounding, { cls: 'mini' })).join('')}</div></div>
      <p class="note">The numbers under each chord match. Only the letters moved.</p>
    </div>`;
  }

  /* ---------- One-minute changes (lesson 4-3 and the Chord Gym) ---------- */
  const pairKey = (a, b) => [a, b].sort().join(' ↔ ');
  function changeBests() {
    const out = {};
    Object.entries(S.changes).forEach(([k, v]) => { const p = k.split(' ↔ '); const key = p.length === 2 ? pairKey(p[0], p[1]) : k; out[key] = Math.max(out[key] || 0, v); });
    return out;
  }
  function changesBlock(st, path) {
    const names = S.known.length >= 2 ? S.known : ['G', 'C', 'D', 'Em'];
    if (!names.includes(st.a)) st.a = names[0];
    if (!names.includes(st.b) || st.b === st.a) st.b = names.find((n) => n !== st.a);
    const pair = pairKey(st.a, st.b), all = changeBests(), best = all[pair] || 0;
    const run = U.chg;
    const slow = Object.entries(all).sort((x, y) => x[1] - y[1]).slice(0, 3);
    const untried = [];
    names.slice(0, 6).forEach((a, i) => names.slice(i + 1, 6).forEach((b) => { if (!all[pairKey(a, b)] && untried.length < 3) untried.push([a, b]); }));
    const pickBtn = (a, b, label) => `<button type="button" class="chip" data-act="chgPick" data-path="${path}" data-a="${esc(a)}" data-b="${esc(b)}">${label}</button>`;
    const level = best >= 60 ? 'Fluent.' : best >= 30 ? 'Comfortable. Next stop: 60.' : best ? 'Building. First target: 30.' : 'Not tried yet. First target: 30.';
    return `<div class="row" style="gap:24px;align-items:flex-start">
        <div class="stack tight"><span class="label">From</span>${chips(names, st.a, 'set', `data-path="${path}a"`)}</div>
        <div class="stack tight"><span class="label">To</span>${chips(names.filter((n) => n !== st.a), st.b, 'set', `data-path="${path}b"`)}</div></div>
      <div class="row" style="gap:28px">
        <div><div class="stat-n" id="chg-left">${run ? run.left : 60}</div><span class="label">seconds</span></div>
        <div><div class="stat-n" id="chg-count">${run ? run.count : 0}</div><span class="label">changes</span></div>
        <div><div class="stat-n muted">${best}</div><span class="label">best ${esc(P(pair))}</span></div>
      </div>
      <div class="stack tight" style="max-width:420px"><div class="bar marks"><i style="width:${Math.min(100, (best / 60) * 100)}%"></i></div>
        <div class="row between small muted"><span>0</span><span>30 comfortable</span><span>60 fluent</span></div><span class="small"><strong>${level}</strong></span></div>
      <div class="row">${run
        ? `<button type="button" class="btn primary big" data-act="chgTap">Tap for each clean change</button><button type="button" class="btn quiet" data-act="chgStop">Cancel</button>`
        : `<button type="button" class="btn primary" data-act="chgStart" data-pair="${esc(pair)}">Start 60 seconds</button>`}</div>
      ${slow.length ? `<div class="stack tight"><span class="label">Your slowest pairs: work on these</span><div class="chips">${slow.map(([k, v]) => { const p = k.split(' ↔ '); return pickBtn(p[0], p[1], `${esc(P(k))} · ${v}`); }).join('')}</div></div>` : ''}
      ${untried.length ? `<div class="stack tight"><span class="label">Not measured yet</span><div class="chips">${untried.map(([a, b]) => pickBtn(a, b, esc(P(pairKey(a, b))))).join('')}</div></div>` : ''}`;
  }

  /* ---------- Lesson widgets ---------- */
  function widget(l) {
    const w = l.w, st = (U.w[l.id] = U.w[l.id] || {}), path = `w.${l.id}.`;
    const def = (k, v) => { if (st[k] === undefined) st[k] = v; };
    switch (w.type) {
      case 'string': {
        def('all', false);
        const marks = {};
        w.strings.forEach((s) => {
          for (let f = 0; f <= 12; f++) {
            const pc = (T.TUNING[s] + f) % 12, nat = !T.SHARP[pc].includes('#');
            if (!st.all && !nat) continue;
            marks[s + ':' + f] = { t: T.SHARP[pc], d: 0, ring: w.strings.length > 1 && [3, 5, 7].includes(f), dim: st.all && !nat };
          }
        });
        return `${chips([{ v: false, l: 'Plain letters' }, { v: true, l: 'All twelve' }], st.all, 'set', `data-path="${path}all"`)}
          ${R.fretboard({ id: 'w', frets: 12, marks, strings: w.strings })}
          <p class="note">Tap any spot on the neck to hear it.${w.strings.length > 1 ? ' Ringed notes are the six landmarks.' : ''}</p>`;
      }
      case 'octaves': {
        def('note', 7);
        const marks = {};
        for (let s = 0; s < 6; s++) for (let f = 0; f <= 15; f++) if ((T.TUNING[s] + f) % 12 === st.note) marks[s + ':' + f] = { t: T.SHARP[st.note], d: 1 };
        return `${chips(T.SHARP.map((n, i) => ({ v: i, l: n })), st.note, 'set', `data-path="${path}note"`)}
          ${R.fretboard({ id: 'w', marks })}
          <p class="note">Every ${P(T.SHARP[st.note])} on the neck. Trace the octave shapes between neighboring dots.</p>`;
      }
      case 'scale': {
        def('root', 7); def('one', true); def('label', 'degree');
        const flats = T.keyFlats(st.root), steps = T.SCALES.major.steps;
        let marks = {}, strings;
        if (st.one) {
          let s = [0, 1, 2, 3, 4].find((x) => T.mod(st.root - T.TUNING[x]) <= 3);
          if (s === undefined) s = 0;
          const f0 = T.mod(st.root - T.TUNING[s]);
          steps.concat(12).forEach((stp, i) => { marks[s + ':' + (f0 + stp)] = { t: st.label === 'degree' ? String((i % 7) + 1) : T.noteName(st.root + stp, flats), d: (i % 7) + 1 }; });
          strings = [s];
        } else marks = R.scaleMarks({ root: st.root, pcs: steps.map((x) => st.root + x), label: st.label, flats });
        return `<div class="row">${keyChips(path + 'root', st.root)}</div>
          <div class="row">${chips([{ v: true, l: 'Along one string' }, { v: false, l: 'Whole neck' }], st.one, 'set', `data-path="${path}one"`)}
          ${chips([{ v: 'degree', l: 'Numbers' }, { v: 'note', l: 'Note names' }], st.label, 'set', `data-path="${path}label"`)}</div>
          ${R.fretboard({ id: 'w', marks, strings })}
          <div class="legend">${steps.map((stp, i) => `<span class="pair">${R.degTag(String(i + 1), i + 1)} ${P(T.noteName(st.root + stp, flats))}</span>`).join('')}</div>
          ${st.one ? '<p class="note">Count the frets between dots: two, two, one, two, two, two, one. Whole, whole, half, whole, whole, whole, half.</p>' : ''}`;
      }
      case 'chordbuild': {
        const opts = [...new Set(S.known.concat(['G', 'Em', 'E', 'A', 'Am', 'D', 'Dm', 'C']))].filter((n) => T.parseChord(n)).slice(0, 14);
        def('ch', opts[0]); def('lab', 'ivl');
        const ch = T.parseChord(st.ch) || T.parseChord('G');
        const q = T.Q[ch.q], flats = ch.flats || T.keyFlats(ch.root);
        const scale = T.SCALES.major.steps;
        return `${chips(opts, st.ch, 'set', `data-path="${path}ch"`)}
          <div class="row" style="gap:28px;align-items:flex-start">
            <div style="width:190px;max-width:100%">${R.chordBox(ch, { tones: true, labels: st.lab }).replace('class="cbox"', 'class="cbox" style="width:100%"')}</div>
            <div class="stack" style="flex:1;min-width:220px">
              <h2>${P(ch.name)} <span class="muted" style="font-size:.6em">${esc(q.label)}</span></h2>
              <div class="legend">${q.iv.map((iv) => `<span class="pair">${R.degTag(T.IVL[iv], T.DEG_OF[iv])} ${P(T.noteName(ch.root + iv, flats))}</span>`).join('')}</div>
              <div class="stack tight"><span class="label">${P(T.noteName(ch.root, flats))} major scale</span>
                <div class="legend">${scale.map((stp, i) => `<span class="pair"><span class="deg ${q.iv.includes(stp) ? 'd' + (i + 1) : ''}">${i + 1}</span> ${P(T.noteName(ch.root + stp, flats))}</span>`).join('')}</div>
              </div>
              ${ch.third === 'min' ? '<p class="note">The b3 is the scale’s 3 lowered one fret. That one note makes the chord minor.</p>' : ''}
              <div class="row">${chips([{ v: 'ivl', l: 'Numbers' }, { v: 'note', l: 'Note names' }], st.lab, 'set', `data-path="${path}lab"`)}
              <button type="button" class="btn sm" data-act="strum" data-chord="${esc(ch.name)}">Strum it</button></div>
            </div>
          </div>`;
      }
      case 'family': {
        def('key', 7);
        return `<div class="stack"><span class="label">Key</span>${keyChips(path + 'key', st.key)}</div>${familyBlock(st.key, 'w')}`;
      }
      case 'transposer': {
        def('key', 7);
        const prog = T.PROGS.find((p) => p.id === w.prog), chords = T.progChords(prog, st.key);
        const id = W.reg('w-tr', () => Object.assign({ chords, bpm: 96, pattern: 'folk', bass: true, drums: true, vel: 0.7 }, W.hl('w-tr')));
        return `<div class="stack tight"><span class="label">The numbers never change</span>
            <div class="row">${chords.map((c) => R.degTag(T.numeral(c, st.key), T.degreeOf(c.root, st.key))).join('<span class="muted">–</span>')}</div></div>
          <div class="stack tight"><span class="label">Pick a key and the letters move</span>${keyChips(path + 'key', st.key)}</div>
          ${W.progStrip('w-tr', chords, st.key, { markNew: true, box: true })}
          <div class="row">${R.playBtn(id, 'Play along')}</div>`;
      }
      case 'progressions': {
        def('key', 7);
        return `<div class="stack tight"><span class="label">Key</span>${keyChips(path + 'key', st.key)}</div>${progList(st.key, 'w')}`;
      }
      case 'capo': {
        def('shape', 7); def('capo', 2);
        return `<div class="row" style="gap:24px;align-items:flex-start">
          <div class="stack tight"><span class="label">Shapes you play</span>${keyChips(path + 'shape', st.shape, SHAPE_KEYS)}</div>
          <div class="stack tight"><span class="label">Capo on fret</span>${chips([0, 1, 2, 3, 4, 5, 6, 7], st.capo, 'set', `data-path="${path}capo"`)}</div></div>
          ${capoTable(st.shape, st.capo)}`;
      }
      case 'strum': {
        def('pat', w.patterns[0]); def('bpm', 76);
        const pat = A.PATTERNS[st.pat];
        const key = 7, fam = T.diatonic(key);
        const chords = l.id === '4-1' ? [fam[0].chord] : [fam[0], fam[3], fam[4], fam[3]].map((x) => x.chord);
        const id = W.reg('w-strum', () => Object.assign({ chords, bpm: st.bpm, pattern: st.pat, click: true }, W.hl('w-strum')));
        return `${w.patterns.length > 1 ? chips(w.patterns.map((k) => ({ v: k, l: A.PATTERNS[k].name })), st.pat, 'set', `data-path="${path}pat"`) : ''}
          <div class="stack" data-prog="w-strum">${R.strumGrid(st.pat)}
            <p class="note">${esc(pat.say)}</p>
            <div class="tiles">${chords.map((c, i) => R.chordTile(c, key, { idx: i, cls: 'mini' })).join('')}</div></div>
          <div class="transport">${R.playBtn(id, 'Play along')}
            <label class="field"><span class="label">Tempo <span data-out="${path}bpm">${st.bpm}</span> bpm</span><input id="w-bpm" type="range" min="50" max="150" value="${st.bpm}" data-on="range" data-path="${path}bpm" data-live="bpm"></label></div>`;
      }
      case 'changes':
        return changesBlock(st, path);
      case 'hearfn': {
        def('key', 7);
        const fam = T.diatonic(st.key), names = (ix) => ix.map((i) => fam[i].chord.name).join(' ');
        const feel = { 0: 'Home', 3: 'Away', 4: 'Tension', 5: 'Home’s shadow' };
        return `<div class="stack tight"><span class="label">Key</span>${keyChips(path + 'key', st.key, [7, 0, 2, 9, 4])}</div>
          <div class="tiles">${[0, 3, 4, 5].map((i) => R.chordTile(fam[i].chord, st.key, { sub: feel[i] })).join('')}</div>
          <div class="row"><button type="button" class="btn sm" data-act="seq" data-chords="${names([0, 4])}">Hear I then V (left hanging)</button>
          <button type="button" class="btn sm" data-act="seq" data-chords="${names([0, 4, 0])}">Hear V resolve to I</button>
          <button type="button" class="btn sm" data-act="seq" data-chords="${names([0, 3, 0])}">Hear I – IV – I</button>
          <button type="button" class="btn sm" data-act="seq" data-chords="${names([0, 5])}">Hear I then vi</button></div>`;
      }
      case 'pentabox': {
        const major = w.feel === 'major';
        def('key', major ? 0 : 9); def('label', 'degree');
        const mroot = major ? st.key - 3 : st.key, f = T.mod(mroot - 4);
        const flats = T.keyFlats(major ? st.key : st.key + 3);
        const marks = R.scaleMarks({ root: mroot, pcs: T.SCALES.minPent.steps.map((x) => mroot + x), label: st.label, colorRoot: st.key, from: f, to: f + 3, dimOutside: true, flats });
        return `<div class="row"><div class="stack tight"><span class="label">${major ? 'Song is in the key of' : 'Minor key'}</span>${keyChips(path + 'key', st.key, major ? [0, 7, 2, 9, 4, 5] : [9, 4, 11, 2, 7, 0])}</div>
          <div class="stack tight"><span class="label">Show</span>${chips([{ v: 'degree', l: 'Numbers' }, { v: 'note', l: 'Note names' }], st.label, 'set', `data-path="${path}label"`)}</div></div>
          ${R.fretboard({ id: 'w', marks, window: [f, f + 3] })}
          <p class="note"><strong>${P(major ? T.keyName(st.key) + ' major' : T.minorKeyName(st.key) + ' minor')}:</strong> box 1 sits at ${f === 0 ? 'the open position (and again at fret 12)' : 'fret ' + f}${major ? `, the ${P(T.minorKeyName(mroot))} minor box. Red is ${P(T.keyName(st.key))}, your home note.` : '. Red is the root.'} Faint dots are the same five notes elsewhere on the neck.</p>`;
      }
      case 'barre': {
        def('shape', 'E'); def('fret', 3); def('min', false);
        const s = st.shape === 'E' ? 0 : 1;
        const root = T.TUNING[s] + st.fret, ch = T.chord(root, st.min ? 'min' : 'maj', T.keyFlats(root));
        const marks = {};
        for (let f = 0; f <= 12; f++) { const pc = (T.TUNING[s] + f) % 12; if (!T.SHARP[pc].includes('#') || f === st.fret) marks[s + ':' + f] = { t: T.noteName(pc, ch.flats), d: f === st.fret ? 1 : 0, ring: f === st.fret }; }
        return `<div class="row" style="gap:20px;align-items:flex-start">
            <div class="stack tight"><span class="label">Shape</span>${chips([{ v: 'E', l: 'E shape' }, { v: 'A', l: 'A shape' }], st.shape, 'set', `data-path="${path}shape"`)}</div>
            <div class="stack tight"><span class="label">Quality</span>${chips([{ v: false, l: 'Major' }, { v: true, l: 'Minor' }], st.min, 'set', `data-path="${path}min"`)}</div>
            <div class="stack tight"><span class="label">Barre at fret</span>${chips([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], st.fret, 'set', `data-path="${path}fret"`)}</div></div>
          <div class="row" style="gap:24px">${R.chordTile(ch, null, { box: true, shape: st.shape })}
            <h2>${st.shape}${st.min ? 'm' : ''} shape at fret ${st.fret} = ${P(ch.name)}</h2></div>
          ${R.fretboard({ id: 'w', frets: 12, marks, strings: [s] })}
          <p class="note">The chord is named by the note under your barre on the ${T.STRING_NAMES[s]} string.</p>`;
      }
      case 'barrekey': {
        def('key', 7);
        const fl = T.keyFlats(st.key), f = T.mod(st.key - 4);
        const set = [[T.chord(st.key, 'maj', fl), 'E', `E shape, fret ${f}`], [T.chord(st.key + 5, 'maj', fl), 'A', `A shape, fret ${f}`], [T.chord(st.key + 7, 'maj', fl), 'A', `A shape, fret ${f + 2}`], [T.chord(st.key + 9, 'min', fl), 'E', `Em shape, fret ${T.mod(f - 3)}`]];
        return `<div class="stack tight"><span class="label">Key</span>${keyChips(path + 'key', st.key, [5, 7, 9, 11, 0])}</div>
          <div class="tiles">${set.map(([c, sh, sub]) => R.chordTile(c, st.key, { box: true, shape: sh, sub })).join('')}</div>
          <p class="note">Change key and watch: the layout stays put. Only the fret number moves.</p>`;
      }
      case 'decode': {
        def('title', ''); def('text', '');
        const typed = W.parseSong(st.text).flatMap((x) => x.chords);
        const chords = typed.length ? typed : 'G D Em C'.split(' ').map(T.parseChord);
        const key = T.detectKey(chords).key, match = T.matchProg(chords, key);
        const id = W.reg('w-dec', () => Object.assign({ chords, bpm: 96, pattern: 'folk', bass: true, drums: true, vel: 0.7 }, W.hl('w-dec')));
        const inBook = S.songs.some((s) => s.text.trim() === st.text.trim());
        const rows = S.songs.slice(0, 6).map((s) => {
          const an = W.analyze(s);
          return `<div class="cmp"><span><strong>${esc(s.title)}</strong>${s.example ? ' <span class="tag">Example</span>' : ''}<br><span class="small muted">key of ${T.keyName(an.key)}</span></span>
            <div class="row" style="gap:4px">${an.all.slice(0, 8).map((c) => R.degTag(T.numeral(c, an.key, true), T.degreeOf(c.root, an.key))).join('')}</div></div>`;
        }).join('');
        return `<div class="row" style="align-items:flex-end">
            <label class="field" style="flex:1;min-width:150px"><span class="label">Song title</span><input type="text" id="dec-title" value="${esc(st.title)}" autocomplete="off"></label>
            <label class="field" style="flex:2;min-width:200px"><span class="label">Its chords, in order</span><input type="text" id="dec-text" value="${esc(st.text)}" placeholder="G D Em C" data-change="decodeText" autocomplete="off" spellcheck="false"></label>
            <button type="button" class="btn primary" data-act="decodeGo">Decode it</button></div>
          <div class="stack">
            <div class="row">${typed.length ? '' : '<span class="tag">Example</span>'}<span class="deg d1" style="font-size:18px;padding:3px 9px 1px">Key of ${T.keyName(key)}</span>${R.playBtn(id, 'Play along', 'sm')}</div>
            ${W.progStrip('w-dec', chords, key, {})}
            <p class="note">${match ? `<strong>${esc(match.name)}</strong> (${esc(match.nums)}). ` : ''}The colored tag under each chord is its number in this key. Red is I, the home chord.</p>
            ${typed.length ? `<div class="row">${st.saved ? '<strong>Saved to your Songbook.</strong>' : inBook ? '' : '<button type="button" class="btn sm" data-act="decodeSave">Save to my Songbook</button>'}</div>` : ''}
          </div>
          <div class="stack tight"><span class="label">Now compare: the numbers in other songs</span>${rows || '<p class="note">Your Songbook is empty. Decode a second song to compare.</p>'}</div>`;
      }
      case 'link':
        return `<div class="row"><button type="button" class="btn primary" data-act="go" data-hash="${w.hash}"${w.hash === 'train' ? toolAttrs(l.id) : ''}>${esc(w.label)} →</button></div>`;
    }
    /* Demos registered by later files (fingerstyle). */
    return W.WIDGETS && W.WIDGETS[w.type] ? W.WIDGETS[w.type](l, st, path) : '';
  }

  /* ---------- One-minute changes ---------- */
  function chgEnd(saveIt) {
    const run = U.chg;
    if (!run) return;
    clearInterval(run.timer);
    U.chg = null;
    if (saveIt && run.count > (S.changes[run.pair] || 0)) { S.changes[run.pair] = run.count; W.save(); }
  }
  Object.assign(W.ACT, {
    chgStart(el) {
      chgEnd(false);
      const run = (U.chg = { left: 60, count: 0, pair: el.dataset.pair });
      run.timer = setInterval(() => {
        run.left--;
        const e = document.getElementById('chg-left');
        if (e) e.textContent = run.left;
        if (run.left <= 0) { A.click(0, true); chgEnd(true); W.render(); }
      }, 1000);
      W.leave.push(() => chgEnd(false));
      W.render();
    },
    chgTap() { if (!U.chg) return; U.chg.count++; const e = document.getElementById('chg-count'); if (e) e.textContent = U.chg.count; },
    chgStop() { chgEnd(false); W.render(); },
    chgPick(el) { chgEnd(false); W.setPath(el.dataset.path + 'a', el.dataset.a); W.setPath(el.dataset.path + 'b', el.dataset.b); W.render(); },
    seq(el) { A.sequence(el.dataset.chords.split(' ').map(T.parseChord).filter(Boolean)); },
    openLesson(el) { A.stop(); U.lesson = el.dataset.id; if (location.hash !== '#path') location.hash = 'path'; else W.render(); window.scrollTo(0, 0); },
    closeLesson() { A.stop(); U.lesson = null; W.render(); window.scrollTo(0, 0); },
    quiz(el) { const q = (U.q[el.dataset.l] = U.q[el.dataset.l] || {}); q[el.dataset.qi] = +el.dataset.oi; W.render(); },
    prac(el) { S.prac[el.dataset.k] = el.checked ? 1 : 0; W.save(); el.closest('.check').classList.toggle('done', el.checked); },
    lessonDone(el) {
      const id = el.dataset.id;
      S.lessons[id] = Date.now();
      W.logBlock('l');
      const cur = W.ALL.find((l) => l.id === id);
      const list = cur.side ? W.SIDE.filter((l) => l.stage === cur.stage) : W.LESSONS, next = list[list.indexOf(cur) + 1];
      /* At the end of a stage, stop at its target instead of rolling straight into the next stage. */
      const g = W.goal(cur.stage), hold = (!next || next.stage !== cur.stage) && g && !g.met;
      U.lesson = next && !hold ? next.id : null;
      A.stop(); W.render(); window.scrollTo(0, 0);
      const sec = hold && document.getElementById('stage-' + cur.stage);
      if (sec) sec.scrollIntoView();
    },
    decodeGo() {
      const st = U.w[U.lesson];
      if (!st) return;
      st.title = document.getElementById('dec-title').value.trim();
      st.text = document.getElementById('dec-text').value.trim();
      st.saved = false;
      A.stop(); W.render();
    },
    decodeSave() {
      const st = U.w[U.lesson];
      if (!st || !st.text) return;
      S.songs.unshift({ id: 's' + Date.now().toString(36), title: st.title || 'My song', artist: '', text: st.text, key: null });
      st.saved = true;
      W.save(); W.render();
    },
    lessonUndo(el) { delete S.lessons[el.dataset.id]; W.save(); W.render(); },
    blockDone(el) { W.logBlock(el.dataset.k, el.checked); W.render(); },
    knownToggle(el) {
      const v = el.dataset.v, i = S.known.indexOf(v);
      if (i >= 0) S.known.splice(i, 1); else S.known.push(v);
      W.save(); W.render();
    },
    knownSave() { S.onboarded = true; U.editChords = false; W.save(); W.render(); },
  });

  /* ---------- Path ---------- */
  function lessonView(l) {
    const stage = stageOf(l.stage);
    const inStage = W.ALL.filter((x) => x.stage === l.stage);
    const qs = U.q[l.id] || {};
    const done = !!S.lessons[l.id];
    return `<div class="head">
        <div class="row"><button type="button" class="btn sm quiet" data-act="closeLesson">← All lessons</button></div>
        <span class="eyebrow">${l.stage ? `${l.side ? 'Side track' : 'Stage ' + l.stage} · ${esc(stage.title)} · Lesson ${inStage.indexOf(l) + 1} of ${inStage.length}` : esc(stage.title)} · ${l.mins} min</span>
        <h1>${esc(l.title)}</h1>
      </div>
      <div class="prose">${W.linkTerms(l.body)}</div>
      <section class="panel"><span class="label">Try it</span>${widget(l)}</section>
      <section class="stack"><h2>On your guitar</h2>
        ${l.practice.map((p, i) => { const k = l.id + ':' + i, on = !!S.prac[k]; return `<label class="check${on ? ' done' : ''}"><input type="checkbox" id="prac-${l.id}-${i}" data-act="prac" data-k="${k}"${on ? ' checked' : ''}><span>${W.linkTerms(esc(p))}</span></label>`; }).join('')}
        ${l.tool ? `<div class="row"><button type="button" class="btn sm" data-act="go" data-hash="${l.tool.hash}"${toolAttrs(l.id)}>${esc(l.tool.label)} →</button></div>` : ''}
      </section>
      <section class="stack"><h2>Check yourself</h2>
        ${l.quiz.map((q, qi) => {
          const pick = qs[qi], solved = pick === q.c;
          return `<div class="quiz-q"><strong>${esc(q.q)}</strong><div class="quiz-opts">${q.a.map((a, oi) => `<button type="button" class="opt${pick === oi ? (solved ? ' right' : ' wrong') : ''}" data-act="quiz" data-l="${l.id}" data-qi="${qi}" data-oi="${oi}"${solved && pick !== oi ? ' disabled' : ''}>${esc(a)}</button>`).join('')}</div>
            ${pick !== undefined ? `<span class="small ${solved ? '' : 'muted'}">${solved ? 'Correct.' : 'Not quite. Look back at the lesson and try again.'}</span>` : ''}</div>`;
        }).join('')}
      </section>
      <hr class="rule">
      <div class="row"><button type="button" class="btn primary big" data-act="lessonDone" data-id="${l.id}">${done ? 'Next lesson' : 'Mark complete'} →</button>
        ${done ? `<button type="button" class="btn quiet sm" data-act="lessonUndo" data-id="${l.id}">Mark as not done</button>` : ''}</div>`;
  }

  W.VIEWS.path = function () {
    const open = U.lesson && W.ALL.find((l) => l.id === U.lesson);
    if (open) return lessonView(open);
    const next = W.LESSONS.find((l) => !S.lessons[l.id]);
    const rows = (ls, nx, tag) => `<div class="lessons">${ls.map((l) => `<button type="button" class="lesson-row${S.lessons[l.id] ? ' done' : ''}${nx && nx.id === l.id ? ' next' : ''}" data-act="openLesson" data-id="${l.id}">
              <span class="tick"></span><span>${esc(l.title)}${nx && nx.id === l.id && tag ? ` <span class="tag">${tag}</span>` : ''}</span><span class="mins">${l.mins} min</span></button>`).join('')}</div>`;
    return `<div class="head"><span class="eyebrow">The path · 7 stages · ${W.LESSONS.length} lessons · ${W.TRACKS.length} side track</span>
        <h1>Each stage is built on the last</h1>
        <p class="lede">This course teaches why your fingers go where they go, in an order where each new idea attaches to one you already know. Skip ahead if a stage is old news; come back when something later doesn’t click. Reading a stage takes minutes and the skill takes longer, so each stage ends with a target to reach before you move on.</p></div>
      <div>${W.STAGES.map((st) => {
        const ls = W.LESSONS.filter((l) => l.stage === st.n);
        const allDone = ls.every((l) => S.lessons[l.id]);
        return `<section id="stage-${st.n}" class="stage${allDone ? ' done-all' : ''}">
          <div class="stage-n">${st.n}</div>
          <div class="stack tight"><h2>${esc(st.title)}</h2><p class="muted" style="max-width:62ch">${esc(st.why)}</p>
            ${rows(ls, next, 'Up next')}
            ${W.goalBlock(st.n)}
          </div></section>`;
      }).join('')}
      ${W.TRACKS.map((tr) => {
        const ls = W.SIDE.filter((l) => l.stage === tr.n), started = ls.some((l) => S.lessons[l.id]);
        return `<section id="stage-${tr.n}" class="stage side${ls.every((l) => S.lessons[l.id]) ? ' done-all' : ''}">
          <div class="stage-n">${tr.mark}</div>
          <div class="stack tight"><div class="row"><h2>${esc(tr.title)}</h2><span class="tag">Side track</span></div><p class="muted" style="max-width:62ch">${esc(tr.why)}</p>
            ${rows(ls, started ? ls.find((l) => !S.lessons[l.id]) : null, 'Up next')}
            ${W.goalBlock(tr.n)}
          </div></section>`;
      }).join('')}</div>`;
  };

  /* ---------- Today ---------- */
  const stageOf = (n) => W.STAGES.concat(W.TRACKS).find((s) => s.n === n);
  /* Warm-ups rotate through every practice area, whatever stage you are on. `min` is the first stage a drill makes sense at. */
  const ROTA = [
    { min: 0, tab: 'notes', title: 'Note Finder', text: 'Ten notes on the low E and A strings. Say each name out loud as you find it.' },
    { min: 0, tab: 'strum', title: 'Strum Lab', text: 'Mute the strings. A minute of steady down-up with the click, then a minute of Old Faithful.' },
    { min: 0, tab: 'ear', mode: 'echo', title: 'Echo a phrase', text: 'Hear a short phrase and play it back on the neck. This is how a riff gets from your head to your hands.' },
    { min: 0, tab: 'chords', title: 'One-minute changes', text: 'Sixty seconds on your slowest chord pair. Count the clean changes and beat your best.' },
    { min: 0, tab: 'ear', mode: 'interval', title: 'Find the second note', text: 'You hear two notes and see the first. Find the second by ear.' },
    { min: 2, tab: 'ear', mode: 'chord', title: 'Name the chord', text: 'Ten mystery chords. Feel each one against home before you answer.' },
    { min: 3, tab: 'keys', title: 'Key Chords', text: 'Ten quick questions like “what’s the IV in A?” Go for speed, not certainty.' },
    { min: 3, tab: 'work', title: 'Work It Out', text: 'One loop, no chart. Find home on the thick strings, then name the chords.' },
    { min: 2, tab: 'pick', title: 'Pick Lab', text: 'One picking pattern over two chords, slower than feels necessary. Thumb on the root, one finger per thin string.' },
  ];
  const AREA = { notes: 'neck', strum: 'rhythm', ear: 'ear', chords: 'chords', keys: 'keys', work: 'ear', pick: 'fingerstyle' };
  const warmFor = (stageN, dn) => { const ok = ROTA.filter((r) => stageN >= r.min); return ok[dn % ok.length]; };
  const MEM_TARGET = 5;
  function applyTask(stage, song, an) {
    if (!song) return ['Add a song you play', 'Put one song you already know into the Songbook. Every stage has you apply the new idea to a real song.'];
    const t = esc(song.title);
    const nums = an.lines[0] ? an.lines[0].chords.slice(0, 4).map((c) => P(T.numeral(c, an.key))).join(' – ') : '';
    const other = P(T.keyName(an.key === 7 ? 0 : 7));
    return {
      0: [`Play ${t} by its numbers`, `Open it in the Songbook and play along, reading the numbers under the chords instead of the letters.`],
      1: [`Find the roots in ${t}`, `Play it slowly. Before each chord, say its root note and find that note on the low E or A string.`],
      2: [`Name the notes in ${t}`, `Hold each chord and name its 1, 3 and 5. Is the 3 major or flattened?`],
      3: [`Play ${t} by number`, `Call the numbers out loud as you play${nums ? ' (' + nums + ')' : ''}. Then play the same numbers in ${other}.`],
      4: [`Change the strum on ${t}`, `Play it with the metronome at 80 using the pattern from today’s lesson. Keep the hand swinging through the changes.`],
      5: [`Hear ${t} before you play it`, `Hum the home note, find it on the low E string, then check the key in your Songbook. Play the song naming each chord’s feeling.`],
      6: [`Solo over ${t}`, `Load it in the Jam Room and play box 1 over the loop. One long ringed note per chord, then add a second note.`],
      7: [`Move ${t} up the neck`, `Play it with barre shapes only. Then slide everything up two frets and play it in the new key.`],
    }[stage];
  }

  W.VIEWS.today = function () {
    const nl = W.LESSONS.find((l) => !S.lessons[l.id]);
    const stageN = nl ? nl.stage : 7, stage = stageOf(stageN);
    const hold = W.holdStage();
    const day = S.log[W.dayKey()] || {};
    const dn = Math.floor(Date.now() / 864e5);
    const pool = S.songs.filter((x) => x.status !== 'mem'), songList = pool.length ? pool : S.songs;
    const song = songList.length ? songList[dn % songList.length] : null;
    const mem = S.songs.filter((x) => x.status === 'mem').length;
    const an = song ? W.analyze(song) : null;
    const warm = warmFor(stageN, dn), app = applyTask(stageN, song, an);
    const jamKey = an ? an.key : 7;
    const doneCount = W.LESSONS.filter((l) => S.lessons[l.id]).length;
    const date = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });

    const block = (k, mins, kind, title, text, btn) => `<div class="block${day[k] ? ' done' : ''}">
        <div class="block-time">${mins}<span>min</span><small>${kind}</small></div>
        <div class="stack tight"><h3>${title}</h3><p class="muted">${text}</p></div>
        <div class="block-side">${btn}<label class="check"><input type="checkbox" id="done-${k}" data-act="blockDone" data-k="${k}"${day[k] ? ' checked' : ''}><span class="small">Done</span></label></div>
      </div>`;

    const setup = !S.onboarded || U.editChords;
    const setupPanel = `<section class="panel">
        <div class="stack tight"><h2>${S.onboarded ? 'Your chords' : 'Start here: which chords can you play?'}</h2>
        <p class="note">${S.onboarded ? 'Tap to add or remove.' : 'The five selected are a starting guess, not your data. Tap to correct it. The app uses this to pick keys and examples that fit your hands, and to flag which chords in a new song are new to you.'}</p></div>
        <div class="chips">${CHORD_CHOICES.map((c) => `<button type="button" class="chip${S.known.includes(c) ? ' on' : ''}" data-act="knownToggle" data-v="${c}" aria-pressed="${S.known.includes(c)}">${P(c)}</button>`).join('')}</div>
        <div class="row"><button type="button" class="btn primary" data-act="knownSave">${S.onboarded ? 'Done' : 'These are my chords'}</button></div>
      </section>`;

    const days = [];
    for (let i = 27; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(W.dayKey(d)); }
    const noteStats = Object.values(S.drills.notes).reduce((a, [c, t]) => [a[0] + c, a[1] + t], [0, 0]);

    return `<div class="head"><span class="eyebrow">${esc(date)} · ${stageN ? `Stage ${stageN} of 7 · ` : ''}${esc(stage.title)}</span>
        <h1>Today’s twenty minutes</h1>
        <p class="lede">${S.onboarded ? esc(stage.why) : 'You can already play a few songs. Underneath them is a small system: keys, chord numbers, rhythm and ear. Learn it and you can pick up a new song quickly and hold your own when friends are playing.'}</p></div>
      ${setup ? setupPanel : ''}
      <div class="row" style="gap:10px 14px"><a class="btn sm" href="#tune">Tune up first</a>${S.guideSeen ? '' : '<a class="btn sm" href="#guide">How to read this app</a>'}
        <span class="note">${S.guideSeen ? 'Thirty seconds. Everything sounds wrong on an out-of-tune guitar.' : 'New here? Tune up, then take two minutes to learn how to read the diagrams.'}</span></div>
      <div class="cols">
        <div class="session">
          ${block('w', 3, 'warm up · ' + AREA[warm.tab], esc(warm.title), esc(warm.text) + ' A different area comes up each day.', `<button type="button" class="btn sm" data-act="go" data-hash="train" data-tab="${warm.tab}"${warm.mode ? ` data-mode="${warm.mode}"` : ''}>Start</button>`)}
          ${hold
            ? block('l', 5, 'practice', `Stay on stage ${hold.n} until it sticks`, `${esc(hold.text)} You’re at ${hold.have} of ${hold.need} ${hold.unit}. Reading the lessons was the quick part.`, W.goBtn(hold.go, 'sm primary') + (nl ? `<button type="button" class="btn sm quiet" data-act="openLesson" data-id="${nl.id}">Next lesson anyway</button>` : ''))
            : block('l', 5, 'learn', nl ? esc(nl.title) : 'Revisit any lesson', nl ? (nl.stage ? `Stage ${nl.stage}, the next step on the path. Read, try the demo, do the check.` : 'The first step: five minutes with one of your own songs.') : 'You’ve finished the path. Pick the lesson that still feels shaky.', nl ? `<button type="button" class="btn sm primary" data-act="openLesson" data-id="${nl.id}">Open lesson</button>` : `<button type="button" class="btn sm" data-act="go" data-hash="path">Open path</button>`)}
          ${block('a', 8, 'songs', app[0], app[1] + (song ? ` Then play it start to finish without stopping, and once without looking at the chords. <strong>${mem} of ${MEM_TARGET}</strong> songs from memory so far.` : ''), `<button type="button" class="btn sm" data-act="go" data-hash="songs">Songbook</button>`)}
          ${block('j', 4, 'play', `Jam in ${P(T.keyName(jamKey))}`, 'Backing band on, no goal. Strum along, then try a few notes from the box. This is the part that makes it music.', `<button type="button" class="btn sm" data-act="jamIn" data-key="${jamKey}">Jam Room</button>`)}
        </div>
        <aside class="stack" style="gap:22px">
          <div class="row" style="gap:26px;align-items:flex-end">
            <div><div class="stat-n">${W.streak()}</div><span class="label">day streak</span></div>
            <div class="stack tight"><div class="dots" aria-label="Practice over the last four weeks">${days.map((k, i) => `<i class="dot${W.practiced(k) ? ' on' : ''}${i === 27 ? ' today' : ''}" title="${k}"></i>`).join('')}</div><span class="label">last 4 weeks</span></div>
          </div>
          <div class="stats">
            <div><div class="stat-n">${doneCount}</div><span class="label">of ${W.LESSONS.length} lessons</span></div>
            <div><div class="stat-n">${mem}</div><span class="label">of ${MEM_TARGET} songs from memory</span></div>
            <div><div class="stat-n">${noteStats[1] ? Math.round((noteStats[0] / noteStats[1]) * 100) + '%' : '–'}</div><span class="label">note accuracy</span></div>
          </div>
          <div class="stack tight"><div class="row between"><span class="label">The path</span><a class="small" href="#path">See all</a></div>
            ${W.STAGES.map((st) => { const ls = W.LESSONS.filter((l) => l.stage === st.n), d = ls.filter((l) => S.lessons[l.id]).length; return `<div class="stage-row"><b>${st.n}</b><div class="stack tight"><span${st.n === stageN ? ' style="font-weight:700"' : ''}>${esc(st.title)}</span><div class="bar"><i style="width:${(d / ls.length) * 100}%"></i></div></div><span class="mono small muted">${d}/${ls.length}</span></div>`; }).join('')}
            ${W.TRACKS.map((tr) => { const ls = W.SIDE.filter((l) => l.stage === tr.n), d = ls.filter((l) => S.lessons[l.id]).length, nx = ls.find((l) => !S.lessons[l.id]) || ls[0]; return `<button type="button" class="stage-row side" data-act="openLesson" data-id="${nx.id}"><b>${tr.mark}</b><div class="stack tight"><span>${esc(tr.title)} <span class="tag">Side track</span></span><div class="bar"><i style="width:${(d / ls.length) * 100}%"></i></div></div><span class="mono small muted">${d}/${ls.length}</span></button>`; }).join('')}
          </div>
          ${!setup ? `<div class="stack tight"><div class="row between"><span class="label">Your chords</span><button type="button" class="btn sm quiet" data-act="set" data-path="editChords" data-v="true" data-keep="1">Edit</button></div><div class="legend">${S.known.map((c) => `<strong>${P(c)}</strong>`).join('')}</div></div>` : ''}
        </aside>
      </div>`;
  };

  W.ON.decodeText = function () { W.ACT.decodeGo(); };
  Object.assign(W, { keyChips, familyBlock, progList, capoWays, capoTable, KEY_ORDER, changesBlock });
})();
