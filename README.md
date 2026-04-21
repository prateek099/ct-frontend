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
| js-cookie | 3.x | Cookie read/write for auth tokens |
| Vitest | 1.6 | Unit testing |

## Project Structure

```
src/
├── api/                    # React Query hooks + Axios client
│   ├── client.ts               # Axios instance — Bearer interceptor, cookie-based refresh
│   ├── useAuth.ts              # useMe, useWorkflowLogin, useLogout
│   ├── useUsers.ts             # User CRUD hooks
│   └── useWorkflow.ts          # AI workflow mutations (ideas, script, titles, SEO)
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx  # Redirects unauthenticated users to /login
│   ├── layout/
│   │   ├── AppShell.tsx        # Sidebar + top-bar frame around routed pages
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── Navbar.tsx
│   │   └── PageHeader.tsx      # Eyebrow + title + subtitle + actions
│   ├── pipeline/               # Reused across the 4 AI pipeline pages
│   │   ├── PipelineStepper.tsx
│   │   ├── BackgroundGenerationBanner.tsx   # "Generating in background" + Stop
│   │   ├── NoIdeaSelectedCard.tsx           # Empty state when no idea picked
│   │   └── ContextBanner.tsx                # "Writing X for Y" summary row
│   └── shared/
│       ├── Icon.tsx            # Centralised SVG icon set
│       ├── UserCard.tsx
│       └── UserWidget.tsx
├── context/                # AuthContext, WorkflowContext (pipeline state + pending flags)
├── pages/                  # Route-level components
│   ├── idea/
│   │   └── IdeaSidebar.tsx     # Style DNA + trend radar + recent videos sidebar
│   ├── script/
│   │   ├── FlavorPicker.tsx    # Script flavor (story/educational/listicle/documentary)
│   │   └── ReviewPanel.tsx     # Live script checklist + AI suggestion + handoff
│   └── *.tsx                   # One file per route (Video ideas, Script, Title, SEO, etc.)
├── types/                  # TypeScript types (auth, user, workflow, api)
│   └── api.ts                  # ApiError envelope + getApiErrorMessage helper
└── main.tsx                # App entry — router + QueryClient + providers
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

- JWT access token (30 min) + refresh token (7 days) stored in **cookies** (not localStorage)
  - `access_token` — expires in 30 min
  - `refresh_token` — expires in 7 days
  - `user_name` — display name, expires in 7 days
  - `login_type` — `"demo"` for workflow login, absent for registered users
- `src/api/client.ts` — Axios interceptor reads `access_token` from cookie, attaches `Authorization: Bearer <token>` on every request, and auto-refreshes on 401
- `src/components/ProtectedRoute.tsx` — redirects unauthenticated users to `/login`
- `src/context/AuthContext.tsx` — exposes `useAuth()` hook with `{ user, isAuthenticated, logout }`
- `src/components/UserWidget.tsx` — fixed top-right widget showing the logged-in username and a Logout button; hidden on `/` and `/users` which have their own nav

### Sending the Bearer token manually

The Axios client sends it automatically. For direct API calls (e.g. curl or Postman), get the token from the `access_token` cookie after login and pass it as:

```
Authorization: Bearer <access_token>
```

## Routes

| Path | Access | Page |
|------|--------|------|
| `/login` | Public | Login / Register |
| `/` | Protected | Home / Dashboard (includes logout in sticky header) |
| `/video-idea-generator` | Protected | Video Idea Generator |
| `/script-generator` | Protected | Script Generator |
| `/title-suggestor` | Protected | Title Suggestor |
| `/seo-description` | Protected | SEO Description |
| `/work-in-progress` | Protected | Work in Progress |
| `/users` | Admin | User Management |

All protected routes require a valid `access_token` cookie. Unauthenticated visitors are redirected to `/login`.
