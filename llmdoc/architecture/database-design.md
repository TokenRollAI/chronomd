# 数据库设计

## 概述

使用 Cloudflare D1 (SQLite) 存储元数据，Schema 定义在 `apps/api/schema.sql`。

## 表结构

### settings - 站点设置

| 字段       | 类型   | 描述           |
|------------|--------|----------------|
| key        | TEXT   | 设置键 (主键)   |
| value      | TEXT   | 设置值          |
| updated_at | TEXT   | 更新时间        |

**默认设置:**
- `site_title`: 站点标题
- `site_description`: 站点描述
- `timezone`: 时区
- `posts_per_page`: 每页文章数

### folders - 文件夹

| 字段       | 类型    | 描述                   |
|------------|---------|------------------------|
| id         | TEXT    | ID (主键)              |
| name       | TEXT    | 文件夹名称             |
| slug       | TEXT    | URL 标识 (唯一)        |
| parent_id  | TEXT    | 父文件夹 ID (可空)     |
| sort_order | INTEGER | 排序顺序               |
| created_at | TEXT    | 创建时间               |
| updated_at | TEXT    | 更新时间               |

**索引:**
- `idx_folders_parent`: parent_id
- `idx_folders_slug`: slug

### documents - 文档

| 字段             | 类型    | 描述                     |
|------------------|---------|--------------------------|
| id               | TEXT    | ID (主键)                |
| title            | TEXT    | 文档标题                 |
| slug             | TEXT    | URL 标识 (唯一)          |
| summary          | TEXT    | 摘要 (可空)              |
| folder_id        | TEXT    | 所属文件夹 ID (可空)     |
| is_published     | INTEGER | 是否发布 (0/1)           |
| is_private       | INTEGER | 是否私密 (0/1)           |
| access_code_hash | TEXT    | 访问密码哈希 (可空)      |
| published_at     | TEXT    | 发布时间 (可空)          |
| created_at       | TEXT    | 创建时间                 |
| updated_at       | TEXT    | 更新时间                 |

**索引:**
- `idx_documents_slug`: slug
- `idx_documents_folder`: folder_id
- `idx_documents_published`: is_published, published_at
- `idx_documents_timeline`: is_published, is_private, published_at DESC

### quick_notes - 快速笔记

| 字段        | 类型    | 描述                 |
|-------------|---------|----------------------|
| id          | TEXT    | ID (主键)            |
| content     | TEXT    | 笔记内容 (最大500字) |
| is_archived | INTEGER | 是否归档 (0/1)       |
| created_at  | TEXT    | 创建时间             |
| updated_at  | TEXT    | 更新时间             |

**迁移文件:** `migrations/0002_quick_notes.sql`

**设计说明:**
- 独立于 `documents` 表，专为轻量级快速记录设计
- 无 slug、folder 等复杂字段
- `is_archived` 用于软删除/归档功能

## R2 存储结构

Markdown 内容存储在 R2：

```
chronomd-storage/
└── documents/
    ├── article-slug-1.md
    ├── article-slug-2.md
    └── ...
```

## ID 生成

使用 nanoid 生成 12 位字母数字 ID：
- 字符集: `abcdefghijklmnopqrstuvwxyz0123456789`
- 示例: `abc123xyz789`

## 数据迁移

```bash
# 本地迁移
cd apps/api
pnpm db:migrate

# 生产迁移
pnpm db:migrate:prod
```
