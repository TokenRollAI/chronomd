# 前端设计系统 (v2)

## 1. Identity

- **What it is:** ChronoMD 前台与 Admin 的统一视觉系统：语义色 token、字体、共享组件类和核心 UI 模式。
- **Purpose:** 服务于产品定位——ChronoMD 是**零碎记录 / 日记的时间流**，不是博客。用户的博客另有其处，用于长篇完整写作；这里 Quick Notes 是主体内容，Markdown 文档只是流中"较长的一条记录"。
- **定位约束 (2026-10-11 用户决策):** 避免博客范式——不做文章索引、阅读时长、"长文"标签、按年归档。新增 UI 时以"日记流"而非"文章列表"为基准。

## 2. Core Components

- `apps/web/src/app.css`: 设计 token (CSS 变量，`:root` / `.dark`)、prose 配色与排版、`@layer components` 共享类。
- `apps/web/tailwind.config.js` (`token`, `colors`, `fontFamily`): 把 CSS 变量映射为 Tailwind 语义色和字体族。
- `apps/web/src/app.html`: 一次性加载 Google Fonts (含 preconnect)，light/dark 两条 `theme-color` meta。
- `apps/web/src/lib/utils/time.ts` (`groupByDay`, `timeOfDay`, `fullDateTime`): 按站点时区分日与格式化时间。
- `apps/web/src/lib/components/StreamEntry.svelte`、`Composer.svelte`、`SiteHeader.svelte`、`ThemeToggle.svelte`: 前台时间流组件。
- `apps/web/src/lib/components/DocumentEditor.svelte`、`DocumentRow.svelte`: Admin 共享组件。

## 3. Design Tokens

### 颜色 (语义 token)
定义为 RGB 通道的 CSS 变量 `--c-*`，Tailwind 通过 `rgb(var(--c-x) / <alpha-value>)` 引用，因此透明度修饰符可用 (如 `bg-accent/[0.07]`、`bg-warn/10`)。

| Token (Tailwind) | 用途 | Light | Dark |
|------|------|------|------|
| `canvas` | 页面背景 | #FAFAF9 | #0E0D0C |
| `surface` | 卡片 / 输入框背景 | #FFFFFF | #181716 |
| `ink` | 标题、主要文字 | #1C1917 | #F5F5F4 |
| `body` | 正文 (笔记、prose) | #44403C | #D6D3D1 |
| `muted` | 次要文字 | #78716C | #A8A29E |
| `faint` | 辅助文字、时间、圆点 | #A8A29E | #6B6560 |
| `line` | 边框、分隔线、时间线竖线 | #E7E5E4 | #2A2826 |
| `accent` | 链接、主按钮、激活态、已发布 | #0D6E6E | #5FB3AC |
| `accent-fg` | accent 背景上的文字 | #FFFFFF | #0E0D0C |
| `warn` | 草稿状态、错误、字数超限 | #C2410C | #F0A070 |

**规则:** 组件中不要再写硬编码色值 (旧的 `text-[#0D6E6E]`、`border-[#E5E5E5]`、`stone-*` / `gray-*` 写法与 `primary-*` 色板已全部移除，一律改用语义 token)。暗色模式完全由 `.dark` 下的变量覆盖实现，组件无需 `dark:` 前缀；prose 配色通过 `--tw-prose-*` 变量指向 token，不使用 `dark:prose-invert`。例外：代码块背景、Shiki 高亮行等固定为深色的样式在 `app.css` 中直接写色值。

### 字体
| 变量 / Class | 字体栈 | 用途 |
|------|------|------|
| `--font-sans` / `font-sans` | Inter + PingFang SC / Hiragino Sans GB / Microsoft YaHei / Noto Sans SC | 正文、UI |
| `--font-serif` / `font-serif` | Newsreader + Noto Serif SC | 页面标题、日期标题、文档标题 |
| `--font-mono` / `font-mono` | JetBrains Mono | 时间、字数、slug、代码 |

- 字体只在 `app.html` 加载一次；页面内不要再单独引入字体 `<link>`。
- prose：正文 sans，h1–h4 serif；内容内 h1/h2/h3 缩小 (1.5em / 1.3em / 1.12em)，保证低于页面标题层级。

### 共享组件类 (`app.css` `@layer components`)
| Class | 用途 |
|------|------|
| `.field` / `.field-label` | 输入框 (`textarea.field` 自动变高) 与表单标签 |
| `.btn` / `.btn-primary` / `.btn-ghost` | 全圆角 (`rounded-full`) 按钮基类 / accent 实心 / 描边 |
| `.card` | `surface` 背景 + `line` 边框 + `rounded-xl` |
| `.switch` | 开关外观，必须紧跟在 `<input type="checkbox" class="peer sr-only">` 之后 (依赖 `peer-checked`) |
| `.admin-page` / `.admin-title` | Admin 页面容器 (max 992px) / serif 页面标题 |
| `.alert-error` / `.alert-success` | warn / accent 浅底提示条 |

## 4. 前台模式 (Public)

### 时间流首页 (`routes/+page.svelte`)
- 600px 单栏；`SiteHeader` (标题链接回 `/` + ThemeToggle)，其下显示 `site_description`。
- 登录且在第 1 页时，顶部内嵌 `Composer`。
- 条目按**日历日**分组 (`groupByDay`)，日期标题为 serif「10月8日」+ faint「周四」，非当年才加年份前缀。
- 分页文案「← 较新 / 更早的记录 →」，UI 文案为中文。

### 时区一致性 (`lib/utils/time.ts`)
分日与时间格式化统一使用 `settings.timezone`（非法值回退 UTC）。原因：Workers SSR 运行在 UTC，若用运行环境本地时区，服务端与客户端会分出不同的日组并导致 hydration 不一致。新增任何日期展示都应走这些 helper 并传入站点时区。

### 时间流条目 (`StreamEntry.svelte`)
- 左侧竖线就是 `<article>` 的 `border-l`（当天最后一条设为透明，竖线在日组内收尾）；圆点绝对定位在竖线上，第 1 页最新一条用 accent 高亮，其余 faint。
- 时间 `HH:mm`，mono faint。
- 笔记：完整显示原文，`line-clamp-6`；挂载时测量是否溢出，仅溢出时显示「展开 / 收起」。
- 文档：serif 标题 + 摘要 (`line-clamp-2`) + 「继续阅读 →」；私密文档显示锁图标，不显示摘要，链接文案为「需要访问码」。

### 内联输入 (`Composer.svelte`)
- 自动增高的 textarea，占位「此刻在想什么…」，500 字上限，聚焦或有内容时才显示字数与「记录」按钮。
- ⌘/Ctrl+Enter 提交，Esc 失焦；成功后派发 `created`，首页以 `invalidateAll` 刷新。
- 取代旧的底部固定悬浮栏 + 弹窗方案。

### 详情页 (`routes/[slug]/+page.svelte`)
- 680px 单栏，日记式：顶部「← 时间流」，标题上方 meta 行 `fullDateTime` (如「2026年10月5日 周日 · 14:20」) · 文件夹 (accent) · 私密；serif 标题；prose 正文；底部「← 回到时间流」。
- 解锁表单使用 `.field` / `.btn-primary`。

## 5. Admin 模式

### Shell (`routes/admin/+layout.svelte`)
- 桌面：232px 侧边栏；激活项为 `bg-accent/[0.07]` 浅底 + accent 图标 (不用实心青色)；导航顺序 Dashboard、Quick Notes、Documents、Folders、Settings；底部 View site / Logout / ThemeToggle。
- 移动：顶部 header (View site / Logout / 主题图标) + 底部 5 项标签栏 (短标签 Notes / Docs)；不再有汉堡滑出菜单。
- `/admin/login` 不渲染 shell (`isLogin`)。
- Admin 已完整支持暗色模式。

### 页面模式
- **Dashboard:** 4 项无卡片统计 (Quick notes / Documents / Published / Drafts)，下方最近更新列表。
- **`DocumentRow`:** 标题 + 私密锁、文件夹、状态圆点 (accent=Published，warn=Draft)、紧凑日期；Dashboard 与 Documents 列表共用。
- **`DocumentEditor`:** 新建与编辑共用。面包屑 + View (编辑时) + Create/Save，⌘S 保存；左侧无边框 serif 标题、摘要和 mono 正文 textarea 卡片；右侧 272px 面板 (`lg` 以下堆叠到下方)：Slug、Folder、Published / Private 开关、访问码、Delete (编辑时)。
- **Quick Notes:** 全圆角 pill 筛选标签 (All / Active / Archived)，操作按钮在桌面端 hover / focus 时显现 (移动端常显)。
- **Folders:** 移动端隐藏 Parent / Order 列。
- **Settings:** 时区字段提示 "Used to group the stream by day"。

## 6. Responsive

- 主断点 `md:` (768px)，移动端优先；`DocumentEditor` 的双栏额外使用 `lg:` (1024px)。
- 前台为居中单栏，移动端 `px-5`，桌面端靠 max-width 收窄。
- Admin 移动端以底部标签栏为主导航，`main` 预留 `pb-20`。

## 7. Design Rationale

- **日记流而非博客**: 按日分组 + 竖线时间轴让零碎记录有连续感；文档与笔记同流，不单独建立"文章"区。
- **语义 token**: 一套变量同时驱动亮/暗两态，组件不再分支书写暗色样式，也避免硬编码色值漂移。
- **衬线标题 + 无衬线正文**: 日期、标题有书写感，正文保持易读。
- **1px 边框代替阴影**: 保持轻盈、低噪音。
- **克制的强调色**: accent 只用于链接、主操作、激活与已发布态；warn 只用于草稿和错误。

## 8. Design Source

设计原稿 `chronomd.pen` (Pencil MCP 格式)，当前有效的是 y≥1700 的 v2 画板：
- `v2 · Stream - Desktop`、`v2 · Stream - Mobile`
- `v2 · Entry Detail - Desktop`
- `v2 · Admin Dashboard - Desktop`、`v2 · Admin Edit Document - Desktop`
- pen 变量 `v2-bg` / `v2-surface` / `v2-ink` / `v2-body` / `v2-muted` / `v2-faint` / `v2-line` / `v2-accent` / `v2-accent-soft` / `v2-warn`，含 light/dark 主题，对应 `app.css` token。

旧画板 (Timeline、Dashboard、Document Detail、Mobile Views，以及 QuickNote 胶囊设计 `LE7hb` / `PE8aA` 等) 已被取代，不再作为实现依据。
