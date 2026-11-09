"use client";

import { useRef, useState } from "react";
import { bundledAssets } from "@/data/assets";
import { api, formatBytes, uploadImage } from "./client";

type Row = { id: string; name: string; mime: string; size: number; url: string };

export function MediaLibrary({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [copied, setCopied] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setMsg(null);
    try {
      for (const f of files) await uploadImage(f);
      setRows(await api<Row[]>("GET", "/api/admin/media"));
      setMsg({ ok: true, text: `已上传 ${files.length} 张图片` });
    } catch (x) {
      setMsg({ ok: false, text: x instanceof Error ? x.message : "上传失败" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(r: Row) {
    if (!window.confirm("删除这张图片？正在使用它的内容会显示占位图。")) return;
    try {
      await api("DELETE", `/api/admin/media/${r.id}`);
      setRows((x) => x.filter((i) => i.id !== r.id));
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "删除失败" });
    }
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setMsg({ ok: false, text: "复制失败，请手动复制" });
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="btn btn-primary" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "上传中…" : "+ 上传图片"}
          </button>
          <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onFiles} />
          <span className="text-xs text-faint">浏览器会先自动压缩（最长边 1600px），存入数据库。</span>
          {msg && (
            <span role="status" className={`ml-auto text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>
              {msg.text}
            </span>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="card mt-6 p-10 text-center text-sm text-muted">还没有上传过图片。</p>
        ) : (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r) => (
              <li key={r.id} className="card overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.url} alt={r.name} loading="lazy" className="aspect-video w-full bg-bg-2 object-cover" />
                <div className="p-3">
                  <p className="truncate text-sm">{r.name || r.id}</p>
                  <p className="font-mono text-xs text-faint">
                    {r.mime.replace("image/", "")} · {formatBytes(r.size)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn btn-sm" onClick={() => copy(r.url)}>
                      {copied === r.url ? "已复制" : "复制地址"}
                    </button>
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(r)}>
                      删除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold">内置素材（图库）</h2>
        <p className="mt-1 text-sm text-muted">
          放在 <code className="font-mono text-xs">public/assets/</code> 的静态图片，来自 Pexels（可免费商用）。在编辑项目时可直接选用。
        </p>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {bundledAssets.map((a) => (
            <li key={a.path} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.path} alt={a.label} loading="lazy" className="aspect-video w-full object-cover" />
              <p className="truncate px-2.5 py-2 text-xs text-muted">{a.label}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
