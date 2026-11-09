"use client";

import { useEffect, useRef, useState } from "react";
import { bundledAssets } from "@/data/assets";
import { safeImg } from "@/lib/safe";
import { api, formatBytes, uploadImage } from "./client";

type MediaRow = { id: string; name: string; size: number; url: string };

export function MediaPickerModal({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"uploaded" | "bundled">("uploaded");
  const [rows, setRows] = useState<MediaRow[] | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    api<MediaRow[]>("GET", "/api/admin/media")
      .then(setRows)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="选择图片"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl border border-line-strong bg-bg-2 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {(["uploaded", "bundled"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`btn btn-sm ${tab === t ? "!border-accent/60 !bg-accent/15" : ""}`}
              >
                {t === "uploaded" ? "已上传" : "内置素材"}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="overflow-y-auto">
          {tab === "uploaded" && (
            <>
              {err && <p className="text-sm text-danger">{err}</p>}
              {rows && rows.length === 0 && <p className="py-8 text-center text-sm text-muted">还没有上传过图片。</p>}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {(rows ?? []).map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => onPick(m.url)}
                      className="card card-hover block w-full overflow-hidden text-left"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={m.url} alt={m.name} loading="lazy" className="aspect-video w-full object-cover" />
                      <p className="truncate px-2.5 py-1.5 text-xs text-muted">
                        {m.name || m.id} · {formatBytes(m.size)}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {tab === "bundled" && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {bundledAssets.map((a) => (
                <li key={a.path}>
                  <button
                    type="button"
                    onClick={() => onPick(a.path)}
                    className="card card-hover block w-full overflow-hidden text-left"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={a.path} alt={a.label} loading="lazy" className="aspect-video w-full object-cover" />
                    <p className="truncate px-2.5 py-1.5 text-xs text-muted">{a.label}（图库）</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export function ImagePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = safeImg(value);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(f));
    } catch (x) {
      setErr(x instanceof Error ? x.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-line bg-bg-2">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="预览" className="h-full w-full object-contain" />
        ) : (
          <div className="grid h-full place-items-center text-xs text-faint">无图片</div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/api/media/… · /assets/… · https://…"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn btn-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? "上传中…" : "上传图片"}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => setOpen(true)}>
            选择已有
          </button>
          {value && (
            <button type="button" className="btn btn-sm" onClick={() => onChange("")}>
              清除
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onFile} />
        </div>
        {err && <p className="text-xs text-danger">{err}</p>}
      </div>
      {open && (
        <MediaPickerModal
          onClose={() => setOpen(false)}
          onPick={(u) => {
            onChange(u);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
