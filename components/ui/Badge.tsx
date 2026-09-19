// OWNER: SA
import { ReactNode } from "react";

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-[var(--space-2)] py-1",
        "text-[var(--text-sm)] font-medium",
        "bg-[var(--kaadi-clay-100)] text-[var(--kaadi-clay-700)]",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
