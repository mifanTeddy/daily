import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

import type { ArticleRecord } from "./types.js";

interface JsonArticleStoreOptions {
  cacheTtlMs?: number;
}

export class JsonArticleStore {
  private readonly filePath: string;
  private readonly cacheTtlMs: number;
  private articles: ArticleRecord[] = [];
  private ready: Promise<void>;
  private lastCheckAt = 0;
  private lastLoadedMtimeMs = 0;
  private refreshInFlight: Promise<void> | null = null;

  constructor(filePath: string, options: JsonArticleStoreOptions = {}) {
    this.filePath = resolve(filePath);
    const parsedTtl = Number(options.cacheTtlMs ?? 5000);
    this.cacheTtlMs = Number.isFinite(parsedTtl) && parsedTtl >= 0 ? Math.floor(parsedTtl) : 5000;
    this.ready = this.initialize();
  }

  private async initialize(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await this.loadFromDisk({ createIfMissing: true });
  }

  private parseArticles(raw: string): ArticleRecord[] {
    try {
      const parsed = JSON.parse(raw) as ArticleRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private async persist(): Promise<void> {
    const tempPath = `${this.filePath}.tmp`;
    await writeFile(tempPath, JSON.stringify(this.articles, null, 2), "utf-8");
    await rename(tempPath, this.filePath);
    const fileStat = await stat(this.filePath);
    this.lastLoadedMtimeMs = fileStat.mtimeMs;
    this.lastCheckAt = Date.now();
  }

  private async loadFromDisk(options: { createIfMissing: boolean }): Promise<void> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      this.articles = this.parseArticles(raw);
      const fileStat = await stat(this.filePath);
      this.lastLoadedMtimeMs = fileStat.mtimeMs;
      this.lastCheckAt = Date.now();
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (options.createIfMissing && err.code === "ENOENT") {
        this.articles = [];
        await this.persist();
        return;
      }
      throw error;
    }
  }

  private async refreshFromDiskIfNeeded(): Promise<void> {
    const now = Date.now();
    if (this.cacheTtlMs > 0 && now - this.lastCheckAt < this.cacheTtlMs) {
      return;
    }

    this.lastCheckAt = now;

    try {
      const fileStat = await stat(this.filePath);
      if (fileStat.mtimeMs === this.lastLoadedMtimeMs) {
        return;
      }

      const raw = await readFile(this.filePath, "utf-8");
      this.articles = this.parseArticles(raw);
      this.lastLoadedMtimeMs = fileStat.mtimeMs;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === "ENOENT") {
        this.articles = [];
        await this.persist();
        return;
      }
      throw error;
    }
  }

  private async ensureFresh(): Promise<void> {
    if (this.refreshInFlight) {
      await this.refreshInFlight;
      return;
    }

    this.refreshInFlight = this.refreshFromDiskIfNeeded();
    try {
      await this.refreshInFlight;
    } finally {
      this.refreshInFlight = null;
    }
  }

  private upsertInMemory(article: ArticleRecord): ArticleRecord {
    const index = this.articles.findIndex((entry) => entry.id === article.id || entry.url === article.url);
    if (index >= 0) {
      this.articles[index] = article;
    } else {
      this.articles.push(article);
    }
    return article;
  }

  async list(): Promise<ArticleRecord[]> {
    await this.ready;
    await this.ensureFresh();
    return [...this.articles];
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    await this.ready;
    await this.ensureFresh();
    return this.articles.find((entry) => entry.id === id) ?? null;
  }

  async upsert(article: ArticleRecord): Promise<ArticleRecord> {
    await this.ready;
    await this.ensureFresh();
    const saved = this.upsertInMemory(article);
    await this.persist();
    return saved;
  }

  async batchUpsert(items: ArticleRecord[]): Promise<ArticleRecord[]> {
    await this.ready;
    await this.ensureFresh();
    const result = items.map((item) => this.upsertInMemory(item));
    if (result.length > 0) {
      await this.persist();
    }
    return result;
  }
}
