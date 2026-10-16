import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { ProgressBar } from "@/components/ProgressBar";
import { QurbanDepositForm } from "@/components/admin/QurbanDepositForm";
import { requireMosqueSession } from "@/lib/auth";
import {
  getQurbanParticipantById,
  getQurbanProgramById,
  listQurbanDeposits,
  participantRaised,
} from "@/lib/queries";
import {
  formatDateID,
  formatRupiah,
  todayISO,
} from "@/lib/format";
import { methodLabel } from "@/lib/action-utils";
import {
  approveQurbanParticipantAction,
  deleteQurbanDepositAction,
  rejectQurbanParticipantAction,
} from "../../../actions";

export const metadata: Metadata = { title: "Detail Peserta Qurban" };

export default async function QurbanParticipantDetailPage({
  params,
}: {
  params: Promise<{ id: string; pid: string }>;
}) {
  const { id, pid } = await params;
  const session = await requireMosqueSession();
  const program = getQurbanProgramById(session.mosqueId, Number(id));
  if (!program) notFound();

  const participant = getQurbanParticipantById(session.mosqueId, Number(pid));
  if (!participant || participant.programId !== program.id) notFound();

  const raised = participantRaised(participant.id);
  const done = raised >= participant.targetAmount;
  const deposits = listQurbanDeposits(participant.id);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href={`/admin/qurban/${program.id}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar peserta
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              {participant.name}
            </h1>
            <Badge
              kind={participant.animalType === "kambing" ? "campaign" : "rutin"}
            >
              {participant.animalType === "kambing" ? "Kambing" : "Sapi 1/7"}
            </Badge>
            {participant.status === "pending" && (
              <Badge kind="pending">Menunggu persetujuan</Badge>
            )}
            {participant.status === "approved" && (
              <Badge kind="verified">Disetujui</Badge>
            )}
            {participant.status === "rejected" && (
              <Badge kind="rejected">Ditolak</Badge>
            )}
            {done && (
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Lunas
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {program.title}
            {participant.phone ? ` · ${participant.phone}` : ""} · daftar{" "}
            {formatDateID(participant.createdAt.toISOString().slice(0, 10))}
            {participant.note ? ` · catatan: ${participant.note}` : ""}
          </p>
        </div>
        {participant.status === "pending" && (
          <div className="flex gap-2">
            <form action={approveQurbanParticipantAction}>
              <input type="hidden" name="id" value={participant.id} />
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Setujui Peserta
              </button>
            </form>
            <form action={rejectQurbanParticipantAction}>
              <input type="hidden" name="id" value={participant.id} />
              <button
                type="submit"
                className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Tolak
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">Target (harga hewan)</p>
          <p className="mt-1 font-bold text-slate-900">
            {formatRupiah(participant.targetAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Sudah terkumpul</p>
          <p className="mt-1 font-bold text-amber-800">{formatRupiah(raised)}</p>
        </div>
        <div
          className={`rounded-2xl border p-4 ${
            done
              ? "border-emerald-200 bg-emerald-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <p className={`text-xs ${done ? "text-emerald-700" : "text-slate-500"}`}>
            {done ? "Status" : "Sisa kekurangan"}
          </p>
          <p
            className={`mt-1 font-bold ${
              done ? "text-emerald-800" : "text-slate-900"
            }`}
          >
            {done ? "LUNAS" : formatRupiah(participant.targetAmount - raised)}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={raised}
          target={participant.targetAmount}
          tone={done ? "emerald" : "amber"}
        />
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="font-bold text-slate-900">Catat Setoran Baru</p>
        <p className="mt-1 text-sm text-slate-500">
          Catat setiap setoran cicilan dari peserta ini. Progres otomatis
          tampil di halaman publik.
        </p>
        <div className="mt-4">
          <QurbanDepositForm participantId={participant.id} today={todayISO()} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="font-bold text-slate-900">Riwayat Setoran</p>
        {deposits.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Belum ada setoran tercatat.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2.5 pr-4 font-semibold">Tanggal</th>
                  <th className="py-2.5 pr-4 text-right font-semibold">Nominal</th>
                  <th className="py-2.5 pr-4 font-semibold">Metode</th>
                  <th className="py-2.5 pr-4 font-semibold">Catatan</th>
                  <th className="py-2.5 pr-4 font-semibold">Dicatat oleh</th>
                  <th className="py-2.5 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 last:border-0">
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-700">
                      {formatDateID(d.depositedAt)}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-right font-semibold text-slate-900">
                      {formatRupiah(d.amount)}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-600">
                      {methodLabel(d.method)}
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {d.note ?? "—"}
                      {d.proofUrl && (
                        <a
                          href={d.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-2 text-xs font-semibold text-sky-600 hover:underline"
                        >
                          Bukti
                        </a>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                      {d.recordedBy ?? "—"}
                    </td>
                    <td className="whitespace-nowrap py-3 text-right">
                      <DeleteButton
                        action={deleteQurbanDepositAction}
                        fields={{ id: d.id }}
                        confirmText={`Hapus setoran ${formatRupiah(d.amount)}? Tindakan ini tidak bisa dibatalkan.`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
