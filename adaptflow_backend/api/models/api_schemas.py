from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

from models.schemas import (
    BottleneckReport,
    GeneratedCodeFiles,
    MigrationReport,
    Opportunity,
    TestResult,
    WorkflowBlueprint,
)


class RunRequest(BaseModel):
    workflow_description: str = Field(..., min_length=10)
    max_retries: int = Field(default=3, ge=0, le=10)


class RunResponse(BaseModel):
    job_id: str
    status: str
    created_at: datetime


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    current_stage: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class JobResultResponse(BaseModel):
    job_id: str
    status: str
    current_stage: Optional[str] = None
    bottleneck_report: Optional[BottleneckReport] = None
    opportunities: Optional[List[Opportunity]] = None
    blueprint: Optional[WorkflowBlueprint] = None
    generated_code: Optional[GeneratedCodeFiles] = None
    test_results: Optional[TestResult] = None
    migration_report: Optional[MigrationReport] = None
    workflow_logs: Optional[str] = None
    errors: List[str] = Field(default_factory=list)


class ProgressEvent(BaseModel):
    stage: str
    message: str
    percent: Optional[int] = None


class SessionCreateRequest(BaseModel):
    inputType: Literal["text", "file", "example"]
    content: str
    exampleId: Optional[str] = None


class ParsedData(BaseModel):
    actors: List[str]
    steps: List[str]
    dependencies: List[str]
    painPoints: List[str]


class Impact(BaseModel):
    manualEffortBefore: float
    manualEffortAfter: float
    responseSpeedBefore: float
    responseSpeedAfter: float
    overallConfidence: float


class WorkflowNode(BaseModel):
    id: str
    label: str
    type: str
    status: str
    position: Optional[dict] = None


class WorkflowEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None


class WorkflowGraph(BaseModel):
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]


class AuditTrailEntry(BaseModel):
    timestamp: str
    event: str


class SessionResponse(BaseModel):
    sessionId: str
    status: Literal["parsing", "diagnosing", "migrating", "ready", "approved", "rejected"]
    parsed: ParsedData
    before: WorkflowGraph
    after: WorkflowGraph
    impact: Impact
    auditTrail: List[AuditTrailEntry]

    # Backward-compatible extras
    workflowName: Optional[str] = None
    stage: Optional[str] = None
    inputType: Optional[str] = None
    content: Optional[str] = None
    exampleId: Optional[str] = None
    graphs: Optional[dict] = None
    metrics: Optional[dict] = None
    confidenceScore: Optional[float] = None
    decision: Optional[str] = None
    jobId: Optional[str] = None
    progressPercent: Optional[int] = None


class DecisionRequest(BaseModel):
    action: Literal["approve", "adjust", "reject"]
    adjustments: Optional[List[dict]] = None


class DecisionResponse(BaseModel):
    status: Literal["ok"]
    auditEntryId: Optional[str] = None
