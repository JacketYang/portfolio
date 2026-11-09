import { SESSION_COOKIE } from "@/lib/auth";
import { HttpError, errorResponse, isHttps, json, sameOrigin } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "已拒绝跨站请求");
    const res = json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps(req),
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (e) {
    return errorResponse(e);
  }
}
