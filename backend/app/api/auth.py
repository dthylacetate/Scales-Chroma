import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.auth import get_current_token, get_current_user
from app.core.database import get_session
from app.models.auth_token import AuthToken
from app.models.user import User
from app.schemas.user import UserRead

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    email: EmailStr
    password: str = Field(min_length=1, max_length=255)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=255)


class AuthResponse(BaseModel):
    token: str
    user: UserRead


class LogoutResponse(BaseModel):
    status: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(
    payload: RegisterRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    existing_user = session.scalar(
        select(User).where(or_(User.username == payload.username, User.email == payload.email))
    )

    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        password=payload.password,
    )
    session.add(user)
    session.flush()

    token = AuthToken(user_id=user.id, token=_generate_token())
    session.add(token)
    session.commit()
    session.refresh(user)

    return AuthResponse(token=token.token, user=UserRead.model_validate(user))


@router.post("/login", response_model=AuthResponse)
def login(
    payload: LoginRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    user = session.scalar(select(User).where(User.username == payload.username))

    if user is None or user.password != payload.password:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    token = AuthToken(user_id=user.id, token=_generate_token())
    session.add(token)
    session.commit()

    return AuthResponse(token=token.token, user=UserRead.model_validate(user))


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(current_user)


@router.post("/logout", response_model=LogoutResponse)
def logout(
    token: AuthToken = Depends(get_current_token),
    session: Session = Depends(get_session),
) -> LogoutResponse:
    session.delete(token)
    session.commit()
    return LogoutResponse(status="ok")


def _generate_token() -> str:
    return secrets.token_urlsafe(32)
