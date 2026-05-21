# 部署指南：Vercel（前端）+ Docker（API）

推荐架构：**前端 Vercel** · **后端 Express Docker** · **数据库 MongoDB Atlas**

---

## 架构图

```
用户浏览器
    ↓
Vercel (zkPass Portal UI)  — VITE_API_BASE_URL →
    ↓
Docker 容器 :5000 (Express API)
    ↓
MongoDB Atlas
```

---

## 一、Docker 部署 API（先做）

### 1. 准备环境文件

在**仓库根目录**：

```powershell
copy .env.production.example .env.production
```

编辑 `.env.production`：

```env
MONGODB_URI=mongodb+srv://你的Atlas连接串
CLIENT_ORIGIN=https://你的项目.vercel.app
PORT=5000
```

> `CLIENT_ORIGIN` 必须填 Vercel 前端域名（可多个用逗号分隔），否则浏览器 CORS 会拦截。

### 2. 构建并启动 API 容器

```powershell
# 已在仓库根目录，不要再 cd backend\backend
docker compose -f docker-compose.api.yaml --env-file .env.production up -d --build
```

### 3. 首次灌库（Atlas）

```powershell
docker compose -f docker-compose.api.yaml --env-file .env.production --profile seed run --rm seed
```

### 4. 验证 API

```powershell
$env:API_URL="http://localhost:5000"
npm run check:api
```

或浏览器：`http://你的服务器IP:5000/health`

### 5. 云服务器注意

- 安全组/防火墙放行 **5000**
- 生产建议前面加 **Nginx/Caddy** 配 HTTPS，例如 `https://api.your-domain.com`

---

## 二、Vercel 部署前端

### 1. 推送代码到 GitHub

Vercel 连接该仓库，**Root Directory** 留空（仓库根目录）。

### 2. Vercel 项目设置

| 项 | 值 |
|----|-----|
| Framework Preset | Other |
| Build Command | `npm run build:vercel` |
| Output Directory | `.vercel/output`（由 Nitro 生成，vercel.json 已配置） |
| Install Command | `npm install` |

### 3. 环境变量（必配）

在 Vercel → Settings → Environment Variables：

| Name | Example | 说明 |
|------|---------|------|
| `VITE_API_BASE_URL` | `https://api.your-domain.com/api/v1` | **构建时**注入，指向 Docker API 公网地址 |

参考：`vercel.env.example`

### 4. 部署

点击 Deploy。成功后访问 `https://xxx.vercel.app`。

### 5. 部署后联调

1. 打开 Vercel 站点 → Projects 页应加载数据  
2. 若红条 “Cannot reach API” → 检查 `VITE_API_BASE_URL` 与 API 是否公网可达  
3. 检查 `CLIENT_ORIGIN` 是否包含 Vercel 域名  

---

## 三、本地命令速查（PowerShell）

你已在 `backend` 目录时，**不要**再执行 `cd backend`：

```powershell
# 当前在 backend 目录
npm run seed
npm run dev

# 新开终端 — 仓库根目录
npm run check:api
npm run dev
```

---

## 四、Docker 全栈（可选，不用 Vercel）

前端也用 Docker nginx：

```powershell
docker compose -f docker-compose.atlas.yaml --env-file .env.production up -d --build
```

- Web: 端口 80  
- API: 端口 5000  

---

## 五、文件清单

| 文件 | 用途 |
|------|------|
| `vercel.json` | Vercel 构建配置 |
| `vite.config.vercel.mts` | Vercel 专用 Nitro 构建 |
| `vercel.env.example` | Vercel 环境变量模板 |
| `docker-compose.api.yaml` | 仅 API 容器（配 Vercel） |
| `docker-compose.atlas.yaml` | API + Web 全 Docker |
| `Dockerfile` | 前端静态 nginx 镜像 |
| `backend/Dockerfile` | API 镜像 |
| `.env.production.example` | 生产环境变量模板 |

---

## 六、常见问题

| 现象 | 处理 |
|------|------|
| `cd backend` 报路径不存在 | 你已在 backend 内，直接 `npm run dev` |
| Vercel 白屏 | 检查 Build 是否 `build:vercel` 成功；查看 Vercel 构建日志 |
| CORS 错误 | 更新 API 的 `CLIENT_ORIGIN` 为 Vercel 域名并重启容器 |
| API 连不上 | Atlas IP 白名单加入 Docker 主机公网 IP |
| 发票/项目为空 | 在 Docker 内执行 seed profile |

---

## 七、推荐上线顺序

1. Atlas 连接串写入 `.env.production`  
2. `docker compose -f docker-compose.api.yaml ... up -d --build`  
3. `seed` 灌库  
4. `check:api` 通过  
5. Vercel 配置 `VITE_API_BASE_URL` 并 Deploy  
6. 更新 API `CLIENT_ORIGIN` 为 Vercel 域名  

完成。
