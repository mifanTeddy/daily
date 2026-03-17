import { resolve } from "node:path";

import cors from "@fastify/cors";
import Fastify from "fastify";

import { createArticleStore } from "./store.js";
import {
  buildFeed,
  buildRelated,
  buildTopics,
  normalizeUpload,
  parseUploadInput,
  toResponse,
  toSingleResponse
} from "./service.js";
import type { FeedTab, LanguageCode } from "./types.js";

const port = Number(process.env.PORT ?? "8787");
const host = process.env.HOST ?? "0.0.0.0";
const allowOrigin = process.env.ALLOW_ORIGIN ?? "*";
const dataFile = resolve(process.cwd(), process.env.DATA_FILE ?? "./data/articles.json");
const storeDriver = process.env.STORAGE_DRIVER;
const databaseUrl = process.env.DATABASE_URL;
const postgresSchema = process.env.POSTGRES_SCHEMA;
const defaultCacheTtlMs = 5000;

function parseCacheTtlMs(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return defaultCacheTtlMs;
  }
  return Math.floor(parsed);
}

const dataCacheTtlMs = parseCacheTtlMs(process.env.DATA_CACHE_TTL_MS);

const app = Fastify({ logger: true });
const { driver, store } = createArticleStore({
  driver: storeDriver,
  dataFile,
  databaseUrl,
  cacheTtlMs: dataCacheTtlMs,
  postgresSchema
});

await app.register(cors, {
  origin: allowOrigin === "*" ? true : allowOrigin,
  methods: ["GET", "POST", "OPTIONS"]
});

app.log.info({ driver }, "daily article store initialized");

function parseLanguage(value: unknown): LanguageCode {
  return value === "en" ? "en" : "zh";
}

function parseTab(value: unknown): FeedTab {
  return value === "latest" || value === "following" ? value : "recommended";
}

app.get("/health", async () => ({ ok: true }));

app.get("/api/feed", async (request) => {
  const query = request.query as Record<string, string | undefined>;
  const items = await store.list();

  return buildFeed({
    items,
    tab: parseTab(query.tab),
    cursor: query.cursor,
    topic: query.topic,
    followingTopics: (query.following ?? "")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
    lang: parseLanguage(query.lang)
  });
});

app.get("/api/topics", async () => {
  const items = await store.list();
  return { items: buildTopics(items) };
});

app.get("/api/articles", async (request) => {
  const query = request.query as Record<string, string | undefined>;
  const lang = parseLanguage(query.lang);
  const items = await store.list();
  return { items: toResponse(items, lang) };
});

app.get("/api/articles/:id", async (request, reply) => {
  const query = request.query as Record<string, string | undefined>;
  const { id } = request.params as { id: string };
  const lang = parseLanguage(query.lang);
  const item = await store.findById(id);

  if (!item) {
    return reply.status(404).send({ item: null });
  }

  return { item: toSingleResponse(item, lang) };
});

app.get("/api/articles/:id/related", async (request) => {
  const query = request.query as Record<string, string | undefined>;
  const { id } = request.params as { id: string };
  const lang = parseLanguage(query.lang);

  const items = await store.list();
  return { items: buildRelated(items, id, lang) };
});

app.post("/api/articles/upload", async (request, reply) => {
  try {
    const payload = parseUploadInput(request.body);
    const existing = payload.id ? await store.findById(payload.id) : null;
    const normalized = normalizeUpload(payload, existing);
    const item = await store.upsert(normalized);

    return reply.status(201).send({ item });
  } catch (error) {
    return reply.status(400).send({ error: (error as Error).message });
  }
});

app.post("/api/articles/batch-upload", async (request, reply) => {
  try {
    const body = request.body as { items?: unknown[] };
    const entries = Array.isArray(body.items) ? body.items : [];
    const existingList = await store.list();

    const normalized = entries.map((entry) => {
      const payload = parseUploadInput(entry);
      const existing = payload.id
        ? existingList.find((row) => row.id === payload.id)
        : existingList.find((row) => row.url === payload.url);

      return normalizeUpload(payload, existing);
    });

    const items = await store.batchUpsert(normalized);
    return reply.status(201).send({ items });
  } catch (error) {
    return reply.status(400).send({ error: (error as Error).message });
  }
});

app.listen({ port, host }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
