# 个人项目展厅 · 数字档案馆

一个可以持续积累、随时更新的个人求职展示站：**前台**展示项目、经历与技能，**后台**可视化管理所有内容（增删改查、显示/隐藏、排序、图片上传、备份迁移），不需要再改源码。

- 技术栈：Next.js 16（App Router）· TypeScript · Tailwind CSS 4 · Framer Motion · PostgreSQL（Drizzle ORM）
- 资源占用：1 个 Node 进程 + 1 个 PostgreSQL；没有任何付费 API、没有外部字体/CDN 依赖
- 文档：
  - [docs/DEPLOY.md](docs/DEPLOY.md) 部署说明（Vercel / Cloudflare / Docker / 任意 Node 主机）
  - [docs/CONTENT.md](docs/CONTENT.md) 内容更新说明（后台怎么用、数据文件怎么改、真实性规范）
  - [docs/DESIGN.md](docs/DESIGN.md) 视觉规范（颜色、字体、间距、圆角、动画、组件）
  - [docs/ASSETS.md](docs/ASSETS.md) 图库素材来源与署名

---

## 功能一览

**前台**

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 身份与定位、核心能力、精选项目、正在进行、职业经历（含时间跨度图）、最近更新、联系方式 |
| 项目展厅 | `/projects` | 分类筛选 + 搜索；筛选状态同步到地址栏（`?c=ai`） |
| 项目详情 | `/projects/[id]` | 背景 / 目标 / 承担工作 / 解决的问题 / 实施过程（含流程图）/ 技术方案 / 工具 / 截图与演示 / 交付成果 / 总结；空章节自动隐藏 |
| 经历与技能 | `/experience` | 职业时间轴、技能（手动维护熟练度）、个人优势、教育与证书 |
| 成长日志 | `/log` | 按年份归档的持续更新记录（可在后台关闭） |
| 关于我 | `/about` | 个人简介、联系方式（敏感号码点击后才显示）、简历入口 |
| 简历 | `/resume` | 由站点数据自动生成的可打印简历（浏览器 打印 → 另存为 PDF） |

**后台**（`/admin`）

- 项目 / 分类 / 经历与教育 / 技能 / 成长日志：新增、编辑、复制、删除、**显示/隐藏**、**精选**、**上移/下移排序**
- 个人信息、联系方式、站点设置（标题、描述、主题色、首页板块开关）
- 媒体库：浏览器端自动压缩后存入数据库；也可填外部图片地址或使用内置图库素材
- 备份与迁移：一键导出 / 导入 JSON
- 概览页会列出「还在用示意配图 / 缺真实截图」的项目，提醒你补素材

**真实性设计**

- 每个项目标注真实性类型：真实经历 / 个人独立项目 / 参与项目 / AI 辅助开发 / 概念验证
- 没有数据的指标、没有内容的章节、没有值的字段，前台一律不显示，**不填充任何占位数字或文字**
- 通用图库图片自动标注「示意配图」；技能熟练度只有「了解 / 熟悉 / 熟练」三档且手动维护

---

## 本地运行

需要：Node.js 20+（推荐 22）、一个 PostgreSQL（本地或云端免费库均可）。

```bash
# 1. 安装依赖
npm install

# 2. 准备数据库（任选其一）
#    a) 本地 Docker：
docker run -d --name site-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=site -p 5432:5432 postgres:16-alpine
#    b) 使用 Neon / Supabase 等云数据库，复制连接串

# 3. 配置环境变量
cp .env.example .env
#    编辑 .env：填写 DATABASE_URL 和 ADMIN_PASSWORD（至少 8 位）
#    本地 Docker 示例：DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/site

# 4. 启动开发服务器
npm run dev
#    前台 http://localhost:3000   后台 http://localhost:3000/admin
```

**首次访问会自动：建表 → 写入 `src/data/` 里的初始内容**，不需要手动跑迁移命令。

生产模式本地验证：

```bash
npm run build && npm start
```

---

## 目录结构

```
src/
  app/
    (site)/            前台页面（首页、项目、经历、关于、日志、简历）
    admin/             后台（登录页 + 受保护的管理面板）
    api/               接口：auth、admin/*、media、contact、health
  components/
    site/              前台组件（卡片、时间轴、流程图、粒子背景…）
    admin/             后台组件（表单引擎、资源管理器、媒体库…）
  data/                初始内容（简历数据）。首次初始化写入数据库；数据库不可用时作为兜底展示
  db/                  schema.ts（表结构）、ddl.ts（自动建表语句）、index.ts（连接）
  lib/                 校验、认证、资源 CRUD、内容读取、Markdown 渲染…
public/assets/         静态素材（内置图库图片）
docs/                  文档
deploy/cloudflare/     Cloudflare Workers 配置模板
```

### 数据流（统一数据源）

所有前台页面都只通过 `src/lib/content.ts` 读取内容，没有任何页面硬编码项目资料：

```
后台 /admin ──写入──▶ PostgreSQL ◀──读取── src/lib/content.ts ◀── 所有前台页面
                          ▲
        首次访问时自动写入 ── src/data/*.ts（初始数据）
        数据库不可用时 ──────▶ 直接回退展示 src/data/*.ts
```

---

## 安全说明

已实现：

- **后台认证**：密码只存在环境变量里；会话为 HMAC-SHA256 签名的 HttpOnly + SameSite=Lax Cookie（HTTPS 下自动加 Secure）；密码常量时间比较；7 天过期；改密码或 `SESSION_SECRET` 会让所有旧会话失效
- **未设置 `ADMIN_PASSWORD`（或少于 8 位）时后台直接禁用**，不存在默认密码
- **登录限速**：同一 IP 连续 5 次失败锁定 10 分钟（内存级，多实例时每实例独立；建议在 Cloudflare 上再加一条速率限制规则）
- **防 CSRF**：所有写接口校验同源（Origin / Sec-Fetch-Site）+ SameSite Cookie
- **所有后台接口服务端校验登录**；后台页面也各自校验（不只依赖布局）
- **输入校验**：所有写入都经 Zod 校验（长度、枚举、颜色格式）；链接和图片地址白名单（仅 `http(s)://`、`/`、`mailto:`，拒绝 `javascript:`、`data:`、`//host`）
- **防 XSS**：Markdown 自研渲染为 React 节点，不使用 `dangerouslySetInnerHTML` 渲染用户内容（唯一的 JSON-LD 脚本做了 `<` 转义）
- **图片上传**：仅管理员；按文件头嗅探真实类型，只接受 JPG/PNG/WebP/GIF（**拒绝 SVG**）；限制 3MB；输出带 `nosniff`
- **联系方式防爬**：标记为「点击后才显示」的号码不会出现在页面 HTML 中，通过限速接口按需返回
- **SQL 注入**：全部使用 Drizzle 参数化查询
- **响应头**：`X-Content-Type-Options`、`X-Frame-Options: DENY`、`Referrer-Policy`、`Permissions-Policy`、`frame-ancestors 'none'` 等；后台页面 `no-store`、`noindex`

你需要做的：

1. 使用 **16 位以上随机** 的 `ADMIN_PASSWORD`，生产环境务必走 HTTPS
2. **不要提交 `.env`**（已在 `.gitignore`）。仓库建议保持**私有**——`src/data/profile.ts` 里有初始手机号，公开仓库前请先清空
3. 后台只有你一个人用：如不需要，也可以在平台层给 `/admin`、`/api/admin` 再加一层访问控制（如 Cloudflare Access）

---

## 常见问题

- **页面显示的是内置数据，后台提示数据库读取失败？** 检查 `DATABASE_URL` 是否正确、数据库是否允许外部连接、云库是否需要 `?sslmode=require`。访问 `/api/health` 可快速自检。
- **想重置为初始内容？** 见 [docs/CONTENT.md](docs/CONTENT.md) 的「重置」一节。
- **改了 `src/data/*.ts` 但页面没变化？** 数据库初始化后，内容以数据库为准；`src/data` 只在首次初始化和数据库不可用时使用。日常请用后台修改。
