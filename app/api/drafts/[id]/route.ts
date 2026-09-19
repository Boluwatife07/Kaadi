// OWNER: SB
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSelf } from "@/lib/auth";
import { db } from "@/lib/db";
import { toJson, fromJson } from "@/lib/contracts";

const EDITABLE_FIELDS = [
  "generatedName",
  "generatedSkills",
  "generatedLocation",
  "generatedLanguages",
  "generatedHistory",
  "generatedGuarantor",
] as const;

const bodySchema = z.object({
  field: z.enum(EDITABLE_FIELDS),
  decision: z.enum(["accepted", "edited", "rejected"]),
  // Required when decision === "edited": the field's new raw stored value
  // (comma-list for list fields, JSON string for generatedHistory /
  // generatedGuarantor — matching how each column is already stored).
  value: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const draft = await db.profileDraft.findUnique({ where: { id } });
  if (!draft) {
    return NextResponse.json({ error: "Draft not found." }, { status: 404 });
  }

  try {
    await requireSelf(draft.workerId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (draft.approvalStatus === "approved") {
    return NextResponse.json({ error: "This draft has already been approved." }, { status: 409 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { field, decision, value } = parsed.data;
  if (decision === "edited" && value === undefined) {
    return NextResponse.json({ error: "An edited field needs a value." }, { status: 400 });
  }

  const fieldDecisions = toJson(draft.fieldDecisions, {} as Record<string, string>);
  fieldDecisions[field] = decision;

  const updateData: Record<string, string> = { fieldDecisions: fromJson(fieldDecisions) };
  if (decision === "edited" && value !== undefined) {
    updateData[field] = value;
  }

  const updated = await db.profileDraft.update({ where: { id }, data: updateData });
  return NextResponse.json({ id: updated.id, fieldDecisions });
}
