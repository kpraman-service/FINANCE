from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    RegisterRequest, LoginRequest, LoginResponse, UserResponse,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.auth_service import register_user, authenticate_user
from app.auth.security import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user = register_user(db, req)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    return authenticate_user(db, req)

@router.post("/logout")
def logout(current_user: UserResponse = Depends(get_current_user)):
    return {"message": "Logged out successfully"}

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest):
    return {"message": "If the email is registered, a password reset link will be sent."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordRequest):
    return {"message": "Password reset successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user = Depends(get_current_user)):
    roles = [r.name for r in current_user.roles]
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "is_active": current_user.is_active,
        "roles": roles,
        "created_at": current_user.created_at,
        "last_login": current_user.last_login
    }
