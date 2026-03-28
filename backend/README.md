# GigLink

A FastAPI backend API for a freelance marketplace platform. Users can browse gigs, create orders, and leave reviews.

---

## Tech Stack

- FastAPI - Modern web framework  
- SQLAlchemy - ORM with SQLite (default)  
- Pydantic - Data validation and settings management  
- Passlib + Bcrypt - Password hashing  
- python-jose - JWT authentication  
- Pytest - Testing framework  

---

## Prerequisites

- Python 3.11+
- pip or virtual environment

---

## Getting Started

### 1. Clone and navigate to the project

```bash
git clone https://github.com/Spring-2026-CompE-561/Fiverr
cd Fiverr
```

### 2. Install dependencies

Navigate to the backend folder:

```bash
cd backend
```

Create and activate a virtual environment:

**Windows (PowerShell)**
```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### 3. Environment Variables

Create a `.env` file inside the `backend/` folder:

```env
DATABASE_URL=sqlite:///./giglink.db
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
PYTHONPATH=src
```

### 4. Running the Application

From the `backend/` folder:

```bash
uvicorn app.main:app --reload --app-dir src
```

The server starts at:
- http://localhost:8000

**Swagger UI:** http://localhost:8000/docs  
**ReDoc:** http://localhost:8000/redoc

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login and receive a JWT token |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/gigs` | Get all gigs |
| POST | `/api/v1/gigs` | Create a gig |
| GET | `/api/v1/gigs/{id}` | Get a specific gig |
| PUT | `/api/v1/gigs/{id}` | Update a gig |
| DELETE | `/api/v1/gigs/{id}` | Delete a gig |
| GET | `/api/v1/orders` | Get user orders |
| POST | `/api/v1/orders` | Create an order |
| GET | `/api/v1/orders/{id}` | Get a specific order |
| PUT | `/api/v1/orders/{id}` | Update an order |
| DELETE | `/api/v1/orders/{id}` | Cancel or delete an order |
| POST | `/api/v1/reviews` | Create a review |
| GET | `/api/v1/reviews/gig/{id}` | Get reviews for a gig |
| DELETE | `/api/v1/reviews/{id}` | Delete a review |

---

## Authentication

Authentication is handled using JWT tokens.

**Flow:**
1. Register using `/api/v1/auth/register`
2. Log in using `/api/v1/auth/login`
3. Copy the returned token
4. Include the token in requests:
   ```
   Authorization: Bearer <your-token>
   ```

Most endpoints require authentication.

---

## Data Model

User → Gig → Order → Review

- **User:** Account with name, email, hashed password, and role (buyer/seller)
- **Gig:** Service offering with title, description, and price
- **Order:** Transaction between buyer and seller
- **Review:** Rating and feedback for completed orders

---

## Project Structure

```
backend/
├── src/app/
│   ├── main.py
│   ├── core/
│   │   ├── settings.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── dependencies.py
│   │   └── error_handlers.py
│   ├── models/
│   │   ├── user.py
│   │   ├── gig.py
│   │   ├── order.py
│   │   └── review.py
│   ├── schemas/
│   ├── routes/
│   ├── repository/
│   ├── services/
│   └── api/v1/
├── tests/
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

## Development

### Run Tests

```bash
pytest -v
```

Run a specific file:

```bash
pytest tests/test_auth.py -v
```

Run a specific test:

```bash
pytest tests/test_auth.py::test_register -v
```

---

## Notes

- The project uses a `src/` layout, so the app package is inside `backend/src/`
- `PYTHONPATH=src` allows imports like `from app.routes import ...`
- The `--app-dir src` flag helps Uvicorn locate the application
- Always run the server from the `backend/` directory
- Use the virtual environment for development
