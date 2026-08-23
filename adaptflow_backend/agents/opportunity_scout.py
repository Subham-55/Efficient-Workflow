from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import Opportunity
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    prompt = f"Find automation opportunities in: {state.get('workflow_description', '')}"
    state["opportunities"] = [
        invoke_structured_llm_with_retry(
            "opportunity_scout",
            Opportunity,
            prompt,
            retries=2,
        )
    ]
    return state
