/* The curriculum. Order matters: each stage uses the one before it. */
(function () {
  const W = window.W;

  W.STAGES = [
    { n: 0, title: 'Start here', why: 'One short lesson using your own songs, so you can see what the rest of the course is building toward.' },
    { n: 1, title: 'The map', why: 'You can’t navigate what you can’t name. Chord roots, barre chords and every scale hang off the notes on the two thickest strings.' },
    { n: 2, title: 'Where chords come from', why: 'Chords aren’t arbitrary finger shapes. Each one is three notes pulled out of a scale. Once you see that, new chords stop being things to memorize.' },
    { n: 3, title: 'Songs are numbers', why: 'The unlock for learning songs fast. Musicians don’t remember “G, D, Em, C”. They remember “1, 5, 6, 4” and can play it in any key.' },
    { n: 4, title: 'Rhythm', why: 'In a jam nobody notices a slightly wrong chord. Everybody notices lost time. The strumming hand is the instrument.' },
    { n: 5, title: 'Ears', why: 'Picking up songs quickly is mostly an ear skill: hearing where home is and how far each chord sits from it.' },
    { n: 6, title: 'Riffing', why: 'Improvising isn’t inventing from nothing. It’s five safe notes, a sense of rhythm, and knowing which note to land on.' },
    { n: 7, title: 'Any chord, anywhere', why: 'Barre chords are open shapes you already know, moved up the neck. With the note names from stage 1, two shapes give you every major and minor chord.' },
  ];

  W.LESSONS = [
    /* ---------------- Start here ---------------- */
    {
      id: '0-1', stage: 0, mins: 5, title: 'Your songs already share a system',
      body: `<p>Right now you know each song as its own list of chord shapes. Before any theory, look at them another way.</p>
<p>Type the chords of a song you play into the box below. The app works out the key and puts a <strong>number</strong> under every chord. (The numbers are written as roman numerals: capitals for major chords, lower-case for minor.) Don’t worry yet about where they come from. Just look at which ones show up.</p>
<p>Then compare with the songs underneath. Different letters, different order, but the same few numbers: mostly <strong>I, IV, V and vi</strong>. Those numbers are what your songs have in common. Learning to see, hear and use them is what turns five memorized songs into fifty.</p>
<p>Stages 1 and 2 explain where the numbers come from. Stage 3 puts them to work. If a word has a dotted underline, tap it for a plain definition.</p>`,
      w: { type: 'decode' },
      practice: ['Play your song while reading the numbers under the chords, not the letters.', 'Decode a second song. Find one number the two songs share.', 'Save both to your Songbook. You will come back to them in every stage.'],
      tool: { label: 'How to read this app', hash: 'guide' },
      quiz: [
        { q: 'Two songs use different chord letters but the same numbers. What does that tell you?', a: ['One of them is written down wrong', 'They are the same pattern in different keys', 'They must be played at the same speed'], c: 1 },
        { q: 'Which numbers turn up most in popular songs?', a: ['I, IV, V and vi', 'ii, iii and vii', 'Only the I'], c: 0 },
      ],
    },

    /* ---------------- Stage 1 ---------------- */
    {
      id: '1-1', stage: 1, mins: 6, title: 'Twelve notes, one string',
      body: `<p>Music uses twelve notes, then repeats. Seven have plain letter names, A to G. Five sit in between and carry two names each: the note between A and B is A♯ (A sharp) or B♭ (B flat). Chord charts type these as <strong>A#</strong> and <strong>Bb</strong>, and so does this app.</p>
<p><strong>One fret is one half step.</strong> Two frets is a whole step. Two pairs of letters have nothing between them: <strong>B–C</strong> and <strong>E–F</strong> are only one fret apart. That is the entire alphabet:</p>
<p class="mono-line">E · F · F# · G · G# · A · A# · B · C · C# · D · D# · E</p>
<p>Fret 12 is the open string again, one octave higher. Everything above it repeats.</p>`,
      w: { type: 'string', strings: [0] },
      practice: ['Play the low E string one fret at a time from open to fret 12, saying every note name out loud.', 'Now only the plain letters: E F G A B C D E, at frets 0, 1, 3, 5, 7, 8, 10, 12. Notice where the one-fret gaps fall.'],
      quiz: [
        { q: 'What note is at fret 3 on the low E string?', a: ['F#', 'G', 'A', 'G#'], c: 1 },
        { q: 'Which pairs of letters are only one fret apart?', a: ['A–B and D–E', 'C–D and G–A', 'B–C and E–F', 'F–G and A–B'], c: 2 },
        { q: 'Fret 12 on any string is…', a: ['the same note as the open string, an octave up', 'a fifth above the open string', 'always an E'], c: 0 },
      ],
    },
    {
      id: '1-2', stage: 1, mins: 7, title: 'The two strings that run everything',
      body: `<p>You don’t need the whole neck yet. Learn the <strong>low E and A strings</strong> up to fret 12. Nearly every chord gets its name from a note on one of those two strings.</p>
<p>Your G chord: the lowest note is fret 3 of the low E string, which is G. Your C chord: fret 3 of the A string, which is C. The chord is named after that bass note, the <strong>root</strong>.</p>
<p>Start with the landmarks under the fret dots, frets 3, 5 and 7. Low E string: <strong>G, A, B</strong>. A string: <strong>C, D, E</strong>. Six notes. Everything else is one fret from a landmark.</p>`,
      w: { type: 'string', strings: [0, 1] },
      practice: ['Play the six landmarks (frets 3, 5, 7 on both strings) saying the names. Twice forwards, twice backwards.', 'Take each chord you know and find its root note on the low E or A string.', 'Run one Note Finder round on strings 6 and 5 every day this week. It takes three minutes and it compounds.'],
      tool: { label: 'Open Note Finder', hash: 'train' },
      quiz: [
        { q: 'What note is at fret 5 on the A string?', a: ['C', 'E', 'D', 'B'], c: 2 },
        { q: 'What note is at fret 7 on the low E string?', a: ['B', 'A', 'C', 'A#'], c: 0 },
        { q: 'Where is C on the low E string?', a: ['Fret 6', 'Fret 10', 'Fret 7', 'Fret 8'], c: 3 },
      ],
    },
    {
      id: '1-3', stage: 1, mins: 6, title: 'Octave shapes',
      body: `<p>Once you can name a note on the E or A string, two shapes find it everywhere else.</p>
<p><strong>Shape one:</strong> from the low E or A string, go two strings thinner and two frets higher. Same note, one octave up.</p>
<p><strong>Shape two:</strong> from the D or G string, go two strings thinner and <em>three</em> frets higher. The B string is tuned a fret “short”, so any shape that crosses it shifts up by one.</p>
<p>And the high E string has exactly the same note names as the low E. So learning two strings gives you all six.</p>`,
      w: { type: 'octaves' },
      practice: ['Pick a note. Find it on the low E string, then use the shapes to hop to the D string, then the B string.', 'Same again starting from the A string: A string, G string, high E string.'],
      quiz: [
        { q: 'G is at fret 3 on the low E string. Where is the next G on the D string?', a: ['Fret 3', 'Fret 5', 'Fret 4', 'Fret 7'], c: 1 },
        { q: 'The high E string has the same note names as…', a: ['the B string', 'the A string', 'the low E string'], c: 2 },
      ],
    },

    /* ---------------- Stage 2 ---------------- */
    {
      id: '2-1', stage: 2, mins: 7, title: 'The major scale: one formula',
      body: `<p>Nearly everything in music is described relative to the major scale, the “do re mi” sound. It is seven of the twelve notes, chosen by a fixed pattern of steps:</p>
<p class="mono-line">whole · whole · half · whole · whole · whole · half</p>
<p>Start on any note, apply the pattern, and you have that note’s major scale. From G: G A B C D E F#.</p>
<p>We number the notes <strong>1 to 7</strong>. These numbers are called scale degrees, and they are the most useful idea in this course. Chords, keys and solos are all described with them. Each number keeps the same colour everywhere in this app.</p>`,
      w: { type: 'scale' },
      practice: ['Play G major along the low E string only, from fret 3: frets 3, 5, 7, 8, 10, 12, 14, 15. Say the numbers 1 to 7 as you go.', 'Do the same from A at fret 5. Same spacing, different starting point. That’s all a key change is.'],
      quiz: [
        { q: 'The major scale step pattern is…', a: ['W W H W W W H', 'W H W W H W W', 'W W W H W W H'], c: 0 },
        { q: 'In G major, which note is number 5?', a: ['C', 'E', 'D', 'B'], c: 2 },
      ],
    },
    {
      id: '2-2', stage: 2, mins: 8, title: 'Chords are stacked notes',
      body: `<p>Take a major scale. Play notes <strong>1, 3 and 5</strong> together. That is a major chord.</p>
<p>G major scale is G A B C D E F#, so 1-3-5 is <strong>G, B, D</strong>. Look at your open G chord below: six strings ringing, but only three different notes, doubled up.</p>
<p>Lower the 3 by one fret and you get a <strong>minor chord</strong>: 1, b3, 5. That single note is the whole difference between a bright chord and a sad one. Going from E to Em you lift one finger. That finger was holding the 3.</p>`,
      w: { type: 'chordbuild' },
      practice: ['Play E, then Em. Find the one note that changed. That’s the 3rd, on the G string.', 'Same with A to Am, and D to Dm.', 'For each chord you know, read its three notes below, then say them while holding the shape.'],
      quiz: [
        { q: 'A major chord is built from scale degrees…', a: ['1, 2, 3', '1, 4, 5', '1, 3, 5', '1, 3, 7'], c: 2 },
        { q: 'What turns C into C minor?', a: ['The 5th goes up a fret', 'The 3rd drops one fret', 'The root moves'], c: 1 },
        { q: 'Which notes make a G major chord?', a: ['G, B, D', 'G, C, D', 'G, A, B', 'G, B, E'], c: 0 },
      ],
    },
    {
      id: '2-3', stage: 2, mins: 8, title: 'The seven chords of a key',
      body: `<p>Build a 1-3-5 stack on each note of a scale, using only notes from that scale, and you get seven chords. That family of chords is a <strong>key</strong>.</p>
<p>The qualities always fall in the same order: major, minor, minor, major, major, minor, diminished. We write them as roman numerals, capitals for major and lower-case for minor:</p>
<p class="mono-line">I · ii · iii · IV · V · vi · vii°</p>
<p>In G that is G, Am, Bm, C, D, Em, F#°. If you play G, C, D and Em, you have been playing in the key of G all along. <strong>I, IV and V</strong> are the three majors. <strong>vi</strong> is the minor that turns up most. Those four cover a huge share of popular music.</p>`,
      w: { type: 'family' },
      practice: ['In G, play I–IV–V–I: G, C, D, G. Then in C: C, F, G, C. Same movement at a different height.', 'Say the G family out loud while you play it: G, A minor, B minor, C, D, E minor.'],
      quiz: [
        { q: 'In every major key, which numbers are minor chords?', a: ['ii, iii and vi', 'ii, IV and vi', 'iii, V and vii'], c: 0 },
        { q: 'What is the IV chord in the key of G?', a: ['D', 'Em', 'C', 'Am'], c: 2 },
        { q: 'What is the vi chord in the key of C?', a: ['Em', 'Am', 'Dm', 'F'], c: 1 },
      ],
    },

    /* ---------------- Stage 3 ---------------- */
    {
      id: '3-1', stage: 3, mins: 7, title: 'The number system',
      body: `<p>G–D–Em–C in the key of G is <strong>I–V–vi–IV</strong>. C–G–Am–F in the key of C is also I–V–vi–IV. Same song, different key.</p>
<p>When you know a song as numbers, you know it in all twelve keys. You can move it for a singer in seconds. And you start to hear that most songs are a small set of moves, rearranged. That is the difference between memorizing songs and understanding them.</p>
<p>When a friend says “it’s a one-four-five in A”, that is a complete instruction: A, D, E.</p>`,
      w: { type: 'transposer', prog: 'axis' },
      practice: ['Play I–V–vi–IV in G, four strums per chord. Then in C. Then in D if you have a Bm.', 'While you play, say the numbers out loud, not the chord names.'],
      quiz: [
        { q: 'I–V–vi–IV in the key of C is…', a: ['C, F, Am, G', 'C, G, Am, F', 'C, G, Em, F'], c: 1 },
        { q: 'A friend calls “one-four-five in A”. Which chords?', a: ['A, D, E', 'A, C, D', 'A, E, F#m'], c: 0 },
        { q: 'D–A–Bm–G in the key of D is…', a: ['I–IV–vi–V', 'I–vi–IV–V', 'I–V–vi–IV'], c: 2 },
      ],
    },
    {
      id: '3-2', stage: 3, mins: 8, title: 'Six loops behind most songs',
      body: `<p>A handful of chord loops account for most of the songs you will want to play. Learn each one by sound and by number.</p>
<p>From here on, your first question about any new song is: <strong>which of these is it, and what’s different?</strong> Usually the answer is “one of these, with one surprise”. You only have to learn the surprise.</p>`,
      w: { type: 'progressions' },
      practice: ['Play each loop in G for a minute. Notice which songs come to mind.', 'Take your favourite and play it in a second key.'],
      quiz: [
        { q: 'A 12-bar blues is built from which chords?', a: ['I, ii and V', 'I, IV and V', 'I, vi and IV'], c: 1 },
        { q: 'vi–IV–I–V uses the same four chords as…', a: ['I–V–vi–IV', 'ii–V–I', 'I–iii–IV–V'], c: 0 },
      ],
    },
    {
      id: '3-3', stage: 3, mins: 10, title: 'Decode your own songs',
      body: `<p>Time to turn the songs you’ve memorized into knowledge. Put each one in the Songbook. It works out the key and rewrites every chord as a number.</p>
<p>Look for three things. <strong>Which songs share a pattern.</strong> <strong>Which numbers you use constantly</strong> (probably I, IV, V and vi). And <strong>any chord from outside the key</strong>: those are the memorable moments in a song, and you will start to recognize them too.</p>
<p>From now on every new song goes in as numbers first. That is how five songs become fifty.</p>`,
      w: { type: 'link', label: 'Open the Songbook', hash: 'songs' },
      practice: ['Add every song you can play to the Songbook.', 'Play each one while reading the numbers instead of the chord names.', 'Find two of your songs that share at least three numbers.'],
      quiz: [
        { q: 'Why learn a song as numbers?', a: ['It’s faster to write down', 'It works in every key and shows what the song shares with others', 'Numbers are easier to sing'], c: 1 },
      ],
    },
    {
      id: '3-4', stage: 3, mins: 6, title: 'Capo and changing key',
      body: `<p>A capo raises every open string by one fret per position. Your shapes stay the same and the key moves up. Play G shapes with a capo on fret 2 and you are in A.</p>
<p>This is why tutorials say “capo 3, play Em, C, G, D”. The numbers haven’t changed. The capo has moved them.</p>
<p>To move a song for a singer: read its numbers, pick the new key, read the new chords off that key’s family. Or keep your shapes and let the capo do it.</p>`,
      w: { type: 'capo' },
      practice: ['Take a song you play in G. Play it in A two ways: with the A family (A, D, E, F#m), then with a capo on 2 using your G shapes.', 'Notice the numbers never changed.'],
      quiz: [
        { q: 'G shapes with a capo on fret 2 sound in the key of…', a: ['A', 'B', 'F', 'G#'], c: 0 },
        { q: 'C shapes with a capo on fret 2 sound in…', a: ['E', 'D', 'C#'], c: 1 },
      ],
    },

    /* ---------------- Stage 4 ---------------- */
    {
      id: '4-1', stage: 4, mins: 7, title: 'The pendulum hand',
      body: `<p>Count a bar as <strong>“1 & 2 & 3 & 4 &”</strong>. Your strumming hand moves down on every number and up on every “&”, constantly, whether or not it touches the strings.</p>
<p>Every strumming pattern is that same motion with some strokes missing the strings on purpose. Videos teach patterns as strings of Ds and Us to memorize, which is why they don’t stick. There is one motion, and a choice of which strokes connect.</p>
<p>Keep the hand swinging and the time takes care of itself.</p>`,
      w: { type: 'strum', patterns: ['eighths', 'fours'] },
      practice: ['Mute the strings with your fretting hand. Strum down-up along with the player at 70, counting out loud, for two minutes.', 'Still muted: keep the hand moving but only hit the strings on the numbers. Then only on the “&”s.'],
      quiz: [
        { q: 'On the “&” counts, the hand moves…', a: ['down', 'up', 'it stops'], c: 1 },
        { q: 'When a pattern skips a strum, your hand…', a: ['waits for the next one', 'keeps swinging and misses the strings'], c: 1 },
      ],
    },
    {
      id: '4-2', stage: 4, mins: 9, title: 'Five patterns for almost everything',
      body: `<p>Each pattern here is the pendulum with different strokes connecting. <strong>Solid arrows hit the strings.</strong> Faint arrows are the hand passing by.</p>
<p>Learn them in order. “Old Faithful” alone fits a remarkable number of songs.</p>
<p>To choose a pattern for a song, put the recording on, swing your hand in time, and listen for where the guitar accents land.</p>`,
      w: { type: 'strum', patterns: ['fours', 'eighths', 'folk', 'faithful', 'push'] },
      practice: ['Each pattern: muted strings first, then on one chord, then over a chord loop.', 'Play a song you know with a pattern you have never used on it.'],
      tool: { label: 'Open Strum Lab', hash: 'train' },
      quiz: [
        { q: 'In “Old Faithful”, what happens on beat 3?', a: ['A loud downstroke', 'The hand swings down but misses the strings', 'An upstroke'], c: 1 },
      ],
    },
    {
      id: '4-3', stage: 4, mins: 8, title: 'Changing chords in time',
      body: `<p>The rule: <strong>the strumming hand never waits for the fretting hand.</strong> If a change is late, strum anyway. Open strings on the last “&” of a bar are normal. You can hear them on records.</p>
<p>Speed comes from two habits. Move all the fingers at once toward the new shape, not one at a time. And look for anchor fingers that stay down or slide: G to Em, C to Am.</p>
<p>Measure it. Count clean changes between two chords in 60 seconds. Thirty is comfortable. Sixty is fluent.</p>`,
      w: { type: 'changes' },
      practice: ['One-minute changes on your two slowest pairs. Log the count. Beat it tomorrow.', 'Play a chord loop with the player at 70. Keep strumming through every change even when the chord isn’t ready.'],
      quiz: [
        { q: 'Your fretting hand is late for a change. You should…', a: ['pause until the chord is ready', 'keep strumming in time', 'slow the whole song down'], c: 1 },
      ],
    },

    /* ---------------- Stage 5 ---------------- */
    {
      id: '5-1', stage: 5, mins: 6, title: 'Home, away, tension',
      body: `<p>Each number has a feeling.</p>
<p>The <strong>I is home</strong>. Songs end there and feel finished. The <strong>IV is away</strong>: open, like stepping outside. The <strong>V is tension</strong>: it leans back toward home and wants to resolve. The <strong>vi is home’s shadow</strong>: settled, but sad.</p>
<p>You know these sounds already from a lifetime of listening. The skill is attaching the names to them.</p>`,
      w: { type: 'hearfn' },
      practice: ['Play I–IV–I–V in G and stop on the V. Wait. Feel it pull. Then resolve to I.', 'One round of the ear trainer a day, level 1.'],
      quiz: [
        { q: 'Which chord most wants to resolve to the I?', a: ['IV', 'vi', 'V'], c: 2 },
        { q: 'Which chord feels like home, but sad?', a: ['vi', 'ii', 'V'], c: 0 },
      ],
    },
    {
      id: '5-2', stage: 5, mins: 10, title: 'Find the key by ear',
      body: `<p>This is the method for working out a song without a tutorial.</p>
<ol><li><strong>Hum home.</strong> Play the recording and hum the note that feels like the resting point, usually where the chorus lands.</li>
<li><strong>Find it on the low E string.</strong> Slide one finger up the string until your note matches the hum. You named those notes in stage 1. That note is the key.</li>
<li><strong>Call up the family.</strong> The song’s chords will nearly all come from that key’s I, IV, V and vi.</li>
<li><strong>Follow the bass.</strong> The lowest note at each change is usually the chord’s root.</li></ol>
<p>You are now choosing between four likely chords, not every chord in existence.</p>`,
      w: { type: 'family' },
      practice: ['Pick a song you love and have never looked up. Find home on the low E string. Check yourself online afterwards.', 'Do one new song a week this way. This is the skill you came here for.'],
      quiz: [
        { q: 'The key note of a song usually sounds like…', a: ['the highest note', 'the resting point', 'the first note sung'], c: 1 },
        { q: 'Once you know the key, the chords most likely come from…', a: ['any of the twelve majors', 'that key’s I, IV, V and vi'], c: 1 },
      ],
    },
    {
      id: '5-3', stage: 5, mins: 6, title: 'Hear the changes',
      body: `<p>Now put it together. In the ear trainer you hear home first, then a mystery chord.</p>
<p>Don’t calculate. Ask how it feels next to home. Bright and open: IV. Tense and leaning: V. Settled but sad: vi.</p>
<p>A few minutes a day beats a long session once a week. Ears grow from frequency.</p>`,
      w: { type: 'link', label: 'Open the ear trainer', hash: 'train' },
      practice: ['One round at level 1 daily until you score 9 out of 10 twice in a row. Then level 2.'],
      quiz: [
        { q: 'What trains your ear fastest?', a: ['One long session a week', 'A few minutes every day', 'Reading about intervals'], c: 1 },
      ],
    },

    /* ---------------- Stage 6 ---------------- */
    {
      id: '6-1', stage: 6, mins: 8, title: 'Five notes that always work',
      body: `<p>The <strong>minor pentatonic</strong> scale has five notes: 1, b3, 4, 5, b7. Its first position, called box 1, is the most-played shape on the guitar: two notes per string, all inside four frets.</p>
<p>In A minor it sits at fret 5. First finger on fret 5, and each finger owns a fret.</p>
<p>Every note in the box sounds right over a song in that key. That frees you to think about rhythm and phrasing. The red notes are the root, your home base.</p>`,
      w: { type: 'pentabox', feel: 'minor' },
      practice: ['Play A minor pentatonic box 1 up and down slowly until you don’t have to look.', 'Find all three roots (red) inside the box. Start and end short phrases on them.'],
      quiz: [
        { q: 'How many different notes are in a pentatonic scale?', a: ['Seven', 'Five', 'Six'], c: 1 },
        { q: 'A minor pentatonic box 1 starts at which fret on the low E string?', a: ['Fret 3', 'Fret 7', 'Fret 5'], c: 2 },
      ],
    },
    {
      id: '6-2', stage: 6, mins: 7, title: 'One box, two moods',
      body: `<p>Every major key has a <strong>relative minor</strong> that uses exactly the same notes. It is the vi. G major and E minor. C major and A minor.</p>
<p>So over a song in a major key, play the minor pentatonic of its vi. Same box, placed <strong>three frets below the key note</strong>. Song in C: the A minor box at fret 5. Song in G: the E minor box, open or at fret 12.</p>
<p>The shape is identical. What changes is which note feels like home. In a major key, lean on the major root (red below) and the box sounds sweet instead of bluesy.</p>`,
      w: { type: 'pentabox', feel: 'major' },
      practice: ['Jam Room, key of G, major feel. Play the box and find the note that sounds like home. It’s G, not E.', 'Switch to E minor feel. Same box, different home.'],
      tool: { label: 'Open the Jam Room', hash: 'jam' },
      quiz: [
        { q: 'What is the relative minor of C major?', a: ['E minor', 'D minor', 'A minor'], c: 2 },
        { q: 'For a song in G major, which minor pentatonic box fits?', a: ['E minor', 'G minor', 'B minor'], c: 0 },
      ],
    },
    {
      id: '6-3', stage: 6, mins: 8, title: 'Land on chord tones',
      body: `<p>All five notes are safe, but over each chord some are stronger: the ones that are <em>in</em> that chord.</p>
<p>A line that lands on a chord tone just as the chord changes sounds deliberate. That is the difference between noodling and playing the changes.</p>
<p>In the Jam Room, <strong>ringed notes belong to the chord playing right now</strong>. Start small: one long note per bar, always a ringed one. Then approach it from the note next door.</p>`,
      w: { type: 'link', label: 'Open the Jam Room', hash: 'jam' },
      practice: ['Jam Room at a slow tempo. One ringed note per chord, held for the whole bar.', 'Then two notes per bar: any box note, then a ringed one.'],
      quiz: [
        { q: 'Chord tones are…', a: ['the notes of the chord playing right now', 'the five notes of the box', 'notes played very loudly'], c: 0 },
      ],
    },
    {
      id: '6-4', stage: 6, mins: 8, title: 'Phrasing: say something',
      body: `<p>Good solos are sentences, not scales. Four habits get you there.</p>
<p><strong>Leave space.</strong> Play for two beats, rest for two.<br><strong>Repeat yourself.</strong> Play a short idea, then again with one note changed.<br><strong>Steal rhythm.</strong> Tap the rhythm of a vocal line and play it on two notes.<br><strong>Call and response.</strong> Ask a question that ends on a tense note. Answer it ending on the root.</p>
<p>Slides, hammer-ons and bends between box notes add the voice. Three notes with good rhythm beat a fast run every time.</p>`,
      w: { type: 'link', label: 'Open the Jam Room', hash: 'jam' },
      practice: ['The two-note solo: pick two neighbouring box notes and play a full minute using only those. Rhythm is your only tool.', 'Call and response: two bars of question, two bars of answer, for five minutes.'],
      quiz: [
        { q: 'What makes a solo sound musical soonest?', a: ['Speed', 'Rhythm and space', 'Using every note in the scale'], c: 1 },
      ],
    },

    /* ---------------- Stage 7 ---------------- */
    {
      id: '7-1', stage: 7, mins: 9, title: 'The E shape and the A shape',
      body: `<p>Fret an open E chord with fingers 2, 3 and 4, leaving your first finger free. Slide the whole shape up one fret and lay the first finger flat across fret 1, standing in for the nut. That is F. Two more frets: G.</p>
<p><strong>The chord takes its name from the note under your first finger on the low E string.</strong> The open A shape works the same way, named from the A string. Use the Em and Am shapes for minor chords.</p>
<p>Barre chords take weeks to ring clean. Thumb low behind the neck, barre finger rolled slightly onto its bony edge, short sessions, often.</p>`,
      w: { type: 'barre' },
      practice: ['E shape at frets 3, 5 and 7: G, A, B. Check each string rings. Two minutes a day, no more.', 'A shape at frets 3, 5 and 7: C, D, E.'],
      quiz: [
        { q: 'An E-shape barre at fret 5 is…', a: ['A', 'G', 'B', 'C'], c: 0 },
        { q: 'An A-shape barre at fret 3 is…', a: ['D', 'B', 'C'], c: 2 },
      ],
    },
    {
      id: '7-2', stage: 7, mins: 7, title: 'Every key, no capo',
      body: `<p>With both shapes, any I–IV–V sits inside a few frets.</p>
<p>Play the I as an E-shape barre. The <strong>IV is the A shape at the same fret</strong>. The <strong>V is the A shape two frets higher</strong>. That layout holds at every fret, so moving your hand changes the key and you never have to think of a chord name.</p>
<p>The vi is the E-shape minor three frets below the I. This is the number system under your fingers.</p>`,
      w: { type: 'barrekey' },
      practice: ['I–IV–V in G with barre shapes at frets 3, 3 and 5. Slide everything up two frets: now you’re in A.', 'Play one of your songs using barre chords only.'],
      quiz: [
        { q: 'Your I is an E-shape barre at fret 5. Where is the IV?', a: ['A shape, same fret', 'E shape, two frets up', 'A shape, two frets down'], c: 0 },
      ],
    },
    {
      id: '7-3', stage: 7, mins: 8, title: 'The jam survival kit',
      body: `<p>Playing with friends is its own skill, and most of it is listening.</p>
<p><strong>Before you start,</strong> ask “what key?” and “what’s the progression?”. The answer comes in numbers, and you speak that now.</p>
<p><strong>While playing,</strong> time comes first. Lock to the drummer or the strongest rhythm player. Play less than you think you should: two guitars strumming the same open chords turn to mud, so one strums while the other plays barre shapes higher up or small two-string pieces of the chord.</p>
<p><strong>Your solo:</strong> box 1, leave space, land on chord tones. <strong>Someone else’s:</strong> get quiet and simple.</p>
<p><strong>Lost?</strong> Stop. Listen for home. Find the root on the low E string and come back in on the I.</p>`,
      w: { type: 'link', label: 'Open the Jam Room', hash: 'jam' },
      practice: ['Jam Room, 12-bar blues in A. Alternate twelve bars of rhythm and twelve of lead for ten minutes.', 'Invite a friend. Agree a key and a progression by number. Swap roles every time round.'],
      quiz: [
        { q: 'The first question at any jam is…', a: ['“What key are we in?”', '“Who’s soloing first?”', '“How fast?”'], c: 0 },
        { q: 'Two guitars strumming identical open chords will…', a: ['sound twice as good', 'sound muddy, so split the roles'], c: 1 },
      ],
    },
  ];
})();
