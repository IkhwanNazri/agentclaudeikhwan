#!/usr/bin/env bash
# Pasang skill komuniti (percuma, open-source) ke .claude/skills/.
# Versi dikunci (commit) supaya hasil konsisten. Jalankan semula untuk repair.
#   scripts/install-skills.sh           -> pasang yang belum ada
#   scripts/install-skills.sh --update  -> paksa pasang semula
set -euo pipefail
cd "$(dirname "$0")/.."
DEST=".claude/skills"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FORCE="${1:-}"

# repo | commit | path-dalam-repo | nama-skill | untuk agent
SKILLS=(
  "mvanhorn/last30days-skill|c567827|skills/last30days|last30days|researcher"
  "coreyhaines31/marketingskills|9d6d7ce|skills/social|social|researcher+writer"
  "nidhinjs/prompt-master|49b3a72|.|prompt-master|writer"
  "Jakeschincariol/youtube-agent-skill|a2feb21|skills/yt-script|yt-script|writer"
  "coreyhaines31/marketingskills|9d6d7ce|skills/copy-editing|copy-editing|writer+reviewer"
  "coreyhaines31/marketingskills|9d6d7ce|skills/marketing-psychology|marketing-psychology|reviewer"
  "remotion-dev/skills|1af7e69|skills/remotion-best-practices|remotion-best-practices|maker"
)

clone() { # repo commit -> dir
  local repo="$1" commit="$2" dir="$TMP/${1//\//__}"
  if [ ! -d "$dir" ]; then
    git clone -q --filter=blob:none "https://github.com/$repo.git" "$dir"
    git -C "$dir" checkout -q "$commit"
  fi
  echo "$dir"
}

for entry in "${SKILLS[@]}"; do
  IFS='|' read -r repo commit path name role <<<"$entry"
  if [ -f "$DEST/$name/SKILL.md" ] && [ "$FORCE" != "--update" ]; then
    echo "✓ $name (dah ada)"; continue
  fi
  dir="$(clone "$repo" "$commit")"
  rm -rf "${DEST:?}/$name"
  mkdir -p "$DEST/$name"
  if [ "$path" = "." ]; then
    cp -r "$dir"/SKILL.md "$dir"/references "$DEST/$name/" 2>/dev/null || cp -r "$dir"/SKILL.md "$DEST/$name/"
  else
    cp -r "$dir/$path/." "$DEST/$name/"
  fi
  # Simpan lesen & asal-usul bersama skill
  for lic in LICENSE LICENSE.md LICENSE.txt; do [ -f "$dir/$lic" ] && cp "$dir/$lic" "$DEST/$name/UPSTREAM_$lic"; done
  echo "$repo@$commit ($path) — untuk: $role" > "$DEST/$name/UPSTREAM.txt"
  echo "✓ $name  ← $repo ($role)"
done

# Remotion: pasang dependency video kalau belum
if [ ! -d video/node_modules ]; then
  echo "Pasang dependency Remotion (video/)..."
  (cd video && npm ci --silent)
fi
echo "Siap. Skill dalam $DEST/"
