import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "./auth";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const NO_STORE = { "Cache-Control": "no-store" };

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

export function errorResponse(e: unknown) {
  if (e instanceof z.ZodError) {
    const issues = e.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    const first = issues[0];
    const msg = first ? `${first.path ? first.path + "：" : ""}${first.message}` : "数据格式不正确";
    return json({ error: msg, issues }, 400);
  }
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  console.error("[api] unexpected error:", e);
  return json({ error: "服务器内部错误" }, 500);
}

/** 只允许同源浏览器请求（防 CSRF）。非浏览器客户端没有 Origin 时，要求 Sec-Fetch-Site 不是跨站。 */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) {
    const sfs = req.headers.get("sec-fetch-site");
    return !sfs || sfs === "same-origin" || sfs === "none";
  }
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  const allowed = new Set<string>();
  const h = req.headers.get("host");
  const xfh = req.headers.get("x-forwarded-host");
  if (h) allowed.add(h);
  if (xfh) xfh.split(",").forEach((x) => allowed.add(x.trim()));
  try {
    allowed.add(new URL(req.url).host);
  } catch {
    /* ignore */
  }
  return allowed.has(host);
}

export function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  try {
    return new URL(req.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// 简易内存限速（每个实例独立；生产环境建议再配合平台层的限速规则）
const buckets = new Map<string, { count: number; resetAt: number }>();

export function hitLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function peekLimit(key: string, limit: number): boolean {
  const b = buckets.get(key);
  return !b || b.resetAt < Date.now() || b.count < limit;
}

export function resetLimit(key: string) {
  buckets.delete(key);
}

export async function readJson(req: Request, maxBytes = 1_000_000): Promise<unknown> {
  const len = Number(req.headers.get("content-length") ?? "0");
  if (len > maxBytes) throw new HttpError(413, "请求内容过大");
  const raw = await req.text();
  if (raw.length > maxBytes) throw new HttpError(413, "请求内容过大");
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "请求内容不是合法的 JSON");
  }
}

/** 管理接口统一入口：校验同源（写操作）与登录状态，统一错误输出。 */
export async function adminRoute(
  req: Request,
  write: boolean,
  fn: () => Promise<unknown>,
): Promise<Response> {
  try {
    if (write && !sameOrigin(req)) throw new HttpError(403, "已拒绝跨站请求");
    if (!(await isAdmin())) throw new HttpError(401, "未登录或会话已过期，请重新登录");
    return json(await fn());
  } catch (e) {
    return errorResponse(e);
  }
}
