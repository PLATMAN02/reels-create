---
name: faceless-shorts
description: Create code-rendered faceless shorts and animated cartoon stories with six visual styles, local AI narration or a supplied voiceover, music and sound effects, built for retention (hook on frame 0, re-hooks every 5 s, flow-motion camera that follows the action from scene to scene with no hard cuts, follow call to action) and self-audited before delivery. Use for narrated Shorts, TikToks, Reels, what-if or what-happens-if explainers, Zack D. Films-style 3D explainers, money and data explainers, mystery or true-crime shorts, stick-figure survival stories, history shorts, funny true stories, voiceover-driven cartoon videos, and chapter-based long-form versions of these styles, even from just a topic.
---

# Faceless Shorts

You make a finished vertical short from a topic: script, voice, word-synced captions, animated shots, sound and
music, rendered to MP4. **Everything is code**: canvas drawing, headless Chrome capture, ffmpeg, a local Kokoro voice,
local Whisper word timing, numpy sound. No AI images or video in the film, no API keys, no credits (the one opt-in
exception is Codex thumbnail art, §5).
`SKILL` = the folder this file is in, normally `~/.claude/skills/faceless-shorts` (use that absolute path in every
Bash command; shell state does not persist between calls, so don't rely on an exported variable). Use
`work/<video-name>/` under the current working directory for projects, with `new_video.sh --dir "$PWD/work"`; use a
user-chosen destination when supplied. Keep deliverables (MP4, share copy, cover) in the working directory's `output/`
folder. The runtime (Python env + models) lives in `~/.faceless-shorts` by default; `FACELESS_HOME` can point elsewhere.
Do not repurpose HOME.

**Retention is mandatory in every video, every style:** a hook on frame 0, a re-hook at least every 5 s, motion in every
frame and every transition, a planned emotion per shot, and a follow call to action at the end. Read
[references/retention.md](references/retention.md) before planning any video, and apply it in the plan, the build and QA.
**Every video also passes the three gates in [references/audit.md](references/audit.md):** a change audit after every
fix (log it, re-render the full sheet, compare with the previous one, re-check neighbours and shared components), zero
unintended overlap (text, faces, captions, frame edges and the phone safe zone, checked at maximum zoom), and an
animation quality bar (a signature move per shot, real animation principles, no linear tweens, no slideshow feel).
**Flow motion is the only motion style, in all six styles: read [references/flow-motion.md](references/flow-motion.md)
before planning shots.** The camera never cuts. It follows the thing that moves (a thrown coin, a fired ball, a walking
character) from one place into the next. When a scene must change, the world hides it with a hand-off (`trans`):
`carry`, `portal` (fly through a door, window, screen or hole), `smoke` (smoke, dust, foam), `pass` (something close to
the lens sweeps across) or `dive` (dolly forward through the shot). The camera eases out onto a reacting face, and the
light moves day → sunset → night with the story (`tod`). There are no glitch, flash or iris overlays.
`capture.mjs check` replaces any hard cut with an automatic hand-off and lists it, so design a real one for each.
Only `"motion": "classic"` in `script.json`, used when the user asks, restores the old transitions.
Hand-offs and paths live in `src/core/flow.js` (all styles) and `src/core/flow3d.js` (3D camera paths and chase cameras).
**The in-shot motion toolbox is [references/motion-vocabulary.md](references/motion-vocabulary.md):** camera kicks,
impact flashes and light leaks, kinetic type (slams, highlighter swipes, strikes, hand-drawn circles and arrows), rolling
counters, and recipes for each signature move (`src/core/motion.js` in the 2D styles).

**Claude Code notes.**
- Look at images with the **Read** tool (it displays PNG/JPG). Every "look at the sheet / key frame" step below means
  Read the file; never claim a frame was checked without reading it.
- Run anything that takes more than ~2 minutes (setup downloads, full renders, software-GL renders) with Bash
  `run_in_background: true`; you are notified when it exits, so don't poll or sleep. Foreground Bash is capped at 10 min.
- Track the build steps (script, timing, shots, QA, render, deliver) on the task list.
- Intake questions and the "Build it?" gate may use AskUserQuestion when the choices are discrete; otherwise ask in chat.
- Paths with spaces must be quoted. Run project commands with `cd "<proj>" && ...` in the same Bash call.

## Choose the workflow
- **Standard short:** use the six styles and the workflow below. Style-specific caption rules override the generic QA examples.
- **Cartoon audio short / voiceover-first cartoon:** read [references/cartoon-audio.md](references/cartoon-audio.md).
  This integrates the supplied cartoon-audio-short instructions using the installed Tall Tale engine. It defaults to
  captions off, untouched voice timing, and a measured half-level soundtrack. This is a workflow, not a seventh bundled style.
- **Long-form, including eight minutes:** also read [references/long-form.md](references/long-form.md).
  Plan chapters and render checked sections. Current templates are vertical; landscape requires a layout adaptation first.

Explicit user choices win over mode defaults. Existing approvals remain valid; do not repeat a plan approval already given.
For a new standard-short plan, show the review before building as below. In voiceover-first mode, a supplied recording
and a request to build authorize the build: show the preview sheet, then continue without a second permission question.

| style | what it makes | length · aspect |
|---|---|---|
| **Deep Dive 3D** `deep-dive` | the flagship, Zack D. Films-like: sculpted 3D people in sunlit sets, glowing x-ray bodies, camera journeys through blood vessels, shallow focus. "What happens if…?" body and science | 30-45 s · 9:16 |
| **Night File 3D** `night-file` | unsolved mysteries / true crime: dark 3D places with one light, faceless people (the subject glows red), typewriter dates, case-file inserts | 30-45 s · 9:16 |
| **Inside Out** `inside-out` | flat 2D "What happens if…?" explainer: a simple hero, x-ray cutaways, bold 1-3 word captions, punchy cuts | 25-40 s · 9:16 |
| **Stick Story** `stick-story` | "What would you do if…?" survival steps: stick people with acting eyes, flat rooms day/night, gold step cards | 30-45 s · 9:16 |
| **Paper Atlas** `paper-atlas` | history in cut paper: parchment maps, crimson routes, gold date ribbons, period figures | 30-45 s · 9:16 |
| **Tall Tale 3D** `tall-tale` | funny true stories: flat 2D cartoon people (big round heads, ink outlines) acting in a sunny 3D small-town world, camera always moving, one-word captions | 40-60 s · 9:16 |

Which style: body / health / science "what happens if" → **Deep Dive 3D** (or **Inside Out** for a lighter, faster 2D
look) · creepy, unexplained, true crime, "this happened in 1971" → **Night File 3D** · survival, life hacks, "here's what
you do" → **Stick Story** · a historical event, "how X happened" → **Paper Atlas** · a funny or clever true story, a con, a loophole, "this guy did X" → **Tall Tale 3D** · money, markets, economy, data
("why X keeps falling") → **Inside Out** with chart, counter and money components built in its flat look. If it isn't obvious, ask once.

Each style = `styles/<style>/style-sheet.png` (the look in one image, drawn by the style's own code) + `STYLE.md` (the rules + the engine manual) +
`example/` (a complete project that renders as-is). **Read the style's STYLE.md in full before planning.**

## 0. Check the required tools
Use an existing working runtime (`~/.faceless-shorts/venv`). On first use, run `bash SKILL/scripts/setup.sh` in the
background (Node 22+, ffmpeg/ffprobe, Chrome, Python, Kokoro and Whisper; on macOS missing tools install with `brew`,
which you should offer rather than run unasked). Downloads are free (~0.9 GB); tell the user before starting them.
Use `setup.sh --no-models` for captions-only work, or `setup.sh --no-voice` for a supplied recording; these skip the unused model downloads.
The broad `scripts/selftest.sh` is an optional all-style diagnostic, not a prerequisite for every video; inspect its output
location first because the original script replaces its own `_selftest` directory. Validate the selected project's
`capture.mjs check`, soundtrack, contact sheets and a short sample render before the full render.

## 1. Intake (ONE message, defaults filled in)
Ask only what's unknown, all at once: topic (or "you pick 3 ideas"), a link to a short whose format they like (optional),
length (default ~30 s), voice (`SKILL/scripts/py SKILL/scripts/voice.py --list`; offer the user's favourites first: `af_heart`, `am_puck`, `af_bella`, `bf_isabella`; default `af_heart`, or `am_puck` for playful topics), voiceover mode:
**AI voice** (default) · **their own recording** (they record after seeing the script; `words.py --audio`) ·
**captions-only** (no voice yet; `estimate.py`), music (built-in bed · none · their own royalty-free file), their
handle for the follow card (optional; without it the card says "FOLLOW FOR MORE"). The follow CTA is always included unless they say no.
"Just go" = the defaults. Do not ask for details already supplied or block on optional preferences. If audio is attached,
use it and ask for the final transcript only if alignment cannot otherwise be resolved. Cartoon audio mode has its own intake.

## 2. The plan (ONE screen, then wait)
Show: title · **the hook** (frame-0 image plus the first line) · the full narration, one line per cut, with its caption
chunks (`WHAT IF *YOU | SWALLOW *GUM?`) · the shot list, one line each (what we see, what moves, which word it lands on,
**the camera hand-off into it** (what carries the camera there: `carry`/`portal`/`smoke`/`pass`/`dive`, and its cause in the story), **its emotion**, **its signature move**) · **the re-hook timeline** (each re-hook's estimated time and type; longest gap ≤ 5 s)
· **the ending** (payoff line, spoken follow CTA, follow card) · new components you'll add to the kit, if any · facts and
their sources. Ask **"Build it?"** and wait.

**Script rules.** Write it the way a person actually talks to a friend: full, flowing sentences with connecting words
("Well,", "where", "but", "so", "which means"), not a list of short caption-like statements. ~90-110 words for 35 s.
**A line is a CUT, not a sentence**: split each sentence into 1-3 lines at natural pauses (commas, "and", "where"), so
the picture changes every 1.5-3.5 s while the voice keeps flowing (voice.py speaks each whole sentence in one pass).
Shape: a hook in the first ~1.5 s (no warm-up, no "in this video"), then escalation with a verbal re-hook (open loop,
numbered step, surprise, myth bust) at least every 5 s, a twist ("but if you…"), a punchy payoff line that loops, then
a short spoken follow CTA (≤ 7 words, e.g. "Follow for part two."). Use `"fade": false` and `"lead": 0.1` so the hook
plays from frame 0. See references/retention.md.
Write numbers as they're said ("seven"). Read it out loud in your head: if it sounds like captions, rewrite it.
**Taste rules (the user's defaults).**
- Every graphic must communicate something (a number, a comparison, a process, a myth, a before/after). Never add decoration for its own sake.
- On-screen words are short (2-6 words) and match what's said.
- Never put a small coloured tag or label *above* a title or heading. Supporting text goes below or beside it.
- **Phone sizes at 1080×1920:** statement text ≥ 90 px, any label the story depends on ≥ 40 px, key numbers ≥ 150 px.
- **Data honesty:** use real, sourced numbers, plot charts to scale, and never crop an axis to exaggerate. Data shots carry a
  small "Source: …" line (inside the safe zone, clear of captions). A shape that only shows a trend is labelled
  "illustrative". If you can't verify a number, ask instead of guessing.
- **No real brands:** no real logos, brand names or real people's likenesses, and no mockup that could pass as a real
  receipt, message or bank statement. Use invented, generic names.
- **Sound taste:**
  - one sound per visual event that deserves one, never more than 2-3 at once.
  - no chimes, bells, pings or high-pitched game sounds. Use `sparkle` rarely and quietly.
  - a moment of near-silence before the biggest hit.
  - counter ticks only when the shown number changes, ≤ 12 per second.
  - every sound time comes from the same word times as the picture.
Original writing only: take a format you like, never another creator's script or shots. Every fact is checked against a
reliable source (list them in `script.json` "sources"). Health topics: accurate, no gore, no scary misinformation.

## 3. Build
1. `bash SKILL/scripts/new_video.sh <style> <short-name> --dir "$PWD/work"` copies the example to a new project.
2. Write `script.json` (lines + caps + gaps; see STYLE.md).
3. Timing: `SKILL/scripts/py SKILL/scripts/voice.py <proj>` then `SKILL/scripts/py SKILL/scripts/words.py <proj>`
   (own recording: `words.py <proj> --audio their.m4a`; captions-only: `estimate.py <proj>`).
4. Rewrite `src/shots.js`: one shot per line (or two for long lines), each placed with `cut(i)` and its key moments on
   words with `Wd('word', line)`. Every shot opens already moving and enters through a designed **flow hand-off** (`trans`: `carry`, `portal`, `smoke`,
   `pass`, `dive`, with a cause in the story, never the same type twice in a row; references/flow-motion.md). It has a
   camera that keeps travelling (`camPath` in 2D, `pathCam`/`followCam` in 3D), layered motion, and its emotion shown on a
   face, in colour and in sound. The last shot is an animated follow card, or a loop ending if the user chose one.
   Return `kicks`/`flashes`/`leaks` for the big words (2D) and use the `FX` helpers from `src/core/motion.js`
   (references/motion-vocabulary.md). Reuse the selected style's engine modules (`src/core/kit.js` for 2D, or its 3D world/character modules); add components in that style's look.
5. In the project: `node tools/capture.mjs check` (must say CHECK OK, and `flow motion: every cut is a designed hand-off`) → `node tools/capture.mjs cues` →
   `SKILL/scripts/py tools/mix.py .` → QA (section 4) → `node tools/capture.mjs video renders/<name>.mp4`.
   Iterating on one shot: `node tools/capture.mjs frames review/f "4.2,4.6"` and look.

## 4. QA: never show a frame you haven't looked at
`node tools/capture.mjs sheet review/all.jpg 0.5 10` (a frame every 0.5 s, time-stamped) and read the whole sheet, then key
frames full size. For every frame ask:
- **Does it make sense?** One visual mode per shot: if the body is x-ray, ALL of it is x-ray (no shirt sleeves on an x-ray
  body). Props move with whatever holds them (gum stays in the hand until the hand reaches the mouth). Nothing appears before
  its cause.
- **Does it match the narration at that moment?** The picture changes just before its line; reveals land on their word.
- **Is anything colliding?** Run the zero-overlap audit (references/audit.md §2) on every shot: text vs text, labels vs
  what they describe, anything vs the caption zone, faces, particles, frame edges and the phone safe zone (x 60-940,
  y 180-1520; captions keep the style's caption box) at maximum punch-in, and the whole path of every moving object. Paper Atlas and Tall Tale use different caption zones.
- **Does it flow?** (references/flow-motion.md §5) Render 3 frames through every hand-off and read them. The camera
  should carry through, nothing important should be hidden under smoke or a passing object, and no type should repeat on consecutive cuts.
- **Is it cool?** Apply the animation bar (references/audit.md §3): name each shot's signature move, and check for
  anticipation, follow-through, staggered entrances, eased timing and parallax. A shot that only fades or pops things in isn't done.
- **Captions:** follow the selected STYLE.md (Paper Atlas uses crimson on paper; Tall Tale uses unhighlighted words). If `"captions": false`, no captions should render. Check spelling, timing and phone readability.
- **Style sheet:** use the chosen style's palette, materials and geometry. X-ray conventions apply only to x-ray shots. Confirm that labels inherited from examples fit this story.
- **Sound:** voice clear over the music; effects soft (no harsh ticks or beeps); the sound taste rules hold (≤ 2-3 at once, no chimes or pings, near-silence before the biggest hit).
- **Retention** (references/retention.md §7): a hook on frame 0 with no black, a re-hook every ≤ 5 s (list the timestamps
  and the longest gap), no static stretches > 0.7 s, every cut has a motion link, each shot shows its emotion, and the
  ending has the spoken CTA plus a follow card held ≥ 1.2 s. Report the re-hook gaps to the user.
Every fix goes through the change audit (references/audit.md §1): log it in `review/changes.md`, keep the old sheet as
`all-prev.jpg`, re-run the pipeline steps the fix affects, re-render and Read the FULL sheet, check neighbouring shots and
every shot that uses an edited component at full size, re-run the overlap and animation checks, and confirm the approved plan
is still delivered. Repeat until a full pass finds nothing new. Tell the user what you caught, what you fixed and what the
re-audit found. For voiceover-first work, send the inspected
preview sheet before the full render and continue. Never imply that reviewing sampled frames means watching every frame.

Optional `script.json` controls supported by all six new-project templates:
- `"captions": false` disables caption drawing and the caption list; omission preserves the style default.
- `"fade": false` starts on the hook image and removes automatic start/end black fades.
- `"audio_mode": "voice_locked"` selects the optional mixer described in the cartoon-audio reference.
- `"voice_source": "audio/voice.mp3"` selects the original recording for that mix. Paths are relative to the project.

Keep stock mixers for ordinary shorts. The `voice_locked` path uses the original recording for sound and the mono alignment
copy only for timing; it writes measured results to `data/audio-report.json`.

## 5. Deliver
Open the MP4 for the user (`open <file>` on macOS; the desktop app can also show it via SendUserFile). Also give: a share copy if > 35 MB (`ffmpeg -i in.mp4 -c:v libx264 -crf 21 -preset slow -c:a aac
-b:a 160k -movflags +faststart share.mp4`), a thumbnail (below), a title, a caption and 5-8 hashtags.
Before delivering, normalize loudness to **-14 LUFS** for YouTube, TikTok and Reels (TP=-2 leaves room for the AAC
encode; -1.5 measured -1.4 dB true peak after encoding):
`ffmpeg -i renders/<name>.mp4 -c:v copy -af loudnorm=I=-14:TP=-2:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart output/<name>.mp4`.
Skip this for `voice_locked` mixes unless the user asks, because their levels are measured on purpose. Check the result
with `ffmpeg -i output/<name>.mp4 -af ebur128 -f null -` (integrated ≈ -14 LUFS, true peak ≤ -1.5 dB).
For own-recording mode, also give them the script with each line's timing to read against. Offer one round of precise changes
and re-render only what changed.

**Thumbnail** (every video): `bash SKILL/scripts/thumbnail.sh <proj> "WHY INDIA|*NEVER LOSES|TO PAKISTAN" "<scene>"`
→ `output/thumbnail.jpg`, 1080×1920. `|` starts a new title line and `*` makes a word yellow. Write the title as a curiosity
gap of 2-4 words per line, and never just the video title repeated. The script works in two modes:
- **Codex art (preferred when available):** if the OpenAI Codex CLI is installed, logged in, and `codex features list` shows
  `image_generation … true`, the script runs `codex exec` with a key frame attached as the style reference. It asks for
  1024×1536 art with no text, no logos, no flags and no real people, and with plain space in the top 35 % for the title.
  Describe the scene as the video's payoff moment, in its own characters and colours: who reacts, what just happened,
  and where. Codex runs on the user's ChatGPT/Codex plan, so **offer it and run it only after the user says yes**. The
  generation takes about a minute. The prompt, the art and `codex.log` are kept in `<proj>/thumb/`.
- **Fallback, or with `--no-codex`:** a frame of the video, rendered without captions (the script turns them off for that one
  frame and then restores `script.json`), with a dark scrim behind the title. Pick the frame with `--frame <t>`.
- **Either way, the title is drawn in code** (`scripts/thumbnail.mjs`, Inter Black in the caption look), so it is always
  spelled right. Never let the image model draw text.
- **Read the thumbnail before delivering:** check that the art has no stray text, logos, extra limbs or real likenesses, and
  that the title is readable at phone-grid size. If the art is wrong, run again with a sharper scene description, or fall
  back to `--no-codex`.

## 5b. Publish only when asked
Read [references/publishing.md](references/publishing.md) when the user requests an upload. Discover the actual connected
tools and their current schemas (MCP connectors via ToolSearch, or `composio search` if the Composio CLI is connected). Rendering a video does not authorize uploading it or putting it on a public file host.

## Adding a new style (when the user asks)
Make `styles/<new-style>/` with `style-sheet.png`, `STYLE.md` (same sections as Inside Out: look rules, palette, format,
engine/kit map, components, shot anatomy, cue types, QA pitfalls) and a complete `example/`. Copy Inside Out's
`tools/`, `index.html`, `src/main.js`, `src/core/{lib,timing,captions,motion}.js`, then build the new look's kit and shots. The
shared scripts (voice, words, estimate, new_video, selftest) work unchanged. Add a row to the table above and validate the new style plus any changed shared behavior. Do not list a style as bundled until its assets and working example exist.

## 3D styles (Deep Dive, Night File, Tall Tale)
They render real 3D with three.js in headless Chrome. With a graphics card it's fast and full quality. Without one
(a laptop without GPU acceleration, a cloud sandbox) render with `SOFTWARE_GL=1 QS='&res=0.6&aa=0&shadow=1024'
FPS=24` in front of `node tools/capture.mjs ...` (≈2 s per frame; tell the user the render time up front, run it in the
background, and QA with `sheet review/all.jpg 1 10` first). Their STYLE.md files list the 3D API.

## Never
Generate images or video with AI for the video itself (the only AI image is the optional Codex thumbnail art in §5, made
after the user says yes); spend the user's money or credits; upload to YouTube or any host without the user asking and confirming; copy another creator's script, shots or frames;
overwrite a user's project without asking; deliver unreviewed previews or claim a pipeline was tested when it was only described.
