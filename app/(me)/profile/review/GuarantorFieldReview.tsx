// OWNER: SB
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { FieldDecision } from "@/components/ui/FieldReview";

export interface DraftGuarantor {
  name: string;
  phone: string;
  relationship: string;
}

export function GuarantorFieldReview({
  value,
  decision,
  onDecide,
}: {
  value: DraftGuarantor;
  decision: FieldDecision;
  onDecide: (decision: FieldDecision, jsonValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftGuarantor>(value);

  return (
    <div className="rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-4)]">
      <div className="mb-[var(--space-2)] flex items-center justify-between gap-[var(--space-2)]">
        <span className="font-medium">Guarantor</span>
        <Badge>AI draft</Badge>
      </div>
      <p className="mb-[var(--space-3)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
        Generated from your own words. Check it before saving.
      </p>

      {editing ? (
        <div className="mb-[var(--space-3)] grid grid-cols-2 gap-[var(--space-2)]">
          <input
            value={draft.name}
            onChange={(e) => setDraft({ ...draft, name: e.target.value })}
            placeholder="Name"
            className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
          />
          <input
            value={draft.phone}
            onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
            placeholder="Phone"
            className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
          />
          <input
            value={draft.relationship}
            onChange={(e) => setDraft({ ...draft, relationship: e.target.value })}
            placeholder="Relationship"
            className="min-h-[var(--tap-min)] col-span-2 rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
          />
        </div>
      ) : (
        <p className="mb-[var(--space-3)]">
          {decision === "rejected" ? (
            <span className="text-[var(--kaadi-ink-500)] italic">Rejected — not saved.</span>
          ) : (
            `${draft.name || "?"} — ${draft.phone || "?"}${draft.relationship ? ` (${draft.relationship})` : ""}`
          )}
        </p>
      )}

      <div className="flex flex-wrap gap-[var(--space-2)]">
        {editing ? (
          <Button
            variant="primary"
            onClick={() => {
              setEditing(false);
              onDecide("edited", JSON.stringify(draft));
            }}
            type="button"
          >
            Save edit
          </Button>
        ) : (
          <>
            <Button
              variant={decision === "accepted" ? "primary" : "secondary"}
              onClick={() => onDecide("accepted", JSON.stringify(draft))}
              type="button"
            >
              Accept
            </Button>
            <Button variant="secondary" onClick={() => setEditing(true)} type="button">
              Edit
            </Button>
            <Button
              variant={decision === "rejected" ? "danger" : "secondary"}
              onClick={() => onDecide("rejected", JSON.stringify(draft))}
              type="button"
            >
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
