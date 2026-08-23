from fastapi import APIRouter, HTTPException

from api.session_store import session_store

router = APIRouter(prefix="/sessions", tags=["export"])


@router.get("/{session_id}/export")
def export_session(session_id: str, format: str = "json"):
    session = session_store.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    if format != "json":
        raise HTTPException(status_code=400, detail="Only json export is supported")
    return session.model_dump()
