# Cartoon audio mode

Use for a cartoon short driven by the user's recording, or an explicit request for the cartoon-audio-short workflow.
Default: original 2D bean-head characters in a colourful painted 3D world, 1080×1920, 30 fps, captions off, duration
matched to the voice within one video frame. Prefer Tall Tale unless the user chose another bundled style.

## What is actually installed

The user supplied a text specification for cartoon-audio-short, not its `kit/`. This installation has the six original
Faceless Shorts engines, including Tall Tale's 2D character cards, painted 3D sets, shadows and depth of field. Use those
real APIs. Do not claim the separate kit, toon.ts Pen library, normal/depth ink pass, DP silence aligner, `timing.py`,
`render.mjs`, `finish.sh`, or a worked Soldier example are bundled. No filesystem-wide search, repository clone or new
service is needed to use the installed fallback. If the user specifically requires that missing kit's exact renderer,
explain the missing asset and request it; do not silently claim a matching implementation.

Read `styles/tall-tale/STYLE.md` and inspect its example before building. In this mode, these rules override its defaults:
- No captions unless requested; set `"captions": false`. Legible story-world text is allowed and must not be mirrored.
- Set `"fade": false`: frame zero already shows the hook. A purposeful time-jump flash is separate from an automatic black fade.
- Original stories, characters and shots. No shot-for-shot copies, named living-person characters, brand mascots or logos.
  These cast restrictions belong to this cartoon mode, not to all explainers in the skill.
- Documented events, disputed accounts and folklore must be identified accurately. Verify claims with primary or reliable
  sources before calling a story true. Fiction is allowed when requested and labelled. No graphic or political stories.
- Keep the original voice file unchanged. Do not trim silence, regenerate, change pitch/speed, insert pauses or move words.
  Use the mono analysis copy for alignment and the original recording for the soundtrack. One shared linear output gain
  is allowed; the supplied voice's delivery and dynamics remain intact.
- Picture reacts on or zero to three frames before the relevant word. ASR timing is an estimate: inspect difficult reveals.

## Enter at the user's actual stage

Audio attached → build stage. If the transcript is supplied, preserve its final wording. If absent, transcribe locally,
then align; ask for the final transcript only if the recording cannot be aligned reliably. A request to build plus audio
is sufficient authorization to proceed through preview, rendering and delivery.

Script supplied without audio → retain the story, tighten only if requested/needed and show proposed wording changes.
Give recording tips and wait for the file. If the user chooses local AI narration instead, use the existing Kokoro path;
do not require an external paid voice service.

Ideas requested → offer exactly ten numbered ideas, then wait for a number or “more.” Each includes a five-to-eight-word
title, first spoken hook, ironic payoff, two or three visual moments, and whether it is documented, disputed, folklore or
fiction. Vary eras/themes while staying within the requested subject. A user who already supplied a topic skips this stage.

If no starting point can be inferred, ask once whether they have audio, a script, or need ideas, and include the target
length in the same intake. Default twenty to thirty seconds; forty-five to sixty is fine. Longer work uses long-form.md.

## Script and recording

Open with the surprising fact, establish who/where/when, escalate through physical cause and effect, explain the mechanism,
and end on a short ironic payoff. Use natural spoken sentences, contractions and spoken numbers. Avoid narrating every
visible movement. Keep narration separate from shot directions. At twenty to thirty seconds, use the selected narrator's
measured delivery as the word budget; the supplied suggestion of 3.7 words/second is fast, not a guaranteed duration.

Present the copyable script, word count, estimated time and a short visual plan. For a user recording: one steady warm
voice, natural sentence pauses, MP3/WAV or another ffmpeg-readable file, no music. Keep the final transcript for alignment.
Do not recommend a paid service as a requirement. A changed recording needs updated transcript text, not a retimed voice.

## Build with the available engine

1. If dependencies are missing, run `bash SKILL/scripts/setup.sh --no-voice` (in the background; runtime defaults to `~/.faceless-shorts`). Create a new project:
   `bash SKILL/scripts/new_video.sh tall-tale <slug> --dir "$PWD/work"`.
   Do not edit the installed kit to make one video. Create its `audio/` folder and copy the supplied recording into the project, e.g. `audio/voice.mp3`.
2. Replace the example `script.json`: actual title, sources, final narration split into shot/phrase lines, and these fields:
   `"captions": false`, `"fade": false`, `"audio_mode": "voice_locked"`,
   `"voice_source": "audio/voice.mp3"`, `"music": "bounce"` for Tall Tale. For another chosen style, use `"bed"`
   or that style's supported music; `"bounce"` is only bundled in Tall Tale.
   Keep music `"none"` if requested. In this mode ignore TTS speed/lead/outro; the recording defines the clock.
3. Run `SKILL/scripts/py SKILL/scripts/words.py <project> --audio <project>/audio/voice.mp3`.
   This writes a mono 24 kHz alignment copy and line/word timings; it does not replace the original file.
   The current aligner needs local faster-whisper for a supplied recording. A script alone does not supply exact timestamps.
   If alignment fails, use a timed transcript or ask for it; do not present estimated phrase timing as exact.
   Check every line exists, times are monotonic and inside the recording, and pauses fall between phrases. Resolve mismatches
   before code. `data/lines.json` duration must match the decoded original. Total frames = round(duration × 30).
4. Write `work/PLAN.md` inside the project: shot frame interval, words, setting, lighting, camera, actor pose/expression,
   effects and SFX. Merge tiny phrases. Vary close hook, wide reveal, two-shot, object insert, reaction and payoff.
5. Replace `src/shots.js` using Tall Tale's `Toon`, `world`, `props`, camera and `shoot` APIs. Add components to the project's
   files. Do not paste calls to the missing kit's `romanFront`, `camFromKeys`, `renderFrame` or `Pen` into this engine.
   Use `L(i)` and `Wd(word, line)`; a reveal can start at `Wd(...) - 2/30`. Keep casts/sets consistent.
6. Make movement purposeful: anticipation, overshoot and settle for actions; blinking, breathing and reacting for actors;
   subtle camera motion through holds. Put props in the right hand and keep them attached until the release. Keep feet
   planted in walks. Use simple painted set pieces with depth, warm day/golden/dramatic blue lighting, close-up focus on eyes,
   and sharp wides. A twist may use a push-in, roll and sound sting. Do not hard-cut every clause when a camera move explains it.
7. Run `node tools/capture.mjs check`, then `cues`. Inspect mid-shot, transitions and reveal frames. Check narrow framing,
   hidden faces, railings, camera clipping, shadows, billboard orientation, mirrored signs and detached prop offsets.
   Create and inspect the contact sheet, send it with a short shot summary, then continue the full render without another gate.
8. Mix through `SKILL/scripts/py tools/mix.py .`. The new `voice_locked` branch uses `tools/locked_mix.py` copied by
   `new_video.sh`. For a project created before this update, copy `SKILL/scripts/locked_mix.py` into `tools/` and update
   its mixer from the matching current template after preserving any story-specific sound code.
   It creates separate voice/music/SFX WAVs, a mix WAV, and `data/audio-report.json`. Confirm non-silent music is −6.02 dB
   relative to the voice's gated RMS; SFX are at or below that and below 0.7× the voice peak. No ducking or voice compression.
   If levels are too loud together, a single shared gain reduces the whole mix. Never normalize stems independently afterward.
   The helper uses a constant shared peak-safe gain, so no nonlinear limiter is needed. It reports actual measured levels.
   For a twist, arrange the synthesized music before mixing; do not add a master ducking stage.
9. Lock timings before sound. After any picture timing change, regenerate cues and mix. Render at 30 fps; software rendering
   may reduce spatial quality for a preview, but do not silently lower this mode's final frame rate.
   `FPS=30 node tools/capture.mjs video renders/<slug>.mp4`.

## Delivery and QA

Keep the user informed of completed/current/next steps in plain language. Benchmark a short sample to estimate render time;
do not promise a fixed software-rendering speed. The installed capture tool streams frames; it has no native `RESUME=1`.
For long renders, use checked sections as described in long-form.md rather than claim automatic frame-level resume.

Inspect the contact sheet and key actions, a sample clip, timing at the last word, and encoded duration (within 1/30 s of
the recording). Check black/freeze detections visually: camera holds and intentional flashes can be valid. Frame zero
must be an image, with no inherited fade. Confirm no captions appear unless requested. Check the level report and audible
voice clarity; do not claim a listening check based solely on volume statistics. Deliver the MP4 and a few lines describing
its shots, plus cover/title/caption as useful. Offer precise changes and optional captions.
