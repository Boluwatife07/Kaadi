// OWNER: SD
// Zero-auth — employers never authenticate for any action (Section 9.2).
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findOrCreateEmployer } from "@/lib/services/workHistory";

const bodySchema = z.object({
  displayName: z.string().min(1),
  phone: z.string().min(7),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name and phone number." }, { status: 400 });
  }
  const employer = await findOrCreateEmployer(parsed.data);
  return NextResponse.json(employer, { status: 201 });
}
