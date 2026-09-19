// OWNER: SA
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { findWorkerByPhone } from "@/lib/services/worker";
import { createSession, verifyPin } from "@/lib/auth";

const bodySchema = z.object({
  phone: z.string().min(7),
  pin: z.string().min(4),
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter your phone number and PIN." }, { status: 400 });
  }
  const { phone, pin } = parsed.data;

  const worker = await findWorkerByPhone(phone);
  if (!worker || !(await verifyPin(pin, worker.pinHash))) {
    return NextResponse.json({ error: "Phone number or PIN is incorrect." }, { status: 401 });
  }

  await createSession({ workerId: worker.id, displayName: worker.displayName, phone: worker.phone });
  return NextResponse.json({ workerId: worker.id, displayName: worker.displayName }, { status: 200 });
}
