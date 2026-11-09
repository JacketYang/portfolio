import { formatPeriod } from "@/lib/period";
import type { Experience } from "@/lib/types";

export function Timeline({ items }: { items: Experience[] }) {
  return (
    <ol className="relative space-y-6 border-l border-line pl-6 sm:pl-8">
      {items.map((e) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[1.85rem] top-2 h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgb(7_10_18)] sm:-left-[2.35rem]"
          />
          <div className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-base font-semibold">
                {e.org}
                {e.title && <span className="ml-2 text-sm font-normal text-muted">{e.title}</span>}
                {e.extra && <span className="chip ml-2 align-middle">{e.extra}</span>}
              </h3>
              <span className="font-mono text-xs text-faint">{formatPeriod(e.periodStart, e.periodEnd)}</span>
            </div>
            {e.summary && <p className="mt-2 text-sm text-muted">{e.summary}</p>}
            {e.bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-muted">
                {e.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2.5">
                    <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-accent/70" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** 紧凑版：首页使用，一行一段经历。 */
export function TimelineCompact({ items }: { items: Experience[] }) {
  return (
    <ol className="divide-y divide-line rounded-2xl border border-line bg-surface">
      {items.map((e) => (
        <li key={e.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5">
          <div className="min-w-0">
            <span className="text-sm font-medium">{e.org}</span>
            {e.title && <span className="ml-2 text-sm text-muted">{e.title}</span>}
          </div>
          <span className="font-mono text-xs text-faint">{formatPeriod(e.periodStart, e.periodEnd)}</span>
        </li>
      ))}
    </ol>
  );
}
