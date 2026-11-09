import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * 数据库连接（node-postgres）。
 *
 * - 普通 Node 环境（本地、Docker、Vercel、Render、Railway 等）：
 *   使用 DATABASE_URL，进程内复用一个小连接池。
 * - Cloudflare Workers（OpenNext）：Worker 不允许跨请求复用连接，
 *   因此检测到 Hyperdrive 绑定时，按"每个请求一个连接"创建客户端。
 *
 * 连接是懒创建的：构建阶段、没有配置 DATABASE_URL 时都不会报错，
 * 只有真正查询时才会抛出，页面会回退到 src/data 的内置数据。
 */

type Db = ReturnType<typeof makeDb>;

function makeDb(connectionString: string, opts: { max: number; maxUses?: number }) {
  const pool = new Pool({
    connectionString,
    max: opts.max,
    maxUses: opts.maxUses,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
  });
  // 空闲连接被服务端断开时不要让进程崩溃
  pool.on("error", (err) => console.error("[db] pool error:", err.message));
  return drizzle(pool);
}

const CF_CONTEXT = Symbol.for("__cloudflare-context__");
const perRequest = new WeakMap<object, Db>();

const globalForDb = globalThis as typeof globalThis & { __siteDb?: Db };

function resolveDb(): Db {
  // Cloudflare Workers + Hyperdrive
  const cf = (globalThis as Record<symbol, unknown>)[CF_CONTEXT] as
    | { env?: { HYPERDRIVE?: { connectionString?: string } } }
    | undefined;
  const hyperdrive = cf?.env?.HYPERDRIVE?.connectionString;
  if (cf && hyperdrive) {
    let inst = perRequest.get(cf);
    if (!inst) {
      inst = makeDb(hyperdrive, { max: 3, maxUses: 1 });
      perRequest.set(cf, inst);
    }
    return inst;
  }

  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL 未配置");
  if (!globalForDb.__siteDb) globalForDb.__siteDb = makeDb(url, { max: 5 });
  return globalForDb.__siteDb;
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = resolveDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
