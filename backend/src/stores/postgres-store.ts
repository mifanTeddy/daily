import { Pool, type PoolClient } from "pg";

import type { ArticleStore } from "../store.js";
import type { ArticleRecord } from "../types.js";

interface PostgresArticleStoreOptions {
  databaseUrl?: string;
  schema?: string;
}

interface ArticleRow {
  id: string;
  title_zh: string;
  title_en: string;
  summary_zh: string;
  summary_en: string;
  url: string;
  source_name: string;
  author: string;
  published_at: string;
  topics: unknown;
  difficulty: ArticleRecord["difficulty"];
  read_time_min: number;
  quality_score: number;
  freshness_score: number;
  hot_score: number;
  cover_image: string;
  created_at: string;
  updated_at: string;
}

export class PostgresArticleStore implements ArticleStore {
  private readonly schema: string;
  private readonly pool: Pool;
  private readonly ready: Promise<void>;

  constructor(options: PostgresArticleStoreOptions) {
    if (!options.databaseUrl) {
      throw new Error("DATABASE_URL is required for postgres store");
    }

    this.schema = options.schema?.trim() || "public";
    this.pool = new Pool({
      connectionString: options.databaseUrl
    });
    this.ready = this.initialize();
  }

  private get tableName(): string {
    return `${this.escapeIdentifier(this.schema)}.${this.escapeIdentifier("articles")}`;
  }

  private async initialize(): Promise<void> {
    await this.pool.query(`CREATE SCHEMA IF NOT EXISTS ${this.escapeIdentifier(this.schema)}`);
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id TEXT PRIMARY KEY,
        title_zh TEXT NOT NULL,
        title_en TEXT NOT NULL,
        summary_zh TEXT NOT NULL,
        summary_en TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        source_name TEXT NOT NULL,
        author TEXT NOT NULL,
        published_at TEXT NOT NULL,
        topics JSONB NOT NULL DEFAULT '[]'::jsonb,
        difficulty TEXT NOT NULL,
        read_time_min DOUBLE PRECISION NOT NULL,
        quality_score DOUBLE PRECISION NOT NULL,
        freshness_score DOUBLE PRECISION NOT NULL,
        hot_score DOUBLE PRECISION NOT NULL,
        cover_image TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }

  private escapeIdentifier(value: string): string {
    return `"${value.replaceAll(`"`, `""`)}"`;
  }

  private toArticle(row: ArticleRow): ArticleRecord {
    return {
      id: row.id,
      titleZh: row.title_zh,
      titleEn: row.title_en,
      summaryZh: row.summary_zh,
      summaryEn: row.summary_en,
      url: row.url,
      sourceName: row.source_name,
      author: row.author,
      publishedAt: row.published_at,
      topics: Array.isArray(row.topics) ? row.topics.map(String) : [],
      difficulty: row.difficulty,
      readTimeMin: Number(row.read_time_min),
      qualityScore: Number(row.quality_score),
      freshnessScore: Number(row.freshness_score),
      hotScore: Number(row.hot_score),
      coverImage: row.cover_image,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private async queryArticles(query: string, values: unknown[] = []): Promise<ArticleRecord[]> {
    await this.ready;
    const result = await this.pool.query<ArticleRow>(query, values);
    return result.rows.map((row) => this.toArticle(row));
  }

  private async upsertOne(client: Pick<Pool, "query"> | Pick<PoolClient, "query">, article: ArticleRecord): Promise<void> {
    await client.query(
      `
        WITH updated AS (
          UPDATE ${this.tableName}
          SET
            id = $1,
            title_zh = $2,
            title_en = $3,
            summary_zh = $4,
            summary_en = $5,
            url = $6,
            source_name = $7,
            author = $8,
            published_at = $9,
            topics = $10::jsonb,
            difficulty = $11,
            read_time_min = $12,
            quality_score = $13,
            freshness_score = $14,
            hot_score = $15,
            cover_image = $16,
            created_at = $17,
            updated_at = $18
          WHERE id = $1 OR url = $6
          RETURNING id
        )
        INSERT INTO ${this.tableName} (
          id,
          title_zh,
          title_en,
          summary_zh,
          summary_en,
          url,
          source_name,
          author,
          published_at,
          topics,
          difficulty,
          read_time_min,
          quality_score,
          freshness_score,
          hot_score,
          cover_image,
          created_at,
          updated_at
        )
        SELECT
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15, $16, $17, $18
        WHERE NOT EXISTS (SELECT 1 FROM updated)
      `,
      [
        article.id,
        article.titleZh,
        article.titleEn,
        article.summaryZh,
        article.summaryEn,
        article.url,
        article.sourceName,
        article.author,
        article.publishedAt,
        JSON.stringify(article.topics),
        article.difficulty,
        article.readTimeMin,
        article.qualityScore,
        article.freshnessScore,
        article.hotScore,
        article.coverImage,
        article.createdAt,
        article.updatedAt
      ]
    );
  }

  async list(): Promise<ArticleRecord[]> {
    return this.queryArticles(`SELECT * FROM ${this.tableName}`);
  }

  async findById(id: string): Promise<ArticleRecord | null> {
    const items = await this.queryArticles(`SELECT * FROM ${this.tableName} WHERE id = $1 LIMIT 1`, [id]);
    return items[0] ?? null;
  }

  async upsert(article: ArticleRecord): Promise<ArticleRecord> {
    await this.ready;
    await this.upsertOne(this.pool, article);
    return article;
  }

  async batchUpsert(items: ArticleRecord[]): Promise<ArticleRecord[]> {
    if (items.length === 0) {
      return [];
    }

    await this.ready;
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      for (const article of items) {
        await this.upsertOne(client, article);
      }
      await client.query("COMMIT");
      return items;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
