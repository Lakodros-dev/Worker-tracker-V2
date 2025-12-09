from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta

from app.models import User
from app.schemas import TelegramAuth, Token, UserResponse
from app.auth import create_access_token, get_current_user
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


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


@router.post("/telegram", response_model=Token)
async def telegram_auth(auth_data: TelegramAuth):
    """
    Telegram orqali autentifikatsiya.
    Agar foydalanuvchi mavjud bo'lmasa, yangi yaratiladi (pending status).
    """
    user = await User.find_one(User.telegram_id == auth_data.telegram_id)
    
    if not user:
        # Create new user (pending approval)
        is_admin = settings.is_admin(auth_data.telegram_id)
        user = User(
            telegram_id=auth_data.telegram_id,
            username=auth_data.username,
            full_name=auth_data.full_name,
            is_admin=is_admin,
            is_approved=is_admin  # Admins are auto-approved
        )
        await user.insert()
    else:
        # Update user info if changed
        updated = False
        if auth_data.username and user.username != auth_data.username:
            user.username = auth_data.username
            updated = True
        if auth_data.full_name and user.full_name != auth_data.full_name:
            user.full_name = auth_data.full_name
            updated = True
        if updated:
            await user.save()
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(user.telegram_id)},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    return Token(
        access_token=access_token,
        user=user_to_response(user)
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Joriy foydalanuvchi ma'lumotlari"""
    return user_to_response(current_user)


@router.get("/status")
async def get_auth_status(current_user: User = Depends(get_current_user)):
    """Foydalanuvchi holati"""
    return {
        "is_approved": current_user.is_approved,
        "is_admin": current_user.is_admin,
        "is_active": current_user.is_active,
        "message": "Tasdiqlangan" if current_user.is_approved else "Tasdiqlanmagan. Admin tasdiqlashini kuting."
    }
