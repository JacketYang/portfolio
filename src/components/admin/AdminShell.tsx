"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "概览", exact: true },
  { href: "/admin/projects", label: "项目" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/experiences", label: "经历与教育" },
  { href: "/admin/skills", label: "技能" },
  { href: "/admin/logs", label: "成长日志" },
  { href: "/admin/settings/profile", label: "个人信息" },
  { href: "/admin/settings/site", label: "站点设置" },
  { href: "/admin/media", label: "媒体库" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[14rem_1fr]">
      <aside className="border-b border-line bg-bg-2 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:flex-col lg:items-start lg:px-5 lg:py-6">
          <div>
            <p className="text-sm font-semibold">内容管理后台</p>
            <p className="text-xs text-faint">所有前台内容在此维护</p>
          </div>
          <div className="flex gap-2 lg:hidden">
            <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm">
              前台 ↗
            </a>
            <button type="button" className="btn btn-sm" onClick={logout}>
              退出
            </button>
          </div>
        </div>
        <nav aria-label="后台导航" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-0">
          {NAV.map((n) => {
            const active = n.exact ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-sm transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-3 pt-6 lg:block">
          <a href="/" target="_blank" rel="noopener noreferrer" className="btn btn-sm w-full">
            查看前台 ↗
          </a>
          <button type="button" className="btn btn-sm mt-2 w-full" onClick={logout}>
            退出登录
          </button>
        </div>
      </aside>
      <div className="min-w-0 px-4 py-8 sm:px-8 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
