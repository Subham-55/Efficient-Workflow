from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Dict, Optional

from graph.state import AdaptFlowState


class JobRecord:
    def __init__(self, job_id: str, state: AdaptFlowState):
        self.job_id = job_id
        self.state = state
        self.status = "queued"
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = self.created_at
        self.result: Optional[dict] = None


class JobStore:
    def __init__(self) -> None:
        self._records: Dict[str, JobRecord] = {}
        self._lock = Lock()

    def create(self, job_id: str, state: AdaptFlowState) -> JobRecord:
        with self._lock:
            record = JobRecord(job_id, state)
            self._records[job_id] = record
            return record

    def get(self, job_id: str) -> Optional[JobRecord]:
        with self._lock:
            return self._records.get(job_id)

    def update(self, job_id: str, **kwargs) -> Optional[JobRecord]:
        with self._lock:
            record = self._records.get(job_id)
            if not record:
                return None
            for key, value in kwargs.items():
                setattr(record, key, value)
            record.updated_at = datetime.now(timezone.utc)
            return record

    def push_progress(self, job_id: str, stage: str, message: str, percent: Optional[int] = None) -> None:
        record = self.get(job_id)
        if record is None:
            return
        record.state["current_stage"] = stage
        logs = record.state.get("workflow_logs") or []
        if not isinstance(logs, list):
            logs = []
        logs.append(message)
        record.state["workflow_logs"] = logs
        if percent is not None:
            record.state["progress_percent"] = percent


job_store = JobStore()
