# Guitar Woodshed

An interactive guitar course for people who can play a few songs and want to understand what they are playing. It teaches the system underneath the songs, in an order where each idea builds on the last, so new songs come faster and jamming with friends gets less scary.

**Live site:** https://brendansudol.github.io/guitar-woodshed/

## What's in it

- **Today**: a 20-minute daily plan in four blocks (warm up, learn, songs, jam), with a streak. The warm-up rotates through neck, rhythm, ear and chord drills each day, and the song block is the biggest.
- **Path**: 24 short lessons, each with a playable demo, an on-guitar assignment and a quick check. A day-one lesson decodes one of your own songs, then seven stages follow. Each stage ends with a "move on when" target tied to your drill scores, so finishing the reading is not the same as finishing the stage.
  1. The map (note names on the neck)
  2. Where chords come from
  3. Songs are numbers
  4. Rhythm
  5. Ears
  6. Riffing
  7. Any chord, anywhere
- **Neck**: any scale or chord across the fretboard, coloured by scale degree.
- **Keys**: the seven chords of any key, common progressions, and capo options.
- **Songs**: type in a song's chords and it finds the key, rewrites the chords as numbers, names the pattern and flags chords you don't know yet. Each song tracks how well you know it, toward a standing target of five songs from memory.
- **Jam**: a backing band in any key, with the safe notes shown and the current chord's notes ringed.
- **Train**: six trainers.
  - Note Finder and Key Chords quizzes.
  - Chord Gym: a string-by-string chord check, and one-minute changes with benchmarks and your slowest pairs.
  - Ear: name the chord, find the second note of an interval on the neck, and echo a short phrase back.
  - Work It Out: a band plays a loop in a hidden key; you find the home note, then name each chord.
  - Strum Lab.
- **Tuner**: reference tones for each string, plus a listening tuner that uses the microphone (standalone site only).
- **Guide**: a one-minute "how to read this app" page and a glossary. Dotted-underlined words in lessons can be tapped for a definition.

All sound is synthesized in the browser with the Web Audio API. There are no dependencies, no build framework and no backend. Progress is saved in your browser's local storage.

## Run it locally

Requires Node.js (any recent version).

```bash
npm run dev
```

Then open http://localhost:4173.

## How it's put together

| Path | What it is |
| --- | --- |
| `index.html` | Styles and page shell. A fragment, not a full document (see below). |
| `js/theory.js` | Notes, scales, chords, keys, chord shapes, key detection. No DOM, no audio. |
| `js/audio.js` | Plucked-string synthesis, drums, bass, the step sequencer and pitch detection. |
| `js/render.js` | SVG fretboard, chord boxes, strum grids. |
| `js/lessons.js` | The curriculum text and quiz data. |
| `js/core.js` | Saved state, routing, event handling. |
| `js/glossary.js` | Term definitions and the tap-to-define popover. |
| `js/extras.js` | Guide, tuner and the per-stage targets. |
| `js/learn.js` | Today, Path and the lesson widgets. |
| `js/tools.js` | Neck, Keys and Songs. |
| `js/play.js` | Jam room and the original trainers. |
| `js/drills.js` | Work It Out, interval and echo drills, Chord Gym. |
| `scripts/` | `dev.js` (local server), `build.js` (writes `dist/`), `wrap.js` (shared HTML wrapper). |

`index.html` deliberately has no `<html>`, `<head>` or `<body>` tags so the same file can be published as a Claude artifact. `scripts/wrap.js` adds them for local preview and for the deployed site.

## Deploying

Every push to `main` runs `.github/workflows/pages.yml`, which builds `dist/` and publishes it to GitHub Pages.
