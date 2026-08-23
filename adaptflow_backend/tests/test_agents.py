import argparse
import importlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


AGENTS = {
    "analyzer": "agents.workflow_analyzer",
    "scout": "agents.opportunity_scout",
    "architect": "agents.automation_architect",
    "generator": "agents.code_generator",
    "validator": "agents.validator_tester",
    "reporter": "agents.migrator_reporter",
}


def run_agent(name: str):
    module = importlib.import_module(AGENTS[name])
    state = {
        "workflow_description": "Support ticket triage with manual handoffs",
        "workflow_logs": "",
        "retry_count": 0,
        "max_retries": 3,
        "current_stage": "queued",
        "errors": [],
        "status": "in_progress",
    }
    result = module.run(state)
    print(name, "->", result["status"])
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--agent", choices=[*AGENTS.keys(), "all"])
    args = parser.parse_args()

    if args.agent == "all":
        for name in AGENTS:
            run_agent(name)
    else:
        run_agent(args.agent)
