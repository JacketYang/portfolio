import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, adminRoute } from "@/lib/api";

export const dynamic = "force-dynamic";

export function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return adminRoute(req, true, async () => {
    const { id } = await ctx.params;
    if (!/^m_[a-f0-9]{24}$/.test(id)) throw new HttpError(404, "未找到");
    const rows = await db.delete(media).where(eq(media.id, id)).returning({ id: media.id });
    if (!rows.length) throw new HttpError(404, "未找到");
    return { ok: true };
  });
}
