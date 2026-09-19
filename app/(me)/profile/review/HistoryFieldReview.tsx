// OWNER: SB
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { FieldDecision } from "@/components/ui/FieldReview";

export interface DraftHistoryItem {
  employerName: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  employerPhone: string | null;
}

function emptyItem(): DraftHistoryItem {
  return { employerName: "", role: "", startDate: null, endDate: null, isOngoing: false, employerPhone: null };
}

export function HistoryFieldReview({
  value,
  decision,
  onDecide,
}: {
  value: DraftHistoryItem[];
  decision: FieldDecision;
  onDecide: (decision: FieldDecision, jsonValue: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<DraftHistoryItem[]>(value);

  function updateItem(index: number, patch: Partial<DraftHistoryItem>) {
    setDraft((items) => items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }
  function removeItem(index: number) {
    setDraft((items) => items.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-4)]">
      <div className="mb-[var(--space-2)] flex items-center justify-between gap-[var(--space-2)]">
        <span className="font-medium">Work history</span>
        <Badge>AI draft</Badge>
      </div>
      <p className="mb-[var(--space-3)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
        Generated from your own words. Check it before saving.
      </p>

      {editing ? (
        <div className="mb-[var(--space-3)] space-y-[var(--space-3)]">
          {draft.map((item, i) => (
            <div key={i} className="rounded-[var(--radius)] border border-[var(--kaadi-border)] p-[var(--space-3)]">
              <div className="mb-[var(--space-2)] grid grid-cols-2 gap-[var(--space-2)]">
                <input
                  value={item.employerName}
                  onChange={(e) => updateItem(i, { employerName: e.target.value })}
                  placeholder="Employer name"
                  className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
                />
                <input
                  value={item.role}
                  onChange={(e) => updateItem(i, { role: e.target.value })}
                  placeholder="Role"
                  className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
                />
                <input
                  value={item.employerPhone ?? ""}
                  onChange={(e) => updateItem(i, { employerPhone: e.target.value || null })}
                  placeholder="Employer phone"
                  className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
                />
                <label className="flex items-center gap-[var(--space-2)]">
                  <input
                    type="checkbox"
                    checked={item.isOngoing}
                    onChange={(e) => updateItem(i, { isOngoing: e.target.checked, endDate: e.target.checked ? null : item.endDate })}
                  />
                  Ongoing
                </label>
                <input
                  type="date"
                  value={item.startDate ?? ""}
                  onChange={(e) => updateItem(i, { startDate: e.target.value || null })}
                  className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
                />
                {!item.isOngoing && (
                  <input
                    type="date"
                    value={item.endDate ?? ""}
                    onChange={(e) => updateItem(i, { endDate: e.target.value || null })}
                    className="min-h-[var(--tap-min)] rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-2)]"
                  />
                )}
              </div>
              <Button variant="ghost" onClick={() => removeItem(i)} type="button">
                Remove this entry
              </Button>
            </div>
          ))}
          <Button variant="secondary" fullWidth onClick={() => setDraft((d) => [...d, emptyItem()])} type="button">
            + Add another entry
          </Button>
        </div>
      ) : (
        <div className="mb-[var(--space-3)] space-y-[var(--space-2)]">
          {decision === "rejected" ? (
            <p className="text-[var(--kaadi-ink-500)] italic">Rejected — not saved.</p>
          ) : draft.length === 0 ? (
            <p className="text-[var(--kaadi-ink-500)] italic">No work history stated</p>
          ) : (
            draft.map((item, i) => (
              <p key={i}>
                {item.role || "?"} at {item.employerName || "?"}
                {item.employerPhone ? ` (${item.employerPhone})` : ""} — {item.startDate ?? "?"} to{" "}
                {item.isOngoing ? "present" : item.endDate ?? "?"}
              </p>
            ))
          )}
        </div>
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
