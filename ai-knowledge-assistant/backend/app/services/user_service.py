from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy.orm import Session

from app.models import UserProfile


def upsert_user_profile(db: Session, payload: dict) -> UserProfile:
    user_id = str(payload.get("sub") or payload.get("user_id") or "unknown")
    email = payload.get("email") or payload.get("primary_email") or "unknown@example.com"
    full_name = payload.get("name") or payload.get("full_name") or email
    avatar_url = payload.get("picture") or payload.get("avatar_url")

    profile = db.query(UserProfile).filter(UserProfile.id == user_id).first()
    if profile is None:
        profile = UserProfile(
            id=user_id,
            email=email,
            full_name=full_name,
            avatar_url=avatar_url,
        )
        db.add(profile)
    else:
        profile.email = email
        profile.full_name = full_name
        profile.avatar_url = avatar_url
    db.commit()
    db.refresh(profile)
    return profile
