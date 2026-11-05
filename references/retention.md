# Retention rules: hook, re-hooks, motion, emotion, follow ending

Viewers on Shorts, TikTok and Reels decide to swipe in the first second, and again every few seconds after that.
These rules apply to **every** video in **every** style. Plan them before writing shots, show them in the plan, and
check them in QA. Explicit user choices still win (for example "no CTA" or "slow, calm pacing").

## 1. The hook (0.0-1.5 s): no warm-up
- **Frame 0 is the hook image.** Set `"fade": false` in `script.json` so the video opens on a picture, not black. The
  first frame already shows the most striking thing in the video: the payoff, the danger, the strange object, the big number.
- **Voice starts at once.** Set `"lead": 0.1` (not 0.4). The first spoken line is at most ~1.5 s and 4-9 words.
- **The first caption is on screen from frame 0.** It's the hook in 1-3 words.
- **Movement starts on frame 0.** Something is already moving when the video opens: a camera push, a falling object or
  a character reacting. Never open on a still layout that animates in later.
- **Hook formulas** (pick one, never "Hi guys" or "In this video"):
  - stakes question: "What happens if you…?"
  - bold claim: "Gold just lost a third of its value."
  - payoff first: show the ending image, then "here's how it got there".
  - contradiction: "Everyone says X. It's the opposite."
  - countdown or promise: "Three reasons this keeps falling."
- The second line pays off the hook *partially* and opens a loop. Never answer the hook fully in the first 5 s.

## 2. A re-hook at least every 5 seconds
Every ≤ 5 s window of the video must contain **one re-hook**: a new reason to keep watching. Count from the first frame.
Mix two kinds:
- **Verbal re-hooks** (in the script): an open loop ("but that's not the scary part"), a numbered step ("Second,"),
  a surprise number, a myth bust ("Nope, total myth"), a twist ("But here's the twist:") or a question to the viewer.
- **Visual re-hooks** (in the shots): a new scene or world, a big scale jump (close-up ↔ wide), a reveal landing on its
  word, a character's big reaction, a colour or light shift, a counter or stamp slamming in, plus a sound hit (`slam`,
  `boing`, `pop`).
A plain cut alone is not a re-hook. A new label in the same scene is not one either. In the plan, list the re-hook
timestamps (estimated before voicing, then confirmed from `data/lines.json`). The longest gap between them must be ≤ 5 s.

## 3. Motion design: no dead frames
- **Every frame has meaningful motion.** At any instant something on screen is moving with intent: the camera, the
  subject, a prop or a graphic. Never more than ~0.7 s of a fully static picture (a deliberate freeze-frame is the only exception).
- **Every transition is designed, not just cut.** Use the style's cut motion (Inside Out, Stick Story and Paper Atlas
  punch in and flash automatically) and add a motion link per cut:
  - match cut: the same shape or position carries over from one shot to the next.
  - whip or slide: the outgoing motion direction continues into the next shot.
  - zoom-through: push into an object and come out inside the next scene.
  - The 3D styles (Deep Dive, Night File, Tall Tale) have no automatic punch: every shot must open with a camera move already underway.
- **Elements enter and exit with easing**: overshoot pops (`eob`) for labels, eased slides (`eio`) for travel, squash and
  stretch on landings and anticipation before big actions. Nothing appears or disappears in a single frame unless it's a
  hard comedic or shock cut.
- **Layered motion:** a primary action (what the line is about), a secondary motion (character reaction, wobble,
  particles) and the camera drift. Keep exactly one focal point per moment.
- **Cool, not just correct:** every shot has a signature move and follows the animation bar in references/audit.md §3.
- **Sound follows motion:** every entrance, landing and transition gets a soft cue (`whoosh`, `pop`, `thud`, `slide`).

## 4. Emotion design
- Give **every shot one intended emotion** in the plan: curiosity, surprise, shock, worry, relief, satisfaction or
  humour. Write it in the shot list (`S03 · worry`).
- Build an **emotional curve**: a hook (curiosity or shock) → rising tension → a surprise → a twist (worry or relief) →
  a satisfying payoff. Don't play the same emotion more than twice in a row.
- Show the emotion three ways at once: a **character reaction** (eyes, brows, mouth, body shake), **colour and light**
  (danger red, warm relief, dark tension) and **sound** (a rising alarm, a soft sparkle for relief, a `slam` for shock).
- Animate faces on the beat: the reaction lands on the word, not after it.

## 5. The ending: payoff, then follow
- The last narrated line stays a punchy payoff that loops back to the hook.
- Every video then ends with a **follow call to action**, spoken and shown:
  - **Spoken:** one short line after the payoff, ≤ 7 words, tied to the topic and promising more. "Follow for part
    two." "Follow so you don't miss the next one." "Follow, there's a crazier one coming." Put it in `script.json` as the final line.
  - **On screen:** an animated follow card in the style's look, with a pop-in, a pulsing button or arrow, and the
    user's handle if they gave one (ask in intake; without a handle, show "FOLLOW FOR MORE").
  - Keep the card clear of the caption zone (or let the CTA line be the caption) and hold it ≥ 1.2 s before the end.
- **Disclaimers** (finance, health) sit on the end card in small text. They never replace the CTA.
- The very last frame should sit close to frame 0 visually, so the loop replays smoothly.

## 6. Other modes
- **Own recording / voiceover-first (cartoon audio):** the recording sets the clock, so don't retime it. Ask the user
  to record the CTA line with the rest of the script. If the recording has no CTA, end with the animated follow card alone.
  Visual re-hooks every ≤ 5 s still apply. Verbal ones come from their script, so suggest them when you review it.
- **Long-form:** the same ≤ 5 s visual re-hook rule applies throughout. Each chapter opens with its own mini-hook and
  ends on an open loop into the next. Place the follow CTA once mid-video (after the first big payoff) and again at the end.

## 7. QA checklist (add to the normal section 4 QA)
Read the contact sheet against this list:
1. **Frame 0:** a hook image with motion and a caption, no black, voice at ≤ 0.15 s.
2. **Re-hooks:** list each one's timestamp from `lines.json`/`words.json`; the longest gap is ≤ 5 s.
3. **Dead frames:** no two consecutive sheet frames (0.5 s apart) are identical except during an intentional freeze.
4. **Transitions:** every cut has a designed motion link, not just a hard cut. Check the 3D styles especially.
5. **Emotion:** each shot shows its planned emotion on screen (face, colour, sound).
6. **Ending:** the payoff line, then a spoken follow CTA and an animated follow card held ≥ 1.2 s, with any disclaimer present.
Report the re-hook timestamps and the longest gap to the user along with the fixes.
