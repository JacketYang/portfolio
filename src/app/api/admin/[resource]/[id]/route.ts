import { HttpError, adminRoute, readJson } from "@/lib/api";
import { deleteResource, isResourceName, updateResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function target(ctx: Ctx) {
  const { resource, id } = await ctx.params;
  if (!isResourceName(resource)) throw new HttpError(404, "未知的内容类型");
  return { resource, id };
}

export function PUT(req: Request, ctx: Ctx) {
  return adminRoute(req, true, async () => {
    const { resource, id } = await target(ctx);
    return updateResource(resource, id, await readJson(req));
  });
}

export function DELETE(req: Request, ctx: Ctx) {
  return adminRoute(req, true, async () => {
    const { resource, id } = await target(ctx);
    return deleteResource(resource, id);
  });
}
