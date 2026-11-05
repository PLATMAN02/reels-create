# Motion vocabulary: transitions, camera kicks, kinetic type, numbers

Shorts feel premium when every beat has a designed move. This file is the toolbox, distilled from the kinetic-type,
data and illustrated motion-graphics libraries. Choose the move that fits the line and the emotion, never decoration.

## 1. The 2D engine (Inside Out, Stick Story, Paper Atlas): `src/core/motion.js`
Everything below is opt-in. A project that doesn't use it renders exactly as before (verified pixel-identical).

### Cut transitions: `trans` on a shot
```js
add({ id: 'S04', at: cut(3), trans: { type: 'whip', dir: 1, d: 0.28 }, cam: [540, 800], draw(lt) { … } });
cue(cut(3) - 0.14, 'whoosh');                    // the transition is centred on the cut: half before, half after
```
| type | feel | use it for | sound |
|---|---|---|---|
| `whip` (`dir` ±1) | fast motion-blurred pan | energy, "next point", lists | `whoosh` |
| `whipV` | vertical whip | falling or rising ideas, drops | `whoosh` / `slide` |
| `slide` | clean push, no blur | calm sequence, step to step | `slide` |
| `glitch` | RGB split and sliced rows | something wrong, a shock, a twist, a scam | `zip` + `thud` |
| `flash` | white flash swap | a reveal, a time jump, a big number | `slam` / `thud` |
| `iris` (`x`, `y`) | circle opens with a yellow ring | a new world, a zoom into a detail, the end card | `whoosh` |
| `zoom` (`x`, `y`) | push through the old shot into the new | going inside something (body, building, chart) | `whoosh` |
Rotate types: never use the same transition on two cuts in a row. Pick per meaning from the table. A shot without
`trans` keeps the style's automatic punch-in (and the white flash in Inside Out).

### Camera kicks, flashes and light leaks: returned from `buildShots()`
```js
return { shots: S, cues: CUES,
  kicks:   [{ t: Wd('thirty', 1), a: 0.08, shake: 14 }],   // zoom punch (0.03-0.12) + shake (px), film time
  flashes: [{ t: Wd('thirty', 1), a: 0.35 }, { t: Wd('losses', 9), a: 0.3, col: '214,40,57' }],  // white or red flash
  leaks:   [Wd('thirty', 1)] };                             // warm light leak sweeping across, for the BIG moments only
```
Kick the hardest words: the number, the myth bust, the twist. Use 1-2 kicks per 5 s at most, and a bigger one
for the single biggest moment. Pair each kick with a `slam` or `thud` cue at the same time.

### Helpers (`import * as FX from './core/motion.js'`)
| helper | what it does |
|---|---|
| `FX.slamText(text, x, y, size, lt, t0, {color, rot, from, dur})` | word slams in big and blurred, settles with an expo ease |
| `FX.slamWords(['WHY','*FALLING'], x, y, size, lt, t0, stagger)` | words slam one by one; `*` = yellow |
| `FX.swipe(x, y, w, h, lt, t0, dur, color)` | highlighter swipe behind a word (draw it BEFORE the word) |
| `FX.strike(x0, x1, y, p)` | red strike-through drawn on: the wrong idea or a myth |
| `FX.scribble(cx, cy, rx, ry, p, col)` | hand-drawn circle around the thing that matters |
| `FX.handArrow(p0, ctrl, p1, p, col)` | hand-drawn curved arrow pointing at it |
| `FX.counter(x, y, size, lt, t0, t1, from, to, {pre, suf, step})` | rolling number that LOCKS with a bump at t1 |
| `FX.countAt(...)`, `FX.fmt(n, pre, suf)` | the counter value / formatting for your own drawing |
| `FX.wobble(lt, a)`, `FX.squash(lt, a)` | decaying jiggle / squash and stretch after a landing |
| `FX.blink(lt, off, period)` | eye-blink amount, for characters that feel alive |
| `FX.outExpo`, `FX.inExpo`, `FX.nz(x, seed)` | snappy easings and smooth deterministic noise |

## 2. The 3D styles (Deep Dive, Night File, Tall Tale)
No layer compositing here, so the camera carries the motion: every shot opens with a camera move already underway (a
dolly, an orbit, a crane or a whip-pan into a new angle). Put kicks and flashes in the 2D layer on top. Use
match cuts by placing the same shape at the same screen spot across the cut. Port a helper from `motion.js` into the
style's 2D overlay only when the overlay needs it (labels, counters, strikes).

## 3. Recipes: the signature moves
- **Number reveal:** a counter rolls 0.5-0.8 s → locks on the word → kick (0.08) + flash + `slam` → the label pops 0.15 s later.
- **Myth bust:** the claim slams in white → beat → strike or red X draws on → glitch cut to the truth.
- **Emphasis word:** a highlighter swipe draws (0.3 s) → the word slams over it → a small kick.
- **Point at it:** a scribble circle (0.4 s) plus a hand arrow from the caption side, never covering the face.
- **Twist:** a hold of 0.3 s with near-silence → glitch or flash → a new colour world (red tint for danger, warm for relief).
- **List or steps:** a numbered badge pops with overshoot, a whip into each step in alternating directions, and the same layout reused (a match cut).
- **Chart:** the line draws itself with a glowing head, milestone dots pop as it passes, then the key segment is re-traced or circled.
- **End card:** an iris opens on the follow card, the button pulses (scale 1 ± 0.04 at 2 Hz), and the handle slams in.

## 4. Pace inside a shot
Something new happens every 0.5-1.5 s inside a shot: a word, a pop, a draw-on or a reaction. Text the viewer
must read holds ≥ 0.6 s before it moves again. Leave a moment of near-silence and stillness (0.2-0.4 s) before the
single biggest hit, because contrast makes it land.

## 5. Determinism and speed
Every frame is a pure function of t. The capture tool renders frames out of order, so use `rnd(i)` or `FX.nz()`,
never `Math.random`, and keep no state between frames. Transitions paint two shots into offscreen layers, so keep each
shot's `draw` fast (well under 50 ms).
