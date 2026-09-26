import { readArtifact } from "@/lib/live";

export const runtime = "nodejs";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try { return new Response(await readArtifact((await params).id), { headers: { "content-type": "image/png", "cache-control": "private, max-age=0" } }); }
  catch { return new Response("Artifact not found", { status: 404 }); }
}
