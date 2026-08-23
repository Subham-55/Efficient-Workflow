"use client";

import { SessionResponse } from "@/lib/api/schemas";
import { WorkflowCanvas } from "@/components/flow/WorkflowCanvas";

interface MigrateStageViewProps {
  session: SessionResponse;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function MigrateStageView({ session, onNodeClick, selectedNodeId }: MigrateStageViewProps) {
  const selectedNode = session.after.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        <WorkflowCanvas graph={session.after} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} />
      </div>
      {selectedNode && (
        <div className="w-80 shrink-0 bg-board-panel border border-border rounded-card p-5 overflow-y-auto">
          <h4 className="text-xs font-mono text-signal-human uppercase tracking-wider mb-2">
            {selectedNode.type === "humanGate" ? "Human-in-the-Loop Gate" : selectedNode.type === "agent" ? "AI Agent" : "Step"}
          </h4>
          <p className="text-sm font-medium text-ink mb-2">{selectedNode.label}</p>
          {selectedNode.confidence != null && (
            <p className="text-sm text-signal-healthy font-mono">Confidence: {Math.round(selectedNode.confidence * 100)}%</p>
          )}
          {selectedNode.description && (
            <p className="text-sm text-silver leading-relaxed mt-2">{selectedNode.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
