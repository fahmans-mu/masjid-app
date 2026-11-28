import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ActionForm } from "@/components/ActionForm";
import { Alert } from "@/components/Alert";
import { Badge } from "@/components/Badge";
import { CityPresetSelect } from "@/components/CityPresetSelect";
import { CopyButton } from "@/components/CopyButton";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { requireMosqueSession } from "@/lib/auth";
import { getMosqueById, listCategories } from "@/lib/queries";
import { getAppBaseUrl } from "@/lib/app-url";
import { formatDateTimeID } from "@/lib/format";
import {
  parsePrayerOffsets,
  PRAYER_KEYS,
  PRAYER_LABELS,
  PRAYER_METHODS,
  PRAYER_TIMEZONES,
} from "@/lib/prayer-times";
import {
  addCategoryAction,
  addUserAction,
  changePasswordAction,
  deleteCategoryAction,
  deleteUserAction,
  disconnectMayarAction,
  saveDonationSettingsAction,
  saveMayarSettingsAction,
  saveMosqueProfileAction,
  savePrayerSettingsAction,
  testMayarConnectionAction,
  toggleCategoryAction,
  toggleUserAction,
} from "./actions";

export const metadata: Metadata = { title: "Pengaturan" };

const inputCls =
  "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100";
const labelCls = "mb-1.5 block text-sm font-medium text-slate-700";

const ERR_MESSAGES: Record<string, string> = {
  "kat-dipakai":
    "Kategori tidak bisa dihapus karena sudah dipakai pada transaksi. Nonaktifkan saja agar tidak muncul di pilihan baru.",
  "hapus-diri": "Anda tidak bisa menghapus atau menonaktifkan akun sendiri.",
  "user-terakhir":
    "Tidak bisa menonaktifkan akun aktif terakhir. Minimal harus ada satu pengurus yang bisa masuk.",
};

function Card({
  title,
  description,
  children,
  id,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function PengaturanPage({
  searchParams,
}: {
  searchParams: Promise<{ err?: string }>;
}) {
  const { err } = await searchParams;
  const session = await requireMosqueSession();
  const mosque = getMosqueById(session.mosqueId);
  if (!mosque) notFound();
  const incomeCats = listCategories(mosque.id, "income");
  const expenseCats = listCategories(mosque.id, "expense");
  const prayerOffsets = parsePrayerOffsets(mosque.prayerOffsets);
  const userRows = db
    .select()
    .from(users)
    .where(and(eq(users.mosqueId, mosque.id)))
    .orderBy(asc(users.id))
    .all();

  const appUrl = await getAppBaseUrl();
  const webhookUrl = mosque.mayarWebhookToken
    ? `${appUrl}/api/mayar/webhook/${mosque.slug}?token=${mosque.mayarWebhookToken}`
    : null;
  const mayarStatus = mosque.mayarEnabled && mosque.mayarApiKey
    ? { kind: "aktif", label: "Aktif" }
    : mosque.mayarApiKey
      ? { kind: "pending", label: "Tersimpan, belum diaktifkan" }
      : { kind: "selesai", label: "Belum terhubung" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Pengaturan</h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola profil masjid, informasi donasi, kategori, dan akun pengurus.
        </p>
      </div>

      {err && ERR_MESSAGES[err] && (
        <Alert kind="error">{ERR_MESSAGES[err]}</Alert>
      )}

      <Card
        title="Profil Masjid"
        description="Tampil di halaman publik, kop laporan, dan judul aplikasi."
      >
        <ActionForm action={saveMosqueProfileAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="s-name" className={labelCls}>
                Nama masjid <span className="text-red-500">*</span>
              </label>
              <input
                id="s-name"
                name="mosqueName"
                type="text"
                required
                defaultValue={mosque.name}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="s-tagline" className={labelCls}>
                Tagline / semboyan
              </label>
              <input
                id="s-tagline"
                name="tagline"
                type="text"
                defaultValue={mosque.tagline ?? ""}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="s-address" className={labelCls}>
              Alamat
            </label>
            <input
              id="s-address"
              name="address"
              type="text"
              defaultValue={mosque.address ?? ""}
              className={inputCls}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="s-phone" className={labelCls}>
                Telepon / WhatsApp
              </label>
              <input
                id="s-phone"
                name="phone"
                type="text"
                defaultValue={mosque.phone ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="s-email" className={labelCls}>
                Email
              </label>
              <input
                id="s-email"
                name="email"
                type="email"
                defaultValue={mosque.email ?? ""}
                className={inputCls}
              />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="s-logo" className={labelCls}>
                Logo masjid <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                id="s-logo"
                name="logo"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
              {mosque.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mosque.logoUrl}
                  alt="Logo saat ini"
                  className="mt-3 h-16 w-16 rounded-xl object-cover"
                />
              )}
            </div>
          </div>
          <SubmitButton pendingText="Menyimpan profil...">
            Simpan Profil
          </SubmitButton>
        </ActionForm>
      </Card>

      <Card
        title="Rekening & Informasi Donasi"
        description="Ditampilkan di halaman publik agar jamaah menyalurkan donasi ke rekening resmi."
      >
        <ActionForm action={saveDonationSettingsAction} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="d-bank" className={labelCls}>
                Nama bank
              </label>
              <input
                id="d-bank"
                name="bankName"
                type="text"
                placeholder="cth: Bank Syariah Indonesia (BSI)"
                defaultValue={mosque.bankName ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="d-acc" className={labelCls}>
                Nomor rekening
              </label>
              <input
                id="d-acc"
                name="bankAccount"
                type="text"
                placeholder="cth: 7123456789"
                defaultValue={mosque.bankAccount ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="d-holder" className={labelCls}>
                Atas nama
              </label>
              <input
                id="d-holder"
                name="bankHolder"
                type="text"
                placeholder="cth: Masjid Al-Ikhlas — DKM"
                defaultValue={mosque.bankHolder ?? ""}
                className={inputCls}
              />
            </div>
          </div>
          <div>
            <label htmlFor="d-note" className={labelCls}>
              Catatan untuk donatur
            </label>
            <textarea
              id="d-note"
              name="donationNote"
              rows={2}
              defaultValue={mosque.donationNote ?? ""}
              placeholder="cth: Setiap donasi dikonfirmasi bendahara maksimal 1×24 jam."
              className={inputCls}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="d-qris" className={labelCls}>
                Gambar QRIS <span className="font-normal text-slate-400">(opsional)</span>
              </label>
              <input
                id="d-qris"
                name="qris"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
              {mosque.qrisUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mosque.qrisUrl}
                  alt="QRIS saat ini"
                  className="mt-3 h-32 w-32 rounded-xl border border-slate-200 object-contain"
                />
              )}
            </div>
            <div className="flex items-end">
              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-slate-300 px-4 py-3">
                <input
                  type="checkbox"
                  name="showDonorNames"
                  defaultChecked={mosque.showDonorNames}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Tampilkan nama donatur di halaman publik
                </span>
              </label>
            </div>
          </div>
          <SubmitButton pendingText="Menyimpan pengaturan...">
            Simpan Pengaturan Donasi
          </SubmitButton>
        </ActionForm>
      </Card>

      <Card
        id="pembayaran-online"
        title="Pembayaran Online (Mayar)"
        description="Hubungkan akun Mayar agar jamaah bisa berdonasi langsung dari halaman campaign (QRIS, virtual account, e-wallet). Donasi tercatat otomatis setelah pembayaran berhasil."
      >
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
          <Badge kind={mayarStatus.kind}>{mayarStatus.label}</Badge>
          {mosque.mayarApiKey && (
            <span>
              API Key:{" "}
              <span className="font-mono text-slate-700">
                ••••{mosque.mayarApiKey.slice(-4)}
              </span>
            </span>
          )}
          {mosque.mayarConnectedAt && (
            <span className="text-xs text-slate-400">
              Terakhir terhubung {formatDateTimeID(mosque.mayarConnectedAt)}
            </span>
          )}
        </div>

        <ActionForm action={saveMayarSettingsAction} className="space-y-5">
          <div>
            <label htmlFor="my-key" className={labelCls}>
              API Key Mayar
            </label>
            <input
              id="my-key"
              name="mayarApiKey"
              type="password"
              autoComplete="off"
              placeholder={
                mosque.mayarApiKey
                  ? "Kosongkan bila tidak ingin mengganti API Key"
                  : "Tempel API Key dari web.mayar.id/api-keys"
              }
              className={inputCls}
            />
            <p className="mt-2 text-xs text-slate-400">
              Buat API Key dengan akses <span className="font-semibold">Read &amp; Write</span>{" "}
              di dashboard Mayar, lalu salin ke sini. Key disimpan di server dan tidak
              pernah ditampilkan lagi secara utuh.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-start gap-3 rounded-xl border border-slate-300 px-4 py-3">
            <input
              type="checkbox"
              name="mayarEnabled"
              defaultChecked={mosque.mayarEnabled}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm">
              <span className="font-medium text-slate-700">
                Aktifkan tombol donasi online di halaman campaign
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                Nonaktifkan sementara tanpa menghapus API Key.
              </span>
            </span>
          </label>
          <SubmitButton pendingText="Memverifikasi...">
            Simpan &amp; Hubungkan
          </SubmitButton>
        </ActionForm>

        {webhookUrl && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              URL Webhook
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="break-all rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700">
                {webhookUrl}
              </code>
              <CopyButton text={webhookUrl} />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Daftarkan URL ini di dashboard Mayar → Integrasi → Webhook, lalu klik{" "}
              <span className="font-semibold">Test URL</span>. URL ini mengandung token
              rahasia — jangan dibagikan.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActionForm action={testMayarConnectionAction}>
                <SubmitButton variant="secondary" pendingText="Menguji koneksi...">
                  Tes Koneksi Mayar
                </SubmitButton>
              </ActionForm>
              <DeleteButton
                action={disconnectMayarAction}
                fields={{ confirm: 1 }}
                label="Putuskan Koneksi"
                confirmText="Putuskan koneksi Mayar? API Key dan URL webhook akan dihapus, dan donasi online dinonaktifkan."
              />
            </div>
          </div>
        )}
      </Card>

      <Card
        id="jadwal-sholat"
        title="Jadwal Sholat"
        description="Widget jadwal sholat otomatis di halaman publik, dihitung dari koordinat masjid. Kosongkan lintang & bujur untuk menyembunyikan widget."
      >
        <ActionForm action={savePrayerSettingsAction} className="space-y-5">
          <CityPresetSelect inputCls={inputCls} labelCls={labelCls} />
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="pr-lat" className={labelCls}>
                Garis lintang (latitude)
              </label>
              <input
                id="pr-lat"
                name="latitude"
                type="text"
                inputMode="decimal"
                placeholder="cth: -6.2088"
                defaultValue={mosque.latitude ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pr-lng" className={labelCls}>
                Garis bujur (longitude)
              </label>
              <input
                id="pr-lng"
                name="longitude"
                type="text"
                inputMode="decimal"
                placeholder="cth: 106.8456"
                defaultValue={mosque.longitude ?? ""}
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="pr-tz" className={labelCls}>
                Zona waktu
              </label>
              <select
                id="pr-tz"
                name="timezone"
                defaultValue={mosque.timezone}
                className={`${inputCls} bg-white`}
              >
                {PRAYER_TIMEZONES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="pr-method" className={labelCls}>
                Metode perhitungan
              </label>
              <select
                id="pr-method"
                name="prayerMethod"
                defaultValue={mosque.prayerMethod}
                className={`${inputCls} bg-white`}
              >
                {PRAYER_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <p className={labelCls}>Koreksi menit (opsional)</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {PRAYER_KEYS.map((key) => (
                <div key={key}>
                  <label
                    htmlFor={`pr-off-${key}`}
                    className="mb-1 block text-xs font-medium text-slate-500"
                  >
                    {PRAYER_LABELS[key]}
                  </label>
                  <input
                    id={`pr-off-${key}`}
                    name={`off_${key}`}
                    type="number"
                    min={-30}
                    max={30}
                    defaultValue={prayerOffsets[key]}
                    className={inputCls}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Sesuaikan bila jadwal berbeda dengan masjid setempat. Nilai positif = lebih
              lambat, negatif = lebih cepat.
            </p>
          </div>
          <SubmitButton pendingText="Menyimpan jadwal...">
            Simpan Jadwal Sholat
          </SubmitButton>
        </ActionForm>
      </Card>

      <Card
        id="kategori"
        title="Kategori Pemasukan & Pengeluaran"
        description="Dipakai untuk mengelompokkan transaksi di laporan bulanan."
      >
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            { label: "Kategori Pemasukan", rows: incomeCats },
            { label: "Kategori Pengeluaran", rows: expenseCats },
          ].map((group) => (
            <div key={group.label}>
              <h3 className="mb-3 text-sm font-bold text-slate-900">{group.label}</h3>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {group.rows.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">{c.name}</span>
                      {!c.isActive && <Badge kind="selesai">Nonaktif</Badge>}
                    </div>
                    <div className="flex items-center gap-1">
                      <form action={toggleCategoryAction} className="inline">
                        <input type="hidden" name="id" value={c.id} />
                        <button
                          type="submit"
                          className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                        >
                          {c.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                      <DeleteButton
                        action={deleteCategoryAction}
                        fields={{ id: c.id }}
                        confirmText={`Hapus kategori "${c.name}"?`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 max-w-xl border-t border-slate-100 pt-5">
          <h3 className="mb-3 text-sm font-bold text-slate-900">Tambah kategori baru</h3>
          <ActionForm action={addCategoryAction} className="flex items-end gap-3" resetOnSuccess>
            <div className="flex-1">
              <label htmlFor="c-name" className={labelCls}>
                Nama kategori
              </label>
              <input
                id="c-name"
                name="name"
                type="text"
                required
                placeholder="cth: Renovasi Menara"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="c-kind" className={labelCls}>
                Jenis
              </label>
              <select id="c-kind" name="kind" className={`${inputCls} bg-white`}>
                <option value="expense">Pengeluaran</option>
                <option value="income">Pemasukan</option>
              </select>
            </div>
            <SubmitButton variant="secondary" pendingText="Menambah...">
              Tambah
            </SubmitButton>
          </ActionForm>
        </div>
      </Card>

      <Card
        id="akun"
        title="Akun Pengurus"
        description="Akun yang bisa masuk ke panel ini untuk mengelola keuangan."
      >
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {userRows.map((u) => (
            <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {u.name}
                  {u.id === session.id && (
                    <span className="ml-2 text-xs font-normal text-emerald-600">(Anda)</span>
                  )}
                  {u.role === "super" && (
                    <span className="ml-2 inline-block align-middle">
                      <Badge kind="campaign">Platform</Badge>
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {u.isActive ? (
                  <Badge kind="aktif">Aktif</Badge>
                ) : (
                  <Badge kind="selesai">Nonaktif</Badge>
                )}
                {u.id !== session.id && (
                  <>
                    <form action={toggleUserAction} className="inline">
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                      >
                        {u.isActive ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                    <DeleteButton
                      action={deleteUserAction}
                      fields={{ id: u.id }}
                      confirmText={`Hapus akun "${u.name}"?`}
                    />
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid gap-8 border-t border-slate-100 pt-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Tambah akun pengurus</h3>
            <ActionForm action={addUserAction} className="space-y-4" resetOnSuccess>
              <div>
                <label htmlFor="u-name" className={labelCls}>
                  Nama
                </label>
                <input id="u-name" name="name" type="text" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="u-email" className={labelCls}>
                  Email
                </label>
                <input
                  id="u-email"
                  name="email"
                  type="email"
                  required
                  placeholder="nama@masjid.id"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="u-pass" className={labelCls}>
                  Password awal <span className="font-normal text-slate-400">(min. 6 karakter)</span>
                </label>
                <input
                  id="u-pass"
                  name="password"
                  type="text"
                  required
                  minLength={6}
                  className={inputCls}
                />
              </div>
              <SubmitButton variant="secondary" pendingText="Membuat akun...">
                Buat Akun
              </SubmitButton>
            </ActionForm>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-900">Ganti password Anda</h3>
            <ActionForm action={changePasswordAction} className="space-y-4" resetOnSuccess>
              <div>
                <label htmlFor="p-cur" className={labelCls}>
                  Password saat ini
                </label>
                <input
                  id="p-cur"
                  name="current"
                  type="password"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="p-new" className={labelCls}>
                  Password baru
                </label>
                <input
                  id="p-new"
                  name="next"
                  type="password"
                  required
                  minLength={6}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="p-conf" className={labelCls}>
                  Ulangi password baru
                </label>
                <input
                  id="p-conf"
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  className={inputCls}
                />
              </div>
              <SubmitButton variant="secondary" pendingText="Mengganti...">
                Ganti Password
              </SubmitButton>
            </ActionForm>
          </div>
        </div>
      </Card>
    </div>
  );
}
