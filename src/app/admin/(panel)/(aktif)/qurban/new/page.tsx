import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { QurbanProgramForm } from "@/components/admin/QurbanProgramForm";

export const metadata: Metadata = { title: "Buat Program Qurban" };

export default function NewQurbanProgramPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/qurban"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke tabungan qurban
      </Link>
      <h1 className="mb-6 mt-4 text-xl font-bold text-slate-900">
        Buat Program Qurban
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <QurbanProgramForm />
      </div>
    </div>
  );
}
