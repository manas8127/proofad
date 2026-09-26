import { NextResponse } from "next/server";
import { pipelineRun } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    return NextResponse.json(pipelineRun(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Run not found" }, { status: 404 });
  }
}
