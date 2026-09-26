# 🏋️ AI Gym & Fitness Assistant

An intelligent, full-stack fitness platform powered by 7 AI/ML modules — from adaptive workout planning to real-time IoT equipment control — built with FastAPI, Next.js, PostgreSQL, and MediaPipe.

---

## ✨ Feature Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Adaptive Workout Planner** | Personalized weekly plans via collaborative filtering & rule-based AI |
| 2 | **AI Performance Coach** | Real-time rep counting and form feedback using MediaPipe pose estimation |
| 3 | **AI Dietician & Nutrition** | Macro tracking, meal logging, and Gemini/OpenAI-powered dietary guidance |
| 4 | **Fitness Buddy Matchmaking** | Community workout-partner recommendations with contextual chat |
| 5 | **Habit & Streak Predictor** | ML-based habit adherence scoring with drop-off risk alerts |
| 6 | **Smart Gym IoT Integration** | MQTT-based equipment telemetry, Node-RED dashboards, real-time control |
| 7 | **Analytics & Insights** | Progress charts, performance trends, and predictive fitness analytics |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser / Client                        │
│                      Next.js 16  (Port 3000)                    │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / REST
┌──────────────────────────────▼──────────────────────────────────┐
│                     FastAPI Backend (Port 8000)                  │
│  Routers: auth · users · workouts · nutrition · buddy · habit   │
│           planner · iot · analytics · media · health            │
│  Services: 14 AI/ML service modules (see /backend/services/)    │
└─────────┬────────────────────┬────────────────────┬────────────┘
          │ SQLAlchemy/psycopg │ paho-mqtt (opt.)   │ filesystem
┌─────────▼──────┐  ┌──────────▼──────────┐  ┌─────▼──────────┐
│  PostgreSQL 16  │  │  Eclipse Mosquitto  │  │ /uploads media │
│  (Port 5432)   │  │  MQTT (Port 1883)   │  │    storage     │
└────────────────┘  └─────────────────────┘  └────────────────┘
          ▲
┌─────────┴───────────────────────────┐
│   /ml  MediaPipe + OpenCV pipeline  │
│   /iot Node-RED integration stubs   │
└─────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Python 3.11, FastAPI 0.141, SQLAlchemy 2, psycopg 3 |
| **Database** | PostgreSQL 16 |
| **Auth** | JWT (PyJWT), Argon2 password hashing |
| **AI / ML** | MediaPipe, OpenCV, scikit-learn, NumPy |
| **IoT / MQTT** | Eclipse Mosquitto, paho-mqtt (optional) |
| **LLM** | Google Gemini API / OpenAI API (optional; falls back gracefully) |
| **Containerisation** | Docker, Docker Compose |
| **CI** | GitHub Actions |

---

## 🚀 Quick Start — Docker Compose (recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) ≥ 24
- `docker compose` CLI (bundled with Docker Desktop)

### 1. Clone & configure

```bash
git clone <repo-url>
cd zym

# Create root .env from the example and fill in secrets
cp .env.example .env          # edit POSTGRES_PASSWORD

# Create backend .env from the example
cp backend/.env.example backend/.env
# Edit backend/.env:
#   DATABASE_URL  → leave as-is (docker-compose overrides it)
#   JWT_SECRET_KEY → change to a long random string
#   GEMINI_API_KEY / OPENAI_API_KEY → optional
```

### 2. Build & run

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| MQTT broker | localhost:1883 |

### 3. Stop

```bash
docker compose down          # keeps volumes (data persists)
docker compose down -v       # also removes volumes (fresh start)
```

---

## 🖥️ Manual Local Dev Setup

### Backend (FastAPI + PostgreSQL)

**Prerequisites:** Python 3.11+, a running PostgreSQL 16 instance.

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env: set DATABASE_URL to your local postgres connection string
#   e.g. DATABASE_URL=postgresql://youruser:yourpass@localhost:5432/ai_gym

# Initialise the database (creates all tables)
python create_tables.py

# Start the dev server (auto-reload)
uvicorn main:app --reload --port 8000
```

> **API docs** are served at http://localhost:8000/docs (Swagger UI) and http://localhost:8000/redoc.

### Frontend (Next.js)

**Prerequisites:** Node.js 20+, npm 10+.

```bash
cd frontend

npm install

# Start the dev server
npm run dev
```

Open http://localhost:3000.

> The frontend expects the backend at `http://localhost:8000` by default.
> Set `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to override.

---

## 🧪 Running Tests

```bash
cd backend

# Run all test phases
pytest test_phase_*.py smoke_test_e2e.py -v
```

CI runs these automatically on every push/PR via `.github/workflows/ci.yml`.

---

## 📁 Repository Structure

```
zym/
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point & router registration
│   ├── database.py           # SQLAlchemy engine + session factory
│   ├── models/               # SQLAlchemy ORM models
│   ├── routers/              # FastAPI route handlers (11 modules)
│   ├── schemas/              # Pydantic request/response schemas
│   ├── services/             # 14 AI/ML/IoT service modules
│   ├── auth/                 # JWT utilities & dependencies
│   ├── uploads/              # User-uploaded media (volume-mounted)
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                 # Next.js application
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── ml/                       # MediaPipe/OpenCV pose pipeline
├── iot/                      # IoT integration stubs / Node-RED flows
├── data/                     # Seed data & reference datasets
├── docs/                     # Project documentation
├── tests/                    # Integration / e2e test helpers
├── docker-compose.yml        # Orchestrates all services
├── mosquitto.conf            # MQTT broker config
├── .env.example              # Root env template (docker-compose vars)
└── .github/workflows/ci.yml  # GitHub Actions CI pipeline
```

---

## ⚙️ Environment Variables Reference

### Root `.env` (consumed by `docker-compose.yml`)

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_USER` | `gymuser` | PostgreSQL username |
| `POSTGRES_PASSWORD` | *(required)* | PostgreSQL password |
| `POSTGRES_DB` | `ai_gym` | Database name |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend URL seen by browser |

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full postgres connection string (overridden by docker-compose) |
| `JWT_SECRET_KEY` | **Change this** — used to sign all JWT tokens |
| `JWT_ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime (default 60) |
| `MQTT_BROKER_HOST` | MQTT broker hostname (docker-compose sets `mosquitto`) |
| `MQTT_BROKER_PORT` | MQTT port (default `1883`) |
| `MQTT_TOPIC_PREFIX` | Topic namespace (default `gym/smart_gym`) |
| `MQTT_ENABLED` | `true` to connect to broker; `false` for Simulation Mode |
| `GEMINI_API_KEY` | Optional — AI Dietician uses Gemini if provided |
| `OPENAI_API_KEY` | Optional — fallback LLM provider |

---

## 🔐 Security Notes

- **Never commit `.env` files** — they are in `.gitignore`.
- Generate a strong `JWT_SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- The Mosquitto broker runs with `allow_anonymous true` in dev. **Add authentication and TLS before any public deployment.**
- The backend uploads volume is excluded from Docker images and git.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push and open a Pull Request — CI will run automatically

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
