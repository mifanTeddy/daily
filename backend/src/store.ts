import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { ArticleRecord } from "./types.js";

export class JsonArticleStore {
  private readonly filePath: string;
  private articles: ArticleRecord[] = [];
  private ready: Promise<void>;

  constructor(filePath: string) {
    this.filePath = resolve(filePath);
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      const raw = await readFile(this.filePath, "utf-8");
      const parsed = JSON.parse(raw) as ArticleRecord[];
      this.articles = Array.isArray(parsed) ? parsed : [];
    } catch {
      this.articles = [];
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(this.articles, null, 2), "utf-8");
    await rename(tempPath, this.filePath);
  }

  async list(): Promise<ArticleRecord[]> {
    await this.ready;
    return [...this.articles];
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    await this.ready;
    return this.articles.find((entry) => entry.id === id) ?? null;
  }

  async upsert(article: ArticleRecord): Promise<ArticleRecord> {
    await this.ready;
    const index = this.articles.findIndex((entry) => entry.id === article.id || entry.url === article.url);

    if (index >= 0) {
      this.articles[index] = article;
    } else {
      this.articles.push(article);
    }

    await this.persist();
    return article;
  }

  async batchUpsert(items: ArticleRecord[]): Promise<ArticleRecord[]> {
    const result: ArticleRecord[] = [];
    for (const item of items) {
      result.push(await this.upsert(item));
    }
    return result;
  }
}
