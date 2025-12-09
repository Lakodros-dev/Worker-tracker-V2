"""
HR-Tracker V2 - Telegram Bot
Avtomatik ro'yxatdan o'tish va saytga yo'naltirish
"""
import logging
import asyncio
from datetime import timedelta
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.database import async_session, init_db
from app.models import User
from app.auth import create_access_token
from sqlalchemy import select

# Logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

FRONTEND_URL = settings.FRONTEND_URL


async def get_or_create_user(telegram_id: int, username: str, full_name: str):
    """Foydalanuvchini olish yoki yaratish"""
    async with async_session() as db:
        result = await db.execute(select(User).where(User.telegram_id == telegram_id))
        user = result.scalar_one_or_none()
        
        if not user:
            is_admin = settings.is_admin(telegram_id)
            user = User(
                telegram_id=telegram_id,
                username=username,
                full_name=full_name,
                is_admin=is_admin,
                is_approved=is_admin
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            logger.info(f"Yangi foydalanuvchi: {full_name} ({telegram_id})")
        else:
            if username and user.username != username:
                user.username = username
            if full_name and user.full_name != full_name:
                user.full_name = full_name
            await db.commit()
            await db.refresh(user)
        
        return user


async def generate_token(telegram_id: int) -> str:
    """JWT token yaratish"""
    return create_access_token(
        data={"sub": str(telegram_id)},
        expires_delta=timedelta(days=30)
    )


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Start komandasi"""
    tg_user = update.effective_user
    
    user = await get_or_create_user(
        telegram_id=tg_user.id,
        username=tg_user.username or "",
        full_name=tg_user.full_name or tg_user.username or str(tg_user.id)
    )
    
    token = await generate_token(tg_user.id)
    site_url = f"{FRONTEND_URL}?token={token}"
    
    if user.is_admin:
        await update.message.reply_text(
            f"👋 Xush kelibsiz, Admin {tg_user.full_name}!\n\n"
            f"✅ Siz admin sifatida tizimga kirdingiz.\n\n"
            f"🌐 Saytga kirish uchun quyidagi havolani brauzerda oching:\n\n"
            f"{site_url}"
        )
    elif user.is_approved:
        await update.message.reply_text(
            f"👋 Xush kelibsiz, {tg_user.full_name}!\n\n"
            f"✅ Sizning hisobingiz tasdiqlangan.\n\n"
            f"🌐 Saytga kirish uchun quyidagi havolani brauzerda oching:\n\n"
            f"{site_url}"
        )
    else:
        await update.message.reply_text(
            f"👋 Assalomu alaykum, {tg_user.full_name}!\n\n"
            f"✅ Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n\n"
            f"⏳ Sizning so'rovingiz adminga yuborildi.\n"
            f"Admin tasdiqlashini kuting.\n\n"
            f"🌐 Holatni tekshirish uchun:\n\n"
            f"{site_url}"
        )
        
        for admin_id in settings.admin_ids_list:
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
        "/start - Saytga kirish havolasini olish\n"
        "/help - Yordam"
    )


async def on_startup():
    """Bot ishga tushganda"""
    await init_db()
    logger.info("Database initialized")


def main():
    """Bot ishga tushirish"""
    if not settings.BOT_TOKEN:
        print("❌ BOT_TOKEN topilmadi!")
        return
    
    application = Application.builder().token(settings.BOT_TOKEN).build()
    application.job_queue.run_once(lambda _: asyncio.create_task(on_startup()), 0)
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    
    print("🤖 HR-Tracker V2 Bot ishga tushdi!")
    print(f"📱 Admin IDs: {settings.admin_ids_list}")
    print(f"🌐 Frontend: {FRONTEND_URL}")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
