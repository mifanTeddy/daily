import Link from "next/link";

import { ThemeToggle } from "@/components/ThemeToggle";

export function TopNav() {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link className="brand" href="/">
          <span className="brand-dot" />
          日报技术流
        </Link>

        <nav className="main-nav" aria-label="主导航">
          <Link href="/">首页</Link>
          <Link href="/discover">发现</Link>
          <Link href="/bookmarks">收藏</Link>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
