"use client";

import Link from "next/link";

import { useLanguage } from "@/components/LanguageProvider";
import { formatDate } from "@/lib/format";
import { getDifficultyLabel, t } from "@/lib/i18n";
import type { Article } from "@/lib/types";

export function ArticleCard(props: {
  article: Article;
  isSaved: boolean;
  isRead: boolean;
  onToggleSave: (id: string) => void;
  onToggleRead: (id: string) => void;
}) {
  const { article, isSaved, isRead, onToggleRead, onToggleSave } = props;
  const { language } = useLanguage();
  const copy = t(language);

  return (
    <article className={isRead ? "article-card read" : "article-card"}>
      <div className="cover" style={{ background: article.coverImage }} aria-hidden />

      <div className="article-main">
        <div className="article-meta">
          <span>{article.sourceName}</span>
          <span>·</span>
          <span>{article.author}</span>
          <span>·</span>
          <span>{formatDate(article.publishedAt, language)}</span>
        </div>

        <Link className="article-title" href={`/article/${article.id}`}>
          {article.title}
        </Link>

        <p className="article-summary">{article.summary}</p>

        <div className="topic-tag-wrap">
          {article.topics.map((topic) => (
            <span key={topic} className="topic-tag">
              {topic}
            </span>
          ))}
        </div>

        <div className="article-footer">
          <div className="article-scores">
            <span>
              {copy.article.difficulty} {getDifficultyLabel(language, article.difficulty)}
            </span>
            <span>
              {article.readTimeMin} {copy.article.metaMinute}
            </span>
            <span>
              {copy.article.heat} {article.hotScore}
            </span>
          </div>

          <div className="article-actions">
            <button className={isRead ? "action-btn active" : "action-btn"} onClick={() => onToggleRead(article.id)} type="button">
              {isRead ? copy.article.read : copy.article.markRead}
            </button>
            <button className={isSaved ? "action-btn active" : "action-btn"} onClick={() => onToggleSave(article.id)} type="button">
              {isSaved ? copy.article.saved : copy.article.save}
            </button>
            <a className="action-btn" href={article.url} rel="noreferrer" target="_blank">
              {copy.article.original}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
