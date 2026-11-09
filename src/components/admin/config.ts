import { CONTACT_LABEL, KIND_KEYS, KIND_LABEL, LEVEL_LABEL, STATUS_KEYS, STATUS_META } from "@/lib/constants";
import { formatPeriod } from "@/lib/period";
import type { ResourceName } from "@/lib/resources";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Option = { value: string; label: string };

type Base = { key: string; label: string; help?: string; placeholder?: string; half?: boolean };

export type Field =
  | (Base & {
      type: "text" | "url" | "number" | "textarea" | "markdown" | "lines" | "tags" | "image" | "boolean" | "color";
      rows?: number;
      onlyNew?: boolean;
    })
  | (Base & { type: "select"; options?: Option[]; optionsFrom?: "categories" | "projects"; onlyNew?: boolean })
  | (Base & { type: "multicheck"; options: Option[] })
  | (Base & { type: "list"; addLabel: string; fields: Field[]; summaryKey?: string })
  | (Base & { type: "heading" });

const heading = (label: string, help?: string): Field => ({ type: "heading", key: `_h_${label}`, label, help });

const statusOptions: Option[] = STATUS_KEYS.map((k) => ({ value: k, label: STATUS_META[k].label }));
const kindOptions: Option[] = KIND_KEYS.map((k) => ({ value: k, label: KIND_LABEL[k] }));
const levelOptions: Option[] = [
  { value: "", label: "不标注" },
  ...(["know", "familiar", "proficient"] as const).map((k) => ({ value: k, label: LEVEL_LABEL[k] })),
];
const contactOptions: Option[] = (Object.keys(CONTACT_LABEL) as (keyof typeof CONTACT_LABEL)[]).map((k) => ({
  value: k,
  label: CONTACT_LABEL[k],
}));

export type ResourceConfig = {
  name: ResourceName;
  title: string;
  singular: string;
  hint: string;
  titleKey: string;
  fields: Field[];
  defaults: Record<string, unknown>;
  toggles: ("visible" | "featured")[];
  sortable: boolean;
  row: (item: any, lookups: { categories: Option[]; projects: Option[] }) => {
    title: string;
    sub?: string;
    thumb?: string;
    badges?: string[];
  };
};

const today = () => new Date().toISOString().slice(0, 10);

export const RESOURCE_CONFIG: Record<ResourceName, ResourceConfig> = {
  projects: {
    name: "projects",
    title: "项目",
    singular: "项目",
    hint: "项目展厅里的每一个作品。字段为空的章节在前台会自动隐藏，请只填写有真实依据的内容。",
    titleKey: "title",
    sortable: true,
    toggles: ["visible", "featured"],
    defaults: { status: "developing", visible: true, featured: false, "content.steps": [] },
    fields: [
      heading("基本信息"),
      {
        type: "text",
        key: "id",
        label: "网址标识（slug）",
        help: "项目链接为 /projects/标识。只能用字母、数字、连字符，例如 my-mini-app；留空会自动生成。创建后不可修改。",
        onlyNew: true,
        half: true,
      },
      { type: "text", key: "title", label: "项目名称", half: true },
      { type: "select", key: "categoryId", label: "所属分类", optionsFrom: "categories", half: true },
      { type: "select", key: "status", label: "当前状态", options: statusOptions, half: true },
      {
        type: "multicheck",
        key: "kinds",
        label: "真实性类型（可多选）",
        help: "严格区分：真实经历 / 个人独立项目 / 参与项目 / AI 辅助开发 / 概念验证。",
        options: kindOptions,
      },
      { type: "textarea", key: "summary", label: "一句话简介", rows: 3, help: "显示在卡片和分享预览里，建议 100 字以内。" },
      { type: "text", key: "role", label: "我的角色", half: true },
      { type: "text", key: "periodStart", label: "开始时间", placeholder: "2025.07", half: true },
      { type: "text", key: "periodEnd", label: "结束时间", placeholder: "2025.09 或 至今", half: true },
      { type: "boolean", key: "featured", label: "在首页精选展示" },
      { type: "boolean", key: "visible", label: "在前台显示（关闭 = 隐藏，不会删除）" },

      heading("封面与媒体"),
      { type: "image", key: "cover", label: "封面图" },
      {
        type: "boolean",
        key: "coverIsStock",
        label: "封面是通用图库图片（前台会标注「示意配图」）",
        help: "换成真实截图 / 现场图后请取消勾选。",
      },
      {
        type: "list",
        key: "gallery",
        label: "截图 / 图集",
        addLabel: "添加图片",
        summaryKey: "caption",
        fields: [
          { type: "image", key: "src", label: "图片" },
          { type: "text", key: "caption", label: "图片说明" },
          { type: "boolean", key: "isStock", label: "这是示意配图（非真实截图）" },
        ],
      },
      { type: "image", key: "qrcode", label: "二维码（小程序码 / 体验码）" },
      {
        type: "url",
        key: "demoVideo",
        label: "演示视频地址",
        placeholder: "/assets/demo.mp4 或 https://…",
        help: "直链 mp4 / webm 会直接播放，其他链接显示为「观看演示」按钮。",
      },

      heading("案例叙事（留空的章节前台自动隐藏）"),
      { type: "markdown", key: "description", label: "项目概述（可选）", rows: 4 },
      { type: "markdown", key: "content.background", label: "项目背景", rows: 4 },
      { type: "markdown", key: "content.goals", label: "项目目标", rows: 4 },
      { type: "markdown", key: "content.responsibilities", label: "实际承担的工作", rows: 5, help: "每行以 “- ” 开头会显示为列表。" },
      { type: "markdown", key: "content.problems", label: "解决的问题", rows: 4 },
      { type: "markdown", key: "content.process", label: "实施过程（文字）", rows: 4 },
      {
        type: "list",
        key: "content.steps",
        label: "实施流程图（步骤）",
        addLabel: "添加步骤",
        summaryKey: "title",
        fields: [
          { type: "text", key: "title", label: "步骤名称", half: true },
          { type: "text", key: "desc", label: "补充说明（可选）", half: true },
        ],
      },
      { type: "markdown", key: "content.techSolution", label: "技术方案", rows: 4 },
      { type: "tags", key: "tools", label: "使用工具 / 技术", placeholder: "输入后按回车添加" },
      { type: "markdown", key: "content.deliverables", label: "交付成果", rows: 4 },
      {
        type: "list",
        key: "achievements",
        label: "成果指标",
        addLabel: "添加指标",
        summaryKey: "label",
        help: "只填写真实、有依据的数据。值留空的指标不会显示。",
        fields: [
          { type: "text", key: "label", label: "指标名称", half: true },
          { type: "text", key: "value", label: "数值 / 描述", placeholder: "例如 50 万元以上", half: true },
          { type: "text", key: "note", label: "备注（可选）" },
        ],
      },
      { type: "markdown", key: "content.summary", label: "项目总结", rows: 4 },
      {
        type: "list",
        key: "links",
        label: "相关链接",
        addLabel: "添加链接",
        summaryKey: "label",
        fields: [
          { type: "text", key: "label", label: "按钮文字", half: true },
          { type: "url", key: "url", label: "链接地址", placeholder: "https://…", half: true },
        ],
      },
    ],
    row: (it, lk) => ({
      title: it.title,
      sub: [lk.categories.find((c) => c.value === it.categoryId)?.label, formatPeriod(it.periodStart, it.periodEnd)]
        .filter(Boolean)
        .join(" · "),
      thumb: it.cover,
      badges: [STATUS_META[it.status as keyof typeof STATUS_META]?.label ?? it.status, ...(it.featured ? ["首页精选"] : [])],
    }),
  },

  categories: {
    name: "categories",
    title: "分类",
    singular: "分类",
    hint: "项目的分类，同时也是首页的「核心能力方向」。删除分类前，需先把其下的项目移走。",
    titleKey: "name",
    sortable: true,
    toggles: ["visible"],
    defaults: { color: "#5eead4", visible: true },
    fields: [
      { type: "text", key: "id", label: "分类标识", help: "字母、数字、连字符；留空自动生成。创建后不可修改。", onlyNew: true, half: true },
      { type: "text", key: "name", label: "分类名称", half: true },
      { type: "textarea", key: "description", label: "分类说明", rows: 3 },
      { type: "color", key: "color", label: "标识颜色" },
      { type: "boolean", key: "visible", label: "在前台显示" },
    ],
    row: (it) => ({ title: it.name, sub: it.description }),
  },

  experiences: {
    name: "experiences",
    title: "经历与教育",
    singular: "经历",
    hint: "工作经历与教育经历。每条的要点一行一条。",
    titleKey: "org",
    sortable: true,
    toggles: ["visible"],
    defaults: { kind: "work", visible: true },
    fields: [
      {
        type: "select",
        key: "kind",
        label: "类型",
        options: [
          { value: "work", label: "工作经历" },
          { value: "education", label: "教育经历" },
        ],
        half: true,
      },
      { type: "text", key: "org", label: "单位 / 学校", half: true },
      { type: "text", key: "title", label: "职位 / 专业", half: true },
      { type: "text", key: "extra", label: "学历（教育经历填写，如 本科）", half: true },
      { type: "text", key: "periodStart", label: "开始时间", placeholder: "2021.05", half: true },
      { type: "text", key: "periodEnd", label: "结束时间", placeholder: "2023.03 或 至今", half: true },
      { type: "textarea", key: "summary", label: "概述（可选）", rows: 2 },
      { type: "lines", key: "bullets", label: "工作内容 / 要点（一行一条）", rows: 6 },
      { type: "boolean", key: "visible", label: "在前台显示" },
    ],
    row: (it) => ({
      title: it.org,
      sub: [it.title, formatPeriod(it.periodStart, it.periodEnd)].filter(Boolean).join(" · "),
      badges: [it.kind === "education" ? "教育" : "工作"],
    }),
  },

  skills: {
    name: "skills",
    title: "技能",
    singular: "技能分组",
    hint: "熟练度只有「了解 / 熟悉 / 熟练」三档，不要夸大；没有把握就选「不标注」。",
    titleKey: "name",
    sortable: true,
    toggles: ["visible"],
    defaults: { visible: true },
    fields: [
      { type: "text", key: "name", label: "分组名称" },
      { type: "textarea", key: "description", label: "分组说明（可选）", rows: 2 },
      {
        type: "list",
        key: "items",
        label: "技能条目",
        addLabel: "添加技能",
        summaryKey: "name",
        fields: [
          { type: "text", key: "name", label: "技能 / 工具名称" },
          { type: "select", key: "level", label: "熟练度", options: levelOptions, half: true },
          { type: "text", key: "note", label: "补充说明（可选）", half: true },
        ],
      },
      { type: "boolean", key: "visible", label: "在前台显示" },
    ],
    row: (it) => ({ title: it.name, sub: `${(it.items ?? []).length} 项技能` }),
  },

  logs: {
    name: "logs",
    title: "成长日志",
    singular: "日志",
    hint: "记录新项目、新学习、新进展。按日期倒序展示，不需要手动排序。",
    titleKey: "title",
    sortable: false,
    toggles: ["visible"],
    defaults: { date: today(), visible: true },
    fields: [
      { type: "text", key: "date", label: "日期", placeholder: "YYYY-MM-DD", half: true },
      { type: "select", key: "projectId", label: "关联项目（可选）", optionsFrom: "projects", half: true },
      { type: "text", key: "title", label: "标题" },
      { type: "markdown", key: "body", label: "正文", rows: 8 },
      { type: "boolean", key: "visible", label: "在前台显示" },
    ],
    row: (it) => ({ title: it.title, sub: it.date }),
  },
};

export const SETTINGS_CONFIG: Record<"profile" | "site", { title: string; hint: string; fields: Field[] }> = {
  profile: {
    title: "个人信息",
    hint: "首页、关于我、简历页的个人资料都来自这里。联系方式也只在这里维护。",
    fields: [
      heading("身份"),
      { type: "text", key: "name", label: "姓名", half: true },
      { type: "text", key: "englishName", label: "英文名（可选）", half: true },
      { type: "text", key: "headline", label: "职业定位", placeholder: "例如：信息化与项目服务 · 技术运营" },
      { type: "textarea", key: "tagline", label: "一句话主张", rows: 2 },
      { type: "textarea", key: "intro", label: "首页简短介绍", rows: 4 },
      { type: "markdown", key: "about", label: "关于我（详细介绍）", rows: 8 },
      heading("求职信息"),
      { type: "text", key: "intention", label: "求职意向", half: true },
      { type: "text", key: "location", label: "所在 / 期望城市", half: true },
      { type: "text", key: "experienceYears", label: "工作年限", placeholder: "10 年", half: true },
      { type: "text", key: "salary", label: "期望薪资", placeholder: "4-6K", half: true },
      { type: "boolean", key: "showSalary", label: "在前台公开期望薪资" },
      {
        type: "url",
        key: "resumeUrl",
        label: "PDF 简历链接（可选）",
        placeholder: "https://… 或 /assets/resume.pdf",
        help: "留空则只提供网站生成的可打印简历页。",
      },
      heading("首页关键数据", "只填写真实、可说明来源的数据；数值留空的条目不显示。"),
      {
        type: "list",
        key: "highlights",
        label: "关键数据",
        addLabel: "添加数据",
        summaryKey: "label",
        fields: [
          { type: "text", key: "label", label: "名称", half: true },
          { type: "text", key: "value", label: "数值", half: true },
          { type: "text", key: "note", label: "备注（可选）" },
        ],
      },
      heading("联系方式", "选择「点击后才显示」时，完整内容不会出现在页面源码里，可减少被爬取骚扰。"),
      {
        type: "list",
        key: "contacts",
        label: "联系方式",
        addLabel: "添加联系方式",
        summaryKey: "label",
        fields: [
          { type: "select", key: "type", label: "类型", options: contactOptions, half: true },
          { type: "text", key: "label", label: "显示名称", half: true },
          { type: "text", key: "value", label: "内容", placeholder: "号码 / 邮箱 / 微信号 / 链接" },
          { type: "boolean", key: "reveal", label: "点击后才显示完整内容" },
          { type: "boolean", key: "visible", label: "在前台显示" },
        ],
      },
      heading("个人优势与证书"),
      { type: "lines", key: "strengths", label: "个人优势（一行一条）", rows: 8 },
      { type: "lines", key: "certificates", label: "资格证书（一行一个）", rows: 5 },
    ],
  },
  site: {
    title: "站点设置",
    hint: "站点标题、SEO 描述、主题色、首页板块开关。修改后刷新前台即可看到。",
    fields: [
      { type: "text", key: "title", label: "站点标题" },
      { type: "textarea", key: "description", label: "站点描述（SEO / 分享）", rows: 3 },
      {
        type: "url",
        key: "siteUrl",
        label: "站点网址（可选）",
        placeholder: "https://example.com",
        help: "用于 sitemap 与分享预览；留空时自动按访问域名推断。",
      },
      { type: "color", key: "accent", label: "主题高亮色" },
      { type: "textarea", key: "footerText", label: "页脚说明", rows: 2 },
      { type: "text", key: "icp", label: "备案号（可选）" },
      heading("首页板块"),
      { type: "number", key: "featuredLimit", label: "首页精选项目最多显示数量", half: true },
      { type: "boolean", key: "showLog", label: "启用「成长日志」页面与导航" },
      { type: "boolean", key: "sections.capabilities", label: "显示「核心能力方向」" },
      { type: "boolean", key: "sections.featured", label: "显示「精选项目」" },
      { type: "boolean", key: "sections.ongoing", label: "显示「正在进行」" },
      { type: "boolean", key: "sections.timeline", label: "显示「职业经历」" },
      { type: "boolean", key: "sections.logs", label: "显示「最近更新」" },
    ],
  },
};
