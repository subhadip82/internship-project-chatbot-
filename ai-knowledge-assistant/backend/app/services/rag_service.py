from __future__ import annotations

import json
from typing import Any

import chromadb
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Document
from app.services.document_service import DocumentService
from app.services.embedding_service import EmbeddingService
from app.services.llm_service import LLMService


class RAGService:
    def __init__(self, db: Session):
        self.db = db

    async def answer_question(self, user_id: str, question: str, conversation_id: str | None = None) -> dict[str, Any]:
        client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIRECTORY)
        collection_name = DocumentService.get_collection_name(user_id)
        collection = client.get_or_create_collection(name=collection_name)

        if collection.count() == 0:
            return {
                "answer": "You haven't uploaded any PDF documents yet. Please upload a document using the upload library, and I will answer your questions based on its content.",
                "sources": [],
            }

        embedding = EmbeddingService.embed_text(question)
        results = collection.query(
            query_embeddings=[embedding],
            n_results=min(settings.RAG_TOP_K, collection.count()),
            include=["documents", "metadatas", "distances"],
        )

        context_chunks: list[str] = []
        sources: list[dict[str, Any]] = []

        candidate_docs = results.get("documents", [[]])[0]
        candidate_metas = results.get("metadatas", [[]])[0]
        candidate_distances = results.get("distances", [[]])[0]

        for idx, doc_text in enumerate(candidate_docs):
            meta = candidate_metas[idx] if idx < len(candidate_metas) else {}
            distance = candidate_distances[idx] if idx < len(candidate_distances) else 0.0
            if not doc_text or not meta:
                continue
            context_chunks.append(doc_text)
            
            # Convert cosine distance to clean match score percentage (0.50 to 0.99)
            sim_score = max(0.50, min(0.99, round(1.0 - (float(distance) / 2.5), 2))) if isinstance(distance, (int, float)) else 0.85
            
            sources.append({
                "filename": meta.get("filename", "uploaded_document.pdf").replace("_", " "),
                "page_number": meta.get("page_number", 1),
                "chunk_id": meta.get("chunk_id"),
                "score": sim_score,
                "text": doc_text[:350],
            })

        if not context_chunks:
            return {"answer": "I could not find any relevant passages in your uploaded documents for that question.", "sources": []}

        context = "\n\n---\n\n".join(context_chunks)
        llm = LLMService()
        answer = await llm.generate_with_context(question, context)

        return {"answer": answer, "sources": sources}
