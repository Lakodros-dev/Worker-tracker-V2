# Environment Variables

## 1. Backend (Render.com) - Environment Variables

Render dashboard da quyidagilarni qo'shing:

```
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST:5432/DBNAME
SECRET_KEY=your-super-secret-key-at-least-32-characters-long
ADMIN_IDS=6181098940
FRONTEND_URL=https://YOUR-APP-NAME.onrender.com
ALLOWED_ORIGINS=https://YOUR-APP-NAME.onrender.com
```

**Eslatma:** DATABASE_URL ni Render PostgreSQL dan oling va `postgresql://` ni `postgresql+asyncpg://` ga o'zgartiring.

---

## 2. Bot (Local kompyuter) - .env fayl

`HR-tracker V2/bot/.env` faylini yarating:

```
BOT_TOKEN=8364180575:AAF4x1Lxxny9Kd9WLH0q9Nju0iz_q_uBhO0
ADMIN_IDS=6181098940
API_URL=https://YOUR-APP-NAME.onrender.com
FRONTEND_URL=https://YOUR-APP-NAME.onrender.com
```

---

## Render.com da Deploy Qilish

1. GitHub ga push qiling (HR-tracker V2 papkasini)

2. Render.com da:
   - "New" → "Web Service"
   - GitHub repo ni ulang
   - **Root Directory:** `HR-tracker V2/backend`
   - **Build Command:** `pip install -r requirements.txt && cd ../frontend && npm install && npm run build && cd ../backend && rm -rf static && cp -r ../frontend/dist static`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. PostgreSQL:
   - "New" → "PostgreSQL"
   - Connection string ni oling
   - `postgresql://` → `postgresql+asyncpg://` ga o'zgartiring

4. Environment variables qo'shing (yuqoridagi ro'yxat)

5. Deploy!

---

## Bot ni ishga tushirish

Deploy tugagandan so'ng:

```bash
cd "HR-tracker V2/bot"
pip install -r requirements.txt
# .env faylini yarating (yuqoridagi namuna)
python bot.py
```

Telegram da /start bosing - saytga havola keladi!
