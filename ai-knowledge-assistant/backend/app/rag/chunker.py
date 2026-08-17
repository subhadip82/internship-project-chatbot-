from __future__ import annotations

import re
from typing import Any


class Chunker:
    def __init__(self, chunk_size: int = 400, chunk_overlap: int = 80, min_chunks: int = 10):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.min_chunks = min_chunks

    def _normalize_text(self, text: str) -> str:
        text = re.sub(r"\r\n?", "\n", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        return text.strip()

    def chunk_document_pages(self, pages: list[tuple[int, str]]) -> list[dict[str, Any]]:
        """
        Chunks multi-page PDF documents ensuring:
        - Minimum 10 chunks divided (via sentence sliding window if document is compact)
        - Maximum chunks naturally scaling with document length (hundreds for long PDFs)
        - High-quality chunk analysis and semantic overlap
        """
        raw_items: list[dict[str, Any]] = []

        # 1. First Pass: Split by paragraphs and major headings
        for page_num, page_text in pages:
            normalized = self._normalize_text(page_text)
            if not normalized:
                continue

            # Split into natural paragraphs / sections
            paragraphs = [p.strip() for p in re.split(r"\n\s*\n+", normalized) if p.strip()]
            for p in paragraphs:
                # If paragraph is long, split by sentences
                sentences = [s.strip() for s in re.split(r"(?<=[.?!;])\s+", p) if s.strip()]
                if not sentences:
                    sentences = [p]

                curr_chunk = ""
                for s in sentences:
                    if curr_chunk and len(curr_chunk) + len(s) > self.chunk_size:
                        raw_items.append({"text": curr_chunk.strip(), "page_number": page_num})
                        # sliding overlap
                        words = curr_chunk.split()
                        overlap_words = words[-max(3, len(words) // 4):]
                        curr_chunk = " ".join(overlap_words) + " " + s
                    else:
                        curr_chunk = (curr_chunk + " " + s).strip() if curr_chunk else s

                if curr_chunk:
                    raw_items.append({"text": curr_chunk.strip(), "page_number": page_num})

        # Filter empty
        chunks = [c for c in raw_items if c["text"].strip()]

        # 2. Minimum 10 Chunks Enforcement:
        # If total chunks < 10, perform fine-grained sliding-window sub-chunking
        if len(chunks) < self.min_chunks and pages:
            all_text_with_pages = []
            for page_num, page_text in pages:
                norm = self._normalize_text(page_text)
                if norm:
                    all_text_with_pages.append((page_num, norm))

            if all_text_with_pages:
                refined_chunks: list[dict[str, Any]] = []
                
                # Gather all sentences across document
                doc_units = []
                for p_num, p_text in all_text_with_pages:
                    units = [u.strip() for u in re.split(r"(?<=[.?!;\n])\s+", p_text) if len(u.strip()) > 5]
                    if not units:
                        units = [p_text]
                    for u in units:
                        doc_units.append((p_num, u))

                total_units = len(doc_units)
                if total_units >= self.min_chunks:
                    # Stride sliding window across units to produce >= 10 chunks
                    step = max(1, (total_units - 1) // (self.min_chunks + 2))
                    window_size = max(2, step * 2)
                    for start in range(0, total_units, step):
                        window = doc_units[start : start + window_size]
                        if not window:
                            continue
                        chunk_text = " ".join(u[1] for u in window).strip()
                        page_num = window[0][0]
                        if chunk_text and len(chunk_text) >= 15:
                            refined_chunks.append({"text": chunk_text, "page_number": page_num})
                        if len(refined_chunks) >= self.min_chunks and start + window_size >= total_units:
                            break
                else:
                    # For short single-page documents with few sentences, split by clauses / word strides
                    full_words = []
                    for p_num, p_text in all_text_with_pages:
                        for w in p_text.split():
                            full_words.append((p_num, w))
                    
                    if full_words:
                        target_chunk_count = self.min_chunks
                        words_per_chunk = max(12, len(full_words) // target_chunk_count)
                        stride = max(5, words_per_chunk // 2)
                        for start in range(0, len(full_words), stride):
                            w_slice = full_words[start : start + words_per_chunk]
                            if not w_slice:
                                break
                            chunk_text = " ".join(w[1] for w in w_slice).strip()
                            p_num = w_slice[0][0]
                            if chunk_text:
                                refined_chunks.append({"text": chunk_text, "page_number": p_num})
                            if len(refined_chunks) >= self.min_chunks and start + words_per_chunk >= len(full_words):
                                break

                if len(refined_chunks) >= len(chunks):
                    chunks = refined_chunks

        # Fallback if document is virtually empty
        if not chunks:
            for p_num, _ in pages:
                chunks.append({"text": f"Document content (Page {p_num})", "page_number": p_num})

        # Add chunk metadata analysis
        for idx, item in enumerate(chunks):
            item["chunk_index"] = idx + 1
            item["word_count"] = len(item["text"].split())

        return chunks
