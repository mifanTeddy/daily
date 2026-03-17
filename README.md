# Daily

一个可直接上线的技术内容站项目，包含：

- 前端（Next.js）：暗色主题、中文/英文界面切换、文章双语切换
- 后端（Fastify）：Feed/话题/详情 API、双语上传 API

## 目录结构

```text
.
├─ src/                 # 前端代码（Next.js）
├─ backend/             # 独立后端服务（Fastify）
├─ vercel.json          # 前端在 Vercel 的构建配置
└─ .env.example         # 前端环境变量示例
```

## 功能状态

- 暗色主题（仅暗色）
- 中英文界面切换
- 文章内容中英文切换（基于 `lang=zh|en`）
- 首页 Feed / 发现 / 收藏 / 详情
- 文章上传接口（单条与批量，含中英文标题摘要）

## 前端本地启动

```bash
pnpm install
pnpm dev
```

默认访问：`http://localhost:3000`

## 后端本地启动

```bash
cd backend
npm install
npm run dev
```

默认访问：`http://localhost:8787`

## 前后端联调

把前端 `.env.local` 设置为：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787/api
```

然后重启前端。

## 前端部署（Vercel）

1. 在 Vercel 导入本仓库。
2. Framework 选 `Next.js`。
3. 环境变量设置：
   - `NEXT_PUBLIC_API_BASE_URL=https://<你的后端域名>/api`
4. 直接 Deploy。

`vercel.json` 已配置：

- install: `pnpm install --frozen-lockfile`
- build: `pnpm build`
- dev: `pnpm dev`

## 后端部署方案

后端在 `backend/`，可直接部署到任意 Node 环境（VM / 容器 / PaaS）。

### 方式 A：直接 Node 部署

```bash
cd backend
npm install
npm run build
npm run start
```

必要环境变量：

- `PORT`（默认 `8787`）
- `HOST`（默认 `0.0.0.0`）
- `ALLOW_ORIGIN`（默认 `*`，生产建议填前端域名）
- `STORAGE_DRIVER`（可选 `json` / `postgres`）
- `DATA_FILE`（默认 `./data/articles.json`，仅 `json` 驱动使用）
- `DATABASE_URL`（`postgres` 驱动必填）
- `POSTGRES_SCHEMA`（默认 `public`）
- `DATA_CACHE_TTL_MS`（默认 `5000`，读取缓存毫秒数）

### 方式 B：Docker 部署

```bash
cd backend
docker build -t daily-cn-backend .
docker run -p 8787:8787 \
  -e PORT=8787 \
  -e HOST=0.0.0.0 \
  -e ALLOW_ORIGIN=https://<你的前端域名> \
  daily-cn-backend
```

## API 一览（后端）

- `GET /health`
- `GET /api/feed?tab=recommended&cursor=0&topic=AI&following=AI,前端&lang=zh`
- `GET /api/topics`
- `GET /api/articles?lang=zh`
- `GET /api/articles/:id?lang=en`
- `GET /api/articles/:id/related?lang=zh`
- `POST /api/articles/upload`
- `POST /api/articles/batch-upload`

### 上传接口字段（双语）

`POST /api/articles/upload`

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

批量上传：`POST /api/articles/batch-upload`，body 为 `{ "items": [ ... ] }`。
