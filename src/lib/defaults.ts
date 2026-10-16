import { db } from "./db";
import { categories } from "./schema";

export const DEFAULT_INCOME_CATEGORIES = [
  "Infaq & Sedekah",
  "Zakat",
  "Wakaf",
  "Kotak Amal Jumat",
  "Lain-lain",
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  "Operasional & Kebersihan",
  "Listrik & Air",
  "Honor Imam & Marbot",
  "Pembangunan & Renovasi",
  "Kegiatan & Dakwah",
  "Sosial & Santunan",
  "Lain-lain",
];

export function createDefaultCategories(mosqueId: number) {
  for (const name of DEFAULT_INCOME_CATEGORIES) {
    db.insert(categories).values({ mosqueId, name, kind: "income" }).run();
  }
  for (const name of DEFAULT_EXPENSE_CATEGORIES) {
    db.insert(categories).values({ mosqueId, name, kind: "expense" }).run();
  }
}
