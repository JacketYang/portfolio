import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/site/Footer";
import { Header, type NavItem } from "@/components/site/Header";
import { Providers } from "@/components/site/Providers";
import { HEX_COLOR } from "@/lib/constants";
import { getSiteData } from "@/lib/content";
import { getBaseUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { profile, site } = await getSiteData();
  const base = await getBaseUrl(site.siteUrl);
  return {
    ...(base ? { metadataBase: new URL(base) } : {}),
    title: { default: site.title, template: `%s · ${profile.name}` },
    description: site.description,
    icons: site.icon
      ? { icon: [{ url: site.icon }], apple: [{ url: site.icon }] }
      : { icon: [{ url: "/icon", type: "image/svg+xml" }] },
    openGraph: {
      title: site.title,
      description: site.description,
      siteName: site.title,
      type: "website",
      locale: "zh_CN",
    },
    robots: { index: true, follow: true },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const { profile, site } = await getSiteData();
  const nav: NavItem[] = [
    { href: "/", label: "首页" },
    { href: "/projects", label: "项目展厅" },
    { href: "/experience", label: "经历与技能" },
    ...(site.showLog ? [{ href: "/log", label: "成长日志" }] : []),
    { href: "/about", label: "关于我" },
  ];
  const accent = HEX_COLOR.test(site.accent) ? site.accent : "#5eead4";

  return (
    <Providers>
      <div style={{ "--accent": accent } as CSSProperties} className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-bg-2 focus:px-4 focus:py-2"
        >
          跳到正文
        </a>
        <Header name={profile.name} logo={profile.logo} items={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer
          name={profile.name}
          headline={profile.headline}
          text={site.footerText}
          icp={site.icp}
          items={nav}
        />
      </div>
    </Providers>
  );
}
