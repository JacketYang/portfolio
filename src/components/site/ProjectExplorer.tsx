"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Category, Project } from "@/lib/types";
import { cn } from "@/lib/cn";
import { ProjectCard } from "./ProjectCard";

export function ProjectExplorer({
  projects,
  categories,
  initial,
}: {
  projects: Project[];
  categories: Category[];
  initial: string;
}) {
  const [cat, setCat] = useState(
    initial === "all" || categories.some((c) => c.id === initial) ? initial : "all",
  );
  const [q, setQ] = useState("");

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) m.set(p.categoryId, (m.get(p.categoryId) ?? 0) + 1);
    return m;
  }, [projects]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (cat !== "all" && p.categoryId !== cat) return false;
      if (!needle) return true;
      return [p.title, p.summary, p.role, ...p.tools].join(" ").toLowerCase().includes(needle);
    });
  }, [projects, cat, q]);

  function choose(id: string) {
    setCat(id);
    const url = id === "all" ? "/projects" : `/projects?c=${encodeURIComponent(id)}`;
    window.history.replaceState(null, "", url);
  }

  const pills = [{ id: "all", name: "全部项目", n: projects.length }].concat(
    categories.map((c) => ({ id: c.id, name: c.name, n: counts.get(c.id) ?? 0 })),
  );

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="-mx-1 flex flex-wrap gap-2" role="tablist" aria-label="项目分类">
          {pills.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={cat === p.id}
              onClick={() => choose(p.id)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                cat === p.id
                  ? "border-accent/60 bg-accent/15 text-fg"
                  : "border-line text-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {p.name}
              <span className="ml-1.5 font-mono text-xs text-faint">{p.n}</span>
            </button>
          ))}
        </div>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索项目、工具…"
          aria-label="搜索项目"
          className="input md:max-w-[15rem]"
        />
      </div>

      {list.length === 0 ? (
        <p className="card mt-10 p-10 text-center text-sm text-muted">
          没有符合条件的项目。
        </p>
      ) : (
        <motion.ul layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25 }}
              >
                <ProjectCard project={p} category={catMap.get(p.categoryId)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
