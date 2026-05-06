# GigLink

Full-stack freelance marketplace: a **Next.js** web app in `frontend/` talks to a **FastAPI** API in `backend/`. Users browse gigs, open orders, manage their seller listings, and leave reviews. Optional SMTP-backed email verification gates some actions until users confirm their address.

**Documentation:** the canonical full-stack guide is **this file** at the repo root. `frontend/README.md` is a short pointer here; [`backend/README.md`](backend/README.md) summarizes backend-only commands (the `pyproject.toml` `readme` field points at this root file).

---

## Repository layout

At the repository root (the directory that contains `backend/` and `frontend/`):

```
.
├── docker-compose.yml   # Postgres + API + UI + one-shot seed
├── backend/             # FastAPI + SQLAlchemy + JWT + uv
│   ├── src/app/         # Python package `app`
│   ├── scripts/         # e.g. seed_marketplace.py
│   ├── tests/
│   ├── uv.lock          # locked deps (install with uv)
│   ├── requirements.txt # pip fallback (`uv export`, optional)
│   ├── Dockerfile
│   └── pyproject.toml
└── frontend/            # Next.js (App Router) + React + Tailwind
    ├── src/app/         # routes and pages
    ├── src/lib/         # API client, auth helpers
    ├── package.json
    └── Dockerfile
```

---

## Prerequisites

| Layer    | Requirement |
|----------|-------------|
| Backend  | Python **3.11+**, **[uv](https://docs.astral.sh/uv/getting-started/installation/)** (recommended) or `pip` + [`backend/requirements.txt`](backend/requirements.txt) |
| Frontend | **Node.js 20+** (LTS recommended), **npm** (or `pnpm` / `yarn` if you adapt commands) |
| Docker   | **Docker Desktop** (or Docker Engine + Compose v2). The **Docker daemon must be running** before `docker compose` (on Windows/macOS, open **Docker Desktop** and wait until the engine is ready). |

---

## Quick start

### 1. Clone the repo

```bash
git clone https://github.com/Spring-2026-CompE-561/Fiverr
cd Fiverr   # or whatever you named the clone; use the folder that contains backend/ and frontend/
```

### 2. PostgreSQL (local API)

The app targets **PostgreSQL** only (no SQLite). The easiest way is to start the DB from the repo root:

```bash
docker compose up -d postgres
```

Wait until the container is healthy (same credentials as full compose: user/database/password `giglink`). Alternatively, use any Postgres instance and set `DATABASE_URL` accordingly.

### 3. Backend

From `backend/`:

```bash
cd backend
```

**With uv (recommended):**

```bash
uv sync --all-groups
cp .env.example .env
# edit .env if your Postgres URL or secrets differ
uv run uvicorn app.main:app --reload --app-dir src
```

**With pip:** create a venv, then `pip install -r requirements.txt` and run `uvicorn app.main:app --reload --app-dir src` with `PYTHONPATH=src`.

Create or edit `backend/.env` (see [`backend/.env.example`](backend/.env.example)):

```env
DATABASE_URL=postgresql+psycopg://giglink:giglink@127.0.0.1:5432/giglink
JWT_SECRET=change-me-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
FRONTEND_URL=http://localhost:3000
```

`PYTHONPATH=src` is set automatically when you use `uv run`; with plain `uvicorn` you still need it in the environment.

- API: http://localhost:8000/  
- OpenAPI: http://localhost:8000/docs  

### 4. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
cp .env.example .env
# optional: edit .env if the API is not on 127.0.0.1:8000
npm run dev
```

- App: http://localhost:3000  

The UI reads **`NEXT_PUBLIC_API_URL`** (see [`frontend/.env.example`](frontend/.env.example)). It defaults to `http://localhost:8000` when unset, which matches a typical local API. Keep **`FRONTEND_URL`** in the backend `.env` aligned with where users open the app (used for verification links and similar).

---

## Docker (Postgres + API + UI + demo data)

**Docker Desktop must be running** (Windows/macOS) or your Docker engine must be up, or `docker compose` cannot pull images or start containers.

From the repo root (folder that contains `docker-compose.yml`):

```bash
docker compose up --build
```

- **App:** http://localhost:3000  
- **API / Swagger:** http://localhost:8000/docs  

Compose brings up **PostgreSQL 16**, the **FastAPI** backend, the **Next.js** frontend, and a **one-shot `seed`** container that runs [`backend/scripts/seed_marketplace.py`](backend/scripts/seed_marketplace.py) (demo seller, buyers, gigs, and realistic orders). The browser calls the API at **`http://localhost:8000`** (mapped from the backend container); the frontend image is built with `NEXT_PUBLIC_API_URL=http://localhost:8000` for that reason.

**Postgres (dev defaults in compose):** user `giglink`, password `giglink`, database `giglink`. Data persists in the `giglink_pgdata` volume.

**Optional:** set `JWT_SECRET` in your shell before `docker compose up` (compose reads `${JWT_SECRET}` with a dev fallback).

**Re-run seed only** (e.g. after wiping the volume):

```bash
docker compose run --rm seed
```

### Demo logins (after seed)

| Role   | Email                         | Password          |
|--------|-------------------------------|-------------------|
| Seller | `demo.seller@example.com`     | `DemoSeller!2026` |
| Buyer  | `demo.buyer1@example.com`    | `DemoBuyer1!2026` |
| Buyer  | `demo.buyer2@example.com`    | `DemoBuyer2!2026` |
| Buyer  | `demo.buyer3@example.com`    | `DemoBuyer3!2026` |
| Buyer  | `demo.buyer4@example.com`    | `DemoBuyer4!2026` |

Sign in as the **seller** to see incoming buyer requests on **Orders**; sign in as a **buyer** to see your own requests. Completed orders unlock leaving a review on a gig detail page (per backend rules).

---

## How the stack connects

| Concern | Detail |
|---------|--------|
| HTTP | The browser calls the FastAPI origin directly (`getApiBase()` in `frontend/src/lib/api.ts`). There is no Next.js BFF proxy for the marketplace API in this repo. |
| Auth | After login/register, the SPA stores the JWT in **`localStorage`** under the key **`token`** (and user JSON under **`user`**) and sends `Authorization: Bearer …` on requests unless a call opts out with `auth: false`. |
| CORS | `backend/src/app/main.py` allows all origins in development so `localhost:3000` can call `localhost:8000`. Tighten this for production. |
| Env | **`NEXT_PUBLIC_*`** vars are baked in at build time for the Next bundle; restart `next dev` after changing them. |

---

## Tech stack

### Backend (`backend/`)

- **FastAPI** — REST API, automatic OpenAPI  
- **SQLAlchemy** — ORM (**PostgreSQL** via `psycopg`; `DATABASE_URL` must not use SQLite)  
- **Pydantic** & **pydantic-settings** — schemas and configuration  
- **Passlib** + **bcrypt**, **python-jose** — passwords and JWTs  
- **python-dotenv**, **email-validator**, **httpx** — env loading, validation, tests  
- **pytest** — backend tests  

### Frontend (`frontend/`)

- **Next.js 16** (App Router), **React 19**  
- **TypeScript**, **Tailwind CSS 4**  
- **Vitest** — unit tests and lightweight HTTP checks (`npm test`, `npm run test:coverage`, `npm run test:integration`)  
- **Playwright** — browser E2E / integration tests (`npm run test:e2e`; install browsers once with `npx playwright install` from `frontend/`)  
- **ESLint** (`eslint-config-next`)  

---

## Backend (detail)

### Database

Configure **`DATABASE_URL`** for PostgreSQL (see `backend/.env.example`). Docker Compose sets this automatically for the `backend` service.

### Optional: email verification

If **`SMTP_HOST`** is non-empty, new users start unverified and must confirm email before **mutating gigs**, **creating orders**, or **creating reviews**. Example:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=noreply@example.com
```

Without SMTP, registrations are treated as verified immediately.

### REST API (`/api/v1`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Short JSON status |
| GET | `/api/v1/health` | Health check |
| POST | `/api/v1/auth/register` | Register; JWT + user |
| POST | `/api/v1/auth/login` | Login; JWT + user |
| POST | `/api/v1/auth/verify-email` | Confirm email (SMTP mode) |
| POST | `/api/v1/auth/resend-verification` | Resend link (auth; SMTP mode) |
| GET | `/api/v1/users/{id}` | Public profile |
| PUT | `/api/v1/users/{id}` | Update own profile |
| DELETE | `/api/v1/users/{id}` | Delete own account |
| GET/POST | `/api/v1/gigs` | List / create gigs |
| GET/PUT/DELETE | `/api/v1/gigs/{id}` | Gig CRUD |
| GET/POST | `/api/v1/orders` | List / create orders |
| GET/PUT/DELETE | `/api/v1/orders/{id}` | Order read/update/delete |
| POST | `/api/v1/reviews` | Create review |
| GET | `/api/v1/reviews/gig/{id}` | List reviews for a gig |
| DELETE | `/api/v1/reviews/{id}` | Delete review |

Full schemas and “try it out” are in **Swagger UI** at `/docs`.

### Backend tests

Requires **PostgreSQL** reachable at `DATABASE_URL` (defaults match `docker compose` — run `docker compose up -d postgres` from the repo root).

From `backend/`:

```bash
uv sync --all-groups
uv run pytest -v
uv run pytest tests/test_auth.py -v
uv run pytest tests/test_auth.py::test_register -v
# coverage (≥50% enforced on `src/app`)
uv run pytest --cov=src/app --cov-report=term-missing --cov-fail-under=50
```

Override the test DB URL if needed: `set TEST_DATABASE_URL=...` (Windows) or `export TEST_DATABASE_URL=...` (Unix).

### Backend layout notes

- Application code: `backend/src/app/` (import path `app.*`).  
- Use **`uv run`** (sets up the project env) or **`PYTHONPATH=src`** plus **`uvicorn ... --app-dir src`** when running from `backend/`.  
- The **Dockerfile** installs dependencies with **`uv sync --frozen`** (see [`backend/Dockerfile`](backend/Dockerfile)).  
- Use a strong, unique **`JWT_SECRET`** outside local dev.

---

## Frontend (detail)

### Environment

Copy `frontend/.env.example` to `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

No trailing slash on the base URL.

### Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Next.js dev server (default port 3000) |
| `npm run build` / `npm run start` | Production build and serve |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit tests) |
| `npm run test:integration` | Vitest tests under `src/tests/integration` (expect a **running API**; see `backend-health.integration.test.ts`) |
| `npm run test:e2e` | **Playwright** — Chromium tests in `frontend/e2e/` (starts or reuses `npm run dev`; needs **API** at `NEXT_PUBLIC_API_URL` / `PLAYWRIGHT_API_URL`) |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:watch` | Vitest watch mode |

### Main UI routes

| Path | Role |
|------|------|
| `/` | Home / featured gigs |
| `/browse` | Search and filter gigs |
| `/login`, `/register`, `/signup` | Authentication |
| `/verify-email` | Email verification flow |
| `/post` | Create a gig (seller) |
| `/gigs/[id]` | Gig detail, seller snippet, place order |
| `/my-gigs` | Seller’s listings |
| `/orders` | Buyer/seller order list and actions |
| `/dashboard` | Overview (orders + seller gigs) |
| `/profile`, `/profile/edit` | Profile view and edit |
| `/reviews` | Reviews experience |

API calls use the shared helper **`apiFetch`** in `frontend/src/lib/api.ts`.

---

## Data model (conceptual)

**User → Gig → Order → Review**

- **User** — buyer or seller; optional email verification when SMTP is configured  
- **Gig** — seller service listing  
- **Order** — transaction linking buyer, seller, and gig  
- **Review** — feedback on a gig (enforced by backend services)  

---

## Development tips

- Run **backend** and **frontend** together for full-stack work; `npm run test:integration` and `npm run test:e2e` expect the API reachable (defaults `http://127.0.0.1:8000`). For Playwright, set `PLAYWRIGHT_BASE_URL` / `PLAYWRIGHT_API_URL` if you use non-default hosts.  
- Backend optional tooling (**Ruff**, **Black**, **isort**) is declared in `backend/pyproject.toml`.  
- For production, replace permissive CORS, rotate secrets, use a managed PostgreSQL URL, and configure SMTP if you rely on verification.
