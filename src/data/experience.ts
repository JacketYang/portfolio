import type { Experience } from "@/lib/types";

type Seed = Omit<Experience, "sort" | "summary" | "extra" | "visible"> &
  Partial<Pick<Experience, "summary" | "extra" | "visible">>;

// 工作经历 + 教育经历（初始数据，逐字来自简历）。上线后在后台「经历与教育」里维护。
const raw: Seed[] = [
  {
    id: "exp-qianlv",
    kind: "work",
    org: "广西千铝工投教育科技发展有限公司",
    title: "课程开发",
    periodStart: "2025.07",
    periodEnd: "2025.09",
    bullets: [
      "负责国家职业技能鉴定题库、课件及细目表的开发与整理。",
      "完成 40 余个工种的资料结构梳理及内容规范化处理，使用 AI 工具辅助日常资料处理。",
      "参与技能大师工作室申报材料整理及行业研讨会现场技术保障。",
    ],
  },
  {
    id: "exp-pdd",
    kind: "work",
    org: "拼多多店铺",
    title: "个人经营",
    periodStart: "2023.04",
    periodEnd: "2025.06",
    bullets: [
      "自主经营拼多多店铺，负责商品上架、商品信息维护、订单及售后处理。",
      "根据商品经营情况调整商品信息及日常运营安排，熟悉电商平台基本运营流程。",
    ],
  },
  {
    id: "exp-yucai",
    kind: "work",
    org: "广西育才教育投资集团有限责任公司",
    title: "网络营销专员",
    periodStart: "2021.05",
    periodEnd: "2023.03",
    bullets: [
      "负责广告系统及内部数据平台日常管理，维护投放报表、落地页和后台系统，跟进渠道数据并参与效果对比与投放复盘。",
      "参与 SEM、信息流及 DSP 等渠道投放，管理年度广告预算 50 万元以上，全年广告点击量超过 10 万人次。",
      "独立开展投放渠道调研与对比，为广告投放策略及成本优化提供参考。",
      "参与成人高考报名项目执行及多地技术支持，累计报名学员超过 1 万人。",
    ],
  },
  {
    id: "exp-yongheng",
    kind: "work",
    org: "南宁市永恒影像有限公司",
    title: "广告优化师",
    periodStart: "2017.08",
    periodEnd: "2020.12",
    bullets: [
      "参与微信、抖音、快手、美团等渠道广告投放，负责广告账户管理、投放监控、素材配合及项目跟进。",
      "多个项目累计投放规模接近千万元、累计获客约 10 万人次。",
      "使用 Photoshop 及视频剪辑工具处理广告素材，参与广告推广方案制定及执行。",
      "参与婚博会、儿博会等展会营销计划制定及投放跟进。",
      "2019 年 5 月至 2020 年 2 月参与好友缘品牌婚宴项目推广，超额完成当年营收目标。",
    ],
  },
  {
    id: "exp-nzy",
    kind: "work",
    org: "南宁职业技术学院",
    title: "IT 技术助理",
    periodStart: "2017.03",
    periodEnd: "2017.07",
    bullets: [
      "负责电脑、打印机、投影仪等办公设备维护及日常系统问题处理。",
      "负责微信公众号后台维护、日常内容更新及问题解答。",
      "陪同直属领导完成接待、招聘等行政工作。",
    ],
  },
  {
    id: "exp-huchuan",
    kind: "work",
    org: "南宁互传网络科技有限公司",
    title: "微信公众号文案",
    periodStart: "2016.12",
    periodEnd: "2017.03",
    bullets: [
      "为“财神大咖”微信公众号撰写原创文章 50 余篇。",
      "负责公众号后台排版、内容发布及基础数据整理。",
    ],
  },
  {
    id: "edu-gxu",
    kind: "education",
    org: "广西大学",
    title: "土木工程",
    extra: "本科",
    periodStart: "2021",
    periodEnd: "2023",
    bullets: [],
  },
  {
    id: "edu-nzy",
    kind: "education",
    org: "南宁职业技术学院",
    title: "计算机应用技术",
    extra: "大专",
    periodStart: "2014",
    periodEnd: "2017",
    bullets: [
      "主修课程：Photoshop 实操应用、计算机应用基础、Windows 操作系统原理、HTML 网页设计与制作、PHP 应用、MySQL 数据应用、JavaScript 应用等。",
      "在校职务：担任校网络与计算机协会技术部部长，负责协会内会员技术培训及组织协会举办电脑义务维修等活动；同时在学校人文社会科学部担任学生助理，主要负责运营部门微信公众号，同时维护办公电脑、打印机、投影仪等办公设备。",
      "获得荣誉：被评为网络与计算机协会 2015-2016 年度优秀理事；连续 2 年获得学校勤工助学“先进个人”荣誉称号；被评为网络与计算机协会 2014-2015 年度优秀会员。",
      "项目经验：在担任校网络与计算机协会技术部部长期间搭设过协会论坛；毕业时搭建了个人的博客网站。",
    ],
  },
];

export const seedExperiences: Experience[] = raw.map((e, i) => ({
  summary: "",
  extra: "",
  visible: true,
  ...e,
  sort: (i + 1) * 10,
}));
