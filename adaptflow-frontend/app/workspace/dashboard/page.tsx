"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { mockSessions, demoExamples } from "@/lib/api/mockData";
import { Plus, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const sessions = Object.values(mockSessions);

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink mb-1">Dashboard</h1>
            <p className="text-sm text-silver">Your analyzed workflows and their migration status.</p>
          </div>
          <Button
            size="sm"
            onClick={() => { window.location.href = "/workspace/new"; }}
            className="bg-copper hover:bg-copper-bright text-board-bg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {sessions.length === 0 ? (
          <Card className="bg-board-panel border-border p-12 text-center">
            <p className="text-silver mb-4">No workflows analyzed yet — start with an example.</p>
            <Button
              size="sm"
              onClick={() => { window.location.href = "/workspace/new"; }}
              className="bg-copper hover:bg-copper-bright text-board-bg"
            >
              Start Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sessions.map((session) => {
              const example = demoExamples.find((e) => e.id === session.sessionId);
              return (
                <Card key={session.sessionId} className="bg-board-panel border-border p-5 hover:border-copper/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-medium text-ink mb-1">{example?.title ?? session.sessionId}</h3>
                      <p className="text-xs text-silver">
                        Manual effort: {session.impact.manualEffortBefore}% → {session.impact.manualEffortAfter}%
                        {" · "}
                        Response speed: {session.impact.responseSpeedBefore}% → {session.impact.responseSpeedAfter}%
                        {" · "}
                        Confidence: {Math.round(session.impact.overallConfidence * 100)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded-pill bg-signal-healthy/10 text-signal-healthy text-xs font-mono border border-signal-healthy/20">
                        {session.status}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => { window.location.href = `/workspace/session/${session.sessionId}`; }} className="text-silver hover:text-ink">
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
