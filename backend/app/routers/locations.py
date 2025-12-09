from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, date
from typing import List

from app.models import User, LocationLog
from app.schemas import LocationCreate, LocationResponse, TodayStatusResponse
from app.auth import get_approved_user

router = APIRouter(prefix="/locations", tags=["Locations"])


def location_to_response(loc: LocationLog) -> LocationResponse:
    """Convert LocationLog document to LocationResponse"""
    return LocationResponse(
        id=str(loc.id),
        latitude=loc.latitude,
        longitude=loc.longitude,
        distance=loc.distance,
        is_valid=loc.is_valid,
        timestamp=loc.timestamp
    )


@router.post("/send", response_model=LocationResponse)
async def send_location(
    data: LocationCreate,
    user: User = Depends(get_approved_user)
):
    """Lokatsiya yuborish"""
    now = datetime.now()
    if not (user.work_start_hour <= now.hour < user.work_end_hour):
        raise HTTPException(
            status_code=400,
            detail=f"Ish vaqti emas. Sizning ish vaqtingiz: {user.work_start_hour}:00 - {user.work_end_hour}:00"
        )
    
    # TODO: Calculate distance and is_valid based on office location settings
    location = LocationLog(
        user_id=str(user.id),
        telegram_id=user.telegram_id,
        latitude=data.latitude,
        longitude=data.longitude,
        distance=0,  # Will be calculated
        is_valid=True,  # Will be calculated
        timestamp=datetime.utcnow()
    )
    await location.insert()
    
    return location_to_response(location)


@router.get("/today", response_model=List[LocationResponse])
async def get_today_locations(user: User = Depends(get_approved_user)):
    """Bugungi lokatsiyalar"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    
    locations = await LocationLog.find(
        LocationLog.user_id == str(user.id),
        LocationLog.timestamp >= today_start,
        LocationLog.timestamp <= today_end
    ).sort(LocationLog.timestamp).to_list()
    
    return [location_to_response(loc) for loc in locations]


@router.get("/status", response_model=TodayStatusResponse)
async def get_today_status(user: User = Depends(get_approved_user)):
    """Bugungi holat"""
    today_start = datetime.combine(date.today(), datetime.min.time())
    today_end = datetime.combine(date.today(), datetime.max.time())
    
    locations = await LocationLog.find(
        LocationLog.user_id == str(user.id),
        LocationLog.timestamp >= today_start,
        LocationLog.timestamp <= today_end
    ).sort(LocationLog.timestamp).to_list()
    
    today_str = date.today().isoformat()
    valid_count = sum(1 for loc in locations if loc.is_valid)
    is_in_office = locations[-1].is_valid if locations else False
    
    return TodayStatusResponse(
        date=today_str,
        locations_count=len(locations),
        valid_locations=valid_count,
        is_currently_in_office=is_in_office,
        first_location_time=locations[0].timestamp if locations else None,
        last_location_time=locations[-1].timestamp if locations else None,
        work_start_hour=user.work_start_hour,
        work_end_hour=user.work_end_hour
    )


@router.get("/history/{date_str}", response_model=List[LocationResponse])
async def get_date_locations(
    date_str: str,
    user: User = Depends(get_approved_user)
):
    """Berilgan sanadagi lokatsiyalar"""
    try:
        target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Noto'g'ri sana formati. YYYY-MM-DD formatida kiriting.")
    
    day_start = datetime.combine(target_date, datetime.min.time())
    day_end = datetime.combine(target_date, datetime.max.time())
    
    locations = await LocationLog.find(
        LocationLog.user_id == str(user.id),
        LocationLog.timestamp >= day_start,
        LocationLog.timestamp <= day_end
    ).sort(LocationLog.timestamp).to_list()
    
    return [location_to_response(loc) for loc in locations]
