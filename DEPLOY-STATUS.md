# 部署状态（自动生成）

## 已完成

- [x] Docker Desktop 已安装（v29.4.3，Compose v5.1.3）
- [x] `.env.production` — Docker 全栈配置
- [x] `.env.local` — 前端指向 `http://localhost:5000/api/v1`
- [x] `scripts/deploy-docker.ps1` — Docker 一键脚本
- [x] `scripts/deploy-local.ps1` — 无 Docker 时 Node 直跑 API

## 阻塞项

### 1. MongoDB 连接

`backend/.env` 当前为本地地址 `127.0.0.1:27017`，本机未运行 Mongo，seed 失败。

**请编辑** `backend/.env`，将 `MONGODB_URI` 改为你 Atlas 连接串，例如：

```env
MONGODB_URI=mongodb+srv://用户名:密码@集群.mongodb.net/zkpassportal?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:8080,http://localhost
```

### 2. Docker Hub 网络

拉取 `mongo:7` / `node:22-alpine` 时报错 `EOF`（无法访问 registry-1.docker.io）。

**处理方式（任选）：**

- Docker Desktop → Settings → Docker Engine，添加镜像加速，例如：

```json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.m.daocloud.io"
  ]
}
```

- 或配置系统/ VPN 代理后重试：`docker pull node:22-alpine`

## 填好 Atlas 后执行

```powershell
cd C:\Users\工作站1\Desktop\coding\zkpassportal-main\backend
npm run seed
npm run dev
```

新终端（仓库根目录）：

```powershell
npm run check:api
npm run dev
```

## Docker 网络恢复后执行

```powershell
cd C:\Users\工作站1\Desktop\coding\zkpassportal-main
npm run deploy:docker
```

访问：http://localhost （Web） · http://localhost:5000/health （API）
