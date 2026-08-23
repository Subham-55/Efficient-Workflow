"use client";

import { AppShell } from "@/components/layout/AppShell";
import { WorkflowInputForm } from "@/components/input/WorkflowInputForm";
import { Card } from "@/components/ui/card";

export default function NewSessionPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink mb-3">Analyze Your Workflow</h1>
          <p className="text-silver max-w-xl mx-auto">
            Describe a broken workflow, upload an SOP, or pick a demo example to see AdaptFlow diagnose and self-migrate it into an AI-agent automation.
          </p>
        </div>
        <Card className="bg-board-panel border-border p-6 sm:p-8">
          <WorkflowInputForm />
        </Card>
      </div>
    </AppShell>
  );
}
