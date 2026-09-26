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
