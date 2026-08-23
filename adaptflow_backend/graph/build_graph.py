from typing import Any

from langgraph.graph import END, StateGraph

from agents import (
    automation_architect,
    code_generator,
    migrator_reporter,
    opportunity_scout,
    supervisor,
    validator_tester,
    workflow_analyzer,
)
from graph.state import AdaptFlowState


def build_graph():
    workflow = StateGraph(AdaptFlowState)
    workflow.add_node("supervisor", supervisor.run)
    workflow.add_node("workflow_analyzer", workflow_analyzer.run)
    workflow.add_node("opportunity_scout", opportunity_scout.run)
    workflow.add_node("automation_architect", automation_architect.run)
    workflow.add_node("code_generator", code_generator.run)
    workflow.add_node("validator_tester", validator_tester.run)
    workflow.add_node("migrator_reporter", migrator_reporter.run)

    workflow.add_edge("supervisor", "workflow_analyzer")
    workflow.add_edge("workflow_analyzer", "opportunity_scout")
    workflow.add_edge("opportunity_scout", "automation_architect")
    workflow.add_edge("automation_architect", "code_generator")
    workflow.add_edge("code_generator", "validator_tester")
    workflow.add_edge("validator_tester", "migrator_reporter")
    workflow.add_edge("migrator_reporter", END)
    workflow.set_entry_point("supervisor")

    return workflow.compile()
