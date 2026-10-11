# 配置参考

## 应用配置 (apps/web/wrangler.toml)

`apps/web/wrangler.toml` 含密码哈希、JWT 密钥和数据库 ID，已被 `.gitignore` 排除；仓库只提供模板 `apps/web/wrangler.toml.example`，复制后填写：

```toml
name = "chronomd"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".svelte-kit/cloudflare"

[vars]
# Admin 密码的 SHA-256 哈希值
ADMIN_PASSWORD_HASH = "your-sha256-password-hash"

# JWT 签名密钥 (建议使用随机字符串)
JWT_SECRET = "your-jwt-secret-key"

[[d1_databases]]
binding = "DB"
database_name = "chronomd-db"
database_id = "your-d1-database-id"  # 从 wrangler d1 create 获取

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "chronomd-storage"
```

绑定名 `DB` / `BUCKET` 与变量名必须与 `apps/web/src/lib/server/types.ts` (`Env`) 一致，服务端通过 `platform.env` 读取。

## 环境变量说明

| 变量名               | 描述                        | 示例                                       |
|---------------------|-----------------------------|--------------------------------------------|
| ADMIN_PASSWORD_HASH | Admin 密码的 SHA-256 哈希    | 240be518fabd2724ddb6f04eeb1da5967448d7e... |
| JWT_SECRET          | JWT 签名密钥                 | chronomd-secret-key-xxx                    |

## 前端配置 (.env)

不需要配置 API 地址：前端 (`apps/web/src/lib/api.ts`) 用同源相对路径 `/api/*` 调用 server routes。`apps/web/.env.example` 中的 `VITE_API_URL=http://localhost:8787` 是独立后端时代的遗留项，当前代码不读取它。CLI 的 API 地址由 CLI 自身配置决定，见 [CLI 参考](./cli-reference.md)。

## 密码哈希生成

### 使用 Node.js

```bash
node -e "const crypto = require('crypto'); console.log(crypto.createHash('sha256').update('your-password').digest('hex'));"
```

### 使用 Python

```bash
python -c "import hashlib; print(hashlib.sha256('your-password'.encode()).hexdigest())"
```

## D1 数据库命令

```bash
# 创建数据库
npx wrangler d1 create chronomd-db

# 本地迁移 (在 apps/web 下执行；基础表 schema 不在仓库中，见数据库设计「已知缺口」)
npx wrangler d1 execute chronomd-db --local --file=migrations/0002_quick_notes.sql

# 生产迁移
npx wrangler d1 execute chronomd-db --remote --file=migrations/0002_quick_notes.sql

# 查询数据
npx wrangler d1 execute chronomd-db --local --command="SELECT * FROM documents"
```

## R2 存储命令

```bash
# 创建存储桶
npx wrangler r2 bucket create chronomd-storage

# 列出对象
npx wrangler r2 object list chronomd-storage

# 删除对象
npx wrangler r2 object delete chronomd-storage documents/slug.md
```

## 部署命令

只有 `apps/web` 一个部署单元 (Cloudflare Pages)，推荐使用显式命令：

```bash
cd apps/web
pnpm build && npx wrangler pages deploy .svelte-kit/cloudflare --project-name=chronomd-web --commit-dirty=true
```

注意：
- `pnpm deploy` 是 pnpm 内置命令 (部署 workspace 包)，**不会**执行 `package.json` 里的 `deploy` 脚本；要走脚本必须用 `pnpm run deploy`。
- `apps/web` 的 `deploy` 脚本不带 `--project-name`，项目名取自 `wrangler.toml` 的 `name`；生产项目名是 `chronomd-web`，与模板中的 `chronomd` 不同，用脚本部署前需确认。

## 目录结构

```
chronomd/
├── apps/
│   └── web/
│       ├── wrangler.toml.example # Cloudflare 配置模板 (复制为 wrangler.toml，后者被 gitignore)
│       ├── migrations/        # D1 迁移 (仅 0002_quick_notes.sql)
│       ├── .env.example       # 仅含遗留的 VITE_API_URL，代码未使用
│       ├── vite.config.ts     # Vite + SvelteKitPWA 配置
│       ├── svelte.config.js   # SvelteKit 配置
│       └── tailwind.config.js # Tailwind 配置 (含 darkMode: 'class')
├── turbo.json                 # Turborepo 配置
└── pnpm-workspace.yaml        # pnpm workspace
```

## 暗色模式配置

暗色模式通过 Tailwind CSS `class` 策略实现，相关配置：

- **Tailwind**: `apps/web/tailwind.config.js` - `darkMode: 'class'`，插件 `@tailwindcss/typography`
- **防闪烁脚本**: `apps/web/src/app.html` - 内联 IIFE 脚本在 `<head>` 中读取 localStorage 并应用 `dark` class
- **主题 Store**: `apps/web/src/lib/stores/theme.ts` - localStorage key 为 `theme`，值为 `light` 或 `dark`
- **详细架构**: 参见 `/llmdoc/architecture/system-design.md` 暗色模式架构章节
