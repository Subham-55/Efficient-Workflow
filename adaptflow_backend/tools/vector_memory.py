import os
from typing import Any, Dict, List

from pydantic import BaseModel

from config.settings import CHROMA_PERSIST_DIR


class Document(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]


class VectorMemory:
    def __init__(self):
        self._docs: Dict[str, Document] = {}

    def upsert(self, id: str, text: str, metadata: Dict[str, Any]) -> None:
        self._docs[id] = Document(id=id, text=text, metadata=metadata)

    def query(self, text: str, k: int = 3) -> List[Document]:
        query_text = text.lower()
        matches = [doc for doc in self._docs.values() if query_text in doc.text.lower()]
        return matches[:k]


_vector_memory_instance = None


def get_vector_memory() -> VectorMemory:
    global _vector_memory_instance
    if _vector_memory_instance is None:
        _vector_memory_instance = VectorMemory()
    return _vector_memory_instance


def upsert(id: str, text: str, metadata: Dict[str, Any]) -> None:
    get_vector_memory().upsert(id=id, text=text, metadata=metadata)


def query(text: str, k: int = 3) -> List[Document]:
    return get_vector_memory().query(text, k=k)
