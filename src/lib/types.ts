export type FeedTab = "recommended" | "latest" | "following";

export type Difficulty = "初级" | "中级" | "高级";

export interface Article {
  id: string;
  title: string;
  summaryZh: string;
  url: string;
  sourceName: string;
  author: string;
  publishedAt: string;
  topics: string[];
  difficulty: Difficulty;
  readTimeMin: number;
  qualityScore: number;
  freshnessScore: number;
  hotScore: number;
  language: "zh" | "en";
  coverImage: string;
}

export interface FeedResponse {
  items: Article[];
  nextCursor: string | null;
}

export interface TopicMeta {
  name: string;
  count: number;
}
