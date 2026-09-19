// OWNER: SA
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--kaadi-cream-50)]">
      <DashboardNav displayName={session.displayName} />
      <main className="flex-1 px-[var(--space-4)] py-[var(--space-6)]">{children}</main>
    </div>
  );
}
