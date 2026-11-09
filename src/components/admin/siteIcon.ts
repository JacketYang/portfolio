import type { Field } from "./config";

/**
 * 「站点设置」额外支持上传网站图标（favicon）。
 * 与联系方式二维码一样单独定义、在渲染前注入，避免改动体积较大的 config.ts。
 * 留空时前台会用「姓名首字 + 主题色」自动生成一个图标，不会出现空白。
 */
const ICON_FIELD: Field = {
  type: "image",
  key: "icon",
  label: "网站图标（favicon）",
  help: "建议上传正方形 PNG（512×512 或 256×256）。留空则自动用姓名首字 + 主题色生成。",
};

export function withSiteIcon(fields: Field[]): Field[] {
  const at = fields.findIndex((f) => f.key === "title");
  const next = [...fields];
  next.splice(at < 0 ? 0 : at + 1, 0, ICON_FIELD);
  return next;
}
