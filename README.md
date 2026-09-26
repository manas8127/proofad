# ProofAd

ProofAd is a small decision-support workflow for display-ad creative. A user supplies a reference product, target geography, season, and literal campaign copy. The app generates or loads a creative, checks product/context/text/technical evidence, and explains the resulting PASS, FAIL, REVIEW, or ERROR decision.

## Phase A status

This repository currently implements **Phase A: local, fixture-backed development**.

- Ten deterministic local test runs (eight core, two optional) exercise the complete UI, persistence, inspection, recovery, and verdict paths.
- The visible `Presentation Run` creates a new local fixture record during a demo. It is never represented as a live model run.
- Gemini integration is implemented as a locked server-side boundary. It makes **zero calls** until an explicit budget approval and server-side configuration.
- Fixture results test application integration only. They are not a Gemini dataset and do not demonstrate semantic accuracy.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/demo](http://localhost:3000/demo). Use `/app` for the responsive product view and `/evaluation` for blinded human annotation.

```bash
npm run typecheck
npm run build
npm test
```

Application state is created locally in `data/proofad.sqlite`; it is intentionally excluded from Git.

## Product modes

| Label | Meaning |
| --- | --- |
| `SIMULATED / TEST FIXTURE` | Deterministic local test case. No model call. |
| `PRESENTATION RUN / LOCAL SIMULATION` | New persisted fixture run created for the presentation. No model call. |
| `LIVE RUN` | Reserved for approved Phase B only. |

## Phase B approval gate

Before enabling Gemini, explicitly approve the generator model, visual-judge model, maximum generation requests, maximum judge requests, optional smoke allocation, and retry allocation. The dry-run manifest will show one generation + one judge call for the presentation run, and the separate 20-output benchmark allocation.

Never commit credentials. Copy `.env.example` locally and keep server-side values private.

## Submission checklist

- Public repository URL
- Source-code archive under 50 MB (exclude `node_modules`, `.next`, `data`, and generated images)
- Clear run instructions
- Pitch deck under 50 MB
- Coding-agent disclosure in [`docs/agent-use.md`](docs/agent-use.md)

## Limits

ProofAd is not a certification system. OCR and visual-model evidence may be uncertain, and the app does not claim legal compliance, cultural certification, conversion improvement, or guaranteed correctness.
