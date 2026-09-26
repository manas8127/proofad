import { NextResponse } from "next/server";
import { createCustomFixtureRun, listRuns } from "@/lib/store";
import { briefSchema } from "@/lib/types";
export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ runs: listRuns(), phase: "A", liveApproved: false }); }
export async function POST(request: Request) {
  try { return NextResponse.json({ run: createCustomFixtureRun(briefSchema.parse(await request.json())) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid campaign brief" }, { status: 400 }); }
}
