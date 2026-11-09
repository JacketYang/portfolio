import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { DDL_STATEMENTS } from "@/db/ddl";
import {
  categories,
  experiences,
  logs,
  projects,
  settings,
  skillGroups,
} from "@/db/schema";
import { seedCategories } from "@/data/categories";
import { seedExperiences } from "@/data/experience";
import { seedLogs } from "@/data/logs";
import { defaultProfile } from "@/data/profile";
import { seedProjects } from "@/data/projects";
import { defaultSite } from "@/data/site";
import { seedSkillGroups } from "@/data/skills";

// 首次访问时：缺表则自动建表；"seeded" 标记不存在则写入 src/data 里的初始内容。
// 之后即使你在后台删光内容，也不会再被自动写回。

function errCode(e: unknown): string | undefined {
  const x = e as { code?: string; cause?: { code?: string } };
  return x?.code ?? x?.cause?.code;
}

export async function createTables() {
  for (const statement of DDL_STATEMENTS) {
    try {
      await db.execute(sql.raw(statement));
    } catch (e) {
      // 并发首次访问时可能出现"已存在"类错误，忽略即可
      if (!["23505", "42P07", "42710"].includes(errCode(e) ?? "")) throw e;
    }
  }
}

async function seedAll() {
  await db.insert(categories).values(seedCategories).onConflictDoNothing();
  await db
    .insert(projects)
    .values(seedProjects.map(({ createdAt: _c, updatedAt: _u, ...rest }) => rest))
    .onConflictDoNothing();
  await db.insert(experiences).values(seedExperiences).onConflictDoNothing();
  await db.insert(skillGroups).values(seedSkillGroups).onConflictDoNothing();
  await db.insert(logs).values(seedLogs).onConflictDoNothing();
  await db
    .insert(settings)
    .values([
      { key: "profile", value: defaultProfile },
      { key: "site", value: defaultSite },
    ])
    .onConflictDoNothing();
}

let ready = false;

export async function ensureReady(): Promise<void> {
  if (ready) return;
  let seeded: unknown[];
  try {
    seeded = await db
      .select({ key: settings.key })
      .from(settings)
      .where(eq(settings.key, "seeded"))
      .limit(1);
  } catch (e) {
    if (errCode(e) === "42P01") {
      await createTables();
      seeded = [];
    } else {
      throw e;
    }
  }
  if (seeded.length === 0) {
    await seedAll();
    await db
      .insert(settings)
      .values({ key: "seeded", value: true })
      .onConflictDoNothing();
  }
  ready = true;
}
