from fastapi import APIRouter, BackgroundTasks, HTTPException

from api.models.api_schemas import JobResultResponse, JobStatusResponse, RunRequest, RunResponse
from api.services.job_runner import submit_job
from api.job_store import job_store

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.post("", response_model=RunResponse, status_code=202)
def create_job(request: RunRequest, background_tasks: BackgroundTasks) -> RunResponse:
    job_id = submit_job(request, background_tasks)
    record = job_store.get(job_id)
    if not record:
        raise HTTPException(status_code=500, detail="Job could not be created")
    return RunResponse(job_id=job_id, status=record.status, created_at=record.created_at)


@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str) -> JobStatusResponse:
    record = job_store.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(
        job_id=record.job_id,
        status=record.status,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


@router.get("/{job_id}/result", response_model=JobResultResponse)
def get_job_result(job_id: str) -> JobResultResponse:
    record = job_store.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResultResponse(
        job_id=record.job_id,
        status=record.status,
        bottleneck_report=record.state.get("bottleneck_report"),
        opportunities=record.state.get("opportunities"),
        blueprint=record.state.get("blueprint"),
        generated_code=record.state.get("generated_code"),
        test_results=record.state.get("test_results"),
        migration_report=record.state.get("migration_report"),
        errors=record.state.get("errors", []),
    )
