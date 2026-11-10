/* Reference tools: the Neck, Keys, and the Songbook. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R, S = W.S, U = W.U;
  const { esc, chips } = R;
  const P = T.pretty;

  /* ---------- Neck ---------- */
  const SHOWS = [
    { v: 'major', l: 'Major scale', use: 'The reference for everything: chords, keys and melodies are numbered from it.' },
    { v: 'minor', l: 'Natural minor', use: 'The sad-sounding scale. It has the same notes as the major scale three frets up.' },
    { v: 'minPent', l: 'Minor pentatonic', use: 'Five notes, no clashes. The default for riffs and solos in rock and blues.' },
    { v: 'majPent', l: 'Major pentatonic', use: 'The sweet, country-sounding five. Same shapes as the minor pentatonic three frets down.' },
    { v: 'blues', l: 'Blues scale', use: 'Minor pentatonic plus one gritty passing note, the b5. Don’t rest on it.' },
    { v: 'chMaj', l: 'Major chord', iv: [0, 4, 7], use: 'Every place the three chord notes live. Any group of neighbours is a playable voicing.' },
    { v: 'chMin', l: 'Minor chord', iv: [0, 3, 7], use: 'Same as the major chord with the 3 dropped one fret.' },
    { v: 'ch7', l: '7 chord', iv: [0, 4, 7, 10], use: 'A major chord plus the b7. It’s the sound of the V chord wanting to go home.' },
    { v: 'one', l: 'One note', iv: [0], use: 'Every copy of a single note. Look for the octave shapes between them.' },
    { v: 'all', l: 'Every note', iv: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], use: 'The whole map. Don’t memorize it; learn the low E and A strings and derive the rest.' },
  ];
  W.VIEWS.neck = function () {
    const n = U.neck, show = SHOWS.find((s) => s.v === n.show) || SHOWS[0];
    const steps = show.iv || T.SCALES[show.v].steps;
    const minorish = ['minor', 'minPent', 'blues', 'chMin'].includes(show.v);
    const flats = T.keyFlats(minorish ? n.root + 3 : n.root);
    const marks = R.scaleMarks({ root: n.root, pcs: steps.map((x) => n.root + x), label: n.label, flats });
    if (show.v === 'all') Object.values(marks).forEach((m) => { if (m.d !== 1 || m.t !== (n.label === 'degree' ? '1' : T.noteName(n.root, flats))) m.d = 0; });
    const rootName = T.noteName(n.root, flats);
    let extra = '';
    if (show.v === 'major' || show.v === 'majPent') extra = `Shares its notes with ${P(T.minorKeyName(n.root + 9))} minor${show.v === 'majPent' ? ' pentatonic' : ''}.`;
    if (show.v === 'minor' || show.v === 'minPent') extra = `Shares its notes with ${P(T.keyName(n.root + 3))} major${show.v === 'minPent' ? ' pentatonic' : ''}.`;
    return `<div class="head"><span class="eyebrow">The neck</span><h1>${P(rootName)} ${esc(show.l)}</h1>
        <p class="lede">${esc(show.use)} ${extra}</p></div>
      <div class="stack">
        <div class="stack tight"><span class="label">Root</span>${chips(W.KEY_ORDER.map((pc) => ({ v: pc, l: T.keyName(pc) })), n.root, 'set', 'data-path="neck.root"')}</div>
        <div class="stack tight"><span class="label">Show</span>${chips(SHOWS, n.show, 'set', 'data-path="neck.show"')}</div>
        <div class="stack tight"><span class="label">Label with</span>${chips([{ v: 'note', l: 'Note names' }, { v: 'degree', l: 'Numbers' }], n.label, 'set', 'data-path="neck.label"')}</div>
      </div>
      ${R.fretboard({ id: 'neck', marks })}
      <div class="legend">${steps.length <= 7 ? steps.map((iv) => `<span class="pair">${R.degTag(T.IVL[iv], T.DEG_OF[iv])} ${P(T.noteName(n.root + iv, flats))}</span>`).join('') : ''}</div>
      <p class="note">Tap anywhere on the neck to hear the note. Colours follow the number: red is always the 1, the home note. Low E string is at the bottom, as in tab.</p>`;
  };

  /* ---------- Keys ---------- */
  W.VIEWS.keys = function () {
    const k = U.key, name = T.keyName(k), flats = T.keyFlats(k);
    const ways = W.capoWays(k);
    const mine = S.songs.map((s) => ({ s, an: W.analyze(s) })).filter((x) => x.an.key === k);
    return `<div class="head"><span class="eyebrow">Chord families</span><h1>Key of ${P(name)}</h1>
        <p class="lede">Seven chords built from one scale. A song in ${P(name)} is made almost entirely from these, and mostly from the I, IV, V and vi. ${W.term('numeral', 'What do the numerals mean?')}</p></div>
      <div class="stack tight"><span class="label">Key</span>${W.keyChips('key', k)}</div>
      ${W.familyBlock(k, 'k')}
      <div class="stack tight"><span class="label">The scale it comes from</span>
        <div class="legend">${T.SCALES.major.steps.map((st, i) => `<span class="pair">${R.degTag(String(i + 1), i + 1)} ${P(T.noteName(k + st, flats))}</span>`).join('')}</div>
        <p class="note">Relative minor: <strong>${P(T.minorKeyName(k + 9))} minor</strong>. Same seven notes and the same chords, with home moved to the vi.</p></div>
      <section class="stack"><h2>Loops in ${P(name)}</h2>${W.progList(k, 'k')}</section>
      <section class="stack"><h2>Ways to play in ${P(name)}</h2>
        <div class="legend">${ways.map((w) => `<span class="pair"><span class="deg">${w.capo === 0 ? 'No capo' : 'Capo ' + w.capo}</span> ${P(T.keyName(w.sh))} shapes</span>`).join('')}</div>
        <p class="note">Each option sounds in ${P(name)}. Pick the one whose shapes you like. With barre chords you don’t need a capo at all: the I is an E shape at fret ${T.mod(k - 4) || 12}.</p></section>
      ${mine.length ? `<section class="stack"><h2>Your songs in ${P(name)}</h2><div class="legend">${mine.map((x) => `<a class="pair" href="#songs">${esc(x.s.title)}</a>`).join('')}</div></section>` : ''}`;
  };

  /* ---------- Songbook ---------- */
  function songCard(song, an) {
    const scope = 's-' + song.id;
    let ci = 0;
    const match = an.lines.map((l) => T.matchProg(l.chords, an.key)).find(Boolean) || (an.all.length ? T.matchProg(an.all, an.key) : null);
    const uniq = [...new Map(an.all.map((c) => [c.name, c])).values()];
    const fresh = uniq.filter((c) => !W.isKnown(c));
    const diat = T.diatonic(an.key).map((x) => x.chord);
    const outside = uniq.filter((c) => !diat.some((d) => d.root === c.root && d.third === c.third));
    const id = W.reg(scope, () => Object.assign({ chords: an.all, bpm: 96, pattern: 'folk', bass: true, drums: true, vel: 0.7 }, W.hl(scope)));
    const keyName = T.keyName(an.key);
    const del = U.songs.del === song.id;
    return `<article class="song" data-prog="${scope}">
      <div class="row between" style="align-items:flex-start">
        <div class="stack tight"><span class="song-title">${esc(song.title)}</span>
          <span class="muted">${esc(song.artist || '')} ${song.example ? '<span class="tag">Example</span>' : ''}</span></div>
        <div class="stack tight" style="align-items:flex-end"><span class="deg d1" style="font-size:19px;padding:4px 10px 2px">Key of ${P(keyName)}</span>
          ${an.minor ? `<span class="small muted">home feels like ${P(T.minorKeyName(an.key + 9))} minor (the vi)</span>` : ''}</div>
      </div>
      <div class="stack tight">${an.lines.map((l) => `<div class="song-line"><span class="label">${esc(l.label)}</span>
        <div class="tiles">${l.chords.map((c) => R.chordTile(c, an.key, { idx: ci++, cls: 'mini' + (W.isKnown(c) ? '' : ' new') })).join('')}${l.bad.length ? `<span class="small muted">Couldn’t read: ${esc(l.bad.join(', '))}</span>` : ''}</div></div>`).join('')}</div>
      <div class="stack tight">
        ${match ? `<p><strong>${esc(match.name)}</strong> <span class="mono small muted">${esc(match.nums)}</span><br><span class="note">${esc(match.note)}</span></p>` : ''}
        ${outside.length ? `<p class="note"><strong>Outside the key:</strong> ${outside.map((c) => `${P(c.name)} (${P(T.numeral(c, an.key))})`).join(', ')}. That’s the surprise in this song. Listen for the moment it arrives.</p>` : ''}
        <p class="note">${fresh.length ? `<strong>New to you:</strong> ${fresh.map((c) => P(c.name)).join(', ')} (dashed).` : 'You already play every chord in this.'}</p>
      </div>
      <div class="row"><span class="label">How well do you know it?</span>${chips([{ v: 'learn', l: 'Learning' }, { v: 'play', l: 'Can play through' }, { v: 'mem', l: 'From memory' }], song.status || 'learn', 'songStatus', `data-id="${song.id}"`)}</div>
      <div class="row">${R.playBtn(id, 'Play', 'sm')}
        <button type="button" class="btn sm" data-act="jamSong" data-id="${song.id}">Jam on it</button>
        <span class="row" style="gap:4px"><button type="button" class="btn sm quiet" data-act="songTr" data-id="${song.id}" data-d="-1" aria-label="Down one key">−</button>
          <span class="mono small" style="min-width:86px;text-align:center">${an.tr === 0 ? 'original key' : (an.tr > 0 ? '+' : '') + an.tr + ' frets'}</span>
          <button type="button" class="btn sm quiet" data-act="songTr" data-id="${song.id}" data-d="1" aria-label="Up one key">+</button></span>
        <label class="row small muted" style="gap:6px">Key <select id="key-${song.id}" data-on="songKey" data-id="${song.id}"><option value="">Auto</option>${W.KEY_ORDER.map((pc) => `<option value="${pc}"${song.key === pc ? ' selected' : ''}>${P(T.keyName(pc))}</option>`).join('')}</select></label>
        <button type="button" class="btn sm quiet" data-act="songEdit" data-id="${song.id}">Edit</button>
        <button type="button" class="btn sm quiet" data-act="songDel" data-id="${song.id}">${del ? 'Tap again to delete' : 'Delete'}</button>
      </div>
      ${an.tr > 0 && an.tr <= 7 ? `<p class="note">To get this key with the original shapes, put a capo on fret ${an.tr}.</p>` : ''}
    </article>`;
  }

  function songForm() {
    const e = U.songs.edit, song = e === 'new' ? { title: '', artist: '', text: '' } : S.songs.find((s) => s.id === e) || { title: '', artist: '', text: '' };
    return `<form class="panel" id="song-form">
      <h2>${e === 'new' ? 'Add a song' : 'Edit song'}</h2>
      <div class="row" style="align-items:flex-start">
        <label class="field" style="flex:2;min-width:200px"><span class="label">Title</span><input type="text" id="song-title" value="${esc(song.title)}" autocomplete="off"></label>
        <label class="field" style="flex:1;min-width:160px"><span class="label">Artist (optional)</span><input type="text" id="song-artist" value="${esc(song.artist || '')}" autocomplete="off"></label>
      </div>
      <label class="field"><span class="label">Chords</span>
        <textarea id="song-text" placeholder="Verse: G D Em C&#10;Chorus: C G D D" spellcheck="false">${esc(song.text)}</textarea></label>
      <p class="note">One line per section, chords separated by spaces, in the order you play them. Start a line with a name and a colon to label it. Repeats aren’t needed; the loop is what matters.</p>
      ${U.songs.err ? `<p class="small" style="color:var(--bad);font-weight:600">${esc(U.songs.err)}</p>` : ''}
      <div class="row"><button type="button" class="btn primary" data-act="songSave">Decode it</button><button type="button" class="btn quiet" data-act="songCancel">Cancel</button></div>
    </form>`;
  }

  W.VIEWS.songs = function () {
    const list = S.songs.map((s) => ({ s, an: W.analyze(s) }));
    const counts = {};
    let total = 0;
    list.forEach(({ an }) => an.all.forEach((c) => { const n = T.numeral(c, an.key, true); counts[n] = (counts[n] || 0) + 1; total++; }));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7);
    const core = ['I', 'IV', 'V', 'vi'].reduce((a, n) => a + (counts[n] || 0), 0);
    const degOf = (n) => T.DEG_OF[T.NUM.findIndex((x) => x.toLowerCase() === n.replace('°', '').toLowerCase())] || 0;
    const hasEx = S.songs.some((s) => s.example);
    const mem = S.songs.filter((s) => s.status === 'mem').length, MEM = 5;
    return `<div class="head"><span class="eyebrow">Songbook · ${S.songs.length} song${S.songs.length === 1 ? '' : 's'}</span><h1>Your songs, decoded</h1>
        <p class="lede">Type in the chords of a song you play. The app finds the key, turns every chord into its ${W.term('numeral', 'number')}, names the pattern, and shows what it shares with the rest of your songs.</p></div>
      <div class="goal${mem >= MEM ? ' met' : ''}"><span class="label">${mem >= MEM ? 'Target reached' : 'Standing target'}</span>
        <p>Five songs you can play start to finish from memory. That is a set you can pull out anywhere, and every stage of the course gets practised on them.</p>
        <div class="row"><div class="bar"><i style="width:${Math.min(100, (mem / MEM) * 100)}%"></i></div><span class="mono small">${Math.min(mem, MEM)} of ${MEM} songs</span></div></div>
      ${U.songs.edit ? songForm() : `<div class="row"><button type="button" class="btn primary" data-act="songNew">Add a song</button>
        ${hasEx ? '<button type="button" class="btn quiet" data-act="songClearEx">Remove the examples</button>' : ''}</div>`}
      ${total ? `<section class="panel"><div class="cols" style="gap:24px">
        <div class="stack"><h2>What your songs are made of</h2>
          <div class="stack tight">${top.map(([n, c]) => `<div class="hist">${R.degTag(n, degOf(n))}<div class="bar"><i style="width:${(c / top[0][1]) * 100}%;background:var(--d${degOf(n)})"></i></div><span class="mono muted">${c}</span></div>`).join('')}</div></div>
        <div class="stack"><div><div class="stat-n">${Math.round((core / total) * 100)}%</div><span class="label">of your chords are a I, IV, V or vi</span></div>
          <p class="note">This is why the numbers matter. Across ${S.songs.length} songs you’ve been playing the same four ideas in different keys. Learn the four, and a new song is mostly old news.${hasEx ? ' Counts include the example songs.' : ''}</p></div>
      </div></section>` : ''}
      <div>${list.length ? list.map(({ s, an }) => songCard(s, an)).join('') : '<p class="note">No songs yet. Add the first one you ever learned.</p>'}</div>`;
  };

  Object.assign(W.ACT, {
    songNew() { U.songs.edit = 'new'; U.songs.err = ''; W.render(); const t = document.getElementById('song-title'); if (t) t.focus(); },
    songEdit(el) { U.songs.edit = el.dataset.id; U.songs.err = ''; W.render(); window.scrollTo(0, 0); },
    songCancel() { U.songs.edit = null; W.render(); },
    songSave() {
      const title = document.getElementById('song-title').value.trim();
      const artist = document.getElementById('song-artist').value.trim();
      const text = document.getElementById('song-text').value.trim();
      const parsed = W.parseSong(text);
      if (!title) { U.songs.err = 'Give the song a title.'; }
      else if (!parsed.some((l) => l.chords.length)) { U.songs.err = 'Add at least one chord, like: G D Em C'; }
      else {
        if (U.songs.edit === 'new') S.songs.unshift({ id: 's' + Date.now().toString(36), title, artist, text, key: null });
        else { const s = S.songs.find((x) => x.id === U.songs.edit); if (s) Object.assign(s, { title, artist, text, example: false }); }
        U.songs.edit = null; U.songs.err = '';
        W.save(); W.render();
        return;
      }
      const keep = { title, artist, text };
      W.render();
      Object.keys(keep).forEach((k) => { const e = document.getElementById('song-' + k); if (e) e.value = keep[k]; });
    },
    songStatus(el) { const s = S.songs.find((x) => x.id === el.dataset.id); if (s) { s.status = el.dataset.v; W.save(); W.render(); } },
    songDel(el) {
      const id = el.dataset.id;
      if (U.songs.del !== id) { U.songs.del = id; W.render(); return; }
      const i = S.songs.findIndex((s) => s.id === id);
      if (i >= 0) S.songs.splice(i, 1);
      U.songs.del = null;
      W.save(); W.render();
    },
    songClearEx() { for (let i = S.songs.length - 1; i >= 0; i--) if (S.songs[i].example) S.songs.splice(i, 1); W.save(); W.render(); },
    songTr(el) {
      A.stop();
      const id = el.dataset.id, v = (U.songs.tr[id] || 0) + +el.dataset.d;
      U.songs.tr[id] = Math.max(-6, Math.min(7, v));
      W.render();
    },
    jamSong(el) {
      const song = S.songs.find((s) => s.id === el.dataset.id);
      if (!song) return;
      const an = W.analyze(song);
      const line = an.lines.find((l) => l.chords.length) || { chords: an.all };
      U.jam.custom = { title: song.title, chords: line.chords.slice(0, 16), majorKey: an.key };
      U.jam.feel = an.minor ? 'minor' : 'major';
      U.jam.key = an.minor ? T.mod(an.key + 9) : an.key;
      W.go('jam');
    },
  });
  W.ON.songKey = function (el) {
    A.stop();
    const s = S.songs.find((x) => x.id === el.dataset.id);
    if (!s) return;
    s.key = el.value === '' ? null : +el.value;
    U.songs.tr[s.id] = 0;
    W.save(); W.render();
  };
})();
