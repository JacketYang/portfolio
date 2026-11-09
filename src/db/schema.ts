import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import type {
  GalleryItem,
  KindKey,
  LinkItem,
  Metric,
  ProjectContent,
  SkillItem,
} from "@/lib/types";

// 注意：src/db/ddl.ts 里有一份等价的 "create table if not exists" 语句，
// 用于首次访问时自动建表。修改本文件的表结构时，请同步修改 ddl.ts。

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

/** 键值设置：profile（个人信息）、site（站点设置）、seeded（初始化标记） */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
  updatedAt: updatedAt(),
});

export const categories = pgTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("#5eead4"),
  sort: integer("sort").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    categoryId: text("category_id").notNull().default(""),
    summary: text("summary").notNull().default(""),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("developing"),
    kinds: jsonb("kinds").$type<KindKey[]>().notNull().default([]),
    cover: text("cover").notNull().default(""),
    coverIsStock: boolean("cover_is_stock").notNull().default(false),
    gallery: jsonb("gallery").$type<GalleryItem[]>().notNull().default([]),
    role: text("role").notNull().default(""),
    tools: jsonb("tools").$type<string[]>().notNull().default([]),
    content: jsonb("content").$type<ProjectContent>().notNull(),
    achievements: jsonb("achievements").$type<Metric[]>().notNull().default([]),
    links: jsonb("links").$type<LinkItem[]>().notNull().default([]),
    qrcode: text("qrcode").notNull().default(""),
    demoVideo: text("demo_video").notNull().default(""),
    periodStart: text("period_start").notNull().default(""),
    periodEnd: text("period_end").notNull().default(""),
    featured: boolean("featured").notNull().default(false),
    visible: boolean("visible").notNull().default(true),
    sort: integer("sort").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("projects_sort_idx").on(t.sort)],
);

export const experiences = pgTable("experiences", {
  id: text("id").primaryKey(),
  kind: text("kind").notNull().default("work"),
  org: text("org").notNull(),
  title: text("title").notNull().default(""),
  extra: text("extra").notNull().default(""),
  periodStart: text("period_start").notNull().default(""),
  periodEnd: text("period_end").notNull().default(""),
  summary: text("summary").notNull().default(""),
  bullets: jsonb("bullets").$type<string[]>().notNull().default([]),
  visible: boolean("visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const skillGroups = pgTable("skill_groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  items: jsonb("items").$type<SkillItem[]>().notNull().default([]),
  visible: boolean("visible").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const logs = pgTable("logs", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  projectId: text("project_id").notNull().default(""),
  visible: boolean("visible").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/** 上传的图片（base64 文本）。放在数据库里，迁移/备份只需要带走数据库。 */
export const media = pgTable("media", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  mime: text("mime").notNull(),
  size: integer("size").notNull().default(0),
  data: text("data").notNull(),
  createdAt: createdAt(),
});
