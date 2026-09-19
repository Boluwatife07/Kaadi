// OWNER: SD
// STUB. Section 12: "the public 'Add yourself as an employer' form on the
// profile page (rendered inside SC's page but owned as a component by
// SD)." SD replaces this whole file — SC's page just imports it by name,
// so no edit to the public page is needed when SD's version lands.
//
// Real version needs: POST /api/employers (creates/reuses Employer by
// phone) then POST /api/p/:token/add-employer (zero-auth, creates a
// pending WorkHistoryEntry — Section 11.2, 8.2).

import { Card } from "@/components/ui/Card";

export function AddEmployerForm({ token }: { token: string }) {
  return (
    <Card className="text-[var(--kaadi-ink-500)]">
      &quot;Add myself as an employer&quot; is coming soon.
    </Card>
  );
}
