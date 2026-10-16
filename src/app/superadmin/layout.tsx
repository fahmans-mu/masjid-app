import { requireSuper } from "@/lib/auth";
import { countPendingAppInfaqs } from "@/lib/queries";
import { SuperNav } from "@/components/SuperNav";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSuper();
  const pendingCount = countPendingAppInfaqs();

  return (
    <div className="min-h-screen bg-slate-100">
      <SuperNav userName={session.name} pendingCount={pendingCount} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
