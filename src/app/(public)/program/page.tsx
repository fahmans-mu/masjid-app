import type { Metadata } from "next";
import { EmptyState } from "@/components/EmptyState";
import { ProgramCard } from "@/components/ProgramCard";
import { programsWithRaised } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Program Donasi",
};

export default function ProgramListPage() {
  const all = programsWithRaised();
  const activeCampaigns = all.filter((p) => p.type === "campaign" && p.isActive);
  const doneCampaigns = all.filter((p) => p.type === "campaign" && !p.isActive);
  const rutin = all.filter((p) => p.type === "rutin" && p.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Program Donasi
        </h1>
        <p className="mt-2 text-slate-500">
          Campaign penggalangan dana dan program donasi rutin masjid. Klik
          program untuk melihat rincian dan riwayat donasinya.
        </p>
      </div>

      <section>
        <h2 className="mb-5 text-lg font-bold text-slate-900">
          Campaign Aktif
        </h2>
        {activeCampaigns.length === 0 ? (
          <EmptyState
            title="Belum ada campaign aktif"
            description="Silakan cek kembali nanti, atau lihat program donasi rutin di bawah."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {activeCampaigns.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>

      {rutin.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-lg font-bold text-slate-900">
            Program Donasi Rutin
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rutin.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}

      {doneCampaigns.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-5 text-lg font-bold text-slate-900">
            Campaign Selesai
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doneCampaigns.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
