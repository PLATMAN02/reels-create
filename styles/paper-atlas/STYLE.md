# Paper Atlas: history told in cut paper, 9:16

Storybook, curious, grand. Every shape is cut paper on aged parchment (a light paper edge and a soft drop shadow),
maps with crimson routes, gold date ribbons, wax seals, simple period figures, captions on torn paper strips.
Example: `example/` = **HOW ONE BAKERY BURNED DOWN LONDON** (1666; 41 s, 10 shots). Sheet: `style-sheet.png`.

## 1. Rules
- Everything is cut paper: draw shapes with `K.cut(pathFn, colour)` so they get the edge + shadow.
- **Crimson** only for routes, targets, fire and the key word; **gold** only for dates, crowns and seals.
- Maps first: where, then who, then what. A gold ribbon (`K.ribbon('1666', x, y, s)`) opens every new era.
- Night = the same parchment under a navy wash (`nightPage` in the example); day = parchment + pale sky.
- No battles or violence shown: tell it with objects, places and consequences (fire, smoke, rebuilt houses).
- Captions: Caladea serif on a torn paper strip, 2-4 words, one crimson word, y 1640 (auto-fit).
- Narration: `bm_george` (UK documentary). Music `"tension"` for disasters, `"bed"` for lighter history.
- Facts and numbers checked against museums, encyclopaedias or primary records, listed in `script.json` "sources".
  Don't put invented quotes on signs: paraphrase what happened instead.

## 2. Kit (`example/src/core/kit.js`, `import * as K`)
- Paper: `cut(path, fill, { shadow, edge })`, path helpers `P_rr, P_circ, P_poly`, `parchment(seed)`.
- Maps: `map({ highlight, route, labels })` (invented coastlines), `landPts(cx, cy, rx, ry, seed)`, `dashedRoute(pts, p)`,
  `compass`, `label(text, x, y, size)`. For a real place, draw a simplified outline in `shots.js` (see `londonMap`).
- People: `figure({ x, y, h, dir, role: 'king'│'queen'│'sailor'│'scholar'│'guard'│'merchant'│'worker', walk, arm })`.
- Places: `hall()`, `harbor(t, shipX)`, `ship(x, y, s, rot)`.
- Graphics: `ribbon`, `seal(x, y, s, letter)`, `timeline(labels, x, y, w, p, active)`, `slip(text, x, y, s, rot, size)`,
  `captionStrip`.
- The example adds `house`, `flame`, `smoke`, `wind`, `stPauls`, `oven` in `shots.js`.

## Motion graphics (`example/src/core/motion.js`, `import * as FX`)
Scene changes use flow hand-offs (see "Flow motion" below). Classic mode only (`"motion": "classic"`): `trans: { type: 'whip'|'whipV'|'slide'|'glitch'|'flash'|'iris'|'zoom', d, dir }`, centred on its
cut (add a `whoosh`/`zip`/`slam` cue at the cut), and never the same type twice in a row. `buildShots()` may also return
`kicks` (zoom punch + shake), `flashes` and `leaks` for the big words. Helpers: `FX.slamText`, `FX.slamWords`, `FX.swipe`,
`FX.strike`, `FX.scribble`, `FX.handArrow`, `FX.counter`, `FX.wobble`, `FX.squash`, `FX.blink`. Keep the style's palette in
every helper call. Full table and recipes: `references/motion-vocabulary.md`.

## 3. QA pitfalls we've hit
- Timeline or labels colliding with the caption strip → keep them above y 1450.
- Map labels unreadable under coloured marks → put them on a `slip`.


## Flow motion (mandatory: references/flow-motion.md)
The camera never cuts. Every scene change is a hand-off in `shot.trans` (`carry` · `portal` · `smoke` · `pass` · `dive`,
from `src/core/flow.js`), caused by something in the story and never the same type twice in a row. Inside a shot the
camera keeps travelling with `camPath: [{ t, x, y, z }, …]` on the shot. Let the light follow the story with `tod` (0 = midday, 0.5 = sunset, 1 = night).
`capture.mjs check` must print `flow motion: every cut is a designed hand-off`.
Good hand-offs in this style: riding a ship or rider along the crimson route, flying into a map pin, smoke from a battle or a fire, a paper fold or torn edge passing the lens, sunset for the turning point.
