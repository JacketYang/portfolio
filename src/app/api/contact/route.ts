import { HttpError, clientIp, errorResponse, hitLimit, json, readJson, sameOrigin } from "@/lib/api";
import { getRawDocs } from "@/lib/content";

export const dynamic = "force-dynamic";

// "点击查看"联系方式：完整号码不会出现在页面 HTML 里，只有点击后才通过这个接口返回。
export async function POST(req: Request) {
  try {
    if (!sameOrigin(req)) throw new HttpError(403, "已拒绝跨站请求");
    if (!hitLimit(`contact:${clientIp(req)}`, 20, 60_000)) {
      throw new HttpError(429, "请求过于频繁，请稍后再试");
    }
    const body = (await readJson(req, 1000)) as { index?: unknown };
    const i = body?.index;
    if (typeof i !== "number" || !Number.isInteger(i) || i < 0 || i > 50) {
      throw new HttpError(400, "参数错误");
    }
    const { profile } = await getRawDocs();
    const c = profile.contacts[i];
    if (!c || !c.visible || !c.reveal || !c.value) throw new HttpError(404, "未找到");
    return json({ value: c.value });
  } catch (e) {
    return errorResponse(e);
  }
}
