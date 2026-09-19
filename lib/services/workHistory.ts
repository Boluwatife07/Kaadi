// OWNER: SD
// WorkHistoryEntry and Employer are SD's tables. Every write to either —
// from any section — goes through here (Section 13.2's cross-write rule).
// This file also owns the platform's one real integrity boundary
// (Section 11.2): entirely rule-based, no model judgement anywhere.

import { db } from "@/lib/db";

// Frozen signature — Section 13.2. SB calls this on draft approval.
// worker_declared entries default to "confirmed" at creation — this is
// the worker's own claim about their own past; verifying it is the
// employer's job (calling the listed reference), not the platform's.
export async function createWorkerDeclaredEntry(input: {
  workerId: string;
  employerName: string;
  employerPhone?: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
}): Promise<{ id: string }> {
  const entry = await db.workHistoryEntry.create({
    data: {
      workerId: input.workerId,
      employerName: input.employerName,
      employerPhone: input.employerPhone ?? null,
      role: input.role,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      isOngoing: input.isOngoing ?? false,
      source: "worker_declared",
      confirmationStatus: "confirmed",
    },
  });
  return { id: entry.id };
}

/** Creates or reuses an Employer by phone (Section 8.2 — POST /api/employers). */
export async function findOrCreateEmployer(input: {
  displayName: string;
  phone: string;
}) {
  const existing = await db.employer.findFirst({ where: { phone: input.phone } });
  if (existing) return existing;
  return db.employer.create({
    data: { displayName: input.displayName, phone: input.phone },
  });
}

/**
 * employer_added entries always start "pending", zero exceptions,
 * regardless of who submits them or what they claim (Section 11.2).
 */
export async function createEmployerAddedEntry(input: {
  workerId: string;
  employerId: string;
  employerName: string;
  employerPhone: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
}): Promise<{ id: string }> {
  const entry = await db.workHistoryEntry.create({
    data: {
      workerId: input.workerId,
      employerId: input.employerId,
      employerName: input.employerName,
      employerPhone: input.employerPhone,
      role: input.role,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      isOngoing: input.isOngoing ?? false,
      source: "employer_added",
      confirmationStatus: "pending",
    },
  });
  return { id: entry.id };
}

/** Worker's own pending + declined list (Section 8.2 — GET pending-entries). */
export async function listPendingAndDeclined(workerId: string) {
  return db.workHistoryEntry.findMany({
    where: { workerId, confirmationStatus: { in: ["pending", "declined"] } },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Only a request carrying a valid session for that exact workerId can
 * confirm or decline (requireSelf, enforced by the route). No one else's
 * session — including another employer's — can act on it.
 */
export async function confirmEntry(entryId: string): Promise<{ id: string } | null> {
  const entry = await db.workHistoryEntry.findUnique({ where: { id: entryId } });
  if (!entry) return null;
  await db.workHistoryEntry.update({
    where: { id: entryId },
    data: { confirmationStatus: "confirmed" },
  });
  return { id: entry.id };
}

/**
 * Decline does not delete the row — it sets confirmationStatus: "declined"
 * and keeps it out of every public and semi-public view permanently, so a
 * declined claim can't be silently resubmitted and mistaken for fresh.
 */
export async function declineEntry(entryId: string): Promise<{ id: string } | null> {
  const entry = await db.workHistoryEntry.findUnique({ where: { id: entryId } });
  if (!entry) return null;
  await db.workHistoryEntry.update({
    where: { id: entryId },
    data: { confirmationStatus: "declined" },
  });
  return { id: entry.id };
}

export async function getEntryById(entryId: string) {
  return db.workHistoryEntry.findUnique({ where: { id: entryId } });
}
