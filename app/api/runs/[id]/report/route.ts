import { NextResponse } from "next/server";
import { findRun } from "@/lib/store";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const run = findRun((await params).id);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });
  return new NextResponse(JSON.stringify(run, null, 2), { headers: { "content-type": "application/json", "content-disposition": `attachment; filename="proofad-${run.id}.json"` } });
}
