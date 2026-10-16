import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { listAppInfaqs } from "@/lib/queries";
import { formatDateID, formatDateTimeID, formatRupiah } from "@/lib/format";
import { methodLabel } from "@/lib/action-utils";
import { rejectAppInfaqAction, verifyAppInfaqAction } from "./actions";

export const metadata: Metadata = { title: "Infaq Aplikasi" };

const TABS = [
  { key: "", label: "Semua" },
  { key: "pending", label: "Menunggu" },
  { key: "verified", label: "Terverifikasi" },
  { key: "rejected", label: "Ditolak" },
] as const;

export default async function SuperadminInfaqPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const status = TABS.some((t) => t.key === sp.status && t.key !== "")
    ? (sp.status as "pending" | "verified" | "rejected")
    : undefined;

  const rows = listAppInfaqs(status);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Infaq Aplikasi</h1>
        <p className="mt-1 text-sm text-slate-500">
          Verifikasi infaq dari masjid. Setelah diverifikasi, masa aktif panel
          masjid otomatis diperpanjang sesuai paket yang dibayar.
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key ? `/superadmin/infaq?status=${t.key}` : "/superadmin/infaq"}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              (status ?? "") === t.key
                ? "bg-indigo-600 text-white"
                : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-semibold text-slate-700">Tidak ada data infaq</p>
          <p className="mt-1 text-sm text-slate-500">
            Infaq yang dikirim masjid lewat halaman /infaq akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((f) => (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-bold text-slate-900">{f.mosqueName}</p>
                    {f.status === "pending" && <Badge kind="pending">Menunggu</Badge>}
                    {f.status === "verified" && <Badge kind="verified">Terverifikasi</Badge>}
                    {f.status === "rejected" && <Badge kind="rejected">Ditolak</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold">{formatRupiah(f.amount)}</span>{" "}
                    · paket {f.months} bulan ({formatRupiah(f.monthlyAmount)}/bulan)
                    · {methodLabel(f.method)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    <Link
                      href={`/m/${f.mosqueSlug}`}
                      target="_blank"
                      className="font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      /m/{f.mosqueSlug}
                    </Link>
                    {" · "}dikirim {formatDateTimeID(f.createdAt)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Pengirim: {f.senderName ?? "—"}
                    {f.note ? ` · ${f.note}` : ""}
                  </p>
                  {f.status === "verified" && f.periodEnd && (
                    <p className="mt-1 text-xs text-emerald-700">
                      Masa aktif diperpanjang sampai{" "}
                      {formatDateID(f.periodEnd.toISOString().slice(0, 10))}
                      {f.verifiedBy ? ` · oleh ${f.verifiedBy}` : ""}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {f.proofUrl && (
                    <a
                      href={f.proofUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Lihat Bukti
                    </a>
                  )}
                  {f.status === "pending" && (
                    <>
                      <form action={verifyAppInfaqAction} className="inline">
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          className="rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Verifikasi &amp; Perpanjang {f.months} Bulan
                        </button>
                      </form>
                      <form action={rejectAppInfaqAction} className="inline">
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          className="rounded-xl border border-red-200 px-3.5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Tolak
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-sky-800">
        <p className="font-semibold">Tips verifikasi</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Buka bukti transfer &amp; cocokkan nominal dengan paket (bulanan × jumlah bulan).</li>
          <li>Verifikasi akan menambah masa aktif dari tanggal aktif terakhir — bukan dari hari ini.</li>
          <li>Masjid yang kadaluarsa tetap bisa mengirim infaq lewat halaman publik mereka.</li>
        </ul>
      </div>
    </div>
  );
}
