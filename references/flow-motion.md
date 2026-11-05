# Flow motion: the camera never cuts

**This is the only motion style for every video, in all six styles.** It's modeled on the story-cartoon shorts that hold
viewers for a full minute: *Levels of Pirate Cannonballs* (8.9M views), *Why Perfect Railroads Don't Work* (21M) and
*Why the Second Draw Always Wins* (8.1M), all by @RicksClips3000. We studied them frame by frame at 0.1 s; never copy
their stories, characters or shots, only the craft.

What the viewer feels: one unbroken camera that **follows the action from place to place**. A cannonball is fired, and
the camera swings past the barrel, rides behind the ball over the water, punches through the enemy hull and eases to a
stop on a pirate inside, who reacts. There is no cut anywhere in that run. When a cut is needed, the world hides it:
cannon smoke fills the lens, a ship's hull slides past right in front of the camera, or the camera flies through a
door, window or barrel.

`script.json` `"motion"` defaults to flow. `"motion": "classic"` brings back the old graphic transitions, but only when
the user asks for it.

## 1. The four laws
1. **Hand off, don't cut.** Every scene change is caused by something in the scene: an object that carries the camera,
   smoke or dust, something passing close to the lens, or an opening the camera flies through. Plan the hand-off when
   you plan the shot, so the end of shot A sets up the start of shot B.
2. **Follow the thing that moves.** If something is thrown, fired, dropped, rolled, mailed or walked somewhere, the
   camera goes with it. Thrown things travel in arcs (`FLOW.arc`, `ballistic`), never in straight lines.
3. **Fast in travel, soft on arrival.** The camera keeps its speed through a hand-off (speed streaks, motion blur), then
   eases out and lands on a face reacting. Hold for at least 0.5 s so the reaction reads, then move on.
4. **No overlays.** No glitch, white flash, iris or slideshow fade between scenes. A flash on an impact *inside* a
   shot is fine. A flash used *as the cut* is not. `capture.mjs check` replaces any overlay or hard cut with an
   automatic world wipe and lists it under "flow motion:". Before rendering, that list should say *every cut is a
   designed hand-off*.

## 2. The hand-off toolbox: `shot.trans` (all six styles, `src/core/flow.js`)
Each hand-off is centred on the cut: half of it plays before the cut and half after. Give it a sound (`whoosh` for
travel, `thud` or `slam` for an impact, `bubbles` for soap or steam).

| type | what happens on screen | use it when | key options |
|---|---|---|---|
| `carry` | both places slide past as the camera rides along with an object drawn on top | a coin, ball, letter, bird, paper plane or vehicle goes from A to B | `dir ±1`, `axis 'x'/'y'`, `carry(ctx, u)` draws the object in screen space |
| `portal` | the camera flies into a hole, which grows until it fills the frame with B inside | a door, window, screen, porthole, mouth, barrel, a hole punched in a wall, a speech bubble | `x, y` (the hole's position in A at the cut), `r`, `hole 'circle'/'rect'`, `aspect`, `edge 'splinter'/'frame'/'none'`, `col` |
| `smoke` | smoke, dust, steam, foam or a cloud billows over the lens, then parts on the new place | a cannon fires, a box tips, a car is washed, a kettle boils, a crash, a magic poof | `x, y` (where it billows from), `col`, `shade`, `d` (0.4-0.55) |
| `pass` | something very close to the lens sweeps across, with the new place revealed behind it | the camera tracks past a post, a pillar, a hull, a hedge, a wall edge, a passer-by or a falling blind | `dir ±1`, `axis 'x'/'y'`, `shape 'post'/'hull'/'wall'/'foliage'`, `col`, `w` |
| `dive` | the camera dollies forward *through* the shot into the next | going inside a thing (a body, a head, a building, a tile, a number), a push-in on the reveal | `x, y` (the vanishing point: aim it at the thing you go into) |

Rules: never use the same hand-off twice in a row, and give it a reason in the story. In the plan, write it as
`→ S05 · smoke: dust from the tipped box`. The time a hand-off covers is screen time, so don't hide a key reveal or
a step card under it.

## 3. Inside the shot: a camera that never parks
- **2D styles:** `camPath: [{ t, x, y, z }, …]` on a shot replaces the fixed `cam` and `zoom`. Moves between keys are
  eased. Use it for a crane-down, a track-along or a push-in toward the next hand-off.
  ```js
  add({ id: 'S04', at: st, camPath: [{ t: 0, x: 600, y: 980, z: 1.1 }, { t: 0.9, x: 540, y: 1000, z: 1.0 }, { t: 2.2, x: 690, y: 1180, z: 1.14 }],
        trans: { type: 'dive', x: 260, y: 440 }, draw(lt, d, t) { … } });
  ```
- **3D styles:** `import { pathCam, followCam, ballistic } from './core/flow3d.js'`.
  - `pathCam(cam, [p0, p1, p2…], lookTargetOrPath, k, { ease })` puts the camera on a smooth spline. Pass `ease: 0.4`
    at the end of a shot that hands off, so it still has speed at the cut.
  - `followCam(cam, objPos, objVel, { back, up, side, ahead })` is a chase camera behind a moving object.
  - `ballistic(a, b, h, k)` gives the arc of a thrown or fired object, so the camera and the object share one path.
- **Speed streaks:** `FLOW.streaks(ctx, amount, { mode: 'radial'|'x'|'y', x, y, t })` during fast travel.
- **Time of day moves with the story:** `tod: 0..1` on a shot (a number or `(lt, d) => k`), where 0 is midday, 0.5 is
  sunset and 1 is night. For example, a calm day setup, a sunset for the turn and night for the danger, or
  day → sunset for a happy payoff.

## 3b. True 3D staging (3D styles)
Flow motion only works if the world is really 3D. Give people headings so that the camera can see their backs and sides
(`toon.heading`, `toon.lookAt3`). Use over-the-shoulder views that swing round to the face, and orbits, cranes and top-down
rises. Never use a flat pan across a row of people facing the lens. See references/audit.md §0b.

## 4. Planning a flow video
In the shot list, add a **camera path** column next to the emotion and the signature move:
`S06 · satisfaction · SOLD stamp + coin burst · cam: rides a coin out of the phone → carry to the hallway (S07)`.
Before writing any shots, walk the chain out loud: *what carries us from each place to the next?* If nothing does,
add a cause (an object, a puff of dust, a doorway), or keep the camera in the same place and move it along a path instead.

## 5. QA (add to references/audit.md)
- `capture.mjs check` prints `flow motion: every cut is a designed hand-off`, with no `auto` entries left.
- Render 3 frames through every hand-off (at −0.28 d, 0, +0.28 d) and read them:
  - nothing in the outgoing shot hides a caption
  - the hand-off lands on a readable composition
  - no step card, reveal or face is hidden under smoke or a passing object
  - no hand-off type repeats on consecutive cuts
- On the contact sheet, no 0.5 s frame should look like a hard jump from the one before it, unless it's a deliberate shock cut.
