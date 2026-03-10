import { randomUUID } from "node:crypto";

import type {
  Article,
  ArticleBase,
  FeedResponse,
  FeedTab,
  LanguageCode,
  TopicMeta,
  UploadArticleInput
} from "@/lib/types";

const PAGE_SIZE = 6;
const inMemoryArticles: ArticleBase[] = [];

function localizeArticle(article: ArticleBase, language: LanguageCode): Article {
  return {
    ...article,
    title: language === "zh" ? article.titleZh : article.titleEn,
    summary: language === "zh" ? article.summaryZh : article.summaryEn
  };
}

function weightForRecommended(article: ArticleBase): number {
  return article.qualityScore * 0.45 + article.freshnessScore * 0.35 + article.hotScore * 0.2;
}

function sortByDateDesc(data: ArticleBase[]): ArticleBase[] {
  return [...data].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function paginate(data: ArticleBase[], cursor: string | undefined, language: LanguageCode): FeedResponse {
  const offset = cursor ? Number(cursor) : 0;
  const items = data.slice(offset, offset + PAGE_SIZE).map((entry) => localizeArticle(entry, language));
  const nextOffset = offset + PAGE_SIZE;

  return {
    items,
    nextCursor: nextOffset < data.length ? String(nextOffset) : null
  };
}

export async function getFeed(params: {
  tab: FeedTab;
  cursor?: string;
  topic?: string;
  followingTopics?: string[];
  lang: LanguageCode;
}): Promise<FeedResponse> {
  const { tab, cursor, topic, followingTopics = [], lang } = params;

  let data = [...inMemoryArticles];
  if (topic) {
    data = data.filter((article) => article.topics.includes(topic));
  }

  if (tab === "latest") {
    data = sortByDateDesc(data);
  } else if (tab === "following") {
    data = data.filter((article) => article.topics.some((entry) => followingTopics.includes(entry)));
    data = sortByDateDesc(data);
  } else {
    data = [...data].sort((a, b) => weightForRecommended(b) - weightForRecommended(a));
  }

  await new Promise((resolve) => setTimeout(resolve, 60));
  return paginate(data, cursor, lang);
}

export async function getTopics(_lang: LanguageCode): Promise<TopicMeta[]> {
  const map = new Map<string, number>();

  for (const article of inMemoryArticles) {
    for (const topic of article.topics) {
      map.set(topic, (map.get(topic) ?? 0) + 1);
    }
  }

  const list = [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "en"));

  await new Promise((resolve) => setTimeout(resolve, 40));
  return list;
}

export async function getAllArticles(language: LanguageCode): Promise<Article[]> {
  return sortByDateDesc(inMemoryArticles).map((entry) => localizeArticle(entry, language));
}

export async function getArticleById(id: string, language: LanguageCode): Promise<Article | null> {
  const article = inMemoryArticles.find((entry) => entry.id === id) ?? null;
  await new Promise((resolve) => setTimeout(resolve, 40));
  return article ? localizeArticle(article, language) : null;
}

export async function getRelatedArticles(id: string, language: LanguageCode): Promise<Article[]> {
  const current = inMemoryArticles.find((entry) => entry.id === id);
  if (!current) {
    return [];
  }

  const related = inMemoryArticles
    .filter((entry) => entry.id !== id)
    .map((entry) => {
      const overlap = entry.topics.filter((topic) => current.topics.includes(topic)).length;
      return { entry, overlap };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.entry.hotScore - a.entry.hotScore)
    .slice(0, 4)
    .map((row) => localizeArticle(row.entry, language));

  await new Promise((resolve) => setTimeout(resolve, 40));
  return related;
}

export async function uploadArticle(input: UploadArticleInput): Promise<ArticleBase> {
  const normalized: ArticleBase = {
    ...input,
    id: input.id ?? randomUUID()
  };

  const existingIndex = inMemoryArticles.findIndex(
    (entry) => entry.id === normalized.id || entry.url === normalized.url
  );

  if (existingIndex >= 0) {
    inMemoryArticles[existingIndex] = {
      ...inMemoryArticles[existingIndex],
      ...normalized,
      id: inMemoryArticles[existingIndex].id
    };
    return inMemoryArticles[existingIndex];
  }

  inMemoryArticles.push(normalized);
  return normalized;
}

export async function batchUploadArticles(items: UploadArticleInput[]): Promise<ArticleBase[]> {
  const results: ArticleBase[] = [];
  for (const item of items) {
    results.push(await uploadArticle(item));
  }
  return results;
}
