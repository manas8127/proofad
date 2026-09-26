# ProofAd architecture

## Scope boundary

Phase A is a local Next.js evaluation workbench. It proves the campaign contract, evidence schema, dependency policy, human-label surface, persistence model, and recovery behavior with deterministic fixtures. Optional Ollama output is supplementary local evidence only. It does not alter the official verdict.

Gemini provider classes are deliberately locked in this phase. No live request is made until the approved Phase B call budget, model IDs, and credentials are explicitly supplied.

## Current data flow

```mermaid
flowchart TD
    A[Brief: product, geography, season, literal copy] --> B[Campaign contract]
    B --> C[Idempotency key]
    C --> D[Atomic criteria + dependencies]
    D --> E{Evidence source}
    E --> F[FixtureProvider]
    E --> G[Optional Ollama offer reader]
    E --> H[Locked GeminiProvider]
    F --> I[PNG artifact + immutable hashes]
    G --> J[Local evidence label]
    H --> I
    I --> K[SQLite runs, attempts, and events]
    J --> K
    K --> L[Product / Context / Text / Operational findings]
    L --> M[Dependency-aware deterministic policy]
    M --> N[PASS / FAIL / REVIEW / ERROR]
```

The campaign contract and the saved report carry the strategy/evidence-source metadata used for that run. Each inspection finding is independently visible; there is no hidden aggregate score that can mask a mandatory failure. The model is an input to the evidence process, not the system’s authority.

## Event state and recovery

```mermaid
stateDiagram-v2
    [*] --> Submitted
    Submitted --> BriefReady: contract persisted
    BriefReady --> ImageSaved: artifact validated + saved
    ImageSaved --> ChecksCompleted: all required findings recorded
    ChecksCompleted --> Completed: verdict + report persisted

    BriefReady --> Error: invalid credentials / quota / source failure
    ImageSaved --> Review: mandatory evidence uncertain
    ImageSaved --> Error: corrupt or incomplete inspection
    ChecksCompleted --> Review: unknown mandatory criterion

    Error --> BriefReady: retry only failed stage
    Review --> ChecksCompleted: evidence completed
    Completed --> [*]
```

State changes are committed as events with run ID, attempt ID, stage, timestamp, status, and artifact references. Artifact persistence precedes its completed checkpoint. This allows the interface to reopen a run after refresh and retain an image when a later check cannot finish.

The local idempotency key prevents duplicate submissions within this application. It cannot prove exactly-once execution by a future remote image provider: a network timeout may occur after the provider received or completed a request. Phase B must therefore classify ambiguous completion as unknown rather than automatically submit another billable request.

## Verdict policy

```mermaid
flowchart TD
    Start[All required criterion findings present?] -->|No: corrupt or operationally invalid| Error[ERROR]
    Start -->|Yes| Failure{Any mandatory failure?}
    Failure -->|Yes| Fail[FAIL]
    Failure -->|No| Unknown{Any mandatory unknown?}
    Unknown -->|Yes| Review[REVIEW]
    Unknown -->|No| Pass[PASS]
```

1. A failed mandatory check produces `FAIL`.
2. Missing or uncertain mandatory evidence produces `REVIEW`.
3. Incomplete, corrupt, or operationally invalid inspection produces `ERROR`.
4. Only an inspection with all mandatory checks passing produces `PASS`.

Dependencies prevent contradictory credit. For example, product attributes cannot pass when product presence failed.

## Proposed Phase B boundary

```mermaid
flowchart LR
    Browser --> API[API replicas]
    API --> Queue[Durable queue]
    Queue --> Workers[Leased generation / evaluation workers]
    Workers --> Model[Approved external model]
    Workers --> Store[Object storage]
    Workers --> DB[Managed database + event log]
    Queue --> DLQ[Dead-letter handling]
```

This is a proposed production design, not a capability demonstrated by the local prototype. A production version needs explicit idempotent consumers, worker leases, retry limits, dead-letter handling, monitoring, and failure-domain analysis. Kubernetes probes and replicas can assist with application availability but do not independently provide durable data, queue, or external-provider availability.
