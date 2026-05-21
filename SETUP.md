# zkPass Portal — Local & Production Setup

## Prerequisites

- Node.js 20+ (LTS recommended)
- MongoDB 7+ (local install or Docker)

## Phase 1–2: Backend API

```powershell
cd backend
copy .env.example .env
npm install
npm run seed
npm run dev
```

API runs at **http://localhost:5000** · Health check: `GET /health`

## Phase 3: Frontend

```powershell
# From repo root
copy .env.example .env.local
npm install
npm run dev
```

Frontend runs at **http://localhost:8080** (Lovable/Vite config).

Set `VITE_API_BASE_URL=http://localhost:5000/api/v1` in `.env.local`.

## Run both together

```powershell
npm run dev:all
```

Uses `concurrently` to start Vite + Express API.

## First-time seed

The seed script creates:

- Organization account with **42,100.50** credits
- 5 demo projects (one per zkTLS template)
- Proof batches and invoices

Re-run anytime: `cd backend && npm run seed`

## Production (Docker)

```powershell
copy .env.example .env.local
# Set VITE_API_BASE_URL to your public API URL before build

docker compose -f docker-compose.production.yaml up -d --build
docker compose -f docker-compose.production.yaml --profile seed run --rm seed
```

| Service | Port | Description |
|---------|------|-------------|
| `web` | 80 | Nginx + Vite static build |
| `api` | 4000 | Express API |
| `mongodb` | 27017 | MongoDB (internal) |

Set `CLIENT_ORIGIN` to your public frontend URL (e.g. `https://portal.example.com`).

## API reference

| Method | Path |
|--------|------|
| GET | `/api/v1/projects` |
| POST | `/api/v1/projects` |
| GET | `/api/v1/dashboard/:projectId` |
| POST | `/api/v1/proofs/verify` |
| GET | `/api/v1/billing/invoices` |
| POST | `/api/v1/billing/topup` |
| POST | `/api/v1/billing/pay-invoice` |

Proof verification fails when `merkleRoot` or `txHash` contains `INVALID` (demo crypto mismatch).
