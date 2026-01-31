# ChronoMD 项目简介

## 项目背景

ChronoMD 是一个面向个人博主和内容创作者的极简 Markdown 发布平台，采用时间线作为核心展示方式，让读者可以按时间顺序浏览内容。

## 设计理念

- **极简主义**: 专注于内容本身，移除不必要的功能
- **时间线优先**: 以时间为主线组织内容，符合博客阅读习惯
- **Serverless**: 基于 Cloudflare 生态，零服务器运维成本

## 技术栈

### 基础设施
- **Monorepo**: pnpm + turborepo
- **平台**: Cloudflare (Workers, Pages, D1, R2)

### 后端 (apps/api)
- **框架**: Hono.js - 轻量级 Web 框架
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2 (对象存储)
- **认证**: JWT (jose 库)

### 前端 (apps/web)
- **框架**: SvelteKit
- **样式**: Tailwind CSS + @tailwindcss/typography, 支持暗色模式 (`class` 策略)
- **Markdown**: unified (remark-parse → remark-rehype → rehype-stringify) + Shiki 代码高亮 + KaTeX 数学公式 + Mermaid 图表

## 目录结构

```
chronomd/
├── apps/
│   ├── api/          # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── index.ts       # 入口
│   │   │   ├── types.ts       # 类型定义
│   │   │   ├── routes/        # 路由
│   │   │   ├── middleware/    # 中间件
│   │   │   ├── services/      # 业务逻辑
│   │   │   └── utils/         # 工具函数
│   │   ├── schema.sql         # D1 Schema
│   │   └── wrangler.toml      # Worker 配置
│   │
│   └── web/          # SvelteKit 前端
│       ├── src/
│       │   ├── lib/           # 共享代码
│       │   │   ├── stores/    # Svelte stores (auth, theme)
│       │   │   └── components/ # UI 组件 (ThemeToggle)
│       │   └── routes/        # 页面路由
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
