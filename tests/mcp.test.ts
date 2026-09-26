import assert from "node:assert/strict";
import test from "node:test";
import { handleMcpRequest } from "../lib/mcp.ts";

test("MCP initializes and advertises the evaluation tools", () => {
  const response = handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize" });
  assert.equal(response?.error, undefined);
  assert.equal((response?.result as { serverInfo: { name: string } }).serverInfo.name, "proofad");
});

test("MCP inspection uses the same deterministic pipeline", () => {
  const response = handleMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "proofad.inspect_campaign",
      arguments: {
        productName: "Northstar Sparkling Water",
        geography: "Bengaluru, India",
        season: "Monsoon",
        requiredCopy: "20% OFF THIS WEEKEND",
        strategy: "structured",
      },
    },
  });
  assert.equal(response?.error, undefined);
  const result = response?.result as { structuredContent: { verdict: string; run: { checks: unknown[] } } };
  assert.equal(result.structuredContent.verdict, "PASS");
  assert.ok(result.structuredContent.run.checks.length > 0);
});
