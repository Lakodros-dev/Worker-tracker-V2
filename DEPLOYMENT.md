# HR-Tracker V2 - Deployment Qo'llanmasi

## Arxitektura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Telegram Bot   │────▶│  Frontend       │────▶│  Backend API    │
│  (VPS/Local)    │     │  (Render/Vercel)│     │  (Render)       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  MongoDB Atlas  │
                                                │  (Cloud)        │
                                                └─────────────────┘
```

---

## 1. MongoDB Atlas Sozlash

1. https://www.mongodb.com/cloud/atlas ga boring
2. Bepul hisob yarating
3. "Create Cluster" → M0 (Free) tanlang
4. **Database Access**: User yarating (username/password)
5. **Network Access**: `0.0.0.0/0` qo'shing (hamma joydan kirish)
6. **Connect** → Drivers → Connection string oling

Connection string namunasi:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## 2. Backend Deployment (Render.com)

### 2.1 Render.com da yangi Web Service yarating

1. https://render.com ga boring
2. "New" → "Web Service"
3. GitHub repo ni ulang
4. Sozlamalar:
   - **Name**: `hr-tracker-api`
   - **Root Directory**: `HR-tracker V2/backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2.2 Environment Variables (Backend)

Render dashboard → Environment → quyidagilarni qo'shing:

| Key | Value | Tavsif |
|-----|-------|--------|
| `MONGODB_URL` | `mongodb+srv://user:pass@cluster.mongodb.net/...` | MongoDB Atlas connection string |
| `DB_NAME` | `hr_tracker` | Database nomi |
| `BOT_TOKEN` | `123456:ABC...` | Telegram bot token (@BotFather dan) |
| `ADMIN_IDS` | `6181098940` | Admin telegram ID (vergul bilan ajratilgan) |
| `SECRET_KEY` | `your-super-secret-key-here` | JWT uchun maxfiy kalit (uzun va murakkab) |
| `FRONTEND_URL` | `https://hr-tracker.vercel.app` | Frontend URL (CORS uchun) |
| `ALLOWED_ORIGINS` | `https://hr-tracker.vercel.app,https://hr-tracker.onrender.com` | Qo'shimcha CORS origins |

---

## 3. Frontend Deployment (Vercel yoki Render)

### 3.1 Vercel bilan (Tavsiya etiladi)

1. https://vercel.com ga boring
2. GitHub repo ni import qiling
3. Sozlamalar:
   - **Root Directory**: `HR-tracker V2/frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Environment Variables (Frontend)

| Key | Value | Tavsif |
|-----|-------|--------|
| `VITE_API_URL` | `https://hr-tracker-api.onrender.com` | Backend API URL |

### 3.3 vite.config.js yangilash

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
```

### 3.4 Vercel uchun vercel.json

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://hr-tracker-api.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 4. Telegram Bot Deployment (VPS)

Bot alohida ishga tushiriladi (VPS yoki lokal kompyuter).

### 4.1 Bot .env fayli

```env
BOT_TOKEN=8364180575:AAF4x1Lxxny9Kd9WLH0q9Nju0iz_q_uBhO0
ADMIN_IDS=6181098940
WEB_APP_URL=https://hr-tracker.vercel.app
API_URL=https://hr-tracker-api.onrender.com
```

### 4.2 Systemd service (Linux VPS)

```bash
# /etc/systemd/system/hr-tracker-bot.service
[Unit]
Description=HR Tracker Telegram Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/hr-tracker/bot
ExecStart=/usr/bin/python3 bot.py
Restart=always
RestartSec=10
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable hr-tracker-bot
sudo systemctl start hr-tracker-bot
```

---

## 5. .env Fayllar Namunasi

### Backend (.env)
```env
# MongoDB Atlas
MONGODB_URL=mongodb+srv://lordlakodros_db_user:Lakodros01@base.wu36gsc.mongodb.net/?retryWrites=true&w=majority&appName=Base
DB_NAME=hr_tracker

# Telegram Bot
BOT_TOKEN=8364180575:AAF4x1Lxxny9Kd9WLH0q9Nju0iz_q_uBhO0
ADMIN_IDS=6181098940

# JWT (production uchun yangi kalit yarating!)
SECRET_KEY=hr-tracker-v2-production-secret-key-change-this

# Frontend URL (CORS)
FRONTEND_URL=https://hr-tracker.vercel.app
ALLOWED_ORIGINS=https://hr-tracker.vercel.app
```

### Frontend (.env)
```env
VITE_API_URL=https://hr-tracker-api.onrender.com
```

### Bot (.env)
```env
BOT_TOKEN=8364180575:AAF4x1Lxxny9Kd9WLH0q9Nju0iz_q_uBhO0
ADMIN_IDS=6181098940
WEB_APP_URL=https://hr-tracker.vercel.app
API_URL=https://hr-tracker-api.onrender.com
```

---

## 6. Deployment Ketma-ketligi

1. ✅ MongoDB Atlas - cluster va user yarating
2. ✅ Backend - Render.com ga deploy qiling
3. ✅ Frontend - Vercel ga deploy qiling
4. ✅ Bot - VPS ga o'rnating
5. ✅ Test - bot orqali /start bosib tekshiring

---

## 7. Muhim Eslatmalar

### Xavfsizlik
- `SECRET_KEY` ni production uchun yangi, murakkab kalit bilan almashtiring
- MongoDB parolini kuchli qiling
- Bot token ni hech kimga bermang

### CORS
- Frontend URL ni backend `FRONTEND_URL` va `ALLOWED_ORIGINS` ga qo'shing
- Aks holda API so'rovlari bloklanadi

### Render Free Tier
- 15 daqiqa faoliyatsizlikdan keyin "sleep" rejimiga o'tadi
- Birinchi so'rov 30-60 soniya kutishi mumkin
- Paid plan ($7/oy) bilan bu muammo yo'q

### MongoDB Atlas Free Tier
- 512 MB storage
- Shared cluster
- Kichik loyihalar uchun yetarli

---

## 8. Muammolarni Hal Qilish

### Backend ishga tushmayapti
```bash
# Render logs ni tekshiring
# Environment variables to'g'ri kiritilganini tekshiring
```

### CORS xatosi
```
Access to fetch blocked by CORS policy
```
→ Backend `FRONTEND_URL` va `ALLOWED_ORIGINS` ni tekshiring

### MongoDB ulanmayapti
```
ServerSelectionTimeoutError
```
→ MongoDB Atlas Network Access da `0.0.0.0/0` qo'shilganini tekshiring

### Bot ishlamayapti
```bash
# Token to'g'riligini tekshiring
# WEB_APP_URL to'g'ri ekanini tekshiring
```
