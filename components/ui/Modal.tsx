// OWNER: SA
"use client";

import { ReactNode, useEffect, useRef } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-[var(--space-4)] sm:items-center"
    >
      <div className="w-full max-w-md rounded-[var(--radius)] bg-[var(--kaadi-card)] p-[var(--space-6)]">
        <div className="mb-[var(--space-4)] flex items-center justify-between">
          <h2 id="modal-title" className="font-display text-[var(--text-lg)]">
            {title}
          </h2>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close"
            className="min-h-[var(--tap-min)] min-w-[var(--tap-min)] rounded-[var(--radius)] text-[var(--kaadi-ink-500)] hover:bg-[var(--kaadi-clay-100)]"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
