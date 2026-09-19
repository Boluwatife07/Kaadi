// OWNER: SA
// Session helpers. requireSelf is the real authorization boundary — every
// protected handler across every section calls it server-side; the UI only
// hides what a signed-out visitor can't use (convenience, never the check).

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { WorkerSession } from "./contracts";

const COOKIE_NAME = "kaadi_session";
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSession(session: WorkerSession): Promise<void> {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<WorkerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    const { workerId, displayName, phone } = payload as Record<string, unknown>;
    if (
      typeof workerId !== "string" ||
      typeof displayName !== "string" ||
      typeof phone !== "string"
    ) {
      return null;
    }
    return { workerId, displayName, phone };
  } catch {
    return null;
  }
}

/** Throws a 403-shaped error if there's no session or it isn't this worker's own. */
export async function requireSelf(workerId: string): Promise<WorkerSession> {
  const session = await getSession();
  if (!session || session.workerId !== workerId) {
    const err = new Error("Forbidden") as Error & { status?: number };
    err.status = 403;
    throw err;
  }
  return session;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
