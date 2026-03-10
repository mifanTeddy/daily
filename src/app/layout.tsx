import type { Metadata } from "next";

import { TopNav } from "@/components/TopNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "日报技术流 | 中文开发者内容聚合",
  description: "中文技术版 daily.dev 前端示例，支持主题、收藏、筛选与详情页。"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="zh-CN" data-theme="dark">
      <body>
        <TopNav />
        <main className="app-main">{children}</main>
      </body>
    </html>
  );
}
