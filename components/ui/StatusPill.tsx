// OWNER: SA
// Colour semantics are enforced, not advisory (Section 5.2):
//   verified = confirmed worker_declared / employer-confirmed entry, or the
//     public "verified profile" badge
//   pending  = employer-added entry awaiting the worker's confirmation —
//     only ever shown inside the worker's own dashboard, never publicly
//   alert    = destructive actions and genuine errors only, never routine
//     status
// Colour is never the only signal — the status word is always rendered too.

type Status = "verified" | "pending" | "declined" | "alert" | "neutral";

const styles: Record<Status, { bg: string; text: string; label: string }> = {
  verified: { bg: "var(--kaadi-verified-100)", text: "var(--kaadi-verified-700)", label: "Verified" },
  pending: { bg: "var(--kaadi-pending-100)", text: "var(--kaadi-pending-700)", label: "Pending" },
  declined: { bg: "var(--kaadi-alert-100)", text: "var(--kaadi-alert-800)", label: "Declined" },
  alert: { bg: "var(--kaadi-alert-100)", text: "var(--kaadi-alert-800)", label: "Error" },
  neutral: { bg: "var(--kaadi-border)", text: "var(--kaadi-ink-700)", label: "—" },
};

export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-[var(--space-3)] py-1 text-[var(--text-sm)] font-medium"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: s.text }} />
      {label ?? s.label}
    </span>
  );
}
