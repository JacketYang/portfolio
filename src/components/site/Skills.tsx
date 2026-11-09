import { LEVEL_LABEL } from "@/lib/constants";
import type { SkillGroup } from "@/lib/types";

export function Skills({ groups }: { groups: SkillGroup[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {groups.map((g) => (
        <section key={g.id} className="card p-5 sm:p-6">
          <h3 className="text-base font-semibold">{g.name}</h3>
          {g.description && <p className="mt-1 text-sm text-muted">{g.description}</p>}
          <ul className="mt-4 space-y-3">
            {g.items.map((it, i) => (
              <li key={`${it.name}-${i}`} className="text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="leading-relaxed">{it.name}</span>
                  {it.level && (
                    <span className="chip shrink-0 border-accent/40 text-accent">{LEVEL_LABEL[it.level]}</span>
                  )}
                </div>
                {it.note && <p className="mt-0.5 text-xs leading-relaxed text-faint">{it.note}</p>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
