import { ensurePlatformSettings } from "./lib-seed";
import { seedDemoMosque } from "./seed-base";

async function main() {
  console.log("Mereset masjid demo (data lama dihapus, dibuat ulang)...");
  ensurePlatformSettings();
  await seedDemoMosque();
  console.log("Selesai! Masjid demo sudah segar kembali.");
  console.log("Akun demo, data transaksi, dan tabungan qurban dibuat ulang dari nol.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
