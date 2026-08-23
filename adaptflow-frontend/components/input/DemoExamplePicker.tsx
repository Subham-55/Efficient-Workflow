"use client";

import { demoExamples } from "@/lib/api/mockData";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface DemoExamplePickerProps {
  onSelect: (exampleId: string) => void;
  selectedId?: string;
}

export function DemoExamplePicker({ onSelect, selectedId }: DemoExamplePickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {demoExamples.map((ex) => (
        <Card
          key={ex.id}
          onClick={() => onSelect(ex.id)}
          className={cn(
            "p-4 cursor-pointer transition-all border-2 hover:border-copper/50",
            selectedId === ex.id ? "border-copper bg-copper/5" : "border-border bg-board-panel"
          )}
        >
          <h4 className="text-sm font-medium text-ink mb-1">{ex.title}</h4>
          <p className="text-xs text-silver leading-snug">{ex.description}</p>
        </Card>
      ))}
    </div>
  );
}
