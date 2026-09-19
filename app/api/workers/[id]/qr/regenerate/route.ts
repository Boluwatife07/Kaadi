// OWNER: SC
import { NextResponse } from "next/server";
import { requireSelf } from "@/lib/auth";
import { regenerateQrToken, profileUrlForToken } from "@/lib/qr";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await requireSelf(id);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { token } = await regenerateQrToken(id);
  return NextResponse.json({
    token,
    profileUrl: profileUrlForToken(token),
    imageUrl: `/api/qr/${token}/image`,
  });
}
