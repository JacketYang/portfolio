import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Markdown } from "@/components/Markdown";
import { PageHeader } from "@/components/site/SectionHeading";
import { getLogs, getProjects, getSiteData } from "@/lib/content";
import type { LogEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "成长日志",
  description: "项目、学习与实践的持续记录。",
};

export default async function LogPage() {
  const [{ site }, logs, projects] = await Promise.all([getSiteData(), getLogs(), getProjects()]);
  if (!site.showLog) notFound();

  const titleOf = new Map(projects.map((p) => [p.id, p.title]));
  const byYear = new Map<string, LogEntry[]>();
  for (const l of logs) {
    const y = l.date.slice(0, 4);
    byYear.set(y, [...(byYear.get(y) ?? []), l]);
  }

  return (
    <>
      <PageHeader eyebrow="Log" title="成长日志" desc="持续积累：每次完成新项目、学到新东西，都会在这里留下记录。" />
      <section className="section">
        <div className="container-page max-w-3xl">
          {logs.length === 0 ? (
            <p className="card p-10 text-center text-sm text-muted">还没有日志。</p>
          ) : (
            [...byYear.entries()].map(([year, items]) => (
              <div key={year} className="mb-12 last:mb-0">
                <h2 className="mb-6 font-mono text-sm text-accent">{year}</h2>
                <ol className="space-y-6 border-l border-line pl-6">
                  {items.map((l) => (
                    <li key={l.id} className="relative">
                      <span aria-hidden className="absolute -left-[1.85rem] top-2 h-2 w-2 rounded-full bg-accent" />
                      <p className="font-mono text-xs text-faint">{l.date}</p>
                      <h3 className="mt-1 text-lg font-semibold">{l.title}</h3>
                      <Markdown source={l.body} className="mt-3 text-sm" />
                      {l.projectId && titleOf.has(l.projectId) && (
                        <Link href={`/projects/${l.projectId}`} className="mt-3 inline-block text-sm text-accent">
                          相关项目：{titleOf.get(l.projectId)} →
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
