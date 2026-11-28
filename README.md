# MasjidAmanah — Platform Transparansi Keuangan Masjid

Platform web untuk mengelola keuangan masjid secara transparan. Banyak masjid bisa mendaftar dan memakai bersama — setiap masjid punya halaman publik dan panel pengurus sendiri.

**Fitur untuk setiap masjid:**

- **Campaign donasi** — program penggalangan dana dengan target dan progress
- **Program donasi rutin** — donasi bulanan (operasional, beasiswa, dll.)
- **Tabungan Qurban** — pendaftaran peserta (kambing / sapi 1/7), pencatatan setoran cicilan, progres tabungan tampil di halaman publik
- **Pencatatan donasi** — input manual oleh pengurus, atau jamaah konfirmasi sendiri (upload bukti transfer) lalu diverifikasi pengurus
- **Pembayaran online (Mayar)** — donasi campaign bisa dibayar langsung via QRIS/VA/e-wallet; tercatat otomatis setelah pembayaran terkonfirmasi
- **Pencatatan pengeluaran** — dengan bukti nota dan kategori
- **Laporan keuangan bulanan** — dibuat dari rekap otomatis, dipublikasikan sebagai bentuk pertanggungjawaban
- **Halaman publik** — jamaah bisa melihat program, tabungan qurban, buku kas, dan laporan yang sudah dipublikasikan
- **Jadwal sholat realtime** — widget di beranda publik dengan hitung mundur ke adzan berikutnya; koordinat masjid, zona waktu, metode (Kemenag/MWL), dan koreksi menit diatur di Pengaturan
- **Arah kiblat** — kompas penunjuk kiblat di beranda publik, dihitung dari koordinat masjid; mengikuti sensor kompas perangkat bila tersedia, dengan mode statis dan opsi memakai lokasi pengguna
- **Export CSV** — data donasi, pengeluaran, dan laporan bisa diunduh

**Fitur platform (super-admin):**

- Pendaftaran masjid mandiri — masjid baru langsung aktif dengan **uji coba gratis 30 hari**
- **Infaq Aplikasi** — setelah uji coba, masa aktif panel diperpanjang dengan infaq sukarela (paket 1 / 6 / 12 bulan). Panel terkunci bila masa aktif habis, tetapi halaman publik tetap tayang
- **Mode demo** — halaman `/demo` untuk mencoba seluruh fitur tanpa mendaftar (masuk otomatis sebagai pengurus masjid contoh, data akan direset otomatis)
- **Pengaturan platform** — nominal infaq bulanan, masa uji coba, rekening infaq, kontak

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

# 5. Isi data awal (akun super-admin + pengaturan platform)
npm run db:seed

# 6. Jalankan aplikasi
npm run dev
```

Buka **http://localhost:3000**.

**Login awal:**

| Peran | Email | Password | Akses |
|---|---|---|---|
| Super-admin | `admin@masjid.id` | `admin123` | Panel platform `/superadmin` + panel masjid Masjid Al-Ikhlas |
| Pengurus masjid | dibuat saat mendaftar di `/daftar` | — | Panel masjid sendiri |

> Segera ganti password `admin123` di menu **Pengaturan → Akun Pengurus** setelah login pertama.

**Ingin data contoh lengkap?** Jalankan `npm run db:seed-demo`. Akan dibuat:

- **Masjid Al-Ikhlas** — contoh masjid lengkap (program, ±85 donasi, pengeluaran, 2 laporan bulanan, program qurban + peserta)
- **Masjid Nurul Iman** — contoh masjid yang masa aktifnya sudah habis (untuk melihat layar kunci + alur perpanjangan infaq)
- **Masjid Baiturrahman (Demo)** — masjid untuk mode demo di `/demo`

Akun tambahan dari seed: `demo@masjidamanah.id / demo123` (pengurus masjid demo), `nuruliman@masjid.id / nurul123` (pengurus masjid kadaluarsa).

### Halaman penting

**Platform:**

| Halaman | URL |
|---|---|
| Beranda platform | `/` |
| Daftar masjid | `/masjid` |
| Daftarkan masjid baru | `/daftar` |
| Info & konfirmasi Infaq Aplikasi | `/infaq` |
| Coba demo (masuk otomatis) | `/demo` |
| Panel super-admin | `/superadmin` |

**Per masjid** (contoh untuk masjid demo):

| Halaman | URL |
|---|---|
| Beranda masjid | `/m/demo` |
| Daftar program | `/m/demo/program` |
| Tabungan qurban | `/m/demo/qurban` |
| Konfirmasi donasi oleh jamaah | `/m/demo/donasi/konfirmasi` |
| Laporan bulanan publik | `/m/demo/laporan` |
| Buku kas transparansi | `/m/demo/transparansi` |
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

## 2. Tabungan Qurban

Menu **Tabungan Qurban** di panel pengurus:

1. Buat program qurban (judul, harga kambing dan/atau harga sapi per 1/7, target selesai)
2. Jamaah mendaftar lewat halaman publik `/m/<slug>/qurban` — pendaftaran masuk berstatus *Menunggu*
3. Pengurus **Setujui** atau **Tolak** pendaftar di menu qurban → *Kelola Peserta*
4. Catat setoran cicilan peserta (nominal, tanggal, metode, bukti opsional) di halaman detail peserta
5. Progres tabungan dan daftar peserta tampil otomatis di halaman publik qurban

Uang qurban dicatat terpisah dari kas operasional — hanya tercatat di tabungan qurban.

---

## 3. Masa aktif & Infaq Aplikasi

- Setiap masjid baru mendapat **uji coba gratis** (bawaan: 30 hari, bisa diubah super-admin)
- Setelah itu, masa aktif diperpanjang dengan **Infaq Aplikasi** sukarela — paket **1, 6, atau 12 bulan** (nominal disetel super-admin di **Pengaturan Platform**)
- Cara perpanjang: pengurus buka menu **Infaq Aplikasi** di panel → transfer ke rekening infaq → unggah bukti → super-admin verifikasi → masa aktif otomatis ditambah
- Bila masa aktif habis: **panel pengurus terkunci sementara** (muncul layar "Masa aktif panel berakhir" + tombol kirim infaq), tetapi **halaman publik masjid tetap tayang** untuk jamaah dan datanya utuh
- Super-admin juga bisa memperpanjang manual atau menjadikan masjid **tanpa batas** dari `/superadmin/masjid`

---

## 4. Panel super-admin

Buka `/superadmin` (login dengan akun super-admin):

| Menu | Fungsi |
|---|---|
| Ringkasan | Statistik platform: jumlah masjid, masa aktif, infaq menunggu verifikasi |
| Masjid Terdaftar | Cari masjid, perpanjang masa aktif manual, aktif/nonaktifkan masjid |
| Infaq Aplikasi | Verifikasi / tolak konfirmasi infaq dari pengurus |
| Pengaturan Platform | Nominal infaq bulanan, masa uji coba, rekening infaq, kontak |

---

## 5. Mengelola data

Semua data tersimpan di dalam folder `data/`:

| File / folder | Isi |
|---|---|
| `data/masjid.db` | Seluruh data (masjid, program, donasi, qurban, pengeluaran, laporan, akun, infaq) |
| `data/uploads/` | Bukti transfer dan foto nota yang diunggah |

**Backup = cukup salin seluruh folder `data/`** (lakukan rutin, misalnya tiap minggu).

**Reset data demo** (mis. sebelum memperagakan ke orang lain): `npm run demo:reset` — hanya menghapus dan membuat ulang masjid demo, masjid lain tidak tersentuh.

---

## 6. Menaruh di VPS (agar bisa diakses dari internet)

Contoh nyata pemasangan di VPS Ubuntu (RAM 1–2 GB). Prinsip penting: **aplikasi ini berjalan terpisah** dari aplikasi lain di server yang sama — folder, port, service, dan database sendiri.

```bash
# Di VPS, salin folder proyek (tanpa node_modules) ke /opt/masjid-amanah, mis:
#   rsync -av --exclude node_modules --exclude .next --exclude data ./ ubuntu@IP:/opt/masjid-amanah/

cd /opt/masjid-amanah
npm ci

# Buat .env
cat > .env <<'EOF'
AUTH_SECRET=<hasil node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
COOKIE_SECURE=false
EOF

npm run db:push
npm run build
```

Jalankan lewat **systemd** (contoh unit ada di `deploy/masjid-amanah.service`, port 3200):

```bash
sudo cp deploy/masjid-amanah.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now masjid-amanah
```

Buka `http://IP-VPS:3200`.

**Update aplikasi di kemudian hari** (setelah ada perubahan kode):

```bash
# salin file sumber terbaru ke /opt/masjid-amanah (kecuali data/ dan .env), lalu:
cd /opt/masjid-amanah
npm ci && npm run build && sudo systemctl restart masjid-amanah
```

> **Jangan hapus folder `data/` di VPS** — itu isi database dan bukti upload. Backup = salin folder `data/`.
> Setelah update kode, jalankan `npm run db:push` bila ada perubahan skema.

**Penting saat sudah online:**

- Jika sudah memakai **HTTPS** (misalnya lewat Nginx/Caddy + domain), ubah `COOKIE_SECURE=true` di `.env` agar cookie login hanya dikirim melalui koneksi aman.
- Kalau diakses lewat IP dengan HTTP biasa, biarkan `COOKIE_SECURE=false` — kalau tidak, login akan selalu gagal.
- Upload bukti transfer dibatasi 5 MB per file (format jpg/png/webp/pdf). Batas ukuran request ada di `next.config.ts` bila ingin disesuaikan.
- Ganti password `admin123` **dan** password akun demo/seed segera setelah aplikasi diakses publik.

---

## 7. Pembayaran Online (Mayar)

Halaman campaign bisa menampilkan tombol **Donasi Online** agar jamaah membayar langsung lewat [Mayar](https://mayar.id) (QRIS, virtual account, e-wallet). Donasi tercatat **otomatis sebagai terverifikasi** setelah pembayaran dikonfirmasi.

**Aktifkan (per masjid):**

1. Buat akun Mayar, lalu buat **API Key** dengan akses **Read & Write** di <https://web.mayar.id/api-keys>.
2. Masuk panel → **Pengaturan → Pembayaran Online (Mayar)**.
3. Tempel API Key, centang *Aktifkan tombol donasi online*, lalu klik **Simpan & Hubungkan**. API Key diverifikasi ke Mayar sebelum disimpan (tidak pernah ditampilkan utuh lagi).
4. Salin **URL Webhook** yang muncul. Buka dashboard Mayar → **Integrasi → Webhook**, tempel URL tersebut, simpan, lalu klik **Test URL** sampai statusnya `SUCCESS`.

**Cara kerjanya:**

- Donatur mengisi nominal di halaman campaign → server membuat *payment request* di Mayar (`POST /hl/v2/payments/create`) dan menyimpan tagihan di tabel `mayar_payments`.
- Setelah membayar, Mayar memanggil webhook `payment.received`. Server memeriksa token rahasia di URL, lalu **memverifikasi ulang** status pembayaran ke API Mayar sebelum mencatat donasi (request palsu tidak bisa mengklaim pembayaran).
- Donasi disimpan dengan metode **Pembayaran Online**, status *terverifikasi*, dan otomatis muncul di laporan. Webhook yang terkirim berulang tidak menggandakan donasi.

**Catatan:**

- URL webhook memuat token rahasia (`?token=...`) — jangan dibagikan. Tombol **Putuskan Koneksi** menghapus API Key dan token.
- Bila server berada di balik proxy, pastikan header `X-Forwarded-Host`/`X-Forwarded-Proto` diteruskan (Caddy/Nginx default sudah). Bisa juga set `APP_URL=https://masjid-app.my.id` di `.env` agar URL webhook & redirect pasti benar.
- Untuk uji coba tanpa uang sungguhan, gunakan akun sandbox Mayar dan set `MAYAR_API_BASE=https://api.mayar.club/hl/v2` (default produksi: `https://api.mayar.id/hl/v2`).

---

## 8. APK Android (TWA)

Selain dibuka lewat peramban, aplikasi ini bisa dipasang sebagai aplikasi Android. Proyeknya ada di folder `android/` dan memakai pola **Trusted Web Activity (TWA)**: APK membuka situs **https://masjid-app.my.id** layar penuh memakai Chrome, sehingga server tetap harus online.

**Sekali saja: pastikan situs sudah menyajikan berkas PWA**

- `https://masjid-app.my.id/manifest.webmanifest` (dibuat otomatis dari `src/app/manifest.ts`)
- `https://masjid-app.my.id/.well-known/assetlinks.json` (berisi `package_name` = `id.masjidamanah.app` dan sidik jari sertifikat penandatangan APK)

Kalau `assetlinks.json` belum ada atau sidik jarinya tidak cocok, aplikasi tetap terbuka tetapi memakai bilah alamat peramban (belum layar penuh).

**Build APK / AAB**

Butuh JDK 17+ dan Android SDK (platform 34, build-tools 34.0.0).

```bash
cd android
export ANDROID_HOME=/path/ke/android-sdk
export KEYSTORE_PATH=$PWD/keystore/masjidamanah-release.jks
export KEYSTORE_PASSWORD=...
export KEY_PASSWORD=...
export KEY_ALIAS=masjidamanah

gradle assembleRelease   # APK -> app/build/outputs/apk/release/app-release.apk
gradle bundleRelease     # AAB -> app/build/outputs/bundle/release/app-release.aab
```

**Naikkan versi** setiap rilis baru: ubah `versionCode` dan `versionName` di `android/app/build.gradle`.

**Ganti alamat awal aplikasi** (misalnya langsung ke satu masjid): ubah `start_url`/`scope` di `src/app/manifest.ts` dan `android.support.customtabs.trusted.DEFAULT_URL` di `android/app/src/main/AndroidManifest.xml`.

**Penting soal keystore:** file `android/keystore/*.jks` sengaja tidak masuk git. Simpan cadangannya di tempat aman — tanpa keystore yang sama, aplikasi tidak bisa di-update di Play Store. Jika memakai keystore baru, perbarui `sha256_cert_fingerprints` di `public/.well-known/assetlinks.json`, deploy ulang, lalu build ulang APK.

---

## 9. Referensi perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Jalankan mode pengembangan (localhost:3000) |
| `npm run build` | Build untuk produksi |
| `npm run start` | Jalankan hasil build produksi |
| `npm run db:push` | Terapkan skema ke database (setelah update kode) |
| `npm run db:seed` | Isi data awal (super-admin + pengaturan platform) |
| `npm run db:seed-demo` | Isi data contoh lengkap (3 masjid: lengkap, kadaluarsa, demo) |
| `npm run demo:reset` | Reset khusus masjid demo |
| `npm run db:studio` | Buka browser GUI untuk melihat isi database |
| `npm run lint` | Periksa kualitas kode |

## 10. Struktur singkat

```
src/
  app/
    (platform)/      beranda platform, /masjid, /daftar, /infaq, /demo
    m/[mosque]/      halaman publik per masjid (program, qurban, laporan, dll.)
    admin/           login + panel pengurus masjid (termasuk qurban & infaq)
    superadmin/      panel platform (kelola masjid, verifikasi infaq)
    api/             export CSV, penyajian file upload
  components/        komponen tampilan bersama
  lib/               skema database, query, auth, format, upload
scripts/             seed data & reset demo (lib-seed, seed-base, seed-demo, reset-demo)
data/                database SQLite + file upload (jangan dihapus)
```
