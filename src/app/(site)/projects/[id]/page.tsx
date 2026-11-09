import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Markdown } from "@/components/Markdown";
import { CategoryChip, KindBadges, StatusBadge } from "@/components/site/Badges";
import { Flow } from "@/components/site/Flow";
import { Gallery } from "@/components/site/Gallery";
import { Media } from "@/components/site/Media";
import { getBaseUrl, absoluteUrl } from "@/lib/site-url";
import { getCategories, getProject, getProjects, getSiteData } from "@/lib/content";
import { formatPeriod } from "@/lib/period";
import { isExternal, isVideoFile, safeHref, safeImg } from "@/lib/safe";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = await getProject(id);
  if (!p) return { title: "项目不存在" };
  const { site } = await getSiteData();
  const img = p.cover ? absoluteUrl(await getBaseUrl(site.siteUrl), p.cover) : undefined;
  return {
    title: p.title,
    description: p.summary || site.description,
    openGraph: {
      title: p.title,
      description: p.summary || site.description,
      type: "article",
      ...(img ? { images: [{ url: img }] } : {}),
    },
  };
}

function Section({ id, index, title, children }: { id: string; index: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="flex items-baseline gap-3 text-xl font-semibold">
        <span className="font-mono text-xs text-accent">{String(index).padStart(2, "0")}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const [project, categories, all] = await Promise.all([getProject(id), getCategories(), getProjects()]);
  if (!project) notFound();

  const category = categories.find((c) => c.id === project.categoryId);
  const c = project.content;
  const period = formatPeriod(project.periodStart, project.periodEnd);
  const metrics = project.achievements.filter((a) => a.value.trim());
  const hasText = (s: string) => s.trim().length > 0;
  const video = safeHref(project.demoVideo);
  const videoIsFile = video !== "#" && isVideoFile(video);
  const qr = safeImg(project.qrcode);

  // 章节：没有内容的章节整体隐藏，不会用占位文字填充
  const sections: { id: string; title: string; body: ReactNode }[] = [];
  if (hasText(c.background)) sections.push({ id: "background", title: "项目背景", body: <Markdown source={c.background} /> });
  if (hasText(c.goals)) sections.push({ id: "goals", title: "项目目标", body: <Markdown source={c.goals} /> });
  if (hasText(c.responsibilities))
    sections.push({ id: "role", title: "实际承担的工作", body: <Markdown source={c.responsibilities} /> });
  if (hasText(c.problems)) sections.push({ id: "problems", title: "解决的问题", body: <Markdown source={c.problems} /> });
  if (hasText(c.process) || c.steps.length > 0)
    sections.push({
      id: "process",
      title: "实施过程",
      body: (
        <div className="space-y-6">
          <Markdown source={c.process} />
          <Flow steps={c.steps} />
        </div>
      ),
    });
  if (hasText(c.techSolution)) sections.push({ id: "tech", title: "技术方案", body: <Markdown source={c.techSolution} /> });
  if (project.tools.length > 0)
    sections.push({
      id: "tools",
      title: "使用工具",
      body: (
        <ul className="flex flex-wrap gap-2">
          {project.tools.map((t) => (
            <li key={t} className="chip !text-sm !py-1">
              {t}
            </li>
          ))}
        </ul>
      ),
    });
  if (project.gallery.length > 0 || video !== "#" || qr)
    sections.push({
      id: "demo",
      title: "截图与演示",
      body: (
        <div className="space-y-6">
          {project.gallery.length > 0 && <Gallery items={project.gallery} title={project.title} />}
          {video !== "#" &&
            (videoIsFile ? (
              <video controls preload="none" playsInline className="w-full rounded-xl border border-line" src={video} />
            ) : (
              <a href={video} className="btn" {...(isExternal(video) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                观看演示 →
              </a>
            ))}
          {qr && (
            <div className="card inline-flex items-center gap-5 p-4">
              <Media src={qr} alt={`${project.title} 二维码`} aspect="1 / 1" fit="contain" className="w-32 rounded-lg bg-white" />
              <p className="text-sm text-muted">扫码体验</p>
            </div>
          )}
        </div>
      ),
    });
  if (hasText(c.deliverables) || metrics.length > 0)
    sections.push({
      id: "results",
      title: "交付成果",
      body: (
        <div className="space-y-6">
          <Markdown source={c.deliverables} />
          {metrics.length > 0 && (
            <dl className="grid gap-3 sm:grid-cols-2">
              {metrics.map((m, i) => (
                <div key={`${m.label}-${i}`} className="card p-5">
                  <dt className="text-xs text-faint">{m.label}</dt>
                  <dd className="mt-1.5 text-2xl font-semibold tracking-tight">{m.value}</dd>
                  {m.note && <p className="mt-1 text-xs text-faint">{m.note}</p>}
                </div>
              ))}
            </dl>
          )}
        </div>
      ),
    });
  if (hasText(c.summary)) sections.push({ id: "summary", title: "项目总结", body: <Markdown source={c.summary} /> });

  const idx = all.findIndex((p) => p.id === project.id);
  const prev = idx > 0 ? all[idx - 1] : undefined;
  const next = idx >= 0 && idx < all.length - 1 ? all[idx + 1] : undefined;
  const links = project.links.filter((l) => safeHref(l.url) !== "#");

  return (
    <article>
      <header className="relative border-b border-line">
        <div aria-hidden className="glow pointer-events-none absolute inset-0" />
        <div className="container-page relative pb-10 pt-10 sm:pb-14 sm:pt-14">
          <nav aria-label="面包屑" className="text-sm text-faint">
            <Link href="/projects" className="hover:text-fg">
              项目展厅
            </Link>
            {category && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/projects?c=${category.id}`} className="hover:text-fg">
                  {category.name}
                </Link>
              </>
            )}
          </nav>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {category && <CategoryChip category={category} />}
            <KindBadges kinds={project.kinds} />
          </div>
          <h1 className="h-display mt-4 max-w-4xl !text-[clamp(2rem,5vw,3.25rem)]">{project.title}</h1>
          {project.summary && <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{project.summary}</p>}
          {(project.role || period) && (
            <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3 text-sm">
              {project.role && (
                <div>
                  <dt className="text-xs text-faint">角色</dt>
                  <dd>{project.role}</dd>
                </div>
              )}
              {period && (
                <div>
                  <dt className="text-xs text-faint">时间</dt>
                  <dd className="font-mono">{period}</dd>
                </div>
              )}
            </dl>
          )}
          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-3">
              {links.map((l, i) => (
                <a
                  key={`${l.url}-${i}`}
                  href={safeHref(l.url)}
                  className="btn"
                  {...(isExternal(l.url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_15rem] lg:py-16">
        <div className="min-w-0 space-y-12">
          {project.cover && (
            <Media
              src={project.cover}
              alt={`${project.title} 封面`}
              stock={project.coverIsStock}
              priority
              aspect="16 / 8"
              color={category?.color}
              label={category?.name}
              className="card"
            />
          )}
          {hasText(project.description) && <Markdown source={project.description} className="text-base" />}
          {sections.map((s, i) => (
            <Section key={s.id} id={s.id} index={i + 1} title={s.title}>
              {s.body}
            </Section>
          ))}
          {sections.length === 0 && !hasText(project.description) && (
            <p className="card p-8 text-sm text-muted">这个项目的详细内容还在整理中。</p>
          )}
        </div>

        {sections.length > 1 && (
          <aside className="hidden lg:block">
            <nav aria-label="本页目录" className="sticky top-24 text-sm">
              <p className="eyebrow mb-3">目录</p>
              <ol className="space-y-2 border-l border-line pl-4">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-muted transition-colors hover:text-accent">
                      <span className="mr-2 font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>
        )}
      </div>

      {(prev || next) && (
        <nav aria-label="上一个 / 下一个项目" className="border-t border-line">
          <div className="container-page grid gap-4 py-8 sm:grid-cols-2">
            {prev ? (
              <Link href={`/projects/${prev.id}`} className="card card-hover p-5">
                <p className="text-xs text-faint">← 上一个项目</p>
                <p className="mt-1 font-medium">{prev.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/projects/${next.id}`} className="card card-hover p-5 sm:text-right">
                <p className="text-xs text-faint">下一个项目 →</p>
                <p className="mt-1 font-medium">{next.title}</p>
              </Link>
            )}
          </div>
        </nav>
      )}
    </article>
  );
}
