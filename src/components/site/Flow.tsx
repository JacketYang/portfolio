import type { Step } from "@/lib/types";

/** 流程图：用于展示实施过程。步骤数据来自项目的 content.steps，没有则不渲染。 */
export function Flow({ steps }: { steps: Step[] }) {
  if (!steps.length) return null;
  return (
    <ol className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-4">
      {steps.map((s, i) => (
        <li
          key={`${s.title}-${i}`}
          className="card relative p-4 sm:min-w-[9rem] sm:flex-1 sm:after:absolute sm:after:-right-[1.35rem] sm:after:top-1/2 sm:after:-translate-y-1/2 sm:after:text-faint sm:after:content-['→'] sm:last:after:hidden"
        >
          <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
          <p className="mt-1 text-sm font-semibold">{s.title}</p>
          {s.desc && <p className="mt-1 text-xs leading-relaxed text-muted">{s.desc}</p>}
        </li>
      ))}
    </ol>
  );
}
