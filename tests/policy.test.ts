import test from "node:test";
import assert from "node:assert/strict";
import { applyDependencies, decide } from "../lib/policy.ts";
import type { Check } from "../lib/types.ts";

const check = (id: string, status: Check["status"], category: Check["category"] = "text"): Check => ({ id, status, category, label: id, observation: "x", evidence: "x" });
test("a mandatory failure wins over aesthetic passes", () => assert.equal(decide([check("copy", "fail"), check("context", "pass", "context")]), "FAIL"));
test("unknown evidence requires review", () => assert.equal(decide([check("copy", "unknown")]), "REVIEW"));
test("operational error is not approval", () => assert.equal(decide([check("ocr", "error")]), "ERROR"));
test("missing product blocks attribute passes", () => {
  const checks = applyDependencies([check("product-presence", "fail", "product"), check("product-fidelity", "pass", "product")]);
  assert.equal(checks[1].status, "unknown");
});
