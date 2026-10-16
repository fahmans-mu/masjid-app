import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/Badge";
import { DeleteButton } from "@/components/DeleteButton";
import { EmptyState } from "@/components/EmptyState";
import { ProgressBar } from "@/components/ProgressBar";
import { requireMosqueSession } from "@/lib/auth";
import { programsWithRaised } from "@/lib/queries";
import { formatRupiah, percent } from "@/lib/format";
import {
  deleteProgramAction,
  toggleProgramActiveAction,
} from "./actions";

export const metadata: Metadata = { title: "Program Donasi" };

export default async function AdminProgramPage() {
  const session = await requireMosqueSession();
  const rows = programsWithRaised(session.mosqueId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Program Donasi</h1>
          <p className="mt-1 text-sm text-slate-500">
            Kelola campaign dan program donasi rutin masjid.
          </p>
        </div>
        <Link
          href="/admin/program/new"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> Tambah Program
        </Link>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Belum ada program"
          description="Buat campaign pertama atau program donasi rutin untuk mulai menggalang dana."
        >
          <Link
            href="/admin/program/new"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Tambah Program
          </Link>
        </EmptyState>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Program</th>
                  <th className="px-4 py-3 font-semibold">Progress</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const target =
                    p.type === "campaign" ? p.targetAmount : p.monthlyTarget;
                  const value =
                    p.type === "campaign" ? p.raised : p.raisedThisMonth;
                  return (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="max-w-xs px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge kind={p.type}>
                            {p.type === "campaign" ? "Campaign" : "Rutin"}
                          </Badge>
                        </div>
                        <p className="mt-1.5 font-semibold text-slate-900">
                          {p.title}
                        </p>
                        <p className="text-xs text-slate-400">/{p.slug}</p>
                      </td>
                      <td className="min-w-[180px] px-4 py-4">
                        <p className="font-semibold text-slate-800">
                          {formatRupiah(value)}{" "}
                          <span className="font-normal text-slate-400">
                            / {formatRupiah(target)}
                          </span>
                        </p>
                        <ProgressBar
                          value={value}
                          target={target}
                          tone={p.type === "campaign" ? "emerald" : "sky"}
                          className="mt-1.5"
                        />
                        <p className="mt-1 text-xs text-slate-400">
                          {percent(value, target ?? 0)}%
                          {p.type === "rutin" && ` · total ${formatRupiah(p.raised)}`}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        {p.isActive ? (
                          <Badge kind="aktif">Aktif</Badge>
                        ) : (
                          <Badge kind="selesai">Nonaktif</Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/program/${p.id}/edit`}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                          >
                            Edit
                          </Link>
                          <form action={toggleProgramActiveAction} className="inline">
                            <input type="hidden" name="id" value={p.id} />
                            <button
                              type="submit"
                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                            >
                              {p.isActive ? "Nonaktifkan" : "Aktifkan"}
                            </button>
                          </form>
                          <DeleteButton
                            action={deleteProgramAction}
                            fields={{ id: p.id }}
                            confirmText={`Hapus program "${p.title}"? Donasi yang sudah tercatat tetap tersimpan, namun tidak lagi terhubung ke program ini.`}
                          />
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
