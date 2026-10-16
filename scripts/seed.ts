import { seedCore, ADMIN_EMAIL, ADMIN_PASSWORD } from "./seed-core";

async function main() {
  console.log("Menyiapkan data dasar...");
  await seedCore();
  console.log("\nSelesai! Jalankan: npm run dev");
  console.log(`Login admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
