import { redirect } from "next/navigation";
import { isAdmin } from "./auth";

/** 后台页面自己再校验一次登录（布局与页面并行渲染，不能只依赖布局）。 */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
