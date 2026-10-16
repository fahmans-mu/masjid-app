import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNav } from "@/components/PlatformNav";
import { getPlatformSettings } from "@/lib/queries";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = getPlatformSettings();
  return (
    <div className="flex min-h-screen flex-col">
      <PlatformNav />
      <main className="flex-1">{children}</main>
      <PlatformFooter settings={settings} />
    </div>
  );
}
