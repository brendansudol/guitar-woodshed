/* App core: saved state, routing, event delegation, shared helpers. */
(function () {
  const W = window.W, T = W.T, A = W.audio, R = W.R;
  const KEY = 'woodshed.v1';

  const DEFAULT = () => ({
    v: 1, updated: 0, onboarded: false,
    known: ['G', 'C', 'D', 'Em', 'Am'],
    songs: [
      { id: 'ex1', example: true, title: 'Stand By Me', artist: 'Ben E. King', key: null, text: 'Whole song: G G Em Em C D G G' },
      { id: 'ex2', example: true, title: 'Let It Be', artist: 'The Beatles', key: null, text: 'Verse: C G Am F\nC G F C' },
      { id: 'ex3', example: true, title: 'Knockin’ on Heaven’s Door', artist: 'Bob Dylan', key: null, text: 'Verse: G D Am Am\nG D C C' },
    ],
    lessons: {}, prac: {}, log: {}, changes: {},
    drills: { notes: {}, keys: [0, 0], ear: [0, 0], best: {} },
  });

  const S = (W.S = DEFAULT());
  function adopt(obj) {
    const d = DEFAULT();
    Object.keys(S).forEach((k) => delete S[k]);
    Object.assign(S, d, obj);
    S.drills = Object.assign(d.drills, (obj && obj.drills) || {});
  }
  try { const raw = localStorage.getItem(KEY); if (raw) adopt(JSON.parse(raw)); } catch (e) { /* storage unavailable: run in memory */ }

  const U = (W.U = {
    lesson: null, w: {}, q: {},
    neck: { root: 7, show: 'major', label: 'note' },
    key: 7,
    songs: { edit: null, tr: {}, del: null, err: '' },
    jam: { key: 9, feel: 'minor', prog: 0, bpm: 84, scale: 'minPent', pos: 'box', label: 'degree', drums: true, bass: true, guitar: true, custom: null },
    tr: {
      tab: 'notes',
      notes: { strings: [0, 1], mode: 'find', nat: true, run: null },
      keys: { all: false, run: null },
      ear: { level: 1, run: null },
      strum: { pat: 'faithful', bpm: 80, text: 'G C D C', click: true, drums: false },
    },
  });

  /* ---------- Saving: this device first, then the viewer's private cloud doc when available ---------- */
  let cloudDoc = null, pushTimer = null, pushing = false, dirty = false;
  function setSync(t) { const el = document.getElementById('foot-sync'); if (el) el.textContent = t; }
  function save() {
    S.updated = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
    if (cloudDoc) { clearTimeout(pushTimer); pushTimer = setTimeout(push, 1500); }
  }
  async function push() {
    if (!cloudDoc) return;
    if (pushing) { dirty = true; return; }
    pushing = true;
    try { await cloudDoc.set({ updated: S.updated, state: JSON.stringify(S) }); setSync('Progress synced to your account'); }
    catch (e) { setSync('Progress saved on this device'); }
    pushing = false;
    if (dirty) { dirty = false; push(); }
  }
  async function cloudInit() {
    try {
      if (!window.claude || !window.claude.use) return;
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      const doc = db.collection('data/users/' + id).doc('progress');
      const snap = await doc.get();
      cloudDoc = doc;
      const remote = snap.exists ? snap.data() : null;
      if (remote && remote.state && (remote.updated || 0) > (S.updated || 0)) {
        adopt(JSON.parse(remote.state));
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
        render();
      } else if (S.updated) push();
      setSync('Progress synced to your account');
    } catch (e) { /* stay local */ }
  }

  /* ---------- Days, streaks ---------- */
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const practiced = (k) => !!(S.log[k] && Object.keys(S.log[k]).length);
  function streak() {
    const d = new Date();
    if (!practiced(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (practiced(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function logBlock(k, on = true) {
    const key = dayKey();
    const day = (S.log[key] = S.log[key] || {});
    if (on) day[k] = 1; else delete day[k];
    if (!Object.keys(day).length) delete S.log[key];
    save();
  }

  /* ---------- Songs ---------- */
  function parseSong(text) {
    return String(text || '').split(/\n+/).map((line) => {
      line = line.trim();
      if (!line) return null;
      let label = '';
      const m = /^([^:]{1,24}):\s*(.*)$/.exec(line);
      if (m) { label = m[1].trim(); line = m[2]; }
      const toks = line.replace(/[|,–—]/g, ' ').split(/\s+/).filter((t) => t && !/^(-|x\d+|\d+x|%|\/)$/i.test(t));
      const chords = [], bad = [];
      toks.forEach((t) => { const c = T.parseChord(t); if (c) chords.push(c); else bad.push(t); });
      return { label, chords, bad };
    }).filter((l) => l && (l.chords.length || l.bad.length));
  }
  function analyze(song) {
    const lines = parseSong(song.text);
    const det = T.detectKey(lines.flatMap((l) => l.chords));
    const baseKey = song.key == null ? det.key : song.key;
    const tr = U.songs.tr[song.id] || 0;
    const key = T.mod(baseKey + tr), flats = T.keyFlats(key);
    const out = lines.map((l) => ({ label: l.label, bad: l.bad, chords: l.chords.map((c) => T.chord(c.root + tr, c.q, tr || !c.flats ? flats : c.flats)) }));
    return { lines: out, all: out.flatMap((l) => l.chords), key, baseKey, tr, minor: det.minor && song.key == null, auto: song.key == null };
  }
  const knownChords = () => S.known.map(T.parseChord).filter(Boolean);
  const isKnown = (ch) => knownChords().some((k) => k.root === ch.root && k.q === ch.q);

  /* ---------- Routing and rendering ---------- */
  W.VIEWS = {}; W.ACT = {}; W.ON = {}; W.FB = {}; W.plays = {}; W.leave = [];
  let lastView = null;
  const currentView = () => { const h = (location.hash || '#today').slice(1); return W.VIEWS[h] ? h : 'today'; };
  function render() {
    const v = currentView();
    if (v !== lastView) {
      A.stop();
      W.leave.forEach((f) => f()); W.leave.length = 0;
      if (lastView) window.scrollTo(0, 0);
      lastView = v;
    }
    W.plays = {}; W.FB = {};
    document.getElementById('main').innerHTML = `<div class="view"><div class="mobile-brand">Wood<span>shed</span></div>${W.VIEWS[v]()}</div>`;
    document.querySelectorAll('#nav a').forEach((a) => {
      const on = a.dataset.v === v;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const done = W.LESSONS.filter((l) => S.lessons[l.id]).length;
    document.getElementById('nav-path').textContent = `${done}/${W.LESSONS.length}`;
    document.getElementById('nav-songs').textContent = S.songs.length || '';
    document.getElementById('foot-streak').textContent = streak();
    syncPlay();
  }
  function syncPlay() {
    document.querySelectorAll('[data-play]').forEach((b) => {
      const on = A.player.id === b.dataset.play;
      b.classList.toggle('playing', on);
      const t = b.querySelector('.btn-t');
      if (t) t.textContent = on ? 'Stop' : t.dataset.idle;
    });
  }
  W.onPlayerChange = syncPlay;
  function go(hash) { if (location.hash === '#' + hash) render(); else location.hash = hash; }

  function setPath(path, val) {
    const parts = path.split('.');
    let o = U;
    for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]] = o[parts[i]] || {};
    o[parts[parts.length - 1]] = val;
  }
  function getPath(path) { return path.split('.').reduce((o, k) => (o == null ? o : o[k]), U); }
  const coerce = (v) => (v === 'true' ? true : v === 'false' ? false : v !== '' && !isNaN(+v) ? +v : v);

  /* Highlight helpers for whatever the player is doing */
  const hl = (scope) => ({
    onChord: (i) => document.querySelectorAll(`[data-prog="${scope}"] [data-ci]`).forEach((el) => el.classList.toggle('now', +el.dataset.ci === i)),
    onStep: (step) => document.querySelectorAll(`[data-prog="${scope}"] .strum-cell`).forEach((el) => el.classList.toggle('now', +el.dataset.step === step)),
    onStop: () => document.querySelectorAll(`[data-prog="${scope}"] .now`).forEach((el) => el.classList.remove('now')),
  });
  /* A row of chord tiles that lights up as the player moves through it. */
  function progStrip(id, chords, keyPc, o = {}) {
    return `<div class="tiles" data-prog="${R.esc(id)}">${chords.map((c, i) => R.chordTile(c, keyPc, { idx: i, cls: (o.mini ? 'mini' : '') + (o.markNew && !isKnown(c) ? ' new' : ''), box: o.box })).join('')}</div>`;
  }
  function reg(id, fn) { W.plays[id] = fn; return id; }

  /* ---------- Generic actions ---------- */
  Object.assign(W.ACT, {
    go(el) {
      if (el.dataset.tab) U.tr.tab = el.dataset.tab;
      if (el.dataset.lesson !== undefined) U.lesson = el.dataset.lesson || null;
      go(el.dataset.hash);
    },
    set(el) {
      if (!el.dataset.keep) A.stop();
      setPath(el.dataset.path, coerce(el.dataset.v));
      render();
    },
    toggle(el) { setPath(el.dataset.path, !getPath(el.dataset.path)); render(); },
    strum(el) {
      const ch = T.parseChord(el.dataset.chord);
      if (!ch) return;
      if (el.dataset.shape) { A.stop(); A.strum(T.voicingMidis(T.voicing(ch, el.dataset.shape)), { spread: 0.028 }); }
      else A.strumChord(ch);
    },
    play(el) { const f = W.plays[el.dataset.play]; if (f) A.toggle(el.dataset.play, f()); },
  });
  Object.assign(W.ON, {
    range(el) {
      const v = +el.value;
      setPath(el.dataset.path, v);
      document.querySelectorAll(`[data-out="${el.dataset.path}"]`).forEach((o) => (o.textContent = v));
      if (el.dataset.live === 'bpm' && A.player.opts) A.player.opts.bpm = v;
    },
  });

  document.addEventListener('click', (e) => {
    const hit = e.target.closest('.fb-hit');
    if (hit) {
      A.ensure();
      const s = +hit.dataset.s, f = +hit.dataset.f, h = W.FB[hit.dataset.fb];
      if (h) h(s, f); else A.playNote(s, f);
      return;
    }
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    if (el.tagName !== 'INPUT') A.ensure();
    const fn = W.ACT[el.dataset.act];
    if (fn) fn(el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-on]');
    if (el && W.ON[el.dataset.on]) W.ON[el.dataset.on](el, e);
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && W.ON[el.dataset.change]) W.ON[el.dataset.change](el, e);
  });
  document.addEventListener('submit', (e) => e.preventDefault());
  window.addEventListener('hashchange', render);

  Object.assign(W, { save, render, go, reg, hl, progStrip, dayKey, practiced, streak, logBlock, parseSong, analyze, knownChords, isKnown, setPath, getPath });
  W.boot = function () { render(); cloudInit(); };
})();
