export type CityPreset = {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

export function shortZone(timezone: string): string {
  if (timezone === "Asia/Makassar") return "WITA";
  if (timezone === "Asia/Jayapura") return "WIT";
  return "WIB";
}

export const CITY_PRESETS: CityPreset[] = [
  { label: "Banda Aceh", latitude: 5.5483, longitude: 95.3238, timezone: "Asia/Jakarta" },
  { label: "Medan", latitude: 3.5952, longitude: 98.6722, timezone: "Asia/Jakarta" },
  { label: "Padang", latitude: -0.9471, longitude: 100.4172, timezone: "Asia/Jakarta" },
  { label: "Pekanbaru", latitude: 0.5071, longitude: 101.4478, timezone: "Asia/Jakarta" },
  { label: "Palembang", latitude: -2.9761, longitude: 104.7754, timezone: "Asia/Jakarta" },
  { label: "Jakarta", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta" },
  { label: "Bogor", latitude: -6.595, longitude: 106.8166, timezone: "Asia/Jakarta" },
  { label: "Depok", latitude: -6.4025, longitude: 106.7942, timezone: "Asia/Jakarta" },
  { label: "Tangerang", latitude: -6.1783, longitude: 106.6319, timezone: "Asia/Jakarta" },
  { label: "Bekasi", latitude: -6.2383, longitude: 106.9756, timezone: "Asia/Jakarta" },
  { label: "Bandung", latitude: -6.9175, longitude: 107.6191, timezone: "Asia/Jakarta" },
  { label: "Cirebon", latitude: -6.732, longitude: 108.5523, timezone: "Asia/Jakarta" },
  { label: "Tasikmalaya", latitude: -7.3195, longitude: 108.2207, timezone: "Asia/Jakarta" },
  { label: "Semarang", latitude: -6.9667, longitude: 110.4167, timezone: "Asia/Jakarta" },
  { label: "Yogyakarta", latitude: -7.7956, longitude: 110.3695, timezone: "Asia/Jakarta" },
  { label: "Surakarta (Solo)", latitude: -7.5755, longitude: 110.8243, timezone: "Asia/Jakarta" },
  { label: "Surabaya", latitude: -7.2575, longitude: 112.7521, timezone: "Asia/Jakarta" },
  { label: "Malang", latitude: -7.9666, longitude: 112.6326, timezone: "Asia/Jakarta" },
  { label: "Pontianak", latitude: -0.0263, longitude: 109.3425, timezone: "Asia/Jakarta" },
  { label: "Banjarmasin", latitude: -3.3186, longitude: 114.5944, timezone: "Asia/Makassar" },
  { label: "Samarinda", latitude: -0.5022, longitude: 117.1536, timezone: "Asia/Makassar" },
  { label: "Balikpapan", latitude: -1.2379, longitude: 116.8529, timezone: "Asia/Makassar" },
  { label: "Makassar", latitude: -5.1477, longitude: 119.4327, timezone: "Asia/Makassar" },
  { label: "Manado", latitude: 1.4748, longitude: 124.8421, timezone: "Asia/Makassar" },
  { label: "Denpasar", latitude: -8.6705, longitude: 115.2126, timezone: "Asia/Makassar" },
  { label: "Mataram", latitude: -8.5833, longitude: 116.1167, timezone: "Asia/Makassar" },
  { label: "Kupang", latitude: -10.1772, longitude: 123.607, timezone: "Asia/Makassar" },
  { label: "Ambon", latitude: -3.6954, longitude: 128.1814, timezone: "Asia/Jayapura" },
  { label: "Jayapura", latitude: -2.5916, longitude: 140.669, timezone: "Asia/Jayapura" },
];
