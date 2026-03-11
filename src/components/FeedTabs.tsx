"use client";

import { getTabLabel, t } from "@/lib/i18n";
import type { FeedTab } from "@/lib/types";
import { useLanguage } from "@/components/LanguageProvider";

export function FeedTabs(props: {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}) {
  const { active, onChange } = props;
  const { language } = useLanguage();
  const copy = t(language);

  return (
    <div className="tabs" role="tablist" aria-label={copy.feed.tabAria}>
      {(["latest", "recommended", "following"] as FeedTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          className={active === tab ? "tab active" : "tab"}
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
        >
          {getTabLabel(language, tab)}
        </button>
      ))}
    </div>
  );
}
