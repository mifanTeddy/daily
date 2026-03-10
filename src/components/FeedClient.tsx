"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { FeedTabs } from "@/components/FeedTabs";
import { useLanguage } from "@/components/LanguageProvider";
import { Sidebar } from "@/components/Sidebar";
import { TopicFilters } from "@/components/TopicFilters";
import { fetchFeed, fetchTopics } from "@/lib/client-api";
import { t } from "@/lib/i18n";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article, FeedTab, TopicMeta, TopicOption } from "@/lib/types";

const FOLLOWING_TOPICS = ["AI", "前端", "后端", "开源", "Backend", "Frontend", "Open Source"];
const ALL_TOPIC = "__all__";

export function FeedClient() {
  const { language } = useLanguage();
  const copy = t(language);

  const [tab, setTab] = useState<FeedTab>("recommended");
  const [topic, setTopic] = useState<string>(ALL_TOPIC);
  const [topics, setTopics] = useState<TopicMeta[]>([]);
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
    fetchTopics(language).then(setTopics);
  }, [language]);

  useEffect(() => {
    setLoading(true);

    fetchFeed({
      tab,
      topic: topic === ALL_TOPIC ? undefined : topic,
      followingTopics: FOLLOWING_TOPICS,
      lang: language
    })
      .then((res) => {
        setItems(res.items);
        setCursor(res.nextCursor);
      })
      .finally(() => setLoading(false));
  }, [language, tab, topic]);

  const handleLoadMore = () => {
    if (!cursor) {
      return;
    }

    setLoadingMore(true);
    fetchFeed({
      tab,
      topic: topic === ALL_TOPIC ? undefined : topic,
      cursor,
      followingTopics: FOLLOWING_TOPICS,
      lang: language
    })
      .then((res) => {
        setItems((prev) => [...prev, ...res.items]);
        setCursor(res.nextCursor);
      })
      .finally(() => setLoadingMore(false));
  };

  const topicOptions = useMemo<TopicOption[]>(() => {
    const allCount = topics.reduce((sum, entry) => sum + entry.count, 0);
    return [{ value: ALL_TOPIC, label: copy.common.allTopics, count: allCount }, ...topics.map((entry) => ({
      value: entry.name,
      label: entry.name,
      count: entry.count
    }))];
  }, [copy.common.allTopics, topics]);

  return (
    <div className="layout-grid">
      <Sidebar topics={topicOptions.map((entry) => ({ name: entry.label, count: entry.count }))} />

      <section className="feed-pane">
        <header className="section-head">
          <div>
            <h1>{copy.feed.title[tab]}</h1>
            <p>{copy.feed.subtitle}</p>
          </div>
          <FeedTabs active={tab} onChange={setTab} />
        </header>

        <TopicFilters active={topic} onChange={setTopic} topics={topicOptions} />

        {loading ? (
          <div className="loading-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={String(i)} className="skeleton-card" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="empty-box">{copy.feed.empty}</div>
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
            {loadingMore ? copy.feed.loading : copy.feed.loadMore}
          </button>
        ) : null}
      </section>
    </div>
  );
}
