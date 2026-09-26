# ProofAd pipeline and MCP surface

ProofAd is usable without the browser workspace. The REST and MCP interfaces call the same pipeline functions as the application: one frozen campaign contract, one idempotent run, the same criterion-level evidence, the same verdict policy, and the same SQLite event trail.

## REST

| Method | Endpoint | Purpose |
| --- | --- | --- |
| POST | /api/pipeline/inspect | Create or reopen a local deterministic inspection from a campaign brief. |
| GET | /api/pipeline/runs | List persisted runs with verdict summaries. |
| GET | /api/pipeline/runs/{runId} | Retrieve one run, including criteria, evidence, and artifact metadata. |
| GET | /api/runs/{runId}/report | Download the portable JSON report. |

Every POST request to /api/pipeline/inspect accepts:

~~~json
{
  "productName": "Northstar Sparkling Water",
  "geography": "Bengaluru, India",
  "season": "Monsoon",
  "requiredCopy": "20% OFF THIS WEEKEND",
  "strategy": "structured"
}
~~~

The response contains a run ID, frozen brief, compiled prompt, criterion-level findings, artifact hash, verdict, and short summary. Repeating an identical brief reopens the existing idempotent local run instead of creating a duplicate.

## MCP

The local MCP endpoint is http://localhost:3000/api/mcp. It is a stateless JSON-RPC endpoint designed for the Streamable HTTP transport. A compatible MCP client can connect to it without using the browser workspace.

| Tool | Purpose |
| --- | --- |
| proofad.inspect_campaign | Create or reopen an inspection and return the complete evaluation record. |
| proofad.get_run | Retrieve a persisted run by run ID. |
| proofad.list_runs | List persisted runs. |
| proofad.get_metrics | Retrieve local run and annotation summary metrics. |

The server supports initialize, notifications/initialized, tools/list, and tools/call. Tool results return both readable text content and structured JSON for agent workflows.

## Safety boundary

The standard pipeline calls are local and deterministic. They do not make a provider call. The separate `POST /api/live/inspect` route accepts a reference image and a campaign brief, is explicitly budget-gated, and produces the same persisted run/report structure after 1K generation, OCR, and structured visual evaluation.
