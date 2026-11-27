#!/usr/bin/env bash
# Perbarui aplikasi MasjidAmanah di VPS, lalu verifikasi hasil deploy.
#
# Pakai (dari folder proyek, di VPS):
#   bash deploy/update.sh              # memakai branch fitur terbaru
#   bash deploy/update.sh main         # atau branch lain
#
# Catatan: kalau ada perubahan lokal yang belum di-commit, script akan berhenti
# (git pull --ff-only gagal). Commit/stash dulu perubahan tersebut.
set -euo pipefail

BRANCH="${1:-qoder/general-session-tdi70j}"
DOMAIN="${DOMAIN:-https://masjid-app.my.id}"
SERVICE="${SERVICE:-masjid-amanah}"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "==> Ambil kode terbaru: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Install dependensi"
npm ci

echo "==> Build produksi"
npm run build

echo "==> Restart layanan ($SERVICE)"
sudo systemctl restart "$SERVICE"

echo "==> Verifikasi endpoint publik"
sleep 3
for path in /manifest.webmanifest /.well-known/assetlinks.json; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$path" || true)
  echo "  $path -> $code"
done

echo
echo "Selesai. Kedua endpoint di atas harus 200 sebelum APK diuji ulang."
