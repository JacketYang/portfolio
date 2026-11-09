import type { MetadataRoute } from "next";
import { getProjects, getSiteData } from "@/lib/content";
import { getBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { site } = await getSiteData();
  const base = await getBaseUrl(site.siteUrl);
  if (!base) return [];
  const projects = await getProjects();
  const pages = ["", "/projects", "/experience", "/about", ...(site.showLog ? ["/log"] : [])];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const })),
    ...projects.map((p) => ({
      url: `${base}/projects/${p.id}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
    })),
  ];
}
