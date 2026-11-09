import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  desc,
  href,
  hrefLabel,
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h2 className="h-section">{title}</h2>
        {desc && <p className="mt-3 text-muted">{desc}</p>}
      </div>
      {href && (
        <Link href={href} className="text-sm text-accent transition-opacity hover:opacity-80">
          {hrefLabel ?? "查看全部"} →
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="relative border-b border-line">
      <div aria-hidden className="glow pointer-events-none absolute inset-0" />
      <div className="container-page relative pb-10 pt-14 sm:pb-14 sm:pt-20">
        <p className="eyebrow mb-3">{eyebrow}</p>
        <h1 className="h-display !text-[clamp(2rem,5vw,3.25rem)]">{title}</h1>
        {desc && <p className="mt-4 max-w-2xl text-muted">{desc}</p>}
      </div>
    </div>
  );
}
