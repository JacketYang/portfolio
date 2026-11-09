import Link from "next/link";
import { CareerChart } from "@/components/site/CareerChart";
import { ContactList } from "@/components/site/ContactList";
import { Markdown } from "@/components/Markdown";
import { ParticleField } from "@/components/site/ParticleField";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StatusBadge } from "@/components/site/Badges";
import { TimelineCompact } from "@/components/site/Timeline";
import {
  getCategories,
  getExperiences,
  getLogs,
  getProjects,
  getSiteData,
} from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ profile, site }, categories, projects, experiences, logs] = await Promise.all([
    getSiteData(),
    getCategories(),
    getProjects(),
    getExperiences(),
    getLogs(),
  ]);

  const catMap = new Map(categories.map((c) => [c.id, c]));
  const counts = new Map<string, number>();
  for (const p of projects) counts.set(p.categoryId, (counts.get(p.categoryId) ?? 0) + 1);

  const work = experiences.filter((e) => e.kind === "work");
  const featured = projects.filter((p) => p.featured).slice(0, site.featuredLimit);
  const ongoing = projects.filter((p) => p.status === "developing" || p.status === "testing");
  const highlights = profile.highlights.filter((h) => h.value);
  const recentLogs = logs.slice(0, 3);
  const s = site.sections;

  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.headline,
    description: profile.intro,
    ...(profile.location ? { homeLocation: { "@type": "Place", name: profile.location } } : {}),
  }).replace(/</g, "\\u003c");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* ---------- 首屏 ---------- */}
      <section className="relative overflow-hidden border-b border-line">
        <div aria-hidden className="glow pointer-events-none absolute inset-0" />
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0" />
        <ParticleField className="pointer-events-none absolute inset-0 h-full w-full opacity-60" />
        <div className="container-page relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">个人项目展厅 · 数字档案馆</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="h-display mt-5">
                <span className="text-gradient">{profile.name}</span>
              </h1>
            </Reveal>
            {profile.headline && (
              <Reveal delay={0.1}>
                <p className="mt-5 text-xl font-medium sm:text-2xl">{profile.headline}</p>
              </Reveal>
            )}
            {profile.tagline && (
              <Reveal delay={0.14}>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">{profile.tagline}</p>
              </Reveal>
            )}
            <Reveal delay={0.2}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/projects" className="btn btn-primary">
                  浏览项目展厅
                </Link>
                <Link href="/about#contact" className="btn">
                  联系我
                </Link>
                <Link href="/resume" className="btn">
                  查看简历
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.18}>
            <aside className="glass p-6" aria-label="档案索引">
              <p className="eyebrow">档案索引 · Archive</p>
              <ul className="mt-4 divide-y divide-line">
                {categories.map((c, i) => (
                  <li key={c.id}>
                    <Link href={`/projects?c=${c.id}`} className="group flex items-center justify-between gap-3 py-3">
                      <span className="flex items-center gap-3">
                        <span className="font-mono text-xs text-faint">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-sm transition-colors group-hover:text-accent">{c.name}</span>
                      </span>
                      <span className="font-mono text-xs text-muted">{counts.get(c.id) ?? 0} 个项目</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-sm">
                {profile.intention && (
                  <div className="col-span-2">
                    <dt className="text-xs text-faint">求职意向</dt>
                    <dd>{profile.intention}</dd>
                  </div>
                )}
                {profile.location && (
                  <div>
                    <dt className="text-xs text-faint">所在城市</dt>
                    <dd>{profile.location}</dd>
                  </div>
                )}
                {profile.experienceYears && (
                  <div>
                    <dt className="text-xs text-faint">工作年限</dt>
                    <dd>{profile.experienceYears}</dd>
                  </div>
                )}
              </dl>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* ---------- 简介 + 关键数据（均来自个人信息，空值不显示） ---------- */}
      {(profile.intro || highlights.length > 0) && (
        <section className="section !pb-0">
          <div className="container-page">
            {profile.intro && (
              <Reveal>
                <p className="max-w-3xl text-lg leading-relaxed text-muted">{profile.intro}</p>
              </Reveal>
            )}
            {highlights.length > 0 && (
              <Reveal delay={0.05}>
                <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
                  {highlights.map((h) => (
                    <div key={h.label} className="bg-bg p-5 sm:p-6">
                      <dt className="text-xs text-faint">{h.label}</dt>
                      <dd className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{h.value}</dd>
                      {h.note && <p className="mt-1 text-xs text-faint">{h.note}</p>}
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ---------- 核心能力（来自项目分类） ---------- */}
      {s.capabilities && categories.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading
              eyebrow="Capabilities"
              title="核心能力方向"
              desc="按项目分类归档，点击进入对应方向的项目。"
            />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c, i) => (
                <Reveal key={c.id} delay={i * 0.04}>
                  <Link
                    href={`/projects?c=${c.id}`}
                    className="card card-hover flex h-full flex-col p-6"
                  >
                    <span
                      className="mb-4 h-1 w-10 rounded-full"
                      style={{ background: c.color }}
                      aria-hidden
                    />
                    <h3 className="text-lg font-semibold">{c.name}</h3>
                    {c.description && <p className="mt-2 text-sm leading-relaxed text-muted">{c.description}</p>}
                    <p className="mt-auto pt-5 font-mono text-xs text-faint">
                      {counts.get(c.id) ?? 0} 个项目 →
                    </p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- 精选项目 ---------- */}
      {s.featured && featured.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading
              eyebrow="Featured"
              title="精选项目"
              desc="每个项目只呈现实际参与并有依据的内容。"
              href="/projects"
              hrefLabel="全部项目"
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.05}>
                  <ProjectCard project={p} category={catMap.get(p.categoryId)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- 进行中 ---------- */}
      {s.ongoing && ongoing.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading eyebrow="In progress" title="正在进行" desc="还在持续推进的项目与实验。" />
            <ul className="grid gap-4 md:grid-cols-2">
              {ongoing.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="card card-hover group block h-full p-6">
                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge status={p.status} />
                      {catMap.get(p.categoryId) && (
                        <span className="text-xs text-faint">{catMap.get(p.categoryId)?.name}</span>
                      )}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold transition-colors group-hover:text-accent">{p.title}</h3>
                    {p.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.summary}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- 职业经历 ---------- */}
      {s.timeline && work.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading
              eyebrow="Career"
              title="职业经历"
              desc="时间跨度图由各段经历的起止时间自动生成。"
              href="/experience"
              hrefLabel="完整经历与技能"
            />
            <div className="space-y-5">
              <Reveal>
                <CareerChart items={work} />
              </Reveal>
              <Reveal>
                <TimelineCompact items={work} />
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 最近更新 ---------- */}
      {s.logs && site.showLog && recentLogs.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading eyebrow="Log" title="最近更新" href="/log" hrefLabel="全部日志" />
            <ul className="space-y-4">
              {recentLogs.map((l) => (
                <li key={l.id} className="card p-5 sm:p-6">
                  <p className="font-mono text-xs text-faint">{l.date}</p>
                  <h3 className="mt-1 text-base font-semibold">{l.title}</h3>
                  <Markdown source={l.body} className="mt-3 text-sm" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ---------- 联系 ---------- */}
      <section id="contact" className="section !pt-0">
        <div className="container-page">
          <div className="glass relative overflow-hidden p-6 sm:p-10">
            <div aria-hidden className="glow pointer-events-none absolute inset-0 opacity-70" />
            <div className="relative grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center">
              <div>
                <p className="eyebrow">Contact</p>
                <h2 className="h-section mt-3">联系我</h2>
                <p className="mt-3 text-muted">
                  {profile.intention ? `目前关注：${profile.intention}。` : ""}欢迎通过下面的方式联系。
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/resume" className="btn btn-primary">
                    查看 / 打印简历
                  </Link>
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} className="btn" target="_blank" rel="noopener noreferrer">
                      下载 PDF 简历
                    </a>
                  )}
                </div>
              </div>
              {profile.contacts.length > 0 ? (
                <ContactList items={profile.contacts} />
              ) : (
                <p className="text-sm text-faint">暂未公开联系方式。</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
