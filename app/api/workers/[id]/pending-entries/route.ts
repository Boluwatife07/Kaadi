// OWNER: SD
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { listPendingAndDeclined } from "@/lib/services/workHistory";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await listPendingAndDeclined(id);
  return NextResponse.json(
    entries.map((e: (typeof entries)[number]) => ({
      id: e.id,
      employerName: e.employerName,
      employerPhone: e.employerPhone,
      role: e.role,
      startDate: e.startDate ? e.startDate.toISOString() : null,
      endDate: e.endDate ? e.endDate.toISOString() : null,
      isOngoing: e.isOngoing,
      confirmationStatus: e.confirmationStatus,
      createdAt: e.createdAt.toISOString(),
    }))
  );
}
