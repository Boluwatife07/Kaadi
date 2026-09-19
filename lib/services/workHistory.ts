// OWNER: SD
// STUB — signature frozen at Hour 0 per Section 13.2, so SB isn't blocked
// waiting on SD. Returns a plausible fixed value and does NOT write to
// WorkHistoryEntry yet. SD replaces this body (and adds employer-add /
// confirm / decline logic) during their own hour — nobody else should edit
// this file after that.

export async function createWorkerDeclaredEntry(input: {
  workerId: string;
  employerName: string;
  employerPhone?: string;
  role: string;
  startDate?: Date;
  endDate?: Date;
  isOngoing?: boolean;
}): Promise<{ id: string }> {
  // TODO(SD): write a WorkHistoryEntry row with source: "worker_declared",
  // confirmationStatus: "confirmed" (Section 11.2). Stub returns a fixed
  // plausible id so callers (SB's draft approval) aren't blocked.
  return { id: `stub-${input.workerId}` };
}
