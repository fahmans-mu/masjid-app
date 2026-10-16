import { getSession } from "@/lib/auth";
import { listDonations } from "@/lib/queries";
import { methodLabel, statusLabel } from "@/lib/action-utils";

const STATUSES = ["pending", "verified", "rejected"];

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const statusRaw = url.searchParams.get("status");
  const status = STATUSES.includes(statusRaw ?? "")
    ? (statusRaw as "pending" | "verified" | "rejected")
    : undefined;
  const periodRaw = url.searchParams.get("period");
  const period = periodRaw && /^\d{4}-\d{2}$/.test(periodRaw) ? periodRaw : undefined;
  const q = url.searchParams.get("q")?.trim() || undefined;
  const programId = Number(url.searchParams.get("program")) || undefined;

  const data = listDonations({
    status,
    period,
    search: q,
    programId,
    perPage: 100_000,
    page: 1,
  });

  const header = [
    "Tanggal",
    "Donatur",
    "No. HP",
    "Nominal",
    "Metode",
    "Program",
    "Kategori",
    "Status",
    "Keterangan",
  ];
  const lines: (string | number)[][] = [
    header,
    ...data.rows.map((r) => [
      r.donatedAt,
      r.donorName,
      r.donorPhone ?? "",
      r.amount,
      methodLabel(r.method),
      r.programTitle ?? "",
      r.categoryName ?? "",
      statusLabel(r.status),
      r.note ?? "",
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
      "Content-Disposition": `attachment; filename="donasi-${period ?? "semua"}.csv"`,
    },
  });
}
