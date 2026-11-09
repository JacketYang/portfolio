import { cache } from "react";
import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { categories, experiences, logs, projects, settings, skillGroups } from "@/db/schema";
import { seedCategories } from "@/data/categories";
import { seedExperiences } from "@/data/experience";
import { seedLogs } from "@/data/logs";
import { defaultProfile } from "@/data/profile";
import { seedProjects } from "@/data/projects";
import { defaultSite } from "@/data/site";
import { seedSkillGroups } from "@/data/skills";
import {
  mapCategory,
  mapExperience,
  mapLog,
  mapProject,
  mapSkill,
} from "./resources";
import { ensureReady } from "./seed";
import type {
  Category,
  Contact,
  Experience,
  LogEntry,
  Profile,
  Project,
  PublicProfile,
  SiteSettings,
  SkillGroup,
} from "./types";

// 前台统一数据入口：所有页面都从这里读取内容。
// 数据库不可用（未配置、断连、缺表且无法建表）时，自动回退到 src/data 的内置数据。

const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

async function guarded<T>(fn: () => Promise<T>, fallback: () => T): Promise<T> {
  try {
    await ensureReady();
    return await fn();
  } catch (e) {
    console.error("[content] 数据库不可用，已回退到内置数据：", errMsg(e));
    return fallback();
  }
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function mergeDoc<T extends object>(defaults: T, stored: unknown): T {
  if (!isObj(stored)) return defaults;
  const out: Record<string, unknown> = { ...(defaults as Record<string, unknown>) };
  for (const [k, v] of Object.entries(stored)) {
    const d = (defaults as Record<string, unknown>)[k];
    out[k] = isObj(d) && isObj(v) ? { ...d, ...v } : v;
  }
  return out as T;
}

function mask(c: Contact): string {
  const v = c.value;
  if (!c.reveal) return v;
  if (c.type === "phone") return v.length >= 7 ? `${v.slice(0, 3)}****${v.slice(-4)}` : "****";
  if (c.type === "email") {
    const [u, d] = v.split("@");
    return d ? `${u.slice(0, 1)}***@${d}` : "***";
  }
  return `${v.slice(0, 1)}***`;
}

export function toPublicProfile(p: Profile): PublicProfile {
  return {
    ...p,
    contacts: p.contacts
      .map((c, index) => ({ c, index }))
      .filter(({ c }) => c.visible && c.value)
      .map(({ c, index }) => ({
        index,
        type: c.type,
        label: c.label,
        display: mask(c),
        reveal: c.reveal,
      })),
  };
}

/** 原始（未脱敏）文档：仅供后台与"点击显示联系方式"接口使用。 */
export async function getRawDocs(): Promise<{ profile: Profile; site: SiteSettings }> {
  return guarded(
    async () => {
      const rows = await db
        .select()
        .from(settings)
        .where(inArray(settings.key, ["profile", "site"]));
      const map = new Map(rows.map((r) => [r.key, r.value]));
      return {
        profile: mergeDoc(defaultProfile, map.get("profile")),
        site: mergeDoc(defaultSite, map.get("site")),
      };
    },
    () => ({ profile: defaultProfile, site: defaultSite }),
  );
}

export const getSiteData = cache(
  async (): Promise<{ profile: PublicProfile; site: SiteSettings }> => {
    const { profile, site } = await getRawDocs();
    return { profile: toPublicProfile(profile), site };
  },
);

export const getCategories = cache(async (): Promise<Category[]> =>
  guarded(
    async () =>
      (
        await db
          .select()
          .from(categories)
          .where(eq(categories.visible, true))
          .orderBy(asc(categories.sort), asc(categories.createdAt))
      ).map(mapCategory),
    () => seedCategories.filter((c) => c.visible),
  ),
);

export const getProjects = cache(async (): Promise<Project[]> =>
  guarded(
    async () =>
      (
        await db
          .select()
          .from(projects)
          .where(eq(projects.visible, true))
          .orderBy(asc(projects.sort), asc(projects.createdAt))
      ).map(mapProject),
    () => seedProjects.filter((p) => p.visible),
  ),
);

export async function getProject(id: string): Promise<Project | undefined> {
  return (await getProjects()).find((p) => p.id === id);
}

export const getExperiences = cache(async (): Promise<Experience[]> =>
  guarded(
    async () =>
      (
        await db
          .select()
          .from(experiences)
          .where(eq(experiences.visible, true))
          .orderBy(asc(experiences.sort), asc(experiences.createdAt))
      ).map(mapExperience),
    () => seedExperiences.filter((e) => e.visible),
  ),
);

export const getSkillGroups = cache(async (): Promise<SkillGroup[]> =>
  guarded(
    async () =>
      (
        await db
          .select()
          .from(skillGroups)
          .where(eq(skillGroups.visible, true))
          .orderBy(asc(skillGroups.sort), asc(skillGroups.createdAt))
      ).map(mapSkill),
    () => seedSkillGroups.filter((g) => g.visible),
  ),
);

export const getLogs = cache(async (): Promise<LogEntry[]> =>
  guarded(
    async () =>
      (
        await db
          .select()
          .from(logs)
          .where(eq(logs.visible, true))
          .orderBy(desc(logs.date), desc(logs.createdAt))
      ).map(mapLog),
    () => seedLogs.filter((l) => l.visible),
  ),
);
