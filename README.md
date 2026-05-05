# GigLink

Full-stack freelance marketplace: a **Next.js** web app in `frontend/` talks to a **FastAPI** API in `backend/`. Users browse gigs, open orders, manage their seller listings, and leave reviews. Optional SMTP-backed email verification gates some actions until users confirm their address.

**Documentation:** all full-stack instructions live in **this file** at the repo root. `frontend/README.md` is only a short link here; `backend/` has no readme (packaging metadata in `pyproject.toml` points to this file).

---

## Repository layout

At the repository root (the directory that contains `backend/` and `frontend/`):

```
.
├── backend/          # FastAPI + SQLAlchemy + JWT
│   ├── src/app/      # Python package `app`
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
└── frontend/         # Next.js (App Router) + React + Tailwind
    ├── src/app/      # routes and pages
    ├── src/lib/      # API client, auth helpers
    └── package.json
```

---

## Prerequisites

| Layer    | Requirement |
|----------|-------------|
| Backend  | Python **3.11+**, `pip` |
| Frontend | **Node.js 20+** (LTS recommended), **npm** (or `pnpm` / `yarn` if you adapt commands) |

---

## Quick start

### 1. Clone the repo

```bash
git clone https://github.com/Spring-2026-CompE-561/Fiverr
cd Fiverr   # or whatever you named the clone; use the folder that contains backend/ and frontend/
```

### 2. Backend

```bash
cd backend
python -m venv .venv
```

**Windows (PowerShell):** `.\.venv\Scripts\Activate.ps1`  
**macOS / Linux:** `source .venv/bin/activate`

```bash
pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=sqlite:///./giglink.db
JWT_SECRET=change-me-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
PYTHONPATH=src
FRONTEND_URL=http://localhost:3000
```

Start the API (from `backend/`):

```bash
uvicorn app.main:app --reload --app-dir src
```

- API: http://localhost:8000/  
- OpenAPI: http://localhost:8000/docs  

### 3. Frontend

In a **second** terminal:

```bash
cd frontend
npm install
cp .env.example .env
# optional: edit .env if the API is not on 127.0.0.1:8000
npm run dev
```

- App: http://localhost:3000  

The UI reads **`NEXT_PUBLIC_API_URL`** (see `frontend/.env.example`). It defaults to `http://127.0.0.1:8000` when unset, which matches a typical local API. Keep **`FRONTEND_URL`** in the backend `.env` aligned with where users open the app (used for verification links and similar).

---

## How the stack connects

| Concern | Detail |
|---------|--------|
| HTTP | The browser calls the FastAPI origin directly (`getApiBase()` in `frontend/src/lib/api.ts`). There is no Next.js BFF proxy for the marketplace API in this repo. |
| Auth | After login/register, the SPA stores the JWT in **`localStorage`** under the key **`giglink_token`** and sends `Authorization: Bearer …` on requests unless a call opts out with `auth: false`. |
| CORS | `backend/src/app/main.py` allows all origins in development so `localhost:3000` can call `localhost:8000`. Tighten this for production. |
| Env | **`NEXT_PUBLIC_*`** vars are baked in at build time for the Next bundle; restart `next dev` after changing them. |

---

## Tech stack

### Backend (`backend/`)

- **FastAPI** — REST API, automatic OpenAPI  
- **SQLAlchemy** — ORM (SQLite default; PostgreSQL and other SQLAlchemy URLs supported)  
- **Pydantic** & **pydantic-settings** — schemas and configuration  
- **Passlib** + **bcrypt**, **python-jose** — passwords and JWTs  
- **python-dotenv**, **email-validator**, **httpx** — env loading, validation, tests  
- **pytest** — backend tests  

### Frontend (`frontend/`)

- **Next.js 16** (App Router), **React 19**  
- **TypeScript**, **Tailwind CSS 4**  
- **Vitest** + Testing Library + jsdom — unit and integration-style tests  
- **ESLint** (`eslint-config-next`)  

---

## Backend (detail)

### Optional: PostgreSQL

Set `DATABASE_URL` to a PostgreSQL URL. `pyproject.toml` includes **`psycopg`** for that path.

### Optional: email verification

If **`SMTP_HOST`** and **`SMTP_FROM_EMAIL`** are both non-empty, new users start unverified and must confirm email before **mutating gigs**, **creating orders**, or **creating reviews**. Example:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM_EMAIL=noreply@example.com
SMTP_USE_TLS=true
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

From `backend/` with the venv active:

```bash
pytest -v
pytest tests/test_auth.py -v
pytest tests/test_auth.py::test_register -v
```

### Backend layout notes

- Application code: `backend/src/app/` (import path `app.*`).  
- Use **`PYTHONPATH=src`** and **`uvicorn ... --app-dir src`** when running from `backend/`.  
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

- Run **backend** and **frontend** together for full-stack work; integration tests assume the API is reachable at `NEXT_PUBLIC_API_URL`.  
- Backend optional tooling (**Ruff**, **Black**, **isort**) is declared in `backend/pyproject.toml`.  
- For production, replace permissive CORS, rotate secrets, use a real database URL, and configure SMTP if you rely on verification.
