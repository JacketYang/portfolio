import { HEX_COLOR } from "@/lib/constants";
import { getSiteData } from "@/lib/content";

// 网站图标：上传了自定义图标就跳过去，否则用「姓名首字 + 主题色」现画一个。
// 需要 force-dynamic，否则构建时会把当时的姓名烘焙成静态图标。
export const dynamic = "force-dynamic";

const escapeXml = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });

export async function GET() {
  const { profile, site } = await getSiteData();

  if (site.icon) {
    return new Response(null, { status: 302, headers: { Location: site.icon } });
  }

  const accent = HEX_COLOR.test(site.accent) ? site.accent : "#5eead4";
  const raw = (profile.name || site.title || "P").trim();
  // 用展开运算符按码点取首字，避免 emoji 被截成半个代理对
  const ch = escapeXml([...raw][0] ?? "P");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="16" fill="${accent}"/>
  <text x="32" y="45" text-anchor="middle" font-family="PingFang SC,Hiragino Sans GB,Microsoft YaHei,Noto Sans SC,sans-serif" font-size="34" font-weight="700" fill="#070a12">${ch}</text>
</svg>`;

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      // 改名字后最多 10 分钟生效；CDN 侧留 1 小时
      "Cache-Control": "public, max-age=600, s-maxage=3600",
    },
  });
}
