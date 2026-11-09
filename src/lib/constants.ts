import type { ContactType, KindKey, LevelKey, StatusKey } from "./types";

export const STATUS_KEYS = ["online", "completed", "developing", "testing", "poc"] as const;
export const STATUS_META: Record<StatusKey, { label: string; color: string }> = {
  online: { label: "已上线", color: "#34d399" },
  completed: { label: "已完成", color: "#60a5fa" },
  developing: { label: "开发中", color: "#fbbf24" },
  testing: { label: "测试中", color: "#c084fc" },
  poc: { label: "概念验证", color: "#f472b6" },
};

// 真实性标签：严格区分真实经历 / 个人独立项目 / 参与项目 / AI 辅助开发 / 概念验证
export const KIND_KEYS = ["work", "solo", "participated", "ai", "poc"] as const;
export const KIND_LABEL: Record<KindKey, string> = {
  work: "真实经历",
  solo: "个人独立项目",
  participated: "参与项目",
  ai: "AI 辅助开发",
  poc: "概念验证",
};

export const LEVEL_KEYS = ["", "know", "familiar", "proficient"] as const;
export const LEVEL_LABEL: Record<LevelKey, string> = {
  "": "",
  know: "了解",
  familiar: "熟悉",
  proficient: "熟练",
};

export const CONTACT_TYPES = ["phone", "email", "wechat", "link"] as const;
export const CONTACT_LABEL: Record<ContactType, string> = {
  phone: "电话",
  email: "邮箱",
  wechat: "微信",
  link: "链接",
};

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
export const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,78}$/;
