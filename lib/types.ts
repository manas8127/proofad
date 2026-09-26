import { z } from "zod";

export const verdictSchema = z.enum(["PASS", "FAIL", "REVIEW", "ERROR"]);
export const checkStatusSchema = z.enum(["pass", "fail", "unknown", "error"]);
export const runKindSchema = z.enum(["fixture", "presentation", "live"]);

export const briefSchema = z.object({
  geography: z.string().min(2).max(80),
  season: z.string().min(2).max(40),
  requiredCopy: z.string().min(1).max(160),
  productName: z.string().min(2).max(80),
  strategy: z.enum(["baseline", "structured"]),
});
export type Brief = z.infer<typeof briefSchema>;

export const checkSchema = z.object({
  id: z.string(), category: z.enum(["product", "context", "text", "technical"]),
  status: checkStatusSchema, label: z.string(), observation: z.string(), evidence: z.string(),
});
export type Check = z.infer<typeof checkSchema>;

export const runSchema = z.object({
  id: z.string(), kind: runKindSchema, fixtureId: z.string().nullable(), name: z.string(),
  status: z.enum(["completed", "interrupted", "error"]), verdict: verdictSchema,
  createdAt: z.string(), elapsedMs: z.number(), imageUrl: z.string(), imageHash: z.string(),
  brief: briefSchema, prompt: z.string(), checks: z.array(checkSchema), note: z.string(),
});
export type Run = z.infer<typeof runSchema>;

export const annotationSchema = z.object({
  runId: z.string(), annotator: z.string().min(1).max(80),
  product: z.enum(["pass", "fail", "uncertain"]), context: z.enum(["pass", "fail", "uncertain"]),
  text: z.enum(["pass", "fail", "uncertain"]),
});
export type Annotation = z.infer<typeof annotationSchema>;
