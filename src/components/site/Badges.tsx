import { KIND_LABEL, STATUS_META } from "@/lib/constants";
import type { Category, KindKey, StatusKey } from "@/lib/types";

export function StatusBadge({ status }: { status: StatusKey }) {
  const m = STATUS_META[status] ?? STATUS_META.completed;
  return (
    <span
      className="chip"
      style={{ color: m.color, borderColor: `${m.color}55`, background: `${m.color}14` }}
    >
      <span className="chip-dot" style={{ background: m.color }} />
      {m.label}
    </span>
  );
}

export function CategoryChip({ category, solid = false }: { category: Pick<Category, "name" | "color">; solid?: boolean }) {
  return (
    <span
      className={solid ? "chip backdrop-blur" : "chip"}
      style={{
        color: category.color,
        borderColor: `${category.color}55`,
        background: solid ? "rgb(7 10 18 / 0.72)" : `${category.color}14`,
      }}
    >
      {category.name}
    </span>
  );
}

export function KindBadges({ kinds }: { kinds: KindKey[] }) {
  if (!kinds.length) return null;
  return (
    <>
      {kinds.map((k) => (
        <span key={k} className="chip" title="内容真实性类型">
          {KIND_LABEL[k] ?? k}
        </span>
      ))}
    </>
  );
}
