"use client";

import { useState } from "react";
import { ActionForm } from "./ActionForm";
import { SubmitButton } from "./SubmitButton";
import { qurbanRegisterAction } from "@/app/m/[mosque]/actions";
import { formatRupiah } from "@/lib/format";

export function QurbanRegisterForm({
  mosqueId,
  programId,
  goatPrice,
  cowSharePrice,
}: {
  mosqueId: number;
  programId: number;
  goatPrice: number | null;
  cowSharePrice: number | null;
}) {
  const [animalType, setAnimalType] = useState<"kambing" | "sapi">(
    goatPrice ? "kambing" : "sapi"
  );

  const target = animalType === "kambing" ? goatPrice : cowSharePrice;

  return (
    <ActionForm action={qurbanRegisterAction} className="space-y-4" resetOnSuccess>
      <input type="hidden" name="mosqueId" value={mosqueId} />
      <input type="hidden" name="programId" value={programId} />
      <input
        type="text"
        name="website"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qr-name" className="mb-1.5 block text-sm font-medium text-slate-700">
            Nama peserta <span className="text-red-500">*</span>
          </label>
          <input
            id="qr-name"
            name="name"
            type="text"
            required
            maxLength={100}
            placeholder="cth: Keluarga Bapak Ahmad"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
          <p className="mt-1 text-xs text-slate-400">
            Boleh nama keluarga / perorangan sesuai niat qurban.
          </p>
        </div>
        <div>
          <label htmlFor="qr-phone" className="mb-1.5 block text-sm font-medium text-slate-700">
            No. HP / WhatsApp <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="qr-phone"
            name="phone"
            type="tel"
            maxLength={30}
            placeholder="08xx-xxxx-xxxx"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
          />
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Jenis hewan qurban
        </span>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 transition ${
              animalType === "kambing"
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 bg-white hover:border-amber-300"
            } ${!goatPrice ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="animalType"
                value="kambing"
                checked={animalType === "kambing"}
                disabled={!goatPrice}
                onChange={() => setAnimalType("kambing")}
                className="h-4 w-4 accent-amber-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Kambing</span>
                <span className="block text-xs text-slate-500">
                  {goatPrice ? formatRupiah(goatPrice) : "Belum dibuka"}
                </span>
              </span>
            </span>
          </label>
          <label
            className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 transition ${
              animalType === "sapi"
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 bg-white hover:border-amber-300"
            } ${!cowSharePrice ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="animalType"
                value="sapi"
                checked={animalType === "sapi"}
                disabled={!cowSharePrice}
                onChange={() => setAnimalType("sapi")}
                className="h-4 w-4 accent-amber-600"
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">Sapi (1/7)</span>
                <span className="block text-xs text-slate-500">
                  {cowSharePrice ? formatRupiah(cowSharePrice) : "Belum dibuka"}
                </span>
              </span>
            </span>
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="qr-note" className="mb-1.5 block text-sm font-medium text-slate-700">
          Catatan <span className="font-normal text-slate-400">(opsional)</span>
        </label>
        <input
          id="qr-note"
          name="note"
          type="text"
          maxLength={500}
          placeholder="cth: atas nama almarhum Bapak H. Ibrahim"
          className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      {target ? (
        <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Target tabungan: <span className="font-bold">{formatRupiah(target)}</span> —
          dapat disetor bertahap ke bendahara sampai lunas sebelum hari raya.
        </div>
      ) : (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Harga hewan belum diatur pengurus. Silakan hubungi bendahara masjid.
        </div>
      )}

      <SubmitButton
        variant="amber"
        className="w-full sm:w-auto"
        pendingText="Mendaftarkan..."
      >
        Daftar Tabungan Qurban
      </SubmitButton>
    </ActionForm>
  );
}
