from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class DocumentCreate(BaseModel):
    original_filename: str


class DocumentOut(BaseModel):
    id: str
    user_id: str
    original_filename: str
    stored_filename: str
    file_size: int
    status: str
    chunk_count: int
    error_message: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class DocumentUploadResponse(BaseModel):
    document_id: str
    status: str
    message: str


class DocumentRetryRequest(BaseModel):
    pass
