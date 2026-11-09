import { HttpError, adminRoute, readJson } from "@/lib/api";
import { createResource, isResourceName, listResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string }> };

async function name(ctx: Ctx) {
  const { resource } = await ctx.params;
  if (!isResourceName(resource)) throw new HttpError(404, "未知的内容类型");
  return resource;
}

export function GET(req: Request, ctx: Ctx) {
  return adminRoute(req, false, async () => listResource(await name(ctx)));
}

export function POST(req: Request, ctx: Ctx) {
  return adminRoute(req, true, async () => createResource(await name(ctx), await readJson(req)));
}
