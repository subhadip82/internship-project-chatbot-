from __future__ import annotations

import os
from functools import lru_cache
from typing import Any

from sentence_transformers import SentenceTransformer


class EmbeddingService:
    _model: SentenceTransformer | None = None

    @classmethod
    @lru_cache(maxsize=1)
    def get_model(cls) -> SentenceTransformer:
        model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
        if cls._model is None:
            cls._model = SentenceTransformer(model_name)
        return cls._model

    @classmethod
    def embed_text(cls, text: str) -> list[float]:
        return cls.get_model().encode(text, convert_to_tensor=False).tolist()

    @classmethod
    def embed_batch(cls, texts: list[str]) -> list[list[float]]:
        return cls.get_model().encode(texts, convert_to_tensor=False, batch_size=32).tolist()
