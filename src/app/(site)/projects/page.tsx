import type { Metadata } from "next";
import { PageHeader } from "@/components/site/SectionHeading";
import { ProjectExplorer } from "@/components/site/ProjectExplorer";
import { getCategories, getProjects } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "项目展厅",
  description: "按方向分类的项目：数字营销、教育与课程、小程序开发、AI 应用、技术实验。",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const initial = Array.isArray(sp.c) ? sp.c[0] : (sp.c ?? "all");
  const [categories, projects] = await Promise.all([getCategories(), getProjects()]);

  return (
    <>
      <PageHeader
        eyebrow="Project Gallery"
        title="项目展厅"
        desc="每个项目都标注了真实性类型和当前状态。没有数据的指标不会展示，通用配图会标注「示意配图」。"
      />
      <section className="section">
        <div className="container-page">
          {projects.length === 0 ? (
            <p className="card p-10 text-center text-sm text-muted">暂时还没有公开的项目。</p>
          ) : (
            <ProjectExplorer projects={projects} categories={categories} initial={initial || "all"} />
          )}
        </div>
      </section>
    </>
  );
}
