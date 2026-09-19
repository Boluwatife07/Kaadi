// OWNER: SA
import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "bg-[var(--kaadi-card)] border border-[var(--kaadi-border)] rounded-[var(--radius)]",
        "p-[var(--space-4)]",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </div>
  );
}
