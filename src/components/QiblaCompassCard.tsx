"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Compass, Crosshair, MapPin, Navigation, RotateCcw } from "lucide-react";
import {
  angleDifference,
  bearingCardinal,
  distanceToQibla,
  normalizeDegrees,
  qiblaBearing,
} from "@/lib/qibla";

type QiblaCompassCardProps = {
  mosqueName: string;
  latitude: number;
  longitude: number;
  bearing: number;
  distanceKm: number;
};

type SensorState =
  | "idle"
  | "waiting"
  | "active"
  | "needs-permission"
  | "denied"
  | "unavailable";

type DeviceOrientationConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);

const distanceFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

function readHeading(event: DeviceOrientationEvent): number | null {
  const webkitHeading = (
    event as DeviceOrientationEvent & { webkitCompassHeading?: number }
  ).webkitCompassHeading;
  if (
    typeof webkitHeading === "number" &&
    Number.isFinite(webkitHeading) &&
    webkitHeading >= 0
  ) {
    return normalizeDegrees(webkitHeading);
  }
  if (typeof event.alpha === "number" && Number.isFinite(event.alpha)) {
    return normalizeDegrees(360 - event.alpha);
  }
  return null;
}

export function QiblaCompassCard({
  mosqueName,
  latitude,
  longitude,
  bearing,
  distanceKm,
}: QiblaCompassCardProps) {
  const [heading, setHeading] = useState<number | null>(null);
  const [sensor, setSensor] = useState<SensorState>("idle");
  const [listening, setListening] = useState(false);
  const [myLocation, setMyLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "error">("idle");
  const gotHeading = useRef(false);

  const startListening = useCallback(async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setSensor("unavailable");
      return;
    }
    setSensor("waiting");
    const ctor = window.DeviceOrientationEvent as DeviceOrientationConstructor;
    if (typeof ctor.requestPermission === "function") {
      try {
        const result = await ctor.requestPermission();
        if (result !== "granted") {
          setSensor("denied");
          return;
        }
      } catch {
        setSensor("denied");
        return;
      }
    }
    setListening(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      setSensor("unavailable");
      return;
    }
    const ctor = window.DeviceOrientationEvent as DeviceOrientationConstructor;
    if (typeof ctor.requestPermission === "function") {
      // Safari/iOS wajib meminta izin lewat sentuhan pengguna.
      setSensor("needs-permission");
      return;
    }
    setSensor("waiting");
    setListening(true);
  }, []);

  useEffect(() => {
    if (!listening) return;

    const eventName =
      "ondeviceorientationabsolute" in window
        ? "deviceorientationabsolute"
        : "deviceorientation";

    const handler = (event: Event) => {
      const deg = readHeading(event as DeviceOrientationEvent);
      if (deg == null) return;
      gotHeading.current = true;
      setHeading(deg);
      setSensor("active");
    };

    const fallbackTimer = window.setTimeout(() => {
      if (!gotHeading.current) setSensor("unavailable");
    }, 2500);

    window.addEventListener(eventName, handler, true);
    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener(eventName, handler, true);
    };
  }, [listening]);

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMyLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus("idle");
      },
      () => setGeoStatus("error"),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  };

  const targetBearing = myLocation
    ? qiblaBearing(myLocation.latitude, myLocation.longitude)
    : bearing;
  const targetDistance = myLocation
    ? distanceToQibla(myLocation.latitude, myLocation.longitude)
    : distanceKm;
  const cardinal = bearingCardinal(targetBearing);
  const roundedBearing = Math.round(targetBearing) % 360;
  const currentHeading = sensor === "active" ? heading : null;
  const delta =
    currentHeading != null ? angleDifference(targetBearing, currentHeading) : null;
  const dialRotation = currentHeading != null ? -currentHeading : 0;

  const locationLabel = myLocation ? "Lokasi perangkat Anda" : mosqueName;
  const locationDetail = myLocation
    ? `${myLocation.latitude.toFixed(4)}, ${myLocation.longitude.toFixed(4)}`
    : `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

  return (
    <section
      id="arah-kiblat"
      className="scroll-mt-20 border-t border-slate-100 bg-slate-50 py-14"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Arah Kiblat</h2>
          <p className="mt-1 text-sm text-slate-500">
            Arah menuju Ka&apos;bah dari lokasi masjid, dihitung otomatis dari
            koordinat.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
            {/* Kompas */}
            <div
              className="relative mx-auto aspect-square w-full max-w-[280px] select-none"
              role="img"
              aria-label={`Arah kiblat ${roundedBearing} derajat, arah ${cardinal.toLowerCase()}`}
            >
              <div className="absolute inset-0 rounded-full border-4 border-slate-100 bg-gradient-to-b from-white to-slate-50 shadow-inner" />
              <div
                className="absolute inset-0 transition-transform duration-150 ease-out"
                style={{ transform: `rotate(${dialRotation}deg)` }}
              >
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  {TICKS.map((deg) => {
                    const major = deg % 90 === 0;
                    const medium = deg % 30 === 0;
                    return (
                      <line
                        key={deg}
                        x1="100"
                        y1={major ? 5 : medium ? 7 : 9}
                        x2="100"
                        y2={major ? 16 : medium ? 14 : 12}
                        transform={`rotate(${deg} 100 100)`}
                        stroke={major ? "#334155" : "#cbd5e1"}
                        strokeWidth={major ? 1.8 : 0.9}
                        strokeLinecap="round"
                      />
                    );
                  })}

                  <text
                    x="100"
                    y="29"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#059669"
                  >
                    U
                  </text>
                  <text
                    x="171"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#64748b"
                  >
                    T
                  </text>
                  <text
                    x="100"
                    y="171"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#64748b"
                  >
                    S
                  </text>
                  <text
                    x="29"
                    y="100"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fontWeight="600"
                    fill="#64748b"
                  >
                    B
                  </text>

                  <g transform={`rotate(${targetBearing} 100 100)`}>
                    <line
                      x1="100"
                      y1="38"
                      x2="100"
                      y2="162"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeDasharray="3 4"
                      opacity="0.35"
                    />
                    <polygon points="100,52 95,100 105,100" fill="#059669" />
                    <polygon points="100,148 96,100 104,100" fill="#e2e8f0" />
                    <g transform="translate(100 40)">
                      <rect
                        x="-7.5"
                        y="-7.5"
                        width="15"
                        height="15"
                        rx="3"
                        fill="#0f172a"
                      />
                      <rect x="-7.5" y="-1.8" width="15" height="2.8" fill="#eab308" />
                      <rect
                        x="-3"
                        y="3.4"
                        width="6"
                        height="6"
                        rx="1"
                        fill="#eab308"
                        opacity="0.9"
                      />
                    </g>
                    <circle
                      cx="100"
                      cy="100"
                      r="6.5"
                      fill="#ffffff"
                      stroke="#059669"
                      strokeWidth="2.5"
                    />
                    <circle cx="100" cy="100" r="1.6" fill="#059669" />
                  </g>
                </svg>
              </div>
            </div>

            {/* Keterangan */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <p className="font-mono text-5xl font-bold tabular-nums text-slate-900">
                  {roundedBearing}°
                </p>
                <div className="pb-1.5">
                  <p className="text-sm font-semibold text-emerald-700">
                    arah {cardinal.toLowerCase()}
                  </p>
                  <p className="text-xs text-slate-500">dari utara sejati</p>
                </div>
              </div>

              <p className="mt-3 flex flex-wrap items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium text-slate-800">{locationLabel}</span>
                <span className="text-slate-400">·</span>
                <span>{locationDetail}</span>
                <span className="text-slate-400">·</span>
                <span>±{distanceFormatter.format(targetDistance)} km ke Ka&apos;bah</span>
              </p>

              <SensorStatus sensor={sensor} delta={delta} bearing={roundedBearing} />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {myLocation ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMyLocation(null);
                      setGeoStatus("idle");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Kembali ke lokasi masjid
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={useMyLocation}
                    disabled={geoStatus === "loading"}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-60"
                  >
                    <Crosshair className="h-3.5 w-3.5" />
                    {geoStatus === "loading" ? "Membaca lokasi…" : "Gunakan lokasi saya"}
                  </button>
                )}
                {sensor === "needs-permission" && (
                  <button
                    type="button"
                    onClick={startListening}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                  >
                    <Compass className="h-3.5 w-3.5" />
                    Aktifkan kompas
                  </button>
                )}
              </div>

              {geoStatus === "error" && (
                <p className="mt-2 text-xs text-red-500">
                  Lokasi tidak dapat dibaca. Periksa izin lokasi pada peramban.
                </p>
              )}

              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Letakkan ponsel mendatar dan jauhkan dari benda logam agar kompas lebih
                akurat. Hasil kompas perangkat dapat berselisih beberapa derajat dari
                arah sebenarnya.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SensorStatus({
  sensor,
  delta,
  bearing,
}: {
  sensor: SensorState;
  delta: number | null;
  bearing: number;
}) {
  if (sensor === "active" && delta != null) {
    const aligned = Math.abs(delta) < 5;
    return (
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
          <Navigation
            className="h-4 w-4 transition-transform duration-150"
            style={{ transform: `rotate(${delta}deg)` }}
          />
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-emerald-800">Kompas aktif</p>
          <p className="text-emerald-700">
            {aligned
              ? "Ponsel sudah mengarah ke kiblat."
              : `Geser ponsel ${Math.round(Math.abs(delta))}° ke ${
                  delta > 0 ? "kanan" : "kiri"
                } hingga penanda Ka'bah berada di atas.`}
          </p>
        </div>
      </div>
    );
  }

  if (sensor === "waiting") {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        Menunggu data kompas perangkat…
      </div>
    );
  }

  if (sensor === "needs-permission") {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Izinkan akses kompas agar penunjuk arah mengikuti gerak ponsel. Tanpa izin,
        kompas tetap bisa dipakai dalam mode statis.
      </div>
    );
  }

  if (sensor === "denied") {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Izin kompas ditolak. Aktifkan kembali melalui pengaturan peramban; untuk sementara
        gunakan mode statis pada gambar kompas.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <p className="font-semibold text-slate-800">Mode statis</p>
      <p className="mt-0.5">
        Sensor kompas tidak tersedia. Siapkan peta atau kompas, arahkan huruf U ke
        utara, lalu gunakan arah {bearing}° (searah jarum jam) seperti pada gambar.
      </p>
    </div>
  );
}
