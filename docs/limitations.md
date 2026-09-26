# Known limitations and tracked work

ProofAd records limits plainly. A limitation is not a hidden defect or a marketing disclaimer; it is an explicit boundary between what the current system demonstrates and what must be measured or built next.

## Current limitations

| Limitation | Why it matters | Completion evidence |
| --- | --- | --- |
| Live provider is locked | Phase A cannot measure live image-generation or visual-evaluation behavior. | A capped, logged provider run saves model IDs, request counts, timings, returned artifact bytes, and structured findings. |
| Evaluator has no human-calibrated result yet | A deterministic policy can be correct while the observations feeding it are wrong. | Blinded labels on a held-out set; report false approvals, false rejections, review coverage, and sample size. |
| OCR and visual observations are fixture-backed | Fixture evidence verifies flow, not text recognition or visual grounding on live images. | Independent OCR and structured visual observations run on retained live artifacts, with error cases preserved. |
| Exact product identity is not yet measured | Product presence and product fidelity are harder than generic scene relevance. | Reference-versus-output identity protocol, labels, and measured errors. |
| Local SQLite is not a concurrent production store | It supports a recoverable local workflow but not multi-instance coordination or durable worker delivery. | Durable queue, object storage, managed database, leases, dead-letter handling, and recovery tests. |
| REST and MCP endpoints are local and unauthenticated | A localhost integration is useful for development but must not be exposed broadly without access control. | Authentication, authorization scope, rate limits, audit controls, and deployment configuration. |

## What is intentionally not claimed

- The system does not claim that one image model is better than another.
- The system does not claim evaluator accuracy before the labeled study exists.
- The system does not claim legal, cultural, accessibility, or advertising-platform compliance.
- The system does not claim high availability or exactly-once external-provider execution.

The linked GitHub issues hold the implementation scope, acceptance criteria, and evidence needed to close each limitation.
