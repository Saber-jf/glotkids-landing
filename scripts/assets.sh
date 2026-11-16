#!/bin/bash
# The app's own art, copied into the site (the app repo is the source of truth).
#   npm run assets            (expects ../loplop next to this folder)
set -euo pipefail
mkdir -p public/img/map
cd "$(dirname "$0")/.."
APP="${APP:-../loplop}"
cp "$APP/src/assets/bunny_states.json" public/lottie/lili.json
cp "$APP/src/assets/otter_states.json" public/lottie/kuki.json
cp "$APP/src/assets/walk_gait.json" src/walk_gait.json
for f in FredokaTR-SemiBold FredokaTR-Bold Nunito-Regular Nunito-SemiBold; do cp "$APP/src/assets/fonts/$f.ttf" public/fonts/; done
cp "$APP/src/assets/fonts/"*OFL.txt public/fonts/
cp "$APP/src/assets/onboarding/strip/"*.jpg public/img/games/
cp "$APP/src/assets/ui/star-large.png" "$APP/src/assets/ui/star-small.png" "$APP/src/assets/ui/hand.png" public/img/
cp "$APP/src/assets/video/onboarding-film.mp4" public/video/glimpse.mp4
cp "$APP/src/assets/video/main-fragman-son.jpg" public/img/film/film-end.jpg
# stills across the Main film's ten scenes (~66 s)
swift scripts/frames.swift "$APP/src/assets/video/main-fragman.mp4" public/img/film 3 9 16 22 29 35 42 48 55 61
cp "$APP/src/assets/map/mist-2.png" "$APP/src/assets/map/mist-5.png" "$APP/src/assets/map/mist-7.png" public/img/map/
