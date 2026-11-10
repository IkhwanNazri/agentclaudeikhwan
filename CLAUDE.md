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

## Prinsip kos sifar
Jangan tambah API berbayar atau set API key berbayar. Kalau sesuatu perlukan bayaran, beritahu owner dan cari alternatif percuma.

## Fail penting
- `config/brand.md` — niche, tone, gaya (owner isi). Sumber kebenaran untuk semua agent.
- `config/spec.json` — spek teknikal render (saiz, fps, warna, animasi dibenarkan).
- `pipeline/render.mjs` — validasi scenes.json → render mp4 guna Remotion.
- `video/` — projek Remotion (`video/src/TikTokVideo.tsx`). `cd video && npm run studio` untuk preview.
- `video/src/LowPoly3D.tsx` — latar 3D low-poly gaya PS2 (Three.js).
- `video/src/Rigged.tsx` — watak 3D rigged KayKit (CC0) + klip animasi, seek ikut frame. Model dalam `video/public/models/`.
- `video/src/Sets3D.tsx` — set gaya voxel / paper (room, office, street, studio).
- `pipeline/tts.mjs` — suara Gemini TTS (Leda), key `GEMINI_API_KEY` dari AI Studio (percuma).
- `scripts/telegram.sh` — `send`, `check`, `chatid`.
- `content/<tarikh>-<slug>/` — satu folder setiap video.

## Peraturan
- Jangan reka fakta; semua fakta perlu sumber dalam research.md.
- Jangan commit `.env` atau `*.mp4`.
- Owner berkomunikasi dalam Bahasa Melayu santai — balas dalam BM.
- Jawapan ringkas, tepat, efisien. Tiada penerangan panjang kecuali diminta.
- Jimat token: elak kerja/research berlebihan.
