import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarClock, CheckCircle2, Info, PiggyBank } from "lucide-react";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { QurbanRegisterForm } from "@/components/QurbanRegisterForm";
import {
  getActiveQurbanProgram,
  getMosqueBySlug,
  listQurbanParticipantsDetailed,
} from "@/lib/queries";
import { formatDateID, formatRupiah } from "@/lib/format";

export const metadata: Metadata = {
  title: "Tabungan Qurban",
};

export default async function QurbanPublicPage({
  params,
}: {
  params: Promise<{ mosque: string }>;
}) {
  const { mosque } = await params;
  const m = getMosqueBySlug(mosque);
  if (!m || !m.isActive) notFound();

  const program = getActiveQurbanProgram(m.id);
  if (!program) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Tabungan Qurban — {m.name}
          </h1>
          <p className="mt-2 text-slate-500">
            Program menabung bersama untuk berqurban pada Idul Adha. Setoran
            dapat dilakukan bertahap dan dicatat secara transparan.
          </p>
        </div>
        <EmptyState
          title="Belum ada program qurban aktif"
          description="Pengurus belum membuka program tabungan qurban. Silakan cek kembali nanti."
        />
      </div>
    );
  }

  const participants = listQurbanParticipantsDetailed(program.id, { onlyApproved: true });
  const totalRaised = participants.reduce((s, p) => s + p.raised, 0);
  const totalTarget = participants.reduce((s, p) => s + p.targetAmount, 0);
  const kambingCount = participants.filter((p) => p.animalType === "kambing").length;
  const sapiCount = participants.filter((p) => p.animalType === "sapi").length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {/* Header program */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <PiggyBank className="h-3.5 w-3.5" />
          Tabungan Qurban
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          {program.title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{m.name}</p>
        {program.description && (
          <p className="mt-4 max-w-3xl whitespace-pre-line text-slate-600">
            {program.description}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
          {program.goatPrice && (
            <span className="text-slate-700">
              Kambing: <span className="font-bold">{formatRupiah(program.goatPrice)}</span>
            </span>
          )}
          {program.cowSharePrice && (
            <span className="text-slate-700">
              Sapi (1/7):{" "}
              <span className="font-bold">{formatRupiah(program.cowSharePrice)}</span>
            </span>
          )}
          {program.targetDate && (
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <CalendarClock className="h-4 w-4 text-amber-500" />
              Target selesai: {formatDateID(program.targetDate)}
            </span>
          )}
        </div>
      </div>

      {/* Statistik */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Peserta terdaftar</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {participants.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {kambingCount} kambing · {sapiCount} sapi (1/7)
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total tabungan terkumpul</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {formatRupiah(totalRaised)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            dari total target {formatRupiah(totalTarget)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Sudah lunas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {participants.filter((p) => p.done).length} peserta
          </p>
          <p className="mt-1 text-xs text-slate-500">
            target sebelum {program.targetDate ? formatDateID(program.targetDate) : "hari raya"}
          </p>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Daftar peserta */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-bold text-slate-900">Progres Peserta</h2>
            <p className="mt-1 text-sm text-slate-500">
              Peserta yang sudah diverifikasi bendahara beserta progres
              tabungannya.
            </p>
            {participants.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">
                Belum ada peserta terverifikasi. Jadilah yang pertama mendaftar!
              </p>
            ) : (
              <ul className="mt-5 space-y-5">
                {participants.map((p) => (
                  <li key={p.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-800">{p.name}</p>
                        <Badge kind={p.animalType === "kambing" ? "campaign" : "rutin"}>
                          {p.animalType === "kambing" ? "Kambing" : "Sapi 1/7"}
                        </Badge>
                        {p.done && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Lunas
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {formatRupiah(p.raised)}{" "}
                        <span className="font-normal text-slate-400">
                          / {formatRupiah(p.targetAmount)}
                        </span>
                      </span>
                    </div>
                    <ProgressBar
                      value={p.raised}
                      target={p.targetAmount}
                      tone={p.done ? "emerald" : "amber"}
                      className="mt-2"
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Info & form */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-bold text-slate-900">Cara Ikut Tabungan Qurban</h2>
            <ol className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  1
                </span>
                Daftar melalui formulir di bawah (tulis nama sesuai niat qurban).
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  2
                </span>
                Bendahara memverifikasi pendaftaran Anda.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  3
                </span>
                Setor tabungan bertahap (transfer/QRIS/tunai) ke bendahara.
              </li>
              <li className="flex gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                  4
                </span>
                Progres tabungan Anda tampil di halaman ini sampai lunas.
              </li>
            </ol>
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-sky-50 px-3.5 py-3 text-xs text-sky-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Tabungan qurban dikelola terpisah dari kas operasional masjid dan
              tidak dicampur dengan dana lainnya.
            </p>
          </div>
        </div>
      </div>

      {/* Form pendaftaran */}
      <section
        id="daftar"
        className="mt-10 rounded-2xl border border-amber-200 bg-white p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-slate-900">Formulir Pendaftaran</h2>
        <p className="mb-6 mt-1 text-sm text-slate-500">
          Isi data berikut untuk mendaftar pada program{" "}
          <span className="font-semibold">{program.title}</span>. Pendaftaran akan
          diverifikasi bendahara sebelum tampil di halaman ini.
        </p>
        <QurbanRegisterForm
          mosqueId={m.id}
          programId={program.id}
          goatPrice={program.goatPrice}
          cowSharePrice={program.cowSharePrice}
        />
      </section>
    </div>
  );
}
