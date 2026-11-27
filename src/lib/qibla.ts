// Arah kiblat dihitung dari koordinat masjid menuju Ka'bah (Makkah).

export const KAABA_LATITUDE = 21.4225;
export const KAABA_LONGITUDE = 39.8262;

const EARTH_RADIUS_KM = 6371.0088;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function normalizeDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Bearing (0–360°, searah jarum jam dari utara sejati) menuju Ka'bah.
 */
export function qiblaBearing(latitude: number, longitude: number): number {
  const phi = toRad(latitude);
  const phiK = toRad(KAABA_LATITUDE);
  const deltaLambda = toRad(KAABA_LONGITUDE - longitude);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(deltaLambda);

  return normalizeDegrees(toDeg(Math.atan2(y, x)));
}

/**
 * Jarak great-circle (km) dari titik tertentu ke Ka'bah.
 */
export function distanceToQibla(latitude: number, longitude: number): number {
  const phi1 = toRad(latitude);
  const phi2 = toRad(KAABA_LATITUDE);
  const dPhi = phi2 - phi1;
  const dLambda = toRad(KAABA_LONGITUDE - longitude);

  const a =
    Math.sin(dPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

const CARDINALS = [
  "Utara",
  "Timur Laut",
  "Timur",
  "Tenggara",
  "Selatan",
  "Barat Daya",
  "Barat",
  "Barat Laut",
] as const;

export function bearingCardinal(bearing: number): string {
  const index = Math.round(normalizeDegrees(bearing) / 45) % 8;
  return CARDINALS[index];
}

/**
 * Selisih terkecil (-180..180] antara dua arah.
 * Positif berarti target berada di kanan arah acuan.
 */
export function angleDifference(target: number, reference: number): number {
  return ((target - reference + 540) % 360) - 180;
}
