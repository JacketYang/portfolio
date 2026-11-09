"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { safeImg } from "@/lib/safe";
import { Media } from "./Media";

export function Gallery({ items, title }: { items: GalleryItem[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const cur = open === null ? null : items[open];

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {items.map((g, i) => (
          <li key={`${g.src}-${i}`}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="card card-hover block w-full overflow-hidden text-left"
              aria-label={`查看大图：${g.caption || title}`}
            >
              <Media src={g.src} alt={g.caption || `${title} 截图 ${i + 1}`} stock={g.isStock} />
              {g.caption && <p className="px-4 py-3 text-sm text-muted">{g.caption}</p>}
            </button>
          </li>
        ))}
      </ul>

      {cur && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="图片预览"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={close}
        >
          <div className="relative max-h-full w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={safeImg(cur.src)}
              alt={cur.caption || title}
              className="mx-auto max-h-[78vh] w-auto max-w-full rounded-xl object-contain"
            />
            <div className="mt-3 flex items-center justify-between gap-4 text-sm text-white/80">
              <span>
                {cur.caption || title}
                {cur.isStock && <span className="ml-2 text-xs text-white/50">（示意配图）</span>}
              </span>
              <span className="font-mono text-xs text-white/50">
                {(open ?? 0) + 1} / {items.length}
              </span>
            </div>
            <button type="button" onClick={close} aria-label="关闭" className="btn btn-sm absolute -top-3 right-0">
              关闭
            </button>
            {items.length > 1 && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="上一张" className="btn btn-sm absolute left-0 top-1/2 -translate-y-1/2">
                  ←
                </button>
                <button type="button" onClick={() => step(1)} aria-label="下一张" className="btn btn-sm absolute right-0 top-1/2 -translate-y-1/2">
                  →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
