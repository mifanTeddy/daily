import { mockArticles } from "@/data/mockArticles";
import type { Article, FeedResponse, FeedTab, TopicMeta } from "@/lib/types";

const PAGE_SIZE = 6;

function weightForRecommended(article: Article): number {
  return article.qualityScore * 0.45 + article.freshnessScore * 0.35 + article.hotScore * 0.2;
}

function sortByDateDesc(data: Article[]): Article[] {
  return [...data].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function paginate(data: Article[], cursor?: string): FeedResponse {
  const offset = cursor ? Number(cursor) : 0;
  const items = data.slice(offset, offset + PAGE_SIZE);
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
}): Promise<FeedResponse> {
  const { tab, cursor, topic, followingTopics = [] } = params;

  let data = [...mockArticles];
  if (topic && topic !== "全部") {
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

  await new Promise((resolve) => setTimeout(resolve, 120));
  return paginate(data, cursor);
}

export async function getTopics(): Promise<TopicMeta[]> {
  const map = new Map<string, number>();

  for (const article of mockArticles) {
    for (const topic of article.topics) {
      map.set(topic, (map.get(topic) ?? 0) + 1);
    }
  }

  const list = [{ name: "全部", count: mockArticles.length }].concat(
    [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-Hans"))
  );

  await new Promise((resolve) => setTimeout(resolve, 80));
  return list;
}

export async function getArticleById(id: string): Promise<Article | null> {
  const article = mockArticles.find((entry) => entry.id === id) ?? null;
  await new Promise((resolve) => setTimeout(resolve, 80));
  return article;
}

export async function getRelatedArticles(id: string): Promise<Article[]> {
  const current = mockArticles.find((entry) => entry.id === id);
  if (!current) {
    return [];
  }

  const related = mockArticles
    .filter((entry) => entry.id !== id)
    .map((entry) => {
      const overlap = entry.topics.filter((topic) => current.topics.includes(topic)).length;
      return { entry, overlap };
    })
    .filter((row) => row.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.entry.hotScore - a.entry.hotScore)
    .slice(0, 4)
    .map((row) => row.entry);

  await new Promise((resolve) => setTimeout(resolve, 80));
  return related;
}
