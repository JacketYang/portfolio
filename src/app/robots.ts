import type { MetadataRoute } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  let sitemap: string | undefined;
  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const fixed = process.env.NEXT_PUBLIC_SITE_URL;
    if (fixed && /^https?:\/\//.test(fixed)) sitemap = `${fixed.replace(/\/$/, "")}/sitemap.xml`;
    else if (host) {
      const proto = h.get("x-forwarded-proto")?.split(",")[0].trim() ?? (host.startsWith("localhost") ? "http" : "https");
      sitemap = `${proto}://${host}/sitemap.xml`;
    }
  } catch {
    /* ignore */
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    ...(sitemap ? { sitemap } : {}),
  };
}
