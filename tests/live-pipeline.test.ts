import test from "node:test";
import assert from "node:assert/strict";
import { checksFromEvidence, requiredCopyFinding, type VisualEvidence } from "../lib/live.ts";
import type { Brief } from "../lib/types.ts";
import { decide } from "../lib/policy.ts";

const brief: Brief = { productName: "Northstar", geography: "Bengaluru", season: "Monsoon", requiredCopy: "SAVE 20%", strategy: "structured" };
const pass: VisualEvidence = { productPresence: { status: "pass", observation: "Product is present", evidence: "Reference agrees" }, productFidelity: { status: "pass", observation: "Packaging agrees", evidence: "Reference agrees" }, context: { status: "pass", observation: "Monsoon Bengaluru", evidence: "Rainy city" } };

test("live evaluator approves complete matching evidence", () => {
  assert.equal(decide(checksFromEvidence(brief, pass, "SAVE 20%", 98, { width: 1024, height: 1024 })), "PASS");
});
test("live evaluator fails wrong literal copy", () => {
  assert.equal(requiredCopyFinding("SAVE 20%", "SAVE 10%", 98).status, "fail");
});
test("live evaluator requires review for low-confidence OCR", () => {
  assert.equal(decide(checksFromEvidence(brief, pass, "SAVE 20%", 20, { width: 1024, height: 1024 })), "REVIEW");
});
test("live evaluator refuses an oversized generated artifact", () => {
  assert.equal(decide(checksFromEvidence(brief, pass, "SAVE 20%", 98, { width: 2048, height: 1024 })), "FAIL");
});
