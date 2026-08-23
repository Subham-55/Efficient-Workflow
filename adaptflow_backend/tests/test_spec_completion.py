from pathlib import Path

from graph.build_graph import build_graph
from tools.vector_memory import query, upsert


def test_vector_memory_round_trip(tmp_path, monkeypatch):
    monkeypatch.setattr("tools.vector_memory.CHROMA_PERSIST_DIR", str(tmp_path / "db"))
    upsert(id="doc-1", text="hello adaptflow", metadata={"source": "test"})
    results = query("adaptflow", k=3)
    assert any(item.id == "doc-1" for item in results)


def test_prompt_files_exist():
    prompts_dir = Path("config/prompts")
    expected = [
        "workflow_analyzer.md",
        "opportunity_scout.md",
        "automation_architect.md",
        "code_generator.md",
        "validator_tester.md",
        "migrator_reporter.md",
    ]
    for name in expected:
        assert (prompts_dir / name).exists(), f"missing prompt file: {name}"


def test_graph_builds_and_runs():
    graph = build_graph()
    state = {
        "workflow_description": "Support ticket triage with manual handoffs",
        "workflow_logs": "",
        "retry_count": 0,
        "max_retries": 3,
        "current_stage": "queued",
        "errors": [],
        "status": "in_progress",
    }
    result = graph.invoke(state)
    assert result["status"] == "complete"
