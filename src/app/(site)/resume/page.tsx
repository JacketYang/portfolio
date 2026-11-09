import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { ContactList } from "@/components/site/ContactList";
import { PrintButton } from "@/components/site/PrintButton";
import { getExperiences, getProjects, getSiteData, getSkillGroups } from "@/lib/content";
import { LEVEL_LABEL } from "@/lib/constants";
import { formatPeriod } from "@/lib/period";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "简历",
  description: "由网站数据自动生成的可打印简历。",
};

function H({ children }: { children: string }) {
  return <h2 className="mb-3 mt-8 border-b border-neutral-300 pb-1.5 text-lg font-bold">{children}</h2>;
}

export default async function ResumePage() {
  const [{ profile }, experiences, projects, groups] = await Promise.all([
    getSiteData(),
    getExperiences(),
    getProjects(),
    getSkillGroups(),
  ]);
  const work = experiences.filter((e) => e.kind === "work");
  const edu = experiences.filter((e) => e.kind === "education");
  // 简历的"项目经历"只放个人项目（个人独立 / AI 辅助），工作类项目已在工作经历里
  const own = projects.filter((p) => p.kinds.includes("solo") || p.kinds.includes("ai"));
  const meta = [
    profile.experienceYears && `${profile.experienceYears}工作经验`,
    profile.intention && `求职意向：${profile.intention}`,
    profile.showSalary && profile.salary && `期望薪资：${profile.salary}`,
    profile.location && `期望城市：${profile.location}`,
  ].filter(Boolean);

  return (
    <div className="container-page py-8">
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          本页由网站数据自动生成。手机号需先点击「点击查看」再打印。
        </p>
        <div className="flex gap-3">
          <Link href="/about" className="btn">
            返回
          </Link>
          <PrintButton />
        </div>
      </div>

      <article className="paper mx-auto max-w-[210mm] rounded-xl p-8 text-[14px] leading-relaxed shadow-2xl sm:p-12">
        <header className="text-center">
          <h1 className="text-3xl font-bold tracking-wide">{profile.name}</h1>
          {meta.length > 0 && <p className="mt-2 text-neutral-600">{meta.join(" | ")}</p>}
          {profile.contacts.length > 0 && (
            <div className="mx-auto mt-3 max-w-sm text-left">
              <ContactList items={profile.contacts} tone="light" />
            </div>
          )}
        </header>

        {profile.strengths.length > 0 && (
          <>
            <H>个人优势</H>
            <ul className="list-disc space-y-1 pl-5">
              {profile.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </>
        )}

        {groups.length > 0 && (
          <>
            <H>专业技能</H>
            <div className="space-y-3">
              {groups.map((g) => (
                <div key={g.id}>
                  <p className="font-semibold">{g.name}</p>
                  <ul className="list-disc pl-5">
                    {g.items.map((it, i) => (
                      <li key={i}>
                        {it.name}
                        {it.level && `（${LEVEL_LABEL[it.level]}）`}
                        {it.note && `：${it.note}`}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {work.length > 0 && (
          <>
            <H>工作经历</H>
            <div className="space-y-5">
              {work.map((e) => (
                <section key={e.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <strong className="text-base">{e.org}</strong>
                      {e.title && <span className="ml-3 text-neutral-600">{e.title}</span>}
                    </p>
                    <span className="text-neutral-500">{formatPeriod(e.periodStart, e.periodEnd)}</span>
                  </div>
                  <ul className="mt-1 list-disc pl-5">
                    {e.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </>
        )}

        {own.length > 0 && (
          <>
            <H>项目经历</H>
            <div className="space-y-5">
              {own.map((p) => (
                <section key={p.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <strong className="text-base">{p.title}</strong>
                      {p.role && <span className="ml-3 text-neutral-600">{p.role}</span>}
                    </p>
                    <span className="text-neutral-500">{formatPeriod(p.periodStart, p.periodEnd)}</span>
                  </div>
                  {p.content.responsibilities.trim() ? (
                    <Markdown source={p.content.responsibilities} className="mt-1" />
                  ) : (
                    p.summary && <p className="mt-1">{p.summary}</p>
                  )}
                </section>
              ))}
            </div>
          </>
        )}

        {edu.length > 0 && (
          <>
            <H>教育经历</H>
            <div className="space-y-4">
              {edu.map((e) => (
                <section key={e.id} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p>
                      <strong className="text-base">{e.org}</strong>
                      <span className="ml-3 text-neutral-600">
                        {[e.extra, e.title].filter(Boolean).join("  ")}
                      </span>
                    </p>
                    <span className="text-neutral-500">{formatPeriod(e.periodStart, e.periodEnd)}</span>
                  </div>
                  {e.bullets.length > 0 && (
                    <ul className="mt-1 list-disc pl-5">
                      {e.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </section>
              ))}
            </div>
          </>
        )}

        {profile.certificates.length > 0 && (
          <>
            <H>资格证书</H>
            <p>{profile.certificates.join("　")}</p>
          </>
        )}
      </article>
    </div>
  );
}
