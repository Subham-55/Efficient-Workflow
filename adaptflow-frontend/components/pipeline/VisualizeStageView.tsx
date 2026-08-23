"use client";

import { useState } from "react";
import { SessionResponse } from "@/lib/api/schemas";
import { WorkflowCanvas } from "@/components/flow/WorkflowCanvas";
import { ImpactBarChart } from "@/components/metrics/ImpactBarChart";
import { ConfidenceGauge } from "@/components/metrics/ConfidenceGauge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VisualizeStageViewProps {
  session: SessionResponse;
  onApprove?: () => void;
  onReject?: () => void;
  onAdjust?: () => void;
}

type ViewMode = "before" | "after" | "side-by-side";

export function VisualizeStageView({ session, onApprove, onReject, onAdjust }: VisualizeStageViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList className="bg-board-panel border border-border/50">
            <TabsTrigger value="before">Before</TabsTrigger>
            <TabsTrigger value="after">After</TabsTrigger>
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(viewMode === "before" || viewMode === "side-by-side") && (
          <div>
            <h3 className="text-xs font-mono text-silver uppercase tracking-wider mb-2 px-1">Before — Current Workflow</h3>
            <WorkflowCanvas graph={session.before} selectedNodeId={selectedNodeId} onNodeClick={setSelectedNodeId} readOnly />
          </div>
        )}
        {(viewMode === "after" || viewMode === "side-by-side") && (
          <div>
            <h3 className="text-xs font-mono text-signal-healthy uppercase tracking-wider mb-2 px-1">After — AI-Agent Workflow</h3>
            <WorkflowCanvas graph={session.after} selectedNodeId={selectedNodeId} onNodeClick={setSelectedNodeId} readOnly />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <ImpactBarChart impact={session.impact} />
        <ConfidenceGauge value={session.impact.overallConfidence} />
        <div className="flex flex-col justify-center gap-3">
          <p className="text-xs text-silver text-center mb-1">Decision</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onApprove}
              className="w-full py-2.5 bg-signal-healthy hover:brightness-110 text-board-bg font-medium rounded-card transition-colors"
            >
              Approve &amp; Deploy
            </button>
            <button
              type="button"
              onClick={onAdjust}
              className="w-full py-2.5 bg-signal-warning hover:brightness-110 text-board-bg font-medium rounded-card transition-colors"
            >
              Adjust
            </button>
            <button
              type="button"
              onClick={onReject}
              className="w-full py-2.5 bg-signal-critical hover:brightness-110 text-ink font-medium rounded-card transition-colors"
            >
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
