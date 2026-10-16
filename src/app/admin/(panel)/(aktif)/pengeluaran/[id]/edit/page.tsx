import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ExpenseForm } from "@/components/admin/ExpenseForm";
import { requireMosqueSession } from "@/lib/auth";
import { getExpenseById, listCategories, programsWithRaised } from "@/lib/queries";

export const metadata: Metadata = { title: "Edit Pengeluaran" };

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireMosqueSession();
  const { id } = await params;
  const expense = getExpenseById(session.mosqueId, Number(id));
  if (!expense) notFound();

  const programs = programsWithRaised(session.mosqueId).map((p) => ({ id: p.id, title: p.title }));
  const categories = listCategories(session.mosqueId, "expense").filter((c) => c.isActive);

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/admin/pengeluaran"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-emerald-700"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar pengeluaran
      </Link>
      <h1 className="mb-6 mt-4 text-xl font-bold text-slate-900">
        Edit Pengeluaran
      </h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <ExpenseForm
          expense={expense}
          categories={categories}
          programs={programs}
        />
      </div>
    </div>
  );
}
