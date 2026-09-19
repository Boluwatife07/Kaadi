// OWNER: SB
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSelf } from "@/lib/auth";
import { recordIntake } from "@/lib/services/worker";
import { db } from "@/lib/db";
import { fromList, fromJson } from "@/lib/contracts";
import { callAI, INTAKE_FALLBACK, type StructureIntakeResult } from "@/lib/ai";

const bodySchema = z.object({
  text: z.string().min(1, "Tell us a little about your work before submitting."),
  mode: z.enum(["voice", "text"]),
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
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }
  const { text, mode } = parsed.data;

  // Cross-write into SA's table via their service function — never db.worker
  // directly (Section 13.2).
  await recordIntake(id, { rawIntakeText: text, intakeMode: mode });

  // Input is rawIntakeText only — never the worker's name, phone, or photo
  // as separate signals (Section 10.1).
  const { data: structured, isFallback } = await callAI<StructureIntakeResult>({
    task: "structure_intake",
    prompt: text,
    fallback: INTAKE_FALLBACK,
  });

  const generatedHistory = structured.work_history.map((h) => ({
    employerName: h.employer_name,
    role: h.role,
    startDate: h.start_date || null,
    endDate: h.end_date || null,
    isOngoing: h.is_ongoing,
    employerPhone: h.employer_phone || null,
  }));

  const draft = await db.profileDraft.create({
    data: {
      workerId: id,
      sourceText: text,
      generatedName: structured.name || null,
      generatedSkills: fromList(structured.skills),
      generatedLocation: structured.location || null,
      generatedLanguages: fromList(structured.languages_spoken),
      generatedHistory: fromJson(generatedHistory),
      generatedGuarantor: structured.guarantor ? fromJson(structured.guarantor) : null,
      missingInformation: fromJson(structured.missing_information),
      fieldDecisions: fromJson({}),
      approvalStatus: "draft",
      isFallback,
    },
  });

  return NextResponse.json(
    {
      draftId: draft.id,
      isFallback,
      // plain_summary has no frozen column on ProfileDraft (schema is
      // frozen — see README) so it's surfaced here for the review screen
      // to hold in local state; it isn't persisted server-side.
      plainSummary: structured.plain_summary,
    },
    { status: 201 }
  );
}
