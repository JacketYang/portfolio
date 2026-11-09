"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { safeImg } from "@/lib/safe";

/**
 * 统一图片组件：懒加载、固定宽高比（避免布局抖动）、加载失败/无图时显示渐变占位。
 * stock=true 时在右下角标注「示意配图」，避免把图库图片误当成真实工作现场。
 */
export function Media({
  src,
  alt,
  stock = false,
  priority = false,
  aspect = "16 / 10",
  color = "#5eead4",
  label,
  className,
  imgClassName,
  fit = "cover",
}: {
  src?: string;
  alt: string;
  stock?: boolean;
  priority?: boolean;
  aspect?: string;
  color?: string;
  label?: string;
  className?: string;
  imgClassName?: string;
  fit?: "cover" | "contain";
}) {
  const clean = safeImg(src);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // 图片在 hydration 之前就加载失败时 onError 不会触发，这里补一次检查
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) queueMicrotask(() => setFailed(true));
  }, [clean]);

  const showImg = clean && !failed;

  return (
    <div
      className={cn("relative overflow-hidden bg-bg-2", className)}
      style={{ aspectRatio: aspect }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={clean}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
            imgClassName,
          )}
        />
      ) : (
        <div
          aria-hidden
          className="grid h-full w-full place-items-center"
          style={{
            background: `radial-gradient(120% 90% at 20% 10%, ${color}33, transparent 60%), linear-gradient(135deg, ${color}22, #0b101b 70%)`,
          }}
        >
          <span className="px-4 text-center font-mono text-xs tracking-widest text-muted/80">
            {label ?? "NO IMAGE"}
          </span>
        </div>
      )}
      {showImg && stock && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-white/80 backdrop-blur">
          示意配图
        </span>
      )}
    </div>
  );
}
