"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArticleCard } from "@/components/ArticleCard";
import { fetchArticle, fetchRelatedArticles } from "@/lib/client-api";
import { formatDate } from "@/lib/format";
import { getBookmarks, getReadItems, toggleBookmark, toggleRead } from "@/lib/storage";
import type { Article } from "@/lib/types";

export function ArticleDetailClient(props: { id: string }) {
  const { id } = props;
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedSet, setSavedSet] = useState<Set<string>>(new Set());
  const [readSet, setReadSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedSet(getBookmarks());
    setReadSet(getReadItems());
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchArticle(id), fetchRelatedArticles(id)])
      .then(([entry, relatedList]) => {
        setArticle(entry);
        setRelated(relatedList);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="skeleton-card tall" />;
  }

  if (!article) {
    return <div className="empty-box">文章不存在，返回首页继续阅读。</div>;
  }

  return (
    <section className="standalone-page">
      <div className="article-hero" style={{ background: article.coverImage }} />
      <header className="article-detail-header">
        <div className="topic-tag-wrap">
          {article.topics.map((topic) => (
            <span className="topic-tag" key={topic}>
              {topic}
            </span>
          ))}
        </div>
        <h1>{article.title}</h1>
        <p>{article.summaryZh}</p>
        <div className="article-meta large">
          <span>{article.sourceName}</span>
          <span>·</span>
          <span>{article.author}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
          <span>·</span>
          <span>{article.readTimeMin} 分钟阅读</span>
        </div>
        <div className="article-actions">
          <button className={readSet.has(article.id) ? "action-btn active" : "action-btn"} onClick={() => setReadSet(toggleRead(article.id))} type="button">
            {readSet.has(article.id) ? "已读" : "标记已读"}
          </button>
          <button className={savedSet.has(article.id) ? "action-btn active" : "action-btn"} onClick={() => setSavedSet(toggleBookmark(article.id))} type="button">
            {savedSet.has(article.id) ? "已收藏" : "收藏"}
          </button>
          <a className="action-btn" href={article.url} rel="noreferrer" target="_blank">
            打开原文
          </a>
          <Link className="action-btn" href="/">
            返回首页
          </Link>
        </div>
      </header>

      <section className="related-block">
        <h2>相关推荐</h2>
        <div className="card-list">
          {related.map((entry) => (
            <ArticleCard
              key={entry.id}
              article={entry}
              isRead={readSet.has(entry.id)}
              isSaved={savedSet.has(entry.id)}
              onToggleRead={(entryId) => setReadSet(toggleRead(entryId))}
              onToggleSave={(entryId) => setSavedSet(toggleBookmark(entryId))}
            />
          ))}
        </div>
      </section>
    </section>
  );
}
