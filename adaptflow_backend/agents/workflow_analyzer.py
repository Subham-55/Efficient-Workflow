from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import BottleneckReport
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    prompt = f"Analyze the workflow: {state.get('workflow_description', '')}"
    state["bottleneck_report"] = invoke_structured_llm_with_retry(
        "workflow_analyzer",
        BottleneckReport,
        prompt,
        retries=2,
    )
    state["current_stage"] = "analyze"
    job_id = state.get("job_id")
    if job_id:
        job_store.push_progress(job_id, "workflow_analyzer", "Analyzing workflow bottlenecks", 25)
    state["status"] = "in_progress"
    return state
