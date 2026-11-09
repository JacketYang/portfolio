import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, errorResponse } from "@/lib/api";
import { isAdmin } from "@/lib/auth";
import { getRawDocs } from "@/lib/content";
import { listResource } from "@/lib/resources";
import { ensureReady } from "@/lib/seed";

export const dynamic = "force-dynamic";

// 导出全部内容为 JSON 备份。加 ?media=1 会连同上传的图片一起导出。
export async function GET(req: Request) {
  try {
    if (!(await isAdmin())) throw new HttpError(401, "未登录或会话已过期，请重新登录");
    await ensureReady();
    const withMedia = new URL(req.url).searchParams.get("media") === "1";
    const [docs, categories, projects, experiences, skills, logs] = await Promise.all([
      getRawDocs(),
      listResource("categories"),
      listResource("projects"),
      listResource("experiences"),
      listResource("skills"),
      listResource("logs"),
    ]);
    const data: Record<string, unknown> = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: { profile: docs.profile, site: docs.site },
      categories,
      projects,
      experiences,
      skills,
      logs,
    };
    if (withMedia) {
      data.media = (await db.select().from(media)).map((m) => ({
        id: m.id,
        name: m.name,
        mime: m.mime,
        data: m.data,
      }));
    }
    const day = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="site-backup-${day}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
