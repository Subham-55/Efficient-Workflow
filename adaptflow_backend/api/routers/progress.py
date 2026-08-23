from fastapi import APIRouter, HTTPException
from sse_starlette.sse import EventSourceResponse

from api.job_store import job_store

router = APIRouter(prefix="/jobs", tags=["progress"])


@router.get("/{job_id}/stream")
def stream_job(job_id: str):
    record = job_store.get(job_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Job not found")

    async def event_stream():
        yield {
            "event": "message",
            "data": '{"stage":"queued","message":"Job queued","percent":0}',
        }

    return EventSourceResponse(event_stream())
