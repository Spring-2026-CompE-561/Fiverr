# GigLink backend

FastAPI API for the GigLink marketplace. **Full documentation** is in the [root README](../README.md); this file is a backend-focused quick reference.

## Stack

- **FastAPI**, **SQLAlchemy**, **PostgreSQL** (`psycopg`), **JWT** auth  
- **uv** + [`uv.lock`](uv.lock) for installs; [`requirements.txt`](requirements.txt) is a **pip fallback** (`uv export`)

## Prerequisites

- Python **3.11+**
- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** (recommended) or `pip`
- **PostgreSQL** running (e.g. `docker compose up -d postgres` from the repo root)

## Setup

```bash
cd backend
uv sync --all-groups
cp .env.example .env
```

Default `DATABASE_URL` in `.env.example` matches Docker Compose (`giglink` / `giglink` on `127.0.0.1:5432`).

## Run the API

```bash
uv run uvicorn app.main:app --reload --app-dir src
```

- API: http://localhost:8000  
- Swagger: http://localhost:8000/docs  

## Tests

PostgreSQL must be up (`DATABASE_URL` or `TEST_DATABASE_URL`).

```bash
uv run pytest -v
uv run pytest --cov=src/app --cov-report=term-missing --cov-fail-under=50
```

## Docker

The [`Dockerfile`](Dockerfile) uses **`uv sync --frozen`** (no dev deps) and the same `uv.lock` as local installs.

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/health` | Health |
| GET/POST | `/api/v1/gigs` | List / create gigs |
| GET/PUT/DELETE | `/api/v1/gigs/{id}` | Gig CRUD |
| GET/POST | `/api/v1/orders` | Orders |
| POST | `/api/v1/reviews` | Create review |

See Swagger at `/docs` for the full list.

## Layout

- Application code: `src/app/` (import as `app.*` with `PYTHONPATH=src` or `uv run`)
