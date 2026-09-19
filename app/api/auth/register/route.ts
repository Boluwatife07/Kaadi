// OWNER: SA
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createWorker, findWorkerByPhone } from "@/lib/services/worker";
import { createSession } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string().min(7),
  pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
  displayName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a phone number, name, and 4-digit PIN." }, { status: 400 });
  }
  const { phone, pin, displayName } = parsed.data;

  const existing = await findWorkerByPhone(phone);
  if (existing) {
    return NextResponse.json({ error: "That phone number is already registered." }, { status: 409 });
  }

  const worker = await createWorker({ displayName, phone, pin });
  await createSession({ workerId: worker.id, displayName: worker.displayName, phone: worker.phone });

  return NextResponse.json({ workerId: worker.id, displayName: worker.displayName }, { status: 201 });
}
