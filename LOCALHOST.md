# Full-stack localhost guide (MongoDB Atlas + port 5000)

## File checklist

| File | Purpose |
|------|---------|
| `backend/.env` | `MONGODB_URI` (Atlas), `PORT=5000`, `CLIENT_ORIGIN=http://localhost:8080` |
| `.env.local` | `VITE_API_BASE_URL=http://localhost:5000/api/v1` |
| `backend/src/db.js` | Mongoose → Atlas connection |
| `backend/src/server.js` | Express entry (port 5000) |
| `backend/src/models/*.js` | User, Project, ZKProof, Invoice schemas |
| `backend/src/routes/index.js` | REST `/api/v1/*` |
| `src/api/client.ts` | Axios + interceptors |
| `src/api/endpoints.ts` | Typed API calls |
| `src/lib/store.tsx` | `useEffect` loads projects + invoices from API |

## Step 1 — Seed Atlas (first time only)

```powershell
cd backend
npm install
npm run seed
```

You should see: `🚀 MongoDB Atlas Cloud Connected Successfully`

## Step 2 — Start API

```powershell
cd backend
npm run dev
```

Verify:

- http://localhost:5000/health
- http://localhost:5000/api/v1/projects

## Step 3 — Start frontend

```powershell
# repo root
copy .env.example .env.local
npm install
npm run dev
```

Open http://localhost:8080 — Dashboard, Projects, and Billing load live data.

## Or run both

```powershell
npm run dev:all
```

## Atlas tips

- Whitelist your IP in Atlas → Network Access
- Connection string must include database name, e.g. `...mongodb.net/zkpassportal?retryWrites=true&w=majority`
- If seed says "No projects", run `npm run seed` again

## API endpoints wired to UI

| Endpoint | UI page |
|----------|---------|
| `GET /api/v1/projects` | Projects, sidebar credits |
| `GET /api/v1/dashboard/:projectId` | Dashboard charts + proof table |
| `GET /api/v1/billing/invoices` | Billing list |
| `POST /api/v1/billing/pay-invoice` | Payment → marks **Paid** in DB |
