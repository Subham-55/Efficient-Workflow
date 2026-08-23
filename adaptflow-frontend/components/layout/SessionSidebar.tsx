"use client";

import { ReactNode } from "react";

interface SessionSidebarProps {
  workflowName: string;
  timestamp: string;
  inputSource: string;
  children?: ReactNode;
}

export function SessionSidebar({ workflowName, timestamp, inputSource, children }: SessionSidebarProps) {
  return (
    <aside className="w-64 border-r border-border/50 bg-board-panel/50 flex flex-col shrink-0">
      <div className="p-4 border-b border-border/50">
        <h2 className="text-sm font-mono text-silver uppercase tracking-wider mb-1">Session</h2>
        <p className="font-medium text-ink text-sm leading-tight">{workflowName}</p>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-silver font-mono">{new Date(timestamp).toLocaleString()}</p>
          <p className="text-xs text-silver capitalize">Source: {inputSource}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  );
}
