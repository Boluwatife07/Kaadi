// OWNER: SA
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--radius)] border border-dashed border-[var(--kaadi-border)] p-[var(--space-6)] text-center text-[var(--kaadi-ink-500)]">
      {message}
    </div>
  );
}
