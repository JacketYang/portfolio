"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string };

export function Header({ name, items }: { name: string; items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-bg/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-[#04110e]">
            {name.slice(0, 1)}
          </span>
          <span className="text-sm font-semibold tracking-wide">{name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="主导航">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={isActive(it.href) ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm transition-colors",
                isActive(it.href) ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
              )}
            >
              {it.label}
            </Link>
          ))}
          <Link href="/about#contact" className="btn btn-primary btn-sm ml-2">
            联系我
          </Link>
        </nav>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-line md:hidden"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="relative block h-3 w-5">
            <span
              className={cn(
                "absolute left-0 top-0 h-px w-5 bg-fg transition-transform",
                open && "translate-y-[6px] rotate-45",
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-[11px] h-px w-5 bg-fg transition-transform",
                open && "-translate-y-[5px] -rotate-45",
              )}
            />
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="移动端导航"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-bg/95 md:hidden"
          >
            <div className="container-page flex flex-col py-3">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-3 text-base",
                    isActive(it.href) ? "bg-surface-2 text-fg" : "text-muted",
                  )}
                >
                  {it.label}
                </Link>
              ))}
              <Link
                href="/about#contact"
                onClick={() => setOpen(false)}
                className="btn btn-primary mt-2"
              >
                联系我
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
