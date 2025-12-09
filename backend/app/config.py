from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DB_NAME: str = "hr_tracker"
    
    # Telegram
    BOT_TOKEN: str = ""
    ADMIN_IDS: str = ""
    
    # JWT
    SECRET_KEY: str = "change-this-secret-key-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30  # 30 days
    
    # CORS
    FRONTEND_URL: str = "http://localhost:5173"
    ALLOWED_ORIGINS: str = ""
    
    @property
    def admin_ids_list(self) -> List[int]:
        if not self.ADMIN_IDS:
            return []
        return [int(id.strip()) for id in self.ADMIN_IDS.split(",") if id.strip()]
    
    @property
    def cors_origins(self) -> List[str]:
        origins = [self.FRONTEND_URL]
        if self.ALLOWED_ORIGINS:
            origins.extend([o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()])
        origins.extend(["http://localhost:5173", "http://localhost:3000"])
        return list(set(origins))
    
    def is_admin(self, user_id: int) -> bool:
        return user_id in self.admin_ids_list
    
    class Config:
        env_file = ".env"
        extra = "allow"


settings = Settings()
