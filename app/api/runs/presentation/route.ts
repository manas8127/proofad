import { NextResponse } from "next/server";
import { createPresentationRun } from "@/lib/store";
export const dynamic = "force-dynamic";
export async function POST() { return NextResponse.json({ run: createPresentationRun(), message: "Presentation run completed with a local fixture. No provider call was made." }, { status: 201 }); }
