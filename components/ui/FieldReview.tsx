// OWNER: SA
"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Badge } from "./Badge";

export type FieldDecision = "pending" | "accepted" | "edited" | "rejected";

export function FieldReview({
  label,
  value,
  decision,
  onDecide,
}: {
  label: string;
  value: string;
  decision: FieldDecision;
  onDecide: (decision: FieldDecision, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  return (
    <div className="rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-4)]">
      <div className="mb-[var(--space-2)] flex items-center justify-between gap-[var(--space-2)]">
        <span className="font-medium">{label}</span>
        <Badge>AI draft</Badge>
      </div>
      <p className="mb-[var(--space-3)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
        Generated from your own words. Check it before saving.
      </p>

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="mb-[var(--space-3)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-3)] text-[var(--text-md)]"
          rows={3}
        />
      ) : (
        <p className="mb-[var(--space-3)] whitespace-pre-wrap">
          {decision === "rejected" ? (
            <span className="text-[var(--kaadi-ink-500)] italic">Rejected — not saved.</span>
          ) : (
            draft || <span className="text-[var(--kaadi-ink-500)] italic">Not stated</span>
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-[var(--space-2)]">
        {editing ? (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(false);
              onDecide("edited", draft);
            }}
          >
            Save edit
          </Button>
        ) : (
          <>
            <Button
              variant={decision === "accepted" ? "primary" : "secondary"}
              onClick={() => onDecide("accepted", draft)}
            >
              Accept
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant={decision === "rejected" ? "danger" : "secondary"}
              onClick={() => onDecide("rejected", draft)}
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
