// OWNER: SA
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { VoiceRecorder } from "@/components/ui/VoiceRecorder";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

interface WorkerReadModel {
  id: string;
  displayName: string;
  workflowStatus: "needs_structuring" | "review" | "published";
  rawIntakeText: string | null;
  structuredSkills: string[];
  structuredSummary: string | null;
  location: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [worker, setWorker] = useState<WorkerReadModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const meRes = await fetch("/api/me");
      if (!meRes.ok) throw new Error("session");
      const me = await meRes.json();

      const workerRes = await fetch(`/api/workers/${me.workerId}`);
      if (!workerRes.ok) throw new Error("worker");
      setWorker(await workerRes.json());
    } catch {
      setError("Couldn't load your profile. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleIntakeSubmit(text: string, mode: "voice" | "text") {
    if (!worker) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Owned by SB — this section only wires the call; SB implements the handler.
      const res = await fetch(`/api/workers/${worker.id}/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error ?? "Couldn't submit your account right now.");
        return;
      }
      const data = await res.json();
      // SB's review screen — stashed client-side since ProfileDraft's frozen
      // schema has no summary column (see README).
      if (data.plainSummary) sessionStorage.setItem("kaadi:lastPlainSummary", data.plainSummary);
      router.push("/profile/review");
    } catch {
      setSubmitError("Couldn't reach Kaadi. Your text hasn't been lost — try submitting again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading your profile…" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!worker) return <ErrorState message="We couldn't find your profile." onRetry={load} />;

  return (
    <div className="mx-auto max-w-lg space-y-[var(--space-6)]">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-[var(--text-xl)] font-bold">My Profile</h1>
        <StatusPill
          status={
            worker.workflowStatus === "published"
              ? "verified"
              : worker.workflowStatus === "review"
              ? "pending"
              : "neutral"
          }
          label={
            worker.workflowStatus === "published"
              ? "Published"
              : worker.workflowStatus === "review"
              ? "Awaiting your review"
              : "Not started"
          }
        />
      </div>

      {worker.workflowStatus === "needs_structuring" && (
        <Card>
          <h2 className="mb-[var(--space-2)] font-medium">Tell us who you are</h2>
          <p className="mb-[var(--space-4)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
            Record a voice note or type an account of who you are, what you do, and who you&apos;ve
            worked for. Either way works exactly the same.
          </p>
          <VoiceRecorder onSubmit={handleIntakeSubmit} />
          {submitting && <LoadingState message="Submitting…" />}
          {submitError && <ErrorState message={submitError} />}
        </Card>
      )}

      {worker.workflowStatus === "review" && (
        <Card>
          <p className="mb-[var(--space-3)]">
            Your account has been turned into a draft profile. Head to the review screen to accept,
            edit, or reject each field before it goes live.
          </p>
          <Link href="/profile/review">
            <Button variant="primary" fullWidth>
              Review your draft
            </Button>
          </Link>
        </Card>
      )}

      {worker.workflowStatus === "published" && (
        <Card>
          <h2 className="mb-[var(--space-2)] font-medium">Your published profile</h2>
          {worker.structuredSummary && (
            <p className="mb-[var(--space-3)] text-[var(--kaadi-ink-700)]">
              {worker.structuredSummary}
            </p>
          )}
          {worker.structuredSkills.length > 0 ? (
            <div className="flex flex-wrap gap-[var(--space-2)]">
              {worker.structuredSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[var(--kaadi-clay-100)] px-[var(--space-3)] py-1 text-[var(--text-sm)] text-[var(--kaadi-clay-700)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[var(--kaadi-ink-500)]">No skills listed yet.</p>
          )}
        </Card>
      )}
    </div>
  );
}
