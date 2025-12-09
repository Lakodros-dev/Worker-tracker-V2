# HR-Tracker V2 Deployment Guide

## Arxitektura

```
┌─────────────────┐     ┌─────────────────────────────────┐
│  Telegram Bot   │────▶│  Render.com (Web Service)       │
│  (Local/VPS)    │     │  ┌─────────┐  ┌─────────────┐   │
└─────────────────┘     │  │ FastAPI │  │ React (SPA) │   │
                        │  │   API   │  │   Frontend  │   │
                        │  └────┬────┘  └─────────────┘   │
                        │       │                         │
                        │  ┌────▼────┐                    │
                        │  │PostgreSQL│                   │
                        │  └─────────┘                    │
                        └─────────────────────────────────┘
```

## 1. Render.com da Deploy

### Backend + Frontend (bitta service)

1. GitHub ga push qiling
2. Render.com da "New Web Service" yarating
3. Repository ni ulang
4. Sozlamalar:
   - **Root Directory:** `HR-tracker V2/backend`
   - **Build Command:** `chmod +x build.sh && ./build.sh`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3

### Environment Variables (Render)

```
DATABASE_URL=<Render PostgreSQL dan avtomatik>
SECRET_KEY=<random-secret-key-32-chars>
ADMIN_IDS=6181098940
FRONTEND_URL=https://your-app.onrender.com
ALLOWED_ORIGINS=https://your-app.onrender.com
```

### PostgreSQL Database

1. Render da "New PostgreSQL" yarating
2. Connection string ni `DATABASE_URL` ga qo'ying
3. Format: `postgresql+asyncpg://user:pass@host:5432/dbname`

---

## 2. Bot (Local yoki VPS)

Bot alohida ishga tushiriladi:

```bash
cd bot
pip install -r requirements.txt
cp .env.example .env
# .env ni to'ldiring
python bot.py
```

### Bot .env

```
BOT_TOKEN=8364180575:AAF4x1Lxxny9Kd9WLH0q9Nju0iz_q_uBhO0
ADMIN_IDS=6181098940
API_URL=https://your-app.onrender.com
FRONTEND_URL=https://your-app.onrender.com
```

---

## Environment Variables Summary

### Backend (.env) - Render uchun

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql+asyncpg://... |
| SECRET_KEY | JWT secret (32+ chars) | abc123xyz... |
| ADMIN_IDS | Admin Telegram IDs | 6181098940 |
| FRONTEND_URL | Frontend URL | https://app.onrender.com |
| ALLOWED_ORIGINS | CORS origins | https://app.onrender.com |

### Bot (.env) - Local/VPS uchun

| Variable | Description | Example |
|----------|-------------|---------|
| BOT_TOKEN | Telegram bot token | 8364180575:AAF... |
| ADMIN_IDS | Admin Telegram IDs | 6181098940 |
| API_URL | Backend API URL | https://app.onrender.com |
| FRONTEND_URL | Frontend URL | https://app.onrender.com |
