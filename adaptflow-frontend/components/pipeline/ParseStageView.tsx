"use client";

import { useMemo } from "react";
import { motion, type Variants, useReducedMotion } from "framer-motion";
import { SessionResponse } from "@/lib/api/schemas";
import { Card } from "@/components/ui/card";

interface ParseStageViewProps {
  session: SessionResponse;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function ParseStageView({ session }: ParseStageViewProps) {
  const reduceMotion = useReducedMotion();
  const parsed = session.parsed;

  const actors = useMemo(() => parsed.actors.map((a, i) => ({ label: a, i })), [parsed.actors]);
  const steps = useMemo(() => parsed.steps.map((s, i) => ({ label: s, i })), [parsed.steps]);
  const deps = useMemo(() => parsed.dependencies.map((d, i) => ({ label: d, i })), [parsed.dependencies]);
  const pain = useMemo(() => parsed.painPoints.map((p, i) => ({ label: p, i })), [parsed.painPoints]);

  return (
    <div className="space-y-6">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-sm text-silver"
      >
        Extracted from your workflow description:
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-board-panel border-border p-5">
          <h4 className="text-xs font-mono text-copper uppercase tracking-wider mb-3">Actors</h4>
          <ul className="space-y-2">
            {actors.map((a) => (
              <motion.li
                key={a.label}
                custom={reduceMotion ? 0 : a.i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-sm text-ink flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-signal-healthy shrink-0" />
                {a.label}
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card className="bg-board-panel border-border p-5">
          <h4 className="text-xs font-mono text-copper uppercase tracking-wider mb-3">Steps</h4>
          <ul className="space-y-2">
            {steps.map((s) => (
              <motion.li
                key={s.label}
                custom={reduceMotion ? 0 : s.i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-sm text-ink flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-signal-human shrink-0" />
                {s.label}
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card className="bg-board-panel border-border p-5">
          <h4 className="text-xs font-mono text-copper uppercase tracking-wider mb-3">Dependencies</h4>
          <ul className="space-y-2">
            {deps.map((d) => (
              <motion.li
                key={d.label}
                custom={reduceMotion ? 0 : d.i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-sm text-silver font-mono"
              >
                {d.label}
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card className="bg-board-panel border-border p-5">
          <h4 className="text-xs font-mono text-signal-warning uppercase tracking-wider mb-3">Pain Points</h4>
          <ul className="space-y-2">
            {pain.map((p) => (
              <motion.li
                key={p.label}
                custom={reduceMotion ? 0 : p.i}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="text-sm text-signal-warning flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-signal-warning shrink-0" />
                {p.label}
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
