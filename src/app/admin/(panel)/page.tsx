import Link from "next/link";
import { DataTools } from "@/components/admin/DataTools";
import { getRawDocs } from "@/lib/content";
import { requireAdmin } from "@/lib/guard";
import { listResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  let error = "";
  let counts = { projects: 0, categories: 0, experiences: 0, skills: 0, logs: 0 };
  let todo: { id: string; title: string; issues: string[] }[] = [];
  let hiddenCount = 0;
  let siteTitle = "";
  try {
    const [projects, categories, experiences, skills, logs, docs] = await Promise.all([
      listResource("projects"),
      listResource("categories"),
      listResource("experiences"),
      listResource("skills"),
      listResource("logs"),
      getRawDocs(),
    ]);
    counts = {
      projects: projects.length,
      categories: categories.length,
      experiences: experiences.length,
      skills: skills.length,
      logs: logs.length,
    };
    siteTitle = docs.site.title;
    hiddenCount = projects.filter((p) => !p.visible).length;
    todo = projects
      .map((p) => {
        const issues: string[] = [];
        if (!p.cover) issues.push("没有封面");
        else if (p.coverIsStock) issues.push("封面仍是示意配图");
        if (p.gallery.length === 0) issues.push("没有真实截图");
        if (!p.summary) issues.push("缺少简介");
        return { id: p.id, title: p.title, issues };
      })
      .filter((x) => x.issues.length > 0);
  } catch (e) {
    error = e instanceof Error ? e.message : "无法读取数据库";
  }

  const cards = [
    { href: "/admin/projects", label: "项目", n: counts.projects },
    { href: "/admin/categories", label: "分类", n: counts.categories },
    { href: "/admin/experiences", label: "经历与教育", n: counts.experiences },
    { href: "/admin/skills", label: "技能分组", n: counts.skills },
    { href: "/admin/logs", label: "成长日志", n: counts.logs },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">概览</h1>
        <p className="mt-1 text-sm text-muted">{siteTitle ? `${siteTitle} · ` : ""}在这里管理前台展示的所有内容。</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          数据库读取失败：{error}。前台目前显示的是内置数据，后台修改暂时无法保存。请检查 DATABASE_URL 配置。
        </p>
      )}

      <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <li key={c.href}>
            <Link href={c.href} className="card card-hover block p-4">
              <p className="text-2xl font-semibold">{c.n}</p>
              <p className="text-xs text-muted">{c.label}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="card p-5 sm:p-6">
        <h2 className="text-lg font-semibold">待完善的项目</h2>
        <p className="mt-1 text-sm text-muted">
          这些项目还在使用示意配图或缺少真实素材。补上真实截图后，前台会更有说服力。
          {hiddenCount > 0 && `（另有 ${hiddenCount} 个项目处于隐藏状态）`}
        </p>
        {todo.length === 0 ? (
          <p className="mt-4 text-sm text-accent">所有项目的素材都已完善。</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {todo.map((t) => (
              <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-faint">{t.issues.join(" · ")}</p>
                </div>
                <Link href={`/admin/projects?edit=${encodeURIComponent(t.id)}`} className="btn btn-sm">
                  去完善
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DataTools />

      <div className="card p-5 sm:p-6 text-sm text-muted">
        <h2 className="text-lg font-semibold text-fg">使用小贴士</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>「隐藏」只是不在前台显示，数据保留；「删除」不可恢复。</li>
          <li>项目详情里某个章节留空，前台就不会显示该章节，不会有占位文字。</li>
          <li>图片在浏览器端自动压缩后存入数据库；也可以直接填外部图片地址。</li>
          <li>电话等联系方式勾选「点击后才显示」，完整号码不会出现在网页源码里。</li>
          <li>改完内容刷新前台即可生效，无需重新部署。</li>
        </ul>
      </div>
    </div>
  );
}
