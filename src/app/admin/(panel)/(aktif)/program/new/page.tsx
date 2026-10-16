import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramForm } from "@/components/admin/ProgramForm";

export const metadata: Metadata = { title: "Tambah Program" };

export default function NewProgramPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/program"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar program
      </Link>
      <h1 className="mb-6 mt-4 text-xl font-bold text-slate-900">
        Tambah Program Donasi
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <ProgramForm />
      </div>
    </div>
  );
}
