import { resolve } from "node:path";

import { JsonArticleStore } from "./stores/json-store.js";
import { PostgresArticleStore } from "./stores/postgres-store.js";
import type { ArticleRecord } from "./types.js";

export interface ArticleStore {
  list(): Promise<ArticleRecord[]>;
  findById(id: string): Promise<ArticleRecord | null>;
  upsert(article: ArticleRecord): Promise<ArticleRecord>;
  batchUpsert(items: ArticleRecord[]): Promise<ArticleRecord[]>;
}

interface CachedArticleStoreOptions {
  cacheTtlMs: number;
}

interface CreateArticleStoreOptions {
  driver?: string;
  dataFile?: string;
  databaseUrl?: string;
  cacheTtlMs?: number;
  postgresSchema?: string;
}

class CachedArticleStore implements ArticleStore {
  private readonly store: ArticleStore;
  private readonly cacheTtlMs: number;
  private cache: ArticleRecord[] | null = null;
  private cacheAt = 0;
  private refreshInFlight: Promise<ArticleRecord[]> | null = null;

  constructor(store: ArticleStore, options: CachedArticleStoreOptions) {
    this.store = store;
    this.cacheTtlMs = Math.max(0, Math.floor(options.cacheTtlMs));
  }

  private isCacheFresh(): boolean {
    if (!this.cache) {
      return false;
    }
    if (this.cacheTtlMs === 0) {
      return false;
    }
    return Date.now() - this.cacheAt < this.cacheTtlMs;
  }

  private clone(items: ArticleRecord[]): ArticleRecord[] {
    return items.map((item) => ({ ...item, topics: [...item.topics] }));
  }

  private async loadList(force = false): Promise<ArticleRecord[]> {
    if (!force && this.isCacheFresh()) {
      return this.clone(this.cache ?? []);
    }

    if (!force && this.refreshInFlight) {
      return this.clone(await this.refreshInFlight);
    }

    this.refreshInFlight = this.store.list();

    try {
      const items = await this.refreshInFlight;
      this.cache = this.clone(items);
      this.cacheAt = Date.now();
      return this.clone(items);
    } finally {
      this.refreshInFlight = null;
    }
  }

  async list(): Promise<ArticleRecord[]> {
    return this.loadList();
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    const items = await this.loadList();
    return items.find((entry) => entry.id === id) ?? null;
  }

  async upsert(article: ArticleRecord): Promise<ArticleRecord> {
    const saved = await this.store.upsert(article);
    const items = await this.loadList(true);
    const index = items.findIndex((entry) => entry.id === saved.id);
    if (index >= 0) {
      items[index] = saved;
    } else {
      items.push(saved);
    }
    this.cache = this.clone(items);
    this.cacheAt = Date.now();
    return saved;
  }

  async batchUpsert(items: ArticleRecord[]): Promise<ArticleRecord[]> {
    const saved = await this.store.batchUpsert(items);
    this.cache = this.clone(await this.store.list());
    this.cacheAt = Date.now();
    return saved;
  }
}

function normalizeDriver(driver: string | undefined, databaseUrl: string | undefined): "json" | "postgres" {
  if (driver === "postgres") {
    return "postgres";
  }
  if (driver === "json" || !databaseUrl) {
    return "json";
  }

  const lowered = databaseUrl.toLowerCase();
  if (
    lowered.startsWith("postgres://") ||
    lowered.startsWith("postgresql://") ||
    lowered.startsWith("psql://")
  ) {
    return "postgres";
  }

  return "json";
}

export function createArticleStore(options: CreateArticleStoreOptions): {
  driver: "json" | "postgres";
  store: ArticleStore;
} {
  const driver = normalizeDriver(options.driver, options.databaseUrl);
  const cacheTtlMs = Number.isFinite(options.cacheTtlMs) ? Number(options.cacheTtlMs) : 0;

  const baseStore: ArticleStore =
    driver === "postgres"
      ? new PostgresArticleStore({
          databaseUrl: options.databaseUrl,
          schema: options.postgresSchema
        })
      : new JsonArticleStore(resolve(options.dataFile ?? "./data/articles.json"));

  return {
    driver,
    store: new CachedArticleStore(baseStore, { cacheTtlMs })
  };
}
