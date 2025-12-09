import json
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Settings


DEFAULT_SETTINGS = {
    "office_location": {"latitude": 41.2995, "longitude": 69.2401, "radius": 100},
    "office_area": {
        "point1": {"lat": 41.2995, "lng": 69.2401},
        "point2": {"lat": 41.3005, "lng": 69.2411}
    },
    "use_area_mode": False,
    "location_interval": {"minutes": 30, "grace_period": 5}
}


async def get_setting(db: AsyncSession, key: str) -> Optional[str]:
    result = await db.execute(select(Settings).where(Settings.key == key))
    setting = result.scalar_one_or_none()
    return setting.value if setting else None


async def set_setting(db: AsyncSession, key: str, value: str):
    result = await db.execute(select(Settings).where(Settings.key == key))
    setting = result.scalar_one_or_none()
    
    if setting:
        setting.value = value
    else:
        setting = Settings(key=key, value=value)
        db.add(setting)
    
    await db.commit()


async def get_all_settings(db: AsyncSession) -> dict:
    result = await db.execute(select(Settings))
    settings_list = result.scalars().all()
    
    settings_dict = {}
    for s in settings_list:
        try:
            settings_dict[s.key] = json.loads(s.value)
        except:
            settings_dict[s.key] = s.value
    
    # Merge with defaults
    for key, value in DEFAULT_SETTINGS.items():
        if key not in settings_dict:
            settings_dict[key] = value
    
    return settings_dict


async def get_office_location(db: AsyncSession) -> dict:
    value = await get_setting(db, "office_location")
    if value:
        return json.loads(value)
    return DEFAULT_SETTINGS["office_location"]


async def get_office_area(db: AsyncSession) -> dict:
    value = await get_setting(db, "office_area")
    if value:
        return json.loads(value)
    return DEFAULT_SETTINGS["office_area"]


async def is_area_mode(db: AsyncSession) -> bool:
    value = await get_setting(db, "use_area_mode")
    if value:
        return json.loads(value)
    return DEFAULT_SETTINGS["use_area_mode"]


async def get_location_interval(db: AsyncSession) -> dict:
    value = await get_setting(db, "location_interval")
    if value:
        return json.loads(value)
    return DEFAULT_SETTINGS["location_interval"]


async def update_office_location(db: AsyncSession, latitude: float, longitude: float, radius: int = 100):
    await set_setting(db, "office_location", json.dumps({
        "latitude": latitude,
        "longitude": longitude,
        "radius": radius
    }))
    await set_setting(db, "use_area_mode", json.dumps(False))


async def update_office_area(db: AsyncSession, point1: dict, point2: dict):
    await set_setting(db, "office_area", json.dumps({
        "point1": point1,
        "point2": point2
    }))
    await set_setting(db, "use_area_mode", json.dumps(True))


async def update_location_interval(db: AsyncSession, minutes: int, grace_period: int = 5):
    await set_setting(db, "location_interval", json.dumps({
        "minutes": minutes,
        "grace_period": grace_period
    }))
