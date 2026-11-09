import { headers } from "next/headers";

/** 站点绝对地址：优先用后台设置 / 环境变量，否则从当前请求推断。 */
export async function getBaseUrl(configured: string): Promise<string> {
  const fixed = configured || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (/^https?:\/\/[^\s/]+\/?$/.test(fixed)) return fixed.replace(/\/$/, "");
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (!host) return "";
    const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() ?? (host.startsWith("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

export function absoluteUrl(base: string, path: string): string | undefined {
  if (/^https?:\/\//i.test(path)) return path;
  if (path.startsWith("/") && base) return `${base}${path}`;
  return undefined;
}
