from graph.state import AdaptFlowState
from api.job_store import job_store


def run(state: AdaptFlowState) -> AdaptFlowState:
    state["current_stage"] = "supervisor"
    state["workflow_logs"] = "Supervisor reviewed workflow context"
    job_id = state.get("job_id")
    if job_id:
        job_store.push_progress(job_id, "supervisor", "Supervisor reviewing workflow context", 10)
    state["status"] = "in_progress"
    return state
