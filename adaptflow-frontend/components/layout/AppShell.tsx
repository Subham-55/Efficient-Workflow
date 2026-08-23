"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSessionStore } from "@/lib/store/sessionStore";
import { Button } from "@/components/ui/button";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mode = useSessionStore((s) => s.mode);
  const setMode = useSessionStore((s) => s.setMode);

  const isLanding = pathname === "/";

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-board-bg">
      <header className="border-b border-border/50 bg-board-panel/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-copper/20 border border-copper/40 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-copper">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-semibold text-lg text-ink tracking-tight">AdaptFlow</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(mode === "live" ? "demo" : "live")}
              className={cn(
                "text-xs font-mono uppercase tracking-wider",
                mode === "live" ? "text-signal-healthy" : "text-signal-warning"
              )}
            >
              {mode === "live" ? "● Live" : "● Demo"}
            </Button>
            <Button
              size="sm"
              onClick={() => { window.location.href = "/workspace/new"; }}
              className="bg-copper hover:bg-copper-bright text-board-bg font-medium"
            >
              New Analysis
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
