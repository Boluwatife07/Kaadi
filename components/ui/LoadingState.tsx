// OWNER: SA
export function LoadingState({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="flex items-center gap-[var(--space-3)] p-[var(--space-6)] text-[var(--kaadi-ink-500)]">
      <span
        aria-hidden
        className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--kaadi-clay-100)] border-t-[var(--kaadi-clay-700)]"
      />
      <span>{message}</span>
    </div>
  );
}
