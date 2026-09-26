import { NextResponse } from "next/server";
import { executeLiveInspection, validateReferenceImage } from "@/lib/live";
import { briefSchema } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const reference = form.get("referenceImage");
    if (!(reference instanceof File)) throw new Error("referenceImage is required.");
    const brief = briefSchema.parse({ productName: form.get("productName"), geography: form.get("geography"), season: form.get("season"), requiredCopy: form.get("requiredCopy"), strategy: form.get("strategy") });
    return NextResponse.json({ run: await executeLiveInspection(brief, await validateReferenceImage(reference)) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Live inspection failed." }, { status: 400 });
  }
}
