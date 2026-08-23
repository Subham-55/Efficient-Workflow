import { NextResponse } from "next/server";

export async function POST() {
  await new Promise((r) => setTimeout(r, 300));
  const example = { id: "mock-session-001", title: "Support Ticket Triage", description: "" };
  return NextResponse.json({ sessionId: example.id });
}
