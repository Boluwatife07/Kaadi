// OWNER: SB
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { db } from "@/lib/db";
import { toList, toJson } from "@/lib/contracts";
import { getWorkerById, markWorkerPublished } from "@/lib/services/worker";
import { createWorkerDeclaredEntry } from "@/lib/services/workHistory";

interface DraftHistoryItem {
  employerName: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  isOngoing: boolean;
  employerPhone: string | null;
}
interface DraftGuarantor {
  name: string;
  phone: string;
  relationship: string;
}

function buildSummary(name: string, skills: string[], location: string | null): string {
  const skillsPart = skills.length > 0 ? `Skilled in ${skills.join(", ")}.` : "";
  const locationPart = location ? ` Based in ${location}.` : "";
  return `${name}. ${skillsPart}${locationPart}`.trim();
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const draft = await db.profileDraft.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  try {
    await requireSelf(draft.workerId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (draft.approvalStatus === "approved") {
    return NextResponse.json({ error: "This draft has already been approved." }, { status: 409 });
  }

  const decisions = toJson(draft.fieldDecisions, {} as Record<string, string>);
  const isRejected = (field: string) => decisions[field] === "rejected";

  const worker = await getWorkerById(draft.workerId);
  const finalName = !isRejected("generatedName") && draft.generatedName ? draft.generatedName : worker?.displayName ?? "";
  const finalSkills = isRejected("generatedSkills") ? [] : toList(draft.generatedSkills);
  const finalLocation = !isRejected("generatedLocation") ? draft.generatedLocation : null;

  // WorkHistoryEntry is SD's table — cross-write through their service
  // function only (Section 13.2). This is currently a stub (Section 13.2 /
  // README) so entries aren't actually persisted until SD replaces it.
  if (!isRejected("generatedHistory")) {
    const history = toJson(draft.generatedHistory, [] as DraftHistoryItem[]);
    for (const entry of history) {
      await createWorkerDeclaredEntry({
        workerId: draft.workerId,
        employerName: entry.employerName,
        employerPhone: entry.employerPhone ?? undefined,
        role: entry.role,
        startDate: entry.startDate ? new Date(entry.startDate) : undefined,
        endDate: entry.endDate ? new Date(entry.endDate) : undefined,
        isOngoing: entry.isOngoing,
      });
    }
  }

  // Guarantor is SB's own table — written directly, no service indirection needed.
  if (!isRejected("generatedGuarantor") && draft.generatedGuarantor) {
    const g = toJson<DraftGuarantor | null>(draft.generatedGuarantor, null);
    if (g && g.name && g.phone) {
      await db.guarantor.create({
        data: {
          workerId: draft.workerId,
          name: g.name,
          phone: g.phone,
          relationship: g.relationship || null,
        },
      });
    }
  }

  const summary = buildSummary(finalName, finalSkills, finalLocation);

  // Cross-write into SA's table via their frozen service function.
  await markWorkerPublished(draft.workerId, { skills: finalSkills, summary });

  await db.profileDraft.update({
    where: { id },
    data: { approvalStatus: "approved" },
  });

  return NextResponse.json({ ok: true, skills: finalSkills, summary });
}
