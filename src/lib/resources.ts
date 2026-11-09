import { asc, count, desc, eq, sql } from "drizzle-orm";
import { ZodError, type z } from "zod";
import { db } from "@/db";
import { categories, experiences, logs, projects, skillGroups } from "@/db/schema";
import { HttpError } from "./api";
import { ensureReady } from "./seed";
import type {
  Category,
  Experience,
  LogEntry,
  Project,
  SkillGroup,
  StatusKey,
} from "./types";
import {
  DEFAULTS,
  categoryBase,
  experienceBase,
  logBase,
  projectBase,
  skillBase,
} from "./validators";

/* eslint-disable @typescript-eslint/no-explicit-any */

const iso = (d: Date | string) => (d instanceof Date ? d : new Date(d)).toISOString();

export const mapCategory = (r: typeof categories.$inferSelect): Category => ({
  id: r.id,
  name: r.name,
  description: r.description,
  color: r.color,
  sort: r.sort,
  visible: r.visible,
});

export const mapProject = (r: typeof projects.$inferSelect): Project => ({
  ...r,
  status: r.status as StatusKey,
  createdAt: iso(r.createdAt),
  updatedAt: iso(r.updatedAt),
});

export const mapExperience = (r: typeof experiences.$inferSelect): Experience => ({
  id: r.id,
  kind: r.kind === "education" ? "education" : "work",
  org: r.org,
  title: r.title,
  extra: r.extra,
  periodStart: r.periodStart,
  periodEnd: r.periodEnd,
  summary: r.summary,
  bullets: r.bullets,
  visible: r.visible,
  sort: r.sort,
});

export const mapSkill = (r: typeof skillGroups.$inferSelect): SkillGroup => ({
  id: r.id,
  name: r.name,
  description: r.description,
  items: r.items,
  visible: r.visible,
  sort: r.sort,
});

export const mapLog = (r: typeof logs.$inferSelect): LogEntry => ({
  id: r.id,
  date: r.date,
  title: r.title,
  body: r.body,
  projectId: r.projectId,
  visible: r.visible,
});

export type ResourceName = "projects" | "categories" | "experiences" | "skills" | "logs";

type Def = {
  table: any;
  base: z.ZodObject<any>;
  map: (row: any) => any;
  sorted: boolean;
  prefix: string;
};

export const RESOURCES: Record<ResourceName, Def> = {
  projects: { table: projects, base: projectBase, map: mapProject, sorted: true, prefix: "p" },
  categories: { table: categories, base: categoryBase, map: mapCategory, sorted: true, prefix: "c" },
  experiences: { table: experiences, base: experienceBase, map: mapExperience, sorted: true, prefix: "exp" },
  skills: { table: skillGroups, base: skillBase, map: mapSkill, sorted: true, prefix: "skill" },
  logs: { table: logs, base: logBase, map: mapLog, sorted: false, prefix: "log" },
};

export function isResourceName(s: string): s is ResourceName {
  return Object.prototype.hasOwnProperty.call(RESOURCES, s);
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const genId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;

export async function listResource(name: ResourceName) {
  await ensureReady();
  const d = RESOURCES[name];
  const t = d.table;
  const rows = await db
    .select()
    .from(t)
    .orderBy(...(d.sorted ? [asc(t.sort), asc(t.createdAt)] : [desc(t.date), desc(t.createdAt)]));
  return rows.map(d.map);
}

/** 校验并整理一条待写入数据（创建 / 导入共用）。 */
export function prepareRecord(name: ResourceName, input: unknown): Record<string, any> {
  const d = RESOURCES[name];
  const clean: Record<string, unknown> = {};
  if (isObj(input)) for (const [k, v] of Object.entries(input)) if (v !== undefined) clean[k] = v;
  return d.base.parse({ ...DEFAULTS[name], ...clean }) as Record<string, any>;
}

export async function createResource(name: ResourceName, input: unknown) {
  await ensureReady();
  const d = RESOURCES[name];
  const data = prepareRecord(name, input);
  const id: string = data.id ?? genId(d.prefix);
  delete data.id;

  const existing = await db.select({ id: d.table.id }).from(d.table).where(eq(d.table.id, id)).limit(1);
  if (existing.length) throw new HttpError(409, "该标识（ID）已存在，请换一个");

  const values: Record<string, any> = { ...data, id };
  if (d.sorted) {
    const res: any[] = await db
      .select({ m: sql<number>`coalesce(max(${d.table.sort}), 0)` })
      .from(d.table);
    values.sort = Number(res[0]?.m ?? 0) + 10;
  }
  const inserted: any[] = await (db.insert(d.table).values(values) as any).returning();
  return d.map(inserted[0]);
}

export async function updateResource(name: ResourceName, id: string, input: unknown) {
  await ensureReady();
  const d = RESOURCES[name];
  const patch = d.base.partial().parse(input) as Record<string, any>;
  delete patch.id;
  if (Object.keys(patch).length === 0) throw new HttpError(400, "没有可更新的字段");
  const updated: any[] = await (
    db
      .update(d.table)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(d.table.id, id)) as any
  ).returning();
  if (!updated[0]) throw new HttpError(404, "记录不存在");
  return d.map(updated[0]);
}

/** 导入：校验整批数据并保留 id / 排序 / 创建时间。 */
export function prepareImportRows(name: ResourceName, items: unknown[]): Record<string, any>[] {
  const d = RESOURCES[name];
  const seen = new Set<string>();
  return items.map((it, i) => {
    let data: Record<string, any>;
    try {
      data = prepareRecord(name, it);
    } catch (e) {
      const msg = e instanceof ZodError ? (e.issues[0]?.message ?? "格式错误") : "格式错误";
      const path = e instanceof ZodError ? e.issues[0]?.path.join(".") : "";
      throw new HttpError(400, `${name} 第 ${i + 1} 条数据无效：${path ? path + " " : ""}${msg}`);
    }
    const id: string = data.id ?? genId(d.prefix);
    if (seen.has(id)) throw new HttpError(400, `${name} 中存在重复的 id：${id}`);
    seen.add(id);
    const row: Record<string, any> = { ...data, id };
    const src = isObj(it) ? it : {};
    if (d.sorted) row.sort = typeof src.sort === "number" && Number.isFinite(src.sort) ? Math.trunc(src.sort) : (i + 1) * 10;
    if (typeof src.createdAt === "string" && !Number.isNaN(Date.parse(src.createdAt))) {
      row.createdAt = new Date(src.createdAt);
    }
    return row;
  });
}

export async function deleteResource(name: ResourceName, id: string) {
  await ensureReady();
  const d = RESOURCES[name];
  if (name === "categories") {
    const [r] = await db.select({ n: count() }).from(projects).where(eq(projects.categoryId, id));
    if ((r?.n ?? 0) > 0) {
      throw new HttpError(409, `该分类下还有 ${r.n} 个项目，请先把它们移到其他分类或删除`);
    }
  }
  const res = await db.delete(d.table).where(eq(d.table.id, id)).returning({ id: d.table.id });
  if (!res.length) throw new HttpError(404, "记录不存在");
  return { ok: true };
}

export async function moveResource(name: ResourceName, id: string, dir: "up" | "down") {
  await ensureReady();
  const d = RESOURCES[name];
  if (!d.sorted) throw new HttpError(400, "该内容不支持手动排序");
  const t = d.table;
  const rows: { id: string; sort: number }[] = await db
    .select({ id: t.id, sort: t.sort })
    .from(t)
    .orderBy(asc(t.sort), asc(t.createdAt));
  const i = rows.findIndex((r) => r.id === id);
  if (i < 0) throw new HttpError(404, "记录不存在");
  const j = dir === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= rows.length) return { ok: true };
  [rows[i], rows[j]] = [rows[j], rows[i]];
  for (let k = 0; k < rows.length; k++) {
    const target = (k + 1) * 10;
    if (rows[k].sort !== target) {
      await db.update(t).set({ sort: target }).where(eq(t.id, rows[k].id));
    }
  }
  return { ok: true };
}
