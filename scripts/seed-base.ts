import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import { mosques } from "../src/lib/schema";
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_SLUG,
  createMosque,
  createUser,
  currentAndPrevPeriods,
  daysAgo,
  ensurePlatformSettings,
  monthDay,
  publishMonthlyReport,
  seedAppInfaq,
  seedQurban,
  seedTransactions,
  type DonationSeed,
  type ExpenseSeed,
  type ProgramSeed,
} from "./lib-seed";

const daysFromNow = (n: number) => daysAgo(-n);

// ================= Masjid Al-Ikhlas (contoh utama) =================

const ALIKHLAS_PROGRAMS: ProgramSeed[] = [
  {
    slug: "renovasi-atap-karpet",
    type: "campaign",
    title: "Renovasi Atap & Karpet Utama",
    description:
      "Penggalangan dana untuk penggantian rangka dan penutup atap utama masjid serta penggantian karpet lantai shalat. Rencana pengerjaan Agustus–Desember 2026. Rincian belanja dilaporkan setiap bulan pada halaman laporan.",
    targetAmount: 150_000_000,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
  },
  {
    slug: "tempat-wudhu-toilet",
    type: "campaign",
    title: "Pembangunan Tempat Wudhu & Toilet",
    description:
      "Pembangunan tempat wudhu dan toilet baru di sisi timur masjid (8 kran wudhu, 4 bilik toilet). Target selesai Desember 2026 insyaAllah.",
    targetAmount: 45_000_000,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
  {
    slug: "donasi-rutin-operasional",
    type: "rutin",
    title: "Donasi Rutin Operasional Masjid",
    description:
      "Program donasi bulanan untuk membiayai operasional masjid: honor imam dan marbot, listrik, air, kebersihan, serta kegiatan dakwah rutin. Target Rp15.000.000 per bulan.",
    monthlyTarget: 15_000_000,
    startDate: "2026-01-01",
  },
  {
    slug: "beasiswa-santri-tahfidz",
    type: "rutin",
    title: "Beasiswa Santri Tahfidz",
    description:
      "Beasiswa bulanan untuk 10 santri tahfidz kurang mampu di lingkungan masjid (@ Rp500.000/bulan). Disalurkan setiap tanggal 25.",
    monthlyTarget: 5_000_000,
    startDate: "2026-01-01",
  },
  {
    slug: "al-quran-braille",
    type: "campaign",
    title: "Pengadaan Al-Quran Braille",
    description:
      "Pengadaan 20 mushaf Al-Quran Braille untuk jamaah tunanetra. Kampanye telah selesai dan seluruh mushaf telah diserahkan pada Juli 2026. Jazakumullahu khairan!",
    targetAmount: 10_000_000,
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    isActive: false,
  },
];

const ALIKHLAS_DONATIONS: DonationSeed[] = [
  { date: "2026-05-10", program: "al-quran-braille", donor: "Hj. Maimunah", amount: 2_500_000, method: "transfer" },
  { date: "2026-06-08", program: "al-quran-braille", donor: "Alumni Ponpes Al-Hikmah", amount: 3_000_000, method: "transfer" },
  { date: "2026-07-05", program: "al-quran-braille", donor: "Bapak H. Abdullah", amount: 2_000_000, method: "transfer" },
  { date: "2026-07-20", program: "al-quran-braille", donor: "Hamba Allah", amount: 2_500_000, method: "qris" },

  { date: "2026-08-02", program: "renovasi-atap-karpet", donor: "Bapak H. Abdullah", amount: 5_000_000, method: "transfer", note: "Untuk renovasi atap" },
  { date: "2026-08-05", program: "renovasi-atap-karpet", donor: "Hamba Allah", amount: 2_500_000, method: "transfer" },
  { date: "2026-08-09", program: "renovasi-atap-karpet", donor: "Keluarga Bapak Yusuf", amount: 7_500_000, method: "transfer" },
  { date: "2026-08-12", program: "renovasi-atap-karpet", donor: "Ibu Nurhayati", amount: 1_000_000, method: "qris" },
  { date: "2026-08-17", program: "renovasi-atap-karpet", donor: "Komunitas Ojol Peduli", amount: 3_250_000, method: "transfer" },
  { date: "2026-08-22", program: "renovasi-atap-karpet", donor: "Bapak Suryanto", amount: 5_000_000, method: "transfer" },
  { date: "2026-08-25", program: "renovasi-atap-karpet", donor: "Hj. Maimunah", amount: 10_000_000, method: "transfer" },
  { date: "2026-08-30", program: "renovasi-atap-karpet", donor: "Hamba Allah", amount: 1_000_000, method: "cash" },

  { date: "2026-08-01", program: "donasi-rutin-operasional", donor: "Ibu Siti Aminah", amount: 1_000_000, method: "transfer" },
  { date: "2026-08-03", program: "donasi-rutin-operasional", donor: "Bapak Rudi Hartono", amount: 500_000, method: "qris" },
  { date: "2026-08-07", program: "donasi-rutin-operasional", donor: "Ibu Dewi Lestari", amount: 750_000, method: "transfer" },
  { date: "2026-08-10", program: "donasi-rutin-operasional", donor: "Bapak Agus Salim", amount: 1_500_000, method: "transfer" },
  { date: "2026-08-14", program: "donasi-rutin-operasional", donor: "Ibu Ratna Sari", amount: 500_000, method: "qris" },
  { date: "2026-08-18", program: "donasi-rutin-operasional", donor: "Bapak Taufik Hidayat", amount: 2_000_000, method: "transfer" },
  { date: "2026-08-21", program: "donasi-rutin-operasional", donor: "Ibu Fitriani", amount: 300_000, method: "qris" },
  { date: "2026-08-24", program: "donasi-rutin-operasional", donor: "Bapak Slamet Riyadi", amount: 1_000_000, method: "transfer" },
  { date: "2026-08-27", program: "donasi-rutin-operasional", donor: "Bapak Hendra Gunawan", amount: 500_000, method: "cash" },
  { date: "2026-08-29", program: "donasi-rutin-operasional", donor: "Hamba Allah", amount: 250_000, method: "qris" },
  { date: "2026-08-31", program: "donasi-rutin-operasional", donor: "Ibu Siti Aminah", amount: 1_000_000, method: "transfer" },

  { date: "2026-08-06", program: "beasiswa-santri-tahfidz", donor: "Bapak H. Abdullah", amount: 1_500_000, method: "transfer" },
  { date: "2026-08-15", program: "beasiswa-santri-tahfidz", donor: "Hj. Maimunah", amount: 1_000_000, method: "transfer" },
  { date: "2026-08-28", program: "beasiswa-santri-tahfidz", donor: "Alumni Ponpes Al-Hikmah", amount: 2_000_000, method: "qris" },

  { date: "2026-08-04", category: "Infaq & Sedekah", donor: "Hamba Allah", amount: 350_000, method: "cash", note: "Infaq harian" },
  { date: "2026-08-11", category: "Infaq & Sedekah", donor: "Ibu Murni", amount: 200_000, method: "cash" },
  { date: "2026-08-19", category: "Infaq & Sedekah", donor: "Hamba Allah", amount: 500_000, method: "transfer", note: "Sedekah subuh" },
  { date: "2026-08-26", category: "Infaq & Sedekah", donor: "Bapak Joko", amount: 150_000, method: "cash" },
  { date: "2026-08-20", category: "Zakat", donor: "Bapak Ahmad Fauzi", amount: 2_500_000, method: "transfer", note: "Zakat mal 1447 H" },
  { date: "2026-08-08", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 850_000, method: "cash" },
  { date: "2026-08-15", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 920_000, method: "cash" },
  { date: "2026-08-22", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 780_000, method: "cash" },
  { date: "2026-08-29", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 1_050_000, method: "cash" },

  { date: "2026-09-03", program: "renovasi-atap-karpet", donor: "Bapak H. Abdullah", amount: 5_000_000, method: "transfer" },
  { date: "2026-09-07", program: "renovasi-atap-karpet", donor: "Ibu Nurhayati", amount: 2_000_000, method: "transfer" },
  { date: "2026-09-10", program: "renovasi-atap-karpet", donor: "Keluarga Bapak Yusuf", amount: 5_000_000, method: "transfer" },
  { date: "2026-09-14", program: "renovasi-atap-karpet", donor: "Hamba Allah", amount: 1_500_000, method: "qris" },
  { date: "2026-09-18", program: "renovasi-atap-karpet", donor: "Bapak Suryanto", amount: 3_500_000, method: "transfer" },
  { date: "2026-09-21", program: "renovasi-atap-karpet", donor: "Hj. Maimunah", amount: 7_500_000, method: "transfer" },
  { date: "2026-09-25", program: "renovasi-atap-karpet", donor: "Komunitas Ojol Peduli", amount: 2_250_000, method: "transfer" },
  { date: "2026-09-28", program: "renovasi-atap-karpet", donor: "Bapak Rudi Hartono", amount: 1_000_000, method: "qris" },

  { date: "2026-09-08", program: "tempat-wudhu-toilet", donor: "Bapak Agus Salim", amount: 2_500_000, method: "transfer" },
  { date: "2026-09-12", program: "tempat-wudhu-toilet", donor: "Hamba Allah", amount: 1_000_000, method: "qris" },
  { date: "2026-09-16", program: "tempat-wudhu-toilet", donor: "Ibu Dewi Lestari", amount: 1_500_000, method: "transfer" },
  { date: "2026-09-20", program: "tempat-wudhu-toilet", donor: "Bapak Taufik Hidayat", amount: 3_000_000, method: "transfer" },
  { date: "2026-09-23", program: "tempat-wudhu-toilet", donor: "Bapak H. Abdullah", amount: 4_000_000, method: "transfer" },
  { date: "2026-09-27", program: "tempat-wudhu-toilet", donor: "Hj. Maimunah", amount: 2_500_000, method: "transfer" },
  { date: "2026-09-30", program: "tempat-wudhu-toilet", donor: "Ibu Fitriani", amount: 500_000, method: "qris" },

  { date: "2026-09-01", program: "donasi-rutin-operasional", donor: "Ibu Siti Aminah", amount: 1_000_000, method: "transfer" },
  { date: "2026-09-04", program: "donasi-rutin-operasional", donor: "Bapak Slamet Riyadi", amount: 1_000_000, method: "transfer" },
  { date: "2026-09-08", program: "donasi-rutin-operasional", donor: "Ibu Ratna Sari", amount: 500_000, method: "qris" },
  { date: "2026-09-11", program: "donasi-rutin-operasional", donor: "Bapak Hendra Gunawan", amount: 1_000_000, method: "transfer" },
  { date: "2026-09-15", program: "donasi-rutin-operasional", donor: "Bapak Taufik Hidayat", amount: 2_000_000, method: "transfer" },
  { date: "2026-09-19", program: "donasi-rutin-operasional", donor: "Hamba Allah", amount: 750_000, method: "qris" },
  { date: "2026-09-22", program: "donasi-rutin-operasional", donor: "Ibu Fitriani", amount: 300_000, method: "qris" },
  { date: "2026-09-26", program: "donasi-rutin-operasional", donor: "Bapak Rudi Hartono", amount: 500_000, method: "transfer" },
  { date: "2026-09-29", program: "donasi-rutin-operasional", donor: "Ibu Dewi Lestari", amount: 750_000, method: "transfer" },
  { date: "2026-09-30", program: "donasi-rutin-operasional", donor: "Bapak Agus Salim", amount: 2_000_000, method: "transfer" },

  { date: "2026-09-05", program: "beasiswa-santri-tahfidz", donor: "Alumni Ponpes Al-Hikmah", amount: 2_000_000, method: "transfer" },
  { date: "2026-09-17", program: "beasiswa-santri-tahfidz", donor: "Bapak H. Abdullah", amount: 1_500_000, method: "transfer" },
  { date: "2026-09-27", program: "beasiswa-santri-tahfidz", donor: "Hj. Maimunah", amount: 1_000_000, method: "transfer" },

  { date: "2026-09-05", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 900_000, method: "cash" },
  { date: "2026-09-12", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 1_100_000, method: "cash" },
  { date: "2026-09-19", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 850_000, method: "cash" },
  { date: "2026-09-26", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 1_250_000, method: "cash" },
  { date: "2026-09-06", category: "Infaq & Sedekah", donor: "Hamba Allah", amount: 500_000, method: "transfer", note: "Sedekah subuh" },
  { date: "2026-09-13", category: "Infaq & Sedekah", donor: "Ibu Murni", amount: 200_000, method: "cash" },
  { date: "2026-09-24", category: "Infaq & Sedekah", donor: "Bapak Joko", amount: 250_000, method: "cash" },
  { date: "2026-09-09", category: "Zakat", donor: "Bapak Ahmad Fauzi", amount: 2_500_000, method: "transfer" },
  { date: "2026-09-28", category: "Zakat", donor: "Hamba Allah", amount: 1_000_000, method: "qris", note: "Zakat penghasilan" },

  { date: "2026-09-30", program: "tempat-wudhu-toilet", donor: "Hamba Allah", amount: 10_000_000, method: "transfer", status: "rejected", note: "Bukti transfer tidak ditemukan / duplikat" },

  { date: "2026-10-01", program: "tempat-wudhu-toilet", donor: "Bapak Suryanto", amount: 2_000_000, method: "transfer" },
  { date: "2026-10-04", program: "tempat-wudhu-toilet", donor: "Ibu Nurhayati", amount: 1_000_000, method: "transfer" },
  { date: "2026-10-02", program: "renovasi-atap-karpet", donor: "Hj. Maimunah", amount: 5_000_000, method: "transfer" },
  { date: "2026-10-05", program: "renovasi-atap-karpet", donor: "Hamba Allah", amount: 1_000_000, method: "qris" },
  { date: "2026-10-01", program: "donasi-rutin-operasional", donor: "Ibu Siti Aminah", amount: 1_000_000, method: "transfer" },
  { date: "2026-10-03", program: "donasi-rutin-operasional", donor: "Bapak Hendra Gunawan", amount: 500_000, method: "qris" },
  { date: "2026-10-05", program: "donasi-rutin-operasional", donor: "Bapak Slamet Riyadi", amount: 1_000_000, method: "transfer" },
  { date: "2026-10-02", program: "beasiswa-santri-tahfidz", donor: "Alumni Ponpes Al-Hikmah", amount: 2_000_000, method: "transfer" },
  { date: "2026-10-02", category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 950_000, method: "cash" },
  { date: "2026-10-03", category: "Infaq & Sedekah", donor: "Hamba Allah", amount: 300_000, method: "qris" },

  { date: "2026-10-04", category: "Infaq & Sedekah", donor: "Bapak Iwan Setiawan", amount: 1_000_000, method: "transfer", status: "pending", phone: "0813-1111-2222", note: "Konfirmasi transfer BSI Rp1.000.000" },
  { date: "2026-10-05", program: "renovasi-atap-karpet", donor: "Ibu Lina Marlina", amount: 500_000, method: "qris", status: "pending", phone: "0812-3333-4444", note: "Scan QRIS via GoPay" },
  { date: "2026-10-06", program: "beasiswa-santri-tahfidz", donor: "Hamba Allah", amount: 2_000_000, method: "transfer", status: "pending", phone: "0857-5555-6666", note: "Wakaf untuk santri tahfidz" },
];

const ALIKHLAS_EXPENSES: ExpenseSeed[] = [
  { date: "2026-07-25", category: "Kegiatan & Dakwah", description: "Pembelian 20 mushaf Al-Quran Braille", amount: 9_850_000, program: "al-quran-braille" },
  { date: "2026-08-03", category: "Operasional & Kebersihan", description: "Alat kebersihan & honor petugas kebersihan", amount: 1_850_000 },
  { date: "2026-08-05", category: "Listrik & Air", description: "Tagihan listrik & PDAM bulan Juli", amount: 1_320_000 },
  { date: "2026-08-07", category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot Agustus", amount: 2_500_000 },
  { date: "2026-08-10", category: "Pembangunan & Renovasi", description: "DP material atap & karpet (tahap 1)", amount: 15_000_000, program: "renovasi-atap-karpet" },
  { date: "2026-08-16", category: "Kegiatan & Dakwah", description: "Konsumsi kajian & cetak spanduk program", amount: 850_000 },
  { date: "2026-08-24", category: "Sosial & Santunan", description: "Santunan 15 anak yatim", amount: 1_500_000 },
  { date: "2026-09-03", category: "Operasional & Kebersihan", description: "Honor petugas & perlengkapan kebersihan", amount: 1_750_000 },
  { date: "2026-09-05", category: "Listrik & Air", description: "Tagihan listrik & PDAM bulan Agustus", amount: 1_410_000 },
  { date: "2026-09-06", category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot September", amount: 2_500_000 },
  { date: "2026-09-12", category: "Pembangunan & Renovasi", description: "Pelunasan karpet & pemasangan rangka atap", amount: 18_000_000, program: "renovasi-atap-karpet" },
  { date: "2026-09-15", category: "Pembangunan & Renovasi", description: "Material awal tempat wudhu & toilet", amount: 4_500_000, program: "tempat-wudhu-toilet" },
  { date: "2026-09-20", category: "Kegiatan & Dakwah", description: "Peringatan Maulid & konsumsi jamaah", amount: 1_250_000 },
  { date: "2026-09-27", category: "Sosial & Santunan", description: "Santunan yatim & dhuafa", amount: 1_500_000 },
  { date: "2026-10-02", category: "Listrik & Air", description: "Tagihan listrik & PDAM bulan September", amount: 1_380_000 },
  { date: "2026-10-03", category: "Operasional & Kebersihan", description: "Perbaikan sound system ruang utama", amount: 900_000 },
  { date: "2026-10-05", category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot Oktober", amount: 2_500_000 },
];

export async function seedAlIkhlas() {
  const mosqueId = createMosque({
    slug: "al-ikhlas",
    name: "Masjid Al-Ikhlas",
    tagline: "Membangun masjid, membangun umat",
    address: "Jl. Melati Raya No. 12, Sukamaju, Jakarta Selatan",
    phone: "0812-3456-7890",
    email: "sekretariat@masjid-alikhlas.id",
    bankName: "Bank Syariah Indonesia (BSI)",
    bankAccount: "7123456789",
    bankHolder: "Masjid Al-Ikhlas — DKM",
    donationNote:
      "Setiap donasi dikonfirmasi bendahara maksimal 1×24 jam. Laporan keuangan dipublikasikan setiap awal bulan.",
    activeUntil: null,
  });

  await createUser({
    mosqueId,
    name: "Admin Masjid",
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "super",
  });

  seedTransactions(mosqueId, {
    programs: ALIKHLAS_PROGRAMS,
    donations: ALIKHLAS_DONATIONS,
    expenses: ALIKHLAS_EXPENSES,
    createdBy: "Admin Masjid",
  });

  publishMonthlyReport(mosqueId, "2026-08", "2026-09-03T09:00:00");
  publishMonthlyReport(mosqueId, "2026-09", "2026-10-02T09:00:00");

  seedQurban(
    mosqueId,
    {
      title: "Tabungan Qurban 1448 H",
      description:
        "Program tabungan qurban untuk Idul Adha 1448 H. Setoran bisa dicicil setiap bulan dan dicatat bendahara. Dana dikelola terpisah dari kas operasional masjid.",
      goatPrice: 2_500_000,
      cowSharePrice: 3_500_000,
      targetDate: "2027-05-27",
    },
    [
      {
        name: "Bapak Ahmad Fauzi",
        phone: "0813-1111-2222",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 1_000_000, method: "transfer", depositedAt: "2026-08-24", note: "Setoran ke-1" },
          { amount: 1_500_000, method: "transfer", depositedAt: "2026-09-24", note: "Pelunasan" },
        ],
      },
      {
        name: "Ibu Nurhayati",
        phone: "0812-3333-4444",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 800_000, method: "cash", depositedAt: "2026-09-12", note: "Setoran ke-1" },
        ],
      },
      {
        name: "Keluarga Bapak Yusuf",
        phone: "0812-5555-6666",
        animalType: "sapi",
        targetAmount: 3_500_000,
        status: "approved",
        deposits: [
          { amount: 1_750_000, method: "transfer", depositedAt: "2026-09-18", note: "Setoran separuh" },
        ],
      },
      {
        name: "Bapak Taufik Hidayat",
        phone: "0857-7777-8888",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 500_000, method: "cash", depositedAt: "2026-10-04", note: "Setoran ke-1" },
        ],
      },
      {
        name: "Bapak Rudi Hartono",
        phone: "0818-9999-0000",
        animalType: "sapi",
        targetAmount: 3_500_000,
        status: "pending",
      },
      {
        name: "Hamba Allah",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "pending",
      },
    ],
    "Admin Masjid"
  );

  return mosqueId;
}

// ================= Masjid Nurul Iman (masa aktif habis) =================

export async function seedNurulIman() {
  const expired = new Date();
  expired.setDate(expired.getDate() - 5);

  const mosqueId = createMosque({
    slug: "nurul-iman",
    name: "Masjid Nurul Iman",
    tagline: "Mari makmurkan masjid",
    address: "Jl. Kenanga No. 3, Cibinong, Bogor",
    phone: "0813-2222-3333",
    email: "dkm@nuruliman-cibinong.id",
    bankName: "Bank Syariah Indonesia (BSI)",
    bankAccount: "7299887766",
    bankHolder: "Masjid Nurul Iman — DKM",
    donationNote: "Konfirmasi donasi maksimal 1×24 jam.",
    activeUntil: expired,
  });

  await createUser({
    mosqueId,
    name: "Bendahara Nurul Iman",
    email: "nuruliman@masjid.id",
    password: "nurul123",
    role: "pengurus",
  });

  const settings = ensurePlatformSettings();
  seedAppInfaq(mosqueId, {
    months: 1,
    monthlyAmount: settings.monthlyAmount,
    senderName: "Ust. Hambali (Bendahara)",
    method: "transfer",
    note: "Infaq perpanjangan masa aktif. Mohon diverifikasi.",
  });

  return mosqueId;
}

// ================= Masjid Demo =================

const DEMO_PROGRAMS: ProgramSeed[] = [
  {
    slug: "renovasi-menara-lampu",
    type: "campaign",
    title: "Renovasi Menara & Lampu Penerangan",
    description:
      "Perbaikan menara masjid yang mulai retak serta penggantian lampu penerangan halaman dan jalan sekitar agar jamaah aman saat datang ke masjid.",
    targetAmount: 60_000_000,
    startDate: daysAgo(75),
    endDate: daysFromNow(120),
  },
  {
    slug: "tempat-wudhu-baru",
    type: "campaign",
    title: "Pembangunan Tempat Wudhu Baru",
    description:
      "Penambahan 6 kran wudhu dan 2 bilik toilet di sisi selatan masjid untuk mengurangi antrean saat shalat berjamaah.",
    targetAmount: 30_000_000,
    startDate: daysAgo(40),
    endDate: daysFromNow(60),
  },
  {
    slug: "donasi-rutin",
    type: "rutin",
    title: "Donasi Rutin Operasional",
    description:
      "Dukungan bulanan untuk honor imam & marbot, listrik, air, dan kebersihan masjid.",
    monthlyTarget: 12_000_000,
    startDate: daysAgo(120),
  },
  {
    slug: "beasiswa-santri",
    type: "rutin",
    title: "Beasiswa Santri Tahfidz",
    description:
      "Beasiswa bulanan untuk 8 santri tahfidz dari keluarga kurang mampu di sekitar masjid.",
    monthlyTarget: 4_000_000,
    startDate: daysAgo(90),
  },
];

const DEMO_DONATIONS: DonationSeed[] = [
  { date: daysAgo(1), program: "renovasi-menara-lampu", donor: "Bapak H. Sulaiman", amount: 2_000_000, method: "transfer" },
  { date: daysAgo(2), program: "donasi-rutin", donor: "Ibu Aminah", amount: 500_000, method: "qris" },
  { date: daysAgo(3), program: "renovasi-menara-lampu", donor: "Hamba Allah", amount: 1_000_000, method: "transfer" },
  { date: daysAgo(4), program: "beasiswa-santri", donor: "Alumni ITB Peduli", amount: 1_500_000, method: "transfer" },
  { date: daysAgo(5), category: "Infaq & Sedekah", donor: "Hamba Allah", amount: 300_000, method: "cash", note: "Infaq harian" },
  { date: daysAgo(6), category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 850_000, method: "cash" },
  { date: daysAgo(7), program: "renovasi-menara-lampu", donor: "Keluarga Bapak Rahmat", amount: 3_000_000, method: "transfer" },
  { date: daysAgo(8), program: "tempat-wudhu-baru", donor: "Ibu Rina Marlina", amount: 1_500_000, method: "qris" },
  { date: daysAgo(9), program: "donasi-rutin", donor: "Bapak Dedi Kurniawan", amount: 1_000_000, method: "transfer" },
  { date: daysAgo(10), program: "beasiswa-santri", donor: "Hamba Allah", amount: 500_000, method: "qris" },

  { date: monthDay(1, 3), program: "renovasi-menara-lampu", donor: "Bapak H. Sulaiman", amount: 5_000_000, method: "transfer" },
  { date: monthDay(1, 6), program: "donasi-rutin", donor: "Ibu Aminah", amount: 1_000_000, method: "transfer" },
  { date: monthDay(1, 9), program: "tempat-wudhu-baru", donor: "Keluarga Bapak Rahmat", amount: 2_000_000, method: "transfer" },
  { date: monthDay(1, 12), category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 780_000, method: "cash" },
  { date: monthDay(1, 15), program: "beasiswa-santri", donor: "Alumni ITB Peduli", amount: 1_500_000, method: "transfer" },
  { date: monthDay(1, 18), program: "renovasi-menara-lampu", donor: "Hamba Allah", amount: 2_500_000, method: "transfer" },
  { date: monthDay(1, 21), program: "donasi-rutin", donor: "Ibu Rina Marlina", amount: 750_000, method: "qris" },
  { date: monthDay(1, 24), category: "Zakat", donor: "Bapak Hendra Wijaya", amount: 2_000_000, method: "transfer", note: "Zakat penghasilan" },
  { date: monthDay(1, 27), program: "tempat-wudhu-baru", donor: "Hamba Allah", amount: 1_000_000, method: "qris" },

  { date: monthDay(2, 4), program: "renovasi-menara-lampu", donor: "Bapak H. Sulaiman", amount: 3_000_000, method: "transfer" },
  { date: monthDay(2, 7), program: "donasi-rutin", donor: "Ibu Aminah", amount: 1_000_000, method: "transfer" },
  { date: monthDay(2, 11), program: "tempat-wudhu-baru", donor: "Keluarga Bapak Rahmat", amount: 2_500_000, method: "transfer" },
  { date: monthDay(2, 14), category: "Kotak Amal Jumat", donor: "Jamaah Jumat", amount: 900_000, method: "cash" },
  { date: monthDay(2, 17), program: "beasiswa-santri", donor: "Alumni ITB Peduli", amount: 1_000_000, method: "qris" },
  { date: monthDay(2, 20), category: "Zakat", donor: "Ibu Sari Dewi", amount: 1_500_000, method: "transfer" },
  { date: monthDay(2, 24), program: "donasi-rutin", donor: "Bapak Dedi Kurniawan", amount: 500_000, method: "cash" },
  { date: monthDay(2, 28), program: "renovasi-menara-lampu", donor: "Hamba Allah", amount: 4_000_000, method: "transfer" },

  { date: daysAgo(1), category: "Infaq & Sedekah", donor: "Bapak Ihsan Nuradi", amount: 500_000, method: "transfer", status: "pending", phone: "0813-2222-3333", note: "Konfirmasi transfer BSI Rp500.000" },
  { date: daysAgo(2), program: "renovasi-menara-lampu", donor: "Ibu Lina Marlina", amount: 250_000, method: "qris", status: "pending", phone: "0812-8888-9999", note: "Scan QRIS via GoPay" },
];

const DEMO_EXPENSES: ExpenseSeed[] = [
  { date: daysAgo(3), category: "Listrik & Air", description: "Tagihan listrik & PDAM bulan lalu", amount: 1_250_000 },
  { date: daysAgo(5), category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot", amount: 2_500_000 },
  { date: daysAgo(8), category: "Pembangunan & Renovasi", description: "Material menara tahap 1", amount: 8_000_000, program: "renovasi-menara-lampu" },
  { date: monthDay(1, 5), category: "Operasional & Kebersihan", description: "Alat kebersihan & honor petugas", amount: 1_600_000 },
  { date: monthDay(1, 8), category: "Listrik & Air", description: "Tagihan listrik & PDAM", amount: 1_180_000 },
  { date: monthDay(1, 10), category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot", amount: 2_500_000 },
  { date: monthDay(1, 16), category: "Kegiatan & Dakwah", description: "Konsumsi kajian rutin & spanduk", amount: 700_000 },
  { date: monthDay(1, 22), category: "Sosial & Santunan", description: "Santunan anak yatim", amount: 1_500_000 },
  { date: monthDay(2, 6), category: "Listrik & Air", description: "Tagihan listrik & PDAM", amount: 1_100_000 },
  { date: monthDay(2, 9), category: "Honor Imam & Marbot", description: "Honor imam rawatib & marbot", amount: 2_500_000 },
  { date: monthDay(2, 15), category: "Pembangunan & Renovasi", description: "DP material tempat wudhu", amount: 3_000_000, program: "tempat-wudhu-baru" },
  { date: monthDay(2, 25), category: "Operasional & Kebersihan", description: "Perlengkapan kebersihan", amount: 1_400_000 },
];

export async function seedDemoMosque() {
  db.delete(mosques).where(eq(mosques.isDemo, true)).run();

  const mosqueId = createMosque({
    slug: DEMO_SLUG,
    name: "Masjid Baiturrahman (Demo)",
    tagline: "Contoh aplikasi MasjidAmanah — silakan coba semua fitur",
    address: "Jl. Merdeka No. 45, Bandung",
    phone: "0822-1111-2222",
    email: "dkm@baiturrahman-demo.id",
    bankName: "Bank Syariah Indonesia (BSI)",
    bankAccount: "7155009988",
    bankHolder: "Masjid Baiturrahman — DKM",
    donationNote:
      "Ini masjid demo. Semua data adalah contoh dan akan direset otomatis secara berkala.",
    isDemo: true,
    activeUntil: null,
  });

  await createUser({
    mosqueId,
    name: "Bendahara Demo",
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    role: "pengurus",
  });

  seedTransactions(mosqueId, {
    programs: DEMO_PROGRAMS,
    donations: DEMO_DONATIONS,
    expenses: DEMO_EXPENSES,
    createdBy: "Bendahara Demo",
  });

  const [prev1, prev2] = currentAndPrevPeriods(3).slice(1);
  if (prev2) publishMonthlyReport(mosqueId, prev2, monthDay(2, 2) + "T09:00:00");
  if (prev1) publishMonthlyReport(mosqueId, prev1, monthDay(1, 2) + "T09:00:00");

  seedQurban(
    mosqueId,
    {
      title: "Tabungan Qurban 1448 H",
      description:
        "Tabungan qurban untuk Idul Adha 1448 H. Setoran bisa dicicil, dicatat bendahara, dan progresnya tampil di halaman publik.",
      goatPrice: 2_500_000,
      cowSharePrice: 3_500_000,
      targetDate: daysFromNow(210),
    },
    [
      {
        name: "Bapak Dedi Kurniawan",
        phone: "0812-1111-2222",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 1_000_000, method: "transfer", depositedAt: daysAgo(70), note: "Setoran ke-1" },
          { amount: 1_000_000, method: "transfer", depositedAt: daysAgo(35), note: "Setoran ke-2" },
          { amount: 500_000, method: "cash", depositedAt: daysAgo(10), note: "Pelunasan" },
        ],
      },
      {
        name: "Ibu Rina Marlina",
        phone: "0812-3333-4444",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 600_000, method: "qris", depositedAt: daysAgo(40), note: "Setoran ke-1" },
          { amount: 400_000, method: "qris", depositedAt: daysAgo(12), note: "Setoran ke-2" },
        ],
      },
      {
        name: "Keluarga Bapak Rahmat",
        phone: "0812-5555-6666",
        animalType: "sapi",
        targetAmount: 3_500_000,
        status: "approved",
        deposits: [
          { amount: 1_500_000, method: "transfer", depositedAt: daysAgo(60), note: "Setoran ke-1" },
          { amount: 1_000_000, method: "transfer", depositedAt: daysAgo(20), note: "Setoran ke-2" },
        ],
      },
      {
        name: "Hamba Allah",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "approved",
        deposits: [
          { amount: 500_000, method: "cash", depositedAt: daysAgo(5), note: "Setoran ke-1" },
        ],
      },
      {
        name: "Bapak Ihsan Nuradi",
        phone: "0813-2222-3333",
        animalType: "kambing",
        targetAmount: 2_500_000,
        status: "pending",
      },
      {
        name: "Ustadz Fadhil",
        phone: "0857-4444-5555",
        animalType: "sapi",
        targetAmount: 3_500_000,
        status: "pending",
      },
    ],
    "Bendahara Demo"
  );

  const settings = ensurePlatformSettings();
  seedAppInfaq(mosqueId, {
    months: 6,
    monthlyAmount: settings.monthlyAmount,
    senderName: "Bendahara Masjid Baiturrahman",
    method: "transfer",
    note: "Infaq aplikasi paket 6 bulan. Mohon diverifikasi.",
    createdAt: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    })(),
  });

  return mosqueId;
}
