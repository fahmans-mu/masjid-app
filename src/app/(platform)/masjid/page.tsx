import type { Metadata } from "next";
import Link from "next/link";
import { Landmark, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { listMosques } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Daftar Masjid",
};

export default async function DaftarMasjidPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const query = (sp.q ?? "").trim();
  const mosques = listMosques({ search: query || undefined });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Masjid yang sudah bergabung
        </h1>
        <p className="mt-2 text-slate-500">
          Setiap masjid memiliki halaman publik berisi program donasi, laporan
          keuangan, dan buku kas yang bisa diakses siapa saja.
        </p>
      </div>

      <form className="mb-8 flex max-w-md items-center gap-2" method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Cari nama masjid..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Cari
        </button>
      </form>

      {mosques.length === 0 ? (
        <EmptyState
          title={query ? `Tidak ada masjid bernama "${query}"` : "Belum ada masjid terdaftar"}
          description={
            query
              ? "Coba kata kunci lain, atau daftarkan masjid Anda."
              : "Jadilah masjid pertama yang bergabung."
          }
        >
          <Link
            href="/daftar"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            Daftarkan Masjid
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mosques.map((m) => (
            <Link
              key={m.id}
              href={`/m/${m.slug}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {m.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={m.logoUrl}
                      alt={m.name}
                      className="h-12 w-12 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Landmark className="h-6 w-6" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-900 group-hover:text-emerald-700">
                      {m.name}
                    </p>
                    {m.address && (
                      <p className="truncate text-xs text-slate-500">{m.address}</p>
                    )}
                  </div>
                </div>
                {m.isDemo && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Demo
                  </span>
                )}
              </div>
              {m.tagline && (
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{m.tagline}</p>
              )}
              <p className="mt-4 text-xs font-semibold text-emerald-700 group-hover:underline">
                Lihat laporan & program →
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
