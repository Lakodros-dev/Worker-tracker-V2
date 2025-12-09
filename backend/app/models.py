from beanie import Document, Indexed
from pydantic import Field
from typing import Optional
from datetime import datetime


class User(Document):
    telegram_id: Indexed(int, unique=True)
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_approved: bool = False
    is_active: bool = True
    is_admin: bool = False
    
    work_start_hour: int = 9
    work_end_hour: int = 18
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "users"


class LocationLog(Document):
    user_id: Indexed(str)
    telegram_id: Indexed(int)
    latitude: float
    longitude: float
    distance: Optional[float] = None
    is_valid: bool = False
    timestamp: Indexed(datetime) = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "location_logs"


class DailyWorkRecord(Document):
    user_id: Indexed(str)
    telegram_id: Indexed(int)
    date: Indexed(str)  # YYYY-MM-DD
    
    work_start_time: Optional[datetime] = None
    work_end_time: Optional[datetime] = None
    
    total_work_hours: float = 0
    present_hours: float = 0
    absent_hours: float = 0
    
    total_locations: int = 0
    valid_locations: int = 0
    late_minutes: int = 0
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "daily_work_records"


class Settings(Document):
    key: Indexed(str, unique=True)
    value: str
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "settings"
