import type { Category } from "@/lib/types";

// 项目分类（初始数据）。上线后在后台「分类」里增删改，无需改这个文件。
const base: Omit<Category, "sort">[] = [
  {
    id: "digital-marketing",
    name: "数字营销",
    description: "广告投放、账户管理、数据复盘与公众号内容运营。",
    color: "#fb923c",
    visible: true,
  },
  {
    id: "education",
    name: "教育与课程",
    description: "职业技能题库、课件与配套资料的体系化整理，以及招生报名项目执行。",
    color: "#818cf8",
    visible: true,
  },
  {
    id: "miniprogram",
    name: "小程序开发",
    description: "从需求分析到审核上线的微信小程序独立开发。",
    color: "#5eead4",
    visible: true,
  },
  {
    id: "ai",
    name: "AI 应用",
    description: "用大语言模型与 AI 编程工具完成需求拆解、开发、测试与资料处理。",
    color: "#c084fc",
    visible: true,
  },
  {
    id: "lab",
    name: "技术实验",
    description: "校园技术实践、自建站点与进行中的个人技术实验。",
    color: "#fbbf24",
    visible: true,
  },
];

export const seedCategories: Category[] = base.map((c, i) => ({ ...c, sort: (i + 1) * 10 }));
