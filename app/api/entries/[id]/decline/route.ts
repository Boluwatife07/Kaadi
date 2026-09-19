// OWNER: SD
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { getEntryById, declineEntry } from "@/lib/services/workHistory";

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const entry = await getEntryById(id);
  if (!entry) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }

  try {
    await requireSelf(entry.workerId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await declineEntry(id);
  return NextResponse.json({ id: result?.id, confirmationStatus: "declined" });
}
