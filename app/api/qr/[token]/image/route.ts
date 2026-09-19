// OWNER: SC
import { NextResponse } from "next/server";
import { findQrToken, renderQrPng } from "@/lib/qr";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const record = await findQrToken(token);
  if (!record) {
    return NextResponse.json({ error: "Code not found." }, { status: 404 });
  }
  if (!record.active) {
    // The profile existed — the code just isn't current anymore (Section 11.1).
    return NextResponse.json(
      { error: "This code is no longer active. Ask the worker for their current card." },
      { status: 410 }
    );
  }

  const png = await renderQrPng(token);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
