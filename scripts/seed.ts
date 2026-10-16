import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ensurePlatformSettings,
  wipeAll,
} from "./lib-seed";
import { seedAlIkhlas, seedNurulIman } from "./seed-base";

async function main() {
  console.log("Menyiapkan data awal MasjidAmanah (multi-masjid)...");
  console.log("\n[1/3] Membersihkan database...");
  wipeAll();

  console.log("\n[2/3] Pengaturan platform...");
  ensurePlatformSettings();
  console.log("  + pengaturan platform dibuat");

  console.log("\n[3/3] Membuat masjid contoh...");
  await seedAlIkhlas();
  console.log("  + Masjid Al-Ikhlas (lengkap: 5 program, transaksi, laporan, tabungan qurban)");
  await seedNurulIman();
  console.log("  + Masjid Nurul Iman (masa aktif habis + infaq menunggu verifikasi)");

  console.log("\nSelesai! Jalankan: npm run dev");
  console.log(`\n  Login super-admin : ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("  Login Nurul Iman  : nuruliman@masjid.id / nurul123 (panel terkunci)");
  console.log("  Halaman publik    : /m/al-ikhlas dan /m/nurul-iman");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
