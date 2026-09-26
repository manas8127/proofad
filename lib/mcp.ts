import { z } from "zod";
import { pipelineMetrics, pipelineRun, pipelineRuns, inspectCampaign } from "./pipeline.ts";
import { briefSchema } from "./types.ts";

const requestSchema = z.object({
  jsonrpc: z.literal("2.0"),
  id: z.union([z.string(), z.number(), z.null()]).optional(),
  method: z.string(),
  params: z.unknown().optional(),
});

const runIdSchema = z.object({ runId: z.string().min(1) });
const protocolVersion = "2025-06-18";

const tools = [
  {
    name: "proofad.inspect_campaign",
    description: "Create or reopen a deterministic local campaign inspection. Returns the frozen contract, criterion-level evidence, verdict, and report-ready run record.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["productName", "geography", "season", "requiredCopy", "strategy"],
      properties: {
        productName: { type: "string", description: "Reference product identity." },
        geography: { type: "string", description: "Target geography." },
        season: { type: "string", description: "Target season or context." },
        requiredCopy: { type: "string", description: "Exact literal campaign copy." },
        strategy: { type: "string", enum: ["baseline", "structured"], description: "Prompt strategy retained for evaluation." },
      },
    },
  },
  {
    name: "proofad.get_run",
    description: "Read one persisted inspection run, including its evidence, verdict, and immutable artifact metadata.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["runId"],
      properties: { runId: { type: "string" } },
    },
  },
  {
    name: "proofad.list_runs",
    description: "List persisted inspection runs without opening the browser workspace.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
  {
    name: "proofad.get_metrics",
    description: "Read local run and human-annotation summary metrics.",
    inputSchema: { type: "object", additionalProperties: false, properties: {} },
  },
] as const;

type JsonRpcId = string | number | null | undefined;
type JsonRpcResponse = { jsonrpc: "2.0"; id: JsonRpcId; result?: unknown; error?: { code: number; message: string } };

function success(id: JsonRpcId, result: unknown): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function failure(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function toolResult(value: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }], structuredContent: value };
}

/** Stateless JSON-RPC surface for MCP clients using the Streamable HTTP transport. */
export function handleMcpRequest(payload: unknown): JsonRpcResponse | null {
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return failure(null, -32600, "Invalid JSON-RPC request");
  const { id, method, params } = parsed.data;

  if (method === "notifications/initialized") return null;
  if (method === "initialize") {
    return success(id, {
      protocolVersion,
      capabilities: { tools: {} },
      serverInfo: { name: "proofad", version: "0.1.0" },
      instructions: "Use criterion-level findings and the deterministic verdict as decision support. REVIEW and ERROR are never approvals.",
    });
  }
  if (method === "tools/list") return success(id, { tools });
  if (method !== "tools/call") return failure(id, -32601, "Method not found: " + method);

  const call = z.object({ name: z.string(), arguments: z.unknown().optional() }).safeParse(params);
  if (!call.success) return failure(id, -32602, "Invalid tools/call parameters");

  try {
    switch (call.data.name) {
      case "proofad.inspect_campaign":
        return success(id, toolResult(inspectCampaign(briefSchema.parse(call.data.arguments))));
      case "proofad.get_run":
        return success(id, toolResult(pipelineRun(runIdSchema.parse(call.data.arguments).runId)));
      case "proofad.list_runs":
        return success(id, toolResult(pipelineRuns()));
      case "proofad.get_metrics":
        return success(id, toolResult(pipelineMetrics()));
      default:
        return failure(id, -32602, "Unknown tool: " + call.data.name);
    }
  } catch (error) {
    return failure(id, -32602, error instanceof Error ? error.message : "Invalid tool input");
  }
}
