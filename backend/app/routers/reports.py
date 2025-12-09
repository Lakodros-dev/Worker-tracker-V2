from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date, datetime, timedelta
from typing import List, Optional
from bson import ObjectId

from app.models import User, DailyWorkRecord
from app.schemas import DailyReportResponse, MonthlyReportResponse
from app.auth import get_approved_user, get_admin_user

router = APIRouter(prefix="/reports", tags=["Reports"])


def record_to_response(record: DailyWorkRecord) -> DailyReportResponse:
    """Convert DailyWorkRecord to DailyReportResponse"""
    return DailyReportResponse(
        date=record.date,
        work_start_time=record.work_start_time,
        work_end_time=record.work_end_time,
        total_work_hours=record.total_work_hours,
        present_hours=record.present_hours,
        absent_hours=record.absent_hours,
        total_locations=record.total_locations,
        valid_locations=record.valid_locations,
        late_minutes=record.late_minutes
    )


@router.get("/daily", response_model=Optional[DailyReportResponse])
async def get_daily_report(
    date_str: str = Query(default=None, description="Sana (YYYY-MM-DD)"),
    user: User = Depends(get_approved_user)
):
    """Kunlik hisobot (o'zim uchun)"""
    if date_str is None:
        date_str = date.today().isoformat()
    
    record = await DailyWorkRecord.find_one(
        DailyWorkRecord.user_id == str(user.id),
        DailyWorkRecord.date == date_str
    )
    
    if not record:
        return None
    
    return record_to_response(record)


@router.get("/range", response_model=MonthlyReportResponse)
async def get_range_report(
    start_date: str = Query(..., description="Boshlanish sanasi (YYYY-MM-DD)"),
    end_date: str = Query(..., description="Tugash sanasi (YYYY-MM-DD)"),
    user: User = Depends(get_approved_user)
):
    """Sana oralig'idagi hisobot (o'zim uchun)"""
    records = await DailyWorkRecord.find(
        DailyWorkRecord.user_id == str(user.id),
        DailyWorkRecord.date >= start_date,
        DailyWorkRecord.date <= end_date
    ).sort(DailyWorkRecord.date).to_list()
    
    total_work = sum(r.total_work_hours for r in records)
    total_present = sum(r.present_hours for r in records)
    total_absent = sum(r.absent_hours for r in records)
    efficiency = (total_present / total_work * 100) if total_work > 0 else 0
    
    return MonthlyReportResponse(
        start_date=start_date,
        end_date=end_date,
        total_days=len(records),
        total_work_hours=round(total_work, 2),
        total_present_hours=round(total_present, 2),
        total_absent_hours=round(total_absent, 2),
        efficiency_percent=round(efficiency, 1),
        daily_details=[record_to_response(r) for r in records]
    )


@router.get("/monthly", response_model=MonthlyReportResponse)
async def get_monthly_report(
    year: int = Query(...),
    month: int = Query(...),
    user: User = Depends(get_approved_user)
):
    """Oylik hisobot (o'zim uchun)"""
    start_date = f"{year}-{month:02d}-01"
    
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"
    
    end_dt = datetime.strptime(end_date, "%Y-%m-%d") - timedelta(days=1)
    end_date = end_dt.strftime("%Y-%m-%d")
    
    records = await DailyWorkRecord.find(
        DailyWorkRecord.user_id == str(user.id),
        DailyWorkRecord.date >= start_date,
        DailyWorkRecord.date <= end_date
    ).sort(DailyWorkRecord.date).to_list()
    
    total_work = sum(r.total_work_hours for r in records)
    total_present = sum(r.present_hours for r in records)
    total_absent = sum(r.absent_hours for r in records)
    efficiency = (total_present / total_work * 100) if total_work > 0 else 0
    
    return MonthlyReportResponse(
        start_date=start_date,
        end_date=end_date,
        total_days=len(records),
        total_work_hours=round(total_work, 2),
        total_present_hours=round(total_present, 2),
        total_absent_hours=round(total_absent, 2),
        efficiency_percent=round(efficiency, 1),
        daily_details=[record_to_response(r) for r in records]
    )


# ============ Admin Reports ============

@router.get("/admin/user/{user_id}/daily", response_model=Optional[DailyReportResponse])
async def admin_get_user_daily_report(
    user_id: str,
    date_str: str = Query(default=None),
    admin: User = Depends(get_admin_user)
):
    """Admin: Hodimning kunlik hisoboti"""
    if date_str is None:
        date_str = date.today().isoformat()
    
    record = await DailyWorkRecord.find_one(
        DailyWorkRecord.user_id == user_id,
        DailyWorkRecord.date == date_str
    )
    
    if not record:
        return None
    
    return record_to_response(record)


@router.get("/admin/user/{user_id}/range", response_model=MonthlyReportResponse)
async def admin_get_user_range_report(
    user_id: str,
    start_date: str = Query(...),
    end_date: str = Query(...),
    admin: User = Depends(get_admin_user)
):
    """Admin: Hodimning sana oralig'idagi hisoboti"""
    records = await DailyWorkRecord.find(
        DailyWorkRecord.user_id == user_id,
        DailyWorkRecord.date >= start_date,
        DailyWorkRecord.date <= end_date
    ).sort(DailyWorkRecord.date).to_list()
    
    total_work = sum(r.total_work_hours for r in records)
    total_present = sum(r.present_hours for r in records)
    total_absent = sum(r.absent_hours for r in records)
    efficiency = (total_present / total_work * 100) if total_work > 0 else 0
    
    return MonthlyReportResponse(
        start_date=start_date,
        end_date=end_date,
        total_days=len(records),
        total_work_hours=round(total_work, 2),
        total_present_hours=round(total_present, 2),
        total_absent_hours=round(total_absent, 2),
        efficiency_percent=round(efficiency, 1),
        daily_details=[record_to_response(r) for r in records]
    )


@router.get("/admin/today-summary")
async def admin_get_today_summary(admin: User = Depends(get_admin_user)):
    """Admin: Bugungi umumiy holat"""
    today_str = date.today().isoformat()
    
    users = await User.find(
        User.is_approved == True,
        User.is_admin == False
    ).to_list()
    
    summary = []
    for user in users:
        record = await DailyWorkRecord.find_one(
            DailyWorkRecord.user_id == str(user.id),
            DailyWorkRecord.date == today_str
        )
        
        summary.append({
            "user_id": str(user.id),
            "full_name": user.full_name,
            "username": user.username,
            "work_hours": f"{user.work_start_hour}:00 - {user.work_end_hour}:00",
            "locations_count": record.total_locations if record else 0,
            "valid_locations": record.valid_locations if record else 0,
            "present_hours": record.present_hours if record else 0,
            "late_minutes": record.late_minutes if record else 0,
            "has_data": record is not None
        })
    
    return {
        "date": today_str,
        "total_employees": len(users),
        "employees_with_data": sum(1 for s in summary if s["has_data"]),
        "employees": summary
    }
