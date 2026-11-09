# 部署说明

> 先说结论，帮你少走弯路。

## 0. 先搞清楚：这个站能放在哪里

这个站有**后台和数据库**（所以你能在网页上直接改内容），因此它不是纯静态站：

| 平台 | 能否运行 | 说明 |
| --- | --- | --- |
| **Cloudflare Pages（纯静态）** | ❌ | 只能放静态文件，跑不了后台与数据库 |
| **Cloudflare Workers（OpenNext + Hyperdrive）** | ✅（需额外配置） | 见第 4 节。**我在沙箱里无法实测 Cloudflare 环境**，已按官方文档适配，请先在 `preview` 验证 |
| **Vercel + Neon（免费）** | ✅ **最省事，首选** | 3 步完成，见第 2 节 |
| **Render / Railway / Zeabur 等 Node 托管** | ✅ | 见第 3 节 |
| **自有 VPS / Docker** | ✅ | 见第 5 节，含 `docker-compose.yml` |

**我的建议：**

1. 想最快上线、零运维 → **Vercel + Neon**（两者都有免费额度，不需要服务器）。
2. 一定要用 Cloudflare → 用 **Workers + Hyperdrive + Neon**；注意免费版 Workers 的体积/CPU 限制（第 4 节）。
3. 访问速度：`*.vercel.app` 等默认域名在国内可能不稳定。给 HR 发链接前，建议**绑定自己的域名**（国内服务器需要备案，海外托管不需要）。免费额度、价格、地区可用性随时可能变化，请以各平台官网为准。

无论选哪个平台，**需要的东西都一样**：

| 环境变量 | 必填 | 说明 |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL 连接串。云库通常要加 `?sslmode=require` |
| `ADMIN_PASSWORD` | ✅ | 后台密码，至少 8 位（建议 16 位以上随机）。不设置则后台禁用 |
| `SESSION_SECRET` | 推荐 | 会话签名密钥，`openssl rand -hex 32` 生成 |
| `NEXT_PUBLIC_SITE_URL` | 可选 | 站点公开地址，用于 sitemap / 分享预览；不填则自动推断 |

> **不需要手动建表、迁移或导入数据**：第一次访问站点（或 `/api/health`）时会自动建表并写入初始内容。

---

## 1. 通用准备：数据库

推荐 **Neon**（免费 Postgres，无需服务器）：

1. 注册 <https://neon.tech> → 新建 Project（选离你近的区域，如 Singapore）。
2. 在 Dashboard 的 **Connection string** 复制连接串：
   - 部署到 Vercel / Node 主机：用 **Pooled connection**（主机名带 `-pooler`）。
   - 部署到 Cloudflare Hyperdrive：用 **Direct connection**（不带 `-pooler`），因为 Hyperdrive 自己就是连接池。
3. 连接串形如 `postgresql://user:pass@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`。

也可以用 Supabase、Railway Postgres、Render Postgres、自建 PostgreSQL 等任何标准 PostgreSQL（版本 ≥ 13）。

---

## 2. 方案 A：Vercel + Neon（最省事）

1. 把代码推到 **私有** GitHub 仓库（`.env` 已被 `.gitignore` 忽略，别手动加回去）。
2. 打开 <https://vercel.com/new> → 导入仓库。框架会自动识别为 Next.js，**构建命令、输出目录都不用改**。
3. 在 **Environment Variables** 里填入：`DATABASE_URL`、`ADMIN_PASSWORD`、`SESSION_SECRET`。
4. 点击 **Deploy**。构建期**不需要数据库**（所有页面都是按需渲染）。
5. 部署完成后，访问 `https://你的域名/api/health`，看到 `{"ok":true,"content":true}` 即表示建表和初始化成功。
6. 访问 `/admin` 登录，开始编辑。

绑定域名：Vercel 项目 → Settings → Domains。

> Vercel 对 Serverless 请求体有大小限制（约 4.5MB）。后台上传的图片会先在浏览器压缩到 3MB 以内，不受影响；但「导入备份」文件较大时可能失败，见第 7 节的替代迁移方式。

---

## 3. 方案 B：Render / Railway / Zeabur 等 Node 托管

通用配置（各平台界面不同，填的内容一样）：

- **Build Command**：`npm ci && npm run build`
- **Start Command**：`npm start`
- **Node 版本**：20 或 22
- **环境变量**：同上
- **健康检查路径**（如平台支持）：`/api/health`
- 数据库：用平台自带的 Postgres 插件，或接 Neon。把它给的连接串填到 `DATABASE_URL`。

监听端口：`next start` 会读取平台注入的 `PORT` 环境变量，无需额外设置。

---

## 4. 方案 C：Cloudflare Workers（OpenNext + Hyperdrive + Neon）

> ⚠️ 诚实说明：这个沙箱里无法运行 Cloudflare 的 Workers 运行时，所以**这一节没有经过实机验证**。代码层面已做适配（见下），配置模板在 `deploy/cloudflare/`。请严格按步骤先执行 `preview` 验证，再 `deploy`。
>
> 已做的适配：
> - 认证只用 Web Crypto（不依赖 `node:crypto`）
> - 所有页面为按需渲染，不需要 ISR / 缓存绑定（R2 / D1 / Durable Objects 都**不需要**）
> - `src/db/index.ts` 检测到名为 `HYPERDRIVE` 的绑定时，会**按请求创建数据库连接**（Workers 不允许跨请求复用连接）
> - 不使用 `next/image`，没有图片优化服务依赖

### 4.1 免费版限制（务必先看）

- **脚本体积**：免费版 Worker 压缩后上限约 3 MiB。Next.js + React + Framer Motion + Zod + pg 可能**超限**；超限时需要升级 Workers Paid（付费计划，价格以官网为准）。
- **CPU 时间**：免费版每次请求 CPU 时间很短，服务端渲染较重的页面可能触发超时错误。
- 这两点是否会触发，取决于你的实际打包结果，**以 `npx wrangler deploy` 的输出和线上表现为准**。如果遇到，改用方案 A/B/D 更省心。

### 4.2 步骤

```bash
# 1) 安装适配器与 wrangler（不会改动你已有的依赖逻辑）
npm install @opennextjs/cloudflare@latest
npm install -D wrangler@latest

# 2) 复制配置模板到项目根目录
cp deploy/cloudflare/wrangler.jsonc.example wrangler.jsonc
cp deploy/cloudflare/open-next.config.ts.example open-next.config.ts

# 3) 添加脚本
npm pkg set scripts.cf:preview="opennextjs-cloudflare build && opennextjs-cloudflare preview"
npm pkg set scripts.cf:deploy="opennextjs-cloudflare build && opennextjs-cloudflare deploy"

# 4) 登录 Cloudflare
npx wrangler login

# 5) 创建 Hyperdrive（使用 Neon 的「Direct connection」连接串，不要用 -pooler 的）
npx wrangler hyperdrive create site-db --connection-string="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
#    命令会输出一个 id，填进 wrangler.jsonc 的 hyperdrive[0].id
#    本地预览用的连接串填进 localConnectionString（可直接用同一条）

# 6) 设置密钥（不会写进代码仓库）
npx wrangler secret put ADMIN_PASSWORD
npx wrangler secret put SESSION_SECRET

# 7) 先本地预览（会用 localConnectionString 连库）
#    本地预览所需变量放到 .dev.vars 文件（已在 .gitignore）：
#      ADMIN_PASSWORD=xxxx
#      SESSION_SECRET=xxxx
npm run cf:preview

# 8) 部署
npm run cf:deploy
```

部署后访问 `https://<worker名>.<你的子域>.workers.dev/api/health` 验证，然后在 Cloudflare 控制台 → Workers → 你的 Worker → Settings → Domains & Routes 绑定自己的域名。

### 4.3 Cloudflare 上建议额外做的安全设置

- Security → WAF → Rate limiting：对 `/api/auth/login` 设置速率限制（例如 1 分钟 10 次）。应用内的限速是内存级的，在 Workers 多实例下每个实例独立，平台层限速更可靠。
- 可选：用 Cloudflare Access 给 `/admin*` 与 `/api/admin*` 再加一层登录（邮箱验证码），免费。

### 4.4 常见报错

| 现象 | 原因与处理 |
| --- | --- |
| `Cannot perform I/O on behalf of a different request` | 数据库连接被跨请求复用。确认 Hyperdrive 绑定名称**必须叫 `HYPERDRIVE`** |
| `ADMIN_PASSWORD 未配置` / 后台被禁用 | 没有设置 secret，或本地预览缺少 `.dev.vars` |
| 部署时提示脚本过大 | 见 4.1，升级 Workers Paid，或改用其他方案 |
| 页面显示内置数据 | 数据库连不上：检查 Hyperdrive id、连接串、Neon 是否休眠（首次连接较慢） |

---

## 5. 方案 D：Docker / 自有服务器

仓库根目录已提供 `Dockerfile` 和 `docker-compose.yml`（含 PostgreSQL）。

```bash
# 在服务器上
git clone <你的私有仓库> site && cd site

# 创建 .env（给 docker compose 用）
cat > .env <<'EOF'
DB_PASSWORD=换成一个强密码
ADMIN_PASSWORD=换成16位以上随机密码
SESSION_SECRET=用 openssl rand -hex 32 生成
EOF

docker compose up -d --build
# 访问 http://服务器IP:3000
```

- 数据保存在 Docker 卷 `pgdata` 中。备份：`docker compose exec db pg_dump -U site site > backup.sql`
- **生产请放在 HTTPS 反向代理后面**（Caddy / Nginx / Cloudflare Tunnel 均可）。例如 Caddy：`你的域名 { reverse_proxy 127.0.0.1:3000 }`，自动签发证书。
- 只用 Docker 跑 Node、数据库另用云库时：删掉 compose 里的 `db` 服务，把 `DATABASE_URL` 改成云库连接串即可。

不用 Docker 的裸机：安装 Node 22 + PostgreSQL，`npm ci && npm run build && npm start`，用 systemd 或 pm2 守护进程。

---

## 6. 上线后检查清单

- [ ] `/api/health` 返回 `{"ok":true,"content":true}`
- [ ] `/admin` 能登录；登录后修改一条内容，刷新前台能看到
- [ ] 后台「个人信息」里确认手机号等联系方式的「点击后才显示」已勾选，并查看页面源码确认完整号码不在其中
- [ ] 后台「站点设置」填写站点网址（可选），并检查 `/sitemap.xml`、`/robots.txt`
- [ ] 用手机打开首页、项目详情，检查排版
- [ ] 确认 `ADMIN_PASSWORD` 足够强，且仓库中没有 `.env`
- [ ] 做一次「导出备份」，保存到本地

---

## 7. 数据迁移（沙箱/本地 → 正式环境）

**方式一：后台导出 / 导入（简单，适合内容不大时）**

1. 旧环境后台 → 概览 → **导出备份**（勾选「包含上传的图片」）。
2. 新环境部署好并能登录后 → 概览 → **导入备份**，选择文件。导入在一个数据库事务里完成，失败会整体回滚。
3. 注意：部分平台限制请求体大小（如 Vercel 约 4.5MB）。图片很多时取消勾选「包含上传的图片」，或用方式二。

**方式二：数据库整体迁移（适合图片多、数据大）**

```bash
pg_dump --no-owner --no-privileges "旧库连接串" > site.sql
psql "新库连接串" < site.sql
```

两个库都是标准 PostgreSQL，直接整体迁移即可，图片（存在 `media` 表）也会一起过去。

---

## 8. 升级与维护

- 更新代码后重新部署即可；表结构变化时，新增的表会在首次访问时自动创建（`create table if not exists`）。
- 想改 `src/db/schema.ts` 里的字段：同步修改 `src/db/ddl.ts`；已有数据库需手动执行对应的 `alter table`，或用 `npx drizzle-kit push`（连接串写在 `drizzle.config.json`，用完请改回）。
- 忘记后台密码：在平台环境变量里改 `ADMIN_PASSWORD` 并重启/重新部署即可。
