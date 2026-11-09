import type { Project, ProjectContent } from "@/lib/types";

// 项目数据（初始数据）。
// 规则：只写简历里有依据的事实；没有依据的字段留空，前台会自动隐藏空字段。
// 封面目前都是通用图库图片（coverIsStock: true，前台会标注「示意配图」）。
// 有真实截图后，在后台「项目」里替换封面、补充截图和二维码即可。

const SEED_DATE = "2026-01-01T00:00:00.000Z";

const emptyContent: ProjectContent = {
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

type Seed = Partial<Omit<Project, "content">> &
  Pick<Project, "id" | "title" | "categoryId"> & { content?: Partial<ProjectContent> };

function p(seed: Seed): Project {
  return {
    summary: "",
    description: "",
    status: "completed",
    kinds: [],
    cover: "",
    coverIsStock: false,
    gallery: [],
    role: "",
    tools: [],
    achievements: [],
    links: [],
    qrcode: "",
    demoVideo: "",
    periodStart: "",
    periodEnd: "",
    featured: false,
    visible: true,
    sort: 0,
    createdAt: SEED_DATE,
    updatedAt: SEED_DATE,
    ...seed,
    content: { ...emptyContent, ...(seed.content ?? {}) },
  };
}

const raw: Project[] = [
  p({
    id: "emoji-miniprogram",
    title: "表情包生成小程序",
    categoryId: "miniprogram",
    status: "online",
    kinds: ["solo", "ai"],
    summary:
      "独立开发的微信小程序：支持文字输入、图片上传、图片生成、作品保存与分享，已通过微信平台审核并上线运行。",
    role: "独立开发者",
    periodStart: "2025.09",
    periodEnd: "至今",
    tools: ["微信小程序", "微信开发者工具", "AI 编程工具", "真机调试"],
    cover: "/assets/stock/miniprogram-phone.jpg",
    coverIsStock: true,
    featured: true,
    content: {
      responsibilities:
        "- 独立参与需求分析、功能规划、页面设计、业务逻辑开发及测试迭代。\n- 使用 AI 编程工具辅助代码编写、项目结构分析、功能调整及运行错误排查。\n- 通过开发者工具和实际设备进行测试。\n- 负责项目日常维护及功能优化。",
      steps: [
        { title: "需求分析", desc: "" },
        { title: "功能规划", desc: "" },
        { title: "页面设计", desc: "" },
        { title: "业务逻辑开发", desc: "AI 编程工具辅助" },
        { title: "测试迭代", desc: "开发者工具 + 真机" },
        { title: "审核上线", desc: "通过微信平台审核" },
        { title: "维护优化", desc: "" },
      ],
      deliverables:
        "产品已通过微信平台审核并上线运行。核心功能包括：文字输入、图片上传、图片生成、作品保存及分享。",
      summary: "熟悉从需求提出到功能上线的基本流程，并持续负责日常维护与功能优化。",
    },
  }),
  p({
    id: "ai-assisted-workflow",
    title: "AI 辅助开发工作流实践",
    categoryId: "ai",
    status: "developing",
    kinds: ["solo", "ai"],
    summary:
      "近年持续使用大语言模型和 AI 编程工具开展个人项目实践：需求拆解、代码生成、功能修改、错误分析与测试迭代。",
    role: "个人实践",
    tools: ["Claude", "GPT", "DeepSeek", "GLM", "Qwen", "Gemini"],
    cover: "/assets/stock/ai-neural.jpg",
    coverIsStock: true,
    featured: true,
    content: {
      responsibilities:
        "- 利用 AI 工具进行需求拆解、代码生成、功能修改、错误分析及测试迭代。\n- 将 AI 工具应用于资料整理、内容处理及个人应用开发。",
      steps: [
        { title: "需求拆解", desc: "" },
        { title: "代码生成", desc: "" },
        { title: "功能修改", desc: "" },
        { title: "错误分析", desc: "" },
        { title: "测试迭代", desc: "" },
      ],
      summary: "这是一项仍在进行的个人实践，后续的新项目和心得会记录在成长日志里。",
    },
  }),
  p({
    id: "ad-delivery-yongheng",
    title: "多渠道广告投放与账户管理",
    categoryId: "digital-marketing",
    status: "completed",
    kinds: ["work"],
    summary:
      "在南宁市永恒影像有限公司担任广告优化师，参与微信、抖音、快手、美团等渠道的广告投放、账户管理与投放监控。",
    role: "广告优化师",
    periodStart: "2017.08",
    periodEnd: "2020.12",
    tools: ["微信广告", "抖音", "快手", "美团", "Photoshop", "视频剪辑"],
    cover: "/assets/stock/marketing-analytics.jpg",
    coverIsStock: true,
    featured: true,
    achievements: [
      { label: "累计投放规模", value: "接近千万元", note: "多个项目合计" },
      { label: "累计获客", value: "约 10 万人次", note: "多个项目合计" },
    ],
    content: {
      responsibilities:
        "- 参与微信、抖音、快手、美团等渠道广告投放，负责广告账户管理、投放监控、素材配合及项目跟进。\n- 使用 Photoshop 及视频剪辑工具处理广告素材，参与广告推广方案制定及执行。\n- 参与婚博会、儿博会等展会营销计划制定及投放跟进。",
    },
  }),
  p({
    id: "sem-feed-dsp-yucai",
    title: "SEM、信息流与 DSP 投放及数据复盘",
    categoryId: "digital-marketing",
    status: "completed",
    kinds: ["work"],
    summary:
      "在广西育才教育投资集团担任网络营销专员，负责广告系统与数据平台的日常管理，参与多渠道投放，并做渠道调研与效果复盘。",
    role: "网络营销专员",
    periodStart: "2021.05",
    periodEnd: "2023.03",
    tools: ["SEM", "信息流", "DSP", "投放报表", "落地页", "内部数据平台"],
    cover: "/assets/stock/marketing-seo.jpg",
    coverIsStock: true,
    featured: true,
    achievements: [
      { label: "年度广告预算", value: "50 万元以上", note: "" },
      { label: "全年广告点击量", value: "超过 10 万人次", note: "" },
    ],
    content: {
      responsibilities:
        "- 负责广告系统及内部数据平台日常管理，维护投放报表、落地页和后台系统。\n- 跟进渠道数据，并参与效果对比与投放复盘。\n- 参与 SEM、信息流及 DSP 等渠道投放。\n- 独立开展投放渠道调研与对比，为广告投放策略及成本优化提供参考。",
      steps: [
        { title: "渠道投放", desc: "SEM / 信息流 / DSP" },
        { title: "数据跟进", desc: "投放报表维护" },
        { title: "效果对比", desc: "渠道之间对比" },
        { title: "投放复盘", desc: "为策略与成本优化提供参考" },
      ],
    },
  }),
  p({
    id: "skill-bank-courseware",
    title: "职业技能题库与课程资源整理",
    categoryId: "education",
    status: "completed",
    kinds: ["work"],
    summary:
      "参与国家职业技能鉴定题库、课件及细目表的开发与整理，独立完成 40 余个工种的资料结构梳理与规范化整理。",
    role: "课程开发",
    periodStart: "2025.07",
    periodEnd: "2025.09",
    tools: ["Excel", "PowerPoint", "AI 工具"],
    cover: "/assets/stock/education-courseware.jpg",
    coverIsStock: true,
    featured: true,
    achievements: [{ label: "工种资料结构梳理", value: "40 余个", note: "" }],
    content: {
      responsibilities:
        "- 参与国家职业技能鉴定题库、课件及细目表的开发与整理工作。\n- 独立完成 40 余个工种的资料结构梳理及规范化整理，涉及 Excel 题库、PowerPoint 课件及配套资料。\n- 使用 AI 工具辅助资料处理、内容整理及工作效率优化。\n- 参与两个技能大师工作室申报材料的技术整理与文档规范化编写。\n- 参与行业研讨会现场技术保障及相关工作协调。",
      deliverables: "规范化整理后的 Excel 题库、PowerPoint 课件及配套资料，覆盖 40 余个工种。",
    },
  }),
  p({
    id: "adult-exam-enrollment",
    title: "成人高考报名项目执行与多地技术支持",
    categoryId: "education",
    status: "completed",
    kinds: ["work", "participated"],
    summary: "参与成人高考报名项目的执行及多地技术支持，项目累计报名学员超过 1 万人。",
    role: "项目执行 / 技术支持",
    periodStart: "2021.05",
    periodEnd: "2023.03",
    tools: ["落地页", "后台系统"],
    cover: "/assets/stock/education-online.jpg",
    coverIsStock: true,
    achievements: [{ label: "项目累计报名学员", value: "1 万人以上", note: "" }],
    content: {
      responsibilities: "- 参与成人高考报名项目执行。\n- 提供多地技术支持。",
    },
  }),
  p({
    id: "wedding-brand-campaign",
    title: "好友缘品牌婚宴项目推广",
    categoryId: "digital-marketing",
    status: "completed",
    kinds: ["work", "participated"],
    summary: "参与好友缘品牌婚宴项目的推广，该项目超额完成当年营收目标。",
    role: "广告优化师（参与）",
    periodStart: "2019.05",
    periodEnd: "2020.02",
    tools: ["线上广告投放"],
    cover: "/assets/stock/wedding-hall.jpg",
    coverIsStock: true,
    achievements: [{ label: "项目成果", value: "超额完成当年营收目标", note: "" }],
    content: {
      responsibilities: "- 参与好友缘品牌婚宴项目推广（2019 年 5 月至 2020 年 2 月）。",
    },
  }),
  p({
    id: "wechat-official-account",
    title: "微信公众号内容运营",
    categoryId: "digital-marketing",
    status: "completed",
    kinds: ["work"],
    summary: "为“财神大咖”微信公众号撰写原创文章 50 余篇，并负责后台排版、内容发布及基础数据整理。",
    role: "微信公众号文案",
    periodStart: "2016.12",
    periodEnd: "2017.03",
    tools: ["微信公众号后台", "图文排版"],
    cover: "/assets/stock/content-writing.jpg",
    coverIsStock: true,
    achievements: [{ label: "原创文章", value: "50 余篇", note: "" }],
    content: {
      responsibilities:
        "- 为“财神大咖”微信公众号撰写原创文章。\n- 负责公众号后台排版、内容发布及基础数据整理。",
    },
  }),
  p({
    id: "campus-it-association",
    title: "校网络与计算机协会：技术培训与电脑义务维修",
    categoryId: "lab",
    status: "completed",
    kinds: ["work"],
    summary:
      "担任校网络与计算机协会技术部部长，主持内部技术培训与校园电脑义务维修，搭建协会论坛并部署个人博客网站。",
    role: "技术部部长",
    periodStart: "2015.06",
    periodEnd: "2016.06",
    tools: ["系统安装", "网络排障", "论坛搭建", "服务器部署"],
    cover: "/assets/stock/campus-it.jpg",
    coverIsStock: true,
    achievements: [
      { label: "内部技术培训", value: "10+ 次", note: "" },
      { label: "累计维护修复设备", value: "超过 200 台", note: "" },
    ],
    content: {
      responsibilities:
        "- 主持协会内部技术培训，内容包括系统安装、网络排障、办公软件技巧等。\n- 主导校园电脑义务维修活动。\n- 构建报修 → 检测 → 维修闭环，提升维修处理效率。\n- 协会论坛搭建及个人博客网站部署。\n- 服务器部署与基础运维。",
      steps: [
        { title: "报修", desc: "" },
        { title: "检测", desc: "" },
        { title: "维修", desc: "形成闭环，提升处理效率" },
      ],
    },
  }),
  p({
    id: "this-site",
    title: "个人项目展厅与数字档案馆（本站）",
    categoryId: "lab",
    status: "developing",
    kinds: ["solo", "ai"],
    summary:
      "你正在看的这个网站：一个可以持续积累、随时更新的个人项目展厅，所有内容通过后台统一管理。",
    role: "设计与搭建（AI 辅助）",
    tools: ["Next.js", "TypeScript", "PostgreSQL", "Tailwind CSS", "Framer Motion"],
    cover: "/assets/stock/code-dark.jpg",
    coverIsStock: true,
    featured: true,
    content: {
      techSolution:
        "- 前台与后台在同一个 Next.js 项目中，数据存放在 PostgreSQL。\n- 后台支持项目、分类、经历、技能、成长日志的增删改、显示 / 隐藏、排序。\n- 图片压缩后存入数据库，也支持填写外部图片地址或使用内置素材。\n- 数据库不可用时自动回退到内置数据文件，页面仍可访问。",
      summary: "项目仍在持续迭代中，更新记录见成长日志。",
    },
  }),
];

export const seedProjects: Project[] = raw.map((x, i) => ({ ...x, sort: (i + 1) * 10 }));
