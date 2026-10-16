import { getSession } from "@/lib/auth";
import { getReport, parseBreakdown } from "@/lib/queries";
import { isValidPeriod, monthLabel } from "@/lib/format";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ period: string }> }
) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { period } = await params;
  if (!isValidPeriod(period)) {
    return new Response("Periode tidak valid", { status: 400 });
  }

  const report = getReport(period);
  if (!report) {
    return new Response("Laporan belum dibuat", { status: 404 });
  }

  const breakdown = parseBreakdown(report);
  const rows: (string | number)[][] = [
    ["Laporan Keuangan", monthLabel(period)],
    ["Status", report.status === "published" ? "Dipublikasikan" : "Draft"],
    [],
    ["Ringkasan"],
    ["Saldo awal bulan", report.openingBalance],
    ["Pemasukan", report.totalIncome],
    ["Pengeluaran", report.totalExpense],
    ["Saldo akhir bulan", report.closingBalance],
  ];

  if (breakdown) {
    rows.push([], ["Pemasukan per kategori"]);
    for (const r of breakdown.incomeByCategory) rows.push([r.name, r.amount]);
    rows.push([], ["Pemasukan per program"]);
    for (const r of breakdown.incomeByProgram) rows.push([r.name, r.amount]);
    rows.push([], ["Pengeluaran per kategori"]);
    for (const r of breakdown.expenseByCategory) rows.push([r.name, r.amount]);
    rows.push([], ["Pengeluaran per program"]);
    for (const r of breakdown.expenseByProgram) rows.push([r.name, r.amount]);
  }

  if (report.summary) {
    rows.push([], ["Catatan bendahara"], [report.summary]);
  }

  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((cell) =>
            typeof cell === "number"
              ? String(cell)
              : `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="laporan-${period}.csv"`,
    },
  });
}
