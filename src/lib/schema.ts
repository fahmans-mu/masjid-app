import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ---------- Platform ----------

// Pengaturan platform MasjidAmanah (selalu 1 baris, id = 1)
export const platformSettings = sqliteTable("platform_settings", {
  id: integer("id").primaryKey(),
  monthlyAmount: integer("monthly_amount").notNull().default(50000),
  trialDays: integer("trial_days").notNull().default(30),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankHolder: text("bank_holder"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  infaqNote: text("infaq_note"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Profil masjid (multi-tenant)
export const mosques = sqliteTable("mosques", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
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
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  isDemo: integer("is_demo", { mode: "boolean" }).notNull().default(false),
  // Masa aktif (infaq aplikasi). null = tanpa batas (masjid pertama / demo)
  activeUntil: integer("active_until", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Infaq aplikasi: masjid mendukung aplikasi, memperpanjang masa aktif
export const appInfaqs = sqliteTable(
  "app_infaqs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    months: integer("months").notNull(), // 1, 6, atau 12
    monthlyAmount: integer("monthly_amount").notNull(), // snapshot nominal saat itu
    amount: integer("amount").notNull(), // total transfer
    senderName: text("sender_name"),
    method: text("method", { enum: ["transfer", "qris", "cash", "other"] })
      .notNull()
      .default("transfer"),
    note: text("note"),
    proofUrl: text("proof_url"),
    status: text("status", { enum: ["pending", "verified", "rejected"] })
      .notNull()
      .default("pending"),
    periodStart: integer("period_start", { mode: "timestamp" }),
    periodEnd: integer("period_end", { mode: "timestamp" }),
    verifiedBy: text("verified_by"),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("app_infaqs_mosque_idx").on(t.mosqueId)]
);

// ---------- Akun pengguna ----------

// Akun pengurus / bendahara (per masjid) + super-admin platform (mosqueId boleh null)
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id").references(() => mosques.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: text("role", { enum: ["super", "pengurus"] }).notNull().default("pengurus"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("users_mosque_idx").on(t.mosqueId)]
);

// ---------- Keuangan masjid (per masjid) ----------

// Program donasi: campaign (dengan target & tenggat) atau rutin (bulanan)
export const programs = sqliteTable(
  "programs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
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
  },
  (t) => [uniqueIndex("programs_mosque_slug_idx").on(t.mosqueId, t.slug)]
);

// Kategori pemasukan (infaq, zakat, ...) dan pengeluaran (operasional, ...)
export const categories = sqliteTable(
  "categories",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    kind: text("kind", { enum: ["income", "expense"] }).notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("categories_mosque_idx").on(t.mosqueId)]
);

// Donasi / pemasukan (dari program atau kategori umum seperti infaq Jumat)
export const donations = sqliteTable(
  "donations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
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
  },
  (t) => [index("donations_mosque_idx").on(t.mosqueId)]
);

// Pengeluaran masjid
export const expenses = sqliteTable(
  "expenses",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
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
  },
  (t) => [index("expenses_mosque_idx").on(t.mosqueId)]
);

// Laporan bulanan (pertanggungjawaban) — angka di-snapshot saat generate
export const monthlyReports = sqliteTable(
  "monthly_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    period: text("period").notNull(), // YYYY-MM
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
  },
  (t) => [uniqueIndex("reports_mosque_period_idx").on(t.mosqueId, t.period)]
);

// ---------- Tabungan Qurban (per masjid) ----------

// Program qurban (biasanya per tahun hijriah)
export const qurbanPrograms = sqliteTable(
  "qurban_programs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    goatPrice: integer("goat_price"), // harga 1 kambing
    cowSharePrice: integer("cow_share_price"), // harga 1/7 bagian sapi
    targetDate: text("target_date"), // perkiraan hari raya (YYYY-MM-DD)
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("qurban_programs_mosque_idx").on(t.mosqueId)]
);

// Peserta tabungan qurban
export const qurbanParticipants = sqliteTable(
  "qurban_participants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    programId: integer("program_id")
      .notNull()
      .references(() => qurbanPrograms.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    phone: text("phone"),
    animalType: text("animal_type", { enum: ["kambing", "sapi"] }).notNull(),
    targetAmount: integer("target_amount").notNull(), // snapshot harga saat mendaftar
    status: text("status", { enum: ["pending", "approved", "rejected"] })
      .notNull()
      .default("pending"),
    note: text("note"),
    approvedAt: integer("approved_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("qurban_participants_program_idx").on(t.programId)]
);

// Setoran tabungan qurban (dicatat pengurus)
export const qurbanDeposits = sqliteTable(
  "qurban_deposits",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    mosqueId: integer("mosque_id")
      .notNull()
      .references(() => mosques.id, { onDelete: "cascade" }),
    participantId: integer("participant_id")
      .notNull()
      .references(() => qurbanParticipants.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    method: text("method", { enum: ["transfer", "qris", "cash", "other"] })
      .notNull()
      .default("cash"),
    depositedAt: text("deposited_at").notNull(), // YYYY-MM-DD
    note: text("note"),
    proofUrl: text("proof_url"),
    recordedBy: text("recorded_by"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (t) => [index("qurban_deposits_participant_idx").on(t.participantId)]
);

// ---------- Tipe ----------

export type PlatformSettings = typeof platformSettings.$inferSelect;
export type Mosque = typeof mosques.$inferSelect;
export type AppInfaq = typeof appInfaqs.$inferSelect;
export type User = typeof users.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Donation = typeof donations.$inferSelect;
export type Expense = typeof expenses.$inferSelect;
export type MonthlyReport = typeof monthlyReports.$inferSelect;
export type QurbanProgram = typeof qurbanPrograms.$inferSelect;
export type QurbanParticipant = typeof qurbanParticipants.$inferSelect;
export type QurbanDeposit = typeof qurbanDeposits.$inferSelect;

export type ReportBreakdown = {
  incomeByCategory: { name: string; amount: number }[];
  incomeByProgram: { name: string; amount: number }[];
  expenseByCategory: { name: string; amount: number }[];
  expenseByProgram: { name: string; amount: number }[];
  donationCount: number;
  expenseCount: number;
};
