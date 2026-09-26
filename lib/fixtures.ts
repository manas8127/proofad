import { createHash, randomUUID } from "node:crypto";
import { applyDependencies, decide } from "./policy";
import { compilePrompt } from "./prompts";
import type { Brief, Check, Run } from "./types";

const brief: Brief = {
  productName: "Northstar Sparkling Water", geography: "Bengaluru, India", season: "Monsoon",
  requiredCopy: "20% OFF THIS WEEKEND", strategy: "structured",
};
const baseChecks: Check[] = [
  { id: "product-presence", category: "product", status: "pass", label: "Product", observation: "Reference bottle appears in the creative.", evidence: "Reference comparison: bottle silhouette and label agree." },
  { id: "product-fidelity", category: "product", status: "pass", label: "Product fidelity", observation: "Packaging identity is consistent with the reference.", evidence: "Label colour, cap, and wordmark match the reference." },
  { id: "geography-season", category: "context", status: "pass", label: "Context", observation: "Rainy urban setting supports Bengaluru monsoon context.", evidence: "Visible rain, umbrellas, and Indian urban streetscape." },
  { id: "required-copy", category: "text", status: "pass", label: "Exact copy", observation: "Required copy matched the coherent OCR span.", evidence: "Expected: 20% OFF THIS WEEKEND; observed: 20% OFF THIS WEEKEND." },
  { id: "image-validity", category: "technical", status: "pass", label: "Image validity", observation: "PNG decoded at 1024 × 1024 pixels.", evidence: "Longest edge: 1024px." },
];

type FixtureDefinition = { id: string; name: string; note: string; imageUrl: string; status?: Run["status"]; mutate?: (checks: Check[]) => Check[] };
const replace = (checks: Check[], id: string, update: Partial<Check>) => checks.map((check) => check.id === id ? { ...check, ...update } : check);

export const fixtureDefinitions: FixtureDefinition[] = [
  { id: "full-pass", name: "1. Full pass", note: "All mandatory checks passed. This is a simulated fixture, not a model claim.", imageUrl: "/fixtures/pass.svg" },
  { id: "wrong-discount", name: "2. Wrong discount", note: "The creative looks polished, but the offer is wrong.", imageUrl: "/fixtures/wrong-discount.svg", mutate: (c) => replace(c, "required-copy", { status: "fail", observation: "Required offer differs from observed copy.", evidence: "Expected: 20% OFF THIS WEEKEND; observed OCR span: 10% OFF THIS WEEKEND." }) },
  { id: "missing-copy", name: "3. Missing copy", note: "No coherent mandatory-copy span was found.", imageUrl: "/fixtures/missing-copy.svg", mutate: (c) => replace(c, "required-copy", { status: "fail", observation: "Required copy is absent.", evidence: "Expected: 20% OFF THIS WEEKEND; observed OCR span: none." }) },
  { id: "wrong-product", name: "4. Wrong product", note: "A replacement product must not pass on aesthetics.", imageUrl: "/fixtures/wrong-product.svg", mutate: (c) => replace(replace(c, "product-presence", { status: "fail", observation: "Reference bottle is not present.", evidence: "Output shows a different can-shaped product." }), "product-fidelity", { status: "pass" }) },
  { id: "wrong-geography", name: "5. Wrong geography", note: "Context evidence conflicts with the requested place.", imageUrl: "/fixtures/wrong-context.svg", mutate: (c) => replace(c, "geography-season", { status: "fail", observation: "Visible context does not support the target geography.", evidence: "Creative shows a snowy alpine street, not Bengaluru." }) },
  { id: "wrong-season", name: "6. Wrong season", note: "Season is assessed separately from surface aesthetics.", imageUrl: "/fixtures/wrong-context.svg", mutate: (c) => replace(c, "geography-season", { status: "fail", observation: "Visible context conflicts with monsoon.", evidence: "Dry snow scene conflicts with the frozen monsoon requirement." }) },
  { id: "uncertain-ocr", name: "7. Uncertain OCR", note: "Uncertain evidence requires review rather than approval.", imageUrl: "/fixtures/uncertain.svg", mutate: (c) => replace(c, "required-copy", { status: "unknown", observation: "Text is too stylized for a reliable coherent OCR span.", evidence: "OCR confidence is low; no expected-copy hint was supplied to recognition." }) },
  { id: "incomplete-check", name: "8. Incomplete inspection", note: "A partial inspection is an operational error, never an approval.", imageUrl: "/fixtures/pass.svg", status: "error", mutate: (c) => replace(c, "required-copy", { status: "error", observation: "Local OCR worker did not finish.", evidence: "Verification is incomplete; the generated artifact was preserved." }) },
  { id: "oversized", name: "9. Oversized output", note: "Returned output exceeded the required long-edge constraint.", imageUrl: "/fixtures/pass.svg", mutate: (c) => replace(c, "image-validity", { status: "fail", observation: "Returned image is 2048 × 2048 pixels.", evidence: "Longest edge 2048px exceeds the 1024px constraint; image was not silently resized." }) },
  { id: "recovered", name: "10. Recovered interruption", note: "The original artifact was preserved after restart and verification completed on retry.", imageUrl: "/fixtures/pass.svg", status: "interrupted", mutate: (c) => replace(c, "required-copy", { status: "unknown", observation: "Run recovered after interruption; verification needs explicit retry.", evidence: "Saved artifact checkpoint exists; no new generation was issued." }) },
];

export function makeFixtureRun(definition: FixtureDefinition, presentation = false): Run {
  const checks = applyDependencies(definition.mutate ? definition.mutate(structuredClone(baseChecks)) : structuredClone(baseChecks));
  const now = new Date().toISOString();
  const id = presentation ? `presentation-${randomUUID()}` : `fixture-${definition.id}`;
  const run: Run = {
    id, kind: presentation ? "presentation" : "fixture", fixtureId: definition.id,
    name: presentation ? "Presentation Run — local simulation" : definition.name,
    status: definition.status ?? "completed", verdict: decide(checks), createdAt: now,
    elapsedMs: presentation ? 1850 : 420, imageUrl: definition.imageUrl,
    imageHash: createHash("sha256").update(`${definition.id}:${definition.imageUrl}`).digest("hex"),
    brief, prompt: compilePrompt(brief), checks, note: definition.note,
  };
  return run;
}
