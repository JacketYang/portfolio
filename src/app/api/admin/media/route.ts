import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, adminRoute } from "@/lib/api";
import { ensureReady } from "@/lib/seed";

export const dynamic = "force-dynamic";

const MAX_BYTES = 3 * 1024 * 1024;

/** 通过文件头判断真实类型，不信任客户端声明的 MIME；不接受 SVG（可携带脚本）。 */
function sniff(b: Buffer): string | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return "image/png";
  }
  if (b.subarray(0, 4).toString("ascii") === "GIF8") return "image/gif";
  if (b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP") {
    return "image/webp";
  }
  return null;
}

export function GET(req: Request) {
  return adminRoute(req, false, async () => {
    await ensureReady();
    const rows = await db
      .select({
        id: media.id,
        name: media.name,
        mime: media.mime,
        size: media.size,
        createdAt: media.createdAt,
      })
      .from(media)
      .orderBy(desc(media.createdAt));
    return rows.map((r) => ({ ...r, url: `/api/media/${r.id}`, createdAt: r.createdAt.toISOString() }));
  });
}

export function POST(req: Request) {
  return adminRoute(req, true, async () => {
    await ensureReady();
    const len = Number(req.headers.get("content-length") ?? "0");
    if (len > MAX_BYTES + 200_000) throw new HttpError(413, "图片过大（压缩后需小于 3MB）");
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "未收到图片文件");
    if (file.size > MAX_BYTES) throw new HttpError(413, "图片过大（压缩后需小于 3MB）");
    const buf = Buffer.from(await file.arrayBuffer());
    const mime = sniff(buf);
    if (!mime) throw new HttpError(400, "仅支持 JPG / PNG / WebP / GIF 图片");
    const id = `m_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const rawName = typeof form.get("name") === "string" ? (form.get("name") as string) : file.name;
    const name = rawName.replace(/[\u0000-\u001f<>]/g, "").slice(0, 120);
    await db.insert(media).values({
      id,
      name,
      mime,
      size: buf.length,
      data: buf.toString("base64"),
    });
    return { id, name, mime, size: buf.length, url: `/api/media/${id}` };
  });
}
