"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { monthlyReports } from "@/lib/schema";
import { requireSession } from "@/lib/auth";
import { computeReport, getReport } from "@/lib/queries";
import { formString, type ActionState } from "@/lib/action-utils";
import { isValidPeriod } from "@/lib/format";

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/admin/laporan");
  revalidatePath("/laporan", "layout");
  revalidatePath("/");
}

export async function generateReportAction(fd: FormData) {
  await requireSession();
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(period);
  if (existing?.status === "published") {
    redirect(`/admin/laporan/${period}`);
  }

  const c = computeReport(period);
  const values = {
    openingBalance: c.openingBalance,
    totalIncome: c.totalIncome,
    totalExpense: c.totalExpense,
    closingBalance: c.closingBalance,
    breakdown: JSON.stringify(c.breakdown),
    generatedAt: new Date(),
    updatedAt: new Date(),
  };

  if (existing) {
    db.update(monthlyReports)
      .set(values)
      .where(eq(monthlyReports.id, existing.id))
      .run();
  } else {
    db.insert(monthlyReports)
      .values({ period, ...values, status: "draft" })
      .run();
  }

  revalidateAll();
  redirect(`/admin/laporan/${period}`);
}

export async function publishReportAction(fd: FormData) {
  await requireSession();
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(period);
  const now = new Date();

  if (existing) {
    db.update(monthlyReports)
      .set({ status: "published", publishedAt: now, updatedAt: now })
      .where(eq(monthlyReports.id, existing.id))
      .run();
  } else {
    const c = computeReport(period);
    db.insert(monthlyReports)
      .values({
        period,
        openingBalance: c.openingBalance,
        totalIncome: c.totalIncome,
        totalExpense: c.totalExpense,
        closingBalance: c.closingBalance,
        breakdown: JSON.stringify(c.breakdown),
        status: "published",
        generatedAt: now,
        publishedAt: now,
      })
      .run();
  }

  revalidateAll();
  redirect(`/admin/laporan/${period}`);
}

export async function unpublishReportAction(fd: FormData) {
  await requireSession();
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(period);
  if (!existing) return;

  db.update(monthlyReports)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(monthlyReports.id, existing.id))
    .run();

  revalidateAll();
  redirect(`/admin/laporan/${period}`);
}

export async function saveSummaryAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  await requireSession();
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) {
    return { error: "Periode tidak valid." };
  }
  const summary = formString(fd, "summary").slice(0, 3000);

  const existing = getReport(period);
  if (!existing) {
    return { error: "Laporan belum dibuat. Klik \u201cBuat Laporan\u201d terlebih dahulu." };
  }

  db.update(monthlyReports)
    .set({ summary: summary.length ? summary : null, updatedAt: new Date() })
    .where(eq(monthlyReports.id, existing.id))
    .run();

  revalidateAll();
  return { success: "Catatan bendahara tersimpan." };
}
