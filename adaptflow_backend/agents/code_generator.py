from graph.state import AdaptFlowState
from api.job_store import job_store
from models.schemas import GeneratedCodeFiles
from agents.llm_helper import invoke_structured_llm_with_retry


def run(state: AdaptFlowState) -> AdaptFlowState:
    prompt = f"Generate code for: {state.get('workflow_description', '')}. Keep docstrings brief and avoid verbose comments."
    state["generated_code"] = invoke_structured_llm_with_retry(
        "code_generator",
        GeneratedCodeFiles,
        prompt,
        retries=3,
        max_tokens=10000,
    )
    return state
