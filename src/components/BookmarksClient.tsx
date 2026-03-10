"use client";

import { useEffect, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { mockArticles } from "@/data/mockArticles";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";

export function BookmarksClient() {
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedSet(getBookmarks());
    setReadSet(getReadItems());
  }, []);

  const savedItems = mockArticles.filter((article) => savedSet.has(article.id));

  return (
    <section className="standalone-page">
      <header className="section-head simple">
        <div>
          <h1>我的收藏</h1>
          <p>你标记的内容会保存在浏览器本地，后续可替换成账号云同步。</p>
        </div>
      </header>

      {savedItems.length === 0 ? (
        <div className="empty-box">还没有收藏内容，去首页或发现页试试。</div>
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
