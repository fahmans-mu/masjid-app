import { headers } from "next/headers";

// URL publik aplikasi (untuk redirect Mayar / webhook) tanpa trailing slash.
export async function getAppBaseUrl(): Promise<string> {
  const fromEnv = process.env.APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").trim();
  if (!host) return "https://masjid-app.my.id";

  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i.test(host);
  const proto = h.get("x-forwarded-proto") ?? (isLocal ? "http" : "https");
  return `${proto}://${host}`;
}