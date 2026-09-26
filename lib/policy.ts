import type { Check } from "./types";

/** A failed product-presence check makes attribute-level product passes meaningless. */
export function applyDependencies(checks: Check[]): Check[] {
  const absent = checks.find((check) => check.id === "product-presence")?.status === "fail";
  return checks.map((check) => absent && check.category === "product" && check.id !== "product-presence" && check.status === "pass"
    ? { ...check, status: "unknown", observation: "Not evaluated independently because the product is absent.", evidence: "Blocked by product-presence dependency." }
    : check);
}

export function decide(checks: Check[]): "PASS" | "FAIL" | "REVIEW" | "ERROR" {
  if (checks.some((check) => check.status === "error")) return "ERROR";
  if (checks.some((check) => check.status === "fail")) return "FAIL";
  if (checks.some((check) => check.status === "unknown")) return "REVIEW";
  return "PASS";
}
