# ct-frontend

React 18 + TypeScript frontend for Creator Tools. Vite dev server with Tailwind CSS, React Query for data fetching, and JWT auth.

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.3 | UI framework |
| TypeScript | 5.4 | Type safety |
| Vite | 5.3 | Build tool / dev server |
| React Query | 5.40 | Server state & data fetching |
| React Router | 6.23 | Client-side routing |
| Axios | 1.7 | HTTP client with auth interceptors |
| Tailwind CSS | 3.4 | Utility-first styling |
| Vitest | 1.6 | Unit testing |

## Project Structure

```
src/
├── api/            # React Query hooks (useAuth, useUsers, useWorkflow, client)
├── components/     # Shared components (Navbar, ProtectedRoute, UserCard)
├── context/        # AuthContext, WorkflowContext
├── pages/          # Route-level components
├── types/          # TypeScript type definitions
└── main.tsx        # App entry point — router + providers setup
```

## Local Development

### Prerequisites

- Node.js 20+
- A running backend at `http://localhost:8000` (see [ct-backend](https://github.com/prateek099/ct-backend))

### Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Environment Variables

```env
# .env
VITE_API_URL=http://localhost:8000/api/v1
```

### Run

```bash
# Start dev server with hot reload at http://localhost:5173
npm run dev
```

The Vite dev server proxies `/api` → `http://backend:8000` when running inside Docker. For standalone local development, `VITE_API_URL` is used directly.

### Other Commands

```bash
npm run build     # Type-check + build to dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint on src/
npm run test      # Run tests with Vitest
```

## Running with Docker (Recommended)

Use Docker Compose from the monorepo root to run the full stack:

```bash
cd ..  # navigate to the-creator-tools root

cp ct-backend/.env.example ct-backend/.env

# Start all services (frontend, backend, database) with hot reload
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Stop services (keep DB volume)
docker compose down

# Stop and wipe DB
docker compose down -v
```

Frontend is available at `http://localhost:5173`.

## Deployment

The frontend uses a multi-stage Docker build:

1. **builder** — runs `npm ci && npm run build`, outputs static files to `dist/`
2. **production** — Nginx serves `dist/` on port 80 and proxies `/api/` to the backend

### Build the Production Image

```bash
docker build --target production -t ct-frontend:prod .
```

### Run the Production Container

```bash
docker run -p 80:80 ct-frontend:prod
```

### Render

The project is deployed on [Render](https://render.com) via the `render.yaml` in the monorepo root.

1. Push changes to the `main` branch of `ct-frontend`
2. Bump the submodule pointer in the monorepo:
   ```bash
   cd ..
   git add ct-frontend
   git commit -m "chore: bump ct-frontend to latest"
   git push origin main
   ```
3. Render auto-deploys on push using the Docker build defined in `render.yaml`

### Environment Variables on Render

Set these in the Render dashboard (or `render.yaml`):

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `https://api.yourdomain.com/api/v1`) |

> `VITE_*` variables are inlined at **build time** by Vite, not at runtime. They must be set before the Docker build runs.

## Auth Flow

- JWT access token (30 min) + refresh token (7 days) stored in `localStorage`
- `src/api/client.ts` — Axios interceptor attaches the Bearer token and handles 401 refresh automatically
- `src/components/ProtectedRoute.tsx` — redirects unauthenticated users to `/login`
- `src/context/AuthContext.tsx` — exposes `useAuth()` hook with user state throughout the app

## Routes

| Path | Access | Page |
|------|--------|------|
| `/login` | Public | Login / Register |
| `/` | Protected | Home / Dashboard |
| `/video-idea-generator` | Protected | Video Idea Generator |
| `/script-generator` | Protected | Script Generator |
| `/title-suggestor` | Protected | Title Suggestor |
| `/seo-description` | Protected | SEO Description |
| `/work-in-progress` | Protected | Work in Progress |
| `/users` | Admin | User Management |
