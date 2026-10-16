import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DonationForm } from "@/components/admin/DonationForm";
import { requireMosqueSession } from "@/lib/auth";
import { listCategories, programsWithRaised } from "@/lib/queries";

export const metadata: Metadata = { title: "Input Donasi" };

export default async function NewDonationPage() {
  const session = await requireMosqueSession();
  const programs = programsWithRaised(session.mosqueId).map((p) => ({ id: p.id, title: p.title }));
  const categories = listCategories(session.mosqueId, "income").filter((c) => c.isActive);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/donasi"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar donasi
      </Link>
      <h1 className="mb-6 mt-4 text-xl font-bold text-slate-900">
        Input Donasi Manual
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <DonationForm programs={programs} categories={categories} />
      </div>
    </div>
  );
}
