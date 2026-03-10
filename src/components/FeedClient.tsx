"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { FeedTabs } from "@/components/FeedTabs";
import { Sidebar } from "@/components/Sidebar";
import { TopicFilters } from "@/components/TopicFilters";
import { fetchFeed, fetchTopics } from "@/lib/client-api";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article, FeedTab, TopicMeta } from "@/lib/types";

const FOLLOWING_TOPICS = ["AI", "前端", "后端", "开源"];

export function FeedClient() {
  const [tab, setTab] = useState<FeedTab>("recommended");
  const [topic, setTopic] = useState("全部");
  const [topics, setTopics] = useState<TopicMeta[]>([{ name: "全部", count: 0 }]);
  const [items, setItems] = useState<Article[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedSet(getBookmarks());
    setReadSet(getReadItems());
  }, []);

  useEffect(() => {
    fetchTopics().then(setTopics);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchFeed({ tab, topic, followingTopics: FOLLOWING_TOPICS })
      .then((res) => {
        setItems(res.items);
        setCursor(res.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [tab, topic]);

  const handleLoadMore = () => {
    if (!cursor) {
      return;
    }

    setLoadingMore(true);
    fetchFeed({ tab, topic, cursor, followingTopics: FOLLOWING_TOPICS })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items]);
        setCursor(res.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  };

  const headerTitle = useMemo(() => {
    if (tab === "latest") {
      return "最新上架";
    }
    if (tab === "following") {
      return "关注主题";
    }
    return "为你推荐";
  }, [tab]);

  return (
    <div className="layout-grid">
      <Sidebar topics={topics} />

      <section className="feed-pane">
        <header className="section-head">
          <div>
            <h1>{headerTitle}</h1>
            <p>每日精选中文技术内容，保持信息密度，不灌水。</p>
          </div>
          <FeedTabs active={tab} onChange={setTab} />
        </header>

        <TopicFilters active={topic} onChange={setTopic} topics={topics} />

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={String(i)} className="skeleton-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-box">当前筛选下暂无内容，试试切换主题或标签。</div>
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

        {cursor ? (
          <button className="load-more" disabled={loadingMore} onClick={handleLoadMore} type="button">
            {loadingMore ? "加载中..." : "加载更多"}
          </button>
        ) : null}
      </section>
    </div>
  );
}
