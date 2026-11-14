/* The homepage: what the site is, the route through the lessons, and every tool with a picture of itself. */
(function () {
  const W = window.W, T = W.T, R = W.R, S = W.S, U = W.U;
  const { esc } = R;

  /* The tool that goes with each stop on the route. */
  const STOP_TOOL = {
    0: ['Decode a song', 'data-act="openLesson" data-id="0-1"'],
    1: ['Note Finder', 'data-act="go" data-hash="train" data-tab="notes"'],
    2: ['Key Chords', 'data-act="go" data-hash="train" data-tab="keys"'],
    3: ['Songbook', 'data-act="go" data-hash="songs"'],
    4: ['Strum Lab', 'data-act="go" data-hash="train" data-tab="strum"'],
    5: ['Work It Out', 'data-act="go" data-hash="train" data-tab="work"'],
    6: ['Jam Room', 'data-act="go" data-hash="jam"'],
    7: ['Chord Gym', 'data-act="go" data-hash="train" data-tab="chords"'],
    F: ['Pick Lab', 'data-act="go" data-hash="train" data-tab="pick"'],
  };
  const stopClass = (n) => (n === 0 ? 's0' : n === 'F' ? 'sf' : 'd' + n);

  function route() {
    return `<div class="route">${W.STAGES.concat(W.TRACKS).map((st) => {
      const ls = W.ALL.filter((l) => l.stage === st.n), done = ls.filter((l) => S.lessons[l.id]).length;
      const cls = stopClass(st.n), tool = STOP_TOOL[st.n];
      const count = done ? `${done} of ${ls.length} done` : `${ls.length} lesson${ls.length === 1 ? '' : 's'}`;
      return `<div class="stop"><span class="stop-line ${cls}"></span>
        <button type="button" class="stop-go" data-act="homeStage" data-n="${st.n}">
          <span class="stop-disc ${cls}">${st.mark || st.n}</span><span class="stop-title">${esc(st.title)}</span><span class="stop-count">${count}</span></button>
        <button type="button" class="chip stop-tool" ${tool[1]}>${tool[0]}</button></div>`;
    }).join('')}</div>`;
  }

  /* ---------- Small pictures of each tool, drawn with the same parts the tools use ---------- */
  function miniNeck() {
    const x = { 5: 60, 7: 220, 8: 300 }, y = [177, 146, 115, 84, 53, 22]; // strings, low E first
    const dots = [[0, 5, 1, 1], [0, 8, 3], [1, 5, 4], [1, 7, 5], [2, 5, 7], [2, 7, 1, 1], [3, 5, 3], [3, 7, 4], [4, 5, 5], [4, 8, 7], [5, 5, 1, 1], [5, 8, 3]];
    return `<svg class="mini-neck" viewBox="0 0 360 196" aria-hidden="true">
      <rect x="20" y="8" width="320" height="180" rx="3" fill="var(--board)"/>
      ${[20, 100, 180, 260, 340].map((fx) => `<line x1="${fx}" x2="${fx}" y1="8" y2="188" stroke="var(--fret)" stroke-width="2.2"/>`).join('')}
      ${y.map((sy, s) => `<line x1="20" x2="340" y1="${sy}" y2="${sy}" stroke="var(--string)" stroke-width="${(3.4 - s * 0.44).toFixed(1)}"/>`).join('')}
      ${dots.map(([s, f, d, ring]) => `${ring ? `<circle cx="${x[f]}" cy="${y[s]}" r="15.5" fill="none" stroke="var(--ring)" stroke-width="2.4"/>` : ''}<circle cx="${x[f]}" cy="${y[s]}" r="12" fill="var(--d${d})"/>`).join('')}
    </svg>`;
  }
  function miniNotes() {
    const dot = (cx, cy, name, fill, ink) => `<circle cx="${cx}" cy="${cy}" r="13" fill="${fill}"/><text x="${cx}" y="${cy + 4.5}" text-anchor="middle" fill="${ink}">${name}</text>`;
    return `<svg class="mini-neck" viewBox="0 0 320 124" aria-hidden="true" style="font: 700 12px var(--font-body)">
      <rect x="16" y="14" width="288" height="96" rx="3" fill="var(--board)"/>
      ${[52, 88, 124, 160, 196, 232, 268].map((fx) => `<line x1="${fx}" x2="${fx}" y1="14" y2="110" stroke="var(--fret)" stroke-width="2"/>`).join('')}
      <rect x="13" y="14" width="6" height="96" fill="var(--nut)"/>
      <line x1="16" x2="304" y1="44" y2="44" stroke="var(--string)" stroke-width="2.9"/><line x1="16" x2="304" y1="80" y2="80" stroke="var(--string)" stroke-width="3.4"/>
      ${dot(106, 44, 'C', 'var(--good)', '#06180d')}${dot(178, 44, 'D', 'var(--bad)', '#ffffff')}${dot(250, 44, 'E', 'var(--d3)', 'var(--d3-ink)')}
      ${dot(106, 80, 'G', 'var(--good)', '#06180d')}${dot(178, 80, 'A', 'var(--good)', '#06180d')}${dot(250, 80, 'B', 'var(--d3)', 'var(--d3-ink)')}
    </svg>`;
  }
  const tile = (name, num, d) => `<span class="tile mini"><span class="tile-name">${name}</span><span class="deg d${d}">${num}</span></span>`;

  const TOOLS = [
    { name: 'Jam Room', go: 'data-hash="jam"', tag: ['Stop 6', 'd6'], note: 'or any level, if you already play',
      text: 'A backing band in twelve keys, with major, minor, blues and four modes. The neck shows the safe notes in any of the five boxes.', vis: miniNeck },
    { name: 'Songbook', go: 'data-hash="songs"', tag: ['Stop 3', 'd3'], note: 'if you can play one song',
      text: 'Type in a song’s chords. It finds the key, turns the chords into numbers and names the loop.',
      vis: () => `<span class="tiles">${tile('G', 'I', 1)}${tile('D', 'V', 5)}${tile('Em', 'vi', 6)}${tile('C', 'IV', 4)}</span>` },
    { name: 'Chord Gym', go: 'data-hash="train" data-tab="chords"', tag: ['Any level', 'any'], note: 'any chord in two taps',
      text: 'See which finger goes where, check a chord string by string, and time how fast you can change.',
      vis: () => `${R.chordBox(T.parseChord('F'), { labels: 'finger' })}<span class="mini-big">F</span>` },
    { name: 'Tuner', go: 'data-hash="tune"', tag: ['Any level', 'any'], note: 'thirty seconds before you play',
      text: 'Pluck a string and watch the needle, or tune by ear against a held note. Nothing is recorded.',
      vis: () => `<span class="mini-col tuner ok"><span class="mini-row"><span class="mini-big">A</span><strong>In tune.</strong></span>
        <span class="meter"><i class="meter-zone"></i><i class="meter-mid"></i><i class="meter-needle" style="left:52%"></i></span></span>` },
    { name: 'Note Finder', go: 'data-hash="train" data-tab="notes"', tag: ['Stop 1', 'd1'], note: 'three minutes a day',
      text: 'Learn the notes on the neck. A map fills in as you go: green where you know a note, red where you don’t.', vis: miniNotes },
    { name: 'Key Chords', go: 'data-hash="train" data-tab="keys"', tag: ['Stop 2', 'd2'], note: 'ten quick questions',
      text: 'Which chords belong to which key. The faster you answer, the faster you follow a song called out in numbers.',
      vis: () => `<span class="mini-col"><span class="mini-q">Key of A: what is the <em>IV</em>?</span>
        <span class="mini-opts"><span class="opt">Bm</span><span class="opt right">D</span><span class="opt">E</span><span class="opt">F#m</span></span></span>` },
    { name: 'Strum Lab', go: 'data-hash="train" data-tab="strum"', tag: ['Stop 4', 'd4'], note: 'five patterns, any tempo',
      text: 'One hand motion, and a choice of which strokes hit the strings. Play along over any chords with a count-in.',
      vis: () => R.strumGrid('faithful') },
    { name: 'Work It Out', go: 'data-hash="train" data-tab="work"', tag: ['Stop 5', 'd5'], note: 'no chart, just your ears',
      text: 'A band plays a loop in a key it doesn’t tell you. Find home on the neck, then name each chord.',
      vis: () => `<span class="barrow">${[['G', 'right'], ['D', 'right'], ['?', 'now'], ['?', '']].map(([c, k], i) => `<span class="barbox ${k}"><small>Bar ${i + 1}</small><b>${c}</b></span>`).join('')}</span>` },
    { name: 'Ear trainers', go: 'data-hash="train" data-tab="ear"', tag: ['Stop 5', 'd5'], note: 'three drills, a few minutes each',
      text: 'Name a mystery chord by how it feels, find a second note by ear, and echo a short phrase on the neck.',
      vis: () => `<span class="mini-row">${R.degTag('I', 1)}${R.degTag('IV', 4)}${R.degTag('V', 5)}${R.degTag('I', 1)}<span class="mini-ask">?</span></span>` },
    { name: 'Pick Lab', go: 'data-hash="train" data-tab="pick"', tag: ['+ Side track', 'side'], note: 'six picking patterns',
      text: 'Fingerpicking from a simple roll to the Travis pattern, over any chords, with the thumb on each chord’s root.',
      vis: () => R.pickGrid(T.parseChord('C'), 'roll') },
    { name: 'Today’s session', go: 'data-hash="today"', tag: ['Any level', 'any'], note: 'twenty minutes, planned for you',
      text: 'Four blocks: a warm-up, one lesson, real songs, then a jam. It picks up where you left off and keeps a streak.',
      vis: () => `<span class="mini-col"><span class="plan-bars"><b style="flex:3">3</b><b style="flex:5">5</b><b style="flex:8">8</b><b style="flex:4">4</b></span>
        <span class="plan-bars labels"><i style="flex:3">warm</i><i style="flex:5">learn</i><i style="flex:8">songs</i><i style="flex:4">play</i></span></span>` },
  ];

  W.hasProgress = () => S.onboarded || Object.keys(S.lessons).length > 0 || Object.keys(S.log).length > 0;

  W.VIEWS.home = function () {
    const started = W.hasProgress();
    return `<div class="home-top">
        <h1 class="home-h1">A guitar course and a room full of practice tools. <span>Learn the system, not the song.</span></h1>
        <div class="facts">
          <div class="facts-list"><span><strong>${W.ALL.length}</strong> short lessons</span><span><strong>${TOOLS.length}</strong> tools</span><span><strong>12</strong> keys</span><span><strong>20</strong> minutes a day</span><span>free, no sign-up</span></div>
          <div class="row">${started
            ? '<button type="button" class="btn primary" data-act="go" data-hash="today">Open today’s session</button>'
            : '<button type="button" class="btn primary" data-act="openLesson" data-id="0-1">Start at the first stop</button>'}
            <a class="home-alt" href="#jam">or just open the Jam Room →</a></div>
        </div>
      </div>
      <section class="stack" style="gap:22px">
        <div class="row between" style="align-items:baseline"><h2 class="home-h2">The route: lessons, in order</h2><span class="eyebrow">tap any stop to start there</span></div>
        ${route()}
      </section>
      <section class="stack" style="gap:22px">
        <div class="row between" style="align-items:baseline"><h2 class="home-h2">The tools: jump straight in</h2><span class="eyebrow">the colored tag shows which stop a tool goes with</span></div>
        <div class="hcards">
          ${TOOLS.map((t) => `<button type="button" class="hcard" data-act="go" ${t.go}>
            <span class="hcard-vis" aria-hidden="true">${t.vis()}</span>
            <span class="hcard-tag"><span class="deg ${t.tag[1]}">${t.tag[0]}</span><small>${t.note}</small></span>
            <span class="hcard-name">${t.name}</span><span class="hcard-text">${t.text}</span></button>`).join('')}
          <button type="button" class="hcard cta" data-act="openLesson" data-id="0-1">
            <span class="hcard-name">Not sure? Take five minutes.</span>
            <span class="hcard-text">The first lesson uses a song you already play. Free, and no sign-up.</span>
            <span class="hcard-go">Start at stop 0 →</span></button>
        </div>
      </section>`;
  };

  /* Open the Path at one stage. */
  W.ACT.homeStage = function (el) {
    U.lesson = null;
    W.go('path');
    setTimeout(() => { const sec = document.getElementById('stage-' + el.dataset.n); if (sec) sec.scrollIntoView(); }, 60);
  };
})();
