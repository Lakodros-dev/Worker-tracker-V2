from geopy.distance import geodesic
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, date
from typing import Tuple, List, Optional

from app.models import LocationLog, User, DailyWorkRecord
from app.services import settings_service


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Ikki nuqta orasidagi masofani metrda hisoblash"""
    return geodesic((lat1, lon1), (lat2, lon2)).meters


async def validate_location(db: AsyncSession, lat: float, lon: float) -> Tuple[bool, float]:
    """Lokatsiya ofis hududida ekanligini tekshirish"""
    use_area = await settings_service.is_area_mode(db)
    
    if use_area:
        return await validate_location_area(db, lat, lon)
    else:
        return await validate_location_circle(db, lat, lon)


async def validate_location_circle(db: AsyncSession, lat: float, lon: float) -> Tuple[bool, float]:
    """Doira rejimida tekshirish"""
    office = await settings_service.get_office_location(db)
    distance = calculate_distance(lat, lon, office["latitude"], office["longitude"])
    is_valid = distance <= office["radius"]
    return is_valid, distance


async def validate_location_area(db: AsyncSession, lat: float, lon: float) -> Tuple[bool, float]:
    """To'rtburchak hudud rejimida tekshirish"""
    area = await settings_service.get_office_area(db)
    point1 = area["point1"]
    point2 = area["point2"]
    
    min_lat = min(point1["lat"], point2["lat"])
    max_lat = max(point1["lat"], point2["lat"])
    min_lng = min(point1["lng"], point2["lng"])
    max_lng = max(point1["lng"], point2["lng"])
    
    is_valid = (min_lat <= lat <= max_lat) and (min_lng <= lon <= max_lng)
    
    # Markazgacha masofa
    center_lat = (min_lat + max_lat) / 2
    center_lng = (min_lng + max_lng) / 2
    distance = calculate_distance(lat, lon, center_lat, center_lng)
    
    return is_valid, distance


async def log_location(
    db: AsyncSession, 
    user_id: int, 
    lat: float, 
    lon: float
) -> LocationLog:
    """Lokatsiyani bazaga yozish"""
    is_valid, distance = await validate_location(db, lat, lon)
    
    location = LocationLog(
        user_id=user_id,
        latitude=lat,
        longitude=lon,
        distance=distance,
        is_valid=is_valid
    )
    db.add(location)
    await db.commit()
    await db.refresh(location)
    
    # Update daily record
    await update_daily_record(db, user_id)
    
    return location


async def get_today_locations(db: AsyncSession, user_id: int) -> List[LocationLog]:
    """Bugungi lokatsiyalarni olish"""
    today = date.today().isoformat()
    result = await db.execute(
        select(LocationLog)
        .where(
            and_(
                LocationLog.user_id == user_id,
                LocationLog.timestamp >= f"{today} 00:00:00"
            )
        )
        .order_by(LocationLog.timestamp)
    )
    return result.scalars().all()


async def get_date_locations(db: AsyncSession, user_id: int, date_str: str) -> List[LocationLog]:
    """Berilgan sanadagi lokatsiyalarni olish"""
    result = await db.execute(
        select(LocationLog)
        .where(
            and_(
                LocationLog.user_id == user_id,
                LocationLog.timestamp >= f"{date_str} 00:00:00",
                LocationLog.timestamp < f"{date_str} 23:59:59"
            )
        )
        .order_by(LocationLog.timestamp)
    )
    return result.scalars().all()


async def update_daily_record(db: AsyncSession, user_id: int, date_str: str = None):
    """Kunlik ish soatlarini yangilash"""
    if date_str is None:
        date_str = date.today().isoformat()
    
    locations = await get_date_locations(db, user_id, date_str)
    
    if not locations:
        return
    
    # Get user for work hours
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return
    
    first_loc = locations[0]
    last_loc = locations[-1]
    
    # Calculate total time
    total_seconds = (last_loc.timestamp - first_loc.timestamp).total_seconds()
    total_hours = total_seconds / 3600
    
    # Calculate absent time (gaps > interval + grace)
    interval_config = await settings_service.get_location_interval(db)
    max_gap_minutes = interval_config["minutes"] + interval_config["grace_period"]
    
    absent_hours = 0
    for i in range(len(locations) - 1):
        gap_seconds = (locations[i+1].timestamp - locations[i].timestamp).total_seconds()
        gap_minutes = gap_seconds / 60
        if gap_minutes > max_gap_minutes:
            absent_hours += (gap_minutes - max_gap_minutes) / 60
    
    present_hours = total_hours - absent_hours
    
    # Calculate late minutes
    work_start = first_loc.timestamp.replace(hour=user.work_start_hour, minute=0, second=0)
    late_minutes = 0
    if first_loc.timestamp > work_start:
        late_minutes = int((first_loc.timestamp - work_start).total_seconds() / 60)
    
    valid_count = sum(1 for loc in locations if loc.is_valid)
    
    # Update or create record
    result = await db.execute(
        select(DailyWorkRecord).where(
            and_(DailyWorkRecord.user_id == user_id, DailyWorkRecord.date == date_str)
        )
    )
    record = result.scalar_one_or_none()
    
    if record:
        record.work_start_time = first_loc.timestamp
        record.work_end_time = last_loc.timestamp
        record.total_work_hours = round(total_hours, 2)
        record.present_hours = round(present_hours, 2)
        record.absent_hours = round(absent_hours, 2)
        record.total_locations = len(locations)
        record.valid_locations = valid_count
        record.late_minutes = late_minutes
    else:
        record = DailyWorkRecord(
            user_id=user_id,
            date=date_str,
            work_start_time=first_loc.timestamp,
            work_end_time=last_loc.timestamp,
            total_work_hours=round(total_hours, 2),
            present_hours=round(present_hours, 2),
            absent_hours=round(absent_hours, 2),
            total_locations=len(locations),
            valid_locations=valid_count,
            late_minutes=late_minutes
        )
        db.add(record)
    
    await db.commit()
