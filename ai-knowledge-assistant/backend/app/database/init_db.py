from __future__ import annotations

from app.database.base import Base
from app.database.session import engine
from app.models import UserProfile, Document, Conversation, Message, Notification  # noqa: F401


def init_db() -> None:
    Base.metadata.create_all(bind=engine)
