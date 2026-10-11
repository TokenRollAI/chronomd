# ChronoMD 功能特性

## MVP 功能范围

### 已实现功能 ✅

#### 1. 文档 CRUD
- 创建、读取、更新、删除文档
- 自动生成 slug 或自定义 slug
- 支持文档摘要
- Markdown 内容存储在 R2

#### 2. 时间流首页
- 定位为零碎记录 / 日记的时间流（不是博客）：Quick Notes 与文档按发布时间倒序混排，文档只是较长的一条记录
- 按日历日分组，分日使用站点设置 `timezone`（非法值回退 UTC），保证 SSR 与客户端一致
- 分页支持（「← 较新 / 更早的记录 →」）
- 按文件夹筛选（`?folder=` 参数）
- 显示私密文档标记

#### 3. 文件夹管理
- 创建、编辑、删除文件夹
- 支持嵌套文件夹结构
- 自定义排序顺序
- 文档可归类到文件夹

#### 4. 私密文档 (Access Code)
- 设置访问密码保护文档
- 前端解锁验证
- 会话级别的解锁状态

#### 5. Admin 管理面板
- JWT 认证登录
- Dashboard 统计 (Quick notes / Documents / Published / Drafts) + 最近更新文档
- 文档列表与管理 (新建/编辑共用 `DocumentEditor`，⌘S 保存)
- Quick Notes 管理
- 文件夹管理
- 站点设置

#### 6. CLI 工具 (@chronomd/cli)
- `chronomd init` - 初始化配置（设置 API URL）
- `chronomd login` - 登录获取 token（JWT 认证）
- `chronomd publish <path>` - 发布 .md 文件或目录（支持 --dry-run）
  - **Folder 自动创建**: 发布目录时，子目录名自动映射为远程 folder；frontmatter `folder` 字段优先级更高
  - 使用 Map 缓存已解析的 folder，避免重复创建
- `chronomd list` - 列出远程文档
- `chronomd delete <slug>` - 删除文档
- `chronomd logout` - 登出清除 token
- 基于 Commander.js，支持 frontmatter 解析

#### 7. Markdown 渲染引擎 (unified pipeline)
- **代码高亮**: Shiki (one-dark-pro 主题)，替代 highlight.js
- **数学公式**: KaTeX 渲染
- **Mermaid 图表**: 客户端动态渲染
- **GFM 扩展**: 表格、任务列表、删除线、自动链接
- **标题锚点**: rehype-slug + rehype-autolink-headings
- **服务端预渲染**: Markdown 在 +page.server.ts 中预渲染为 HTML，提升首屏性能

#### 8. 暗色模式 (Dark Mode)
- **切换策略**: Tailwind CSS `class` 策略，用户可手动切换
- **系统检测**: 首次访问自动检测 `prefers-color-scheme: dark`
- **持久化**: 用户选择保存到 localStorage，下次访问保持
- **无闪烁**: 通过 `app.html` 内联脚本在页面渲染前应用主题
- **语义 token**: 颜色为 `app.css` 中 `:root` / `.dark` 两套 CSS 变量，组件无需 `dark:` 前缀；prose 通过 `--tw-prose-*` 变量配色
- **全量覆盖**: 前台与 Admin、代码块、表格、引用块、Mermaid 图表、选中文字等均随 token 切换

#### 9. 前端设计系统 (Design System v2)
- **语义色 token**: canvas / surface / ink / body / muted / faint / line / accent (+fg) / warn，亮暗两套值，详见 [设计系统](../architecture/design-system.md)
- **字体系统**: Newsreader + Noto Serif SC (衬线/标题) + Inter + 中文无衬线 (正文) + JetBrains Mono (时间/代码)，在 `app.html` 统一加载
- **共享组件类**: `.field` / `.btn-primary` / `.btn-ghost` / `.card` / `.switch` / `.admin-page` 等，位于 `app.css`
- **日记流条目**: 左侧竖线 + 圆点时间轴，笔记全文显示 (超 6 行可展开)，文档显示标题 + 摘要 +「继续阅读 →」
- **日记式详情页**: 标题上方显示完整日期时间 · 文件夹 · 私密，底部「← 回到时间流」
- **标题即导航**: 站点标题为可点击链接，指向首页 (`/`)
- **统一后台**: Admin 共用同一套 token，支持暗色模式；文档新建/编辑共用 `DocumentEditor`
- **设计源文件**: `chronomd.pen` 中的 v2 画板

#### 10. 移动端响应式设计 (Mobile-First)
- **断点策略**: Tailwind `md:` 断点 (768px)，移动端优先设计
- **前台**: 居中单栏 (首页 600px、详情 680px)，移动端 `px-5` 边距
- **Admin 导航**: 移动端顶部 header (View site / Logout / 主题切换) + 底部 5 项标签栏 (Dashboard / Notes / Docs / Folders / Settings)，无汉堡菜单
- **Admin 页面**: Dashboard 统计 2 列 / 桌面 4 列；Folders 移动端隐藏 Parent / Order 列；文档编辑器在 `lg` (1024px) 以下时右侧设置面板堆叠到正文下方

#### 11. Quick Notes 快速碎片化记录
- **主体内容**: Quick Notes 是时间流的主要内容形态；已登录用户在首页即可记录，无需创建完整文档
- **独立数据表**: `quick_notes` 表独立于 `documents` 表，字段简洁 (id, content, created_at, updated_at, is_archived)
- **内容限制**: 最大 500 字，带字数统计显示
- **混合时间线**: 首页 load 调用 `getMixedTimeline` 将文档和笔记按时间合并（同样逻辑对外暴露为 `/api/mixed-timeline`）
- **UI 组件**:
  - `Composer.svelte`: 首页顶部内嵌输入框（仅登录且第 1 页显示），自动增高，⌘/Ctrl+Enter 发送，Esc 失焦，成功后 `invalidateAll` 刷新
  - `StreamEntry.svelte`: 时间流条目，笔记全文显示，超过 6 行时出现「展开 / 收起」
- **权限控制**: 仅登录用户可见输入入口，未登录用户仅可浏览
- **暗色模式**: 随设计 token 自动适配
- **Admin 管理页面** (`/admin/quick-notes`):
  - 状态筛选: All / Active / Archived 三种视图切换
  - 归档/恢复: 一键归档或恢复笔记
  - 删除笔记: 带确认对话框的删除功能
  - 响应式设计: 桌面端和移动端适配
  - 侧边栏导航: 位于 Dashboard 之后、Documents 之前
  - 移动端底部标签栏: 短标签 Notes

#### 12. PWA 渐进式 Web 应用 (Progressive Web App)
- **离线支持**: 通过 Service Worker (Workbox) 实现静态资源预缓存和运行时缓存
- **可安装**: 提供 Web App Manifest，支持添加到主屏幕，standalone 模式运行
- **自动更新**: `registerType: 'autoUpdate'`，Service Worker 自动检测更新并激活
- **缓存策略**:
  - 静态资源预缓存: `**/*.{js,css,html,svg,png,woff,woff2}`
  - Google Fonts: CacheFirst (365天过期)
  - API 请求: NetworkFirst (24小时过期，10秒超时回退)
- **iOS 适配**: apple-touch-icon、apple-mobile-web-app-capable meta 标签
- **主题色**: manifest `theme_color` 为 `#0D6E6E` (亮色 accent)；`app.html` 的 `theme-color` meta 按亮/暗分别为 `#FAFAF9` / `#0E0D0C` (canvas)

### 计划功能 📋

#### Phase 2
- [x] CLI 工具 (命令行发布) - 已实现
- [ ] 图片上传到 R2
- [ ] 标签系统
- [ ] 搜索功能

#### Phase 3
- [ ] RSS Feed
- [ ] SEO 优化
- [x] 暗色模式 (Dark Mode) - 已实现
- [ ] 自定义主题
- [ ] 统计分析

## 技术特性

### 性能
- Serverless 架构，按需扩展
- 边缘计算，全球低延迟
- 静态资源 CDN 加速

### 安全
- JWT Token 认证
- 密码 SHA-256 哈希
- HTTPS 强制
- CORS 配置

### 开发体验
- Monorepo 统一管理
- TypeScript 类型安全
- 热重载开发
- Turborepo 构建缓存
