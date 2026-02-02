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

## 4. Responsive Design (Mobile-First)

### 断点系统
| 断点 | 宽度 | 用途 |
|------|------|------|
| 默认 | < 768px | 移动端 |
| `md:` | >= 768px | 桌面端 |

### 时间线页面 (`+page.svelte`)
- **文档胶囊**: `w-full md:w-fit` - 移动端全宽，桌面端自适应
- **年份标签**: 仅移动端显示的响应式年份分组标签
- **按钮高度**: `h-11 md:h-9` - 移动端触摸优化 (44px)
- 代码位置: `apps/web/src/routes/+page.svelte`

### 文档详情页 (`[slug]/+page.svelte`)
- **标题排版**: `text-2xl md:text-4xl` - 响应式字号
- **水平间距**: `px-5 md:px-6` - 移动端紧凑边距
- **垂直间距**: `py-6 md:py-12` - 移动端紧凑内边距
- 代码位置: `apps/web/src/routes/[slug]/+page.svelte`

### Admin 移动端导航 (`admin/+layout.svelte`)
- **顶部导航栏**: 固定高度 `h-16`，含汉堡菜单按钮
- **侧边滑出面板**: 汉堡菜单触发的移动端导航
- **底部标签栏**: 固定定位 `h-16 z-40`，4 个导航项 (Dashboard, Documents, Folders, Settings)
- **桌面端侧边栏**: `hidden md:flex` - 仅桌面端显示
- 代码位置: `apps/web/src/routes/admin/+layout.svelte`

### Admin 仪表盘 (`admin/+page.svelte`)
- **统计卡片网格**: `grid-cols-1 md:grid-cols-3` - 移动端垂直堆叠
- **新建按钮**: 响应式尺寸和文字
- **文档列表**: 移动端优化的列表项间距
- 代码位置: `apps/web/src/routes/admin/+page.svelte`

## 5. UI Patterns

### 时间线胶囊 (Timeline Capsule)
首页文档列表采用胶囊样式：
- 圆角: `rounded-full`
- 高度: `h-11 md:h-9` (触摸优化)
- 宽度: `w-full md:w-fit` (移动端全宽)
- 边框: 1px `border-[#E5E5E5]`
- Hover: `hover:border-[#0D6E6E]`
- 代码位置: `apps/web/src/routes/+page.svelte`

### Admin 卡片 (Admin Card)
Dashboard 统计卡片：
- 圆角: `rounded-xl`
- 边框: 1px `border-[#E5E5E5]`
- 网格: `grid-cols-1 md:grid-cols-3`
- 无阴影 (flat design)
- 代码位置: `apps/web/src/routes/admin/+page.svelte`

### 底部标签栏 (Bottom Tab Bar)
移动端专用导航：
- 高度: `h-16` (64px)
- 位置: `fixed bottom-0 left-0 right-0 z-40`
- 图标: Dashboard, Documents (FileText), Folders, Settings
- 主色高亮: `text-[#0D6E6E]` (当前页)
- 仅移动端: `md:hidden`
- 代码位置: `apps/web/src/routes/admin/+layout.svelte`

### 站点标题导航 (Site Title Navigation)
时间线页和文档详情页的 header 中，站点标题 (`<h1>`) 使用 `<a href="/">` 包裹，点击可返回首页。
- 适用页面: `apps/web/src/routes/+page.svelte`, `apps/web/src/routes/[slug]/+page.svelte`

### QuickNote 胶囊 (QuickNote Capsule)
Quick Notes 采用可展开的胶囊式设计，区别于文档胶囊：

**收缩状态 (默认)**:
- 形状: `rounded-full` (胶囊)
- 高度: `h-11 md:h-10` (触摸优化)
- 宽度: `w-full md:w-fit` (移动端全宽)
- 边框: `border-[#E5E5E5]`，Hover 时 `border-[#0D6E6E]`
- 内容: 日期 + "Quick Note" 标签 + 内容预览 (20字) + 下箭头

**展开状态 (点击后)**:
- 形状: `rounded-2xl` (卡片)
- 边框: `border-[#0D6E6E]` (青色高亮)
- 内边距: `p-4`
- 内容: 完整日期时间 + 标签 + 上箭头 + 完整内容

**智能展开逻辑**:
- 仅内容超过 20 字符时显示箭头并启用点击展开
- 短内容保持静态胶囊，cursor-default

**代码位置**: `apps/web/src/lib/components/QuickNoteCard.svelte`

### 文章排版 (Article Typography)
详情页 prose 配置：
- 标题: `font-serif font-semibold text-2xl md:text-4xl`
- 正文: `text-[#666666]` + `leading-relaxed`
- 链接: `text-[#0D6E6E] underline`
- 代码位置: `apps/web/src/routes/[slug]/+page.svelte`

## 6. Design Rationale

- **1px 边框代替阴影**: 减少视觉噪音，保持页面轻盈
- **统一浅色主题**: Admin 和前台使用相同的浅色基调，通过 dark mode 支持暗色
- **衬线标题 + 无衬线正文**: 增加层次感，提升阅读体验
- **胶囊式交互**: 清晰的点击区域，现代感强
- **移动端优先 (Mobile-First)**: 默认样式针对移动端，通过 `md:` 断点增强桌面端体验
- **触摸优化**: 移动端按钮高度 44px (h-11)，符合 iOS Human Interface Guidelines
- **底部标签栏导航**: 移动端采用原生 App 式底部导航，提升可达性

## 7. Design Source

设计原稿: `chronomd.pen` (Pencil MCP 格式)
- Page 1: Timeline - Public View
- Page 2: Dashboard - Admin Panel
- Page 3: Document Detail Page
- Page 4: Mobile Responsive Views (时间线、详情页、Admin 导航)
- Node `LE7hb`: QuickNote Capsule Design (桌面端胶囊设计)
- Node `PE8aA`: QuickNote Capsule - Mobile (移动端胶囊设计)
