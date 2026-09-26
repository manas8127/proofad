import { NextResponse } from "next/server";
import { pipelineRuns } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ runs: pipelineRuns() });
}
