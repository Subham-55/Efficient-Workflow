"use client";

import { PipelineStage } from "@/lib/store/sessionStore";
import { cn } from "@/lib/utils";
import { FileSearch, Bug, GitBranch, BarChart3 } from "lucide-react";

const stages: { key: PipelineStage; label: string; icon: React.ElementType }[] = [
  { key: "parse", label: "Parse", icon: FileSearch },
  { key: "diagnose", label: "Diagnose", icon: Bug },
  { key: "migrate", label: "Migrate", icon: GitBranch },
  { key: "visualize", label: "Visualize", icon: BarChart3 },
];

interface PipelineStepperProps {
  activeStage: PipelineStage;
  onStageClick?: (stage: PipelineStage) => void;
}

export function PipelineStepper({ activeStage, onStageClick }: PipelineStepperProps) {
  const activeIndex = stages.findIndex((s) => s.key === activeStage);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border/50">
          <div
            className="h-full bg-copper transition-all duration-500 ease-out"
            style={{ width: `${(activeIndex / (stages.length - 1)) * 100}%` }}
          />
        </div>
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = stage.key === activeStage;
          const isCompleted = index < activeIndex;
          return (
            <button
              key={stage.key}
              type="button"
              onClick={() => onStageClick?.(stage.key)}
              className={cn(
                "flex flex-col items-center gap-2 relative z-10 group",
                onStageClick && "cursor-pointer"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive
                    ? "bg-copper border-copper text-board-bg shadow-lg shadow-copper/20"
                    : isCompleted
                    ? "bg-signal-healthy border-signal-healthy text-board-bg"
                    : "bg-board-panel border-border text-silver group-hover:border-copper/50"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  "text-xs font-mono uppercase tracking-wider transition-colors",
                  isActive ? "text-copper" : isCompleted ? "text-signal-healthy" : "text-silver"
                )}
              >
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
