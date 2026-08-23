"use client";

interface DecisionBarProps {
  onApprove?: () => void;
  onReject?: () => void;
  onAdjust?: () => void;
  disabled?: boolean;
}

export function DecisionBar({ onApprove, onReject, onAdjust, disabled }: DecisionBarProps) {
  return (
    <div className="flex items-center justify-end gap-3 bg-board-panel border border-border rounded-card p-3">
      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className="px-4 py-2 bg-signal-critical/10 text-signal-critical border border-signal-critical/30 rounded-card text-sm font-medium hover:bg-signal-critical/20 transition-colors disabled:opacity-50"
      >
        Reject
      </button>
      <button
        type="button"
        onClick={onAdjust}
        disabled={disabled}
        className="px-4 py-2 bg-signal-warning/10 text-signal-warning border border-signal-warning/30 rounded-card text-sm font-medium hover:bg-signal-warning/20 transition-colors disabled:opacity-50"
      >
        Adjust
      </button>
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        className="px-4 py-2 bg-copper text-board-bg rounded-card text-sm font-medium hover:bg-copper-bright transition-colors disabled:opacity-50"
      >
        Approve &amp; Deploy
      </button>
    </div>
  );
}
