from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ChatMessageIn(BaseModel):
    conversation_id: str | None = None
    content: str | None = None
    question: str | None = None


class SourceItem(BaseModel):
    filename: str
    page_number: int | None = None
    chunk_id: str | None = None
    score: float | None = None
    text: str | None = None


class ChatMessageOut(BaseModel):
    id: str
    conversation_id: str
    sender: str
    content: str
    sources: list[SourceItem] = []
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceItem] = []
    message_id: str
