# ChronoMD 项目指南

## 项目概述

ChronoMD 是一个基于 Cloudflare 生态系统的极简个人 Markdown 发布平台，以时间线为核心展示方式。

## 技术栈

- **前端**: SvelteKit + Tailwind CSS
- **后端**: Cloudflare Workers
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **CLI**: @chronomd/cli (Commander.js)

## 部署到 Cloudflare

### 快速部署

```bash
cd apps/web
pnpm build && npx wrangler pages deploy .svelte-kit/cloudflare --project-name=chronomd-web --commit-dirty=true
```

### 详细步骤

1. **构建应用**
   ```bash
   cd apps/web
   pnpm build
   ```

2. **部署到 Cloudflare Pages**
   ```bash
   npx wrangler pages deploy .svelte-kit/cloudflare --project-name=chronomd-web --commit-dirty=true
   ```

### 生产环境

- **域名**: https://chronomd.pdjjq.org
- **管理后台**: https://chronomd.pdjjq.org/admin/login

## 本地开发

```bash
cd apps/web
pnpm dev
```

- **应用地址**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin/login

## 设计文件

项目包含 Pencil 设计文件 `chronomd.pen`，包含三个页面设计：
- Timeline (前台时间线)
- Dashboard (Admin 管理面板)
- Document Detail (文档详情页)

## 文档系统

项目使用 llmdoc 文档系统，详见 `llmdoc/index.md`。
