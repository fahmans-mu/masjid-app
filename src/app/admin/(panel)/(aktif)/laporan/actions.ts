"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { monthlyReports } from "@/lib/schema";
import { requireMosqueSession } from "@/lib/auth";
import { computeReport, getMosqueById, getReport } from "@/lib/queries";
import { formString, type ActionState } from "@/lib/action-utils";
import { isValidPeriod } from "@/lib/format";

function revalidateAll(mosqueSlug: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/laporan");
  revalidatePath(`/m/${mosqueSlug}`, "layout");
}

export async function generateReportAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(mosque.id, period);
  if (existing?.status === "published") {
    redirect(`/admin/laporan/${period}`);
  }

  const c = computeReport(mosque.id, period);
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
      .values({ mosqueId: mosque.id, period, ...values, status: "draft" })
      .run();
  }

  revalidateAll(mosque.slug);
  redirect(`/admin/laporan/${period}`);
}

export async function publishReportAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(mosque.id, period);
  const now = new Date();

  if (existing) {
    db.update(monthlyReports)
      .set({ status: "published", publishedAt: now, updatedAt: now })
      .where(eq(monthlyReports.id, existing.id))
      .run();
  } else {
    const c = computeReport(mosque.id, period);
    db.insert(monthlyReports)
      .values({
        mosqueId: mosque.id,
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

  revalidateAll(mosque.slug);
  redirect(`/admin/laporan/${period}`);
}

export async function unpublishReportAction(fd: FormData) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return;
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) return;

  const existing = getReport(mosque.id, period);
  if (!existing) return;

  db.update(monthlyReports)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(eq(monthlyReports.id, existing.id))
    .run();

  revalidateAll(mosque.slug);
  redirect(`/admin/laporan/${period}`);
}

export async function saveSummaryAction(
  _prev: ActionState,
  fd: FormData
): Promise<ActionState> {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) return { error: "Masjid tidak ditemukan." };
  const period = formString(fd, "period");
  if (!isValidPeriod(period)) {
    return { error: "Periode tidak valid." };
  }
  const summary = formString(fd, "summary").slice(0, 3000);

  const existing = getReport(mosque.id, period);
  if (!existing) {
    return { error: "Laporan belum dibuat. Klik \u201cBuat Laporan\u201d terlebih dahulu." };
  }

  db.update(monthlyReports)
    .set({ summary: summary.length ? summary : null, updatedAt: new Date() })
    .where(eq(monthlyReports.id, existing.id))
    .run();

  revalidateAll(mosque.slug);
  return { success: "Catatan bendahara tersimpan." };
}
