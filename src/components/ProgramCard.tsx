import Link from "next/link";
import { Landmark, Repeat } from "lucide-react";
import { Badge } from "./Badge";
import { ProgressBar } from "./ProgressBar";
import {
  formatDateID,
  formatRupiah,
  percent,
  todayISO,
} from "@/lib/format";
import type { ProgramWithRaised } from "@/lib/queries";

export function ProgramCard({
  program: p,
  showType = true,
}: {
  program: ProgramWithRaised;
  showType?: boolean;
}) {
  const isCampaign = p.type === "campaign";
  const target = isCampaign ? p.targetAmount : p.monthlyTarget;
  const value = isCampaign ? p.raised : p.raisedThisMonth;
  const pct = percent(value, target ?? 0);

  let deadlineText: string | null = null;
  if (isCampaign && p.endDate) {
    const daysLeft = Math.ceil(
      (new Date(p.endDate + "T00:00:00").getTime() -
        new Date(todayISO() + "T00:00:00").getTime()) /
        86_400_000
    );
    if (!p.isActive) deadlineText = "Campaign selesai";
    else if (daysLeft > 1) deadlineText = `${daysLeft} hari lagi`;
    else if (daysLeft >= 0) deadlineText = "Berakhir hari ini";
    else deadlineText = `Tenggat ${formatDateID(p.endDate)}`;
  }

  return (
    <Link
      href={`/program/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {p.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={p.imageUrl}
          alt={p.title}
          className="h-40 w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-40 w-full items-center justify-center ${
            isCampaign
              ? "bg-gradient-to-br from-emerald-600 to-teal-700"
              : "bg-gradient-to-br from-violet-600 to-indigo-700"
          }`}
        >
          {isCampaign ? (
            <Landmark className="h-12 w-12 text-white/70" />
          ) : (
            <Repeat className="h-12 w-12 text-white/70" />
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {showType && (
            <Badge kind={p.type}>
              {isCampaign ? "Campaign" : "Donasi Rutin"}
            </Badge>
          )}
          {!p.isActive && <Badge kind="selesai">Selesai</Badge>}
          {deadlineText && p.isActive && (
            <span className="text-xs font-medium text-amber-600">
              {deadlineText}
            </span>
          )}
        </div>

        <h3 className="mt-3 line-clamp-2 font-bold text-slate-900 group-hover:text-emerald-700">
          {p.title}
        </h3>
        {p.description && (
          <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
            {p.description}
          </p>
        )}

        <div className="mt-auto pt-4">
          <div className="mb-2 flex items-end justify-between gap-2">
            <div>
              <p className="text-base font-bold text-slate-900">
                {formatRupiah(value)}
              </p>
              <p className="text-xs text-slate-500">
                {isCampaign
                  ? `terkumpul dari ${formatRupiah(target)}`
                  : `bulan ini dari ${formatRupiah(target)}`}
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-600">{pct}%</span>
          </div>
          <ProgressBar value={value} target={target} tone={isCampaign ? "emerald" : "sky"} />
          {!isCampaign && p.raised > 0 && (
            <p className="mt-2 text-xs text-slate-400">
              Total terkumpul: {formatRupiah(p.raised)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
