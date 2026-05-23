import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 竞品分析工具",
  description: "智能竞品分析，一键生成深度洞察",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="text-slate-100 antialiased">{children}</body>
    </html>
  );
}
