from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import TestResult
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    state["test_results"] = invoke_structured_llm_with_retry(
        "validator_tester",
        TestResult,
        f"Validate the generated workflow for: {state.get('workflow_description', '')}",
        retries=2,
    )
    return state
