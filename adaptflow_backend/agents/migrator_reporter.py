from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import MigrationReport
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    state["migration_report"] = invoke_structured_llm_with_retry(
        "migrator_reporter",
        MigrationReport,
        f"Create a migration report for: {state.get('workflow_description', '')}",
        retries=2,
    )
    job_id = state.get("job_id")
    if job_id:
        job_store.push_progress(job_id, "migrator_reporter", "Creating migration report", 95)
    state["status"] = "complete"
    return state
