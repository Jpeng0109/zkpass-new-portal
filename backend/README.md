# zkPass Portal API

Express.js + MongoDB (Mongoose) backend for the zkTLS Infrastructure & Billing PaaS.

## Quick start

```bash
cd backend
cp .env.example .env
npm install
# Start MongoDB locally, then:
npm run seed
npm run dev
```

API: `http://localhost:4000` · Health: `GET /health`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode (`node --watch`) |
| `npm start` | Production start |
| `npm run seed` | Reset & seed demo data |

## API routes (`/api/v1`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List projects + account credits |
| POST | `/projects` | Create project with zkTLS template |
| GET | `/dashboard/:projectId` | Dashboard cards, chart, proofs |
| POST | `/proofs/verify` | Verify zkTLS payload, deduct credits |
| GET | `/billing/invoices` | List invoices |
| POST | `/billing/topup` | Top-up project wallet (crypto tx hash) |
| POST | `/billing/pay-invoice` | Pay invoice (crypto tx hash) |

## Folder structure

```
backend/
├── src/
│   ├── server.js          # Entry point
│   ├── config/db.js       # Mongoose connection
│   ├── constants/templates.js
│   ├── models/            # User, Project, ZKProof, Invoice
│   ├── controllers/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   └── scripts/seed.js
├── package.json
└── .env.example
```

## Database choice

**MongoDB + Mongoose** — flexible metadata for five zkTLS template types, proof batches, and billing line items without heavy migrations. Use PostgreSQL + Prisma if you need strict relational reporting later.
