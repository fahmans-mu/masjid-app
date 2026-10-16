import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  appInfaqs,
  categories,
  donations,
  expenses,
  monthlyReports,
  mosques,
  platformSettings,
  programs,
  qurbanDeposits,
  qurbanParticipants,
  qurbanPrograms,
  users,
} from "../src/lib/schema";
import { createDefaultCategories } from "../src/lib/defaults";
import { computeReport } from "../src/lib/queries";
import { formatRupiah, monthLabel, toPeriod } from "../src/lib/format";

export const ADMIN_EMAIL = "admin@masjid.id";
export const ADMIN_PASSWORD = "admin123";
export const DEMO_EMAIL = "demo@masjidamanah.id";
export const DEMO_PASSWORD = "demo123";
export const DEMO_SLUG = "demo";

export type Method = "transfer" | "qris" | "cash" | "other";

export type ProgramSeed = {
  slug: string;
  type: "campaign" | "rutin";
  title: string;
  description: string;
  targetAmount?: number;
  monthlyTarget?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
};

export type DonationSeed = {
  date: string;
  program?: string;
  category?: string;
  donor: string;
  amount: number;
  method: Method;
  note?: string;
  phone?: string;
  status?: "pending" | "rejected";
};

export type ExpenseSeed = {
  date: string;
  category: string;
  description: string;
  amount: number;
  program?: string;
};

export type QurbanDepositSeed = {
  amount: number;
  method: Method;
  depositedAt: string;
  note?: string;
};

export type QurbanParticipantSeed = {
  name: string;
  phone?: string;
  animalType: "kambing" | "sapi";
  targetAmount: number;
  status: "pending" | "approved" | "rejected";
  deposits?: QurbanDepositSeed[];
};

// ---------- Utilitas umum ----------

export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return iso(d);
}

export function monthDay(monthsBack: number, day: number): string {
  const d = new Date();
  return iso(new Date(d.getFullYear(), d.getMonth() - monthsBack, day));
}

export function wipeAll() {
  db.delete(qurbanDeposits).run();
  db.delete(qurbanParticipants).run();
  db.delete(qurbanPrograms).run();
  db.delete(monthlyReports).run();
  db.delete(expenses).run();
  db.delete(donations).run();
  db.delete(categories).run();
  db.delete(programs).run();
  db.delete(appInfaqs).run();
  db.delete(users).run();
  db.delete(mosques).run();
  db.delete(platformSettings).run();
}

export function ensurePlatformSettings() {
  const existing = db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 1))
    .get();
  if (existing) return existing;
  db.insert(platformSettings)
    .values({
      id: 1,
      monthlyAmount: 50_000,
      trialDays: 30,
      bankName: "Bank Syariah Indonesia (BSI)",
      bankAccount: "7330012345",
      bankHolder: "CV Fahmans Digital",
      contactPhone: "0812-3456-7890",
      contactEmail: "salam@masjidamanah.id",
      infaqNote:
        "Konfirmasi infaq diverifikasi maksimal 1×24 jam pada hari kerja. Jazakumullahu khairan atas dukungan Anda.",
    })
    .run();
  return db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 1))
    .get()!;
}

export type MosqueSeed = {
  slug: string;
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  donationNote?: string;
  showDonorNames?: boolean;
  isDemo?: boolean;
  activeUntil?: Date | null;
};

export function createMosque(input: MosqueSeed): number {
  const row = db
    .insert(mosques)
    .values({
      slug: input.slug,
      name: input.name,
      tagline: input.tagline ?? null,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      bankName: input.bankName ?? null,
      bankAccount: input.bankAccount ?? null,
      bankHolder: input.bankHolder ?? null,
      donationNote: input.donationNote ?? null,
      showDonorNames: input.showDonorNames ?? true,
      isDemo: input.isDemo ?? false,
      activeUntil: input.activeUntil ?? null,
    })
    .returning({ id: mosques.id })
    .get();
  createDefaultCategories(row.id);
  return row.id;
}

export async function createUser(input: {
  mosqueId: number | null;
  name: string;
  email: string;
  password: string;
  role: "super" | "pengurus";
}) {
  db.insert(users)
    .values({
      mosqueId: input.mosqueId,
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      role: input.role,
    })
    .run();
}

// ---------- Data keuangan ----------

export function seedTransactions(
  mosqueId: number,
  input: {
    programs: ProgramSeed[];
    donations: DonationSeed[];
    expenses: ExpenseSeed[];
    createdBy: string;
  }
) {
  const slugToId = new Map<string, number>();
  for (const p of input.programs) {
    const row = db
      .insert(programs)
      .values({
        mosqueId,
        slug: p.slug,
        type: p.type,
        title: p.title,
        description: p.description,
        targetAmount: p.targetAmount ?? null,
        monthlyTarget: p.monthlyTarget ?? null,
        startDate: p.startDate ?? null,
        endDate: p.endDate ?? null,
        isActive: p.isActive ?? true,
      })
      .returning({ id: programs.id })
      .get();
    slugToId.set(p.slug, row.id);
  }

  const cats = db
    .select()
    .from(categories)
    .where(eq(categories.mosqueId, mosqueId))
    .all();
  const catToId = new Map(cats.map((c) => [c.name, c.id]));

  for (const d of input.donations) {
    const status = d.status ?? "verified";
    db.insert(donations)
      .values({
        mosqueId,
        programId: d.program ? (slugToId.get(d.program) ?? null) : null,
        categoryId: d.category ? (catToId.get(d.category) ?? null) : null,
        donorName: d.donor,
        donorPhone: d.phone ?? null,
        amount: d.amount,
        method: d.method,
        donatedAt: d.date,
        note: d.note ?? null,
        status,
        verifiedBy: status === "verified" ? input.createdBy : null,
        verifiedAt: status === "verified" ? new Date(d.date + "T10:00:00") : null,
      })
      .run();
  }

  for (const e of input.expenses) {
    const categoryId = catToId.get(e.category);
    if (!categoryId) throw new Error(`Kategori pengeluaran tidak ditemukan: ${e.category}`);
    db.insert(expenses)
      .values({
        mosqueId,
        categoryId,
        programId: e.program ? (slugToId.get(e.program) ?? null) : null,
        description: e.description,
        amount: e.amount,
        spentAt: e.date,
        createdBy: input.createdBy,
      })
      .run();
  }

  return { slugToId, catToId };
}

export function publishMonthlyReport(
  mosqueId: number,
  period: string,
  publishedAt: string,
  summaryPrefix = ""
) {
  const c = computeReport(mosqueId, period);
  const summary =
    `${summaryPrefix}Alhamdulillah, laporan keuangan ${monthLabel(period)} telah selesai disusun. ` +
    `Total pemasukan ${formatRupiah(c.totalIncome)} dan pengeluaran ${formatRupiah(c.totalExpense)}, ` +
    `sehingga saldo kas per akhir bulan menjadi ${formatRupiah(c.closingBalance)}. ` +
    `Rincian per kategori dan per program dapat dilihat pada tabel di bawah. ` +
    `Semoga Allah membalas kebaikan seluruh donatur. — Bendahara DKM`;
  db.insert(monthlyReports)
    .values({
      mosqueId,
      period,
      openingBalance: c.openingBalance,
      totalIncome: c.totalIncome,
      totalExpense: c.totalExpense,
      closingBalance: c.closingBalance,
      breakdown: JSON.stringify(c.breakdown),
      summary,
      status: "published",
      generatedAt: new Date(publishedAt),
      publishedAt: new Date(publishedAt),
    })
    .run();
  return c;
}

export function currentAndPrevPeriods(monthsBack: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date();
    out.push(toPeriod(new Date(d.getFullYear(), d.getMonth() - i, 1)));
  }
  return out;
}

// ---------- Qurban ----------

export function seedQurban(
  mosqueId: number,
  program: {
    title: string;
    description: string;
    goatPrice: number | null;
    cowSharePrice: number | null;
    targetDate: string;
    isActive?: boolean;
  },
  participants: QurbanParticipantSeed[],
  recordedBy: string
) {
  const prog = db
    .insert(qurbanPrograms)
    .values({
      mosqueId,
      title: program.title,
      description: program.description,
      goatPrice: program.goatPrice,
      cowSharePrice: program.cowSharePrice,
      targetDate: program.targetDate,
      isActive: program.isActive ?? true,
    })
    .returning({ id: qurbanPrograms.id })
    .get();

  for (const [i, p] of participants.entries()) {
    const created = new Date();
    created.setDate(created.getDate() - (participants.length - i) * 3);
    const row = db
      .insert(qurbanParticipants)
      .values({
        mosqueId,
        programId: prog.id,
        name: p.name,
        phone: p.phone ?? null,
        animalType: p.animalType,
        targetAmount: p.targetAmount,
        status: p.status,
        approvedAt: p.status === "approved" ? created : null,
        createdAt: created,
      })
      .returning({ id: qurbanParticipants.id })
      .get();

    for (const dep of p.deposits ?? []) {
      db.insert(qurbanDeposits)
        .values({
          mosqueId,
          participantId: row.id,
          amount: dep.amount,
          method: dep.method,
          depositedAt: dep.depositedAt,
          note: dep.note ?? null,
          recordedBy,
        })
        .run();
    }
  }

  return prog.id;
}

// ---------- Infaq aplikasi ----------

export function seedAppInfaq(
  mosqueId: number,
  input: {
    months: number;
    monthlyAmount: number;
    senderName: string;
    method: Method;
    note?: string;
    status?: "pending" | "verified" | "rejected";
    createdAt?: Date;
  }
) {
  const total = input.months * input.monthlyAmount;
  db.insert(appInfaqs)
    .values({
      mosqueId,
      months: input.months,
      monthlyAmount: input.monthlyAmount,
      amount: total,
      senderName: input.senderName,
      method: input.method,
      note: input.note ?? null,
      status: input.status ?? "pending",
      createdAt: input.createdAt ?? new Date(),
    })
    .run();
  return total;
}
