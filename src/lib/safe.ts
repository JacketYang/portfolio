// 链接 / 图片地址白名单。后台写入时校验，前台渲染时再次兜底，避免 javascript: 之类的注入。

const URL_RE = /^(https?:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*|mailto:[^\s<>"']+)$/i;
const IMG_RE = /^(https?:\/\/[^\s<>"']+|\/(?!\/)[^\s<>"']*)$/i;

export const isSafeUrl = (v: string) => URL_RE.test(v);
export const isSafeImage = (v: string) => IMG_RE.test(v);

export const safeHref = (v: string | undefined | null) =>
  v && isSafeUrl(v) ? v : "#";

export const safeImg = (v: string | undefined | null) =>
  v && isSafeImage(v) ? v : "";

export const isExternal = (v: string) => /^https?:\/\//i.test(v);

export const isVideoFile = (v: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(v);
