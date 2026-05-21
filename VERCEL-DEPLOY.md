# Vercel 前端部署（5 分钟）

## 前提

- 代码已推到 **GitHub**
- 后端 API 必须有 **公网 HTTPS 地址**（不能是 `localhost`）
  - 本机 API 仅适合本地开发
  - 可选：Render / Railway / 云服务器 Docker（见 `render.yaml`、`DEPLOY-VERCEL-DOCKER.md`）

---

## 方式 A：Vercel 网页（推荐）

### 1. 导入项目

1. 打开 https://vercel.com/new  
2. **Import** 你的 GitHub 仓库 `zkpassportal-main`  
3. **Root Directory**：留空（`.`）  
4. **Framework Preset**：Other  

### 2. 构建配置（一般自动读 `vercel.json`）

| 项 | 值 |
|----|-----|
| Build Command | `npm run build:vercel` |
| Install Command | `npm install` |
| Output Directory | 留空（Nitro 自动生成 `.vercel/output`） |

### 3. 环境变量（必配）

**Settings → Environment Variables**，添加：

| Name | Value | 环境 |
|------|-------|------|
| `VITE_API_BASE_URL` | `https://你的API域名/api/v1` | Production, Preview, Development |
| `NITRO_PRESET` | `vercel` | Production, Preview |

示例（API 在 Render）：

```env
VITE_API_BASE_URL=https://zkpassportal-api.onrender.com/api/v1
```

### 4. Deploy

点击 **Deploy**，等待约 2–5 分钟。

### 5. 部署后

1. 记下 Vercel 域名，例如 `https://zkpassportal-xxx.vercel.app`  
2. 在 **API 服务器** 的 `CLIENT_ORIGIN` 中加入该域名，例如：

```env
CLIENT_ORIGIN=https://zkpassportal-xxx.vercel.app,http://localhost:8080
```

3. 重启 API 容器或进程  

---

## 方式 B：Vercel CLI

```powershell
cd C:\Users\工作站1\Desktop\coding\zkpassportal-main
npm install -g vercel
vercel login
vercel link

# 设置 API 地址（替换成你的公网 API）
vercel env add VITE_API_BASE_URL production
# 输入: https://你的API域名/api/v1

npm run deploy:vercel
```

---

## 本地验证 Vercel 构建

```powershell
$env:NITRO_PRESET="vercel"
$env:VITE_API_BASE_URL="http://localhost:5000/api/v1"
npm run build:vercel
```

Windows 可能出现 symlink 警告，**不影响 Vercel 云端 Linux 构建**。

---

## 常见问题

| 问题 | 处理 |
|------|------|
| 页面打开但数据为空 / API 红条 | `VITE_API_BASE_URL` 未设或仍指向 localhost |
| CORS 错误 | API 的 `CLIENT_ORIGIN` 未包含 Vercel 域名 |
| Build 失败 NODE_ENV | 勿在 Vercel 环境变量里设 `NODE_ENV`；用 Vite 默认即可 |
| 只有本地 API | 先把 API 部署到 Render（`render.yaml`）再填 Vercel 环境变量 |

---

## 推荐顺序

1. 本地 API + Atlas 已通（你已完成）  
2. **Render 部署 API** → 得到 `https://xxx.onrender.com`  
3. **Vercel 部署前端** → `VITE_API_BASE_URL=https://xxx.onrender.com/api/v1`  
4. 更新 API `CLIENT_ORIGIN` 为 Vercel 域名  
