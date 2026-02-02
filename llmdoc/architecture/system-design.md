# 系统架构设计

## 架构概览

ChronoMD 采用**前后端一体化**架构，所有代码都在一个 SvelteKit 应用中。

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloudflare Pages                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │               SvelteKit 应用                         │   │
│  │  ┌──────────────────┐  ┌──────────────────────┐    │   │
│  │  │   前端页面        │  │   API 路由            │    │   │
│  │  │   (SSR/CSR)      │  │   (+server.ts)       │    │   │
│  │  └──────────────────┘  └──────────┬───────────┘    │   │
│  └───────────────────────────────────┼────────────────┘   │
└──────────────────────────────────────┼────────────────────┘
                                       │
                        ┌──────────────┼──────────────┐
                        ▼              ▼              ▼
                ┌───────────┐  ┌───────────┐  ┌───────────┐
                │    D1     │  │    R2     │  │   Vars    │
                │  (SQLite) │  │ (Storage) │  │  (Env)    │
                │  元数据    │  │  MD内容   │  │  配置     │
                └───────────┘  └───────────┘  └───────────┘
```

## 技术栈

- **运行时**: Cloudflare Pages Functions (Workers 运行时)
- **框架**: SvelteKit + adapter-cloudflare
- **样式**: Tailwind CSS + @tailwindcss/typography (暗色模式: `class` 策略)
- **设计系统**: 极简现代风格，详见 [设计系统](./design-system.md)
- **数据库**: Cloudflare D1 (SQLite)
- **存储**: Cloudflare R2
- **认证**: JWT (jose 库)

## 组件职责

### SvelteKit 应用
- **页面路由**: 时间线首页、文档详情、管理后台 (Dashboard/Documents/Quick Notes/Folders/Settings)
- **API 路由**: 所有 `/api/*` 端点通过 `+server.ts` 实现
- **SSR 渲染**: 服务端数据加载和渲染
- **静态资源**: CSS、JS、图片托管

### 服务端模块 (`$lib/server/`)
- `auth.ts`: JWT 令牌生成和验证
- `db.ts`: D1 数据库 CRUD 操作
- `utils.ts`: ID 生成、密码哈希、slug 处理
- `types.ts`: TypeScript 类型定义（含 `QuickNote`, `MixedTimelineItem`）

### D1 数据库
- 文档元数据存储 (`documents` 表)
- 文件夹结构存储 (`folders` 表)
- 站点设置存储 (`settings` 表)
- 快速笔记存储 (`quick_notes` 表)

### R2 存储
- Markdown 内容存储 (`documents/{slug}.md`)

## 数据流

### 读取文档流程
```
1. 用户访问 /my-article
2. +page.server.ts load 函数执行
3. 从 D1 获取文档元数据
4. 从 R2 获取 MD 内容
5. 在服务端通过 unified pipeline 将 Markdown 预渲染为 HTML
   (remark-parse → remark-gfm/math → remark-rehype → rehype-pretty-code/katex/slug/autolink → rehype-stringify)
6. SSR 渲染返回完整 HTML（Mermaid 图表在客户端动态渲染）
```

### 创建文档流程
```
1. Admin 提交表单到 /api/admin/documents
2. +server.ts POST 处理器执行
3. 验证 JWT Cookie
4. 生成 ID 和 slug
5. 元数据写入 D1
6. 内容写入 R2
7. 返回创建结果
```

### Quick Notes 数据流
```
1. 首页加载流程:
   - +page.server.ts 验证 JWT token 判断登录状态
   - 已登录: 调用 getMixedTimeline 获取混合时间线
   - 未登录: 调用 getTimeline 仅获取文档列表
   - 渲染时根据 isLoggedIn 显示/隐藏 QuickNoteInput

2. 创建笔记流程:
   - 用户点击底部悬浮输入栏展开弹窗
   - 输入内容 (500字限制，实时字数统计)
   - POST /api/admin/quick-notes
   - 验证 JWT -> 写入 D1 quick_notes 表
   - 刷新时间线

3. 混合时间线渲染:
   - MixedTimelineItem.type === 'document' -> 文档卡片
   - MixedTimelineItem.type === 'note' -> QuickNoteCard (带标签)

4. Admin 管理页面 (/admin/quick-notes):
   - +page.server.ts 验证 JWT -> getQuickNotes 获取列表
   - URL 参数 ?filter=all|active|archived 控制筛选
   - 归档/恢复: PUT /api/admin/quick-notes/:id { is_archived }
   - 删除: DELETE /api/admin/quick-notes/:id
   - 操作后 invalidateAll() 刷新数据
```

## 安全设计

### 认证机制
- Admin 使用 JWT Token
- Token 存储在 HttpOnly Cookie
- 7 天过期自动失效

### 私密文档
- Access Code 使用 SHA-256 哈希存储
- 前端会话级解锁
- 解锁状态存储在 Cookie 中

### 环境变量
- `ADMIN_PASSWORD_HASH`: 管理员密码哈希
- `JWT_SECRET`: JWT 签名密钥

## 暗色模式架构

ChronoMD 采用 Tailwind CSS `class` 策略实现暗色模式，核心组件如下：

### 核心组件

- `apps/web/tailwind.config.js` (`darkMode`): 配置 `darkMode: 'class'`，启用基于 class 的暗色切换。
- `apps/web/src/app.html` (内联脚本): 页面渲染前检测 localStorage / 系统偏好，立即添加 `dark` class 避免闪烁。
- `apps/web/src/lib/stores/theme.ts` (`createThemeStore`, `theme`): Svelte writable store，管理主题状态、localStorage 持久化和 `toggle()` 切换方法。
- `apps/web/src/lib/components/ThemeToggle.svelte`: 太阳/月亮图标切换按钮，调用 `theme.toggle()`。
- `apps/web/src/app.css`: 所有自定义样式的 `.dark` 前缀变体（代码块、表格、引用块、Mermaid 等）。

### 执行流

- **1. 初始加载:** `app.html` 内联脚本读取 `localStorage.theme`，若为 `dark` 或系统偏好为 dark，则在 `<html>` 上添加 `dark` class。
- **2. 客户端激活:** `+layout.svelte` 引入 `theme` store，store 初始化时同步读取 localStorage 并调用 `apply()` 确保状态一致。
- **3. 用户切换:** 用户点击 `ThemeToggle` 按钮 -> `theme.toggle()` -> `update()` 切换值 -> `apply()` 更新 DOM class 和 localStorage。
- **4. 样式响应:** Tailwind `dark:` 变体和 `app.css` 中的 `.dark` 选择器自动生效。

## PWA 架构

ChronoMD 通过 `@vite-pwa/sveltekit` 插件集成 PWA 支持，实现离线访问和可安装能力。

### 核心组件

- `apps/web/vite.config.ts` (`SvelteKitPWA`): PWA 插件配置入口，定义 manifest、注册策略和 Workbox 缓存规则。
- `apps/web/src/app.html` (PWA meta 标签): `theme-color`、`apple-touch-icon`、`apple-mobile-web-app-capable` 等标签。
- `apps/web/static/icon-192x192.png`, `icon-512x512.png`, `apple-touch-icon.png`: PWA 图标资源。

### 执行流

- **1. 构建阶段:** Vite 构建时，`SvelteKitPWA` 插件生成 Service Worker (`sw.js`) 和 Web App Manifest (`manifest.webmanifest`)。
- **2. 首次加载:** 浏览器加载页面后自动注册 Service Worker，预缓存所有静态资源。
- **3. 离线访问:** Service Worker 拦截请求，静态资源从 precache 返回；Google Fonts 使用 CacheFirst；API 请求使用 NetworkFirst (10秒超时后回退缓存)。
- **4. 自动更新:** `autoUpdate` 策略下，新版本 Service Worker 安装后自动激活，用户无需手动操作。

## 部署架构

单一 Cloudflare Pages 项目：
- 自动处理静态资源 CDN
- Functions 处理 API 请求和 SSR
- D1 和 R2 通过 bindings 连接
- 自定义域名支持
