import { NextResponse } from "next/server";
import { mockSessions } from "@/lib/api/mockData";

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  await new Promise((r) => setTimeout(r, 400));
  const session = mockSessions[sessionId];
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  return NextResponse.json(session);
}
