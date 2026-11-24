# Agent Konten TikTok

Sistem multi-agent untuk hasilkan video TikTok animasi. Owner hanya approve sebelum post.

## Aliran
```
researcher → writer → maker → reviewer → Telegram (owner approve) → owner post manual
                 ↑________ feedback.md (FAIL / revise) ________|
```

| Agent | Fail | Output |
|---|---|---|
| researcher | `.claude/agents/researcher.md` | `research.md` |
| writer | `.claude/agents/writer.md` | `script.md`, `caption.txt` |
| maker | `.claude/agents/maker.md` | `scenes.json`, `video.mp4` |
| reviewer | `.claude/agents/reviewer.md` | `review.md`, `feedback.md` |

Orchestrator: skill `/buat-konten` (`.claude/skills/buat-konten/SKILL.md`).

## Skill komuniti (semua percuma & open-source)
Dipasang oleh `scripts/install-skills.sh` (versi dikunci, tidak dicommit):

| Skill | Repo | Agent |
|---|---|---|
| last30days | mvanhorn/last30days-skill | researcher |
| social | coreyhaines31/marketingskills | researcher, writer |
| yt-script | Jakeschincariol/youtube-agent-skill | writer |
| prompt-master | nidhinjs/prompt-master | writer |
| copy-editing | coreyhaines31/marketingskills | writer, reviewer |
| marketing-psychology | coreyhaines31/marketingskills | reviewer |
| remotion-best-practices | remotion-dev/skills | maker |

## Gaya video (keputusan owner — jangan lupa)
- **TERKINI (24 Nov 2026) — gaya diluluskan owner, baca `docs/podcast-2d.md` DULU:**
  - Gaya seni: kartun 2D kertas potong (garis hitam tebal, tekstur kertas, seram sinematik). Gambar DIJANA OWNER (ChatGPT/Gemini), aku hanya hidupkan. JANGAN lukis/generate watak sendiri.
  - Podcast: `RefPodcast` dari gambar owner (`video/public/placthinc/opening.png`), co-host Leda + host Achird, lip-sync, tiada batang kayu, ajak "follow".
  - Cerita: `StoryScene` (gambar menegak 9:16 setiap babak, versi A/B untuk kejutan), narasi Achird, watak ikut `content/2026-11-23-bilik-378/ref/watak-cerita.png`.
  - Episod: komposisi `Episode` (podcast + cerita). Sari kata tengah skrin tanpa jeda. SFX rakaman sebenar CC0 (bukan sintetik). Render 2D, hantar Telegram.
  - Contoh lengkap: `content/2026-11-23-bilik-378/episod.json`.
- Default: **teater boneka kertas 3D** (`PuppetShow`). Baca `docs/puppet-show.md` sebelum buat video.
- Pembukaan 2 pengacara → tirai buka → cerita. Tangan dalang gaya kertas dengan jari jelas.
- **Tiada ayat "Follow" di akhir.** Panjang 45-60 saat.
- **Cerita seram = tema PLACTHINC** (`"theme": "placthinc"`): dua pengacara rasmi (host lelaki cermin mata + co-host tudung pink) WAJIB muncul dalam semua babak. Set `podcast`/`seram`, lihat `docs/puppet-show.md`.
- Video siap → `scripts/telegram.sh send` (owner tengok di Telegram dari HP).

## Prinsip kos sifar
Jangan tambah API berbayar atau set API key berbayar. Kalau sesuatu perlukan bayaran, beritahu owner dan cari alternatif percuma.

## Fail penting
- `config/brand.md` — niche, tone, gaya (owner isi). Sumber kebenaran untuk semua agent.
- `config/spec.json` — spek teknikal render (saiz, fps, warna, animasi dibenarkan).
- `pipeline/render.mjs` — validasi scenes.json → render mp4 guna Remotion.
- `video/` — projek Remotion (`video/src/TikTokVideo.tsx`). `cd video && npm run studio` untuk preview.
- `video/src/PuppetShow.tsx` + `video/src/puppet/kit.tsx` — gaya utama teater boneka kertas 3D (set, boneka, tangan, pentas).
- `docs/puppet-show.md` — panduan PuppetShow: kehendak owner, format scenes.json, senarai set, langkah render.
- `video/src/LowPoly3D.tsx` — latar 3D low-poly gaya PS2 (gaya lama).
- `pipeline/tts.mjs` — suara Gemini TTS (Leda), key `GEMINI_API_KEY` dari AI Studio (percuma).
- `scripts/telegram.sh` — `send`, `check`, `chatid`. Chat ID betul dalam `config/telegram_chat_id`.
- `content/<tarikh>-<slug>/` — satu folder setiap video.

## Peraturan
- Jangan reka fakta; semua fakta perlu sumber dalam research.md.
- Jangan commit `.env` atau `*.mp4`.
- Owner berkomunikasi dalam Bahasa Melayu santai — balas dalam BM.
- Jawapan ringkas, tepat, efisien. Tiada penerangan panjang kecuali diminta.
- Jimat token: elak kerja/research berlebihan.
