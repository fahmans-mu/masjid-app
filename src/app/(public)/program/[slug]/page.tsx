import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, Users } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DonationConfirmForm } from "@/components/DonationConfirmForm";
import { DonationMethods } from "@/components/DonationMethods";
import { ProgressBar } from "@/components/ProgressBar";
import {
  getProgramBySlug,
  getSettings,
  listCategories,
  listDonations,
  programsWithRaised,
} from "@/lib/queries";
import {
  formatDateID,
  formatRupiah,
  maskDonorName,
  percent,
  todayISO,
} from "@/lib/format";
import { methodLabel } from "@/lib/action-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProgramBySlug(slug);
  return { title: p?.title ?? "Program Donasi" };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = getProgramBySlug(slug);
  if (!program) notFound();

  const settings = getSettings();
  const showNames = settings?.showDonorNames ?? true;
  const isCampaign = program.type === "campaign";
  const target = isCampaign ? program.targetAmount : program.monthlyTarget;
  const value = isCampaign ? program.raised : program.raisedThisMonth;
  const pct = percent(value, target ?? 0);

  const donations = listDonations({
    programId: program.id,
    status: "verified",
    perPage: 15,
  });

  const formPrograms = programsWithRaised({ activeOnly: true }).map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
  }));
  const formCategories = listCategories("income")
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));

  let deadlineText: string | null = null;
  if (isCampaign && program.endDate) {
    const daysLeft = Math.ceil(
      (new Date(program.endDate + "T00:00:00").getTime() -
        new Date(todayISO() + "T00:00:00").getTime()) /
        86_400_000
    );
    if (daysLeft > 1) deadlineText = `${daysLeft} hari lagi · berakhir ${formatDateID(program.endDate)}`;
    else if (daysLeft >= 0) deadlineText = "Berakhir hari ini";
    else deadlineText = `Tenggat ${formatDateID(program.endDate)}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <Link
        href="/program"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Semua program
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-3">
        {/* Kolom utama */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {program.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={program.imageUrl}
                alt={program.title}
                className="h-56 w-full object-cover sm:h-72"
              />
            ) : (
              <div
                className={`h-32 w-full ${
                  isCampaign
                    ? "bg-gradient-to-br from-emerald-600 to-teal-700"
                    : "bg-gradient-to-br from-violet-600 to-indigo-700"
                }`}
              />
            )}
            <div className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge kind={program.type}>
                  {isCampaign ? "Campaign" : "Donasi Rutin"}
                </Badge>
                {!program.isActive && <Badge kind="selesai">Selesai</Badge>}
              </div>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                {program.title}
              </h1>
              {program.description && (
                <p className="mt-4 whitespace-pre-line text-slate-600">
                  {program.description}
                </p>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {formatRupiah(value)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {isCampaign
                    ? `terkumpul dari target ${formatRupiah(target)}`
                    : `terkumpul bulan ini dari target ${formatRupiah(target)}`}
                </p>
              </div>
              <span className="text-2xl font-bold text-emerald-600">{pct}%</span>
            </div>
            <ProgressBar
              value={value}
              target={target}
              tone={isCampaign ? "emerald" : "sky"}
              className="mt-4"
            />
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-400" />
                {donations.total} donasi tercatat
              </span>
              {isCampaign && program.startDate && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="h-4 w-4 text-slate-400" />
                  {formatDateID(program.startDate)}
                  {program.endDate ? ` — ${formatDateID(program.endDate)}` : ""}
                </span>
              )}
              {!isCampaign && program.raised > 0 && (
                <span>Total keseluruhan: {formatRupiah(program.raised)}</span>
              )}
              {deadlineText && program.isActive && (
                <span className="font-medium text-amber-600">{deadlineText}</span>
              )}
            </div>
          </div>

          {/* Riwayat donasi */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-bold text-slate-900">Donasi Terbaru</h2>
            {donations.rows.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                Belum ada donasi terverifikasi untuk program ini. Jadilah yang
                pertama!
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-slate-100">
                {donations.rows.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {maskDonorName(d.donorName, showNames)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDateID(d.donatedAt)} · {methodLabel(d.method)}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-emerald-600">
                      + {formatRupiah(d.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Kolom samping */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
            <h2 className="font-bold text-slate-900">Cara Berdonasi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Transfer atau scan QRIS, lalu kirim konfirmasi melalui formulir di
              bawah.
            </p>
            <div className="mt-4">
              <DonationMethods settings={settings} />
            </div>
          </div>
        </div>
      </div>

      {/* Form konfirmasi */}
      {program.isActive ? (
        <section id="konfirmasi" className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
          <h2 className="text-lg font-bold text-slate-900">
            Konfirmasi Donasi
          </h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">
            Sudah transfer untuk <span className="font-semibold">{program.title}</span>?
            Kirim konfirmasi berikut agar donasi Anda tercatat dan diverifikasi
            bendahara.
          </p>
          <DonationConfirmForm
            programs={formPrograms}
            categories={formCategories}
            defaultProgramId={program.id}
          />
        </section>
      ) : (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center sm:p-8">
          <p className="font-semibold text-slate-700">
            Program ini telah selesai. Jazakumullahu khairan atas dukungannya!
          </p>
          <Link
            href="/program"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:underline"
          >
            Lihat program lain yang masih berjalan →
          </Link>
        </section>
      )}
    </div>
  );
}
