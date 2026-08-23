"use client";

import { memo } from "react";
import { BaseEdge, type EdgeProps, getBezierPath } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface CustomEdgeData {
  label?: string;
}

export const ConditionalEdge = memo(function ConditionalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const edgeData = data as CustomEdgeData | undefined;
  const label = edgeData?.label;

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} className={cn(selected && "!stroke-signal-human")} />
      {label && (
        <g>
          <path id={`${id}-bg`} d={edgePath} fill="none" stroke="#16241c" strokeWidth={6} strokeLinecap="round" />
          <path
            id={id}
            d={edgePath}
            fill="none"
            stroke="#d4a24c"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="6 3"
            markerEnd="url(#copper-arrow)"
          />
          <text>
            <textPath href={`#${id}`} startOffset="50%" fill="#8fa396" fontSize={11} fontFamily="var(--font-plex-mono)" textAnchor="middle">
              {label}
            </textPath>
          </text>
        </g>
      )}
      <defs>
        <marker id="copper-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#d4a24c" />
        </marker>
      </defs>
    </>
  );
});
