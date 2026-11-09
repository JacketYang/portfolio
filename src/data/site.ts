import type { SiteSettings } from "@/lib/types";

export const defaultSite: SiteSettings = {
  title: "杨冰华 · 个人项目展厅",
  description:
    "数字营销、职业教育、微信小程序与 AI 应用实践的个人项目展厅与数字档案。每个项目只呈现真实做过的工作。",
  siteUrl: "",
  accent: "#5eead4",
  footerText: "内容持续更新中。图片标注「示意配图」的为通用图库图片，并非工作现场实拍。",
  icp: "",
  showLog: true,
  featuredLimit: 6,
  sections: {
    capabilities: true,
    featured: true,
    ongoing: true,
    timeline: true,
    logs: true,
  },
};
