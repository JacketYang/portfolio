import type { Field } from "./config";

/**
 * 「联系方式」每一项额外支持上传二维码（微信 / QQ / 群码等）。
 * 这里单独定义、在渲染前注入，避免把二维码写死成只有「微信」类型才有的字段：
 * 任何一类联系方式都能挂二维码，没上传的项前台不会出现二维码入口。
 */
const QR_FIELD: Field = {
  type: "image",
  key: "qrcode",
  label: "二维码图片（可选）",
  help: "微信 / QQ / 群二维码等；前台点「二维码」后展开。留空则前台不显示。",
};

export function withContactQr(fields: Field[]): Field[] {
  return fields.map((f) => {
    if (f.type !== "list" || f.key !== "contacts") return f;
    const at = f.fields.findIndex((x) => x.key === "value");
    const next = [...f.fields];
    next.splice(at < 0 ? next.length : at + 1, 0, QR_FIELD);
    return { ...f, fields: next };
  });
}
