# AdaptFlow — Master Specification (Core Logic + FastAPI Backend)

**Version:** 2.0 (incorporates fixes found during testing of v1.0)
**Purpose:** A single, complete spec for building AdaptFlow — a multi-agent system that analyzes a user's workflow, researches automation opportunities, designs a new architecture, generates runnable code, validates it in a sandbox, and produces a migration report — served over a FastAPI backend.

> **Note to implementer:** This spec has already been built once and tested end-to-end. Several bugs were found and fixed during that process. This version bakes those fixes directly into the spec so they aren't reintroduced. Do not deviate from the exact library APIs, model names, and settings specified below — they were verified against real package versions, not assumed.

---

## 1. System Overview

```
User Request
     │
     ▼
┌─────────────┐
│ Supervisor   │◄────────────────────────────┐
│ (LangGraph)  │                              │
└─────┬────────┘                              │
      ▼                                       │
┌─────────────────┐                           │
│ Workflow Analyzer │                          │
└─────┬────────────┘                          │
      ▼                                       │
┌─────────────────┐                           │
│ Opportunity Scout │                          │
└─────┬────────────┘                          │
      ▼                                       │
┌──────────────────────┐                      │
│ Automation Architect   │                     │
└─────┬────────────────┘                      │
      ▼                                       │
┌─────────────────┐                           │
│ Code Generator     │                         │
└─────┬────────────┘                          │
      ▼                                       │
┌─────────────────────┐     fail (loop back)   │
│ Validator & Tester    │──────────────────────┘
└─────┬────────────────┘
      │ pass (or max retries reached)
      ▼
┌────────────────────┐
│ Migrator / Reporter  │
└─────┬───────────────┘
      ▼
  Final Deliverable

FastAPI wraps this entire graph as a job-based HTTP API (Section 10+).
```

---

## 2. Tech Stack — Verified Choices

| Layer | Choice | Critical notes (from testing) |
|---|---|---|
| Orchestration | **LangGraph** | `langgraph>=1.2` |
| LLM Provider | **Groq** for all agents by default | See Section 3 for exact model per agent — **do not use one model for everything** |
| Backend framework | **FastAPI** | Wraps the LangGraph pipeline; job-based (async), not blocking |
| Web search | **`ddgs`** (NOT `duckduckgo_search` — that package is renamed/deprecated) | `pip install ddgs`; import as `from ddgs import DDGS` |
| Browser automation | **Playwright** | Requires `playwright install` after pip install. Wrap in try/except with a `requests`-based fallback — some sites (HTTP/2-only, slow JS) will fail or time out (30s default) |
| Code execution sandbox | **E2B** (`e2b-code-interpreter` v2.x) | **Use the current `Sandbox` class, NOT the deprecated `CodeInterpreter` class.** See Section 6.3 for exact API. |
| Memory / Vector store | **Chroma** with a JSON fallback if Chroma init fails | |
| Validation | **Pydantic v2** | |

---

## 3. LLM Model Assignment Per Agent (Important — tested findings)

Different agents have different needs. Using one model for everything caused real failures during testing. Use this exact assignment:

| Agent | Model | Why |
|---|---|---|
| Workflow Analyzer | `llama-3.3-70b-versatile` | Fast extraction task, this model is reliable and fast for it |
| Opportunity Scout | `llama-3.3-70b-versatile` | Same — structured extraction over search results, works well |
| Automation Architect | `llama-3.3-70b-versatile` | Works well for structured design output |
| **Code Generator** | **`openai/gpt-oss-120b`** | `llama-3.3-70b-versatile` was tested and **reliably hallucinated non-existent imports** (e.g. `from langchain import LangChain`) even after 3 retries with error feedback. Switching to `openai/gpt-oss-120b` produced correct, working code. **This is a mandatory swap, not optional.** |
| Validator & Tester | `llama-3.3-70b-versatile` | Only parses sandbox output into structured `TestResult`, doesn't need heavy reasoning |
| Migrator / Reporter | `llama-3.3-70b-versatile` | Report writing, fine on the faster model |

**Critical follow-up issue with `openai/gpt-oss-120b` for Code Generator:** it generates comprehensive, high-quality code — often 7+ files with full docstrings — which can **exceed the default max_tokens for the structured tool-call response**, causing the JSON to truncate mid-string and fail to parse (`"Failed to parse tool call arguments as JSON"`). **You must handle this:**

1. Set `max_tokens` (or `max_completion_tokens`) explicitly high for the Code Generator's LLM call — **at least 8000-12000 tokens**, not the library default.
2. In the Code Generator's system prompt, explicitly instruct the model to **keep docstrings brief (1-2 lines) and avoid excessive inline comments** — favor completeness of working code over exhaustive documentation, since the entire response must fit in one structured JSON tool call.
3. If truncation still occurs after raising `max_tokens`, catch the `JSONDecodeError`/`400 tool_use_failed` error specifically (not just generic exceptions) and retry with an explicit instruction appended: *"Your previous response was too long and got truncated. Generate fewer files, or shorter docstrings, so the entire response fits within the token limit."*

**Rate limiting note:** `openai/gpt-oss-120b` hit a `429 Too Many Requests` during testing after several rapid retries (its free-tier rate limit appears stricter than `llama-3.3-70b-versatile`'s). Implement exponential backoff with a **capped** number of retries (do not let the SDK's default retry-with-sleep loop run indefinitely — cap total wait time, e.g. max 60 seconds total across retries, then fail gracefully into the normal `TestIssue`/error-reporting path rather than hanging).

**Optional override:** keep the `USE_CLAUDE_FOR_ARCHITECT` / `USE_CLAUDE_FOR_CODE_GEN` env flags as an escape hatch to swap to Claude if Groq's code quality regresses in the future, but `openai/gpt-oss-120b` is the default and was confirmed working.

---

## 4. Project Structure

```
adaptflow/
├── requirements.txt
├── .env.example
├── config/
│   ├── settings.py
│   └── prompts/
│       ├── workflow_analyzer.md
│       ├── opportunity_scout.md
│       ├── automation_architect.md
│       ├── code_generator.md          # must include the "keep docstrings brief" instruction from Section 3
│       ├── validator_tester.md
│       └── migrator_reporter.md
├── models/
│   └── schemas.py
├── graph/
│   ├── state.py
│   └── build_graph.py
├── tools/
│   ├── __init__.py
│   ├── web_search_tool.py             # uses `ddgs`, not `duckduckgo_search`
│   ├── browser_tool.py                # Playwright + requests fallback
│   ├── code_sandbox_tool.py           # uses E2B `Sandbox` class — see Section 6.3
│   ├── vector_memory.py               # function signature: upsert(id, text, metadata) — see Section 6.2
│   └── api_connectors/
│       ├── __init__.py
│       ├── google_tool.py
│       ├── slack_tool.py
│       └── notion_tool.py
├── agents/
│   ├── __init__.py
│   ├── llm_helper.py                  # per-agent model selection (Section 3) + max_tokens override + capped retry/backoff
│   ├── workflow_analyzer.py
│   ├── opportunity_scout.py
│   ├── automation_architect.py
│   ├── code_generator.py
│   ├── validator_tester.py
│   └── migrator_reporter.py
├── tests/
│   └── test_agents.py                 # CLI test harness, --agent <name> or --agent all
└── api/
    ├── __init__.py
    ├── main.py
    ├── routers/
    │   ├── __init__.py
    │   ├── jobs.py
    │   └── health.py
    ├── models/
    │   └── api_schemas.py
    ├── services/
    │   └── job_runner.py
    └── job_store.py
```

---

## 5. Shared State & Pydantic Schemas

### 5.1 `graph/state.py`

```python
from typing import TypedDict, List, Optional
from models.schemas import (
    BottleneckReport, Opportunity, WorkflowBlueprint,
    GeneratedCodeFiles, TestResult, MigrationReport
)

class AdaptFlowState(TypedDict, total=False):
    workflow_description: str
    workflow_logs: Optional[str]

    bottleneck_report: Optional[BottleneckReport]
    opportunities: Optional[List[Opportunity]]
    blueprint: Optional[WorkflowBlueprint]
    generated_code: Optional[GeneratedCodeFiles]
    test_results: Optional[TestResult]
    migration_report: Optional[MigrationReport]

    retry_count: int
    max_retries: int
    current_stage: str
    errors: List[str]
    status: str  # "in_progress" | "needs_fix" | "complete" | "failed"
```

### 5.2 `models/schemas.py`

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class PainPoint(BaseModel):
    description: str
    severity: Literal["low", "medium", "high", "critical"]
    time_cost_estimate: Optional[str] = None

class BottleneckReport(BaseModel):
    summary: str
    pain_points: List[PainPoint]
    manual_steps_count: int
    affected_tools: List[str] = Field(default_factory=list)

class Opportunity(BaseModel):
    title: str
    description: str
    tool_or_api: str
    estimated_impact: Literal["low", "medium", "high"]
    source_url: Optional[str] = None
    confidence: float = Field(ge=0, le=1)

class AgentNode(BaseModel):
    name: str
    role: str
    tools: List[str]
    inputs: List[str]
    outputs: List[str]

class WorkflowBlueprint(BaseModel):
    architecture_summary: str
    agents: List[AgentNode]
    edges: List[tuple[str, str]]
    tech_stack: List[str]
    data_flow_notes: str

class GeneratedCodeFile(BaseModel):
    filename: str
    content: str
    language: str = "python"

class GeneratedCodeFiles(BaseModel):
    files: List[GeneratedCodeFile]
    entrypoint: str
    dependencies: List[str]

class TestIssue(BaseModel):
    file: str
    line: Optional[int] = None
    issue: str
    suggested_fix: Optional[str] = None

class TestResult(BaseModel):
    passed: bool
    issues: List[TestIssue] = Field(default_factory=list)
    execution_log: str

class MigrationReport(BaseModel):
    title: str
    before_summary: str
    after_summary: str
    steps_to_deploy: List[str]
    estimated_time_saved: Optional[str] = None
    risks_and_notes: List[str] = Field(default_factory=list)
```

---

## 6. Tools — Exact Implementations (fixes baked in)

### 6.1 `tools/web_search_tool.py`

Use `ddgs`, not `duckduckgo_search`:

```python
from ddgs import DDGS
from pydantic import BaseModel
from typing import List

class SearchResult(BaseModel):
    title: str
    snippet: str
    link: str

def search(query: str, k: int = 3) -> List[SearchResult]:
    try:
        with DDGS() as ddgs:
            raw_results = list(ddgs.text(query, max_results=k))
        return [
            SearchResult(title=r.get("title", ""), snippet=r.get("body", ""), link=r.get("href", ""))
            for r in raw_results
        ]
    except Exception as e:
        print(f"Error during search: {e}. Falling back to mock results.")
        return []
```

### 6.2 `tools/vector_memory.py`

**Function signature contract:** the module-level helper is `upsert(id: str, text: str, metadata: dict)`. Every caller (e.g. `opportunity_scout.py`) **must** call it with the keyword `id=`, not `doc_id=`. This mismatch caused a runtime crash during testing — enforce this consistently across every file that imports `vector_memory`.

```python
import os
import json
from typing import List, Dict, Any
from pydantic import BaseModel
from config.settings import CHROMA_PERSIST_DIR

class Document(BaseModel):
    id: str
    text: str
    metadata: Dict[str, Any]

class VectorMemory:
    def __init__(self):
        self.use_fallback = False
        self.fallback_file = os.path.join(CHROMA_PERSIST_DIR, "fallback_vector_db.json")
        os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)
        try:
            import chromadb
            self.client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)
            self.collection = self.client.get_or_create_collection(name="adaptflow_memory")
        except Exception as e:
            print(f"Failed to initialize Chroma DB ({e}). Falling back to JSON vector store.")
            self.use_fallback = True
            self.memory_db = []
            if os.path.exists(self.fallback_file):
                try:
                    with open(self.fallback_file, "r") as f:
                        self.memory_db = json.load(f)
                except Exception:
                    pass

    def upsert(self, id: str, text: str, metadata: Dict[str, Any]) -> None:
        # ... (Chroma path, with fallback to JSON on failure — see full impl pattern)
        pass

    def query(self, text: str, k: int = 3) -> List[Document]:
        # ... (Chroma path, with Jaccard-overlap JSON fallback)
        pass

_vector_memory_instance = None

def get_vector_memory():
    global _vector_memory_instance
    if _vector_memory_instance is None:
        _vector_memory_instance = VectorMemory()
    return _vector_memory_instance

def upsert(id: str, text: str, metadata: Dict[str, Any]) -> None:
    get_vector_memory().upsert(id, text, metadata)

def query(text: str, k: int = 3) -> List[Document]:
    return get_vector_memory().query(text, k=k)
```

> **Enforcement note for implementer:** grep the whole codebase for `.upsert(` after generation and confirm every call site uses `id=`, matching this signature exactly.

### 6.3 `tools/code_sandbox_tool.py` — Correct E2B API (critical fix)

The E2B Python SDK (`e2b-code-interpreter` v2.x) uses `Sandbox`, **not** the older `CodeInterpreter` class, and `sandbox.commands.run(...)`, **not** `sandbox.run_command(...)`. Using the old API causes an immediate `ImportError`.

```python
import os
from config.settings import E2B_API_KEY
from models.schemas import TestResult, TestIssue, GeneratedCodeFiles

def execute(files: GeneratedCodeFiles, timeout: int = 30) -> TestResult:
    if not E2B_API_KEY:
        error_msg = "E2B_API_KEY is not configured in environment settings."
        return TestResult(
            passed=False,
            issues=[TestIssue(file=files.entrypoint, issue=error_msg, suggested_fix="Set E2B_API_KEY in .env")],
            execution_log=error_msg
        )

    try:
        from e2b_code_interpreter import Sandbox  # correct class name

        with Sandbox.create(api_key=E2B_API_KEY) as sandbox:  # correct constructor
            log_parts = ["--- Uploading generated files to E2B sandbox ---"]
            for f in files.files:
                sandbox.files.write(f.filename, f.content)  # unchanged — still correct

            if files.dependencies:
                req_content = "\n".join(files.dependencies)
                sandbox.files.write("requirements.txt", req_content)
                install_res = sandbox.commands.run("pip install -r requirements.txt", timeout=60)  # .commands.run, not .run_command
                if install_res.exit_code != 0:
                    return TestResult(
                        passed=False,
                        issues=[TestIssue(file="requirements.txt", issue=f"Failed to install dependencies: {install_res.stderr}", suggested_fix="Verify dependency names")],
                        execution_log="\n".join(log_parts + [install_res.stdout, install_res.stderr])
                    )

            issues = []
            for f in files.files:
                if f.filename.endswith(".py"):
                    syntax_check = sandbox.commands.run(f"python -m py_compile {f.filename}")
                    if syntax_check.exit_code != 0:
                        issues.append(TestIssue(file=f.filename, issue=f"Syntax error: {syntax_check.stderr}", suggested_fix="Fix syntax error"))

            if issues:
                return TestResult(passed=False, issues=issues, execution_log="\n".join(log_parts))

            exec_res = sandbox.commands.run(f"python {files.entrypoint}", timeout=timeout)
            passed = exec_res.exit_code == 0
            if not passed:
                issues.append(TestIssue(
                    file=files.entrypoint,
                    issue=f"Execution failed with exit code {exec_res.exit_code}. Errors: {exec_res.stderr}",
                    suggested_fix="Debug runtime error shown in log."
                ))

            return TestResult(
                passed=passed,
                issues=issues,
                execution_log="\n".join(log_parts + [f"Exit Code: {exec_res.exit_code}", exec_res.stdout or "", exec_res.stderr or ""])
            )

    except Exception as e:
        error_log = f"E2B Sandbox execution failed: {str(e)}"
        return TestResult(
            passed=False,
            issues=[TestIssue(file=files.entrypoint, issue=error_log, suggested_fix="Check network connection, API key validity, or E2B service status.")],
            execution_log=error_log
        )
```

**Also verify:** `E2B_API_KEY` in `.env` must be a real key from https://e2b.dev/dashboard?tab=keys in the format `e2b_` followed by hex characters — a placeholder value produces a clear "Invalid API key format" error, not a silent failure, so this is easy to catch during setup testing.

### 6.4 `tools/browser_tool.py`

Must gracefully handle both timeouts and protocol errors (e.g. `net::ERR_HTTP2_PROTOCOL_ERROR` was observed on some sites during testing) by falling back to a plain `requests.get()`:

```python
import requests
from playwright.sync_api import sync_playwright

def fetch_rendered(url: str, timeout_ms: int = 15000) -> str:
    # NOTE: lowered default timeout from 30000 to 15000 based on testing —
    # 30s per failed page made multi-pain-point scouting slow. Adjust as needed.
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=timeout_ms)
            content = page.inner_text("body")
            browser.close()
            return content
    except Exception as e:
        print(f"Playwright browser execution failed/uninitialized ({e}). Falling back to requests.")
        try:
            resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
            return resp.text[:5000]
        except Exception as req_e:
            return f"[fetch failed: {req_e}]"
```

**Windows-specific note:** the first time Playwright makes an outbound connection, Windows Firewall may prompt to allow network access for Python. This must be accepted (not cancelled) or the request hangs indefinitely until manually interrupted. Not fixable in code — document this in setup instructions for the end user.

---

## 7. Agent Implementation Pattern

Each agent's `run(state) -> state` function follows this shape (example: Code Generator, showing the max_tokens + retry fixes from Section 3):

```python
# agents/code_generator.py
from agents.llm_helper import get_llm, invoke_structured_llm_with_retry
from models.schemas import GeneratedCodeFiles
from graph.state import AdaptFlowState
from pathlib import Path

PROMPTS_DIR = Path(__file__).resolve().parent.parent / "config" / "prompts"

def run(state: AdaptFlowState) -> AdaptFlowState:
    with open(PROMPTS_DIR / "code_generator.md", "r", encoding="utf-8") as f:
        system_prompt = f.read()

    blueprint = state.get("blueprint")
    human_prompt = f"Architecture Blueprint:\n{blueprint.model_dump_json(indent=2)}"

    # Use the dedicated code-gen model with a generous max_tokens (Section 3)
    llm = get_llm(model_override="openai/gpt-oss-120b", max_tokens=10000, temperature=0)

    try:
        result: GeneratedCodeFiles = invoke_structured_llm_with_retry(
            llm=llm,
            schema=GeneratedCodeFiles,
            system_prompt=system_prompt,
            human_prompt=human_prompt,
            max_retries=2,  # capped — do not let truncation retries loop indefinitely
        )
        state["generated_code"] = result
    except Exception as e:
        state["errors"] = state.get("errors", []) + [f"Code Generator failed: {str(e)}"]
        state["generated_code"] = None

    state["current_stage"] = "validator_tester"
    return state
```

`agents/llm_helper.py` must support a `max_tokens` override parameter and per-agent model selection, plus a capped retry/backoff (Section 3) instead of relying on the SDK's default retry behavior, which can sleep indefinitely on repeated 429s.

---

## 8. LangGraph Wiring (`graph/build_graph.py`)

```python
from langgraph.graph import StateGraph, END
from graph.state import AdaptFlowState
from agents import (
    workflow_analyzer, opportunity_scout, automation_architect,
    code_generator, validator_tester, migrator_reporter,
)

def route_after_validation(state: AdaptFlowState) -> str:
    if state.get("test_results") and state["test_results"].passed:
        return "migrator_reporter"
    if state.get("retry_count", 0) < state.get("max_retries", 3):
        return "code_generator"
    state["status"] = "needs_fix"
    return "migrator_reporter"

def build_graph():
    graph = StateGraph(AdaptFlowState)
    graph.add_node("workflow_analyzer", workflow_analyzer.run)
    graph.add_node("opportunity_scout", opportunity_scout.run)
    graph.add_node("automation_architect", automation_architect.run)
    graph.add_node("code_generator", code_generator.run)
    graph.add_node("validator_tester", validator_tester.run)
    graph.add_node("migrator_reporter", migrator_reporter.run)

    graph.set_entry_point("workflow_analyzer")
    graph.add_edge("workflow_analyzer", "opportunity_scout")
    graph.add_edge("opportunity_scout", "automation_architect")
    graph.add_edge("automation_architect", "code_generator")
    graph.add_edge("code_generator", "validator_tester")
    graph.add_conditional_edges(
        "validator_tester",
        route_after_validation,
        {"code_generator": "code_generator", "migrator_reporter": "migrator_reporter"},
    )
    graph.add_edge("migrator_reporter", END)
    return graph.compile()
```

---

## 9. Configuration

### 9.1 `.env.example`

```
# Groq Configuration (Required — default for all agents)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
GROQ_MODEL_CODE_GENERATOR=openai/gpt-oss-120b

# Anthropic Configuration (Optional override for deeper reasoning)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
USE_CLAUDE_FOR_ARCHITECT=false
USE_CLAUDE_FOR_CODE_GEN=false

# E2B Sandbox Configuration (Required for Validator & Tester)
# Must be a real key in the format "e2b_<hex>" from https://e2b.dev/dashboard?tab=keys
E2B_API_KEY=your_e2b_api_key_here

# API Connectors (Optional)
GOOGLE_API_CREDENTIALS=
SLACK_BOT_TOKEN=
NOTION_API_KEY=

# Chroma DB
CHROMA_PERSIST_DIR=./chroma_db

# Pipeline Configuration
MAX_RETRIES=3
CODE_GENERATOR_MAX_TOKENS=10000
```

### 9.2 `requirements.txt`

```
langgraph
langchain
langchain-groq
langchain-anthropic
langchain-community
playwright
chromadb
pydantic>=2
python-dotenv
e2b-code-interpreter
ddgs
ruff
fastapi
uvicorn[standard]
sse-starlette
aiohttp
```

> `duckduckgo_search` must NOT be in this list — it is deprecated and renamed to `ddgs`. If both are accidentally installed, uninstall `duckduckgo_search` to avoid the runtime deprecation warning.

**Post-install step (must be documented for the user):**
```
playwright install
```

---

## 10. FastAPI Backend Layer

### 10.1 Why job-based, not blocking

The full pipeline takes 1-5+ minutes (multiple LLM calls, web scraping with retries/fallbacks, sandbox execution with possible retry loops). A blocking `POST /run` will time out most clients. Use a job-based design: submit → poll/stream → fetch result.

### 10.2 `api/models/api_schemas.py`

```python
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from models.schemas import (
    BottleneckReport, Opportunity, WorkflowBlueprint,
    GeneratedCodeFiles, TestResult, MigrationReport
)

class RunRequest(BaseModel):
    workflow_description: str = Field(..., min_length=10)
    workflow_logs: Optional[str] = None
    max_retries: int = Field(default=3, ge=0, le=10)

class RunResponse(BaseModel):
    job_id: str
    status: Literal["queued"]
    created_at: datetime

class JobStatusResponse(BaseModel):
    job_id: str
    status: Literal["queued", "in_progress", "complete", "failed", "needs_fix"]
    current_stage: Optional[str] = None
    retry_count: int = 0
    errors: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

class JobResultResponse(BaseModel):
    job_id: str
    status: str
    bottleneck_report: Optional[BottleneckReport] = None
    opportunities: Optional[List[Opportunity]] = None
    blueprint: Optional[WorkflowBlueprint] = None
    generated_code: Optional[GeneratedCodeFiles] = None
    test_results: Optional[TestResult] = None
    migration_report: Optional[MigrationReport] = None
```

### 10.3 `api/job_store.py`

In-memory store for v1 (single-process). Flag for future Redis/Celery upgrade if scaling beyond one instance.

```python
from typing import Dict, Optional
from datetime import datetime, timezone
from threading import Lock
from graph.state import AdaptFlowState

class JobRecord:
    def __init__(self, job_id: str, state: AdaptFlowState):
        self.job_id = job_id
        self.state: AdaptFlowState = state
        self.status: str = "queued"
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = self.created_at

class JobStore:
    def __init__(self):
        self._jobs: Dict[str, JobRecord] = {}
        self._lock = Lock()

    def create(self, job_id: str, state: AdaptFlowState) -> JobRecord:
        with self._lock:
            record = JobRecord(job_id, state)
            self._jobs[job_id] = record
            return record

    def get(self, job_id: str) -> Optional[JobRecord]:
        return self._jobs.get(job_id)

    def update(self, job_id: str, **kwargs):
        with self._lock:
            record = self._jobs.get(job_id)
            if not record:
                return
            for k, v in kwargs.items():
                setattr(record, k, v)
            record.updated_at = datetime.now(timezone.utc)

job_store = JobStore()
```

### 10.4 `api/services/job_runner.py`

```python
import uuid
from fastapi import BackgroundTasks
from graph.build_graph import build_graph
from graph.state import AdaptFlowState
from api.job_store import job_store
from api.models.api_schemas import RunRequest

_compiled_graph = build_graph()

def submit_job(request: RunRequest, background_tasks: BackgroundTasks) -> str:
    job_id = str(uuid.uuid4())
    initial_state: AdaptFlowState = {
        "workflow_description": request.workflow_description,
        "workflow_logs": request.workflow_logs,
        "retry_count": 0,
        "max_retries": request.max_retries,
        "current_stage": "workflow_analyzer",
        "errors": [],
        "status": "in_progress",
    }
    job_store.create(job_id, initial_state)
    background_tasks.add_task(_run_pipeline, job_id, initial_state)
    return job_id

def _run_pipeline(job_id: str, initial_state: AdaptFlowState):
    job_store.update(job_id, status="in_progress")
    try:
        final_state = _compiled_graph.invoke(initial_state)
        final_status = final_state.get("status", "complete")
        job_store.update(job_id, state=final_state, status=final_status)
    except Exception as e:
        job_store.update(
            job_id, status="failed",
            state={**initial_state, "errors": initial_state.get("errors", []) + [str(e)]},
        )
```

### 10.5 `api/routers/jobs.py`

```python
from fastapi import APIRouter, BackgroundTasks, HTTPException
from api.models.api_schemas import RunRequest, RunResponse, JobStatusResponse, JobResultResponse
from api.services.job_runner import submit_job
from api.job_store import job_store

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("", response_model=RunResponse, status_code=202)
def create_job(request: RunRequest, background_tasks: BackgroundTasks):
    job_id = submit_job(request, background_tasks)
    record = job_store.get(job_id)
    return RunResponse(job_id=job_id, status="queued", created_at=record.created_at)

@router.get("/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    record = job_store.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(
        job_id=job_id,
        status=record.status,
        current_stage=record.state.get("current_stage"),
        retry_count=record.state.get("retry_count", 0),
        errors=record.state.get("errors", []),
        created_at=record.created_at,
        updated_at=record.updated_at,
    )

@router.get("/{job_id}/result", response_model=JobResultResponse)
def get_job_result(job_id: str):
    record = job_store.get(job_id)
    if not record:
        raise HTTPException(status_code=404, detail="Job not found")
    if record.status not in ("complete", "failed", "needs_fix"):
        raise HTTPException(status_code=409, detail="Job still in progress")
    s = record.state
    return JobResultResponse(
        job_id=job_id, status=record.status,
        bottleneck_report=s.get("bottleneck_report"),
        opportunities=s.get("opportunities"),
        blueprint=s.get("blueprint"),
        generated_code=s.get("generated_code"),
        test_results=s.get("test_results"),
        migration_report=s.get("migration_report"),
    )
```

### 10.6 `api/routers/health.py`

```python
from fastapi import APIRouter
import os

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    return {
        "status": "ok",
        "groq_configured": bool(os.environ.get("GROQ_API_KEY")),
        "e2b_configured": bool(os.environ.get("E2B_API_KEY")),
    }
```

### 10.7 `api/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi import Request
from api.routers import jobs, health
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="AdaptFlow API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

app.include_router(jobs.router)
app.include_router(health.router)
```

**Run:**
```
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```
Interactive docs at `http://localhost:8000/docs`.

---

## 11. Testing Checklist (in order — confirmed working sequence)

1. `python tests/test_agents.py --agent analyzer` — should return a valid `BottleneckReport`
2. `python tests/test_agents.py --agent scout` — should return `Opportunity` list; expect DDGS + Playwright fallback warnings, that's normal, not a failure
3. `python tests/test_agents.py --agent architect` — should return a `WorkflowBlueprint`
4. `python tests/test_agents.py --agent generator` — should return `GeneratedCodeFiles` with **no hallucinated imports** (confirms `openai/gpt-oss-120b` is correctly wired for this agent)
5. `python tests/test_agents.py --agent validator` — requires a real `E2B_API_KEY`; should connect and execute without SDK errors
6. `python tests/test_agents.py --agent all` — full pipeline; watch for the retry loop working correctly and a final status of `complete` (not stuck at `needs_fix` due to repeated Code Generator failures)
7. `uvicorn api.main:app --reload` then test via `http://localhost:8000/docs` — submit a job, poll status, fetch result

---

## 12. Build Order

1. `models/schemas.py`
2. `graph/state.py` + `graph/build_graph.py` (stub nodes first)
3. `config/settings.py` + `.env.example` — include per-agent model config from Section 3
4. `config/prompts/*.md` — Code Generator's prompt must include the "keep docstrings brief" instruction
5. `tools/*.py` — implement exactly per Section 6 (correct E2B API, `ddgs`, consistent `vector_memory` signature)
6. `agents/llm_helper.py` — per-agent model selection, `max_tokens` override, capped retry/backoff
7. `agents/*.py` — one at a time, test each in isolation via `tests/test_agents.py --agent <name>` before moving to the next
8. `tests/test_agents.py --agent all` — confirm full pipeline works, including the retry loop
9. `api/` — only after step 8 passes; wraps the already-tested graph, does not modify it
10. Test the API via `/docs`
