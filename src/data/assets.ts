// 内置素材清单（位于 /public/assets/）。后台选择图片时会列出这些素材。
// 新增素材：把文件放进 public/assets/ 后，在这里加一行即可（也可以直接在后台上传，无需改代码）。
// 通用图库图片来自 Pexels（可免费商用），摄影师署名见 docs/ASSETS.md。

export type BundledAsset = { path: string; label: string; stock: boolean };

export const bundledAssets: BundledAsset[] = [
  { path: "/assets/stock/marketing-analytics.jpg", label: "数据看板 · 笔记本", stock: true },
  { path: "/assets/stock/marketing-seo.jpg", label: "SEO 笔记 · 键盘", stock: true },
  { path: "/assets/stock/education-courseware.jpg", label: "在线课程 · 笔记", stock: true },
  { path: "/assets/stock/education-binders.jpg", label: "文件夹 · 资料整理", stock: true },
  { path: "/assets/stock/education-online.jpg", label: "在线学习", stock: true },
  { path: "/assets/stock/miniprogram-phone.jpg", label: "手机 · 应用界面", stock: true },
  { path: "/assets/stock/ai-neural.jpg", label: "AI · 神经网络", stock: true },
  { path: "/assets/stock/campus-it.jpg", label: "电脑硬件维修", stock: true },
  { path: "/assets/stock/code-dark.jpg", label: "代码 · 深色工作区", stock: true },
  { path: "/assets/stock/wedding-hall.jpg", label: "婚宴宴会厅", stock: true },
  { path: "/assets/stock/content-writing.jpg", label: "内容写作 · 笔记本", stock: true },
];
