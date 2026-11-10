# Guitar Woodshed

An interactive guitar course for people who can play a few songs and want to understand what they are playing. It teaches the system underneath the songs, in an order where each idea builds on the last, so new songs come faster and jamming with friends gets less scary.

**Live site:** https://brendansudol.github.io/guitar-woodshed/

## What's in it

- **Today**: a 20-minute daily plan in four blocks (warm up, learn, apply to a song you know, jam), with a streak.
- **Path**: 7 stages and 23 short lessons, each with a playable demo, an on-guitar assignment and a quick check.
  1. The map (note names on the neck)
  2. Where chords come from
  3. Songs are numbers
  4. Rhythm
  5. Ears
  6. Riffing
  7. Any chord, anywhere
- **Neck**: any scale or chord across the fretboard, coloured by scale degree.
- **Keys**: the seven chords of any key, common progressions, and capo options.
- **Songs**: type in a song's chords and it finds the key, rewrites the chords as numbers, names the pattern and flags chords you don't know yet.
- **Jam**: a backing band in any key, with the safe notes shown and the current chord's notes ringed.
- **Train**: note finder, key-chord quiz, ear trainer and strum lab.

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
| `js/audio.js` | Plucked-string synthesis, drums, bass and the step sequencer. |
| `js/render.js` | SVG fretboard, chord boxes, strum grids. |
| `js/lessons.js` | The curriculum text and quiz data. |
| `js/core.js` | Saved state, routing, event handling. |
| `js/learn.js` | Today, Path and the lesson widgets. |
| `js/tools.js` | Neck, Keys and Songs. |
| `js/play.js` | Jam room and trainers. |
| `scripts/` | `dev.js` (local server), `build.js` (writes `dist/`), `wrap.js` (shared HTML wrapper). |

`index.html` deliberately has no `<html>`, `<head>` or `<body>` tags so the same file can be published as a Claude artifact. `scripts/wrap.js` adds them for local preview and for the deployed site.

## Deploying

Every push to `main` runs `.github/workflows/pages.yml`, which builds `dist/` and publishes it to GitHub Pages.
