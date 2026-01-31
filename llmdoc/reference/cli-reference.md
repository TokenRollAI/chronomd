# @chronomd/cli 命令行工具参考

## 概述

@chronomd/cli 是 ChronoMD 平台的命令行发布工具，允许用户从本地 Markdown 文件直接发布内容到 ChronoMD 平台。

## 安装

```bash
pnpm add -g @chronomd/cli
```

或在 monorepo 中构建：

```bash
cd packages/cli && pnpm build
```

## 技术栈

| 依赖 | 用途 |
|------|------|
| Commander.js | 命令框架 |
| chalk | 终端输出美化 |
| conf | 配置持久化（API URL、auth token） |
| gray-matter | Markdown frontmatter 解析 |
| ora | 进度指示器 |
| tsup | TypeScript → ESM 构建 |

## 命令详解

### `chronomd init`

初始化 CLI 配置，设置 ChronoMD 平台的 API URL。

```bash
chronomd init
# 交互式输入 API URL，例如 https://chronomd.pdjjq.org
```

配置存储在本地 `conf` 中，后续命令自动读取。

### `chronomd login`

登录 ChronoMD 平台，获取认证 token。

```bash
chronomd login
# 交互式输入管理员密码
```

**认证流程**：
1. 调用 `POST /api/admin/login` 发送密码
2. 从响应的 `Set-Cookie` header 中提取 `auth_token` (JWT)
3. 将 token 存储到本地 `conf` 配置中
4. 后续所有 API 请求通过 `Cookie` header 携带此 token

### `chronomd publish <path>`

发布本地 Markdown 文件或整个目录到平台。

```bash
# 发布单个文件
chronomd publish ./my-post.md

# 发布整个目录（子目录名自动映射为远程 folder）
chronomd publish ./posts/

# 预览模式（不实际发布）
chronomd publish ./posts/ --dry-run
```

**选项**：
- `--dry-run` - 仅解析和验证，不实际发布

**Frontmatter 支持**：
发布时会解析 Markdown 文件的 YAML frontmatter 提取元数据（标题、slug、摘要等）。

**Folder 自动创建**（目录发布模式）：

当发布一个目录时，CLI 会自动将子目录名映射为远程 folder：

```
posts/
├── tech/               # → 自动创建/关联名为 "tech" 的远程 folder
│   ├── article-1.md
│   └── article-2.md
├── life/               # → 自动创建/关联名为 "life" 的远程 folder
│   └── diary.md
└── standalone.md       # → 不关联 folder
```

**Folder 解析规则**：
1. **Frontmatter 优先**: 若 Markdown frontmatter 中指定了 `folder` 字段，则优先使用该值
2. **目录名推断**: 否则取文件直接父目录名（相对于发布根目录的第一层子目录）
3. **自动创建**: `resolveFolder()` 函数先查找已存在的同名 folder，不存在则调用 `createFolder()` API 自动创建
4. **缓存机制**: 使用 Map 缓存已解析的 folder ID，避免对同一 folder 名称重复查询/创建

### `chronomd list`

列出远程平台上的所有文档。

```bash
chronomd list
```

### `chronomd delete <slug>`

根据 slug 删除远程文档。

```bash
chronomd delete my-post-slug
```

### `chronomd logout`

登出并清除本地存储的认证 token。

```bash
chronomd logout
```

## 文件结构

```
packages/cli/
├── src/
│   ├── index.ts           # CLI 入口，注册所有命令
│   ├── types.ts           # TypeScript 类型定义
│   ├── commands/
│   │   ├── init.ts        # init 命令实现
│   │   ├── login.ts       # login 命令实现
│   │   ├── publish.ts     # publish 命令实现（核心发布逻辑）
│   │   ├── list.ts        # list 命令实现
│   │   └── delete.ts      # delete 命令实现
│   └── lib/
│       ├── api.ts         # API 客户端（封装 HTTP 请求，含 createFolder）
│       ├── config.ts      # 配置管理（读写 conf）
│       └── frontmatter.ts # frontmatter 解析（基于 gray-matter）
├── package.json
├── tsconfig.json
└── tsup.config.ts         # 构建配置
```

## 认证方案

CLI 使用与 Admin 管理面板相同的 JWT 认证体系：

1. **登录**: `POST /api/admin/login` 发送密码
2. **获取 Token**: 从响应的 `Set-Cookie` header 提取 `auth_token` JWT
3. **本地存储**: 使用 `conf` 库将 token 持久化到用户目录
4. **请求认证**: 后续 API 请求通过 `Cookie: auth_token=<jwt>` header 发送

## 构建

```bash
cd packages/cli
pnpm build    # tsup 构建 TypeScript → ESM
```
