"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// 页面切换动画：只用 opacity + transform，开销很低；系统开启"减少动态效果"时自动关闭位移。
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
