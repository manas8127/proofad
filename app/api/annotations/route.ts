import { NextResponse } from "next/server";
import { saveAnnotation } from "@/lib/store";
import { annotationSchema } from "@/lib/types";
export async function POST(request: Request) {
  try { const input = annotationSchema.parse(await request.json()); saveAnnotation(input); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid annotation" }, { status: 400 }); }
}
