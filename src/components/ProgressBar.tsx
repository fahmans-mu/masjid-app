import { percent } from "@/lib/format";

const TONES = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
} as const;

export function ProgressBar({
  value,
  target,
  tone = "emerald",
  className = "",
}: {
  value: number;
  target: number | null | undefined;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const pct = percent(value, Number(target ?? 0));
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}>
      <div
        className={`h-full rounded-full ${TONES[tone]} transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
