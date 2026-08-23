import type { SessionResponse } from "./schemas";
import { SessionResponseSchema } from "./schemas";

export const mockSessionSupportTriage: SessionResponse = SessionResponseSchema.parse({
  sessionId: "mock-session-001",
  status: "ready",
  parsed: {
    actors: ["Support Agent", "Team Lead", "Customer"],
    steps: [
      "Customer submits ticket",
      "Manual triage by Support Agent",
      "Escalation to Team Lead if complex",
      "Team Lead assigns to agent",
      "Agent responds to customer",
      "Customer confirms resolution",
    ],
    dependencies: [
      "triage → escalate",
      "triage → respond",
      "escalate → assign",
      "assign → respond",
      "respond → confirm",
    ],
    painPoints: [
      "Manual triage step — average delay 4.2 hrs, no prioritization logic",
      "No auto-categorization — high-volume tickets queue behind complex ones",
      "Team Lead is single point of failure for escalations",
    ],
  },
  before: {
    nodes: [
      { id: "n1", type: "step", label: "Ticket Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "n2", type: "step", label: "Manual Triage", status: "critical", description: "Average delay 4.2 hrs, no prioritization logic", position: { x: 250, y: 100 } },
      { id: "n3", type: "step", label: "Escalate?", status: "inefficient", position: { x: 450, y: 200 } },
      { id: "n4", type: "step", label: "Team Lead Assigns", status: "inefficient", position: { x: 450, y: 300 } },
      { id: "n5", type: "step", label: "Agent Responds", status: "inefficient", position: { x: 250, y: 400 } },
      { id: "n6", type: "step", label: "Confirm Resolution", status: "healthy", position: { x: 250, y: 500 } },
    ],
    edges: [
      { id: "e1", source: "n1", target: "n2" },
      { id: "e2", source: "n2", target: "n3", label: "if complex" },
      { id: "e3", source: "n2", target: "n5", label: "if simple" },
      { id: "e4", source: "n3", target: "n4" },
      { id: "e5", source: "n4", target: "n5" },
      { id: "e6", source: "n5", target: "n6" },
    ],
  },
  after: {
    nodes: [
      { id: "a1", type: "step", label: "Ticket Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "a2", type: "agent", label: "Classifier Agent", confidence: 0.92, position: { x: 250, y: 100 } },
      { id: "a3", type: "agent", label: "Router (LangGraph)", confidence: 0.95, position: { x: 450, y: 200 } },
      { id: "a4", type: "humanGate", label: "Human Review Gate", confidence: 0.85, position: { x: 650, y: 300 } },
      { id: "a5", type: "agent", label: "Auto-Draft Response", confidence: 0.88, position: { x: 450, y: 400 } },
      { id: "a6", type: "step", label: "Confirm Resolution", status: "healthy", position: { x: 250, y: 500 } },
    ],
    edges: [
      { id: "ae1", source: "a1", target: "a2" },
      { id: "ae2", source: "a2", target: "a3", label: "priority score" },
      { id: "ae3", source: "a3", target: "a4", label: "if confidence < 0.7" },
      { id: "ae4", source: "a3", target: "a5", label: "if confidence ≥ 0.7" },
      { id: "ae5", source: "a4", target: "a5" },
      { id: "ae6", source: "a5", target: "a6" },
    ],
  },
  impact: {
    manualEffortBefore: 90,
    manualEffortAfter: 30,
    responseSpeedBefore: 35,
    responseSpeedAfter: 85,
    overallConfidence: 0.88,
  },
  auditTrail: [
    { timestamp: "2026-07-16T10:00:00Z", event: "Session created" },
    { timestamp: "2026-07-16T10:00:05Z", event: "Parse completed" },
    { timestamp: "2026-07-16T10:00:12Z", event: "Diagnosis generated" },
    { timestamp: "2026-07-16T10:00:20Z", event: "Migration plan generated" },
  ],
});

export const mockSessionLeadRouting: SessionResponse = SessionResponseSchema.parse({
  sessionId: "mock-session-002",
  status: "ready",
  parsed: {
    actors: ["Marketing Manager", "Sales Rep", "Lead"],
    steps: [
      "Lead fills form",
      "Marketing reviews lead manually",
      "Lead assigned to Sales Rep",
      "Sales Rep calls lead",
      "Follow-up scheduled",
    ],
    dependencies: ["form → review", "review → assign", "assign → call", "call → followup"],
    painPoints: [
      "Marketing manually reviews every lead — 48hr avg response",
      "No scoring — hot leads wait alongside cold leads",
      "Assignment based on territory availability, not skill match",
    ],
  },
  before: {
    nodes: [
      { id: "ln1", type: "step", label: "Lead Form Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "ln2", type: "step", label: "Manual Review", status: "critical", position: { x: 250, y: 120 } },
      { id: "ln3", type: "step", label: "Assign to Rep", status: "inefficient", position: { x: 250, y: 240 } },
      { id: "ln4", type: "step", label: "Sales Call", status: "healthy", position: { x: 250, y: 360 } },
      { id: "ln5", type: "step", label: "Follow-up", status: "healthy", position: { x: 250, y: 480 } },
    ],
    edges: [
      { id: "le1", source: "ln1", target: "ln2" },
      { id: "le2", source: "ln2", target: "ln3" },
      { id: "le3", source: "ln3", target: "ln4" },
      { id: "le4", source: "ln4", target: "ln5" },
    ],
  },
  after: {
    nodes: [
      { id: "la1", type: "step", label: "Lead Form Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "la2", type: "agent", label: "Lead Scorer Agent", confidence: 0.9, position: { x: 250, y: 120 } },
      { id: "la3", type: "agent", label: "Router Agent", confidence: 0.93, position: { x: 450, y: 240 } },
      { id: "la4", type: "humanGate", label: "High-Value Review", confidence: 0.8, position: { x: 650, y: 240 } },
      { id: "la5", type: "agent", label: "Outreach Agent", confidence: 0.91, position: { x: 450, y: 360 } },
      { id: "la6", type: "step", label: "Follow-up Scheduled", status: "healthy", position: { x: 250, y: 480 } },
    ],
    edges: [
      { id: "lae1", source: "la1", target: "la2" },
      { id: "lae2", source: "la2", target: "la3", label: "score > 80" },
      { id: "lae3", source: "la3", target: "la4", label: "if enterprise" },
      { id: "lae4", source: "la3", target: "la5", label: "if smb" },
      { id: "lae5", source: "la4", target: "la5" },
      { id: "lae6", source: "la5", target: "la6" },
    ],
  },
  impact: {
    manualEffortBefore: 75,
    manualEffortAfter: 25,
    responseSpeedBefore: 40,
    responseSpeedAfter: 90,
    overallConfidence: 0.91,
  },
  auditTrail: [
    { timestamp: "2026-07-16T11:00:00Z", event: "Session created" },
    { timestamp: "2026-07-16T11:00:04Z", event: "Parse completed" },
    { timestamp: "2026-07-16T11:00:10Z", event: "Diagnosis generated" },
    { timestamp: "2026-07-16T11:00:18Z", event: "Migration plan generated" },
  ],
});

export const mockSessionHRApproval: SessionResponse = SessionResponseSchema.parse({
  sessionId: "mock-session-003",
  status: "ready",
  parsed: {
    actors: ["Employee", "Manager", "HR", "Finance"],
    steps: [
      "Employee submits request",
      "Manager approves",
      "HR reviews",
      "Finance processes",
      "Employee notified",
    ],
    dependencies: ["request → manager", "manager → hr", "hr → finance", "finance → notify"],
    painPoints: [
      "HR bottleneck — avg 3-day delay on approvals",
      "No parallel processing — sequential handoffs",
      "No auto-escalation for urgent requests",
    ],
  },
  before: {
    nodes: [
      { id: "hn1", type: "step", label: "Request Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "hn2", type: "step", label: "Manager Approval", status: "inefficient", position: { x: 250, y: 100 } },
      { id: "hn3", type: "step", label: "HR Review", status: "critical", position: { x: 250, y: 200 } },
      { id: "hn4", type: "step", label: "Finance Process", status: "inefficient", position: { x: 250, y: 300 } },
      { id: "hn5", type: "step", label: "Notify Employee", status: "healthy", position: { x: 250, y: 400 } },
    ],
    edges: [
      { id: "he1", source: "hn1", target: "hn2" },
      { id: "he2", source: "hn2", target: "hn3" },
      { id: "he3", source: "hn3", target: "hn4" },
      { id: "he4", source: "hn4", target: "hn5" },
    ],
  },
  after: {
    nodes: [
      { id: "ha1", type: "step", label: "Request Submitted", status: "healthy", position: { x: 250, y: 0 } },
      { id: "ha2", type: "agent", label: "Auto-Validator Agent", confidence: 0.94, position: { x: 250, y: 100 } },
      { id: "ha3", type: "humanGate", label: "Manager Gate", confidence: 0.87, position: { x: 450, y: 100 } },
      { id: "ha4", type: "agent", label: "HR Classifier", confidence: 0.89, position: { x: 450, y: 200 } },
      { id: "ha5", type: "humanGate", label: "Finance Gate", confidence: 0.82, position: { x: 650, y: 300 } },
      { id: "ha6", type: "agent", label: "Notification Agent", confidence: 0.96, position: { x: 250, y: 400 } },
    ],
    edges: [
      { id: "hae1", source: "ha1", target: "ha2" },
      { id: "hae2", source: "ha2", target: "ha3", label: "if valid" },
      { id: "hae3", source: "ha3", target: "ha4" },
      { id: "hae4", source: "ha4", target: "ha5", label: "if > $500" },
      { id: "hae5", source: "ha4", target: "ha6", label: "if ≤ $500" },
      { id: "hae6", source: "ha5", target: "ha6" },
    ],
  },
  impact: {
    manualEffortBefore: 80,
    manualEffortAfter: 20,
    responseSpeedBefore: 25,
    responseSpeedAfter: 88,
    overallConfidence: 0.85,
  },
  auditTrail: [
    { timestamp: "2026-07-16T12:00:00Z", event: "Session created" },
    { timestamp: "2026-07-16T12:00:03Z", event: "Parse completed" },
    { timestamp: "2026-07-16T12:00:08Z", event: "Diagnosis generated" },
    { timestamp: "2026-07-16T12:00:15Z", event: "Migration plan generated" },
  ],
});

export const mockSessions: Record<string, SessionResponse> = {
  "mock-session-001": mockSessionSupportTriage,
  "mock-session-002": mockSessionLeadRouting,
  "mock-session-003": mockSessionHRApproval,
};

export const demoExamples = [
  { id: "mock-session-001", title: "Support Ticket Triage", description: "Automate ticket classification and routing with AI agents." },
  { id: "mock-session-002", title: "Lead Routing", description: "Intelligent lead scoring and sales rep assignment." },
  { id: "mock-session-003", title: "HR Onboarding", description: "Streamline approval workflows with parallel agent processing." },
];
