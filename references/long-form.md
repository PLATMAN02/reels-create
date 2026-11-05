# Long-form videos in the existing styles

Use for multi-minute work, including an eight-minute Paper Atlas or cartoon video. This is an authored chapter workflow
with section rendering using the existing tools, not a bundled eight-minute worked example. Do not claim full-length
rendering, landscape layouts or automatic per-frame resume have been tested merely because short sections pass.

## Plan for the requested length

Preserve the topic/style/voice choices already given. Confirm aspect ratio only when it is consequential and unknown;
otherwise use the existing vertical format and say so. All six shipped templates are 1080×1920. For 1920×1080, adapt the
project's canvas, W/H, 3D render size/aspect, camera framing, caption zones and layout, then render a landscape sample.
Do not crop/stretch a portrait master and call it a native landscape implementation.

Start with an opening question, a chapter outline, researched narration and a visual plan. For eight minutes of ordinary
explanation, roughly 1,000–1,200 spoken words is a starting estimate; actual voice duration decides. Use five to eight
coherent chapters where appropriate, distinct visual examples, callbacks and a satisfying ending. Do not stretch a short's
script with repeated scenes or silence. Keep factual sourcing and uncertainty in the script and chapter notes.

Get approval for a new outline/script once unless the user has already approved it or asked to proceed. Then work chapter
by chapter without making every section a fresh permission gate. For supplied recordings, never force them to eight minutes
by changing voice speed or cutting speech; use the actual duration or ask about a genuinely conflicting exact-length request.
With generated narration, revise wording to meet a tight runtime rather than apply an unexplained speed change.

## One timeline; manageable sections

Use a complete `script.json` and global `data/lines.json`, `words.json`, `cues.json`. Maintain the same voice, cast, palette,
camera language and locations throughout. Build large scenes once per browser session; keep draw(t) deterministic. A long
voice generation can be checkpointed sentence/chapter by chapter; the current `voice.py` does not cache progress itself.
Do not pretend it does, and do not rerun completed TTS unnecessarily after a small visual edit.

The current renderer can capture a global time range:

```text
FPS=30 node tools/capture.mjs video renders/part-01.mp4 0 30
FPS=30 node tools/capture.mjs video renders/part-02.mp4 30 60
```

Choose boundaries on exact frame numbers; for an eight-minute/30 fps master, N = 14,400 frames. Partition contiguous ranges
[f0,f1) and convert boundaries to f/30 seconds. Make the final endpoint round(voiceDuration×30)/30. Do not independently
round arbitrary chapter timestamps into gaps/overlaps. Use ranges of roughly twenty to sixty seconds, shortened if memory
or software rendering requires it. The templates remain vertical until adapted as above.

Render sequentially by default, monitor errors and progress, and do not launch many 3D browsers on a small machine. Save
a section manifest containing frame start/end, settings and fingerprints of script/timing/scene/font/engine inputs. Resume
only sections with matching inputs and successful file checks. `capture.mjs` does not automatically compare these. Write
new temporary outputs and move them into place after success; do not trust a file merely because its path exists.

## Review and assemble

Make contact sheets per chapter, including every cut and key action plus regular interval samples. The existing `sheet`
command covers the whole timeline and can create an unwieldy image for eight minutes; use `frames` with chapter-specific
times and tile those into separate sheets. Inspect previews before heavy rendering. Review chapter joins for frame gaps,
changes in lighting, actor continuity, mismatched text, audio clicks and missing words. Keep a suitable music arc instead of
an obvious thirty-second loop for eight minutes.

Capture the complete master mix once after timing is locked. Sections may contain temporary audio, but the final mux must
use the continuous master so AAC boundary padding cannot cut a word or introduce a click. Use identical video settings and
verify each section's actual frame count/codec/dimensions. The capture tool's console success message alone is insufficient:
its original encoder path does not robustly propagate every ffmpeg exit status. Check ffprobe/decode before accepting a part.
Concatenate the checked video streams in manifest order, discarding section audio, then attach `data/mix.wav` once with an
explicit target duration derived from N/fps. Use a safely generated concat list with correct path quoting or relative names
inside one controlled directory. Avoid shell interpolation of titles or paths.

The final encoded master must have N video frames (within the declared container time-base tolerance), the chosen aspect
ratio/frame rate, H.264/AAC, faststart, no clipped narration, and a duration within one video frame of the locked recording.
If supplied voice dictates a partial last frame, explain the unavoidable frame-grid rounding. Check audio levels, meaningful
black/freeze detections, the opening hook, last spoken word and each chapter join. Deliver the full master, chapter timings,
a cover and an optional smaller share copy. Describe only checks actually performed.
