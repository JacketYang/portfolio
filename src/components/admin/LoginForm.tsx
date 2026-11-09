"use client";

import { useState } from "react";

export function LoginForm({ configured }: { configured: boolean }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "登录失败");
      window.location.href = "/admin";
    } catch (x) {
      setErr(x instanceof Error ? x.message : "登录失败");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
      <div>
        <h1 className="text-xl font-semibold">后台登录</h1>
        <p className="mt-1 text-sm text-muted">请输入管理员密码。</p>
      </div>
      {!configured && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          服务器没有配置 ADMIN_PASSWORD（至少 8 位），后台已禁用。请在环境变量里设置后重启。
        </p>
      )}
      <div>
        <label className="label" htmlFor="pw">
          密码
        </label>
        <input
          id="pw"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
      </div>
      {err && (
        <p role="alert" className="text-sm text-danger">
          {err}
        </p>
      )}
      <button type="submit" className="btn btn-primary w-full" disabled={busy || !configured}>
        {busy ? "登录中…" : "登录"}
      </button>
    </form>
  );
}
