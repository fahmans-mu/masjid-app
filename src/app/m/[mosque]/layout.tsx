import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Landmark } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { getMosqueBySlug } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ mosque: string }>;
}): Promise<Metadata> {
  const { mosque } = await params;
  const m = getMosqueBySlug(mosque);
  const name = m?.name ?? "Masjid";
  return { title: { default: name, template: `%s · ${name}` } };
}

export default async function MosqueLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ mosque: string }>;
}) {
  const { mosque } = await params;
  const m = getMosqueBySlug(mosque);
  if (!m || !m.isActive) notFound();

  const basePath = `/m/${m.slug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <PublicNav mosqueName={m.name} logoUrl={m.logoUrl} basePath={basePath} />
      <main className="flex-1">{children}</main>
      <footer className="no-print border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Landmark className="h-4.5 w-4.5" />
              </span>
              <span className="font-bold text-slate-900">{m.name}</span>
            </div>
            {m.tagline && <p className="mt-3 text-sm text-slate-500">{m.tagline}</p>}
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Sekretariat</p>
            {m.address && <p className="mt-2">{m.address}</p>}
            {m.phone && <p className="mt-1">Telp/WA: {m.phone}</p>}
            {m.email && <p className="mt-1">{m.email}</p>}
          </div>
          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">Informasi</p>
            <div className="mt-2 flex flex-col gap-1.5">
              <Link href={`${basePath}/program`} className="hover:text-emerald-700">
                Program donasi
              </Link>
              <Link href={`${basePath}/qurban`} className="hover:text-emerald-700">
                Tabungan qurban
              </Link>
              <Link href={`${basePath}/laporan`} className="hover:text-emerald-700">
                Laporan keuangan bulanan
              </Link>
              <Link href={`${basePath}/transparansi`} className="hover:text-emerald-700">
                Buku kas terbuka
              </Link>
              <Link href="/admin/login" className="hover:text-emerald-700">
                Login pengurus
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          <p>
            {m.name} · Laporan keuangan dikelola secara transparan dan dapat
            dipertanggungjawabkan
          </p>
          <p className="mt-1">
            Dikelola dengan{" "}
            <Link href="/" className="font-semibold text-emerald-700 hover:underline">
              MasjidAmanah
            </Link>{" "}
            — halaman seperti ini gratis untuk setiap masjid
          </p>
        </div>
      </footer>
    </div>
  );
}
