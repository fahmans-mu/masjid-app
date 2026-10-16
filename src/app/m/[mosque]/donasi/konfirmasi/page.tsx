import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DonationConfirmForm } from "@/components/DonationConfirmForm";
import { DonationMethods } from "@/components/DonationMethods";
import { getMosqueBySlug, listCategories, programsWithRaised } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Konfirmasi Donasi",
};

export default async function DonasiKonfirmasiPage({
  params,
}: {
  params: Promise<{ mosque: string }>;
}) {
  const { mosque } = await params;
  const m = getMosqueBySlug(mosque);
  if (!m || !m.isActive) notFound();

  const formPrograms = programsWithRaised(m.id, { activeOnly: true }).map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
  }));
  const formCategories = listCategories(m.id, "income")
    .filter((c) => c.isActive)
    .map((c) => ({ id: c.id, name: c.name }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Konfirmasi Donasi — {m.name}
        </h1>
        <p className="mt-2 text-slate-500">
          Sudah menyalurkan donasi? Isi formulir berikut agar bendahara dapat
          memverifikasi dan mencatat donasi Anda. Donasi yang sudah
          terverifikasi akan tampil di halaman program dan buku kas publik.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-bold text-slate-900">Rekening & QRIS Resmi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Pastikan hanya menyalurkan donasi melalui rekening resmi berikut.
            </p>
            <div className="mt-4">
              <DonationMethods settings={m} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="font-bold text-slate-900">Formulir Konfirmasi</h2>
            <p className="mb-6 mt-1 text-sm text-slate-500">
              Formulir ini juga bisa dipakai untuk donasi umum (infaq, zakat,
              kotak amal) tanpa program tertentu.
            </p>
            <DonationConfirmForm mosqueId={m.id} programs={formPrograms} categories={formCategories} />
          </div>
        </div>
      </div>
    </div>
  );
}
