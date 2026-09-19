// OWNER: SC
"use client";

import { useCallback, useEffect, useState } from "react";
import { QRDisplay } from "@/components/ui/QRDisplay";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MyCodePage() {
  const [workerId, setWorkerId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) throw new Error("session");
      const me = await meRes.json();
      setWorkerId(me.workerId);

      const workerRes = await fetch(`/api/workers/${me.workerId}`);
      if (!workerRes.ok) throw new Error("worker");
      const worker = await workerRes.json();
      setPublished(worker.workflowStatus === "published");
      setToken(worker.qrToken ?? null);
    } catch {
      setError("Couldn't load your code. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleGenerate() {
    if (!workerId) return;
    setRegenerating(true);
    try {
      const res = await fetch(`/api/workers/${workerId}/qr/regenerate`, { method: "POST" });
      if (!res.ok) {
        setError("Couldn't generate your code right now.");
        return;
      }
      const data = await res.json();
      setToken(data.token);
    } finally {
      setRegenerating(false);
      setConfirmOpen(false);
    }
  }

  if (loading) return <LoadingState message="Loading your code…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  if (!published) {
    return (
      <EmptyState message="Your code is ready once your profile is published — finish your review first." />
    );
  }

  return (
    <div className="mx-auto max-w-sm space-y-[var(--space-4)]">
      <h1 className="font-display text-[var(--text-xl)] font-bold">My Code</h1>

      {token ? (
        <>
          <QRDisplay
            imageSrc={`/api/qr/${token}/image`}
            profileUrl={`${window.location.origin}/p/${token}`}
          />
          <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(true)}>
            Regenerate code
          </Button>
          <p className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
            Regenerating deactivates this code immediately — any printed or screenshotted copy stops
            working.
          </p>
        </>
      ) : (
        <Button variant="primary" fullWidth disabled={regenerating} onClick={handleGenerate}>
          {regenerating ? "Generating…" : "Generate my code"}
        </Button>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Regenerate your code?">
        <p className="mb-[var(--space-4)]">
          Your current code will stop working right away, even if it&apos;s already printed or
          screenshotted. This can&apos;t be undone.
        </p>
        <div className="flex gap-[var(--space-2)]">
          <Button variant="secondary" fullWidth onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" fullWidth disabled={regenerating} onClick={handleGenerate}>
            {regenerating ? "Regenerating…" : "Regenerate"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
