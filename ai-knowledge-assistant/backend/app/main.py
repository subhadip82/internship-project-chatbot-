from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router
from app.api.documents import router as documents_router
from app.api.health import router as health_router
from app.api.notifications import router as notifications_router
from app.api.profile import router as profile_router
from app.config import settings
from app.database.init_db import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    os.makedirs(settings.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
    init_db()
    yield


app = FastAPI(title="AI Knowledge Assistant", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(documents_router)
app.include_router(chat_router)
app.include_router(notifications_router)
app.include_router(profile_router)


@app.get("/")
def root():
    return {"message": "AI Knowledge Assistant API"}
