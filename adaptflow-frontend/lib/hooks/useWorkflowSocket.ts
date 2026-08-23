"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSessionStore, type PipelineStage } from "@/lib/store/sessionStore";

type StageEvent = {
  stage: "parse" | "diagnose" | "migrate" | "visualize";
  message: string;
  percent?: number;
};

type SocketMessage =
  | { type: "stage_started"; payload: { stage: string } }
  | { type: "stage_progress"; payload: StageEvent }
  | { type: "stage_completed"; payload: { stage: string; data: Record<string, unknown> } }
  | { type: "error"; payload: { stage: string; message: string } };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export function useWorkflowSocket(sessionId: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const mode = useSessionStore((s) => s.mode);
  const setActiveStage = useSessionStore((s) => s.setActiveStage);

  const connect = useCallback(() => {
    if (!sessionId || mode !== "live") return;
    const wsUrl = `${API_BASE.replace(/^http/, "ws")}/api/sessions/${sessionId}/stream`;
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg: SocketMessage = JSON.parse(event.data);
          if (msg.type === "stage_started") {
            setActiveStage(msg.payload.stage as PipelineStage);
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch {
      // WebSocket not available
    }
  }, [sessionId, mode, setActiveStage]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}
