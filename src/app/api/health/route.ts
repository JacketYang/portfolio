import { db } from "@/db";
import { ensureReady } from "@/lib/seed";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
  // 顺便完成首次初始化（建表 + 写入初始内容）；失败不影响健康检查，页面会回退到内置数据
  let content = true;
  try {
    await ensureReady();
  } catch (e) {
    content = false;
    console.error("[health] 初始化失败：", e instanceof Error ? e.message : e);
  }
  return Response.json({ ok: true, content });
}
