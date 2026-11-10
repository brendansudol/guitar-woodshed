/* Plain-language definitions, and the tap-to-define popover that shows them. */
(function () {
  const W = window.W, R = W.R;

  /* Order matters: longer phrases first so "relative minor" wins over "minor". `re` finds the term in lesson text. */
  const G = (W.GLOSSARY = {
    relmin: { t: 'Relative minor', re: /\brelative minor\b/i, d: 'The minor key that uses exactly the same notes as a major key. It starts on that key’s 6th note: E minor is the relative minor of G major.' },
    numeral: { t: 'Roman numerals', re: /\broman numerals?\b/i, d: 'A chord’s position in a key, written I to vii. Capitals are major chords, lower-case are minor. In the key of G: G is I, C is IV, D is V and Em is vi.' },
    degree: { t: 'Scale degree', re: /\bscale degrees?\b/i, d: 'A note’s position in the major scale, counted 1 to 7 from the key note. In G: G is 1, A is 2, B is 3 and so on. Each number has its own colour in this app.' },
    chordtone: { t: 'Chord tone', re: /\bchord tones?\b/i, d: 'A note that belongs to the chord playing right now. In the Jam Room these have a ring around them.' },
    halfstep: { t: 'Half step', re: /\bhalf step\b/i, d: 'The distance of one fret. The smallest step in Western music.' },
    wholestep: { t: 'Whole step', re: /\bwhole step\b/i, d: 'The distance of two frets. Two half steps.' },
    open: { t: 'Open string', re: /\bopen strings?\b/i, d: 'A string played without fretting it. Shown as a small circle above a chord box, or as a dot to the left of the nut on the neck.' },
    box: { t: 'Box 1', re: /\bbox 1\b/i, d: 'The first position of the pentatonic scale: a pattern two notes per string that fits under one hand, four frets wide.' },
    pent: { t: 'Pentatonic', re: /\bpentatonic\b/i, d: 'A five-note scale. The minor pentatonic is the standard choice for riffs and solos because none of its notes clash.' },
    hammer: { t: 'Hammer-on', re: /\bhammer-ons?\b/i, d: 'Sounding a higher note by tapping a fretting finger down hard on a string that is already ringing, without picking again.' },
    root: { t: 'Root', re: /\broots?\b/i, d: 'The note a chord or scale is named after and built from. The root of a G chord is G. It is usually the lowest note you play, and it is always red in this app.' },
    octave: { t: 'Octave', re: /\boctaves?\b/i, d: 'The same note, higher or lower. Go up twelve frets on any string and you reach the same letter name one octave up.' },
    key: { t: 'Key', re: /\bkey\b/i, d: 'The home note of a song plus the seven-note scale built on it. A song “in G” uses the G major scale, and G feels like the resting point.' },
    prog: { t: 'Progression', re: /\bprogressions?\b/i, d: 'A sequence of chords, usually repeating. G, D, Em, C played round and round is a progression.' },
    barre: { t: 'Barre', re: /\bbarre\b/i, d: 'One finger laid flat across several strings at the same fret, doing the job of the nut so an open-chord shape can move up the neck.' },
    capo: { t: 'Capo', re: /\bcapo\b/i, d: 'A clamp across all six strings at one fret. Everything sounds higher, so your open-chord shapes play in a new key.' },
    nut: { t: 'Nut', re: /\bnut\b/i, d: 'The slotted strip at the top of the neck where the strings begin. Think of it as fret 0.' },
    voicing: { t: 'Voicing', re: /\bvoicings?\b/i, d: 'One particular way of playing a chord: which copies of its notes you use and where on the neck.' },
    bend: { t: 'Bend', re: /\bbends?\b/i, d: 'Pushing a fretted string sideways across the fretboard so its pitch rises. Use two or three fingers together behind the note.' },
    slide: { t: 'Slide', re: /\bslides\b/i, d: 'Keeping pressure on a fretted note while moving the finger along the string to another fret, so the pitch glides.' },
    mute: { t: 'Muting', re: /\bmuted?\b/i, d: 'Resting the fretting hand lightly across the strings so they click when strummed and don’t ring. Good for practising rhythm on its own.' },
    bar: { t: 'Bar', re: /\bbar\b/i, d: 'A group of four beats, counted 1, 2, 3, 4. Chords usually change at the start of a bar.' },
    tempo: { t: 'Tempo (bpm)', re: /\bbpm\b/i, d: 'Speed in beats per minute. 60 is one beat a second. Most songs sit between 80 and 130.' },
    home: { t: 'Home', d: 'The note or chord a song comes to rest on. The 1 note, or the I chord.' },
    third: { t: 'The 3rd', d: 'The third note of the scale counted from the root. It decides whether a chord is major (bright) or minor (sad): the minor 3rd is one fret lower.' },
    sharpflat: { t: 'Sharp and flat', d: 'Sharp (#) means one fret higher, flat (b) means one fret lower. A# and Bb are the same fret with two names.' },
  });

  const term = (key, label) => `<button type="button" class="term" data-act="term" data-term="${key}">${label}</button>`;

  /* Wrap the first mention of each glossary term in a piece of HTML. Never touches tags or earlier wraps. */
  function linkTerms(html) {
    const segs = String(html).split(/(<[^>]+>)/).map((s) => ({ s, lock: s.charAt(0) === '<' }));
    Object.keys(G).forEach((key) => {
      const re = G[key].re;
      if (!re) return;
      for (let i = 0; i < segs.length; i++) {
        if (segs[i].lock) continue;
        const m = re.exec(segs[i].s);
        if (!m) continue;
        const txt = segs[i].s;
        segs.splice(i, 1, { s: txt.slice(0, m.index) }, { s: term(key, m[0]), lock: true }, { s: txt.slice(m.index + m[0].length) });
        return;
      }
    });
    return segs.map((x) => x.s).join('');
  }

  /* ---------- Popover ---------- */
  let pop = null;
  function closeGloss() { if (pop) { pop.remove(); pop = null; } }
  W.ACT.term = function (el) {
    const g = G[el.dataset.term];
    const same = pop && pop.dataset.term === el.dataset.term;
    closeGloss();
    if (!g || same) return;
    pop = document.createElement('div');
    pop.className = 'gloss';
    pop.id = 'gloss';
    pop.dataset.term = el.dataset.term;
    pop.setAttribute('role', 'note');
    pop.innerHTML = `<strong>${R.esc(g.t)}</strong><span>${R.esc(g.d)}</span>`;
    document.body.appendChild(pop);
    if (window.innerWidth <= 560) { pop.classList.add('sheet'); return; }
    const r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    const left = Math.max(12, Math.min(r.left, window.innerWidth - w - 12));
    const below = r.bottom + 8 + h < window.innerHeight;
    pop.style.left = left + window.scrollX + 'px';
    pop.style.top = (below ? r.bottom + 8 : r.top - h - 8) + window.scrollY + 'px';
  };
  document.addEventListener('click', (e) => { if (pop && !e.target.closest('.term, #gloss')) closeGloss(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeGloss(); });
  window.addEventListener('resize', closeGloss);

  Object.assign(W, { term, linkTerms, closeGloss });
})();
