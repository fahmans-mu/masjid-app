import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Profil masjid (selalu 1 baris, id = 1)
export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  mosqueName: text("mosque_name").notNull().default("Masjid"),
  tagline: text("tagline"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logoUrl: text("logo_url"),
  qrisUrl: text("qris_url"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankHolder: text("bank_holder"),
  donationNote: text("donation_note"),
  showDonorNames: integer("show_donor_names", { mode: "boolean" }).notNull().default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Akun pengurus / bendahara
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("pengurus"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Program donasi: campaign (dengan target & tenggat) atau rutin (bulanan)
export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  type: text("type", { enum: ["campaign", "rutin"] }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  targetAmount: integer("target_amount"),
  monthlyTarget: integer("monthly_target"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Kategori pemasukan (infaq, zakat, ...) dan pengeluaran (operasional, ...)
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  kind: text("kind", { enum: ["income", "expense"] }).notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Donasi / pemasukan (dari program atau kategori umum seperti infaq Jumat)
export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  programId: integer("program_id").references(() => programs.id, { onDelete: "set null" }),
  categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
  donorName: text("donor_name").notNull().default("Hamba Allah"),
  donorPhone: text("donor_phone"),
  amount: integer("amount").notNull(),
  method: text("method", { enum: ["transfer", "qris", "cash", "other"] }).notNull().default("transfer"),
  donatedAt: text("donated_at").notNull(), // YYYY-MM-DD
  note: text("note"),
  proofUrl: text("proof_url"),
  status: text("status", { enum: ["pending", "verified", "rejected"] }).notNull().default("pending"),
  verifiedBy: text("verified_by"),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Pengeluaran masjid
export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  programId: integer("program_id").references(() => programs.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  amount: integer("amount").notNull(),
  spentAt: text("spent_at").notNull(), // YYYY-MM-DD
  receiptUrl: text("receipt_url"),
  createdBy: text("created_by"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Laporan bulanan (pertanggungjawaban) — angka di-snapshot saat generate
export const monthlyReports = sqliteTable("monthly_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  period: text("period").notNull().unique(), // YYYY-MM
  openingBalance: integer("opening_balance").notNull(),
  totalIncome: integer("total_income").notNull(),
  totalExpense: integer("total_expense").notNull(),
  closingBalance: integer("closing_balance").notNull(),
  breakdown: text("breakdown"), // JSON: rincian per kategori & program
  summary: text("summary"), // catatan / pesan bendahara
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  generatedAt: integer("generated_at", { mode: "timestamp" }),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type Settings = typeof settings.$inferSelect;
export type User = typeof users.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type MonthlyReport = typeof monthlyReports.$inferSelect;

export type ReportBreakdown = {
  incomeByCategory: { name: string; amount: number }[];
  incomeByProgram: { name: string; amount: number }[];
  expenseByCategory: { name: string; amount: number }[];
  expenseByProgram: { name: string; amount: number }[];
  donationCount: number;
  expenseCount: number;
};
