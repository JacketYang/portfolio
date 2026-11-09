import type { SkillGroup } from "@/lib/types";

// 技能（初始数据）。熟练度只使用「了解 / 熟悉 / 熟练」三档，并按简历原有措辞填写；
// 没有明确依据的留空（前台不显示等级）。请在后台「技能」里按真实情况手动维护。
const raw: Omit<SkillGroup, "sort" | "visible">[] = [
  {
    id: "skill-it",
    name: "信息化应用与技术支持",
    description: "",
    items: [
      { name: "Windows 系统、办公设备及常见系统问题排查", level: "familiar", note: "" },
      { name: "微信公众号后台、小程序后台及相关业务系统日常管理", level: "", note: "具备日常管理和维护经验" },
      { name: "HTML / CSS / JavaScript / SQL", level: "know", note: "基础技术" },
      { name: "微信小程序开发及接口调试", level: "", note: "具备开发与调试实践" },
    ],
  },
  {
    id: "skill-ai",
    name: "AI 工具与应用",
    description: "",
    items: [
      { name: "Claude / GPT / DeepSeek / GLM / Qwen / Gemini", level: "", note: "使用过" },
      { name: "AI 辅助编程工作流", level: "familiar", note: "需求拆解、代码生成、功能修改、错误分析、测试迭代" },
      { name: "AI 用于资料整理与内容处理", level: "", note: "有实践经验" },
    ],
  },
  {
    id: "skill-pm",
    name: "项目执行与资料管理",
    description: "",
    items: [
      { name: "项目资料整理与业务需求梳理", level: "", note: "具备执行跟进及成果交付经验" },
      { name: "Office", level: "familiar", note: "结构化资料整理、数据处理、文档规范化" },
      { name: "Photoshop", level: "familiar", note: "" },
      { name: "项目协调与跨部门沟通", level: "", note: "含现场执行经验" },
    ],
  },
  {
    id: "skill-marketing",
    name: "数字营销与内容运营",
    description: "",
    items: [
      { name: "微信 / 抖音 / 快手广告投放及账户管理", level: "familiar", note: "" },
      { name: "公众号内容编辑与图文排版", level: "", note: "" },
      { name: "广告素材处理", level: "", note: "含基础视频剪辑" },
    ],
  },
];

export const seedSkillGroups: SkillGroup[] = raw.map((g, i) => ({
  ...g,
  visible: true,
  sort: (i + 1) * 10,
}));
