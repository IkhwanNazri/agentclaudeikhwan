# Gaya utama: Teater Boneka Kertas 3D (PuppetShow)

Gaya ni diluluskan owner pada 15 Nov 2026 dan jadi **default untuk semua video**. Contoh yang owner suka:
- `content/2026-11-12-waktu-rasa-sekejap/` (Kenapa masa cepat je berjalan)
- `content/2026-11-15-kenapa-dewasa-kurang-kawan/`
- `content/2026-11-15-penat-fizikal-vs-mental/`

## Kehendak owner (WAJIB)
1. Pembukaan: **dua boneka pengacara** depan tirai merah sebut tajuk (host1 suara Leda, host2 suara Puck), kad tajuk turun dari atas, **kemudian tirai buka** dan cerita bermula.
2. Watak = boneka kertas 3D bersendi, **digerakkan batang + tangan dalang** dari bawah pentas. Tangan gaya kertas dengan jari jelas (`PaperHand` dalam `video/src/puppet/kit.tsx`). Jangan tukar ke tangan 3D bulat (owner kata tak realistik).
3. **TIADA ayat "Follow..." / CTA suara atau teks di akhir.** Babak akhir `cta` = semua watak melambai + tirai tutup, senyap.
4. Panjang **45-60 saat**, ringkas dan padat. Kalau lebih, ringkaskan ayat (jangan tambah babak).
5. Suara tak boleh ada bunyi "walkie-talkie" di hujung (dah dibuang automatik oleh `pipeline/tts.mjs`).
6. Owner nak storyboard scene by scene dalam `script.md`.

## Format scenes.json
```json
{
  "composition": "PuppetShow",
  "title": "Kenapa ...?",
  "voiceStyle": "Mesra macam kawan bercerita, laju dan padat macam TikToker.",
  "voiceSpeed": 1.05,
  "scenes": [
    { "set": "intro", "speaker": "host1", "voiceName": "Leda", "say": "Hook (≤3s)", "duration": 1 },
    { "set": "intro", "speaker": "host2", "voiceName": "Puck", "say": "Tajuk sebagai soalan", "duration": 1, "title": true },
    { "set": "curtain", "duration": 1.3 },
    { "set": "<set cerita>", "say": "...", "duration": 1, "banner": "maks 4 perkataan" },
    { "set": "cta", "duration": 2.6 }
  ]
}
```
`duration: 1` untuk babak bersuara: `tts.mjs` isi durasi sebenar. Babak `cta` ambil latar dari babak sebelumnya (`meetup` → kedai mamak, `rest` → taman, lain → balkoni).

## Set yang dah ada (`video/src/PuppetShow.tsx`)
| Set | Isi |
|---|---|
| routine | Aina ulang rutin (katil → meja → tren), kalendar berterbangan |
| study | bangku 5 boneka pelbagai umur pegang jam (kajian) |
| road | jalan 10 tiang, Aina remaja jauh, Aina dewasa angkat bahu |
| janet | profesor + pai mengecil (perpustakaan) |
| memory | rak kotak kenangan, satu bercahaya |
| scroll | malam, Aina atas sofa scroll telefon, jam laju |
| balcony | senja, Aina pegang pasu, kotak kenangan muncul |
| school | Aina kecil + kawan sekolah |
| move | Aina pindah bawa kotak, kawan lama makin jauh |
| hours | meter jam 50/90/200 + Aina & kawan |
| three | tiga papan Dekat · Berulang · Selesa |
| chat | group chat "Jom lepak!" → "Next time" |
| meetup | kedai mamak, Aina & kawan (bertudung) teh tarik |
| versus | Ali (pekerja binaan) angkat kotak vs Aina menaip |
| brain | otak kertas + pai 20% |
| fatigue | otak dengan buih glutamate |
| bike | ujian basikal 2 boneka + pemasa |
| sleep | pentas terbelah: Ali tidur lena vs Aina scroll |
| rest | Ali & Aina berehat di bangku taman (pesanan) |

Watak: `AINA` (bob, kemeja biru, lanyard), `FRIEND` (bertudung), `ALI` (topi keselamatan), `HOST1`, `HOST2`. Kit boneka/prop: `video/src/puppet/kit.tsx` (`Puppet`, `Puppeteer`, `Paper`, `Clock`, `Calendar`, `Banner`, `TextPlane`, rambut `hijab`, pegang `coffee/phone/box/teh/pot/book/mic/clock`).

Topik baru biasanya perlukan **set baru**: tambah komponen dalam `PuppetShow.tsx`, daftar dalam `SETS` dan jenis `ShowSet`, kemudian `cd video && npx tsc`. Ikut corak set sedia ada: `Fly` (set turun dari atas), `Wall`, `rise()` (boneka naik dari bawah), `HangBanner`. Kerja ni perlukan model yang kuat. Orchestrator buat sendiri, jangan serah ke maker (haiku).

## Langkah render
```bash
node pipeline/tts.mjs content/<slug>/scenes.json           # suara (Gemini, percuma). --only=5,8 untuk ulang babak tertentu
node pipeline/render.mjs content/<slug>/scenes.json        # ~15-25 minit (WebGL swangle)
scripts/telegram.sh send content/<slug>                    # hantar ke owner
```
Sebelum render penuh, semak beberapa frame dulu:
```bash
cd video && npx remotion still src/index.ts PuppetShow /tmp/x.png --props=../content/<slug>/scenes.json --frame=300 --scale=0.3 \
  --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell --gl=swangle
```
Perkara yang selalu perlu dibetulkan: label/teks terpotong di tepi pentas (x mesti dalam ±2.6), boneka menutup papan tanda, banner bertindih kad tajuk.

## Nota teknikal
- `tts.mjs` cuba semula automatik kalau TTS ulang ayat dua kali (suara terlalu panjang).
- `config/telegram_chat_id` = chat ID owner yang betul. `TELEGRAM_CHAT_ID` dalam environment salah (bukan nombor), jadi skrip guna fail ni.
- Env var (`GEMINI_API_KEY`, `TELEGRAM_*`) hanya terbaca bila sesi bermula.
