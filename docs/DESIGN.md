# 视觉规范

定位：**个人项目展厅与数字档案馆**——现代科技感 + 专业商业设计。深色为主，克制地使用一个高亮色；信息层级清晰，动效服务于内容而不是炫技。

所有令牌都落在 `src/app/globals.css` 的 `:root` / `@theme`，组件类放在 `@layer components`。

---

## 1. 颜色

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `bg` | `#070a12` | 页面背景 |
| `bg-2` | `#0b101b` | 次级背景（图片占位、后台侧栏、弹层） |
| `surface` | `rgb(255 255 255 / 4%)` | 卡片底色 |
| `surface-2` | `rgb(255 255 255 / 7%)` | 悬停 / 选中底色 |
| `line` | `rgb(255 255 255 / 9%)` | 分割线、卡片边框 |
| `line-strong` | `rgb(255 255 255 / 16%)` | 输入框、按钮边框 |
| `fg` | `#e8ecf4` | 主文字 |
| `muted` | `#a1abc0` | 正文、次要文字 |
| `faint` | `#717b93` | 辅助信息、时间、标签说明 |
| `accent` | `#5eead4`（可在后台改） | 高亮色：链接、选中态、主按钮、强调线 |
| `accent-2` | `#818cf8` | 渐变的第二色（只与 accent 搭配成渐变） |
| `danger` | `#f87171` | 删除、错误 |

**状态色**（徽章，`src/lib/constants.ts`）：已上线 `#34d399` · 已完成 `#60a5fa` · 开发中 `#fbbf24` · 测试中 `#c084fc` · 概念验证 `#f472b6`。

**分类色**：每个分类自带一个颜色（后台可改），用于分类标签和能力卡顶部色条，初始为橙 `#fb923c`、靛 `#818cf8`、青 `#5eead4`、紫 `#c084fc`、琥珀 `#fbbf24`。

规则：

- 一个页面里**高亮色只承担「可交互 / 当前 / 强调」**，不做大面积铺色。
- 渐变只用于：姓名、主按钮、时间跨度条、Logo 标识。
- 文字对比度：`fg` / `muted` 在 `bg` 上均满足 WCAG AA（`faint` 仅用于非关键辅助信息）。

## 2. 字体

不引入任何外部字体（避免国内访问慢、避免布局抖动）。

- 正文：`ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`
- 等宽（时间、编号、标签）：`ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`

| 层级 | 尺寸 | 字重 / 字距 | 类 |
| --- | --- | --- | --- |
| Display | `clamp(2.5rem, 6.5vw, 4.5rem)` | 700 / -0.03em | `.h-display`（首页姓名） |
| Page title | `clamp(2rem, 5vw, 3.25rem)` | 700 | `.h-display` + 覆盖 |
| Section title | `clamp(1.6rem, 3.2vw, 2.25rem)` | 650 / -0.02em | `.h-section` |
| Card title | 18px | 600 | `text-lg font-semibold` |
| Body | 16px / 行高 1.7 | 400 | 默认 |
| Small | 14px | 400 | `text-sm` |
| Meta | 12px 等宽 | 400 | `font-mono text-xs` |
| Eyebrow | 12px 等宽，大写，字距 0.14em，accent 色 | 400 | `.eyebrow` |

## 3. 间距与布局

- 基准：**4px**（Tailwind 默认刻度）。
- 内容宽度：`max-width: 72rem`（1152px）；两侧留白移动端 20px、≥640px 为 32px（`.container-page`）。
- 区块上下间距：`clamp(3.25rem, 7vw, 6rem)`（`.section`）。
- 卡片内边距：20–24px；卡片之间 16–20px；行内元素间距 8–12px。
- 网格：项目卡片 `1 / 2 / 3` 列（手机 / 平板 / 桌面）；能力卡同；经历与技能 `1 / 2` 列。
- 断点：Tailwind 默认（`sm 640` · `md 768` · `lg 1024`）。导航在 `md` 以下折叠为菜单。

## 4. 圆角与边框

| 用途 | 圆角 |
| --- | --- |
| 标签、徽章 | 全圆（999px） |
| 按钮、输入框 | 12px / 11px |
| 卡片、图片容器 | 16px（`rounded-2xl`） |
| 玻璃面板、首屏索引卡 | 20px |

边框统一 1px `line`；悬停时边框变为 `accent` 45% 透明度。

## 5. 动画规则

目标：**细腻、克制、不影响性能**。

| 场景 | 实现 | 时长 / 曲线 |
| --- | --- | --- |
| 页面切换 | `(site)/template.tsx`：opacity 0→1 + y 10→0 | 320ms · `cubic-bezier(.22,.61,.36,1)` |
| 滚动出现 | `Reveal`：opacity + y 16→0，`once`，视口提前 60px 触发 | 500ms，可错峰（delay 40–180ms） |
| 卡片悬停 | CSS：上移 2px、边框变亮、封面缩放 1.04 | 250ms / 500ms |
| 项目筛选 | Framer Motion `layout` + `AnimatePresence popLayout` | 250ms |
| 移动端菜单 | 高度 + 透明度 | 220ms |
| 粒子背景 | Canvas，最多 60 点、DPR 上限 1.5 | 见下 |

硬性约束：

1. **只动画 `opacity` 和 `transform`**，不动画布局属性。
2. 粒子背景：滚出视口或标签页隐藏时**暂停**；窗口缩放自适应点数；**仅首屏使用一处**。
3. 尊重系统「减少动态效果」：`MotionConfig reducedMotion="user"` 关闭位移动画，粒子背景不启动，CSS 动画时长降为 0。
4. 不使用无限循环的装饰动画、不使用视差、不使用数字滚动（避免「夸张数字」观感）。
5. 图片全部懒加载（首屏封面除外），并预留宽高比，杜绝布局抖动。

## 6. 组件规范

| 组件 | 位置 | 说明 |
| --- | --- | --- |
| `Media` | `components/site/Media.tsx` | **统一图片组件**。固定宽高比、懒加载、失败/无图时显示分类色渐变占位；`stock` 为真时右下角标注「示意配图」 |
| `ProjectCard` | `components/site/ProjectCard.tsx` | 封面 + 分类标签（左上）+ 状态徽章 + 时间 + 标题 + 简介（3 行截断）+ 工具标签（最多 4 个） |
| `StatusBadge` / `CategoryChip` / `KindBadges` | `components/site/Badges.tsx` | 状态、分类、真实性类型徽章 |
| `ProjectExplorer` | `components/site/ProjectExplorer.tsx` | 分类筛选 + 搜索，地址栏同步 |
| `Flow` | `components/site/Flow.tsx` | 实施流程图（编号步骤 + 箭头；手机端纵向排列） |
| `CareerChart` | `components/site/CareerChart.tsx` | 职业时间跨度图，完全由经历起止时间计算 |
| `Timeline` / `TimelineCompact` | `components/site/Timeline.tsx` | 完整时间轴 / 首页紧凑列表 |
| `Skills` | `components/site/Skills.tsx` | 技能分组；熟练度只用文字标签，不使用百分比进度条 |
| `Gallery` | `components/site/Gallery.tsx` | 截图网格 + 灯箱（键盘 ← → Esc） |
| `ContactList` | `components/site/ContactList.tsx` | 联系方式；敏感号码点击后才从接口获取 |
| `Markdown` | `components/Markdown.tsx` | 安全的 Markdown 子集渲染 |
| `SectionHeading` / `PageHeader` | `components/site/SectionHeading.tsx` | 区块标题 / 页面标题 |

**按钮**：`.btn`（描边）、`.btn-primary`（accent 渐变）、`.btn-danger`、`.btn-sm`。最小点击区域 ≥ 36px 高（移动端导航项 ≥ 44px）。

**表单**：`.input` / `.label` / `.help`，聚焦时边框变 accent。

**可访问性**：所有交互元素可键盘操作；`:focus-visible` 统一 2px accent 描边；图片有 `alt`；筛选使用 `role="tablist"`；页面有「跳到正文」链接；语言 `zh-CN`。

## 7. 数据可视化原则

- 图表只展示**真实数据**：时间跨度图来自经历的起止时间；流程图来自项目 `steps`；没有数据就不画。
- 不引入图表库（ECharts 等），全部用 HTML/CSS 实现，包体积更小。
- 不做「技能百分比」「虚构完成率」之类无依据的可视化。
