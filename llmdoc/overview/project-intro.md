# ChronoMD 项目简介

## 项目背景

ChronoMD 是一个极简的个人记录平台，用按日分组的时间流承载零碎的记录和日记。Quick Notes 是主体内容，Markdown 文档在流中只是较长的一条记录。它不是博客：用户的博客另有其处，用于长篇完整写作。

## 设计理念

- **极简主义**: 专注于内容本身，移除不必要的功能
- **时间流优先**: 以时间为主线、按日组织记录，刻意避开博客范式 (文章索引、阅读时长、长文标签、年度归档)
- **Serverless**: 基于 Cloudflare 生态，零服务器运维成本

## 技术栈

### 基础设施
- **Monorepo**: pnpm + turborepo
- **平台**: Cloudflare Pages (Workers 运行时) + D1 + R2

### 应用 (apps/web，前后端一体)
- **框架**: SvelteKit + adapter-cloudflare；API 即 `src/routes/api/**/+server.ts`，没有独立后端服务
- **服务端模块**: `src/lib/server/` (auth / db / types / utils)
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (对象存储)
- **认证**: JWT (jose 库)，`auth_token` HttpOnly Cookie
- **样式**: Tailwind CSS + @tailwindcss/typography, 支持暗色模式 (`class` 策略)
- **Markdown**: unified (remark-parse → remark-rehype → rehype-stringify) + Shiki 代码高亮 + KaTeX 数学公式 + Mermaid 图表

## 目录结构

```
chronomd/
├── apps/
│   └── web/          # SvelteKit 前后端一体应用 (唯一的 app)
│       ├── src/
│       │   ├── lib/           # 共享代码
│       │   │   ├── server/    # 服务端模块 (auth, db, types, utils)
│       │   │   ├── stores/    # Svelte stores (auth, theme)
│       │   │   └── components/ # UI 组件 (SiteHeader, Composer, StreamEntry, ThemeToggle 等)
│       │   └── routes/        # 页面路由 + api/ (+server.ts)
│       ├── migrations/        # D1 迁移 (仅 0002_quick_notes.sql，基础 schema 缺失)
│       ├── wrangler.toml.example # Cloudflare 配置模板 (wrangler.toml 被 gitignore)
│       └── svelte.config.js
│
├── packages/
│   └── cli/          # @chronomd/cli 命令行工具 (已实现)
│       ├── src/
│       │   ├── index.ts       # 入口
│       │   ├── types.ts       # 类型定义
│       │   ├── commands/      # 命令实现 (init, login, publish, list, delete)
│       │   └── lib/           # 工具库 (api, config, frontmatter)
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

### CLI 工具 (packages/cli)
- **包名**: @chronomd/cli
- **框架**: Commander.js
- **构建**: tsup (TypeScript → ESM)
- **依赖**: chalk (输出美化), conf (配置持久化), gray-matter (frontmatter 解析), ora (进度指示器)

## 相关链接

- [功能特性](./features.md)
- [快速开始](../guides/quickstart.md)
