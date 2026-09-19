// OWNER: SA
// FROZEN after Hour 0 — Section 8.1. Import these; never redeclare.

export type WorkflowStatus = "needs_structuring" | "review" | "published";
export type EntrySource = "worker_declared" | "employer_added";
export type ConfirmationStatus = "confirmed" | "pending" | "declined";

export interface WorkerSession {
  workerId: string;
  displayName: string;
  phone: string;
}

export interface PublicProfile {
  displayName: string;
  photoUrl: string | null;
  skills: string[];
  location: string | null;
  languagesSpoken: string[];
  workHistory: {
    employerName: string;
    employerPhone: string | null;
    role: string;
    startDate: string | null;
    endDate: string | null;
    isOngoing: boolean;
    source: EntrySource;
  }[];
  guarantors: { name: string; phone: string; relationship: string | null }[];
}

// SQLite has no native arrays/enums — comma-separated strings and JSON
// strings are used as annotated on the schema. These are the only
// sanctioned parsers; do not hand-roll another split/JSON.parse elsewhere.
export const toList = (s: string): string[] =>
  s ? s.split(",").map((x) => x.trim()).filter(Boolean) : [];

export const fromList = (a: string[]): string => a.join(",");

export const toJson = <T>(s: string, fb: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fb;
  }
};

export const fromJson = (v: unknown): string => JSON.stringify(v);
