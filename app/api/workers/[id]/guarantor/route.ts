// OWNER: SB
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSelf } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const guarantors = await db.guarantor.findMany({
    where: { workerId: id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(guarantors);
}

const bodySchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(7),
  relationship: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a name and phone number." }, { status: 400 });
  }

  const guarantor = await db.guarantor.create({
    data: {
      workerId: id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      relationship: parsed.data.relationship || null,
    },
  });
  return NextResponse.json(guarantor, { status: 201 });
}
