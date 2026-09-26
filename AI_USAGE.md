# AI usage and development record

This file explains how AI tools contributed to ProofAd. It separates development assistance from the models used by the product at runtime.

## Purpose and scope

I selected the problem, supplied the requirements, chose the constraints, reviewed the output, and decided what claims the project may make. AI assistants accelerated research, design, implementation, testing, and writing. They did not supply human labels, invent benchmark results, or authorize claims that were not supported by saved evidence.

## Research and problem framing

Before implementation, I used an AI research assistant to compare the available directions for feasibility, usefulness, evaluation needs, model access, and development time. I challenged the initial recommendation, requested alternative designs, and asked for the assumptions behind each proposal.

I asked the assistant to retrieve and summarize primary research relevant to fine-grained image evaluation and evaluator reliability:

- TIFA: criterion-level questions for text-to-image faithfulness.
- Davidsonian Scene Graph: atomic criteria and dependency-aware scoring.
- Judging LLM-as-a-Judge: calibration of model judging against human decisions.
- CheckList: targeted behavioral testing beyond aggregate accuracy.

The research informed the method but does not transfer published results into ProofAd performance claims. The repository links the sources and states their limits in [docs/research.md](docs/research.md).

## Planning and architecture

I directed the assistants to design a system with the following non-negotiable requirements:

- Preserve the reference image and campaign contract with every run.
- Separate image generation, evidence collection, and final policy decisions.
- Use local OCR in addition to reference-aware visual observations.
- Treat a missing product, wrong mandatory copy, uncertainty, and an operational failure differently.
- Prevent a product-fidelity check from passing when the product is absent.
- Keep deterministic fixtures clearly labelled and exclude them from model-performance claims.
- Store artifacts, hashes, timings, and events so a result can be inspected later.

The architecture, prompt contracts, verdict policy, and recovery behavior were reviewed iteratively. I prioritized an understandable evaluation workflow over infrastructure that the local prototype could not prove.

## Coding assistance

Codex served as the coding assistant. I supplied explicit requirements for the Next.js application, SQLite persistence, Tesseract OCR, deterministic policy, local fixtures, test cases, REST pipeline, MCP endpoint, Gemini integration, and documentation. I reviewed the implementation through local tests, builds, browser checks, screenshots, and Git commits.

The code assistant was directed not to invent completed experiments or labels. It implemented a live route that uses Gemini only when a server-side API key is configured, and it keeps the 20-output benchmark behind a separate explicit approval flag.

## Runtime AI in the product

ProofAd uses AI at runtime in a different role from development assistance:

- `gemini-3.1-flash-image` receives the reference product image and structured campaign brief to generate a square 1K creative.
- `gemini-3.1-flash-lite` returns structured visual observations for product presence, product fidelity, and context adherence.
- Tesseract OCR independently extracts rendered text for literal-copy comparison.

Application code, not a model, applies the final PASS, FAIL, REVIEW, or ERROR policy. Human annotation remains separate from automated findings and is used to measure the evaluator rather than overwrite its history.

## Verification and communication

AI assistance also helped draft the README, architecture notes, research mapping, evaluation plan, and presentation. Every public claim was checked against the repository and recorded artifacts. The controlled fixture cases demonstrate policy behavior only. Live performance claims require saved generated outputs and independent human labels.

## Source control and traceability

The public Git history records the progression from local fixtures, to the minimal evaluation workspace, to the live reference-image route and Gemini Interactions API migration. Commits document implementation changes; this file documents how AI was directed during that work.

## Human responsibility

I remain responsible for problem selection, requirements, data and asset permissions, API-key handling, final submission content, and the interpretation of results. AI-generated recommendations and code were reviewed against the stated constraints before use.

## Detailed collaboration journey

The assistant functioned as a digital twin in a limited, practical sense: it preserved the working context across research, architecture, implementation, product design, test planning, documentation, and presentation preparation. It translated my stated requirements into concrete technical work, surfaced trade-offs, and maintained continuity as I changed direction. It was not an autonomous project owner. I selected the direction, challenged recommendations, supplied the constraints, reviewed the work, and decided what could be claimed publicly.

### Problem selection

I supplied the available problem statements, the participation rules, and the submission requirements. I asked the assistant to compare options for feasibility, product usefulness, evaluation depth, API dependencies, and the available build time. I did not accept an initial recommendation without challenge. I asked it to debate alternatives through three perspectives:

- An AI-engineering perspective covering inference efficiency, structured prompting, visual evidence, and a defensible evaluation design.
- A systems-engineering perspective covering recoverability, event history, retries, idempotency, local persistence, and realistic limits on high-availability claims.
- A product-design perspective covering minimal cognitive load, clear feedback, understandable failure states, and a browser workflow that makes evidence easy to inspect.

This led to Theme 2. The central problem became clear: a polished advertisement can still be incorrect. It may show the wrong product, use the wrong geography or season, or alter the required offer. ProofAd was designed to answer when a system should pass, fail, request review, or report an operational error.

### Research direction

I directed the assistant to retrieve and summarize primary research rather than rely on unverified recall. It researched TIFA, Davidsonian Scene Graph, Judging LLM-as-a-Judge, and CheckList. I asked it to distinguish what each paper actually establishes from what can be responsibly adapted to this project.

The result was a specific methodology: break a brief into checkable criteria; preserve logical dependencies between criteria; keep model observations separate from application policy; compare an automated evaluator against blinded human labels; and test known failure modes deliberately. The papers guide the methodology. They do not provide ProofAd labels or prove its accuracy. This distinction is documented in [docs/research.md](docs/research.md).

Web research also verified current model names, API contracts, provider quotas, local-model feasibility, and technical documentation. The project does not present web research or an AI summary as a substitute for primary-source verification.

### Architecture and local-first development

I asked the assistant to plan a small, inspectable product rather than a generic image-generation demonstration. I required a reference product image, geography, season, exact required copy, and prompt strategy to remain attached to each run as a frozen campaign contract.

Before any live provider call, I instructed the assistant to build all locally verifiable parts: typed contracts, prompt compilation, SQLite-backed run state, an event trail, local OCR, deterministic verdict policy, fixture cases, report export, retry behavior, REST endpoints, MCP tools, a human-label workflow, and tests. This protected the budget and prevented a simulated output from being represented as a real model result.

The assistant proposed production concepts such as queues, worker leases, replica health checks, and dead-letter handling. I kept them as documented future architecture because the local prototype cannot honestly demonstrate production availability. The implemented scope uses SQLite and image artifacts so that recovery and evidence remain inspectable.

### Product-design iteration

The assistant initially proposed a denser desktop workspace and a mobile-style preview. I reviewed that direction and explicitly asked for a simpler, calmer interface with fewer colors and no phone preview. The implementation was then revised around one clear action: enter a campaign contract, run an evaluation, and inspect the reason for the result.

The resulting user experience keeps the campaign contract, verdict, criterion-level evidence, report actions, and saved runs visible. This design reflects my direction to prioritize discoverability, feedback, mapping, understandable recovery, and reduced visual clutter. It was not accepted as an unexplained default from the assistant.

### Runtime model integration

I directed Codex to implement a server-side live route using the permitted Gemini image model family. The route sends the reference product image and compiled brief to Gemini 3.1 Flash Image for a square 1K creative. Gemini 3.1 Flash-Lite provides structured visual observations for product presence, product fidelity, and context. Local Tesseract OCR independently reads the rendered copy. Application code applies the final PASS, FAIL, REVIEW, or ERROR policy.

The assistant migrated the integration from the legacy request pattern to Gemini's current Interactions API after research and provider responses showed that the endpoint contract had changed. It also corrected the requested output format to JPEG after Gemini rejected PNG for the image response format.

The current Google project reports zero image-generation requests per day on its Free tier. Therefore, no live Gemini creative has been presented as a successfully generated result by this key. That is a provider-quota limitation, not a fixture result, and it must be resolved through the appropriate billing/quota tier before the project makes live-output claims.

### Evaluation, testing, and claims

I required the system to use controlled behavioral tests and not simply report one aesthetic score. The repository includes labelled passing and failing cases for wrong copy, missing copy, wrong product, wrong geography, wrong season, uncertain OCR, incomplete inspection, oversized output, and interruption recovery. These cases validate policy behavior, not image-model accuracy.

I also directed the assistant to implement a benchmark plan with exactly 20 jobs: two product references, five briefs per product, and baseline versus structured prompting. The code retains a separate blinded human-label workflow for product, context, and text. The runner and annotation workflow exist, but no 20-output benchmark or human-label result is claimed as complete. The assistant was explicitly prohibited from inventing run counts, labels, latency, accuracy, provider credits, or performance claims.

### Coding, verification, and source control

Codex was used as an implementation assistant for Next.js, TypeScript, SQLite, Tesseract OCR, deterministic policy logic, tests, REST endpoints, MCP support, Gemini integration, and documentation. I reviewed changes through browser checks, test results, source control, screenshots, and repeated direction changes.

The public Git history records the progression from local fixtures to the minimalist workspace, persisted artifacts, live reference-image path, Gemini Interactions API migration, AI-use documentation, and output-format correction. The submission ZIP is generated from the committed repository state. It excludes credentials, local databases, generated artifacts, dependencies, and temporary files.

### Presentation and communication

AI assistance helped draft the README, research mapping, architecture notes, test record, AI-use disclosure, submission description, and presentation. I asked it to inspect the supplied deck and align statements with the actual repository. Screenshots are labelled according to provenance: controlled local fixtures are not described as live Gemini outputs. A genuine generated-output screenshot will be added only after a successful saved provider run.

### Accountability

I remain responsible for problem selection, requirements, reference assets, API-key and billing decisions, code review, human-label collection, submission materials, and the interpretation of results. The assistants were not authorized to fabricate experiments, annotations, asset permissions, API access, or metrics. AI accelerated exploration, coding, and communication while I retained the final decisions and standards of evidence.
