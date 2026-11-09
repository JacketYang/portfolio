"use client";

import { useState } from "react";
import { api } from "./client";
import { SETTINGS_CONFIG } from "./config";
import { withContactQr } from "./contactQr";
import { withProfileLogo } from "./profileLogo";
import { withSiteIcon } from "./siteIcon";
import { FormFields, cleanValue } from "./FormFields";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function SettingsEditor({ doc, initial }: { doc: "profile" | "site"; initial: any }) {
  const cfg = SETTINGS_CONFIG[doc];
  const fields =
    doc === "profile" ? withProfileLogo(withContactQr(cfg.fields)) : withSiteIcon(cfg.fields);
  const [data, setData] = useState<any>(initial);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function save() {
    setSaving(true);
    setMsg(null);
    try {
      const payload = cleanValue(fields, data);
      const saved = await api("PUT", `/api/admin/settings/${doc}`, payload);
      setData(saved);
      setMsg({ ok: true, text: "已保存，刷新前台即可看到变化" });
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "保存失败" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="card p-5 sm:p-6">
        <FormFields fields={fields} value={data} isNew lookups={{ categories: [], projects: [] }} onChange={setData} />
      </div>
      <div className="sticky bottom-0 -mx-1 mt-4 flex flex-wrap items-center gap-3 border-t border-line bg-bg/90 px-1 py-4 backdrop-blur">
        <button type="button" className="btn btn-primary" disabled={saving} onClick={save}>
          {saving ? "保存中…" : "保存设置"}
        </button>
        {msg && (
          <p role="status" className={`text-sm ${msg.ok ? "text-accent" : "text-danger"}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
