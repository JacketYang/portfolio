// 时间段工具：支持 "2017.08"、"2017-08"、"2017"、"至今"。

const NOW_WORDS = new Set(["至今", "现在", "present", "now"]);

/** 转成"月份序号"（年*12+月-1）。无法解析返回 null。 */
export function toMonthIndex(input: string, edge: "start" | "end"): number | null {
  const s = (input ?? "").trim().toLowerCase();
  if (!s) return null;
  if (NOW_WORDS.has(s)) {
    const d = new Date();
    return d.getFullYear() * 12 + d.getMonth();
  }
  const m = s.match(/^(\d{4})(?:[.\-/年](\d{1,2}))?/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] ? Math.min(Math.max(Number(m[2]), 1), 12) : edge === "start" ? 1 : 12;
  return year * 12 + (month - 1);
}

export function formatPeriod(start: string, end: string): string {
  const a = (start ?? "").trim();
  const b = (end ?? "").trim();
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

export function yearOf(index: number): number {
  return Math.floor(index / 12);
}
