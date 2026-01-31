# 部署指南

## Cloudflare 资源准备

### 1. 创建 D1 数据库

```bash
npx wrangler d1 create chronomd-db
```

记录返回的 `database_id`，更新到 `apps/web/wrangler.toml`。

### 2. 初始化数据库表

```bash
cd apps/web
npx wrangler d1 execute chronomd-db --remote --file=schema.sql
```

### 3. 创建 R2 存储桶

```bash
npx wrangler r2 bucket create chronomd-storage
```

### 4. 配置环境变量

编辑 `apps/web/wrangler.toml`：

```toml
name = "chronomd"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".svelte-kit/cloudflare"

[vars]
ADMIN_PASSWORD_HASH = "your-sha256-password-hash"
JWT_SECRET = "your-production-secret-key"

[[d1_databases]]
binding = "DB"
database_name = "chronomd-db"
database_id = "your-actual-database-id"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "chronomd-storage"
```

生成密码哈希（admin123 的 SHA-256）：
```bash
echo -n "admin123" | sha256sum
# 输出: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

## 部署应用

### 1. 构建应用

```bash
cd apps/web
pnpm build
```

### 2. 部署到 Pages

```bash
npx wrangler pages deploy .svelte-kit/cloudflare --project-name=chronomd-web --commit-dirty=true
```

首次部署会创建项目，后续部署会更新。

## 自定义域名

### 通过 Cloudflare Dashboard

1. 进入 Pages 项目设置
2. 点击 "Custom domains"
3. 添加自定义域名，如 `chronomd.yourdomain.com`
4. 按照提示配置 DNS（CNAME 记录指向 Pages 域名）

### 通过命令行

```bash
npx wrangler pages project list  # 查看项目
# 域名配置需要通过 Dashboard 完成
```

## 验证部署

```bash
# 检查首页
curl https://chronomd.yourdomain.com/

# 检查 API
curl https://chronomd.yourdomain.com/api/timeline

# 测试登录
curl -X POST https://chronomd.yourdomain.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

## 当前生产环境

- **域名**: https://chronomd.pdjjq.org
- **管理后台**: https://chronomd.pdjjq.org/admin/login
- **D1 数据库 ID**: `0091b43a-a505-4fb1-9b0a-4c8b947ac269`
- **R2 存储桶**: `chronomd-storage`

## 更新部署

代码修改后重新部署：

```bash
cd apps/web
pnpm build && npx wrangler pages deploy .svelte-kit/cloudflare --project-name=chronomd-web --commit-dirty=true
```
