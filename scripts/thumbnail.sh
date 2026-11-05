#!/bin/bash
# Thumbnail for a finished video: background art + a code-drawn title (scripts/thumbnail.mjs) → <out> (1080x1920 JPG).
#
#   bash thumbnail.sh <project> "<TITLE|*YELLOW LINE>" "<scene description>" [--out file.jpg] [--frame 12.4] [--no-codex] [--y 0.13]
#
# Art source, in order:
#   1. Codex image generation (OpenAI Codex CLI, `codex exec` with its built-in image tool), when `codex` is installed,
#      logged in and image_generation is enabled. A key frame of the video is attached as the style reference, and
#      the prompt forbids text, logos, flags and real people (the title is drawn by thumbnail.mjs, so it is always spelled
#      right). This uses the user's Codex/ChatGPT plan: run it only after the user said yes.
#   2. Otherwise (or with --no-codex, or if Codex fails or returns no image) the video's own key frame (--frame, default
#      the frame at 35 % of the film), rendered by tools/capture.mjs.
# The art and the prompt are kept in <project>/thumb/ for review.
set -eu
SKILL="$(cd "$(dirname "$0")/.." && pwd)"
USAGE='usage: thumbnail.sh <project> "<TITLE|*YELLOW LINE>" "<scene description>" [--out f.jpg] [--frame t] [--no-codex] [--y 0.13]'
PROJ="$(cd "${1:?$USAGE}" && pwd)"; TITLE="${2:?$USAGE}"; SCENE="${3:?$USAGE}"; shift 3
OUT="$PROJ/../../output/thumbnail.jpg"; FRAME=""; CODEX=1; Y=0.13
while [ $# -gt 0 ]; do case "$1" in
  --out) OUT="$2"; shift 2 ;; --frame) FRAME="$2"; shift 2 ;; --no-codex) CODEX=0; shift ;; --y) Y="$2"; shift 2 ;;
  *) echo "unknown option $1" >&2; exit 2 ;; esac; done
T="$PROJ/thumb"; mkdir -p "$T"; cd "$PROJ"

# reference / fallback frame
if [ -z "$FRAME" ]; then FRAME=$(node -e "const d=require('$PROJ/data/lines.json').duration;console.log((d*0.35).toFixed(2))"); fi
# render the frame WITHOUT captions: script.json is switched to "captions": false for this one frame, then restored
cp script.json "$T/.script.json.bak"; trap 'mv -f "$T/.script.json.bak" "$PROJ/script.json" 2>/dev/null || true' EXIT
node -e "const f='$PROJ/script.json',j=JSON.parse(require('fs').readFileSync(f));j.captions=false;require('fs').writeFileSync(f,JSON.stringify(j,null,2))"
rm -rf "$T/ref"; node tools/capture.mjs frames "$T/ref" "$FRAME" >/dev/null
mv -f "$T/.script.json.bak" script.json; trap - EXIT
REF=$(ls "$T"/ref/*.jpg | head -1)

ART=""
if [ "$CODEX" = 1 ] && command -v codex >/dev/null 2>&1 && codex login status >/dev/null 2>&1 \
   && codex features list 2>/dev/null | grep -E '^image_generation[[:space:]].*true' >/dev/null; then
  cat > "$T/prompt.txt" <<EOF
Use your image generation tool to create ONE vertical YouTube Shorts thumbnail background, portrait 1024x1536.
Match the attached frame's visual style exactly (same palette, shapes and level of detail).
Scene: $SCENE
Generic invented characters only: no real people or likenesses, no logos, no flags, no team crests, no brand or sponsor marks.
Leave the TOP 35% of the image as a plain, simple background (sky or wall) with nothing important in it: a title is added later.
Absolutely no text, letters or numbers anywhere in the image.
Save the final PNG as art.png in the current directory.
EOF
  echo "codex: generating art (about a minute)…" >&2
  rm -f "$T/art.png"
  (cd "$T" && codex exec --skip-git-repo-check -s workspace-write -i "$REF" - < prompt.txt > codex.log 2>&1) || true
  [ -s "$T/art.png" ] && ART="$T/art.png" || echo "codex returned no image (see $T/codex.log); using the video frame" >&2
else
  [ "$CODEX" = 1 ] && echo "codex image generation not available; using the video frame" >&2
fi
SCRIM=""; [ -z "$ART" ] && { ART="$REF"; SCRIM="--scrim"; }     # a video frame is busy: darken behind the title
node "$SKILL/scripts/thumbnail.mjs" --bg "$ART" --title "$TITLE" --out "$OUT" --y "$Y" --font "$PROJ/fonts/Inter-Black.otf" $SCRIM
echo "art: $ART" >&2
