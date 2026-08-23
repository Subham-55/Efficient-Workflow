from __future__ import annotations

from datetime import datetime, timezone
from threading import Lock
from typing import Dict, List, Optional
from uuid import uuid4

from api.models.api_schemas import (
    AuditTrailEntry,
    DecisionRequest,
    DecisionResponse,
    Impact,
    ParsedData,
    SessionCreateRequest,
    SessionResponse,
    WorkflowEdge,
    WorkflowGraph,
    WorkflowNode,
)


class SessionRecord:
    def __init__(self, request: SessionCreateRequest, session_id: str) -> None:
        self.session_id = session_id
        self.input_type = request.inputType
        self.content = request.content
        self.example_id = request.exampleId
        self.workflow_name = self._workflow_name()
        self.status = "parsing"
        self.stage = "parse"
        self.created_at = datetime.now(timezone.utc)
        self.updated_at = self.created_at
        self.graphs = self._build_graphs()
        self.parsed = self._build_parsed()
        self.impact = Impact(
            manualEffortBefore=90,
            manualEffortAfter=30,
            responseSpeedBefore=35,
            responseSpeedAfter=85,
            overallConfidence=0.82,
        )
        self.confidence_score = 0.82
        self.audit_trail = [
            AuditTrailEntry(timestamp=self.created_at.isoformat(), event="Session created")
        ]
        self.decision = None
        self.job_id = None
        self.progress_percent = None

    def _workflow_name(self) -> str:
        if self.example_id == "lead-routing":
            return "Lead Routing"
        if self.example_id == "hr-onboarding":
            return "HR Onboarding"
        return "Support Ticket Triage" if "triage" in (self.content or "").lower() else "Workflow Analysis"

    def _build_parsed(self) -> ParsedData:
        content = (self.content or "").lower()
        if "triage" in content:
            return ParsedData(
                actors=["Support Agent", "Team Lead", "Customer"],
                steps=[
                    "Customer submits ticket",
                    "Manual triage by Support Agent",
                    "Escalation to Team Lead if complex",
                    "Team Lead assigns to agent",
                    "Agent responds to customer",
                    "Customer confirms resolution",
                ],
                dependencies=[
                    "triage → escalate",
                    "triage → respond",
                    "escalate → assign",
                    "assign → respond",
                    "respond → confirm",
                ],
                painPoints=[
                    "Manual triage step — average delay 4.2 hrs, no prioritization logic",
                    "No auto-categorization — high-volume tickets queue behind complex ones",
                    "Team Lead is single point of failure for escalations",
                ],
            )
        if "lead" in content:
            return ParsedData(
                actors=["Marketing Manager", "Sales Rep", "Lead"],
                steps=["Lead fills form", "Marketing reviews lead manually", "Lead assigned to Sales Rep", "Sales Rep calls lead", "Follow-up scheduled"],
                dependencies=["form → review", "review → assign", "assign → call", "call → followup"],
                painPoints=[
                    "Marketing manually reviews every lead — 48hr avg response",
                    "No scoring — hot leads wait alongside cold leads",
                    "Assignment based on territory availability, not skill match",
                ],
            )
        if "hr" in content or "onboard" in content:
            return ParsedData(
                actors=["Employee", "Manager", "HR", "Finance"],
                steps=["Employee submits request", "Manager approves", "HR reviews", "Finance processes", "Employee notified"],
                dependencies=["request → manager", "manager → hr", "hr → finance", "finance → notify"],
                painPoints=[
                    "HR bottleneck — avg 3-day delay on approvals",
                    "No parallel processing — sequential handoffs",
                    "No auto-escalation for urgent requests",
                ],
            )
        return ParsedData(
            actors=["User", "System"],
            steps=["User submits workflow", "System processes workflow", "System returns results"],
            dependencies=["submit → process", "process → return"],
            painPoints=["Manual workflow detected — automation recommended"],
        )

    def _build_graphs(self) -> Dict[str, WorkflowGraph]:
        before_nodes = [
            WorkflowNode(id="n1", label="Collect ticket", type="step", status="healthy"),
            WorkflowNode(id="n2", label="Assign owner", type="step", status="critical"),
            WorkflowNode(id="n3", label="Draft response", type="step", status="inefficient"),
        ]
        before_edges = [
            WorkflowEdge(id="e1", source="n1", target="n2", label="handoff"),
            WorkflowEdge(id="e2", source="n2", target="n3", label="manual review"),
        ]
        after_nodes = [
            WorkflowNode(id="a1", label="Classifier Agent", type="agent", status="healthy"),
            WorkflowNode(id="a2", label="Router Decision", type="agent", status="healthy"),
            WorkflowNode(id="a3", label="Auto-Draft Agent", type="agent", status="healthy"),
            WorkflowNode(id="a4", label="Human Review Gate", type="humanGate", status="healthy"),
        ]
        after_edges = [
            WorkflowEdge(id="ae1", source="a1", target="a2", label="confidence > 0.7"),
            WorkflowEdge(id="ae2", source="a2", target="a3", label="route to automation"),
            WorkflowEdge(id="ae3", source="a2", target="a4", label="needs human review"),
        ]
        return {
            "before": WorkflowGraph(nodes=before_nodes, edges=before_edges),
            "after": WorkflowGraph(nodes=after_nodes, edges=after_edges),
        }

    def to_response(self) -> SessionResponse:
        return SessionResponse(
            sessionId=self.session_id,
            status=self.status,
            parsed=self.parsed,
            before=self.graphs["before"],
            after=self.graphs["after"],
            impact=self.impact,
            auditTrail=self.audit_trail,
            workflowName=self.workflow_name,
            stage=self.stage,
            inputType=self.input_type,
            content=self.content,
            exampleId=self.example_id,
            graphs=self.graphs,
            metrics={
                "manualEffortBefore": self.impact.manualEffortBefore,
                "manualEffortAfter": self.impact.manualEffortAfter,
                "responseSpeedBefore": self.impact.responseSpeedBefore,
                "responseSpeedAfter": self.impact.responseSpeedAfter,
            },
            confidenceScore=self.confidence_score,
            decision=self.decision,
            jobId=getattr(self, 'job_id', None),
        )

    def sync_from_job(self, job_state, progress_percent=None):
        self.status = job_state.get('status', self.status)
        self.stage = job_state.get('current_stage', self.stage)
        self.audit_trail = [AuditTrailEntry(timestamp=datetime.now(timezone.utc).isoformat(), event=f'Stage: {self.stage}')]
        if progress_percent is not None:
            self.progress_percent = progress_percent

    def update(self, **kwargs):
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)


class SessionStore:
    def __init__(self) -> None:
        self._store: Dict[str, SessionRecord] = {}
        self._lock = Lock()

    def create(self, request: SessionCreateRequest, job_id=None) -> SessionResponse:
        with self._lock:
            session_id = str(uuid4())
            record = SessionRecord(request, session_id)
            record.job_id = job_id
            self._store[session_id] = record
            return record.to_response()

    def get(self, session_id: str) -> Optional[SessionResponse]:
        with self._lock:
            record = self._store.get(session_id)
            return None if record is None else record.to_response()

    def apply_decision(self, session_id: str, decision: DecisionRequest) -> Optional[DecisionResponse]:
        with self._lock:
            record = self._store.get(session_id)
            if record is None:
                return None
            record.status = "approved" if decision.action == "approve" else decision.action
            record.stage = "visualize"
            record.decision = decision.action
            audit_entry = AuditTrailEntry(
                timestamp=datetime.now(timezone.utc).isoformat(),
                event=f"Decision: {decision.action}",
            )
            record.audit_trail.append(audit_entry)
            return DecisionResponse(status="ok", auditEntryId=audit_entry.event)


session_store = SessionStore()
