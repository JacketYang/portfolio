import { desc } from "drizzle-orm";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireAdmin } from "@/lib/guard";
import { ensureReady } from "@/lib/seed";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  await requireAdmin();
  let rows: { id: string; name: string; mime: string; size: number; url: string }[] = [];
  let error = "";
  try {
    await ensureReady();
    const list = await db
      .select({ id: media.id, name: media.name, mime: media.mime, size: media.size })
      .from(media)
      .orderBy(desc(media.createdAt));
    rows = list.map((r) => ({ ...r, url: `/api/media/${r.id}` }));
  } catch (e) {
    error = e instanceof Error ? e.message : "无法读取数据库";
  }
  return (
    <div>
      <h1 className="text-2xl font-semibold">媒体库</h1>
      <p className="mb-6 mt-1 text-sm text-muted">上传和管理图片。上传的图片存放在数据库里，随数据库一起备份和迁移。</p>
      {error ? (
        <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          数据库读取失败：{error}
        </p>
      ) : (
        <MediaLibrary initial={rows} />
      )}
    </div>
  );
}
