"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  value: number;
  className?: string;
}

export function ConfidenceGauge({ value, className }: ConfidenceGaugeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const pct = Math.round(value * 100);

  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (value * circumference);

  return (
    <div ref={ref} className={cn("flex flex-col items-center gap-2", className)}>
      <h3 className="text-sm font-mono text-silver uppercase tracking-wider">Confidence</h3>
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#16241c" strokeWidth="8" />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#d4a24c"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: inView && !reduceMotion ? offset : circumference }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-mono text-ink">{reduceMotion ? pct : (inView ? pct : 0)}%</span>
        </div>
      </div>
      <p className="text-xs text-silver font-mono">AI confidence in migration</p>
    </div>
  );
}
