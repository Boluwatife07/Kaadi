// OWNER: SA
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState } from "@/components/ui/ErrorState";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, phone, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push("/profile");
      router.refresh();
    } catch {
      setError("Couldn't reach Kaadi. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center p-[var(--space-4)]">
      <Card className="w-full max-w-sm">
        <h1 className="font-display mb-[var(--space-2)] text-[var(--text-2xl)] font-bold">
          Kaadi
        </h1>
        <p className="mb-[var(--space-6)] text-[var(--kaadi-ink-500)]">
          Build your professional history in your own words.
        </p>

        <form onSubmit={handleSubmit} className="space-y-[var(--space-4)]">
          <div>
            <label htmlFor="displayName" className="mb-[var(--space-2)] block font-medium">
              Your name
            </label>
            <input
              id="displayName"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
            />
          </div>
          <div>
            <label htmlFor="phone" className="mb-[var(--space-2)] block font-medium">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
              placeholder="+2348031234567"
            />
          </div>
          <div>
            <label htmlFor="pin" className="mb-[var(--space-2)] block font-medium">
              Choose a 4-digit PIN
            </label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="min-h-[var(--tap-min)] w-full rounded-[var(--radius)] border border-[var(--kaadi-border)] px-[var(--space-3)]"
            />
          </div>

          {error && <ErrorState message={error} />}

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className="mt-[var(--space-4)] text-[var(--text-sm)] text-[var(--kaadi-ink-500)]">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-[var(--kaadi-clay-700)] underline">
            Log in
          </Link>
        </p>
      </Card>
    </main>
  );
}
