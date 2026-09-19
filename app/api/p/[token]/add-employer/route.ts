// OWNER: SD
// Zero-auth by design (Section 9.2) — anyone can submit; nothing they
// submit becomes visible until the worker confirms it (Section 11.2).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findQrToken } from "@/lib/qr";
import { findOrCreateEmployer, createEmployerAddedEntry } from "@/lib/services/workHistory";

const bodySchema = z.object({
  employerName: z.string().min(1),
  employerPhone: z.string().min(7),
  role: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const tokenRecord = await findQrToken(token);
  if (!tokenRecord) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
  if (!tokenRecord.active) {
    return NextResponse.json(
      { error: "This code is no longer active. Ask the worker for their current card." },
      { status: 410 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter your name, phone number, and the worker's role." },
      { status: 400 }
    );
  }
  const { employerName, employerPhone, role, startDate, endDate, isOngoing } = parsed.data;

  const employer = await findOrCreateEmployer({ displayName: employerName, phone: employerPhone });

  const entry = await createEmployerAddedEntry({
    workerId: tokenRecord.workerId,
    employerId: employer.id,
    employerName: employer.displayName,
    employerPhone: employer.phone,
    role,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    isOngoing,
  });

  return NextResponse.json(
    { id: entry.id, message: "Submitted — the worker will need to confirm this before it's public." },
    { status: 201 }
  );
}
