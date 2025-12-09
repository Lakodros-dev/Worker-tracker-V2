# HR-Tracker V2

Hodimlar davomatini kuzatish tizimi - Telegram bot + Web Application

## Arxitektura

```
├── backend/          # FastAPI backend + Telegram bot
│   ├── app/          # API endpoints
│   └── bot/          # Telegram bot (minimal)
├── frontend/         # React + Vite + Tailwind
└── docker-compose.yml
```

## Xususiyatlar

### Telegram Bot (Minimal)
- `/start` - Ro'yxatdan o'tish
- `/status` - Holat tekshirish
- Avtomatik admin xabarnomasi

### Web Application

**Hodim:**
- Lokatsiya yuborish (geolocation)
- Kunlik/oylik hisobotlar
- Xaritada ofis hududi

**Admin:**
- Kutish ro'yxati (tasdiqlash/rad etish)
- Hodimlar boshqaruvi
- Ish vaqtini sozlash
- Ofis joyini belgilash (doira/to'rtburchak)
- Lokatsiya intervali sozlash
- Barcha hodimlar hisoboti

## O'rnatish

### 1. Docker bilan (tavsiya etiladi)

```bash
# .env faylini yarating
cp .env.example .env
# BOT_TOKEN, ADMIN_IDS, SECRET_KEY ni to'ldiring

# Ishga tushirish
docker-compose up -d

# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### 2. Local development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# .env faylini yarating
cp .env.example .env

# PostgreSQL kerak (local yoki Docker)
docker run -d --name hr-postgres -e POSTGRES_USER=hrtracker -e POSTGRES_PASSWORD=hrtracker123 -e POSTGRES_DB=hr_tracker -p 5432:5432 postgres:15-alpine

# API ishga tushirish
uvicorn app.main:app --reload

# Bot ishga tushirish (alohida terminal)
python -m bot.main
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/telegram` - Telegram orqali login
- `GET /api/auth/me` - Joriy foydalanuvchi
- `GET /api/auth/status` - Holat

### Users (Admin)
- `GET /api/users/pending` - Kutish ro'yxati
- `GET /api/users/approved` - Tasdiqlangan hodimlar
- `POST /api/users/{id}/approve` - Tasdiqlash
- `POST /api/users/{id}/reject` - Rad etish
- `POST /api/users/{id}/revoke` - Ruxsatni bekor qilish
- `PUT /api/users/{id}/work-hours` - Ish vaqtini yangilash

### Locations
- `POST /api/locations/send` - Lokatsiya yuborish
- `GET /api/locations/today` - Bugungi lokatsiyalar
- `GET /api/locations/status` - Bugungi holat

### Reports
- `GET /api/reports/daily` - Kunlik hisobot
- `GET /api/reports/monthly` - Oylik hisobot
- `GET /api/reports/range` - Sana oralig'i
- `GET /api/reports/admin/today-summary` - Admin: bugungi xulosa
- `GET /api/reports/admin/user/{id}/range` - Admin: hodim hisoboti

### Settings (Admin)
- `GET /api/settings/office` - Ofis sozlamalari
- `PUT /api/settings/office/location` - Doira rejimi
- `PUT /api/settings/office/area` - To'rtburchak rejimi
- `PUT /api/settings/interval` - Interval sozlash

## Texnologiyalar

- **Backend:** FastAPI, SQLAlchemy, PostgreSQL, python-telegram-bot
- **Frontend:** React, Vite, Tailwind CSS, Leaflet (xarita)
- **Deploy:** Docker, Docker Compose

## Litsenziya

MIT
