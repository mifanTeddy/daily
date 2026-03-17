import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { ArticleStore } from "../store.js";
import type { ArticleRecord } from "../types.js";

export class JsonArticleStore implements ArticleStore {
  private readonly filePath: string;
  private readonly ready: Promise<void>;

  constructor(filePath: string) {
    this.filePath = resolve(filePath);
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      await readFile(this.filePath, "utf-8");
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        throw error;
      }
      await this.writeArticles([]);
    }
  }

  private parseArticles(raw: string): ArticleRecord[] {
    try {
      const parsed = JSON.parse(raw) as ArticleRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async readArticles(): Promise<ArticleRecord[]> {
    await this.ready;
    const raw = await readFile(this.filePath, "utf-8");
    return this.parseArticles(raw);
  }

  private async writeArticles(items: ArticleRecord[]): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(items, null, 2), "utf-8");
    await rename(tempPath, this.filePath);
  }

  async list(): Promise<ArticleRecord[]> {
    return this.readArticles();
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    const items = await this.readArticles();
    return items.find((entry) => entry.id === id) ?? null;
  }

  async upsert(article: ArticleRecord): Promise<ArticleRecord> {
    const items = await this.readArticles();
    const index = items.findIndex((entry) => entry.id === article.id || entry.url === article.url);

    if (index >= 0) {
      items[index] = article;
    } else {
      items.push(article);
    }

    await this.writeArticles(items);
    return article;
  }

  async batchUpsert(records: ArticleRecord[]): Promise<ArticleRecord[]> {
    if (records.length === 0) {
      return [];
    }

    const items = await this.readArticles();

    for (const article of records) {
      const index = items.findIndex((entry) => entry.id === article.id || entry.url === article.url);
      if (index >= 0) {
        items[index] = article;
      } else {
        items.push(article);
      }
    }

    await this.writeArticles(items);
    return records;
  }
}
