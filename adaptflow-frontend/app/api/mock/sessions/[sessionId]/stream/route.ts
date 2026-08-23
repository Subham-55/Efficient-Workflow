import { NextResponse } from "next/server";

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const stages = [
        { type: "stage_started", payload: { stage: "parse" } },
        { type: "stage_progress", payload: { stage: "parse", message: "Extracting actors and steps...", percent: 30 } },
        { type: "stage_progress", payload: { stage: "parse", message: "Identifying dependencies...", percent: 70 } },
        { type: "stage_completed", payload: { stage: "parse", data: { parsed: { actors: ["Agent"], steps: ["Step 1"], dependencies: [], painPoints: [] } } } },
        { type: "stage_started", payload: { stage: "diagnose" } },
        { type: "stage_progress", payload: { stage: "diagnose", message: "Analyzing workflow...", percent: 50 } },
        { type: "stage_completed", payload: { stage: "diagnose", data: { before: { nodes: [], edges: [] } } } },
        { type: "stage_started", payload: { stage: "migrate" } },
        { type: "stage_progress", payload: { stage: "migrate", message: "Designing agent workflow...", percent: 50 } },
        { type: "stage_completed", payload: { stage: "migrate", data: { after: { nodes: [], edges: [] } } } },
        { type: "stage_started", payload: { stage: "visualize" } },
        { type: "stage_completed", payload: { stage: "visualize", data: {} } },
      ];

      let i = 0;
      const interval = setInterval(() => {
        if (i < stages.length) {
          send(stages[i]);
          i++;
        } else {
          clearInterval(interval);
          controller.close();
        }
      }, 600);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
