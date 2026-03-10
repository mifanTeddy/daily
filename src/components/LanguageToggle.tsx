"use client";

import { t } from "@/lib/i18n";

import { useLanguage } from "@/components/LanguageProvider";

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const copy = t(language);

  return (
    <button className="action-btn" onClick={toggleLanguage} type="button">
      {copy.common.switchLang}
    </button>
  );
}
