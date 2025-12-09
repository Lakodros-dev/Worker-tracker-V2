from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from datetime import datetime

from app.models import User
from app.schemas import UserResponse, UserApprove, UserWorkHoursUpdate
from app.auth import get_admin_user

router = APIRouter(prefix="/users", tags=["Users"])


def user_to_response(user: User) -> UserResponse:
    """Convert User document to UserResponse"""
    return UserResponse(
        id=str(user.id),
        telegram_id=user.telegram_id,
        username=user.username,
        full_name=user.full_name,
        is_approved=user.is_approved,
        is_active=user.is_active,
        is_admin=user.is_admin,
        work_start_hour=user.work_start_hour,
        work_end_hour=user.work_end_hour,
        created_at=user.created_at
    )


@router.get("/pending", response_model=List[UserResponse])
async def get_pending_users(admin: User = Depends(get_admin_user)):
    """Tasdiqlanmagan foydalanuvchilar ro'yxati"""
    users = await User.find(
        User.is_approved == False,
        User.is_active == True
    ).to_list()
    return [user_to_response(u) for u in users]


@router.get("/approved", response_model=List[UserResponse])
async def get_approved_users(admin: User = Depends(get_admin_user)):
    """Tasdiqlangan hodimlar ro'yxati"""
    users = await User.find(
        User.is_approved == True,
        User.is_active == True,
        User.is_admin == False
    ).to_list()
    return [user_to_response(u) for u in users]


@router.get("/all", response_model=List[UserResponse])
async def get_all_users(admin: User = Depends(get_admin_user)):
    """Barcha foydalanuvchilar"""
    users = await User.find(User.is_admin == False).to_list()
    return [user_to_response(u) for u in users]


@router.post("/{user_id}/approve", response_model=UserResponse)
async def approve_user(
    user_id: str,
    data: UserApprove,
    admin: User = Depends(get_admin_user)
):
    """Foydalanuvchini tasdiqlash"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Noto'g'ri ID formati")
    
    user = await User.get(ObjectId(user_id))
    
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    if user.is_approved:
        raise HTTPException(status_code=400, detail="Foydalanuvchi allaqachon tasdiqlangan")
    
    user.is_approved = True
    user.work_start_hour = data.work_start_hour
    user.work_end_hour = data.work_end_hour
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return user_to_response(user)


@router.post("/{user_id}/reject")
async def reject_user(user_id: str, admin: User = Depends(get_admin_user)):
    """Foydalanuvchini rad etish (o'chirish)"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Noto'g'ri ID formati")
    
    user = await User.get(ObjectId(user_id))
    
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    await user.delete()
    
    return {"message": "Foydalanuvchi o'chirildi"}


@router.post("/{user_id}/revoke")
async def revoke_user(user_id: str, admin: User = Depends(get_admin_user)):
    """Foydalanuvchi ruxsatini bekor qilish"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Noto'g'ri ID formati")
    
    user = await User.get(ObjectId(user_id))
    
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    if user.is_admin:
        raise HTTPException(status_code=400, detail="Admin ruxsatini bekor qilib bo'lmaydi")
    
    user.is_approved = False
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return {"message": "Ruxsat bekor qilindi"}


@router.put("/{user_id}/work-hours", response_model=UserResponse)
async def update_work_hours(
    user_id: str,
    data: UserWorkHoursUpdate,
    admin: User = Depends(get_admin_user)
):
    """Hodim ish vaqtini yangilash"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Noto'g'ri ID formati")
    
    user = await User.get(ObjectId(user_id))
    
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    if data.work_start_hour >= data.work_end_hour:
        raise HTTPException(status_code=400, detail="Boshlanish vaqti tugash vaqtidan kichik bo'lishi kerak")
    
    user.work_start_hour = data.work_start_hour
    user.work_end_hour = data.work_end_hour
    user.updated_at = datetime.utcnow()
    await user.save()
    
    return user_to_response(user)


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, admin: User = Depends(get_admin_user)):
    """Foydalanuvchi ma'lumotlari"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Noto'g'ri ID formati")
    
    user = await User.get(ObjectId(user_id))
    
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    
    return user_to_response(user)
