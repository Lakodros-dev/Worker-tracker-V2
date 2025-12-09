from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# ============ Auth ============
class TelegramAuth(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


# ============ User ============
class UserBase(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str  # MongoDB ObjectId as string
    is_approved: bool
    is_active: bool
    is_admin: bool
    work_start_hour: int
    work_end_hour: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserApprove(BaseModel):
    work_start_hour: int = 9
    work_end_hour: int = 18


class UserWorkHoursUpdate(BaseModel):
    work_start_hour: int
    work_end_hour: int


# ============ Location ============
class LocationCreate(BaseModel):
    latitude: float
    longitude: float


class LocationResponse(BaseModel):
    id: str  # MongoDB ObjectId as string
    latitude: float
    longitude: float
    distance: Optional[float]
    is_valid: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True


# ============ Reports ============
class DailyReportResponse(BaseModel):
    date: str
    work_start_time: Optional[datetime]
    work_end_time: Optional[datetime]
    total_work_hours: float
    present_hours: float
    absent_hours: float
    total_locations: int
    valid_locations: int
    late_minutes: int
    
    class Config:
        from_attributes = True


class MonthlyReportResponse(BaseModel):
    start_date: str
    end_date: str
    total_days: int
    total_work_hours: float
    total_present_hours: float
    total_absent_hours: float
    efficiency_percent: float
    daily_details: List[DailyReportResponse]


class TodayStatusResponse(BaseModel):
    date: str
    locations_count: int
    valid_locations: int
    is_currently_in_office: bool
    first_location_time: Optional[datetime]
    last_location_time: Optional[datetime]
    work_start_hour: int
    work_end_hour: int


# ============ Settings ============
class OfficeLocationSettings(BaseModel):
    latitude: float
    longitude: float
    radius: int = 100


class OfficeAreaSettings(BaseModel):
    point1_lat: float
    point1_lng: float
    point2_lat: float
    point2_lng: float


class WorkSettingsResponse(BaseModel):
    use_area_mode: bool
    office_location: Optional[OfficeLocationSettings]
    office_area: Optional[OfficeAreaSettings]
    location_interval_minutes: int
    grace_period_minutes: int


class LocationIntervalUpdate(BaseModel):
    minutes: int
    grace_period: int = 5


# Update forward reference
Token.model_rebuild()
