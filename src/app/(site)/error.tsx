"use client";

export default function SiteError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-page grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow">出错了</p>
        <h1 className="h-section mt-3">页面暂时无法显示</h1>
        <p className="mt-3 text-muted">请稍后再试，或返回首页。</p>
        <button type="button" onClick={reset} className="btn btn-primary mt-6">
          重试
        </button>
      </div>
    </div>
  );
}
