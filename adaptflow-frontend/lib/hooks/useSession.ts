"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/store/sessionStore";
import { SessionResponse, CreateSessionBody, DecisionBody } from "@/lib/api/schemas";
import { mockSessions } from "@/lib/api/mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

export function useSession(sessionId: string | null) {
  const mode = useSessionStore((s) => s.mode);

  return useQuery<SessionResponse | null, Error, SessionResponse | null, [string, string | null, string]>({
    queryKey: ["session", sessionId, mode],
    queryFn: async (): Promise<SessionResponse | null> => {
      if (!sessionId) return null;
      if (mode === "demo") {
        await new Promise((r) => setTimeout(r, 400));
        return mockSessions[sessionId] ?? null;
      }
      return fetchJson<SessionResponse>(`${API_BASE}/api/sessions/${sessionId}`);
    },
    enabled: !!sessionId,
    refetchInterval: mode === "live" ? 2000 : false,
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();
  const mode = useSessionStore((s) => s.mode);

  return useMutation({
    mutationFn: async (body: CreateSessionBody): Promise<{ sessionId: string }> => {
      if (mode === "demo") {
        await new Promise((r) => setTimeout(r, 300));
        const exampleId = body.exampleId ?? "mock-session-001";
        return { sessionId: exampleId };
      }
      return fetchJson<{ sessionId: string }>(`${API_BASE}/api/sessions`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}

export function useSubmitDecision() {
  const queryClient = useQueryClient();
  const mode = useSessionStore((s) => s.mode);

  return useMutation({
    mutationFn: async ({ sessionId, body }: { sessionId: string; body: DecisionBody }) => {
      if (mode === "demo") {
        await new Promise((r) => setTimeout(r, 400));
        return { status: "ok" as const, auditEntryId: `audit-${Date.now()}` };
      }
      return fetchJson<{ status: string; auditEntryId: string }>(`${API_BASE}/api/sessions/${sessionId}/decision`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
    },
  });
}
