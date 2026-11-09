import { z } from "zod";
import { db } from "@/db";
import { categories, experiences, logs, media, projects, settings, skillGroups } from "@/db/schema";
import { HttpError, adminRoute, readJson } from "@/lib/api";
import { prepareImportRows } from "@/lib/resources";
import { ensureReady } from "@/lib/seed";
import { profileSchema, siteSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

const MAX_IMPORT = 25 * 1024 * 1024;

const payload = z.object({
  version: z.literal(1),
  settings: z
    .object({ profile: profileSchema.optional(), site: siteSchema.optional() })
    .optional(),
  categories: z.array(z.unknown()).max(200).optional(),
  projects: z.array(z.unknown()).max(500).optional(),
  experiences: z.array(z.unknown()).max(200).optional(),
  skills: z.array(z.unknown()).max(200).optional(),
  logs: z.array(z.unknown()).max(2000).optional(),
  media: z
    .array(
      z.object({
        id: z.string().regex(/^m_[a-f0-9]{24}$/),
        name: z.string().max(120),
        mime: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        data: z.string().max(5_000_000),
      }),
    )
    .max(300)
    .optional(),
});

// 导入 = 用备份文件"替换"其中包含的内容（没包含的部分保持不变）。整个过程在一个事务里，失败会整体回滚。
export function POST(req: Request) {
  return adminRoute(req, true, async () => {
    await ensureReady();
    const body = payload.parse(await readJson(req, MAX_IMPORT));

    const rows = {
      categories: body.categories && prepareImportRows("categories", body.categories),
      projects: body.projects && prepareImportRows("projects", body.projects),
      experiences: body.experiences && prepareImportRows("experiences", body.experiences),
      skills: body.skills && prepareImportRows("skills", body.skills),
      logs: body.logs && prepareImportRows("logs", body.logs),
    };
    if (body.media) {
      const ids = new Set(body.media.map((m) => m.id));
      if (ids.size !== body.media.length) throw new HttpError(400, "media 中存在重复的 id");
    }

    await db.transaction(async (tx) => {
      const chunked = async <T extends Record<string, unknown>>(
        run: (part: T[]) => Promise<unknown>,
        list: T[],
        size = 50,
      ) => {
        for (let i = 0; i < list.length; i += size) await run(list.slice(i, i + size));
      };

      if (rows.categories) {
        await tx.delete(categories);
        await chunked((p) => tx.insert(categories).values(p as never), rows.categories);
      }
      if (rows.projects) {
        await tx.delete(projects);
        await chunked((p) => tx.insert(projects).values(p as never), rows.projects);
      }
      if (rows.experiences) {
        await tx.delete(experiences);
        await chunked((p) => tx.insert(experiences).values(p as never), rows.experiences);
      }
      if (rows.skills) {
        await tx.delete(skillGroups);
        await chunked((p) => tx.insert(skillGroups).values(p as never), rows.skills);
      }
      if (rows.logs) {
        await tx.delete(logs);
        await chunked((p) => tx.insert(logs).values(p as never), rows.logs);
      }
      if (body.media) {
        await tx.delete(media);
        await chunked(
          (p) => tx.insert(media).values(p as never),
          body.media.map((m) => ({ ...m, size: Math.floor((m.data.length * 3) / 4) })),
          10,
        );
      }
      for (const key of ["profile", "site"] as const) {
        const value = body.settings?.[key];
        if (value) {
          await tx
            .insert(settings)
            .values({ key, value })
            .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
        }
      }
    });

    return {
      ok: true,
      counts: {
        categories: rows.categories?.length ?? null,
        projects: rows.projects?.length ?? null,
        experiences: rows.experiences?.length ?? null,
        skills: rows.skills?.length ?? null,
        logs: rows.logs?.length ?? null,
        media: body.media?.length ?? null,
      },
    };
  });
}
