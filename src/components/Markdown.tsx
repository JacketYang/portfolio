import type { ReactNode } from "react";
import { isExternal, isSafeUrl } from "@/lib/safe";

// 极简 Markdown 渲染：段落、列表、标题、引用、**粗体**、`代码`、[链接](url)。
// 不使用 dangerouslySetInnerHTML：所有内容都是 React 节点，天然防 XSS；链接做协议白名单。

const INLINE = /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={key}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return <code key={key}>{part.slice(1, -1)}</code>;
    }
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (m) {
      const [, label, url] = m;
      if (!isSafeUrl(url)) return label;
      return (
        <a
          key={key}
          href={url}
          {...(isExternal(url) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

type Block =
  | { t: "p"; lines: string[] }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "h"; text: string }
  | { t: "q"; lines: string[] };

function parse(src: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block | null = null;
  const flush = () => {
    if (cur) blocks.push(cur);
    cur = null;
  };
  for (const raw of src.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^#{1,4}\s+(.+)$/))) {
      flush();
      blocks.push({ t: "h", text: m[1] });
    } else if ((m = line.match(/^\s*[-*•]\s+(.+)$/))) {
      if (!cur || cur.t !== "ul") {
        flush();
        cur = { t: "ul", items: [] };
      }
      cur.items.push(m[1]);
    } else if ((m = line.match(/^\s*\d+[.、)]\s+(.+)$/))) {
      if (!cur || cur.t !== "ol") {
        flush();
        cur = { t: "ol", items: [] };
      }
      cur.items.push(m[1]);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      if (!cur || cur.t !== "q") {
        flush();
        cur = { t: "q", lines: [] };
      }
      cur.lines.push(m[1]);
    } else {
      if (!cur || cur.t !== "p") {
        flush();
        cur = { t: "p", lines: [] };
      }
      cur.lines.push(line);
    }
  }
  flush();
  return blocks;
}

export function Markdown({ source, className = "" }: { source: string; className?: string }) {
  if (!source || !source.trim()) return null;
  const blocks = parse(source);
  return (
    <div className={`md ${className}`}>
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.t) {
          case "h":
            return <h4 key={k}>{inline(b.text, k)}</h4>;
          case "ul":
          case "ol": {
            const Tag = b.t;
            return (
              <Tag key={k}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it, `${k}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          case "q":
            return (
              <blockquote key={k}>
                {b.lines.map((l, j) => (
                  <p key={j}>{inline(l, `${k}-${j}`)}</p>
                ))}
              </blockquote>
            );
          default:
            return (
              <p key={k}>
                {b.lines.map((l, j) => (
                  <span key={j}>
                    {j > 0 && <br />}
                    {inline(l, `${k}-${j}`)}
                  </span>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
}
