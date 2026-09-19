// OWNER: SA
// Read-only. Writes to Worker go through lib/services/worker.ts, never here.
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { getWorkerById } from "@/lib/services/worker";
import { toList } from "@/lib/contracts";
import { getActiveTokenForWorker } from "@/lib/qr";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const worker = await getWorkerById(id);
  if (!worker) {
    return NextResponse.json({ error: "Worker not found." }, { status: 404 });
  }

  // qrToken added by SC — reads across QrToken (SC's table), not a write.
  const qrToken = await getActiveTokenForWorker(id);

  // confirmedWorkHistory added by SD — reads across WorkHistoryEntry (SD's
  // table), not a write. Section 8.2's endpoint table has no dedicated
  // route for a worker's own confirmed history, and Section 2.1 forbids
  // inventing one — this enriches the existing read endpoint instead of
  // adding a new one. Explicitly signed off, not a unilateral call.
  const confirmedEntries = await db.workHistoryEntry.findMany({
    where: { workerId: id, confirmationStatus: "confirmed" },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json({
    id: worker.id,
    displayName: worker.displayName,
    workflowStatus: worker.workflowStatus,
    rawIntakeText: worker.rawIntakeText,
    intakeMode: worker.intakeMode,
    structuredSkills: toList(worker.structuredSkills),
    structuredSummary: worker.structuredSummary,
    location: worker.location,
    qrToken,
    confirmedWorkHistory: confirmedEntries.map((e: (typeof confirmedEntries)[number]) => ({
      id: e.id,
      employerName: e.employerName,
      employerPhone: e.employerPhone,
      role: e.role,
      startDate: e.startDate ? e.startDate.toISOString() : null,
      endDate: e.endDate ? e.endDate.toISOString() : null,
      isOngoing: e.isOngoing,
      source: e.source,
    })),
  });
}
