import { handleMcpRequest } from "@/lib/mcp";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    name: "proofad",
    transport: "streamable-http",
    endpoint: "/api/mcp",
    note: "Send MCP JSON-RPC requests with POST. This local endpoint uses the same evaluation pipeline as the browser workspace.",
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }, { status: 400 });
  }
  const result = handleMcpRequest(body);
  if (!result) return new Response(null, { status: 202 });
  return Response.json(result);
}
