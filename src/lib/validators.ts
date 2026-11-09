import { z } from "zod";
import {
  CONTACT_TYPES,
  HEX_COLOR,
  ID_PATTERN,
  KIND_KEYS,
  LEVEL_KEYS,
  STATUS_KEYS,
} from "./constants";
import { isSafeImage, isSafeUrl } from "./safe";

// ---- 基础类型 ----
const str = (max: number) => z.string().trim().max(max, `最多 ${max} 个字符`);
const text = (max: number) => z.string().max(max, `最多 ${max} 个字符`);
const linkUrl = z
  .string()
  .max(600, "链接过长")
  .refine((v) => v === "" || isSafeUrl(v), "链接必须以 http(s)://、mailto: 或 / 开头");
const imgUrl = z
  .string()
  .max(600, "图片地址过长")
  .refine((v) => v === "" || isSafeImage(v), "图片地址必须以 http(s):// 或 / 开头");
const idSchema = z
  .string()
  .regex(ID_PATTERN, "只能包含字母、数字、连字符和下划线（最长 79 位）");
const hex = z.string().regex(HEX_COLOR, "颜色格式应为 #rrggbb");
const period = str(20);

// ---- 子结构 ----
const metric = z.object({
  label: str(60).min(1, "指标名称不能为空"),
  value: str(60),
  note: str(120),
});
const link = z.object({
  label: str(60).min(1, "链接名称不能为空"),
  url: linkUrl.min(1, "链接地址不能为空"),
});
const galleryItem = z.object({
  src: imgUrl.min(1, "图片地址不能为空"),
  caption: str(200),
  isStock: z.boolean(),
});
const step = z.object({ title: str(80).min(1, "步骤标题不能为空"), desc: str(300) });

// ---- 资源：base 无默认值（便于做 partial 更新），defaults 用于创建时补全 ----
export const projectBase = z.object({
  id: idSchema.optional(),
  title: str(120).min(1, "项目名称不能为空"),
  categoryId: str(80),
  summary: str(600),
  description: text(8000),
  status: z.enum(STATUS_KEYS),
  kinds: z.array(z.enum(KIND_KEYS)).max(5),
  cover: imgUrl,
  coverIsStock: z.boolean(),
  gallery: z.array(galleryItem).max(30),
  role: str(120),
  tools: z.array(str(40).min(1)).max(40),
  content: z.object({
    background: text(8000),
    goals: text(8000),
    responsibilities: text(8000),
    problems: text(8000),
    process: text(8000),
    steps: z.array(step).max(20),
    techSolution: text(8000),
    deliverables: text(8000),
    summary: text(8000),
  }),
  achievements: z.array(metric).max(12),
  links: z.array(link).max(12),
  qrcode: imgUrl,
  demoVideo: linkUrl,
  periodStart: period,
  periodEnd: period,
  featured: z.boolean(),
  visible: z.boolean(),
});

export const categoryBase = z.object({
  id: idSchema.optional(),
  name: str(40).min(1, "分类名称不能为空"),
  description: str(300),
  color: hex,
  visible: z.boolean(),
});

export const experienceBase = z.object({
  id: idSchema.optional(),
  kind: z.enum(["work", "education"]),
  org: str(120).min(1, "单位 / 学校不能为空"),
  title: str(120),
  extra: str(80),
  periodStart: period,
  periodEnd: period,
  summary: str(600),
  bullets: z.array(str(500).min(1)).max(30),
  visible: z.boolean(),
});

export const skillBase = z.object({
  id: idSchema.optional(),
  name: str(60).min(1, "分组名称不能为空"),
  description: str(300),
  items: z
    .array(
      z.object({
        name: str(80).min(1, "技能名称不能为空"),
        level: z.enum(LEVEL_KEYS),
        note: str(200),
      }),
    )
    .max(40),
  visible: z.boolean(),
});

export const logBase = z.object({
  id: idSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式应为 YYYY-MM-DD"),
  title: str(120).min(1, "标题不能为空"),
  body: text(8000),
  projectId: str(80),
  visible: z.boolean(),
});

const EMPTY_CONTENT = {
  background: "",
  goals: "",
  responsibilities: "",
  problems: "",
  process: "",
  steps: [],
  techSolution: "",
  deliverables: "",
  summary: "",
};

export const DEFAULTS: Record<string, Record<string, unknown>> = {
  projects: {
    categoryId: "",
    summary: "",
    description: "",
    status: "developing",
    kinds: [],
    cover: "",
    coverIsStock: false,
    gallery: [],
    role: "",
    tools: [],
    content: EMPTY_CONTENT,
    achievements: [],
    links: [],
    qrcode: "",
    demoVideo: "",
    periodStart: "",
    periodEnd: "",
    featured: false,
    visible: true,
  },
  categories: { description: "", color: "#5eead4", visible: true },
  experiences: {
    kind: "work",
    title: "",
    extra: "",
    periodStart: "",
    periodEnd: "",
    summary: "",
    bullets: [],
    visible: true,
  },
  skills: { description: "", items: [], visible: true },
  logs: { body: "", projectId: "", visible: true },
};

// ---- 单例文档：个人信息 / 站点设置 ----
const contact = z
  .object({
    type: z.enum(CONTACT_TYPES),
    label: str(30).min(1, "联系方式名称不能为空"),
    value: str(200),
    qrcode: imgUrl.optional().default(""),
    reveal: z.boolean(),
    visible: z.boolean(),
  })
  .superRefine((c, ctx) => {
    if (c.type === "link" && c.value && !isSafeUrl(c.value)) {
      ctx.addIssue({ code: "custom", message: "链接必须以 http(s):// 开头", path: ["value"] });
    }
  });

export const profileSchema = z.object({
  name: str(40).min(1, "姓名不能为空"),
  englishName: str(60),
  headline: str(120),
  tagline: str(200),
  intro: text(2000),
  about: text(8000),
  avatar: imgUrl,
  logo: imgUrl,
  location: str(40),
  intention: str(120),
  experienceYears: str(20),
  salary: str(40),
  showSalary: z.boolean(),
  resumeUrl: linkUrl,
  highlights: z.array(metric).max(8),
  contacts: z.array(contact).max(12),
  certificates: z.array(str(80).min(1)).max(30),
  strengths: z.array(str(500).min(1)).max(10),
});

export const siteSchema = z.object({
  title: str(80).min(1, "站点标题不能为空"),
  description: str(300),
  siteUrl: z
    .string()
    .max(200)
    .refine((v) => v === "" || /^https?:\/\/[^\s/]+\/?$/.test(v), "格式应为 https://example.com"),
  accent: hex,
  icon: imgUrl,
  footerText: str(200),
  icp: str(80),
  showLog: z.boolean(),
  featuredLimit: z.number().int().min(1).max(12),
  sections: z.object({
    capabilities: z.boolean(),
    featured: z.boolean(),
    ongoing: z.boolean(),
    timeline: z.boolean(),
    logs: z.boolean(),
  }),
});

export type DocName = "profile" | "site";
export const DOC_SCHEMAS = { profile: profileSchema, site: siteSchema } as const;
