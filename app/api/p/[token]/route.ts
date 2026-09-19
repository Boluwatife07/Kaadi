// OWNER: SC
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { findQrToken } from "@/lib/qr";
import { toList } from "@/lib/contracts";
import type { PublicProfile, EntrySource } from "@/lib/contracts";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const record = await findQrToken(token);
  if (!record) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
  if (!record.active) {
    return NextResponse.json(
      { error: "This code is no longer active. Ask the worker for their current card." },
      { status: 410 }
    );
  }

  const worker = await db.worker.findUnique({ where: { id: record.workerId } });
  if (!worker) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }

  // A pending or declined entry must never reach a public response —
  // this is the platform's one real integrity boundary (Section 11.2, 18).
  const entries = await db.workHistoryEntry.findMany({
    where: { workerId: worker.id, confirmationStatus: "confirmed" },
    orderBy: { startDate: "desc" },
  });

  const guarantors = await db.guarantor.findMany({ where: { workerId: worker.id } });

  const profile: PublicProfile = {
    displayName: worker.displayName,
    photoUrl: worker.photoUrl,
    skills: toList(worker.structuredSkills),
    location: worker.location,
    languagesSpoken: toList(worker.languagesSpoken),
    workHistory: entries.map((e: (typeof entries)[number]) => ({
      employerName: e.employerName,
      employerPhone: e.employerPhone,
      role: e.role,
      startDate: e.startDate ? e.startDate.toISOString() : null,
      endDate: e.endDate ? e.endDate.toISOString() : null,
      isOngoing: e.isOngoing,
      source: e.source as EntrySource,
    })),
    guarantors: guarantors.map((g: (typeof guarantors)[number]) => ({
      name: g.name,
      phone: g.phone,
      relationship: g.relationship,
    })),
  };

  return NextResponse.json(profile);
}
