"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface StepNodeData {
  label: string;
  description?: string;
  status?: "healthy" | "inefficient" | "critical";
}

type StepNodeProps = NodeProps & { data: StepNodeData };

export const StepNode = memo(function StepNode({ data, selected }: StepNodeProps) {
  const status = data.status;
  const isFlagged = status === "critical" || status === "inefficient";

  const statusColor =
    status === "critical" ? "border-signal-critical" : status === "inefficient" ? "border-signal-warning" : "border-signal-healthy";

  return (
    <div
      className={cn(
        "min-w-[200px] px-4 py-3 bg-board-panel border-2 rounded-node shadow-lg transition-all",
        statusColor,
        selected && "ring-2 ring-signal-human ring-offset-2 ring-offset-board-bg",
        isFlagged && "animate-pulse"
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
      <div className="flex items-start gap-2">
        {isFlagged ? (
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-signal-warning" />
        ) : (
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-signal-healthy" />
        )}
        <div>
          <p className="text-sm font-medium text-ink leading-tight">{data.label}</p>
          {data.description && <p className="text-xs text-silver mt-1 leading-snug">{data.description}</p>}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
    </div>
  );
});
