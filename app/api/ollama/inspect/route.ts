import { NextResponse } from "next/server";
import { findRun } from "@/lib/store";
import { OllamaProvider } from "@/lib/providers";

export async function POST(request: Request) {
  try {
    const { runId } = await request.json() as { runId?: string };
    const run = runId ? findRun(runId) : null;
    if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    const evidence = await new OllamaProvider().readOffer(run.imageUrl, run.brief.requiredCopy);
    return NextResponse.json({ evidence, label: "LOCAL OLLAMA TEST / DEMO EVIDENCE", officialVerdictChanged: false });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Local Ollama inspection failed" }, { status: 503 });
  }
}
