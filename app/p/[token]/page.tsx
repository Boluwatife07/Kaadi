// OWNER: SC
"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { PhoneLink } from "@/components/ui/PhoneLink";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddEmployerForm } from "@/components/AddEmployerForm";
import type { PublicProfile } from "@/lib/contracts";

export default function PublicProfilePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inactive, setInactive] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setInactive(false);
    try {
      const res = await fetch(`/api/p/${token}`);
      if (res.status === 410) {
        setInactive(true);
        return;
      }
      if (!res.ok) {
        setError("This profile couldn't be found.");
        return;
      }
      setProfile(await res.json());
    } catch {
      setError("Couldn't load this profile. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <main className="min-h-full bg-[var(--kaadi-cream-50)] p-[var(--space-4)]">
        <LoadingState message="Loading profile…" />
      </main>
    );
  }

  if (inactive) {
    return (
      <main className="flex min-h-full items-center justify-center bg-[var(--kaadi-cream-50)] p-[var(--space-4)]">
        <Card className="max-w-sm text-center">
          <p className="mb-[var(--space-2)] font-medium">This code is no longer active.</p>
          <p className="text-[var(--kaadi-ink-500)]">Ask the worker for their current card.</p>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-full bg-[var(--kaadi-cream-50)] p-[var(--space-4)]">
        <ErrorState message={error} onRetry={load} />
      </main>
    );
  }
  if (!profile) return null;

  return (
    <main className="min-h-full bg-[var(--kaadi-cream-50)] p-[var(--space-4)]">
      <div className="mx-auto max-w-lg space-y-[var(--space-4)]">
        <Card className="text-center">
          {profile.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.photoUrl}
              alt={profile.displayName}
              className="mx-auto mb-[var(--space-3)] h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="mx-auto mb-[var(--space-3)] flex h-24 w-24 items-center justify-center rounded-full bg-[var(--kaadi-clay-100)] text-[var(--text-2xl)] font-display text-[var(--kaadi-clay-700)]"
            >
              {profile.displayName.charAt(0)}
            </div>
          )}
          <h1 className="font-display mb-[var(--space-2)] text-[var(--text-xl)] font-bold">
            {profile.displayName}
          </h1>
          <div className="mb-[var(--space-3)] flex justify-center">
            <StatusPill status="verified" label="Verified profile" />
          </div>
          {profile.location && (
            <p className="text-[var(--kaadi-ink-500)]">{profile.location}</p>
          )}
          {profile.languagesSpoken.length > 0 && (
            <p className="text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
              Speaks {profile.languagesSpoken.join(", ")}
            </p>
          )}
          {profile.skills.length > 0 && (
            <div className="mt-[var(--space-3)] flex flex-wrap justify-center gap-[var(--space-2)]">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-[var(--kaadi-clay-100)] px-[var(--space-3)] py-1 text-[var(--text-sm)] text-[var(--kaadi-clay-700)]"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </Card>

        <div>
          <h2 className="font-display mb-[var(--space-3)] text-[var(--text-lg)] font-bold">
            Work history
          </h2>
          {profile.workHistory.length === 0 ? (
            <EmptyState message="No confirmed work history yet." />
          ) : (
            <div className="space-y-[var(--space-3)]">
              {profile.workHistory.map((entry, i) => (
                <Card key={i}>
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
                  {entry.employerPhone && <PhoneLink phone={entry.employerPhone} label="Call to verify" />}
                </Card>
              ))}
            </div>
          )}
        </div>

        {profile.guarantors.length > 0 && (
          <div>
            <h2 className="font-display mb-[var(--space-3)] text-[var(--text-lg)] font-bold">
              Guarantor
            </h2>
            {profile.guarantors.map((g, i) => (
              <Card key={i}>
                <p className="font-medium">
                  {g.name}
                  {g.relationship ? ` — ${g.relationship}` : ""}
                </p>
                <PhoneLink phone={g.phone} />
              </Card>
            ))}
          </div>
        )}

        <AddEmployerForm token={token} />
      </div>
    </main>
  );
}
