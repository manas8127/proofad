import { NextResponse } from "next/server";
import { retryVerification } from "@/lib/store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return NextResponse.json({ run: retryVerification((await params).id) }, { status: 201 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Retry failed" }, { status: 404 }); }
}
