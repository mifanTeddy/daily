import type { Metadata } from "next";

import { LanguageProvider } from "@/components/LanguageProvider";
import { TopNav } from "@/components/TopNav";

import "./globals.css";

export const metadata: Metadata = {
  title: "日报技术流 | 中文开发者内容聚合",
  description: "中文技术内容聚合前端，支持中英文切换、收藏、筛选与详情页。"
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="zh-CN">
      <body>
        <LanguageProvider>
          <TopNav />
          <main className="app-main">{children}</main>
        </LanguageProvider>
      </body>
    </html>
  );
}
