"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { TopicFilters } from "@/components/TopicFilters";
import { fetchFeed, fetchTopics } from "@/lib/client-api";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article, TopicMeta } from "@/lib/types";

export function DiscoverClient() {
  const [topic, setTopic] = useState("全部");
  const [topics, setTopics] = useState<TopicMeta[]>([{ name: "全部", count: 0 }]);
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedSet(getBookmarks());
    setReadSet(getReadItems());
    fetchTopics().then(setTopics);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeed({ tab: "recommended", topic }).then((res) => {
      setItems(
        [...res.items].sort(
          (a, b) => b.qualityScore + b.hotScore + b.freshnessScore - (a.qualityScore + a.hotScore + a.freshnessScore)
        )
      );
      setLoading(false);
    });
  }, [topic]);

  const subtitle = useMemo(() => {
    if (topic === "全部") {
      return "按综合质量排序，优先展示值得精读的内容。";
    }
    return `当前筛选：${topic}`;
  }, [topic]);

  return (
    <section className="standalone-page">
      <header className="section-head simple">
        <div>
          <h1>发现</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      <TopicFilters active={topic} onChange={setTopic} topics={topics} />

      {loading ? (
        <div className="loading-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={String(i)} className="skeleton-card" />
          ))}
        </div>
      ) : (
        <div className="card-list">
          {items.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              isRead={readSet.has(article.id)}
              isSaved={savedSet.has(article.id)}
              onToggleRead={(id) => setReadSet(toggleRead(id))}
              onToggleSave={(id) => setSavedSet(toggleBookmark(id))}
            />
          ))}
        </div>
      )}
    </section>
  );
}
