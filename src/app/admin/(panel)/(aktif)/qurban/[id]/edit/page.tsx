import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QurbanProgramForm } from "@/components/admin/QurbanProgramForm";
import { requireMosqueSession } from "@/lib/auth";
import { getQurbanProgramById } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Program Qurban" };

export default async function EditQurbanProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireMosqueSession();
  const program = getQurbanProgramById(session.mosqueId, Number(id));
  if (!program) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/qurban"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-amber-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke tabungan qurban
      </Link>
      <h1 className="mb-6 mt-4 text-xl font-bold text-slate-900">
        Edit Program Qurban
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <QurbanProgramForm program={program} />
      </div>
    </div>
  );
}
