/* Drawing: fretboard, chord boxes, strum grids, small shared bits of markup. */
(function () {
  const W = window.W;
  const T = W.T;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const P = T.pretty;

  /* marks: { 's:f': { t: label, d: 1-7 degree color (0 = pearl), ring, dim, state } } */
  function fretboard(o) {
    const frets = o.frets || 15, fw = 54, nutX = 48, top = 24, gap = 27;
    const width = nutX + frets * fw + 14, height = top + 5 * gap + 40;
    const y = (s) => top + (5 - s) * gap;
    const x = (f) => (f === 0 ? nutX - 24 : nutX + (f - 0.5) * fw);
    const active = o.strings || [0, 1, 2, 3, 4, 5];
    const marks = o.marks || {};
    let h = `<svg class="fb" viewBox="0 0 ${width} ${height}" style="min-width:${Math.round(width * (o.scale || 0.82))}px" role="img" aria-label="${esc(o.label || 'Guitar fretboard')}">`;
    h += `<rect x="${nutX}" y="${top - 12}" width="${frets * fw}" height="${5 * gap + 24}" rx="3" fill="var(--board)"/>`;
    if (o.window) {
      const [lo, hi] = o.window;
      const x0 = lo === 0 ? nutX : nutX + (lo - 1) * fw, x1 = nutX + hi * fw;
      h += `<rect x="${x0}" y="${top - 12}" width="${x1 - x0}" height="${5 * gap + 24}" fill="var(--board-lit)"/>`;
    }
    [3, 5, 7, 9, 15].filter((f) => f <= frets).forEach((f) => { h += `<circle cx="${x(f)}" cy="${top + 2.5 * gap}" r="6" fill="var(--inlay)" opacity=".55"/>`; });
    if (frets >= 12) h += `<circle cx="${x(12)}" cy="${top + 1.5 * gap}" r="6" fill="var(--inlay)" opacity=".55"/><circle cx="${x(12)}" cy="${top + 3.5 * gap}" r="6" fill="var(--inlay)" opacity=".55"/>`;
    for (let f = 1; f <= frets; f++) h += `<line x1="${nutX + f * fw}" x2="${nutX + f * fw}" y1="${top - 12}" y2="${top + 5 * gap + 12}" stroke="var(--fret)" stroke-width="2.2"/>`;
    h += `<rect x="${nutX - 4}" y="${top - 12}" width="6" height="${5 * gap + 24}" fill="var(--nut)"/>`;
    for (let s = 0; s < 6; s++) {
      const on = active.includes(s);
      h += `<line x1="${nutX}" x2="${nutX + frets * fw}" y1="${y(s)}" y2="${y(s)}" stroke="var(--string)" stroke-width="${(3.1 - s * 0.38).toFixed(2)}" opacity="${on ? 1 : 0.28}"/>`;
    }
    for (let f = 1; f <= frets; f++) {
      const key = [3, 5, 7, 9, 12, 15].includes(f);
      h += `<text x="${x(f)}" y="${top + 5 * gap + 31}" text-anchor="middle" class="fb-num${key ? ' key' : ''}">${f}</text>`;
    }
    if (!o.noStringNames) for (let s = 0; s < 6; s++) if (!marks[s + ':0']) h += `<text x="${nutX - 24}" y="${y(s) + 4}" text-anchor="middle" class="fb-open" opacity="${active.includes(s) ? 0.75 : 0.3}">${T.SHARP[T.TUNING[s] % 12]}</text>`;
    Object.keys(marks).forEach((k) => {
      const m = marks[k]; const [s, f] = k.split(':').map(Number);
      if (f > frets) return;
      const cx = x(f), cy = y(s);
      const fill = m.state === 'right' ? 'var(--good)' : m.state === 'wrong' ? 'var(--bad)' : m.state === 'ask' ? 'var(--bg)' : m.d ? `var(--d${m.d})` : 'var(--pearl)';
      const ink = m.state === 'right' || m.state === 'wrong' ? '#fff' : m.state === 'ask' ? 'var(--fg)' : m.d ? `var(--d${m.d}-ink)` : 'var(--pearl-ink)';
      h += `<g opacity="${m.dim ? 0.3 : 1}" class="fb-mark${m.ring ? ' ringed' : ''}">`;
      if (m.ring) h += `<circle cx="${cx}" cy="${cy}" r="15" fill="none" stroke="${f === 0 ? 'var(--fg)' : 'var(--ring)'}" stroke-width="2.5"/>`;
      h += `<circle cx="${cx}" cy="${cy}" r="11.5" fill="${fill}"${m.state === 'ask' ? ' stroke="var(--fg)" stroke-width="2.5"' : ''}/>`;
      if (m.t != null) h += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" class="fb-label" fill="${ink}">${esc(P(m.t))}</text>`;
      h += `</g>`;
    });
    if (o.id) {
      for (let s = 0; s < 6; s++) for (let f = 0; f <= frets; f++) {
        const rx = f === 0 ? 0 : nutX + (f - 1) * fw;
        h += `<rect class="fb-hit" data-fb="${o.id}" data-s="${s}" data-f="${f}" x="${rx}" y="${y(s) - gap / 2}" width="${f === 0 ? nutX : fw}" height="${gap}" fill="transparent"/>`;
      }
    }
    return `<div class="fb-wrap">${h}</svg></div>`;
  }

  /* Build marks for a set of pitch classes. label: 'note' | 'degree'. */
  function scaleMarks({ root, pcs, label = 'note', flats = false, from = 0, to = 15, strings, colorRoot, ringPcs, dimOutside }) {
    const marks = {};
    const set = new Set(pcs.map((p) => T.mod(p)));
    const cr = colorRoot == null ? root : colorRoot;
    for (let s = 0; s < 6; s++) {
      if (strings && !strings.includes(s)) continue;
      for (let f = 0; f <= 15; f++) {
        const pc = (T.TUNING[s] + f) % 12;
        if (!set.has(pc)) continue;
        const inWin = f >= from && f <= to;
        if (!inWin && !dimOutside) continue;
        const ivl = T.mod(pc - cr);
        marks[s + ':' + f] = {
          t: label === 'degree' ? T.IVL[ivl] : T.noteName(pc, flats),
          d: T.DEG_OF[ivl],
          dim: !inWin,
          ring: ringPcs ? ringPcs.includes(pc) && inWin : false,
        };
      }
    }
    return marks;
  }

  function chordBox(ch, o = {}) {
    const v = o.voicing || T.voicing(ch);
    const fr = v.frets;
    const played = fr.filter((f) => f > 0);
    const maxF = Math.max(0, ...played), minF = played.length ? Math.min(...played) : 1;
    const base = maxF <= 4 ? 1 : minF;
    const x0 = 16, y0 = 26, sg = 12, fg = 18, rows = 4;
    let h = `<svg class="cbox" viewBox="0 0 98 108" role="img" aria-label="${esc(ch.name)} chord shape">`;
    for (let r = 0; r <= rows; r++) h += `<line x1="${x0}" x2="${x0 + 5 * sg}" y1="${y0 + r * fg}" y2="${y0 + r * fg}" stroke="var(--line-strong)" stroke-width="1"/>`;
    for (let s = 0; s < 6; s++) h += `<line x1="${x0 + s * sg}" x2="${x0 + s * sg}" y1="${y0}" y2="${y0 + rows * fg}" stroke="var(--line-strong)" stroke-width="1"/>`;
    if (base === 1) h += `<rect x="${x0 - 0.5}" y="${y0 - 3}" width="${5 * sg + 1}" height="3.4" fill="var(--fg)"/>`;
    else h += `<text x="${x0 + 5 * sg + 6}" y="${y0 + fg / 2 + 3.5}" class="cbox-fr">${base}fr</text>`;
    const noOpen = !fr.includes(0);
    if (noOpen && played.filter((f) => f === minF).length >= 2) {
      const a = fr.indexOf(minF), b = fr.lastIndexOf(minF);
      if (b - a >= 2) h += `<rect x="${x0 + a * sg - 5.2}" y="${y0 + (minF - base + 0.5) * fg - 5.2}" width="${(b - a) * sg + 10.4}" height="10.4" rx="5.2" fill="var(--fg)" opacity=".85"/>`;
    }
    fr.forEach((f, s) => {
      const cx = x0 + s * sg;
      if (f < 0) { h += `<text x="${cx}" y="${y0 - 7}" text-anchor="middle" class="cbox-x">×</text>`; return; }
      const pc = (T.TUNING[s] + f) % 12, ivl = T.mod(pc - ch.root);
      const d = T.DEG_OF[ivl];
      const color = o.tones ? `var(--d${d})` : ivl === 0 ? 'var(--d1)' : 'var(--fg)';
      if (f === 0) { h += `<circle cx="${cx}" cy="${y0 - 10}" r="3.6" fill="${o.tones || ivl === 0 ? color : 'none'}" stroke="${color}" stroke-width="1.3"/>`; return; }
      const cy = y0 + (f - base + 0.5) * fg;
      h += `<circle cx="${cx}" cy="${cy}" r="${o.labels ? 5.8 : 5.2}" fill="${color}"/>`;
      if (o.labels) h += `<text x="${cx}" y="${cy + 2.4}" text-anchor="middle" class="cbox-l" fill="${o.tones ? `var(--d${d}-ink)` : ivl === 0 ? 'var(--d1-ink)' : 'var(--bg)'}">${esc(P(o.labels === 'note' ? T.noteName(pc, ch.flats) : T.IVL[ivl]))}</text>`;
    });
    return h + '</svg>';
  }

  function strumGrid(patKey) {
    const pat = W.audio.PATTERNS[patKey].p;
    const counts = ['1', '&', '2', '&', '3', '&', '4', '&'];
    return `<div class="strum" data-strum>${pat.map((hit, i) => {
      const dir = i % 2 ? 'U' : 'D';
      return `<div class="strum-cell${hit ? ' hit' : ''}${i % 2 ? '' : ' beat'}" data-step="${i}"><span class="strum-arrow" aria-hidden="true">${dir === 'D' ? '↓' : '↑'}</span><span class="strum-count">${counts[i]}</span></div>`;
    }).join('')}</div>`;
  }

  /* A picking pattern over one chord, laid out like tab: a row per string (thin string on top), a column per eighth note.
     The letter in each dot is the finger. Red dots are the chord's root. */
  function pickGrid(ch, patKey) {
    const pat = W.audio.PICKS[patKey], v = T.voicing(ch), map = T.pickMap(ch, v, pat.alt);
    const n = pat.p.length, six = n === 6;
    const counts = six ? ['1', '2', '3', '4', '5', '6'] : ['1', '&', '2', '&', '3', '&', '4', '&'];
    const letter = { R: 'p', A: 'p', i: 'i', m: 'm', a: 'a' };
    let h = `<div class="pick" style="--n:${n}" role="img" aria-label="${esc(pat.name)} over ${esc(ch.name)}">`;
    for (let s = 5; s >= 0; s--) {
      const muted = v.frets[s] < 0;
      h += `<span class="pick-s${muted ? ' off' : ''}">${muted ? '×' : T.SHARP[T.TUNING[s] % 12]}</span>`;
      pat.p.forEach((hit, i) => {
        const voice = hit ? hit.split('').find((x) => map[x] === s) : null;
        const root = voice && (T.TUNING[s] + v.frets[s]) % 12 === ch.root;
        h += `<span class="pick-cell${muted ? ' off' : ''}${s === 5 ? ' top' : s === 0 ? ' bottom' : ''}" data-step="${i}">${voice && !muted ? `<b class="pick-dot${root ? ' root' : ''}">${letter[voice]}</b>` : ''}</span>`;
      });
    }
    h += '<span></span>' + counts.map((c, i) => `<span class="pick-count${i % (six ? 3 : 2) ? '' : ' beat'}" data-step="${i}">${c}</span>`).join('');
    return h + '</div>';
  }

  const degTag = (num, deg) => `<span class="deg d${deg}">${esc(P(num))}</span>`;

  /* A chord as a tappable tile: name, numeral in its degree color. */
  function chordTile(ch, keyPc, o = {}) {
    const num = keyPc == null ? '' : T.numeral(ch, keyPc);
    const deg = keyPc == null ? 0 : T.degreeOf(ch.root, keyPc);
    const boxOpts = Object.assign({}, o.boxOpts, o.shape ? { voicing: T.voicing(ch, o.shape) } : null);
    return `<button type="button" class="tile${o.cls ? ' ' + o.cls : ''}" data-act="strum" data-chord="${esc(ch.name)}"${o.shape ? ` data-shape="${o.shape}"` : ''}${o.idx != null ? ` data-ci="${o.idx}"` : ''} title="Tap to hear ${esc(ch.name)}">
      ${o.box ? chordBox(ch, boxOpts) : ''}
      <span class="tile-name">${esc(P(ch.name))}</span>
      ${num ? degTag(num, deg) : ''}
      ${o.sub ? `<span class="tile-sub">${o.sub}</span>` : ''}
    </button>`;
  }

  const playBtn = (id, label = 'Play', cls = '') => `<button type="button" class="btn ${cls}" data-act="play" data-play="${esc(id)}"><span class="btn-ico" aria-hidden="true"></span><span class="btn-t" data-idle="${esc(label)}">${esc(label)}</span></button>`;

  function chips(items, current, act, extra = '') {
    return `<div class="chips" role="group">${items.map((it) => {
      const v = typeof it === 'object' ? it.v : it, l = typeof it === 'object' ? it.l : it;
      return `<button type="button" class="chip${String(v) === String(current) ? ' on' : ''}" data-act="${act}" data-v="${esc(v)}" ${extra} aria-pressed="${String(v) === String(current)}">${esc(P(l))}</button>`;
    }).join('')}</div>`;
  }

  W.R = { esc, fretboard, scaleMarks, chordBox, strumGrid, pickGrid, degTag, chordTile, playBtn, chips };
})();
