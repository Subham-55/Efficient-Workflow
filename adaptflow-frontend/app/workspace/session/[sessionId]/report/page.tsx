"use client";

import { useParams } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkflowCanvas } from "@/components/flow/WorkflowCanvas";
import { ImpactBarChart } from "@/components/metrics/ImpactBarChart";
import { ConfidenceGauge } from "@/components/metrics/ConfidenceGauge";
import { CheckCircle2, Download } from "lucide-react";

export default function ReportPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const { data: session, isLoading } = useSession(sessionId);

  if (isLoading || !session) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-copper border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <CheckCircle2 className="w-6 h-6 text-signal-healthy" />
          <h1 className="text-2xl font-bold text-ink">Migration Approved</h1>
        </div>

        <Card className="bg-board-panel border-border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-mono text-silver uppercase tracking-wider mb-3">Final Workflow Graph (After)</h3>
              <WorkflowCanvas graph={session.after} readOnly />
            </div>
            <div className="space-y-6">
              <ImpactBarChart impact={session.impact} />
              <ConfidenceGauge value={session.impact.overallConfidence} />
            </div>
          </div>
        </Card>

        <Card className="bg-board-panel border-border p-6 mb-6">
          <h3 className="text-xs font-mono text-silver uppercase tracking-wider mb-4">Audit Trail</h3>
          <ul className="space-y-2">
            {session.auditTrail.map((entry, i) => (
              <li key={i} className="flex items-center justify-between text-sm border-b border-border/30 last:border-0 pb-2">
                <span className="text-ink">{entry.event}</span>
                <span className="text-xs text-silver font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex items-center gap-3">
          <Button className="bg-copper hover:bg-copper-bright text-board-bg">
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <a href="/workspace/dashboard" className="inline-flex items-center justify-center px-4 py-2 border border-border rounded-card text-sm font-medium text-silver hover:text-ink transition-colors">View Dashboard</a>
        </div>
      </div>
    </AppShell>
  );
}
