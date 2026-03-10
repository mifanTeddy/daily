"use client";

import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { Article } from "@/lib/types";

export function ArticleCard(props: {
  article: Article;
  isSaved: boolean;
  isRead: boolean;
  onToggleSave: (id: string) => void;
  onToggleRead: (id: string) => void;
}) {
  const { article, isSaved, isRead, onToggleRead, onToggleSave } = props;

  return (
    <article className={isRead ? "article-card read" : "article-card"}>
      <div className="cover" style={{ background: article.coverImage }} aria-hidden />

      <div className="article-main">
        <div className="article-meta">
          <span>{article.sourceName}</span>
          <span>·</span>
          <span>{article.author}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <Link className="article-title" href={`/article/${article.id}`}>
          {article.title}
        </Link>

        <p className="article-summary">{article.summaryZh}</p>

        <div className="topic-tag-wrap">
          {article.topics.map((topic) => (
            <span key={topic} className="topic-tag">
              {topic}
            </span>
          ))}
        </div>

        <div className="article-footer">
          <div className="article-scores">
            <span>难度 {article.difficulty}</span>
            <span>{article.readTimeMin} 分钟</span>
            <span>热度 {article.hotScore}</span>
          </div>

          <div className="article-actions">
            <button className={isRead ? "action-btn active" : "action-btn"} onClick={() => onToggleRead(article.id)} type="button">
              {isRead ? "已读" : "标记已读"}
            </button>
            <button className={isSaved ? "action-btn active" : "action-btn"} onClick={() => onToggleSave(article.id)} type="button">
              {isSaved ? "已收藏" : "收藏"}
            </button>
            <a className="action-btn" href={article.url} rel="noreferrer" target="_blank">
              原文
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
