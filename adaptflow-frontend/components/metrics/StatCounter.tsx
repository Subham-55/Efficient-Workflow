"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  label?: string;
}

export function StatCounter({ value, suffix = "", prefix = "", className, label }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const start = 0;
    const duration = 900;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, reduceMotion]);

  return (
    <div ref={ref} className={cn("flex flex-col items-center text-center", className)}>
      <span className="text-3xl sm:text-4xl font-mono text-copper tabular-nums">
        {prefix}{display}{suffix}
      </span>
      {label && <span className="text-xs text-silver mt-1 uppercase tracking-wider">{label}</span>}
    </div>
  );
}
