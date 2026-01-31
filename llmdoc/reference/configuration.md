# 配置参考

## API 配置 (wrangler.toml)

```toml
name = "chronomd-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[vars]
# Admin 密码的 SHA-256 哈希值
# 生成方法: node -e "console.log(require('crypto').createHash('sha256').update('password').digest('hex'))"
ADMIN_PASSWORD_HASH = "your-password-hash"

# JWT 签名密钥 (建议使用随机字符串)
JWT_SECRET = "your-jwt-secret"

[[d1_databases]]
binding = "DB"
database_name = "chronomd-db"
database_id = "your-database-id"  # 从 wrangler d1 create 获取

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "chronomd-storage"
```

## 环境变量说明

| 变量名               | 描述                        | 示例                                       |
|---------------------|-----------------------------|--------------------------------------------|
| ADMIN_PASSWORD_HASH | Admin 密码的 SHA-256 哈希    | 240be518fabd2724ddb6f04eeb1da5967448d7e... |
| JWT_SECRET          | JWT 签名密钥                 | chronomd-secret-key-xxx                    |

## 前端配置 (.env)

```bash
# API 地址
VITE_API_URL=http://localhost:8787

# 生产环境
# VITE_API_URL=https://api.yourdomain.com
```

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

# 本地迁移
npx wrangler d1 execute chronomd-db --local --file=./schema.sql

# 生产迁移
npx wrangler d1 execute chronomd-db --file=./schema.sql

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

```bash
# 部署 API
cd apps/api && pnpm deploy

# 部署前端
cd apps/web && pnpm deploy

# 全部部署
pnpm deploy  # 在根目录
```

## 目录结构

```
chronomd/
├── apps/
│   ├── api/
│   │   ├── wrangler.toml      # Worker 配置
│   │   └── schema.sql         # 数据库 Schema
│   └── web/
│       ├── .env               # 本地环境变量
│       ├── .env.production    # 生产环境变量
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
