import { and, count, desc, eq, gte, like, lte, sql, sum } from "drizzle-orm";
import { db } from "./db";
import {
  categories,
  donations,
  expenses,
  monthlyReports,
  programs,
  settings,
} from "./schema";
import type { MonthlyReport, Program, ReportBreakdown } from "./schema";
import { currentPeriod, periodRange } from "./format";

// ---------- Settings ----------

export function getSettings() {
  return db.select().from(settings).where(eq(settings.id, 1)).get() ?? null;
}

export type MosqueSettings = NonNullable<ReturnType<typeof getSettings>>;

// ---------- Ringkasan saldo ----------

const verifiedOnly = eq(donations.status, "verified");

export function getSummary() {
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(verifiedOnly)
    .get();
  const expenseRow = db.select({ total: sum(expenses.amount) }).from(expenses).get();
  const totalIncome = Number(incomeRow?.total ?? 0);
  const totalExpense = Number(expenseRow?.total ?? 0);
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
}

export function periodTotals(period: string) {
  const { start, end } = periodRange(period);
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(
      and(verifiedOnly, gte(donations.donatedAt, start), lte(donations.donatedAt, end))
    )
    .get();
  const expenseRow = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)))
    .get();
  const income = Number(incomeRow?.total ?? 0);
  const expense = Number(expenseRow?.total ?? 0);
  return { income, expense, net: income - expense };
}

export function balanceBefore(dateISO: string) {
  const incomeRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(and(verifiedOnly, sql`${donations.donatedAt} < ${dateISO}`))
    .get();
  const expenseRow = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .where(sql`${expenses.spentAt} < ${dateISO}`)
    .get();
  return Number(incomeRow?.total ?? 0) - Number(expenseRow?.total ?? 0);
}

export function monthlySeries(periods: string[]) {
  return periods.map((p) => ({ period: p, ...periodTotals(p) }));
}

// ---------- Program ----------

export type ProgramWithRaised = Program & {
  raised: number;
  raisedThisMonth: number;
};

export function programsWithRaised(opts?: {
  activeOnly?: boolean;
  type?: "campaign" | "rutin";
}): ProgramWithRaised[] {
  const conds = [];
  if (opts?.activeOnly) conds.push(eq(programs.isActive, true));
  if (opts?.type) conds.push(eq(programs.type, opts.type));

  const rows = db
    .select()
    .from(programs)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(programs.createdAt))
    .all();

  const allTotals = db
    .select({ programId: donations.programId, total: sum(donations.amount) })
    .from(donations)
    .where(verifiedOnly)
    .groupBy(donations.programId)
    .all();
  const mapAll = new Map(
    allTotals.map((r) => [r.programId, Number(r.total ?? 0)])
  );

  const period = currentPeriod();
  const { start, end } = periodRange(period);
  const monthTotals = db
    .select({ programId: donations.programId, total: sum(donations.amount) })
    .from(donations)
    .where(
      and(verifiedOnly, gte(donations.donatedAt, start), lte(donations.donatedAt, end))
    )
    .groupBy(donations.programId)
    .all();
  const mapMonth = new Map(
    monthTotals.map((r) => [r.programId, Number(r.total ?? 0)])
  );

  return rows.map((p) => ({
    ...p,
    raised: mapAll.get(p.id) ?? 0,
    raisedThisMonth: mapMonth.get(p.id) ?? 0,
  }));
}

export function getProgramById(id: number): ProgramWithRaised | null {
  const p = db.select().from(programs).where(eq(programs.id, id)).get();
  if (!p) return null;
  const allRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(and(verifiedOnly, eq(donations.programId, p.id)))
    .get();
  const period = currentPeriod();
  const { start, end } = periodRange(period);
  const monthRow = db
    .select({ total: sum(donations.amount) })
    .from(donations)
    .where(
      and(
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

export function getProgramBySlug(slug: string): ProgramWithRaised | null {
  const p = db.select().from(programs).where(eq(programs.slug, slug)).get();
  if (!p) return null;
  return getProgramById(p.id);
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

export function listDonations(f: DonationFilters = {}) {
  const perPage = f.perPage ?? 25;
  const page = Math.max(1, f.page ?? 1);
  const conds = [];
  if (f.status) conds.push(eq(donations.status, f.status));
  if (f.programId) conds.push(eq(donations.programId, f.programId));
  if (f.categoryId) conds.push(eq(donations.categoryId, f.categoryId));
  if (f.period) {
    const { start, end } = periodRange(f.period);
    conds.push(gte(donations.donatedAt, start), lte(donations.donatedAt, end));
  }
  if (f.search) conds.push(like(donations.donorName, `%${f.search}%`));
  const where = conds.length ? and(...conds) : undefined;

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

export function getDonationById(id: number) {
  return (
    db
      .select()
      .from(donations)
      .where(eq(donations.id, id))
      .get() ?? null
  );
}

export function countPendingDonations() {
  const row = db
    .select({ c: count() })
    .from(donations)
    .where(eq(donations.status, "pending"))
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

export function listExpenses(f: ExpenseFilters = {}) {
  const perPage = f.perPage ?? 25;
  const page = Math.max(1, f.page ?? 1);
  const conds = [];
  if (f.period) {
    const { start, end } = periodRange(f.period);
    conds.push(gte(expenses.spentAt, start), lte(expenses.spentAt, end));
  }
  if (f.programId) conds.push(eq(expenses.programId, f.programId));
  if (f.categoryId) conds.push(eq(expenses.categoryId, f.categoryId));
  const where = conds.length ? and(...conds) : undefined;

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

export function getExpenseById(id: number) {
  return (
    db
      .select()
      .from(expenses)
      .where(eq(expenses.id, id))
      .get() ?? null
  );
}

// ---------- Kategori ----------

export function listCategories(kind?: "income" | "expense") {
  return db
    .select()
    .from(categories)
    .where(kind ? eq(categories.kind, kind) : undefined)
    .orderBy(categories.id)
    .all();
}

export function countCategoryUsage(categoryId: number) {
  const d = db
    .select({ c: count() })
    .from(donations)
    .where(eq(donations.categoryId, categoryId))
    .get();
  const e = db
    .select({ c: count() })
    .from(expenses)
    .where(eq(expenses.categoryId, categoryId))
    .get();
  return Number(d?.c ?? 0) + Number(e?.c ?? 0);
}

// ---------- Laporan bulanan ----------

export function getReport(period: string) {
  return (
    db
      .select()
      .from(monthlyReports)
      .where(eq(monthlyReports.period, period))
      .get() ?? null
  );
}

export function listReports(opts?: { publishedOnly?: boolean }) {
  return db
    .select()
    .from(monthlyReports)
    .where(opts?.publishedOnly ? eq(monthlyReports.status, "published") : undefined)
    .orderBy(desc(monthlyReports.period))
    .all();
}

export function distinctTransactionPeriods(): string[] {
  const rows = db.all<{ period: string }>(
    sql`select period from (
          select distinct substr(donated_at, 1, 7) as period from donations
          union
          select distinct substr(spent_at, 1, 7) as period from expenses
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

export function computeReport(period: string): ComputedReport {
  const { start, end } = periodRange(period);
  const openingBalance = balanceBefore(start);

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
      and(verifiedOnly, gte(donations.donatedAt, start), lte(donations.donatedAt, end))
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
    .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)))
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

export function publicLedger(period: string, page = 1, perPage = 30) {
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
      and(verifiedOnly, gte(donations.donatedAt, start), lte(donations.donatedAt, end))
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
    .where(and(gte(expenses.spentAt, start), lte(expenses.spentAt, end)))
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
