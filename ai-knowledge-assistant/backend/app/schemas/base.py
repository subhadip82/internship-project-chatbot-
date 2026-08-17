from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class APIResponse(BaseModel):
    success: bool = True
    data: dict[str, Any] | None = None
    message: str | None = None

    model_config = ConfigDict(from_attributes=True)


class ErrorPayload(BaseModel):
    code: str
    message: str


class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorPayload
