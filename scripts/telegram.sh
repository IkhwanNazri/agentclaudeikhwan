#!/usr/bin/env bash
# Hantar hasil ke Telegram & baca keputusan approve/reject.
#   scripts/telegram.sh send content/<slug>     -> hantar video.mp4 + caption.txt + butang
#   scripts/telegram.sh check                   -> tulis status approve/reject ke content/<slug>/status.txt
#   scripts/telegram.sh chatid                  -> cari CHAT_ID kau (hantar /start ke bot dulu)
# Perlu: TELEGRAM_BOT_TOKEN dan TELEGRAM_CHAT_ID (dalam .env atau environment).
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && set -a && . ./.env && set +a
: "${TELEGRAM_BOT_TOKEN:?Set TELEGRAM_BOT_TOKEN dalam .env}"
API="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}"
# Chat ID mesti nombor; kalau env salah/kosong, guna config/telegram_chat_id
if ! [[ "${TELEGRAM_CHAT_ID:-}" =~ ^-?[0-9]+$ ]] && [ -f config/telegram_chat_id ]; then
  TELEGRAM_CHAT_ID="$(tr -d '[:space:]' < config/telegram_chat_id)"
fi

cmd="${1:-}"
case "$cmd" in
  send)
    dir="${2:?Usage: telegram.sh send content/<slug>}"
    : "${TELEGRAM_CHAT_ID:?Set TELEGRAM_CHAT_ID dalam .env}"
    slug="$(basename "$dir")"
    [ -f "$dir/video.mp4" ] || { echo "Tiada $dir/video.mp4"; exit 1; }
    video="$dir/video.mp4"
    # Had bot Telegram 50MB: mampat ikut bitrate supaya muat ~45MB
    if [ "$(stat -c %s "$video")" -gt 47000000 ]; then
      dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$video")"
      kbps="$(python3 -c "print(int(45*8*1024/float('$dur') - 160))")"
      echo "Video besar, mampat ke ~${kbps}kbps untuk Telegram..."
      ffmpeg -v error -y -i "$video" -c:v libx264 -preset medium -b:v "${kbps}k" -maxrate "${kbps}k" -bufsize "$((kbps*2))k" \
        -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart "$dir/video_telegram.mp4"
      video="$dir/video_telegram.mp4"
    fi
    caption="$(head -c 1000 "$dir/caption.txt" 2>/dev/null || echo "$slug")"
    review="$(head -c 3000 "$dir/review.md" 2>/dev/null || echo '-')"
    keyboard=$(printf '{"inline_keyboard":[[{"text":"✅ Approve","callback_data":"ok:%s"},{"text":"❌ Reject","callback_data":"no:%s"}]]}' "$slug" "$slug")
    curl -sS -f "$API/sendVideo" \
      -F chat_id="$TELEGRAM_CHAT_ID" \
      -F video=@"$video" \
      -F supports_streaming=true \
      -F caption="🎬 $slug

$caption" \
      -F reply_markup="$keyboard" > /dev/null
    curl -sS -f "$API/sendMessage" \
      --data-urlencode chat_id="$TELEGRAM_CHAT_ID" \
      --data-urlencode text="📝 Laporan reviewer ($slug):

$review

Balas dengan reply mesej video kalau nak minta ubah." > /dev/null
    echo "pending" > "$dir/status.txt"
    echo "Dihantar ke Telegram: $slug"
    ;;
  check)
    offset_file="content/.tg_offset"
    offset="$(cat "$offset_file" 2>/dev/null || echo 0)"
    resp="$(curl -sS -f "$API/getUpdates?offset=${offset}&timeout=0")"
    python3 - "$resp" "$offset_file" <<'PY'
import json, sys, os
data = json.loads(sys.argv[1]); off_file = sys.argv[2]
last = None
for u in data.get("result", []):
    last = u["update_id"]
    cq = u.get("callback_query")
    if cq and ":" in cq.get("data", ""):
        verdict, slug = cq["data"].split(":", 1)
        path = f"content/{slug}/status.txt"
        if os.path.isdir(f"content/{slug}"):
            open(path, "w").write("approved\n" if verdict == "ok" else "rejected\n")
            print(f"{slug}: {'approved' if verdict == 'ok' else 'rejected'}")
    msg = u.get("message") or {}
    rep = msg.get("reply_to_message") or {}
    if msg.get("text") and rep.get("caption", "").startswith("🎬 "):
        slug = rep["caption"].split("\n")[0][2:].strip()
        if os.path.isdir(f"content/{slug}"):
            with open(f"content/{slug}/feedback.md", "a") as f:
                f.write(msg["text"] + "\n")
            open(f"content/{slug}/status.txt", "w").write("revise\n")
            print(f"{slug}: revise -> {msg['text']}")
if last is not None:
    open(off_file, "w").write(str(last + 1))
PY
    ;;
  chatid)
    curl -sS -f "$API/getUpdates" | python3 -c 'import json,sys;[print(u["message"]["chat"]["id"], u["message"]["chat"].get("first_name","")) for u in json.load(sys.stdin)["result"] if "message" in u]'
    ;;
  *)
    sed -n '2,7p' "$0"; exit 1;;
esac
