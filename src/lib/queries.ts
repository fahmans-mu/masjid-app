import { and, count, desc, eq, gte, inArray, like, lte, ne, sql, sum } from "drizzle-orm";
import { db } from "./db";
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
} from "./schema";
import type {
  AppInfaq,
  MonthlyReport,
  Mosque,
  PlatformSettings,
  Program,
  QurbanDeposit,
  QurbanParticipant,
  QurbanProgram,
  ReportBreakdown,
} from "./schema";
import { currentPeriod, periodRange } from "./format";

// ---------- Platform & masjid ----------

export function getPlatformSettings(): PlatformSettings | null {
  return db.select().from(platformSettings).where(eq(platformSettings.id, 1)).get() ?? null;
}

export function getMosqueById(id: number): Mosque | null {
  return db.select().from(mosques).where(eq(mosques.id, id)).get() ?? null;
}

export function getMosqueBySlug(slug: string): Mosque | null {
  return db.select().from(mosques).where(eq(mosques.slug, slug)).get() ?? null;
}

export function listMosques(opts?: { search?: string; includeInactive?: boolean }): Mosque[] {
  const conds = [];
  if (!opts?.includeInactive) conds.push(eq(mosques.isActive, true));
  if (opts?.search) conds.push(like(mosques.name, `%${opts.search}%`));
  return db
    .select()
    .from(mosques)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(mosques.isDemo, desc(mosques.createdAt))
    .all();
}

export type MosqueStatus = "nonaktif" | "tak-terbatas" | "aktif" | "kadaluarsa";

export function isMosqueExpired(m: Mosque): boolean {
  return m.activeUntil != null && m.activeUntil.getTime() < Date.now();
}

export function mosqueStatus(m: Mosque): MosqueStatus {
  if (!m.isActive) return "nonaktif";
  if (m.activeUntil == null) return "tak-terbatas";
  return isMosqueExpired(m) ? "kadaluarsa" : "aktif";
}

export function plazaStats() {
  const mosqueCount = Number(
    db.select({ c: count() }).from(mosques).where(eq(mosques.isActive, true)).get()?.c ?? 0
  );
  const donationTotal = Number(
    db.select({ total: sum(donations.amount) }).from(donations).where(eq(donations.status, "verified")).get()?.total ?? 0
  );
  const reportCount = Number(
    db.select({ c: count() }).from(monthlyReports).where(eq(monthlyReports.status, "published")).get()?.c ?? 0
  );
  return { mosqueCount, donationTotal, reportCount };
}

export type MosqueWithAdmins = Mosque & { adminEmails: string[] };

export function listMosquesForAdmin(search?: string): MosqueWithAdmins[] {
  const rows = db
    .select()
    .from(mosques)
    .where(search ? like(mosques.name, `%${search}%`) : undefined)
    .orderBy(desc(mosques.createdAt))
    .all();
  const admins = db
    .select({ email: users.email, mosqueId: users.mosqueId })
    .from(users)
    .where(ne(users.role, "super"))
    .all();
  const byMosque = new Map<number, string[]>();
  for (const a of admins) {
    if (a.mosqueId == null) continue;
    const arr = byMosque.get(a.mosqueId) ?? [];
    arr.push(a.email);
    byMosque.set(a.mosqueId, arr);
  }
  return rows.map((m) => ({ ...m, adminEmails: byMosque.get(m.id) ?? [] }));
}

export function superSummary() {
  const all = db.select().from(mosques).all();
  let aktif = 0;
  let trial = 0;
  let kadaluarsa = 0;
  let nonaktif = 0;
  for (const m of all) {
    const st = mosqueStatus(m);
    if (st === "aktif" || st === "tak-terbatas") {
      aktif++;
      if (st === "aktif") trial++;
    } else if (st === "kadaluarsa") kadaluarsa++;
    else nonaktif++;
  }
  const pendingInfaq = Number(
    db.select({ c: count() }).from(appInfaqs).where(eq(appInfaqs.status, "pending")).get()?.c ?? 0
  );
  return { total: all.length, aktif, trial, kadaluarsa, nonaktif, pendingInfaq };
}

// ---------- Infaq aplikasi ----------

export function listAppInfaqsForMosque(mosqueId: number): AppInfaq[] {
  return db
    .select()
    .from(appInfaqs)
    .where(eq(appInfaqs.mosqueId, mosqueId))
    .orderBy(desc(appInfaqs.createdAt))
    .all();
}

export type AppInfaqWithMosque = AppInfaq & { mosqueName: string; mosqueSlug: string };

export function listAppInfaqs(status?: "pending" | "verified" | "rejected"): AppInfaqWithMosque[] {
  return db
    .select({
      id: appInfaqs.id,
      mosqueId: appInfaqs.mosqueId,
      months: appInfaqs.months,
      monthlyAmount: appInfaqs.monthlyAmount,
      amount: appInfaqs.amount,
      senderName: appInfaqs.senderName,
      method: appInfaqs.method,
      note: appInfaqs.note,
      proofUrl: appInfaqs.proofUrl,
      status: appInfaqs.status,
      periodStart: appInfaqs.periodStart,
      periodEnd: appInfaqs.periodEnd,
      verifiedBy: appInfaqs.verifiedBy,
      verifiedAt: appInfaqs.verifiedAt,
      createdAt: appInfaqs.createdAt,
      mosqueName: mosques.name,
      mosqueSlug: mosques.slug,
    })
    .from(appInfaqs)
    .innerJoin(mosques, eq(appInfaqs.mosqueId, mosques.id))
    .where(status ? eq(appInfaqs.status, status) : undefined)
    .orderBy(desc(appInfaqs.createdAt))
    .all();
}

export function countPendingAppInfaqs(): number {
  return Number(
    db.select({ c: count() }).from(appInfaqs).where(eq(appInfaqs.status, "pending")).get()?.c ?? 0
  );
}

// ---------- Ringkasan saldo ----------

const verifiedOnly = eq(donations.status, "verified");

export function getSummary(mosqueId: number) {
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(and(eq(donations.mosqueId, mosqueId), verifiedOnly))
    .get();
  const expenseRow = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(eq(expenses.mosqueId, mosqueId))
    .get();
  const totalIncome = Number(incomeRow?.total ?? 0);
  const totalExpense = Number(expenseRow?.total ?? 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export function periodTotals(mosqueId: number, period: string) {
  const { start, end } = periodRange(period);
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        gte(donations.donatedAt, start),
        lte(donations.donatedAt, end)
      )
    )
    .get();
  const expenseRow = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(
      and(eq(expenses.mosqueId, mosqueId), gte(expenses.spentAt, start), lte(expenses.spentAt, end))
    )
    .get();
  const income = Number(incomeRow?.total ?? 0);
  const expense = Number(expenseRow?.total ?? 0);
  return { income, expense, net: income - expense };
}

export function balanceBefore(mosqueId: number, dateISO: string) {
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        sql`${donations.donatedAt} < ${dateISO}`
      )
    )
    .get();
  const expenseRow = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(and(eq(expenses.mosqueId, mosqueId), sql`${expenses.spentAt} < ${dateISO}`))
    .get();
  return Number(incomeRow?.total ?? 0) - Number(expenseRow?.total ?? 0);
}

export function monthlySeries(mosqueId: number, periods: string[]) {
  return periods.map((p) => ({ period: p, ...periodTotals(mosqueId, p) }));
}

// ---------- Program ----------

export type ProgramWithRaised = Program & {
  raised: number;
  raisedThisMonth: number;
};

export function programsWithRaised(
  mosqueId: number,
  opts?: {
    activeOnly?: boolean;
    type?: "campaign" | "rutin";
  }
): ProgramWithRaised[] {
  const conds = [eq(programs.mosqueId, mosqueId)];
  if (opts?.activeOnly) conds.push(eq(programs.isActive, true));
  if (opts?.type) conds.push(eq(programs.type, opts.type));

  const rows = db
    .select()
    .from(programs)
    .where(and(...conds))
    .orderBy(desc(programs.createdAt))
    .all();

  const allTotals = db
    .select({ programId: donations.programId, total: sum(donations.amount) })
    .from(donations)
    .where(and(eq(donations.mosqueId, mosqueId), verifiedOnly))
    .groupBy(donations.programId)
    .all();
  const mapAll = new Map(allTotals.map((r) => [r.programId, Number(r.total ?? 0)]));

  const period = currentPeriod();
  const { start, end } = periodRange(period);
  const monthTotals = db
    .select({ programId: donations.programId, total: sum(donations.amount) })
    .from(donations)
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        gte(donations.donatedAt, start),
        lte(donations.donatedAt, end)
      )
    )
    .groupBy(donations.programId)
    .all();
  const mapMonth = new Map(monthTotals.map((r) => [r.programId, Number(r.total ?? 0)]));

  return rows.map((p) => ({
    ...p,
    raised: mapAll.get(p.id) ?? 0,
    raisedThisMonth: mapMonth.get(p.id) ?? 0,
  }));
}

export function getProgramById(mosqueId: number, id: number): ProgramWithRaised | null {
  const p = db
    .select()
    .from(programs)
    .where(and(eq(programs.mosqueId, mosqueId), eq(programs.id, id)))
    .get();
  if (!p) return null;
  const allRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(and(eq(donations.mosqueId, mosqueId), verifiedOnly, eq(donations.programId, p.id)))
    .get();
  const period = currentPeriod();
  const { start, end } = periodRange(period);
  const monthRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        eq(donations.programId, p.id),
        gte(donations.donatedAt, start),
        lte(donations.donatedAt, end)
      )
    )
    .get();
  return {
    ...p,
    raised: Number(allRow?.total ?? 0),
    raisedThisMonth: Number(monthRow?.total ?? 0),
  };
}

export function getProgramBySlug(mosqueId: number, slug: string): ProgramWithRaised | null {
  const p = db
    .select()
    .from(programs)
    .where(and(eq(programs.mosqueId, mosqueId), eq(programs.slug, slug)))
    .get();
  if (!p) return null;
  return getProgramById(mosqueId, p.id);
}

// ---------- Donasi ----------

export type DonationFilters = {
  status?: "pending" | "verified" | "rejected";
  programId?: number;
  categoryId?: number;
  period?: string;
  search?: string;
  page?: number;
  perPage?: number;
};

export function listDonations(mosqueId: number, f: DonationFilters = {}) {
  const perPage = f.perPage ?? 25;
  const page = Math.max(1, f.page ?? 1);
  const conds = [eq(donations.mosqueId, mosqueId)];
  if (f.status) conds.push(eq(donations.status, f.status));
  if (f.programId) conds.push(eq(donations.programId, f.programId));
  if (f.categoryId) conds.push(eq(donations.categoryId, f.categoryId));
  if (f.period) {
    const { start, end } = periodRange(f.period);
    conds.push(gte(donations.donatedAt, start), lte(donations.donatedAt, end));
  }
  if (f.search) conds.push(like(donations.donorName, `%${f.search}%`));
  const where = and(...conds);

  const rows = db
    .select({
      id: donations.id,
      donorName: donations.donorName,
      donorPhone: donations.donorPhone,
      amount: donations.amount,
      method: donations.method,
      donatedAt: donations.donatedAt,
      note: donations.note,
      proofUrl: donations.proofUrl,
      status: donations.status,
      verifiedBy: donations.verifiedBy,
      verifiedAt: donations.verifiedAt,
      createdAt: donations.createdAt,
      programId: donations.programId,
      programTitle: programs.title,
      programSlug: programs.slug,
      programType: programs.type,
      categoryId: donations.categoryId,
      categoryName: categories.name,
    })
    .from(donations)
    .leftJoin(programs, eq(donations.programId, programs.id))
    .leftJoin(categories, eq(donations.categoryId, categories.id))
    .where(where)
    .orderBy(desc(donations.donatedAt), desc(donations.id))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  const totalRow = db
    .select({ c: count(), total: sum(donations.amount) })
    .from(donations)
    .where(where)
    .get();

  return {
    rows,
    total: Number(totalRow?.c ?? 0),
    totalAmount: Number(totalRow?.total ?? 0),
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(Number(totalRow?.c ?? 0) / perPage)),
  };
}

export type DonationRow = ReturnType<typeof listDonations>["rows"][number];

export function getDonationById(mosqueId: number, id: number) {
  return (
    db
      .select()
      .from(donations)
      .where(and(eq(donations.mosqueId, mosqueId), eq(donations.id, id)))
      .get() ?? null
  );
}

export function countPendingDonations(mosqueId: number) {
  const row = db
    .select({ c: count() })
    .from(donations)
    .where(and(eq(donations.mosqueId, mosqueId), eq(donations.status, "pending")))
    .get();
  return Number(row?.c ?? 0);
}

// ---------- Pengeluaran ----------

export type ExpenseFilters = {
  period?: string;
  programId?: number;
  categoryId?: number;
  page?: number;
  perPage?: number;
};

export function listExpenses(mosqueId: number, f: ExpenseFilters = {}) {
  const perPage = f.perPage ?? 25;
  const page = Math.max(1, f.page ?? 1);
  const conds = [eq(expenses.mosqueId, mosqueId)];
  if (f.period) {
    const { start, end } = periodRange(f.period);
    conds.push(gte(expenses.spentAt, start), lte(expenses.spentAt, end));
  }
  if (f.programId) conds.push(eq(expenses.programId, f.programId));
  if (f.categoryId) conds.push(eq(expenses.categoryId, f.categoryId));
  const where = and(...conds);

  const rows = db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      spentAt: expenses.spentAt,
      receiptUrl: expenses.receiptUrl,
      createdBy: expenses.createdBy,
      createdAt: expenses.createdAt,
      programId: expenses.programId,
      programTitle: programs.title,
      categoryId: expenses.categoryId,
      categoryName: categories.name,
    })
    .from(expenses)
    .leftJoin(programs, eq(expenses.programId, programs.id))
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(where)
    .orderBy(desc(expenses.spentAt), desc(expenses.id))
    .limit(perPage)
    .offset((page - 1) * perPage)
    .all();

  const totalRow = db
    .select({ c: count(), total: sum(expenses.amount) })
    .from(expenses)
    .where(where)
    .get();

  return {
    rows,
    total: Number(totalRow?.c ?? 0),
    totalAmount: Number(totalRow?.total ?? 0),
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(Number(totalRow?.c ?? 0) / perPage)),
  };
}

export type ExpenseRow = ReturnType<typeof listExpenses>["rows"][number];

export function getExpenseById(mosqueId: number, id: number) {
  return (
    db
      .select()
      .from(expenses)
      .where(and(eq(expenses.mosqueId, mosqueId), eq(expenses.id, id)))
      .get() ?? null
  );
}

// ---------- Kategori ----------

export function listCategories(mosqueId: number, kind?: "income" | "expense") {
  const conds = [eq(categories.mosqueId, mosqueId)];
  if (kind) conds.push(eq(categories.kind, kind));
  return db
    .select()
    .from(categories)
    .where(and(...conds))
    .orderBy(categories.id)
    .all();
}

export function countCategoryUsage(mosqueId: number, categoryId: number) {
  const d = db
    .select({ c: count() })
    .from(donations)
    .where(and(eq(donations.mosqueId, mosqueId), eq(donations.categoryId, categoryId)))
    .get();
  const e = db
    .select({ c: count() })
    .from(expenses)
    .where(and(eq(expenses.mosqueId, mosqueId), eq(expenses.categoryId, categoryId)))
    .get();
  return Number(d?.c ?? 0) + Number(e?.c ?? 0);
}

// ---------- Laporan bulanan ----------

export function getReport(mosqueId: number, period: string) {
  return (
    db
      .select()
      .from(monthlyReports)
      .where(and(eq(monthlyReports.mosqueId, mosqueId), eq(monthlyReports.period, period)))
      .get() ?? null
  );
}

export function listReports(mosqueId: number, opts?: { publishedOnly?: boolean }) {
  const conds = [eq(monthlyReports.mosqueId, mosqueId)];
  if (opts?.publishedOnly) conds.push(eq(monthlyReports.status, "published"));
  return db
    .select()
    .from(monthlyReports)
    .where(and(...conds))
    .orderBy(desc(monthlyReports.period))
    .all();
}

export function distinctTransactionPeriods(mosqueId: number): string[] {
  const rows = db.all<{ period: string }>(
    sql`select period from (
          select distinct substr(donated_at, 1, 7) as period from donations where mosque_id = ${mosqueId}
          union
          select distinct substr(spent_at, 1, 7) as period from expenses where mosque_id = ${mosqueId}
        ) where period is not null order by period desc`
  );
  return rows.map((r) => r.period).filter(Boolean);
}

export type ComputedReport = {
  period: string;
  openingBalance: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  breakdown: ReportBreakdown;
};

export function computeReport(mosqueId: number, period: string): ComputedReport {
  const { start, end } = periodRange(period);
  const openingBalance = balanceBefore(mosqueId, start);

  const incomeRows = db
    .select({
      amount: donations.amount,
      programTitle: programs.title,
      programType: programs.type,
      categoryName: categories.name,
    })
    .from(donations)
    .leftJoin(programs, eq(donations.programId, programs.id))
    .leftJoin(categories, eq(donations.categoryId, categories.id))
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        gte(donations.donatedAt, start),
        lte(donations.donatedAt, end)
      )
    )
    .all();

  const expenseRows = db
    .select({
      amount: expenses.amount,
      programTitle: programs.title,
      categoryName: categories.name,
    })
    .from(expenses)
    .leftJoin(programs, eq(expenses.programId, programs.id))
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(
      and(eq(expenses.mosqueId, mosqueId), gte(expenses.spentAt, start), lte(expenses.spentAt, end))
    )
    .all();

  const totalIncome = incomeRows.reduce((s, r) => s + r.amount, 0);
  const totalExpense = expenseRows.reduce((s, r) => s + r.amount, 0);

  const byKey = (
    rows: { amount: number; label: string | null }[]
  ): { name: string; amount: number }[] => {
    const map = new Map<string, number>();
    for (const r of rows) {
      const key = r.label ?? "(Tanpa keterangan)";
      map.set(key, (map.get(key) ?? 0) + r.amount);
    }
    return [...map.entries()]
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  };

  const breakdown: ReportBreakdown = {
    incomeByCategory: byKey(
      incomeRows.map((r) => ({ amount: r.amount, label: r.categoryName }))
    ),
    incomeByProgram: byKey(
      incomeRows.map((r) => ({ amount: r.amount, label: r.programTitle }))
    ),
    expenseByCategory: byKey(
      expenseRows.map((r) => ({ amount: r.amount, label: r.categoryName }))
    ),
    expenseByProgram: byKey(
      expenseRows.map((r) => ({ amount: r.amount, label: r.programTitle }))
    ),
    donationCount: incomeRows.length,
    expenseCount: expenseRows.length,
  };

  return {
    period,
    openingBalance,
    totalIncome,
    totalExpense,
    closingBalance: openingBalance + totalIncome - totalExpense,
    breakdown,
  };
}

export function parseBreakdown(report: MonthlyReport | null): ReportBreakdown | null {
  if (!report?.breakdown) return null;
  try {
    return JSON.parse(report.breakdown) as ReportBreakdown;
  } catch {
    return null;
  }
}

// ---------- Buku kas publik ----------

export type LedgerEntry = {
  id: number;
  kind: "income" | "expense";
  date: string;
  title: string;
  detail: string;
  amount: number;
  method: string | null;
};

export function publicLedger(mosqueId: number, period: string, page = 1, perPage = 30) {
  const { start, end } = periodRange(period);

  const incomeRows = db
    .select({
      id: donations.id,
      donorName: donations.donorName,
      amount: donations.amount,
      method: donations.method,
      donatedAt: donations.donatedAt,
      note: donations.note,
      programTitle: programs.title,
      categoryName: categories.name,
    })
    .from(donations)
    .leftJoin(programs, eq(donations.programId, programs.id))
    .leftJoin(categories, eq(donations.categoryId, categories.id))
    .where(
      and(
        eq(donations.mosqueId, mosqueId),
        verifiedOnly,
        gte(donations.donatedAt, start),
        lte(donations.donatedAt, end)
      )
    )
    .all();

  const expenseRows = db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      spentAt: expenses.spentAt,
      programTitle: programs.title,
      categoryName: categories.name,
    })
    .from(expenses)
    .leftJoin(programs, eq(expenses.programId, programs.id))
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(
      and(eq(expenses.mosqueId, mosqueId), gte(expenses.spentAt, start), lte(expenses.spentAt, end))
    )
    .all();

  const merged: LedgerEntry[] = [
    ...incomeRows.map((r) => ({
      id: r.id,
      kind: "income" as const,
      date: r.donatedAt,
      title: r.donorName,
      detail: [r.programTitle, r.categoryName].filter(Boolean).join(" · ") || "Donasi umum",
      amount: r.amount,
      method: r.method,
    })),
    ...expenseRows.map((r) => ({
      id: r.id,
      kind: "expense" as const,
      date: r.spentAt,
      title: r.description,
      detail: [r.categoryName, r.programTitle].filter(Boolean).join(" · "),
      amount: r.amount,
      method: null,
    })),
  ].sort((a, b) => (a.date === b.date ? b.id - a.id : a.date < b.date ? 1 : -1));

  const total = merged.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const rows = merged.slice((safePage - 1) * perPage, safePage * perPage);

  return {
    rows,
    total,
    page: safePage,
    totalPages,
    incomeTotal: incomeRows.reduce((s, r) => s + r.amount, 0),
    expenseTotal: expenseRows.reduce((s, r) => s + r.amount, 0),
  };
}

// ---------- Tabungan Qurban ----------

export function listQurbanPrograms(mosqueId: number): QurbanProgram[] {
  return db
    .select()
    .from(qurbanPrograms)
    .where(eq(qurbanPrograms.mosqueId, mosqueId))
    .orderBy(desc(qurbanPrograms.createdAt))
    .all();
}

export function getQurbanProgramById(mosqueId: number, id: number): QurbanProgram | null {
  return (
    db
      .select()
      .from(qurbanPrograms)
      .where(and(eq(qurbanPrograms.mosqueId, mosqueId), eq(qurbanPrograms.id, id)))
      .get() ?? null
  );
}

export function getActiveQurbanProgram(mosqueId: number): QurbanProgram | null {
  return (
    db
      .select()
      .from(qurbanPrograms)
      .where(and(eq(qurbanPrograms.mosqueId, mosqueId), eq(qurbanPrograms.isActive, true)))
      .orderBy(desc(qurbanPrograms.createdAt))
      .get() ?? null
  );
}

export type QurbanParticipantWithRaised = QurbanParticipant & {
  raised: number;
  progress: number;
  done: boolean;
};

export function listQurbanParticipantsDetailed(
  programId: number,
  opts?: { onlyApproved?: boolean }
): QurbanParticipantWithRaised[] {
  const conds = [eq(qurbanParticipants.programId, programId)];
  if (opts?.onlyApproved) conds.push(eq(qurbanParticipants.status, "approved"));
  const rows = db
    .select()
    .from(qurbanParticipants)
    .where(and(...conds))
    .orderBy(qurbanParticipants.createdAt)
    .all();
  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const sums = db
    .select({ participantId: qurbanDeposits.participantId, total: sum(qurbanDeposits.amount) })
    .from(qurbanDeposits)
    .where(inArray(qurbanDeposits.participantId, ids))
    .groupBy(qurbanDeposits.participantId)
    .all();
  const map = new Map(sums.map((s) => [s.participantId, Number(s.total ?? 0)]));

  return rows.map((p) => {
    const raised = map.get(p.id) ?? 0;
    return {
      ...p,
      raised,
      progress:
        p.targetAmount > 0 ? Math.min(100, Math.round((raised / p.targetAmount) * 100)) : 0,
      done: raised >= p.targetAmount,
    };
  });
}

export function getQurbanParticipantById(mosqueId: number, id: number): QurbanParticipant | null {
  return (
    db
      .select()
      .from(qurbanParticipants)
      .where(and(eq(qurbanParticipants.mosqueId, mosqueId), eq(qurbanParticipants.id, id)))
      .get() ?? null
  );
}

export function participantRaised(participantId: number): number {
  const row = db
    .select({ total: sum(qurbanDeposits.amount) })
    .from(qurbanDeposits)
    .where(eq(qurbanDeposits.participantId, participantId))
    .get();
  return Number(row?.total ?? 0);
}

export function listQurbanDeposits(participantId: number): QurbanDeposit[] {
  return db
    .select()
    .from(qurbanDeposits)
    .where(eq(qurbanDeposits.participantId, participantId))
    .orderBy(desc(qurbanDeposits.depositedAt), desc(qurbanDeposits.id))
    .all();
}

export function qurbanStats(programId: number, opts?: { onlyApproved?: boolean }) {
  const parts = listQurbanParticipantsDetailed(programId, opts);
  const approved = parts.filter((p) => p.status === "approved");
  const source = opts?.onlyApproved ? approved : parts;
  return {
    participantCount: source.length,
    approvedCount: approved.length,
    pendingCount: parts.filter((p) => p.status === "pending").length,
    kambingCount: approved.filter((p) => p.animalType === "kambing").length,
    sapiCount: approved.filter((p) => p.animalType === "sapi").length,
    totalRaised: approved.reduce((s, p) => s + p.raised, 0),
    totalTarget: approved.reduce((s, p) => s + p.targetAmount, 0),
    lunasCount: approved.filter((p) => p.done).length,
  };
}

export function countPendingQurban(mosqueId: number): number {
  const row = db
    .select({ c: count() })
    .from(qurbanParticipants)
    .where(
      and(eq(qurbanParticipants.mosqueId, mosqueId), eq(qurbanParticipants.status, "pending"))
    )
    .get();
  return Number(row?.c ?? 0);
}
