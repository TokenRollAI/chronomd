# 前端设计系统

## 1. Identity

- **What it is:** ChronoMD 的前端视觉设计系统，定义了字体、颜色、组件样式等设计规范。
- **Purpose:** 提供统一的极简现代风格 UI，确保前台和后台视觉一致性。

## 2. Core Components

- `apps/web/tailwind.config.js` (fontFamily, colors, typography): Tailwind 主题配置，定义字体族、主色调和排版样式。
- `apps/web/src/routes/+page.svelte` (yearGroups, timeline): 首页时间线视图，使用胶囊样式展示文档列表。
- `apps/web/src/routes/admin/+layout.svelte` (navItems, getIcon): Admin 侧边栏布局，浅色主题导航。
- `apps/web/src/routes/admin/+page.svelte` (stats, recentDocs): Dashboard 页面，极简卡片式数据展示。
- `apps/web/src/routes/[slug]/+page.svelte` (displayContent): 文档详情页，serif 标题 + 优化的 prose 排版。

## 3. Design Tokens

### 字体系统 (Font Stack)
| 用途 | 字体族 | CSS Class |
|------|--------|-----------|
| 标题 | Newsreader (衬线) | `font-serif` |
| 正文/UI | Inter (无衬线) | `font-sans` |
| 代码/数据 | JetBrains Mono | `font-mono` |

### 颜色系统 (Color Palette)
| 用途 | 色值 | CSS |
|------|------|-----|
| 主色 (按钮/链接) | #0D6E6E (青色) | `text-[#0D6E6E]`, `bg-[#0D6E6E]` |
| 次要色 (草稿状态) | #E07B54 (橙色) | `text-[#E07B54]` |
| 页面背景 | #FAFAFA | `bg-[#FAFAFA]` |
| 卡片背景 | #FFFFFF | `bg-white` |
| 边框 | #E5E5E5 | `border-[#E5E5E5]` |
| 主要文字 | #1A1A1A | `text-[#1A1A1A]` |
| 次要文字 | #666666 | `text-[#666666]` |
| 辅助文字 | #888888 | `text-[#888888]` |

## 4. UI Patterns

### 时间线胶囊 (Timeline Capsule)
首页文档列表采用胶囊样式：
- 圆角: `rounded-full`
- 高度: `h-9`
- 边框: 1px `border-[#E5E5E5]`
- Hover: `hover:border-[#0D6E6E]`
- 代码位置: `apps/web/src/routes/+page.svelte:81-97`

### Admin 卡片 (Admin Card)
Dashboard 统计卡片：
- 圆角: `rounded-xl`
- 边框: 1px `border-[#E5E5E5]`
- 无阴影 (flat design)
- 代码位置: `apps/web/src/routes/admin/+page.svelte:20-32`

### 文章排版 (Article Typography)
详情页 prose 配置：
- 标题: `font-serif font-semibold`
- 正文: `text-[#666666]` + `leading-relaxed`
- 链接: `text-[#0D6E6E] underline`
- 代码位置: `apps/web/src/routes/[slug]/+page.svelte:159-170`

## 5. Design Rationale

- **1px 边框代替阴影**: 减少视觉噪音，保持页面轻盈
- **统一浅色主题**: Admin 和前台使用相同的浅色基调，通过 dark mode 支持暗色
- **衬线标题 + 无衬线正文**: 增加层次感，提升阅读体验
- **胶囊式交互**: 清晰的点击区域，现代感强

## 6. Design Source

设计原稿: `chronomd.pen` (Pencil MCP 格式)
- Page 1: Timeline - Public View
- Page 2: Dashboard - Admin Panel
- Page 3: Document Detail Page
