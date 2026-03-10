export type FeedTab = "recommended" | "latest" | "following";
export type LanguageCode = "zh" | "en";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface ArticleRecord {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
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
  coverImage: string;
  createdAt: string;
  updatedAt: string;
}

export interface UploadArticleInput {
  id?: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
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
  coverImage: string;
}

export interface ArticleResponse extends ArticleRecord {
  title: string;
  summary: string;
}

export interface FeedResponse {
  items: ArticleResponse[];
  nextCursor: string | null;
}

export interface TopicMeta {
  name: string;
  count: number;
}
