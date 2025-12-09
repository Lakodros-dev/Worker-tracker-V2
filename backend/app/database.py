from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import settings

client: AsyncIOMotorClient = None


async def init_db():
    """MongoDB ga ulanish va Beanie ni ishga tushirish"""
    global client
    
    from app.models import User, LocationLog, DailyWorkRecord, Settings
    
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    
    await init_beanie(
        database=client[settings.DB_NAME],
        document_models=[User, LocationLog, DailyWorkRecord, Settings]
    )
    print(f"✅ MongoDB ga ulandi: {settings.DB_NAME}")


async def close_db():
    """MongoDB ulanishini yopish"""
    global client
    if client:
        client.close()
        print("MongoDB ulanishi yopildi")
