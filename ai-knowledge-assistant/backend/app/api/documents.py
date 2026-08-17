from __future__ import annotations

import os
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.config import settings
from app.database.session import get_db
from app.models import Document
from app.services.document_service import DocumentService

router = APIRouter(prefix="/api", tags=["documents"])


@router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if file is None or not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    if file.content_type not in {"application/pdf"} and not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="The uploaded file is empty")
    if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds size limit")

    upload_dir = DocumentService.ensure_upload_dir()
    safe_name = DocumentService.sanitize_filename(file.filename)
    unique_name = f"{uuid.uuid4()}_{safe_name}"
    file_path = upload_dir / unique_name
    file_path.write_bytes(file_bytes)

    doc_id = str(uuid.uuid4())
    document = Document(
        id=doc_id,
        user_id=current_user["sub"],
        original_filename=safe_name,
        stored_filename=unique_name,
        file_size=len(file_bytes),
        status="PENDING",
        chunk_count=0,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        chunks_count = DocumentService.index_document(db, current_user["sub"], document.id, str(file_path), safe_name)
    except Exception as exc:
        document.status = "FAILED"
        document.error_message = str(exc)
        db.commit()
        raise HTTPException(status_code=500, detail="Document processing failed") from exc

    return {
        "success": True,
        "document_id": document.id,
        "id": document.id,
        "chunk_count": chunks_count,
        "chunks_count": chunks_count,
        "filename": safe_name,
        "data": {
            "id": document.id,
            "document_id": document.id,
            "status": document.status,
            "filename": safe_name,
            "chunk_count": chunks_count,
            "chunks_count": chunks_count,
            "file_size": document.file_size,
        },
        "message": "Document uploaded and processed",
    }


@router.get("/documents")
@router.get("/documents/")
def list_documents(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    rows = db.query(Document).filter(Document.user_id == current_user["sub"]).order_by(Document.created_at.desc()).all()
    items = [
        {
            "id": row.id,
            "document_id": row.id,
            "user_id": row.user_id,
            "original_filename": row.original_filename,
            "filename": row.original_filename,
            "stored_filename": row.stored_filename,
            "file_size": row.file_size,
            "status": row.status,
            "chunk_count": row.chunk_count,
            "chunks_count": row.chunk_count,
            "error_message": row.error_message,
            "created_at": row.created_at.isoformat() if row.created_at else None,
            "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        }
        for row in rows
    ]
    return {"success": True, "documents": items, "data": items, "message": "Documents fetched"}


@router.get("/documents/{document_id}")
def get_document(document_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user["sub"]).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "success": True,
        "data": {
            "id": document.id,
            "document_id": document.id,
            "user_id": document.user_id,
            "original_filename": document.original_filename,
            "stored_filename": document.stored_filename,
            "status": document.status,
            "file_size": document.file_size,
            "chunk_count": document.chunk_count,
            "error_message": document.error_message,
        },
        "message": "Document details",
    }


@router.delete("/documents/{document_id}")
def delete_document(document_id: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Remove from ChromaDB vector store
    try:
        DocumentService.delete_document_embeddings(current_user["sub"], document_id)
    except Exception:
        pass

    document = db.query(Document).filter(Document.id == document_id, Document.user_id == current_user["sub"]).first()
    if document:
        path = Path(settings.UPLOAD_DIRECTORY) / document.stored_filename
        if path.exists():
            path.unlink(missing_ok=True)
        db.delete(document)
        db.commit()

    return {"success": True, "data": {"deleted": True, "id": document_id}, "message": "Document deleted"}
