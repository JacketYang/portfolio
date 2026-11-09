import { HttpError, adminRoute, readJson } from "@/lib/api";
import { isResourceName, moveResource } from "@/lib/resources";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ resource: string; id: string }> };

export function POST(req: Request, ctx: Ctx) {
  return adminRoute(req, true, async () => {
    const { resource, id } = await ctx.params;
    if (!isResourceName(resource)) throw new HttpError(404, "未知的内容类型");
    const body = (await readJson(req, 1000)) as { dir?: unknown };
    if (body?.dir !== "up" && body?.dir !== "down") throw new HttpError(400, "参数错误");
    return moveResource(resource, id, body.dir);
  });
}
