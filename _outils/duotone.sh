#!/bin/bash
# Traitement duotone Sky Social (nuit #0D0912 → magenta #E91E8C → rose pâle)
#
#   Image :  _outils/duotone.sh photo.jpg sortie.webp [largeur=1600] [qualité=72]
#   Vidéo :  _outils/duotone.sh --video entree.mp4 sortie.mp4 [largeur=1280] [crf=30]
#   Noir et blanc (effet projecteur) :  _outils/duotone.sh --nb photo.jpg sortie.webp [largeur]
#
# Outils requis : ffmpeg et cwebp (brew install ffmpeg webp).
set -euo pipefail

# Dégradé appliqué à la luminance (courbe assombrie, gamma 1,35) :
# 0 → nuit (13,9,18), 74 % → magenta (233,30,140), 100 % → rose (255,150,200)
LUT="format=gray,format=rgb24,eq=contrast=1.1:brightness=-0.03,lutrgb=r='if(lt(pow(val/255\,1.35)\,0.74)\,13+(233-13)*pow(val/255\,1.35)/0.74\,233+(255-233)*(pow(val/255\,1.35)-0.74)/0.26)':g='if(lt(pow(val/255\,1.35)\,0.74)\,9+(30-9)*pow(val/255\,1.35)/0.74\,30+(150-30)*(pow(val/255\,1.35)-0.74)/0.26)':b='if(lt(pow(val/255\,1.35)\,0.74)\,18+(140-18)*pow(val/255\,1.35)/0.74\,140+(200-140)*(pow(val/255\,1.35)-0.74)/0.26)'"
NB="format=gray,eq=contrast=1.15:brightness=-0.08,format=rgb24"

mode=image
case "${1:-}" in
  --video) mode=video; shift ;;
  --nb) mode=nb; shift ;;
esac
in="$1"; out="$2"
tmp="$(mktemp -t duo).png"

if [ "$mode" = video ]; then
  w="${3:-1280}"; crf="${4:-30}"
  ffmpeg -v error -y -i "$in" -an -vf "scale=${w}:-2,${LUT},format=yuv420p" \
    -c:v libx264 -preset slow -crf "$crf" -movflags +faststart "$out"
else
  w="${3:-1600}"; q="${4:-72}"
  filtre="$LUT"; [ "$mode" = nb ] && filtre="$NB"
  ffmpeg -v error -y -i "$in" -frames:v 1 -vf "scale=${w}:-2,${filtre}" "$tmp"
  cwebp -quiet -q "$q" -m 6 "$tmp" -o "$out"
  rm -f "$tmp"
fi
echo "$out"
