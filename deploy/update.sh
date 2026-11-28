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
DB_PATH="${DATABASE_PATH:-data/masjid.db}"
cd "$PROJECT_DIR"

echo "==> Ambil kode terbaru: $BRANCH"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Install dependensi"
npm ci

echo "==> Backup database sebelum perubahan skema"
if [ -f "$DB_PATH" ]; then
  mkdir -p data/backups
  BACKUP_FILE="data/backups/masjid-$(date +%Y%m%d-%H%M%S).db"
  if BACKUP_FILE="$BACKUP_FILE" DB_PATH="$DB_PATH" node -e '
      const Database = require("better-sqlite3");
      const target = process.env.BACKUP_FILE;
      const source = process.env.DB_PATH;
      const sql = "VACUUM INTO \x27" + target.replace(/\x27/g, "\x27\x27") + "\x27";
      const db = new Database(source);
      db.exec(sql);
      db.close();
    ' 2>/dev/null; then
    echo "  tersimpan: $BACKUP_FILE"
  else
    echo "  VACUUM gagal, salin manual (layanan dihentikan sementara)..."
    sudo systemctl stop "$SERVICE"
    cp -a "$DB_PATH" "$BACKUP_FILE"
    for ext in -wal -shm; do
      [ -f "$DB_PATH$ext" ] && cp -a "$DB_PATH$ext" "$BACKUP_FILE$ext"
    done
    echo "  tersimpan: $BACKUP_FILE"
  fi
else
  echo "  $DB_PATH belum ada, dilewati."
fi

echo "==> Terapkan perubahan skema database"
npm run db:push

echo "==> Build produksi"
npm run build

echo "==> Restart layanan ($SERVICE)"
sudo systemctl restart "$SERVICE"

echo "==> Verifikasi"
sleep 3
LOCAL_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3200/ || true)
echo "  lokal :3200/ -> $LOCAL_CODE"
for path in /manifest.webmanifest /.well-known/assetlinks.json /api/mayar/webhook/demo; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN$path" || true)
  echo "  $path -> $code"
done

echo
echo "Selesai. Harapan status:"
echo "  / dan /manifest.webmanifest dan /.well-known/assetlinks.json = 200"
echo "  /api/mayar/webhook/demo = 401 (rute baru ada; tanpa token memang ditolak)"