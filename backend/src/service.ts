import { randomUUID } from "node:crypto";

import type {
  ArticleRecord,
  ArticleResponse,
  FeedResponse,
  FeedTab,
  LanguageCode,
  TopicMeta,
  UploadArticleInput
} from "./types.js";

const PAGE_SIZE = 20;

function localize(article: ArticleRecord, lang: LanguageCode): ArticleResponse {
  return {
    ...article,
    title: lang === "zh" ? article.titleZh : article.titleEn,
    summary: lang === "zh" ? article.summaryZh : article.summaryEn
  };
}

function weightForRecommended(article: ArticleRecord): number {
  return article.qualityScore * 0.45 + article.freshnessScore * 0.35 + article.hotScore * 0.2;
}

function parseNumber(value: unknown, field: string): number {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid number field: ${field}`);
  }
  return num;
}

function parseDifficulty(value: unknown): ArticleRecord["difficulty"] {
  if (value === "beginner" || value === "intermediate" || value === "advanced") {
    return value;
  }
  throw new Error("Invalid difficulty");
}

function parseStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`Invalid string array field: ${field}`);
  }
  return value;
}

function parseString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Invalid string field: ${field}`);
  }
  return value.trim();
}

export function parseUploadInput(payload: unknown): UploadArticleInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid payload");
  }

  const body = payload as Record<string, unknown>;

  return {
    id: typeof body.id === "string" && body.id.trim() ? body.id : undefined,
    titleZh: parseString(body.titleZh, "titleZh"),
    titleEn: parseString(body.titleEn, "titleEn"),
    summaryZh: parseString(body.summaryZh, "summaryZh"),
    summaryEn: parseString(body.summaryEn, "summaryEn"),
    url: parseString(body.url, "url"),
    sourceName: parseString(body.sourceName, "sourceName"),
    author: parseString(body.author, "author"),
    publishedAt: parseString(body.publishedAt, "publishedAt"),
    topics: parseStringArray(body.topics, "topics"),
    difficulty: parseDifficulty(body.difficulty),
    readTimeMin: parseNumber(body.readTimeMin, "readTimeMin"),
    qualityScore: parseNumber(body.qualityScore, "qualityScore"),
    freshnessScore: parseNumber(body.freshnessScore, "freshnessScore"),
    hotScore: parseNumber(body.hotScore, "hotScore"),
    coverImage: parseString(body.coverImage, "coverImage")
  };
}

export function normalizeUpload(input: UploadArticleInput, existing?: ArticleRecord | null): ArticleRecord {
  const now = new Date().toISOString();

  return {
    id: existing?.id ?? input.id ?? randomUUID(),
    titleZh: input.titleZh,
    titleEn: input.titleEn,
    summaryZh: input.summaryZh,
    summaryEn: input.summaryEn,
    url: input.url,
    sourceName: input.sourceName,
    author: input.author,
    publishedAt: input.publishedAt,
    topics: input.topics,
    difficulty: input.difficulty,
    readTimeMin: input.readTimeMin,
    qualityScore: input.qualityScore,
    freshnessScore: input.freshnessScore,
    hotScore: input.hotScore,
    coverImage: input.coverImage,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };
}

export function buildFeed(params: {
  items: ArticleRecord[];
  tab: FeedTab;
  cursor?: string;
  topic?: string;
  followingTopics?: string[];
  lang: LanguageCode;
}): FeedResponse {
  const { items, tab, cursor, topic, followingTopics = [], lang } = params;

  let data = [...items];

  if (topic) {
    data = data.filter((entry) => entry.topics.includes(topic));
  }

  if (tab === "latest") {
    data.sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  } else if (tab === "following") {
    data = data
      .filter((entry) => entry.topics.some((topicName) => followingTopics.includes(topicName)))
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
  } else {
    data.sort((a, b) => weightForRecommended(b) - weightForRecommended(a));
  }

  const offset = cursor ? Number(cursor) : 0;
  const sliced = data.slice(offset, offset + PAGE_SIZE).map((entry) => localize(entry, lang));
  const nextOffset = offset + PAGE_SIZE;

  return {
    items: sliced,
    nextCursor: nextOffset < data.length ? String(nextOffset) : null
  };
}

export function buildTopics(items: ArticleRecord[]): TopicMeta[] {
  const map = new Map<string, number>();
  for (const article of items) {
    for (const topic of article.topics) {
      map.set(topic, (map.get(topic) ?? 0) + 1);
    }
  }

  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function buildRelated(items: ArticleRecord[], id: string, lang: LanguageCode): ArticleResponse[] {
  const current = items.find((entry) => entry.id === id);
  if (!current) {
    return [];
  }

  return items
    .filter((entry) => entry.id !== id)
    .map((entry) => {
      const overlap = entry.topics.filter((topic) => current.topics.includes(topic)).length;
      return { entry, overlap };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.entry.hotScore - a.entry.hotScore)
    .slice(0, 4)
    .map((row) => localize(row.entry, lang));
}

export function toResponse(items: ArticleRecord[], lang: LanguageCode): ArticleResponse[] {
  return items
    .slice()
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .map((entry) => localize(entry, lang));
}

export function toSingleResponse(item: ArticleRecord, lang: LanguageCode): ArticleResponse {
  return localize(item, lang);
}
