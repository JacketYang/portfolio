"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

// 尊重系统「减少动态效果」设置：开启后所有位移/缩放动画自动关闭。
export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
