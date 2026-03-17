# daily-cn backend

独立后端服务，提供 Feed、话题、文章详情与双语上传接口。API 保持稳定，存储由部署环境决定。

## 本地启动

```bash
cd backend
npm install
npm run dev
```

默认运行在 `http://localhost:8787`。

## 生产构建

```bash
cd backend
npm install
npm run build
npm run start
```

## 环境变量

- `PORT` 默认 `8787`
- `HOST` 默认 `0.0.0.0`
- `ALLOW_ORIGIN` 默认 `*`
- `STORAGE_DRIVER` 可选 `json` / `postgres`。不填时会根据 `DATABASE_URL` 自动判断，没有数据库地址则回落到 `json`。
- `DATA_FILE` 默认 `./data/articles.json`。仅 `json` 驱动使用。
- `DATABASE_URL`：`postgres` 驱动必填。
- `POSTGRES_SCHEMA` 默认 `public`。
- `DATA_CACHE_TTL_MS` 默认 `5000`（毫秒）。控制读取缓存有效期；设为 `0` 表示每次请求都直接读取底层存储。

## API

- `GET /health`
- `GET /api/feed?tab=recommended&cursor=0&topic=AI&following=AI,前端&lang=zh`
- `GET /api/topics`
- `GET /api/articles?lang=zh`
- `GET /api/articles/:id?lang=en`
- `GET /api/articles/:id/related?lang=zh`
- `POST /api/articles/upload`
- `POST /api/articles/batch-upload`

### `POST /api/articles/upload` body

```json
{
  "titleZh": "中文标题",
  "titleEn": "English title",
  "summaryZh": "中文摘要",
  "summaryEn": "English summary",
  "url": "https://example.com/article",
  "sourceName": "来源",
  "author": "作者",
  "publishedAt": "2026-03-10T10:00:00+08:00",
  "topics": ["AI", "后端"],
  "difficulty": "intermediate",
  "readTimeMin": 8,
  "qualityScore": 90,
  "freshnessScore": 95,
  "hotScore": 88,
  "coverImage": "linear-gradient(120deg, #3169F5 0%, #2CDCE6 100%)"
}
```

`POST /api/articles/batch-upload` 使用 `{ "items": [ ... ] }`。
