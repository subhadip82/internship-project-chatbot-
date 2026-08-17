from __future__ import annotations

import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.session import get_db
from app.models import Conversation, Message
from app.schemas.chat import ChatMessageIn, ChatResponse
from app.services.rag_service import RAGService

router = APIRouter(prefix="/api", tags=["chat"])


@router.post("/conversations")
@router.post("/chat/conversations")
def create_conversation(payload: dict | None = None, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    conversation = Conversation(id=str(uuid.uuid4()), user_id=current_user["sub"], title="New Chat")
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return {
        "success": True,
        "conversation_id": conversation.id,
        "title": conversation.title,
        "data": {"conversation_id": conversation.id, "title": conversation.title},
        "message": "Conversation created",
    }


@router.get("/conversations")
@router.get("/chat/conversations")
def list_conversations(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    rows = db.query(Conversation).filter(Conversation.user_id == current_user["sub"]).order_by(Conversation.updated_at.desc()).all()
    items = [{"id": row.id, "title": row.title, "updated_at": row.updated_at.isoformat() if row.updated_at else None} for row in rows]
    return {
        "success": True,
        "conversations": items,
        "data": items,
        "message": "Conversations loaded",
    }


@router.get("/conversations/{conversation_id}")
@router.get("/chat/conversations/{conversation_id}")
@router.get("/chat/history/{conversation_id}")
def get_conversation(conversation_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    row = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user["sub"]).first()
    if not row:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    msg_items = [{
        "id": m.id,
        "sender": m.sender,
        "role": m.sender,
        "content": m.content,
        "sources": m.sources_json or [],
        "citations": m.sources_json or [],
        "timestamp": m.created_at.isoformat() if m.created_at else None,
    } for m in messages]
    return {
        "success": True,
        "messages": msg_items,
        "data": {
            "conversation": {"id": row.id, "title": row.title},
            "messages": msg_items,
        },
        "message": "Conversation fetched",
    }


@router.delete("/conversations/{conversation_id}")
@router.delete("/chat/conversations/{conversation_id}")
def delete_conversation(conversation_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    convo = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user["sub"]).first()
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.query(Message).filter(Message.conversation_id == conversation_id).delete()
    db.delete(convo)
    db.commit()
    return {"success": True, "data": {"deleted": True}, "message": "Conversation deleted"}


@router.post("/chat")
@router.post("/chat/query")
async def chat(payload: ChatMessageIn, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    user_query = (payload.content or payload.question or "").strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="Question content cannot be empty")

    conversation_id = payload.conversation_id
    convo = None
    if conversation_id:
        convo = db.query(Conversation).filter(Conversation.id == conversation_id, Conversation.user_id == current_user["sub"]).first()

    if not convo:
        convo_id = conversation_id or str(uuid.uuid4())
        convo = Conversation(id=convo_id, user_id=current_user["sub"], title="New Chat")
        db.add(convo)
        db.commit()
        db.refresh(convo)
        conversation_id = convo.id

    user_message = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, sender="user", content=user_query, sources_json=[])
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    rag = RAGService(db)
    result = await rag.answer_question(current_user["sub"], user_query, conversation_id)

    assistant_message = Message(id=str(uuid.uuid4()), conversation_id=conversation_id, sender="assistant", content=result["answer"], sources_json=result["sources"])
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    if convo.title == "New Chat" or not convo.title:
        convo.title = (user_query[:40] + "...") if len(user_query) > 40 else user_query
    convo.updated_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "answer": result["answer"],
        "sources": result["sources"],
        "citations": result["sources"],
        "conversation_id": conversation_id,
        "message_id": assistant_message.id,
        "data": {
            "conversation_id": conversation_id,
            "answer": result["answer"],
            "sources": result["sources"],
            "citations": result["sources"],
            "message_id": assistant_message.id,
        },
        "message": "Question answered",
    }
