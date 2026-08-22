from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
from app.models.user import User
from app.models.role import Role
from app.schemas.auth import RegisterRequest, LoginRequest
from app.auth.security import hash_password, verify_password, create_access_token

def register_user(db: Session, req: RegisterRequest):
    if req.password != req.password_confirm:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match")
    
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")
    
    user_role = db.query(Role).filter(Role.name == "User").first()
    if not user_role:
        user_role = Role(name="User")
        db.add(user_role)
        db.commit()
        db.refresh(user_role)

    user = User(
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
        first_name=req.first_name,
        last_name=req.last_name,
        is_active=True
    )
    user.roles.append(user_role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, req: LoginRequest):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
    
    user.last_login = datetime.utcnow()
    db.commit()
    db.refresh(user)

    roles = [r.name for r in user.roles]
    token = create_access_token({"sub": str(user.id), "email": user.email, "roles": roles})
    
    user_data = {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "is_active": user.is_active,
        "roles": roles,
        "created_at": user.created_at,
        "last_login": user.last_login
    }

    return {"access_token": token, "token_type": "bearer", "user": user_data}
