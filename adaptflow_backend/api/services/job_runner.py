from __future__ import annotations

import uuid
from typing import Any

from fastapi import BackgroundTasks

from api.job_store import job_store
from api.models.api_schemas import RunRequest
from graph.build_graph import build_graph
from graph.state import AdaptFlowState


_compiled_graph = build_graph()


def submit_job(request: RunRequest, background_tasks: BackgroundTasks) -> str:
    job_id = str(uuid.uuid4())
    state: AdaptFlowState = {
        "workflow_description": request.workflow_description,
        "workflow_logs": "queued",
        "retry_count": 0,
        "max_retries": request.max_retries,
        "current_stage": "queued",
        "errors": [],
        "status": "in_progress",
    }
    record = job_store.create(job_id, state)
    background_tasks.add_task(_run_pipeline, job_id, state)
    return record.job_id


def _run_pipeline(job_id: str, initial_state: AdaptFlowState) -> None:
    job_store.update(job_id, status="in_progress")
    try:
        result_state = _compiled_graph(initial_state)
        job_store.update(
            job_id,
            status=result_state.get("status", "complete"),
            current_stage=result_state.get("current_stage", "complete"),
            workflow_logs="completed",
            bottleneck_report=result_state.get("bottleneck_report"),
            opportunities=result_state.get("opportunities"),
            blueprint=result_state.get("blueprint"),
            generated_code=result_state.get("generated_code"),
            test_results=result_state.get("test_results"),
            migration_report=result_state.get("migration_report"),
            errors=result_state.get("errors", []),
        )
    except Exception as exc:
        job_store.update(job_id, status="failed", errors=[str(exc)])
