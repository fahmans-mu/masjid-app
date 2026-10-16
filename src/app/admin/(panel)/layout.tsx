import { requireSession } from "@/lib/auth";
import { countPendingDonations, getSettings } from "@/lib/queries";
import { AdminNav } from "@/components/AdminNav";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const settings = getSettings();
  const pendingCount = countPendingDonations();

  return (
    <div className="lg:flex">
      <AdminNav
        mosqueName={settings?.mosqueName ?? "Panel Pengurus"}
        userName={session.name}
        pendingCount={pendingCount}
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
