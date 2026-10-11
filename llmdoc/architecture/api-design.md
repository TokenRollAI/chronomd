# API 设计

## 概述

API 由 `apps/web` 内的 SvelteKit server routes (`src/routes/api/**/+server.ts`) 实现，随应用一起部署在 Cloudflare Pages (Workers 运行时)，没有独立的后端服务。采用 RESTful 风格，JSON 格式通信。

## 响应格式

所有响应遵循统一格式：

```typescript
// 成功响应
{
  "success": true,
  "data": { ... }
}

// 错误响应
{
  "success": false,
  "error": "错误信息"
}
```

## 公开 API

### GET /api/timeline
获取时间线文档列表

**参数:**
- `page` (number, 可选): 页码，默认 1
- `limit` (number, 可选): 每页数量，默认 20，最大 100
- `folder` (string, 可选): 文件夹 slug 筛选

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "abc123",
        "title": "文章标题",
        "slug": "article-slug",
        "summary": "文章摘要",
        "is_private": false,
        "published_at": "2024-01-01T00:00:00Z",
        "folder": { "id": "...", "name": "...", "slug": "..." }
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/mixed-timeline
获取混合时间线（文档 + Quick Notes）

**参数:**
- `page` (number, 可选): 页码，默认 1
- `limit` (number, 可选): 每页数量，默认 20

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "type": "document",
        "id": "doc123",
        "title": "文章标题",
        "slug": "article-slug",
        "published_at": "2024-01-01T00:00:00Z"
      },
      {
        "type": "note",
        "id": "note456",
        "content": "快速笔记内容",
        "created_at": "2024-01-02T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/folders
获取文件夹树结构

### GET /api/documents/:slug
获取单个文档详情

### POST /api/documents/:slug
解锁私密文档 (与 GET 同一路由，无 `/unlock` 子路径)

**请求体:**
```json
{
  "access_code": "密码"
}
```

## Admin API

除 `login` / `logout` 外，所有 Admin API 需要 JWT 认证。

**认证约定:** 没有全局中间件或 `hooks.server.ts`。每个 admin `+server.ts` 各自定义 `checkAuth`，读取 `auth_token` Cookie 并调用 `verifyToken`，失败返回 401。新增 admin 路由时必须自行加上这一检查，否则端点会公开暴露。

### POST /api/admin/login
管理员登录

### POST /api/admin/logout
登出

### CRUD 端点

| 方法   | 路径                      | 描述         |
|--------|---------------------------|--------------|
| GET    | /api/admin/documents      | 文档列表     |
| POST   | /api/admin/documents      | 创建文档     |
| GET    | /api/admin/documents/:id  | 获取文档     |
| PUT    | /api/admin/documents/:id  | 更新文档     |
| DELETE | /api/admin/documents/:id  | 删除文档     |
| GET    | /api/admin/folders        | 文件夹列表   |
| POST   | /api/admin/folders        | 创建文件夹   |
| GET    | /api/admin/folders/:id    | 获取文件夹   |
| PUT    | /api/admin/folders/:id    | 更新文件夹   |
| DELETE | /api/admin/folders/:id    | 删除文件夹   |
| GET    | /api/admin/settings       | 获取设置     |
| PUT    | /api/admin/settings       | 更新设置     |

### Quick Notes 端点

| 方法   | 路径                         | 描述             |
|--------|------------------------------|------------------|
| POST   | /api/admin/quick-notes       | 创建笔记         |
| GET    | /api/admin/quick-notes       | 获取列表（分页） |
| GET    | /api/admin/quick-notes/:id   | 获取笔记         |
| PUT    | /api/admin/quick-notes/:id   | 更新笔记         |
| DELETE | /api/admin/quick-notes/:id   | 删除笔记         |

## 源码位置

- 公开路由: `apps/web/src/routes/api/{timeline,mixed-timeline,folders,documents/[slug]}/+server.ts`
- Admin 路由: `apps/web/src/routes/api/admin/**/+server.ts` (各文件内的 `checkAuth`)
- JWT 签发/校验: `apps/web/src/lib/server/auth.ts` (`createToken`, `verifyToken`，jose HS256，7 天过期)
- 密码校验: `apps/web/src/lib/server/utils.ts` (`verifyPassword`，SHA-256 比对 `ADMIN_PASSWORD_HASH`)
- 数据访问: `apps/web/src/lib/server/db.ts`；类型: `apps/web/src/lib/server/types.ts`
