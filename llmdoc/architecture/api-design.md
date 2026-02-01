# API 设计

## 概述

API 基于 Hono.js 构建，运行在 Cloudflare Workers 上。采用 RESTful 风格，JSON 格式通信。

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

### POST /api/documents/:slug/unlock
解锁私密文档

**请求体:**
```json
{
  "access_code": "密码"
}
```

## Admin API

所有 Admin API 需要 JWT 认证。

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
| PUT    | /api/admin/folders/:id    | 更新文件夹   |
| DELETE | /api/admin/folders/:id    | 删除文件夹   |
| GET    | /api/admin/settings       | 获取设置     |
| PUT    | /api/admin/settings       | 更新设置     |

### Quick Notes 端点

| 方法   | 路径                         | 描述             |
|--------|------------------------------|------------------|
| POST   | /api/admin/quick-notes       | 创建笔记         |
| GET    | /api/admin/quick-notes       | 获取列表（分页） |
| PUT    | /api/admin/quick-notes/:id   | 更新笔记         |
| DELETE | /api/admin/quick-notes/:id   | 删除笔记         |

## 源码位置

- 路由入口: `apps/api/src/index.ts`
- 公开路由: `apps/api/src/routes/public.ts`
- Admin 路由: `apps/api/src/routes/admin.ts`
- 认证中间件: `apps/api/src/middleware/auth.ts`
