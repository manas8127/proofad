# Coding-agent disclosure

Coding assistance was used to help create the ProofAd Phase A codebase, documentation, fixture cases, data contracts, UI structure, and test plan.

The human supplied the architecture requirements: Next.js/TypeScript, local-first development, server-only provider credentials, fixture transparency, SQLite events, local OCR, explicit prompt strategies, deterministic verdict policy, human-label separation, and a 20-output live evaluation plan. The agent was directed to implement those constraints without making provider calls or handling credentials.

The human remains responsible for reviewing the code, authorizing live runs, assigning human labels, interpreting measurements, and submitting accurate claims.
