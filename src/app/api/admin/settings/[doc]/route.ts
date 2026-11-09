import { db } from "@/db";
import { settings } from "@/db/schema";
import { HttpError, adminRoute, readJson } from "@/lib/api";
import { getRawDocs } from "@/lib/content";
import { ensureReady } from "@/lib/seed";
import { DOC_SCHEMAS, type DocName } from "@/lib/validators";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ doc: string }> };

async function docName(ctx: Ctx): Promise<DocName> {
  const { doc } = await ctx.params;
  if (doc !== "profile" && doc !== "site") throw new HttpError(404, "未知的设置类型");
  return doc;
}

export function GET(req: Request, ctx: Ctx) {
  return adminRoute(req, false, async () => {
    const doc = await docName(ctx);
    await ensureReady();
    return (await getRawDocs())[doc];
  });
}

export function PUT(req: Request, ctx: Ctx) {
  return adminRoute(req, true, async () => {
    const doc = await docName(ctx);
    await ensureReady();
    const patch = DOC_SCHEMAS[doc].partial().parse(await readJson(req));
    const next = { ...(await getRawDocs())[doc], ...patch };
    await db
      .insert(settings)
      .values({ key: doc, value: next })
      .onConflictDoUpdate({ target: settings.key, set: { value: next, updatedAt: new Date() } });
    return next;
  });
}
