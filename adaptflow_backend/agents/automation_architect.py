from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import WorkflowBlueprint
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    prompt = f"Design an agent workflow for: {state.get('workflow_description', '')}"
    state["blueprint"] = invoke_structured_llm_with_retry(
        "automation_architect",
        WorkflowBlueprint,
        prompt,
        retries=2,
    )
    return state
