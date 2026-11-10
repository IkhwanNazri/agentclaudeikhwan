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

## Fail penting
- `config/brand.md` — niche, tone, gaya (owner isi). Sumber kebenaran untuk semua agent.
- `config/spec.json` — spek teknikal render (saiz, fps, warna, animasi dibenarkan).
- `pipeline/render.mjs` — scenes.json → mp4 (Playwright + ffmpeg). `--preview` untuk HTML sahaja.
- `scripts/telegram.sh` — `send`, `check`, `chatid`.
- `content/<tarikh>-<slug>/` — satu folder setiap video.

## Peraturan
- Jangan reka fakta; semua fakta perlu sumber dalam research.md.
- Jangan commit `.env` atau `*.mp4`.
- Owner berkomunikasi dalam Bahasa Melayu santai — balas dalam BM.
