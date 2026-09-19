// OWNER: SB
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FieldReview, type FieldDecision } from "@/components/ui/FieldReview";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

interface DraftReadModel {
  id: string;
  workerId: string;
  generatedName: string | null;
  generatedSkills: string[];
  generatedLocation: string | null;
  generatedLanguages: string[];
  generatedHistory: {
    employerName: string;
    role: string;
    startDate: string | null;
    endDate: string | null;
    isOngoing: boolean;
    employerPhone: string | null;
  }[];
  generatedGuarantor: { name: string; phone: string; relationship: string } | null;
  missingInformation: string[];
  fieldDecisions: Record<string, FieldDecision>;
  approvalStatus: "draft" | "approved";
  isFallback: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  generatedName: "Name",
  generatedSkills: "Skills",
  generatedLocation: "Location",
  generatedLanguages: "Languages spoken",
  generatedHistory: "Work history",
  generatedGuarantor: "Guarantor",
};

function historyToText(history: DraftReadModel["generatedHistory"]): string {
  if (history.length === 0) return "";
  return history
    .map(
      (h) =>
        `${h.role} at ${h.employerName}${h.employerPhone ? ` (${h.employerPhone})` : ""} — ${
          h.startDate ?? "?"
        } to ${h.isOngoing ? "present" : h.endDate ?? "?"}`
    )
    .join("\n");
}

function guarantorToText(g: DraftReadModel["generatedGuarantor"]): string {
  if (!g) return "";
  return `${g.name} — ${g.phone}${g.relationship ? ` (${g.relationship})` : ""}`;
}

export default function ReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<DraftReadModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);
  const [plainSummary, setPlainSummary] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) throw new Error("session");
      const me = await meRes.json();

      const res = await fetch(`/api/workers/${me.workerId}/drafts/latest`);
      if (res.status === 404) {
        router.push("/profile");
        return;
      }
      if (!res.ok) throw new Error("draft");
      const data: DraftReadModel = await res.json();
      if (data.approvalStatus === "approved") {
        router.push("/profile");
        return;
      }
      setDraft(data);

      // Stashed by /profile at submit time — not persisted server-side
      // (Section 6 schema has no summary column on ProfileDraft). See README.
      setPlainSummary(sessionStorage.getItem("kaadi:lastPlainSummary"));
    } catch {
      setError("Couldn't load your draft. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  async function decide(field: string, decision: FieldDecision, value: string) {
    if (!draft) return;
    await fetch(`/api/drafts/${draft.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, decision, value: decision === "edited" ? value : undefined }),
    });
    setDraft({
      ...draft,
      fieldDecisions: { ...draft.fieldDecisions, [field]: decision },
    });
  }

  async function handleApprove() {
    if (!draft) return;
    setApproving(true);
    try {
      const res = await fetch(`/api/drafts/${draft.id}/approve`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't approve right now.");
        return;
      }
      sessionStorage.removeItem("kaadi:lastPlainSummary");
      router.push("/profile");
      router.refresh();
    } finally {
      setApproving(false);
    }
  }

  if (loading) return <LoadingState message="Loading your draft…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!draft) return <EmptyState message="No draft to review yet." />;

  return (
    <div className="mx-auto max-w-lg space-y-[var(--space-4)]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[var(--text-xl)] font-bold">Review your draft</h1>
        {draft.isFallback && <Badge>Couldn&apos;t reach the AI</Badge>}
      </div>

      {draft.isFallback && (
        <Card className="border-[var(--kaadi-pending-100)] bg-[var(--kaadi-pending-100)] text-[var(--kaadi-pending-700)]">
          Couldn&apos;t reach the AI — here&apos;s your original text. Review it yourself below; nothing
          is blocked by this.
        </Card>
      )}

      {plainSummary && !draft.isFallback && (
        <Card>
          <p className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">AI&apos;s summary</p>
          <p>{plainSummary}</p>
        </Card>
      )}

      {draft.missingInformation.length > 0 && (
        <Card className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
          {draft.missingInformation.join(" ")}
        </Card>
      )}

      <FieldReview
        label={FIELD_LABELS.generatedName}
        value={draft.generatedName ?? ""}
        decision={draft.fieldDecisions.generatedName ?? "pending"}
        onDecide={(d, v) => decide("generatedName", d, v)}
      />
      <FieldReview
        label={FIELD_LABELS.generatedSkills}
        value={draft.generatedSkills.join(", ")}
        decision={draft.fieldDecisions.generatedSkills ?? "pending"}
        onDecide={(d, v) => decide("generatedSkills", d, v)}
      />
      <FieldReview
        label={FIELD_LABELS.generatedLocation}
        value={draft.generatedLocation ?? ""}
        decision={draft.fieldDecisions.generatedLocation ?? "pending"}
        onDecide={(d, v) => decide("generatedLocation", d, v)}
      />
      <FieldReview
        label={FIELD_LABELS.generatedLanguages}
        value={draft.generatedLanguages.join(", ")}
        decision={draft.fieldDecisions.generatedLanguages ?? "pending"}
        onDecide={(d, v) => decide("generatedLanguages", d, v)}
      />
      <FieldReview
        label={FIELD_LABELS.generatedHistory}
        value={historyToText(draft.generatedHistory)}
        decision={draft.fieldDecisions.generatedHistory ?? "pending"}
        onDecide={(d, v) => decide("generatedHistory", d, v)}
      />
      {draft.generatedGuarantor && (
        <FieldReview
          label={FIELD_LABELS.generatedGuarantor}
          value={guarantorToText(draft.generatedGuarantor)}
          decision={draft.fieldDecisions.generatedGuarantor ?? "pending"}
          onDecide={(d, v) => decide("generatedGuarantor", d, v)}
        />
      )}

      <Button variant="primary" fullWidth disabled={approving} onClick={handleApprove}>
        {approving ? "Publishing…" : "Approve and publish"}
      </Button>
    </div>
  );
}
