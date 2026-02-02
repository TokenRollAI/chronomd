# ChronoMD 功能特性

## MVP 功能范围

### 已实现功能 ✅

#### 1. 文档 CRUD
- 创建、读取、更新、删除文档
- 自动生成 slug 或自定义 slug
- 支持文档摘要
- Markdown 内容存储在 R2

#### 2. 时间线首页
- 按发布时间倒序展示文档
- 分页支持
- 按文件夹筛选
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
- 文档列表与管理
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
- **排版适配**: prose 内容使用 `dark:prose-invert` 自动反转
- **全量覆盖**: 代码块、行内代码、表格、引用块、分割线、Mermaid 图表、选中文字等均有 dark 变体

#### 9. 前端设计系统 (Design System)
- **字体系统**: Newsreader (衬线/标题) + Inter (无衬线/正文) + JetBrains Mono (等宽/代码)
- **主色调**: #0D6E6E (青色) 用于按钮、链接、高亮
- **次要色**: #E07B54 (橙色) 用于草稿状态标识
- **极简风格**: 1px 边框代替阴影，统一浅色主题
- **标题即导航**: 站点标题为可点击链接，指向首页 (`/`)，适用于时间线页和文档详情页
- **胶囊时间线**: 首页文档列表采用 pill 样式，悬停边框变色
- **统一后台**: Admin 侧边栏改为浅色风格，与前台视觉一致
- **设计源文件**: `chronomd.pen` (Pencil MCP 格式)

#### 10. 移动端响应式设计 (Mobile-First)
- **断点策略**: Tailwind `md:` 断点 (768px)，移动端优先设计
- **时间线页面**: 全宽文档胶囊 (`w-full md:w-fit`)，响应式年份标签，触摸优化按钮 (`h-11 md:h-9`)
- **文档详情**: 响应式排版 (`text-2xl md:text-4xl`)，移动端间距调整
- **Admin 导航**: 移动端顶部导航栏 + 汉堡菜单 + 底部标签栏 (Dashboard/Documents/Folders/Settings)
- **Admin 仪表盘**: 垂直堆叠统计卡片 (`grid-cols-1 md:grid-cols-3`)

#### 11. Quick Notes 快速碎片化记录
- **轻量级记录**: 允许已登录用户在首页快速记录想法，无需创建完整文档
- **独立数据表**: `quick_notes` 表独立于 `documents` 表，字段简洁 (id, content, created_at, updated_at, is_archived)
- **内容限制**: 最大 500 字，带字数统计显示
- **混合时间线**: `/api/mixed-timeline` 端点将文档和笔记按时间合并展示
- **UI 组件**:
  - `QuickNoteInput.svelte`: 底部固定悬浮输入栏 (`fixed bottom-0`) + 弹窗输入面板
  - `QuickNoteCard.svelte`: 笔记卡片展示，带 "Quick Note" 标签区分
- **权限控制**: 仅登录用户可见输入入口，未登录用户仅可浏览
- **暗色模式**: 完整支持 dark mode 变体
- **Admin 管理页面** (`/admin/quick-notes`):
  - 状态筛选: All / Active / Archived 三种视图切换
  - 归档/恢复: 一键归档或恢复笔记
  - 删除笔记: 带确认对话框的删除功能
  - 响应式设计: 桌面端和移动端适配
  - 侧边栏导航: 位于 Documents 和 Folders 之间
  - 移动端底部标签栏: 新增 Quick Notes 入口

#### 12. PWA 渐进式 Web 应用 (Progressive Web App)
- **离线支持**: 通过 Service Worker (Workbox) 实现静态资源预缓存和运行时缓存
- **可安装**: 提供 Web App Manifest，支持添加到主屏幕，standalone 模式运行
- **自动更新**: `registerType: 'autoUpdate'`，Service Worker 自动检测更新并激活
- **缓存策略**:
  - 静态资源预缓存: `**/*.{js,css,html,svg,png,woff,woff2}`
  - Google Fonts: CacheFirst (365天过期)
  - API 请求: NetworkFirst (24小时过期，10秒超时回退)
- **iOS 适配**: apple-touch-icon、apple-mobile-web-app-capable meta 标签
- **主题色**: `#0D6E6E` 与设计系统主色调一致

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
