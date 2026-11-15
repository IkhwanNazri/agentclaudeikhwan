---
name: buat-konten
description: Jalankan pipeline penuh konten TikTok (researcher → writer → maker → reviewer → Telegram). Guna bila owner kata "buat konten", "/buat-konten", atau scheduled task harian berjalan. Arg pilihan - topik spesifik, atau "semak" untuk proses balasan Telegram.
---

# Pipeline Konten TikTok

Kau ORCHESTRATOR. Kau tak buat kerja sendiri — kau agihkan ke subagent dan pastikan aliran betul.

## 0. Persediaan
Kalau mana-mana skill dalam `scripts/install-skills.sh` belum ada di `.claude/skills/` (cth `prompt-master`, `last30days`), jalankan `scripts/install-skills.sh` dulu.

## 0b. Semak balasan Telegram
Jalankan `scripts/telegram.sh check` (abaikan jika token belum diset).
- `approved` → beritahu owner video sedia untuk dipost. Selesai untuk slug tu.
- `revise` → ada `feedback.md`; ulang dari langkah writer (atau maker sahaja kalau feedback hanya visual) untuk slug tu.
- `rejected` → biarkan.
Kalau arg = "semak", berhenti selepas langkah ni.

## 1. Sedia folder kerja
`content/<YYYY-MM-DD>-<slug-pendek>/` (slug huruf kecil, sempang, maks 30 aksara — slug ditentukan selepas research; guna nama sementara `content/<tarikh>-draft` dan rename selepas langkah 2).

Kalau `config/brand.md` masih ada placeholder `<!--` di bahagian Niche, BERHENTI dan minta owner isi dulu.

## 2. Researcher
Panggil subagent `researcher` dengan folder kerja.
- Owner beri idea/topik → researcher HANYA sahkan fakta & cari sumber untuk idea tu (jangan cari trend lain — jimat token).
- Tiada idea → researcher cari trend penuh.
Tunggu `research.md`.

## 3. Writer
Panggil subagent `writer` dengan folder kerja. Tunggu `script.md` + `caption.txt`.
**Gaya default PuppetShow** (baca `docs/puppet-show.md`): suruh writer tulis `scenes.json` format PuppetShow juga (2 intro pengacara, curtain, 5-6 babak cerita, `cta` senyap TANPA say/text). Beri writer senarai set yang ada + set baru yang kau cadang untuk topik tu. 45-60 saat.

## 4. Maker
- **PuppetShow (default):** orchestrator buat sendiri (maker haiku tak cukup kuat untuk bina set baru):
  1. Bina set baru yang perlu dalam `video/src/PuppetShow.tsx` → `cd video && npx tsc`.
  2. `node pipeline/tts.mjs <folder>/scenes.json` (semak jumlah durasi 45-60s; ringkaskan ayat kalau lebih).
  3. Semak 6-8 frame dengan `remotion still` (arahan dalam docs), betulkan teks terpotong/bertindih.
  4. `node pipeline/render.mjs <folder>/scenes.json` di latar belakang (~20 minit).
- Gaya lama (hanya kalau owner minta): panggil subagent `maker`.

## 5. Reviewer
Panggil subagent `reviewer` dengan folder kerja.
- FAIL → hantar `feedback.md` ke writer atau maker (ikut siapa yang review.md tuding), kemudian review semula. **Maksimum 1 pusingan (jimat token).** Kalau masih FAIL, hantar juga ke owner tapi tanda jelas "⚠️ GAGAL REVIEW".
- PASS → teruskan.

## 6. Hantar ke owner
`scripts/telegram.sh send <folder kerja>`.
Kalau token Telegram tiada / gagal, beritahu owner path video dan ringkasan review dalam chat.

## 7. Commit
Commit fail teks dalam folder kerja (research.md, script.md, scenes.json, caption.txt, review.md). video.mp4 tak dicommit (gitignore).

## Laporan akhir kepada owner (ringkas)
Topik, hook, skor reviewer, status Telegram. Hantar juga video dalam chat (SendUserFile).
