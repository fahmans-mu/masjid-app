import { timingSafeEqual } from "crypto";
import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { donations, mayarPayments } from "@/lib/schema";
import { getMosqueBySlug } from "@/lib/queries";
import { getMayarPayment, isPaidStatus } from "@/lib/mayar";
import { todayISO } from "@/lib/format";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function tokenMatches(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type WebhookPayload = {
  event?: string;
  data?: {
    id?: string;
    transactionId?: string;
    productId?: string;
    status?: unknown;
    amount?: number;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
  };
};

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const mosque = getMosqueBySlug(slug);
  if (!mosque) {
    return NextResponse.json({ ok: false, error: "unknown-mosque" }, { status: 404 });
  }

  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!mosque.mayarWebhookToken || !tokenMatches(token, mosque.mayarWebhookToken)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as WebhookPayload | null;
  if (!payload || payload.event !== "payment.received") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const data = payload.data ?? {};
  if (!isPaidStatus(data.status)) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const transactionId =
    typeof data.transactionId === "string" ? data.transactionId : null;
  const invoiceId =
    typeof data.productId === "string"
      ? data.productId
      : typeof data.id === "string"
        ? data.id
        : null;

  let payment = transactionId
    ? db
        .select()
        .from(mayarPayments)
        .where(
          and(
            eq(mayarPayments.mosqueId, mosque.id),
            eq(mayarPayments.transactionId, transactionId)
          )
        )
        .get()
    : undefined;

  if (!payment && invoiceId) {
    payment = db
      .select()
      .from(mayarPayments)
      .where(
        and(
          eq(mayarPayments.mosqueId, mosque.id),
          eq(mayarPayments.invoiceId, invoiceId)
        )
      )
      .get();
  }

  if (!payment) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (payment.status === "paid") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // Mayar tidak menandatangani webhook: verifikasi langsung ke API sebelum
  // mencatat donasi, agar request palsu tidak bisa mengklaim pembayaran.
  if (mosque.mayarApiKey) {
    try {
      const detail = await getMayarPayment(mosque.mayarApiKey, payment.invoiceId);
      if (!isPaidStatus(detail?.status)) {
        return NextResponse.json({ ok: true, ignored: true });
      }
    } catch {
      // Biarkan Mayar mencoba lagi nanti.
      return NextResponse.json({ ok: false, error: "verify-failed" }, { status: 502 });
    }
  }

  const now = new Date();
  const donatedAt = todayISO();
  const donorName =
    typeof data.customerName === "string" && data.customerName.trim()
      ? data.customerName.trim().slice(0, 100)
      : payment.donorName;
  const donorPhone =
    payment.donorPhone ??
    (typeof data.customerMobile === "string"
      ? data.customerMobile.slice(0, 30)
      : null);

  const applied = db.transaction((tx) => {
    const updated = tx
      .update(mayarPayments)
      .set({
        status: "paid",
        paidAt: now,
        transactionId: transactionId ?? payment!.transactionId,
      })
      .where(
        and(eq(mayarPayments.id, payment!.id), eq(mayarPayments.status, "pending"))
      )
      .run();
    if (updated.changes === 0) return false;

    const inserted = tx
      .insert(donations)
      .values({
        mosqueId: mosque.id,
        programId: payment!.programId,
        categoryId: null,
        donorName,
        donorPhone,
        amount: payment!.amount,
        method: "online",
        donatedAt,
        note: `Pembayaran online Mayar · ${payment!.invoiceId}`,
        status: "verified",
        verifiedBy: "Mayar (otomatis)",
        verifiedAt: now,
      })
      .run();

    tx.update(mayarPayments)
      .set({ donationId: Number(inserted.lastInsertRowid) })
      .where(eq(mayarPayments.id, payment!.id))
      .run();

    return true;
  });

  if (applied) {
    revalidatePath(`/m/${mosque.slug}`, "layout");
    revalidatePath("/admin/donasi");
    revalidatePath("/admin");
  }

  return NextResponse.json({ ok: true, applied });
}