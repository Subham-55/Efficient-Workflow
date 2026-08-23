"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { useSessionStore } from "@/lib/store/sessionStore";
import { AppShell } from "@/components/layout/AppShell";
import { SessionSidebar } from "@/components/layout/SessionSidebar";
import { PipelineStepper } from "@/components/pipeline/PipelineStepper";
import { ParseStageView } from "@/components/pipeline/ParseStageView";
import { DiagnoseStageView } from "@/components/pipeline/DiagnoseStageView";
import { MigrateStageView } from "@/components/pipeline/MigrateStageView";
import { VisualizeStageView } from "@/components/pipeline/VisualizeStageView";
import { useWorkflowSocket } from "@/lib/hooks/useWorkflowSocket";
import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const stageOrder: Array<"parse" | "diagnose" | "migrate" | "visualize"> = ["parse", "diagnose", "migrate", "visualize"];

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { data: session, isLoading, isError, refetch } = useSession(sessionId);
  const activeStage = useSessionStore((s) => s.activeStage);
  const setActiveStage = useSessionStore((s) => s.setActiveStage);
  const setSessionId = useSessionStore((s) => s.setSessionId);
  const mode = useSessionStore((s) => s.mode);
  const initialModeRef = useRef(mode);

  useWorkflowSocket(sessionId);

  useEffect(() => {
    setSessionId(sessionId);
  }, [sessionId, setSessionId]);

  useEffect(() => {
    if (mode !== initialModeRef.current && isError) {
      setSessionId(null);
      setActiveStage("parse");
      router.push("/workspace/new");
    }
  }, [mode, isError, router, setSessionId, setActiveStage]);

  useEffect(() => {
    if (!session) return;
    const status = session.status;
    if (status && status !== "parsing" && status !== "diagnosing" && status !== "migrating") {
      const idx = stageOrder.indexOf(activeStage);
      if (idx < stageOrder.length - 1) {
        setActiveStage(stageOrder[idx + 1]);
      }
    }
  }, [session, activeStage, setActiveStage]);

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-copper animate-spin" />
        </div>
      </AppShell>
    );
  }

  if (isError || !session) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-signal-critical text-lg">Failed to load session</p>
          <Button onClick={() => refetch()} className="bg-copper hover:bg-copper-bright text-board-bg">
            Retry
          </Button>
          <Button variant="outline" onClick={() => router.push("/workspace/new")} className="border-border text-silver hover:text-ink">
            Back to Input
          </Button>
        </div>
      </AppShell>
    );
  }

  const renderStage = () => {
    switch (activeStage) {
      case "parse":
        return <ParseStageView session={session} />;
      case "diagnose":
        return <DiagnoseStageView session={session} />;
      case "migrate":
        return <MigrateStageView session={session} />;
      case "visualize":
        return (
          <VisualizeStageView
            session={session}
            onApprove={() => {
              router.push(`/workspace/session/${sessionId}/report`);
            }}
            onReject={() => {}}
            onAdjust={() => {}}
          />
        );
      default:
        return <ParseStageView session={session} />;
    }
  };

  return (
    <AppShell>
      <div className="flex h-[calc(100vh-3.5rem)]">
        <SessionSidebar workflowName={session.sessionId} timestamp={new Date().toISOString()} inputSource={mode}>
          <PipelineStepper activeStage={activeStage} onStageClick={setActiveStage} />
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-mono text-silver uppercase tracking-wider">Impact Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-silver">Manual Effort</span>
                <span className="font-mono text-signal-critical">{session.impact.manualEffortBefore}% → <span className="text-signal-healthy">{session.impact.manualEffortAfter}%</span></span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-silver">Response Speed</span>
                <span className="font-mono text-signal-critical">{session.impact.responseSpeedBefore}% → <span className="text-signal-healthy">{session.impact.responseSpeedAfter}%</span></span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-silver">Confidence</span>
                <span className="font-mono text-copper">{Math.round(session.impact.overallConfidence * 100)}%</span>
              </div>
            </div>
          </div>
        </SessionSidebar>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mb-4">
            <PipelineStepper activeStage={activeStage} onStageClick={setActiveStage} />
          </div>
          <div className="mt-6">{renderStage()}</div>
        </div>
      </div>
    </AppShell>
  );
}
