/* eslint-disable @typescript-eslint/no-explicit-any */
// 后台前端通用工具：请求封装、图片压缩上传。

export async function api<T = any>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("登录已过期，请重新登录");
  }
  if (!res.ok) throw new Error(data?.error || `请求失败（${res.status}）`);
  return data as T;
}

const MAX_BYTES = 3 * 1024 * 1024;

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

/** 浏览器端压缩：最长边 1600px，优先 WebP（保留透明），不支持时回退 JPEG。GIF 原样上传。 */
export async function compressImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  let blob = await toBlob(canvas, "image/webp", 0.85);
  if (!blob || blob.type !== "image/webp") {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    blob = await toBlob(canvas, "image/jpeg", 0.86);
  }
  return blob ?? file;
}

export async function uploadImage(file: File): Promise<string> {
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    throw new Error("仅支持 JPG / PNG / WebP / GIF 图片");
  }
  const blob = await compressImage(file);
  if (blob.size > MAX_BYTES) throw new Error("图片压缩后仍超过 3MB，请换一张更小的图片");
  const fd = new FormData();
  fd.append("file", blob, file.name);
  fd.append("name", file.name);
  const res = await fetch("/api/admin/media", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    window.location.href = "/admin/login";
    throw new Error("登录已过期，请重新登录");
  }
  if (!res.ok) throw new Error(data?.error || "上传失败");
  return data.url as string;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
