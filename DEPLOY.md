# zkPass Portal — 部署手册（配环境 → 连云库 → 路由 → 前端 Axios）

按四步走完即可上线。你已完成 **MongoDB Atlas** + `backend/.env`，下面是对齐清单。

---

## 第一步：配环境

### 后端 `backend/.env`

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/zkpassportal?retryWrites=true&w=majority
CLIENT_ORIGIN=http://localhost:8080
VERIFICATION_CREDIT_COST=18.5
TOPUP_PLATFORM_FEE_RATE=0.02
INVOICE_TAX_RATE=0.15
```

### 前端 `.env.local`（仓库根目录）

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 安装依赖

```powershell
cd backend
npm install
cd ..
npm install
```

生产环境变量模板：复制 `.env.production.example` → `.env.production`

---

## 第二步：连云数据库（Atlas）

1. Atlas → **Network Access** → 添加当前 IP（或部署机 IP）
2. **Database Access** → 读写用户
3. 连接串带库名：`.../zkpassportal?retryWrites=true&w=majority`
4. 首次灌库：

```powershell
cd backend
npm run seed
```

成功日志：`🚀 MongoDB Atlas Cloud Connected Successfully`

---

## 第三步：写路由并跑 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/v1/projects` | 项目列表 |
| GET | `/api/v1/dashboard/:projectId` | 仪表盘 + 图表 + 证明表 |
| GET | `/api/v1/billing/invoices` | 发票列表 |
| POST | `/api/v1/billing/pay-invoice` | Unpaid → **Paid** |
| POST | `/api/v1/billing/topup` | 项目充值 |
| POST | `/api/v1/proofs/verify` | zkTLS 验证 |

### 启动

```powershell
cd backend
npm run dev
```

验证：

```powershell
# 另开终端
node scripts/check-api.mjs
```

浏览器：`http://localhost:5000/health`

---

## 第四步：改前端 Axios（已完成）

| 文件 | 作用 |
|------|------|
| `src/api/client.ts` | Axios 单例 + JWT 拦截器 + 错误提示 |
| `src/api/endpoints.ts` | 所有 API 方法 |
| `src/lib/store.tsx` | `useEffect` 拉取 projects / invoices |
| `src/api/useProjectDashboard.ts` | Dashboard 实时数据 |

### 启动前端

```powershell
npm run dev
# 或前后端一起
npm run dev:all
```

打开 **http://localhost:8080**

---

## 生产部署方案

### A. 分离部署（推荐）

| 组件 | 平台 | 配置 |
|------|------|------|
| API | Render / Railway / Fly.io / VPS | Root: `backend`，Start: `npm start`，Port: `5000`，注入 `backend/.env` 变量 |
| 前端 | Vercel / Netlify / Cloudflare Pages | Build: `npm run build`，Env: `VITE_API_BASE_URL=https://api.xxx.com/api/v1` |
| 数据库 | MongoDB Atlas | 已有 |

**Render 示例（API）**

- Build Command: `npm install`
- Start Command: `npm start`
- 环境变量：`MONGODB_URI`, `PORT=5000`, `CLIENT_ORIGIN=https://你的前端域名`

**Vercel 示例（前端）**

- Framework: Vite
- Build: `npm run build`
- Output: `dist/client`（按你 Vite 输出调整）
- Env: `VITE_API_BASE_URL`

### B. Docker + Atlas（单机）

```powershell
copy .env.production.example .env.production
# 编辑 MONGODB_URI、VITE_API_BASE_URL、CLIENT_ORIGIN

docker compose -f docker-compose.atlas.yaml --env-file .env.production up -d --build
docker compose -f docker-compose.atlas.yaml --env-file .env.production --profile seed run --rm seed
```

- Web: 端口 80  
- API: 端口 5000  

### C. Docker 自带 Mongo（无 Atlas）

```powershell
docker compose -f docker-compose.production.yaml up -d --build
```

---

## 部署前检查清单

- [ ] `backend/.env` 中 `MONGODB_URI` 正确，Atlas IP 白名单已加
- [ ] `npm run seed` 在 Atlas 跑通
- [ ] `npm run dev`（backend）→ `http://localhost:5000/health` 返回 ok
- [ ] `.env.local` 中 `VITE_API_BASE_URL` 指向 API（本地 5000 / 生产域名）
- [ ] 生产 `CLIENT_ORIGIN` = 前端真实 URL（CORS）
- [ ] 前端 build 时注入 `VITE_API_BASE_URL`（构建后不能改）
- [ ] `node scripts/check-api.mjs` 全部 ✓

---

## 常用命令

```powershell
npm run dev:all          # 本地全栈
cd backend && npm run seed # 重置演示数据
cd backend && npm start    # 生产模式 API
npm run build              # 前端生产构建
node scripts/check-api.mjs # API 冒烟测试
```

---

## 目录结构（后端）

```
backend/
├── src/
│   ├── server.js       # Express 入口
│   ├── db.js           # Atlas 连接
│   ├── models/         # User, Project, ZKProof, Invoice
│   ├── routes/         # /api/v1/*
│   ├── controllers/
│   └── scripts/seed.js
├── .env                # 你的 Atlas（勿提交 git）
└── package.json
```

有问题先看终端：`🚀 MongoDB Atlas Cloud Connected Successfully` 和 `[api] listening on http://localhost:5000`。
