const STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-700",
  published: "bg-emerald-100 text-emerald-800",
  draft: "bg-slate-200 text-slate-600",
  campaign: "bg-sky-100 text-sky-800",
  rutin: "bg-violet-100 text-violet-800",
  aktif: "bg-emerald-100 text-emerald-800",
  selesai: "bg-slate-200 text-slate-500",
};

export function Badge({
  kind,
  children,
}: {
  kind: keyof typeof STYLES | string;
  children: React.ReactNode;
}) {
  const style = STYLES[kind] ?? "bg-slate-100 text-slate-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {children}
    </span>
  );
}
