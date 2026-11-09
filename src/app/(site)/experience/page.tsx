import type { Metadata } from "next";
import { CareerChart } from "@/components/site/CareerChart";
import { PageHeader, SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { Skills } from "@/components/site/Skills";
import { Timeline } from "@/components/site/Timeline";
import { getExperiences, getSiteData, getSkillGroups } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "经历与技能",
  description: "职业经历、教育背景、技能与证书。",
};

export default async function ExperiencePage() {
  const [{ profile }, experiences, groups] = await Promise.all([
    getSiteData(),
    getExperiences(),
    getSkillGroups(),
  ]);
  const work = experiences.filter((e) => e.kind === "work");
  const edu = experiences.filter((e) => e.kind === "education");

  return (
    <>
      <PageHeader
        eyebrow="Experience & Skills"
        title="经历与技能"
        desc="职业经历按时间倒序排列；技能熟练度由我手动维护，只使用「了解 / 熟悉 / 熟练」三档，没有依据的不标注。"
      />

      {work.length > 0 && (
        <section className="section">
          <div className="container-page">
            <SectionHeading eyebrow="Career" title="职业经历" />
            <div className="space-y-8">
              <Reveal>
                <CareerChart items={work} />
              </Reveal>
              <Timeline items={work} />
            </div>
          </div>
        </section>
      )}

      {groups.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading eyebrow="Skills" title="专业技能" />
            <Skills groups={groups} />
          </div>
        </section>
      )}

      {profile.strengths.length > 0 && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading eyebrow="Strengths" title="个人优势" />
            <ul className="space-y-3">
              {profile.strengths.map((s, i) => (
                <li key={i} className="card flex gap-4 p-5 text-sm leading-relaxed text-muted">
                  <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, "0")}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {(edu.length > 0 || profile.certificates.length > 0) && (
        <section className="section !pt-0">
          <div className="container-page">
            <SectionHeading eyebrow="Education" title="教育与证书" />
            <div className="space-y-8">
              {edu.length > 0 && <Timeline items={edu} />}
              {profile.certificates.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {profile.certificates.map((c) => (
                    <li key={c} className="chip !px-3.5 !py-1.5 !text-sm">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
