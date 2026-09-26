import { NextResponse } from "next/server";
import { inspectCampaign } from "@/lib/pipeline";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    return NextResponse.json(inspectCampaign(await request.json()), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid inspection input" }, { status: 400 });
  }
}
