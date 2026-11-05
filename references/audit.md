# Audit: changes, overlap, animation quality

Three gates every video passes before the full render, and again after every change. "Looks fine on the sheet" is not a
pass. Each gate has its own procedure, and you report its result to the user.

## 1. Change audit: every fix is re-verified, never assumed
A fix can break something else: a moved label lands on another label, or an edited kit component changes every shot
that uses it. After **any** change (script, captions, timing, a shot, a component, the mix):
1. **Log it.** Write one line per change in `review/changes.md`: what changed, why, which shots it touches. Count shared
   code: editing `kit.js` or another component module touches every shot that calls that component. Grep for its callers.
2. **Keep the previous sheet.** Before re-rendering, move `review/all.jpg` to `review/all-prev.jpg`.
3. **Re-run the pipeline steps the change affects**:
   - a script, caps or voice change → `voice.py`/`words.py` → `capture.mjs check` (CHECK OK) → `cues` → `mix.py`.
   - a timing or cue change → `cues` → `mix.py`.
   - a shot or component change → frames + sheet.
4. **Re-render the FULL contact sheet**, not only the fixed frame, and Read it. Compare it with `all-prev.jpg` shot by shot:
   only the intended shots should differ.
5. **Full-size check** of the fixed frames, the shots on both sides of each fixed shot, and every other shot that uses an
   edited component.
6. **Re-run the overlap audit (§2) and the animation bar (§3)** on every touched shot.
7. **Audit against the approved plan.** Every planned shot, reveal, re-hook, emotion and the ending is present, on its word.
8. Repeat until one complete pass finds nothing new. Then tell the user what changed, what the audit re-checked, and
   the result ("12 fixes; the full re-audit found 0 new issues").
Never say "fixed" for something you haven't re-rendered and looked at after the change.

## 2. Overlap audit: zero unintended overlap
**Rule:** no element covers, touches or crowds another unless they belong together in the story (a bar sitting on a scale
pan, a hand holding a prop, a tag pointing at its target).
Check each shot at full size at these moments: its first frame, every reveal, the moment of maximum camera punch or zoom,
and its last frame. For moving objects, check the **whole path**: `capture.mjs sheet review/shot.jpg 0.15 8` over
that shot's span (or `frames` at several times). Check every pair:
- **Text vs text:** labels, pills, numbers, stamps and captions never touch. Keep ≥ 24 px of clear space between them.
- **Text vs the thing it explains:** a label never crosses the line, face or object it describes. A "-30%" drawn across
  the chart line fails; move it into empty space.
- **Anything vs captions:** nothing important (faces, props, labels, reveals) enters the active style's caption zone
  while a caption shows. Body parts below the face may sit behind the caption.
- **Faces:** never covered by labels, arrows, bursts or particles. Arrows point near a subject, never into a head.
- **Frame edges and phone UI:** keep text and key objects in the **safe zone**: x 60-940 (the right side holds the
  like/share buttons), y 180-1520 (top: status bar and search; bottom: the description and audio bar). Captions keep the style's own caption
  box; everything else stays in the safe zone. Check this **at
  maximum punch-in or zoom**, because the camera crops the edges.
- **Particles and effects:** bursts, sparkles and speed lines never cover text or faces.
- **Transitions:** during the punch-in or flash nothing from the outgoing shot ghosts over the incoming one.
Fix by moving, resizing or retiming (stagger the entrance so two labels never share space at once). Then run the
change audit (§1).

## 3. Animation quality bar: it must feel cool, not just correct
Each shot needs:
- **One signature move:** a satisfying moment you'd stop scrolling for, landing on its word. Examples:
  - a chart line drawing itself with a glowing head and a burst at the peak.
  - one object morphing into another: a gold bar melts into coins, a coin flips into a globe.
  - a counter rolling up or down to a number.
  - kinetic typography, where the key word slams, stretches or shatters.
  - objects assembling from pieces, or a stack collapsing.
  - a zoom-through into the next scene.
  - a camera orbit or parallax with 2-3 depth layers.
  - a satisfying physics landing: squash, stretch and a settle.
- **Animation principles applied:**
  - anticipation before big actions (a small wind-up).
  - follow-through and overlapping action, where parts settle after the main body stops.
  - squash and stretch on impacts.
  - arcs, not straight lines, for anything thrown or swung.
  - staggered entrances: groups enter 60-120 ms apart, never all on one frame.
  - secondary motion: idle bob, blink, breathing, a gentle sway.
- **Timing ranges:**
  - pops: 0.2-0.35 s with overshoot (`eob`).
  - travel: 0.4-0.8 s eased (`eio`).
  - impacts: a quick slam plus a 2-4 frame shake.
  - text holds: ≥ 0.6 s on screen before it moves again, so it can be read.
  - **no linear tweens** for anything visible.
- **Depth:** a background that moves slower than the foreground (parallax), a light or shadow change on reveals, and a
  soft contact shadow under objects that land.
- **Variety:** don't use the same signature move in two consecutive shots, and give each shot a different entrance
  style from the one before it.
- **Banned:** a static layout with things merely fading in, everything popping in on the same frame, a slideshow feel,
  hard cuts and overlay transitions between scenes (glitch, white flash, iris: use a flow hand-off, references/flow-motion.md),
  and motion that has no reason (shaking or spinning that doesn't match the line or the emotion).
In the plan, write each shot's signature move next to its emotion (`S02 · shock · chart line dives, -30% slams + shake`).
In QA, name the signature move you saw in each shot. A shot without one is not done.
