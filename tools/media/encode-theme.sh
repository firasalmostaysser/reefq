#!/usr/bin/env bash
# Encode one theme's raw media (see docs/SORA_PROMPTS.md): silent 720x1280 intro (MP4 + WebM, ~1.5 MB), poster, WebP stills.
# Usage: tools/media/encode-theme.sh <theme-id> [version]   e.g. tools/media/encode-theme.sh layl v1
set -euo pipefail
id=${1:?theme id}; v=${2:-v1}
d="$(dirname "$0")/../../public/assets/media/themes/$id"; cd "$d"
if [ -f intro-raw.mp4 ]; then
  vf="scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30"
  ffmpeg -loglevel error -y -i intro-raw.mp4 -an -vf "$vf" -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 26 -preset slow -movflags +faststart "intro-$v.mp4"
  ffmpeg -loglevel error -y -i intro-raw.mp4 -an -vf "$vf" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 "intro-$v.webm"
  ffmpeg -loglevel error -y -i "intro-$v.mp4" -frames:v 1 -c:v libwebp -quality 82 "poster-$v.webp"
  if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "intro-$v.mp4" | grep -q .; then echo "audio stream left in intro-$v.mp4" >&2; exit 1; fi
  rm intro-raw.mp4
fi
still(){ [ -f "$1-raw.png" ] || return 0; ffmpeg -loglevel error -y -i "$1-raw.png" -vf "scale='min($2,iw)':-2" -c:v libwebp -quality 80 "$1-$v.webp"; rm "$1-raw.png"; }
still inside 1080; still inside-wide 1920; still venue 900
ls -lh "$PWD" | grep -- "-$v\."
