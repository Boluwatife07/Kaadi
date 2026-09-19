// OWNER: SA
// Worker is SA's table. Every write to it — from any section — goes
// through here (Section 13.2's cross-write rule); nobody else touches
// db.worker directly.

import { db } from "@/lib/db";
import { hashPin } from "@/lib/auth";
import { fromList } from "@/lib/contracts";

export async function findWorkerByPhone(phone: string) {
  return db.worker.findUnique({ where: { phone } });
}

export async function getWorkerById(workerId: string) {
  return db.worker.findUnique({ where: { id: workerId } });
}

export async function createWorker(input: {
  displayName: string;
  phone: string;
  pin: string;
}) {
  const pinHash = await hashPin(input.pin);
  return db.worker.create({
    data: {
      displayName: input.displayName,
      phone: input.phone,
      pinHash,
    },
  });
}

// Added for SB's intake flow (Section 8.2's POST /api/workers/:id/intake
// is SB-owned but writes Worker.rawIntakeText/intakeMode/workflowStatus —
// SA's table). Cross-write per Section 13.2: SB calls this instead of
// touching db.worker directly.
export async function recordIntake(
  workerId: string,
  input: { rawIntakeText: string; intakeMode: "voice" | "text" }
): Promise<void> {
  await db.worker.update({
    where: { id: workerId },
    data: {
      rawIntakeText: input.rawIntakeText,
      intakeMode: input.intakeMode,
      workflowStatus: "review",
    },
  });
}

// Frozen signature — Section 13.2. SB calls this on draft approval to move
// a worker from "review" to "published" and write the approved fields.
export async function markWorkerPublished(
  workerId: string,
  fields: { skills: string[]; summary: string }
): Promise<void> {
  await db.worker.update({
    where: { id: workerId },
    data: {
      structuredSkills: fromList(fields.skills),
      structuredSummary: fields.summary,
      workflowStatus: "published",
    },
  });
}
