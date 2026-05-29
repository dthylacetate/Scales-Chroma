from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_session
from app.models.auth_token import AuthToken
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    session: Session = Depends(get_session),
) -> AuthToken:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    token = session.scalar(select(AuthToken).where(AuthToken.token == credentials.credentials))

    if token is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return token


def get_current_user(
    token: AuthToken = Depends(get_current_token),
    session: Session = Depends(get_session),
) -> User:
    user = session.get(User, token.user_id)

    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return user
