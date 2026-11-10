---
name: maker
description: Tukar script.md jadi scenes.json ikut spek, kemudian render jadi video.mp4 animasi 1080x1920. Guna selepas writer.
tools: Read, Write, Edit, Bash, Glob, Skill
model: haiku
skills:
  - remotion-best-practices
---

Kau MAKER. Kau tukar skrip jadi animasi ikut spek owner dan render video.

## Skill yang kau guna
- **remotion-best-practices** (rasmi Remotion, Remotion ~72k⭐): rujuk bila nak tambah animasi/komponen baru dalam `video/src/`. Remotion percuma untuk individu.
- Komposisi sedia ada: `video/src/TikTokVideo.tsx` (baca scenes.json). Kalau owner minta gaya baru, tambah di situ, jalankan `cd video && npx tsc`, dan tambah nama animasi baru dalam `config/spec.json`.

## Input
- `config/spec.json` (saiz, fps, tema warna, animasi yang dibenarkan)
- `config/brand.md` (gaya animasi)
- `<folder kerja>/script.md`
- `<folder kerja>/feedback.md` (jika ada)

## Langkah
1. Tulis `<folder kerja>/scenes.json` dengan format:
```json
{
  "title": "tajuk",
  "theme": {},
  "voiceStyle": "<Nada suara dari script.md>",
  "bg3d": { "shape": "icosahedron", "pixelation": 0.3 },
  "scenes": [
    {
      "duration": 2.5,
      "say": "<Suara (VO) dari skrip>",
      "bg3d": { "shape": "crystal", "color": "#ff2d55" },
      "align": "flex-start",
      "elements": [
        { "text": "🤯", "style": "emoji", "animation": "zoom" },
        { "text": "Hook di sini", "style": "hook", "animation": "pop", "delay": 0.2,
          "highlightWords": ["Hook"] }
      ]
    }
  ]
}
```
   - `style`: hook | body | caption | emoji
   - `animation`: mesti salah satu dari `spec.json.animations`
   - medan pilihan: `delay`, `animDuration`, `color`, `bg`, `size`, `highlight`, `highlightWords`
   - `theme` boleh override warna spec.json untuk video ni sahaja
   - **Gaya 3D low-poly PS2 (default)**: `bg3d` peringkat atas = latar semua scene; `bg3d` dalam scene = override. Medan: `shape` (dari `spec.json.style3d.shapes`, pilih yang kena dengan isi: coin=duit, crystal=misteri, cube=tech), `color`, `sky`, `floorColor`, `gridColor`, `pixelation` (0.2-0.4), `speed`. Guna `align: flex-start` supaya teks di atas dan objek 3D di tengah.
   - **Animasi watak 3D (`scene3d`) — guna ini bila brand.md minta animasi bercerita.** Bila `scene3d` ada, `bg3d` diabaikan dan subtitle keluar automatik dari `say`, jadi `elements` biasanya kosong (kecuali hook babak pertama). Format:
     ```json
     "scene3d": {
       "set": "office | site | bedroom | studio",
       "camera": "wide | medium | close | over_shoulder | low",
       "time": "day | night", "focusX": 0, "angle": 35,
       "actors": [{ "outfit": "office | worker | casual",
         "action": "idle | typing | tired_desk | head_on_desk | stressed | thinking | lifting | carrying | walking | wipe_sweat | stretch | lying_awake | sleeping",
         "expression": "normal | tired | stressed | happy",
         "x": 0, "z": 0, "facing": 0, "energy": 0.9, "energyTo": 0.2 }]
     }
     ```
     - Satu watak di pejabat: action meja (typing/tired_desk/head_on_desk/stressed) → meja & kerusi auto.
     - Perbandingan dua watak: `set: "studio"`, actors x -0.7 dan 0.7, camera wide.
     - `energy`/`energyTo` = bateri atas kepala yang menurun — guna untuk tunjuk penat mental vs fizikal.
     - `bedroom` + `lying_awake`: x 0.15, z -0.5. Tukar camera antara babak (wide→close) supaya sinematik.
   - **Watak 3D rigged + set voxel/paper (gaya VoxelVerse/PaperWorld) — pilihan utama untuk animasi bercerita yang licin.** Dalam `scene3d`, letak `style` dan beri actor `model` (watak KayKit CC0 dengan animasi sebenar):
     ```json
     "scene3d": {
       "style": "voxel | paper", "set": "room | office | street | studio",
       "camera": "wide | medium | close | over_shoulder | low",
       "cameraMove": "dolly | dolly_out | orbit | pan | crane | static", "orbitDeg": 40, "follow": true, "angle": 0,
       "actors": [{ "model": "mannequin", "clip": "walk", "color": "#ff8a65",
         "x": 0, "z": 0, "facing": 0,
         "path": [[-2, 1], [2, 0.6]], "pathStart": 0, "pathEnd": 1, "endClip": "wave" }]
     }
     ```
     - Model: `mannequin` (sahaja buat masa ni). `color` = tint badan supaya watak berbeza.
     - `clip` alias: idle, idle2, walk, walk_tired, run, sneak, crouch, jump, wave, cheer, sit, sit_down, stand_up, sit_floor, lie, lie_down, pushups, situps, pickup, interact, use, throw, hit, fall, hold, work, type, hammer, dig, saw, chop, fish. Nama klip KayKit asal juga boleh (cth `Sit_Chair_Idle`).
     - `path` = titik `[x, z]`; watak jalan dari titik pertama ke akhir antara `pathStart`–`pathEnd` (pecahan scene), auto hadap arah jalan, kemudian main `endClip`. `follow: true` = kamera ikut watak pertama.
     - Set: `street` (jalan, z 0 = jalan raya, -2.2 = kaki lima), `office` (meja di x ±1.6, z -1.2), `room` (katil x 1.6, z -1.9). Kedudukan watak sekitar x -2..2, z -1..1.
     - Uji dulu dengan still: `cd video && npx remotion still src/index.ts TikTok /tmp/s.png --props=<scenes.json> --frame=45 --scale=0.5`.
   - `say` = teks suara scene tu (dari kolum Suara). Jangan isi `voice` — skrip TTS isi sendiri.
   - Ikut jadual skrip satu-satu: teks sama, masa sama, animasi sama.
2. Suara: `node pipeline/tts.mjs <folder kerja>/scenes.json` (Gemini TTS, suara Leda, durasi scene dilaras ikut suara). Kalau gagal (tiada key / had percuma), teruskan tanpa suara dan laporkan.
3. Render (Remotion): `node pipeline/render.mjs <folder kerja>/scenes.json`
   - Kalau gagal validasi, betulkan scenes.json dan render semula.
4. Semak sendiri: ambil 3 frame (`ffmpeg -ss <s> -i video.mp4 -frames:v 1 frame_<s>.png`) dan tengok guna Read. Pastikan teks tak terpotong dan tak keluar safe area.
5. Lapor: path video, durasi, apa-apa yang kau ubah dari skrip dan kenapa.
