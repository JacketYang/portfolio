"use client";

import { useState } from "react";
import { Markdown } from "@/components/Markdown";
import { HEX_COLOR } from "@/lib/constants";
import type { Field, Option } from "./config";
import { ImagePicker } from "./ImagePicker";

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Lookups = { categories: Option[]; projects: Option[] };

export function getPath(obj: any, path: string): any {
  return path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

export function setPath(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const root = { ...(obj ?? {}) };
  let cur = root;
  for (let i = 0; i < keys.length - 1; i++) {
    cur[keys[i]] = { ...(cur[keys[i]] ?? {}) };
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  return root;
}

function blankValue(f: Field, lookups?: Lookups): any {
  switch (f.type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "tags":
    case "lines":
    case "multicheck":
    case "list":
      return [];
    case "select":
      return f.options?.[0]?.value ?? "";
    case "color":
      return "#5eead4";
    default:
      return "";
  }
}

export function blankOf(fields: Field[], defaults: Record<string, unknown> = {}): any {
  let out: any = {};
  for (const f of fields) {
    if (f.type === "heading") continue;
    out = setPath(out, f.key, blankValue(f));
  }
  for (const [k, v] of Object.entries(defaults)) out = setPath(out, k, v);
  return out;
}

/** 保存前整理：去掉空行 / 首尾空格，递归处理列表。 */
export function cleanValue(fields: Field[], data: any): any {
  let out = data;
  for (const f of fields) {
    if (f.type === "heading") continue;
    const v = getPath(out, f.key);
    if (f.type === "lines") {
      out = setPath(out, f.key, (v ?? []).map((s: string) => s.trim()).filter(Boolean));
    } else if (f.type === "tags") {
      out = setPath(out, f.key, (v ?? []).map((s: string) => s.trim()).filter(Boolean));
    } else if (f.type === "list") {
      out = setPath(out, f.key, (v ?? []).map((it: any) => cleanValue(f.fields, it)));
    }
  }
  return out;
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [text, setText] = useState("");
  function commit(raw: string) {
    const parts = raw
      .split(/[,，、\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
    setText("");
  }
  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((t) => (
            <li key={t} className="chip !text-fg">
              {t}
              <button
                type="button"
                aria-label={`删除 ${t}`}
                className="text-faint hover:text-danger"
                onClick={() => onChange(value.filter((x) => x !== t))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        className="input"
        value={text}
        placeholder={placeholder ?? "输入后按回车添加"}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit(text);
          }
        }}
        onBlur={() => commit(text)}
      />
    </div>
  );
}

function MarkdownInput({
  value,
  onChange,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div>
      {preview ? (
        <div className="card min-h-[6rem] p-4 text-sm">
          {value.trim() ? <Markdown source={value} /> : <p className="text-faint">（空）</p>}
        </div>
      ) : (
        <textarea className="input font-mono !text-[13px]" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      <div className="mt-1.5 flex items-center justify-between">
        <p className="help !mt-0">支持：列表（- 开头）、**粗体**、`代码`、[链接](https://…)</p>
        <button type="button" className="btn btn-sm" onClick={() => setPreview((p) => !p)}>
          {preview ? "返回编辑" : "预览"}
        </button>
      </div>
    </div>
  );
}

function FieldView({
  field,
  value,
  onChange,
  lookups,
  isNew,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  lookups: Lookups;
  isNew: boolean;
}) {
  if (field.type === "heading") {
    return (
      <div className="border-t border-line pt-5 sm:col-span-2">
        <h3 className="text-sm font-semibold">{field.label}</h3>
        {field.help && <p className="help">{field.help}</p>}
      </div>
    );
  }

  const v = getPath(value, field.key);
  const set = (nv: any) => onChange(setPath(value, field.key, nv));
  const wrap = `${field.half ? "" : "sm:col-span-2"}`;

  const labelEl = (
    <label className="label">
      {field.label}
    </label>
  );
  const helpEl = field.help ? <p className="help">{field.help}</p> : null;

  if ("onlyNew" in field && field.onlyNew && !isNew) {
    return (
      <div className={wrap}>
        {labelEl}
        <input className="input opacity-60" value={v ?? ""} readOnly disabled />
      </div>
    );
  }

  switch (field.type) {
    case "text":
    case "url":
      return (
        <div className={wrap}>
          {labelEl}
          <input
            className="input"
            type="text"
            value={v ?? ""}
            placeholder={field.placeholder}
            onChange={(e) => set(e.target.value)}
          />
          {helpEl}
        </div>
      );
    case "number":
      return (
        <div className={wrap}>
          {labelEl}
          <input
            className="input"
            type="number"
            value={Number.isFinite(v) ? v : 0}
            onChange={(e) => set(e.target.value === "" ? 0 : Number(e.target.value))}
          />
          {helpEl}
        </div>
      );
    case "textarea":
      return (
        <div className={wrap}>
          {labelEl}
          <textarea className="input" rows={field.rows ?? 3} value={v ?? ""} onChange={(e) => set(e.target.value)} />
          {helpEl}
        </div>
      );
    case "markdown":
      return (
        <div className={wrap}>
          {labelEl}
          <MarkdownInput value={v ?? ""} rows={field.rows ?? 6} onChange={set} />
          {helpEl}
        </div>
      );
    case "lines":
      return (
        <div className={wrap}>
          {labelEl}
          <textarea
            className="input"
            rows={field.rows ?? 5}
            value={(v ?? []).join("\n")}
            placeholder={field.placeholder}
            onChange={(e) => set(e.target.value.split("\n"))}
          />
          {helpEl}
        </div>
      );
    case "tags":
      return (
        <div className={wrap}>
          {labelEl}
          <TagsInput value={v ?? []} onChange={set} placeholder={field.placeholder} />
          {helpEl}
        </div>
      );
    case "image":
      return (
        <div className={wrap}>
          {labelEl}
          <ImagePicker value={v ?? ""} onChange={set} />
          {helpEl}
        </div>
      );
    case "color": {
      const ok = typeof v === "string" && HEX_COLOR.test(v);
      return (
        <div className={wrap}>
          {labelEl}
          <div className="flex gap-2">
            <input
              type="color"
              aria-label="选择颜色"
              className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-line-strong bg-transparent p-1"
              value={ok ? v : "#5eead4"}
              onChange={(e) => set(e.target.value)}
            />
            <input className="input font-mono" value={v ?? ""} onChange={(e) => set(e.target.value)} placeholder="#5eead4" />
          </div>
          {helpEl}
        </div>
      );
    }
    case "boolean":
      return (
        <div className={wrap}>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 shrink-0 accent-[var(--accent)]"
              checked={!!v}
              onChange={(e) => set(e.target.checked)}
            />
            <span>
              <span className="text-sm">{field.label}</span>
              {field.help && <span className="help block">{field.help}</span>}
            </span>
          </label>
        </div>
      );
    case "select": {
      const options = field.options ?? [
        { value: "", label: "（未选择）" },
        ...(field.optionsFrom ? lookups[field.optionsFrom] : []),
      ];
      return (
        <div className={wrap}>
          {labelEl}
          <select className="input" value={v ?? ""} onChange={(e) => set(e.target.value)}>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {helpEl}
        </div>
      );
    }
    case "multicheck": {
      const cur: string[] = v ?? [];
      return (
        <div className={wrap}>
          {labelEl}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {field.options.map((o) => (
              <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--accent)]"
                  checked={cur.includes(o.value)}
                  onChange={(e) => set(e.target.checked ? [...cur, o.value] : cur.filter((x) => x !== o.value))}
                />
                {o.label}
              </label>
            ))}
          </div>
          {helpEl}
        </div>
      );
    }
    case "list": {
      const items: any[] = Array.isArray(v) ? v : [];
      const move = (i: number, d: number) => {
        const j = i + d;
        if (j < 0 || j >= items.length) return;
        const next = [...items];
        [next[i], next[j]] = [next[j], next[i]];
        set(next);
      };
      return (
        <div className={wrap}>
          {labelEl}
          {helpEl}
          <div className="mt-2 space-y-3">
            {items.map((it, i) => (
              <div key={i} className="card p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-xs text-faint">
                    #{i + 1} {field.summaryKey ? getPath(it, field.summaryKey) : ""}
                  </span>
                  <span className="flex shrink-0 gap-1">
                    <button type="button" className="btn btn-sm" aria-label="上移" onClick={() => move(i, -1)}>
                      ↑
                    </button>
                    <button type="button" className="btn btn-sm" aria-label="下移" onClick={() => move(i, 1)}>
                      ↓
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => set(items.filter((_, j) => j !== i))}
                    >
                      删除
                    </button>
                  </span>
                </div>
                <FormFields
                  fields={field.fields}
                  value={it}
                  lookups={lookups}
                  isNew
                  onChange={(nv) => set(items.map((x, j) => (j === i ? nv : x)))}
                />
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-sm mt-3" onClick={() => set([...items, blankOf(field.fields)])}>
            + {field.addLabel}
          </button>
        </div>
      );
    }
  }
}

export function FormFields({
  fields,
  value,
  onChange,
  lookups,
  isNew,
}: {
  fields: Field[];
  value: any;
  onChange: (v: any) => void;
  lookups: Lookups;
  isNew: boolean;
}) {
  return (
    <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
      {fields.map((f, i) => (
        <FieldView key={`${f.key}-${i}`} field={f} value={value} onChange={onChange} lookups={lookups} isNew={isNew} />
      ))}
    </div>
  );
}
