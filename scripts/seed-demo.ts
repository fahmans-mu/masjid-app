import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_SLUG,
  ensurePlatformSettings,
  wipeAll,
} from "./lib-seed";
import { seedAlIkhlas, seedDemoMosque, seedNurulIman } from "./seed-base";

async function main() {
  console.log("Menyiapkan data demo lengkap...");
  console.log("\n[1/3] Membersihkan database...");
  wipeAll();

  console.log("\n[2/3] Pengaturan platform + masjid contoh...");
  ensurePlatformSettings();
  await seedAlIkhlas();
  await seedNurulIman();
  console.log("  + Masjid Al-Ikhlas & Masjid Nurul Iman dibuat");

  console.log("\n[3/3] Masjid demo...");
  await seedDemoMosque();
  console.log("  + Masjid Baiturrahman (Demo) — program, transaksi, laporan, qurban, infaq pending");

  console.log("\nSelesai! Jalankan: npm run dev");
  console.log(`\n  Halaman demo      : /demo (tombol masuk otomatis)`);
  console.log(`  Login demo        : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Halaman publik    : /m/${DEMO_SLUG}`);
  console.log("  Reset ulang demo  : npm run demo:reset");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
