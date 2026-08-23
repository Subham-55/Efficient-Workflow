"use client";

import { SessionResponse } from "@/lib/api/schemas";
import { WorkflowCanvas } from "@/components/flow/WorkflowCanvas";

interface DiagnoseStageViewProps {
  session: SessionResponse;
  onNodeClick?: (nodeId: string) => void;
  selectedNodeId?: string | null;
}

export function DiagnoseStageView({ session, onNodeClick, selectedNodeId }: DiagnoseStageViewProps) {
  const selectedNode = session.before.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="flex gap-4 h-full">
      <div className="flex-1 min-w-0">
        <WorkflowCanvas graph={session.before} onNodeClick={onNodeClick} selectedNodeId={selectedNodeId} />
      </div>
      {selectedNode && (
        <div className="w-80 shrink-0 bg-board-panel border border-border rounded-card p-5 overflow-y-auto">
          <h4 className="text-xs font-mono text-signal-warning uppercase tracking-wider mb-2">
            {selectedNode.status === "critical" ? "Critical Bottleneck" : selectedNode.status === "inefficient" ? "Inefficiency" : "Step Detail"}
          </h4>
          <p className="text-sm font-medium text-ink mb-2">{selectedNode.label}</p>
          {selectedNode.description && (
            <p className="text-sm text-silver leading-relaxed">{selectedNode.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
