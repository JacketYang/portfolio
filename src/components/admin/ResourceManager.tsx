"use client";

import { useEffect, useMemo, useState } from "react";
import { safeImg } from "@/lib/safe";
import type { ResourceName } from "@/lib/resources";
import { api } from "./client";
import { RESOURCE_CONFIG } from "./config";
import { FormFields, blankOf, cleanValue, type Lookups } from "./FormFields";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Editing = { isNew: boolean; data: any } | null;

function Switch({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors ${
        on ? "border-accent/60 bg-accent/30" : "border-line-strong bg-white/5"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all ${
          on ? "left-[1.35rem] bg-accent" : "left-0.5 bg-faint"
        }`}
        style={{ width: "1.1rem", height: "1.1rem" }}
      />
    </button>
  );
}

export function ResourceManager({
  resource,
  initialItems,
  lookups,
  openId,
}: {
  resource: ResourceName;
  initialItems: any[];
  lookups: Lookups;
  openId?: string;
}) {
  const cfg = RESOURCE_CONFIG[resource];
  const [items, setItems] = useState<any[]>(initialItems);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Editing>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formErr, setFormErr] = useState("");
  const base = `/api/admin/${resource}`;

  useEffect(() => {
    if (!openId) return;
    const it = initialItems.find((i) => i.id === openId);
    if (it) setEditing({ isNew: false, data: structuredClone(it) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!editing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [editing]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((it) => {
      if (!needle) return true;
      const r = cfg.row(it, lookups);
      return `${r.title} ${r.sub ?? ""}`.toLowerCase().includes(needle);
    });
  }, [items, q, cfg, lookups]);

  function flash(ok: boolean, text: string) {
    setMsg({ ok, text });
    setTimeout(() => setMsg((m) => (m?.text === text ? null : m)), 3500);
  }

  async function reload() {
    setItems(await api<any[]>("GET", base));
  }

  async function run(fn: () => Promise<unknown>, okText?: string) {
    try {
      await fn();
      await reload();
      if (okText) flash(true, okText);
    } catch (e) {
      flash(false, e instanceof Error ? e.message : "操作失败");
    }
  }

  async function save() {
    if (!editing) return;
    setSaving(true);
    setFormErr("");
    try {
      const payload = cleanValue(cfg.fields, editing.data);
      if (editing.isNew) {
        if (!payload.id) delete payload.id;
        await api("POST", base, payload);
      } else {
        const { id, ...rest } = payload;
        await api("PUT", `${base}/${id}`, rest);
      }
      setEditing(null);
      await reload();
      flash(true, "已保存");
    } catch (e) {
      setFormErr(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  const toggle = (it: any, key: "visible" | "featured") =>
    run(() => api("PUT", `${base}/${it.id}`, { [key]: !it[key] }));
  const move = (it: any, dir: "up" | "down") => run(() => api("POST", `${base}/${it.id}/move`, { dir }));
  const remove = (it: any) => {
    const name = cfg.row(it, lookups).title;
    if (!window.confirm(`确定删除「${name}」吗？此操作不可撤销。\n（只是暂时不想展示的话，请改用“隐藏”开关。）`)) return;
    run(() => api("DELETE", `${base}/${it.id}`), "已删除");
  };
  const duplicate = (it: any) => {
    const { id: _id, sort: _s, createdAt: _c, updatedAt: _u, ...rest } = it;
    void _id;
    void _s;
    void _c;
    void _u;
    run(
      () => api("POST", base, { ...rest, [cfg.titleKey]: `${it[cfg.titleKey]}（副本）`, visible: false }),
      "已复制为一条隐藏的新记录",
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormErr("");
            setEditing({ isNew: true, data: blankOf(cfg.fields, cfg.defaults) });
          }}
        >
          + 新增{cfg.singular}
        </button>
        <input
          type="search"
          className="input max-w-xs"
          placeholder="搜索…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="搜索"
        />
        <span className="text-xs text-faint">共 {items.length} 条</span>
        {msg && (
          <span role="status" className={`ml-auto text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>
            {msg.text}
          </span>
        )}
      </div>

      {rows.length === 0 ? (
        <p className="card mt-6 p-10 text-center text-sm text-muted">
          {items.length === 0 ? `还没有${cfg.singular}，点击上方「新增」开始。` : "没有匹配的结果。"}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((it) => {
            const r = cfg.row(it, lookups);
            const idx = items.findIndex((x) => x.id === it.id);
            const thumb = safeImg(r.thumb);
            return (
              <li key={it.id} className={`card flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap sm:gap-4 ${it.visible === false ? "opacity-60" : ""}`}>
                {thumb && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={thumb} alt="" loading="lazy" className="hidden h-14 w-24 shrink-0 rounded-lg object-cover sm:block" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.title}</p>
                  {r.sub && <p className="truncate text-xs text-faint">{r.sub}</p>}
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {it.visible === false && <span className="chip !border-danger/40 !text-danger">已隐藏</span>}
                    {(r.badges ?? []).map((b) => (
                      <span key={b} className="chip">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {cfg.toggles.includes("featured") && (
                    <button
                      type="button"
                      className={`btn btn-sm ${it.featured ? "!border-accent/60 !text-accent" : ""}`}
                      aria-pressed={!!it.featured}
                      onClick={() => toggle(it, "featured")}
                      title="是否在首页精选展示"
                    >
                      {it.featured ? "★ 精选" : "☆ 精选"}
                    </button>
                  )}
                  {cfg.toggles.includes("visible") && (
                    <Switch on={it.visible !== false} label={it.visible !== false ? "显示中（点击隐藏）" : "已隐藏（点击显示）"} onClick={() => toggle(it, "visible")} />
                  )}
                  {cfg.sortable && !q && (
                    <>
                      <button type="button" className="btn btn-sm" aria-label="上移" disabled={idx <= 0} onClick={() => move(it, "up")}>
                        ↑
                      </button>
                      <button type="button" className="btn btn-sm" aria-label="下移" disabled={idx >= items.length - 1} onClick={() => move(it, "down")}>
                        ↓
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => {
                      setFormErr("");
                      setEditing({ isNew: false, data: structuredClone(it) });
                    }}
                  >
                    编辑
                  </button>
                  <button type="button" className="btn btn-sm" onClick={() => duplicate(it)}>
                    复制
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(it)}>
                    删除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70" role="dialog" aria-modal="true" aria-label={`${editing.isNew ? "新增" : "编辑"}${cfg.singular}`}>
          <div className="flex h-full w-full max-w-3xl flex-col border-l border-line-strong bg-bg-2">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-lg font-semibold">
                {editing.isNew ? "新增" : "编辑"}
                {cfg.singular}
              </h2>
              <button type="button" className="btn btn-sm" onClick={() => setEditing(null)}>
                关闭
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <FormFields
                fields={cfg.fields}
                value={editing.data}
                isNew={editing.isNew}
                lookups={lookups}
                onChange={(data) => setEditing({ ...editing, data })}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
              <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
                {saving ? "保存中…" : "保存"}
              </button>
              <button type="button" className="btn" onClick={() => setEditing(null)}>
                取消
              </button>
              {formErr && (
                <p role="alert" className="min-w-0 flex-1 text-sm text-danger">
                  {formErr}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
