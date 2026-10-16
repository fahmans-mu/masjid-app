import Link from "next/link";
import { redirect } from "next/navigation";
import { requireMosqueSession } from "@/lib/auth";
import {
  countPendingDonations,
  countPendingQurban,
  getMosqueById,
} from "@/lib/queries";
import { AdminNav } from "@/components/AdminNav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque || !mosque.isActive) redirect("/admin/login");

  const pendingCount = countPendingDonations(mosque.id);
  const qurbanPendingCount = countPendingQurban(mosque.id);

  return (
    <div className="lg:flex">
      <AdminNav
        mosqueName={mosque.name}
        mosqueSlug={mosque.slug}
        userName={session.name}
        pendingCount={pendingCount}
        qurbanPendingCount={qurbanPendingCount}
        isDemo={mosque.isDemo}
        isSuper={session.role === "super"}
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {mosque.isDemo && (
          <div className="mx-auto mb-5 flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3.5">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Mode Demo</span> — Anda menjelajahi
              data contoh. Semua perubahan akan direset otomatis.
            </p>
            <Link
              href="/daftar"
              className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Daftarkan masjid asli
            </Link>
          </div>
        )}
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
