"use client";

import Link from "next/link";

import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/components/LanguageProvider";
import { t } from "@/lib/i18n";

export function TopNav() {
  const { language } = useLanguage();
  const copy = t(language);

  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <Link className="brand" href="/">
          <span className="brand-dot" />
          Daily
        </Link>

        <nav className="main-nav" aria-label="主导航">
          <Link href="/">{copy.nav.home}</Link>
          <Link href="/discover">{copy.nav.discover}</Link>
          <Link href="/bookmarks">{copy.nav.bookmarks}</Link>
        </nav>

        <LanguageToggle />
      </div>
    </header>
  );
}
