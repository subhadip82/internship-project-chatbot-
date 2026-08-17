from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.clerk import ClerkVerifier
from app.database.session import get_db
from app.services.user_service import upsert_user_profile

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    db: Annotated[Session, Depends(get_db)],
) -> dict:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    try:
        payload = await ClerkVerifier.verify_token(credentials.credentials)
        # Ensure user profile exists in database
        try:
            upsert_user_profile(db, payload)
        except Exception:
            pass
        return payload
    except Exception as exc:  # pragma: no cover - handled as auth error
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized") from exc
