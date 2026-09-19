// OWNER: SD
"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { PhoneLink } from "@/components/ui/PhoneLink";

interface PendingEntry {
  id: string;
  employerName: string;
  employerPhone: string | null;
  role: string;
  isOngoing: boolean;
  confirmationStatus: "pending" | "declined";
}

interface ConfirmedEntry {
  id: string;
  employerName: string;
  employerPhone: string | null;
  role: string;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  source: "worker_declared" | "employer_added";
}

export default function WorkHistoryPage() {
  const [entries, setEntries] = useState<PendingEntry[]>([]);
  const [confirmed, setConfirmed] = useState<ConfirmedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) throw new Error("session");
      const me = await meRes.json();

      const [pendingRes, workerRes] = await Promise.all([
        fetch(`/api/workers/${me.workerId}/pending-entries`),
        fetch(`/api/workers/${me.workerId}`),
      ]);
      if (!pendingRes.ok || !workerRes.ok) throw new Error("entries");

      setEntries(await pendingRes.json());
      const worker = await workerRes.json();
      setConfirmed(worker.confirmedWorkHistory ?? []);
    } catch {
      setError("Couldn't load your work history. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(entryId: string, action: "confirm" | "decline") {
    setActingOn(entryId);
    try {
      await fetch(`/api/entries/${entryId}/${action}`, { method: "PATCH" });
      await load();
    } finally {
      setActingOn(null);
    }
  }

  if (loading) return <LoadingState message="Loading your work history…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const pending = entries.filter((e) => e.confirmationStatus === "pending");
  const declined = entries.filter((e) => e.confirmationStatus === "declined");

  return (
    <div className="mx-auto max-w-lg space-y-[var(--space-6)]">
      <h1 className="font-display text-[var(--text-xl)] font-bold">Work History</h1>

      <div>
        <h2 className="mb-[var(--space-3)] font-medium">Pending confirmations</h2>
        {pending.length === 0 ? (
          <EmptyState message="Nobody's asked to be added yet." />
        ) : (
          <div className="space-y-[var(--space-3)]">
            {pending.map((entry) => (
              <Card key={entry.id}>
                <div className="mb-[var(--space-2)] flex items-center justify-between">
                  <span className="font-medium">
                    {entry.role} — {entry.employerName}
                  </span>
                  <StatusPill status="pending" />
                </div>
                {entry.employerPhone && (
                  <div className="mb-[var(--space-3)]">
                    <PhoneLink phone={entry.employerPhone} />
                  </div>
                )}
                <div className="flex gap-[var(--space-2)]">
                  <Button
                    variant="primary"
                    fullWidth
                    disabled={actingOn === entry.id}
                    onClick={() => act(entry.id, "confirm")}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="danger"
                    fullWidth
                    disabled={actingOn === entry.id}
                    onClick={() => act(entry.id, "decline")}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {declined.length > 0 && (
        <div>
          <h2 className="mb-[var(--space-3)] font-medium">Declined</h2>
          <div className="space-y-[var(--space-3)]">
            {declined.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--kaadi-ink-500)]">
                    {entry.role} — {entry.employerName}
                  </span>
                  <StatusPill status="declined" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-[var(--space-3)] font-medium">Confirmed history</h2>
        {confirmed.length === 0 ? (
          <EmptyState message="Nothing confirmed yet — this is what shows on your public profile." />
        ) : (
          <div className="space-y-[var(--space-3)]">
            {confirmed.map((entry) => (
              <Card key={entry.id}>
                <div className="mb-[var(--space-2)] flex items-center justify-between">
                  <span className="font-medium">
                    {entry.role} — {entry.employerName}
                  </span>
                  <StatusPill status="verified" />
                </div>
                <p className="mb-[var(--space-2)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
                  {entry.startDate?.slice(0, 10) ?? "?"} –{" "}
                  {entry.isOngoing ? "present" : entry.endDate?.slice(0, 10) ?? "?"}
                </p>
                {entry.employerPhone && <PhoneLink phone={entry.employerPhone} />}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
