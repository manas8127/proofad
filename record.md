# ProofAd local verification record

## Scope and integrity note

This record captures five evaluations completed through the running browser application at `http://localhost:3000/app` on 26 September 2026. They exercise the same run-detail interface, persisted run records, criterion rendering, deterministic verdict policy, and downloadable-report links used by the application.

All five are **local deterministic fixture evaluations**. They do not call Gemini, Ollama, or another external provider. They are evidence that the application handles known pass, fail, review, and operational-error conditions correctly; they are not evidence of live image-generation quality or benchmark performance.

The shared campaign contract in these cases is:

| Field | Value |
| --- | --- |
| Product | Northstar Sparkling Water |
| Geography | Bengaluru, India |
| Season | Monsoon |
| Required copy | `20% OFF THIS WEEKEND` |
| Prompt strategy | Structured requirements |
| Expected image limit | 1024 × 1024 pixels |

## Summary

| # | Run | Persisted ID | Final verdict | What this verifies |
| ---: | --- | --- | --- | --- |
| 1 | Custom fixture inspection | `custom-34726bad-cecd-450f-904a-6cf973eabe42` | PASS | All five mandatory checks can pass together. |
| 2 | Wrong discount | `fixture-wrong-discount` | FAIL | A literal-copy mismatch overrides otherwise passing product, context, and technical checks. |
| 3 | Wrong product | `fixture-wrong-product` | FAIL | Product absence fails the run and blocks product-fidelity credit. |
| 4 | Uncertain OCR | `fixture-uncertain-ocr` | REVIEW | Insufficient text evidence is routed to human review rather than approval. |
| 5 | Incomplete inspection | `fixture-incomplete-check` | ERROR | An incomplete OCR stage is an operational error, never a passing result. |

The observed distribution is: **1 PASS, 2 FAIL, 1 REVIEW, 1 ERROR**. Every selected case produced its expected conservative status in the browser.

## Run 1 — complete passing evidence

- **Run ID:** `custom-34726bad-cecd-450f-904a-6cf973eabe42`
- **Created:** `2026-09-26T06:47:33.894Z`
- **Recorded execution time:** 420 ms
- **Verdict:** `PASS`
- **App note:** Local simulation created from the brief. No image-model call was made.

All required checks passed:

| Criterion | Status | Observed evidence |
| --- | --- | --- |
| Product presence | pass | Reference bottle silhouette and label agree. |
| Product fidelity | pass | Label colour, cap, and wordmark are consistent with the reference. |
| Context | pass | Rain, umbrellas, and an Indian urban streetscape support Bengaluru monsoon. |
| Exact copy | pass | OCR observed `20% OFF THIS WEEKEND`, matching the contract. |
| Image validity | pass | PNG decoded at 1024 × 1024 pixels. |

**Conclusion:** The interface presents a visible contract, all five checks, the final status, and a report link in one place. This is the happy-path demonstration.

## Run 2 — wrong discount is rejected

- **Run ID:** `fixture-wrong-discount`
- **Created:** `2026-09-26T05:13:52.812Z`
- **Recorded execution time:** 420 ms
- **Verdict:** `FAIL`
- **App note:** The creative looks polished, but the offer is wrong.

The product, product fidelity, context, and image-validity checks pass. The required-copy check fails:

| Criterion | Status | Evidence |
| --- | --- | --- |
| Exact copy | fail | Expected `20% OFF THIS WEEKEND`; observed OCR span `10% OFF THIS WEEKEND`. |

**Conclusion:** A visually plausible ad cannot pass when its mandatory offer is wrong. This is the recommended presentation example because the contradiction is immediately understandable.

## Run 3 — replacement product is rejected

- **Run ID:** `fixture-wrong-product`
- **Created:** `2026-09-26T05:13:52.821Z`
- **Recorded execution time:** 420 ms
- **Verdict:** `FAIL`
- **App note:** A replacement product must not pass on aesthetics.

| Criterion | Status | Evidence |
| --- | --- | --- |
| Product presence | fail | The output shows a different can-shaped product. |
| Product fidelity | unknown | Dependency policy blocked this attribute because product presence failed. |
| Context | pass | The rainy Bengaluru monsoon context still appears. |
| Exact copy | pass | The expected literal copy is present. |
| Image validity | pass | PNG decoded at 1024 × 1024 pixels. |

**Conclusion:** The dependency policy prevents a contradictory result such as “product identity passed” after the product itself was found absent.

## Run 4 — uncertain OCR requires review

- **Run ID:** `fixture-uncertain-ocr`
- **Created:** `2026-09-26T05:13:52.835Z`
- **Recorded execution time:** 420 ms
- **Verdict:** `REVIEW`
- **App note:** Uncertain evidence requires review rather than approval.

| Criterion | Status | Evidence |
| --- | --- | --- |
| Product presence | pass | Reference bottle appears in the creative. |
| Product fidelity | pass | Packaging identity is consistent with the reference. |
| Context | pass | Rainy Bengaluru monsoon context is visible. |
| Exact copy | unknown | Text is too stylized for a reliable coherent OCR span; confidence is insufficient. |
| Image validity | pass | PNG decoded at 1024 × 1024 pixels. |

**Conclusion:** The policy does not substitute optimism for missing evidence. It preserves the artifact and explicitly asks for review.

## Run 5 — incomplete verification is an error

- **Run ID:** `fixture-incomplete-check`
- **Created:** `2026-09-26T05:13:52.839Z`
- **Recorded execution time:** 420 ms
- **Verdict:** `ERROR`
- **App note:** A partial inspection is an operational error, never an approval.

| Criterion | Status | Evidence |
| --- | --- | --- |
| Product presence | pass | Reference bottle appears in the creative. |
| Product fidelity | pass | Packaging identity is consistent with the reference. |
| Context | pass | Rainy Bengaluru monsoon context is visible. |
| Exact copy | error | Local OCR worker did not finish; verification is incomplete. |
| Image validity | pass | PNG decoded at 1024 × 1024 pixels. |

**Conclusion:** The application clearly distinguishes unavailable evidence (`REVIEW`) from failed operation (`ERROR`), and neither can become `PASS`.

## Presentation flow

1. Open `/app`. Explain that the campaign brief is the frozen contract: product, geography, season, exact copy, and strategy.
2. Select **Run evaluation** once to show the PASS result and the criterion-level report.
3. Expand **Saved test runs** and select **2. Wrong discount**. Point to the required copy in the contract and the conflicting text in the creative. The overall `FAIL` follows from this one mandatory mismatch.
4. Select **4. Wrong product**. Explain the product-presence failure and the dependency rule that blocks product-fidelity credit.
5. Select **7. Uncertain OCR**. Explain why uncertainty becomes `REVIEW` rather than an approval.
6. Select **8. Incomplete inspection**. Explain why a failure to finish a check becomes `ERROR` rather than an approval.
7. Open `/evaluation`. Explain that human labels are collected separately from automated decisions so evaluator reliability can be measured rather than assumed.

## Live-run boundary

The implemented live endpoint is `POST /api/live/inspect`. It accepts a real PNG/JPEG/WebP reference product image and the same campaign contract, requests square 1K generation, rejects returned images above 1024 pixels, runs local OCR and structured visual checks, and stores the artifact/report. A single UI run requires only server-side `GEMINI_API_KEY`; the separate 20-output benchmark remains protected by `PROOFAD_LIVE_APPROVED=true`.

The benchmark command is:

```bash
npm run benchmark:live -- --product-a ./product-a.png --product-a-name "Product A" --product-b ./product-b.png --product-b-name "Product B"
```

It creates exactly 20 live jobs: two products × five briefs × baseline and structured prompt strategies. Do not describe this local verification record as that live benchmark.
