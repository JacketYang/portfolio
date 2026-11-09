"use client";

import { useState } from "react";
import { CONTACT_LABEL } from "@/lib/constants";
import { safeHref } from "@/lib/safe";
import type { PublicContact } from "@/lib/types";

function hrefFor(c: PublicContact, value: string): string | null {
  if (c.type === "phone") return `tel:${value.replace(/[^\d+]/g, "")}`;
  if (c.type === "email") return `mailto:${encodeURI(value)}`;
  if (c.type === "link") {
    const h = safeHref(value);
    return h === "#" ? null : h;
  }
  return null;
}

export function ContactList({ items, tone = "dark" }: { items: PublicContact[]; tone?: "dark" | "light" }) {
  const [shown, setShown] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function reveal(index: number) {
    setBusy(index);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = (await res.json()) as { value?: string; error?: string };
      if (!res.ok || !data.value) throw new Error(data.error || "获取失败");
      setShown((s) => ({ ...s, [index]: data.value as string }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取失败");
    } finally {
      setBusy(null);
    }
  }

  async function copy(index: number, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(index);
      setTimeout(() => setCopied((c) => (c === index ? null : c)), 1500);
    } catch {
      setError("复制失败，请手动选择文字复制");
    }
  }

  if (!items.length) return null;
  const light = tone === "light";

  return (
    <div>
      <ul className={light ? "space-y-1.5" : "divide-y divide-line"}>
        {items.map((c) => {
          const full = shown[c.index];
          const value = full ?? c.display;
          const needReveal = c.reveal && !full;
          const href = needReveal ? null : hrefFor(c, value);
          return (
            <li
              key={c.index}
              className={light ? "flex items-baseline gap-3 text-sm" : "flex flex-wrap items-center justify-between gap-3 py-3.5"}
            >
              <span className={light ? "w-12 shrink-0 text-neutral-500" : "w-14 shrink-0 text-sm text-faint"}>
                {c.label || CONTACT_LABEL[c.type]}
              </span>
              <span className="min-w-0 flex-1 break-all font-mono text-sm">
                {href ? (
                  <a
                    href={href}
                    {...(c.type === "link" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={light ? "" : "text-fg hover:text-accent"}
                  >
                    {value}
                  </a>
                ) : (
                  <span className={light ? "" : "text-fg"}>{value}</span>
                )}
              </span>
              <span className="no-print flex gap-2">
                {needReveal ? (
                  <button type="button" className="btn btn-sm" disabled={busy === c.index} onClick={() => reveal(c.index)}>
                    {busy === c.index ? "获取中…" : "点击查看"}
                  </button>
                ) : (
                  <button type="button" className="btn btn-sm" onClick={() => copy(c.index, value)}>
                    {copied === c.index ? "已复制" : "复制"}
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
