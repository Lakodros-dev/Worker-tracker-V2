from fastapi import APIRouter, Depends, HTTPException
import json

from app.models import User, Settings
from app.schemas import (
    WorkSettingsResponse, OfficeLocationSettings, 
    OfficeAreaSettings, LocationIntervalUpdate
)
from app.auth import get_admin_user, get_approved_user

router = APIRouter(prefix="/settings", tags=["Settings"])


async def get_setting(key: str) -> dict:
    """Get setting by key"""
    setting = await Settings.find_one(Settings.key == key)
    if setting:
        try:
            return json.loads(setting.value)
        except json.JSONDecodeError:
            return {}
    return {}


async def set_setting(key: str, value: dict):
    """Set or update setting"""
    from datetime import datetime
    setting = await Settings.find_one(Settings.key == key)
    if setting:
        setting.value = json.dumps(value)
        setting.updated_at = datetime.utcnow()
        await setting.save()
    else:
        setting = Settings(key=key, value=json.dumps(value))
        await setting.insert()


@router.get("/office", response_model=WorkSettingsResponse)
async def get_office_settings(user: User = Depends(get_approved_user)):
    """Ofis sozlamalarini olish (barcha foydalanuvchilar uchun)"""
    office_loc = await get_setting("office_location")
    office_area = await get_setting("office_area")
    interval = await get_setting("location_interval")
    use_area = await get_setting("use_area_mode")
    
    return WorkSettingsResponse(
        use_area_mode=use_area.get("enabled", False) if use_area else False,
        office_location=OfficeLocationSettings(
            latitude=office_loc.get("latitude", 0),
            longitude=office_loc.get("longitude", 0),
            radius=office_loc.get("radius", 100)
        ) if office_loc else None,
        office_area=OfficeAreaSettings(
            point1_lat=office_area.get("point1", {}).get("lat", 0),
            point1_lng=office_area.get("point1", {}).get("lng", 0),
            point2_lat=office_area.get("point2", {}).get("lat", 0),
            point2_lng=office_area.get("point2", {}).get("lng", 0)
        ) if office_area else None,
        location_interval_minutes=interval.get("minutes", 30) if interval else 30,
        grace_period_minutes=interval.get("grace_period", 5) if interval else 5
    )


@router.put("/office/location")
async def update_office_location(
    data: OfficeLocationSettings,
    admin: User = Depends(get_admin_user)
):
    """Ofis lokatsiyasini yangilash (doira rejimi)"""
    await set_setting("office_location", {
        "latitude": data.latitude,
        "longitude": data.longitude,
        "radius": data.radius
    })
    await set_setting("use_area_mode", {"enabled": False})
    
    return {"message": "Ofis lokatsiyasi yangilandi", "mode": "circle"}


@router.put("/office/area")
async def update_office_area(
    data: OfficeAreaSettings,
    admin: User = Depends(get_admin_user)
):
    """Ofis hududini yangilash (to'rtburchak rejimi)"""
    await set_setting("office_area", {
        "point1": {"lat": data.point1_lat, "lng": data.point1_lng},
        "point2": {"lat": data.point2_lat, "lng": data.point2_lng}
    })
    await set_setting("use_area_mode", {"enabled": True})
    
    return {"message": "Ofis hududi yangilandi", "mode": "area"}


@router.put("/interval")
async def update_location_interval(
    data: LocationIntervalUpdate,
    admin: User = Depends(get_admin_user)
):
    """Lokatsiya yuborish oralig'ini yangilash"""
    if data.minutes < 5 or data.minutes > 120:
        raise HTTPException(status_code=400, detail="Interval 5-120 daqiqa orasida bo'lishi kerak")
    
    await set_setting("location_interval", {
        "minutes": data.minutes,
        "grace_period": data.grace_period
    })
    
    return {
        "message": "Interval yangilandi",
        "minutes": data.minutes,
        "grace_period": data.grace_period
    }
