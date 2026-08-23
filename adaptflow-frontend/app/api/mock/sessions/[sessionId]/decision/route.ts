import { NextResponse } from "next/server";

export async function POST(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  await new Promise((r) => setTimeout(r, 300));
  return NextResponse.json({ status: "ok", auditEntryId: `audit-${sessionId}-${Date.now()}` });
}
