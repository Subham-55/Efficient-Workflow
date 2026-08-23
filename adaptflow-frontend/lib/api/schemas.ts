import { z } from "zod";

export const WorkflowNodeSchema = z.object({
  id: z.string(),
  type: z.enum(["step", "agent", "humanGate"]),
  label: z.string(),
  description: z.string().optional(),
  status: z.enum(["healthy", "inefficient", "critical"]).optional(),
  confidence: z.number().min(0).max(1).optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

export const WorkflowEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;

export const WorkflowGraphSchema = z.object({
  nodes: z.array(WorkflowNodeSchema),
  edges: z.array(WorkflowEdgeSchema),
});

export type WorkflowGraph = z.infer<typeof WorkflowGraphSchema>;

export const ParsedDataSchema = z.object({
  actors: z.array(z.string()),
  steps: z.array(z.string()),
  dependencies: z.array(z.string()),
  painPoints: z.array(z.string()),
});

export type ParsedData = z.infer<typeof ParsedDataSchema>;

export const ImpactSchema = z.object({
  manualEffortBefore: z.number(),
  manualEffortAfter: z.number(),
  responseSpeedBefore: z.number(),
  responseSpeedAfter: z.number(),
  overallConfidence: z.number().min(0).max(1),
});

export type Impact = z.infer<typeof ImpactSchema>;

export const AuditEntrySchema = z.object({
  timestamp: z.string(),
  event: z.string(),
});

export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const SessionResponseSchema = z.object({
  sessionId: z.string(),
  status: z.enum(["parsing", "diagnosing", "migrating", "ready", "approved", "rejected"]),
  parsed: ParsedDataSchema,
  before: WorkflowGraphSchema,
  after: WorkflowGraphSchema,
  impact: ImpactSchema,
  auditTrail: z.array(AuditEntrySchema),
});

export type SessionResponse = z.infer<typeof SessionResponseSchema>;

export const CreateSessionBodySchema = z.object({
  inputType: z.enum(["text", "file", "example"]),
  content: z.string(),
  exampleId: z.string().optional(),
});

export type CreateSessionBody = z.infer<typeof CreateSessionBodySchema>;

export const DecisionBodySchema = z.object({
  action: z.enum(["approve", "adjust", "reject"]),
  adjustments: z.array(z.object({ nodeId: z.string(), field: z.string(), value: z.string() })).optional(),
});

export type DecisionBody = z.infer<typeof DecisionBodySchema>;
