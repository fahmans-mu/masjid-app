import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { categories, settings, users } from "../src/lib/schema";

export const ADMIN_EMAIL = "admin@masjid.id";
export const ADMIN_PASSWORD = "admin123";

const INCOME_CATEGORIES = [
  "Infaq & Sedekah",
  "Zakat",
  "Wakaf",
  "Kotak Amal Jumat",
  "Lain-lain",
];

const EXPENSE_CATEGORIES = [
  "Operasional & Kebersihan",
  "Listrik & Air",
  "Honor Imam & Marbot",
  "Pembangunan & Renovasi",
  "Kegiatan & Dakwah",
  "Sosial & Santunan",
  "Lain-lain",
];

export async function seedCore() {
  let createdAdmin = false;

  const s = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (!s) {
    db.insert(settings)
      .values({
        id: 1,
        mosqueName: "Masjid Al-Ikhlas",
        tagline: "Membangun masjid, membangun umat",
      })
      .run();
    console.log("  + profil masjid dibuat");
  }

  const admin = db.select().from(users).where(eq(users.email, ADMIN_EMAIL)).get();
  if (!admin) {
    db.insert(users)
      .values({
        name: "Admin Masjid",
        email: ADMIN_EMAIL,
        passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
        role: "admin",
      })
      .run();
    createdAdmin = true;
    console.log(`  + akun admin dibuat: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  }

  const existingCats = db.select().from(categories).all();
  for (const name of INCOME_CATEGORIES) {
    if (!existingCats.some((c) => c.kind === "income" && c.name === name)) {
      db.insert(categories).values({ name, kind: "income" }).run();
      console.log(`  + kategori pemasukan: ${name}`);
    }
  }
  for (const name of EXPENSE_CATEGORIES) {
    if (!existingCats.some((c) => c.kind === "expense" && c.name === name)) {
      db.insert(categories).values({ name, kind: "expense" }).run();
      console.log(`  + kategori pengeluaran: ${name}`);
    }
  }

  return { createdAdmin };
}
