import type { Metadata, Viewport } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL("https://masjid-app.my.id"),
  applicationName: "MasjidAmanah",
  title: {
    default: "MasjidAmanah — Transparansi Keuangan Masjid",
    template: "%s · MasjidAmanah",
  },
  description:
    "Penggalangan dana, program donasi rutin, dan laporan keuangan masjid yang transparan serta dapat dipertanggungjawabkan.",
  appleWebApp: {
    capable: true,
    title: "MasjidAmanah",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#065f46",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
