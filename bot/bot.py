"""
HR-Tracker V2 - Telegram Bot (Standalone)
Bu bot alohida ishga tushiriladi va API ga ulanadi
"""
import logging
import httpx
from datetime import timedelta
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import os
from dotenv import load_dotenv

load_dotenv()

# Config
BOT_TOKEN = os.getenv("BOT_TOKEN", "")
ADMIN_IDS = [int(x.strip()) for x in os.getenv("ADMIN_IDS", "").split(",") if x.strip()]
API_URL = os.getenv("API_URL", "http://localhost:8000")  # Backend API URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")  # Frontend URL

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)


def is_admin(user_id: int) -> bool:
    return user_id in ADMIN_IDS


async def register_user(telegram_id: int, username: str, full_name: str) -> dict:
    """API orqali foydalanuvchini ro'yxatdan o'tkazish"""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{API_URL}/api/auth/telegram",
                json={
                    "telegram_id": telegram_id,
                    "username": username,
                    "full_name": full_name
                },
                timeout=10.0
            )
            if response.status_code == 200:
                return response.json()
            else:
                logger.error(f"API error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            logger.error(f"API connection error: {e}")
            return None


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start komandasi"""
    tg_user = update.effective_user
    
    # API orqali ro'yxatdan o'tkazish
    result = await register_user(
        telegram_id=tg_user.id,
        username=tg_user.username or "",
        full_name=tg_user.full_name or tg_user.username or str(tg_user.id)
    )
    
    if not result:
        await update.message.reply_text(
            "❌ Serverga ulanishda xatolik.\n"
            "Iltimos, keyinroq qayta urinib ko'ring."
        )
        return
    
    token = result.get("access_token", "")
    user_data = result.get("user", {})
    
    site_url = f"{FRONTEND_URL}?token={token}"
    
    if user_data.get("is_admin"):
        await update.message.reply_text(
            f"👋 Xush kelibsiz, Admin {tg_user.full_name}!\n\n"
            f"✅ Siz admin sifatida tizimga kirdingiz.\n\n"
            f"🌐 Saytga kirish:\n{site_url}"
        )
    elif user_data.get("is_approved"):
        await update.message.reply_text(
            f"👋 Xush kelibsiz, {tg_user.full_name}!\n\n"
            f"✅ Sizning hisobingiz tasdiqlangan.\n\n"
            f"🌐 Saytga kirish:\n{site_url}"
        )
    else:
        await update.message.reply_text(
            f"👋 Assalomu alaykum, {tg_user.full_name}!\n\n"
            f"✅ Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n\n"
            f"⏳ Admin tasdiqlashini kuting.\n\n"
            f"🌐 Holatni tekshirish:\n{site_url}"
        )
        
        # Adminlarga xabar
        for admin_id in ADMIN_IDS:
            try:
                uname = tg_user.username or "username yoq"
                await context.bot.send_message(
                    chat_id=admin_id,
                    text=f"🆕 Yangi foydalanuvchi!\n\n"
                         f"👤 {tg_user.full_name}\n"
                         f"🆔 @{uname}\n"
                         f"📱 ID: {tg_user.id}"
                )
            except Exception as e:
                logger.error(f"Admin xabar xatosi: {e}")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Help komandasi"""
    await update.message.reply_text(
        "📖 HR-Tracker V2\n\n"
        "/start - Saytga kirish\n"
        "/help - Yordam"
    )


def main():
    """Bot ishga tushirish"""
    if not BOT_TOKEN:
        print("❌ BOT_TOKEN topilmadi! .env faylini to'ldiring.")
        return
    
    print("🤖 HR-Tracker V2 Bot")
    print(f"📱 Admin IDs: {ADMIN_IDS}")
    print(f"🌐 API URL: {API_URL}")
    print(f"🌐 Frontend URL: {FRONTEND_URL}")
    
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    print("✅ Bot ishga tushdi!")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
