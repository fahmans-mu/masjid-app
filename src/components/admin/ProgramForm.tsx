"use client";

import { useState } from "react";
import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveProgramAction } from "@/app/admin/(panel)/program/actions";
import type { Program } from "@/lib/schema";

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export function ProgramForm({ program }: { program?: Program }) {
  const [type, setType] = useState<"campaign" | "rutin">(
    program?.type ?? "campaign"
  );

  return (
    <ActionForm action={saveProgramAction} className="space-y-5">
      {program && <input type="hidden" name="id" value={program.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-type" className={labelCls}>
            Jenis program <span className="text-red-500">*</span>
          </label>
          <select
            id="pf-type"
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as "campaign" | "rutin")}
            className={`${inputCls} bg-white`}
          >
            <option value="campaign">Campaign (target &amp; tenggat)</option>
            <option value="rutin">Donasi Rutin (bulanan)</option>
          </select>
        </div>
        <div>
          <label htmlFor="pf-title" className={labelCls}>
            Judul program <span className="text-red-500">*</span>
          </label>
          <input
            id="pf-title"
            name="title"
            type="text"
            required
            defaultValue={program?.title ?? ""}
            placeholder="cth: Renovasi Atap & Karpet Utama"
            className={inputCls}
          />
        </div>
      </div>

      {type === "campaign" ? (
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="pf-target" className={labelCls}>
              Target dana (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="pf-target"
              name="targetAmount"
              type="number"
              min={10000}
              step={10000}
              required
              defaultValue={program?.targetAmount ?? ""}
              placeholder="150000000"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pf-start" className={labelCls}>
              Tanggal mulai
            </label>
            <input
              id="pf-start"
              name="startDate"
              type="date"
              defaultValue={program?.startDate ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pf-end" className={labelCls}>
              Tenggat / selesai
            </label>
            <input
              id="pf-end"
              name="endDate"
              type="date"
              defaultValue={program?.endDate ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="pf-monthly" className={labelCls}>
              Target per bulan (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              id="pf-monthly"
              name="monthlyTarget"
              type="number"
              min={10000}
              step={10000}
              required
              defaultValue={program?.monthlyTarget ?? ""}
              placeholder="15000000"
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="pf-start2" className={labelCls}>
              Mulai berlaku
            </label>
            <input
              id="pf-start2"
              name="startDate"
              type="date"
              defaultValue={program?.startDate ?? ""}
              className={inputCls}
            />
          </div>
        </div>
      )}

      <div>
        <label htmlFor="pf-desc" className={labelCls}>
          Deskripsi / penjelasan program
        </label>
        <textarea
          id="pf-desc"
          name="description"
          rows={5}
          defaultValue={program?.description ?? ""}
          placeholder="Jelaskan tujuan program, rencana penggunaan dana, dan informasi lain yang perlu diketahui jamaah."
          className={inputCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="pf-image" className={labelCls}>
            Gambar program <span className="font-normal text-slate-400">(opsional)</span>
          </label>
          <input
            id="pf-image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
          />
          <p className="mt-1 text-xs text-slate-400">
            JPG/PNG/WEBP maks 5MB. {program?.imageUrl ? "Biarkan kosong jika tidak ingin mengganti gambar." : ""}
          </p>
          {program?.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={program.imageUrl}
              alt="Gambar saat ini"
              className="mt-3 h-24 w-full rounded-xl object-cover"
            />
          )}
        </div>
        <div className="flex items-end">
          <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={program ? program.isActive : true}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Tampilkan di halaman publik (aktif)
            </span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <SubmitButton pendingText="Menyimpan program...">
          {program ? "Simpan Perubahan" : "Buat Program"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
