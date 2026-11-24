# Gaya DILULUSKAN owner (23 Nov 2026): Podcast 2D dari gambar rujukan owner

Ini gaya utama sekarang. Jangan guna 3D PuppetShow / watak vektor SVG melainkan owner minta.

## Kehendak owner (WAJIB)
1. Watak MESTI sama macam gambar owner (`video/public/placthinc/opening.png`): co-host kiri (tudung pink, blazer), host kanan (rambut kerinting, cermin mata, hoodie, janggut). JANGAN lukis/generate watak sendiri.
2. 2D sahaja (render ~1-2 minit). Jangan 3D WebGL (1-2 jam).
3. Watak TAK pegang batang kayu (dah dibuang dalam opening.png; asal: jangan guna).
4. JANGAN gerakkan kepala/tangan dengan topeng atas gambar rata — latar (logo) ikut bergerak. Hanya: mulut, kelip mata, kamera pan, kelip lampu, habuk.
5. Suara: co-host = Gemini **Leda**, host = Gemini **Achird** (santai, tak macam AI). Mulut ikut RMS suara (lip-sync).
6. Jangan sebut "PLACTHINC" dalam dialog. Tiada ayat "Follow" di akhir.
7. Hantar ke Telegram untuk review sebelum apa-apa.

## Fail
- `video/src/RefPodcast.tsx` — komposisi `RefPodcast` (koordinat mulut/mata dalam `RIG`).
- `content/<folder>/ref.json` — `{ duration, lines: [{ who: host|cohost, from, to, voice }] }`.
- `content/<folder>/voices.json` — dialog untuk TTS (format scenes: `say`, `voiceName`).
- Contoh lengkap: `content/2026-11-23-bilik-378/`.

## Langkah
```bash
node pipeline/tts.mjs content/<folder>/voices.json          # suara → video/public/<folder>_<i>.wav
# isi ref.json: from/to ikut panjang suara (jarak 0.4s, mula 1.5s, tamat +1.4s)
cd video && npx remotion render src/index.ts RefPodcast ../content/<folder>/video.mp4 \
  --props=../content/<folder>/ref.json --concurrency=4 \
  --browser-executable=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
cd .. && scripts/telegram.sh send content/<folder>
```
Simpan salinan suara dalam `content/<folder>/voice/` (kuota TTS percuma terhad ~10/hari/model).

## Babak cerita (seterusnya)
Guna cara sama: owner beri gambar setiap babak (gaya sama). Untuk gerak kepala/tangan sebenar, minta owner jana aset BERLAPIS (latar tanpa watak, badan tanpa kepala, kepala tanpa mulut, tangan berasingan, set mulut) — prompt contoh dalam sejarah chat / tulis semula ikut keperluan.

## SFX (WAJIB rakaman sebenar, bukan sintetik)
Owner tak suka bunyi sintetik ("macam robot"). `video/public/sfx/*.wav` kini rakaman CC0:
Meta Open Sound (`facebookincubator/Meta-open-sound`: ketukan, jam seram, drone, impak, whoosh, room tone, jeritan) dan
Kenney RPG Audio (`Boyquotes/kenney-rpg-audio-for-godot`: pintu buka/tutup, kriut, tapak kaki → `run.wav`). Lesen dalam folder sfx.
`scripts/gen-sfx.py` = lama (sintetik), jangan guna.

## Sari kata
Tengah skrin (y≈1180, kiri 70 / kanan 170) supaya tak ganggu butang TikTok. MESTI berterusan tanpa jeda:
suara/sari kata di peringkat atas `StoryScene` (boleh merentas syot), sari kata kekal hingga ayat seterusnya.
Babak tanpa suara (cth ketukan) guna `captions: [{text, at, sec}]`.

## Episod penuh
Komposisi `Episode` = podcast (`RefPodcast`) + cerita (`StoryScene`). Contoh: `content/2026-11-23-bilik-378/episod.json`.
Watak cerita: `content/2026-11-23-bilik-378/ref/watak-cerita.png`. Podcast: "jangan lupa follow" (owner minta, bukan subscribe).
