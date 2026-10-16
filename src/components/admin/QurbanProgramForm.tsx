"use client";

import { ActionForm } from "@/components/ActionForm";
import { SubmitButton } from "@/components/SubmitButton";
import { saveQurbanProgramAction } from "@/app/admin/(panel)/(aktif)/qurban/actions";
import type { QurbanProgram } from "@/lib/schema";

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

export function QurbanProgramForm({ program }: { program?: QurbanProgram }) {
  return (
    <ActionForm action={saveQurbanProgramAction} className="space-y-5">
      {program && <input type="hidden" name="id" value={program.id} />}

      <div>
        <label htmlFor="qp-title" className={labelCls}>
          Nama program <span className="text-red-500">*</span>
        </label>
        <input
          id="qp-title"
          name="title"
          type="text"
          required
          defaultValue={program?.title ?? ""}
          placeholder="cth: Tabungan Qurban 1448 H"
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="qp-desc" className={labelCls}>
          Deskripsi / keterangan
        </label>
        <textarea
          id="qp-desc"
          name="description"
          rows={3}
          defaultValue={program?.description ?? ""}
          placeholder="Jelaskan cara setor, jadwal pencatatan, dan ketentuan tabungan qurban."
          className={inputCls}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="qp-goat" className={labelCls}>
            Harga 1 kambing (Rp)
          </label>
          <input
            id="qp-goat"
            name="goatPrice"
            type="number"
            min={0}
            step={100000}
            defaultValue={program?.goatPrice ?? ""}
            placeholder="2500000"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-slate-400">
            Isi 0 / kosongkan jika tidak melayani kambing.
          </p>
        </div>
        <div>
          <label htmlFor="qp-cow" className={labelCls}>
            Harga 1/7 sapi (Rp)
          </label>
          <input
            id="qp-cow"
            name="cowSharePrice"
            type="number"
            min={0}
            step={100000}
            defaultValue={program?.cowSharePrice ?? ""}
            placeholder="3000000"
            className={inputCls}
          />
          <p className="mt-1 text-xs text-slate-400">
            Isi 0 / kosongkan jika tidak melayani sapi.
          </p>
        </div>
        <div>
          <label htmlFor="qp-target" className={labelCls}>
            Perkiraan hari raya
          </label>
          <input
            id="qp-target"
            name="targetDate"
            type="date"
            defaultValue={program?.targetDate ?? ""}
            className={inputCls}
          />
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={program ? program.isActive : true}
          className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
        />
        <span className="text-sm font-medium text-slate-700">
          Buka pendaftaran di halaman publik (aktif)
        </span>
      </label>

      <div className="flex gap-3 pt-2">
        <SubmitButton variant="amber" pendingText="Menyimpan...">
          {program ? "Simpan Perubahan" : "Buat Program Qurban"}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
