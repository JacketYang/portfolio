import { cookies } from "next/headers";

// 单管理员认证：密码来自环境变量 ADMIN_PASSWORD，会话是 HMAC 签名的 Cookie。
// 使用 Web Crypto（crypto.subtle），Node 与 Cloudflare Workers 通用。

export const SESSION_COOKIE = "site_admin";
export const SESSION_TTL = 60 * 60 * 24 * 7; // 7 天

const enc = new TextEncoder();

export function adminConfigured(): boolean {
  const p = process.env.ADMIN_PASSWORD;
  return !!p && p.length >= 8;
}

/** 签名密钥：优先 SESSION_SECRET；否则由 ADMIN_PASSWORD 派生（改密码会让旧会话失效） */
function signingKey(): string | null {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 16) return s;
  const p = process.env.ADMIN_PASSWORD;
  if (p && p.length >= 8) return `derived:${p}`;
  return null;
}

async function hmacHex(key: string, message: string): Promise<string> {
  const k = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

/** 常量时间比较密码：先各自做 HMAC，再比较定长摘要 */
export async function verifyPassword(input: string): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!adminConfigured() || !pw) return false;
  const [a, b] = await Promise.all([hmacHex("pw-check", input), hmacHex("pw-check", pw)]);
  return safeEqual(a, b);
}

export async function createSessionToken(): Promise<string> {
  const key = signingKey();
  if (!key) throw new Error("ADMIN_PASSWORD 未配置");
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL;
  const payload = `${exp}.${crypto.randomUUID()}`;
  return `${payload}.${await hmacHex(key, payload)}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const key = signingKey();
  if (!key || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expStr, nonce, sig] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(key, `${expStr}.${nonce}`);
  return safeEqual(expected, sig);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
