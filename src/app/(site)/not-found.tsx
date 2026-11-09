import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[55vh] place-items-center py-20 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="h-section mt-3">没有找到这个页面</h1>
        <p className="mt-3 text-muted">它可能已被隐藏或删除。</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            回到首页
          </Link>
          <Link href="/projects" className="btn">
            浏览项目
          </Link>
        </div>
      </div>
    </div>
  );
}
