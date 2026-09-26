# Decisions

- **Next.js + TypeScript:** chosen for stable routing, responsive behaviour, and a genuine same-origin phone preview.
- **SQLite through Node's built-in `node:sqlite`:** avoids an additional native database dependency while preserving durable local events.
- **No Kubernetes, queues, Redis, vector store, authentication, or cloud deployment:** unsuitable for a seven-hour individual prototype; production architecture remains future work.
- **No SquashFS:** it is read-only and does not improve this writable local workflow or remote-model reliability.
- **Fixture-first:** all local presentation tests are visibly labelled, so no synthetic result is confused with a real model output.
- **Gemini last, not never:** adapters and dry-run shapes are present, but live requests require separate explicit budget approval.
- **Optional local Ollama vision check:** `qwen3-vl:4b` fits the 8 GB laptop GPU with meaningful headroom. It is used only as clearly labelled, local demo evidence; Gemini remains the required Phase B generator/evaluator path.
