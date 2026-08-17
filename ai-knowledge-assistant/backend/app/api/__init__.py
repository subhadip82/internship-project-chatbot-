from app.api.documents import router as documents_router
from app.api.chat import router as chat_router
from app.api.notifications import router as notifications_router
from app.api.profile import router as profile_router
from app.api.health import router as health_router

__all__ = [
    "documents_router",
    "chat_router",
    "notifications_router",
    "profile_router",
    "health_router",
]
