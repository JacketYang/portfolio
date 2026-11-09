import {
  SESSION_COOKIE,
  SESSION_TTL,
  adminConfigured,
  createSessionToken,
  verifyPassword,
} from "@/lib/auth";
import {
  HttpError,
  clientIp,
  errorResponse,
  hitLimit,
  isHttps,
  json,
  peekLimit,
  readJson,
  resetLimit,
  sameOrigin,
} from "@/lib/api";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "已拒绝跨站请求");
    if (!adminConfigured()) {
      throw new HttpError(503, "服务器尚未配置 ADMIN_PASSWORD（至少 8 位），后台已禁用");
    }
    const key = `login:${clientIp(req)}`;
    if (!peekLimit(key, 5)) throw new HttpError(429, "尝试次数过多，请 10 分钟后再试");

    const body = (await readJson(req, 4000)) as { password?: unknown };
    const ok =
      typeof body?.password === "string" &&
      body.password.length > 0 &&
      body.password.length <= 200 &&
      (await verifyPassword(body.password));
    if (!ok) {
      hitLimit(key, 5, 10 * 60_000);
      await sleep(500);
      throw new HttpError(401, "密码不正确");
    }
    resetLimit(key);

    const res = json({ ok: true });
    res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps(req),
      path: "/",
      maxAge: SESSION_TTL,
    });
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
