import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, PiggyBank, Plus, UserRound } from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { requireMosqueSession } from "@/lib/auth";
import { listQurbanPrograms, qurbanStats } from "@/lib/queries";
import { formatDateID, formatRupiah, formatRupiahRingkas } from "@/lib/format";
import { toggleQurbanProgramAction } from "./actions";

export const metadata: Metadata = { title: "Tabungan Qurban" };

export default async function AdminQurbanPage() {
  const session = await requireMosqueSession();
  const programs = listQurbanPrograms(session.mosqueId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tabungan Qurban</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola program tabungan qurban: pendaftaran peserta, setoran, dan
            pelunasan. Dana qurban terpisah dari kas operasional masjid.
          </p>
        </div>
        <Link
          href="/admin/qurban/new"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
        >
          <Plus className="h-4 w-4" /> Buat Program Qurban
        </Link>
      </div>

      {programs.length === 0 ? (
        <EmptyState
          title="Belum ada program qurban"
          description="Buat program untuk membuka pendaftaran tabungan qurban. Jamaah bisa mendaftar dari halaman publik masjid."
        >
          <Link
            href="/admin/qurban/new"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            <Plus className="h-4 w-4" /> Buat Program Qurban
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {programs.map((p) => {
            const stats = qurbanStats(p.id);
            return (
              <div
                key={p.id}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-bold text-slate-900">{p.title}</h2>
                      {p.isActive ? (
                        <Badge kind="aktif">Pendaftaran Dibuka</Badge>
                      ) : (
                        <Badge kind="selesai">Pendaftaran Ditutup</Badge>
                      )}
                      {stats.pendingCount > 0 && (
                        <Badge kind="pending">
                          {stats.pendingCount} peserta menunggu
                        </Badge>
                      )}
                    </div>
                    {p.description && (
                      <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        {p.description}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-slate-600">
                      {p.goatPrice != null && (
                        <span className="mr-4">
                          Kambing:{" "}
                          <span className="font-semibold">
                            {formatRupiah(p.goatPrice)}
                          </span>
                        </span>
                      )}
                      {p.cowSharePrice != null && (
                        <span className="mr-4">
                          Sapi 1/7:{" "}
                          <span className="font-semibold">
                            {formatRupiah(p.cowSharePrice)}
                          </span>
                        </span>
                      )}
                      {p.targetDate && (
                        <span className="text-slate-400">
                          Perkiraan hari raya: {formatDateID(p.targetDate)}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link
                      href={`/admin/qurban/${p.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
                    >
                      <UserRound className="h-4 w-4" /> Kelola Peserta
                    </Link>
                    <Link
                      href={`/admin/qurban/${p.id}/edit`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </Link>
                    <form action={toggleQurbanProgramAction}>
                      <input type="hidden" name="id" value={p.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        {p.isActive ? "Tutup Pendaftaran" : "Buka Pendaftaran"}
                      </button>
                    </form>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="text-xs text-slate-500">Peserta disetujui</p>
                    <p className="mt-0.5 font-bold text-slate-900">
                      {stats.approvedCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="text-xs text-slate-500">Kambing / Sapi 1/7</p>
                    <p className="mt-0.5 font-bold text-slate-900">
                      {stats.kambingCount} / {stats.sapiCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="text-xs text-slate-500">Sudah lunas</p>
                    <p className="mt-0.5 font-bold text-slate-900">
                      {stats.lunasCount}
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-50 p-3.5">
                    <p className="text-xs text-amber-700">Terkumpul</p>
                    <p className="mt-0.5 font-bold text-amber-800">
                      {formatRupiahRingkas(stats.totalRaised)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <ProgressBar
                    value={stats.totalRaised}
                    target={stats.totalTarget}
                    tone="amber"
                  />
                  <p className="mt-1.5 text-xs text-slate-400">
                    {formatRupiah(stats.totalRaised)} dari target{" "}
                    {formatRupiah(stats.totalTarget)} (total harga hewan
                    peserta disetujui)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
        <p className="flex items-center gap-2 font-semibold">
          <PiggyBank className="h-4 w-4" /> Alur tabungan qurban
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Buat program + tentukan harga kambing / sapi 1/7.</li>
          <li>Jamaah mendaftar dari halaman publik — peserta berstatus menunggu.</li>
          <li>Setujui peserta, lalu catat setiap setoran cicilan mereka.</li>
          <li>Progres tabungan tampil otomatis di halaman publik masjid.</li>
        </ol>
      </div>
    </div>
  );
}
