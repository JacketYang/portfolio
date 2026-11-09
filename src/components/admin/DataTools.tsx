"use client";

import { useRef, useState } from "react";
import { api } from "./client";

export function DataTools() {
  const [withMedia, setWithMedia] = useState(true);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!window.confirm("导入会用备份文件里的内容「替换」当前对应的内容，且无法撤销。建议先导出一份当前备份。\n\n确定继续吗？")) return;
    setBusy(true);
    setMsg(null);
    try {
      const text = await file.text();
      let json: unknown;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error("文件不是合法的 JSON 备份");
      }
      const res = await api<{ counts: Record<string, number | null> }>("POST", "/api/admin/import", json);
      const parts = Object.entries(res.counts)
        .filter(([, n]) => n !== null)
        .map(([k, n]) => `${k}:${n}`)
        .join("，");
      setMsg({ ok: true, text: `导入成功（${parts}）。请刷新页面查看。` });
    } catch (x) {
      setMsg({ ok: false, text: x instanceof Error ? x.message : "导入失败" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">备份与迁移</h2>
      <p className="mt-1 text-sm text-muted">
        把全部内容导出为一个 JSON 文件，可用于备份，或迁移到新的部署环境（在新环境后台导入即可）。
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a className="btn" href={`/api/admin/export${withMedia ? "?media=1" : ""}`}>
          导出备份
        </a>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" className="h-4 w-4 accent-[var(--accent)]" checked={withMedia} onChange={(e) => setWithMedia(e.target.checked)} />
          包含上传的图片
        </label>
        <button type="button" className="btn" disabled={busy} onClick={() => fileRef.current?.click()}>
          {busy ? "导入中…" : "导入备份"}
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      </div>
      {msg && (
        <p role="status" className={`mt-3 text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>
          {msg.text}
        </p>
      )}
      <p className="mt-3 text-xs text-faint">
        提示：部分托管平台限制请求体大小（如 4.5MB）。图片很多时，建议取消「包含上传的图片」，或直接用 pg_dump 迁移整个数据库（见 docs/DEPLOY.md）。
      </p>
    </div>
  );
}
