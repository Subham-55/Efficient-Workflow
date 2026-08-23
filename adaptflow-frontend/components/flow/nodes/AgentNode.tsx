"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { Cpu, Activity } from "lucide-react";

interface AgentNodeData {
  label: string;
  confidence?: number;
}

type AgentNodeProps = NodeProps & { data: AgentNodeData };

export const AgentNode = memo(function AgentNode({ data, selected }: AgentNodeProps) {
  const confidence = data.confidence;
  const pct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <div
      className={cn(
        "min-w-[200px] px-4 py-3 bg-board-panel border-2 border-signal-healthy rounded-node shadow-lg transition-all",
        selected && "ring-2 ring-signal-human ring-offset-2 ring-offset-board-bg"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
      <div className="flex items-center gap-2">
        <Cpu className="w-4 h-4 text-signal-healthy" />
        <p className="text-sm font-medium text-ink leading-tight">{data.label}</p>
      </div>
      {pct !== null && (
        <div className="mt-2 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-signal-healthy" />
          <span className="text-xs font-mono text-signal-healthy">Confidence: {pct}%</span>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
    </div>
  );
});
