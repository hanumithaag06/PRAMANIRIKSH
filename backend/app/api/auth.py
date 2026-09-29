from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

def user_to_response(user):
    if hasattr(UserResponse, "model_validate"):
        return UserResponse.model_validate(user)
    return UserResponse.from_orm(user)

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    if not user:
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=400, detail="Invalid credentials")
            
    token_str = f"pramaniriksh_token_{user.id}"
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user_to_response(user)
    }

@router.get("/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [user_to_response(u) for u in users]
