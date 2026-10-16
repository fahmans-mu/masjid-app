# MasjidAmanah — Aplikasi Transparansi Keuangan Masjid

Aplikasi web untuk mengelola keuangan masjid secara transparan:

- **Campaign donasi** — buat program penggalangan dana dengan target dan progress
- **Program donasi rutin** — kelola donasi bulanan (operasional, beasiswa, dll.)
- **Pencatatan donasi** — input manual oleh pengurus, atau jamaah konfirmasi sendiri (upload bukti transfer) lalu diverifikasi pengurus
- **Pencatatan pengeluaran** — dengan bukti nota dan kategori
- **Laporan keuangan bulanan** — dibuat dari rekap otomatis, dipublikasikan sebagai bentuk pertanggungjawaban
- **Halaman publik** — jamaah bisa melihat program, buku kas, dan laporan yang sudah dipublikasikan

Dibangun dengan Next.js 15 + SQLite. Cukup satu komputer/server, tanpa layanan berbayar.

---

## 1. Menjalankan di komputer lokal

**Syarat:** Node.js versi 20 ke atas ([nodejs.org](https://nodejs.org)). Cek dengan:

```bash
node -v
```

**Langkah-langkah** (jalankan dari folder proyek):

```bash
# 1. Install dependensi (sekali saja)
npm install

# 2. Buat file pengaturan
cp .env.example .env

# 3. Buat kunci rahasia sesi login, lalu salin hasilnya ke AUTH_SECRET di file .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. Buat struktur database
npm run db:push

# 5. Isi data awal (akun admin + 12 kategori bawaan)
npm run db:seed

# 6. Jalankan aplikasi
npm run dev
```

Buka **http://localhost:3000**.

**Login admin awal:**

| Email | Password |
|---|---|
| `admin@masjid.id` | `admin123` |

> Segera ganti password ini di menu **Pengaturan → Akun Pengurus** setelah login pertama.

**Ingin data contoh untuk uji coba?** Jalankan `npm run db:seed-demo` (hanya bisa dijalankan pada database kosong). Akan diisi 5 program, ±85 donasi, 17 pengeluaran, dan 2 laporan bulanan.

### Halaman penting

| Halaman | URL |
|---|---|
| Beranda publik | `/` |
| Daftar program | `/program` |
| Konfirmasi donasi oleh jamaah | `/donasi/konfirmasi` |
| Laporan bulanan publik | `/laporan` |
| Buku kas transparansi | `/transparansi` |
| Login pengurus | `/admin/login` |
| Panel pengurus | `/admin` |

### Alur kerja bulanan yang disarankan

1. Catat donasi yang masuk melalui menu **Donasi → Input Donasi** (langsung terverifikasi)
2. Jamaah yang konfirmasi mandiri akan muncul berstatus *Menunggu Verifikasi* — periksa buktinya, lalu **Verifikasi** atau **Tolak**
3. Catat pengeluaran di menu **Pengeluaran** (lampirkan foto nota)
4. Di awal bulan berikutnya, buka **Laporan**, pilih bulan yang akan ditutup, klik **Buat Draf Laporan**
5. Periksa angka dan sambutan, lalu **Publikasikan** — laporan langsung tampil di halaman publik
6. Data mentah juga bisa diunduh sebagai CSV dari tombol **Export CSV** di tiap menu

---

## 2. Mengelola data

Semua data tersimpan di dalam folder `data/`:

| File / folder | Isi |
|---|---|
| `data/masjid.db` | Seluruh data (program, donasi, pengeluaran, laporan, akun) |
| `data/uploads/` | Bukti transfer dan foto nota yang diunggah |

**Backup = cukup salin seluruh folder `data/`** (lakukan rutin, misalnya tiap minggu).

---

## 3. Menaruh di VPS (agar bisa diakses dari internet)

Syarat: VPS **Ubuntu 22.04 / 24.04** (spesifikasi minimal 1 GB RAM). Cara termudah — kirim file `deploy/masjid-amarah-vps.tar.gz` ke VPS lalu jalankan script otomatis:

```bash
# Di VPS (sebagai root):
mkdir -p /opt/masjid
tar -xzf masjid-amarah-vps.tar.gz -C /opt/masjid
bash /opt/masjid/deploy/setup-vps.sh
```

Script `deploy/setup-vps.sh` akan otomatis: set timezone Asia/Jakarta, membuat swap 2 GB (untuk VPS RAM kecil), meng-install Node.js 24, `npm ci`, membuat `.env` dengan `AUTH_SECRET` acak baru, `npm run build`, lalu menjalankan aplikasi lewat **pm2** di **port 80** + auto-start saat VPS reboot. Setelah selesai, buka `http://IP-VPS`.

Tanpa script (manual), langkahnya: `npm ci` → buat `.env` (lihat bagian 1) → `npm run build` → `pm2 start ecosystem.config.js` → `pm2 save`.

**Update aplikasi di kemudian hari** (setelah ada perubahan kode):

```bash
# salin file sumber terbaru ke /opt/masjid (kecuali data/ dan .env), lalu:
cd /opt/masjid
npm ci && npm run build && pm2 restart masjid
```

> **Jangan hapus folder `data/` di VPS** — itu isi database dan bukti upload. Backup = salin folder `data/`.

**Penting saat sudah online:**

- Jika sudah memakai **HTTPS** (misalnya lewat Nginx/Caddy + domain), ubah `COOKIE_SECURE=true` di `.env` agar cookie login hanya dikirim melalui koneksi aman.
- Kalau diakses lewat IP dengan HTTP biasa, biarkan `COOKIE_SECURE=false` — kalau tidak, login akan selalu gagal.
- Upload bukti transfer dibatasi 5 MB per file (format jpg/png/webp/pdf). Batas ukuran request ada di `next.config.ts` bila ingin disesuaikan.
- Ganti password `admin123` segera setelah aplikasi diakses publik.

---

## 4. Referensi perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode pengembangan (localhost:3000) |
| `npm run build` | Build untuk produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run db:push` | Terapkan skema ke database (setelah update kode) |
| `npm run db:seed` | Isi data awal (admin + kategori) |
| `npm run db:seed-demo` | Isi data contoh untuk uji coba |
| `npm run db:studio` | Buka browser GUI untuk melihat isi database |
| `npm run lint` | Periksa kualitas kode |

## 5. Struktur singkat

```
src/
  app/
    (public)/        halaman publik (beranda, program, laporan, transparansi)
    admin/           login + panel pengurus
    api/             export CSV, penyajian file upload
  components/        komponen tampilan bersama
  lib/               skema database, query, auth, format, upload
scripts/             seed data awal & demo
data/                database SQLite + file upload (jangan dihapus)
```

Arsitektur sengaja dibuat satu masjid lebih dulu, namun tabel sudah dirancang agar bisa dikembangkan ke multi-masjid tanpa perombakan besar.
