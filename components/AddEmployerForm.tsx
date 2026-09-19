// OWNER: SD
// Zero-auth by design (Section 9.2): no login screen, no app install —
// anyone considering hiring this worker can submit this. Nothing they
// submit becomes visible until the worker confirms it (Section 11.2).
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";

export function AddEmployerForm({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [employerName, setEmployerName] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/p/${token}/add-employer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employerName, employerPhone, role, isOngoing: true }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Couldn't submit right now.");
        return;
      }
      setDone(true);
    } catch {
      setError("Couldn't reach Kaadi. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="bg-[var(--kaadi-verified-100)] text-[var(--kaadi-verified-700)]">
        Submitted. This worker will need to confirm it on their end before it shows up here.
      </Card>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
        Add myself as an employer
      </Button>
    );
  }

  return (
    <Card>
      <h2 className="mb-[var(--space-2)] font-medium">Add yourself as an employer</h2>
      <p className="mb-[var(--space-4)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
        No login needed. This won&apos;t appear on the public profile until the worker confirms it.
      </p>
      <form onSubmit={handleSubmit} className="space-y-[var(--space-3)]">
        <div>
          <label htmlFor="employerName" className="mb-[var(--space-2)] block font-medium">
            Your name
          </label>
          <input
            id="employerName"
            required
            value={employerName}
            onChange={(e) => setEmployerName(e.target.value)}
            className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
          />
        </div>
        <div>
          <label htmlFor="employerPhone" className="mb-[var(--space-2)] block font-medium">
            Your phone number
          </label>
          <input
            id="employerPhone"
            type="tel"
            required
            value={employerPhone}
            onChange={(e) => setEmployerPhone(e.target.value)}
            className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-[var(--space-2)] block font-medium">
            Role they did for you
          </label>
          <input
            id="role"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Cook, Driver, Nanny"
            className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
          />
        </div>

        {error && <ErrorState message={error} />}

        <div className="flex gap-[var(--space-2)]">
          <Button type="button" variant="secondary" fullWidth onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" fullWidth disabled={submitting}>
            {submitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
