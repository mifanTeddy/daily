"use client";

import { useEffect, useMemo, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { useLanguage } from "@/components/LanguageProvider";
import { fetchAllArticles } from "@/lib/client-api";
import { t } from "@/lib/i18n";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article } from "@/lib/types";

export function BookmarksClient() {
  const { language } = useLanguage();
  const copy = t(language);

  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    setSavedSet(getBookmarks());
    setReadSet(getReadItems());
  }, []);

  useEffect(() => {
    fetchAllArticles(language).then(setItems);
  }, [language]);

  const savedItems = useMemo(() => items.filter((article) => savedSet.has(article.id)), [items, savedSet]);

  return (
    <section className="standalone-page">
      <header className="section-head simple">
        <div>
          <h1>{copy.bookmarks.title}</h1>
          <p>{copy.bookmarks.subtitle}</p>
        </div>
      </header>

      {savedItems.length === 0 ? (
        <div className="empty-box">{copy.bookmarks.empty}</div>
      ) : (
        <div className="card-list">
          {savedItems.map((article) => (
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
