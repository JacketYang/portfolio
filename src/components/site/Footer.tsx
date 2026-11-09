import Link from "next/link";
import type { NavItem } from "./Header";

export function Footer({
  name,
  headline,
  text,
  icp,
  items,
}: {
  name: string;
  headline: string;
  text: string;
  icp: string;
  items: NavItem[];
}) {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="container-page flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="text-sm font-semibold">{name}</p>
          {headline && <p className="mt-1 text-sm text-muted">{headline}</p>}
          {text && <p className="mt-4 text-xs leading-relaxed text-faint">{text}</p>}
        </div>
        <nav aria-label="页脚导航" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="transition-colors hover:text-fg">
              {it.label}
            </Link>
          ))}
          <Link href="/resume" className="transition-colors hover:text-fg">
            简历（可打印）
          </Link>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-faint">
          <span>© {new Date().getFullYear()} {name}</span>
          {icp && (
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-muted">
              {icp}
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
