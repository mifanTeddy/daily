import type { Article, FeedResponse, FeedTab, TopicMeta } from "@/lib/types";

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`请求失败: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchFeed(params: {
  tab: FeedTab;
  cursor?: string;
  topic?: string;
  followingTopics?: string[];
}): Promise<FeedResponse> {
  const query = new URLSearchParams();
  query.set("tab", params.tab);

  if (params.cursor) {
    query.set("cursor", params.cursor);
  }

  if (params.topic) {
    query.set("topic", params.topic);
  }

  if (params.followingTopics?.length) {
    query.set("following", params.followingTopics.join(","));
  }

  return request<FeedResponse>(`/api/feed?${query.toString()}`);
}

export async function fetchTopics(): Promise<TopicMeta[]> {
  const payload = await request<{ items: TopicMeta[] }>("/api/topics");
  return payload.items;
}

export async function fetchArticle(id: string): Promise<Article | null> {
  const payload = await request<{ item: Article | null }>(`/api/articles/${id}`);
  return payload.item;
}

export async function fetchRelatedArticles(id: string): Promise<Article[]> {
  const payload = await request<{ items: Article[] }>(`/api/articles/${id}/related`);
  return payload.items;
}
