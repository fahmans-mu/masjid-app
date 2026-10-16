export const APP_NAME = "MasjidAmanah";

export const COOKIE_NAME = "masjid_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 hari

export function getAuthSecret(): Uint8Array {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-secret-jangan-dipakai-di-produksi"
  );
}
