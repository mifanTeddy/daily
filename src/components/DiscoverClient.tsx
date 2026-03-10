"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { useLanguage } from "@/components/LanguageProvider";
import { TopicFilters } from "@/components/TopicFilters";
import { fetchFeed, fetchTopics } from "@/lib/client-api";
import { t } from "@/lib/i18n";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article, TopicMeta, TopicOption } from "@/lib/types";

const ALL_TOPIC = "__all__";

export function DiscoverClient() {
  const { language } = useLanguage();
  const copy = t(language);

  const [topic, setTopic] = useState<string>(ALL_TOPIC);
  const [topics, setTopics] = useState<TopicMeta[]>([]);
  const [items, setItems] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
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
    fetchFeed({ tab: "recommended", topic: topic === ALL_TOPIC ? undefined : topic, lang: language }).then((res) => {
      setItems(
        [...res.items].sort(
          (a, b) => b.qualityScore + b.hotScore + b.freshnessScore - (a.qualityScore + a.hotScore + a.freshnessScore)
        )
      );
      setLoading(false);
    });
  }, [language, topic]);

  const subtitle = useMemo(() => {
    if (topic === ALL_TOPIC) {
      return copy.discover.allSubtitle;
    }
    return `${copy.discover.topicPrefix}${topic}`;
  }, [copy.discover.allSubtitle, copy.discover.topicPrefix, topic]);

  const topicOptions = useMemo<TopicOption[]>(() => {
    const allCount = topics.reduce((sum, entry) => sum + entry.count, 0);
    return [{ value: ALL_TOPIC, label: copy.common.allTopics, count: allCount }, ...topics.map((entry) => ({
      value: entry.name,
      label: entry.name,
      count: entry.count
    }))];
  }, [copy.common.allTopics, topics]);

  return (
    <section className="standalone-page">
      <header className="section-head simple">
        <div>
          <h1>{copy.discover.title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      <TopicFilters active={topic} onChange={setTopic} topics={topicOptions} />

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
