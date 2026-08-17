from __future__ import annotations

from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health_check():
    return {"success": True, "data": {"status": "ok"}, "message": "Backend is healthy"}


@router.get("/healthz")
def healthz_check():
    return {"status": "ok"}
