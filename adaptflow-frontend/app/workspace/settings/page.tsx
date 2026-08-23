"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSessionStore } from "@/lib/store/sessionStore";

export default function SettingsPage() {
  const mode = useSessionStore((s) => s.mode);
  const setMode = useSessionStore((s) => s.setMode);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-ink mb-6">Settings</h1>
        <Card className="bg-board-panel border-border p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium text-ink">Demo Mode</Label>
              <p className="text-xs text-silver mt-1">Use mock data for safe presentations and offline demos.</p>
            </div>
            <Switch checked={mode === "demo"} onCheckedChange={(v) => setMode(v ? "demo" : "live")} />
          </div>
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-silver">Human-approval policy toggle: stub — implement post-hackathon.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
