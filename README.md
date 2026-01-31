# ChronoMD

个人 Markdown 发布平台，以时间线形式展示内容。

**在线预览**: [chronomd.pdjjq.org](https://chronomd.pdjjq.org)

## 技术栈

- **前端**: SvelteKit + Tailwind CSS
- **部署**: Cloudflare Pages + D1 + R2
- **Markdown**: unified + shiki + KaTeX + mermaid + GFM
- **CLI**: Commander.js + TypeScript

## 功能

- 时间线式文档展示，支持分类文件夹
- 完整 Markdown 渲染（代码高亮、数学公式、流程图、表格等）
- 暗色模式（自动检测系统偏好）
- 文档加密访问（访问码）
- 管理后台（文档 / 文件夹 / 站点设置）
- CLI 工具，从本地 `.md` 文件直接发布

## 快速开始

```bash
pnpm install

# 配置
cp apps/web/wrangler.toml.example apps/web/wrangler.toml
# 编辑 wrangler.toml 填入你的 D1 数据库 ID、密码哈希、JWT 密钥

# 本地开发
cd apps/web && pnpm dev

# 部署
pnpm build && npx wrangler pages deploy .svelte-kit/cloudflare --project-name=your-project
```

## CLI 使用

```bash
cd packages/cli && pnpm build

node dist/index.js init        # 初始化配置
node dist/index.js login       # 登录
node dist/index.js publish .   # 发布当前目录下所有 .md 文件
node dist/index.js list        # 查看远程文档列表
```

发布时支持 frontmatter：

```yaml
---
title: 文章标题
slug: custom-slug
summary: 简介
folder: 文件夹名称
private: false
access_code: xxx
---
```

## 项目结构

```
apps/web/          # SvelteKit Web 应用
packages/cli/      # CLI 发布工具
llmdoc/            # 项目文档
```

## License

MIT
