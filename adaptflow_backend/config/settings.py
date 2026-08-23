import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
GROQ_MODEL_CODE_GENERATOR = os.getenv("GROQ_MODEL_CODE_GENERATOR", "llama-3.3-70b-versatile")
E2B_API_KEY = os.getenv("E2B_API_KEY", "")
CHROMA_PERSIST_DIR = os.getenv("CHROMA_PERSIST_DIR", str(BASE_DIR / "chroma_db"))
MAX_RETRIES = int(os.getenv("MAX_RETRIES", "3"))
CODE_GENERATOR_MAX_TOKENS = int(os.getenv("CODE_GENERATOR_MAX_TOKENS", "10000"))
