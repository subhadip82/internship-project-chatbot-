from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models import Conversation, Document, Message

router = APIRouter(prefix="/api", tags=["profile"])


@router.get("/profile")
def get_profile(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    document_count = db.query(Document).filter(Document.user_id == current_user["sub"]).count()
    conversation_count = db.query(Conversation).filter(Conversation.user_id == current_user["sub"]).count()
    questions_count = db.query(Message).join(Conversation, Conversation.id == Message.conversation_id).filter(Conversation.user_id == current_user["sub"], Message.sender == "user").count()
    return {
        "success": True,
        "data": {
            "user_id": current_user["sub"],
            "documents": document_count,
            "document_count": document_count,
            "conversations": conversation_count,
            "conversation_count": conversation_count,
            "questions": questions_count,
            "message_count": questions_count,
            "name": current_user.get("name") or "Authenticated user",
            "email": current_user.get("email") or None,
        },
        "message": "User profile loaded",
    }
