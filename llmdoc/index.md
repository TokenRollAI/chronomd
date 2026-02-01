# ChronoMD 文档索引

ChronoMD 是一个基于 Cloudflare 生态系统的极简个人 Markdown 发布平台，以时间线为核心展示方式。

## 项目结构

```
chronomd/
├── apps/
│   └── web/              # SvelteKit 前后端一体应用
│       ├── src/
│       │   ├── lib/
│       │   │   ├── api.ts           # 客户端 API 调用
│       │   │   ├── server/          # 服务端代码
│       │   │   │   ├── auth.ts      # JWT 认证
│       │   │   │   ├── db.ts        # 数据库操作
│       │   │   │   ├── types.ts     # 类型定义 (含 QuickNote, MixedTimelineItem)
│       │   │   │   └── utils.ts     # 工具函数
│       │   │   ├── stores/          # Svelte stores
│       │   │   │   ├── auth.ts      # 认证状态
│       │   │   │   └── theme.ts     # 暗色模式主题状态
│       │   │   ├── components/      # UI 组件
│       │   │   │   ├── ThemeToggle.svelte     # 主题切换按钮
│       │   │   │   ├── QuickNoteInput.svelte  # 快速笔记输入组件
│       │   │   │   └── QuickNoteCard.svelte   # 快速笔记卡片组件
│       │   │   └── utils/           # 前端工具
│       │   └── routes/
│       │       ├── api/             # API 路由 (+server.ts)
│       │       ├── admin/           # 管理后台页面
│       │       └── [slug]/          # 文档详情页
│       ├── migrations/              # 数据库迁移文件
│       │   └── 0002_quick_notes.sql # Quick Notes 表迁移
│       ├── static/                   # 静态资源 (PWA 图标等)
│       └── wrangler.toml            # Cloudflare 配置
├── packages/
│   └── cli/              # @chronomd/cli 命令行工具
│       ├── src/
│       │   ├── index.ts             # 入口
│       │   ├── types.ts             # 类型定义
│       │   ├── commands/            # 命令实现
│       │   └── lib/                 # 工具库（API 客户端、配置、frontmatter）
│       ├── package.json
│       ├── tsconfig.json
│       └── tsup.config.ts
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## 文档结构

### 概述文档 (overview/)
- [项目简介](./overview/project-intro.md) - 项目背景、目标和技术栈
- [功能特性](./overview/features.md) - MVP 功能范围和实现状态

### 指南文档 (guides/)
- [快速开始](./guides/quickstart.md) - 本地开发环境搭建
- [部署指南](./guides/deployment.md) - Cloudflare 部署流程

### 架构文档 (architecture/)
- [系统架构](./architecture/system-design.md) - 整体架构设计
- [API 设计](./architecture/api-design.md) - API 端点和数据流
- [数据库设计](./architecture/database-design.md) - D1 Schema 设计
- [设计系统](./architecture/design-system.md) - 前端视觉设计规范 (字体、颜色、组件)

### 参考文档 (reference/)
- [API 参考](./reference/api-reference.md) - 完整 API 文档
- [配置参考](./reference/configuration.md) - 配置项说明
- [CLI 参考](./reference/cli-reference.md) - @chronomd/cli 命令行工具文档

## 快速链接

- **本地开发**: `cd apps/web && pnpm dev`
- **应用地址**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin/login
- **Admin 密码**: 在 `apps/web/wrangler.toml` 中配置
- **生产环境**: https://chronomd.pdjjq.org
