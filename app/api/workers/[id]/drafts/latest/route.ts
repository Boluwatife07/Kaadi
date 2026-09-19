// OWNER: SB
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { db } from "@/lib/db";
import { toList, toJson } from "@/lib/contracts";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const draft = await db.profileDraft.findFirst({
    where: { workerId: id },
    orderBy: { createdAt: "desc" },
  });

  if (!draft) {
    return NextResponse.json({ error: "No draft yet." }, { status: 404 });
  }

  return NextResponse.json({
    id: draft.id,
    workerId: draft.workerId,
    sourceText: draft.sourceText,
    generatedName: draft.generatedName,
    generatedSkills: toList(draft.generatedSkills),
    generatedLocation: draft.generatedLocation,
    generatedLanguages: toList(draft.generatedLanguages),
    generatedHistory: toJson(draft.generatedHistory, [] as unknown[]),
    generatedGuarantor: draft.generatedGuarantor
      ? toJson(draft.generatedGuarantor, null)
      : null,
    missingInformation: toJson(draft.missingInformation, [] as string[]),
    fieldDecisions: toJson(draft.fieldDecisions, {} as Record<string, string>),
    approvalStatus: draft.approvalStatus,
    isFallback: draft.isFallback,
  });
}
