import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, UserRound } from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { requireMosqueSession } from "@/lib/auth";
import {
  getQurbanProgramById,
  listQurbanParticipantsDetailed,
  qurbanStats,
} from "@/lib/queries";
import { formatDateID, formatRupiah } from "@/lib/format";
import {
  approveQurbanParticipantAction,
  rejectQurbanParticipantAction,
} from "../actions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const session = await requireMosqueSession();
  const program = getQurbanProgramById(session.mosqueId, Number(id));
  return { title: program ? `Peserta ${program.title}` : "Peserta Qurban" };
}

const STATUS_UI: Record<string, { kind: string; label: string }> = {
  pending: { kind: "pending", label: "Menunggu" },
  approved: { kind: "verified", label: "Disetujui" },
  rejected: { kind: "rejected", label: "Ditolak" },
};

export default async function QurbanParticipantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireMosqueSession();
  const program = getQurbanProgramById(session.mosqueId, Number(id));
  if (!program) notFound();

  const stats = qurbanStats(program.id);
  const participants = listQurbanParticipantsDetailed(program.id).sort((a, b) => {
    const order = { pending: 0, approved: 1, rejected: 2 } as const;
    return order[a.status] - order[b.status] || a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <div>
      <Link
        href="/admin/qurban"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke tabungan qurban
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{program.title}</h1>
            {program.isActive ? (
              <Badge kind="aktif">Pendaftaran Dibuka</Badge>
            ) : (
              <Badge kind="selesai">Pendaftaran Ditutup</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {stats.approvedCount} peserta disetujui · {stats.pendingCount}{" "}
            menunggu · {stats.lunasCount} lunas
            {program.targetDate
              ? ` · perkiraan hari raya ${formatDateID(program.targetDate)}`
              : ""}
          </p>
        </div>
        <Link
          href={`/admin/qurban/${program.id}/edit`}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" /> Edit Program
        </Link>
      </div>

      {stats.pendingCount > 0 && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Ada <span className="font-semibold">{stats.pendingCount} pendaftar</span>{" "}
          yang menunggu persetujuan. Periksa &amp; setujui agar mereka tampil di
          halaman publik.
        </div>
      )}

      {participants.length === 0 ? (
        <EmptyState
          title="Belum ada peserta"
          description="Peserta akan muncul di sini setelah jamaah mendaftar dari halaman publik masjid."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Peserta</th>
                  <th className="px-4 py-3 font-semibold">Hewan</th>
                  <th className="px-4 py-3 text-right font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Progres</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => {
                  const ui = STATUS_UI[p.status];
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.phone ?? "tanpa no. HP"} · daftar{" "}
                          {formatDateID(p.createdAt.toISOString().slice(0, 10))}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <Badge kind={p.animalType === "kambing" ? "campaign" : "rutin"}>
                          {p.animalType === "kambing" ? "Kambing" : "Sapi 1/7"}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-slate-700">
                        {formatRupiah(p.targetAmount)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="w-36">
                          <ProgressBar
                            value={p.raised}
                            target={p.targetAmount}
                            tone={p.done ? "emerald" : "amber"}
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            {formatRupiah(p.raised)}
                            {p.done ? " · lunas" : ""}
                          </p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <Badge kind={ui.kind}>{ui.label}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {p.status !== "approved" && (
                            <form action={approveQurbanParticipantAction} className="inline">
                              <input type="hidden" name="id" value={p.id} />
                              <button
                                type="submit"
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Setujui
                              </button>
                            </form>
                          )}
                          {p.status !== "rejected" && (
                            <form action={rejectQurbanParticipantAction} className="inline">
                              <input type="hidden" name="id" value={p.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                Tolak
                              </button>
                            </form>
                          )}
                          <Link
                            href={`/admin/qurban/${program.id}/peserta/${p.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                          >
                            <UserRound className="h-3.5 w-3.5" /> Setoran
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
