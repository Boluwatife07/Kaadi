// OWNER: SA
import { Button } from "./Button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-[var(--radius)] border border-[var(--kaadi-alert-100)] bg-[var(--kaadi-alert-100)] p-[var(--space-4)] text-[var(--kaadi-alert-800)]">
      <p>{message}</p>
      {onRetry && (
        <Button variant="danger" className="mt-[var(--space-3)]" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
