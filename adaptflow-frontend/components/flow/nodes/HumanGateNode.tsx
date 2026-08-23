"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface HumanGateNodeData {
  label: string;
  confidence?: number;
}

type HumanGateNodeProps = NodeProps & { data: HumanGateNodeData };

export const HumanGateNode = memo(function HumanGateNode({ data, selected }: HumanGateNodeProps) {
  const confidence = data.confidence;
  const pct = confidence != null ? Math.round(confidence * 100) : null;

  return (
    <div className="relative">
      <div
        className={cn(
          "min-w-[200px] px-4 py-3 bg-board-panel border-2 border-signal-human shadow-lg transition-all",
          "clip-hexagon",
          selected && "ring-2 ring-signal-human ring-offset-2 ring-offset-board-bg"
        )}
        style={{
          clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
          padding: "14px 24px",
        }}
      >
        <Handle type="target" position={Position.Top} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-signal-human" />
          <p className="text-sm font-medium text-ink leading-tight">{data.label}</p>
        </div>
        {pct !== null && (
          <div className="mt-2">
            <span className="text-xs font-mono text-signal-human">Confidence: {pct}%</span>
          </div>
        )}
        <Handle type="source" position={Position.Bottom} className="!bg-copper-bright !border-2 !border-board-bg !w-3 !h-3" />
      </div>
    </div>
  );
});
