import { eq } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";
import { ensureReady } from "@/lib/seed";

export const dynamic = "force-dynamic";

const NOT_FOUND = () => new Response("Not found", { status: 404 });

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^m_[a-f0-9]{24}$/.test(id)) return NOT_FOUND();
  try {
    await ensureReady();
    const rows = await db
      .select({ mime: media.mime, data: media.data })
      .from(media)
      .where(eq(media.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return NOT_FOUND();
    const bytes = new Uint8Array(Buffer.from(row.data, "base64"));
    return new Response(bytes, {
      headers: {
        "Content-Type": row.mime,
        "Content-Length": String(bytes.byteLength),
        // 媒体 id 随机且内容不可变，可长期缓存
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
        "Content-Disposition": "inline",
      },
    });
  } catch (e) {
    console.error("[media] read failed:", e instanceof Error ? e.message : e);
    return new Response("Server error", { status: 500 });
  }
}
