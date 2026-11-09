import { notFound } from "next/navigation";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { RESOURCE_CONFIG } from "@/components/admin/config";
import { requireAdmin } from "@/lib/guard";
import { isResourceName, listResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

export default async function ResourcePage({
  params,
  searchParams,
}: {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ edit?: string | string[] }>;
}) {
  await requireAdmin();
  const { resource } = await params;
  if (!isResourceName(resource)) notFound();
  const sp = await searchParams;
  const edit = Array.isArray(sp.edit) ? sp.edit[0] : sp.edit;
  const cfg = RESOURCE_CONFIG[resource];

  let items: unknown[] = [];
  let error = "";
  let categories: { value: string; label: string }[] = [];
  let projectOpts: { value: string; label: string }[] = [];
  try {
    items = await listResource(resource);
    if (resource === "projects") {
      categories = (await listResource("categories")).map((c) => ({ value: c.id, label: c.name }));
    }
    if (resource === "logs") {
      projectOpts = (await listResource("projects")).map((p) => ({ value: p.id, label: p.title }));
    }
  } catch (e) {
    error = e instanceof Error ? e.message : "无法读取数据库";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">{cfg.title}</h1>
      <p className="mb-6 mt-1 text-sm text-muted">{cfg.hint}</p>
      {error ? (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          数据库读取失败：{error}
        </p>
      ) : (
        <ResourceManager
          key={resource}
          resource={resource}
          initialItems={items as never[]}
          lookups={{ categories, projects: projectOpts }}
          openId={edit}
        />
      )}
    </div>
  );
}
