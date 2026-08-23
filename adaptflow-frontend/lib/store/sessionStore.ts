import { create } from "zustand";

export type PipelineStage = "parse" | "diagnose" | "migrate" | "visualize";
export type SessionStatus = "parsing" | "diagnosing" | "migrating" | "ready" | "approved" | "rejected";
export type Mode = "live" | "demo";

interface SessionStore {
  mode: Mode;
  setMode: (mode: Mode) => void;
  activeStage: PipelineStage;
  setActiveStage: (stage: PipelineStage) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
  isTransitioning: boolean;
  setIsTransitioning: (transitioning: boolean) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  mode: (process.env.NEXT_PUBLIC_DEMO_MODE === "false" ? "live" : "demo") as Mode,
  setMode: (mode) => set({ mode }),
  activeStage: "parse",
  setActiveStage: (activeStage) => set({ activeStage }),
  sessionId: null,
  setSessionId: (sessionId) => set({ sessionId }),
  selectedNodeId: null,
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),
  sidePanelOpen: false,
  setSidePanelOpen: (sidePanelOpen) => set({ sidePanelOpen }),
  isTransitioning: false,
  setIsTransitioning: (isTransitioning) => set({ isTransitioning }),
}));
