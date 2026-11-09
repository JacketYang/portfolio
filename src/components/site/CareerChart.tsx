import { formatPeriod, toMonthIndex, yearOf } from "@/lib/period";
import type { Experience } from "@/lib/types";

/** 职业时间跨度图：完全由经历的起止时间计算，没有任何虚构数据。 */
export function CareerChart({ items }: { items: Experience[] }) {
  const rows = items
    .map((e) => ({
      e,
      s: toMonthIndex(e.periodStart, "start"),
      t: toMonthIndex(e.periodEnd || e.periodStart, "end"),
    }))
    .filter((r): r is { e: Experience; s: number; t: number } => r.s !== null && r.t !== null && r.t >= r.s);
  if (rows.length < 2) return null;

  const firstYear = yearOf(Math.min(...rows.map((r) => r.s)));
  const lastYear = yearOf(Math.max(...rows.map((r) => r.t)));
  const start = firstYear * 12;
  const end = (lastYear + 1) * 12;
  const pct = (m: number) => ((m - start) / (end - start)) * 100;
  const years: number[] = [];
  const stepYears = lastYear - firstYear > 8 ? 2 : 1;
  for (let y = firstYear; y <= lastYear + 1; y += stepYears) years.push(y);

  return (
    <figure className="card p-5 sm:p-6" aria-label="职业时间跨度图">
      <div className="relative mb-4 h-5 text-[11px] text-faint">
        {years.map((y) => (
          <span
            key={y}
            className="absolute -translate-x-1/2 font-mono"
            style={{ left: `${pct(y * 12)}%` }}
          >
            {y}
          </span>
        ))}
      </div>
      <div className="relative">
        {years.map((y) => (
          <span
            key={y}
            aria-hidden
            className="absolute inset-y-0 w-px bg-line"
            style={{ left: `${pct(y * 12)}%` }}
          />
        ))}
        <ul className="relative space-y-4">
          {rows.map(({ e, s, t }) => {
            const left = pct(s);
            const width = Math.max(pct(t + 1) - left, 1.2);
            return (
              <li key={e.id}>
                <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-muted">
                    <span className="text-fg">{e.org}</span>
                    {e.title && <span className="ml-2 text-faint">{e.title}</span>}
                  </span>
                  <span className="shrink-0 font-mono text-faint">{formatPeriod(e.periodStart, e.periodEnd)}</span>
                </div>
                <div className="relative h-2 rounded-full bg-white/5">
                  <div
                    className="absolute inset-y-0 rounded-full bg-gradient-to-r from-accent to-accent-2"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </figure>
  );
}
