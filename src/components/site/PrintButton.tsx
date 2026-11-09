"use client";

export function PrintButton() {
  return (
    <button type="button" className="btn btn-primary" onClick={() => window.print()}>
      打印 / 保存为 PDF
    </button>
  );
}
