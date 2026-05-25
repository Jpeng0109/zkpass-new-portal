# 部署修复清单（Render API + Vercel 前端）

## 数据库

本项目使用 **MongoDB Atlas**（`mongoose`），连接串环境变量：`MONGODB_URI`。

本地已有配置：`backend/.env`（与根目录 `.env` 同步）。

---

## 1. Render 后端（必做）

打开 https://dashboard.render.com → 服务 **zkpass-new-portal-api** → **Environment**

| 变量 | 值 |
|------|-----|
| `MONGODB_URI` | Atlas 连接串（与本地 `backend/.env` 相同） |
| `DNS_SERVERS` | `8.8.8.8,1.1.1.1` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `CLIENT_ORIGIN` | `https://zkpass-new-portal.vercel.app,https://zkpass-new-portal-joshuas-projects-5140a10d.vercel.app,https://zkpass-new-portal-git-main-joshuas-projects-5140a10d.vercel.app,http://localhost:8080` |
| `CORS_ALLOW_VERCEL` | `true`（允许所有 `*.vercel.app` 预览域名） |

**Settings 必查：**

- Root Directory = `backend`
- Start Command = `npm start`
- Health Check Path = `/health`

保存后：**Manual Deploy → Clear build cache & deploy**

验证（应返回 JSON，不是 HTML）：

```
https://zkpass-new-portal-api.onrender.com/health
https://zkpass-new-portal-api.onrender.com/api/v1/projects
```

`health` 中 `db` 应为 `connected`。若为 `error`，检查 Atlas **Network Access** 是否允许 `0.0.0.0/0`。

---

## 2. Atlas 首次灌库

本地（`MONGODB_URI` 指向 Atlas）：

```powershell
cd backend
npm run seed
```

---

## 3. Vercel 前端

https://vercel.com → 项目 **project-c9l5k** → Settings → Environment Variables

| 变量 | 值 | 环境 |
|------|-----|------|
| `VITE_API_BASE_URL` | `https://zkpass-new-portal-api.onrender.com/api/v1` | Production, Preview, Development |
| `NITRO_PRESET` | `vercel` | Production, Preview |

**不要**在 Vercel 设置 `NODE_ENV`。

保存后 **Redeploy**。

---

## 4. Vercel 预览域名登录墙

`zkpass-new-portal-git-main-...vercel.app` 若跳转到 Vercel Login，是 **Deployment Protection**：

Settings → Deployment Protection → 关闭 Preview 的 Vercel Authentication，或使用生产域名：

`https://zkpass-new-portal.vercel.app/dashboard`

---

## 5. 推送代码到 GitHub 触发自动部署

将本仓库 `backend/src/server.js` 等修复 push 到 `Jpeng0109/zkpass-new-portal` 的 `main` 分支后，Render 与 Vercel 会自动重新部署。
