# Render 部署 API（修复 Vercel 连不上 API）

## 问题原因

`https://zkpass-new-portal.onrender.com` 当前返回的是 **前端 HTML**，不是 Express API。

在 Vercel 里应配置 **单独的后端 Render 服务**，且地址必须带 `/api/v1`：

```env
VITE_API_BASE_URL=https://你的后端服务.onrender.com/api/v1
```

❌ 错误：`https://zkpass-new-portal.onrender.com`（这是前端）  
❌ 错误：缺少 `/api/v1`  
✅ 正确：`https://zkpass-new-portal-api.onrender.com/api/v1`

---

## 在 Render 新建「仅后端」服务

1. https://dashboard.render.com → **New +** → **Web Service**
2. 连接仓库：`Jpeng0109/zkpass-new-portal`
3. 配置：

| 项 | 值 |
|----|-----|
| **Name** | `zkpass-new-portal-api`（任意，决定域名） |
| **Root Directory** | `backend` ← **必填** |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Health Check Path** | `/health` |

4. **Environment Variables**：

| Key | Value |
|-----|-----|
| `MONGODB_URI` | 你的 Atlas 连接串 |
| `DNS_SERVERS` | `8.8.8.8,1.1.1.1` |
| `PORT` | `5000` |
| `CLIENT_ORIGIN` | 见下方示例（须含 **https://**，无尾部 `/`） |
| `CORS_ALLOW_VERCEL` | 可选；默认允许所有 `https://*.vercel.app`（预览域名） |

**本项目 Vercel 域名示例（复制到 `CLIENT_ORIGIN`）：**

```env
CLIENT_ORIGIN=https://zkpass-new-portal.vercel.app,https://zkpass-new-portal-joshuas-projects-5140a10d.vercel.app,http://localhost:8080
```
| `NODE_ENV` | `production` |

5. **Create Web Service**，等待 Deploy 成功

6. 验证（**必须**是 JSON，不是 HTML）：

```
https://zkpass-new-portal-api.onrender.com/health
https://zkpass-new-portal-api.onrender.com/api/v1/projects
```

| 结果 | 含义 |
|------|------|
| `/health` → `{"ok":true,"service":"zkpassportal-api",...}` | ✅ 后端正确 |
| `/health` → 只有 `ok` 或 `/api/v1/projects` → HTML 页面 | ❌ **Root Directory 填错了**（部署成了前端） |
| 浏览器报 Cannot reach API / ERR_NETWORK | 检查 **CLIENT_ORIGIN** 是否包含完整 Vercel 域名；或冷启动等 60 秒 |

### 已建错服务时怎么改

Render → 你的 `zkpass-new-portal-api` 服务 → **Settings**：

- **Root Directory** → `backend`（不要留空、不要 `/`）
- **Build Command** → `npm install`
- **Start Command** → `npm start`
- **Health Check Path** → `/health`

保存后 **Manual Deploy → Clear build cache & deploy**。

---

## 更新 Vercel 环境变量

Vercel → Project → Settings → Environment Variables：

```env
VITE_API_BASE_URL=https://zkpass-new-portal-api.onrender.com/api/v1
```

保存后 **Redeploy** 前端。

---

## 首次部署后灌库

Render Shell 或本地对生产库执行一次：

```bash
# 本地（MONGODB_URI 指向 Atlas）
cd backend && npm run seed
```

---

## 免费版冷启动

Render 免费服务约 50 秒无访问会休眠，首次打开 Vercel 页面可能慢或报错，**等 30–60 秒刷新**即可。
