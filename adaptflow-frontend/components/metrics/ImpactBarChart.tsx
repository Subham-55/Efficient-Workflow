"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Impact } from "@/lib/api/schemas";
import { cn } from "@/lib/utils";

interface ImpactBarChartProps {
  impact: Impact;
  className?: string;
}

export function ImpactBarChart({ impact, className }: ImpactBarChartProps) {
  const chartData = [
    { label: "Manual Effort", before: impact.manualEffortBefore, after: impact.manualEffortAfter, unit: "%" },
    { label: "Response Speed", before: impact.responseSpeedBefore, after: impact.responseSpeedAfter, unit: "%" },
  ];

  return (
    <div className={cn("w-full", className)}>
      <h3 className="text-sm font-mono text-silver uppercase tracking-wider mb-4">Impact Metrics</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#8fa396", fontSize: 12, fontFamily: "var(--font-plex-mono)" }} />
          <YAxis type="category" dataKey="label" width={100} tick={{ fill: "#f1ede4", fontSize: 13 }} />
          <Tooltip
            cursor={{ fill: "#1d3226", fillOpacity: 0.5 }}
            contentStyle={{ backgroundColor: "#16241c", border: "1px solid #2a4a3a", borderRadius: 8 }}
            labelStyle={{ color: "#f1ede4", fontFamily: "var(--font-plex-mono)" }}
          />
          <Bar dataKey="before" fill="#ef5a5a" radius={[0, 4, 4, 0]} barSize={20} />
          <Bar dataKey="after" fill="#4ade80" radius={[0, 4, 4, 0]} barSize={20} />
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center justify-center gap-6 mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-signal-critical" />
          <span className="text-xs text-silver">Before</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-signal-healthy" />
          <span className="text-xs text-silver">After</span>
        </div>
      </div>
    </div>
  );
}
