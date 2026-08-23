from typing import List, Literal, Optional

from pydantic import BaseModel, Field


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
