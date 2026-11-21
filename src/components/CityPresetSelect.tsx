"use client";

import { useState } from "react";
import { CITY_PRESETS, shortZone } from "@/lib/city-presets";

export function CityPresetSelect({
  inputCls,
  labelCls,
}: {
  inputCls: string;
  labelCls: string;
}) {
  const [value, setValue] = useState("");

  function apply(label: string, select: HTMLSelectElement) {
    setValue(label);
    const preset = CITY_PRESETS.find((p) => p.label === label);
    const form = select.form;
    if (!preset || !form) return;
    const set = (name: string, v: string) => {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.value = v;
      }
    };
    set("latitude", String(preset.latitude));
    set("longitude", String(preset.longitude));
    set("timezone", preset.timezone);
  }

  return (
    <div>
      <label htmlFor="pr-city" className={labelCls}>
        Isi cepat dari kota <span className="font-normal text-slate-400">(opsional)</span>
      </label>
      <select
        id="pr-city"
        value={value}
        onChange={(e) => apply(e.target.value, e.currentTarget)}
        className={`${inputCls} bg-white`}
      >
        <option value="">— Pilih kota untuk mengisi koordinat otomatis —</option>
        {CITY_PRESETS.map((p) => (
          <option key={p.label} value={p.label}>
            {p.label} ({shortZone(p.timezone)})
          </option>
        ))}
      </select>
    </div>
  );
}
