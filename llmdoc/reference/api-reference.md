# API 参考

## 基础信息

- **Base URL**: `http://localhost:8787` (开发) / `https://api.yourdomain.com` (生产)
- **Content-Type**: `application/json`
- **认证**: JWT Token (Cookie 或 Authorization Header)

---

## 公开 API

### GET /health
健康检查

**响应:**
```json
{"status": "ok"}
```

---

### GET /api/timeline
获取时间线

**Query 参数:**
| 参数   | 类型   | 必填 | 默认值 | 描述             |
|--------|--------|------|--------|------------------|
| page   | number | 否   | 1      | 页码             |
| limit  | number | 否   | 20     | 每页数量 (max 100)|
| folder | string | 否   | -      | 文件夹 slug 筛选 |

**响应:**
```json
{
  "success": true,
  "data": {
    "items": [{
      "id": "abc123",
      "title": "文章标题",
      "slug": "article-slug",
      "summary": "摘要内容",
      "is_private": false,
      "published_at": "2024-01-01T00:00:00.000Z",
      "folder": {
        "id": "folder123",
        "name": "技术",
        "slug": "tech"
      }
    }],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

---

### GET /api/folders
获取文件夹树

**响应:**
```json
{
  "success": true,
  "data": [{
    "id": "folder123",
    "name": "技术",
    "slug": "tech",
    "parent_id": null,
    "sort_order": 0,
    "children": [{
      "id": "folder456",
      "name": "前端",
      "slug": "frontend",
      "parent_id": "folder123",
      "sort_order": 0,
      "children": []
    }]
  }]
}
```

---

### GET /api/documents/:slug
获取文档详情

**Headers:**
- `X-Unlocked-Documents`: 已解锁的文档 slug 列表 (逗号分隔)

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "doc123",
    "title": "文章标题",
    "slug": "article-slug",
    "summary": "摘要",
    "content": "# Markdown 内容...",
    "is_private": false,
    "is_locked": false,
    "published_at": "2024-01-01T00:00:00.000Z",
    "folder": { "id": "...", "name": "...", "slug": "..." }
  }
}
```

---

### POST /api/documents/:slug/unlock
解锁私密文档

**请求体:**
```json
{
  "access_code": "password123"
}
```

**响应 (成功):**
```json
{
  "success": true,
  "data": {
    "unlocked": true,
    "document": { ... }
  }
}
```

---

### GET /api/mixed-timeline
获取混合时间线（文档 + Quick Notes）

**Query 参数:**
| 参数   | 类型   | 必填 | 默认值 | 描述             |
|--------|--------|------|--------|------------------|
| page   | number | 否   | 1      | 页码             |
| limit  | number | 否   | 20     | 每页数量 (max 100)|

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
        "summary": "摘要",
        "is_private": false,
        "published_at": "2024-01-01T00:00:00.000Z"
      },
      {
        "type": "note",
        "id": "note456",
        "content": "快速笔记内容",
        "is_archived": false,
        "created_at": "2024-01-02T00:00:00.000Z"
      }
    ],
    "total": 42,
    "page": 1,
    "limit": 20
  }
}
```

**类型定义:**
- `MixedTimelineItem`: `{ type: 'document' | 'note', ... }`

---

## Admin API

> 所有 Admin API 需要认证

### POST /api/admin/login
管理员登录

**请求体:**
```json
{
  "password": "your-admin-password"
}
```

**响应:**
```json
{
  "success": true,
  "data": { "message": "Login successful" }
}
```

设置 HttpOnly Cookie: `auth_token`

---

### POST /api/admin/logout
登出

---

### GET /api/admin/documents
获取文档列表

**Query 参数:**
| 参数      | 类型    | 描述               |
|-----------|---------|-------------------|
| page      | number  | 页码               |
| limit     | number  | 每页数量           |
| folder_id | string  | 文件夹 ID 筛选     |
| published | boolean | 发布状态筛选       |

---

### POST /api/admin/documents
创建文档

**请求体:**
```json
{
  "title": "文章标题",
  "slug": "custom-slug",
  "summary": "摘要",
  "content": "# Markdown 内容",
  "folder_id": "folder123",
  "is_published": true,
  "is_private": false,
  "access_code": "password123",
  "published_at": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /api/admin/documents/:id
获取单个文档 (包含内容)

---

### PUT /api/admin/documents/:id
更新文档

---

### DELETE /api/admin/documents/:id
删除文档

---

### GET /api/admin/folders
获取文件夹列表

---

### POST /api/admin/folders
创建文件夹

**请求体:**
```json
{
  "name": "文件夹名称",
  "slug": "folder-slug",
  "parent_id": "parent123",
  "sort_order": 0
}
```

---

### PUT /api/admin/folders/:id
更新文件夹

---

### DELETE /api/admin/folders/:id
删除文件夹

---

### GET /api/admin/settings
获取站点设置

**响应:**
```json
{
  "success": true,
  "data": {
    "site_title": "ChronoMD",
    "site_description": "...",
    "timezone": "UTC",
    "posts_per_page": "20"
  }
}
```

---

### PUT /api/admin/settings
更新设置

**请求体:**
```json
{
  "site_title": "新标题",
  "posts_per_page": "30"
}
```

---

## Quick Notes Admin API

> 所有 Quick Notes API 需要认证

### POST /api/admin/quick-notes
创建快速笔记

**请求体:**
```json
{
  "content": "笔记内容 (最大500字)"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "note123",
    "content": "笔记内容",
    "is_archived": false,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET /api/admin/quick-notes
获取笔记列表（分页）

**Query 参数:**
| 参数   | 类型   | 必填 | 默认值 | 描述       |
|--------|--------|------|--------|------------|
| page   | number | 否   | 1      | 页码       |
| limit  | number | 否   | 20     | 每页数量   |

---

### PUT /api/admin/quick-notes/:id
更新笔记

**请求体:**
```json
{
  "content": "更新后的内容",
  "is_archived": false
}
```

---

### DELETE /api/admin/quick-notes/:id
删除笔记

**类型定义:**
- `QuickNote`: `{ id, content, is_archived, created_at, updated_at }`
