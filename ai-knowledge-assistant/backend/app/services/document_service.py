from __future__ import annotations

import os
import uuid
from pathlib import Path

import fitz
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Document, Notification
from app.rag.chunker import Chunker
from app.services.embedding_service import EmbeddingService


class DocumentService:
    @staticmethod
    def ensure_upload_dir() -> Path:
        path = Path(settings.UPLOAD_DIRECTORY)
        path.mkdir(parents=True, exist_ok=True)
        return path

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        sanitized = os.path.basename(filename).replace(" ", "_")
        return sanitized or f"document_{uuid.uuid4().hex}"

    @staticmethod
    def get_collection_name(user_id: str) -> str:
        clean_id = "".join(c if c.isalnum() or c in ("_", "-") else "_" for c in user_id)
        name = f"user_{clean_id}"[:63]
        if not name[-1].isalnum():
            name = name[:-1] + "0"
        return name

    @staticmethod
    def extract_pdf_pages(file_path: str) -> list[tuple[int, str]]:
        doc = fitz.open(file_path)
        pages: list[tuple[int, str]] = []
        for page_number in range(doc.page_count):
            page = doc.load_page(page_number)
            text = page.get_text("text").strip()
            if text:
                pages.append((page_number + 1, text))
        doc.close()
        return pages

    @staticmethod
    def create_notification(db: Session, user_id: str, event_type: str, title: str, message: str) -> Notification:
        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            type=event_type,
            title=title,
            message=message,
            is_read=False,
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def delete_document_embeddings(user_id: str, document_id: str):
        try:
            import chromadb
            client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
            collection_name = DocumentService.get_collection_name(user_id)
            collection = client.get_or_create_collection(name=collection_name)
            collection.delete(where={"document_id": document_id})
        except Exception as e:
            print(f"Error deleting ChromaDB embeddings: {e}")

    @staticmethod
    def index_document(db: Session, user_id: str, document_id: str, file_path: str, original_filename: str):
        pages = DocumentService.extract_pdf_pages(file_path)
        chunker = Chunker(chunk_size=settings.CHUNK_SIZE, chunk_overlap=settings.CHUNK_OVERLAP, min_chunks=10)
        chunks = chunker.chunk_document_pages(pages)

        if not chunks:
            chunks.append({"page_number": 1, "text": f"Document: {original_filename} (No selectable text extracted)", "chunk_index": 1})

        embeddings = EmbeddingService.embed_batch([chunk["text"] for chunk in chunks])

        import chromadb
        client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        collection_name = DocumentService.get_collection_name(user_id)
        collection = client.get_or_create_collection(name=collection_name)
        ids = [f"{document_id}_{idx}" for idx in range(len(chunks))]
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=[chunk["text"] for chunk in chunks],
            metadatas=[{
                "document_id": document_id,
                "user_id": user_id,
                "filename": original_filename,
                "page_number": chunk.get("page_number") or 1,
                "chunk_id": ids[idx],
                "chunk_index": idx + 1,
                "total_chunks": len(chunks),
                "uploaded_at": str(__import__("datetime").datetime.utcnow().isoformat()),
            } for idx, chunk in enumerate(chunks)],
        )
        document = db.query(Document).filter(Document.id == document_id, Document.user_id == user_id).first()
        if document:
            document.status = "COMPLETED"
            document.chunk_count = len(chunks)
            document.error_message = None
            db.commit()

        DocumentService.create_notification(db, user_id, "document_processed", "Document ready", f"{original_filename} has been indexed into {len(chunks)} chunks and is ready for AI analysis.")
        return len(chunks)
