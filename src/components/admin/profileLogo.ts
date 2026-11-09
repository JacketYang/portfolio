import type { Field } from "./config";

/**
 * 「个人信息」额外支持上传姓名旁边的小标志（类似网站 logo）。
 * 和联系方式二维码一样单独定义、渲染前注入，避免改动体积较大的 config.ts。
 * 留空时前台继续用「姓名首字 + 主题渐变」的方块。
 */
const LOGO_FIELD: Field = {
  type: "image",
  key: "logo",
  label: "姓名旁边的标志（可选）",
  help: "会显示在页头姓名左侧，建议正方形 PNG（透明背景更好）。留空则用姓名首字。",
};

export function withProfileLogo(fields: Field[]): Field[] {
  const at = fields.findIndex((f) => f.key === "name");
  const next = [...fields];
  next.splice(at < 0 ? 0 : at + 1, 0, LOGO_FIELD);
  return next;
}
