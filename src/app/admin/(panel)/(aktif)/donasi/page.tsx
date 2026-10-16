import type { Metadata } from "next";
import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { requireMosqueSession } from "@/lib/auth";
import {
  distinctTransactionPeriods,
  listDonations,
  programsWithRaised,
} from "@/lib/queries";
import { formatDateID, formatRupiah, monthLabel } from "@/lib/format";
import { methodLabel, statusLabel } from "@/lib/action-utils";
import {
  deleteDonationAction,
  rejectDonationAction,
  verifyDonationAction,
} from "./actions";

export const metadata: Metadata = { title: "Donasi" };

const STATUSES = ["pending", "verified", "rejected"] as const;
type StatusFilter = (typeof STATUSES)[number];

export default async function AdminDonasiPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    period?: string;
    q?: string;
    program?: string;
    page?: string;
  }>;
}) {
  const session = await requireMosqueSession();
  const mosqueId = session.mosqueId;
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as StatusFilter)
    ? (sp.status as StatusFilter)
    : undefined;
  const period = sp.period && /^\d{4}-\d{2}$/.test(sp.period) ? sp.period : undefined;
  const q = sp.q?.trim() || undefined;
  const programId = sp.program ? Number(sp.program) || undefined : undefined;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const data = listDonations(mosqueId, { status, period, search: q, programId, page });

  const baseParams = (extra: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { status, period, q, program: sp.program, ...extra };
    for (const [k, v] of Object.entries(merged)) {
      if (v) p.set(k, v);
    }
    return p.toString();
  };

  const counts = {
    pending: listDonations(mosqueId, { status: "pending", period, search: q, programId, perPage: 1 }).total,
    verified: listDonations(mosqueId, { status: "verified", period, search: q, programId, perPage: 1 }).total,
    rejected: listDonations(mosqueId, { status: "rejected", period, search: q, programId, perPage: 1 }).total,
    all: listDonations(mosqueId, { period, search: q, programId, perPage: 1 }).total,
  };

  const tabs: { key: StatusFilter | undefined; label: string; count: number }[] = [
    { key: "pending", label: "Menunggu Verifikasi", count: counts.pending },
    { key: "verified", label: "Terverifikasi", count: counts.verified },
    { key: "rejected", label: "Ditolak", count: counts.rejected },
    { key: undefined, label: "Semua", count: counts.all },
  ];

  const periods = distinctTransactionPeriods(mosqueId);
  const programs = programsWithRaised(mosqueId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Donasi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Verifikasi konfirmasi donasi jamaah dan catat donasi manual.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/export/donasi?${baseParams({})}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <Link
            href="/admin/donasi/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Input Donasi
          </Link>
        </div>
      </div>

      {/* Tabs status */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (t.key ?? undefined) === (status ?? undefined);
          return (
            <Link
              key={t.label}
              href={`/admin/donasi${baseParams({ status: t.key, page: undefined }) ? `?${baseParams({ status: t.key, page: undefined })}` : ""}`}
              className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs ${
                  active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Filter */}
      <form
        method="get"
        className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4"
      >
        {status && <input type="hidden" name="status" value={status} />}
        <div>
          <label htmlFor="f-period" className="mb-1 block text-xs font-medium text-slate-500">
            Bulan
          </label>
          <select
            id="f-period"
            name="period"
            defaultValue={period ?? ""}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua bulan</option>
            {periods.map((p) => (
              <option key={p} value={p}>
                {monthLabel(p)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-program" className="mb-1 block text-xs font-medium text-slate-500">
            Program
          </label>
          <select
            id="f-program"
            name="program"
            defaultValue={sp.program ?? ""}
            className="max-w-52 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">Semua program</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-q" className="mb-1 block text-xs font-medium text-slate-500">
            Cari nama donatur
          </label>
          <input
            id="f-q"
            name="q"
            type="text"
            defaultValue={q ?? ""}
            placeholder="cth: Abdullah"
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Terapkan
        </button>
        {(period || q || sp.program) && (
          <Link
            href={status ? `/admin/donasi?status=${status}` : "/admin/donasi"}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Reset filter
          </Link>
        )}
      </form>

      {data.rows.length === 0 ? (
        <EmptyState
          title="Tidak ada donasi"
          description="Belum ada donasi yang cocok dengan filter yang dipilih."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                    <th className="px-4 py-3 font-semibold">Donatur</th>
                    <th className="hidden px-4 py-3 font-semibold md:table-cell">
                      Program / Kategori
                    </th>
                    <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                      Metode
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">Nominal</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((d) => (
                    <tr key={d.id} className="border-b border-slate-100 last:border-0 align-top">
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-500">
                        {formatDateID(d.donatedAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-800">{d.donorName}</p>
                        {d.donorPhone && (
                          <p className="text-xs text-slate-400">{d.donorPhone}</p>
                        )}
                        {d.note && (
                          <p className="mt-0.5 max-w-56 text-xs text-slate-400 italic">
                            {d.note}
                          </p>
                        )}
                      </td>
                      <td className="hidden px-4 py-3.5 text-slate-500 md:table-cell">
                        {d.programTitle ?? d.categoryName ?? "-"}
                      </td>
                      <td className="hidden px-4 py-3.5 sm:table-cell">
                        <Badge kind="verified">{methodLabel(d.method)}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-semibold text-slate-900">
                        {formatRupiah(d.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge kind={d.status}>{statusLabel(d.status)}</Badge>
                        {d.verifiedBy && d.status !== "pending" && (
                          <p className="mt-1 text-xs text-slate-400">oleh {d.verifiedBy}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {d.proofUrl && (
                            <a
                              href={d.proofUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50"
                            >
                              Bukti
                            </a>
                          )}
                          {d.status === "pending" ? (
                            <>
                              <form action={verifyDonationAction} className="inline">
                                <input type="hidden" name="id" value={d.id} />
                                <button
                                  type="submit"
                                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  Verifikasi
                                </button>
                              </form>
                              <form action={rejectDonationAction} className="inline">
                                <input type="hidden" name="id" value={d.id} />
                                <button
                                  type="submit"
                                  className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                  Tolak
                                </button>
                              </form>
                            </>
                          ) : (
                            <>
                              <Link
                                href={`/admin/donasi/${d.id}/edit`}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                              >
                                Edit
                              </Link>
                              <DeleteButton
                                action={deleteDonationAction}
                                fields={{ id: d.id }}
                                confirmText={`Hapus donasi ${formatRupiah(d.amount)} dari ${d.donorName}?`}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                    <td colSpan={4} className="px-4 py-3 text-slate-600">
                      Jumlah {data.total} donasi
                      {status ? ` (${statusLabel(status)})` : ""}
                      {period ? ` · ${monthLabel(period)}` : ""}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatRupiah(data.totalAmount)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {data.totalPages > 1 && (
            <div className="mt-5 flex items-center justify-between text-sm">
              <Link
                href={`/admin/donasi?${baseParams({ page: String(page - 1) })}`}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                }`}
              >
                ← Sebelumnya
              </Link>
              <span className="text-slate-500">
                Halaman {data.page} dari {data.totalPages}
              </span>
              <Link
                href={`/admin/donasi?${baseParams({ page: String(page + 1) })}`}
                className={`rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold ${
                  page >= data.totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-50"
                }`}
              >
                Berikutnya →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
