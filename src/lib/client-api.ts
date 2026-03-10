import type { Article, FeedResponse, FeedTab, LanguageCode, TopicMeta } from "@/lib/types";

const DEFAULT_BASE = "/api";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");

function buildUrl(path: string, query?: URLSearchParams): string {
  const suffix = query ? `?${query.toString()}` : "";
  return `${API_BASE}${path}${suffix}`;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchFeed(params: {
  tab: FeedTab;
  cursor?: string;
  topic?: string;
  followingTopics?: string[];
  lang: LanguageCode;
}): Promise<FeedResponse> {
  const query = new URLSearchParams();
  query.set("tab", params.tab);
  query.set("lang", params.lang);

  if (params.cursor) {
    query.set("cursor", params.cursor);
  }

  if (params.topic) {
    query.set("topic", params.topic);
  }

  if (params.followingTopics?.length) {
    query.set("following", params.followingTopics.join(","));
  }

  return request<FeedResponse>(buildUrl("/feed", query));
}

export async function fetchTopics(lang: LanguageCode): Promise<TopicMeta[]> {
  const query = new URLSearchParams();
  query.set("lang", lang);

  const payload = await request<{ items: TopicMeta[] }>(buildUrl("/topics", query));
  return payload.items;
}

export async function fetchAllArticles(lang: LanguageCode): Promise<Article[]> {
  const query = new URLSearchParams();
  query.set("lang", lang);

  const payload = await request<{ items: Article[] }>(buildUrl("/articles", query));
  return payload.items;
}

export async function fetchArticle(id: string, lang: LanguageCode): Promise<Article | null> {
  const query = new URLSearchParams();
  query.set("lang", lang);

  const payload = await request<{ item: Article | null }>(buildUrl(`/articles/${id}`, query));
  return payload.item;
}

export async function fetchRelatedArticles(id: string, lang: LanguageCode): Promise<Article[]> {
  const query = new URLSearchParams();
  query.set("lang", lang);

  const payload = await request<{ items: Article[] }>(buildUrl(`/articles/${id}/related`, query));
  return payload.items;
}
