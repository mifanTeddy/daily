"use client";

import type { FeedTab } from "@/lib/types";

const tabLabels: Record<FeedTab, string> = {
  recommended: "推荐",
  latest: "最新",
  following: "关注"
};

export function FeedTabs(props: {
  active: FeedTab;
  onChange: (tab: FeedTab) => void;
}) {
  const { active, onChange } = props;

  return (
    <div className="tabs" role="tablist" aria-label="信息流类型">
      {(Object.keys(tabLabels) as FeedTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          className={active === tab ? "tab active" : "tab"}
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
        >
          {tabLabels[tab]}
        </button>
      ))}
    </div>
  );
}
