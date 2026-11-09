import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="h-section mt-3">没有找到这个页面</h1>
        <Link href="/" className="btn btn-primary mt-6">
          回到首页
        </Link>
      </div>
    </div>
  );
}
