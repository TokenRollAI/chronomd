# 快速开始指南

## 前提条件

- Node.js 18+
- pnpm 8+
- Cloudflare 账户 (部署时需要)

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置应用

编辑 `apps/web/wrangler.toml`：

```toml
[vars]
# 使用 SHA-256 哈希生成密码
# echo -n "your-password" | sha256sum
ADMIN_PASSWORD_HASH = "your-hashed-password"
JWT_SECRET = "your-jwt-secret"
```

默认密码 `admin123` 的哈希值：
```
240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

### 3. 初始化本地数据库

```bash
cd apps/web
npx wrangler d1 execute chronomd-db --local --file=schema.sql
```

### 4. 启动开发服务器

```bash
cd apps/web
pnpm dev
```

### 5. 访问应用

- **首页**: http://localhost:5173
- **管理后台**: http://localhost:5173/admin/login
- **默认密码**: admin123

## 测试 API

```bash
# 获取时间线
curl http://localhost:5173/api/timeline

# 登录测试
curl -X POST http://localhost:5173/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}'
```

## 常见问题

### D1 数据库错误

确保已初始化本地数据库：
```bash
cd apps/web
npx wrangler d1 execute chronomd-db --local --file=schema.sql
```

### 登录失败

确认 `wrangler.toml` 中的 `ADMIN_PASSWORD_HASH` 与登录密码匹配。

### 页面显示空白或 500 错误

检查终端日志，可能是 D1/R2 绑定问题。确保 wrangler.toml 配置正确。

## 下一步

- [部署指南](./deployment.md) - 将应用部署到 Cloudflare
- [API 参考](../reference/api-reference.md) - 完整 API 文档
