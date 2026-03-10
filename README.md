# 日报技术流（中文技术内容前端）

一个可运行的中文技术内容聚合前端，采用深浅双主题设计，并预留了 OpenClaw 内容上传/入库后的 API 对接点。

## 已实现功能

- 首页 Feed：`推荐 / 最新 / 关注`
- 主题筛选：按话题过滤内容
- 文章详情页 + 相关推荐
- 收藏与已读（浏览器本地存储）
- 深色/浅色主题切换（含同配色 token）
- 可替换 API 层（前端已通过 `/api/*` 访问数据）

## 技术栈

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS（结合自定义 CSS token）

## 本地启动

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)

生产构建：

```bash
pnpm build
pnpm start
```

## 项目结构

```text
src/
  app/
    page.tsx                      # 首页
    discover/page.tsx             # 发现页
    bookmarks/page.tsx            # 收藏页
    article/[id]/page.tsx         # 文章详情
    api/
      feed/route.ts               # Feed API
      topics/route.ts             # 主题 API
      articles/[id]/route.ts      # 文章详情 API
      articles/[id]/related/route.ts # 相关推荐 API
  components/
    FeedClient.tsx
    DiscoverClient.tsx
    BookmarksClient.tsx
    ArticleDetailClient.tsx
    ArticleCard.tsx
    TopNav.tsx
    ThemeToggle.tsx
  lib/
    api.ts                        # mock 数据服务逻辑
    client-api.ts                 # 前端 HTTP API 客户端
    storage.ts                    # 本地收藏/已读状态
    types.ts                      # 数据类型定义
  data/
    mockArticles.ts               # 示例中文内容
```

## API 契约（后续 OpenClaw 可直接对接）

### `GET /api/feed`

查询参数：

- `tab`: `recommended | latest | following`
- `topic`: 可选，话题名
- `cursor`: 可选，分页游标
- `following`: 可选，逗号分隔话题，如 `AI,前端`

返回：

```json
{
  "items": [
    {
      "id": "cn-001",
      "title": "...",
      "summaryZh": "...",
      "url": "...",
      "sourceName": "...",
      "author": "...",
      "publishedAt": "2026-03-09T09:00:00+08:00",
      "topics": ["AI", "后端"],
      "difficulty": "中级",
      "readTimeMin": 8,
      "qualityScore": 93,
      "freshnessScore": 97,
      "hotScore": 89,
      "language": "zh",
      "coverImage": "linear-gradient(...)"
    }
  ],
  "nextCursor": "6"
}
```

### `GET /api/topics`

返回：

```json
{
  "items": [
    { "name": "全部", "count": 12 },
    { "name": "AI", "count": 3 }
  ]
}
```

### `GET /api/articles/:id`

返回：

```json
{
  "item": {
    "id": "cn-001",
    "title": "..."
  }
}
```

### `GET /api/articles/:id/related`

返回：

```json
{
  "items": [{ "id": "cn-002", "title": "..." }]
}
```

## OpenClaw 对接建议

把 OpenClaw 作为内容管道：

1. 抓取候选内容（RSS/API/站点）
2. 清洗和去重
3. 中文摘要与标签生成
4. 质量分计算（quality/freshness/hot）
5. 写入你的数据库
6. 用真实后端替换当前 `src/app/api/*` 中的数据来源

当前前端已经只依赖 API 返回字段，不依赖 mock 数据结构外的信息。
