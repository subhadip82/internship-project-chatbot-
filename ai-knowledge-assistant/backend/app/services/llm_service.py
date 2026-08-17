from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

from app.config import settings


class LLMService:
    def __init__(self, base_url: str | None = None, model: str | None = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL
        self.groq_api_key = settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")
        self.gemini_api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        self.openai_api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY", "")

    async def _try_ollama(self, prompt: str) -> str | None:
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 250,
                },
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                response = await client.post(f"{self.base_url}/api/generate", json=payload)
                if response.status_code == 200:
                    data = response.json()
                    res = data.get("response", "").strip()
                    if res:
                        return res
        except (httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError, Exception):
            pass
        return None

    async def _try_groq(self, question: str, context: str) -> str | None:
        if not self.groq_api_key:
            return None
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.groq_api_key}"}
            messages = [
                {
                    "role": "system",
                    "content": "You are a concise document-grounded assistant. Answer the user question directly in exactly 3 to 4 lines maximum using strictly the provided context. Do not add conversational fluff or intro statements.",
                },
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
            ]
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json={"model": "llama-3.1-8b-instant", "messages": messages, "temperature": 0.1, "max_tokens": 200})
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            pass
        return None

    async def _try_gemini(self, question: str, context: str) -> str | None:
        if not self.gemini_api_key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={self.gemini_api_key}"
            prompt = (
                "You are a concise document-grounded assistant. Answer the question directly in 3 to 4 lines maximum using strictly the provided context without unnecessary filler.\n\n"
                f"Context:\n{context}\n\nQuestion: {question}"
            )
            payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.1, "maxOutputTokens": 200}}
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception:
            pass
        return None

    async def _try_openai(self, question: str, context: str) -> str | None:
        if not self.openai_api_key:
            return None
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {self.openai_api_key}"}
            messages = [
                {
                    "role": "system",
                    "content": "You are a concise document-grounded assistant. Answer the question directly in 3 to 4 lines maximum based strictly on the retrieved context.",
                },
                {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"},
            ]
            async with httpx.AsyncClient(timeout=15.0) as client:
                resp = await client.post(url, headers=headers, json={"model": "gpt-4o-mini", "messages": messages, "temperature": 0.1, "max_tokens": 200})
                if resp.status_code == 200:
                    return resp.json()["choices"][0]["message"]["content"].strip()
        except Exception:
            pass
        return None

    def _synthesize_context(self, question: str, context: str) -> str:
        """Intelligent direct 3-4 line context synthesizer."""
        clean_context = context.strip()
        if not clean_context:
            return "No relevant information was found in the uploaded documents for this question."

        chunks = [c.strip() for c in clean_context.split("\n\n---\n\n") if c.strip()]

        seen_texts = set()
        all_sentences = []
        for chunk in chunks:
            raw_s = re.split(r"(?<=[.?!])\s+|\n+", chunk)
            for s in raw_s:
                clean_s = " ".join(s.split()).strip()
                norm_key = clean_s.lower().strip(".- ")
                # Filter out noisy lines, matplotlib objects, pure code lines, and duplicates
                if (
                    len(clean_s) >= 20
                    and norm_key not in seen_texts
                    and not clean_s.startswith(("#", "http", "Page ", "[<", "import ", "from ", "df =", "model."))
                    and not "matplotlib" in clean_s
                ):
                    seen_texts.add(norm_key)
                    all_sentences.append(clean_s)

        if not all_sentences:
            # Fallback if only code chunks exist
            all_sentences = [" ".join(chunks[0].split()[:50])]

        stop_words = {
            "what", "when", "where", "which", "who", "whom", "this", "that", "these", "those",
            "have", "from", "with", "about", "your", "tell", "show", "give", "list", "summarize",
            "does", "is", "are", "the", "and", "please", "plese", "explen", "explain", "pdf", "doc", "document"
        }
        keywords = [k.lower() for k in re.findall(r"\b\w{3,}\b", question) if k.lower() not in stop_words]

        scored_sentences = []
        for idx, s in enumerate(all_sentences):
            s_lower = s.lower()
            kw_matches = sum(2 for kw in keywords if kw in s_lower) if keywords else 0
            pos_score = max(0, 4 - (idx * 0.4))
            meaning_bonus = 2 if any(w in s_lower for w in ("focus", "goal", "plan", "system", "document", "provide", "feature", "travel", "sustainab", "model", "criteria", "report")) else 0
            score = kw_matches * 3 + pos_score + meaning_bonus
            scored_sentences.append((score, idx, s))

        scored_sentences.sort(key=lambda x: (x[0], -x[1]), reverse=True)
        top_selected = [s for _, _, s in scored_sentences[:4]]

        if not top_selected:
            top_selected = all_sentences[:4]

        formatted_lines = []
        for s in top_selected:
            clean_line = " ".join(s.split())
            if not clean_line.endswith((".", "!", "?")):
                clean_line += "."
            formatted_lines.append(clean_line)

        return " ".join(formatted_lines)

    async def generate_with_context(self, question: str, context: str) -> str:
        system_prompt = (
            "You are a document-grounded AI assistant. "
            "Answer the user question directly and concisely in 3 to 4 lines maximum based strictly on the retrieved context. "
            "Do not include unnecessary details, introduction fluff, or greetings. "
            "If the answer cannot be found in the context, state that clearly in one sentence."
        )
        prompt = (
            f"{system_prompt}\n\n"
            f"Retrieved Document Passages:\n{context}\n\n"
            f"User Question:\n{question}\n\n"
            "Direct Answer (3-4 lines max):"
        )

        # 1. Try local or configured Ollama
        ollama_res = await self._try_ollama(prompt)
        if ollama_res:
            return ollama_res

        # 2. Try Groq (if configured)
        groq_res = await self._try_groq(question, context)
        if groq_res:
            return groq_res

        # 3. Try Gemini (if configured)
        gemini_res = await self._try_gemini(question, context)
        if gemini_res:
            return gemini_res

        # 4. Try OpenAI (if configured)
        openai_res = await self._try_openai(question, context)
        if openai_res:
            return openai_res

        # 5. Smart Direct Synthesizer Fallback (Returns direct 3-4 line answer)
        return self._synthesize_context(question, context)
