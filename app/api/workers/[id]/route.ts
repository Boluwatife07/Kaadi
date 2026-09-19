// OWNER: SA
// Read-only. Writes to Worker go through lib/services/worker.ts, never here.
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { getWorkerById } from "@/lib/services/worker";
import { toList } from "@/lib/contracts";
import { getActiveTokenForWorker } from "@/lib/qr";

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
  });
}
