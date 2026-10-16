#!/usr/bin/env bash
# =============================================================
# Setup otomatis MasjidAmanah di VPS Ubuntu (22.04 / 24.04)
# Cara pakai (sebagai root, dari folder proyek):
#   bash deploy/setup-vps.sh
# Script ini: set timezone, buat swap, install Node 24,
# install dependensi, buat .env, siapkan database, build,
# lalu jalankan lewat systemd di port 3200.
# =============================================================
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

log() { echo -e "\n==> $1"; }

if [ "$(id -u)" -ne 0 ]; then
  echo "Jalankan script ini sebagai root (mis: sudo bash deploy/setup-vps.sh)"
  exit 1
fi

log "1/7 Set timezone ke Asia/Jakarta"
timedatectl set-timezone Asia/Jakarta || true

log "2/7 Cek RAM & buat swap 2GB bila belum ada"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "Swap 2GB dibuat."
else
  echo "Swap sudah ada, dilewati."
fi

log "3/7 Install paket dasar (build tools + curl)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y ca-certificates curl gnupg build-essential python3

log "4/7 Install Node.js 24 (NodeSource)"
if command -v node >/dev/null 2>&1 && node -v | grep -q '^v2[0-9]'; then
  echo "Node $(node -v) sudah terpasang, dilewati."
else
  curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
  apt-get install -y nodejs
fi
node -v
npm -v

log "5/7 Install dependensi + buat file .env"
npm ci || npm install
if [ ! -f .env ]; then
  SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  {
    echo "# Dibuat otomatis oleh setup-vps.sh"
    echo "AUTH_SECRET=$SECRET"
    echo "COOKIE_SECURE=false"
  } > .env
  echo "File .env dibuat dengan AUTH_SECRET baru."
else
  echo ".env sudah ada, dibiarkan."
fi

log "6/7 Siapkan database + build produksi (butuh beberapa menit di VPS kecil)"
npm run db:push
npm run build

log "7/7 Jalankan dengan systemd (port 3200, auto-start saat VPS reboot)"
SERVICE_USER=$(stat -c '%U' "$PROJECT_DIR")
sed "s#User=ubuntu#User=$SERVICE_USER#; s#WorkingDirectory=.*#WorkingDirectory=$PROJECT_DIR#" \
  deploy/masjid-amanah.service > /etc/systemd/system/masjid-amanah.service
systemctl daemon-reload
systemctl enable --now masjid-amanah

echo ""
echo "==> Menunggu aplikasi siap..."
for i in $(seq 1 30); do
  CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3200/ || true)
  [ "$CODE" = "200" ] && break
  sleep 1
done

IP=$(hostname -I | awk '{print $1}')
echo ""
echo "======================================================"
echo " SELESAI!"
echo " Cek status : systemctl status masjid-amanah"
echo " Cek log    : journalctl -u masjid-amanah -f"
echo " Buka       : http://$IP:3200   (status terakhir: $CODE)"
echo ""
echo " Login super-admin: admin@masjid.id / admin123"
echo " PENTING! Segera ganti password di menu Pengaturan."
echo "======================================================"
