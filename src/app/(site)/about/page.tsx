import type { Metadata } from "next";
import Link from "next/link";
import { Markdown } from "@/components/Markdown";
import { ContactList } from "@/components/site/ContactList";
import { PageHeader } from "@/components/site/SectionHeading";
import { getExperiences, getSiteData } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "关于我与联系方式",
  description: "个人简介、工作经历概览、联系方式与简历下载。",
};

export default async function AboutPage() {
  const [{ profile }, experiences] = await Promise.all([getSiteData(), getExperiences()]);
  const work = experiences.filter((e) => e.kind === "work");
  const facts: [string, string][] = [
    ["求职意向", profile.intention],
    ["所在城市", profile.location],
    ["工作年限", profile.experienceYears],
    ...(profile.showSalary && profile.salary ? ([["期望薪资", profile.salary]] as [string, string][]) : []),
  ];

  return (
    <>
      <PageHeader eyebrow="About" title="关于我" desc={profile.headline} />
      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {profile.about ? (
              <Markdown source={profile.about} className="text-base leading-relaxed" />
            ) : (
              profile.intro && <p className="text-base leading-relaxed text-muted">{profile.intro}</p>
            )}

            {work.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold">工作经历概览</h2>
                <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
                  {work.map((e) => (
                    <li key={e.id} className="px-5 py-3.5 text-sm">
                      <span className="font-medium">{e.org}</span>
                      {e.title && <span className="ml-2 text-muted">{e.title}</span>}
                    </li>
                  ))}
                </ul>
                <Link href="/experience" className="mt-4 inline-block text-sm text-accent">
                  查看详细经历与技能 →
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <dl className="card divide-y divide-line">
              {facts
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-5 py-3.5 text-sm">
                    <dt className="text-faint">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
            </dl>

            <div id="contact" className="card scroll-mt-24 p-5">
              <h2 className="text-lg font-semibold">联系方式</h2>
              <p className="mt-1 text-xs text-faint">为避免被爬取，部分号码需点击后才会显示。</p>
              <div className="mt-3">
                {profile.contacts.length > 0 ? (
                  <ContactList items={profile.contacts} />
                ) : (
                  <p className="text-sm text-faint">暂未公开联系方式。</p>
                )}
              </div>
            </div>

            <div className="card p-5">
              <h2 className="text-lg font-semibold">简历</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/resume" className="btn btn-primary">
                  查看 / 打印简历
                </Link>
                {profile.resumeUrl && (
                  <a href={profile.resumeUrl} className="btn" target="_blank" rel="noopener noreferrer">
                    下载 PDF
                  </a>
                )}
              </div>
              <p className="mt-3 text-xs text-faint">简历页由网站数据自动生成，可直接用浏览器「打印 → 另存为 PDF」导出。</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
