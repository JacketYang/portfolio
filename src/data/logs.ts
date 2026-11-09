import type { LogEntry } from "@/lib/types";

// 成长日志（初始数据）。上线后在后台「成长日志」里新增，随时记录新项目、新学习。
const today = new Date().toISOString().slice(0, 10);

export const seedLogs: LogEntry[] = [
  {
    id: "log-launch",
    date: today,
    title: "展厅上线：把简历之外的项目和过程沉淀下来",
    body:
      "这个站点用来持续记录我做过的项目，而不只是一份静态简历。\n\n- 每个项目都标注真实性类型：真实经历、个人独立项目、参与项目、AI 辅助开发、概念验证。\n- 没有数据支撑的指标不展示；暂时没有截图的项目使用通用图库图片，并标注「示意配图」。\n- 之后每次完成新项目或学到新东西，都会在这里更新。",
    projectId: "this-site",
    visible: true,
  },
];
