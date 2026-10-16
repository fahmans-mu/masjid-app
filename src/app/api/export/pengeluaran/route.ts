import { getSession } from "@/lib/auth";
import { listExpenses } from "@/lib/queries";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.mosqueId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const periodRaw = url.searchParams.get("period");
  const period = periodRaw && /^\d{4}-\d{2}$/.test(periodRaw) ? periodRaw : undefined;
  const categoryId = Number(url.searchParams.get("category")) || undefined;

  const data = listExpenses(session.mosqueId, {
    period,
    categoryId,
    perPage: 100_000,
    page: 1,
  });

  const header = ["Tanggal", "Keterangan", "Kategori", "Program", "Jumlah", "Dicatat oleh"];
  const lines: (string | number)[][] = [
    header,
    ...data.rows.map((r) => [
      r.spentAt,
      r.description,
      r.categoryName ?? "",
      r.programTitle ?? "",
      r.amount,
      r.createdBy ?? "",
    ]),
  ];

  const csv =
    "\uFEFF" +
    lines
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
      "Content-Disposition": `attachment; filename="pengeluaran-${period ?? "semua"}.csv"`,
    },
  });
}
