# GigLink Backend API

## 🚀 Setup Instructions

### 1. Navigate to backend folder

```bash
cd backend
```

---

### 2. Create and activate a virtual environment

#### Windows (PowerShell)

```bash
python -m venv .venv
.venv\Scripts\Activate.ps1
```

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

---

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

### 4. Environment Variables

Create a `.env` file inside the `backend/` folder.

Example:

```env
DATABASE_URL=sqlite:///./giglink.db
JWT_SECRET=dev-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
PYTHONPATH=src
```

---

### 5. Run the server

From the `backend/` folder:

```bash
uvicorn app.main:app --reload --app-dir src
```

---

### 🌐 Server URL

Once running, the API will be available at:

```
http://127.0.0.1:8000
```

---

## 🧠 Notes

* The project uses a `src/` layout, so `app` lives inside `backend/src/`
* `PYTHONPATH=src` ensures imports like `from app.routes import ...` work correctly
* The `--app-dir src` flag helps Uvicorn resolve the app module
* Always run the server from the `backend/` directory to avoid import issues
