import { eq } from "drizzle-orm";
import { db } from "../src/lib/db";
import {
  categories,
  donations,
  expenses,
  monthlyReports,
  programs,
  settings,
} from "../src/lib/schema";
import { computeReport } from "../src/lib/queries";
import { formatRupiah, monthLabel } from "../src/lib/format";
import { seedCore, ADMIN_EMAIL, ADMIN_PASSWORD } from "./seed-core";

type DonationSeed = {
  date: string;
  program?: string;
  category?: string;
  donor: string;
  amount: number;
  method: "transfer" | "qris" | "cash" | "other";
  note?: string;
  phone?: string;
  status?: "pending" | "rejected";
};

const PROGRAM_SEEDS = [
  {
    slug: "renovasi-atap-karpet",
    type: "campaign" as const,
    title: "Renovasi Atap & Karpet Utama",
    description:
      "Penggalangan dana untuk penggantian rangka dan penutup atap utama masjid serta penggantian karpet lantai shalat. Rencana pengerjaan Agustus–Desember 2026. Rincian belanja dilaporkan setiap bulan pada halaman laporan.",
    targetAmount: 150_000_000,
    startDate: "2026-08-01",
    endDate: "2026-12-31",
  },
  {
    slug: "tempat-wudhu-toilet",
    type: "campaign" as const,
    title: "Pembangunan Tempat Wudhu & Toilet",
    description:
      "Pembangunan tempat wudhu dan toilet baru di sisi timur masjid (8 kran wudhu, 4 bilik toilet). Target selesai Desember 2026 insyaAllah.",
    targetAmount: 45_000_000,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
  },
  {
    slug: "donasi-rutin-operasional",
    type: "rutin" as const,
    title: "Donasi Rutin Operasional Masjid",
    description:
      "Program donasi bulanan untuk membiayai operasional masjid: honor imam dan marbot, listrik, air, kebersihan, serta kegiatan dakwah rutin. Target Rp15.000.000 per bulan.",
    monthlyTarget: 15_000_000,
    startDate: "2026-01-01",
  },
  {
    slug: "beasiswa-santri-tahfidz",
    type: "rutin" as const,
    title: "Beasiswa Santri Tahfidz",
    description:
      "Beasiswa bulanan untuk 10 santri tahfidz kurang mampu di lingkungan masjid (@ Rp500.000/bulan). Disalurkan setiap tanggal 25.",
    monthlyTarget: 5_000_000,
    startDate: "2026-01-01",
  },
  {
    slug: "al-quran-braille",
    type: "campaign" as const,
    title: "Pengadaan Al-Quran Braille",
    description:
      "Pengadaan 20 mushaf Al-Quran Braille untuk jamaah tunanetra. Kampanye telah selesai dan seluruh mushaf telah diserahkan pada Juli 2026. Jazakumullahu khairan!",
    targetAmount: 10_000_000,
    startDate: "2026-05-01",
    endDate: "2026-07-31",
    isActive: false,
  },
];

const DONATION_SEEDS: DonationSeed[] = [
  // ===== Al-Quran Braille (Mei–Juli 2026, campaign selesai) =====
  { date: "2026-05-10", program: "al-quran-braille", donor: "Hj. Maimunah", amount: 2_500_000, method: "transfer" },
  { date: "2026-06-08", program: "al-quran-braille", donor: "Alumni Ponpes Al-Hikmah", amount: 3_000_000, method: "transfer" },
  { date: "2026-07-05", program: "al-quran-braille", donor: "Bapak H. Abdullah", amount: 2_000_000, method: "transfer" },
  { date: "2026-07-20", program: "al-quran-braille", donor: "Hamba Allah", amount: 2_500_000, method: "qris" },

  // ===== Agustus 2026 =====
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

  // ===== September 2026 =====
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

  // ditolak — tidak masuk hitungan
  { date: "2026-09-30", program: "tempat-wudhu-toilet", donor: "Hamba Allah", amount: 10_000_000, method: "transfer", status: "rejected", note: "Bukti transfer tidak ditemukan / duplikat" },

  // ===== Oktober 2026 (bulan berjalan) =====
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

  // menunggu verifikasi bendahara (dari form konfirmasi jamaah)
  { date: "2026-10-04", category: "Infaq & Sedekah", donor: "Bapak Iwan Setiawan", amount: 1_000_000, method: "transfer", status: "pending", phone: "0813-1111-2222", note: "Konfirmasi transfer BSI Rp1.000.000" },
  { date: "2026-10-05", program: "renovasi-atap-karpet", donor: "Ibu Lina Marlina", amount: 500_000, method: "qris", status: "pending", phone: "0812-3333-4444", note: "Scan QRIS via GoPay" },
  { date: "2026-10-06", program: "beasiswa-santri-tahfidz", donor: "Hamba Allah", amount: 2_000_000, method: "transfer", status: "pending", phone: "0857-5555-6666", note: "Wakaf untuk santri tahfidz" },
];

type ExpenseSeed = {
  date: string;
  category: string;
  description: string;
  amount: number;
  program?: string;
};

const EXPENSE_SEEDS: ExpenseSeed[] = [
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

async function main() {
  console.log("Menyiapkan data dasar...");
  await seedCore();

  const existing = db.select().from(programs).all();
  if (existing.length > 0) {
    console.log("\nData program sudah ada — seed demo dilewati (tidak menimpa data).");
    console.log("Kalau ingin mulai dari nol: hapus folder data/ lalu jalankan lagi npm run db:push && npm run db:seed-demo");
    return;
  }

  console.log("\nMengisi profil masjid contoh...");
  const s = db.select().from(settings).where(eq(settings.id, 1)).get();
  if (s && !s.address) {
    db.update(settings)
      .set({
        mosqueName: "Masjid Al-Ikhlas",
        tagline: "Membangun masjid, membangun umat",
        address: "Jl. Melati Raya No. 12, Sukamaju, Jakarta Selatan",
        phone: "0812-3456-7890",
        email: "sekretariat@masjid-alikhlas.id",
        bankName: "Bank Syariah Indonesia (BSI)",
        bankAccount: "7123456789",
        bankHolder: "Masjid Al-Ikhlas — DKM",
        donationNote:
          "Setiap donasi dikonfirmasi bendahara maksimal 1×24 jam. Laporan keuangan dipublikasikan setiap awal bulan.",
      })
      .where(eq(settings.id, 1))
      .run();
  }

  console.log("\nMembuat program donasi...");
  const slugToId = new Map<string, number>();
  for (const p of PROGRAM_SEEDS) {
    const row = db
      .insert(programs)
      .values({
        slug: p.slug,
        type: p.type,
        title: p.title,
        description: p.description,
        targetAmount: "targetAmount" in p ? (p.targetAmount as number) : null,
        monthlyTarget: "monthlyTarget" in p ? (p.monthlyTarget as number) : null,
        startDate: "startDate" in p ? (p.startDate as string) : null,
        endDate: "endDate" in p ? (p.endDate as string) : null,
        isActive: "isActive" in p ? (p.isActive as boolean) : true,
      })
      .returning({ id: programs.id })
      .get();
    slugToId.set(p.slug, row.id);
    console.log(`  + ${p.title}`);
  }

  const cats = db.select().from(categories).all();
  const catToId = new Map(cats.map((c) => [c.name, c.id]));

  console.log("\nMengisi transaksi donasi...");
  let verified = 0;
  let pending = 0;
  for (const d of DONATION_SEEDS) {
    const status = d.status ?? "verified";
    db.insert(donations)
      .values({
        programId: d.program ? (slugToId.get(d.program) ?? null) : null,
        categoryId: d.category ? (catToId.get(d.category) ?? null) : null,
        donorName: d.donor,
        donorPhone: d.phone ?? null,
        amount: d.amount,
        method: d.method,
        donatedAt: d.date,
        note: d.note ?? null,
        status,
        verifiedBy: status === "verified" ? "Admin Masjid" : null,
        verifiedAt: status === "verified" ? new Date(d.date + "T10:00:00") : null,
      })
      .run();
    if (status === "verified") verified++;
    else if (status === "pending") pending++;
  }
  console.log(`  + ${verified} donasi terverifikasi, ${pending} menunggu verifikasi`);

  console.log("\nMengisi transaksi pengeluaran...");
  for (const e of EXPENSE_SEEDS) {
    db.insert(expenses)
      .values({
        categoryId: catToId.get(e.category)!,
        programId: e.program ? (slugToId.get(e.program) ?? null) : null,
        description: e.description,
        amount: e.amount,
        spentAt: e.date,
        createdBy: "Admin Masjid",
      })
      .run();
  }
  console.log(`  + ${EXPENSE_SEEDS.length} pengeluaran`);

  console.log("\nMenerbitkan laporan bulanan (Agustus & September 2026)...");
  const published = [
    { period: "2026-08", publishedAt: "2026-09-03T09:00:00" },
    { period: "2026-09", publishedAt: "2026-10-02T09:00:00" },
  ];
  for (const { period, publishedAt } of published) {
    const c = computeReport(period);
    const summary =
      `Alhamdulillah, laporan keuangan ${monthLabel(period)} telah selesai disusun. ` +
      `Total pemasukan ${formatRupiah(c.totalIncome)} dan pengeluaran ${formatRupiah(c.totalExpense)}, ` +
      `sehingga saldo kas per akhir bulan menjadi ${formatRupiah(c.closingBalance)}. ` +
      `Rincian per kategori dan per program dapat dilihat pada tabel di bawah. ` +
      `Semoga Allah membalas kebaikan seluruh donatur. — Bendahara DKM`;
    db.insert(monthlyReports)
      .values({
        period,
        openingBalance: c.openingBalance,
        totalIncome: c.totalIncome,
        totalExpense: c.totalExpense,
        closingBalance: c.closingBalance,
        breakdown: JSON.stringify(c.breakdown),
        summary,
        status: "published",
        generatedAt: new Date(publishedAt),
        publishedAt: new Date(publishedAt),
      })
      .run();
    console.log(
      `  + ${monthLabel(period)}: masuk ${formatRupiah(c.totalIncome)}, keluar ${formatRupiah(c.totalExpense)}, saldo ${formatRupiah(c.closingBalance)}`
    );
  }

  console.log("\nSelesai! Jalankan: npm run dev lalu buka http://localhost:3000");
  console.log(`Login admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
