// OWNER: SC
// Deterministic, no LLM anywhere in this file (Section 11.1 — hard rule).
//
// Base URL: the spec (5.1... 11.1) hardcodes "https://kaadi.app" as the
// QR payload's domain. That's a real registered domain this hackathon
// build won't be deployed to, so it's overridable via
// NEXT_PUBLIC_BASE_URL (added to .env, which isn't in Section 13.3's
// frozen-files list) — defaults to the spec's literal value if unset.
// Set it to your LAN address (e.g. http://192.168.1.23:3000) before the
// "scan cold on a second phone" demo beat, or the QR will encode an
// unreachable domain.

import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { db } from "@/lib/db";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://kaadi.app";

export function profileUrlForToken(token: string): string {
  return `${BASE_URL}/p/${token}`;
}

/**
 * Deactivates every prior QrToken for this worker and creates exactly one
 * new active token (Section 11.1). Old printed/screenshotted codes stop
 * working immediately.
 */
export async function regenerateQrToken(workerId: string): Promise<{ token: string }> {
  await db.qrToken.updateMany({
    where: { workerId, active: true },
    data: { active: false },
  });

  const token = nanoid(21);
  await db.qrToken.create({
    data: { workerId, token, active: true },
  });

  return { token };
}

export async function getActiveTokenForWorker(workerId: string): Promise<string | null> {
  const token = await db.qrToken.findFirst({
    where: { workerId, active: true },
    orderBy: { createdAt: "desc" },
  });
  return token?.token ?? null;
}

/** Looks up a token regardless of active state — callers decide what a 410 means. */
export async function findQrToken(token: string) {
  return db.qrToken.findUnique({ where: { token } });
}

export async function renderQrPng(token: string): Promise<Buffer> {
  return QRCode.toBuffer(profileUrlForToken(token), {
    type: "png",
    width: 512,
    margin: 2,
  });
}
