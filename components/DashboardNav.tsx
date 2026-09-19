// OWNER: SA
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const TABS = [
  { href: "/profile", label: "My Profile" },
  { href: "/work-history", label: "Work History" },
  { href: "/my-code", label: "My Code" },
];

export function DashboardNav({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--kaadi-border)] bg-[var(--kaadi-card)]">
      <div className="flex items-center justify-between px-[var(--space-4)] py-[var(--space-3)]">
        <span className="font-display text-[var(--text-lg)] font-bold text-[var(--kaadi-clay-700)]">
          Kaadi
        </span>
        <div className="flex items-center gap-[var(--space-3)]">
          <span className="text-[var(--text-sm)] text-[var(--kaadi-ink-700)]">{displayName}</span>
          <Button variant="ghost" onClick={handleSignOut} className="min-h-0 px-[var(--space-2)] py-1">
            Sign out
          </Button>
        </div>
      </div>
      <nav
        className="flex gap-[var(--space-2)] overflow-x-auto px-[var(--space-4)] pb-[var(--space-2)]"
        aria-label="Dashboard sections"
      >
        {TABS.map((tab) => {
          const active = pathname?.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                "min-h-[var(--tap-min)] shrink-0 whitespace-nowrap rounded-[var(--radius)] px-[var(--space-4)]",
                "flex items-center font-medium",
                active
                  ? "bg-[var(--kaadi-clay-100)] text-[var(--kaadi-clay-700)]"
                  : "text-[var(--kaadi-ink-500)] hover:bg-[var(--kaadi-clay-100)]",
              ].join(" ")}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
